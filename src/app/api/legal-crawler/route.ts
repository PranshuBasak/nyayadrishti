import { NextRequest, NextResponse } from "next/server";
import { POST as generate } from "../gemini/route";
export interface CrawledLegalSource {
  id: string;
  sourceName: string;
  sourceUrl: string;
  title: string;
  documentType: string;
  jurisdiction: string;
  publicationDate: string;
  retrievedAt: string;
  relevantExcerpt: string;
}
export async function GET(req: NextRequest) {
  const query = new URL(req.url).searchParams.get("q")?.trim();
  if (!query || query.length > 2000)
    return NextResponse.json({ error: "INVALID_QUERY" }, { status: 400 });
  const response = await generate(
    new NextRequest(new URL("/api/gemini", req.url), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt:
          "Search current Indian primary official legal sources for this query. Distinguish jurisdiction and cite sources. Query: " +
          query,
        research: true,
      }),
    }),
  );
  const data = await response.json();
  if (!response.ok) return NextResponse.json(data, { status: response.status });
  const results: CrawledLegalSource[] = (data.sources || []).map(
    (s: { title: string; url: string }, i: number) => ({
      id: "source-" + i,
      sourceName: s.title,
      sourceUrl: s.url,
      title: s.title,
      documentType: "Search result",
      jurisdiction: "Check source applicability",
      publicationDate: "Not supplied by source",
      retrievedAt: new Date().toISOString(),
      relevantExcerpt: "",
    }),
  );
  return NextResponse.json({
    query,
    results,
    count: results.length,
    summary: data.text,
  });
}
