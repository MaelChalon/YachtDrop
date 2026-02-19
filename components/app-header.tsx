"use client";

import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n } from "@/components/i18n-provider";

export function AppHeader() {
  const { t } = useI18n();

  return (
    <header className="mb-4 rounded-2xl bg-ocean p-4 text-white shadow">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-spray">YachtDrop</p>
          <h1 className="text-2xl font-extrabold">{t("app.tagline")}</h1>
        </div>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
