import {
  DELETED_ITEM_VALUE,
  historyDateSchema,
  historyDeniedSchema,
  historyItemSchema,
  historyPageSchema,
} from "@/lib/validation/history";

export { DELETED_ITEM_VALUE };

export type RawSearchParams = Record<string, string | string[] | undefined>;

export type HistoryParams = {
  item: string | null;
  dari: string | null;
  sampai: string | null;
  deniedOnly: boolean;
  page: number;
};

/** Urutan tetap, dipakai untai kanonik maupun untai yang dikirim. */
const ORDERED_KEYS = ["item", "dari", "sampai", "ditolak", "hal"] as const;

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

/**
 * Satu aturan: nilai yang tidak sah DIBUANG, tidak pernah ditebak dan
 * tidak pernah menggagalkan halaman. Pemanggilnya membandingkan hasil
 * untai kanoniknya dengan untai yang dikirim, lalu redirect bila berbeda
 * — sehingga alamat dan isi layar tidak pernah bercerita berbeda.
 *
 * Satu kekecualian: dari yang lebih besar daripada sampai DITUKAR, bukan
 * dibuang. Maksudnya tidak ambigu, dan membuang keduanya berarti membuang
 * pekerjaan pemilik.
 */
export function normalizeHistoryParams(raw: RawSearchParams): HistoryParams {
  // safeParse dipanggil langsung per medan, bukan lewat pembungkus
  // generik. Pembungkus generik menuntut menuliskan tipe skema Zod
  // sendiri, dan tipe itu berbeda antara skema biasa dan skema
  // ber-transform seperti historyPageSchema — jalan tercepat menuju
  // `any`, yang dilarang Global Constraints.
  const itemResult = historyItemSchema.safeParse(first(raw.item));
  const dariResult = historyDateSchema.safeParse(first(raw.dari));
  const sampaiResult = historyDateSchema.safeParse(first(raw.sampai));
  const deniedResult = historyDeniedSchema.safeParse(first(raw.ditolak));
  const pageResult = historyPageSchema.safeParse(first(raw.hal));

  const item = itemResult.success ? itemResult.data : null;
  let dari = dariResult.success ? dariResult.data : null;
  let sampai = sampaiResult.success ? sampaiResult.data : null;
  const deniedOnly = deniedResult.success;
  const page = pageResult.success ? pageResult.data : 1;

  if (dari !== null && sampai !== null && dari > sampai) {
    [dari, sampai] = [sampai, dari];
  }

  return { item, dari, sampai, deniedOnly, page };
}

/** Untai kueri kanonik. Halaman pertama tidak ditulis. */
export function historyQueryString(params: HistoryParams): string {
  const search = new URLSearchParams();
  if (params.item !== null) search.set("item", params.item);
  if (params.dari !== null) search.set("dari", params.dari);
  if (params.sampai !== null) search.set("sampai", params.sampai);
  if (params.deniedOnly) search.set("ditolak", "1");
  if (params.page > 1) search.set("hal", String(params.page));
  return search.toString();
}

/**
 * Untai kueri yang BENAR-BENAR dikirim, disusun ulang dalam urutan yang
 * sama supaya dapat dibandingkan dengan untai kanonik. Kunci di luar
 * kelima yang dikenali sengaja diabaikan; ia tidak berbahaya dan tidak
 * layak memicu pengalihan.
 */
export function givenQueryString(raw: RawSearchParams): string {
  const search = new URLSearchParams();
  for (const key of ORDERED_KEYS) {
    const value = first(raw[key]);
    if (value !== undefined && value !== "") search.set(key, value);
  }
  return search.toString();
}

export function historyHref(groupId: string, params: HistoryParams): string {
  const query = historyQueryString(params);
  const path = `/dashboard/groups/${groupId}/riwayat`;
  return query === "" ? path : `${path}?${query}`;
}

/**
 * Satu-satunya tempat "sedang menyaring" didefinisikan. Halaman server dan
 * HistoryFilterBar dulu masing-masing menulis ulang definisi ini sendiri
 * — penyaring keenam kelak wajib menyentuh keduanya, atau kedua permukaan
 * berselisih (bilah menyembunyikan tombol Hapus sementara keadaan kosong
 * menampilkannya). Fungsi murni ini dipakai di kedua tempat.
 */
export function isFiltering(params: HistoryParams): boolean {
  return (
    params.item !== null || params.dari !== null || params.sampai !== null || params.deniedOnly
  );
}
