"use client";
import React, { useEffect, useRef, useState } from "react";
import { Loader2, Copy, Check, X, ArrowUpRight } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { Source } from "@/lib/workspace";
export function RichText({ text }: { text: string }) {
  return (
    <div className="rich-text">
      {text.split("\n").map((line, i) => {
        const parts = line
          .replace(/^#{1,4}\s*/, "")
          .split(/(\*\*[^*]+\*\*)/g)
          .map((s, j) =>
            s.startsWith("**") ? <strong key={j}>{s.slice(2, -2)}</strong> : s,
          );
        return /^#{1,4}\s/.test(line) ? (
          <h3 key={i}>{parts}</h3>
        ) : (
          <p key={i}>{parts || "\u00a0"}</p>
        );
      })}
    </div>
  );
}
export function Sources({ sources }: { sources: Source[] }) {
  const { t } = useLocale();
  return (
    <div className="sources">
      {sources.length > 0 ? (
        <>
          <small>{t("sources")}</small>
          {sources.map((s, i) => (
            <a key={i} href={s.url} target="_blank" rel="noreferrer">
              {s.title}
              <ArrowUpRight size={14} />
            </a>
          ))}
        </>
      ) : (
        <small>{t("noSources")}</small>
      )}
    </div>
  );
}
export function Busy() {
  const { t } = useLocale();
  return (
    <div role="status" className="busy">
      <Loader2 size={17} className="spin" />
      {t("processing")}
    </div>
  );
}
export function CopyButton({ text }: { text: string }) {
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);
  return (
    <>
      <button
        className="button subtle"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          } catch {
            setError(true);
          }
        }}
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}{" "}
        {t(copied ? "copied" : "copy")}
      </button>
      {error && <small role="alert">{t("error")}</small>}
    </>
  );
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  const { t } = useLocale();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    d?.showModal();
    return () => d?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="modal-heading">
        <h2>{title}</h2>
        <button
          className="icon-button"
          aria-label={t("close")}
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
