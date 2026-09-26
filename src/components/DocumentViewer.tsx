"use client";

import React, { useState } from "react";
import { 
  FileText, 
  AlertTriangle, 
  HelpCircle, 
  CheckCircle2, 
  Sparkles, 
  MessageSquare, 
  Scale, 
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  ArrowRight
} from "lucide-react";
import { ParsedClause } from "@/lib/pdfParser";

interface DocumentViewerProps {
  document: {
    id: string;
    title: string;
    category?: string;
    badge?: string;
    description?: string;
    parties?: { partyA: string; partyB: string };
    rawText: string;
    clauses: ParsedClause[];
  };
  selectedClause: ParsedClause | null;
  onSelectClause: (clause: ParsedClause) => void;
  onAskNyayaAboutClause: (clause: ParsedClause) => void;
  onCompareClause: (clause: ParsedClause) => void;
}

export function DocumentViewer({
  document,
  selectedClause,
  onSelectClause,
  onAskNyayaAboutClause,
  onCompareClause
}: DocumentViewerProps) {
  const [filterLevel, setFilterLevel] = useState<string>("all");

  const getBadgeStyle = (level: string) => {
    switch (level) {
      case "legal_review_recommended":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      case "high_attention":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "review_recommended":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    }
  };

  const getBadgeLabel = (level: string) => {
    switch (level) {
      case "legal_review_recommended":
        return "⚖️ Legal Review Recommended";
      case "high_attention":
        return "⚠️ High Attention";
      case "review_recommended":
        return "🔍 Review Recommended";
      default:
        return "✓ Standard Term";
    }
  };

  const filteredClauses = document.clauses.filter((c) => {
    if (filterLevel === "all") return true;
    return c.attentionLevel === filterLevel;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Document Dossier Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {document.badge || "Legal Agreement"}
              </span>
              <span className="text-xs text-slate-400">
                {document.clauses.length} Sections Indexed
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {document.title}
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              {document.description || "Comprehensive clause-by-clause legal review mapped to the Indian legal ecosystem."}
            </p>
          </div>

          {document.parties && (
            <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60 text-xs space-y-1 min-w-[260px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Parties Identified
              </span>
              <div className="text-slate-200">
                <span className="text-slate-400">First Party:</span> {document.parties.partyA}
              </div>
              <div className="text-slate-200">
                <span className="text-slate-400">Second Party:</span> {document.parties.partyB}
              </div>
            </div>
          )}
        </div>

        {/* Filter Pills */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 mr-1 font-medium">Filter by Attention:</span>
          <button
            onClick={() => setFilterLevel("all")}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              filterLevel === "all"
                ? "bg-slate-700 text-white font-bold"
                : "bg-slate-800/60 text-slate-400 hover:text-slate-200"
            }`}
          >
            All Clauses ({document.clauses.length})
          </button>
          <button
            onClick={() => setFilterLevel("legal_review_recommended")}
            className={`px-2.5 py-1 rounded-lg transition-colors border ${
              filterLevel === "legal_review_recommended"
                ? "bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold"
                : "bg-slate-800/60 text-rose-400/80 border-transparent hover:border-rose-500/20"
            }`}
          >
            ⚖️ Legal Review ({document.clauses.filter((c) => c.attentionLevel === "legal_review_recommended").length})
          </button>
          <button
            onClick={() => setFilterLevel("high_attention")}
            className={`px-2.5 py-1 rounded-lg transition-colors border ${
              filterLevel === "high_attention"
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold"
                : "bg-slate-800/60 text-amber-400/80 border-transparent hover:border-amber-500/20"
            }`}
          >
            ⚠️ High Attention ({document.clauses.filter((c) => c.attentionLevel === "high_attention").length})
          </button>
          <button
            onClick={() => setFilterLevel("review_recommended")}
            className={`px-2.5 py-1 rounded-lg transition-colors border ${
              filterLevel === "review_recommended"
                ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/40 font-bold"
                : "bg-slate-800/60 text-yellow-400/80 border-transparent hover:border-yellow-500/20"
            }`}
          >
            🔍 Review ({document.clauses.filter((c) => c.attentionLevel === "review_recommended").length})
          </button>
        </div>
      </div>

      {/* Main Split Layout: Clause List on Left, Active Clause Audit on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Clause Cards */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Click any clause to inspect statutory implications</span>
            <span>Showing {filteredClauses.length} items</span>
          </div>

          <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
            {filteredClauses.map((clause) => {
              const isSelected = selectedClause?.id === clause.id;
              return (
                <div
                  key={clause.id}
                  onClick={() => onSelectClause(clause)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-slate-800/90 border-amber-500 shadow-lg shadow-amber-500/10"
                      : "bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-400">
                        {clause.clauseNumber}
                      </span>
                      <h3 className="text-xs font-bold text-slate-200">{clause.title}</h3>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${getBadgeStyle(
                        clause.attentionLevel
                      )}`}
                    >
                      {getBadgeLabel(clause.attentionLevel)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-serif leading-relaxed line-clamp-3 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                    "{clause.text}"
                  </p>

                  <div className="mt-3 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Scale className="w-3 h-3 text-slate-500" />
                      {clause.statutoryRef ? clause.statutoryRef.split("&")[0] : "General Contract Principles"}
                    </span>
                    <span className="text-amber-400/90 hover:text-amber-300 font-medium flex items-center gap-0.5">
                      Inspect Clause <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep Clause Audit & Actions */}
        <div className="lg:col-span-6">
          {selectedClause ? (
            <div className="sticky top-20 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
              {/* Header */}
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                    {selectedClause.clauseNumber}: {selectedClause.title}
                  </span>
                  <span
                    className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${getBadgeStyle(
                      selectedClause.attentionLevel
                    )}`}
                  >
                    {getBadgeLabel(selectedClause.attentionLevel)}
                  </span>
                </div>
                <h2 className="text-base font-bold text-white">Clause Analysis & Indian Law Implications</h2>
              </div>

              {/* Original Clause Text */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Original Document Text
                </span>
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-serif text-xs text-slate-300 leading-relaxed">
                  "{selectedClause.text}"
                </div>
              </div>

              {/* Plain English & Hinglish Explanation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Plain English Meaning
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {selectedClause.explanation}
                  </p>
                </div>
                <div className="bg-amber-500/5 p-3 rounded-xl border border-amber-500/20">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                    Hinglish Summary (सरल भाषा)
                  </span>
                  <p className="text-xs text-amber-100/90 leading-relaxed">
                    {selectedClause.hinglishExplanation}
                  </p>
                </div>
              </div>

              {/* Why it Matters & Statutory Reference */}
              <div className="space-y-3">
                <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 text-xs">
                  <span className="font-semibold text-white block mb-0.5">Why this matters:</span>
                  <p className="text-slate-300">{selectedClause.whyItMatters}</p>
                </div>

                {selectedClause.statutoryRef && (
                  <div className="bg-blue-950/30 p-3 rounded-xl border border-blue-800/40 text-xs flex items-start gap-2">
                    <Scale className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-blue-200 block mb-0.5">Indian Statutory Grounding:</span>
                      <p className="text-slate-300">{selectedClause.statutoryRef}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Questions for Advocate */}
              {selectedClause.questionsForLawyer && selectedClause.questionsForLawyer.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Questions to Consider Asking an Advocate
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {selectedClause.questionsForLawyer.map((q, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-slate-800/30 p-2 rounded-lg">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-2.5">
                <button
                  onClick={() => onAskNyayaAboutClause(selectedClause)}
                  className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Ask Nyaya about this
                </button>

                <button
                  onClick={() => onCompareClause(selectedClause)}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 border border-slate-700"
                >
                  <Scale className="w-3.5 h-3.5 text-amber-400" />
                  View Counter-Redline
                </button>
              </div>
            </div>
          ) : (
            <div className="h-72 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <FileText className="w-8 h-8 mb-2 text-slate-600" />
              <p className="text-sm font-semibold text-slate-300">No Clause Selected</p>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Select any clause from the document list to inspect its plain English meaning, Hinglish summary, statutory references, and negotiation tips.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
