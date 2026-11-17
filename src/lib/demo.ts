import "server-only";
// Demo mode: a rules-based stand-in for the Claude calls, used when ANTHROPIC_API_KEY is not
// set. It runs the same flow (chat → extraction → catalog matching → quote notes) with keyword
// matching against the published catalog, so the prototype can be shown before a key exists.

import { categories, type Category } from "./catalog";
import type { Extraction, Locale, MatchResult } from "./types";
import type { ChatTurn, UploadedPdf } from "./ai";

export const isDemo = () => !process.env.ANTHROPIC_API_KEY;

// ---------- text helpers ----------
const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
function norm(s: string) {
  return s
    .replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d)))
    .replace(/[ً-ْـ]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .toLowerCase();
}
const isArabic = (s: string) => /[؀-ۿ]/.test(s);

// Synonyms per catalog product line (English line name → words customers use).
const SYN: Record<string, string[]> = {
  "pH meters": ["ph", "حموضه", "هيدروجيني"],
  Microscopy: ["microscope", "مجهر", "مجاهر", "ميكروسكوب"],
  Incubators: ["incubator", "حاضن"],
  Ovens: ["oven", "فرن", "افران"],
  Sterilizers: ["sterilizer", "autoclave", "معقم", "تعقيم", "اوتوكلاف"],
  Spectrometers: ["spectrometer", "spectrophotometer", "مطياف", "مطيافات"],
  "Laboratory glassware": ["glassware", "beaker", "زجاجيات"],
  "Material testing equipment": ["tensile", "universal testing", "utm", "اختبار الشد", "اختبار المواد"],
  "Petroleum testing equipment": ["petroleum", "flash point", "viscosity", "بترول", "لزوجه"],
  "Industrial furnaces": ["furnace", "muffle", "فرن صناعي"],
  "Extraction / evaporation": ["evaporator", "rotary", "soxhlet", "تبخير", "استخلاص"],
  "Digital multimeters": ["multimeter", "dmm", "ملتيميتر", "افوميتر"],
  "Multifunction calibrators": ["calibrator", "جهاز معايره"],
  "Power monitors / recorders": ["power analyzer", "power quality", "power monitor", "محلل قدره"],
  "Clamp-on testers": ["clamp meter", "clamp", "كلامب"],
  "Data loggers": ["data logger", "datalogger", "مسجل بيانات"],
  "Insulation testers": ["insulation", "megger", "ميجر", "عزل"],
  "Earth ground testers": ["earth", "ground tester", "تاريض"],
  "Digital luminance meters (lux meters)": ["lux", "light meter", "شده الاضاءه"],
  "Digital thermometers": ["thermometer", "ترمومتر", "ميزان حراره"],
  Colorimeters: ["colorimeter", "قياس اللون"],
  "Lathe machines": ["lathe", "مخرطه", "مخارط"],
  "CNC machines": ["cnc"],
  "Milling machines": ["milling", "تفريز", "فريزه"],
  "Grinding machines": ["grinding", "grinder", "تجليخ"],
  "Drilling machines": ["drill press", "drilling machine", "مثقاب", "اله ثقب"],
  "Industrial saws": ["band saw", "saw", "منشار", "مناشير"],
  "Laser cutting machines": ["laser"],
  "Plasma cutting machines": ["plasma", "بلازما"],
  "Waterjet cutting machines": ["waterjet", "water jet", "قص بالماء"],
  Presses: ["hydraulic press", "press", "مكبس"],
  "Sheet metal processing": ["sheet metal", "press brake", "bending", "guillotine", "صاج", "ثني"],
  "Welding machines": ["welding machine", "welder", "ماكينه لحام", "اله لحام"],
  "Computed radiography": ["computed radiography"],
  "Digital radiography": ["radiography", "x-ray", "اشعاعي"],
  "Ultrasonic testing": ["ultrasonic", "flaw detector", "موجات فوق صوتيه"],
  "Eddy current": ["eddy", "تيارات دواميه"],
  "Hardness testing": ["hardness", "صلاده"],
  "Industrial automation trainers": ["plc", "automation", "اتمته"],
  "Mechatronics engineering": ["mechatronics", "ميكاترونكس"],
  "Renewable & green energy": ["solar", "renewable", "wind turbine", "شمسي", "طاقه متجدده"],
  "Electricity, electronics & telecommunication": ["electronics trainer", "electronics", "telecommunication", "الكترونيات", "اتصالات"],
  "Chemical & process control instrumentation": ["process control", "تحكم في العمليات"],
  "Mechanical & civil engineering trainers": ["fluid mechanics", "hydraulics trainer", "civil engineering", "ميكانيكا الموائع"],
  "Physics, chemistry and biology equipment": ["physics", "chemistry", "biology", "فيزياء", "كيمياء", "احياء"],
  "Analytical lab equipment": ["analytical", "balance", "scale", "ميزان", "موازين", "تحليلي"],
  "Lab furniture": ["lab furniture", "bench", "اثاث", "طاولات"],
  Software: ["software", "برنامج", "برمجيات"],
  "Hand tools": ["hand tool", "spanner", "wrench", "عدد يدويه", "مفاتيح"],
  "Power tools": ["power tool", "angle grinder", "drill", "دريل", "عدد كهربائيه"],
  "Welding equipment and consumables": ["electrode", "welding rod", "اسلاك لحام", "الكترود"],
  "Safety materials (PPE)": ["ppe", "helmet", "gloves", "safety shoes", "خوذ", "قفازات", "احذيه سلامه"],
  "Electrical materials": ["cable", "breaker", "socket", "كابل", "كيابل", "قاطع"],
  "Plumbing materials and valves": ["valve", "pipe fitting", "محبس", "محابس", "مواسير"],
  "Fasteners and bolts": ["bolt", "screw", "anchor", "مسامير", "براغي"],
  "Steel materials (ASTM, BS, DIN, AISI grades)": ["steel", "rebar", "حديد", "صلب"],
  "Mechanical maintenance": ["simulation", "simulator", "محاكاه", "محاكي"],
};
// Words that point to a related line without naming it, so the match is only partial.
const PARTIAL_WORDS = ["balance", "scale", "ميزان", "موازين", "simulator", "simulation", "محاكي", "محاكاه"];

