"use client";

import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";
import { CartBar } from "@/components/cart-bar";
import { I18nProvider } from "@/components/i18n-provider";
import { PwaRegister } from "@/components/pwa-register";

export function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <main className="app-shell px-4 pb-32 pt-4">
        <AppHeader />
        {children}
      </main>
      <CartBar />
      <BottomNav />
      <PwaRegister />
    </I18nProvider>
  );
}
