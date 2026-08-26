import "server-only";

import { del, list, put } from "@vercel/blob";

/**
 * SATU-SATUNYA berkas di repositori ini yang mengimpor SDK Vercel Blob.
 * Ditegakkan oleh tests/storage/blob-import-boundary.test.ts, bukan oleh
 * disiplin — batas yang hanya dijaga kebiasaan akan bocor pada unit
 * keempat atau kelima.
 *
 * Sifat privat ditentukan di tingkat store, tetapi `access` tetap wajib
 * dikirim di setiap panggilan: ia membuat konteks keamanan terbaca oleh
 * siapa pun yang membaca baris ini.
 */

/** Mengembalikan pathname kanonis dari Blob, yang menjadi `Item.fileKey`. */
export async function putFile(
  path: string,
  body: Uint8Array,
  contentType: string,
): Promise<string> {
  const result = await put(path, Buffer.from(body), {
    access: "private",
    contentType,
    // Pathname-nya SUDAH acak dari lib/storage/blob-path.ts. Membiarkan
    // SDK menambah acak lagi hanya membuat kunci yang disimpan di basis
    // data berbeda dari kunci yang kita susun.
    addRandomSuffix: false,
  });
  return result.pathname;
}

/**
 * `contentType` dikirim EKSPLISIT dari mime terdeteksi. Bila dibiarkan,
 * SDK menebaknya dari ekstensi pathname — dan menebak dari ekstensi
 * adalah persis yang dilarang code-standards.md.
 */

export async function deleteFile(pathname: string): Promise<void> {
  await del(pathname);
}

/**
 * Menyapu seluruh berkas di bawah satu awalan. Dipakai saat group
 * dihapus, dan sekaligus membersihkan berkas yatim yang tertinggal dari
 * kegagalan sebelumnya — kemampuan yang hanya ada karena pathname-nya
 * berawalan groupId.
 *
 * Paginasi ditulis meski satu group tidak akan pernah berisi seribu
 * berkas: lingkaran yang berhenti di halaman pertama adalah kegagalan
 * yang tidak pernah terlihat, hanya berkas yang diam-diam tertinggal.
 */
export async function deleteFilesByPrefix(prefix: string): Promise<void> {
  let cursor: string | undefined;

  do {
    const page = await list({ prefix, cursor });
    if (page.blobs.length > 0) {
      await del(page.blobs.map((blob) => blob.pathname));
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor !== undefined);
}
