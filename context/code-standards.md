# Code Standards

## General

- Modul kecil dan berfungsi tunggal. Satu berkas
  menjelaskan satu hal.
- Perbaiki akar masalah, jangan menumpuk penambal di
  atasnya.
- Jangan mencampur urusan yang tidak berhubungan dalam
  satu komponen atau satu route.
- Berkas yang tumbuh melewati kira-kira 200 baris adalah
  tanda bahwa isinya mengerjakan lebih dari satu hal.
  Pecah sebelum menambah fitur baru ke dalamnya.
- Nama berkas memakai kebab-case, nama komponen memakai
  PascalCase.
- Semua teks yang dilihat pengguna ditulis dalam Bahasa
  Indonesia. Nama variabel, fungsi, tabel, dan kolom
  ditulis dalam Bahasa Inggris.

## TypeScript

- Mode `strict` wajib aktif di seluruh proyek.
- Hindari `any`. Pakai antarmuka eksplisit atau tipe yang
  dipersempit. Bila tipe benar-benar tidak diketahui,
  gunakan `unknown` lalu persempit.
- Validasi input eksternal di batas sistem sebelum
  dipercaya: badan permintaan, parameter pencarian,
  parameter route, variabel lingkungan, dan berkas
  unggahan.
- Tipe yang dipakai lebih dari satu berkas diletakkan di
  `lib/types/`. Tipe lokal tetap di berkasnya.
- Turunkan tipe dari skema Zod dengan `z.infer` daripada
  menulis tipe kembar yang bisa berbeda diam-diam.

## Next.js

- Server component sebagai bawaan. Tambahkan `use client`
  hanya ketika interaktivitas peramban benar-benar
  diperlukan.
- Setiap pemeriksaan izin terjadi di server component atau
  route handler, tidak pernah di client component.
- Route handler mengerjakan satu tanggung jawab saja.
- Halaman dan gerbang di `app/(public)/` selalu dirender
  dinamis. Jangan pernah memakai cache statis atau ISR di
  jalur mana pun yang hasilnya bergantung pada sesi
  pengunjung.
- Alihkan dengan `redirect()` dari `next/navigation` di
  server, bukan dengan navigasi sisi klien.
- Mutasi memakai server action, kecuali unggahan berkas
  yang memakai route handler.

## Access Control

- `lib/access/evaluate-access.ts` adalah fungsi murni: ia
  tidak menyentuh database, tidak membaca sesi sendiri,
  dan tidak menulis log. Semua yang ia butuhkan diberikan
  sebagai argumen.
- Fungsi ini mengembalikan hasil bertipe union yang
  eksplisit — `GRANTED`, `NEEDS_LOGIN`, `NEEDS_REQUEST`,
  `PENDING_APPROVAL`, atau `DENIED` beserta alasannya —
  bukan nilai boolean. Alasan penolakan diperlukan untuk
  log, dan keadaan `NEEDS_*` menentukan halaman apa yang
  dirender.
- Catatan `AccessRequest` diambil oleh pemanggil dan
  diberikan sebagai argumen. Fungsi ini tidak boleh
  mengambilnya sendiri, karena itu akan menghancurkan
  kemurniannya dan membuat matriks pengujiannya
  memerlukan database.
- Nilai `accessMode` yang tidak dikenali harus ditangani
  sebagai penolakan, bukan sebagai kasus yang lolos ke
  cabang terakhir. Penambahan mode baru tidak boleh diam-diam
  membuka akses.
- Jangan pernah menyalin logika izin ke tempat lain. Bila
  sebuah jalur baru butuh pemeriksaan izin, jalur itu
  memanggil fungsi ini.
- Penambahan aturan izin baru wajib disertai penambahan
  kasus uji pada matriks pengujian fungsi ini di dalam
  perubahan yang sama.

## Audit Logging

- Hanya `lib/audit/` yang menulis ke tabel `AccessLog`.
- Penulisan log ditunggu sampai selesai dengan `await`
  sebelum pengalihan atau pengaliran berkas dimulai.
  Jangan pernah menjadikannya pekerjaan latar.
