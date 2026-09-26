export interface ParsedClause {
  id: string;
  clauseNumber: string;
  title: string;
  text: string;
  attentionLevel:
    | "low"
    | "review_recommended"
    | "high_attention"
    | "legal_review_recommended";
  explanation: string;
  hinglishExplanation: string;
  whyItMatters: string;
  statutoryRef?: string;
  suggestedAlternative?: string;
  negotiationTips: string;
  questionsForLawyer: string[];
}

export interface ParsedDocumentResult {
  title: string;
  rawText: string;
  clauses: ParsedClause[];
  pageCount: number;
}

export async function parsePdfFile(file: File): Promise<ParsedDocumentResult> {
  const arrayBuffer = await file.arrayBuffer();

  // Dynamic import of pdfjs-dist to avoid SSR node-canvas errors
  const pdfjsLib = await import("pdfjs-dist");

  // Set worker source
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  }

  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const pageCount = pdf.numPages;

  let fullText = "";

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => (item.str || "") + (item.hasEOL ? "\n" : " "))
      .join("");
    fullText += `\n--- [Page ${i}] ---\n` + pageText;
  }

  await loadingTask.destroy();
  const clauses = segmentLegalClauses(fullText, file.name);

  return {
    title: file.name.replace(/\.[^/.]+$/, ""),
    rawText: fullText,
    clauses,
    pageCount,
  };
}

export function segmentLegalClauses(
  rawText: string,
  docTitle?: string,
): ParsedClause[] {
  // Regex to match numbered sections, e.g., "1. DURATION", "Clause 2:", "Section 3.", "ARTICLE IV"
  const lines = rawText.replace(/--- \[Page \d+\] ---/g, "").split(/\n+/);
  const clauses: ParsedClause[] = [];
  let currentTitle = "General Terms";
  let currentNumber = "Introduction";
  let currentBuffer: string[] = [];

  const flushClause = () => {
    if (currentBuffer.length > 0) {
      const text = currentBuffer.join(" ").trim();
      if (text.length > 0) {
        const audited = auditIndianLegalClause(
          currentTitle,
          text,
          currentNumber,
        );
        clauses.push(audited);
      }
      currentBuffer = [];
    }
  };

  const sectionRegex =
    /^([0-9०-९০-৯੦-੯૦-૯୦-୯௦-௯౦-౯೦-೯൦-൯٠-٩]+|Clause\s+\d+|Section\s+\d+|ARTICLE\s+[IVXLCDM]+)[\.\:\-\)]\s*(.*)$/i;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const match = trimmed.match(sectionRegex);
    if (match) {
      flushClause();
      currentNumber = match[1];
      currentTitle = match[2]
        ? match[2].match(/^([^:]{1,80}):/)?.[1] || match[2].slice(0, 65)
        : `Clause ${currentNumber}`;
      currentBuffer.push(trimmed);
    } else {
      currentBuffer.push(trimmed);
    }
  }

  flushClause();

  // If no numbered sections detected, create chunks
  if (clauses.length === 0 && rawText.trim().length > 0) {
    const paragraphs = rawText
      .split(/\n\s*\n/)
      .filter((p) => p.trim().length > 30);
    paragraphs.forEach((p, idx) => {
      clauses.push(
        auditIndianLegalClause(
          `Section ${idx + 1}`,
          p.trim(),
          `Part ${idx + 1}`,
        ),
      );
    });
  }

  return clauses;
}

function auditIndianLegalClause(
  title: string,
  text: string,
  clauseNum: string,
): ParsedClause {
  const legal =
    /non[- ]compete|restrain.{0,30}trade|sole arbitrator|unilateral.{0,30}arbitrat|प्रतिस्पर्धा.{0,20}प्रतिबंध|একক সালিস|واحد ثالث|ஒரே நடுவர்/i.test(
      text,
    );
  const high =
    /indemnif|unlimited|penalt|forfeit|deduct|security deposit|painting|waiv|intellectual property|personal data|जमानत|सुरक्षा जमा|दंड|जुर्माना|जामीन|आनামত|জামানত|জরিমানা|సెక్యూరిటీ డిపాజిట్|జరిమానా|வைப்புத்தொகை|அபராதம்|ضمانت|جرمانہ|ડિપોઝિટ|દંડ|ಠೇವಣಿ|ದಂಡ|നിക്ഷേപം|പിഴ|ଜମା|ଜରିମାନା|ਜ਼ਮਾਨਤ|ਜੁਰਮਾਨਾ|धरौटी|क्षतिपूर्ति/i.test(
      text,
    );
  const review =
    /terminat|notice|renew|payment|\brent\b|maintenance|confidential|jurisdiction|liabilit|समाप्ति|किराया|भुगतान|नोटिस|भाडे|নোটিশ|ভাড়া|সমাপ্তি|అద్దె|నోటీసు|வாடகை|அறிவிப்பு|کرایہ|نوٹس|ભાડું|નોટિસ|ಬಾಡಿಗೆ|ನೋಟಿಸ್|വാടക|നോട്ടീസ്|ଭଡ଼ା|ନୋଟିସ|ਕਿਰਾਇਆ|ਨੋਟਿਸ|ভাৰা|सूचना|भुक्तानी/i.test(
      text,
    );
  return {
    id: `cl-${clauseNum}-${text.length}-${Array.from(text).reduce((hash, c) => (hash * 31 + c.charCodeAt(0)) | 0, 0)}`,
    clauseNumber: clauseNum,
    title,
    text,
    attentionLevel: legal
      ? "legal_review_recommended"
      : high
        ? "high_attention"
        : review
          ? "review_recommended"
          : "low",
    explanation: "",
    hinglishExplanation: "",
    whyItMatters: "",
    negotiationTips: "",
    questionsForLawyer: [],
  };
}
