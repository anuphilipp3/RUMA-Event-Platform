"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, Save, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { BannerUploader } from "@/components/admin/banner-uploader";
import { cn, formatINR } from "@/lib/utils";
import {
  eventFormSchema,
  slugify,
  type EventFormInput,
} from "@/lib/domain/event-validation";
import { THEME_PRESETS, matchThemeKey } from "@/lib/domain/themes";
import {
  createEventAction,
  updateEventAction,
} from "@/app/admin/(protected)/events/actions";

const CATEGORY_OPTIONS = [
  { value: "adult", label: "Adult" },
  { value: "child_5_12", label: "Child (5–12)" },
  { value: "child_below_5", label: "Child (Below 5)" },
] as const;

const EVENT_TYPES = [
  "festival",
  "sports",
  "community",
  "charity",
  "cultural",
  "workshop",
  "meeting",
] as const;

const WIZARD = ["Basics", "Registration", "Tickets", "Review"];

// Fields validated before leaving each step.
const STEP_FIELDS: (keyof EventFormInput)[][] = [
  ["name", "slug", "venue", "description", "eventType", "startDate", "endDate"],
  ["status", "registrationStart", "registrationEnd", "capacity"],
  ["upiId", "upiPayeeName", "ticketTypes", "couponsPerPaidTicket", "memberDiscountPercent"],
  [],
];

