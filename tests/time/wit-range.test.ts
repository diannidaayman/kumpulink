import { describe, expect, it } from "vitest";
import { endOfDayWIT, startOfDayWIT } from "@/lib/time/expiry";

describe("startOfDayWIT", () => {
  // 00:00 di UTC+9 adalah 15:00 UTC pada HARI SEBELUMNYA. Angka inilah
  // yang membedakan penyaring yang benar dari penyaring yang membuang
  // sembilan jam pertama setiap hari.
  it("mengubah tanggal menjadi detik pertama hari itu di Jayapura", () => {
    expect(startOfDayWIT("2026-09-09").toISOString()).toBe("2026-09-08T15:00:00.000Z");
  });

  it("menolak tanggal yang tidak ada di kalender", () => {
    expect(() => startOfDayWIT("2026-02-31")).toThrow();
    expect(() => startOfDayWIT("09-09-2026")).toThrow();
  });
});

describe("rentang inklusif satu hari", () => {
  const from = startOfDayWIT("2026-09-09");
  const to = endOfDayWIT("2026-09-09");

  const inRange = (iso: string) => {
    const at = new Date(iso);
    return at.getTime() >= from.getTime() && at.getTime() <= to.getTime();
  };

  // Inti jebakan D2: batas tengah malam UTC akan membuang baris ini.
  it("memuat peristiwa pukul 02.00 WIT pada tanggal itu", () => {
    // 02:00 WIT tanggal 9 = 17:00 UTC tanggal 8.
    expect(inRange("2026-09-08T17:00:00Z")).toBe(true);
  });

  it("memuat peristiwa pukul 23.30 WIT pada tanggal itu", () => {
    // 23:30 WIT tanggal 9 = 14:30 UTC tanggal 9.
    expect(inRange("2026-09-09T14:30:00Z")).toBe(true);
  });

  it("tidak memuat peristiwa pukul 23.00 WIT pada tanggal sebelumnya", () => {
    // 23:00 WIT tanggal 8 = 14:00 UTC tanggal 8.
    expect(inRange("2026-09-08T14:00:00Z")).toBe(false);
  });

  it("tidak memuat peristiwa pukul 00.30 WIT pada tanggal berikutnya", () => {
    // 00:30 WIT tanggal 10 = 15:30 UTC tanggal 9.
    expect(inRange("2026-09-09T15:30:00Z")).toBe(false);
  });

  it("memilih satu tanggal yang sama di kedua ujung menghasilkan satu hari penuh", () => {
    expect(to.getTime() - from.getTime()).toBe(24 * 60 * 60 * 1000 - 1);
  });
});
