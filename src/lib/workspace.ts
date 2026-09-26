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
    headers: { "Content-Type": "application/json" },
    signal: signal || AbortSignal.timeout(65000),
    body: JSON.stringify({
      prompt,
      ...body,
      systemInstruction: `Respond entirely in ${languageName(language)} using its native script, including headings. Preserve names, amounts, dates and original quotations accurately. Use concise readable paragraphs. Never claim to have verified a source unless it was actually retrieved. If context is incomplete, say so.`,
    }),
  });
  const data = await response.json();
  if (!response.ok || !data.text)
    throw new Error(data.error || "AI_UNAVAILABLE");
  return {
    text: data.text,
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
