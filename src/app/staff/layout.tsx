import type { Metadata } from "next";
import "../globals.css";
import { plex, plexArabic } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "GTT Sales Desk",
  robots: { index: false, follow: false },
};

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={`${plex.variable} ${plexArabic.variable}`}>
      <body className="min-h-screen bg-bg">{children}</body>
    </html>
  );
}
