"use client";
import React, { useEffect, useState } from "react";
import { readWorkspace, writeWorkspace } from "@/lib/db";
import { ArrowLeftRight, Sparkles, Upload } from "lucide-react";
import { Agreement, compareText, runAI, readAgreement } from "@/lib/workspace";
import { useLocale } from "@/lib/i18n";
import { Busy, RichText, CopyButton } from "./Common";
export function Compare({
  doc,
  documents,
}: {
  doc: Agreement;
  documents: Agreement[];
}) {
  const { t, language } = useLocale();
  const [other, setOther] = useState("");
  const [rows, setRows] = useState<ReturnType<typeof compareText>>([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    let alive = true;
    readWorkspace<{
      other: string;
      result: string;
      rows: ReturnType<typeof compareText>;
    }>(`comparison:${doc.id}:${language}`)
      .then((saved) => {
        if (!alive) return;
        if (saved) {
          setOther(saved.other);
          setResult(saved.result);
          setRows(saved.rows);
        }
        setHydrated(true);
      })
      .catch(() => {
        if (alive) {
          setHydrated(true);
          setError(t("storageError"));
        }
      });
    return () => {
      alive = false;
    };
  }, [doc.id, language]);
  useEffect(() => {
    if (hydrated)
      writeWorkspace(`comparison:${doc.id}:${language}`, {
        other,
        result,
        rows,
      }).catch(() => setError(t("storageError")));
  }, [other, result, rows, hydrated, doc.id, language]);
  async function explain() {
    setBusy(true);
    setError("");
    try {
      setResult(
        (
          await runAI(
            "Compare these two agreement versions semantically. Identify changes in payments, dates, notice periods, liability, renewal and jurisdiction, added and removed obligations. Quote exact old and new wording. Do not claim line matching establishes semantic equivalence.\nVERSION A:\n" +
              doc.rawText.slice(0, 35000) +
              "\nVERSION B:\n" +
              other.slice(0, 35000),
            language,
          )
        ).text,
      );
    } catch {
      setError(t("aiError"));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="stack">
      <div className="section-heading">
        <div>
          <span className="eyebrow">{t("compare")}</span>
          <h2>{t("compare")}</h2>
          <p className="muted">{t("compareHint")}</p>
        </div>
        <ArrowLeftRight size={32} />
      </div>
      <div className="two-col">
        <section className="card stack">
          <h3>{t("versionA")}</h3>
          <strong dir="auto">{doc.title}</strong>
          <pre dir="auto" className="original compare-text">
            {doc.rawText}
          </pre>
        </section>
        <section className="card stack">
          <h3>{t("versionB")}</h3>
          <select
            aria-label={t("chooseDocument")}
            defaultValue=""
            onChange={(e) => {
              setOther(
                documents.find((d) => d.id === e.target.value)?.rawText || "",
              );
              setRows([]);
              setResult("");
            }}
          >
            <option value="">{t("chooseDocument")}</option>
            {documents
              .filter((d) => d.id !== doc.id)
              .map((d) => (
                <option value={d.id} key={d.id}>
                  {d.title}
                </option>
              ))}
          </select>
          <label className="file-inline">
            <Upload size={16} />
            {t("chooseFile")}
            <input
              type="file"
              accept=".pdf,.txt"
              aria-label={t("chooseFile")}
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                try {
                  setOther((await readAgreement(f)).rawText);
                  setRows([]);
                  setResult("");
                } catch {
                  setError(t("invalidFile"));
                }
              }}
            />
          </label>
          <textarea
            rows={10}
            aria-label={t("versionB")}
            value={other}
            placeholder={t("documentText")}
            onChange={(e) => {
              setOther(e.target.value);
              setRows([]);
              setResult("");
            }}
          />
          <div className="action-wrap">
            <button
              className="button primary"
              disabled={!other.trim() || busy}
              onClick={() => setRows(compareText(doc.rawText, other))}
            >
              <ArrowLeftRight size={16} />
              {t("compareAction")}
            </button>
            <button
              className="button"
              disabled={!other.trim() || busy}
              onClick={explain}
            >
              <Sparkles size={16} />
              {t("semantic")}
            </button>
          </div>
        </section>
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {busy && <Busy />}
      {result && (
        <section className="card">
          <RichText text={result} />
          <CopyButton text={result} />
        </section>
      )}
      {rows.length > 0 && (
        <section className="card">
          <div className="action-wrap">
            {(["changed", "added", "removed", "unchanged"] as const).map(
              (status) => (
                <span className={"badge diff-" + status} key={status}>
                  {t(status)} · {rows.filter((r) => r.status === status).length}
                </span>
              ),
            )}
          </div>
          {rows.every((r) => r.status === "unchanged") ? (
            <p>{t("noChanges")}</p>
          ) : (
            rows
              .filter((r) => r.status !== "unchanged")
              .map((r, i) => (
                <div className="diff-row" key={i}>
                  <span className={"badge diff-" + r.status}>
                    {t(r.status)}
                  </span>
                  <div className="two-col">
                    <p dir="auto" className="diff-before">
                      {r.before || "—"}
                    </p>
                    <p dir="auto" className="diff-after">
                      {r.after || "—"}
                    </p>
                  </div>
                </div>
              ))
          )}
        </section>
      )}
    </div>
  );
}
