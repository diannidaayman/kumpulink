import { describe, expect, it } from "vitest";
import { TIME_ZONE_LABEL, formatDateWIT } from "@/lib/time/format";

describe("formatDateWIT", () => {
  // Perilaku yang benar-benar penting, dan satu-satunya yang tidak
  // bergantung versi ICU: instan UTC diterjemahkan ke Asia/Jayapura
  // (UTC+9), bukan ke zona waktu mesin yang membacanya.
  it("memakai Asia/Jayapura, bukan zona waktu mesin", () => {
    const beforeMidnightUtc = new Date("2026-08-19T16:00:00Z");
    expect(formatDateWIT(beforeMidnightUtc)).toContain("20");
    expect(formatDateWIT(beforeMidnightUtc)).not.toContain("19");
  });

  it("selalu menyertakan label zona waktu", () => {
    expect(formatDateWIT(new Date("2026-08-19T05:00:00Z"))).toContain(TIME_ZONE_LABEL);
  });

  it("menyertakan tahun", () => {
    expect(formatDateWIT(new Date("2026-08-19T05:00:00Z"))).toContain("2026");
  });

  it("berakhir dengan labelnya, bukan menyisipkannya di tengah", () => {
    expect(formatDateWIT(new Date("2026-08-19T05:00:00Z")).endsWith(TIME_ZONE_LABEL)).toBe(true);
  });
});
