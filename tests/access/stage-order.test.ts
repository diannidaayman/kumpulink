import { describe, expect, it } from "vitest";
import {
  evaluateGroupAccess,
  evaluateItemAccess,
} from "@/lib/access/evaluate-access";
import type {
  AccessDecision,
  AccessGroup,
  AccessItem,
  AccessSession,
} from "@/lib/types/access";
import type { Visibility } from "@prisma/client";

const NOW = new Date("2026-08-27T10:00:00Z");
const KEMARIN = new Date("2026-08-26T10:00:00Z");

const groupAktif: AccessGroup = {
  id: "g1",
  shareEnabled: true,
  expiresAt: null,
  visibility: "PUBLIC",
};

/**
 * Item paling permisif yang mungkin ada: terbuka untuk siapa pun, aktif,
 * dan benar-benar milik group itu. Kalau item semacam ini pun tidak dapat
 * melonggarkan keputusan groupnya, tidak ada item yang bisa.
 */
const itemPalingPermisif: AccessItem = {
  id: "i1",
  groupId: "g1",
  isActive: true,
  accessMode: "OPEN",
};

const pengunjung: AccessSession = { userId: "u-viewer", role: "VIEWER" };
const belumMasuk: AccessSession = null;

type Keadaan = {
  nama: string;
  group: AccessGroup | null;
  session: AccessSession;
  hasil: AccessDecision;
};

const keadaanYangDitolakTahapSatu: Keadaan[] = [
  {
    nama: "group tidak ada",
    group: null,
    session: pengunjung,
    hasil: { kind: "DENIED", reason: "NOT_FOUND" },
  },
  {
    nama: "link group dicabut",
    group: { ...groupAktif, shareEnabled: false },
    session: pengunjung,
    hasil: { kind: "DENIED", reason: "REVOKED" },
  },
  {
    nama: "group kedaluwarsa",
    group: { ...groupAktif, expiresAt: KEMARIN },
    session: pengunjung,
    hasil: { kind: "DENIED", reason: "EXPIRED" },
  },
  {
    nama: "group privat",
    group: { ...groupAktif, visibility: "PRIVATE" },
    session: pengunjung,
    hasil: { kind: "DENIED", reason: "PRIVATE" },
  },
  // Nilai `visibility` yang tidak dikenal mensimulasikan data yang lebih
  // baru daripada kode: baris database yang ditulis oleh versi aplikasi
  // berikutnya (dengan anggota enum baru), lalu dibaca oleh versi yang
  // sedang berjalan sekarang, yang belum tahu apa-apa soal anggota itu.
  // Penjaga keterjangkauan `never` di implementasinya menangkap kasus ini
  // saat kompilasi; pemeranan tipe ini yang menangkapnya saat runtime.
  {
    nama: "visibility group tidak dikenal",
    group: { ...groupAktif, visibility: "SOMETHING_ELSE" as Visibility },
    session: pengunjung,
    hasil: { kind: "DENIED", reason: "NOT_FOUND" },
  },
];

describe("item tidak pernah lebih permisif daripada group induknya", () => {
  it.each(keadaanYangDitolakTahapSatu)(
    "tetap menolak item terbuka ketika $nama",
    ({ group, session, hasil }) => {
      expect(
        evaluateItemAccess(group, itemPalingPermisif, session, null, NOW),
      ).toEqual(hasil);
    },
  );

  it.each(keadaanYangDitolakTahapSatu)(
    "memberi alasan yang sama dengan gerbang groupnya ketika $nama",
    ({ group, session }) => {
      expect(
        evaluateItemAccess(group, itemPalingPermisif, session, null, NOW),
      ).toEqual(evaluateGroupAccess(group, session, NOW));
    },
  );

  // Item terbuka di dalam group yang wajib login tidak membuat group itu
  // terbuka. Yang menang adalah tahap satu.
  it("tetap meminta pengunjung masuk pada item terbuka di group yang wajib login", () => {
    expect(
      evaluateItemAccess(
        { ...groupAktif, visibility: "REQUIRE_LOGIN" },
        itemPalingPermisif,
        belumMasuk,
        null,
        NOW,
      ),
    ).toEqual({ kind: "NEEDS_LOGIN" });
  });
});
