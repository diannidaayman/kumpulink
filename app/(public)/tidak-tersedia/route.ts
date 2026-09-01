import { TIDAK_TERSEDIA, responsKeadaan } from "@/lib/public/keadaan";

export const dynamic = "force-dynamic";

/**
 * Sasaran pengalihan dari gerbang item DAN dari halaman group yang
 * ditolak. Keduanya bermuara di sini, sehingga ketiga penolakan —
 * NOT_FOUND, REVOKED, EXPIRED — beserta slug yang tidak pernah ada
 * menghasilkan halaman DAN kode status yang identik karena KONSTRUKSI,
 * bukan karena dua berkas yang kebetulan ditulis mirip. Itu kriteria
 * sukses nomor 5.
 *
 * Route handler, bukan page.tsx: page.tsx yang memanggil notFound()
 * mengirim DOM kosong tanpa JavaScript — lihat alasan lengkapnya di
 * lib/public/keadaan.ts.
 */
export function GET(): Response {
  return responsKeadaan(TIDAK_TERSEDIA, 404);
}
