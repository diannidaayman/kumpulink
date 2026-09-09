import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { HistoryCards } from "@/components/dashboard/history-cards";
import { HistoryEmptyState } from "@/components/dashboard/history-empty-state";
import { HistoryFilterBar } from "@/components/dashboard/history-filter-bar";
import { HistoryPaginationBar } from "@/components/dashboard/history-pagination";
import { HistoryTable } from "@/components/dashboard/history-table";
import { requireOwner } from "@/lib/auth/session";
import { hasDeletedItemLogs, listAccessLogs } from "@/lib/db/access-logs";
import { getGroupTitleById } from "@/lib/db/groups";
import { listItemTitlesByGroup } from "@/lib/db/items";
import { HISTORY_PAGE_SIZE, buildPagination } from "@/lib/history/pagination";
import {
  DELETED_ITEM_VALUE,
  givenQueryString,
  historyHref,
  historyQueryString,
  isFiltering,
  normalizeHistoryParams,
  type RawSearchParams,
} from "@/lib/history/query-params";
import { toHistoryRow } from "@/lib/history/row";
import type { HistoryItemOption } from "@/lib/types/history";
import { groupIdSchema } from "@/lib/validation/group";

export const dynamic = "force-dynamic";

export default async function HistoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ groupId: string }>;
  searchParams: Promise<RawSearchParams>;
}) {
  // Layout tidak menjamin gerbang ini saat navigasi lunak antar saudara.
  // Pola yang sama dengan app/(dashboard)/dashboard/page.tsx.
  await requireOwner();

  const { groupId: rawGroupId } = await params;

  // Parameter rute adalah input eksternal, sama seperti searchParams —
  // keduanya wajib divalidasi Zod (code-standards.md, invarian 9 di
  // architecture.md) sebelum dipakai untuk apa pun. Divalidasi PERTAMA,
  // sebelum pengalihan kanonik disusun, supaya groupId yang tidak sah
  // tidak pernah ikut tersusun menjadi alamat tujuan redirect.
  const groupIdResult = groupIdSchema.safeParse(rawGroupId);
  if (!groupIdResult.success) notFound();
  const groupId = groupIdResult.data;

  const raw = await searchParams;

  // Aturan tunggal: nilai yang tidak sah dibuang, lalu alamatnya
  // diluruskan. Alamat dan isi layar tidak boleh bercerita berbeda.
  const query = normalizeHistoryParams(raw);
  if (givenQueryString(raw) !== historyQueryString(query)) {
    redirect(historyHref(groupId, query));
  }

  const groupTitle = await getGroupTitleById(groupId);
  if (groupTitle === null) notFound();

  const items = await listItemTitlesByGroup(groupId);
  const liveItemIds = items.map((item) => item.id);
  const itemTitles = new Map(items.map((item) => [item.id, item.title]));

  // itemOptions disusun DI SINI, sebelum filter dipakai untuk mengueri
  // baris — bukan di dekat akhir seperti urutan pada rancangan awal.
  // Pemeriksaan `query.item` di bawah butuh daftar ini sudah lengkap
  // supaya tahu id mana yang sah.
  const deletedItemsPresent = await hasDeletedItemLogs(groupId, liveItemIds);
  const itemOptions: HistoryItemOption[] = [
    ...items.map((item) => ({ value: item.id, label: item.title })),
    ...(deletedItemsPresent
      ? [{ value: DELETED_ITEM_VALUE, label: "Item sudah dihapus" }]
      : []),
  ];

  // Keadaan yang tidak pasti diluruskan, tidak dibiarkan lolos diam-diam:
  // `?item=<id>` dapat menunjuk id yang tidak ada satu pun di itemOptions
  // — misalnya alamat lama yang ditandai pemilik sebelum itemnya dihapus.
  // Bila dibiarkan, <select> tidak menampilkan pilihan apa pun sementara
  // penyaringnya tetap aktif, dan alamat bercerita berbeda dari isi
  // layar. Aturannya sama dengan parameter tidak sah lainnya: dibuang,
  // lalu redirect ke alamat kanoniknya. Halaman juga dikembalikan ke 1,
  // sama seperti setiap perubahan penyaring lain di HistoryFilterBar —
  // ini satu-satunya tempat aturan itu sebelumnya tidak berlaku.
  if (query.item !== null && !itemOptions.some((option) => option.value === query.item)) {
    redirect(historyHref(groupId, { ...query, item: null, page: 1 }));
  }

  const filter = {
    groupId,
    item: query.item,
    dari: query.dari,
    sampai: query.sampai,
    deniedOnly: query.deniedOnly,
  };

  // Hitungan diambil lebih dulu bersama barisnya. Halaman di luar
  // jangkauan baru dapat diketahui setelah totalnya ada, dan alamatnya
  // diluruskan dengan aturan yang sama seperti parameter tidak sah.
  const { rows, total } = await listAccessLogs(
    filter,
    liveItemIds,
    (query.page - 1) * HISTORY_PAGE_SIZE,
    HISTORY_PAGE_SIZE,
  );
  const pagination = buildPagination(query.page, total);
  if (pagination.page !== query.page) {
    redirect(historyHref(groupId, { ...query, page: pagination.page }));
  }

  const views = rows.map((row) => toHistoryRow(row, itemTitles));
  const filtering = isFiltering(query);

  return (
    // data-wide melebarkan bilah atas DAN <main> menjadi max-w-6xl.
    // Kontraknya ditetapkan app/(dashboard)/layout.tsx, keputusan U6-3.
    <div data-wide>
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm text-muted-foreground underline">
          Kembali ke dashboard
        </Link>
        <h1 className="mt-2 text-base font-medium">Riwayat akses — {groupTitle}</h1>
      </div>

      <HistoryFilterBar groupId={groupId} params={query} itemOptions={itemOptions} />

      {views.length === 0 ? (
        <HistoryEmptyState
          filtering={filtering}
          clearHref={historyHref(groupId, {
            item: null,
            dari: null,
            sampai: null,
            deniedOnly: false,
            page: 1,
          })}
        />
      ) : (
        <>
          <HistoryTable rows={views} />
          <HistoryCards rows={views} />
          <HistoryPaginationBar groupId={groupId} params={query} pagination={pagination} />
        </>
      )}
    </div>
  );
}
