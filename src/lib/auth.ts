import "server-only";
import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "node:crypto";

export const STAFF_COOKIE = "gtt_staff";

function token(): string | null {
  const pw = process.env.STAFF_PASSWORD;
  if (!pw) return null;
  return createHash("sha256").update(`gtt-staff:${pw}`).digest("hex");
}

export function checkPassword(input: string): boolean {
  const pw = process.env.STAFF_PASSWORD;
  if (!pw) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(pw);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function staffToken() {
  return token();
}

export async function isStaff(): Promise<boolean> {
  const expected = token();
  if (!expected) return false;
  const jar = await cookies();
  return jar.get(STAFF_COOKIE)?.value === expected;
}
