import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { MAX_PDF_BYTES, UPLOAD_PREFIX, blobEnabled } from "@/lib/files";

// Issues short-lived tokens so the browser can upload spec PDFs straight to private storage.
export async function POST(req: Request) {
  if (!blobEnabled()) return Response.json({ error: "uploads_disabled" }, { status: 400 });
  const body = (await req.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith(UPLOAD_PREFIX) || pathname.includes("..")) throw new Error("bad_path");
        return {
          allowedContentTypes: ["application/pdf"],
          maximumSizeInBytes: MAX_PDF_BYTES,
          addRandomSuffix: true,
          validUntil: Date.now() + 10 * 60 * 1000,
        };
      },
    });
    return Response.json(result);
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "upload_failed" }, { status: 400 });
  }
}
