"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { membershipSchema, type MembershipInput } from "@/lib/domain/membership";
import { updateFamilyAction } from "@/app/admin/(protected)/membership/actions";

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

export function FamilyEditForm({
  familyId,
  defaultValues,
}: {
  familyId: string;
  defaultValues: MembershipInput;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<MembershipInput>({
    resolver: zodResolver(membershipSchema),
    defaultValues,
    mode: "onTouched",
  });
  const members = useFieldArray({ control, name: "members" });

  async function onSubmit(values: MembershipInput) {
    setSaving(true);
    const res = await updateFamilyAction(familyId, values);
    setSaving(false);
    if (!res.ok) {
      toast.error(res.error ?? "Could not save.");
      return;
    }
    toast.success("Family updated.");
    router.push(`/admin/membership/${familyId}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <Card className="p-5">
        <h2 className="mb-4 text-card-title font-semibold text-charcoal">Family details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Primary contact" error={errors.primaryContact?.message}>
            <Input {...register("primaryContact")} />
          </Field>
          <Field label="Family name" error={errors.familyName?.message}>
            <Input {...register("familyName")} />
          </Field>
          <Field label="Flat number" error={errors.flatNumber?.message}>
            <Input {...register("flatNumber")} />
          </Field>
          <Field label="Phone" error={errors.phone?.message}>
            <Input {...register("phone")} inputMode="numeric" />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <Input {...register("email")} type="email" />
          </Field>
          <Field label="Membership type">
            <select
              {...register("membershipType")}
              className="h-12 w-full rounded-md border border-field bg-white px-4 text-body text-charcoal"
            >
              <option value="annual">Annual</option>
              <option value="lifetime">Lifetime</option>
            </select>
          </Field>
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-card-title font-semibold text-charcoal">Members</h2>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => members.append({ fullName: "", relationship: "child", ageGroup: "13_plus" })}
          >
            <Plus /> Add
          </Button>
        </div>
        {typeof errors.members?.message === "string" && (
          <p className="mb-2 text-small text-maroon">{errors.members.message}</p>
        )}
        <div className="space-y-3">
          {members.fields.map((f, i) => (
            <div key={f.id} className="rounded-md border border-gold/20 p-3">
              <Field label="Name" error={errors.members?.[i]?.fullName?.message}>
                <Input {...register(`members.${i}.fullName`)} />
              </Field>
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
              {members.fields.length > 1 && (
                <button type="button" onClick={() => members.remove(i)} className="mt-2 inline-flex items-center gap-1 text-small text-maroon hover:underline">
                  <Trash2 className="h-4 w-4" /> Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </Card>

      <div className="flex gap-3">
        <Button type="button" variant="secondary" size="lg" onClick={() => router.push(`/admin/membership/${familyId}`)}>
          Cancel
        </Button>
        <Button type="submit" size="lg" className="flex-1" disabled={saving}>
          {saving ? <Loader2 className="animate-spin" /> : <Save />} Save changes
        </Button>
      </div>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
      {error && <p className="mt-1 text-small text-maroon">{error}</p>}
    </div>
  );
}
