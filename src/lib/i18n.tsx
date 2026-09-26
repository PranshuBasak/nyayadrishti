"use client";
import React, { createContext, useContext } from "react";
import en from "@/locales/en.json";
import hi from "@/locales/hi.json";
import bn from "@/locales/bn.json";
import te from "@/locales/te.json";
import mr from "@/locales/mr.json";
import ta from "@/locales/ta.json";
import ur from "@/locales/ur.json";
import gu from "@/locales/gu.json";
import kn from "@/locales/kn.json";
import ml from "@/locales/ml.json";
import or from "@/locales/or.json";
import pa from "@/locales/pa.json";
import as from "@/locales/as.json";
import ne from "@/locales/ne.json";
import sa from "@/locales/sa.json";
import { Language } from "./languages";
export type Key = keyof typeof en;
export const dictionaries: Record<Language, Record<Key, string>> = {
  en,
  hi,
  bn,
  te,
  mr,
  ta,
  ur,
  gu,
  kn,
  ml,
  or,
  pa,
  as,
  ne,
  sa,
};
export const LocaleContext = createContext<Language>("en");
export function useLocale() {
  const language = useContext(LocaleContext);
  const t = (key: Key) => dictionaries[language][key];
  const aiError = (error: unknown) => {
    const code = error instanceof Error ? error.message : "";
    return t(
      code === "AI_RATE_LIMIT" || code === "AI_BUSY"
        ? "quotaLimit"
        : code === "AI_AUTH_ERROR" || code === "AI_NOT_CONFIGURED"
          ? "aiAuthError"
          : code.startsWith("AI_GROUNDING")
            ? "groundingUnavailable"
            : code === "AI_SAFETY"
              ? "aiSafety"
              : "aiError",
    );
  };
  return { language, t, aiError };
}
