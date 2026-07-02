import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ImageOff, Ticket, Gift } from "lucide-react";
import { getRegistrationDetail } from "@/lib/data/admin";
import { requireVolunteer } from "@/lib/auth";
import { StatusBadge } from "@/components/shared/status-badge";
import { ApprovalControls } from "@/components/admin/approval-controls";
import { Card } from "@/components/ui/card";
import { formatINR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function RegistrationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireVolunteer();
  const { id } = await params;
  const detail = await getRegistrationDetail(id);
  if (!detail) notFound();

  const { registration, items, payment, tickets, coupons } = detail;
  const isPending = registration.status === "pending";

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link
          href="/admin/registrations"
          className="inline-flex items-center gap-1 text-small text-text-secondary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Registrations
        </Link>
        <div className="mt-2 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-page-title font-bold text-charcoal">
              {registration.full_name}
            </h1>
            <p className="text-body text-text-secondary">
              {registration.booking_reference}
            </p>
          </div>
          <StatusBadge status={registration.status} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Details */}
        <Card className="p-5">
          <h2 className="mb-3 text-card-title text-charcoal">Family details</h2>
          <dl className="space-y-2 text-body">
            <Row label="Flat" value={registration.flat_number} />
            <Row label="Phone" value={registration.phone} />
            {registration.email && (
              <Row label="Email" value={registration.email} />
            )}
          </dl>

          <h3 className="mb-2 mt-5 text-card-title text-charcoal">Tickets</h3>
          <ul className="space-y-1.5 text-body">
            {items.map((i) => (
              <li key={i.ticket_type.id} className="flex justify-between">
                <span className="text-text-secondary">
                  {i.ticket_type.name} × {i.quantity}
                </span>
                <span className="font-medium text-charcoal">
                  {Number(i.unit_price) === 0
                    ? "Free"
                    : formatINR(Number(i.unit_price) * i.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-gold/20 pt-3">
            <span className="font-medium text-charcoal">Total</span>
            <span className="text-card-title font-bold text-kerala-700">
              {formatINR(Number(registration.total_amount))}
            </span>
          </div>
        </Card>

        {/* Payment proof */}
        <Card className="p-5">
          <h2 className="mb-3 text-card-title text-charcoal">Payment proof</h2>
          {payment?.screenshot_signed_url ? (
            <a
              href={payment.screenshot_signed_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden rounded-md border border-gold/30"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={payment.screenshot_signed_url}
                alt="UPI payment screenshot"
                className="max-h-80 w-full bg-white object-contain"
              />
            </a>
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-gold/30 py-10 text-text-muted">
              <ImageOff className="h-6 w-6" />
              <p className="text-small">
                {Number(registration.total_amount) === 0
                  ? "Free registration — no payment required."
                  : "No screenshot uploaded yet."}
              </p>
            </div>
          )}
          {payment && (
            <p className="mt-3 text-small text-text-secondary">
              Amount claimed:{" "}
              <span className="font-medium text-charcoal">
                {formatINR(Number(payment.amount))}
              </span>
            </p>
          )}
        </Card>
      </div>

      {/* Approval actions */}
      {isPending && (
        <ApprovalControls registrationId={registration.id} hasPayment={!!payment} />
      )}

      {/* Issued tickets */}
      {tickets.length > 0 && (
        <Card className="p-5">
          <h2 className="mb-3 flex items-center gap-2 text-card-title text-charcoal">
            <Ticket className="h-5 w-5 text-kerala-600" /> Issued tickets (
            {tickets.length})
          </h2>
          <ul className="divide-y divide-gold/15">
            {tickets.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between py-2 text-body"
              >
                <span className="font-mono text-small text-charcoal">
                  {t.ticket_number}
                </span>
                <span className="text-text-secondary">
                  {t.ticket_type_name}
                </span>
                <StatusBadge status={t.status} />
              </li>
            ))}
          </ul>
        </Card>
      )}

      {coupons.length > 0 && (
        <Card className="border-gold/40 p-5">
          <h2 className="mb-3 flex items-center gap-2 text-card-title text-charcoal">
            <Gift className="h-5 w-5 text-gold-700" /> Lucky draw coupons
          </h2>
          <div className="flex flex-wrap gap-2">
            {coupons.map((c) => (
              <span
                key={c.id}
                className="rounded-md border border-gold/40 bg-gold/10 px-3 py-1 font-mono text-small font-semibold text-gold-700"
              >
                {c.coupon_number}
              </span>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-text-secondary">{label}</dt>
      <dd className="font-medium text-charcoal">{value}</dd>
    </div>
  );
}
