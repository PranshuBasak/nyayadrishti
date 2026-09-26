"use client";
import React, { useEffect, useState } from "react";
import {
  ClipboardList,
  Plus,
  Download,
  Printer,
  Sparkles,
  Check,
  Trash2,
} from "lucide-react";
import {
  Agreement,
  CaseData,
  runAI,
  downloadText,
  escapeHtml,
} from "@/lib/workspace";
import { useLocale } from "@/lib/i18n";
import { Busy, CopyButton, Modal } from "./Common";
export function Prepare({
  doc,
  data,
  onChange,
  onSave,
}: {
  doc: Agreement;
  data: CaseData;
  onChange: (data: CaseData) => void;
  onSave: () => Promise<void>;
}) {
  const { t, language, aiError } = useLocale();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [kind, setKind] = useState<"email" | "refund" | "notice">("email");
  const [date, setDate] = useState("");
  const [event, setEvent] = useState("");
  const [reportUrl, setReportUrl] = useState("");
  const [preview, setPreview] = useState(false);
  useEffect(() => {
    const url = URL.createObjectURL(
      new Blob([reportHtml()], { type: "text/html;charset=utf-8" }),
    );
    setReportUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [data, doc, language]);
  const update = (key: keyof CaseData, value: unknown) => {
    onChange({ ...data, [key]: value });
    setSaved(false);
  };
  const fields = [
    "issueType",
    "party",
    "date",
    "amount",
    "summary",
    "previousContact",
    "evidence",
  ] as const;
  const report = () =>
    [
      t("pack") + " — " + doc.title,
      t("disclaimer"),
      "",
      ...fields.map((k) => t(k) + ": " + (data[k] || "—")),
      "",
      t("timeline"),
      ...data.timeline.map((e) => e.date + " — " + e.event),
      "",
      t("flagged"),
      ...doc.clauses
        .filter((c) => c.attentionLevel !== "low")
        .map((c) => t(c.attentionLevel) + "\n" + c.title + "\n" + c.text),
      "",
      t("draft"),
      data.draft || "—",
    ].join("\n\n");
  function reportHtml() {
    return (
      '<!doctype html><html lang="' +
      language +
      '" dir="' +
      (language === "ur" ? "rtl" : "ltr") +
      '"><meta charset="utf-8"><title>' +
      escapeHtml(t("pack")) +
      "</title><style>body{font:16px/1.75 system-ui,sans-serif;max-width:850px;margin:40px auto;padding:24px;color:#172f38}h1{font-size:26px}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit}@media print{body{margin:0;padding:0}h1{break-after:avoid}}</style><body><h1>NyayaDrishti</h1><pre>" +
      escapeHtml(report()) +
      "</pre></body></html>"
    );
  }
  function print() {
    const frame = document.createElement("iframe");
    frame.style.cssText = "position:fixed;width:0;height:0;border:0;";
    frame.title = t("pack");
    frame.srcdoc = reportHtml();
    frame.onload = () => {
      frame.contentWindow?.focus();
      frame.contentWindow?.print();
      setTimeout(() => frame.remove(), 60000);
    };
    document.body.appendChild(frame);
  }
  async function generate() {
    if (!data.party.trim() || !data.summary.trim()) {
      setError(t("required"));
      return;
    }
    setBusy(true);
    setError("");
    try {
      const r = await runAI(
        "Prepare a " +
          kind +
          " draft for the user to review with a professional. Use ONLY the provided facts. Do not impersonate an advocate or invent statutory breaches, response deadlines, interest rates, addresses or facts. Use clearly marked placeholders for missing information. Keep the requested resolution as a request.\nAgreement: " +
          doc.title +
          "\nUser facts: " +
          JSON.stringify(data),
        language,
      );
      update("draft", r.text);
    } catch (e) {
      setError(aiError(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="stack">
      <div className="section-heading">
        <div>
          <span className="eyebrow">{t("prepare")}</span>
          <h2>{t("intake")}</h2>
          <p className="muted">{t("intakeHint")}</p>
        </div>
        <ClipboardList size={32} />
      </div>
      <div className="two-col">
        <section className="card stack">
          <h3>{t("details")}</h3>
          <div className="form-grid">
            {fields.map((k) => (
              <label
                className={
                  ["summary", "previousContact", "evidence"].includes(k)
                    ? "wide"
                    : ""
                }
                key={k}
              >
                {t(k)}
                {["summary", "previousContact", "evidence"].includes(k) ? (
                  <textarea
                    rows={3}
                    value={data[k]}
                    placeholder={k === "evidence" ? t("evidenceHint") : ""}
                    onChange={(e) => update(k, e.target.value)}
                  />
                ) : (
                  <input
                    type={k === "date" ? "date" : "text"}
                    value={data[k]}
                    onChange={(e) => update(k, e.target.value)}
                  />
                )}
              </label>
            ))}
          </div>
          <button
            className="button primary"
            onClick={async () => {
              try {
                await onSave();
                setSaved(true);
              } catch (e) {
                setError(t("storageError"));
              }
            }}
          >
            <Check size={16} />
            {t(saved ? "savedNotice" : "save")}
          </button>
        </section>
        <div className="stack">
          <section className="card stack">
            <h3>{t("timeline")}</h3>
            <label>
              {t("date")}
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            <label>
              {t("event")}
              <textarea
                rows={2}
                value={event}
                onChange={(e) => setEvent(e.target.value)}
              />
            </label>
            <button
              className="button"
              disabled={!event.trim() || !date}
              onClick={() => {
                update(
                  "timeline",
                  [
                    ...data.timeline,
                    { id: crypto.randomUUID(), date, event: event.trim() },
                  ].sort((a, b) => a.date.localeCompare(b.date)),
                );
                setEvent("");
                setDate("");
              }}
            >
              <Plus size={16} />
              {t("addEvent")}
            </button>
            {data.timeline.length ? (
              data.timeline.map((item) => (
                <div className="timeline-event" key={item.id}>
                  <div>
                    <small>{item.date}</small>
                    <p dir="auto">{item.event}</p>
                  </div>
                  <button
                    className="icon-button"
                    aria-label={t("remove")}
                    onClick={() =>
                      update(
                        "timeline",
                        data.timeline.filter((i) => i.id !== item.id),
                      )
                    }
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))
            ) : (
              <p className="muted">{t("noEvents")}</p>
            )}
          </section>
          <section className="card stack">
            <h3>{t("evidence")}</h3>
            {data.evidence
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean)
              .map((item, i) => (
                <label className="checkbox-row" key={i}>
                  <input
                    type="checkbox"
                    checked={data.checked.includes(item)}
                    onChange={(e) =>
                      update(
                        "checked",
                        e.target.checked
                          ? [...data.checked, item]
                          : data.checked.filter((v) => v !== item),
                      )
                    }
                  />
                  {item}
                </label>
              ))}
            {!data.evidence && <p className="muted">{t("evidenceHint")}</p>}
          </section>
        </div>
      </div>
      <section className="card stack">
        <div className="section-heading">
          <div>
            <h3>{t("draft")}</h3>
            <p className="muted">{t("draftHint")}</p>
          </div>
          <div className="action-wrap">
            <select
              aria-label={t("draft")}
              value={kind}
              onChange={(e) => setKind(e.target.value as typeof kind)}
            >
              {(["email", "refund", "notice"] as const).map((k) => (
                <option key={k} value={k}>
                  {t(k)}
                </option>
              ))}
            </select>
            <button
              className="button primary"
              disabled={busy}
              onClick={generate}
            >
              <Sparkles size={16} />
              {t("generate")}
            </button>
          </div>
        </div>
        {busy && <Busy />}
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        {data.draft && (
          <>
            <label>
              {t("newDraft")}
              <textarea
                rows={14}
                value={data.draft}
                onChange={(e) => update("draft", e.target.value)}
              />
            </label>
            <CopyButton text={data.draft} />
          </>
        )}
      </section>
      <section className="pack-banner">
        <div>
          <span className="eyebrow">{t("pack")}</span>
          <h2>{t("packHint")}</h2>
          <p>{t("printHint")}</p>
        </div>
        <div className="stack">
          <a
            className="button primary"
            href={reportUrl}
            download="NyayaDrishti-report.html"
          >
            <Download size={17} />
            {t("export")}
          </a>
          <button className="button" onClick={() => setPreview(true)}>
            {t("pack")}
          </button>
          <button className="button" onClick={print}>
            <Printer size={17} />
            {t("print")}
          </button>
        </div>
      </section>
      {preview && (
        <Modal title={t("pack")} onClose={() => setPreview(false)}>
          <pre className="original">{report()}</pre>
          <button className="button primary" onClick={print}>
            <Printer size={16} />
            {t("print")}
          </button>
        </Modal>
      )}
    </div>
  );
}
