# AI Workflow Rules

## Approach

Bangun proyek ini secara bertahap dengan alur kerja yang
digerakkan spesifikasi. File konteks menentukan apa yang
dibangun, bagaimana membangunnya, dan sejauh mana progresnya.
Selalu implementasikan sesuai spesifikasi ini — jangan
menyimpulkan atau mengarang perilaku dari nol.

Aplikasi ini adalah aplikasi kontrol akses yang kebetulan
berbentuk kumpulan tautan. Ketika sebuah keputusan
implementasi menawarkan pilihan antara lebih nyaman dan
lebih dapat dipertanggungjawabkan, pilih yang kedua, lalu
catat alasannya di `progress-tracker.md`.

## Scoping Rules

- Kerjakan satu unit fitur dalam satu waktu.
- Utamakan langkah kecil yang dapat diverifikasi daripada
  perubahan besar yang bersifat spekulatif.
- Jangan menggabungkan batas sistem yang tidak berhubungan
  dalam satu langkah implementasi.
- Selesaikan satu unit sampai benar-benar jalan ujung ke
  ujung sebelum memulai unit berikutnya.

## Build Order

Tujuh unit, dikerjakan berurutan. Setiap unit menghasilkan
sesuatu yang dapat dijalankan dan diperiksa.

Skema database ditulis lengkap sejak Unit 1, termasuk
`AccessRequest` dan ketiga nilai `accessMode`. Fiturnya
menyusul di Unit 7. Selama belum ada, item `APPROVAL`
ditolak oleh `evaluateAccess()` dan nilai itu belum dapat
dipilih di CMS — sehingga keadaan setengah jadi bersikap
menolak, bukan meloloskan.

### Unit 1 — Fondasi dan autentikasi

Menyiapkan Next.js, TypeScript, Tailwind, shadcn, Prisma,
dan skema database lengkap. Memasang Auth.js dengan
provider Google. Menentukan peran `OWNER` dari
`OWNER_EMAIL`. Membuat kerangka dashboard yang hanya bisa
dibuka pemilik.

Selesai bila: pemilik dapat masuk dan melihat dashboard
kosong; orang lain yang masuk ditolak masuk dashboard.

### Unit 2 — CMS group

Membuat, mengubah, menghapus, dan menyusun ulang group.
Akordeon dashboard. Pembuatan dan validasi keunikan slug.

Selesai bila: pemilik dapat membuat beberapa group,
mengubah judul dan slugnya, dan melihatnya sebagai daftar
akordeon yang dapat dilipat.

### Unit 3 — Item dan unggahan

Menambah item bertipe `LINK`, `PDF`, dan `IMAGE`, dari
sumber `EXTERNAL` maupun `UPLOAD`. Pembungkus
`lib/storage/`. Penegakan batas ukuran dan pemeriksaan
tipe berkas di server. Penyusunan ulang urutan item.
Pemilihan `accessMode` terbatas pada `OPEN` dan `IDENTITY`.

Selesai bila: pemilik dapat mengisi satu group dengan
ketiga tipe item, mengunggah PDF, dan menyusun urutannya.

### Unit 4 — Gerbang akses dan halaman publik

`lib/access/evaluate-access.ts` beserta matriks
pengujiannya. Halaman group publik. Route gerbang item.
Penulisan `AccessLog` di `lib/audit/`. Alur masuk Google
dengan `callbackUrl` yang mengembalikan pengunjung ke titik
semula.

Ini unit paling berisiko dalam proyek. Kerjakan
`evaluateAccess()` dan pengujiannya lebih dulu, sebelum
menulis halaman apa pun.

Selesai bila: seluruh matriks pengujian izin lulus; halaman
group publik tampil dengan benar untuk ketiga tingkat
`visibility`; item `IDENTITY` mengalihkan ke Google lalu
meneruskan ke tujuan; item `APPROVAL` ditolak karena belum
ada catatan izin; setiap akses tercatat di `AccessLog`.

### Unit 5 — Berbagi, kedaluwarsa, dan QR

Panel Bagikan. Pengaturan `visibility`, `expiresAt`, dan
`shareEnabled`. Penyalinan URL. Pembuatan QR code di server.
Spanduk pratinjau pemilik untuk group nonaktif.

Selesai bila: pemilik dapat mencabut link dan menyaksikan
halaman publiknya berubah menjadi halaman tidak tersedia,
sementara pemilik sendiri masih dapat membukanya dengan
spanduk peringatan.

### Unit 6 — Tampilan riwayat akses

Tabel riwayat per group di dashboard, dengan penyaringan
berdasarkan item dan rentang tanggal, serta paginasi.

