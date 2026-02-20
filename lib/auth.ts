import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

export type AuthUser = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
};

const SESSION_COOKIE = "yd_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function rowToUser(row: any): AuthUser {
  return {
    id: row.id,
    username: row.username,
    firstName: row.first_name,
    lastName: row.last_name
  };
}

export function createUser(input: {
  username: string;
  firstName: string;
  lastName: string;
  password: string;
}) {
  const db = getDb();
  const existing = db.prepare("SELECT id FROM users WHERE username = ?").get(input.username);
  if (existing) {
    return { error: "USERNAME_TAKEN" as const };
  }
  const passwordHash = bcrypt.hashSync(input.password, 10);
  const createdAt = new Date().toISOString();
  const info = db
    .prepare(
      "INSERT INTO users (username, first_name, last_name, password_hash, created_at) VALUES (?, ?, ?, ?, ?)"
    )
    .run(input.username, input.firstName, input.lastName, passwordHash, createdAt);
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid);
  return { user: rowToUser(user) };
}

export function verifyUser(username: string, password: string) {
  const db = getDb();
  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
  if (!user) {
    return null;
  }
  const ok = bcrypt.compareSync(password, user.password_hash);
  if (!ok) {
    return null;
  }
  return rowToUser(user);
}

export function createSession(userId: number) {
  const db = getDb();
  const token = crypto.randomBytes(24).toString("hex");
  const now = Date.now();
  const expiresAt = new Date(now + SESSION_TTL_MS).toISOString();
  const createdAt = new Date(now).toISOString();
  db.prepare("INSERT INTO sessions (user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?)").run(
    userId,
    token,
    expiresAt,
    createdAt
  );
  return { token, expiresAt };
}

export async function setSessionCookie(token: string, expiresAt: string) {
  const store = await cookies();
  store.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt)
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(0)
  });
}

export async function getSessionUser() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }
  const db = getDb();
  const row = db
    .prepare(
      "SELECT users.* , sessions.expires_at as session_expires FROM sessions JOIN users ON users.id = sessions.user_id WHERE sessions.token = ?"
    )
    .get(token);
  if (!row) {
    return null;
  }
  if (Date.parse(row.session_expires) < Date.now()) {
    db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
    return null;
  }
  return rowToUser(row);
}

export async function revokeSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) {
    return;
  }
  const db = getDb();
  db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
}
