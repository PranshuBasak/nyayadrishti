"use client";

import React, { useState } from "react";
import { Scale, ArrowRight, Check, Copy, Sparkles, AlertCircle } from "lucide-react";
import { ParsedClause } from "@/lib/pdfParser";

interface ContractComparatorProps {
  currentClauses: ParsedClause[];
  docTitle: string;
}

export function ContractComparator({ currentClauses, docTitle }: ContractComparatorProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Pre-configured comparison comparisons showing Version A (Original/One-sided) vs Version B (Fair/Negotiated Counter-Draft)
  const comparisonItems = currentClauses
    .filter((c) => c.suggestedAlternative)
    .map((c) => ({
      id: c.id,
      clauseNumber: c.clauseNumber,
      title: c.title,
      versionA: c.text,
      versionB: c.suggestedAlternative || "",
      rationale: c.whyItMatters,
      tips: c.negotiationTips,
      statutoryRef: c.statutoryRef,
    }));

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Scale className="w-4 h-4" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Contract Comparison & Negotiation Matrix</h1>
        </div>
        <p className="text-xs text-slate-400 max-w-3xl">
          Semantic comparison contrasting one-sided counterpart clauses with standard, balanced counter-proposals aligned with Indian statutory norms.
        </p>
      </div>

      {/* Semantic Comparison Matrix Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <span>Semantic Redline Matrix</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {comparisonItems.length} Negotiable Provisions
          </span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3 w-1/4">Clause / Domain</th>
                <th className="py-3 px-3 w-1/3">Version A (Current Agreement)</th>
                <th className="py-3 px-3 w-1/3 text-emerald-400">Version B (Balanced Counter-Proposal)</th>
                <th className="py-3 px-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {comparisonItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-3 align-top">
                    <span className="font-bold text-amber-400 block">{item.clauseNumber}</span>
                    <span className="font-semibold text-slate-200 block text-xs">{item.title}</span>
                    {item.statutoryRef && (
                      <span className="text-[10px] text-slate-500 block mt-1">
                        {item.statutoryRef.split("&")[0]}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-3 align-top font-serif text-slate-300 leading-relaxed bg-rose-950/5 rounded-l-lg border-l border-rose-500/20">
                    "{item.versionA}"
                  </td>
                  <td className="py-4 px-3 align-top font-serif text-emerald-200 leading-relaxed bg-emerald-950/10 rounded-r-lg border-r border-emerald-500/20">
                    "{item.versionB}"
                    <div className="mt-2 text-[11px] font-sans text-emerald-400/80 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>{item.tips}</span>
                    </div>
                  </td>
                  <td className="py-4 px-2 align-top text-right">
                    <button
                      onClick={() => handleCopy(item.id, item.versionB)}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-medium transition-colors flex items-center gap-1 ml-auto border border-slate-700"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-400" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Redline Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {comparisonItems.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3.5 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400">
                {item.clauseNumber}: {item.title}
              </span>
              <button
                onClick={() => handleCopy(item.id, item.versionB)}
                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
              >
                <Copy className="w-3 h-3" />
                Copy Counter-Proposal
              </button>
            </div>

            {/* Original vs Proposed */}
            <div className="space-y-2 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Original Clause
                </span>
                <p className="font-serif text-slate-300">"{item.versionA}"</p>
              </div>

              <div className="bg-emerald-950/20 p-3 rounded-xl border border-emerald-500/30">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                  Possible Alternative Wording
                </span>
                <p className="font-serif text-emerald-100">"{item.versionB}"</p>
              </div>
            </div>

            {/* Why someone may consider this */}
            <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
              <span className="font-semibold text-white block mb-0.5">Why someone may consider this:</span>
              <p>{item.rationale}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
