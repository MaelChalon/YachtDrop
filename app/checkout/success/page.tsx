"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useOrderStore } from "@/store/order-store";
import { useI18n } from "@/components/i18n-provider";

export default function CheckoutSuccessPage() {
  const { t } = useI18n();
  const lastOrder = useOrderStore((s) => s.lastOrder);
  const clearLastOrder = useOrderStore((s) => s.clearLastOrder);

  useEffect(() => {
    return () => clearLastOrder();
  }, [clearLastOrder]);

  if (!lastOrder) {
    return (
      <section>
        <h2 className="mb-3 text-lg font-bold text-slate-900">{t("order.title")}</h2>
        <p className="rounded-xl bg-slate-100 p-3 text-sm text-slate-600">{t("order.empty")}</p>
        <Link href="/browse" className="mt-3 inline-block text-sm font-semibold text-ocean">
          {t("order.back")}
        </Link>
      </section>
    );
  }

  return (
    <section>
      <h2 className="mb-2 text-lg font-bold text-slate-900">{t("order.title")}</h2>
      <p className="mb-3 text-sm text-slate-600">
        {t("order.confirmation")}: <strong>{lastOrder.confirmationId}</strong>
      </p>

      <div className="space-y-3">
        <div className="rounded-xl bg-white p-3 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">{t("order.method")}</p>
          <p className="text-sm font-semibold text-slate-900">
            {lastOrder.method === "DELIVERY" ? t("checkout.delivery") : t("checkout.pickup")}
          </p>
        </div>

        <div className="rounded-xl bg-white p-3 shadow-sm">
          <p className="mb-2 text-xs font-semibold text-slate-500">{t("order.items")}</p>
          <div className="space-y-2">
            {lastOrder.items.map((item) => (
              <div key={item.productId} className="flex items-center justify-between text-sm">
                <span className="truncate">{item.name}</span>
                <span className="ml-2 text-slate-600">
                  {item.qty} x {item.unitPrice.toFixed(2)} {item.currency}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-white p-3 shadow-sm">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">{t("order.total")}</span>
            <strong>
              {lastOrder.subtotal.toFixed(2)} {lastOrder.currency}
            </strong>
          </div>
        </div>
      </div>

      <Link href="/browse" className="mt-4 inline-block text-sm font-semibold text-ocean">
        {t("order.back")}
      </Link>
    </section>
  );
}
