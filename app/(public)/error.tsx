"use client";

/**
 * Halaman galat pencatatan — keputusan U4-8.
 *
 * Aplikasi ini membatalkan penerusan ketika penulisan AccessLog gagal,
 * dan pengunjung berhak tahu bahwa keadaannya sementara. Memakai kembali
 * halaman tidak tersedia ditolak karena ia berbohong: pengunjung akan
 * menyimpulkan linknya mati dan berhenti mencoba, padahal gerbangnya
 * baru saja meloloskannya.
 *
 * Client component karena Next.js menuntutnya untuk error boundary. Ia
 * memberi HTTP 500 dengan sendirinya.
 */
export default function PublicError() {
  return (
    <div className="py-16">
      <h1 className="text-xl font-medium">Akses Anda tidak dapat dicatat.</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Aplikasi ini tidak meneruskan apa pun yang tidak dapat ia catat, jadi
        halaman ini tidak dibuka. Coba lagi sebentar lagi.
      </p>
    </div>
  );
}