export function EventForm({
  mode,
  eventId,
  defaultValues,
}: {
  mode: "create" | "edit";
  eventId?: string;
  defaultValues: EventFormInput;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [slugEdited, setSlugEdited] = useState(mode === "edit");
  const [step, setStep] = useState(0);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<EventFormInput>({
    resolver: zodResolver(eventFormSchema),
    defaultValues,
    mode: "onTouched",
  });

  const tickets = useFieldArray({ control, name: "ticketTypes" });
  const schedule = useFieldArray({ control, name: "schedule" });
  const colors = watch(["primaryColor", "accentColor", "backgroundColor"]);
  const activeTheme = matchThemeKey(colors[0], colors[1], colors[2]);
  const values = watch();

  function applyPreset(key: string) {
    const p = THEME_PRESETS.find((t) => t.key === key);
    if (!p) return;
    setValue("primaryColor", p.primary, { shouldValidate: true });
    setValue("accentColor", p.accent, { shouldValidate: true });
    setValue("backgroundColor", p.background, { shouldValidate: true });
  }

  async function next() {
    const ok = await trigger(STEP_FIELDS[step]);
    if (ok) setStep((s) => Math.min(s + 1, WIZARD.length - 1));
  }

  async function onSubmit(values: EventFormInput) {
    setSubmitting(true);
    const res =
      mode === "create"
        ? await createEventAction(values)
        : await updateEventAction(eventId!, values);
    setSubmitting(false);
    if (!res.ok) {
      toast.error(res.error ?? "Something went wrong.");
      return;
    }
    toast.success(mode === "create" ? "Event created." : "Event saved.");
    router.push("/admin/events");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Wizard progress */}
      <ol className="flex items-center gap-1.5">
        {WIZARD.map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-1.5">
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-caption font-bold",
                i < step ? "bg-kerala-600 text-white" : i === step ? "bg-kerala-600 text-white ring-4 ring-kerala-50" : "bg-cream text-text-muted",
              )}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <span className={cn("hidden text-small font-medium sm:inline", i === step ? "text-charcoal" : "text-text-muted")}>
              {label}
            </span>
            {i < WIZARD.length - 1 && <span className="h-px flex-1 bg-gold/25" />}
          </li>
        ))}
      </ol>

      {/* STEP 1 — Basics */}
      {step === 0 && (
        <div className="space-y-4">
          <Section title="Event details">
            <Field label="Event name" error={errors.name?.message} required>
              <Input
                {...register("name", {
                  onBlur: (e) => {
                    if (!slugEdited && e.target.value) setValue("slug", slugify(e.target.value));
                  },
                })}
                placeholder="e.g. RUMA Vishu Celebration 2027"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="URL slug" error={errors.slug?.message} hint="/events/your-slug" required>
                <Input {...register("slug", { onChange: () => setSlugEdited(true) })} placeholder="ruma-vishu-2027" />
              </Field>
              <Field label="Event type">
                <select {...register("eventType")} className="h-12 w-full rounded-md border border-field bg-white px-4 text-body capitalize text-charcoal">
                  {EVENT_TYPES.map((t) => (
                    <option key={t} value={t} className="capitalize">{t}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Venue" error={errors.venue?.message} required>
              <Input {...register("venue")} placeholder="RUMA Community Hall, Kochi" />
            </Field>
            <Field label="Description" error={errors.description?.message}>
              <Textarea {...register("description")} placeholder="A short, friendly description." />
            </Field>
          </Section>

          <Section title="Banner image">
            <Controller
              control={control}
              name="bannerImage"
              render={({ field }) => (
                <BannerUploader
                  path={field.value ?? ""}
                  onUploaded={(p) => field.onChange(p)}
                />
              )}
            />
          </Section>

          <Section title="Date & time">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Starts" error={errors.startDate?.message} required>
                <Input type="datetime-local" {...register("startDate")} />
              </Field>
              <Field label="Ends" error={errors.endDate?.message} hint="After this the event is concluded.">
                <Input type="datetime-local" {...register("endDate")} />
              </Field>
            </div>
          </Section>
        </div>
      )}

      {/* STEP 2 — Registration */}
      {step === 1 && (
        <div className="space-y-4">
          <Section title="Registration window">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Registration opens" error={errors.registrationStart?.message} hint="Leave blank to open immediately.">
                <Input type="datetime-local" {...register("registrationStart")} />
              </Field>
              <Field label="Registration closes" error={errors.registrationEnd?.message} hint="Leave blank to close at the event.">
                <Input type="datetime-local" {...register("registrationEnd")} />
              </Field>
            </div>
            <Field label="Capacity (optional)" error={errors.capacity?.message} hint="Total attendees. Drives the dashboard health bar.">
              <Input type="number" min={0} className="max-w-40" {...register("capacity")} placeholder="e.g. 200" />
            </Field>
          </Section>

          <Section title="Visibility">
            <Field label="Status" required>
              <select {...register("status")} className="h-12 w-full rounded-md border border-field bg-white px-4 text-body text-charcoal">
                <option value="draft">Draft — hidden from residents</option>
                <option value="published">Published — live for registration</option>
                <option value="closed">Closed — registration stopped</option>
              </select>
            </Field>
            <label className="flex items-start gap-3 rounded-md border border-gold/20 bg-cream/40 p-3">
              <input type="checkbox" {...register("featured")} className="mt-0.5 h-5 w-5 rounded border-field accent-kerala-600" />
              <span>
                <span className="block text-body font-medium text-charcoal">Feature on the homepage</span>
                <span className="block text-small text-text-secondary">The featured event leads the homepage hero card.</span>
              </span>
            </label>
          </Section>

          <Section title="Theme">
            <div className="flex flex-wrap gap-2">
              {THEME_PRESETS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => applyPreset(p.key)}
                  className={cn(
                    "flex items-center gap-2 rounded-md border px-3 py-2 text-small transition-colors",
                    activeTheme === p.key ? "border-kerala-600 bg-kerala-50" : "border-gold/30 bg-white hover:border-kerala-600",
                  )}
                >
                  <Swatch color={p.primary} />
                  <Swatch color={p.accent} />
                  {p.label}
                </button>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <ColorField label="Primary" name="primaryColor" control={control} />
              <ColorField label="Accent" name="accentColor" control={control} />
              <ColorField label="Background" name="backgroundColor" control={control} />
            </div>
          </Section>
        </div>
      )}

      {/* STEP 3 — Tickets */}
      {step === 2 && (
        <div className="space-y-4">
          <Section title="Payment (UPI)">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="UPI ID" error={errors.upiId?.message}>
                <Input {...register("upiId")} placeholder="ruma@upi" />
              </Field>
              <Field label="Payee name" error={errors.upiPayeeName?.message}>
                <Input {...register("upiPayeeName")} placeholder="RUMA Residents Association" />
              </Field>
            </div>
          </Section>

          <Section
            title="Ticket types"
            action={
              <Button type="button" variant="secondary" size="sm" onClick={() => tickets.append({ name: "", category: "adult", ageRule: "", price: 0 })}>
                <Plus /> Add
              </Button>
            }
          >
            {typeof errors.ticketTypes?.message === "string" && (
              <p className="text-small text-maroon">{errors.ticketTypes.message}</p>
            )}
            <div className="space-y-3">
              {tickets.fields.map((f, i) => (
                <Card key={f.id} className="p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Name" error={errors.ticketTypes?.[i]?.name?.message}>
                      <Input {...register(`ticketTypes.${i}.name`)} placeholder="Adult" />
                    </Field>
                    <Field label="Category">
                      <select {...register(`ticketTypes.${i}.category`)} className="h-12 w-full rounded-md border border-field bg-white px-4 text-body text-charcoal">
                        {CATEGORY_OPTIONS.map((c) => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Age rule">
                      <Input {...register(`ticketTypes.${i}.ageRule`)} placeholder="Ages 13 and above" />
                    </Field>
                    <Field label="Price (₹)" error={errors.ticketTypes?.[i]?.price?.message}>
                      <Input type="number" min={0} step={1} {...register(`ticketTypes.${i}.price`)} />
                    </Field>
                  </div>
                  {tickets.fields.length > 1 && (
                    <button type="button" onClick={() => tickets.remove(i)} className="mt-2 inline-flex items-center gap-1 text-small text-maroon hover:underline">
                      <Trash2 className="h-4 w-4" /> Remove
                    </button>
                  )}
                </Card>
              ))}
            </div>
          </Section>

          <Section title="Lucky draw">
            <label className="flex items-center gap-3">
              <input type="checkbox" {...register("luckyDrawEnabled")} className="h-5 w-5 rounded border-field accent-kerala-600" />
              <span className="text-body text-charcoal">Enable lucky draw for this event</span>
            </label>
            <Field label="Coupons per paid ticket">
              <Input type="number" min={0} step={1} className="max-w-32" {...register("couponsPerPaidTicket")} />
            </Field>
          </Section>

          <Section title="RUMA member discount">
            <label className="flex items-center gap-3">
              <input type="checkbox" {...register("memberDiscountEnabled")} className="h-5 w-5 rounded border-field accent-kerala-600" />
              <span className="text-body text-charcoal">Give registered RUMA members a discount on this event</span>
            </label>
            <Field label="Discount percent (%)">
              <Input type="number" min={0} max={100} step={1} className="max-w-32" {...register("memberDiscountPercent")} />
            </Field>
            <p className="text-small text-text-secondary">
              Applies to a member family&apos;s tickets up to the number of people in their
              membership. Extra guests pay full price.
            </p>
          </Section>

          <Section
            title="Schedule (optional)"
            action={
              <Button type="button" variant="secondary" size="sm" onClick={() => schedule.append({ time: "", title: "" })}>
                <Plus /> Add
              </Button>
            }
          >
            <div className="space-y-2">
              {schedule.fields.map((f, i) => (
                <div key={f.id} className="flex items-end gap-2">
                  <div className="w-32">
                    <Label>Time</Label>
                    <Input {...register(`schedule.${i}.time`)} placeholder="10:00 AM" />
                  </div>
                  <div className="flex-1">
                    <Label>Item</Label>
                    <Input {...register(`schedule.${i}.title`)} placeholder="Welcome & Pookalam" />
                  </div>
                  <button type="button" onClick={() => schedule.remove(i)} className="mb-3 text-maroon" aria-label="Remove">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
              {schedule.fields.length === 0 && <p className="text-small text-text-muted">No schedule items yet.</p>}
            </div>
          </Section>
        </div>
      )}

      {/* STEP 4 — Review */}
      {step === 3 && (
        <Card className="p-5">
          <h2 className="mb-4 text-card-title font-semibold text-charcoal">Review &amp; publish</h2>
          <dl className="space-y-2 text-body">
            <ReviewRow label="Name" value={values.name || "—"} />
            <ReviewRow label="Type" value={values.eventType} />
            <ReviewRow label="Venue" value={values.venue || "—"} />
            <ReviewRow label="Starts" value={values.startDate ? new Date(values.startDate).toLocaleString("en-IN") : "—"} />
            <ReviewRow label="Capacity" value={values.capacity || "Unlimited"} />
            <ReviewRow label="Featured" value={values.featured ? "Yes — homepage" : "No"} />
            <ReviewRow label="Status" value={values.status} />
            <ReviewRow
              label="Tickets"
              value={values.ticketTypes.map((t) => `${t.name || "—"} (${t.price ? formatINR(Number(t.price)) : "Free"})`).join(", ")}
            />
          </dl>
          <p className="mt-4 text-small text-text-secondary">
            Publishing makes this event live on the homepage and registration. You can edit it later.
          </p>
        </Card>
      )}

      {/* Nav */}
      <div className="sticky bottom-0 flex gap-3 border-t border-gold/20 bg-ivory/95 py-3 backdrop-blur">
        {step > 0 ? (
          <Button type="button" variant="secondary" size="lg" onClick={() => setStep((s) => s - 1)}>
            <ArrowLeft /> Back
          </Button>
        ) : (
          <Button type="button" variant="secondary" size="lg" onClick={() => router.push("/admin/events")}>
            Cancel
          </Button>
        )}
        {step < WIZARD.length - 1 ? (
          <Button type="button" size="lg" className="flex-1" onClick={next}>
            Continue <ArrowRight />
          </Button>
        ) : (
          <Button type="submit" size="lg" className="flex-1" disabled={submitting}>
            {submitting ? <Loader2 className="animate-spin" /> : <Save />}
            {mode === "create" ? "Create event" : "Save changes"}
          </Button>
        )}
      </div>
    </form>
  );
}

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-card-title font-semibold text-charcoal">{title}</h2>
        {action}
      </div>
      <div className="space-y-4">{children}</div>
    </Card>
  );
}

function Field({ label, hint, error, required, children }: { label: string; hint?: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      {children}
      {hint && !error && <p className="mt-1 text-caption text-text-muted">{hint}</p>}
      {error && <p className="mt-1 text-small text-maroon">{error}</p>}
    </div>
  );
}

function Swatch({ color }: { color: string }) {
  return <span className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: color }} />;
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-gold/10 py-1.5 last:border-0">
      <dt className="text-text-secondary">{label}</dt>
      <dd className="text-right font-medium capitalize text-charcoal">{value}</dd>
    </div>
  );
}

function ColorField({
  label,
  name,
  control,
}: {
  label: string;
  name: "primaryColor" | "accentColor" | "backgroundColor";
  control: import("react-hook-form").Control<EventFormInput>;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div>
          <Label>{label}</Label>
          <div className="flex items-center gap-2">
            <input type="color" value={field.value} onChange={(e) => field.onChange(e.target.value)} className="h-11 w-12 cursor-pointer rounded border border-field bg-white" aria-label={`${label} colour`} />
            <Input value={field.value} onChange={(e) => field.onChange(e.target.value)} className="font-mono" />
          </div>
          {fieldState.error && <p className="mt-1 text-small text-maroon">{fieldState.error.message}</p>}
        </div>
      )}
    />
  );
}
