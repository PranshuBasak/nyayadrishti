import { Language } from "../languages";
// Sanskrit is available for text, but is absent from the documented Live speech list.
export const supportsLiveSpeech = (language: Language) => language !== "sa";
export const LIVE_SECONDS = 300;
export function liveContext(
  title: string,
  clause: string,
  document: string,
  history: string,
  research: string,
) {
  return [
    "DOCUMENT: " + title.slice(0, 300),
    "SELECTED CLAUSE: " + clause.slice(0, 5000),
    "RECENT CONVERSATION: " + history.slice(-6000),
    "RETRIEVED RESEARCH: " + research.slice(0, 3000),
    "DOCUMENT EXCERPT: " + document.slice(0, 9000),
  ]
    .join("\n")
    .slice(0, 24000);
}
