"use client";

import React, { useState } from "react";
import { Shield, Lock, Cloud, Trash2, CheckCircle2, AlertTriangle, X } from "lucide-react";
import { clearAllLocalData } from "@/lib/db";

interface PrivacyControlsProps {
  isOpen: boolean;
  onClose: () => void;
  onDataCleared: () => void;
}

export function PrivacyControls({ isOpen, onClose, onDataCleared }: PrivacyControlsProps) {
  const [cleared, setCleared] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  if (!isOpen) return null;

  const handleClear = async () => {
    setIsClearing(true);
    await clearAllLocalData();
    setIsClearing(false);
    setCleared(true);
    setTimeout(() => {
      onDataCleared();
      onClose();
      setCleared(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Privacy & Data Architecture</h3>
            <p className="text-xs text-slate-400">Local-First Storage & Transparent Processing</p>
          </div>
        </div>

        <div className="space-y-3.5 text-xs text-slate-300">
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white block mb-0.5">🔒 Local Browser Storage (IndexedDB)</span>
              Your uploaded contracts, extracted clauses, voice transcripts, and multi-turn chat history are persisted exclusively inside your own browser's local IndexedDB. NyayaDrishti does not store your files on any application database.
            </div>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-start gap-2.5">
            <Cloud className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white block mb-0.5">☁️ AI Model Processing</span>
              When you ask Nyaya a question, analyze a clause, or use vision, only the specific query and relevant context are sent to the configured Google Gemini model endpoint. Raw documents are not retained for training.
            </div>
          </div>

          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-200/90">
            <span className="font-semibold block mb-0.5">Camera & Microphone Permissions</span>
            Voice listening, camera capture, and screen sharing are strictly <strong>OFF</strong> by default and activate only when explicitly requested. Streams can be severed at any time.
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleClear}
            disabled={isClearing || cleared}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors border border-rose-500/20"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {cleared ? "Data Cleared!" : isClearing ? "Clearing..." : "Clear Local Storage"}
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
