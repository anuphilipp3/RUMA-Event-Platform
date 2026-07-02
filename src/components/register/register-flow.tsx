"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { RumaMark } from "@/components/shared/ruma-mark";
import { ThemeScope } from "@/components/shared/theme-scope";
import { Button } from "@/components/ui/button";
import { StepperHeader } from "./stepper-header";
import { StepFamily } from "./step-family";
import { StepDetails } from "./step-details";
import { TicketSelector } from "./ticket-selector";
import { OrderSummaryCard } from "./order-summary-card";
import { PaymentStep } from "./payment-step";
import { SuccessStep } from "./success-step";
import { buildSummary, memberDiscount } from "@/lib/domain/pricing";
import type { RegistrationInput } from "@/lib/domain/validation";
import { submitRegistration } from "@/app/e/[slug]/register/actions";
import type { EventWithTicketTypes } from "@/lib/data/events";
import type { CreateRegistrationResult } from "@/lib/data/registrations";
import type { OrgBrand } from "@/lib/domain/membership";

type Step = "family" | "details" | "tickets" | "review" | "payment" | "success";

const EMPTY_REGISTRANT: RegistrationInput = {
  fullName: "",
  flatNumber: "",
  phone: "",
  email: "",
};

export function RegisterFlow({
  event,
  brand,
}: {
  event: EventWithTicketTypes;
  brand: OrgBrand;
}) {
  const [step, setStep] = useState<Step>("family");
  const [registrant, setRegistrant] =
    useState<RegistrationInput>(EMPTY_REGISTRANT);
  const [familyId, setFamilyId] = useState<string | undefined>(undefined);
  const [familyName, setFamilyName] = useState<string | null>(null);
  const [memberInfo, setMemberInfo] = useState<{
    count: number;
    active: boolean;
  } | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [result, setResult] = useState<CreateRegistrationResult | null>(null);
  const [pending, startTransition] = useTransition();

  const summary = useMemo(
    () =>
      buildSummary(
        event.ticket_types,
        Object.entries(quantities).map(([ticketTypeId, quantity]) => ({
          ticketTypeId,
          quantity,
        })),
        event.lucky_draw_enabled ? event.coupons_per_paid_ticket : 0,
      ),
    [
      event.ticket_types,
      event.coupons_per_paid_ticket,
      event.lucky_draw_enabled,
      quantities,
    ],
  );

  const previewDiscount = useMemo(() => {
    if (
      !event.member_discount_enabled ||
      !memberInfo?.active ||
      memberInfo.count <= 0
    ) {
      return 0;
    }
    return memberDiscount(summary, {
      percent: event.member_discount_percent,
      eligibleUnits: memberInfo.count,
    }).discountAmount;
  }, [
    event.member_discount_enabled,
    event.member_discount_percent,
    memberInfo,
    summary,
  ]);

  const stepIndex: Record<Step, number> = {
    family: 0,
    details: 0,
    tickets: 1,
    review: 2,
    payment: 3,
    success: 3,
  };

  function createRegistration() {
    startTransition(async () => {
      const res = await submitRegistration({
        eventId: event.id,
        familyId,
        registrant,
        selection: summary.lines.map((l) => ({
          ticketTypeId: l.ticketTypeId,
          quantity: l.quantity,
        })),
      });
      if (!res.ok || !res.result) {
        toast.error(res.error ?? "Could not submit. Please try again.");
        return;
      }
      setResult(res.result);
      setStep(res.result.requiresPayment ? "payment" : "success");
    });
  }

  return (
    <ThemeScope event={event} className="flex min-h-dvh flex-col bg-ivory">
      <header className="border-b border-gold/15 bg-ivory/90">
        <div className="mx-auto flex h-16 max-w-content items-center justify-between px-4">
          <Link href={`/e/${event.slug}`} className="text-kerala-700">
            <RumaMark name={brand.name} tagline={brand.tagline} logoUrl={brand.logoUrl} />
          </Link>
          {step !== "success" && (
            <Link
              href={`/e/${event.slug}`}
              className="text-small text-text-secondary hover:underline"
            >
              Cancel
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-6">
        {step !== "success" && (
          <div className="mb-6">
            <StepperHeader current={stepIndex[step]} />
          </div>
        )}

        {step === "family" && (
          <StepFamily
            onUseFamily={(family) => {
              setRegistrant({
                fullName: family.primaryContact,
                flatNumber: family.flatNumber,
                phone: family.phone,
                email: family.email ?? "",
              });
              setFamilyId(family.id);
              setFamilyName(family.familyName);
              setMemberInfo({
                count: family.memberCount,
                active: family.isActiveMember,
              });
              setStep("details");
            }}
            onGuest={() => {
              setFamilyId(undefined);
              setFamilyName(null);
              setStep("details");
            }}
          />
        )}

        {step === "details" && (
          <Section title="Your details">
            {familyName && (
              <div className="mb-4 flex items-center justify-between gap-2 rounded-md border border-kerala-600/25 bg-kerala-50 px-3 py-2">
                <p className="text-small text-kerala-700">
                  Registering as{" "}
                  <span className="font-semibold">{familyName} Family</span>
                </p>
                <button
                  type="button"
                  onClick={() => setStep("family")}
                  className="text-small font-medium text-kerala-700 hover:underline"
                >
                  Change
                </button>
              </div>
            )}
            <StepDetails
              defaultValues={registrant}
              onSubmit={(values) => {
                setRegistrant(values);
                setStep("tickets");
              }}
            />
          </Section>
        )}

        {step === "tickets" && (
          <Section
            title="Select tickets"
            description="Add a ticket for each family member attending."
          >
            <TicketSelector
              ticketTypes={event.ticket_types}
              quantities={quantities}
              onChange={(id, qty) =>
                setQuantities((prev) => ({ ...prev, [id]: qty }))
              }
            />
            {summary.totalTickets > 0 && (
              <div className="mt-6">
                <OrderSummaryCard
                summary={summary}
                discountAmount={previewDiscount}
                discountPercent={event.member_discount_percent}
              />
              </div>
            )}
            <StepNav
              onBack={() => setStep("details")}
              onNext={() => setStep("review")}
              nextLabel="Review Summary"
              nextDisabled={summary.totalTickets === 0}
            />
          </Section>
        )}

        {step === "review" && (
          <Section title="Review your registration">
            <div className="space-y-4">
              <dl className="rounded-md border border-gold/20 bg-white p-4 text-body">
                <ReviewRow label="Name" value={registrant.fullName} />
                <ReviewRow label="Flat" value={registrant.flatNumber} />
                <ReviewRow label="Phone" value={registrant.phone} />
                {registrant.email && (
                  <ReviewRow label="Email" value={registrant.email} />
                )}
              </dl>
              <OrderSummaryCard
                summary={summary}
                discountAmount={previewDiscount}
                discountPercent={event.member_discount_percent}
              />
            </div>
            <StepNav
              onBack={() => setStep("tickets")}
              onNext={createRegistration}
              nextLabel={
                summary.totalPayable - previewDiscount > 0
                  ? "Make Payment"
                  : "Submit Registration"
              }
              busy={pending}
            />
          </Section>
        )}

        {step === "payment" && result && (
          <Section title="Complete payment">
            <PaymentStep
              registrationId={result.registrationId}
              bookingReference={result.bookingReference}
              amount={result.totalPayable}
              upiId={result.upiId}
              upiPayeeName={result.upiPayeeName}
              onUploaded={() => setStep("success")}
            />
          </Section>
        )}

        {step === "success" && result && (
          <SuccessStep
            bookingReference={result.bookingReference}
            requiresPayment={result.requiresPayment}
          />
        )}
      </main>
    </ThemeScope>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h1 className="text-section-title text-charcoal">{title}</h1>
      {description && (
        <p className="mt-1 text-small text-text-secondary">{description}</p>
      )}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function StepNav({
  onBack,
  onNext,
  nextLabel,
  nextDisabled,
  busy,
}: {
  onBack: () => void;
  onNext: () => void;
  nextLabel: string;
  nextDisabled?: boolean;
  busy?: boolean;
}) {
  return (
    <div className="mt-6 flex gap-3">
      <Button type="button" variant="secondary" size="lg" onClick={onBack}>
        <ArrowLeft /> Back
      </Button>
      <Button
        type="button"
        size="lg"
        className="flex-1"
        onClick={onNext}
        disabled={nextDisabled || busy}
      >
        {busy ? (
          <>
            <Loader2 className="animate-spin" /> Please wait…
          </>
        ) : (
          nextLabel
        )}
      </Button>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-gold/10 py-1.5 last:border-0">
      <dt className="text-text-secondary">{label}</dt>
      <dd className="font-medium text-charcoal">{value}</dd>
    </div>
  );
}
