"use client";

import Link from "next/link";
import { useCartStore, cartSubtotal } from "@/store/cart-store";
import { useI18n } from "@/components/i18n-provider";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function CartDrawer({ open, onClose }: Props) {
  const items = useCartStore((s) => s.items);
  const subtotal = cartSubtotal(items);
  const currency = items[0]?.currency || "EUR";
  const { t } = useI18n();

  return (
    <div className={`fixed inset-0 z-40 ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      <aside
        className={`absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white shadow-2xl transition-transform ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: "75vh" }}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-bold text-slate-900">{t("cart.title")}</h3>
          <button onClick={onClose} className="text-xs font-semibold text-slate-500">
            {t("cart.close")}
          </button>
        </div>

        <div className="max-h-[55vh] overflow-auto px-5 py-4">
          {items.length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">{t("cart.empty")}</p>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3">
                  <img src={item.imageUrl} alt={item.name} className="h-12 w-12 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-500">
                      {item.qty} x {item.unitPrice.toFixed(2)} {item.currency}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 px-5 py-4">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="text-slate-600">{t("cart.subtotal")}</span>
            <strong>
              {subtotal.toFixed(2)} {currency}
            </strong>
          </div>
          <Link
            href="/checkout"
            onClick={onClose}
            className="block rounded-xl bg-ocean px-4 py-3 text-center text-sm font-semibold text-white"
          >
            {t("cart.checkout")}
          </Link>
        </div>
      </aside>
    </div>
  );
}
