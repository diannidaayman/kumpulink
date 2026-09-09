import { describe, expect, it } from "vitest";
import {
  DELETED_ITEM_VALUE,
  givenQueryString,
  historyHref,
  historyQueryString,
  isFiltering,
  normalizeHistoryParams,
} from "@/lib/history/query-params";

describe("normalizeHistoryParams", () => {
  it("membaca kelima parameter yang sah", () => {
    const params = normalizeHistoryParams({
      item: "cm1abc",
      dari: "2026-09-01",
      sampai: "2026-09-09",
      ditolak: "1",
      hal: "3",
    });
    expect(params).toEqual({
      item: "cm1abc",
      dari: "2026-09-01",
      sampai: "2026-09-09",
      deniedOnly: true,
      page: 3,
    });
  });

  it("mengembalikan keadaan bawaan ketika tidak ada parameter", () => {
    expect(normalizeHistoryParams({})).toEqual({
      item: null,
      dari: null,
      sampai: null,
      deniedOnly: false,
      page: 1,
    });
  });

  it("menerima nilai khusus untuk item yang sudah dihapus", () => {
    expect(normalizeHistoryParams({ item: DELETED_ITEM_VALUE }).item).toBe(DELETED_ITEM_VALUE);
  });

  it("membuang tanggal yang tidak ada di kalender", () => {
    // "2026-02-31" lolos regex tetapi tidak ada; Date akan menggesernya
    // diam-diam menjadi 3 Maret, dan pergeseran senyap adalah keadaan
    // tidak pasti yang meloloskan diri.
    expect(normalizeHistoryParams({ dari: "2026-02-31" }).dari).toBeNull();
    expect(normalizeHistoryParams({ sampai: "09-09-2026" }).sampai).toBeNull();
  });

  it("membuang nomor halaman yang bukan bilangan bulat positif", () => {
    expect(normalizeHistoryParams({ hal: "0" }).page).toBe(1);
    expect(normalizeHistoryParams({ hal: "-2" }).page).toBe(1);
    expect(normalizeHistoryParams({ hal: "dua" }).page).toBe(1);
    expect(normalizeHistoryParams({ hal: "1.5" }).page).toBe(1);
  });

  it("membuang nilai ditolak selain 1", () => {
    expect(normalizeHistoryParams({ ditolak: "ya" }).deniedOnly).toBe(false);
    expect(normalizeHistoryParams({ ditolak: "0" }).deniedOnly).toBe(false);
  });

  it("membuang item yang bukan pengenal yang mungkin", () => {
    expect(normalizeHistoryParams({ item: "bukan id!" }).item).toBeNull();
    expect(normalizeHistoryParams({ item: "" }).item).toBeNull();
  });

  it("menukar dari dan sampai yang terbalik, bukan membuangnya", () => {
    // Maksud pemilik tidak ambigu di sini, dan membuang keduanya berarti
    // membuang pekerjaannya. Ini satu-satunya kekecualian aturan buang.
    const params = normalizeHistoryParams({ dari: "2026-09-09", sampai: "2026-09-01" });
    expect(params.dari).toBe("2026-09-01");
    expect(params.sampai).toBe("2026-09-09");
  });

  it("memakai nilai pertama ketika parameter dikirim berulang", () => {
    expect(normalizeHistoryParams({ hal: ["2", "9"] }).page).toBe(2);
  });
});

describe("historyQueryString", () => {
  it("menghilangkan halaman pertama dari untai kanoniknya", () => {
    const params = normalizeHistoryParams({ hal: "1" });
    expect(historyQueryString(params)).toBe("");
  });

  it("menulis parameter dalam urutan tetap", () => {
    const params = normalizeHistoryParams({
      hal: "2",
      ditolak: "1",
      sampai: "2026-09-09",
      dari: "2026-09-01",
      item: "cm1abc",
    });
    expect(historyQueryString(params)).toBe(
      "item=cm1abc&dari=2026-09-01&sampai=2026-09-09&ditolak=1&hal=2",
    );
  });
});

describe("givenQueryString", () => {
  it("menyusun ulang apa yang benar-benar dikirim, dalam urutan yang sama", () => {
    expect(givenQueryString({ hal: "2", item: "cm1abc" })).toBe("item=cm1abc&hal=2");
  });

  it("berbeda dari untai kanonik ketika ada nilai yang tidak sah", () => {
    // Perbedaan inilah yang memicu redirect di halaman.
    const raw = { dari: "2026-02-31" };
    expect(givenQueryString(raw)).not.toBe(historyQueryString(normalizeHistoryParams(raw)));
  });

  it("sama dengan untai kanonik ketika seluruh nilainya sah", () => {
    const raw = { item: "cm1abc", hal: "2" };
    expect(givenQueryString(raw)).toBe(historyQueryString(normalizeHistoryParams(raw)));
  });
});

describe("historyHref", () => {
  it("menyusun alamat halaman riwayat beserta penyaringnya", () => {
    const params = normalizeHistoryParams({ item: "cm1abc", hal: "2" });
    expect(historyHref("grp-1", params)).toBe(
      "/dashboard/groups/grp-1/riwayat?item=cm1abc&hal=2",
    );
  });

  it("tidak menyisakan tanda tanya ketika tidak ada penyaring", () => {
    expect(historyHref("grp-1", normalizeHistoryParams({}))).toBe(
      "/dashboard/groups/grp-1/riwayat",
    );
  });
});

describe("isFiltering", () => {
  // Definisi tunggal "sedang menyaring", dipakai baik oleh halaman
  // server maupun HistoryFilterBar — penyaring keenam kelak hanya
  // menyentuh fungsi ini, bukan dua tempat yang bisa berselisih.
  it("mengembalikan false ketika tidak ada penyaring aktif", () => {
    expect(isFiltering(normalizeHistoryParams({}))).toBe(false);
  });

  it("mengembalikan true ketika hanya item yang aktif", () => {
    expect(isFiltering(normalizeHistoryParams({ item: "cm1abc" }))).toBe(true);
  });

  it("mengembalikan true ketika hanya dari yang aktif", () => {
    expect(isFiltering(normalizeHistoryParams({ dari: "2026-09-01" }))).toBe(true);
  });

  it("mengembalikan true ketika hanya sampai yang aktif", () => {
    expect(isFiltering(normalizeHistoryParams({ sampai: "2026-09-09" }))).toBe(true);
  });

  it("mengembalikan true ketika hanya deniedOnly yang aktif", () => {
    expect(isFiltering(normalizeHistoryParams({ ditolak: "1" }))).toBe(true);
  });

  it("mengabaikan halaman: hal saja tidak dianggap menyaring", () => {
    expect(isFiltering(normalizeHistoryParams({ hal: "2" }))).toBe(false);
  });
});
