"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { LogoUploader } from "@/components/admin/logo-uploader";
import type { OrgSettings } from "@/lib/domain/membership";
import { saveOrgSettingsAction } from "@/app/admin/(protected)/settings/actions";

// Form shape flattens each plan's benefits[] to a textarea (one per line).
interface PlanForm {
  key: string;
  name: string;
  price: number;
  benefitsText: string;
}
interface SettingsForm {
  brandName: string;
  brandTagline: string;
  brandLogoUrl: string;
  contactEmail: string;
  contactPhone: string;
  contactWhatsapp: string;
  associationName: string;
  associationAddress: string;
  signatoryName: string;
  upiId: string;
  upiPayeeName: string;
  announcementEnabled: boolean;
  announcementText: string;
  plans: PlanForm[];
}

function toForm(s: OrgSettings): SettingsForm {
  return {
    brandName: s.brand.name,
    brandTagline: s.brand.tagline,
    brandLogoUrl: s.brand.logoUrl,
    contactEmail: s.contact.email,
    contactPhone: s.contact.phone,
    contactWhatsapp: s.contact.whatsapp,
    associationName: s.associationName,
    associationAddress: s.associationAddress,
    signatoryName: s.signatoryName,
    upiId: s.upiId,
    upiPayeeName: s.upiPayeeName,
    announcementEnabled: s.announcement.enabled,
    announcementText: s.announcement.text,
    plans: s.plans.map((p) => ({
      key: p.key,
      name: p.name,
      price: p.price,
      benefitsText: p.benefits.join("\n"),
    })),
  };
}

function toSettings(f: SettingsForm): OrgSettings {
  return {
    brand: {
      name: f.brandName.trim() || "RUMA",
      tagline: f.brandTagline.trim(),
      logoUrl: f.brandLogoUrl,
    },
    contact: {
      email: f.contactEmail.trim(),
      phone: f.contactPhone.trim(),
      whatsapp: f.contactWhatsapp.trim(),
    },
    associationName: f.associationName.trim(),
    associationAddress: f.associationAddress.trim(),
    signatoryName: f.signatoryName.trim(),
    upiId: f.upiId.trim(),
    upiPayeeName: f.upiPayeeName.trim(),
    announcement: {
      enabled: f.announcementEnabled,
      text: f.announcementText.trim(),
    },
    plans: f.plans.map((p) => ({
      key: p.key as OrgSettings["plans"][number]["key"],
      name: p.name.trim(),
      price: Number(p.price) || 0,
      benefits: p.benefitsText
        .split("\n")
        .map((b) => b.trim())
        .filter(Boolean),
    })),
  };
}

export function OrgSettingsEditor({ settings }: { settings: OrgSettings }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const { register, control, handleSubmit } = useForm<SettingsForm>({
    defaultValues: toForm(settings),
  });
  const plans = useFieldArray({ control, name: "plans" });

  async function onSubmit(values: SettingsForm) {
    setSaving(true);
    const res = await saveOrgSettingsAction(toSettings(values));
    setSaving(false);
    if (!res.ok) {
      toast.error(res.error ?? "Could not save.");
      return;
    }
    toast.success("Settings saved.");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="p-5">
        <h2 className="mb-4 text-card-title font-semibold text-charcoal">
          Platform name
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Name</Label>
            <Input {...register("brandName")} placeholder="RUMA" />
          </div>
          <div>
            <Label>Subtitle (optional)</Label>
            <Input {...register("brandTagline")} placeholder="Events / Community" />
          </div>
        </div>
        <div className="mt-4">
          <Label>Logo (optional)</Label>
          <Controller
            control={control}
            name="brandLogoUrl"
            render={({ field }) => (
              <LogoUploader url={field.value} onChange={field.onChange} />
            )}
          />
          <p className="mt-2 text-caption text-text-muted">
            When a logo is set, it replaces the text name in the header. A wide,
            transparent PNG or SVG works best.
          </p>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="mb-4 text-card-title font-semibold text-charcoal">
          Association details (receipts)
        </h2>
        <div className="space-y-4">
          <div>
            <Label>Association name</Label>
            <Input {...register("associationName")} placeholder="Rohan Upavan Malayali Association" />
          </div>
          <div>
            <Label>Address</Label>
            <Textarea {...register("associationAddress")} rows={2} />
          </div>
          <div>
            <Label>Authorised signatory</Label>
            <Input {...register("signatoryName")} placeholder="Anu Philip" />
          </div>
        </div>
        <p className="mt-2 text-caption text-text-muted">
          Printed on membership receipts.
        </p>
      </Card>

      <Card className="p-5">
        <h2 className="mb-4 text-card-title font-semibold text-charcoal">
          Contact details
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label>Email</Label>
            <Input {...register("contactEmail")} placeholder="hello@ruma.org" />
          </div>
          <div>
            <Label>Phone</Label>
            <Input {...register("contactPhone")} placeholder="+91 98xxxxxxx" />
          </div>
          <div>
            <Label>WhatsApp</Label>
            <Input {...register("contactWhatsapp")} placeholder="+91 98xxxxxxx" />
          </div>
        </div>
        <p className="mt-2 text-caption text-text-muted">
          Shown on the public Contact page. Leave any field blank to hide it.
        </p>
      </Card>

      <Card className="p-5">
        <h2 className="mb-4 text-card-title font-semibold text-charcoal">
          Announcement banner
        </h2>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            {...register("announcementEnabled")}
            className="h-5 w-5 rounded border-field accent-kerala-600"
          />
          <span className="text-body text-charcoal">
            Show a scrolling announcement at the top of the site
          </span>
        </label>
        <div className="mt-4">
          <Label>Announcement text</Label>
          <Input
            {...register("announcementText")}
            placeholder="🌸 Onam Sadhya bookings now open — members get 20% off!"
          />
        </div>
        <p className="mt-2 text-caption text-text-muted">
          Keep it short and punchy. Turn it off any time by unchecking the box above.
        </p>
      </Card>

      <Card className="p-5">
        <h2 className="mb-4 text-card-title font-semibold text-charcoal">
          Association UPI
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>UPI ID</Label>
            <Input {...register("upiId")} placeholder="ruma@upi" />
          </div>
          <div>
            <Label>Payee name</Label>
            <Input {...register("upiPayeeName")} />
          </div>
        </div>
        <p className="mt-2 text-caption text-text-muted">
          Used for membership payments (event payments use each event&apos;s own UPI).
        </p>
      </Card>

      <Card className="p-5">
        <h2 className="mb-4 text-card-title font-semibold text-charcoal">
          Membership plans &amp; fees
        </h2>
        <div className="space-y-5">
          {plans.fields.map((f, i) => (
            <div key={f.id} className="rounded-lg border border-gold/20 p-4">
              <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
                <div>
                  <Label>Plan name</Label>
                  <Input {...register(`plans.${i}.name`)} />
                </div>
                <div>
                  <Label>Fee (₹)</Label>
                  <Input type="number" min={0} step={1} {...register(`plans.${i}.price`)} />
                </div>
              </div>
              <div className="mt-3">
                <Label>Benefits (one per line)</Label>
                <Textarea rows={3} {...register(`plans.${i}.benefitsText`)} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="sticky bottom-0 flex gap-3 border-t border-gold/20 bg-ivory/95 py-3 backdrop-blur">
        <Button type="submit" size="lg" className="flex-1" disabled={saving}>
          {saving ? <Loader2 className="animate-spin" /> : <Save />}
          Save settings
        </Button>
      </div>
    </form>
  );
}
