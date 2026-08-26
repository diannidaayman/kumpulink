import type {
  AccessMode,
  DenyReason,
  RequestStatus,
  Role,
  Visibility,
} from "@prisma/client";

/**
 * Himpunan bagian dari `DenyReason` yang benar-benar dapat diputuskan
 * evaluator izin.
 *
 * `FILE_MISSING` dan `RATE_LIMITED` sengaja berada di luar. Keduanya
 * keputusan pemanggil — yang pertama baru diketahui saat berkas ternyata
 * tidak ada di Blob, yang kedua diputuskan sebelum evaluator dipanggil
 * sama sekali. Tipe yang jujur mencegah keduanya tertukar dengan
 * keputusan izin.
 *
 * Dipersempit dengan `Extract<>` dan bukan ditulis ulang sebagai union
 * literal, supaya nilai yang dihapus dari skema menghasilkan galat tipe
 * dan bukan tipe yang diam-diam berbeda dari enum database.
 */
export type AccessDenyReason = Extract<
  DenyReason,
  | "NOT_FOUND"
  | "REVOKED"
  | "EXPIRED"
  | "PRIVATE"
  | "ITEM_INACTIVE"
  | "REQUEST_REJECTED"
  | "REQUEST_REVOKED"
  | "APPROVAL_EXPIRED"
>;

/**
 * Hasil evaluasi izin. Union eksplisit, bukan boolean: alasan penolakan
 * diperlukan untuk `AccessLog`, dan keadaan `NEEDS_*` menentukan halaman
 * apa yang dirender.
 *
 * `NEEDS_REQUEST` dan `PENDING_APPROVAL` didefinisikan sekarang tetapi
 * belum pernah dihasilkan. Keduanya lahir di Unit 7. Bentuknya ditulis
 * lebih dulu supaya pemanggil yang dibangun sesudah ini sudah menangani
 * keduanya sejak awal.
 */
export type AccessDecision =
  | { kind: "GRANTED"; ownerPreview: boolean }
  | { kind: "NEEDS_LOGIN" }
  | { kind: "NEEDS_REQUEST" }
  | { kind: "PENDING_APPROVAL" }
  | { kind: "DENIED"; reason: AccessDenyReason };

/**
 * Bentuk struktural minimal, bukan model Prisma. Hanya kolom yang ikut
 * menentukan keputusan yang masuk — sehingga matriks pengujian dapat
 * ditulis tanpa merakit model lengkap berisi belasan kolom yang tidak
 * berpengaruh.
 */
export type AccessGroup = {
  id: string;
  shareEnabled: boolean;
  expiresAt: Date | null;
  visibility: Visibility;
};

export type AccessItem = {
  id: string;
  groupId: string;
  isActive: boolean;
  accessMode: AccessMode;
};

/** `null` berarti pengunjung belum masuk. */
export type AccessSession = { userId: string; role: Role } | null;

/**
 * Catatan izin pemohon untuk satu item. Diambil oleh pemanggil dan
 * diberikan sebagai argumen; evaluator tidak boleh mengambilnya sendiri,
 * karena itu menghancurkan kemurniannya dan membuat matriksnya
 * memerlukan database.
 */
export type AccessRequestRecord = {
  status: RequestStatus;
  expiresAt: Date | null;
} | null;
