import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "Kumpulink",
  description: "Himpun tautan dan berkas ke dalam group, bagikan lewat satu link.",
};

// Direction contract — dibaca ulang setiap kali menyunting antarmuka.
// Sengaja berupa komentar HTML di dalam markup terkirim, bukan komentar
// TSX, supaya bertahan di keluaran build produksi dan dapat di-grep.
const DIRECTION_CONTRACT = `<!--
THESIS: Status akses terbaca sebelum diketuk. Kedua permukaan menolak kisi
papan tautan dan panel statistik dashboard: baris berketinggian tetap, dan
isi baris — bukan posisinya — yang memikul perbedaan.

OWN-WORLD: Sebelas token slate-biru, Inter, JetBrains Mono untuk slug, URL,
IP, cap waktu. Pil bergaris rambut, tidak pernah terisi; satu-satunya elemen
terisi adalah tombol yang dapat ditindak. Rel ikon kiri tetap, kolom status
kanan tetap.

STORY: Pengunjung tahu dalam hitungan detik mana yang terbuka, mana yang
perlu masuk, mana yang perlu izin. Pemilik menyelesaikan satu acara di bawah
lima menit tanpa meninggalkan dashboard.

FIRST VIEWPORT: Publik — bilah identitas, judul group, slug mono, baris
ringkasan mono, lalu kartu item bertumpuk menurut urutan pemilik; aksi
utamanya kartu itu sendiri. Dashboard — bilah atas dengan nama, tombol
keluar, lencana tertunda; penyaring lengket; baris akordeon terlipat dengan
kolom lencana di kanan.

FORM: Dunia diwarisi, code-led; tanpa ronde konsep, tanpa seed key.

FINISH: unreviewed and undocumented is unfinished; this build ends with the
finish review, the verdict, DESIGN.md, and every shipping raster carrying
its provenance
-->`;

const THEME_SCRIPT = `(function(){try{
var t=localStorage.getItem("theme");
var isDark=t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches);
document.documentElement.classList.toggle("dark",isDark);
}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="antialiased">
        <div hidden dangerouslySetInnerHTML={{ __html: DIRECTION_CONTRACT }} />
        {children}
      </body>
    </html>
  );
}