type Hit = { cat: Category; lineEn: string; lineAr: string; word: string };
const INDEX: { word: string; hit: Omit<Hit, "word"> }[] = [];
for (const cat of categories) {
  for (const line of cat.lines) {
    const words = new Set<string>([...(SYN[line.en] ?? []), norm(line.en)].map(norm));
    for (const w of words) INDEX.push({ word: w, hit: { cat, lineEn: line.en, lineAr: line.ar } });
  }
}
INDEX.sort((a, b) => b.word.length - a.word.length);

function findLine(segment: string): Hit | null {
  const s = ` ${norm(segment)} `;
  for (const { word, hit } of INDEX) {
    const short = word.length <= 4 && /^[a-z]+$/.test(word);
    const found = short ? new RegExp(`[^a-z]${word}[^a-z]`).test(s) : s.includes(word);
    if (found) return { ...hit, word };
  }
  return null;
}

const UNIT = "(?:l|lt|ltr|liter|litre|لتر|mm|cm|m|مم|سم|kg|g|mg|كجم|جم|ملغ|°c|درجه|c|kw|w|v|volt|فولت|a|amp|bar|psi|ml|مل|rpm|x|%)";
const SPEC_RE = new RegExp(`(±?\\d+(?:[.,]\\d+)?\\s*${UNIT}(?![a-z\\u0600-\\u06FF]))|((?:en|iso|astm|iec|ansi|bs|din)\\s?-?\\d[\\d-]*)`, "gi");
const STANDARD_RE = /(en|iso|astm|iec|ansi|bs|din)\s?-?\d/i;
const INFO_RE = /(@|اسبوع|اسابيع|week|month|شهر|تسليم|deliver|تركيب|install|تدريب|train|اسمي|my name|phone|جوال|هاتف|email|ايميل|بريد)/i;
const LEAD_RE = /^\s*(?:نحتاج(?: الى| إلى)?|نريد|نبغى|ابغى|احتاج|أحتاج|we need|we want|i need|need|please quote|quote for|و|and)\s+/i;

