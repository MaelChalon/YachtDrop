"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@/types/product";
import { ProductCard } from "@/components/product-card";
import { useI18n } from "@/components/i18n-provider";

type Props = {
  query: string;
};

export function ProductFeed({ query }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoading, setShowLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);
  const [degraded, setDegraded] = useState(false);
  const { t } = useI18n();
  const pageRef = useRef(1);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const requestIdRef = useRef(0);

  const mergeUnique = (prev: Product[], next: Product[]) => {
    const seen = new Set<string>();
    const merged: Product[] = [];
    for (const item of [...prev, ...next]) {
      const key = item.productUrl || item.id;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      merged.push(item);
    }
    return merged;
  };

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      setLoading(true);
      setShowLoading(false);
      setErrorKey(null);
      setHasMore(true);
      setHasFetched(false);
      setDegraded(false);
      try {
        const url = `/api/products?q=${encodeURIComponent(query)}&page=1`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) {
          throw new Error("Erreur API produits");
        }
        const data = (await res.json()) as { products: Product[]; degraded?: boolean };
        if (requestIdRef.current !== requestId) {
          return;
        }
        const list = data.products || [];
        setProducts(list);
        setDegraded(Boolean(data.degraded));
        setHasMore(list.length > 0);
        pageRef.current = 1;
        setHasFetched(true);
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          setErrorKey("feed.error");
          setHasFetched(true);
        }
      } finally {
        if (requestIdRef.current === requestId) {
          setLoading(false);
        }
      }
    };
    void load();
    return () => controller.abort();
  }, [query, t]);

  useEffect(() => {
    if (!loading) {
      setShowLoading(false);
      return;
    }
    const timer = setTimeout(() => setShowLoading(true), 300);
    return () => clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    if (!sentinelRef.current || loading || loadingMore || !hasMore) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void (async () => {
            setLoadingMore(true);
            const nextPage = pageRef.current + 1;
            try {
              const url = `/api/products?q=${encodeURIComponent(query)}&page=${nextPage}`;
              const res = await fetch(url);
              if (!res.ok) {
                throw new Error("Erreur API produits");
              }
              const data = (await res.json()) as { products: Product[] };
              const list = data.products || [];
              if (list.length === 0) {
                setHasMore(false);
                return;
              }
              setProducts((prev) => mergeUnique(prev, list));
              pageRef.current = nextPage;
            } catch {
              setHasMore(false);
            } finally {
              setLoadingMore(false);
            }
          })();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [query, loading, loadingMore, hasMore]);

  const isEmpty = useMemo(
    () => hasFetched && !loading && !errorKey && products.length === 0,
    [hasFetched, loading, errorKey, products]
  );

  if (loading) {
    return (
      <div className="space-y-3">
        {showLoading ? <div className="text-xs font-semibold text-slate-500">{t("feed.loading")}</div> : null}
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  if (errorKey) {
    return <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{t(errorKey)}</p>;
  }

  if (isEmpty) {
    return <p className="rounded-xl bg-slate-100 p-3 text-sm text-slate-600">{t("feed.empty")}</p>;
  }

  return (
    <>
      {degraded ? (
        <div className="mb-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
          {t("feed.degraded")}
        </div>
      ) : null}
      {showLoading || loadingMore ? (
        <div className="mb-2 text-xs font-semibold text-slate-500">
          {loadingMore ? t("feed.loadingMore") : t("feed.loading")}
        </div>
      ) : null}
      <div className="grid grid-cols-2 gap-3">
        {products.map((product, index) => (
          <ProductCard key={`${product.productUrl || product.id}-${index}`} product={product} />
        ))}
        {loadingMore
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={`more-${i}`} className="h-56 animate-pulse rounded-2xl bg-slate-200" />
            ))
          : null}
      </div>
      <div ref={sentinelRef} className="h-10" />
      {loadingMore ? <div className="mt-2 text-xs font-semibold text-slate-500">{t("feed.loadingMore")}</div> : null}
    </>
  );
}
