import { HistoryEmail } from "@/components/dashboard/history-email";
import { HistoryOutcomeBadge } from "@/components/dashboard/history-outcome-badge";
import type { HistoryRowView } from "@/lib/types/history";
import { cn } from "@/lib/utils";

/**
 * Kartu ponsel, TANPA LABEL MEDAN SAMA SEKALI — posisi dan gaya huruf
 * yang memikulnya. Nama paling kuat, email mono redup, judul item, waktu
 * mono redup berlabel zona, dan Hasil sebagai pil di slot penanda kanan.
 *
 * Alamat IP sengaja tidak ikut, termasuk pada baris tanpa identitas,
 * sehingga kartu anonim hanya berbunyi "Tanpa identitas". Konsekuensi
 * yang diterima sadar: riwayat forensik dibaca di laptop, dan kartu ini
 * ada untuk memindai, bukan menelusuri.
 */
export function HistoryCards({ rows }: { rows: HistoryRowView[] }) {
  return (
    <ul className="flex flex-col gap-3 md:hidden">
      {rows.map((row) => (
        <li
          key={row.id}
          className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-4"
        >
          <div className="min-w-0">
            <p
              className={cn(
                "truncate text-base",
                row.isAnonymous ? "text-muted-foreground" : "font-medium",
              )}
            >
              {row.name}
            </p>
            {row.email !== null && <HistoryEmail email={row.email} />}
            <p
              className={cn(
                "mt-1 truncate text-base",
                row.itemIsAbsent && "italic text-muted-foreground",
              )}
            >
              {row.item}
            </p>
            <p className="mt-1 font-mono text-sm text-muted-foreground">{row.time}</p>
          </div>
          <div className="shrink-0">
            <HistoryOutcomeBadge row={row} />
          </div>
        </li>
      ))}
    </ul>
  );
}
