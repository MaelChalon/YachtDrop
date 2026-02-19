import { File as NodeFile } from "node:buffer";
import { NextRequest, NextResponse } from "next/server";
import { TtlCache } from "@/lib/cache";
import type { Product } from "@/types/product";

export const runtime = "nodejs";

const cache = new TtlCache<Product[]>(10 * 60 * 1000);
const rate = new Map<string, { count: number; resetAt: number }>();

function ensureFileGlobal() {
  if (typeof globalThis.File === "undefined") {
    (globalThis as any).File = NodeFile;
  }
}

function rateLimitKey(request: NextRequest, q: string): string {
  const ip = request.headers.get("x-forwarded-for") || "local";
  return `${ip}:${q}`;
}

function hitRateLimit(request: NextRequest, q: string): boolean {
  const key = rateLimitKey(request, q);
  const now = Date.now();
  const current = rate.get(key);

  if (!current || now > current.resetAt) {
    rate.set(key, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  if (current.count >= 20) {
    return true;
  }
  current.count += 1;
  rate.set(key, current);
  return false;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();
    const page = Number(searchParams.get("page") || "1");
    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const key = `${q}:${safePage}`;

    if (hitRateLimit(request, q)) {
      return NextResponse.json({ message: "Rate limit exceeded." }, { status: 429 });
    }

    const cached = cache.get(key);
    if (cached) {
      return NextResponse.json({ products: cached, cached: true });
    }

    try {
      ensureFileGlobal();
      const { ingestProducts } = await import("@/lib/nautichandler");
      const products = await ingestProducts(q, safePage);
      cache.set(key, products);
      return NextResponse.json({ products, cached: false });
    } catch (error) {
      console.error("[api/products] ingestion failed", { q, safePage, error });
      const fallback = cache.get(key);
      if (fallback) {
        return NextResponse.json({ products: fallback, cached: true, degraded: true });
      }
      return NextResponse.json(
        { message: "La source produit est indisponible pour le moment." },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("[api/products] unexpected error", { error });
    return NextResponse.json(
      { message: "Erreur interne lors du traitement des produits." },
      { status: 500 }
    );
  }
}
