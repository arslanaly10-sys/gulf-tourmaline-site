// Product catalog built from the categories and product lines published on algte.com
// and in GTT's company/industrial/education profiles. Product lines are what GTT
// states it supplies; specific models and specs are confirmed by GTT's specialists.

export type Bilingual = { en: string; ar: string };

export type Category = {
  slug: string;
  name: Bilingual;
  short: Bilingual;
  intro: Bilingual;
  lines: Bilingual[];
  image: string;
  sourceUrl: string;
};

export const SITE_SOURCE = "https://algte.com";

export const categories: Category[] = [
  {
    slug: "industrial-machinery-and-tools",
    name: { en: "Industrial Machinery & Tools", ar: "الآلات والمعدات الصناعية" },
    short: {
      en: "Lathes, CNC, milling, cutting and sheet-metal machines for workshops and plants.",
      ar: "مخارط وآلات CNC وفرايز وآلات قص وتشكيل صاج للورش والمصانع.",
    },
    intro: {
      en: "We import brand-new industrial machines, more than 80 types, from manual lathes to CNC centres, and deliver them installed and running. Tell us the job the machine has to do and we will shortlist the right size, power and controller.",
      ar: "نستورد آلات صناعية جديدة بأكثر من 80 نوعًا، من المخارط اليدوية إلى مراكز CNC، ونسلّمها مركّبة وجاهزة للتشغيل. أخبرنا بطبيعة العمل المطلوب، ونقترح عليك المقاس والقدرة ونظام التحكم المناسب.",
    },
    lines: [
      { en: "Lathe machines", ar: "المخارط" },
      { en: "CNC machines", ar: "آلات CNC" },
      { en: "Milling machines", ar: "آلات التفريز" },
      { en: "Grinding machines", ar: "آلات التجليخ" },
      { en: "Drilling machines", ar: "آلات الثقب" },
      { en: "Industrial saws", ar: "المناشير الصناعية" },
      { en: "Laser cutting machines", ar: "آلات القص بالليزر" },
      { en: "Plasma cutting machines", ar: "آلات القص بالبلازما" },
      { en: "Waterjet cutting machines", ar: "آلات القص بالماء" },
      { en: "Presses", ar: "المكابس" },
      { en: "Sheet metal processing", ar: "معدات تشكيل الصاج" },
      { en: "Welding machines", ar: "آلات اللحام" },
    ],
    image: "/images/gallery/43.jpg",
    sourceUrl: `${SITE_SOURCE}/business/industrial-machinery-and-tools`,
  },
  {
    slug: "training-education-solutions",
    name: { en: "Training & Education Solutions", ar: "حلول التعليم والتدريب" },
    short: {
      en: "Complete teaching labs for engineering, science and technical colleges.",
      ar: "مختبرات تعليمية متكاملة لكليات الهندسة والعلوم والكليات التقنية.",
    },
    intro: {
      en: "We equip teaching labs end to end: trainers, software, furniture, installation and instructor training. Universities, technical colleges and corporate academies across the Kingdom already teach on labs we delivered.",
      ar: "نجهّز المختبرات التعليمية من الألف إلى الياء: أجهزة التدريب والبرمجيات والأثاث والتركيب وتدريب المحاضرين. جامعات وكليات تقنية وأكاديميات شركات في أنحاء المملكة تدرّس اليوم على مختبرات سلّمناها.",
    },
    lines: [
      { en: "Laboratory equipment", ar: "معدات المختبرات" },
      { en: "Physics, chemistry and biology equipment", ar: "معدات الفيزياء والكيمياء والأحياء" },
      { en: "Mechanical & civil engineering trainers", ar: "أجهزة تدريب الهندسة الميكانيكية والمدنية" },
      { en: "Industrial automation trainers", ar: "أجهزة تدريب الأتمتة الصناعية" },
      { en: "Electricity, electronics & telecommunication", ar: "الكهرباء والإلكترونيات والاتصالات" },
      { en: "Chemical & process control instrumentation", ar: "أجهزة التحكم في العمليات الكيميائية" },
      { en: "Mechatronics engineering", ar: "هندسة الميكاترونكس" },
      { en: "Renewable & green energy", ar: "الطاقة المتجددة والنظيفة" },
      { en: "Analytical lab equipment", ar: "معدات المختبرات التحليلية" },
      { en: "Customized solutions", ar: "حلول مصممة حسب الطلب" },
      { en: "Lab furniture", ar: "أثاث المختبرات" },
      { en: "Software", ar: "البرمجيات التعليمية" },
    ],
    image: "/images/gallery/14.jpg",
    sourceUrl: `${SITE_SOURCE}/business/training--education-solutions`,
  },
  {
    slug: "test-measurement",
    name: { en: "Test & Measurement", ar: "أجهزة الاختبار والقياس" },
    short: {
      en: "Multimeters, calibrators, recorders and testers for electrical and field work.",
      ar: "أجهزة قياس متعددة ومعايرة وتسجيل وفحص للأعمال الكهربائية والميدانية.",
    },
    intro: {
      en: "From a handheld multimeter to a full calibration bench, we supply the instruments maintenance and quality teams rely on, and we keep adding new lines every year.",
      ar: "من جهاز القياس المحمول إلى منصة المعايرة الكاملة، نوفّر الأجهزة التي تعتمد عليها فرق الصيانة والجودة، ونضيف خطوطًا جديدة كل عام.",
    },
    lines: [
      { en: "Digital multimeters", ar: "أجهزة القياس الرقمية المتعددة" },
      { en: "Multifunction calibrators", ar: "أجهزة المعايرة متعددة الوظائف" },
      { en: "Power monitors / recorders", ar: "أجهزة مراقبة وتسجيل القدرة" },
      { en: "Clamp-on testers", ar: "أجهزة القياس الكلّابية" },
      { en: "Data loggers", ar: "مسجّلات البيانات" },
      { en: "DC precision measuring instruments", ar: "أجهزة القياس الدقيقة للتيار المستمر" },
      { en: "Insulation testers", ar: "أجهزة فحص العزل" },
      { en: "Earth ground testers", ar: "أجهزة فحص التأريض" },
      { en: "Digital luminance meters (lux meters)", ar: "أجهزة قياس شدة الإضاءة" },
      { en: "Analog DC ammeters & voltmeters", ar: "أجهزة الأميتر والفولتميتر التناظرية" },
      { en: "Digital thermometers", ar: "موازين الحرارة الرقمية" },
      { en: "Colorimeters", ar: "أجهزة قياس اللون" },
    ],
    image: "/images/business/test-measurement.png",
    sourceUrl: `${SITE_SOURCE}/business/test--measurement`,
  },
  {
    slug: "scientific-research",
    name: { en: "Scientific & Research", ar: "المعدات العلمية والبحثية" },
    short: {
      en: "Spectrometers, material and petroleum testing, ovens, incubators, microscopes.",
      ar: "مطيافات ومعدات اختبار المواد والبترول وأفران وحاضنات ومجاهر.",
    },
    intro: {
      en: "Research and quality labs come to us for instruments that hold their calibration: spectrometers, material and petroleum testing systems, incubators, sterilizers and the glassware around them.",
      ar: "تعتمد علينا مختبرات البحث والجودة في أجهزة تحافظ على دقتها: المطيافات وأنظمة اختبار المواد والبترول والحاضنات وأجهزة التعقيم والأدوات الزجاجية المكمّلة لها.",
    },
    lines: [
      { en: "Spectrometers", ar: "المطيافات" },
      { en: "Material testing equipment", ar: "معدات اختبار المواد" },
      { en: "Petroleum testing equipment", ar: "معدات اختبار المنتجات البترولية" },
      { en: "Ovens", ar: "الأفران المخبرية" },
      { en: "Extraction / evaporation", ar: "أجهزة الاستخلاص والتبخير" },
      { en: "Sterilizers", ar: "أجهزة التعقيم" },
      { en: "Incubators", ar: "الحاضنات" },
      { en: "Industrial furnaces", ar: "الأفران الصناعية" },
      { en: "Microscopy", ar: "المجاهر" },
      { en: "Laboratory glassware", ar: "الأدوات الزجاجية المخبرية" },
      { en: "pH meters", ar: "أجهزة قياس الأس الهيدروجيني" },
    ],
    image: "/images/business/scientific.png",
    sourceUrl: `${SITE_SOURCE}/business/scientific--research`,
  },
  {
    slug: "ndt-inspection",
    name: { en: "NDT & Inspection", ar: "الفحص غير الإتلافي والتفتيش" },
    short: {
      en: "Radiography, ultrasonic, eddy current and hardness testing.",
      ar: "التصوير الإشعاعي والفحص بالموجات فوق الصوتية والتيارات الدوامية واختبار الصلادة.",
    },
    intro: {
      en: "Inspection teams use our NDT systems to find what the eye can't: radiography, ultrasonic and eddy-current testing, plus hardness testing for incoming material.",
      ar: "تستخدم فرق التفتيش أنظمتنا للفحص غير الإتلافي لاكتشاف ما لا تراه العين: التصوير الإشعاعي والموجات فوق الصوتية والتيارات الدوامية، إضافة إلى اختبار صلادة المواد الواردة.",
    },
    lines: [
      { en: "Computed radiography", ar: "التصوير الإشعاعي المحوسب" },
      { en: "Digital radiography", ar: "التصوير الإشعاعي الرقمي" },
      { en: "Ultrasonic testing", ar: "الفحص بالموجات فوق الصوتية" },
      { en: "Eddy current", ar: "الفحص بالتيارات الدوامية" },
      { en: "Hardness testing", ar: "اختبار الصلادة" },
    ],
    image: "/images/business/ndt.png",
    sourceUrl: `${SITE_SOURCE}/business/ndt--inspection`,
  },
  {
    slug: "elearning-simulation",
    name: { en: "E-Learning & Simulation", ar: "التعلم الإلكتروني والمحاكاة" },
    short: {
      en: "Web-based industrial simulations for maintenance, power and process training.",
      ar: "محاكاة صناعية عبر الويب للتدريب على الصيانة والطاقة والعمليات.",
    },
    intro: {
      en: "Let trainees practise on a plant before they touch one. Our web-based simulations cover maintenance, power generation, instrumentation and process operations, built with leading subject experts.",
      ar: "دع المتدرب يتمرّن على المصنع قبل أن يلمسه. تغطي برامج المحاكاة لدينا الصيانة وتوليد الطاقة والأجهزة الدقيقة وتشغيل العمليات، وقد صُممت مع خبراء متخصصين.",
    },
    lines: [
      { en: "Safety, health and plant science", ar: "السلامة والصحة وعلوم المصانع" },
      { en: "Mechanical maintenance", ar: "الصيانة الميكانيكية" },
      { en: "Electrical transmission and distribution", ar: "نقل وتوزيع الكهرباء" },
      { en: "Electrical maintenance", ar: "الصيانة الكهربائية" },
      { en: "Power generating systems and operation", ar: "أنظمة توليد الطاقة وتشغيلها" },
      { en: "Instrumentation and control", ar: "الأجهزة الدقيقة والتحكم" },
      { en: "Process systems and operations", ar: "أنظمة العمليات وتشغيلها" },
      { en: "Industrial machining and welding", ar: "التشغيل الصناعي واللحام" },
    ],
    image: "/images/banner/elearning.jpg",
    sourceUrl: `${SITE_SOURCE}/business/elearning--simulation`,
  },
  {
    slug: "installation-training",
    name: { en: "Installation & Training", ar: "التركيب والتدريب" },
    short: {
      en: "On-site installation, commissioning, operator training and after-sales support.",
      ar: "التركيب في الموقع والتشغيل التجريبي وتدريب المشغّلين ودعم ما بعد البيع.",
    },
    intro: {
      en: "Delivery is not the finish line. Our engineers install, commission and test what we supply, train your operators where and when it suits you, and stay on call under warranty.",
      ar: "التسليم ليس نهاية العمل. يركّب مهندسونا ما نوفّره ويشغّلونه ويختبرونه، ويدرّبون المشغّلين في المكان والوقت المناسبين لكم، ويبقون على تواصل خلال فترة الضمان.",
    },
    lines: [
      { en: "Electrical installation", ar: "التركيبات الكهربائية" },
      { en: "Mechanical installation", ar: "التركيبات الميكانيكية" },
      { en: "Industrial installation", ar: "التركيبات الصناعية" },
      { en: "Warranty and after-sales support", ar: "الضمان ودعم ما بعد البيع" },
    ],
    image: "/images/banner/installation.jpg",
    sourceUrl: `${SITE_SOURCE}/business/installation--training`,
  },
  {
    slug: "industrial-materials",
    name: { en: "Industrial Materials", ar: "المواد الصناعية" },
    short: {
      en: "Hand and power tools, welding, safety, electrical, plumbing and steel.",
      ar: "عدد يدوية وكهربائية ومستلزمات لحام وسلامة وكهرباء وسباكة وحديد.",
    },
    intro: {
      en: "One supplier for the everyday materials a plant or project burns through: tools, welding consumables, safety gear, electrical and plumbing materials, fasteners and steel in recognised grades.",
      ar: "مورّد واحد للمواد اليومية التي يستهلكها المصنع أو المشروع: العدد ومستهلكات اللحام ومعدات السلامة والمواد الكهربائية والصحية والمثبّتات والحديد بدرجات معتمدة.",
    },
    lines: [
      { en: "Hand tools", ar: "العدد اليدوية" },
      { en: "Power tools", ar: "العدد الكهربائية" },
      { en: "Welding equipment and consumables", ar: "معدات ومستهلكات اللحام" },
      { en: "Safety materials (PPE)", ar: "معدات الوقاية والسلامة" },
      { en: "Electrical materials", ar: "المواد الكهربائية" },
      { en: "Plumbing materials and valves", ar: "مواد السباكة والمحابس" },
      { en: "Fasteners and bolts", ar: "المثبّتات والمسامير" },
      { en: "Steel materials (ASTM, BS, DIN, AISI grades)", ar: "مواد الحديد (درجات ASTM وBS وDIN وAISI)" },
      { en: "Carpentry materials", ar: "مستلزمات النجارة" },
    ],
    image: "/images/business/industrial-materials.png",
    sourceUrl: `${SITE_SOURCE}/business/industrial-materials`,
  },
  {
    slug: "construction-material",
    name: { en: "Construction Material", ar: "مواد البناء" },
    short: {
      en: "Building, electrical, plumbing, sanitary and steel materials for projects.",
      ar: "مواد بناء وكهرباء وسباكة وأدوات صحية وحديد للمشاريع.",
    },
    intro: {
      en: "Contractors use us to keep sites supplied with building, electrical, plumbing, sanitary and steel materials, delivered to the gate with signed delivery notes.",
      ar: "يعتمد علينا المقاولون في إمداد مواقعهم بمواد البناء والكهرباء والسباكة والأدوات الصحية والحديد، مع التوصيل حتى بوابة الموقع وسندات تسليم موقّعة.",
    },
    lines: [
      { en: "Building materials", ar: "مواد البناء" },
      { en: "Electrical materials", ar: "المواد الكهربائية" },
      { en: "Safety materials", ar: "مواد السلامة" },
      { en: "Carpentry materials", ar: "مستلزمات النجارة" },
      { en: "Plumbing materials", ar: "مواد السباكة" },
      { en: "Sanitary materials", ar: "الأدوات الصحية" },
      { en: "Steel materials", ar: "مواد الحديد" },
    ],
    image: "/images/business/construction.jpg",
    sourceUrl: `${SITE_SOURCE}/business/construction-material`,
  },
];

