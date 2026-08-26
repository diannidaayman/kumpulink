# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Pemilik (satu orang).** Menyiapkan bahan untuk sebuah acara kerja dari
laptop, biasanya di bawah tekanan waktu menjelang acara. Pekerjaannya:
menghimpun tautan dan berkas ke dalam satu group, menetapkan siapa boleh
melihat apa, menyalin link dan QR code, lalu selama acara berlangsung
memutuskan permintaan akses yang masuk dan sesudahnya menelusuri siapa
yang membuka apa. Peran `OWNER` ditentukan dari variabel lingkungan
`OWNER_EMAIL`, bukan dari data yang dapat diubah lewat antarmuka.

**Peserta acara (banyak, sekali pakai).** Rekan kerja yang menerima satu
link atau memindai QR code. Jalur pemakaian yang paling sering: membuka
halaman group dari ponsel di tengah acara, mencari satu berkas, membukanya,
selesai. Sebagian besar tidak pernah kembali. Satu acara dengan dua ratus
peserta menghasilkan dua ratus identitas baru dalam sehari.

Tidak ada audiens ketiga. Aplikasi ini bukan produk multi-penyewa dan
tidak memiliki pendaftaran publik.

## Product Purpose

Kumpulink menghimpun tautan, berkas PDF, dan gambar ke dalam group yang
rapi, lalu membagikan satu group tertentu lewat sebuah link — tanpa ikut
membocorkan kumpulan tautan pribadi pemilik, dan tanpa kehilangan jejak
siapa yang sudah membuka dokumen penting.

Masalah yang dipecahkan: menjelang acara kerja, bahan tersebar di banyak
tempat dan dikirim berulang kali di grup chat. Menyatukannya di satu tempat
itu mudah; menyatukannya tanpa membocorkan yang lain dan tanpa kehilangan
jejak akses, itu yang belum ada.

Berhasil berarti:

1. Pemilik dapat menyiapkan satu acara lengkap — membuat group, mengisi
   tautan dan berkas, mengatur izin, menyalin link dan QR — dalam waktu di
   bawah lima menit, tanpa meninggalkan dashboard.
2. Penerima link tidak dapat melihat maupun menebak keberadaan group lain
   milik pemilik.
3. Setiap akses ke item yang ditandai butuh identitas tercatat di server
   dengan nama, email, dan waktu — dan tetap tercatat meskipun JavaScript
   dimatikan di peramban penerima.
4. Untuk item paling sensitif, tidak ada satu pun akses yang terjadi tanpa
   keputusan sadar dari pemilik, dan setiap keputusan itu meninggalkan
   jejak permanen.

## Positioning

Kontrol akses dua lapis yang dievaluasi di server: tingkat halaman per
group (`PRIVATE` / `REQUIRE_LOGIN` / `PUBLIC`) dan tingkat item per berkas
(`OPEN` / `IDENTITY` / `APPROVAL`) — sehingga satu group dapat memuat
absensi yang terbuka, rundown yang cukup identitas, dan notulen yang butuh
persetujuan manual, dalam satu link yang sama.

Yang tidak dapat ditiru begitu saja oleh alat sejenis (papan tautan,
folder cloud bersama, kiriman di grup chat):

- Halaman group yang dikirim ke pengunjung **tidak memuat URL tujuan item
  mana pun dan tidak memuat alamat penyimpanan berkas mana pun**. Setiap
  isi dilewatkan route gerbang.
- Membuka link yang dicabut atau kedaluwarsa menghasilkan halaman yang
  **identik** dengan membuka slug yang tidak pernah ada — dari luar tidak
  dapat dibedakan, sehingga keberadaan group tidak bocor.
- Riwayat akses menyalin nama dan email pada saat kejadian, bukan
  merujuknya, sehingga catatan tetap utuh meski data pengguna berubah atau
  dihapus.

## Operating Context

