"use client";

import { useMemo, useState } from "react";
import { useCartStore, cartSubtotal } from "@/store/cart-store";
import { useI18n } from "@/components/i18n-provider";
import { CartDrawer } from "@/components/cart-drawer";

export function CartBar() {
  const items = useCartStore((s) => s.items);
  const subtotal = cartSubtotal(items);
  const currency = items[0]?.currency || "EUR";
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  const count = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);
  const itemLabel = count === 1 ? t("cart.item") : t("cart.items");

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-16 left-0 right-0 z-30">
        <div className="mx-auto max-w-[1120px] px-4">
          <button
            onClick={() => setOpen(true)}
            className="flex w-full items-center justify-between gap-3 rounded-2xl bg-ocean px-4 py-3 text-sm font-semibold text-white shadow-lg"
          >
            <span>
              {count} {itemLabel}
            </span>
            <span>
              {subtotal.toFixed(2)} {currency}
            </span>
          </button>
        </div>
      </div>
      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
