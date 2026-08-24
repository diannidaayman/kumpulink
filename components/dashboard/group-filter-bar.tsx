"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type GroupSegment = "active" | "inactive" | "all";

const SEGMENTS: { value: GroupSegment; label: string }[] = [
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Nonaktif" },
  { value: "all", label: "Semua" },
];

export function GroupFilterBar({
  query,
  segment,
  onQueryChange,
  onSegmentChange,
}: {
  query: string;
  segment: GroupSegment;
  onQueryChange: (value: string) => void;
  onSegmentChange: (value: GroupSegment) => void;
}) {
  return (
    <div className="sticky top-0 z-10 mb-3 flex flex-col gap-2 bg-background py-2 sm:flex-row sm:items-center">
      <div className="relative min-w-0 flex-1">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          className="pl-9"
          placeholder="Cari group"
          aria-label="Cari group"
        />
      </div>
      <div role="group" aria-label="Saring menurut keadaan" className="flex gap-1">
        {SEGMENTS.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={segment === option.value}
            onClick={() => onSegmentChange(option.value)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm",
              segment === option.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
