"use client";

import React, { useState } from "react";
import { 
  Scale, 
  Shield, 
  FileText, 
  Upload, 
  Mic, 
  Video, 
  Monitor, 
  Trash2, 
  Globe, 
  Info,
  Sparkles,
  ChevronDown
} from "lucide-react";
import { SAMPLE_CONTRACTS, SampleContract } from "@/data/sampleContracts";

interface NavbarProps {
  activeTab: "document" | "insights" | "ask" | "compare" | "prepare";
  onTabChange: (tab: "document" | "insights" | "ask" | "compare" | "prepare") => void;
  selectedContract: SampleContract | null;
  onSelectSampleContract: (contract: SampleContract) => void;
  onOpenUpload: () => void;
  onOpenPrivacy: () => void;
  activeContext: {
    voiceActive: boolean;
    cameraActive: boolean;
    screenShareActive: boolean;
    languageMode: "english" | "hinglish" | "hindi";
  };
  onToggleLanguage: (lang: "english" | "hinglish" | "hindi") => void;
}

export function Navbar({
  activeTab,
  onTabChange,
  selectedContract,
  onSelectSampleContract,
  onOpenUpload,
  onOpenPrivacy,
  activeContext,
  onToggleLanguage,
}: NavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#0a0f1d]/95 backdrop-blur border-b border-slate-800 text-slate-100">
      {/* Top Banner: Disclaimer & Fiduciary Transparency */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-amber-950/40 border-b border-slate-800/80 px-4 py-1.5 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            LEGAL AID & INFORMATION
          </span>
          <span className="hidden sm:inline">
            NyayaDrishti provides informational guidance under Indian law; not a substitute for formal advocate representation.
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <button 
            onClick={onOpenPrivacy}
            className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>🔒 Local-First (IndexedDB)</span>
          </button>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1">
            <Globe className="w-3 h-3 text-amber-400" />
            <select
              value={activeContext.languageMode}
              onChange={(e) => onToggleLanguage(e.target.value as any)}
              className="bg-slate-800 text-slate-200 text-xs rounded px-1.5 py-0.5 border border-slate-700 outline-none"
            >
              <option value="english">English</option>
              <option value="hinglish">Hinglish (हिंदी-English)</option>
              <option value="hindi">हिन्दी (Hindi)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Navbar Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Scale className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white">NyayaDrishti</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 font-medium border border-amber-500/30">
                न्याय दृष्टि
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Understand. Question. Prepare. Act.</p>
          </div>
        </div>

        {/* 5 Primary Workspace Sections */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onTabChange("document")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "document"
                ? "bg-amber-500 text-slate-950 shadow-md font-bold"
                : "text-slate-300 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            DOCUMENT
          </button>
          <button
            onClick={() => onTabChange("insights")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "insights"
                ? "bg-amber-500 text-slate-950 shadow-md font-bold"
                : "text-slate-300 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            INSIGHTS
          </button>
          <button
            onClick={() => onTabChange("ask")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === "ask"
                ? "bg-amber-500 text-slate-950 shadow-md font-bold"
                : "text-slate-300 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            ASK NYAYA
            {(activeContext.voiceActive || activeContext.cameraActive || activeContext.screenShareActive) && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>
          <button
            onClick={() => onTabChange("compare")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "compare"
                ? "bg-amber-500 text-slate-950 shadow-md font-bold"
                : "text-slate-300 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            COMPARE
          </button>
          <button
            onClick={() => onTabChange("prepare")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "prepare"
                ? "bg-amber-500 text-slate-950 shadow-md font-bold"
                : "text-slate-300 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            PREPARE
          </button>
        </nav>

        {/* Action Controls: Sample Switcher & Upload */}
        <div className="flex items-center gap-2">
          {/* Sample Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs bg-slate-900 border border-slate-700/80 rounded-lg hover:border-slate-600 transition-colors text-slate-200"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline max-w-[130px] truncate">
                {selectedContract ? selectedContract.title : "Select Contract"}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50">
                <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Sample Indian Contracts
                </div>
                {SAMPLE_CONTRACTS.map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => {
                      onSelectSampleContract(sc);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-800 transition-colors flex flex-col gap-0.5 ${
                      selectedContract?.id === sc.id ? "bg-amber-500/10 text-amber-300" : "text-slate-300"
                    }`}
                  >
                    <span className="font-semibold text-slate-100">{sc.title}</span>
                    <span className="text-[10px] text-slate-400">{sc.badge}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Upload Button */}
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-all shadow-sm"
          >
            <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Upload PDF</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800/80 bg-slate-900/90 py-1.5 px-2">
        <button
          onClick={() => onTabChange("document")}
          className={`text-[11px] font-medium px-2 py-1 rounded ${
            activeTab === "document" ? "text-amber-400 font-bold" : "text-slate-400"
          }`}
        >
          DOCUMENT
        </button>
        <button
          onClick={() => onTabChange("insights")}
          className={`text-[11px] font-medium px-2 py-1 rounded ${
            activeTab === "insights" ? "text-amber-400 font-bold" : "text-slate-400"
          }`}
        >
          INSIGHTS
        </button>
        <button
          onClick={() => onTabChange("ask")}
          className={`text-[11px] font-medium px-2 py-1 rounded flex items-center gap-1 ${
            activeTab === "ask" ? "text-amber-400 font-bold" : "text-slate-400"
          }`}
        >
          <Sparkles className="w-3 h-3 text-amber-400" />
          ASK NYAYA
        </button>
        <button
          onClick={() => onTabChange("compare")}
          className={`text-[11px] font-medium px-2 py-1 rounded ${
            activeTab === "compare" ? "text-amber-400 font-bold" : "text-slate-400"
          }`}
        >
          COMPARE
        </button>
        <button
          onClick={() => onTabChange("prepare")}
          className={`text-[11px] font-medium px-2 py-1 rounded ${
            activeTab === "prepare" ? "text-amber-400 font-bold" : "text-slate-400"
          }`}
        >
          PREPARE
        </button>
      </div>
    </header>
  );
}
