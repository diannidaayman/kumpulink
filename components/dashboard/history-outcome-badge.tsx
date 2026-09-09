import { Check, X } from "lucide-react";

import type { HistoryRowView } from "@/lib/types/history";
import { cn } from "@/lib/utils";

/**
 * Tata bahasa pil yang sama dengan GroupStatusBadge: rounded-full, garis
 * batas setipis rambut, permukaan bernada tipis, TIDAK PERNAH terisi
 * penuh, selalu ikon plus teks.
 *
 * Ikon dan teks itulah yang membuat warna bukan satu-satunya pembawa
 * makna. Tidak ada perlakuan di tingkat baris — keputusan U6-6.
 */
export function HistoryOutcomeBadge({ row }: { row: HistoryRowView }) {
  const Icon = row.granted ? Check : X;

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-sm",
          row.granted
            ? "border-state-success/40 bg-state-success/10 text-state-success"
            : "border-state-error/40 bg-state-error/10 text-state-error",
        )}
      >
        <Icon className="h-4 w-4" aria-hidden />
        {row.outcomeLabel}
      </span>
      {row.denyLabel !== null && (
        <span
          className="text-sm text-muted-foreground"
          title={row.denyDescription ?? undefined}
        >
          {row.denyLabel}
        </span>
      )}
    </span>
  );
}
