import { notFound, redirect } from "next/navigation";
import { isStaff } from "@/lib/auth";
import { getRfq } from "@/lib/store";
import { StaffBar } from "../StaffBar";
import { RfqReview } from "./RfqReview";

export const dynamic = "force-dynamic";

export default async function RfqPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!(await isStaff())) redirect(`/staff/login?next=/staff/${encodeURIComponent(id)}`);
  const rfq = await getRfq(id);
  if (!rfq) notFound();
  return (
    <>
      <StaffBar />
      <RfqReview initial={rfq} />
    </>
  );
}
