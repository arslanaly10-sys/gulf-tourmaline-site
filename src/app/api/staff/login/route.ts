import { NextResponse } from "next/server";
import { checkPassword, STAFF_COOKIE, staffToken } from "@/lib/auth";

export async function POST(req: Request) {
  const form = await req.formData();
  const password = String(form.get("password") ?? "");
  const next = String(form.get("next") ?? "/staff");
  const safeNext = next.startsWith("/staff") ? next : "/staff";
  const token = staffToken();
  if (!token || !checkPassword(password)) {
    return NextResponse.redirect(new URL("/staff/login?error=1", req.url), 303);
  }
  const res = NextResponse.redirect(new URL(safeNext, req.url), 303);
  res.cookies.set(STAFF_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return res;
}
