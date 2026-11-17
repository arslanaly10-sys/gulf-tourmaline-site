import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale } from "@/lib/i18n";

const CONTENT = {
  ar: {
    title: "سياسة الخصوصية",
    updated: "آخر تحديث: نوفمبر 2026",
    sections: [
      ["من نحن", "مؤسسة تورمالين الخليج للتجارة، الدمام، المملكة العربية السعودية، هي الجهة المسؤولة عن بياناتك الشخصية التي تُجمع عبر هذا الموقع. للتواصل بشأن الخصوصية: sales@algte.com."],
      ["ما البيانات التي نجمعها", "عند استخدام مساعد عروض الأسعار أو مراسلتنا نجمع: اسمك وجهة عملك وبريدك الإلكتروني ورقم جوالك، ونص المحادثة، والملفات التي ترفعها مثل كراسات المواصفات. لا نجمع بيانات دفع عبر الموقع."],
      ["لماذا نستخدمها", "نستخدم بياناتك لإعداد عرض السعر الذي طلبته، والتواصل معك بشأنه، وتنفيذ أي طلب شراء ينتج عنه. ونعالجها بناءً على طلبك وموافقتك عند إرسال الطلب."],
      ["من يعالجها نيابة عنا", "نستعين بمزوّدي خدمات يعالجون البيانات وفق تعليماتنا فقط: Vercel لاستضافة الموقع وتخزين الطلبات والملفات في منطقة دبي، وAnthropic لتشغيل المساعد الذكي عند تفعيله، وResend لإرسال رسائل التأكيد. وقد تتم بعض هذه المعالجة خارج المملكة العربية السعودية، مع ضمانات تعاقدية لحماية البيانات. لا نبيع بياناتك ولا نشاركها لأغراض تسويقية."],
      ["مدة الاحتفاظ", "نحتفظ بالطلب ومرفقاته طوال المدة اللازمة لإعداد العرض وتنفيذ أي طلب ناتج عنه والوفاء بالتزاماتنا النظامية، ثم نحذفها."],
      ["حقوقك", "وفق نظام حماية البيانات الشخصية في المملكة يحق لك طلب الاطلاع على بياناتك أو تصحيحها أو حذفها، أو سحب موافقتك. راسلنا على sales@algte.com وسنرد خلال 30 يومًا."],
      ["الأمان", "تُنقل البيانات مشفّرة، وتُخزّن الملفات في مساحة خاصة لا يطّلع عليها إلا فريق المبيعات المخوّل."],
    ],
  },
  en: {
    title: "Privacy policy",
    updated: "Last updated: November 2026",
    sections: [
      ["Who we are", "Gulf Tourmaline Trading Est., Dammam, Saudi Arabia, is responsible for the personal data collected through this website. Privacy questions: sales@algte.com."],
      ["What we collect", "When you use the quotation assistant or contact us, we collect your name, organization, email, mobile number, the conversation text and any files you upload, such as specifications. We do not collect payment details on this site."],
      ["Why we use it", "To prepare the quotation you asked for, contact you about it and fulfil any order that follows. We process it at your request and with your consent when you send it."],
      ["Who processes it for us", "Service providers process data only on our instructions: Vercel hosts the site and stores requests and files in its Dubai region, Anthropic runs the AI assistant when it is enabled, and Resend sends confirmation emails. Some of this processing may take place outside Saudi Arabia, under contractual data-protection safeguards. We do not sell your data or share it for marketing."],
      ["How long we keep it", "We keep a request and its files for as long as needed to prepare the quotation, fulfil any resulting order and meet our legal obligations, then delete them."],
      ["Your rights", "Under Saudi Arabia's Personal Data Protection Law you may ask to access, correct or delete your data, or withdraw your consent. Email sales@algte.com and we will reply within 30 days."],
      ["Security", "Data travels encrypted, and files are kept in private storage that only authorized sales staff can open."],
    ],
  },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? { title: CONTENT[locale].title } : {};
}

export default async function Privacy({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const c = CONTENT[locale];
  return (
    <section className="section !pt-12">
      <div className="wrap max-w-[50rem]">
        <h1 className="h1 !text-[clamp(2rem,1.2rem+2.6vw,3.25rem)]">{c.title}</h1>
        <p className="mt-3 text-muted">{c.updated}</p>
        <div className="mt-10 space-y-8">
          {c.sections.map(([h, p]) => (
            <div key={h}>
              <h2 className="text-xl font-semibold">{h}</h2>
              <p className="mt-2 text-lg leading-relaxed text-muted">{p}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
