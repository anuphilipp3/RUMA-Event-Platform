"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Plus,
  Trash2,
  Check,
  CheckCircle2,
  Upload,
  Copy,
  QrCode,
} from "lucide-react";
import { RumaMark } from "@/components/shared/ruma-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { cn, formatINR } from "@/lib/utils";
import {
  membershipSchema,
  BLOOD_GROUPS,
  BLOOD_GROUP_LABEL,
  type MembershipInput,
  type MembershipPlan,
} from "@/lib/domain/membership";
import { upiLink, UPI_WALLETS, type UpiParams } from "@/lib/upi";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
} from "@/lib/domain/validation";
import { submitMembership } from "@/app/membership/actions";
import type { CreateFamilyResult } from "@/lib/data/membership";
import type { OrgBrand } from "@/lib/domain/membership";

type Step = "details" | "members" | "plan" | "payment" | "success";
const STEPS = ["Family", "Members", "Plan", "Payment"];

const RELATIONSHIPS = [
  { value: "head", label: "Head of family" },
  { value: "spouse", label: "Spouse" },
  { value: "child", label: "Child" },
  { value: "parent", label: "Parent" },
  { value: "other", label: "Other" },
] as const;
const AGE_GROUPS = [
  { value: "13_plus", label: "13 and above" },
  { value: "5_12", label: "5–12" },
  { value: "under_5", label: "Under 5" },
] as const;

