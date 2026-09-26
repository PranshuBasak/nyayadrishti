import { generate, models, validateInput } from "@/lib/server/gemini";
import { ApiError, guard, readJson, errorResponse } from "@/lib/server/guard";
import { credentials, orderedCredentials } from "@/lib/server/credentials";
export const maxDuration = 60;
export async function GET() {
  return Response.json(
    {
      configured: credentials().length > 0,
      model: models()[0],
      models: models(),
      liveModel: process.env.GEMINI_LIVE_MODEL || "gemini-3.8-live",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
export async function POST(req: Request) {
  let release: (() => void) | undefined;
  try {
    release = guard(req, "generate");
    const input = validateInput(await readJson(req, 14300000)),
      key = orderedCredentials();
    if (!key.length) throw new ApiError("AI_NOT_CONFIGURED", 503);
    const signal = AbortSignal.any([req.signal, AbortSignal.timeout(59000)]);
    if (!req.headers.get("accept")?.includes("application/x-ndjson")) {
      try {
        return Response.json(await generate(input, key, signal), {
          headers: { "Cache-Control": "no-store" },
        });
      } finally {
        release();
      }
    }
    const free = release,
      encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const emit = (event: unknown) => {
          if (!signal.aborted) {
            try {
              controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
            } catch {}
          }
        };
        try {
          emit({ type: "started" });
          const result = await generate(input, key, signal, () =>
            emit({ type: "retry" }),
          );
          emit({ type: "result", ...result });
        } catch (error) {
          const e =
            error instanceof ApiError
              ? error
              : new ApiError("AI_UNAVAILABLE", 502);
          try {
            controller.enqueue(
              encoder.encode(
                JSON.stringify({
                  type: "error",
                  error: e.code,
                  retryAfter: e.retryAfter,
                }) + "\n",
              ),
            );
          } catch {}
        } finally {
          free();
          try {
            controller.close();
          } catch {}
        }
      },
    });
    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    release?.();
    return errorResponse(error);
  }
}
