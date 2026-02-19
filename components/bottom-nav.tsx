"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/store/cart-store";
import { useI18n } from "@/components/i18n-provider";

const tabs = [
  { href: "/browse", labelKey: "nav.browse" },
  { href: "/search", labelKey: "nav.search" },
  { href: "/cart", labelKey: "nav.cart" }
];

export function BottomNav() {
  const pathname = usePathname();
  const items = useCartStore((s) => s.items);
  const { t } = useI18n();
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <nav className="glass fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200">
      <div className="mx-auto flex max-w-[1120px] items-center justify-around px-4 py-3">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative rounded-full px-4 py-2 text-sm font-semibold transition ${
                active ? "bg-ocean text-white" : "text-slate-600"
              }`}
            >
              {t(tab.labelKey)}
              {tab.href === "/cart" && count > 0 ? (
                <span className="absolute -right-2 -top-2 rounded-full bg-coral px-2 text-xs text-white">
                  {count}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
