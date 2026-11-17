import { z } from "zod";

export type Locale = "ar" | "en";

export const ExtractionSchema = z.object({
  language: z.enum(["ar", "en"]).describe("Language the customer wrote in"),
  customer: z.object({
    organization: z.string().nullable(),
    contactName: z.string().nullable(),
    email: z.string().nullable(),
    phone: z.string().nullable(),
    city: z.string().nullable(),
    sector: z
      .enum(["education", "industry", "oil_gas", "government", "construction", "other", "unknown"])
      .describe("Best guess of the customer's sector"),
  }),
  summary: z.string().describe("Two-sentence summary of the request, in English, for GTT staff"),
  items: z
    .array(
      z.object({
        description: z.string().describe("What the customer asked for, in their wording"),
        quantity: z.number().nullable(),
        unit: z.string().nullable(),
        specs: z.array(z.string()).describe("Each stated technical requirement as its own entry"),
        sourceRef: z
          .string()
          .nullable()
          .describe("Where this item came from, e.g. 'chat' or 'specs.pdf p.3'"),
      }),
    )
    .describe("One entry per distinct item requested"),
  requirements: z.object({
    installation: z.boolean().nullable(),
    training: z.boolean().nullable(),
    deliveryWeeks: z.number().nullable(),
    deliveryLocation: z.string().nullable(),
    budget: z.string().nullable(),
  }),
  missingInfo: z
    .array(z.string())
    .describe("Information GTT still needs before quoting, written in English"),
});
export type Extraction = z.infer<typeof ExtractionSchema>;

export const MatchSchema = z.object({
  matches: z.array(
    z.object({
      itemIndex: z.number().describe("Index into the extracted items array"),
      level: z
        .enum(["offered", "partial", "specialist"])
        .describe(
          "offered: GTT's catalog clearly lists this product line; partial: related line exists but a stated spec or variant is not confirmed by the catalog; specialist: not in catalog or needs expert judgement",
        ),
      categorySlug: z.string().nullable(),
      productLine: z.string().nullable().describe("Exact product line text from the catalog (English)"),
      rationale: z.string().describe("Staff-facing reason, in English, citing the catalog line"),
      specsToConfirm: z.array(z.string()).describe("Stated specs the catalog cannot confirm"),
      questionsForCustomer: z.array(z.string()),
    }),
  ),
});
export type MatchResult = z.infer<typeof MatchSchema>;

export const QuoteNoteSchema = z.object({
  coverNote: z.string().describe("Short cover letter to the customer, in the customer's language"),
  technicalNotes: z.array(z.string()).describe("Compliance notes per item, in the customer's language"),
});

export type QuoteLine = {
  itemIndex: number;
  description: string;
  quantity: number | null;
  unit: string | null;
  unitPrice: number | null;
  supplier: string;
};

export type RfqStatus = "new" | "matched" | "in_review" | "approved";

export type RfqRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: RfqStatus;
  locale: Locale;
  channel: "website";
  transcript: { role: "user" | "assistant"; text: string }[];
  files: { name: string; size: number }[];
  extraction: Extraction | null;
  matches: MatchResult["matches"];
  quote: {
    lines: QuoteLine[];
    coverNote: string;
    technicalNotes: string[];
    validityDays: number | null;
    approvedBy: string | null;
  } | null;
  log: { at: string; text: string }[];
  error: string | null;
};
