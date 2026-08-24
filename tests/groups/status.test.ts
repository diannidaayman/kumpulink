import { describe, expect, it } from "vitest";
import { resolveGroupStatus } from "@/lib/groups/status";

const NOW = new Date("2026-08-21T00:00:00Z");
const base = { shareEnabled: true, expiresAt: null, visibility: "PRIVATE" as const };

describe("resolveGroupStatus", () => {
  it("menandai group yang saklar berbaginya mati sebagai UNSHARED", () => {
    expect(resolveGroupStatus({ ...base, shareEnabled: false }, NOW)).toBe("UNSHARED");
  });

  it("menandai group yang baru dibuat sebagai UNSHARED, bukan EXPIRED", () => {
    // Bawaan Prisma: shareEnabled false, visibility PRIVATE, expiresAt null.
    expect(resolveGroupStatus({ shareEnabled: false, expiresAt: null, visibility: "PRIVATE" }, NOW)).toBe("UNSHARED");
  });

  it("menandai group yang tanggalnya lewat sebagai EXPIRED", () => {
    expect(resolveGroupStatus({ ...base, expiresAt: new Date("2026-08-20T00:00:00Z") }, NOW)).toBe("EXPIRED");
  });

  // Saklar mati menang: link-nya mati apa pun tanggalnya, dan keadaan
  // yang sedang DIPILIH pemilik lebih berguna dibaca daripada keadaan
  // yang sudah tidak berpengaruh.
  it("mendahulukan UNSHARED ketika saklar mati DAN sudah kedaluwarsa", () => {
    expect(resolveGroupStatus(
      { shareEnabled: false, expiresAt: new Date("2026-08-20T00:00:00Z"), visibility: "PUBLIC" },
      NOW,
    )).toBe("UNSHARED");
  });

  it("tidak menandai EXPIRED tepat pada detik tanggalnya belum lewat", () => {
    expect(resolveGroupStatus({ ...base, expiresAt: new Date("2026-08-21T00:00:01Z") }, NOW)).toBe("PRIVATE");
  });

  it.each([
    ["PRIVATE" as const],
    ["REQUIRE_LOGIN" as const],
    ["PUBLIC" as const],
  ])("mengembalikan visibilitas %s untuk group aktif", (visibility) => {
    expect(resolveGroupStatus({ ...base, visibility }, NOW)).toBe(visibility);
  });
});