function parseQty(segment: string, hit: Hit | null): number | null {
  const n = norm(segment);
  const specSpans = [...n.matchAll(SPEC_RE)].map((m) => [m.index ?? 0, (m.index ?? 0) + m[0].length]);
  const nums = [...n.matchAll(/\d+/g)].filter((m) => !specSpans.some(([a, b]) => (m.index ?? 0) >= a && (m.index ?? 0) < b));
  if (!nums.length) {
    if (/[\u0600-\u06FF]{3,}(?:تين|تان)(?:\s|$)/.test(n)) return 2;
    return /\b(a|an|one)\b|واحد|واحده|^\s*و?(?:خزانه|جهاز|اله|ماكينه|منصه)/.test(n) ? 1 : null;
  }
  if (hit) {
    const at = n.indexOf(hit.word);
    const before = nums.filter((m) => (m.index ?? 0) < at);
    if (before.length) return Number(before[before.length - 1][0]);
  }
  const v = Number(nums[0][0]);
  return v > 0 && v <= 5000 ? v : null;
}

type Item = Extraction["items"][number] & { hit: Hit | null; fromLast: boolean };

function splitSegments(text: string) {
  return text
    .split(/\n|[,،;؛]|\.\s+|\s+and\s+(?=\d|an?\s|one\s|two\s|three\s)|\s+و\s+(?=\d|[\u0600-\u06FF]{3,}\s*\d)|\s+و(?=\d)/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 1);
}

function itemsFrom(text: string, ref: string, fromLast: boolean): Item[] {
  const out: Item[] = [];
  for (const seg of splitSegments(text)) {
    if (INFO_RE.test(norm(seg)) && !findLine(seg)) continue;
    if (/www\.|https?:|\.com\b/i.test(seg)) continue;
    const words = seg.split(/\s+/).length;
    const hit = findLine(seg);
    const qty = parseQty(seg, hit);
    if (words > 14 && qty === null) continue;
    if (!hit && qty === null) continue;
    if (!hit && seg.split(/\s+/).length < 2) continue;
    const specs = [...norm(seg).matchAll(SPEC_RE)].map((m) => m[0].trim()).filter((s, i, a) => a.indexOf(s) === i);
    out.push({
      description: seg.replace(LEAD_RE, "").replace(/^و(?=[\u0600-\u06FF]{3})/, "").replace(/^(?:\d+|an?|one)\s+(?:x|×)?\s*/i, "").replace(/\s+for (?:our|the) .*$/i, "").trim().slice(0, 140),
      quantity: qty,
      unit: qty !== null ? "pcs" : null,
      specs,
      sourceRef: ref,
      hit,
      fromLast,
    });
  }
  return out;
}

const CITIES: [string, string][] = [
  ["الرياض", "Riyadh"], ["الدمام", "Dammam"], ["الخبر", "Khobar"], ["الجبيل", "Jubail"], ["جده", "Jeddah"],
  ["مكه", "Makkah"], ["المدينه", "Madinah"], ["الاحساء", "Al Ahsa"], ["ينبع", "Yanbu"], ["الظهران", "Dhahran"],
  ["القطيف", "Qatif"], ["حائل", "Hail"], ["تبوك", "Tabuk"], ["ابها", "Abha"], ["حفر الباطن", "Hafr Al Batin"], ["نيوم", "NEOM"],
];

function yesNo(text: string, words: RegExp): boolean | null {
  const n = norm(text);
  const all = [...n.matchAll(new RegExp(words.source, "g"))];
  if (!all.length) return null;
  for (const m of all) {
    const at = m.index ?? 0;
    const before = n.slice(Math.max(0, at - 14), at);
    const after = n.slice(at + m[0].length, at + m[0].length + 22);
    if (/(بدون|لا |no |not |without)/.test(before)) return false;
    if (/^\s*(?::|-)?\s*(no|not needed|not required|غير مطلوب|لا)\b/.test(after)) return false;
  }
  return true;
}

