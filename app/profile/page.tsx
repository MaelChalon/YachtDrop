"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n-provider";
import { useAuth } from "@/lib/auth-client";

export default function ProfilePage() {
  const { t } = useI18n();
  const router = useRouter();
  const { user, loading, refresh } = useAuth();

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    await refresh();
    router.push("/browse");
  };

  if (loading) {
    return <p className="text-sm text-slate-600">{t("auth.loading")}</p>;
  }

  if (!user) {
    return (
      <section>
        <h2 className="mb-3 text-lg font-bold text-slate-900">{t("profile.title")}</h2>
        <p className="rounded-xl bg-slate-100 p-3 text-sm text-slate-600">{t("profile.guest")}</p>
        <Link href="/login" className="mt-3 inline-block text-sm font-semibold text-ocean">
          {t("auth.login")}
        </Link>
      </section>
    );
  }

  return (
    <section>
      <h2 className="mb-3 text-lg font-bold text-slate-900">{t("profile.title")}</h2>
      <div className="space-y-2 rounded-xl bg-white p-3 shadow-sm">
        <p className="text-sm font-semibold text-slate-900">
          {user.firstName} {user.lastName}
        </p>
        <p className="text-xs text-slate-500">@{user.username}</p>
      </div>
      <button
        onClick={logout}
        className="mt-3 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
      >
        {t("auth.logout")}
      </button>
    </section>
  );
}
