"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, CheckoutMethod } from "@/types/product";

export type OrderSnapshot = {
  confirmationId: string;
  items: CartItem[];
  subtotal: number;
  currency: string;
  method: CheckoutMethod;
  createdAt: string;
};

type OrderState = {
  lastOrder: OrderSnapshot | null;
  setLastOrder: (order: OrderSnapshot) => void;
  clearLastOrder: () => void;
};

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      lastOrder: null,
      setLastOrder: (order) => set({ lastOrder: order }),
      clearLastOrder: () => set({ lastOrder: null })
    }),
    { name: "yachtdrop-order-v1" }
  )
);
