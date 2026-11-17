import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { put, list, get } from "@vercel/blob";
import type { RfqRecord } from "./types";

// Vercel Blob when a token is configured (production), local files otherwise (dev).
const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const LOCAL_DIR = path.join(process.cwd(), ".data");
const PREFIX = "rfqs/";

async function readText(pathname: string): Promise<string | null> {
  if (useBlob) {
    const res = await get(pathname, { access: "private", useCache: false }).catch(() => null);
    if (!res || res.statusCode !== 200) return null;
    return await new Response(res.stream).text();
  }
  try {
    return await fs.readFile(path.join(LOCAL_DIR, pathname), "utf8");
  } catch {
    return null;
  }
}

async function writeText(pathname: string, body: string) {
  if (useBlob) {
    await put(pathname, body, {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return;
  }
  const file = path.join(LOCAL_DIR, pathname);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, body, "utf8");
}

export async function saveRfq(rfq: RfqRecord) {
  rfq.updatedAt = new Date().toISOString();
  await writeText(`${PREFIX}${rfq.id}.json`, JSON.stringify(rfq));
}

export async function getRfq(id: string): Promise<RfqRecord | null> {
  if (!/^[A-Za-z0-9-]+$/.test(id)) return null;
  const text = await readText(`${PREFIX}${id}.json`);
  return text ? (JSON.parse(text) as RfqRecord) : null;
}

export async function listRfqs(): Promise<RfqRecord[]> {
  let ids: string[] = [];
  if (useBlob) {
    const { blobs } = await list({ prefix: PREFIX, limit: 200 });
    ids = blobs.map((b) => b.pathname.slice(PREFIX.length).replace(/\.json$/, ""));
  } else {
    try {
      const files = await fs.readdir(path.join(LOCAL_DIR, PREFIX));
      ids = files.filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, ""));
    } catch {
      ids = [];
    }
  }
  const all = await Promise.all(ids.map((id) => getRfq(id)));
  return all
    .filter((r): r is RfqRecord => r !== null)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function nextRfqId(): Promise<string> {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `RFQ-${year}-${rand}`;
}
