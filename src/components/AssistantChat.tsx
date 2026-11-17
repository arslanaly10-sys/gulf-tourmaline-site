"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { FilePdf, PaperPlaneRight, Paperclip, CheckCircle, X, ArrowCounterClockwise } from "@phosphor-icons/react";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

type Turn = { role: "user" | "assistant"; text: string };
type Pdf = { name: string; base64: string; size: number };
type Result = { id: string; items: number; missingInfo: string[] };

const MAX_BYTES = 8 * 1024 * 1024;
const STORAGE_KEY = "gtt-assistant-v1";

/** Renders the assistant's light markdown: paragraphs, "- " bullets, **bold**. */
function Rich({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  const inline = (s: string, k: string) =>
    s.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
      part.startsWith("**") && part.endsWith("**") ? <strong key={`${k}-${i}`}>{part.slice(2, -2)}</strong> : part,
    );
  const flush = (k: string) => {
    if (list.length) {
      blocks.push(
        <ul key={k} className="list-disc space-y-1 ps-5">
          {list.map((li, i) => (
            <li key={i}>{inline(li, `${k}-${i}`)}</li>
          ))}
        </ul>,
      );
      list = [];
    }
  };
  text.split("\n").forEach((line, i) => {
    const m = line.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)$/);
    if (m) list.push(m[1]);
    else {
      flush(`l${i}`);
      if (line.trim()) blocks.push(<p key={i}>{inline(line.replace(/^#+\s*/, ""), `p${i}`)}</p>);
    }
  });
  flush("end");
  return <div className="space-y-2">{blocks}</div>;
}

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function AssistantChat({ locale, compact = false }: { locale: Locale; compact?: boolean }) {
  const d = t(locale).assistant;
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [pdfs, setPdfs] = useState<Pdf[]>([]);
  const [busy, setBusy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  // Keep the conversation (not the files) across page navigations.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) setTurns(JSON.parse(saved));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(turns));
    } catch {}
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [turns]);

  const userTurns = turns.filter((x) => x.role === "user").length;
  const canSubmit = userTurns > 0 && !busy && !submitting;

  async function onFiles(files: FileList | null) {
    setNotice(null);
    if (!files) return;
    const next: Pdf[] = [];
    for (const f of Array.from(files).slice(0, 3)) {
      if (f.type !== "application/pdf") {
        setNotice(d.onlyPdf);
        continue;
      }
      if (f.size > MAX_BYTES) {
        setNotice(d.tooLarge);
        continue;
      }
      next.push({ name: f.name, size: f.size, base64: await toBase64(f) });
    }
    setPdfs((p) => [...p, ...next].slice(0, 3));
    if (fileInput.current) fileInput.current.value = "";
  }

  async function send(e?: FormEvent) {
    e?.preventDefault();
    const text = input.trim() || (pdfs.length ? (locale === "ar" ? "أرفقت كراسة المواصفات." : "I attached my specification.") : "");
    if (!text || busy) return;
    setNotice(null);
    const history: Turn[] = [...turns, { role: "user", text }];
    setTurns([...history, { role: "assistant", text: "" }]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turns: history, pdfs: pdfs.map(({ name, base64 }) => ({ name, base64 })) }),
      });
      if (!res.ok || !res.body) throw new Error(String(res.status));
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        const shown = acc.replace(/\n*\[\[(error|busy|refusal)\]\]\s*$/, "");
        setTurns([...history, { role: "assistant", text: shown }]);
      }
      const marker = acc.match(/\[\[(error|busy|refusal)\]\]\s*$/)?.[1];
      if (marker) {
        const msg = marker === "busy" ? d.busy : marker === "refusal" ? d.refusal : d.error;
        const clean = acc.replace(/\n*\[\[(error|busy|refusal)\]\]\s*$/, "").trim();
        setTurns([...history, { role: "assistant", text: clean ? `${clean}\n\n${msg}` : msg }]);
      }
    } catch {
      setTurns([...history, { role: "assistant", text: d.error }]);
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setNotice(null);
    try {
      const res = await fetch("/api/rfq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          turns: turns.filter((x) => x.text.trim()),
          pdfs: pdfs.map(({ name, base64 }) => ({ name, base64 })),
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setResult(await res.json());
    } catch {
      setNotice(d.error);
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setTurns([]);
    setPdfs([]);
    setResult(null);
    setNotice(null);
  }

  if (result) {
    return (
      <div className="flex h-full flex-col items-start gap-4 p-6" role="status">
        <CheckCircle size={40} weight="fill" className="text-ok" aria-hidden />
        <h3 className="text-xl font-semibold">{d.sentTitle}</h3>
        <p className="leading-relaxed">{d.sent.replace("{id}", result.id)}</p>
        {result.missingInfo.length > 0 && (
          <div className="w-full rounded-md bg-warn-bg p-4 text-warn">
            <p className="font-semibold">{d.missing}</p>
            <ul className="mt-2 list-disc space-y-1 ps-5" dir="ltr">
              {result.missingInfo.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </div>
        )}
        <button type="button" onClick={reset} className="btn btn-secondary">
          <ArrowCounterClockwise size={18} aria-hidden />
          {d.newRequest}
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div ref={scroller} className={`min-h-0 flex-1 space-y-4 overflow-y-auto p-4 ${compact ? "" : "sm:p-6"}`} aria-live="polite">
        <div className="max-w-[85%] rounded-2xl rounded-ss-sm bg-surface px-4 py-3 leading-relaxed">{d.greeting}</div>
        {turns.map((turn, i) =>
          turn.role === "user" ? (
            <div key={i} className="ms-auto max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-se-sm bg-accent px-4 py-3 leading-relaxed text-white">
              {turn.text}
            </div>
          ) : (
            <div key={i} className="max-w-[85%] rounded-2xl rounded-ss-sm bg-surface px-4 py-3 leading-relaxed">
              {turn.text ? <Rich text={turn.text} /> : <span className="inline-flex gap-1" aria-label="…"><span className="h-2 w-2 animate-bounce rounded-full bg-muted" /><span className="h-2 w-2 animate-bounce rounded-full bg-muted [animation-delay:120ms]" /><span className="h-2 w-2 animate-bounce rounded-full bg-muted [animation-delay:240ms]" /></span>}
            </div>
          ),
        )}
      </div>

      <div className="border-t border-line bg-card p-3 sm:p-4">
        {pdfs.length > 0 && (
          <ul className="mb-3 flex flex-wrap gap-2">
            {pdfs.map((p, i) => (
              <li key={i} className="inline-flex items-center gap-2 rounded-md bg-surface py-1 ps-3 pe-1 text-sm">
                <FilePdf size={18} className="text-brand-red" aria-hidden />
                <span className="max-w-[12rem] truncate" dir="ltr">{p.name}</span>
                <button
                  type="button"
                  aria-label={`${d.remove} ${p.name}`}
                  onClick={() => setPdfs((all) => all.filter((_, j) => j !== i))}
                  className="inline-flex h-8 w-8 items-center justify-center rounded hover:bg-line"
                >
                  <X size={14} aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
        {notice && <p className="mb-2 text-sm text-brand-red" role="alert">{notice}</p>}
        <form onSubmit={send} className="flex items-end gap-2">
          <input ref={fileInput} type="file" accept="application/pdf" multiple className="sr-only" id={`pdf-${compact ? "c" : "p"}`} onChange={(e) => onFiles(e.target.files)} />
          <label
            htmlFor={`pdf-${compact ? "c" : "p"}`}
            className="inline-flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-md border border-line hover:bg-surface"
            title={d.attach}
          >
            <Paperclip size={20} aria-hidden />
            <span className="sr-only">{d.attach}</span>
          </label>
          <label htmlFor={`msg-${compact ? "c" : "p"}`} className="sr-only">{d.label}</label>
          <textarea
            id={`msg-${compact ? "c" : "p"}`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder={d.placeholder}
            className="max-h-36 min-h-12 flex-1 resize-none rounded-md border border-line bg-card px-3 py-3 leading-snug focus:border-accent"
          />
          <button type="submit" disabled={busy || (!input.trim() && !pdfs.length)} aria-label={d.send} className="btn btn-primary h-12 w-12 shrink-0 !px-0 disabled:opacity-40">
            <PaperPlaneRight size={20} weight="fill" className="rtl:-scale-x-100" aria-hidden />
          </button>
        </form>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted">{d.privacy}</p>
          <button type="button" onClick={submit} disabled={!canSubmit} className="btn btn-secondary min-h-11 text-sm disabled:opacity-40">
            {submitting ? d.submitting : d.submit}
          </button>
        </div>
      </div>
    </div>
  );
}
