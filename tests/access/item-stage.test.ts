import { describe, expect, it } from "vitest";
import { evaluateItemAccess } from "@/lib/access/evaluate-access";
import type { AccessMode } from "@prisma/client";
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
const belumMasuk: AccessSession = null;

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

describe("gerbang item — tingkat akses", () => {
  it("meneruskan pengunjung anonim ke item terbuka", () => {
    expect(
      evaluateItemAccess(groupAktif, itemTerbuka, belumMasuk, TANPA_IZIN, NOW),
    ).toEqual({ kind: "GRANTED", ownerPreview: false });
  });

  // Bersebelahan dengan pengujian pengunjung anonim di atas: cabang OPEN
  // mengabaikan sesi sepenuhnya, jadi pengunjung anonim maupun yang sudah
  // masuk harus mendapat hasil yang sama. Kedua pengujian inilah yang
  // menegaskan itu.
  it("meneruskan pengunjung yang sudah masuk ke item terbuka", () => {
    expect(
      evaluateItemAccess(groupAktif, itemTerbuka, pengunjung, TANPA_IZIN, NOW),
    ).toEqual({ kind: "GRANTED", ownerPreview: false });
  });

  it("meminta pengunjung masuk lebih dulu pada item yang aksesnya dicatat", () => {
    expect(
      evaluateItemAccess(
        groupAktif,
        { ...itemTerbuka, accessMode: "IDENTITY" },
        belumMasuk,
        TANPA_IZIN,
        NOW,
      ),
    ).toEqual({ kind: "NEEDS_LOGIN" });
  });

  it("meneruskan pengunjung yang sudah masuk ke item yang aksesnya dicatat", () => {
    expect(
      evaluateItemAccess(
        groupAktif,
        { ...itemTerbuka, accessMode: "IDENTITY" },
        pengunjung,
        TANPA_IZIN,
        NOW,
      ),
    ).toEqual({ kind: "GRANTED", ownerPreview: false });
  });

  it("meminta pengunjung masuk lebih dulu pada item yang butuh persetujuan", () => {
    expect(
      evaluateItemAccess(
        groupAktif,
        { ...itemTerbuka, accessMode: "APPROVAL" },
        belumMasuk,
        TANPA_IZIN,
        NOW,
      ),
    ).toEqual({ kind: "NEEDS_LOGIN" });
  });

  // Kriteria sukses nomor 8: item APPROVAL tanpa catatan izin berstatus
  // APPROVED selalu ditolak, TERMASUK ketika fitur persetujuannya belum
  // selesai dibangun. Unit 7 mengubah baris ini menjadi NEEDS_REQUEST;
  // sampai saat itu yang benar adalah penolakan. Lihat U4-1 di
  // progress-tracker.md.
  it("menolak pengunjung yang sudah masuk pada item yang butuh persetujuan selama alur izin belum ada", () => {
    expect(
      evaluateItemAccess(
        groupAktif,
        { ...itemTerbuka, accessMode: "APPROVAL" },
        pengunjung,
        TANPA_IZIN,
        NOW,
      ),
    ).toEqual({ kind: "DENIED", reason: "NOT_FOUND" });
  });

  // Pemeranan tipenya disengaja. Yang sedang diuji adalah data yang lebih
  // tua atau lebih baru daripada kode — baris database yang ditulis versi
  // berikutnya lalu dibaca versi sekarang. TypeScript tidak melindungi
  // dari itu; cabang `default` yang melindunginya, dan pengujian inilah
  // buktinya. Menambah mode baru tidak boleh diam-diam membuka akses.
  it("menolak nilai tingkat akses yang tidak dikenalinya", () => {
    expect(
      evaluateItemAccess(
        groupAktif,
        { ...itemTerbuka, accessMode: "SOMETHING_ELSE" as AccessMode },
        pengunjung,
        TANPA_IZIN,
        NOW,
      ),
    ).toEqual({ kind: "DENIED", reason: "NOT_FOUND" });
  });

  it("menolak nilai tingkat akses yang tidak dikenali bahkan sebelum meminta pengunjung masuk", () => {
    expect(
      evaluateItemAccess(
        groupAktif,
        { ...itemTerbuka, accessMode: "SOMETHING_ELSE" as AccessMode },
        belumMasuk,
        TANPA_IZIN,
        NOW,
      ),
    ).toEqual({ kind: "DENIED", reason: "NOT_FOUND" });
  });

  // Cabang OWNER berdiri SEBELUM switch accessMode, jadi pemilik lolos
  // bahkan untuk nilai asing ini. Ini bukan kebocoran: nilai asing nol
  // pengaruh bagi pemilik, yang toh lolos untuk setiap nilai accessMode
  // yang dikenal juga. Pengujian ini ada supaya perilaku itu terbaca
  // sebagai keputusan yang disengaja, bukan sebagai lubang yang perlu
  // ditambal oleh pembaca berikutnya yang membaca baris merah "nilai
  // enum tak dikenal selalu menolak".
  it("membolehkan pemilik meski accessMode item tidak dikenal, karena cabang pemilik mendahului aturan accessMode", () => {
    expect(
      evaluateItemAccess(
        groupAktif,
        { ...itemTerbuka, accessMode: "SOMETHING_ELSE" as AccessMode },
        pemilik,
        TANPA_IZIN,
        NOW,
      ),
    ).toEqual({ kind: "GRANTED", ownerPreview: false });
  });
});
