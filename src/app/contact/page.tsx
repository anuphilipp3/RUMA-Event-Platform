import type { Metadata } from "next";
import { Mail, Phone, MessageCircle } from "lucide-react";
import { getOrgSettings } from "@/lib/data/org-settings";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the RUMA community team.",
};

function waLink(number: string): string {
  return `https://wa.me/${number.replace(/[^\d]/g, "")}`;
}

export default async function ContactPage() {
  const { contact, brand } = await getOrgSettings();
  const rows = [
    contact.email && {
      icon: Mail,
      label: "Email",
      value: contact.email,
      href: `mailto:${contact.email}`,
    },
    contact.phone && {
      icon: Phone,
      label: "Phone",
      value: contact.phone,
      href: `tel:${contact.phone.replace(/\s/g, "")}`,
    },
    contact.whatsapp && {
      icon: MessageCircle,
      label: "WhatsApp",
      value: contact.whatsapp,
      href: waLink(contact.whatsapp),
    },
  ].filter(Boolean) as {
    icon: typeof Mail;
    label: string;
    value: string;
    href: string;
  }[];

  return (
    <div className="paper flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
        <div className="text-center">
          <p className="text-caption font-semibold uppercase tracking-[0.25em] text-gold-700">
            Say hello
          </p>
          <h1 className="mt-3 font-display text-page-title font-semibold tracking-tightest text-charcoal">
            Get in touch
          </h1>
          <p className="mt-2 text-body text-text-secondary">
            We&apos;d love to hear from you — questions, ideas, or to get involved
            with {brand.name}.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          {rows.length === 0 ? (
            <Card className="p-5 text-center text-body text-text-secondary">
              Contact details will be shared here soon. Please reach out to a
              committee member in the meantime.
            </Card>
          ) : (
            rows.map((r) => (
              <a key={r.label} href={r.href} target="_blank" rel="noopener noreferrer">
                <Card className="flex items-center gap-4 p-4 transition-colors hover:border-gold/50 hover:bg-cream">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-kerala-50 text-kerala-600">
                    <r.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-caption uppercase tracking-wide text-text-muted">
                      {r.label}
                    </p>
                    <p className="text-body font-medium text-charcoal">{r.value}</p>
                  </div>
                </Card>
              </a>
            ))
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
