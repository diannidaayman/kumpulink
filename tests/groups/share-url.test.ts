import { describe, expect, it } from "vitest";
import { APP_ORIGIN, shareUrl } from "@/lib/groups/share-url";

describe("APP_ORIGIN", () => {
  it("adalah domain produksi tanpa garis miring di ujung", () => {
    expect(APP_ORIGIN).toBe("https://diandiandian.web.id");
  });

  it("memakai https", () => {
    expect(APP_ORIGIN.startsWith("https://")).toBe(true);
  });
});

describe("shareUrl", () => {
  it("menyusun URL absolut ke halaman group", () => {
    expect(shareUrl("rapat-kerja")).toBe("https://diandiandian.web.id/g/rapat-kerja");
  });

  // QR yang sudah dicetak tidak dapat ditarik kembali. Satu garis miring
  // ganda menghasilkan alamat yang tidak pernah sampai ke halaman mana pun.
  it("tidak pernah menghasilkan garis miring ganda", () => {
    expect(shareUrl("rapat-kerja")).not.toContain("//g/");
    expect(shareUrl("a")).not.toMatch(/([^:])\/\//);
  });

  it("dapat diurai sebagai URL yang sah", () => {
    const parsed = new URL(shareUrl("acara-2026"));
    expect(parsed.origin).toBe(APP_ORIGIN);
    expect(parsed.pathname).toBe("/g/acara-2026");
  });
});
