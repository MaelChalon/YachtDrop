import type { Metadata } from "next";
import { ClientShell } from "@/components/client-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "YachtDrop",
  description: "Mobile-first chandlery ordering for yacht crews",
  manifest: "/manifest.webmanifest"
};

export const viewport = {
  themeColor: "#0b3954"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
