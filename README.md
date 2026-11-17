# Gulf Tourmaline Trading — website refresh + RFQ assistant

Arabic-first, bilingual Next.js site for Gulf Tourmaline Trading Est. (Dammam), with an embedded
Claude-powered quotation assistant and a staff desk for reviewing requests.

## What's in it

| Area | Path | Notes |
| --- | --- | --- |
| Public site (ar / en) | `src/app/[locale]/…` | Home, product lines (9), line detail, about, training, gallery, careers, contact |
| Quote page | `/[locale]/quote` | Full-page assistant; the floating "Ask the assistant" button opens the same chat on every page |
| Staff desk | `/staff` | Password-protected requests, original spec downloads, technical matching, quotation draft with revisions, approval |
| Quote PDF | `/staff/[id]/print` | A4 quotation on the GTT letterhead (Save as PDF) |
| Pilot metrics | `/staff/metrics` | Time to draft and approval, match mix, completeness, weekly volume |
| Privacy | `/[locale]/privacy` | Bilingual privacy notice (PDPL) |
| AI calls | `src/lib/ai.ts` | Chat (streaming), RFQ extraction, catalog matching, quote notes — Claude Opus 5.5 with server-side refusal fallback |
| Catalog | `src/lib/catalog.ts` | Product lines, suppliers and clients as published on algte.com and in GTT's profiles |
| Storage | `src/lib/store.ts` | Vercel Blob (private) in production, `.data/` locally |

## How a request flows

1. A visitor chats (Arabic or English) and can attach up to 3 specification PDFs (8 MB each).
2. "Send request" extracts a structured RFQ (customer, items, specs, quantities, installation/training, delivery).
3. Each item is matched to the catalog as **in catalog**, **partial match** or **needs specialist**, with the specs to confirm.
4. Staff open `/staff`, review, create a quotation draft (cover note + technical notes), add prices and approve.
   Nothing is sent to a customer automatically.

## Environment variables

| Name | Where | Purpose |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | Vercel → Project → Settings → Environment Variables | Claude API key for the assistant |
| `STAFF_PASSWORD` | Vercel (set) | Password for `/staff` |
| `BLOB_READ_WRITE_TOKEN` | Vercel (set by the connected Blob store) | Request and spec-file storage (private, Dubai) |
| `RESEND_API_KEY`, `NOTIFY_TO`, `MAIL_FROM` | Vercel | New-request alerts to sales and confirmations to customers (skipped until set) |
| `QUOTE_VAT_NUMBER` | Vercel (optional) | Printed on the quotation letterhead |

Without `ANTHROPIC_API_KEY` the assistant runs in **demo mode** (rules-based matching, clearly labelled).

## Local development

```bash
npm install
cp .env.example .env.local   # fill in ANTHROPIC_API_KEY and STAFF_PASSWORD
npm run dev
```

## Open items for GTT to confirm

- Founding year (profiles say 1992, 1998 and 2004; the site says "more than twenty years").
- Product models/specs per line — the assistant matches to product lines only until a model-level catalog is supplied.
- Permission to show client logos; higher-resolution hero photographs (current best is 1379 px wide).
- Quotation terms template (delivery, warranty, payment) for the staff draft.

Design and front-end skills used to build this live in `.claude/skills/` (see its README).