const INSTALL_RE = /تركيب|\binstall(?:ation|ing)?\b/;
const TRAIN_RE = /تدريب|\btraining\b/;

export type Analysis = { extraction: Extraction; items: Item[]; locale: Locale };

export function analyze(turns: ChatTurn[], pdfTexts: { name: string; text: string }[]): Analysis {
  const userTurns = turns.filter((t) => t.role === "user");
  const allUser = userTurns.map((t) => t.text).join("\n");
  const everything = [allUser, ...pdfTexts.map((p) => p.text)].join("\n");
  const n = norm(everything);
  const lastText = userTurns[userTurns.length - 1]?.text ?? "";
  const locale: Locale = !lastText || isArabic(lastText) ? "ar" : "en";
  const pdfFresh = userTurns.length <= 1 || /ارفق|أرفق|مرفق|attach|pdf|كراسه|كراسة|spec/i.test(lastText);

  const items: Item[] = [];
  userTurns.forEach((t, i) => items.push(...itemsFrom(t.text, "chat", i === userTurns.length - 1)));
  for (const p of pdfTexts) items.push(...itemsFrom(p.text, p.name, pdfFresh).slice(0, 40));
  // Merge duplicates of the same line (a later mention updates the quantity).
  const merged: Item[] = [];
  for (const it of items) {
    const prev = it.hit ? merged.find((m) => m.hit?.lineEn === it.hit?.lineEn) : null;
    if (prev) {
      prev.quantity = it.quantity ?? prev.quantity;
      prev.specs = [...new Set([...prev.specs, ...it.specs])];
      prev.fromLast ||= it.fromLast;
    } else merged.push(it);
  }

  const email = everything.match(/[\w.+-]+@[\w-]+\.[\w.-]+/)?.[0] ?? null;
  const phone = norm(everything).match(/(?:\+?966|0)5\d[\d\s-]{7,10}/)?.[0]?.replace(/\s|-/g, "") ?? null;
  const orgM =
    everything.match(/((?:[A-Z][\w&.-]*\s){1,3}(?:Company|Co\.|University|College|Institute|School|Hospital|Corporation|Group))/) ??
    everything.match(/((?:كلية|جامعة|شركة|معهد|مؤسسة|مدرسة|مستشفى|university|college|company|institute|school|hospital)[^\n,،.]{0,40})/i);
  const nameM = everything.match(/(?:اسمي|الاسم|المهندس|م\.|eng\.?|engineer|mr\.?|ms\.?|my name is|name:)\s*([^\n,،.@\d]{2,30})/i);
  const city = CITIES.find(([ar, en]) => n.includes(ar) || n.includes(en.toLowerCase()));
  const weeksM = n.match(/(\d+)\s*(?:اسبوع|اسابيع|week)/);
  const monthsM = n.match(/(\d+)\s*(?:شهر|اشهر|month)/);
  const sector: Extraction["customer"]["sector"] = /كليه|جامعه|معهد|مدرسه|college|university|institute|school/.test(n)
    ? "education"
    : /ارامكو|aramco|بترول|oil|gas|petro/.test(n)
      ? "oil_gas"
      : /مصنع|factory|plant|شركه|company/.test(n)
        ? "industry"
        : /مقاول|contract|construction|بناء/.test(n)
          ? "construction"
          : "unknown";

  const missing: string[] = [];
  if (!merged.length) missing.push("The items needed");
  if (!email && !phone) missing.push("A contact email or phone number");
  if (!orgM) missing.push("Organization name");
  if (yesNo(everything, INSTALL_RE) === null) missing.push("Whether installation is needed");
  if (yesNo(everything, TRAIN_RE) === null) missing.push("Whether training is needed");
  if (!weeksM && !monthsM) missing.push("Required delivery time");
  for (const it of merged) if (it.quantity === null) missing.push(`Quantity for: ${it.description}`);

  const extraction: Extraction = {
    language: locale,
    customer: {
      organization: orgM?.[1]?.trim() ?? null,
      contactName: nameM?.[1]?.trim() ?? null,
      email,
      phone,
      city: city ? city[1] : null,
      sector,
    },
    summary: merged.length
      ? `Request for ${merged.length} item type(s): ${merged.map((m) => m.hit?.lineEn ?? m.description).slice(0, 5).join(", ")}${city ? `, delivery to ${city[1]}` : ""}. Prepared in demo mode by keyword matching; verify against the transcript.`
      : "No clear items were identified. Review the transcript.",
    items: merged.map(({ hit: _h, fromLast: _f, ...rest }) => rest),
    requirements: {
      installation: yesNo(everything, INSTALL_RE),
      training: yesNo(everything, TRAIN_RE),
      deliveryWeeks: weeksM ? Number(weeksM[1]) : monthsM ? Number(monthsM[1]) * 4 : null,
      deliveryLocation: city ? city[1] : null,
      budget: everything.match(/(\d[\d,]*\s*(?:sar|ريال|ر\.س))/i)?.[1] ?? null,
    },
    missingInfo: missing,
  };
  return { extraction, items: merged, locale };
}

