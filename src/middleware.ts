import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/") {
    const pref = req.headers.get("accept-language") ?? "";
    const locale = /^en\b/i.test(pref) ? "en" : "ar";
    return NextResponse.redirect(new URL(`/${locale}`, req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/"] };
