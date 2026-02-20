import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSession, createUser, setSessionCookie } from "@/lib/auth";

const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  username: z.string().min(3),
  password: z.string().min(6)
});

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }
    const { user, error } = createUser(parsed.data);
    if (error) {
      return NextResponse.json({ message: "Username already used" }, { status: 409 });
    }
    const session = createSession(user!.id);
    await setSessionCookie(session.token, session.expiresAt);
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });
  }
}
