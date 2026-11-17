"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChatCircleText, X } from "@phosphor-icons/react";
import { AssistantChat } from "./AssistantChat";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

export function AssistantLauncher({ locale, demo = false, uploads = false }: { locale: Locale; demo?: boolean; uploads?: boolean }) {
  const d = t(locale).assistant;
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (pathname.endsWith("/quote")) return null;

  return (
    <div className="no-print">
      {open && (
        <div
          role="dialog"
          aria-modal="false"
          aria-labelledby="assistant-title"
          className="fixed inset-0 z-50 flex flex-col bg-card shadow-2xl sm:inset-auto sm:bottom-24 sm:end-6 sm:h-[min(640px,calc(100vh-8rem))] sm:w-[400px] sm:rounded-xl sm:border sm:border-line"
        >
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
            <div>
              <h2 id="assistant-title" className="font-semibold">{d.title}</h2>
              <p className="text-xs text-muted">{d.subtitle}</p>
            </div>
            <button
              ref={closeBtn}
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t(locale).nav.close}
              className="inline-flex h-11 w-11 items-center justify-center rounded-md hover:bg-surface"
            >
              <X size={20} aria-hidden />
            </button>
          </div>
          <div className="min-h-0 flex-1">
            <AssistantChat locale={locale} compact demo={demo} uploads={uploads} />
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`fixed bottom-5 end-5 z-50 items-center gap-2 rounded-full bg-ink p-4 sm:px-5 sm:py-3.5 font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0 ${open ? "hidden sm:inline-flex" : "inline-flex"}`}
      >
        {open ? <X size={20} aria-hidden /> : <ChatCircleText size={22} weight="fill" aria-hidden />}
        <span className="sr-only sm:not-sr-only">{open ? t(locale).nav.close : d.open}</span>
      </button>
    </div>
  );
}
