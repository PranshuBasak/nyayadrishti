"use client";
import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Radio, Square, Camera, Monitor } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { LiveConversation, LiveStatus } from "@/lib/live/session";
import { LIVE_SECONDS, supportsLiveSpeech } from "@/lib/live/config";
export function LivePanel({
  context,
  disabled,
  onActive,
  onTranscript,
}: {
  context: string;
  disabled: boolean;
  onActive: (active: boolean) => void;
  onTranscript: (
    id: string,
    role: "user" | "assistant",
    text: string,
    interrupted: boolean,
  ) => void;
}) {
  const { t, language } = useLocale();
  const [status, setStatus] = useState<LiveStatus>("idle"),
    [muted, setMuted] = useState(false),
    [remaining, setRemaining] = useState(LIVE_SECONDS);
  const [error, setError] = useState(""),
    [captions, setCaptions] = useState(["", ""]),
    [visual, setVisual] = useState<"camera" | "screen" | null>(null);
  const conversation = useRef<LiveConversation | null>(null),
    media = useRef<MediaStream | null>(null),
    video = useRef<HTMLVideoElement>(null),
    generation = useRef(0),
    alive = useRef(true);
  const locked = useRef(false),
    [visionBusy, setVisionBusy] = useState(false);
  const active = ["connecting", "connected", "reconnecting"].includes(status);
  function stopVision() {
    generation.current++;
    media.current?.getTracks().forEach((track) => track.stop());
    media.current = null;
    if (alive.current) {
      setVisual(null);
      setVisionBusy(false);
    }
  }
  function stop() {
    conversation.current?.stop();
    conversation.current = null;
    stopVision();
    locked.current = false;
    onActive(false);
  }
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      stop();
    };
  }, []);
  useEffect(() => {
    if (!visual || !media.current || !video.current) return;
    const element = video.current;
    element.srcObject = media.current;
    void element.play().catch(() => {
      stopVision();
      setError(t("mediaError"));
    });
    const canvas = document.createElement("canvas");
    const timer = setInterval(() => {
      if (!element.videoWidth || document.hidden) return;
      const scale = Math.min(1, 1280 / element.videoWidth);
      canvas.width = element.videoWidth * scale;
      canvas.height = element.videoHeight * scale;
      canvas
        .getContext("2d")
        ?.drawImage(element, 0, 0, canvas.width, canvas.height);
      conversation.current?.frame(
        canvas.toDataURL("image/jpeg", 0.65).split(",")[1],
      );
    }, 1000);
    return () => {
      clearInterval(timer);
      element.srcObject = null;
    };
  }, [visual]);
  async function start() {
    if (locked.current) return;
    locked.current = true;
    setError("");
    setMuted(false);
    setRemaining(LIVE_SECONDS);
    onActive(true);
    try {
      const call = new LiveConversation({
        status: (value) => {
          if (alive.current) {
            setStatus(value);
            if (value === "ended") {
              locked.current = false;
              onActive(false);
              stopVision();
            }
          }
        },
        captions: (user, assistant) => {
          if (alive.current) setCaptions([user, assistant]);
        },
        transcript: onTranscript,
        remaining: (value) => {
          if (alive.current) setRemaining(value);
        },
        error: (code) => {
          if (alive.current)
            setError(
              t(
                code === "LIVE_EXPIRED"
                  ? "liveExpired"
                  : code === "LIVE_MEDIA_ERROR"
                    ? "mediaError"
                    : code === "AI_RATE_LIMIT"
                      ? "quotaLimit"
                      : code === "LIVE_DISCONNECTED"
                        ? "liveDisconnected"
                        : "liveUnavailable",
              ),
            );
        },
      });
      conversation.current = call;
      await call.start(language, context);
    } catch {
      setError(t("liveUnavailable"));
      setStatus("ended");
      stop();
    }
  }
  async function share(kind: "camera" | "screen") {
    if (visual === kind) {
      stopVision();
      return;
    }
    stopVision();
    const version = generation.current;
    setVisionBusy(true);
    setError("");
    try {
      const stream =
        kind === "camera"
          ? await navigator.mediaDevices.getUserMedia({
              video: { facingMode: "environment" },
              audio: false,
            })
          : await navigator.mediaDevices.getDisplayMedia({
              video: true,
              audio: false,
            });
      if (!alive.current || version !== generation.current || !locked.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      media.current = stream;
      stream.getVideoTracks()[0].onended = stopVision;
      setVisual(kind);
    } catch {
      if (alive.current) setError(t("mediaError"));
    } finally {
      if (alive.current) setVisionBusy(false);
    }
  }
  return (
    <section
      className={"live-panel " + (active ? "is-live" : "")}
      aria-label={t("liveTitle")}
    >
      <div className="live-heading">
        <Radio size={22} />
        <div>
          <h3>{t("liveTitle")}</h3>
          <p>{t("liveHint")}</p>
        </div>
        {active && (
          <span className="badge" aria-label={t("liveTime")}>
            {Math.floor(remaining / 60)}:
            {String(remaining % 60).padStart(2, "0")}
          </span>
        )}
      </div>
      {!supportsLiveSpeech(language) ? (
        <p role="status">{t("liveLanguageUnavailable")}</p>
      ) : (
        <>
          <div className="action-wrap">
            {!active ? (
              <button
                className="button primary"
                disabled={disabled}
                onClick={start}
              >
                <Mic size={16} />
                {t("liveStart")}
              </button>
            ) : (
              <>
                <button
                  className="button"
                  disabled={status !== "connected"}
                  onClick={() => {
                    conversation.current?.mute(!muted);
                    setMuted(!muted);
                  }}
                >
                  <MicOff size={16} />
                  {t(muted ? "liveUnmute" : "liveMute")}
                </button>
                <button className="button" onClick={stop}>
                  <Square size={16} />
                  {t("liveEnd")}
                </button>
                <button
                  className="button"
                  disabled={status !== "connected" || visionBusy}
                  aria-pressed={visual === "camera"}
                  onClick={() => share("camera")}
                >
                  <Camera size={16} />
                  {t("camera")}
                </button>
                <button
                  className="button"
                  disabled={status !== "connected" || visionBusy}
                  aria-pressed={visual === "screen"}
                  onClick={() => share("screen")}
                >
                  <Monitor size={16} />
                  {t("screen")}
                </button>
              </>
            )}
          </div>
          <p className="live-status" role="status">
            {t(
              status === "connecting"
                ? "liveConnecting"
                : status === "connected"
                  ? muted
                    ? "liveMuted"
                    : "liveConnected"
                  : status === "reconnecting"
                    ? "liveReconnecting"
                    : status === "ended"
                      ? "liveEnded"
                      : "liveReady",
            )}
          </p>
        </>
      )}
      {visual && (
        <div className="capture-preview">
          <video ref={video} muted playsInline autoPlay />
          <button className="button" onClick={stopVision}>
            {t("liveStopSharing")}
          </button>
        </div>
      )}
      {(captions[0] || captions[1]) && (
        <div className="live-captions" role="log" aria-live="polite">
          <p dir="auto">
            <strong>{t("liveYou")}: </strong>
            {captions[0]}
          </p>
          <p dir="auto">
            <strong>Nyaya: </strong>
            {captions[1]}
          </p>
        </div>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <small className="muted">{t("livePrivacy")}</small>
    </section>
  );
}
