import { runAI } from "@/lib/workspace";
import { Language } from "@/lib/languages";
export interface VisionAnalysisResult {
  text: string;
  source: string;
  detectedTextSnippet?: string;
  identifiedDocumentType?: string;
}
export async function analyzeDocumentImage(
  imageBase64: string,
  userQuestion = "Read the visible document text and identify dates, amounts, parties and explicit deadlines.",
  contextDocTitle?: string,
  language: Language = "en",
): Promise<VisionAnalysisResult> {
  const result = await runAI(
    "Read only information actually visible in the image. State uncertainty about illegible text. Do not invent deadlines. Context document: " +
      (contextDocTitle || "None") +
      "\nQuestion: " +
      userQuestion,
    language,
    {
      imageBase64,
      mimeType: imageBase64.match(/^data:([^;]+)/)?.[1] || "image/jpeg",
    },
  );
  return { text: result.text, source: "gemini-api" };
}