Selesai bila: pemilik dapat melihat siapa mengakses item
apa pada jam berapa, dan menyaringnya.

### Unit 7 — Permintaan dan persetujuan akses

Unit terbesar dan paling banyak bagiannya. Kerjakan dalam
empat langkah, dan verifikasi tiap langkah sebelum lanjut.

1. **Aturan izin lebih dulu.** Perluas `evaluateAccess()`
   dengan cabang `APPROVAL` beserta seluruh matriks
   pengujiannya: tanpa catatan, `PENDING`, `APPROVED`,
   `REJECTED`, `REVOKED`, dan `APPROVED` yang kedaluwarsa.
   Belum ada antarmuka apa pun di langkah ini.
2. **Sisi pemohon.** Halaman pengajuan, halaman menunggu,
   halaman ditolak, kartu item bermode persetujuan, dan
   tombol ajukan sekaligus. `lib/requests/` untuk
   pembuatan permintaan. Belum ada email.
3. **Sisi pemilik.** Halaman `/dashboard/requests`,
   lencana jumlah tertunda, keputusan satuan dan massal,
   pencabutan izin. Buka pilihan `APPROVAL` di CMS,
   lengkap dengan peringatan untuk item bersumber
   `EXTERNAL`.
4. **Email.** `lib/notify/`, templat, pengumpulan lewat
   `notifiedAt`, endpoint cron beserta pengamannya, dan
   workflow GitHub Actions terjadwal yang memanggilnya.

Selesai bila: pengunjung dapat mengajukan izin untuk
seluruh item terkunci dalam satu tindakan; pemilik dapat
menyetujui seluruhnya dalam satu tindakan; pemohon menerima
email berisi tautan langsung dan dapat membuka itemnya;
tiga puluh pengajuan dalam satu menit menghasilkan paling
banyak satu email ke pemilik; dan menyetel group menjadi
kedaluwarsa membuat izin yang sudah disetujui berhenti
berlaku tanpa tindakan tambahan.

## When to Split Work

Pecah sebuah langkah implementasi bila ia menggabungkan:

- Perubahan antarmuka dan perubahan aturan izin
- Lebih dari satu route handler yang tidak berhubungan
- Perubahan skema database dan perubahan antarmuka dalam
  satu langkah
- Sisi pemohon dan sisi pemilik dari alur permintaan
- Logika permintaan dan pengiriman email
- Perilaku yang belum terdefinisi jelas di file konteks

Bila sebuah perubahan tidak dapat diverifikasi ujung ke
ujung dengan cepat, lingkupnya terlalu luas — pecah.

## Handling Missing Requirements

- Jangan mengarang perilaku produk yang tidak terdefinisi
  di file konteks.
- Bila sebuah kebutuhan ambigu, selesaikan dulu di file
  konteks yang relevan sebelum mengimplementasikan.
- Bila sebuah kebutuhan belum ada, tambahkan sebagai
  pertanyaan terbuka di `progress-tracker.md` sebelum
  melanjutkan.
- Bila sebuah permintaan tampak mengharuskan pelanggaran
  invarian di `architecture.md`, hentikan dan tanyakan.
  Jangan cari jalan memutar.

## Protected Files

Jangan diubah kecuali diinstruksikan secara eksplisit:

- `components/ui/*` — komponen hasil generate shadcn
- `prisma/migrations/*` — migrasi yang sudah diterapkan;
  buat migrasi baru, jangan sunting yang lama
- `lib/access/evaluate-access.ts` — boleh diubah, tetapi
  setiap perubahan wajib disertai pembaruan matriks
  pengujiannya dalam perubahan yang sama
- `lib/requests/` — perubahan status di sini wajib disertai
  pengujian yang memastikan hanya pemilik yang dapat
  memutuskan
- Internal pustaka pihak ketiga

## Keeping Docs in Sync

Perbarui file konteks terkait setiap kali implementasi
mengubah:

- Arsitektur sistem atau batas tanggung jawab
- Keputusan model penyimpanan
- Aturan izin atau alur permintaan
- Konvensi atau standar kode
- Lingkup fitur
- Token warna atau pola tata letak

## Before Moving to the Next Unit

1. Unit saat ini berjalan ujung ke ujung sesuai lingkupnya
2. Tidak ada invarian di `architecture.md` yang dilanggar
3. Matriks pengujian `evaluateAccess()` lulus, bila unit
   ini menyentuh aturan izin
4. Antarmuka diperiksa di mode terang dan gelap
5. Halaman publik diperiksa di lebar layar ponsel
6. `progress-tracker.md` mencerminkan pekerjaan yang
   selesai
7. `npm run build` lulus
