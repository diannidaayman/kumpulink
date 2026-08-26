"use client";

import { ChevronDown, ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * ui-context.md mewajibkan alternatif papan ketik bagi geser berupa
 * TOMBOL NAIK DAN TURUN — bukan sensor papan ketik pustaka seret. Karena
 * itu tombol ini bukan cadangan: ia jalur yang setara, dan ia yang
 * membuat penyusunan ulang dapat diselesaikan tanpa menyentuh tetikus.
 *
 * Tombol di tepi DISEMBUNYIKAN, bukan diabukan — kontrol nonaktif yang
 * tetap terlihat sebagai tombol hanya mengundang ketukan yang gagal.
 */
export function ItemReorderButtons({
  title,
  index,
  total,
  onMove,
}: {
  title: string;
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
          className="h-8 w-8"
          aria-label={`Naikkan urutan ${title}`}
          onClick={() => onMove("up")}
        >
          <ChevronUp className="h-4 w-4" aria-hidden />
        </Button>
      )}
      {index < total - 1 && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          aria-label={`Turunkan urutan ${title}`}
          onClick={() => onMove("down")}
        >
          <ChevronDown className="h-4 w-4" aria-hidden />
        </Button>
      )}
    </span>
  );
}
