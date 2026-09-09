import type { DenyReason } from "@prisma/client";

export type DenyReasonText = { label: string; description: string };

/**
 * Label pendek tampil sebagai baris kedua di sel Hasil; penjelasannya
 * tampil di atribut title. Keputusan U6-7.
 *
 * Petanya `Record<DenyReason, ...>` dan BUKAN objek biasa: penambahan
 * anggota enum baru harus menggagalkan kompilasi, bukan menghasilkan
 * sel kosong diam-diam. Disiplin yang sama dengan penjaga `never` di
 * evaluate-access.ts.
 */
export const DENY_REASON_TEXT: Record<DenyReason, DenyReasonText> = {
  // Dihasilkan ENAM cabang berbeda: group tidak ada, item tidak ada, item
  // milik group lain, nilai enum tak dikenali, item APPROVAL selama Unit 7
  // belum ada, dan item EXTERNAL tanpa targetUrl. Labelnya sengaja luas —
  // menyempitkannya membuat riwayat berbohong. Preseden U4-12.
  NOT_FOUND: {
    label: "Tidak ditemukan",
    description:
      "Group atau item yang diminta tidak ada, sudah dihapus, atau tidak menunjuk tujuan mana pun.",
  },
  REVOKED: {
    label: "Link dicabut",
    description: "Saklar berbagi group ini sedang mati saat percobaan terjadi.",
  },
  EXPIRED: {
    label: "Group kedaluwarsa",
    description: "Tanggal kedaluwarsa group sudah lewat saat percobaan terjadi.",
  },
  PRIVATE: {
    label: "Group privat",
    description: "Group disetel privat, sehingga hanya pemilik yang dapat membukanya.",
  },
  ITEM_INACTIVE: {
    label: "Item nonaktif",
    description: "Item ini sedang dinonaktifkan di dashboard saat percobaan terjadi.",
  },
  FILE_MISSING: {
    label: "Berkas hilang",
    description:
      "Berkas item ini tidak ditemukan di penyimpanan, dan itemnya sudah ditandai rusak.",
  },
  RATE_LIMITED: {
    label: "Terlalu banyak percobaan",
    description:
      "Alamat IP ini melewati dua puluh percobaan gagal dalam sepuluh menit, sehingga dihentikan sebelum izinnya dievaluasi. Baris seperti ini tidak punya nama dan email karena sesinya memang belum dibaca.",
  },
  REQUEST_REJECTED: {
    label: "Permintaan ditolak",
    description: "Permintaan izin pemohon ini pernah ditolak dan tidak dapat diajukan ulang.",
  },
  REQUEST_REVOKED: {
    label: "Izin dicabut",
    description: "Izin yang pernah diberikan kepada pemohon ini sudah dicabut.",
  },
  APPROVAL_EXPIRED: {
    label: "Izin kedaluwarsa",
    description: "Izin pemohon ini sudah melewati masa berlakunya.",
  },
};

export const UNKNOWN_DENY_REASON: DenyReasonText = {
  label: "Alasan tidak diketahui",
  description:
    "Baris ini ditolak tanpa alasan yang dikenali. Keadaan yang tidak pasti dinyatakan apa adanya, bukan disamarkan menjadi sel kosong.",
};

/**
 * `?? UNKNOWN_DENY_REASON` bukan pengaman berlebihan: baris AccessLog
 * dapat lebih tua atau lebih baru daripada kode yang membacanya, dan
 * indeks Record yang meleset menghasilkan undefined saat runtime meski
 * tipenya berkata sebaliknya.
 */
export function denyReasonText(reason: DenyReason | null): DenyReasonText {
  if (reason === null) return UNKNOWN_DENY_REASON;
  return DENY_REASON_TEXT[reason] ?? UNKNOWN_DENY_REASON;
}
