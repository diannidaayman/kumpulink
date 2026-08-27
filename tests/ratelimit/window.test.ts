import { describe, expect, it } from "vitest";

import {
  MAX_FAILURES,
  WINDOW_MS,
  isOverLimit,
  resolveWindowStart,
} from "@/lib/ratelimit/window";

describe("jendela rate limit", () => {
  it("membulatkan ke bawah ke kelipatan sepuluh menit", () => {
    const now = new Date("2026-08-27T10:07:31.500Z");
    expect(resolveWindowStart(now).toISOString()).toBe("2026-08-27T10:00:00.000Z");
  });

  it("menempatkan waktu tepat di batas jendela pada jendela yang baru", () => {
    const now = new Date("2026-08-27T10:10:00.000Z");
    expect(resolveWindowStart(now).toISOString()).toBe("2026-08-27T10:10:00.000Z");
  });

  it("menempatkan satu milidetik sebelum batas pada jendela sebelumnya", () => {
    const now = new Date("2026-08-27T10:09:59.999Z");
    expect(resolveWindowStart(now).toISOString()).toBe("2026-08-27T10:00:00.000Z");
  });

  it("memakai jendela sepuluh menit", () => {
    expect(WINDOW_MS).toBe(600_000);
  });

  it("meloloskan percobaan gagal ke-20 dan menahan yang ke-21", () => {
    expect(isOverLimit(MAX_FAILURES - 1)).toBe(false);
    expect(isOverLimit(MAX_FAILURES)).toBe(true);
    expect(isOverLimit(MAX_FAILURES + 1)).toBe(true);
  });
});
