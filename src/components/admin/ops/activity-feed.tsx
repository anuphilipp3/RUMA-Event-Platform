import { UserPlus, CheckCircle2, ScanLine } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import { Activity } from "lucide-react";
import type { ActivityItem, ActivityKind } from "@/lib/data/admin";

const CONFIG: Record<
  ActivityKind,
  { icon: typeof UserPlus; cls: string }
> = {
  registered: { icon: UserPlus, cls: "bg-cream text-text-secondary" },
  approved: { icon: CheckCircle2, cls: "bg-kerala-50 text-kerala-600" },
  checked_in: { icon: ScanLine, cls: "bg-gold/15 text-gold-700" },
};

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        title="No activity yet"
        description="Registrations, approvals and check-ins will show up here."
      />
    );
  }

  return (
    <ol className="space-y-1">
      {items.map((item, i) => {
        const { icon: Icon, cls } = CONFIG[item.kind];
        return (
          <li key={i} className="flex items-center gap-3 rounded-md px-1 py-2">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${cls}`}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-body text-charcoal">
                <span className="font-semibold">{item.who}</span>
              </p>
              <p className="truncate text-small text-text-secondary">
                {item.detail}
              </p>
            </div>
            <time className="shrink-0 text-caption text-text-muted">
              {timeAgo(item.at)}
            </time>
          </li>
        );
      })}
    </ol>
  );
}
