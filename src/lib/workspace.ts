import { ParsedClause, segmentLegalClauses, parsePdfFile } from "./pdfParser";
import { languageName, Language } from "./languages";
export interface Agreement {
  id: string;
  title: string;
  rawText: string;
  clauses: ParsedClause[];
  type: string;
  parsedAt: number;
}
export interface Source {
  title: string;
  url: string;
}
export interface AIResult {
  text: string;
  sources: Source[];
  modelUsed?: string;
}
export interface CaseData {
  issueType: string;
  party: string;
  date: string;
  amount: string;
  summary: string;
  previousContact: string;
  evidence: string;
  checked: string[];
  timeline: { id: string; date: string; event: string }[];
  draft: string;
}
export const emptyCase: CaseData = {
  issueType: "",
  party: "",
  date: "",
  amount: "",
  summary: "",
  previousContact: "",
  evidence: "",
  checked: [],
  timeline: [],
  draft: "",
};
export async function runAI(
  prompt: string,
  language: Language,
  options: {
    imageBase64?: string;
    mimeType?: string;
    research?: boolean;
    json?: boolean;
    signal?: AbortSignal;
  } = {},
): Promise<AIResult> {
  const { signal, ...body } = options;
  const response = await fetch("/api/gemini", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/x-ndjson",
    },
    signal: signal || AbortSignal.timeout(65000),
    body: JSON.stringify({
      prompt,
      ...body,
      systemInstruction: `Respond entirely in ${languageName(language)} using its native script, including headings. Preserve names, amounts, dates and original quotations accurately. Use concise readable paragraphs. Never claim to have verified a source unless it was actually retrieved. If context is incomplete, say so.`,
    }),
  });
  let data;
  if (
    response.ok &&
    response.headers.get("content-type")?.includes("application/x-ndjson")
  ) {
    const reader = response.body!.getReader(),
      decoder = new TextDecoder();
    let pending = "";
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        pending += decoder.decode(value, { stream: true });
        let boundary;
        while ((boundary = pending.indexOf("\n")) >= 0) {
          const line = pending.slice(0, boundary);
          pending = pending.slice(boundary + 1);
          if (!line) continue;
          const event = JSON.parse(line);
          if (event.type === "retry")
            window.dispatchEvent(new Event("nyaya-ai-retry"));
          if (event.type === "error") throw new Error(event.error);
          if (event.type === "result") data = event;
        }
      }
    } finally {
      reader.releaseLock();
    }
  } else data = await response.json();
  if (!response.ok || !data?.text)
    throw new Error(data?.error || "AI_UNAVAILABLE");
  return {
    text: data.text,
    modelUsed: data.modelUsed,
    sources: (data.sources || []).filter((s: Source) =>
      /^https:\/\//.test(s.url),
    ),
  };
}
export function makeAgreement(title: string, rawText: string): Agreement {
  if (!rawText.trim()) throw Error("emptyDocument");
  return {
    id: crypto.randomUUID(),
    title: title.trim() || "Untitled agreement",
    rawText,
    clauses: segmentLegalClauses(rawText),
    type: "user",
    parsedAt: Date.now(),
  };
}
export async function readAgreement(file: File): Promise<Agreement> {
  if (file.size > 10 * 1024 * 1024 || !/\.(pdf|txt)$/i.test(file.name))
    throw Error("invalidFile");
  const text = /\.pdf$/i.test(file.name)
    ? (await parsePdfFile(file)).rawText
    : await file.text();
  if (!text.replace(/--- \[Page \d+\] ---/g, "").trim())
    throw Error("emptyDocument");
  return makeAgreement(file.name.replace(/\.[^.]+$/, ""), text);
}
export function compareText(a: string, b: string) {
  const lines = (s: string) =>
    s
      .split(/\n+/)
      .map((l) => l.trim())
      .filter(Boolean);
  const left = lines(a),
    right = lines(b),
    used = new Set<number>();
  const result: {
    before: string;
    after: string;
    status: "changed" | "added" | "removed" | "unchanged";
  }[] = [];
  for (const before of left) {
    let index = right.findIndex((v, i) => !used.has(i) && v === before);
    if (index >= 0) {
      used.add(index);
      result.push({ before, after: right[index], status: "unchanged" });
      continue;
    }
    const number = before.match(/^(?:Clause\s+)?(\d+)[.):]/i)?.[1];
    index = number
      ? right.findIndex(
          (v, i) =>
            !used.has(i) &&
            v.match(/^(?:Clause\s+)?(\d+)[.):]/i)?.[1] === number,
        )
      : -1;
    if (index >= 0) {
      used.add(index);
      result.push({ before, after: right[index], status: "changed" });
    } else result.push({ before, after: "", status: "removed" });
  }
  right.forEach((after, i) => {
    if (!used.has(i)) result.push({ before: "", after, status: "added" });
  });
  return result;
}
export function downloadText(
  name: string,
  text: string,
  type = "text/plain;charset=utf-8",
) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
export const escapeHtml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