- **Halaman publik sesekali ditayangkan di proyektor ruang rapat, tetapi
  itu bukan adegan pemakaian utamanya.** Kejadiannya jarang, dan pemilik
  memutuskan bahwa penayangan proyektor **tidak** mengunci arah visual
  aplikasi. Layar yang dirancang untuk dituju adalah ponsel peserta dan
  laptop pemilik. Keterbacaan tetap dijaga lewat lantai yang sudah
  mengikat di Brand Commitments — kontras WCAG AA di kedua mode, teks
  halaman publik dimulai dari `text-base`, dan warna bukan satu-satunya
  pembawa makna — bukan lewat pembatasan gaya demi jarak pandang ruangan.
  (Diubah 21 Agustus 2026, menggantikan aturan sebelumnya yang menyatakan
  keterbacaan proyektor lebih penting daripada gaya.)
- **Laptop ruang rapat dipakai bergantian.** Tombol keluar harus selalu
  terlihat tanpa perlu membuka menu — di halaman publik maupun di
  dashboard. Tanpa jalan keluar yang terlihat, riwayat akses mencatat orang
  berikutnya sebagai orang yang pertama masuk. (Aturan untuk dashboard
  ditambahkan 21 Agustus 2026, setelah pemilik menemukannya saat menguji
  Unit 1.)
- **Jalur pemakaian peserta yang paling sering adalah ponsel**, dibuka
  setelah memindai QR code di ruangan.
- **Ritme kerja pemilik terikat jalannya acara**: menyiapkan sebelum acara,
  memutuskan permintaan saat acara berlangsung (lewat email pemberitahuan,
  dikumpulkan maksimal satu email per group per sepuluh menit), menelusuri
  riwayat setelah acara.
- **Zona waktu tampilan ditetapkan tetap di `Asia/Jayapura`**, tidak
  mengikuti perangkat pembaca, dan setiap waktu yang terlihat wajib
  menyertakan label zonanya (contoh: `19 Agu 2026, 14.05 WIT`). Alasannya:
  riwayat akses dipakai untuk mempertanggungjawabkan kejadian; bila jam
  mengikuti perangkat, dua orang yang membahas baris yang sama menyebut
  angka yang berbeda.
- **Riwayat akses disimpan satu bulan**, lalu dipangkas. Konsekuensi yang
  diterima sadar: dua acara yang berjauhan tidak dapat dibandingkan.

## Capabilities and Constraints

### Kemampuan yang dikonfirmasi

- Membuat, mengubah, menghapus, dan menyusun ulang group; ditampilkan
  sebagai akordeon terlipat di dashboard.
- Item bertipe `LINK`, `PDF`, atau `IMAGE`, bersumber `EXTERNAL` (tempel
  URL) atau `UPLOAD` (unggah berkas). Urutan diatur dengan geser, dengan
  alternatif papan ketik naik/turun.
- Slug unik yang dapat dikustomisasi, saklar `shareEnabled` untuk mencabut
  seketika, tanggal kedaluwarsa opsional, dan QR code per group yang
  dirender di server sebagai SVG.
- Alur permintaan dan persetujuan: pengunjung mengajukan izin (keperluan
  opsional, maksimal 300 karakter), satu item atau sekaligus semua item
  terkunci; pemilik menyetujui, menolak, atau mencabut — satuan maupun
  sekaligus per pemohon.
- Riwayat akses `PAGE_VIEW` dan `ITEM_ACCESS` dengan nama, email, waktu,
  alamat IP, perangkat, dan hasil `GRANTED`/`DENIED` beserta alasannya.
- Masuk dengan Google saja, tanpa kata sandi.

### Batasan teknis

- Next.js 15 (App Router) + TypeScript, Tailwind + shadcn/ui, Lucide React,
  Auth.js v5 (provider Google), Prisma + PostgreSQL (Neon), Vercel Blob
  (store privat), Zod, Resend, deploy di Vercel. Scaffold sudah ada.
- **Seluruh akses ke konten melewati `lib/access/evaluate-access.ts`** —
  sebuah fungsi murni. Tidak boleh ada jalur baru menuju konten yang
  melewatkannya.
- **Log akses ditulis di server sebelum pengalihan atau pengaliran berkas
  terjadi.** Pencatatan tidak pernah dipindahkan ke JavaScript sisi klien.
- **Keadaan yang tidak pasti selalu berarti menolak** — mode akses yang
  belum diimplementasikan, catatan izin yang tidak ditemukan, dan nilai
  enum yang tidak dikenali menghasilkan penolakan.
