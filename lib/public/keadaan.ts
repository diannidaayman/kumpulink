/**
 * SATU-SATUNYA tempat kalimat permukaan keadaan ditulis, dan satu-satunya
 * tempat dokumen HTML-nya disusun.
 *
 * ALASAN modul ini ada — temuan 28 Agustus 2026, penyebabnya ditemukan
 * 1 September 2026. Next 15.5 / React 19.1 tidak merender UI `notFound()`
 * maupun error boundary ke HTML pada render dinamis: ia mengirim
 * penampung Suspense kosong (`<!--$?-->`) dan menaruh kalimatnya di
 * payload RSC sebagai data untuk klien. Pengunjung tanpa JavaScript
 * karena itu menerima DOM kosong — dan pengunjung yang aksesnya gagal
 * DICATAT tidak diberi tahu bahwa keadaannya sementara, yang justru satu-
 * satunya alasan U4-8 memisahkan halaman galat pencatatan dari halaman
 * tidak tersedia.
 *
 * Route handler mengirim badan responsnya sendiri, sehingga kalimatnya
 * ada di kawat apa pun keadaan JavaScript peramban. Preseden yang sama
 * sudah dipakai 429 dan 503 di gerbang item.
 *
 * Modul ini SENGAJA tidak mengimpor React dan tidak memakai Tailwind:
 * dokumen yang disusunnya harus berdiri sendiri tanpa lembar gaya
 * aplikasi, yang namanya di-hash saat build dan tidak dapat dirujuk dari
 * route handler.
 */

export type PesanKeadaan = {
  judul: string;
  penjelasan: string;
};

export const TIDAK_TERSEDIA: PesanKeadaan = {
  judul: "Halaman ini tidak tersedia.",
  penjelasan: "Link mungkin sudah tidak berlaku atau alamatnya keliru.",
};

export const GALAT_PENCATATAN: PesanKeadaan = {
  judul: "Akses Anda tidak dapat dicatat.",
  penjelasan:
    "Aplikasi ini tidak meneruskan apa pun yang tidak dapat ia catat, jadi halaman ini tidak dibuka. Coba lagi sebentar lagi.",
};

/** Dipakai gerbang item DAN halaman group, supaya keduanya bermuara di satu tempat. */
export const JALUR_TIDAK_TERSEDIA = "/tidak-tersedia";
export const JALUR_GALAT_PENCATATAN = "/galat-pencatatan";

function sandikan(teks: string): string {
  return teks
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Kesebelas token warna disalin apa adanya dari app/globals.css. Nilainya
 * memang hidup di dua tempat, dan itu diterima secara sadar: alternatifnya
 * adalah membaca berkas CSS saat runtime dari route handler, yang menukar
 * duplikasi tiga baris dengan kegagalan runtime.
 *
 * Mode gelap dijawab dua kali. `prefers-color-scheme` menjawabnya TANPA
 * JavaScript — itu inti perbaikan ini. Skrip kecil di bawah menyalakan
 * kelas .dark atau .light dari localStorage supaya pilihan manual
 * pengunjung tetap menang bila JavaScript hidup, persis seperti
 * app/layout.tsx.
 */
const GAYA = `
:root { --bg: #f8fafc; --fg: #0f172a; --muted: #64748b; }
@media (prefers-color-scheme: dark) {
  :root:not(.light) { --bg: #0b0f19; --fg: #e8edf5; --muted: #94a3b8; }
}
:root.dark { --bg: #0b0f19; --fg: #e8edf5; --muted: #94a3b8; }
:root.light { --bg: #f8fafc; --fg: #0f172a; --muted: #64748b; }
* { box-sizing: border-box; }
body {
  margin: 0;
  min-height: 100vh;
  background: var(--bg);
  color: var(--fg);
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}
main { margin: 0 auto; width: 100%; max-width: 42rem; padding: 4rem 1rem; }
h1 { margin: 0; font-size: 1.25rem; line-height: 1.75rem; font-weight: 500; }
p { margin: 0.5rem 0 0; font-size: 0.875rem; line-height: 1.25rem; color: var(--muted); }
`.trim();

const SKRIP_TEMA = `(function(){try{
var t=localStorage.getItem("theme");
if(t==="dark"||t==="light")document.documentElement.classList.add(t);
}catch(e){}})();`;

export function dokumenKeadaan(pesan: PesanKeadaan): string {
  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Kumpulink</title>
<style>${GAYA}</style>
<script>${SKRIP_TEMA}</script>
</head>
<body>
<main>
<h1>${sandikan(pesan.judul)}</h1>
<p>${sandikan(pesan.penjelasan)}</p>
</main>
</body>
</html>
`;
}

/**
 * `no-store` sama wajibnya di sini seperti pada 302 gerbang item: satu
 * permukaan penolakan yang tersimpan di cache bersama akan disajikan
 * kepada pengunjung berikutnya yang mungkin justru berhak masuk.
 */
export function responsKeadaan(pesan: PesanKeadaan, status: number): Response {
  return new Response(dokumenKeadaan(pesan), {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store",
    },
  });
}
