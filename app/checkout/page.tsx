"use client";

import { FormEvent, useState } from "react";
import { cartSubtotal, useCartStore } from "@/store/cart-store";
import { useCheckoutStore } from "@/store/checkout-store";
import { useI18n } from "@/components/i18n-provider";

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clear);
  const { t } = useI18n();

  const { method, marina, boatName, slip, pickupPoint, notes, setMethod, setField, reset } =
    useCheckoutStore();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            qty: item.qty,
            unitPrice: item.unitPrice
          })),
          method,
          delivery: { marina, boatName, slip },
          pickup: { pickupPoint },
          notes
        })
      });
      const data = (await res.json()) as { confirmationId?: string; message?: string };
      if (!res.ok) {
        throw new Error(data.message || t("checkout.error"));
      }
      setStatus("success");
      setMessage(`${t("checkout.confirmed")}: ${data.confirmationId}`);
      clearCart();
      reset();
    } catch (err) {
      setStatus("error");
      setMessage((err as Error).message);
    }
  };

  const subtotal = cartSubtotal(items);

  return (
    <section>
      <h2 className="mb-3 text-lg font-bold">{t("checkout.title")}</h2>
      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-white p-2">
          <button
            type="button"
            onClick={() => setMethod("DELIVERY")}
            className={`rounded-lg px-3 py-2 text-sm ${method === "DELIVERY" ? "bg-ocean text-white" : "bg-slate-100"}`}
          >
            {t("checkout.delivery")}
          </button>
          <button
            type="button"
            onClick={() => setMethod("PICKUP")}
            className={`rounded-lg px-3 py-2 text-sm ${method === "PICKUP" ? "bg-ocean text-white" : "bg-slate-100"}`}
          >
            {t("checkout.pickup")}
          </button>
        </div>

        {method === "DELIVERY" ? (
          <div className="space-y-2 rounded-xl bg-white p-3">
            <input
              required
              placeholder={t("checkout.marina")}
              value={marina}
              onChange={(e) => setField("marina", e.target.value)}
              className="w-full rounded border p-2 text-sm"
            />
            <input
              required
              placeholder={t("checkout.boatName")}
              value={boatName}
              onChange={(e) => setField("boatName", e.target.value)}
              className="w-full rounded border p-2 text-sm"
            />
            <input
              required
              placeholder={t("checkout.slip")}
              value={slip}
              onChange={(e) => setField("slip", e.target.value)}
              className="w-full rounded border p-2 text-sm"
            />
          </div>
        ) : (
          <div className="rounded-xl bg-white p-3">
            <input
              required
              placeholder={t("checkout.pickupPoint")}
              value={pickupPoint}
              onChange={(e) => setField("pickupPoint", e.target.value)}
              className="w-full rounded border p-2 text-sm"
            />
          </div>
        )}

        <textarea
          placeholder={t("checkout.notes")}
          value={notes}
          onChange={(e) => setField("notes", e.target.value)}
          className="min-h-20 w-full rounded-xl border p-2 text-sm"
        />

        <div className="rounded-xl bg-white p-3">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span>{t("checkout.subtotal")}</span>
            <strong>{subtotal.toFixed(2)} EUR</strong>
          </div>
          <button
            type="submit"
            disabled={items.length === 0 || status === "loading"}
            className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-bold disabled:opacity-50"
          >
            {status === "loading" ? t("checkout.submitting") : t("checkout.submit")}
          </button>
        </div>

        {message ? (
          <p className={`rounded-xl p-3 text-sm ${status === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {message}
          </p>
        ) : null}
      </form>
    </section>
  );
}
