"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Home, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface to the server logs / error tracker.
    console.error(error);
  }, [error]);

  return (
    <div className="paper flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-maroon">
        <AlertTriangle className="h-8 w-8" />
      </span>
      <h1 className="mt-5 font-display text-section-title font-semibold text-charcoal">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-sm text-body text-text-secondary">
        Sorry about that — an unexpected error occurred. You can try again, or head
        back home.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button size="lg" onClick={() => reset()}>
          <RefreshCw /> Try again
        </Button>
        <Button asChild variant="secondary" size="lg">
          <Link href="/">
            <Home /> Back home
          </Link>
        </Button>
      </div>
    </div>
  );
}
