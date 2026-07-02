import Link from "next/link";
import { RumaMark } from "@/components/shared/ruma-mark";
import { SiteNav } from "@/components/public/site-nav";
import { getOrgSettings } from "@/lib/data/org-settings";

export async function SiteHeader() {
  const { brand } = await getOrgSettings();
  return (
    <header className="sticky top-0 z-40 border-b border-gold/15 bg-ivory/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-content items-center justify-between px-4">
        <Link href="/" className="text-kerala-700" aria-label={`${brand.name} home`}>
          <RumaMark name={brand.name} tagline={brand.tagline} logoUrl={brand.logoUrl} />
        </Link>
        <SiteNav />
      </div>
    </header>
  );
}
