import Link from "next/link";
import type { Metadata } from "next";
import { Sparkles, Users, HeartHandshake } from "lucide-react";
import { getSiteContent } from "@/lib/data/site-content";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { KasavuDivider } from "@/components/shared/kasavu-divider";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Rohan Upavan Malayali Association — our story, mission and community.",
};

export default async function AboutPage() {
  const content = await getSiteContent();

  return (
    <div className="paper flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-content flex-1 px-4 py-14">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-caption font-semibold uppercase tracking-[0.25em] text-gold-700">
            {content.about.label}
          </p>
          <h1 className="mt-3 font-display text-page-title font-semibold tracking-tightest text-charcoal sm:text-5xl">
            {content.about.title}
          </h1>
          <div className="mt-6 space-y-4 text-left">
            {content.about.body.map((p, i) => (
              <p key={i} className="text-body leading-relaxed text-text-secondary">
                {p}
              </p>
            ))}
          </div>
        </div>

        <KasavuDivider className="mx-auto my-12 max-w-md" />

        {/* Values */}
        <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-3">
          <Value icon={Users} title="Community first" body="Families connected beyond apartment walls." />
          <Value icon={Sparkles} title="Culture" body="Preserving Kerala's traditions for the next generation." />
          <Value icon={HeartHandshake} title="Run by volunteers" body="Organised by residents, for residents." />
        </div>

        {/* What we celebrate */}
        <section className="mx-auto mt-14 max-w-3xl">
          <h2 className="text-center font-display text-3xl font-semibold tracking-tightest text-charcoal">
            What we celebrate
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {content.festivals.map((f) => (
              <div key={f.name} className="rounded-lg border border-gold/20 bg-white/70 p-4">
                <h3 className="font-display text-lg font-semibold text-charcoal">{f.name}</h3>
                <p className="mt-0.5 text-small text-text-secondary">{f.blurb}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-14 flex flex-col items-center gap-3 text-center">
          <p className="text-body text-text-secondary">{content.membership.body}</p>
          <Button asChild size="lg">
            <Link href="/membership">{content.membership.ctaLabel}</Link>
          </Button>
        </div>
      </main>
      <SiteFooter tagline={content.footerTagline} />
    </div>
  );
}

function Value({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Users;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-lg border border-gold/20 bg-white/70 p-5 text-center">
      <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-kerala-50 text-kerala-600">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-3 text-card-title font-semibold text-charcoal">{title}</h3>
      <p className="mt-1 text-small text-text-secondary">{body}</p>
    </div>
  );
}
