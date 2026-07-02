import Link from "next/link";
import { KasavuDivider } from "@/components/shared/kasavu-divider";

const LINKS = [
  { href: "/events", label: "Events" },
  { href: "/gallery", label: "Gallery" },
  { href: "/membership", label: "Membership" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteFooter({ tagline }: { tagline?: string }) {
  return (
    <footer className="mx-auto max-w-content px-4 py-10">
      <KasavuDivider className="mb-6" />
      <nav className="mb-5 flex flex-wrap justify-center gap-x-6 gap-y-2">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="text-small font-medium text-text-secondary hover:text-kerala-700"
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <p className="text-center font-display text-lg text-kerala-700">
        {tagline ?? "Keeping Kerala Close To Home."}
      </p>
      <p className="mt-1 text-center text-caption text-text-muted">
        Rohan Upavan Malayali Association
      </p>
      <p className="mt-4 text-center">
        <Link
          href="/admin/login"
          className="text-caption text-text-muted/70 transition-colors hover:text-kerala-700"
        >
          Committee login
        </Link>
      </p>
    </footer>
  );
}
