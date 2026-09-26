import { runAI } from "@/lib/workspace";
import { Language } from "@/lib/languages";
export interface LegalAIResponse {
  text: string;
  source: string;
  modelUsed?: string;
  citations?: {
    clauseId?: string;
    clauseNumber?: string;
    actName?: string;
    section?: string;
  }[];
}
export async function askNyayaText(
  prompt: string,
  context?: {
    activeDocTitle?: string;
    activeClauseText?: string;
    conversationHistory?: { role: string; content: string }[];
    crawledLegalContext?: string;
    languageMode?: Language | "english" | "hindi" | "hinglish";
  },
): Promise<LegalAIResponse> {
  const preference = context?.languageMode;
  const language: Language =
    preference === "hindi"
      ? "hi"
      : preference === "english" || preference === "hinglish" || !preference
        ? "en"
        : preference;
  const result = await runAI(
    JSON.stringify({
      document: context?.activeDocTitle,
      clause: context?.activeClauseText,
      history: context?.conversationHistory?.slice(-12),
      research: context?.crawledLegalContext,
    }) +
      "\n" +
      (preference === "hinglish"
        ? "Use conversational Hindi in Roman script.\n"
        : "") +
      "User question: " +
      prompt,
    language,
  );
  return { text: result.text, source: "gemini-api" };
}
export async function generateCounterClause(
  originalClause: string,
  clauseTitle: string,
  docType: string,
): Promise<{ counterClause: string; rationale: string }> {
  const result = await runAI(
    "Propose balanced alternative wording for professional review. Return JSON with string fields counterClause and rationale. Do not invent statutory obligations. Document type: " +
      docType +
      "; Title: " +
      clauseTitle +
      "; Clause: " +
      originalClause,
    "en",
    { json: true },
  );
  const data = JSON.parse(result.text);
  if (
    typeof data.counterClause !== "string" ||
    typeof data.rationale !== "string"
  )
    throw Error("AI_INCOMPLETE");
  return data;
}
