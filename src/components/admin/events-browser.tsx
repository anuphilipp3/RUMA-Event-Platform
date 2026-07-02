"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Pencil, ExternalLink, CalendarDays } from "lucide-react";
import { ListToolbar, type ListView } from "@/components/admin/list-toolbar";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatEventDate } from "@/lib/utils";
import type { AdminEventListRow } from "@/lib/data/events-admin";

function variant(status: string, ended: boolean) {
  if (ended) return "neutral" as const;
  if (status === "published") return "success" as const;
  if (status === "closed") return "danger" as const;
  return "warning" as const;
}

export function EventsBrowser({ rows }: { rows: AdminEventListRow[] }) {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<ListView>("list");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((e) =>
      `${e.name} ${e.slug} ${e.status}`.toLowerCase().includes(q),
    );
  }, [rows, query]);

  const now = Date.now();

  return (
    <div className="space-y-4">
      <ListToolbar
        query={query}
        onQuery={setQuery}
        placeholder="Search events by name or status"
        view={view}
        onView={setView}
        count={filtered.length}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No matching events"
          description="Try a different name or status."
        />
      ) : (
        <div
          className={
            view === "grid"
              ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
              : "space-y-2"
          }
        >
          {filtered.map((e) => {
            const ended = !!e.end_date && new Date(e.end_date).getTime() < now;
            return (
              <Card
                key={e.id}
                className={
                  view === "grid"
                    ? "flex flex-col gap-3 p-4"
                    : "flex items-center justify-between gap-3 p-4"
                }
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-body font-semibold text-charcoal">
                      {e.name}
                    </p>
                    <Badge variant={variant(e.status, ended)}>
                      {ended ? "Ended" : e.status}
                    </Badge>
                  </div>
                  <p className="text-small text-text-secondary">
                    {formatEventDate(e.start_date, e.end_date)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {e.status === "published" && !ended && (
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/e/${e.slug}`} target="_blank">
                        <ExternalLink /> View
                      </Link>
                    </Button>
                  )}
                  <Button asChild variant="secondary" size="sm">
                    <Link href={`/admin/events/${e.id}/edit`}>
                      <Pencil /> Edit
                    </Link>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