export function MembershipFlow({
  plans,
  brand,
}: {
  plans: MembershipPlan[];
  brand: OrgBrand;
}) {
  const [step, setStep] = useState<Step>("details");
  const [result, setResult] = useState<CreateFamilyResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<MembershipInput>({
    resolver: zodResolver(membershipSchema),
    mode: "onTouched",
    defaultValues: {
      primaryContact: "",
      familyName: "",
      flatNumber: "",
      phone: "",
      email: "",
      membershipType: plans[0]?.key ?? "annual",
      members: [
        { fullName: "", relationship: "head", ageGroup: "13_plus", bloodGroup: "unknown" },
      ],
    },
  });
  const { register, control, handleSubmit, trigger, watch, setValue, formState } =
    form;
  const members = useFieldArray({ control, name: "members" });
  const selectedType = watch("membershipType");
  const selectedPlan = plans.find((p) => p.key === selectedType) ?? plans[0];

  const stepIndex: Record<Step, number> = {
    details: 0,
    members: 1,
    plan: 2,
    payment: 3,
    success: 3,
  };

  async function goToMembers() {
    const ok = await trigger([
      "primaryContact",
      "familyName",
      "flatNumber",
      "phone",
      "email",
    ]);
    if (ok) setStep("members");
  }
  async function goToPlan() {
    const ok = await trigger("members");
    if (ok) setStep("plan");
  }

  const create = handleSubmit(async (values) => {
    setSubmitting(true);
    const res = await submitMembership(values);
    setSubmitting(false);
    if (!res.ok || !res.result) {
      toast.error(res.error ?? "Could not submit. Please try again.");
      return;
    }
    setResult(res.result);
    setStep(res.result.requiresPayment ? "payment" : "success");
  });

  return (
    <div className="paper flex min-h-dvh flex-col">
      <header className="border-b border-gold/15 bg-ivory/90">
        <div className="mx-auto flex h-16 max-w-content items-center justify-between px-4">
          <Link href="/" className="text-kerala-700">
            <RumaMark name={brand.name} tagline={brand.tagline} logoUrl={brand.logoUrl} />
          </Link>
          {step !== "success" && (
            <Link href="/membership" className="text-small text-text-secondary hover:underline">
              Cancel
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-6">
        {step !== "success" && (
          <ol className="mb-6 flex items-center gap-1.5">
            {STEPS.map((label, i) => {
              const active = i === stepIndex[step];
              const done = i < stepIndex[step];
              return (
                <li key={label} className="flex flex-1 items-center gap-1.5">
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full text-caption font-bold",
                      done || active ? "bg-kerala-600 text-white" : "bg-cream text-text-muted",
                    )}
                  >
                    {done ? <Check className="h-4 w-4" /> : i + 1}
                  </span>
                  <span className={cn("hidden text-small font-medium sm:inline", active ? "text-charcoal" : "text-text-muted")}>
                    {label}
                  </span>
                  {i < STEPS.length - 1 && <span className="h-px flex-1 bg-gold/25" />}
                </li>
              );
            })}
          </ol>
        )}

        {step === "details" && (
          <Section title="Your family">
            <div className="space-y-4">
              <FormField label="Primary contact name" error={formState.errors.primaryContact?.message} required>
                <Input {...register("primaryContact")} placeholder="e.g. Priya Menon" />
              </FormField>
              <FormField label="Family name" error={formState.errors.familyName?.message} required>
                <Input {...register("familyName")} placeholder="e.g. Menon" />
              </FormField>
              <FormField label="Flat number" error={formState.errors.flatNumber?.message} required>
                <Input {...register("flatNumber")} placeholder="e.g. B-1204" />
              </FormField>
              <FormField label="Phone" error={formState.errors.phone?.message} required>
                <Input {...register("phone")} inputMode="numeric" placeholder="10-digit mobile" />
              </FormField>
              <FormField label="Email (optional)" error={formState.errors.email?.message}>
                <Input {...register("email")} type="email" placeholder="you@example.com" />
              </FormField>
            </div>
            <Button size="lg" className="mt-6 w-full" onClick={goToMembers}>
              Continue <ArrowRight />
            </Button>
          </Section>
        )}

        {step === "members" && (
          <Section title="Family members" description="Add everyone in your household.">
            {typeof formState.errors.members?.message === "string" && (
              <p className="mb-2 text-small text-maroon">{formState.errors.members.message}</p>
            )}
            <div className="space-y-3">
              {members.fields.map((f, i) => (
                <Card key={f.id} className="p-4">
                  <FormField label="Name" error={formState.errors.members?.[i]?.fullName?.message}>
                    <Input {...register(`members.${i}.fullName`)} placeholder="Full name" />
                  </FormField>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <Label>Relationship</Label>
                      <select {...register(`members.${i}.relationship`)} className="h-12 w-full rounded-md border border-field bg-white px-3 text-body">
                        {RELATIONSHIPS.map((r) => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>Age group</Label>
                      <select {...register(`members.${i}.ageGroup`)} className="h-12 w-full rounded-md border border-field bg-white px-3 text-body">
                        {AGE_GROUPS.map((a) => (
                          <option key={a.value} value={a.value}>{a.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Label>Blood group</Label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {BLOOD_GROUPS.map((bg) => {
                        const selected = watch(`members.${i}.bloodGroup`) === bg;
                        return (
                          <button
                            key={bg}
                            type="button"
                            onClick={() => setValue(`members.${i}.bloodGroup`, bg)}
                            aria-pressed={selected}
                            className={cn(
                              "min-w-[3rem] rounded-md border px-3 py-2 text-small font-semibold transition-colors",
                              selected
                                ? "border-kerala-600 bg-kerala-600 text-white"
                                : "border-field bg-white text-charcoal hover:border-kerala-600/60",
                            )}
                          >
                            {BLOOD_GROUP_LABEL[bg]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {members.fields.length > 1 && (
                    <button type="button" onClick={() => members.remove(i)} className="mt-3 inline-flex items-center gap-1 text-small text-maroon hover:underline">
                      <Trash2 className="h-4 w-4" /> Remove
                    </button>
                  )}
                </Card>
              ))}
            </div>
            <Button type="button" variant="secondary" size="sm" className="mt-3" onClick={() => members.append({ fullName: "", relationship: "child", ageGroup: "13_plus", bloodGroup: "unknown" })}>
              <Plus /> Add member
            </Button>
            <StepNav onBack={() => setStep("details")} onNext={goToPlan} nextLabel="Choose plan" />
          </Section>
        )}

        {step === "plan" && (
          <Section title="Choose your membership">
            <div className="space-y-3">
              {plans.map((p) => {
                const active = selectedType === p.key;
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setValue("membershipType", p.key)}
                    className={cn(
                      "w-full rounded-lg border p-5 text-left transition-colors",
                      active ? "border-kerala-600 bg-kerala-50" : "border-gold/25 bg-white hover:border-kerala-600/40",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-display text-xl font-semibold text-charcoal">{p.name}</p>
                      <p className="text-card-title font-bold text-kerala-700">
                        {p.price === 0 ? "Free" : formatINR(p.price)}
                      </p>
                    </div>
                    <ul className="mt-3 space-y-1">
                      {p.benefits.map((b) => (
                        <li key={b} className="flex items-center gap-2 text-small text-text-secondary">
                          <Check className="h-4 w-4 text-kerala-600" /> {b}
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>
            <StepNav
              onBack={() => setStep("members")}
              onNext={create}
              nextLabel={selectedPlan && selectedPlan.price > 0 ? "Continue to payment" : "Submit"}
              busy={submitting}
            />
          </Section>
        )}

        {step === "payment" && result && (
          <Section title="Complete payment">
            <MembershipPayment result={result} onUploaded={() => setStep("success")} />
          </Section>
        )}

        {step === "success" && result && (
          <div className="text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-kerala-50 text-kerala-600">
              <CheckCircle2 className="h-9 w-9" />
            </span>
            <h2 className="mt-5 font-display text-page-title font-semibold text-charcoal">
              Welcome to RUMA!
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-body text-text-secondary">
              Your membership request is in. An organizer will verify it and activate your family soon.
            </p>
            <div className="mx-auto mt-6 max-w-xs rounded-lg border border-gold/30 bg-cream/60 p-4">
              <p className="text-caption uppercase tracking-wide text-text-muted">Membership Reference</p>
              <p className="font-display text-section-title font-bold text-kerala-700">
                {result.membershipReference}
              </p>
            </div>
            <Button asChild size="lg" className="mt-6 w-full">
              <Link href={`/family/${result.membershipReference}`}>
                View family profile <ArrowRight />
              </Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

function MembershipPayment({
  result,
  onUploaded,
}: {
  result: CreateFamilyResult;
  onUploaded: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const upiParams: UpiParams = {
    vpa: result.upiId,
    payeeName: result.upiPayeeName,
    amount: result.amount,
    note: result.membershipReference,
  };

  useEffect(() => {
    let active = true;
    import("qrcode").then((QR) =>
      QR.toDataURL(upiLink(upiParams), { margin: 1, scale: 6, color: { dark: "#1F2933", light: "#FFFFFF" } }).then(
        (url) => active && setQr(url),
      ),
    );
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result.membershipReference]);

  function pick(f: File | undefined) {
    if (!f) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(f.type as never)) return toast.error("Please choose a JPG, PNG or WebP image.");
    if (f.size > MAX_UPLOAD_BYTES) return toast.error("Image is too large. Please keep it under 5 MB.");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function upload() {
    if (!file) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch(`/api/families/${result.familyId}/payment`, { method: "POST", body });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Upload failed");
      onUploaded();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not upload. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gold/30 bg-cream/60 p-5 text-center">
        <p className="text-small text-text-secondary">Membership fee</p>
        <p className="font-display text-hero font-bold leading-none text-kerala-700">
          {formatINR(result.amount)}
        </p>
      </div>

      <div className="flex flex-col items-center rounded-lg border border-gold/30 bg-white p-5">
        <p className="mb-3 flex items-center gap-1.5 text-small font-medium text-text-secondary">
          <QrCode className="h-4 w-4" /> Scan to pay
        </p>
        {qr ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qr} alt="UPI QR" width={180} height={180} className="rounded-md" />
        ) : (
          <div className="h-[180px] w-[180px] animate-pulse rounded-md bg-cream" />
        )}
        <div className="mt-4 flex items-center gap-2">
          <code className="rounded bg-cream px-2 py-1 text-small font-semibold text-charcoal">{result.upiId}</code>
          <Button type="button" variant="secondary" size="sm" onClick={() => navigator.clipboard.writeText(result.upiId).then(() => toast.success("UPI ID copied"))}>
            <Copy /> Copy
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {UPI_WALLETS.map((w) => (
          <a key={w.key} href={w.href(upiParams)} className="flex items-center gap-2.5 rounded-md border border-gold/30 bg-white px-3 py-3 text-body font-medium text-charcoal hover:border-kerala-600 hover:bg-kerala-50">
            <span className={`flex h-6 w-6 items-center justify-center rounded text-caption font-bold text-white ${w.brandClass}`}>{w.label[0]}</span>
            {w.label}
          </a>
        ))}
      </div>

      <div>
        <p className="mb-2 text-body font-medium text-charcoal">Upload payment screenshot</p>
        <input ref={inputRef} type="file" accept={ACCEPTED_IMAGE_TYPES.join(",")} className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
        {preview ? (
          <div className="space-y-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Screenshot preview" className="max-h-72 w-full rounded-md border border-gold/30 bg-white object-contain" />
            <Button type="button" variant="secondary" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
              Choose a different image
            </Button>
          </div>
        ) : (
          <button type="button" onClick={() => inputRef.current?.click()} className="flex w-full flex-col items-center gap-2 rounded-md border-2 border-dashed border-gold/40 bg-white px-4 py-10 hover:border-kerala-600 hover:bg-kerala-50">
            <Upload className="h-6 w-6 text-kerala-600" />
            <span className="text-body font-medium text-charcoal">Tap to upload screenshot</span>
            <span className="text-small text-text-muted">JPG, PNG or WebP · up to 5 MB</span>
          </button>
        )}
      </div>

      <Button type="button" size="lg" className="w-full" disabled={!file || uploading} onClick={upload}>
        {uploading ? <><Loader2 className="animate-spin" /> Submitting…</> : "Submit for Approval"}
      </Button>
    </div>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section>
      <h1 className="font-display text-section-title font-semibold text-charcoal">{title}</h1>
      {description && <p className="mt-1 text-small text-text-secondary">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function FormField({ label, error, required, children }: { label: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      {children}
      {error && <p className="mt-1 text-small text-maroon">{error}</p>}
    </div>
  );
}

function StepNav({ onBack, onNext, nextLabel, busy }: { onBack: () => void; onNext: () => void; nextLabel: string; busy?: boolean }) {
  return (
    <div className="mt-6 flex gap-3">
      <Button type="button" variant="secondary" size="lg" onClick={onBack}>
        <ArrowLeft /> Back
      </Button>
      <Button type="button" size="lg" className="flex-1" onClick={onNext} disabled={busy}>
        {busy ? <><Loader2 className="animate-spin" /> Please wait…</> : nextLabel}
      </Button>
    </div>
  );
}
