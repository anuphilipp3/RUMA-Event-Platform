"use client";

import { Search, List, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

export type ListView = "list" | "grid";

/**
 * Search input + optional list/grid view toggle for dashboard listings.
 * Controlled by the parent browser component.
 */
export function ListToolbar({
  query,
  onQuery,
  placeholder = "Search…",
  view,
  onView,
  count,
}: {
  query: string;
  onQuery: (v: string) => void;
  placeholder?: string;
  view?: ListView;
  onView?: (v: ListView) => void;
  count?: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder={placeholder}
          className="h-11 w-full rounded-md border border-field bg-white pl-9 pr-3 text-body text-charcoal placeholder:text-text-muted focus-visible:border-kerala-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kerala/40"
        />
        {query && (
          <button
            type="button"
            onClick={() => onQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-small text-text-muted hover:text-charcoal"
          >
            Clear
          </button>
        )}
      </div>

      {typeof count === "number" && (
        <span className="hidden shrink-0 text-small text-text-muted sm:inline">
          {count} result{count === 1 ? "" : "s"}
        </span>
      )}

      {view && onView && (
        <div className="flex shrink-0 rounded-md border border-field bg-white p-0.5">
          <ToggleBtn active={view === "list"} onClick={() => onView("list")} label="List">
            <List className="h-4 w-4" />
          </ToggleBtn>
          <ToggleBtn active={view === "grid"} onClick={() => onView("grid")} label="Grid">
            <LayoutGrid className="h-4 w-4" />
          </ToggleBtn>
        </div>
      )}
    </div>
  );
}

function ToggleBtn({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${label} view`}
      aria-pressed={active}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded",
        active ? "bg-kerala-600 text-white" : "text-text-secondary hover:bg-cream",
      )}
    >
      {children}
    </button>
  );
}
