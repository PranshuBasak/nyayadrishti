"use client";
import React, { useEffect, useState } from "react";
import {
  Scale,
  FileText,
  ChartNoAxesCombined,
  MessageSquare,
  ArrowLeftRight,
  ClipboardList,
  Search,
  ShieldCheck,
  Plus,
  Globe,
  ArrowUpRight,
  Check,
  Menu,
} from "lucide-react";
import { SAMPLE_CONTRACTS } from "@/data/sampleContracts";
import { segmentLegalClauses, ParsedClause } from "@/lib/pdfParser";
import {
  getAllDocuments,
  saveDocument,
  clearAllLocalData,
  readWorkspace,
  writeWorkspace,
} from "@/lib/db";
import { Agreement, CaseData, emptyCase, AIResult } from "@/lib/workspace";
import { languages, Language } from "@/lib/languages";
import { LocaleContext, useLocale } from "@/lib/i18n";
import { Modal } from "@/components/workspace/Common";
import { DocumentPanel, UploadForm } from "@/components/workspace/Documents";
import { Companion } from "@/components/workspace/Companion";
import { Compare } from "@/components/workspace/Compare";
import { Prepare } from "@/components/workspace/Prepare";
import { Research } from "@/components/workspace/Research";

const samples: Agreement[] = SAMPLE_CONTRACTS.map((s) => ({
  ...s,
  type: "sample",
  parsedAt: 0,
  clauses: segmentLegalClauses(s.rawText),
}));
const tabs = [
  ["document", FileText],
  ["insights", ChartNoAxesCombined],
  ["ask", MessageSquare],
  ["compare", ArrowLeftRight],
  ["prepare", ClipboardList],
  ["research", Search],
] as const;
type Tab = (typeof tabs)[number][0];
export default function Home() {
  const [language, setLanguage] = useState<Language>("en");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("nyaya-language");
      if (languages.some((l) => l.code === saved))
        setLanguage(saved as Language);
    } catch {}
  }, []);
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ur" ? "rtl" : "ltr";
  }, [language]);
  return (
    <LocaleContext.Provider value={language}>
      <Workspace
        setLanguage={(l) => {
          setLanguage(l);
          try {
            localStorage.setItem("nyaya-language", l);
          } catch {}
        }}
      />
    </LocaleContext.Provider>
  );
}
function Workspace({ setLanguage }: { setLanguage: (l: Language) => void }) {
  const { t, language } = useLocale();
  const [tab, setTab] = useState<Tab>("document");
  const [documents, setDocuments] = useState<Agreement[]>(samples);
  const [activeId, setActiveId] = useState(samples[0].id);
  const [selected, setSelected] = useState<ParsedClause | null>(
    samples[0].clauses[0],
  );
  const [modal, setModal] = useState<"upload" | "privacy" | null>(null);
  const [mobile, setMobile] = useState(false);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [caseData, setCaseData] = useState<CaseData>(emptyCase);
  const [caseLoaded, setCaseLoaded] = useState(false);
  const [aiConfigured, setAiConfigured] = useState(false);
  const [research, setResearch] = useState<AIResult | null>(null);
  const doc = documents.find((d) => d.id === activeId) || documents[0];
  useEffect(() => {
    let live = true;
    async function load() {
      try {
        const stored = (await getAllDocuments())
          .filter((d) => d.type !== "sample")
          .map((d) => ({ ...d, clauses: segmentLegalClauses(d.rawText) }));
        const all = [...samples, ...stored];
        const last = await readWorkspace<string>("activeDocument");
        if (live) {
          setDocuments(all);
          const d = all.find((d) => d.id === last) || all[0];
          setActiveId(d.id);
          setSelected(d.clauses[0] || null);
        }
      } catch {
        setStorageError(true);
      } finally {
        if (live) setReady(true);
      }
    }
    void load();
    fetch("/api/gemini")
      .then((r) => r.json())
      .then((d) => setAiConfigured(d.configured))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);
  useEffect(() => {
    if (!ready) return;
    let live = true;
    setCaseLoaded(false);
    readWorkspace<CaseData>("case:" + activeId)
      .then((d) => {
        if (live) {
          setCaseData({ ...emptyCase, ...d });
          setCaseLoaded(true);
        }
      })
      .catch(() => setStorageError(true));
    return () => {
      live = false;
    };
  }, [activeId, ready]);
  useEffect(() => {
    if (!caseLoaded) return;
    const timer = setTimeout(() => {
      writeWorkspace("case:" + activeId, caseData).catch(() =>
        setStorageError(true),
      );
    }, 250);
    return () => clearTimeout(timer);
  }, [caseData, caseLoaded, activeId]);
  async function choose(id: string) {
    if (id === activeId) return;
    const d = documents.find((d) => d.id === id);
    if (!d) return;
    if (caseLoaded)
      await writeWorkspace("case:" + activeId, caseData).catch(() =>
        setStorageError(true),
      );
    setCaseLoaded(false);
    setCaseData(emptyCase);
    setActiveId(id);
    setSelected(d.clauses[0] || null);
    setResearch(null);
    await writeWorkspace("activeDocument", id).catch(() =>
      setStorageError(true),
    );
  }
  async function add(d: Agreement) {
    if (caseLoaded) await writeWorkspace("case:" + activeId, caseData);
    await saveDocument(d);
    setDocuments((prev) => [...prev, d]);
    setCaseLoaded(false);
    setCaseData(emptyCase);
    setActiveId(d.id);
    setSelected(d.clauses[0] || null);
    setTab("document");
    await writeWorkspace("activeDocument", d.id);
  }
  async function clear() {
    if (!window.confirm(t("confirmClear"))) return;
    setCaseLoaded(false);
    await clearAllLocalData();
    localStorage.removeItem("nyaya-language");
    setDocuments(samples);
    setActiveId(samples[0].id);
    setSelected(samples[0].clauses[0]);
    setCaseLoaded(true);
    setCaseData(emptyCase);
    setResearch(null);
    setTab("document");
    setModal(null);
    setLanguage("en");
  }
  return (
    <div className="app-shell">
      <a href="#workspace-content" className="skip-link">
        {t("workspace")}
      </a>
      <aside className={"sidebar " + (mobile ? "open" : "")}>
        <a className="brand" href="/" aria-label="NyayaDrishti">
          <span className="brand-icon">
            <Scale size={25} />
          </span>
          <div>
            <strong>
              NyayaDrishti<span>न्याय दृष्टि</span>
            </strong>
            <small>{t("tagline")}</small>
          </div>
        </a>
        <span className="nav-label">{t("workspace")}</span>
        <nav aria-label={t("workspace")}>
          {tabs.map(([id, Icon]) => (
            <button
              key={id}
              aria-current={tab === id ? "page" : undefined}
              className={"nav-item " + (tab === id ? "active" : "")}
              onClick={() => {
                setTab(id);
                setMobile(false);
              }}
            >
              <Icon size={19} />
              <span>{t(id)}</span>
              {tab === id && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="local-card">
            <ShieldCheck size={23} />
            <strong>{t("local")}</strong>
            <p>{t("localHint")}</p>
          </div>
          <button className="nav-item" onClick={() => setModal("privacy")}>
            <ShieldCheck size={18} />
            {t("privacy")}
          </button>
          <small className="sidebar-disclaimer">{t("disclaimer")}</small>
        </div>
      </aside>
      <div className="workspace-main">
        <header className="topbar">
          <div className="breadcrumbs">
            <button
              className="icon-button mobile-menu"
              aria-label={t("workspace")}
              onClick={() => setMobile(!mobile)}
            >
              <Menu size={22} />
            </button>
            <span>NyayaDrishti</span>
            <span className="slash">/</span>
            <strong>{t(tab)}</strong>
          </div>
          <div className="topbar-actions">
            <span className="provider-status">
              <span className={"status-dot " + (!aiConfigured ? "off" : "")} />
              {t(aiConfigured ? "aiReady" : "aiNotReady")}
            </span>
            <label className="language-picker">
              <Globe size={16} />
              <select
                aria-label={t("language")}
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.native} · {l.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </header>
        <main id="workspace-content">
          <div className="page-heading">
            <div>
              <span className="eyebrow">{t("start")}</span>
              <h1>{tab === "document" ? t("welcome") : t(tab)}</h1>
              <p>{tab === "document" ? t("welcomeHint") : t("tagline")}</p>
            </div>
            <button
              className="button primary upload-button"
              onClick={() => setModal("upload")}
            >
              <Plus size={19} />
              {t("upload")}
            </button>
          </div>
          <div className="document-switcher">
            <FileText size={18} />
            <label htmlFor="active-document">{t("context")}</label>
            <select
              id="active-document"
              value={doc.id}
              onChange={(e) => void choose(e.target.value)}
            >
              <optgroup label={t("sample")}>
                {documents
                  .filter((d) => d.type === "sample")
                  .map((d) => (
                    <option value={d.id} key={d.id}>
                      {d.title}
                    </option>
                  ))}
              </optgroup>
              {documents.some((d) => d.type !== "sample") && (
                <optgroup label={t("saved")}>
                  {documents
                    .filter((d) => d.type !== "sample")
                    .map((d) => (
                      <option value={d.id} key={d.id}>
                        {d.title}
                      </option>
                    ))}
                </optgroup>
              )}
            </select>
            <span className="saved-indicator">
              <Check size={14} />
              {t("local")}
            </span>
          </div>
          {storageError && (
            <p className="error" role="alert">
              {t("storageError")}
            </p>
          )}
          <div
            className="workspace-panel"
            key={doc.id + ":" + language + ":" + tab}
          >
            {(tab === "document" || tab === "insights") && (
              <DocumentPanel
                doc={doc}
                selected={selected}
                onSelect={setSelected}
                onAsk={() => setTab("ask")}
                insights={tab === "insights"}
              />
            )}
            {tab === "ask" && (
              <Companion doc={doc} selected={selected} research={research} />
            )}
            {tab === "compare" && <Compare doc={doc} documents={documents} />}
            {tab === "prepare" &&
              (caseLoaded ? (
                <Prepare
                  doc={doc}
                  data={caseData}
                  onChange={setCaseData}
                  onSave={() => writeWorkspace("case:" + doc.id, caseData)}
                />
              ) : (
                <p role="status">{t("working")}</p>
              ))}
            {tab === "research" && <Research onResult={setResearch} />}
          </div>
          <footer>
            <Scale size={15} />
            {t("disclaimer")}
            <span>NyayaDrishti</span>
          </footer>
        </main>
      </div>
      {modal === "upload" && (
        <Modal title={t("upload")} onClose={() => setModal(null)}>
          <UploadForm onAdd={add} onCancel={() => setModal(null)} />
        </Modal>
      )}
      {modal === "privacy" && (
        <Modal title={t("privacyTitle")} onClose={() => setModal(null)}>
          <div className="stack">
            <span className="icon-tile">
              <ShieldCheck size={26} />
            </span>
            <p>{t("privacyDetail")}</p>
            <button
              className="button danger"
              onClick={() => clear().catch(() => setStorageError(true))}
            >
              {t("clear")}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
