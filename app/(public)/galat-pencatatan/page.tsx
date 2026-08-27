export const dynamic = "force-dynamic";

/**
 * Sasaran 303 dari gerbang item ketika penulisan AccessLog gagal.
 * Badannya melempar supaya Next merender app/(public)/error.tsx dengan
 * status 500 — sebuah halaman tidak dapat menetapkan kode statusnya
 * sendiri, dan 200 untuk kegagalan adalah kebohongan yang terbaca mesin.
 */
export default function GalatPencatatanPage() {
  throw new Error("GAGAL_MENCATAT_AKSES");
}
