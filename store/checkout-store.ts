"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CheckoutMethod } from "@/types/product";

type CheckoutDetails = {
  method: CheckoutMethod;
  marina: string;
  boatName: string;
  slip: string;
  pickupPoint: string;
  notes: string;
  setField: (key: string, value: string) => void;
  setMethod: (method: CheckoutMethod) => void;
  reset: () => void;
};

const initial = {
  method: "DELIVERY" as CheckoutMethod,
  marina: "",
  boatName: "",
  slip: "",
  pickupPoint: "",
  notes: ""
};

export const useCheckoutStore = create<CheckoutDetails>()(
  persist(
    (set) => ({
      ...initial,
      setField: (key, value) => set((state) => ({ ...state, [key]: value })),
      setMethod: (method) => set((state) => ({ ...state, method })),
      reset: () => set(initial)
    }),
    { name: "yachtdrop-checkout-v1" }
  )
);
