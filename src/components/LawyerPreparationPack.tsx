"use client";

import React, { useRef } from "react";
import { Briefcase, Printer, FileDown, CheckCircle2, Scale, Calendar, HelpCircle, Shield } from "lucide-react";
import { ParsedClause } from "@/lib/pdfParser";

interface LawyerPreparationPackProps {
  documentTitle: string;
  parties?: { partyA: string; partyB: string };
  flaggedClauses: ParsedClause[];
  intakeData?: {
    issueType: string;
    oppositeParty: string;
    dateOfIncident: string;
    financialAmount: string;
    problemSummary: string;
    previousContact: string;
    evidenceList: string[];
  };
}

export function LawyerPreparationPack({
  documentTitle,
  parties,
  flaggedClauses,
  intakeData,
}: LawyerPreparationPackProps) {
  const packRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Lawyer Preparation Pack (वकील ब्रीफ)</h2>
            <p className="text-xs text-slate-400">Structured brief to maximize efficiency and reduce advocate consultation costs</p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors border border-slate-700 shrink-0 self-start sm:self-auto"
        >
          <Printer className="w-3.5 h-3.5 text-amber-400" />
          Print / Save PDF Dossier
        </button>
      </div>

      {/* Printable Brief Body */}
      <div ref={packRef} className="space-y-6 text-xs text-slate-300 print:text-black print:bg-white">
        {/* Dossier Meta */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Matter / Document</span>
            <span className="font-bold text-slate-200 text-sm">{documentTitle}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Jurisdiction & Governing Law</span>
            <span className="font-semibold text-slate-300">Republic of India (Indian Central & State Statutes)</span>
          </div>
          {parties && (
            <div className="col-span-1 sm:col-span-2 text-slate-400">
              <span className="font-medium text-slate-300">Parties Involved:</span> {parties.partyA} vs {parties.partyB}
            </div>
          )}
        </div>

        {/* Dispute Summary if intake provided */}
        {intakeData && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5" /> Client Case Summary & Facts
            </h3>
            <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-800 space-y-1.5">
              <div className="grid grid-cols-2 gap-2">
                <div><strong>Category:</strong> {intakeData.issueType}</div>
                <div><strong>Claim / Exposure:</strong> {intakeData.financialAmount}</div>
              </div>
              <div><strong>Core Grievance:</strong> {intakeData.problemSummary}</div>
              <div><strong>Prior Communications:</strong> {intakeData.previousContact}</div>
              <div><strong>Documentary Evidence:</strong> {intakeData.evidenceList.join(", ")}</div>
            </div>
          </div>
        )}

        {/* High Attention Clauses */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" /> High Attention & Disputed Clauses ({flaggedClauses.length})
          </h3>
          <div className="space-y-2.5">
            {flaggedClauses.map((clause) => (
              <div key={clause.id} className="p-3 bg-slate-800/30 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">
                    {clause.clauseNumber}: {clause.title}
                  </span>
                  <span className="text-[10px] font-semibold text-amber-400">
                    {clause.statutoryRef || "General Contract Law"}
                  </span>
                </div>
                <p className="font-serif text-[11px] text-slate-300 italic">"{clause.text}"</p>
                <p className="text-[11px] text-slate-400 pt-0.5"><strong className="text-slate-300">Client Concern:</strong> {clause.explanation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 5 High-Leverage Questions to Ask Lawyer */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" /> Targeted Questions for Your Advocate Consultation
          </h3>
          <ul className="space-y-1.5 bg-slate-800/20 p-3 rounded-xl border border-slate-800">
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">1.</span>
              <span>Does Section 27 of the Indian Contract Act or Section 2(46) of the Consumer Protection Act completely shield me from the opponent's financial demands?</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">2.</span>
              <span>Should we issue a formal 15-day statutory Demand Notice before initiating proceedings on e-Daakhil or approaching the civil court?</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">3.</span>
              <span>Is the unilateral sole arbitrator clause void under the Supreme Court's Perkins Eastman ruling?</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">4.</span>
              <span>What is the realistic timeline and estimated court fee for obtaining an interim stay or filing an adjudication claim in our local jurisdiction?</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
