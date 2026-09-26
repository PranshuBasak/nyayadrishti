import {
  GoogleGenAI,
  Modality,
  Session,
  LiveServerMessage,
} from "@google/genai";
import { LiveAudio } from "./audio";
export type LiveStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "ended";
export interface LiveCallbacks {
  status: (value: LiveStatus) => void;
  captions: (user: string, assistant: string) => void;
  transcript: (
    id: string,
    role: "user" | "assistant",
    text: string,
    interrupted: boolean,
  ) => void;
  error: (code: string) => void;
  remaining: (seconds: number) => void;
}
export class LiveConversation {
  private audio = new LiveAudio();
  private session?: Session;
  private stopped = false;
  private connected = false;
  private reconnected = false;
  private handle?: string;
  private token?: { token: string; model: string; expiresAt: string };
  private timer?: ReturnType<typeof setInterval>;
  private request = new AbortController();
  private user = "";
  private assistant = "";
  private turn = 0;
  private id = crypto.randomUUID();
  constructor(private callbacks: LiveCallbacks) {}
  async start(language: string, context: string) {
    this.callbacks.status("connecting");
    try {
      await this.audio.prepare();
      const response = await fetch("/api/live/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, context }),
        signal: AbortSignal.any([
          this.request.signal,
          AbortSignal.timeout(20000),
        ]),
      });
      const token = await response.json();
      if (!response.ok) throw new Error(token.error || "LIVE_UNAVAILABLE");
      this.token = token;
      if (this.stopped) return;
      this.timer = setInterval(() => {
        const seconds = Math.max(
          0,
          Math.ceil((Date.parse(token.expiresAt) - Date.now()) / 1000),
        );
        this.callbacks.remaining(seconds);
        if (!seconds) {
          this.callbacks.error("LIVE_EXPIRED");
          this.stop();
        }
      }, 1000);
      await this.connect();
      if (this.stopped) return;
      await this.audio.capture((data) => {
        if (this.connected)
          this.session?.sendRealtimeInput({
            audio: { data, mimeType: "audio/pcm;rate=16000" },
          });
      });
      if (!this.stopped) this.callbacks.status("connected");
    } catch (error) {
      if (!this.stopped) {
        this.callbacks.error(
          error instanceof DOMException &&
            ["NotAllowedError", "NotFoundError"].includes(error.name)
            ? "LIVE_MEDIA_ERROR"
            : error instanceof Error
              ? error.message
              : "LIVE_UNAVAILABLE",
        );
        this.stop();
      }
    }
  }
  private async connect() {
    if (!this.token || this.stopped) return;
    const ai = new GoogleGenAI({
      apiKey: this.token.token,
      httpOptions: { apiVersion: "v1beta" },
    });
    const session = await ai.live.connect({
      model: this.token.model,
      config: {
        responseModalities: [Modality.AUDIO],
        sessionResumption: this.handle ? { handle: this.handle } : {},
        abortSignal: AbortSignal.any([
          this.request.signal,
          AbortSignal.timeout(15000),
        ]),
      },
      callbacks: {
        onmessage: (message) => this.receive(message),
        onerror: () => {},
        onclose: (event) => {
          this.connected = false;
          if (this.stopped) return;
          if (
            [1006, 1011, 1012, 1013].includes(event.code) &&
            this.handle &&
            !this.reconnected &&
            Date.parse(this.token!.expiresAt) > Date.now() + 15000
          )
            void this.reconnect();
          else {
            this.callbacks.error("LIVE_DISCONNECTED");
            this.stop();
          }
        },
      },
    });
    if (this.stopped) {
      session.close();
      return;
    }
    this.session = session;
    this.connected = true;
    if (this.reconnected) this.callbacks.status("connected");
  }
  private async reconnect() {
    this.reconnected = true;
    this.audio.interrupt();
    this.flush(true);
    this.callbacks.status("reconnecting");
    // No captured audio is buffered or replayed during a dropped connection.
    try {
      await this.connect();
    } catch {
      this.callbacks.error("LIVE_DISCONNECTED");
      this.stop();
    }
  }
  private receive(message: LiveServerMessage) {
    if (this.stopped) return;
    if (message.sessionResumptionUpdate)
      this.handle = message.sessionResumptionUpdate.resumable
        ? message.sessionResumptionUpdate.newHandle
        : undefined;
    const content = message.serverContent;
    if (!content) return;
    if (content.inputTranscription?.text)
      this.user += content.inputTranscription.text;
    if (content.outputTranscription?.text)
      this.assistant += content.outputTranscription.text;
    this.callbacks.captions(this.user, this.assistant);
    if (content.interrupted) {
      this.audio.interrupt();
      this.flush(true);
      return;
    }
    for (const part of content.modelTurn?.parts || [])
      if (
        part.inlineData?.data &&
        part.inlineData.mimeType?.startsWith("audio/pcm")
      )
        this.audio.play(part.inlineData.data);
    if (content.turnComplete) this.flush(false);
  }
  private flush(interrupted: boolean) {
    if (!this.user && !this.assistant) return;
    if (this.user.trim())
      this.callbacks.transcript(
        `${this.id}-${this.turn}-user`,
        "user",
        this.user.trim(),
        false,
      );
    if (this.assistant.trim())
      this.callbacks.transcript(
        `${this.id}-${this.turn}-assistant`,
        "assistant",
        this.assistant.trim(),
        interrupted,
      );
    this.turn++;
    this.user = "";
    this.assistant = "";
    this.callbacks.captions("", "");
  }
  mute(value: boolean) {
    this.audio.mute(value);
    if (value && this.connected)
      this.session?.sendRealtimeInput({ audioStreamEnd: true });
  }
  frame(data: string) {
    if (this.connected && !this.stopped)
      this.session?.sendRealtimeInput({
        video: { data, mimeType: "image/jpeg" },
      });
  }
  stop() {
    if (this.stopped) return;
    this.stopped = true;
    this.connected = false;
    this.request.abort();
    clearInterval(this.timer);
    this.flush(true);
    this.audio.close();
    this.session?.close();
    this.token = undefined;
    this.handle = undefined;
    this.callbacks.status("ended");
  }
}