// Suppliers listed on algte.com (About) and in the Education profile.
export const suppliers: { name: string; country: Bilingual; logo?: string }[] = [
  { name: "Christiani", country: { en: "Germany", ar: "ألمانيا" }, logo: "/images/suppliers/christiani.png" },
  { name: "KNUTH", country: { en: "Germany", ar: "ألمانيا" }, logo: "/images/suppliers/knuth.png" },
  { name: "ZwickRoell", country: { en: "Germany", ar: "ألمانيا" }, logo: "/images/suppliers/zwick.png" },
  { name: "TSI", country: { en: "UK", ar: "المملكة المتحدة" }, logo: "/images/suppliers/tsi.png" },
  { name: "Morgan Rushworth", country: { en: "UK", ar: "المملكة المتحدة" }, logo: "/images/suppliers/morgan-rushworth.png" },
  { name: "PIGNAT", country: { en: "France", ar: "فرنسا" }, logo: "/images/suppliers/pignat.png" },
  { name: "LANGLOIS", country: { en: "France", ar: "فرنسا" }, logo: "/images/suppliers/langlois.png" },
  { name: "Starrett", country: { en: "USA", ar: "الولايات المتحدة" }, logo: "/images/suppliers/starrett.png" },
  { name: "Everett", country: { en: "USA", ar: "الولايات المتحدة" }, logo: "/images/suppliers/everett.png" },
  { name: "WAZER", country: { en: "USA", ar: "الولايات المتحدة" }, logo: "/images/suppliers/wazer.png" },
  { name: "Polaris", country: { en: "USA", ar: "الولايات المتحدة" } },
  { name: "ETECH", country: { en: "USA", ar: "الولايات المتحدة" } },
  { name: "STARMANS", country: { en: "Czech Republic", ar: "التشيك" }, logo: "/images/suppliers/starmans.png" },
  { name: "SIUI", country: { en: "China", ar: "الصين" }, logo: "/images/suppliers/siui.png" },
  { name: "SMAC Machinery", country: { en: "China", ar: "الصين" }, logo: "/images/suppliers/smac.png" },
  { name: "Faithful", country: { en: "China", ar: "الصين" }, logo: "/images/suppliers/faithful.png" },
  { name: "Technocrat Plasma", country: { en: "India", ar: "الهند" }, logo: "/images/suppliers/technocrat.png" },
];

