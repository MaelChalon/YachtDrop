"use client";

import { useEffect, useState } from "react";
import { ProductFeed } from "@/components/product-feed";
import { SearchBar } from "@/components/search-bar";
import { useI18n } from "@/components/i18n-provider";

export default function SearchPage() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const { t } = useI18n();

  useEffect(() => {
    const id = setTimeout(() => setQuery(input.trim()), 300);
    return () => clearTimeout(id);
  }, [input]);

  return (
    <section>
      <h2 className="mb-2 text-lg font-bold text-slate-900">{t("search.title")}</h2>
      <SearchBar
        value={input}
        onChange={setInput}
        placeholder={t("search.placeholder")}
        clearLabel={t("search.clear")}
      />
      <ProductFeed key={query} query={query} />
    </section>
  );
}
