import * as cheerio from "cheerio";
import type { Product } from "@/types/product";
import { normalizeProduct, parsePrice } from "@/lib/normalize";

const BASE = "https://www.nautichandler.com";
const debugEnabled = process.env.NODE_ENV !== "production";

function debugLog(...args: unknown[]) {
  if (debugEnabled) {
    console.warn("[ingestProducts]", ...args);
  }
}

function buildCandidateUrls(q: string, page: number): string[] {
  const trimmed = q.trim();
  if (!trimmed) {
    return [`${BASE}/`];
  }
  const encodedQ = encodeURIComponent(trimmed);
  const pageParam = Math.max(1, page);
  return [
    `${BASE}/recherche?controller=search&s=${encodedQ}&page=${pageParam}`,
    `${BASE}/search?controller=search&s=${encodedQ}&page=${pageParam}`,
    `${BASE}/fr/recherche?controller=search&s=${encodedQ}&page=${pageParam}`,
    `${BASE}/`
  ];
}

function textOrEmpty($el: cheerio.Cheerio<any>): string {
  return $el.text().replace(/\s+/g, " ").trim();
}

function pickFirstAttr($root: cheerio.Cheerio<any>, selectors: string[], attr: string): string {
  for (const selector of selectors) {
    const value = $root.find(selector).first().attr(attr);
    if (value) {
      return value;
    }
  }
  return "";
}

function resolveUrl(url: string): string {
  if (!url) {
    return "";
  }
  if (url.startsWith("http")) {
    return url;
  }
  if (url.startsWith("//")) {
    return `https:${url}`;
  }
  return `${BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}

function firstSrcFromSet(srcset: string): string {
  if (!srcset) {
    return "";
  }
  const first = srcset.split(",")[0]?.trim() ?? "";
  return first.split(" ")[0] ?? "";
}

function pickImageUrl($root: cheerio.Cheerio<any>): string {
  const img = $root.find("img").first();
  if (!img.length) {
    return "";
  }
  return (
    img.attr("data-src") ||
    img.attr("data-original") ||
    img.attr("data-lazy") ||
    firstSrcFromSet(img.attr("data-srcset") || "") ||
    firstSrcFromSet(img.attr("srcset") || "") ||
    img.attr("src") ||
    ""
  );
}

function parseWithSelectors(html: string): Product[] {
  const $ = cheerio.load(html);
  const products: Product[] = [];

  const cardSelectors = [".product-miniature", ".product", ".js-product-miniature", "[data-id-product]"];

  for (const cardSelector of cardSelectors) {
    $(cardSelector).each((_, el) => {
      const root = $(el);
      const name = textOrEmpty(
        root.find(".product-title, .h3.product-title, .product-name, [itemprop='name']").first()
      );
      const priceText = textOrEmpty(
        root.find(".price, .product-price-and-shipping .price, [itemprop='price']").first()
      );
      const desc = textOrEmpty(root.find(".product-description-short, .product-desc").first());
      const url = pickFirstAttr(root, [".product-title a", "a.thumbnail", "a"], "href");
      const imageUrl = pickImageUrl(root);

      if (!name && !priceText && !url) {
        return;
      }

      const parsed = parsePrice(priceText);
      products.push(
        normalizeProduct({
          name,
          shortDescription: desc,
          imageUrl: resolveUrl(imageUrl),
          productUrl: resolveUrl(url),
          price: parsed.price,
          currency: parsed.currency
        })
      );
    });
    if (products.length > 0) {
      break;
    }
  }

  return products;
}

function fallbackProducts(q: string): Product[] {
  const term = q?.trim() || "nautic";
  return [
    normalizeProduct({
      name: `Live source unavailable - ${term} #1`,
      shortDescription: "Placeholder generated while source is unavailable. Retry shortly.",
      price: 29.9,
      currency: "EUR",
      imageUrl:
        "https://images.unsplash.com/photo-1540946485063-a40da27545f8?auto=format&fit=crop&w=800&q=60",
      productUrl: BASE
    }),
    normalizeProduct({
      name: `Live source unavailable - ${term} #2`,
      shortDescription: "Fallback item; API remains operational for UX validation.",
      price: 18.5,
      currency: "EUR",
      imageUrl:
        "https://images.unsplash.com/photo-1518606370713-65b54e676f3f?auto=format&fit=crop&w=800&q=60",
      productUrl: BASE
    })
  ];
}

export async function ingestProducts(q: string, page: number): Promise<Product[]> {
  const urls = buildCandidateUrls(q, page);
  for (const url of urls) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "YachtDropBot/1.0 (+https://yachtdrop.local)"
        },
        next: { revalidate: 0 }
      });
      if (!response.ok) {
        debugLog("non-200 response", { url, status: response.status });
        continue;
      }
      const html = await response.text();
      const parsed = parseWithSelectors(html);
      if (parsed.length > 0) {
        return parsed;
      }
      debugLog("parsed zero products", { url });
    } catch (error) {
      debugLog("fetch failed", { url, error });
      continue;
    }
  }
  return fallbackProducts(q);
}
