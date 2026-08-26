import { describe, expect, it } from "vitest";
import { evaluateItemAccess } from "@/lib/access/evaluate-access";
import type {
  AccessGroup,
  AccessItem,
  AccessSession,
} from "@/lib/types/access";

const NOW = new Date("2026-08-27T10:00:00Z");

/** Group yang sudah lolos tahap satu untuk siapa pun. */
const groupAktif: AccessGroup = {
  id: "g1",
  shareEnabled: true,
  expiresAt: null,
  visibility: "PUBLIC",
};

const itemTerbuka: AccessItem = {
  id: "i1",
  groupId: "g1",
  isActive: true,
  accessMode: "OPEN",
};

const pemilik: AccessSession = { userId: "u-owner", role: "OWNER" };
const pengunjung: AccessSession = { userId: "u-viewer", role: "VIEWER" };

const TANPA_IZIN = null;

describe("gerbang item — keberadaan dan keaktifan", () => {
  it("menolak item yang tidak ada", () => {
    expect(
      evaluateItemAccess(groupAktif, null, pengunjung, TANPA_IZIN, NOW),
    ).toEqual({ kind: "DENIED", reason: "NOT_FOUND" });
  });

  // Tanpa pemeriksaan ini, menempelkan id item milik group lain ke URL
  // group yang terbuka akan menyajikan berkas yang bukan miliknya.
  it("menolak item milik group lain yang id-nya ditempelkan ke URL group ini", () => {
    expect(
      evaluateItemAccess(
        groupAktif,
        { ...itemTerbuka, groupId: "g-lain" },
        pengunjung,
        TANPA_IZIN,
        NOW,
      ),
    ).toEqual({ kind: "DENIED", reason: "NOT_FOUND" });
  });

  it("menolak item yang dinonaktifkan pemilik", () => {
    expect(
      evaluateItemAccess(
        groupAktif,
        { ...itemTerbuka, isActive: false },
        pengunjung,
        TANPA_IZIN,
        NOW,
      ),
    ).toEqual({ kind: "DENIED", reason: "ITEM_INACTIVE" });
  });
});

describe("gerbang item — pemilik", () => {
  it("membolehkan pemilik membuka item yang butuh persetujuan tanpa mengajukan izin kepada dirinya sendiri", () => {
    expect(
      evaluateItemAccess(
        groupAktif,
        { ...itemTerbuka, accessMode: "APPROVAL" },
        pemilik,
        TANPA_IZIN,
        NOW,
      ),
    ).toEqual({ kind: "GRANTED", ownerPreview: false });
  });

  it("membolehkan pemilik membuka item yang butuh identitas", () => {
    expect(
      evaluateItemAccess(
        groupAktif,
        { ...itemTerbuka, accessMode: "IDENTITY" },
        pemilik,
        TANPA_IZIN,
        NOW,
      ),
    ).toEqual({ kind: "GRANTED", ownerPreview: false });
  });

  // Cabang pemilik berdiri SESUDAH pemeriksaan keaktifan. Kepemilikan
  // hanya melewati aturan accessMode, bukan membatalkan penonaktifan yang
  // pemilik lakukan sendiri — untuk membukanya ia cukup mengaktifkannya
  // lagi di CMS.
  it("tetap menolak item nonaktif meski yang membuka adalah pemiliknya", () => {
    expect(
      evaluateItemAccess(
        groupAktif,
        { ...itemTerbuka, isActive: false },
        pemilik,
        TANPA_IZIN,
        NOW,
      ),
    ).toEqual({ kind: "DENIED", reason: "ITEM_INACTIVE" });
  });

  it("meneruskan spanduk pratinjau tahap satu kepada pemilik yang membuka item di group yang dicabut", () => {
    expect(
      evaluateItemAccess(
        { ...groupAktif, shareEnabled: false },
        itemTerbuka,
        pemilik,
        TANPA_IZIN,
        NOW,
      ),
    ).toEqual({ kind: "GRANTED", ownerPreview: true });
  });
});
