"use client";

import Link from "next/link";
import { cartSubtotal, useCartStore } from "@/store/cart-store";
import { useI18n } from "@/components/i18n-provider";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQty = useCartStore((s) => s.updateQty);
  const { t } = useI18n();

  const subtotal = cartSubtotal(items);
  const currency = items[0]?.currency || "EUR";

  return (
    <section>
      <h2 className="mb-3 text-lg font-bold text-slate-900">{t("cart.title")}</h2>
      {items.length === 0 ? (
        <p className="rounded-xl bg-slate-100 p-3 text-sm text-slate-600">{t("cart.empty")}</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <article key={item.productId} className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex gap-3">
                <img src={item.imageUrl} alt={item.name} className="h-16 w-16 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{item.name}</p>
                  <p className="text-xs text-slate-500">
                    {item.unitPrice.toFixed(2)} {item.currency}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() => updateQty(item.productId, item.qty - 1)}
                      className="rounded border px-2 py-1 text-xs"
                    >
                      -
                    </button>
                    <span className="text-sm font-semibold">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.productId, item.qty + 1)}
                      className="rounded border px-2 py-1 text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button onClick={() => removeItem(item.productId)} className="text-xs text-red-600">
                  {t("cart.remove")}
                </button>
              </div>
            </article>
          ))}

          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-slate-600">{t("cart.subtotal")}</span>
              <strong>
                {subtotal.toFixed(2)} {currency}
              </strong>
            </div>
            <Link
              href="/checkout"
              className="block rounded-xl bg-ocean px-4 py-3 text-center text-sm font-semibold text-white"
            >
              {t("cart.checkout")}
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
