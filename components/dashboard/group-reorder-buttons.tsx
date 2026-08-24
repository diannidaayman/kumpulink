"use client";

import { ChevronDown, ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { GroupListItem } from "@/lib/types/group";

/**
 * Tombol di tepi DISEMBUNYIKAN, bukan diabukan. Kontrol nonaktif yang
 * tetap terlihat sebagai tombol hanya mengundang ketukan yang gagal.
 *
 * Ini juga satu-satunya cara menyusun ulang group di unit ini — bukan
 * cadangan bagi geser, melainkan jalur utamanya.
 */
export function GroupReorderButtons({
  group,
  index,
  total,
  onMove,
}: {
  group: GroupListItem;
  index: number;
  total: number;
  onMove: (direction: "up" | "down") => void;
}) {
  return (
    <span className="flex shrink-0 items-center gap-1">
      {index > 0 && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={`Naikkan urutan ${group.title}`}
          onClick={(event) => {
            event.stopPropagation();
            onMove("up");
          }}
        >
          <ChevronUp className="h-4 w-4" aria-hidden />
        </Button>
      )}
      {index < total - 1 && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={`Turunkan urutan ${group.title}`}
          onClick={(event) => {
            event.stopPropagation();
            onMove("down");
          }}
        >
          <ChevronDown className="h-4 w-4" aria-hidden />
        </Button>
      )}
    </span>
  );
}
