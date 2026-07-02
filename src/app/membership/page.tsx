import Link from "next/link";
import type { Metadata } from "next";
import { Check, ArrowRight, Users } from "lucide-react";
import { getOrgSettings } from "@/lib/data/org-settings";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Join RUMA · Membership",
  description: "Become part of the Rohan Upavan Malayali Association community.",
};

export default async function MembershipPage() {
  const settings = await getOrgSettings();

  return (
    <div className="paper flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-content flex-1 px-4 py-16">
        <div className="text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-kerala-50 text-kerala-600">
            <Users className="h-7 w-7" />
          </span>
          <p className="mt-5 text-caption font-semibold uppercase tracking-[0.25em] text-gold-700">
            Membership
          </p>
          <h1 className="mt-3 font-display text-page-title font-semibold tracking-tightest text-charcoal sm:text-5xl">
            Become part of the community
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-body text-text-secondary">
            Register your family once. Enjoy priority access to events, member
            pricing, and a home in the RUMA community.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
          {settings.plans.map((p) => (
            <div
              key={p.key}
              className="flex flex-col rounded-lg border border-gold/25 bg-white p-6"
            >
              <p className="font-display text-xl font-semibold text-charcoal">
                {p.name}
              </p>
              <p className="mt-1 text-page-title font-bold text-kerala-700">
                {p.price === 0 ? "Free" : formatINR(p.price)}
              </p>
              <ul className="mt-4 flex-1 space-y-2">
                {p.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-small text-text-secondary">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-kerala-600" /> {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center gap-3">
          <Button asChild size="lg">
            <Link href="/membership/register">
              Join RUMA <ArrowRight />
            </Link>
          </Button>
          <Link href="/family" className="text-small text-kerala-700 hover:underline">
            Already a member? Find your family
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
