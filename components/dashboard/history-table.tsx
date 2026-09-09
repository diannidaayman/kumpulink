import { HistoryEmail } from "@/components/dashboard/history-email";
import { HistoryOutcomeBadge } from "@/components/dashboard/history-outcome-badge";
import type { HistoryRowView } from "@/lib/types/history";
import { cn } from "@/lib/utils";

/**
 * Tabel lima kolom untuk md ke atas; di bawahnya HistoryCards yang
 * tampil. Keduanya membaca model tampilan yang sama, sehingga teksnya
 * tidak dapat menyimpang satu sama lain.
 *
 * Urutan pengorbanan saat layar menyempit ditetapkan ui-context, dan
 * dijalankan LITERAL di sini: pada lg ke atas ada LIMA kolom, dan Email
 * berdiri sendiri. Antara md dan lg, kolom Email hilang dan isinya turun
 * menjadi baris kedua mono redup di dalam sel Nama — itu pengorbanan
 * pertama, bukan keadaan bawaan. Item menyusut dengan elipsis dan judul
 * utuhnya tetap tersedia di atribut title; Hasil tidak pernah
 * dikorbankan; Waktu berlebar tetap dan tidak pernah menyusut.
 */
export function HistoryTable({ rows }: { rows: HistoryRowView[] }) {
  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-border">
            <th scope="col" className="w-56 px-3 py-2 text-sm font-medium text-muted-foreground">
              Waktu
            </th>
            <th scope="col" className="px-3 py-2 text-sm font-medium text-muted-foreground">
              Nama
            </th>
            <th
              scope="col"
              className="hidden px-3 py-2 text-sm font-medium text-muted-foreground lg:table-cell"
            >
              Email
            </th>
            <th scope="col" className="px-3 py-2 text-sm font-medium text-muted-foreground">
              Item
            </th>
            <th scope="col" className="w-52 px-3 py-2 text-sm font-medium text-muted-foreground">
              Hasil
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-border align-top">
              <td className="w-56 px-3 py-3">
                <span className="block font-mono text-sm">{row.time}</span>
                {row.timeIp !== null && (
                  <span className="block font-mono text-sm text-muted-foreground">
                    {row.timeIp}
                  </span>
                )}
              </td>
              <td className="min-w-0 px-3 py-3">
                <span
                  className={cn(
                    "block truncate text-base",
                    row.isAnonymous ? "text-muted-foreground" : "font-medium",
                  )}
                  title={row.name}
                >
                  {row.name}
                </span>
                {/* Pengorbanan pertama: di bawah lg, Email turun ke sini. */}
                {row.email !== null && <HistoryEmail email={row.email} className="lg:hidden" />}
                {row.nameIp !== null && (
                  <span className="block font-mono text-sm text-muted-foreground">
                    {row.nameIp}
                  </span>
                )}
              </td>
              <td className="hidden min-w-0 px-3 py-3 lg:table-cell">
                {row.email !== null && <HistoryEmail email={row.email} />}
              </td>
              <td className="min-w-0 px-3 py-3">
                <span
                  className={cn(
                    "block truncate text-base",
                    row.itemIsAbsent && "italic text-muted-foreground",
                  )}
                  title={row.item}
                >
                  {row.item}
                </span>
              </td>
              <td className="w-52 px-3 py-3">
                <HistoryOutcomeBadge row={row} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