- Nama dan email disalin ke baris log pada saat kejadian.
  Jangan mengandalkan join ke tabel `User` saat membaca
  riwayat, karena data pengguna bisa berubah kemudian.
- Kegagalan menulis log pada akses `GRANTED` membatalkan
  penerusan. Meneruskan pengunjung tanpa jejak lebih buruk
  daripada gagal membuka berkas — itu justru menghapus
  alasan aplikasi ini dibuat.

## Access Requests

- Hanya `lib/requests/` yang membuat atau mengubah baris
  `AccessRequest`.
- Pengajuan hanya boleh menghasilkan status `PENDING`.
  Perubahan ke `APPROVED`, `REJECTED`, atau `REVOKED`
  memeriksa `role === OWNER` lebih dulu.
- Keputusan massal dijalankan dalam satu transaksi. Jika
  satu baris gagal, seluruhnya dibatalkan — pemilik tidak
  boleh berakhir dengan sebagian orang disetujui dan
  sebagian tidak tanpa mengetahuinya.
- Saat menyetujui, `expiresAt` diambil dari
  `group.expiresAt` pada saat keputusan dibuat, bukan
  dibiarkan null lalu dihitung belakangan.
- Pengajuan untuk item yang sudah memiliki catatan izin
  milik pemohon dilewati diam-diam, bukan menggagalkan
  seluruh pengajuan massal.

## Notifications

- Hanya `lib/notify/` yang mengimpor SDK Resend.
- Pengiriman email tidak pernah berada di dalam transaksi
  database, dan kegagalannya tidak pernah membatalkan
  transaksi.
- Kegagalan email dicatat ke log server, lalu ditelan.
  Pemohon dan pemilik tetap dapat melihat keadaan
  sebenarnya di aplikasi.
- Jangan pernah menahan permintaan HTTP untuk menunggu
  jeda pengumpulan. Email yang tertahan dikirim lewat
  endpoint cron yang dipanggil penjadwal di luar aplikasi.
- Templat email tidak memuat isi rahasia. Cukup nama item,
  nama group, dan tautan ke aplikasi — kotak masuk bukan
  tempat yang dilindungi gerbang.

## API Routes and Server Actions

- Urutan tetap di setiap handler: baca sesi, periksa peran,
  validasi input dengan Zod, jalankan logika, kembalikan
  bentuk respons yang konsisten.
- Peran diambil dari sesi sisi server. Jangan pernah
  mempercayai peran, kepemilikan, atau identitas yang
  dikirim dari klien.
- Bentuk respons galat seragam:
  `{ error: { code, message } }`. `message` ditulis dalam
  Bahasa Indonesia dan aman ditampilkan ke pengguna.
- Pesan galat tidak pernah membocorkan keberadaan sumber
  daya yang seharusnya tidak diketahui pemohon.

## Data and Storage

- Metadata di database, isi berkas di object storage.
- Hanya `lib/storage/` yang mengimpor SDK Vercel Blob.
  Modul lain memakai `putFile`, `getFileStream`, dan
  `deleteFile`.
- Tidak ada berkas yang disimpan sebagai base64 atau
  `bytea` di database.
- Kunci Blob tidak pernah dikirim ke klien, termasuk di
  dalam props server component yang terserialisasi.
- Tipe berkas unggahan diperiksa dari isi berkas, bukan
  dari ekstensi nama maupun `Content-Type` yang dikirim
  peramban.
- Batas ukuran unggahan ditegakkan di server, bukan hanya
  di peramban.
- Menghapus item juga menghapus berkasnya di Blob.
  Menghapus group menghapus seluruh item dan berkasnya.
  Baris `AccessLog` tetap disimpan.

## Styling

- Gunakan token CSS custom property. Tidak ada nilai
  heksadesimal yang ditulis langsung di komponen.
