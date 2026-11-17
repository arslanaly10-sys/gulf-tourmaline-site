import { isStaff } from "@/lib/auth";
import { readFile, validPathname } from "@/lib/files";

// Staff-only download of a customer's original specification file.
export async function GET(req: Request) {
  if (!(await isStaff())) return new Response("Unauthorized", { status: 401 });
  const p = new URL(req.url).searchParams.get("p");
  if (!validPathname(p)) return new Response("Bad request", { status: 400 });
  const buf = await readFile(p);
  if (!buf) return new Response("Not found", { status: 404 });
  const name = p.split("/").pop() ?? "spec.pdf";
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(name)}`,
      "Cache-Control": "private, no-store",
    },
  });
}
