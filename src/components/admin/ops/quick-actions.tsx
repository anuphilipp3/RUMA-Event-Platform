import Link from "next/link";
import {
  CheckSquare,
  ScanLine,
  CalendarPlus,
  ImagePlus,
  Home,
  type LucideIcon,
} from "lucide-react";
import type { StaffRole } from "@/lib/supabase/database.types";

interface Action {
  href: string;
  label: string;
  icon: LucideIcon;
  allow: StaffRole[];
}

const VOL: StaffRole[] = ["admin", "committee", "volunteer"];
const COMM: StaffRole[] = ["admin", "committee"];
const ALL: StaffRole[] = ["admin", "committee", "volunteer", "scanner"];

const ACTIONS: Action[] = [
  { href: "/admin/registrations?status=pending", label: "Approve registrations", icon: CheckSquare, allow: VOL },
  { href: "/admin/check-in", label: "Scan ticket", icon: ScanLine, allow: ALL },
  { href: "/admin/events/new", label: "Create event", icon: CalendarPlus, allow: COMM },
  { href: "/admin/gallery", label: "Upload photos", icon: ImagePlus, allow: COMM },
  { href: "/admin/content", label: "Edit homepage", icon: Home, allow: COMM },
];

export function QuickActions({ role }: { role: StaffRole }) {
  const actions = ACTIONS.filter((a) => a.allow.includes(role));
  if (actions.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {actions.map((a) => {
        const Icon = a.icon;
        return (
          <Link
            key={a.href}
            href={a.href}
            className="flex flex-col items-start gap-3 rounded-lg border border-gold/25 bg-white p-4 transition-colors hover:border-kerala-600/50 hover:bg-kerala-50"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-kerala-50 text-kerala-600">
              <Icon className="h-5 w-5" />
            </span>
            <span className="text-small font-medium text-charcoal">
              {a.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
