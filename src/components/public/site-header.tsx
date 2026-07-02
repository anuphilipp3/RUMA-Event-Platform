import Link from "next/link";
import { RumaMark } from "@/components/shared/ruma-mark";
import { getOrgSettings } from "@/lib/data/org-settings";

export async function SiteHeader() {
  const { brand } = await getOrgSettings();
  return (
    <header className="sticky top-0 z-40 border-b border-gold/15 bg-ivory/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-content items-center justify-between px-4">
        <Link href="/" className="text-kerala-700" aria-label={`${brand.name} home`}>
          <RumaMark name={brand.name} tagline={brand.tagline} logoUrl={brand.logoUrl} />
        </Link>
        <nav className="flex items-center gap-4 sm:gap-5">
          <Link
            href="/events"
            className="hidden text-small font-medium text-kerala-700 hover:underline sm:inline"
          >
            Events
          </Link>
          <Link
            href="/gallery"
            className="text-small font-medium text-kerala-700 hover:underline"
          >
            Gallery
          </Link>
          <Link
            href="/booking"
            className="hidden text-small font-medium text-kerala-700 hover:underline sm:inline"
          >
            My ticket
          </Link>
          <Link
            href="/membership"
            className="rounded-md bg-kerala-600 px-3 py-1.5 text-small font-semibold text-white hover:bg-kerala-700"
          >
            Join RUMA
          </Link>
        </nav>
      </div>
    </header>
  );
}
