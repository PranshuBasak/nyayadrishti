"use client";

import React, { useState } from "react";
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Scale, 
  Languages, 
  MessageSquare, 
  ExternalLink,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { ParsedClause } from "@/lib/pdfParser";
import { translateLegalClause, TranslationLevel } from "@/lib/ai/translate";

interface LegalAttentionRadarProps {
  documentTitle: string;
  clauses: ParsedClause[];
  onAskAboutClause: (clause: ParsedClause) => void;
}

export function LegalAttentionRadar({
  documentTitle,
  clauses,
  onAskAboutClause,
}: LegalAttentionRadarProps) {
  const [selectedTranslationClause, setSelectedTranslationClause] = useState<ParsedClause | null>(
    clauses[0] || null
  );
  const [translationLevel, setTranslationLevel] = useState<TranslationLevel>("plain");
  const [translatedText, setTranslatedText] = useState<string>("");
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [expandedClauseId, setExpandedClauseId] = useState<string | null>(
    clauses.find((c) => c.attentionLevel === "legal_review_recommended")?.id || clauses[0]?.id || null
  );

  const legalReviewClauses = clauses.filter((c) => c.attentionLevel === "legal_review_recommended");
  const highAttentionClauses = clauses.filter((c) => c.attentionLevel === "high_attention");
  const reviewClauses = clauses.filter((c) => c.attentionLevel === "review_recommended");
  const lowAttentionClauses = clauses.filter((c) => c.attentionLevel === "low");

  const handleTranslate = async (clause: ParsedClause, level: TranslationLevel) => {
    setSelectedTranslationClause(clause);
    setTranslationLevel(level);
    setIsTranslating(true);
    const result = await translateLegalClause(clause.text, level);
    setTranslatedText(result);
    setIsTranslating(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Top Banner: Attention Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <h1 className="text-xl font-bold text-white tracking-tight">Legal Attention Radar</h1>
            </div>
            <p className="text-xs text-slate-400">
              Categorizes provisions by contractual exposure and alignment with Indian statutory principles.
            </p>
          </div>
          <div className="text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/80">
            Document: <span className="font-semibold text-slate-200">{documentTitle}</span>
          </div>
        </div>

        {/* 4 Quadrants Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Legal Review Recommended */}
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-rose-400">Legal Review</span>
              <span className="text-lg font-extrabold text-rose-300">{legalReviewClauses.length}</span>
            </div>
            <p className="text-[11px] text-rose-200/80 leading-relaxed">
              Provisions with potential statutory conflicts (e.g. Section 27 non-compete, Perkins Eastman arbitration).
            </p>
          </div>

          {/* 2. High Attention */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-400">High Attention</span>
              <span className="text-lg font-extrabold text-amber-300">{highAttentionClauses.length}</span>
            </div>
            <p className="text-[11px] text-amber-200/80 leading-relaxed">
              Meaningful financial commitments, security deposit terms, or broad indemnity liabilities.
            </p>
          </div>

          {/* 3. Review Recommended */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-yellow-400">Review Recommended</span>
              <span className="text-lg font-extrabold text-yellow-300">{reviewClauses.length}</span>
            </div>
            <p className="text-[11px] text-yellow-200/80 leading-relaxed">
              Notice periods, renewal mechanics, or operational requirements worth clarifying.
            </p>
          </div>

          {/* 4. Low Attention */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-400">Low Attention</span>
              <span className="text-lg font-extrabold text-emerald-300">{lowAttentionClauses.length}</span>
            </div>
            <p className="text-[11px] text-emerald-200/80 leading-relaxed">
              Standard administrative definitions and customary contractual provisions.
            </p>
          </div>
        </div>
      </div>

      {/* Main Attention Flags Explorer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Scale className="w-4 h-4 text-amber-400" />
          Provisions Requiring Attention & Suggested Inquiries
        </h2>

        <div className="space-y-3">
          {clauses
            .filter((c) => c.attentionLevel !== "low")
            .map((clause) => {
              const isExpanded = expandedClauseId === clause.id;
              const isLegal = clause.attentionLevel === "legal_review_recommended";
              return (
                <div
                  key={clause.id}
                  className={`rounded-xl border transition-all ${
                    isLegal
                      ? "border-rose-500/40 bg-rose-950/10"
                      : "border-amber-500/30 bg-amber-950/10"
                  }`}
                >
                  <div
                    onClick={() => setExpandedClauseId(isExpanded ? null : clause.id)}
                    className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-800/40"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`text-xs font-bold ${isLegal ? "text-rose-400" : "text-amber-400"}`}>
                        {clause.clauseNumber}
                      </span>
                      <h3 className="text-xs font-bold text-slate-100">{clause.title}</h3>
                      {clause.statutoryRef && (
                        <span className="hidden sm:inline text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {clause.statutoryRef.split("&")[0]}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          isLegal
                            ? "bg-rose-500/20 text-rose-300"
                            : "bg-amber-500/20 text-amber-300"
                        }`}
                      >
                        {isLegal ? "Legal Review" : "High Attention"}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 space-y-3.5 border-t border-slate-800/60 text-xs">
                      {/* Exact Clause */}
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 font-serif text-slate-300">
                        "{clause.text}"
                      </div>

                      {/* Detected Issue & Plain Explanation */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800">
                          <span className="font-semibold text-white block mb-0.5">Plain-Language Meaning:</span>
                          <p className="text-slate-300 leading-relaxed">{clause.explanation}</p>
                        </div>
                        <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800">
                          <span className="font-semibold text-white block mb-0.5">Why it was flagged:</span>
                          <p className="text-slate-300 leading-relaxed">{clause.whyItMatters}</p>
                        </div>
                      </div>

                      {/* Indian Legal Source */}
                      {clause.statutoryRef && (
                        <div className="p-2.5 bg-blue-950/20 border border-blue-800/30 rounded-lg text-blue-200/90 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Scale className="w-3.5 h-3.5 text-blue-400" />
                            <strong>Applicable Legal Source:</strong> {clause.statutoryRef}
                          </span>
                        </div>
                      )}

                      {/* Questions to Ask Lawyer */}
                      {clause.questionsForLawyer && clause.questionsForLawyer.length > 0 && (
                        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/60">
                          <span className="font-semibold text-amber-300 block mb-1">
                            Questions You May Want to Ask a Lawyer:
                          </span>
                          <ul className="space-y-1 text-slate-300 list-disc list-inside">
                            {clause.questionsForLawyer.map((q, idx) => (
                              <li key={idx}>{q}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Action */}
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => onAskAboutClause(clause)}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                        >
                          <MessageSquare className="w-3 h-3" />
                          Discuss this with Nyaya
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* Embedded Plain-Language Legal Translator */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Languages className="w-4 h-4 text-amber-400" />
              Plain-Language Legal Translator (सरल भाषा अनुवादक)
            </h2>
            <p className="text-xs text-slate-400">
              Convert dense legalese into Plain English, 8th-grade Simple English, Hinglish, or Hindi.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedTranslationClause?.id}
              onChange={(e) => {
                const found = clauses.find((c) => c.id === e.target.value);
                if (found) setSelectedTranslationClause(found);
              }}
              className="bg-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 border border-slate-700 outline-none max-w-xs truncate"
            >
              {clauses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.clauseNumber}: {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedTranslationClause && (
          <div className="space-y-4">
            {/* Reading Level Selector Pills */}
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                onClick={() => handleTranslate(selectedTranslationClause, "plain")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  translationLevel === "plain"
                    ? "bg-amber-500 text-slate-950 font-bold"
                    : "bg-slate-800 text-slate-300 hover:text-white"
                }`}
              >
                📖 Plain English
              </button>
              <button
                onClick={() => handleTranslate(selectedTranslationClause, "simple")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  translationLevel === "simple"
                    ? "bg-amber-500 text-slate-950 font-bold"
                    : "bg-slate-800 text-slate-300 hover:text-white"
                }`}
              >
                🎒 Simple English (Grade 8)
              </button>
              <button
                onClick={() => handleTranslate(selectedTranslationClause, "hinglish")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  translationLevel === "hinglish"
                    ? "bg-amber-500 text-slate-950 font-bold"
                    : "bg-slate-800 text-slate-300 hover:text-white"
                }`}
              >
                🇮🇳 Hinglish (Hindi-English)
              </button>
              <button
                onClick={() => handleTranslate(selectedTranslationClause, "hindi")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  translationLevel === "hindi"
                    ? "bg-amber-500 text-slate-950 font-bold"
                    : "bg-slate-800 text-slate-300 hover:text-white"
                }`}
              >
                🪔 हिन्दी (Hindi)
              </button>
            </div>

            {/* Side-by-Side Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Original Legal Text ({selectedTranslationClause.clauseNumber})
                </span>
                <p className="font-serif text-xs text-slate-300 leading-relaxed">
                  "{selectedTranslationClause.text}"
                </p>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1.5">
                  {translationLevel.toUpperCase()} Version
                </span>
                {isTranslating ? (
                  <div className="text-xs text-slate-400 animate-pulse">Generating simplified explanation...</div>
                ) : (
                  <p className="text-xs text-slate-100 leading-relaxed">
                    {translatedText || selectedTranslationClause.explanation}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
