"use client";

import type { Product } from "@/types/product";
import { useCartStore } from "@/store/cart-store";
import { useI18n } from "@/components/i18n-provider";

type Props = {
  product: Product;
};

export function ProductCard({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const { t } = useI18n();

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="h-36 w-full rounded-xl bg-slate-100 p-2">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full rounded-lg object-contain"
        onError={(e) => {
          (e.target as HTMLImageElement).src =
            "https://images.unsplash.com/photo-1559329007-40df8a9345d8?auto=format&fit=crop&w=800&q=60";
        }}
        />
      </div>
      <div className="mt-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">{product.name}</h3>
        {product.shortDescription?.trim() ? (
          <p className="mt-1 line-clamp-2 text-xs text-slate-500">{product.shortDescription}</p>
        ) : null}
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="text-sm font-bold text-ocean">
          {product.price.toFixed(2)} {product.currency}
        </p>
        <button
          onClick={() => addItem(product)}
          className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-slate-900 transition hover:brightness-95"
        >
          {t("card.add")}
        </button>
      </div>
    </article>
  );
}
