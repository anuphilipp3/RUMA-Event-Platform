import Link from "next/link";
import { Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Mobile-only sticky bottom CTA (desktop uses the hero button). */
export function StickyCta({ slug }: { slug: string }) {
  return (
    <div className="sticky bottom-0 z-30 border-t border-gold/20 bg-ivory/95 p-3 backdrop-blur sm:hidden">
      <Button asChild size="lg" className="w-full">
        <Link href={`/e/${slug}/register`}>
          <Ticket /> Register Now
        </Link>
      </Button>
    </div>
  );
}
