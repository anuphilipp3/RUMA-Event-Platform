import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getFamilyByReference } from "@/lib/data/membership";
import { getOrgSettings } from "@/lib/data/org-settings";
import { MembershipReceipt } from "@/components/membership/membership-receipt";
import { formatINR, amountInWords } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ reference: string }> },
) {
  const { reference } = await params;
  const profile = await getFamilyByReference(decodeURIComponent(reference));

  if (!profile) {
    return NextResponse.json({ error: "Family not found." }, { status: 404 });
  }
  const { family, members } = profile;
  if (family.status !== "active") {
    return NextResponse.json(
      { error: "The receipt is available once the membership is approved." },
      { status: 409 },
    );
  }

  const settings = await getOrgSettings();
  const planName =
    family.membership_type === "annual"
      ? "Annual Membership"
      : "Long-term Membership";
  const validUntil =
    family.membership_type === "lifetime" && !family.expires_at
      ? "Lifetime"
      : fmtDate(family.expires_at);

  const buffer = await renderToBuffer(
    MembershipReceipt({
      associationName: settings.associationName,
      associationAddress: settings.associationAddress,
      receiptNo: family.receipt_no || family.membership_reference,
      date: fmtDate(family.joined_at ?? family.approved_at),
      receivedFrom: family.primary_contact,
      flat: family.flat_number,
      membership: planName,
      // @react-pdf's built-in font lacks the ₹ glyph — use "Rs." so it renders cleanly.
      amount: formatINR(Number(family.membership_amount)).replace("₹", "Rs. "),
      amountWords: amountInWords(Number(family.membership_amount)),
      validUntil,
      reference: family.membership_reference,
      paymentMode: family.payment_method ?? undefined,
      transactionRef: family.transaction_ref ?? undefined,
      members: members.map((m) => m.full_name),
      signatory: settings.signatoryName,
    }),
  );

  const fileTag =
    family.receipt_no?.replace(/\W+/g, "-") ?? family.membership_reference;
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="ruma-receipt-${fileTag}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
