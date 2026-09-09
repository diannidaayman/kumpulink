import Link from "next/link";

import { Button } from "@/components/ui/button";
import { historyHref, type HistoryParams } from "@/lib/history/query-params";
import type { HistoryPagination } from "@/lib/history/pagination";

/**
 * Paginasi berbasis halaman dengan totalnya dinyatakan, bukan gulir tak
 * berujung: ini catatan pertanggungjawaban, dan posisi baris harus stabil
 * serta dapat dirujuk. Kedua tombol membawa serta seluruh penyaring yang
 * sedang aktif.
 */
export function HistoryPaginationBar({
  groupId,
  params,
  pagination,
}: {
  groupId: string;
  params: HistoryParams;
  pagination: HistoryPagination;
}) {
  const first = pagination.page <= 1;
  const last = pagination.page >= pagination.pageCount;

  return (
    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-muted-foreground">{pagination.summary}</span>
      <div className="flex gap-2">
        <Button asChild={!first} variant="outline" size="sm" disabled={first}>
          {first ? (
            <span>Sebelumnya</span>
          ) : (
            <Link href={historyHref(groupId, { ...params, page: pagination.page - 1 })}>
              Sebelumnya
            </Link>
          )}
        </Button>
        <Button asChild={!last} variant="outline" size="sm" disabled={last}>
          {last ? (
            <span>Berikutnya</span>
          ) : (
            <Link href={historyHref(groupId, { ...params, page: pagination.page + 1 })}>
              Berikutnya
            </Link>
          )}
        </Button>
      </div>
    </div>
  );
}
