"use client";

import React, { useState } from "react";
import { Mail, FileText, Copy, Check, AlertTriangle, Sparkles, Printer } from "lucide-react";

interface DraftCommunicationProps {
  documentTitle: string;
  oppositeParty?: string;
  claimAmount?: string;
  issueSummary?: string;
}

export function DraftCommunication({
  documentTitle,
  oppositeParty = "Opposite Party / Landlord / Employer",
  claimAmount = "₹42,000",
  issueSummary = "Unlawful withholding of refundable security deposit contrary to statutory principles.",
}: DraftCommunicationProps) {
  const [activeTemplate, setActiveTemplate] = useState<"notice" | "email" | "refund">("notice");
  const [copied, setCopied] = useState(false);

  // Template 1: 15-Day Draft Legal Notice (Indian Legal Standard)
  const legalNoticeDraft = `LEGAL NOTICE (DRAFT FOR ADVOCATE REVIEW)
(Sent via Registered Post A/D & Email)

Date: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}

TO:
${oppositeParty}
[Address / Registered Office]
Email: [Opponent's Official Email]

SUBJECT: LEGAL NOTICE FOR REFUND OF SUM OF ${claimAmount} AND CESSATION OF UNFAIR CONTRACTUAL DEMANDS ARISEN UNDER "${documentTitle}"

Sir / Madam,

Under instructions from and on behalf of my Client, I hereby serve upon you this formal Legal Notice as follows:

1. That my Client entered into an agreement titled "${documentTitle}" with you, wherein my Client performed all reciprocal obligations faithfully.

2. That pursuant to the termination/vacation of the said arrangement, a refundable sum of ${claimAmount} remains wrongfully withheld by you without legitimate justification.

3. That your insistence on arbitrary penalties and unilateral deductions violates the provisions of:
   (a) Section 2(46) of the Consumer Protection Act, 2019 (Prohibition of Unfair Contracts);
   (b) Section 74 of the Indian Contract Act, 1872 (Stipulation by way of penalty); and
   (c) Applicable Model Tenancy & Rent Regulations regarding wear-and-tear deductions.

4. That your actions constitute deficiency in service and unfair trade practice, causing mental harassment and wrongful financial loss to my Client.

NOW THEREFORE, I hereby call upon you to refund the said sum of ${claimAmount} along with interest at 18% per annum within 15 (FIFTEEN) DAYS of the receipt of this Notice, failing which my Client shall be constrained to initiate appropriate legal proceedings before the competent Consumer Commission (e-Daakhil) and Civil Court, holding you liable for all legal costs and consequences arising therefrom.

A copy of this Legal Notice is retained in my office records for future evidentiary reliance.

Yours faithfully,

[Name of Advocate / Representative]
Advocate, Bar Council of India
[Enrollment Number]`;

  // Template 2: Formal Consumer Complaint Email
  const consumerEmailDraft = `Subject: Formal Grievance & Demand for Resolution — Ref: ${documentTitle}

Dear Grievance Officer / Management,
${oppositeParty},

I am writing to register a formal grievance regarding ${documentTitle}.

Details of Transaction:
- Reference / Agreement: ${documentTitle}
- Disputed Amount: ${claimAmount}
- Core Issue: ${issueSummary}

Under the Consumer Protection Act, 2019, arbitrary deductions, refusal to refund advance deposits, or unilateral penalties constitute an 'Unfair Contract' under Section 2(46).

I request you to immediately process the refund / redress the grievance within 7 working days. If unresolved, I will be compelled to escalate this dispute to the National Consumer Helpline (NCH - 1915) and file a formal grievance on the e-Daakhil portal.

Looking forward to your prompt response.

Sincerely,
[Your Full Name]
[Contact Number]`;

  // Template 3: Security Deposit Refund Demand
  const depositDemandDraft = `Subject: Demand for Immediate Refund of Security Deposit — Flat Handover Ref: ${documentTitle}

Dear ${oppositeParty},

This is with reference to the residential lease agreement for the premises peacefully handed over by me on [Handover Date].

As verified during our joint physical inspection, the premises were delivered in good tenantable order, with only normal wear and tear resulting from ordinary habitation.

Under Section 108 of the Transfer of Property Act, 1882 and Section 11 of the Model Tenancy Act:
1. Normal wear and tear is expressly excluded from tenant liability.
2. The interest-free refundable deposit of ${claimAmount} is legally required to be refunded within 7 days of handover.
3. Arbitrary mandatory deductions for painting without vendor invoices are legally impermissible.

Please transfer the balance refundable deposit of ${claimAmount} to my bank account (details below) within 3 days.

Bank Account: [Your Account Number]
IFSC: [Your Bank IFSC]

Thank you,
[Your Name]`;

  const getActiveText = () => {
    if (activeTemplate === "notice") return legalNoticeDraft;
    if (activeTemplate === "email") return consumerEmailDraft;
    return depositDemandDraft;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveText());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Mail className="w-4 h-4 text-amber-400" />
            Draft Communication & Notice Preparation
          </h2>
          <p className="text-xs text-slate-400">
            Generate formal notices, emails, and demand letters aligned with Indian procedural practice
          </p>
        </div>

        {/* Template Selector */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/80 text-xs">
          <button
            onClick={() => setActiveTemplate("notice")}
            className={`px-3 py-1.5 rounded-lg transition-colors font-semibold ${
              activeTemplate === "notice"
                ? "bg-amber-500 text-slate-950 font-bold"
                : "text-slate-300 hover:text-white"
            }`}
          >
            15-Day Legal Notice
          </button>
          <button
            onClick={() => setActiveTemplate("email")}
            className={`px-3 py-1.5 rounded-lg transition-colors font-semibold ${
              activeTemplate === "email"
                ? "bg-amber-500 text-slate-950 font-bold"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Grievance Email
          </button>
          <button
            onClick={() => setActiveTemplate("refund")}
            className={`px-3 py-1.5 rounded-lg transition-colors font-semibold ${
              activeTemplate === "refund"
                ? "bg-amber-500 text-slate-950 font-bold"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Deposit Demand
          </button>
        </div>
      </div>

      {/* Warning Guardrail */}
      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="block mb-0.5">AI-Generated Draft Notice:</strong>
          Review this draft with your legal professional prior to sending. For matters involving significant financial exposure or litigation, an advocate must issue notice on their official letterhead with their Bar registration details.
        </div>
      </div>

      {/* Editor / Draft Display */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Draft Output ({activeTemplate.toUpperCase()})</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-semibold"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied to Clipboard!" : "Copy Full Text"}</span>
          </button>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
          {getActiveText()}
        </div>
      </div>
    </div>
  );
}
