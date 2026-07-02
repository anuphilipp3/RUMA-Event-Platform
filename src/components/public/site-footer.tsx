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
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-gold/15 bg-cream/40">
      <div className="mx-auto max-w-content px-5 py-10">
        {/* Brand line */}
        <div className="text-center">
          <p className="font-display text-xl text-kerala-700 sm:text-2xl">
            {tagline ?? "Keeping Kerala Close To Home."}
          </p>
          <p className="mt-2 text-caption uppercase tracking-[0.22em] text-text-muted">
            Rohan Upavan Malayali Association
          </p>
        </div>

        <KasavuDivider className="my-7" />

        {/* Links — tidy 2-column grid on phones, single row on larger screens */}
        <nav
          aria-label="Footer"
          className="grid grid-cols-2 gap-x-6 gap-y-4 sm:flex sm:flex-wrap sm:justify-center sm:gap-x-8"
        >
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-center text-small font-medium text-text-secondary transition-colors hover:text-kerala-700"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Bottom bar */}
        <div className="mt-9 flex flex-col items-center gap-3 border-t border-gold/10 pt-6 text-caption text-text-muted sm:flex-row sm:justify-between sm:gap-0">
          <span>© {year} RUMA. Made with care in the community.</span>
          <Link
            href="/admin/login"
            className="transition-colors hover:text-kerala-700"
          >
            Committee login
          </Link>
        </div>
      </div>
    </footer>
  );
}
