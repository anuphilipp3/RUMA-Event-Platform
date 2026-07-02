import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Clock, CheckCircle2, XCircle, CalendarDays, Download } from "lucide-react";
import { getFamilyByReference } from "@/lib/data/membership";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  RELATIONSHIP_LABEL,
  AGE_GROUP_LABEL,
  effectiveFamilyStatus,
} from "@/lib/domain/membership";
import { formatEventDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Family Profile · RUMA" };

const STATUS = {
  pending: { icon: Clock, label: "Pending approval", cls: "border-gold/40 bg-gold/10 text-gold-700" },
  active: { icon: CheckCircle2, label: "Active member", cls: "border-kerala-600/30 bg-kerala-50 text-kerala-700" },
  expired: { icon: Clock, label: "Expired — renewal due", cls: "border-gold/40 bg-gold/10 text-gold-700" },
  rejected: { icon: XCircle, label: "Not approved", cls: "border-red-200 bg-red-50 text-maroon" },
  inactive: { icon: XCircle, label: "Inactive", cls: "border-red-200 bg-red-50 text-maroon" },
  archived: { icon: XCircle, label: "Archived", cls: "border-red-200 bg-red-50 text-maroon" },
} as const;

export default async function FamilyProfilePage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const profile = await getFamilyByReference(decodeURIComponent(reference));
  if (!profile) notFound();

  const { family, members, eventHistory } = profile;
  const s = STATUS[effectiveFamilyStatus(family)];
  const attended = eventHistory.filter((e) => e.status === "approved").length;
  const validUntil =
    family.membership_type === "annual" && family.expires_at
      ? new Date(family.expires_at).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : family.membership_type === "lifetime"
        ? "Lifetime"
        : null;

  return (
    <div className="paper flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 space-y-6 px-4 py-8">
        {/* Header */}
        <div>
          <p className="text-caption uppercase tracking-wide text-text-muted">
            {family.membership_reference}
          </p>
          <h1 className="font-display text-page-title font-semibold tracking-tightest text-charcoal">
            {family.family_name} Family
          </h1>
          <p className="text-body text-text-secondary">Flat {family.flat_number}</p>
        </div>

        {/* Membership status */}
        <div className={`flex items-center gap-3 rounded-lg border p-4 ${s.cls}`}>
          <s.icon className="h-5 w-5 shrink-0" />
          <div>
            <p className="text-body font-semibold capitalize">
              {family.membership_type} membership · {s.label}
            </p>
            {validUntil && family.status === "active" && (
              <p className="text-small">Valid until: {validUntil}</p>
            )}
            {family.status === "rejected" && family.rejection_reason && (
              <p className="text-small">Reason: {family.rejection_reason}</p>
            )}
          </div>
        </div>

        {/* Membership receipt — available once approved */}
        {family.status === "active" && (
          <Button asChild variant="secondary" className="w-full">
            <a
              href={`/api/membership/${family.membership_reference}/receipt`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download /> Download membership receipt
            </a>
          </Button>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Stat value={members.length} label="Members" />
          <Stat value={eventHistory.length} label="Events registered" />
          <Stat value={attended} label="Events attended" />
        </div>

        {/* Members */}
        <Card className="p-5">
          <h2 className="mb-3 text-card-title font-semibold text-charcoal">Members</h2>
          <ul className="divide-y divide-gold/15">
            {members.map((m) => (
              <li key={m.id} className="flex items-center justify-between py-2.5">
                <span className="text-body font-medium text-charcoal">{m.full_name}</span>
                <span className="text-small text-text-secondary">
                  {RELATIONSHIP_LABEL[m.relationship]} · {AGE_GROUP_LABEL[m.age_group]}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Event history */}
        <Card className="p-5">
          <h2 className="mb-3 flex items-center gap-2 text-card-title font-semibold text-charcoal">
            <CalendarDays className="h-5 w-5 text-kerala-600" /> Event history
          </h2>
          {eventHistory.length === 0 ? (
            <p className="text-small text-text-secondary">
              No event registrations yet. When you register for an event, it will appear here.
            </p>
          ) : (
            <ul className="divide-y divide-gold/15">
              {eventHistory.map((e) => (
                <li key={e.bookingReference} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-body font-medium text-charcoal">{e.eventName}</p>
                    <p className="text-small text-text-secondary">{formatEventDate(e.createdAt)}</p>
                  </div>
                  <Link href={`/booking/${e.bookingReference}`} className="shrink-0 text-small text-kerala-700 hover:underline">
                    View tickets
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <Card className="p-4 text-center">
      <p className="font-display text-3xl font-semibold text-kerala-700">{value}</p>
      <p className="text-caption text-text-secondary">{label}</p>
    </Card>
  );
}
