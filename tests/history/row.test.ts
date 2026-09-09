import { describe, expect, it } from "vitest";
import { ANONYMOUS_NAME, DELETED_ITEM, PAGE_VIEW_ITEM, toHistoryRow } from "@/lib/history/row";
import type { HistoryLogRow } from "@/lib/types/history";

const JUDUL = new Map<string, string>([["item-1", "Rundown acara"]]);

function baris(patch: Partial<HistoryLogRow> = {}): HistoryLogRow {
  return {
    id: "log-1",
    eventType: "ITEM_ACCESS",
    itemId: "item-1",
    visitorName: "Ani Pratama",
    visitorEmail: "ani@contoh.id",
    outcome: "GRANTED",
    denyReason: null,
    ipAddress: "203.0.113.9",
    createdAt: new Date("2026-09-09T05:05:00Z"),
    ...patch,
  };
}

describe("riwayat dibaca dari baris log, bukan dari tabel User", () => {
  // INI pengujian yang menjaga alasan aplikasi ini ada. Nama pengguna
  // dapat berubah kapan saja; baris riwayat harus tetap menunjukkan
  // keadaan pada SAAT KEJADIAN.
  it("menampilkan nama yang tersalin di baris, bukan nama pengguna hari ini", () => {
    const lama = toHistoryRow(baris({ visitorName: "Nama Lama" }), JUDUL);
    expect(lama.name).toBe("Nama Lama");
  });

  it("membawa email yang tersalin di baris, bukan email pengguna hari ini", () => {
    const row = baris({ visitorName: "Nama Lama", visitorEmail: "lama@contoh.id" });
    const view = toHistoryRow(row, JUDUL);
    expect(view.email).toBe("lama@contoh.id");
    expect(view.name).toBe("Nama Lama");
  });

  it("menerima tepat dua argumen, sehingga data pengguna tidak punya jalan masuk", () => {
    // Penjaga mekanis: menambahkan argumen ketiga berisi User akan
    // membuat pengujian ini merah sebelum sempat dipakai di halaman.
    expect(toHistoryRow.length).toBe(2);
  });
});

describe("kolom Waktu dan alamat IP", () => {
  it("memformat waktu dalam WIT beserta labelnya", () => {
    expect(toHistoryRow(baris(), JUDUL).time).toContain("WIT");
    expect(toHistoryRow(baris(), JUDUL).time).toContain("9 Sep");
  });

  // Seluruh guna tabel ini adalah menjawab "pada jam berapa", jadi kolom
  // Waktu wajib memuat jam dan menit, bukan cuma tanggal. Pemisah jam yang
  // dipakai Intl untuk locale id-ID berbeda antar versi ICU, jadi titik
  // pada regex sengaja wildcard hanya untuk posisi pemisah itu; urutan
  // digit "14" lalu "05" tetap terjaga. Lihat tests/time/format-datetime.test.ts.
  it("menyertakan jam dan menit pada kolom Waktu, bukan hanya tanggal", () => {
    const view = toHistoryRow(baris(), JUDUL);
    expect(view.time).toMatch(/14.05/);
  });

  it("menaruh IP di bawah Waktu pada baris beridentitas", () => {
    const view = toHistoryRow(baris(), JUDUL);
    expect(view.timeIp).toBe("203.0.113.9");
    expect(view.nameIp).toBeNull();
  });

  it("menaikkan IP ke sel Nama pada baris tanpa identitas", () => {
    // Keputusan U6-2: di baris anonim, IP adalah satu-satunya penanda
    // yang tersisa, jadi ia berdiri di kolom identitas.
    const view = toHistoryRow(baris({ visitorName: null, visitorEmail: null }), JUDUL);
    expect(view.nameIp).toBe("203.0.113.9");
    expect(view.timeIp).toBeNull();
  });
});

describe("medan id", () => {
  it("meneruskan id baris log apa adanya ke model tampilan", () => {
    const view = toHistoryRow(baris({ id: "log-42" }), JUDUL);
    expect(view.id).toBe("log-42");
  });
});

describe("kolom Nama", () => {
  it("menyebut baris tanpa nama dan email sebagai Tanpa identitas", () => {
    const view = toHistoryRow(baris({ visitorName: null, visitorEmail: null }), JUDUL);
    expect(view.name).toBe(ANONYMOUS_NAME);
    expect(view.isAnonymous).toBe(true);
    expect(view.email).toBeNull();
  });

  it("memakai email sebagai nama bila hanya email yang tersalin", () => {
    const view = toHistoryRow(baris({ visitorName: null }), JUDUL);
    expect(view.name).toBe("ani@contoh.id");
    expect(view.isAnonymous).toBe(false);
    // Tidak diulang sebagai baris kedua; satu alamat dua kali hanya
    // menghabiskan ruang kolom yang sudah sempit.
    expect(view.email).toBeNull();
  });
});

describe("kolom Item", () => {
  it("memakai judul item yang masih ada", () => {
    const view = toHistoryRow(baris(), JUDUL);
    expect(view.item).toBe("Rundown acara");
    expect(view.itemIsAbsent).toBe(false);
  });

  it("menandai baris PAGE_VIEW sebagai kunjungan halaman", () => {
    const view = toHistoryRow(baris({ eventType: "PAGE_VIEW", itemId: null }), JUDUL);
    expect(view.item).toBe(PAGE_VIEW_ITEM);
    expect(view.itemIsAbsent).toBe(true);
  });

  // eventType yang memutuskan, bukan ada tidaknya itemId. Baris ini
  // kebetulan membawa itemId yang valid, tapi tetap harus terbaca sebagai
  // kunjungan halaman karena eventType-nya PAGE_VIEW.
  it("tetap terbaca sebagai kunjungan halaman meski barisnya kebetulan membawa itemId", () => {
    const view = toHistoryRow(baris({ eventType: "PAGE_VIEW", itemId: "item-1" }), JUDUL);
    expect(view.item).toBe(PAGE_VIEW_ITEM);
    expect(view.itemIsAbsent).toBe(true);
  });

  it("menandai item yang tidak ada lagi di group sebagai sudah dihapus", () => {
    const view = toHistoryRow(baris({ itemId: "item-hilang" }), JUDUL);
    expect(view.item).toBe(DELETED_ITEM);
    expect(view.itemIsAbsent).toBe(true);
  });
});

describe("kolom Hasil", () => {
  it("menyebut baris GRANTED sebagai Diizinkan tanpa alasan", () => {
    const view = toHistoryRow(baris(), JUDUL);
    expect(view.granted).toBe(true);
    expect(view.outcomeLabel).toBe("Diizinkan");
    expect(view.denyLabel).toBeNull();
    expect(view.denyDescription).toBeNull();
  });

  it("menyebut baris DENIED sebagai Ditolak beserta label alasannya", () => {
    const view = toHistoryRow(baris({ outcome: "DENIED", denyReason: "EXPIRED" }), JUDUL);
    expect(view.granted).toBe(false);
    expect(view.outcomeLabel).toBe("Ditolak");
    expect(view.denyLabel).toBe("Group kedaluwarsa");
    expect(view.denyDescription).not.toBeNull();
  });

  it("menyatakan DENIED tanpa alasan sebagai tidak diketahui", () => {
    const view = toHistoryRow(baris({ outcome: "DENIED", denyReason: null }), JUDUL);
    expect(view.denyLabel).toBe("Alasan tidak diketahui");
  });
});