export function demoMatch(analysis: Analysis): MatchResult["matches"] {
  return analysis.items.map((it, i) => {
    const standard = it.specs.some((s) => STANDARD_RE.test(s));
    const partialWord = it.hit && PARTIAL_WORDS.some((w) => norm(it.hit!.word) === norm(w));
    if (!it.hit || standard) {
      return {
        itemIndex: i,
        level: "specialist" as const,
        categorySlug: it.hit?.cat.slug ?? null,
        productLine: it.hit?.lineEn ?? null,
        rationale: !it.hit
          ? "No product line in the published catalog matches this item; an engineer should check whether GTT can source it."
          : "A standard is cited; compliance must be confirmed by an engineer against the supplier's certificate.",
        specsToConfirm: it.specs,
        questionsForCustomer: [],
      };
    }
    const level = it.specs.length || partialWord ? ("partial" as const) : ("offered" as const);
    return {
      itemIndex: i,
      level,
      categorySlug: it.hit.cat.slug,
      productLine: it.hit.lineEn,
      rationale:
        level === "offered"
          ? `Listed under ${it.hit.cat.name.en} → ${it.hit.lineEn}.`
          : `Closest line is ${it.hit.cat.name.en} → ${it.hit.lineEn}; the catalog does not confirm the exact variant or specs.`,
      specsToConfirm: it.specs,
      questionsForCustomer: it.quantity === null ? ["How many units are needed?"] : [],
    };
  });
}

/** Builds the assistant's next reply from the conversation so far. */
export function demoReply(turns: ChatTurn[], pdfTexts: { name: string; text: string }[]): string {
  const a = analyze(turns, pdfTexts);
  const ar = a.locale === "ar";
  const ex = a.extraction;
  const matches = demoMatch(a);
  const fresh = a.items.map((it, i) => ({ it, m: matches[i] })).filter((x) => x.it.fromLast);
  const parts: string[] = [];

  if (fresh.length) {
    parts.push(ar ? "سجّلت ما يلي:" : "Here is what I noted:");
    for (const { it, m } of fresh.slice(0, 8)) {
      const qty = it.quantity ? `${it.quantity} × ` : "";
      const name = `**${qty}${it.description}**`;
      if (m.level === "specialist") {
        parts.push(ar ? `- ${name}: سيحوّله المساعد إلى مختص من فريقنا للتأكد منه.` : `- ${name}: I will pass this to one of our specialists to confirm.`);
      } else {
        const line = ar ? it.hit!.lineAr : it.hit!.lineEn;
        const cat = it.hit!.cat.name[a.locale];
        const extra = m.level === "partial" ? (ar ? "، وسيؤكد الفريق المواصفة المطلوبة" : ", and the team will confirm the exact spec") : "";
        parts.push(ar ? `- ${name}: ضمن خط «${line}» في ${cat}${extra}.` : `- ${name}: in our ${cat} range (${line})${extra}.`);
      }
    }
    if (fresh.length > 8) parts.push(ar ? `- و${fresh.length - 8} بنود أخرى ستظهر في الطلب.` : `- and ${fresh.length - 8} more lines, included in the request.`);
  } else if (turns.filter((t) => t.role === "user").length > 1 || pdfTexts.length) {
    parts.push(ar ? "شكرًا، دوّنت ذلك." : "Thanks, noted.");
  }

  const next = !a.items.length
    ? ar
      ? "ما المعدات التي تحتاجها؟ اكتب كل بند مع الكمية، مثل: «6 أجهزة pH مكتبية و4 موازين تحليلية»، أو ارفع كراسة المواصفات بصيغة PDF."
      : "What equipment do you need? List each item with its quantity, for example \"6 benchtop pH meters and 4 analytical balances\", or upload your specification PDF."
    : !ex.customer.organization || (!ex.customer.email && !ex.customer.phone)
      ? ar
        ? "ما اسم جهتكم، وما البريد الإلكتروني أو رقم الجوال الذي نرسل عليه العرض؟"
        : "What is your organization's name, and which email or mobile number should we send the quotation to?"
      : ex.requirements.installation === null || ex.requirements.training === null
        ? ar
          ? "هل تحتاجون التركيب في الموقع وتدريب المستخدمين ضمن العرض؟"
          : "Do you need on-site installation and user training included in the quotation?"
        : ex.requirements.deliveryWeeks === null || !ex.requirements.deliveryLocation
          ? ar
            ? "متى تحتاجون التسليم، وفي أي مدينة؟"
            : "When do you need delivery, and to which city?"
          : ar
            ? "طلبك مكتمل. اضغط «أرسل الطلب لفريق المبيعات» ليراجعه فريقنا ويرسل لك عرض السعر."
            : "Your request is complete. Press \"Send request to sales\" and our team will review it and send your quotation.";
  parts.push(next);
  return parts.join("\n");
}

