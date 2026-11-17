import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { get, put } from "@vercel/blob";
import type { UploadedPdf } from "./ai";

// Customer spec files. In production the browser uploads them straight to private Vercel Blob
// storage (so they never pass through a function body, which Vercel caps at 4.5 MB) and the
// conversation carries only the pathname. Locally, without a Blob token, they arrive inline.

export const blobEnabled = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);
export const UPLOAD_PREFIX = "uploads/";
export const MAX_PDF_BYTES = 20 * 1024 * 1024;
export const MAX_TOTAL_BYTES = 20 * 1024 * 1024; // keeps a request with base64 documents under Claude's 32 MB limit
const LOCAL_DIR = path.join(process.cwd(), ".data");

export type PdfRef = { name: string; pathname?: string; base64?: string; size?: number };

export function validPathname(p: unknown): p is string {
  return typeof p === "string" && p.startsWith(UPLOAD_PREFIX) && !p.includes("..") && /^[\w\-./ ()؀-ۿ]+$/.test(p);
}

/** Loads every referenced PDF as base64 (fetching from storage when only a pathname was sent). */
export async function resolvePdfs(refs: PdfRef[]): Promise<UploadedPdf[]> {
  const out: UploadedPdf[] = [];
  let total = 0;
  for (const r of refs) {
    let base64 = r.base64 ?? null;
    if (!base64 && r.pathname) {
      const buf = await readFile(r.pathname);
      if (!buf) continue;
      base64 = buf.toString("base64");
    }
    if (!base64) continue;
    total += (base64.length * 3) / 4;
    if (total > MAX_TOTAL_BYTES) break;
    out.push({ name: r.name, base64 });
  }
  return out;
}

export async function readFile(pathname: string): Promise<Buffer | null> {
  if (!validPathname(pathname)) return null;
  if (blobEnabled()) {
    const res = await get(pathname, { access: "private", useCache: false }).catch(() => null);
    if (!res || res.statusCode !== 200) return null;
    return Buffer.from(await new Response(res.stream).arrayBuffer());
  }
  try {
    return await fs.readFile(path.join(LOCAL_DIR, pathname));
  } catch {
    return null;
  }
}

/** Saves an inline (dev) upload so staff can still download the original. Returns its pathname. */
export async function persistInline(rfqId: string, name: string, base64: string): Promise<string> {
  const safe = name.replace(/[^\w\-. ()؀-ۿ]/g, "_").slice(0, 100) || "file.pdf";
  const pathname = `${UPLOAD_PREFIX}${rfqId}/${safe}`;
  const buf = Buffer.from(base64, "base64");
  if (blobEnabled()) {
    await put(pathname, buf, { access: "private", contentType: "application/pdf", addRandomSuffix: false, allowOverwrite: true });
  } else {
    const file = path.join(LOCAL_DIR, pathname);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, buf);
  }
  return pathname;
}
