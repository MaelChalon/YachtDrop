"use client";

import { ProductFeed } from "@/components/product-feed";
import { useI18n } from "@/components/i18n-provider";

export default function BrowsePage() {
  const { t } = useI18n();

  return (
    <section>
      <div className="mb-3">
        <h2 className="text-lg font-bold text-slate-900">{t("browse.title")}</h2>
        <p className="text-sm text-slate-600">{t("browse.subtitle")}</p>
      </div>
      <ProductFeed query="" />
    </section>
  );
}
