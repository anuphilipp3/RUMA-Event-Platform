import Link from "next/link";
import { Compass, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KasavuDivider } from "@/components/shared/kasavu-divider";

export default function NotFound() {
  return (
    <div className="paper flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-[6rem] font-semibold leading-none tracking-tightest text-kerala-700">
        404
      </p>
      <KasavuDivider className="my-6 w-40" />
      <h1 className="font-display text-section-title font-semibold text-charcoal">
        This page wandered off
      </h1>
      <p className="mt-2 max-w-sm text-body text-text-secondary">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
        Let&apos;s get you back home.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg">
          <Link href="/">
            <Home /> Back home
          </Link>
        </Button>
        <Button asChild variant="secondary" size="lg">
          <Link href="/events">
            <Compass /> Browse events
          </Link>
        </Button>
      </div>
    </div>
  );
}
