"use client";

import { languageLabels, Lang, supportedLangs } from "@/lib/i18n";
import { useI18n } from "@/components/i18n-provider";

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();

  return (
    <select
      value={lang}
      onChange={(e) => setLang(e.target.value as Lang)}
      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700"
      aria-label="Language"
    >
      {supportedLangs.map((code) => (
        <option key={code} value={code}>
          {languageLabels[code]}
        </option>
      ))}
    </select>
  );
}
