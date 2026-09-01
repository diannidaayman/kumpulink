import { GALAT_PENCATATAN, responsKeadaan } from "@/lib/public/keadaan";

export const dynamic = "force-dynamic";

/**
 * Sasaran pengalihan ketika penulisan AccessLog gagal — U4-8.
 *
 * Memakai kembali halaman tidak tersedia ditolak karena ia berbohong:
 * pengunjung akan menyimpulkan linknya mati dan berhenti mencoba, padahal
 * gerbangnya baru saja meloloskannya. Justru pengunjung inilah yang paling
 * dirugikan oleh DOM kosong — ia tidak tahu keadaannya sementara dan
 * layak dicoba lagi.
 *
 * 500, bukan 200: sebuah halaman tidak dapat menetapkan kode statusnya
 * sendiri, dan 200 untuk kegagalan adalah kebohongan yang terbaca mesin.
 */
export function GET(): Response {
  return responsKeadaan(GALAT_PENCATATAN, 500);
}
