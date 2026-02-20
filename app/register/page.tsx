"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n-provider";

export default function RegisterPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError(t("auth.passwordRule"));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, username, password })
      });
      if (!res.ok) {
        const msg = res.status === 409 ? t("auth.usernameTaken") : t("auth.invalid");
        throw new Error(msg);
      }
      router.push("/profile");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h2 className="mb-3 text-lg font-bold text-slate-900">{t("auth.registerTitle")}</h2>
      <form onSubmit={submit} className="space-y-3">
        <input
          required
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder={t("auth.firstName")}
          className="w-full rounded border p-2 text-sm"
        />
        <input
          required
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder={t("auth.lastName")}
          className="w-full rounded border p-2 text-sm"
        />
        <input
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder={t("auth.username")}
          className="w-full rounded border p-2 text-sm"
        />
        <input
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("auth.password")}
          className="w-full rounded border p-2 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-ocean px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          {loading ? t("auth.loading") : t("auth.register")}
        </button>
        {error ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      </form>
      <p className="mt-3 text-sm text-slate-600">
        {t("auth.haveAccount")} <Link href="/login" className="font-semibold text-ocean">{t("auth.login")}</Link>
      </p>
    </section>
  );
}
