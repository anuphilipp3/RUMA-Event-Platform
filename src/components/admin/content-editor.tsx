"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, Save, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import type { SiteContent } from "@/lib/domain/site-content";
import { saveSiteContentAction } from "@/app/admin/content/actions";

// Form shape mirrors SiteContent but flattens about.body to a textarea.
interface ContentForm {
  hero: SiteContent["hero"];
  syncStats: boolean;
  stats: SiteContent["stats"];
  aboutLabel: string;
  aboutTitle: string;
  aboutBody: string;
  festivals: SiteContent["festivals"];
  calendar: SiteContent["calendar"];
  impact: SiteContent["impact"];
  membership: SiteContent["membership"];
  footerTagline: string;
}

function toForm(c: SiteContent): ContentForm {
  return {
    hero: c.hero,
    syncStats: c.statsMode === "auto",
    stats: c.stats,
    aboutLabel: c.about.label,
    aboutTitle: c.about.title,
    aboutBody: c.about.body.join("\n\n"),
    festivals: c.festivals,
    calendar: c.calendar,
    impact: c.impact,
    membership: c.membership,
    footerTagline: c.footerTagline,
  };
}

function toContent(f: ContentForm): SiteContent {
  return {
    hero: f.hero,
    statsMode: f.syncStats ? "auto" : "manual",
    stats: f.stats,
    about: {
      label: f.aboutLabel,
      title: f.aboutTitle,
      body: f.aboutBody
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean),
    },
    festivals: f.festivals,
    calendar: f.calendar,
    impact: f.impact,
    membership: f.membership,
    footerTagline: f.footerTagline,
  };
}

export function ContentEditor({ content }: { content: SiteContent }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const { register, control, handleSubmit, watch } = useForm<ContentForm>({
    defaultValues: toForm(content),
  });

  const stats = useFieldArray({ control, name: "stats" });
  const festivals = useFieldArray({ control, name: "festivals" });
  const calendar = useFieldArray({ control, name: "calendar" });
  const syncOn = watch("syncStats");

  async function onSubmit(values: ContentForm) {
    setSaving(true);
    const res = await saveSiteContentAction(toContent(values));
    setSaving(false);
    if (!res.ok) {
      toast.error(res.error ?? "Could not save.");
      return;
    }
    toast.success("Homepage updated.");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Section title="Hero">
        <FieldRow label="Eyebrow">
          <Input {...register("hero.eyebrow")} />
        </FieldRow>
        <FieldRow label="Headline">
          <Input {...register("hero.headline")} />
        </FieldRow>
        <FieldRow label="Subheadline">
          <Textarea {...register("hero.subheadline")} />
        </FieldRow>
      </Section>

      <Section
        title="Community stats"
        action={
          !syncOn && (
            <AddButton onClick={() => stats.append({ value: "", label: "" })} />
          )
        }
      >
        <label className="flex items-start gap-3 rounded-md border border-gold/20 bg-cream/40 p-3">
          <input
            type="checkbox"
            {...register("syncStats")}
            className="mt-0.5 h-5 w-5 rounded border-field accent-kerala-600"
          />
          <span>
            <span className="block text-body font-medium text-charcoal">
              Sync with live community data
            </span>
            <span className="block text-small text-text-secondary">
              Show real counts (Families, Members, Events, Memories) generated from
              the dashboard. Turn off to show your own numbers below.
            </span>
          </span>
        </label>

        {syncOn ? (
          <p className="text-small text-text-muted">
            Live numbers are shown on the homepage. Your manual values are kept and
            will return when you turn syncing off.
          </p>
        ) : (
          stats.fields.map((f, i) => (
            <RowGroup key={f.id} onRemove={() => stats.remove(i)}>
              <Input placeholder="150+" {...register(`stats.${i}.value`)} />
              <Input placeholder="Families" {...register(`stats.${i}.label`)} />
            </RowGroup>
          ))
        )}
      </Section>

      <Section title="About">
        <FieldRow label="Label">
          <Input {...register("aboutLabel")} />
        </FieldRow>
        <FieldRow label="Title">
          <Input {...register("aboutTitle")} />
        </FieldRow>
        <FieldRow label="Body (blank line = new paragraph)">
          <Textarea rows={6} {...register("aboutBody")} />
        </FieldRow>
      </Section>

      <Section
        title="What we celebrate"
        action={
          <AddButton
            onClick={() => festivals.append({ name: "", blurb: "" })}
          />
        }
      >
        {festivals.fields.map((f, i) => (
          <RowGroup key={f.id} onRemove={() => festivals.remove(i)}>
            <Input placeholder="Onam" {...register(`festivals.${i}.name`)} />
            <Input placeholder="Short blurb" {...register(`festivals.${i}.blurb`)} />
          </RowGroup>
        ))}
      </Section>

      <Section
        title="Community calendar"
        action={
          <AddButton
            onClick={() => calendar.append({ period: "", title: "" })}
          />
        }
      >
        {calendar.fields.map((f, i) => (
          <RowGroup key={f.id} onRemove={() => calendar.remove(i)}>
            <Input placeholder="August" {...register(`calendar.${i}.period`)} />
            <Input placeholder="Onam" {...register(`calendar.${i}.title`)} />
          </RowGroup>
        ))}
      </Section>

      <Section title="Impact">
        <FieldRow label="Label">
          <Input {...register("impact.label")} />
        </FieldRow>
        <FieldRow label="Title">
          <Input {...register("impact.title")} />
        </FieldRow>
        <FieldRow label="Body">
          <Textarea {...register("impact.body")} />
        </FieldRow>
      </Section>

      <Section title="Membership call-to-action">
        <FieldRow label="Title">
          <Input {...register("membership.title")} />
        </FieldRow>
        <FieldRow label="Body">
          <Textarea {...register("membership.body")} />
        </FieldRow>
        <FieldRow label="Button label">
          <Input {...register("membership.ctaLabel")} />
        </FieldRow>
      </Section>

      <Section title="Footer">
        <FieldRow label="Tagline">
          <Input {...register("footerTagline")} />
        </FieldRow>
      </Section>

      <div className="sticky bottom-0 flex gap-3 border-t border-gold/20 bg-ivory/95 py-3 backdrop-blur">
        <Button asChild variant="secondary" size="lg">
          <Link href="/" target="_blank">
            <ExternalLink /> Preview
          </Link>
        </Button>
        <Button type="submit" size="lg" className="flex-1" disabled={saving}>
          {saving ? <Loader2 className="animate-spin" /> : <Save />}
          Save homepage
        </Button>
      </div>
    </form>
  );
}

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
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

function FieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function RowGroup({
  children,
  onRemove,
}: {
  children: React.ReactNode;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="grid flex-1 grid-cols-2 gap-2">{children}</div>
      <button
        type="button"
        onClick={onRemove}
        className="text-maroon"
        aria-label="Remove"
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  );
}

function AddButton({ onClick }: { onClick: () => void }) {
  return (
    <Button type="button" variant="secondary" size="sm" onClick={onClick}>
      <Plus /> Add
    </Button>
  );
}
