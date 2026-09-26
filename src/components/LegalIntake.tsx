"use client";

import React, { useState } from "react";
import { ClipboardList, Sparkles, CheckCircle2, ArrowRight, UserCheck, Shield } from "lucide-react";

interface LegalIntakeProps {
  onIntakeCompleted: (data: {
    issueType: string;
    oppositeParty: string;
    dateOfIncident: string;
    financialAmount: string;
    problemSummary: string;
    previousContact: string;
    evidenceList: string[];
  }) => void;
}

export function LegalIntake({ onIntakeCompleted }: LegalIntakeProps) {
  const [step, setStep] = useState(1);
  const [issueType, setIssueType] = useState("Consumer Dispute / E-Commerce");
  const [oppositeParty, setOppositeParty] = useState("ABC Electronics India Pvt. Ltd.");
  const [dateOfIncident, setDateOfIncident] = useState("14 March 2026");
  const [financialAmount, setFinancialAmount] = useState("₹32,000");
  const [problemSummary, setProblemSummary] = useState("Device failed within 9 days of purchase. Vendor refuses refund or repair.");
  const [previousContact, setPreviousContact] = useState("Customer care emailed twice with invoice; no resolution provided.");
  const [evidenceInput, setEvidenceInput] = useState("Tax Invoice, Unboxing Video, Customer Support Email thread");

  const handleSubmit = () => {
    const evidenceList = evidenceInput.split(",").map((s) => s.trim()).filter(Boolean);
    onIntakeCompleted({
      issueType,
      oppositeParty,
      dateOfIncident,
      financialAmount,
      problemSummary,
      previousContact,
      evidenceList,
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ClipboardList className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Guided Legal Intake Assistant</h2>
            <p className="text-xs text-slate-400">Structure your dispute facts before consulting a lawyer</p>
          </div>
        </div>
        <span className="text-xs text-amber-400 font-semibold px-2.5 py-1 bg-amber-500/10 rounded-full border border-amber-500/20">
          Step {step} of 3
        </span>
      </div>

      {step === 1 && (
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Select Dispute Category</label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
            >
              <option value="Consumer Dispute / E-Commerce">Consumer Dispute / E-Commerce Defect</option>
              <option value="Tenancy & Rental Deposit">Tenancy / Landlord Deposit Withholding</option>
              <option value="Employment & Service Bond">Employment / Non-Compete / Unpaid Dues</option>
              <option value="Freelancer & Vendor Payment">Freelance Delayed Payment / MSME Dispute</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Opposite Party Name (Company / Landlord / Employer)</label>
            <input
              type="text"
              value={oppositeParty}
              onChange={(e) => setOppositeParty(e.target.value)}
              placeholder="e.g. Acme Tech Solutions Pvt. Ltd."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Date of Incident / Purchase</label>
              <input
                type="text"
                value={dateOfIncident}
                onChange={(e) => setDateOfIncident(e.target.value)}
                placeholder="e.g. 14 March 2026"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Disputed Amount / Claim</label>
              <input
                type="text"
                value={financialAmount}
                onChange={(e) => setFinancialAmount(e.target.value)}
                placeholder="e.g. ₹32,000"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              Next: Facts & Evidence <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">What went wrong? (Detailed Problem Summary)</label>
            <textarea
              rows={3}
              value={problemSummary}
              onChange={(e) => setProblemSummary(e.target.value)}
              placeholder="Explain what happened chronologically..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Previous Contact & Responses</label>
            <textarea
              rows={2}
              value={previousContact}
              onChange={(e) => setPreviousContact(e.target.value)}
              placeholder="What emails, calls, or tickets have you already submitted?"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Evidence Available (comma separated)</label>
            <input
              type="text"
              value={evidenceInput}
              onChange={(e) => setEvidenceInput(e.target.value)}
              placeholder="e.g. Tax Invoice, WhatsApp Screenshots, Bank Statement"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex justify-between pt-2">
            <button
              onClick={() => setStep(1)}
              className="px-3 py-2 text-slate-400 hover:text-white"
            >
              Back
            </button>
            <button
              onClick={() => {
                handleSubmit();
                setStep(3);
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              Review Dossier <CheckCircle2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2">
            <span className="text-amber-400 font-bold text-xs uppercase tracking-wider block">
              Structured Dispute Intake Card
            </span>
            <div className="grid grid-cols-2 gap-2 text-slate-300">
              <div><strong className="text-slate-400">Issue Type:</strong> {issueType}</div>
              <div><strong className="text-slate-400">Opposite Party:</strong> {oppositeParty}</div>
              <div><strong className="text-slate-400">Date:</strong> {dateOfIncident}</div>
              <div><strong className="text-slate-400">Claim Amount:</strong> {financialAmount}</div>
            </div>
            <div className="text-slate-300 pt-1">
              <strong className="text-slate-400 block">Summary:</strong> {problemSummary}
            </div>
            <div className="text-slate-300 pt-1">
              <strong className="text-slate-400 block">Evidence:</strong> {evidenceInput}
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => setStep(2)}
              className="px-3 py-2 text-slate-400 hover:text-white"
            >
              Edit Details
            </button>
            <span className="text-emerald-400 flex items-center gap-1.5 font-semibold">
              <CheckCircle2 className="w-4 h-4" /> Ready for Lawyer Pack & Draft Notice
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