export function demoQuoteNotes(extraction: Extraction, matches: MatchResult["matches"], locale: Locale) {
  const ar = locale === "ar";
  const org = extraction.customer.organization ?? (ar ? "عميلنا الكريم" : "Valued customer");
  const coverNote = ar
    ? `السادة/ ${org} المحترمين،\nنشكركم على طلبكم ونرفق عرض السعر للبنود المطلوبة. راجع فريقنا الفني كل بند ومطابقته مع خطوط منتجاتنا، ونوضّح أدناه ما يحتاج تأكيدًا منكم. يسعدنا الرد على أي استفسار.`
    : `Dear ${org},\nThank you for your request. Please find our quotation for the items requested. Our technical team reviewed each line against our product range, and the notes below show anything that needs your confirmation. We are happy to answer any questions.`;
  const lineName = (en: string | null) => {
    if (!en || !ar) return en ?? "";
    for (const c of categories) for (const l of c.lines) if (l.en === en) return l.ar;
    return en;
  };
  const technicalNotes = extraction.items.map((_it, i) => {
    const m = matches.find((x) => x.itemIndex === i);
    if (!m || m.level === "specialist") return ar ? "يؤكد مهندسنا توفر هذا البند ومطابقته قبل الاعتماد النهائي." : "Our engineer will confirm availability and compliance before final approval.";
    if (m.level === "partial") return ar ? `نقترح بندًا من خط «${lineName(m.productLine)}»، مع تأكيد المواصفة: ${m.specsToConfirm.join("، ") || "المطلوبة"}.` : `Offered from our ${m.productLine} line; specification to confirm: ${m.specsToConfirm.join(", ") || "as requested"}.`;
    return ar ? `مطابق ضمن خط «${lineName(m.productLine)}».` : `Matches our ${m.productLine} line.`;
  });
  return { coverNote, technicalNotes };
}

export async function pdfTexts(pdfs: UploadedPdf[]): Promise<{ name: string; text: string }[]> {
  if (!pdfs.length) return [];
  const { extractText, getDocumentProxy } = await import("unpdf");
  const out: { name: string; text: string }[] = [];
  for (const p of pdfs) {
    try {
      const doc = await getDocumentProxy(new Uint8Array(Buffer.from(p.base64, "base64")));
      const { text } = await extractText(doc, { mergePages: true });
      out.push({ name: p.name, text: String(text).slice(0, 20000) });
    } catch {
      out.push({ name: p.name, text: "" });
    }
  }
  return out;
}
