import { NextResponse } from "next/server";
import { STAFF_COOKIE } from "@/lib/auth";

export async function POST(req: Request) {
  const res = NextResponse.redirect(new URL("/staff/login", req.url), 303);
  res.cookies.delete(STAFF_COOKIE);
  return res;
}
