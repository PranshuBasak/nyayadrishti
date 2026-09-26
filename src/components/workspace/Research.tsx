"use client";
import React, { useState } from "react";
import { Search, ArrowUpRight, BookOpen } from "lucide-react";
import { runAI, AIResult } from "@/lib/workspace";
import { useLocale } from "@/lib/i18n";
import { Busy, RichText, Sources } from "./Common";
export function Research({ onResult }: { onResult: (r: AIResult) => void }) {
  const { t, language } = useLocale();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<AIResult>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function search() {
    if (!query.trim()) return;
    setBusy(true);
    setError("");
    try {
      const r = await runAI(
        "Research the following Indian legal information question using current search. Prefer primary official sources such as indiacode.nic.in, sci.gov.in, consumeraffairs.gov.in, rbi.org.in and relevant state portals. Explain jurisdiction and uncertainty, distinguish general information from legal advice, and cite the retrieved sources. Query: " +
          query,
        language,
        { research: true },
      );
      setResult(r);
      onResult(r);
    } catch {
      setError(t("aiError"));
    } finally {
      setBusy(false);
    }
  }
  const portals = [
    ["India Code", "https://www.indiacode.nic.in/"],
    ["National Consumer Helpline", "https://consumerhelpline.gov.in/"],
    ["e-Jagriti", "https://e-jagriti.gov.in/"],
    ["Supreme Court of India", "https://www.sci.gov.in/"],
    ["Reserve Bank of India", "https://www.rbi.org.in/"],
  ];
  return (
    <div className="stack">
      <div className="section-heading">
        <div>
          <span className="eyebrow">{t("sources")}</span>
          <h2>{t("research")}</h2>
          <p className="muted">{t("researchHint")}</p>
        </div>
        <BookOpen size={32} />
      </div>
      <form
        className="card search-form"
        onSubmit={(e) => {
          e.preventDefault();
          void search();
        }}
      >
        <input
          aria-label={t("researchQuery")}
          placeholder={t("researchQuery")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="button primary" disabled={!query.trim() || busy}>
          <Search size={16} />
          {t("searchSources")}
        </button>
      </form>
      {busy && <Busy />}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {result && (
        <section className="card">
          <RichText text={result.text} />
          <Sources sources={result.sources} />
        </section>
      )}
      <div className="two-col">
        <section className="card stack">
          <h3>{t("official")}</h3>
          {portals.map(([name, url]) => (
            <a
              className="portal"
              href={url}
              target="_blank"
              rel="noreferrer"
              key={url}
            >
              {name}
              <ArrowUpRight size={17} />
            </a>
          ))}
        </section>
        <section className="card stack">
          <span className="icon-tile">
            <BookOpen />
          </span>
          <h3>{t("navigator")}</h3>
          <p>{t("navSteps")}</p>
          <p className="muted">{t("disclaimer")}</p>
        </section>
      </div>
    </div>
  );
}
