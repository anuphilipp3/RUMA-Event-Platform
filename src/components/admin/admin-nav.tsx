"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  ScanLine,
  Gift,
  Images,
  Home,
  Users,
  UserCheck,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RumaMark } from "@/components/shared/ruma-mark";
import { signOutAction } from "@/app/admin/actions";
import type { StaffRole } from "@/lib/supabase/database.types";
import type { OrgBrand } from "@/lib/domain/membership";

// `allow` lists the roles that see each item.
const VOLUNTEER_PLUS: StaffRole[] = ["admin", "committee", "volunteer"];
const COMMITTEE_PLUS: StaffRole[] = ["admin", "committee"];
const ALL_STAFF: StaffRole[] = ["admin", "committee", "volunteer", "scanner"];

const LINKS: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  allow: StaffRole[];
}[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true, allow: VOLUNTEER_PLUS },
  { href: "/admin/registrations", label: "Registrations", icon: ClipboardList, allow: VOLUNTEER_PLUS },
  { href: "/admin/membership", label: "Membership", icon: UserCheck, allow: COMMITTEE_PLUS },
  { href: "/admin/events", label: "Events", icon: CalendarDays, allow: COMMITTEE_PLUS },
  { href: "/admin/check-in", label: "Check-In", icon: ScanLine, allow: ALL_STAFF },
  { href: "/admin/gallery", label: "Gallery", icon: Images, allow: COMMITTEE_PLUS },
  { href: "/admin/lucky-draw", label: "Lucky Draw", icon: Gift, allow: COMMITTEE_PLUS },
  { href: "/admin/content", label: "Homepage", icon: Home, allow: COMMITTEE_PLUS },
  { href: "/admin/users", label: "Users", icon: Users, allow: ["admin"] },
  { href: "/admin/settings", label: "Settings", icon: Settings, allow: ["admin"] },
];

export function AdminNav({
  email,
  role,
  brand,
}: {
  email: string;
  role: StaffRole;
  brand: OrgBrand;
}) {
  const pathname = usePathname();
  const links = LINKS.filter((l) => l.allow.includes(role));

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-gold/20 bg-cream/40 p-4 md:flex">
        <Link href="/admin" className="mb-6 px-2 text-kerala-700">
          <RumaMark name={brand.name} tagline={brand.tagline} logoUrl={brand.logoUrl} />
        </Link>
        <nav className="flex-1 space-y-1">
          {links.map((l) => (
            <NavItem
              key={l.href}
              href={l.href}
              label={l.label}
              icon={l.icon}
              exact={l.exact}
              pathname={pathname}
            />
          ))}
        </nav>
        <div className="border-t border-gold/20 pt-3">
          <p className="truncate px-2 text-caption text-text-muted">{email}</p>
          <form action={signOutAction}>
            <button className="mt-1 flex w-full items-center gap-2 rounded-md px-2 py-2 text-small text-text-secondary hover:bg-cream">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile bottom bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-gold/20 bg-ivory/95 backdrop-blur md:hidden">
        {links.map((l) => {
          const active = l.exact
            ? pathname === l.href
            : pathname.startsWith(l.href);
          const Icon = l.icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2 text-caption",
                active ? "text-kerala-700" : "text-text-muted",
              )}
            >
              <Icon className="h-5 w-5" />
              {l.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  exact,
  pathname,
}: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  pathname: string;
}) {
  const active = exact ? pathname === href : pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2.5 text-body font-medium transition-colors",
        active
          ? "bg-kerala-600 text-white"
          : "text-charcoal hover:bg-cream",
      )}
    >
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  );
}
