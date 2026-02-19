"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product } from "@/types/product";

type CartState = {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const existing = get().items.find((i) => i.productId === product.id);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.productId === product.id ? { ...i, qty: i.qty + 1 } : i
            )
          });
          return;
        }
        set({
          items: [
            ...get().items,
            {
              productId: product.id,
              name: product.name,
              imageUrl: product.imageUrl,
              qty: 1,
              unitPrice: product.price,
              currency: product.currency
            }
          ]
        });
      },
      removeItem: (productId) =>
        set({
          items: get().items.filter((i) => i.productId !== productId)
        }),
      updateQty: (productId, qty) =>
        set({
          items: get().items
            .map((i) => (i.productId === productId ? { ...i, qty } : i))
            .filter((i) => i.qty > 0)
        }),
      clear: () => set({ items: [] })
    }),
    { name: "yachtdrop-cart-v1" }
  )
);

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
}