- Batas unggahan 4 MB per berkas; tipe diterima `application/pdf`,
  `image/png`, `image/jpeg`, `image/webp`, diperiksa dari isi berkas bukan
  ekstensi.
- Halaman publik harus tetap berfungsi untuk hal pokoknya tanpa JavaScript:
  daftar item dan penerusan lewat gerbang keduanya dirender di server dan
  berupa tautan biasa.
- PDF dan gambar dibuka di tab baru dengan penampil bawaan peramban
  (`Content-Disposition: inline`), bukan tertanam di halaman group.

### Istilah tetap

`group`, `item`, `slug`, `gerbang` (route yang mengevaluasi izin lalu
meneruskan), `mode akses` (`OPEN` / `IDENTITY` / `APPROVAL`), `tingkat
akses halaman` (`PRIVATE` / `REQUIRE_LOGIN` / `PUBLIC`), `permintaan`,
`riwayat akses`.

### Di luar lingkup

Pendaftaran publik dan banyak pemilik; group bersarang; daftar putih email
atau kode akses; pengajuan ulang setelah ditolak; persetujuan otomatis
berbasis aturan; ekspor riwayat ke CSV/Excel; kolaborasi, komentar, atau
reaksi; domain kustom, tema kustom, atau penyesuaian merek; notifikasi push
atau pesan instan; pratinjau PDF tertanam; statistik agregat di luar tabel
riwayat mentah.

### Sengaja ditunda

Ekspor riwayat ke CSV, ringkasan jumlah klik per item, pratinjau PDF
tertanam, dan persetujuan otomatis berdasarkan domain email. Model datanya
sudah dirancang agar keempatnya dapat ditambahkan tanpa perubahan skema.
Tabel penghitung rate limit juga belum didefinisikan dan sengaja ditunda ke
Unit 4 (K7).

## Brand Commitments

Berikut mengikat sesuai keputusan D6 dan dicatat apa adanya dari
`context/ui-context.md` — bukan bahan yang boleh dipertimbangkan ulang.

### Sebelas token warna, mode terang

| Role                | CSS Variable       | Value     |
| ------------------- | ------------------ | --------- |
| Latar halaman       | `--bg-base`        | `#F8FAFC` |
| Permukaan kartu     | `--bg-surface`     | `#FFFFFF` |
| Permukaan terangkat | `--bg-elevated`    | `#F1F5F9` |
| Teks utama          | `--text-primary`   | `#0F172A` |
| Teks redup          | `--text-muted`     | `#64748B` |
| Aksen utama         | `--accent-primary` | `#2563EB` |
| Teks di atas aksen  | `--accent-on`      | `#FFFFFF` |
| Garis batas         | `--border-default` | `#E2E8F0` |
| Galat               | `--state-error`    | `#DC2626` |
| Berhasil            | `--state-success`  | `#16A34A` |
| Peringatan          | `--state-warning`  | `#D97706` |

### Sebelas token warna, mode gelap

| Role                | CSS Variable       | Value     |
| ------------------- | ------------------ | --------- |
| Latar halaman       | `--bg-base`        | `#0B0F19` |
| Permukaan kartu     | `--bg-surface`     | `#131A28` |
| Permukaan terangkat | `--bg-elevated`    | `#1C2433` |
| Teks utama          | `--text-primary`   | `#E8EDF5` |
| Teks redup          | `--text-muted`     | `#94A3B8` |
| Aksen utama         | `--accent-primary` | `#60A5FA` |
| Teks di atas aksen  | `--accent-on`      | `#0B0F19` |
| Garis batas         | `--border-default` | `#253044` |
| Galat               | `--state-error`    | `#F87171` |
| Berhasil            | `--state-success`  | `#4ADE80` |
| Peringatan          | `--state-warning`  | `#FBBF24` |

Token didefinisikan di `app/globals.css` dalam dua blok, `:root` dan
`.dark`. Komponen hanya merujuk token; tidak ada nilai heksadesimal yang
ditulis langsung di komponen. Nama `--accent-on` dipakai, bukan
`--accent-foreground`, karena nama kedua sudah dipakai shadcn/ui dengan
arti berbeda.

### Komitmen lain

- **Tipografi.** Inter untuk teks UI (`--font-sans`); JetBrains Mono
  (`--font-mono`) khusus untuk hal yang dibaca huruf demi huruf: slug
  group, URL berbagi, dan alamat IP di tabel riwayat.
