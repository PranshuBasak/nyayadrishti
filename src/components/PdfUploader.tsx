"use client";

import React, { useState } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, X, Sparkles } from "lucide-react";
import { parsePdfFile, segmentLegalClauses, ParsedClause } from "@/lib/pdfParser";
import { saveDocument } from "@/lib/db";

interface PdfUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentLoaded: (doc: {
    id: string;
    title: string;
    category: any;
    badge: string;
    description: string;
    parties: { partyA: string; partyB: string };
    rawText: string;
    clauses: ParsedClause[];
  }) => void;
}

export function PdfUploader({ isOpen, onClose, onDocumentLoaded }: PdfUploaderProps) {
  const [activeTab, setActiveTab] = useState<"pdf" | "paste">("pdf");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pasteText, setPasteText] = useState("");
  const [docTitle, setDocTitle] = useState("");

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a valid .PDF document.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const parsed = await parsePdfFile(file);
      const newDoc = {
        id: `pdf-${Date.now()}`,
        title: parsed.title,
        category: "consumer" as any,
        badge: `Parsed PDF (${parsed.pageCount} pages)`,
        description: `Uploaded PDF parsed directly in-browser with ${parsed.clauses.length} structured legal clauses.`,
        parties: {
          partyA: "First Party / Originator",
          partyB: "Second Party / Signatory"
        },
        rawText: parsed.rawText,
        clauses: parsed.clauses
      };

      // Save to IndexedDB
      await saveDocument({
        id: newDoc.id,
        title: newDoc.title,
        type: "pdf",
        rawText: newDoc.rawText,
        clauses: newDoc.clauses,
        parsedAt: Date.now()
      });

      onDocumentLoaded(newDoc);
      onClose();
    } catch (err: any) {
      console.error("PDF upload parse error:", err);
      setError("Failed to parse PDF. Ensure it contains selectable text rather than scanned images without OCR.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasteSubmit = async () => {
    if (!pasteText.trim()) {
      setError("Please paste the agreement text.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const title = docTitle.trim() || "Pasted Legal Agreement";
      const clauses = segmentLegalClauses(pasteText, title);

      const newDoc = {
        id: `paste-${Date.now()}`,
        title,
        category: "consumer" as any,
        badge: "Pasted Text Contract",
        description: `Contract segmented in-browser into ${clauses.length} distinct clauses.`,
        parties: {
          partyA: "Party A",
          partyB: "Party B"
        },
        rawText: pasteText,
        clauses
      };

      await saveDocument({
        id: newDoc.id,
        title: newDoc.title,
        type: "pasted",
        rawText: newDoc.rawText,
        clauses: newDoc.clauses,
        parsedAt: Date.now()
      });

      onDocumentLoaded(newDoc);
      onClose();
    } catch (err: any) {
      setError("Failed to process text.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Import Contract</h3>
            <p className="text-xs text-slate-400">In-Browser PDF Parsing & Clause Auditing</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 mb-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("pdf")}
            className={`pb-2.5 px-4 transition-colors ${
              activeTab === "pdf"
                ? "border-b-2 border-amber-500 text-amber-400 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Upload PDF Document
          </button>
          <button
            onClick={() => setActiveTab("paste")}
            className={`pb-2.5 px-4 transition-colors ${
              activeTab === "paste"
                ? "border-b-2 border-amber-500 text-amber-400 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Paste Text Directly
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {activeTab === "pdf" ? (
          <div className="space-y-4">
            <label className="border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer bg-slate-800/30 hover:bg-slate-800/60 transition-all text-center">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                disabled={isLoading}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-amber-400">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {isLoading ? "Parsing PDF in Browser..." : "Click to select or drag & drop PDF"}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Rental agreements, employment bonds, freelancer SOW, consumer policies
                </p>
              </div>
              <span className="inline-flex items-center text-[10px] px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                🔒 100% Client-Side Ingestion
              </span>
            </label>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Contract Title</label>
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="e.g. My Mumbai Rental Agreement"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Paste Contract Clauses</label>
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                rows={6}
                placeholder="Paste the agreement text here..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500"
              />
            </div>
            <button
              onClick={handlePasteSubmit}
              disabled={isLoading || !pasteText.trim()}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {isLoading ? "Analyzing..." : "Analyze Contract"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
