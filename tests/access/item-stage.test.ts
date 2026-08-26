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

  // Bagi pengunjung, jalur ini tidak menggigit apa pun secara terpisah:
  // pengunjung sudah berakhir di penolakan menyeluruh yang sama di akhir
  // fungsi terlepas dari penjaga lintas-group ada atau tidak. Pengujian
  // ini dipertahankan sebagai dokumentasi perilaku, bukan sebagai
  // penjaga — penjaga yang sesungguhnya ada pada varian pemilik di
  // bawah.
  it("menolak pengunjung yang menempelkan id item milik group lain ke URL group ini", () => {
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

  // Pemilik adalah satu-satunya jalur yang dapat MELOLOSKAN, sehingga
  // hanya varian ini yang benar-benar menggigit penjaga
  // `item.groupId !== group.id`: tanpanya, pemilik group ini akan lolos
  // membuka item milik group lain lewat cabang OWNER di bawah.
  it("menolak pemilik yang menempelkan id item milik group lain ke URL group ini", () => {
    expect(
      evaluateItemAccess(
        groupAktif,
        { ...itemTerbuka, groupId: "g-lain" },
        pemilik,
        TANPA_IZIN,
        NOW,
      ),
    ).toEqual({ kind: "DENIED", reason: "NOT_FOUND" });
  });

  // Sikap sementara: sampai aturan accessMode lahir di task berikutnya,
  // TIDAK ADA pengunjung yang dapat membuka item apa pun, betapa pun
  // aktif dan sah item serta groupnya. Task berikutnya akan mengubah
  // harapan pengujian ini saat cabang accessMode ditambahkan.
  it("menolak pengunjung membuka item yang aktif dan sah selama aturan accessMode belum ada", () => {
    expect(
      evaluateItemAccess(groupAktif, itemTerbuka, pengunjung, TANPA_IZIN, NOW),
    ).toEqual({ kind: "DENIED", reason: "NOT_FOUND" });
  });

  // Invarian 6: item tidak pernah lebih permisif daripada group
  // induknya. Group yang linknya dicabut menolak di tahap satu dengan
  // alasan REVOKED; tahap dua harus meneruskan alasan itu apa adanya,
  // bukan menggantinya dengan alasan tahap dua sendiri.
  it("meneruskan alasan REVOKED dari group yang dicabut, bukan alasan tahap item", () => {
    expect(
      evaluateItemAccess(
        { ...groupAktif, shareEnabled: false },
        itemTerbuka,
        pengunjung,
        TANPA_IZIN,
        NOW,
      ),
    ).toEqual({ kind: "DENIED", reason: "REVOKED" });
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
  // `accessMode` belum dibaca sama sekali di task ini, jadi masukan
  // pengujian ini dan pengujian "identitas" di bawah setara byte per
  // byte dan menutup cabang OWNER yang sama. Keduanya baru bercabang
  // ketika aturan accessMode lahir di task berikutnya — jangan hapus
  // salah satunya dengan mengira ia berlebih.
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

  // Lihat komentar di atas pengujian "persetujuan": masukannya masih
  // setara sekarang, baru bercabang saat accessMode dibaca.
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
