import { ParsedClause } from "../pdfParser";
import { CrawledLegalSource } from "@/app/api/legal-crawler/route";

export interface ActiveLegalContext {
  docId?: string;
  docTitle?: string;
  docType?: string;
  selectedClause?: ParsedClause | null;
  crawledSources: CrawledLegalSource[];
  languageMode: "english" | "hinglish" | "hindi";
  cameraActive: boolean;
  screenShareActive: boolean;
  voiceActive: boolean;
  recentCameraSnapshot?: string | null; // base64
}

export class ContextOrchestrator {
  private static instance: ContextOrchestrator;
  private currentContext: ActiveLegalContext = {
    crawledSources: [],
    languageMode: "english",
    cameraActive: false,
    screenShareActive: false,
    voiceActive: false,
    recentCameraSnapshot: null,
  };

  private listeners: ((ctx: ActiveLegalContext) => void)[] = [];

  private constructor() {}

  public static getInstance(): ContextOrchestrator {
    if (!ContextOrchestrator.instance) {
      ContextOrchestrator.instance = new ContextOrchestrator();
    }
    return ContextOrchestrator.instance;
  }

  public getContext(): ActiveLegalContext {
    return { ...this.currentContext };
  }

  public updateContext(partial: Partial<ActiveLegalContext>) {
    this.currentContext = { ...this.currentContext, ...partial };
    this.notify();
  }

  public subscribe(fn: (ctx: ActiveLegalContext) => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      listener(this.currentContext);
    }
  }

  public buildPromptContext(userQuestion: string): {
    systemContextString: string;
    imageBase64?: string;
  } {
    const ctx = this.currentContext;
    let parts: string[] = [];

    if (ctx.docTitle) {
      parts.push(`Current Document: "${ctx.docTitle}" (${ctx.docType || "Legal Contract"})`);
    }

    if (ctx.selectedClause) {
      parts.push(
        `Selected Clause: [${ctx.selectedClause.clauseNumber}: ${ctx.selectedClause.title}]\n"${ctx.selectedClause.text}"\nAttention Level: ${ctx.selectedClause.attentionLevel}\nStatutory Reference: ${ctx.selectedClause.statutoryRef || "None"}`
      );
    }

    if (ctx.crawledSources.length > 0) {
      const sourcesText = ctx.crawledSources
        .slice(0, 3)
        .map(
          (s) =>
            `- [${s.sourceName}] ${s.title}: "${s.relevantExcerpt.slice(0, 180)}..."`
        )
        .join("\n");
      parts.push(`Relevant Official Indian Legal Sources:\n${sourcesText}`);
    }

    parts.push(`User Preferred Language Mode: ${ctx.languageMode.toUpperCase()}`);

    return {
      systemContextString: parts.join("\n\n"),
      imageBase64: ctx.recentCameraSnapshot || undefined,
    };
  }
}
