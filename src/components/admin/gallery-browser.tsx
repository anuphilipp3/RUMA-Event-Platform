"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Images, ImageIcon } from "lucide-react";
import { ListToolbar, type ListView } from "@/components/admin/list-toolbar";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AdminGalleryListItem } from "@/lib/data/gallery-admin";

const STATUS_VARIANT = {
  published: "success",
  draft: "warning",
  archived: "neutral",
} as const;

export function GalleryBrowser({ rows }: { rows: AdminGalleryListItem[] }) {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<ListView>("grid");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((a) =>
      `${a.title} ${a.status}`.toLowerCase().includes(q),
    );
  }, [rows, query]);

  return (
    <div className="space-y-4">
      <ListToolbar
        query={query}
        onQuery={setQuery}
        placeholder="Search albums by title or status"
        view={view}
        onView={setView}
        count={filtered.length}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={Images}
          title="No matching albums"
          description="Try a different album title or status."
        />
      ) : view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <Link key={a.id} href={`/admin/gallery/${a.id}`}>
              <Card className="overflow-hidden transition-colors hover:border-gold/50">
                <div className="aspect-video bg-cream">
                  {a.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={a.coverUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-text-muted">
                      <ImageIcon className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-card-title font-semibold text-charcoal">
                      {a.title}
                    </p>
                    <p className="text-small text-text-secondary">
                      {a.photoCount} photo{a.photoCount === 1 ? "" : "s"}
                    </p>
                  </div>
                  <Badge variant={STATUS_VARIANT[a.status]}>{a.status}</Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((a) => (
            <li key={a.id}>
              <Link href={`/admin/gallery/${a.id}`}>
                <Card className="flex items-center gap-3 p-3 transition-colors hover:border-gold/50 hover:bg-cream">
                  <div className="h-14 w-20 shrink-0 overflow-hidden rounded bg-cream">
                    {a.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={a.coverUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-text-muted">
                        <ImageIcon className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body font-semibold text-charcoal">
                      {a.title}
                    </p>
                    <p className="text-small text-text-secondary">
                      {a.photoCount} photo{a.photoCount === 1 ? "" : "s"}
                    </p>
                  </div>
                  <Badge variant={STATUS_VARIANT[a.status]}>{a.status}</Badge>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