export const clients: { name: Bilingual; logo?: string }[] = [
  { name: { en: "Saudi Aramco", ar: "أرامكو السعودية" }, logo: "/images/clients/aramco.jpeg" },
  { name: { en: "SABIC", ar: "سابك" }, logo: "/images/clients/sabic.jpeg" },
  { name: { en: "Ma'aden", ar: "معادن" }, logo: "/images/clients/maaden.jpeg" },
  { name: { en: "Marafiq", ar: "مرافق" }, logo: "/images/clients/marafiq.jpeg" },
  { name: { en: "Sadara", ar: "صدارة" }, logo: "/images/clients/sadara.jpeg" },
  { name: { en: "KFUPM", ar: "جامعة الملك فهد للبترول والمعادن" }, logo: "/images/clients/king_fahd.jpeg" },
  { name: { en: "King Faisal University", ar: "جامعة الملك فيصل" }, logo: "/images/clients/kfu.jpeg" },
  { name: { en: "Jubail Technical Institute", ar: "معهد الجبيل التقني" }, logo: "/images/clients/jti.jpeg" },
  { name: { en: "Royal Commission for Jubail", ar: "الهيئة الملكية بالجبيل" }, logo: "/images/clients/jubail.jpeg" },
];

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}

/** Compact catalog text used as grounding for the assistant. */
export function catalogForPrompt(): string {
  return categories
    .map(
      (c) =>
        `## ${c.name.en} / ${c.name.ar} [slug: ${c.slug}] (source: ${c.sourceUrl})\n${c.intro.en}\nProduct lines:\n${c.lines
          .map((l) => `- ${l.en} / ${l.ar}`)
          .join("\n")}`,
    )
    .join("\n\n");
}
