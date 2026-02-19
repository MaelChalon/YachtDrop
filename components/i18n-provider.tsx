"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Lang, supportedLangs, translate } from "@/lib/i18n";

const STORAGE_KEY = "yachtdrop.lang";

type I18nContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function detectLang(): Lang {
  if (typeof navigator === "undefined") {
    return "fr";
  }
  const raw = navigator.language?.toLowerCase() || "fr";
  const prefix = raw.split("-")[0] as Lang;
  return supportedLangs.includes(prefix) ? prefix : "fr";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("fr");

  useEffect(() => {
    const stored = typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored && supportedLangs.includes(stored as Lang)) {
      setLang(stored as Lang);
      return;
    }
    setLang(detectLang());
  }, []);

  useEffect(() => {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, lang);
    }
  }, [lang]);

  const value = useMemo<I18nContextValue>(
    () => ({
      lang,
      setLang,
      t: (key: string) => translate(lang, key)
    }),
    [lang]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}
