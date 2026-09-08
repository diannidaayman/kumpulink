import { describe, expect, it } from "vitest";
import { resolvePreviewReason } from "@/lib/groups/preview-reason";

const NOW = new Date("2026-09-08T00:00:00Z");

describe("resolvePreviewReason", () => {
  it("menyebut REVOKED ketika saklar berbagi mati", () => {
    expect(resolvePreviewReason({ shareEnabled: false, expiresAt: null }, NOW)).toBe("REVOKED");
  });

  it("menyebut EXPIRED ketika tanggalnya sudah lewat", () => {
    expect(
      resolvePreviewReason(
        { shareEnabled: true, expiresAt: new Date("2026-09-07T00:00:00Z") },
        NOW,
      ),
    ).toBe("EXPIRED");
  });

  // Urutan yang SAMA dengan resolveGroupStatus: ketika saklarnya mati,
  // link-nya mati apa pun tanggalnya, dan keadaan yang sedang dipilih
  // pemilik lebih berguna dibaca daripada keadaan yang sudah tidak
  // berpengaruh.
  it("mendahulukan REVOKED ketika saklar mati DAN sudah kedaluwarsa", () => {
    expect(
      resolvePreviewReason(
        { shareEnabled: false, expiresAt: new Date("2026-09-07T00:00:00Z") },
        NOW,
      ),
    ).toBe("REVOKED");
  });

  it("mengembalikan null untuk group yang sehat", () => {
    expect(resolvePreviewReason({ shareEnabled: true, expiresAt: null }, NOW)).toBe(null);
    expect(
      resolvePreviewReason(
        { shareEnabled: true, expiresAt: new Date("2026-09-09T00:00:00Z") },
        NOW,
      ),
    ).toBe(null);
  });

  // Ambangnya `<=`, sama persis dengan isExpired() di evaluate-access.ts
  // dan resolveGroupStatus() di status.ts. Tiga tempat, satu ambang.
  it("menganggap tepat pada detiknya sudah kedaluwarsa", () => {
    expect(resolvePreviewReason({ shareEnabled: true, expiresAt: NOW }, NOW)).toBe("EXPIRED");
  });
});