- **Skala border radius.** `rounded-md` (inline dan UI kecil), `rounded-xl`
  (kartu dan panel), `rounded-2xl` (modal dan overlay), `rounded-full`
  (lencana dan pil).
- **Pustaka komponen.** shadcn/ui di atas Tailwind. Berkas di
  `components/ui/` adalah hasil generate CLI dan tidak diedit manual;
  penyesuaian dilakukan dengan membungkusnya di `components/dashboard/`
  atau `components/public/`.
- **Halaman publik mobile-first** — peserta acara membukanya dari ponsel
  setelah memindai QR.
- **Seluruh teks pengguna dalam Bahasa Indonesia**, dan sudah ditulis untuk
  keadaan kosong maupun halaman galat.
- **Warna tidak pernah menjadi satu-satunya pembawa makna.** Status akses
  selalu disertai teks atau ikon.
- **Kontras WCAG AA di kedua mode** — 4.5:1 untuk teks biasa, 3:1 untuk
  teks besar. Warna baru tidak boleh ditambahkan tanpa memeriksa rasionya
  di kedua mode.

## Evidence on Hand

- Dokumen konteks proyek: `context/project-overview.md`,
  `context/architecture.md`, `context/ui-context.md`,
  `context/code-standards.md`, `context/ai-workflow-rules.md`,
  `context/progress-tracker.md`, serta `CLAUDE.md`, `ROADMAP.md`, dan
  `PROMPT-PLAYBOOK.md`.
- Scaffold Next.js 15 yang sudah berjalan: `app/`, `components/ui/`
  (20 komponen shadcn hasil generate), `components/theme-toggle.tsx`,
  `lib/`, `prisma/`, `tests/`.

Belum ada dan tidak boleh dikarang: logo, materi merek, testimoni,
pelanggan, tolok ukur kinerja, harga, atau klaim penerapan. Aplikasi ini
milik satu orang untuk pemakaian sendiri; tidak ada halaman pemasaran dan
tidak ada halaman depan publik — `/` mengalihkan ke `/dashboard`.

## Product Principles

1. **Keadaan yang tidak pasti berarti menolak.** Setiap cabang yang tidak
   dikenali berakhir pada penolakan, bukan pada kelonggaran.
2. **Ketiadaan tidak boleh dapat dibedakan dari penolakan.** Link yang
   dicabut, yang kedaluwarsa, dan yang tidak pernah ada menghasilkan
   halaman yang sama persis.
3. **Pencatatan yang diketahui pemakainya.** Item yang dicatat menyatakannya
   di kartunya sendiri; dialog pengajuan menampilkan apa adanya nama dan
   email yang akan diserahkan. Pertanggungjawaban lebih berguna daripada
   pengintaian diam-diam.
4. **Akibat sebuah pilihan terbaca saat memilih, bukan setelah salah
   pilih.** Ketiga mode akses ditampilkan bersamaan beserta penjelasannya;
   peringatan kebocoran URL eksternal muncul saat `APPROVAL` dipilih pada
   item `EXTERNAL`.
5. **Setiap keadaan kosong menyebutkan langkah berikutnya**, bukan sekadar
   menyatakan bahwa tidak ada apa-apa — dan tidak menjanjikan tenggat yang
   tidak dapat dipenuhi aplikasi.

## Accessibility & Inclusion

- Kontras WCAG AA di mode terang dan gelap.
- Warna tidak pernah menjadi satu-satunya pembawa makna; status akses
  selalu disertai teks atau ikon.
- Akordeon dashboard dapat dioperasikan penuh dengan papan ketik dan
  mengumumkan keadaan terlipat atau terbuka.
- Penyusunan ulang item dengan geser wajib punya alternatif papan ketik
  berupa tombol naik dan turun.
- Cincin fokus selalu terlihat di kedua mode warna.
- Ikon dekoratif diberi `aria-hidden`; ikon yang berdiri sendiri sebagai
  tombol wajib punya `aria-label`.
- Halaman publik dapat digunakan tanpa JavaScript untuk hal-hal pokoknya.
- Ukuran teks di halaman publik dimulai dari `text-base`, tidak lebih
  kecil.