- Ikuti skala border radius di `ui-context.md`.
- Setiap komponen harus benar di mode terang dan gelap.
  Komponen tidak dianggap selesai bila hanya diuji di satu
  mode.
- Mobile-first: tulis gaya dasar untuk layar sempit, lalu
  tambahkan breakpoint ke atas.

## File Organization

- `app/(dashboard)/` — halaman CMS khusus pemilik
- `app/(public)/` — halaman group dan gerbang item
- `app/api/` — route handler
- `lib/access/` — evaluasi izin
- `lib/audit/` — penulisan riwayat akses
- `lib/requests/` — pembuatan dan keputusan permintaan izin
- `lib/notify/` — pengiriman email dan templatnya
- `lib/auth/` — konfigurasi Auth.js dan helper sesi
- `lib/db/` — klien Prisma dan fungsi query
- `lib/storage/` — pembungkus object storage
- `lib/validation/` — skema Zod
- `lib/groups/` — logika group sebagai fungsi murni: turunan
  slug, slug acak, penyelesaian bentrok, penomoran ulang
  urutan. Tidak menyentuh database, sehingga seluruh
  aturannya dapat diuji tanpa Prisma — alasan yang sama
  yang memisahkan `lib/access/`
- `lib/order/` — penyusunan ulang urutan sebagai fungsi murni,
  generik atas apa pun yang berid. Dipakai group maupun item;
  berdiri di luar `lib/groups/` justru karena ia bukan milik
  salah satunya
- `lib/time/` — pemformatan waktu ke `Asia/Jayapura` beserta
  label zonanya. Berdiri sendiri karena label itu wajib di
  setiap waktu yang terlihat pengguna, di kedua permukaan
- `lib/types/` — tipe bersama
- `types/` — augmentasi tipe modul pihak ketiga (mis.
  `next-auth.d.ts`), bukan tipe bersama aplikasi
- `components/ui/` — komponen shadcn hasil generate
- `components/dashboard/` — komponen CMS
- `components/public/` — komponen halaman publik
- `prisma/` — skema dan migrasi
- `tests/` — pengujian

## Testing

- Kerangka pengujian: **Vitest**, dijalankan lewat `npm test`.
  Dipilih karena berjalan langsung dengan TypeScript dan ESM tanpa
  lapisan transformasi tambahan, dan cepat — matriks izin dijalankan
  berulang kali di Unit 4 dan Unit 7.
- Setiap perubahan aturan izin wajib disertai pengujian
  pada matriks `evaluateAccess()` di dalam perubahan yang
  sama.
- Pengujian menyebutkan perilaku, bukan nama fungsi.
  Contoh: "menolak group kedaluwarsa meski pengunjung
  sudah masuk".
- Jangan menulis pengujian yang hanya mengulang
  implementasi.

## Security Practices

- Jangan pernah membocorkan keberadaan sumber daya melalui
  perbedaan kode status, pesan, atau waktu respons.
  `NOT_FOUND`, `REVOKED`, dan `EXPIRED` menghasilkan
  respons yang identik. Pengecualiannya hanya alasan yang
  berkaitan dengan permintaan izin, karena pemohon sudah
  mengetahui item itu ada — dialah yang mengajukannya.
- Endpoint cron dilindungi header `CRON_SECRET` dan menolak
  permintaan tanpa header itu. Jadwal yang dapat dipicu siapa
  saja bukan jadwal. Rahasianya disimpan sebagai secret di
  penjadwal, tidak pernah ditulis di dalam berkas workflow
  yang ikut masuk repositori.
- Rahasia hanya berada di variabel lingkungan sisi server.
  Tidak ada rahasia yang diberi awalan `NEXT_PUBLIC_`.
- `targetUrl` divalidasi hanya menerima skema `http` dan
  `https`, untuk mencegah `javascript:` dan `data:`.
- Tautan eksternal yang dirender di antarmuka memakai
  `rel="noopener noreferrer"`.
- Slug acak dibuat dari sumber acak kriptografis, bukan
  dari `Math.random()`.
