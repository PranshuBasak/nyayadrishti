/** Best-effort per-instance controls; provider quotas remain authoritative. */
const windows = new Map<string, { count: number; reset: number }>();
let inFlight = 0;
export class ApiError extends Error {
  constructor(
    public code: string,
    public status = 400,
    public retryAfter?: number,
  ) {
    super(code);
  }
}
export function guard(req: Request, kind: "generate" | "live") {
  const expected = process.env.APP_ORIGIN || new URL(req.url).origin;
  if (
    req.headers.get("origin") !== expected ||
    req.headers.get("sec-fetch-site") === "cross-site"
  )
    throw new ApiError("INVALID_ORIGIN", 403);
  if (!req.headers.get("content-type")?.startsWith("application/json"))
    throw new ApiError("INVALID_REQUEST", 415);
  const ip = process.env.VERCEL
    ? req.headers.get("x-vercel-forwarded-for")
    : process.env.SITES_RUNTIME
      ? req.headers.get("cf-connecting-ip")
      : "local";
  const id = kind + ":" + (ip || "unknown"),
    now = Date.now();
  for (const [key, value] of Array.from(windows.entries()))
    if (value.reset <= now) windows.delete(key);
  const value = windows.get(id) || { count: 0, reset: now + 60000 };
  if (value.count >= (kind === "live" ? 2 : 5))
    throw new ApiError(
      "AI_RATE_LIMIT",
      429,
      Math.ceil((value.reset - now) / 1000),
    );
  if (windows.size >= 10000 && !windows.has(id))
    throw new ApiError("AI_RATE_LIMIT", 429, 60);
  value.count++;
  windows.set(id, value);
  if (inFlight >= 2) throw new ApiError("AI_BUSY", 429, 5);
  inFlight++;
  let released = false;
  return () => {
    if (!released) {
      released = true;
      inFlight--;
    }
  };
}
export async function readJson(
  req: Request,
  limit: number,
): Promise<Record<string, unknown>> {
  if (Number(req.headers.get("content-length")) > limit)
    throw new ApiError("REQUEST_TOO_LARGE", 413);
  const reader = req.body?.getReader();
  if (!reader) throw new ApiError("INVALID_REQUEST");
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > limit) {
        await reader.cancel();
        throw new ApiError("REQUEST_TOO_LARGE", 413);
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
    const data = JSON.parse(new TextDecoder().decode(bytes));
    if (!data || typeof data !== "object" || Array.isArray(data))
      throw new Error();
    return data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("INVALID_REQUEST");
  }
}
export function errorResponse(error: unknown) {
  const e =
    error instanceof ApiError ? error : new ApiError("AI_UNAVAILABLE", 502);
  return Response.json(
    { error: e.code, retryAfter: e.retryAfter },
    {
      status: e.status,
      headers: {
        "Cache-Control": "no-store",
        ...(e.retryAfter ? { "Retry-After": String(e.retryAfter) } : {}),
      },
    },
  );
}
