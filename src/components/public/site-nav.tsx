"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const LINKS = [
  { href: "/events", label: "Events" },
  { href: "/gallery", label: "Gallery" },
  { href: "/booking", label: "My ticket" },
  { href: "/family", label: "Find my family" },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop nav — all links inline */}
      <nav className="hidden items-center gap-5 sm:flex" aria-label="Main">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="text-small font-medium text-kerala-700 hover:underline"
          >
            {l.label}
          </Link>
        ))}
        <Link
          href="/membership"
          className="rounded-md bg-kerala-600 px-3 py-1.5 text-small font-semibold text-white hover:bg-kerala-700"
        >
          Join RUMA
        </Link>
      </nav>

      {/* Mobile — CTA stays visible, everything else behind a hamburger */}
      <div className="flex items-center gap-2 sm:hidden">
        <Link
          href="/membership"
          className="rounded-md bg-kerala-600 px-3 py-1.5 text-small font-semibold text-white"
        >
          Join RUMA
        </Link>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="rounded-md p-2 text-kerala-700 transition-colors hover:bg-gold/10"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile dropdown panel */}
      {open && (
        <div className="absolute inset-x-0 top-16 z-40 border-b border-gold/15 bg-ivory shadow-lg sm:hidden">
          <nav
            className="mx-auto flex max-w-content flex-col px-4 py-1"
            aria-label="Mobile"
          >
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="border-b border-gold/10 py-3 text-body font-medium text-kerala-700 last:border-0"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
