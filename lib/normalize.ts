import crypto from "node:crypto";
import type { Product } from "@/types/product";

export function parsePrice(raw: string): { price: number; currency: string } {
  const cleaned = raw.replace(/\s/g, "");
  const match = cleaned.match(/([€$£])?(\d+[.,]?\d*)/);
  if (!match) {
    return { price: 0, currency: "EUR" };
  }
  const price = Number(match[2].replace(",", "."));
  const symbol = match[1] ?? "€";
  const currency = symbol === "$" ? "USD" : symbol === "£" ? "GBP" : "EUR";
  return { price: Number.isFinite(price) ? price : 0, currency };
}

export function normalizeProduct(input: Partial<Product>): Product {
  const sourceBase = `${input.productUrl ?? ""}|${input.name ?? ""}|${input.price ?? ""}|${input.currency ?? ""}`;
  const source = sourceBase.trim() ? sourceBase : Math.random().toString();
  const id =
    input.id ??
    `nh_${crypto.createHash("sha1").update(source).digest("hex").slice(0, 8)}`;

  return {
    id,
    name: input.name?.trim() || "Produit sans nom",
    price: typeof input.price === "number" ? input.price : 0,
    currency: input.currency || "EUR",
    imageUrl:
      input.imageUrl ||
      "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=800&q=60",
    shortDescription: input.shortDescription?.trim() || "",
    productUrl: input.productUrl || "https://www.nautichandler.com/",
    category: input.category || null,
    availability: input.availability || null
  };
}
