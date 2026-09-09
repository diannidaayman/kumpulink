import { describe, expect, it } from "vitest";
import { TIME_ZONE_LABEL, formatDateTimeWIT } from "@/lib/time/format";

// Assertion sengaja TIDAK menuntut untai persis. Pemisah jam yang dipakai
// Intl untuk locale id-ID berbeda antar versi ICU, dan pengujian yang
// mematoknya akan merah di mesin lain tanpa satu pun cacat nyata.
describe("formatDateTimeWIT", () => {
  it("memakai Asia/Jayapura, bukan zona waktu mesin", () => {
    // 16:00 UTC tanggal 8 = 01:00 WIT tanggal 9.
    const at = new Date("2026-09-08T16:00:00Z");
    expect(formatDateTimeWIT(at)).toContain("9 Sep");
    expect(formatDateTimeWIT(at)).not.toContain("8 Sep");
  });

  it("menyertakan jam dan menit, tidak hanya tanggal", () => {
    // 05:05 UTC = 14:05 WIT.
    const formatted = formatDateTimeWIT(new Date("2026-09-09T05:05:00Z"));
    expect(formatted).toMatch(/14.05/);
  });

  it("selalu berakhir dengan label zona waktu", () => {
    const formatted = formatDateTimeWIT(new Date("2026-09-09T05:05:00Z"));
    expect(formatted.endsWith(TIME_ZONE_LABEL)).toBe(true);
  });

  it("menyertakan tahun", () => {
    expect(formatDateTimeWIT(new Date("2026-09-09T05:05:00Z"))).toContain("2026");
  });
});
