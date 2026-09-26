"use client";

import React, { useState, useEffect } from "react";
import { Search, Globe, Scale, ExternalLink, ShieldCheck, Bookmark, RefreshCw } from "lucide-react";
import { CrawledLegalSource } from "@/app/api/legal-crawler/route";
import { INDIAN_GOV_PORTALS } from "@/data/indianLegalPlaybook";

interface LegalResearchPanelProps {
  initialQuery?: string;
  onSelectSource?: (source: CrawledLegalSource) => void;
}

export function LegalResearchPanel({ initialQuery = "Consumer Protection Act Section 2(46)", onSelectSource }: LegalResearchPanelProps) {
  const [query, setQuery] = useState(initialQuery);
  const [sources, setSources] = useState<CrawledLegalSource[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLegalSources = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/legal-crawler?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setSources(data.results || []);
      }
    } catch (err) {
      console.error("Legal crawler error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLegalSources(query);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) fetchLegalSources(query);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-amber-400" />
            Live Indian Legal Research & Portal Navigator
          </h2>
          <p className="text-xs text-slate-400">
            Real-time crawler and primary source adapter for India Code, e-Daakhil, and Ministry portals
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Indian Acts & Sections..."
              className="bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500 w-64"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-colors shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </form>
      </div>

      {/* Official Government Portals Cards */}
      <div>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
          Official Redressal Portals & Central Helplines
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {INDIAN_GOV_PORTALS.map((portal, idx) => (
            <div
              key={idx}
              className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-3 flex flex-col justify-between hover:border-slate-600 transition-colors"
            >
              <div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold mb-1.5 inline-block">
                  {portal.badge}
                </span>
                <h4 className="text-xs font-bold text-slate-200 leading-snug">{portal.portalName}</h4>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{portal.description}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                <span className="text-emerald-400 font-medium">{portal.helpline}</span>
                <a
                  href={portal.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-400 hover:text-amber-300 flex items-center gap-0.5 font-semibold"
                >
                  Visit <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Retrieved Primary Sources */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Primary Statutory Provisions Retrieved ({sources.length})</span>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Auditable Citations
          </span>
        </div>

        {sources.length > 0 ? (
          <div className="space-y-3">
            {sources.map((s) => (
              <div
                key={s.id}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider block">
                      {s.sourceName} • {s.documentType}
                    </span>
                    <h3 className="text-xs font-bold text-slate-200">{s.title}</h3>
                  </div>
                  <a
                    href={s.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 shrink-0 self-start sm:self-auto"
                  >
                    View Official Gazetted Text <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <p className="text-xs text-slate-300 font-serif leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                  "{s.relevantExcerpt}"
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                  <span>Jurisdiction: {s.jurisdiction}</span>
                  <span>Retrieved: {new Date(s.retrievedAt).toLocaleDateString("en-IN")}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500 border border-slate-800 rounded-xl">
            {isLoading ? "Querying India Code & Consumer Affairs databases..." : "No matching sources found."}
          </div>
        )}
      </div>
    </div>
  );
}
