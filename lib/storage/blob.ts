import "server-only";

import { del, get, list, put } from "@vercel/blob";

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

export type StoredFile = {
  stream: ReadableStream<Uint8Array>;
  contentType: string | null;
};

/**
 * Ia MENGALIRKAN isi berkas, bukan menyusun URL. Tidak ada URL Blob yang
 * boleh sampai ke peramban dalam bentuk apa pun — invarian 3.
 *
 * Mengembalikan null bila berkasnya tidak ada. Pemanggilnya yang
 * menandai item.isBroken dan mencatat DENIED / FILE_MISSING; modul ini
 * tidak tahu apa-apa tentang item maupun riwayat.
 *
 * Bentuk kembalian `get()` di SDK terpasang BUKAN yang tertulis di
 * architecture.md: tidak ada `statusCode: 404` — "tidak ditemukan"
 * berarti `get()` mengembalikan `null` secara langsung. `contentType`
 * juga bersarang di `blob.contentType`, bukan di tingkat atas. Tipe
 * kembaliannya union kondisional pada `statusCode`: 200 (stream ada,
 * blob.contentType berupa string) atau 304 (stream null, dipicu hanya
 * bila `ifNoneMatch` dikirim — yang tidak pernah kita kirim di sini).
 * Percabangan pada `statusCode !== 200` menjaga tipe tetap valid tanpa
 * mengandalkan kode statusCode yang tidak ada.
 */
export async function getFileStream(pathname: string): Promise<StoredFile | null> {
  const result = await get(pathname, { access: "private" });
  if (result === null || result.statusCode !== 200) return null;
  return { stream: result.stream, contentType: result.blob.contentType };
}

/**
 * Tidak ada catch di sini: `get()` menandai ketiadaan dengan mengembalikan
 * `null`, sehingga galat yang tersisa adalah kegagalan sungguhan, dan
 * menyamakan keduanya akan membuat gangguan sementara menandai item pemilik
 * sebagai rusak secara permanen serta menulis riwayat yang keliru. Pemanggilnya
 * yang menangani kesalahan asli.
 */

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
