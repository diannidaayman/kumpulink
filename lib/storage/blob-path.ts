import { randomBytes } from "node:crypto";
import { extensionFor } from "@/lib/storage/detect-file-type";
import type { AcceptedMimeType } from "@/lib/storage/detect-file-type";

/** Jumlah byte acak untuk entropi yang tidak dapat ditebak (192 bit). */
const RANDOM_BYTES = 24;

/**
 * Membangun awalan direktori untuk semua berkas dalam suatu grup.
 *
 * Format: `groups/{groupId}/`
 *
 * Garis miring di belakang WAJIB ada — tanpanya, awalan `groups/grp_a`
 * juga akan cocok dengan `groups/grp_abc`, dan menghapus grup akan
 * menghapus berkas grup lain. Dengan garis miring, penghapusan grup dapat
 * menyapu semua berkas grup dalam satu operasi.
 *
 * @param groupId - ID grup yang memiliki berkas
 * @returns Awalan direktori untuk penyimpanan blob, dengan garis miring di belakang
 */
export function groupBlobPrefix(groupId: string): string {
  return `groups/${groupId}/`;
}

/**
 * Membangun jalur penyimpanan lengkap untuk berkas yang diunggah.
 *
 * Format: `groups/{groupId}/{24 random bytes base64url}.{ext}`
 *
 * Fungsi ini dibangun di atas `groupBlobPrefix`, sehingga jalur dan
 * awalan penghapusan tidak akan pernah bergeser terpisah.
 *
 * Properti yang penting:
 * - **Tidak dapat ditebak**: segmen acak menggunakan `crypto.randomBytes`,
 *   bukan `Math.random()`, sehingga tidak dapat ditebak.
 * - **Dapat dihapus menurut awalan**: awalan `groups/{groupId}/` dengan
 *   garis miring di belakang memungkinkan penghapusan grup menghapus semua
 *   berkas grup dalam satu operasi.
 *
 * @param groupId - ID grup yang memiliki berkas
 * @param mimeType - Tipe MIME yang sudah divalidasi
 * @returns Jalur lengkap untuk penyimpanan blob
 */
export function buildBlobPath(
  groupId: string,
  mimeType: AcceptedMimeType
): string {
  const randomBuffer = randomBytes(RANDOM_BYTES);
  // Node.js Buffer.toString('base64url') menghasilkan format base64url
  // tanpa padding secara langsung.
  const randomBase64Url = randomBuffer.toString("base64url");
  const ext = extensionFor(mimeType);

  return `${groupBlobPrefix(groupId)}${randomBase64Url}.${ext}`;
}
