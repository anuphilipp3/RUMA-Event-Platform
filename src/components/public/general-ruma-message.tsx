import Link from "next/link";
import { Sparkles } from "lucide-react";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { KasavuDivider } from "@/components/shared/kasavu-divider";
import { Button } from "@/components/ui/button";

/**
 * Shown when there's no live event (none published, or the last one concluded).
 * Keeps a warm RUMA presence instead of a dead end.
 */
export function GeneralRumaMessage({
  title = "No events running right now",
  message = "Thank you for being part of our community. New RUMA celebrations open here for registration — please check back soon.",
  concludedEventName,
}: {
  title?: string;
  message?: string;
  concludedEventName?: string;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-ivory">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-content flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-kerala-50 text-kerala-600">
          <Sparkles className="h-7 w-7" />
        </span>

        {concludedEventName && (
          <p className="mt-5 text-caption uppercase tracking-widest text-gold-700">
            {concludedEventName} has concluded
          </p>
        )}
        <h1 className="mt-2 max-w-lg text-page-title font-bold text-charcoal">
          {title}
        </h1>
        <p className="mt-3 max-w-md text-body text-text-secondary">{message}</p>

        <KasavuDivider className="my-8 w-40" />

        <p className="max-w-md text-small text-text-secondary">
          RUMA Events is the home of our residents&apos; association celebrations —
          Onam, Vishu, Christmas, Sports Day and more.
        </p>

        <Button asChild variant="secondary" className="mt-6">
          <Link href="/booking">Find an existing ticket</Link>
        </Button>
      </main>
      <SiteFooter />
    </div>
  );
}
