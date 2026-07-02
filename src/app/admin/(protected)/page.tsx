import Link from "next/link";
import {
  IndianRupee,
  UserRound,
  Baby,
  ScanLine,
  Gift,
  CalendarX,
  AlertCircle,
  ArrowRight,
  CalendarDays,
  Users,
  UsersRound,
  UserCheck,
} from "lucide-react";
import {
  getPrimaryEvent,
  getDashboardStats,
  getRecentActivity,
} from "@/lib/data/admin";
import { getCommunityStats } from "@/lib/data/community-stats";
import { requireVolunteer } from "@/lib/auth";
import { StatCard } from "@/components/admin/stat-card";
import { QuickActions } from "@/components/admin/ops/quick-actions";
import { ProgressStat } from "@/components/admin/ops/progress-stat";
import { ActivityFeed } from "@/components/admin/ops/activity-feed";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatINR, greeting, formatEventDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const me = await requireVolunteer();
  const firstName = (me.fullName ?? "").split(" ")[0] || "there";
  const event = await getPrimaryEvent();

  if (!event) {
    return (
      <div className="space-y-6">
        <Welcome name={firstName} subtitle="Welcome back to RUMA." />
        <EmptyState
          icon={CalendarX}
          title="No event yet"
          description="Create and publish an event to start tracking registrations."
        />
      </div>
    );
  }

  const [stats, activity, community] = await Promise.all([
    getDashboardStats(event.id),
    getRecentActivity(event.id),
    getCommunityStats(),
  ]);

  return (
    <div className="space-y-6">
      <Welcome
        name={firstName}
        subtitle={
          <>
            Next up:{" "}
            <span className="font-medium text-charcoal">{event.name}</span> ·{" "}
            {formatEventDate(event.start_date, event.end_date)}
          </>
        }
      />

      {/* Attention required — always visible when there's something to do */}
      {stats.pendingApprovals > 0 && (
        <Link href="/admin/registrations?status=pending">
          <div className="flex items-center justify-between gap-3 rounded-lg border border-gold/40 bg-gold/10 p-4 transition-colors hover:bg-gold/15">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-600/20 text-gold-700">
                <AlertCircle className="h-5 w-5" />
              </span>
              <div>
                <p className="text-body font-semibold text-charcoal">
                  {stats.pendingApprovals} registration
                  {stats.pendingApprovals === 1 ? "" : "s"} need approval
                </p>
                <p className="text-small text-text-secondary">
                  {formatINR(stats.pendingRevenue)} awaiting verification
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gold-700" />
          </div>
        </Link>
      )}

      {/* Quick actions */}
      <section>
        <h2 className="mb-3 text-small font-semibold uppercase tracking-wide text-text-muted">
          Quick actions
        </h2>
        <QuickActions role={me.role} />
      </section>

      {/* Event health + revenue */}
      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-kerala-600" />
            <h2 className="text-card-title font-semibold text-charcoal">
              Event health
            </h2>
          </div>
          <div className="space-y-5">
            <ProgressStat
              label="Registrations approved"
              value={stats.approvedRegistrations}
              total={stats.totalRegistrations}
              hint={`${stats.pendingApprovals} pending`}
            />
            <ProgressStat
              label="Checked in"
              value={stats.checkedIn}
              total={stats.totalTickets}
              tone="gold"
              hint={`${stats.totalTickets} tickets issued`}
            />
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <IndianRupee className="h-5 w-5 text-kerala-600" />
            <h2 className="text-card-title font-semibold text-charcoal">
              Revenue
            </h2>
          </div>
          <div className="space-y-3">
            <RevenueRow label="Collected" value={stats.totalRevenue} strong />
            <RevenueRow label="Pending" value={stats.pendingRevenue} />
            <div className="flex items-center justify-between border-t border-gold/20 pt-3">
              <span className="text-small text-text-secondary">Expected total</span>
              <span className="text-card-title font-bold text-kerala-700">
                {formatINR(stats.expectedRevenue)}
              </span>
            </div>
          </div>
        </Card>
      </section>

      {/* Community snapshot — auto-generated, association-wide */}
      <section>
        <h2 className="mb-3 text-small font-semibold uppercase tracking-wide text-text-muted">
          Community
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Families" value={community.families} icon={Users} accent="green" />
          <StatCard label="Members" value={community.members} icon={UsersRound} />
          <StatCard label="Events hosted" value={community.events} icon={CalendarDays} />
          <StatCard label="Volunteers" value={community.volunteers} icon={UserCheck} accent="gold" />
        </div>
      </section>

      {/* This event */}
      <section>
        <h2 className="mb-3 text-small font-semibold uppercase tracking-wide text-text-muted">
          This event
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Adults" value={stats.adults} icon={UserRound} />
          <StatCard label="Children" value={stats.children} icon={Baby} />
          <StatCard
            label="Checked in"
            value={`${stats.checkedIn}/${stats.totalTickets}`}
            icon={ScanLine}
            accent="green"
          />
          <StatCard label="Coupons" value={stats.couponsIssued} icon={Gift} accent="gold" />
        </div>
      </section>

      {/* Recent activity */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-card-title font-semibold text-charcoal">
            Recent activity
          </h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/registrations?status=all">View all</Link>
          </Button>
        </div>
        <Card className="p-3">
          <ActivityFeed items={activity} />
        </Card>
      </section>
    </div>
  );
}

function Welcome({
  name,
  subtitle,
}: {
  name: string;
  subtitle: React.ReactNode;
}) {
  return (
    <header>
      <h1 className="font-display text-page-title font-semibold tracking-tightest text-charcoal">
        {greeting()}, {name} 👋
      </h1>
      <p className="mt-1 text-body text-text-secondary">{subtitle}</p>
    </header>
  );
}

function RevenueRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: number;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-small text-text-secondary">{label}</span>
      <span
        className={
          strong
            ? "text-body font-semibold text-charcoal"
            : "text-body text-charcoal"
        }
      >
        {formatINR(value)}
      </span>
    </div>
  );
}
