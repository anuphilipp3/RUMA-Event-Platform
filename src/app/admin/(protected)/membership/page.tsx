import Link from "next/link";
import { Users, UserCheck, Clock } from "lucide-react";
import { requireCommittee } from "@/lib/auth";
import { listFamilies, getMembershipStats } from "@/lib/data/membership-admin";
import { StatCard } from "@/components/admin/stat-card";
import { FamiliesBrowser } from "@/components/admin/families-browser";
import { cn } from "@/lib/utils";
import type { FamilyStatus } from "@/lib/supabase/database.types";

export const dynamic = "force-dynamic";

const FILTERS: { key: FamilyStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "active", label: "Active" },
  { key: "rejected", label: "Rejected" },
];

export default async function MembershipPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireCommittee();
  const { status } = await searchParams;
  const filter = (FILTERS.find((f) => f.key === status)?.key ?? "all") as
    | FamilyStatus
    | "all";

  const [families, stats] = await Promise.all([
    listFamilies(filter),
    getMembershipStats(),
  ]);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-page-title font-bold text-charcoal">Membership</h1>
        <p className="text-body text-text-secondary">
          Review and activate family memberships.
        </p>
      </header>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Active families" value={stats.active} icon={UserCheck} accent="green" />
        <StatCard label="Pending" value={stats.pending} icon={Clock} accent="gold" />
        <StatCard label="Members" value={stats.members} icon={Users} />
      </div>

      <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Filter">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={`/admin/membership?status=${f.key}`}
            className={cn(
              "whitespace-nowrap rounded-full px-4 py-1.5 text-small font-medium transition-colors",
              filter === f.key ? "bg-kerala-600 text-white" : "bg-cream text-text-secondary hover:bg-gold/10",
            )}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      <FamiliesBrowser rows={families} />
    </div>
  );
}
