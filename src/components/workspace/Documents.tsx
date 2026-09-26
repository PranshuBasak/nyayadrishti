"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  FileText,
  ArrowRight,
  Search,
  Sparkles,
  Languages,
  Scale,
  Upload,
  ArrowUpRight,
} from "lucide-react";
import {
  Agreement,
  makeAgreement,
  readAgreement,
  runAI,
} from "@/lib/workspace";
import { ParsedClause } from "@/lib/pdfParser";
import { useLocale } from "@/lib/i18n";
import { Busy, RichText, CopyButton } from "./Common";
import { readWorkspace, writeWorkspace } from "@/lib/db";
export function UploadForm({
  onAdd,
  onCancel,
}: {
  onAdd: (doc: Agreement) => Promise<void>;
  onCancel: () => void;
}) {
  const { t } = useLocale();
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(file?: File) {
    setBusy(true);
    setError("");
    try {
      await onAdd(
        file
          ? await readAgreement(file)
          : makeAgreement(title || t("documentName"), text),
      );
      onCancel();
    } catch (e) {
      const code = e instanceof Error ? e.message : "";
      setError(
        code === "invalidFile"
          ? t("invalidFile")
          : code === "emptyDocument"
            ? t("emptyDocument")
            : t("error"),
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="stack">
      <p className="muted">{t("uploadHint")}</p>
      <label className="file-drop">
        <Upload size={26} />
        <strong>{t("chooseFile")}</strong>
        <input
          aria-label={t("chooseFile")}
          type="file"
          accept=".pdf,.txt"
          disabled={busy}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void submit(f);
          }}
        />
      </label>
      <div className="divider">{t("paste")}</div>
      <label>
        {t("title")}
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <label>
        {t("paste")}
        <textarea
          rows={7}
          value={text}
          placeholder={t("documentText")}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <button
        className="button primary"
        disabled={busy || !text.trim()}
        onClick={() => submit()}
      >
        {busy ? t("working") : t("add")}
        <ArrowRight size={17} />
      </button>
    </div>
  );
}
export function DocumentPanel({
  doc,
  selected,
  onSelect,
  onAsk,
  insights = false,
}: {
  doc: Agreement;
  selected: ParsedClause | null;
  onSelect: (c: ParsedClause) => void;
  onAsk: () => void;
  insights?: boolean;
}) {
  const { t, language, aiError } = useLocale();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  const [mode, setMode] = useState("");
  const [original, setOriginal] = useState(false);
  const requestVersion = useRef(0);
  useEffect(() => {
    const version = ++requestVersion.current;
    setResult("");
    setError("");
    setBusy(false);
    readWorkspace<{ text: string; mode: string }>(
      `last-analysis:${doc.id}:${selected?.id}:${language}`,
    )
      .then((cached) => {
        if (cached && requestVersion.current === version) {
          setResult(cached.text);
          setMode(cached.mode);
        }
      })
      .catch(() => {});
    return () => {
      ++requestVersion.current;
    };
  }, [doc.id, selected?.id, language]);
  const counts = {
    low: 0,
    review_recommended: 0,
    high_attention: 0,
    legal_review_recommended: 0,
  };
  doc.clauses.forEach((c) => counts[c.attentionLevel]++);
  const clauses = doc.clauses.filter(
    (c) =>
      (filter === "all" || c.attentionLevel === filter) &&
      (!insights || c.attentionLevel !== "low") &&
      (c.title + " " + c.text)
        .toLocaleLowerCase()
        .includes(search.toLocaleLowerCase()),
  );
  async function analyze(
    action: "explain" | "translate" | "alternative" | "extract",
  ) {
    if (!selected && action !== "extract") return;
    const version = ++requestVersion.current;
    setBusy(true);
    setError("");
    setMode(action);
    const instructions = {
      explain:
        "Explain this clause in simple language. Give: plain meaning, why it matters, and three questions to ask a lawyer. Do not invent facts or citations.",
      translate:
        "Translate this clause faithfully. Preserve obligations, negations, amounts, dates, conditions and names. Do not add advice or change legal meaning.",
      alternative:
        "Draft a balanced alternative clause to discuss with a legal professional, then explain the proposed changes. Label all assumptions. Do not invent figures, deadlines or legal rights.",
      extract:
        "Extract ONLY dates, amounts, parties, obligations and notice periods explicitly present in the supplied agreement. Quote the relevant clause and identify missing information.",
    };
    try {
      const r = await runAI(
        instructions[action] +
          "\nDOCUMENT: " +
          doc.title +
          "\nTEXT:\n" +
          (action === "extract" ? doc.rawText.slice(0, 50000) : selected!.text),
        language,
      );
      if (requestVersion.current === version) setResult(r.text);
      await writeWorkspace(
        `last-analysis:${doc.id}:${selected?.id}:${language}`,
        { text: r.text, mode: action },
      );
      await writeWorkspace(
        "analysis:" +
          doc.id +
          ":" +
          (selected?.id || "all") +
          ":" +
          language +
          ":" +
          action,
        r.text,
      );
    } catch (e) {
      if (requestVersion.current === version) setError(aiError(e));
    } finally {
      if (requestVersion.current === version) setBusy(false);
    }
  }
  return (
    <div className="stack">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            {t(doc.type === "sample" ? "sample" : "saved")}
          </span>
          <h2>{doc.title}</h2>
        </div>
        <button className="button" onClick={() => setOriginal(!original)}>
          <FileText size={16} />
          {t("viewOriginal")}
        </button>
      </div>
      {original && (
        <article className="card original full-text" dir="auto">
          {doc.rawText}
        </article>
      )}
      <div className="stats">
        <div>
          <span>{t("sections")}</span>
          <strong>{doc.clauses.length.toLocaleString(language)}</strong>
          <FileText />
        </div>
        <div>
          <span>{t("flagged")}</span>
          <strong>
            {(doc.clauses.length - counts.low).toLocaleString(language)}
          </strong>
          <span className="stat-dot amber" />
        </div>
        <div>
          <span>{t("review")}</span>
          <strong>
            {counts.legal_review_recommended.toLocaleString(language)}
          </strong>
          <Scale />
        </div>
      </div>
      <div className="screening">
        <Scale size={16} />
        {t("screening")}
      </div>
      {insights && (
        <div className="radar-bar" aria-label={t("insights")}>
          {Object.entries(counts).map(([level, n]) => (
            <div
              key={level}
              className={level}
              style={{ flex: n || 0.15 }}
              title={t(level as keyof typeof counts) + ": " + n}
            />
          ))}
        </div>
      )}
      <div className="document-grid">
        <section className="card clauses">
          <div className="clause-tools">
            <div className="search-field">
              <Search size={17} />
              <input
                aria-label={t("search")}
                placeholder={t("search")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              aria-label={t("flagged")}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">{t("all")}</option>
              {Object.keys(counts).map((k) => (
                <option value={k} key={k}>
                  {t(k as keyof typeof counts)}
                </option>
              ))}
            </select>
          </div>
          <div className="clause-list">
            {clauses.map((c, i) => (
              <button
                className={
                  "clause-item " + (selected?.id === c.id ? "active" : "")
                }
                key={c.id}
                onClick={() => {
                  onSelect(c);
                  setResult("");
                  setError("");
                }}
              >
                <span className="clause-index">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <div className={"badge " + c.attentionLevel}>
                    {t(c.attentionLevel)}
                  </div>
                  <h3 dir="auto">{c.title}</h3>
                  <p dir="auto">{c.text}</p>
                </div>
                <ArrowUpRight size={17} />
              </button>
            ))}
            {!clauses.length && <p className="empty-state">{t("noResults")}</p>}
          </div>
        </section>
        <section className="card inspector" key={selected?.id}>
          <div className="inspector-heading">
            <span className="icon-tile">
              <Sparkles size={20} />
            </span>
            <div>
              <span className="eyebrow">{t("selected")}</span>
              <h2>{t("explanation")}</h2>
            </div>
          </div>
          {selected ? (
            <>
              <span className={"badge " + selected.attentionLevel}>
                {t(selected.attentionLevel)}
              </span>
              <h3 dir="auto">{selected.title}</h3>
              <small>{t("original")}</small>
              <blockquote dir="auto">{selected.text}</blockquote>
              <p className="muted">{t("translationHint")}</p>
              <div className="action-wrap">
                <button
                  className="button primary"
                  disabled={busy}
                  onClick={() => analyze("explain")}
                >
                  <Sparkles size={16} />
                  {t("explain")}
                </button>
                <button
                  className="button"
                  disabled={busy}
                  onClick={() => analyze("translate")}
                >
                  <Languages size={16} />
                  {t("translate")}
                </button>
                <button
                  className="button"
                  disabled={busy}
                  onClick={() => analyze("alternative")}
                >
                  <Scale size={16} />
                  {t("alternative")}
                </button>
              </div>
              <button className="text-button" onClick={onAsk}>
                {t("askClause")}
                <ArrowRight size={16} />
              </button>
            </>
          ) : (
            <p>{t("empty")}</p>
          )}
          {insights && (
            <button
              className="button"
              disabled={busy}
              onClick={() => analyze("extract")}
            >
              {t("extract")}
            </button>
          )}
          {busy && <Busy />}
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          {result && !busy && (
            <div className="ai-result">
              <span className="eyebrow">
                {t(
                  mode === "translate"
                    ? "translated"
                    : mode === "alternative"
                      ? "draftLabel"
                      : "meaning",
                )}
              </span>
              <RichText text={result} />
              <CopyButton text={result} />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
