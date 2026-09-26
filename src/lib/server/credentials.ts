import { createHash } from "node:crypto";
let cursor = 0;
export function credentials() {
  return Array.from(
    new Set(
      [
        "GEMINI_API_KEY",
        "GEMINI_API_KEY2",
        "GEMINI_API_KEY3",
        "GEMINI_API_KEY4",
        "GEMINI_API_KEY5",
      ]
        .map((name) => process.env[name]?.trim())
        .filter((key): key is string => Boolean(key)),
    ),
  );
}
export function orderedCredentials() {
  const keys = credentials();
  const start = cursor++ % Math.max(1, keys.length);
  return keys.slice(start).concat(keys.slice(0, start));
}
export function credentialId(key: string) {
  return createHash("sha256").update(key).digest("hex").slice(0, 16);
}
