import { describe, expect, it } from "vitest";
import {
  endOfDayWIT,
  fromCalendarDate,
  isCalendarDate,
  toCalendarDate,
  witDateParts,
} from "@/lib/time/expiry";

describe("isCalendarDate", () => {
  it("menerima tanggal yang benar-benar ada", () => {
    expect(isCalendarDate("2026-09-30")).toBe(true);
    expect(isCalendarDate("2024-02-29")).toBe(true);
  });

  it("menolak tanggal yang tidak ada di kalender", () => {
    expect(isCalendarDate("2026-02-31")).toBe(false);
    expect(isCalendarDate("2026-13-01")).toBe(false);
    expect(isCalendarDate("2025-02-29")).toBe(false);
  });

  it("menolak bentuk yang bukan YYYY-MM-DD", () => {
    expect(isCalendarDate("30-09-2026")).toBe(false);
    expect(isCalendarDate("2026-9-30")).toBe(false);
    expect(isCalendarDate("")).toBe(false);
  });
});

describe("endOfDayWIT", () => {
  // 23:59:59.999 di UTC+9 adalah 14:59:59.999 UTC pada tanggal yang sama.
  it("mengubah tanggal menjadi detik terakhir hari itu di Jayapura", () => {
    expect(endOfDayWIT("2026-09-30").toISOString()).toBe("2026-09-30T14:59:59.999Z");
  });

  it("membuat link hidup sepanjang tanggal yang dipilih", () => {
    const expiresAt = endOfDayWIT("2026-09-30");
    // 23:59 WIT tanggal 30 = 14:59 UTC. Masih hidup.
    expect(expiresAt.getTime() > new Date("2026-09-30T14:58:00Z").getTime()).toBe(true);
    // 00:01 WIT tanggal 1 Oktober = 15:01 UTC tanggal 30. Sudah mati.
    expect(expiresAt.getTime() <= new Date("2026-09-30T15:01:00Z").getTime()).toBe(true);
  });
});

describe("witDateParts", () => {
  it("membaca tanggal WIT dari sebuah instan", () => {
    expect(witDateParts(new Date("2026-09-30T14:59:59.999Z"))).toBe("2026-09-30");
  });

  // Sore hari UTC sudah menjadi hari berikutnya di Jayapura. Kalender yang
  // salah satu hari membuat pemilik menyetel mundur tanpa sadar.
  it("mengikuti hari Jayapura, bukan hari UTC", () => {
    expect(witDateParts(new Date("2026-09-30T16:00:00Z"))).toBe("2026-10-01");
  });

  it("kembali ke tanggal semula saat dibolak-balik", () => {
    expect(witDateParts(endOfDayWIT("2027-01-01"))).toBe("2027-01-01");
    expect(witDateParts(endOfDayWIT("2026-12-31"))).toBe("2026-12-31");
  });
});

describe("toCalendarDate dan fromCalendarDate", () => {
  it("kembali ke string semula saat dibolak-balik", () => {
    expect(fromCalendarDate(toCalendarDate("2026-09-30"))).toBe("2026-09-30");
    expect(fromCalendarDate(toCalendarDate("2026-01-05"))).toBe("2026-01-05");
  });

  it("menghasilkan tanggal lokal yang cocok dengan yang diminta", () => {
    const date = toCalendarDate("2026-09-30");
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(8);
    expect(date.getDate()).toBe(30);
  });

  it("memberi nol di depan pada bulan dan tanggal satu digit", () => {
    expect(fromCalendarDate(new Date(2026, 0, 5, 12, 0, 0))).toBe("2026-01-05");
  });
});
