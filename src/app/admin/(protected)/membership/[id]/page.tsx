import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ImageOff, Users, Download } from "lucide-react";
import { requireCommittee } from "@/lib/auth";
import { getFamilyDetail } from "@/lib/data/membership-admin";
import { MembershipApproval } from "@/components/admin/membership-approval";
import { FamilyAdminControls } from "@/components/admin/family-admin-controls";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/utils";
import {
  RELATIONSHIP_LABEL,
  AGE_GROUP_LABEL,
  effectiveFamilyStatus,
  type EffectiveStatus,
} from "@/lib/domain/membership";

export const dynamic = "force-dynamic";

const BADGE: Record<EffectiveStatus, "success" | "warning" | "danger" | "neutral"> = {
  pending: "warning",
  active: "success",
  expired: "warning",
  rejected: "danger",
  inactive: "neutral",
  archived: "neutral",
};

export default async function MembershipDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const me = await requireCommittee();
  const { id } = await params;
  const detail = await getFamilyDetail(id);
  if (!detail) notFound();

  const { family, members } = detail;
  const effective = effectiveFamilyStatus(family);
  const expiryLabel =
    family.membership_type === "annual" && family.expires_at
      ? new Date(family.expires_at).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/admin/membership"
          className="inline-flex items-center gap-1 text-small text-text-secondary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Membership
        </Link>
        <div className="mt-2 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-page-title font-bold text-charcoal">
              {family.family_name} Family
            </h1>
            <p className="text-body text-text-secondary">
              {family.membership_reference}
            </p>
          </div>
          <div className="text-right">
            <Badge variant={BADGE[effective]} className="capitalize">
              {effective}
            </Badge>
            {expiryLabel && (
              <p className="mt-1 text-caption text-text-muted">
                {effective === "expired" ? "Expired" : "Renews"} {expiryLabel}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-3 text-card-title text-charcoal">Family details</h2>
          <dl className="space-y-2 text-body">
            <Row label="Contact" value={family.primary_contact} />
            <Row label="Flat" value={family.flat_number} />
            <Row label="Phone" value={family.phone} />
            {family.email && <Row label="Email" value={family.email} />}
            <Row label="Plan" value={`${family.membership_type} · ${formatINR(Number(family.membership_amount))}`} />
          </dl>

          <h3 className="mb-2 mt-5 flex items-center gap-2 text-card-title text-charcoal">
            <Users className="h-5 w-5 text-kerala-600" /> Members ({members.length})
          </h3>
          <ul className="divide-y divide-gold/15">
            {members.map((m) => (
              <li key={m.id} className="flex items-center justify-between py-2 text-body">
                <span className="font-medium text-charcoal">{m.full_name}</span>
                <span className="text-small text-text-secondary">
                  {RELATIONSHIP_LABEL[m.relationship]} · {AGE_GROUP_LABEL[m.age_group]}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 text-card-title text-charcoal">Payment proof</h2>
          {family.screenshot_signed_url ? (
            <a
              href={family.screenshot_signed_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden rounded-md border border-gold/30"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={family.screenshot_signed_url}
                alt="Membership payment screenshot"
                className="max-h-80 w-full bg-white object-contain"
              />
            </a>
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-gold/30 py-10 text-text-muted">
              <ImageOff className="h-6 w-6" />
              <p className="text-small">
                {Number(family.membership_amount) === 0
                  ? "Free membership — no payment required."
                  : "No screenshot uploaded yet."}
              </p>
            </div>
          )}
        </Card>
      </div>

      {family.status === "active" && (
        <a
          href={`/api/membership/${family.membership_reference}/receipt`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-small font-medium text-kerala-700 hover:underline"
        >
          <Download className="h-4 w-4" /> Download / share membership receipt
        </a>
      )}

      {family.status === "pending" ? (
        <MembershipApproval familyId={family.id} />
      ) : null}

      <FamilyAdminControls
        familyId={family.id}
        effectiveStatus={effective}
        canDelete={me.role === "admin"}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-text-secondary">{label}</dt>
      <dd className="font-medium capitalize text-charcoal">{value}</dd>
    </div>
  );
}
