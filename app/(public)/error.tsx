"use client";

import { GALAT_PENCATATAN } from "@/lib/public/keadaan";

/**
 * Jaring pengaman untuk lemparan yang TIDAK diantisipasi di bawah
 * app/(public)/. Jalur galat pencatatan yang diantisipasi tidak lagi
 * sampai ke sini: gerbang item dan halaman group sama-sama menangkap
 * kegagalan penulisan AccessLog lalu mengalihkan ke route handler
 * /galat-pencatatan, karena batas galat Next dirender di klien dan
 * karenanya kosong tanpa JavaScript.
 *
 * Client component karena Next.js menuntutnya untuk error boundary.
 * Kalimatnya tetap datang dari sumber yang sama supaya keduanya tidak
 * pernah menyimpang.
 */
export default function PublicError() {
  return (
    <div className="py-16">
      <h1 className="text-xl font-medium">{GALAT_PENCATATAN.judul}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{GALAT_PENCATATAN.penjelasan}</p>
    </div>
  );
}
