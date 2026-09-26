"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  Send,
  Mic,
  Square,
  Camera,
  Monitor,
  ImagePlus,
  Volume2,
  X,
  FileText,
  Languages,
} from "lucide-react";
import { Agreement, AIResult, runAI } from "@/lib/workspace";
import { ParsedClause } from "@/lib/pdfParser";
import { getSessionMessages, saveMessage, StoredMessage } from "@/lib/db";
import { languages } from "@/lib/languages";
import { useLocale } from "@/lib/i18n";
import { Busy, RichText, Sources } from "./Common";
import { LivePanel } from "./LivePanel";
import { liveContext } from "@/lib/live/config";
export function Companion({
  doc,
  selected,
  research,
}: {
  doc: Agreement;
  selected: ParsedClause | null;
  research: AIResult | null;
}) {
  const { t, language, aiError } = useLocale();
  const [messages, setMessages] = useState<
    (StoredMessage & { sources?: AIResult["sources"] })[]
  >([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [listening, setListening] = useState(false);
  const [capture, setCapture] = useState<"camera" | "screen" | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState<string | null>(null);
  const [liveActive, setLiveActive] = useState(false);
  const transcriptIds = useRef(new Set<string>());
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const mediaVersion = useRef(0);
  const recognition = useRef<any>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const controller = useRef<AbortController | null>(null);
  const alive = useRef(true);
  const lock = useRef(false);
  const sessionId = "session-" + doc.id;
  useEffect(() => {
    alive.current = true;
    getSessionMessages(sessionId)
      .then((m) => {
        if (alive.current)
          setMessages(m.sort((a, b) => a.timestamp - b.timestamp));
      })
      .catch(() => setError(t("storageError")));
    return () => {
      alive.current = false;
      controller.current?.abort();
      recognition.current?.abort();
      stream.current?.getTracks().forEach((track) => track.stop());
      window.speechSynthesis?.cancel();
    };
  }, [sessionId]);
  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [messages, busy]);
  function stopMedia() {
    ++mediaVersion.current;
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
    setCapture(null);
  }
  async function startMedia(kind: "camera" | "screen") {
    setError("");
    if (capture === kind) {
      stopMedia();
      return;
    }
    stopMedia();
    const version = mediaVersion.current;
    try {
      const media =
        kind === "camera"
          ? await navigator.mediaDevices.getUserMedia({
              video: { facingMode: "environment" },
            })
          : await navigator.mediaDevices.getDisplayMedia({ video: true });
      if (!alive.current || mediaVersion.current !== version) {
        media.getTracks().forEach((track) => track.stop());
        return;
      }
      stream.current = media;
      setCapture(kind);
      media.getVideoTracks()[0].onended = stopMedia;
    } catch (e) {
      setError(t("mediaError"));
    }
  }
  useEffect(() => {
    if (capture && video.current && stream.current) {
      video.current.srcObject = stream.current;
      video.current.play().catch(() => {
        stopMedia();
        setError(t("mediaError"));
      });
    }
  }, [capture]);
  function takeFrame() {
    if (!video.current?.videoWidth) return;
    const canvas = document.createElement("canvas");
    const factor = Math.min(1, 1600 / video.current.videoWidth);
    canvas.width = video.current.videoWidth * factor;
    canvas.height = video.current.videoHeight * factor;
    canvas
      .getContext("2d")
      ?.drawImage(video.current, 0, 0, canvas.width, canvas.height);
    setImage(canvas.toDataURL("image/jpeg", 0.85));
    stopMedia();
  }
  function dictate() {
    if (listening) {
      recognition.current?.stop();
      setListening(false);
      return;
    }
    const Speech =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!Speech) {
      setError(t("speechUnavailable"));
      return;
    }
    window.speechSynthesis?.cancel();
    setSpeaking(null);
    const r = new Speech();
    recognition.current = r;
    r.lang = languages.find((l) => l.code === language)!.speech;
    r.continuous = true;
    r.interimResults = false;
    r.onresult = (e: any) => {
      for (let i = e.resultIndex; i < e.results.length; i++)
        if (e.results[i].isFinal)
          setInput((prev) => (prev + " " + e.results[i][0].transcript).trim());
    };
    r.onerror = () => {
      setError(t("speechUnavailable"));
      setListening(false);
      r.abort();
    };
    r.onend = () => setListening(false);
    try {
      r.start();
      setListening(true);
      setError("");
    } catch (e) {
      setError(t("speechUnavailable"));
    }
  }
  function speak(msg: StoredMessage) {
    if (speaking === msg.id) {
      window.speechSynthesis.cancel();
      setSpeaking(null);
      return;
    }
    if (!window.speechSynthesis) {
      setError(t("speechUnavailable"));
      return;
    }
    const locale =
      languages.find((l) => l.code === (msg.language || language)) ||
      languages[0];
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find((v) => v.lang.startsWith(locale.code));
    if (!voice) {
      setError(t("speechUnavailable"));
      return;
    }
    recognition.current?.stop();
    setListening(false);
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(
      msg.content.replace(/[*#]/g, ""),
    );
    utterance.lang = locale.speech;
    utterance.voice = voice;
    utterance.onend = () => setSpeaking(null);
    utterance.onerror = () => {
      setSpeaking(null);
      setError(t("speechUnavailable"));
    };
    setSpeaking(msg.id);
    window.speechSynthesis.speak(utterance);
  }
  async function send(text = input) {
    if (liveActive || lock.current || (!text.trim() && !image)) return;
    lock.current = true;
    setBusy(true);
    setError("");
    const user: StoredMessage = {
      id: crypto.randomUUID(),
      sessionId,
      role: "user",
      content: text.trim() || t("image"),
      timestamp: Date.now(),
      language,
    };
    const history = messages
      .slice(-12)
      .map((m) => m.role + ": " + m.content)
      .join("\n")
      .slice(-24000);
    setMessages((prev) => [...prev, user]);
    setInput("");
    controller.current = new AbortController();
    try {
      await saveMessage(user);
      const relevant = doc.clauses
        .filter(
          (c) =>
            c.id === selected?.id ||
            text
              .toLowerCase()
              .split(/\s+/)
              .filter((w) => w.length > 3)
              .some((w) => (c.title + " " + c.text).toLowerCase().includes(w)),
        )
        .slice(0, 10);
      const allSummary = /summar|agreement|contract|समझ|சுருக்க/i.test(text);
      const context = allSummary
        ? doc.rawText.slice(0, 30000)
        : relevant
            .map((c) => c.clauseNumber + ": " + c.text)
            .join("\n")
            .slice(0, 20000);
      const result = await runAI(
        "Answer the user using the supplied document and conversation. Identify clause numbers when quoting. Say when supplied context is insufficient. Separate document facts from general explanation.\nDOCUMENT: " +
          doc.title +
          "\nSELECTED CLAUSE: " +
          (selected?.text || "None") +
          "\nRELEVANT TEXT:\n" +
          context +
          "\nPRIOR CONVERSATION:\n" +
          history +
          "\nRETRIEVED RESEARCH (may not apply to this question):\n" +
          (research ? JSON.stringify(research) : "None") +
          "\nUSER: " +
          text,
        language,
        {
          ...(image
            ? {
                imageBase64: image,
                mimeType: image.match(/^data:([^;]+)/)?.[1] || "image/jpeg",
              }
            : {}),
          signal: controller.current.signal,
        },
      );
      if (!alive.current) return;
      const answer = {
        id: crypto.randomUUID(),
        sessionId,
        role: "assistant" as const,
        content: result.text,
        timestamp: Date.now(),
        language,
        sources: result.sources,
      };
      await saveMessage(answer);
      if (alive.current) {
        setMessages((prev) => [...prev, answer]);
        setImage(null);
      }
    } catch (e) {
      if (alive.current) {
        setError(aiError(e));
        setInput(text);
      }
    } finally {
      lock.current = false;
      if (alive.current) setBusy(false);
    }
  }
  async function translateMessage(msg: StoredMessage) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const r = await runAI(
        "Translate this conversation message faithfully into the requested language, preserving numbers, names, dates, uncertainties and qualifications. Do not add information.\n" +
          msg.content,
        language,
      );
      if (!alive.current) return;
      const translated = {
        id: crypto.randomUUID(),
        sessionId,
        role: "assistant" as const,
        content: r.text,
        timestamp: Date.now(),
        language,
      };
      await saveMessage(translated);
      if (alive.current) setMessages((prev) => [...prev, translated]);
    } catch (e) {
      setError(aiError(e));
    } finally {
      lock.current = false;
      if (alive.current) setBusy(false);
    }
  }
  return (
    <div className="chat-grid">
      <section className="card chat">
        <div className="chat-heading">
          <div className="icon-tile">
            <Sparkles />
          </div>
          <div>
            <h2>{t("ask")}</h2>
            <small>{t("session")}</small>
          </div>
          <span className="badge low">
            {languages.find((l) => l.code === language)?.native}
          </span>
        </div>
        <LivePanel
          key={doc.id + language}
          disabled={busy}
          context={liveContext(
            doc.title,
            selected?.text || "",
            doc.rawText,
            messages
              .slice(-12)
              .map((m) => m.role + ": " + m.content)
              .join("\n"),
            research ? JSON.stringify(research) : "",
          )}
          onActive={(active) => {
            setLiveActive(active);
            if (active) {
              recognition.current?.abort();
              setListening(false);
              window.speechSynthesis?.cancel();
              setSpeaking(null);
              stopMedia();
            }
          }}
          onTranscript={(id, role, text, interrupted) => {
            if (transcriptIds.current.has(id)) return;
            transcriptIds.current.add(id);
            const message: StoredMessage = {
              id,
              sessionId,
              role,
              content:
                text + (interrupted ? "\n[" + t("liveInterrupted") + "]" : ""),
              timestamp: Date.now(),
              language,
            };
            void saveMessage(message)
              .then(() => {
                if (alive.current)
                  setMessages((prev) =>
                    prev.some((m) => m.id === id) ? prev : [...prev, message],
                  );
              })
              .catch(() => {
                if (alive.current) setError(t("storageError"));
              });
          }}
        />
        <div className="messages">
          {messages.length === 0 && (
            <div className="chat-welcome">
              <span className="large-mark">
                <Sparkles size={34} />
              </span>
              <h2>{t("chatWelcome")}</h2>
              <p>{t("chatHint")}</p>
              <div className="action-wrap">
                {(["summaryPrompt", "questionsPrompt"] as const).map((k) => (
                  <button
                    className="button"
                    disabled={busy}
                    key={k}
                    onClick={() => send(t(k))}
                  >
                    {t(k)}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg) => (
            <div className={"message " + msg.role} key={msg.id}>
              <small>
                {msg.role === "assistant"
                  ? "Nyaya"
                  : languages.find((l) => l.code === msg.language)?.native}
              </small>
              <RichText text={msg.content} />
              {msg.role === "assistant" && (
                <div className="message-actions">
                  <button
                    className="icon-button"
                    title={t("readAloud")}
                    disabled={liveActive}
                    aria-label={t("readAloud")}
                    onClick={() => speak(msg)}
                  >
                    {speaking === msg.id ? (
                      <Square size={15} />
                    ) : (
                      <Volume2 size={15} />
                    )}
                  </button>
                  <button
                    className="icon-button"
                    title={t("translate")}
                    aria-label={t("translate")}
                    disabled={busy || liveActive}
                    onClick={() => translateMessage(msg)}
                  >
                    <Languages size={15} />
                  </button>
                  {msg.sources?.length ? (
                    <Sources sources={msg.sources} />
                  ) : null}
                </div>
              )}
            </div>
          ))}
          {busy && <Busy />}
          <div ref={bottom} />
        </div>
        {capture && (
          <div className="capture-preview">
            <video ref={video} autoPlay muted playsInline />
            <div className="action-wrap">
              <button className="button primary" onClick={takeFrame}>
                <Camera size={16} />
                {t("capture")}
              </button>
              <button className="button" onClick={stopMedia}>
                {t("stop")}
              </button>
            </div>
          </div>
        )}
        <div className="composer">
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          {image && (
            <div className="image-preview">
              <img src={image} alt={t("image")} />
              <button
                className="icon-button"
                aria-label={t("remove")}
                onClick={() => setImage(null)}
              >
                <X size={18} />
              </button>
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <textarea
              rows={2}
              aria-label={t("message")}
              placeholder={t("message")}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  !e.nativeEvent.isComposing
                ) {
                  e.preventDefault();
                  void send();
                }
              }}
            />
            <button
              className="button primary send"
              disabled={busy || liveActive || (!input.trim() && !image)}
              aria-label={t("send")}
            >
              <Send size={18} />
            </button>
          </form>
          <div className="media-controls">
            <button
              className={"button subtle " + (listening ? "recording" : "")}
              onClick={dictate}
              disabled={liveActive}
            >
              {listening ? <Square size={16} /> : <Mic size={16} />}{" "}
              {t(listening ? "stop" : "talk")}
            </button>
            <button
              className="button subtle"
              onClick={() => startMedia("camera")}
              disabled={liveActive}
            >
              <Camera size={16} />
              {t("camera")}
            </button>
            <button
              className="button subtle"
              onClick={() => startMedia("screen")}
              disabled={liveActive}
            >
              <Monitor size={16} />
              {t("screen")}
            </button>
            <label className="button subtle file-inline">
              <ImagePlus size={16} />
              {t("image")}
              <input
                aria-label={t("image")}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  if (
                    f.size > 10 * 1024 * 1024 ||
                    !["image/jpeg", "image/png", "image/webp"].includes(f.type)
                  ) {
                    setError(t("invalidFile"));
                    return;
                  }
                  const r = new FileReader();
                  r.onload = () => setImage(r.result as string);
                  r.onerror = () => setError(t("error"));
                  r.readAsDataURL(f);
                }}
              />
            </label>
          </div>
          <small className="muted">{t("voiceHint")}</small>
        </div>
      </section>
      <aside className="stack">
        <section className="card context-card">
          <FileText size={22} />
          <span className="eyebrow">{t("context")}</span>
          <h3 dir="auto">{doc.title}</h3>
          {selected && (
            <>
              <small>{t("selected")}</small>
              <blockquote dir="auto">{selected.text}</blockquote>
            </>
          )}
          <small>{t("localHint")}</small>
        </section>
        <section className="card">
          <span className="eyebrow">{t("privacy")}</span>
          <p className="muted">{t("privacyDetail")}</p>
        </section>
      </aside>
    </div>
  );
}
