import { NextResponse } from "next/server";
import { clearSessionCookie, revokeSession } from "@/lib/auth";

export async function POST() {
  revokeSession();
  clearSessionCookie();
  return NextResponse.json({ ok: true });
}
