import { NextResponse } from "next/server";
import { clearSessionCookie, revokeSession } from "@/lib/auth";

export async function POST() {
  await revokeSession();
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
