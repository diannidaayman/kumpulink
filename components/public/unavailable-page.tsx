/**
 * Halaman terpendek di aplikasi, dan satu-satunya yang tidak boleh tahu
 * apa pun: tanpa nama group, tanpa baris kembali, tanpa tautan ke /g/
 * mana pun, tanpa saran alamat, dan tanpa "mungkin maksud Anda". Semua
 * keramahan semacam itu membocorkan keberadaan group. Kekosongannya
 * adalah fiturnya.
 *
 * Dipakai not-found.tsx untuk NOT_FOUND, REVOKED, dan EXPIRED sekaligus,
 * sehingga ketiganya menghasilkan halaman dan kode status yang identik —
 * kriteria sukses nomor 5, dijaga oleh satu berkas komponen dan bukan
 * oleh dua halaman yang kebetulan ditulis mirip.
 */
export function UnavailablePage() {
  return (
    <div className="py-16">
      <h1 className="text-xl font-medium">Halaman ini tidak tersedia.</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Link mungkin sudah tidak berlaku atau alamatnya keliru.
      </p>
    </div>
  );
}
