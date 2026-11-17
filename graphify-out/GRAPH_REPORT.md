# Graph Report - src  (2026-11-17)

## Corpus Check
- Corpus is ~14,307 words - fits in a single context window. You may not need a graph.

## Summary
- 176 nodes · 443 edges · 7 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Public Inner Pages
- Assistant API & AI Calls
- Staff Quote Review
- Layouts & Fonts
- Chat Client UI
- Home & Catalog Data
- Staff Authentication

## God Nodes (most connected - your core abstractions)
1. `t()` - 37 edges
2. `isLocale()` - 30 edges
3. `AssistantChat()` - 11 edges
4. `PageHead()` - 11 edges
5. `isStaff()` - 10 edges
6. `getRfq()` - 9 edges
7. `saveRfq()` - 8 edges
8. `LocaleLayout()` - 7 edges
9. `categories` - 7 edges
10. `Locale` - 7 edges

## Surprising Connections (you probably didn't know these)
- `LocaleLayout()` --calls--> `isLocale()`  [EXTRACTED]
  app/[locale]/layout.tsx → lib/i18n.ts
- `LocaleLayout()` --calls--> `t()`  [EXTRACTED]
  app/[locale]/layout.tsx → lib/i18n.ts
- `Home()` --calls--> `isLocale()`  [EXTRACTED]
  app/[locale]/page.tsx → lib/i18n.ts
- `Home()` --calls--> `t()`  [EXTRACTED]
  app/[locale]/page.tsx → lib/i18n.ts
- `Quote()` --calls--> `AssistantChat()`  [EXTRACTED]
  app/[locale]/quote/page.tsx → components/AssistantChat.tsx

## Import Cycles
- None detected.

## Communities (7 total, 0 thin omitted)

### Community 0 - "Public Inner Pages"
Cohesion: 0.14
Nodes (28): About(), generateMetadata(), Careers(), generateMetadata(), Contact(), generateMetadata(), Gallery(), generateMetadata() (+20 more)

### Community 1 - "Assistant API & AI Calls"
Cohesion: 0.09
Nodes (31): maxDuration, POST(), runtime, maxDuration, POST(), runtime, POST(), BETAS (+23 more)

### Community 2 - "Staff Quote Review"
Cohesion: 0.11
Nodes (25): maxDuration, runtime, PATCH(), STATUSES, dynamic, RfqPage(), RfqReview(), sar() (+17 more)

### Community 3 - "Layouts & Fonts"
Cohesion: 0.15
Nodes (10): LocaleLayout(), viewport, metadata, AssistantLauncher(), SiteFooter(), SiteHeader(), plex, plexArabic (+2 more)

### Community 4 - "Chat Client UI"
Cohesion: 0.19
Nodes (8): AssistantChat(), onFiles(), Pdf, Result, Rich(), toBase64(), Turn, Locale

### Community 5 - "Home & Catalog Data"
Cohesion: 0.22
Nodes (10): Home(), WORK, WordHighlight(), Bilingual, catalogForPrompt(), categories, Category, clients (+2 more)

### Community 6 - "Staff Authentication"
Cohesion: 0.31
Nodes (5): POST(), checkPassword(), STAFF_COOKIE, staffToken(), token()

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `t()` connect `Public Inner Pages` to `Layouts & Fonts`, `Chat Client UI`, `Home & Catalog Data`?**
  _High betweenness centrality (0.101) - this node is a cross-community bridge._
- **Should `Public Inner Pages` be split into smaller, more focused modules?**
  _Cohesion score 0.13900134952766532 - nodes in this community are weakly interconnected._
- **Why does `AssistantChat()` connect `Chat Client UI` to `Public Inner Pages`, `Layouts & Fonts`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Should `Assistant API & AI Calls` be split into smaller, more focused modules?**
  _Cohesion score 0.09388335704125178 - nodes in this community are weakly interconnected._
- **Why does `isLocale()` connect `Public Inner Pages` to `Layouts & Fonts`, `Home & Catalog Data`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Should `Staff Quote Review` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._
- **Should `Layouts & Fonts` be split into smaller, more focused modules?**
  _Cohesion score 0.1471861471861472 - nodes in this community are weakly interconnected._