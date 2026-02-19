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
  const [loadingMore, setLoadingMore] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const { t } = useI18n();
  const pageRef = useRef(1);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setErrorKey(null);
      setHasMore(true);
      try {
        const url = `/api/products?q=${encodeURIComponent(query)}&page=1`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) {
          throw new Error("Erreur API produits");
        }
        const data = (await res.json()) as { products: Product[] };
        const list = data.products || [];
        setProducts(list);
        setHasMore(list.length > 0);
        pageRef.current = 1;
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          setErrorKey("feed.error");
        }
      } finally {
        setLoading(false);
      }
    };
    void load();
    return () => controller.abort();
  }, [query, t]);

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
              setProducts((prev) => [...prev, ...list]);
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

  const isEmpty = useMemo(() => !loading && !errorKey && products.length === 0, [loading, errorKey, products]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-56 animate-pulse rounded-2xl bg-slate-200" />
        ))}
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
      <div className="grid grid-cols-2 gap-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
        {loadingMore
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={`more-${i}`} className="h-56 animate-pulse rounded-2xl bg-slate-200" />
            ))
          : null}
      </div>
      <div ref={sentinelRef} className="h-10" />
    </>
  );
}
