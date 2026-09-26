import { runAI } from "@/lib/workspace";
import { Language } from "@/lib/languages";
export type TranslationLevel =
  | Language
  | "plain"
  | "simple"
  | "hinglish"
  | "hindi";
export async function translateLegalClause(
  clauseText: string,
  level: TranslationLevel,
): Promise<string> {
  const language: Language =
    level === "hindi"
      ? "hi"
      : ["plain", "simple", "hinglish"].includes(level)
        ? "en"
        : (level as Language);
  const instruction =
    level === "hinglish"
      ? "Explain in conversational Hindi written in Roman script."
      : level === "simple" || level === "plain"
        ? "Explain in plain, accessible English."
        : "Translate faithfully into the requested language.";
  return (
    await runAI(
      instruction +
        " Preserve names, dates, negations, amounts and conditions. Do not add legal claims. Text:\n" +
        clauseText,
      language,
    )
  ).text;
}
