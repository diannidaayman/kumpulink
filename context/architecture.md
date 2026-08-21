# Architecture Context

## Stack

| Layer        | Technology                          | Role                                                                     |
| ------------ | ----------------------------------- | ------------------------------------------------------------------------ |
| Framework    | Next.js 15 (App Router), TypeScript | Gerbang akses dievaluasi di server sebelum HTML dikirim                    |
| UI           | Tailwind CSS + shadcn/ui            | Sistem komponen; token warna lewat CSS custom property                    |
| Icons        | Lucide React                        | Ikon garis, satu keluarga untuk seluruh aplikasi                          |
| Auth         | Auth.js v5, provider Google         | Identitas terverifikasi tanpa biaya per pengguna aktif                    |
| Database     | Prisma + PostgreSQL (Neon)          | Metadata group, item, pengguna, dan riwayat akses                         |
| File storage | Vercel Blob, private store          | Berkas PDF dan gambar unggahan; menuntut `@vercel/blob` 2.3 atau lebih baru |
| Validation   | Zod                                 | Validasi input di setiap batas sistem                                     |
| QR           | Paket `qrcode`, dirender di server  | QR code sebagai SVG, tanpa layanan pihak ketiga                           |
| Email        | Resend                              | Pemberitahuan permintaan akses dan keputusannya                           |
| Penjadwalan  | GitHub Actions, setiap lima menit    | Mengirim email ringkasan permintaan yang tertahan jeda                     |
| Rate limit   | Penghitung di Postgres per IP       | Membatasi percobaan tebak slug pada route gerbang                         |
| Deployment   | Vercel                              | Deploy dari repositori Git                                                |

**Catatan pilihan Auth.js daripada Clerk.** Pengunjung
aplikasi ini banyak dan sekali pakai — satu acara dengan
dua ratus peserta menghasilkan dua ratus identitas baru
dalam sehari. Model harga per pengguna aktif bulanan tidak
sejalan dengan pola itu. Auth.js dengan provider Google
tidak menagih per pengguna, dan pengunjung cukup menjadi
baris di database sendiri.

## System Boundaries

- `app/(dashboard)/` — antarmuka CMS, hanya untuk pemilik.
  Dilindungi di lapisan layout melalui pemeriksaan sesi
  sisi server.
- `app/page.tsx` — mengalihkan `/` ke `/dashboard`. Aplikasi ini tidak
  memiliki halaman depan publik; pengunjung selalu tiba lewat
  `/g/[slug]`, tidak pernah lewat akar.
- `app/akses-ditolak/` — halaman untuk sesi yang bukan pemilik. Berada di
  luar grup `(dashboard)` supaya tidak melewati gerbangnya sendiri, yang
  akan membuat pengalihannya berputar tanpa henti.
- `app/(public)/g/[slug]/` — halaman group publik dan route
  gerbang item. Satu-satunya jalan masuk pengunjung ke
  konten.
- `app/api/` — route handler untuk unggahan berkas dan
  mutasi data. Setiap handler memeriksa peran pemilik dan
  memvalidasi input sebelum menjalankan logika.
- `lib/access/` — satu-satunya tempat aturan izin
  dievaluasi. Berisi fungsi murni `evaluateAccess()` yang
  menerima group, item, dan sesi, lalu mengembalikan
  keputusan beserta alasannya.
- `lib/audit/` — penulisan `AccessLog`. Hanya dipanggil
  dari sisi server.
- `lib/requests/` — pembuatan dan pemutusan `AccessRequest`.
  Satu-satunya tempat status permintaan berubah.
- `lib/notify/` — pembungkus Resend beserta templat email
  dan logika pengumpulan pemberitahuan. Tidak ada modul
  lain yang mengimpor SDK Resend secara langsung.
- `lib/storage/` — pembungkus tipis di atas Vercel Blob:
  `putFile` membungkus `put(path, file, { access: 'private' })`,
  `getFileStream` membungkus `get(pathname, { access: 'private' })`,
  dan `deleteFile` menghapus berkasnya. `getFileStream`
  mengembalikan objek berisi `stream`, `blob.contentType`,
  `blob.etag`, dan `statusCode` — ia mengalirkan isi berkas,
  bukan menyusun URL. Tidak ada kode lain yang mengimpor SDK
  Blob secara langsung.
- `lib/db/` — klien Prisma dan fungsi query.
- `lib/auth/` — konfigurasi Auth.js, helper sesi, dan penentuan peran
  pemilik. `role.ts` berisi `resolveRole()` sebagai fungsi murni tanpa
  dependensi Auth.js maupun variabel lingkungan, sehingga dapat diuji
  tanpa database. Peran diturunkan ulang di callback `session` setiap
  kali sesi dibaca; kolom `User.role` hanya salinan agar dapat di-query
  dan **bukan** sumber kebenaran.
- `types/` — augmentasi tipe modul pihak ketiga, seperti
  `next-auth.d.ts` yang memperluas `Session` dan `User` dari next-auth.
  Bukan tipe bersama aplikasi — itu tetap di `lib/types/`.
- `components/ui/` — komponen shadcn hasil generate. Tidak
  diedit manual.
- `components/dashboard/` — komponen khusus CMS.
- `components/public/` — komponen halaman group publik.
- `prisma/` — skema dan migrasi.
- `tests/` — pengujian, dengan `tests/access/` sebagai
  matriks pengujian `evaluateAccess()`.

Alasan `lib/access/` berdiri sendiri: jika logika izin
tersebar di halaman, route handler, dan komponen, cepat
atau lambat akan ada satu jalur yang lupa diperiksa, dan
jalur itulah yang bocor. Memusatkannya membuat seluruh
aturan dapat dibaca dan diuji dalam satu berkas.

## Data Model

### User

Setiap orang yang pernah masuk dengan Google, termasuk
pemilik.

| Field       | Tipe                | Catatan                                      |
| ----------- | ------------------- | -------------------------------------------- |
| `id`        | `String` (cuid)     | Kunci utama                                  |
| `email`     | `String` unik       | Dari Google, terverifikasi                   |
| `name`      | `String?`           | Dari Google                                  |
| `image`     | `String?`           | URL avatar Google                            |
| `emailVerified` | `DateTime?`     | Dituntut skema adapter Prisma Auth.js; tidak dipakai logika aplikasi |
| `role`      | `OWNER \| VIEWER`   | Diturunkan ulang dari `OWNER_EMAIL` setiap kali sesi dibaca; kolom ini hanya salinan, bukan sumber kebenaran |
| `createdAt` | `DateTime`          |                                              |

Tabel `Account`, `Session`, dan `VerificationToken` mengikuti
skema bawaan Auth.js.

### Group

Sekaligus unit penyusun di dashboard dan unit yang
dibagikan. Struktur datar — tidak ada group di dalam group.

| Field           | Tipe                                   | Catatan                                          |
| --------------- | -------------------------------------- | ------------------------------------------------ |
| `id`            | `String` (cuid)                        | Kunci utama                                       |
| `title`         | `String`                               | Ditampilkan di halaman publik                     |
| `slug`          | `String` unik                          | Kustom atau acak; segmen URL publik               |
| `description`   | `String?`                              | Teks pengantar di halaman publik                  |
| `visibility`    | `PRIVATE \| REQUIRE_LOGIN \| PUBLIC`   | Tingkat akses halaman                             |
| `shareEnabled`  | `Boolean`, default `false`             | Saklar cabut seketika                             |
| `expiresAt`     | `DateTime?`                            | Null berarti tidak pernah kedaluwarsa             |
| `sortOrder`     | `Int`                                  | Urutan di dashboard                               |
| `notifiedAt`    | `DateTime?`                            | Waktu email permintaan terakhir untuk group ini    |
| `createdAt`     | `DateTime`                             |                                                   |
| `updatedAt`     | `DateTime`                             |                                                   |

Indeks pada `slug` — dipenuhi oleh constraint `@unique` di atas, yang di
Postgres otomatis membuat indeks btree unik; tidak ada `@@index` terpisah
untuk kolom yang sama, karena itu hanya menambah beban tulis tanpa
manfaat query. Keadaan terlipat atau terbuka akordeon di dashboard
adalah keadaan antarmuka, disimpan di `localStorage` peramban, bukan di
database.

### Item

Satu baris konten di dalam sebuah group. Dua sumbu yang
saling bebas: `type` menentukan cara menampilkan, `source`
menentukan asal isi.

| Field             | Tipe                        | Catatan                                              |
| ----------------- | --------------------------- | ---------------------------------------------------- |
| `id`              | `String` (cuid)             | Kunci utama                                           |
| `groupId`         | `String`                    | Relasi ke `Group`, hapus berjenjang                   |
| `title`           | `String`                    | Label yang dilihat pengunjung                         |
| `description`     | `String?`                   | Keterangan singkat di bawah judul                     |
| `type`            | `LINK \| PDF \| IMAGE`      | Menentukan ikon dan cara membuka                      |
| `source`          | `EXTERNAL \| UPLOAD`        | `LINK` selalu `EXTERNAL`                              |
| `targetUrl`       | `String?`                   | Wajib bila `source = EXTERNAL`                        |
| `fileKey`         | `String?`                   | Kunci Blob; wajib bila `source = UPLOAD`              |
| `fileName`        | `String?`                   | Nama asli berkas, untuk unduhan                       |
| `mimeType`        | `String?`                   | Diperiksa dari isi berkas, bukan dari ekstensi        |
| `sizeBytes`       | `Int?`                      |                                                       |
| `accessMode`      | `OPEN \| IDENTITY \| APPROVAL` | Default `OPEN`. Lihat penjelasan di bawah          |
| `isActive`        | `Boolean`, default `true`   | Menonaktifkan tanpa menghapus                         |
| `isBroken`        | `Boolean`, default `false`  | Ditandai bila berkas tidak ditemukan saat diakses     |
| `sortOrder`       | `Int`                       | Urutan dalam group                                    |
| `createdAt`       | `DateTime`                  |                                                       |
| `updatedAt`       | `DateTime`                  |                                                       |

Indeks gabungan pada `(groupId, sortOrder)`.

**Arti ketiga nilai `accessMode`:**

| Nilai      | Perilaku                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------ |
| `OPEN`     | Siapa pun yang lolos gerbang group langsung diteruskan                                       |
| `IDENTITY` | Wajib masuk lebih dulu, lalu langsung diteruskan dan dicatat                                 |
| `APPROVAL` | Wajib masuk, mengajukan permintaan, dan menunggu pemilik memutuskan sebelum dapat diteruskan  |

Ketiganya dipilih per item, sehingga satu group dapat
memuat absensi yang terbuka, rundown yang cukup identitas,
dan notulen yang butuh persetujuan.

**Peringatan yang berlaku khusus untuk `APPROVAL`.**
Persetujuan tidak menutup kebocoran tautan eksternal. Item
bersumber `EXTERNAL` yang disetujui tetap memperlihatkan
URL aslinya kepada pemohon, dan URL itu dapat diteruskan
tanpa melewati gerbang. Item yang benar-benar memerlukan
persetujuan sebaiknya bersumber `UPLOAD`. Antarmuka CMS
menampilkan peringatan ini ketika `accessMode = APPROVAL`
dipilih pada item bersumber `EXTERNAL`.

### AccessRequest

Satu catatan izin per pasangan item dan pemohon. Nama dan
email disalin pada saat pengajuan, dengan alasan yang sama
seperti pada `AccessLog`.

| Field            | Tipe                                              | Catatan                                                  |
| ---------------- | ------------------------------------------------- | -------------------------------------------------------- |
| `id`             | `String` (cuid)                                    | Kunci utama                                               |
| `itemId`         | `String`                                           | Relasi ke `Item`, hapus berjenjang                        |
| `groupId`        | `String`                                           | Didenormalisasi, agar keputusan massal per group murah    |
| `userId`         | `String`                                           | Pemohon; selalu terisi karena pengajuan wajib masuk       |
| `requesterName`  | `String`                                           | Salinan saat pengajuan                                    |
| `requesterEmail` | `String`                                           | Salinan saat pengajuan                                    |
| `message`        | `String?`                                          | Keperluan, opsional, maksimal 300 karakter                |
| `status`         | `PENDING \| APPROVED \| REJECTED \| REVOKED`       | Default `PENDING`                                         |
| `ownerNote`      | `String?`                                          | Catatan pemilik saat menolak atau mencabut                |
| `decidedAt`      | `DateTime?`                                        | Waktu keputusan                                           |
| `expiresAt`      | `DateTime?`                                        | Masa berlaku izin setelah disetujui                       |
| `createdAt`      | `DateTime`                                         | Waktu pengajuan                                           |
| `updatedAt`      | `DateTime`                                         |                                                           |

Kunci unik gabungan pada `(itemId, userId)`. Indeks pada
`(groupId, status)` untuk daftar permintaan tertunda, dan
pada `(userId, status)`.

**Aturan siklus hidup:**

- Pengajuan membuat baris berstatus `PENDING`. Bila baris
  untuk pasangan itu sudah ada, pengajuan ditolak — satu
  orang tidak dapat mengantre dua kali untuk item yang sama.
- Dari `PENDING`, pemilik memutuskan menjadi `APPROVED`
  atau `REJECTED`.
- Dari `APPROVED`, pemilik dapat mencabut menjadi `REVOKED`.
- Pemohon tidak dapat mengajukan ulang setelah `REJECTED`
  atau `REVOKED`. Hanya pemilik yang dapat mengubah kembali
  status itu menjadi `APPROVED` dari dashboard. Ini mencegah
  pengajuan berulang tanpa menutup jalan bila pemilik salah
  menilai.
- Saat disetujui, `expiresAt` diisi dari `group.expiresAt`.
  Bila group tidak memiliki kedaluwarsa, `expiresAt` bernilai
  null dan izin berlaku sampai dicabut. Izin tidak pernah
  hidup lebih lama daripada group yang menaunginya.

### AccessLog

Satu tabel untuk dua jenis peristiwa. Nama dan email
disalin pada saat kejadian, bukan sekadar dirujuk, agar
riwayat tetap utuh meskipun data pengguna berubah atau
dihapus kemudian.

| Field           | Tipe                                                                            | Catatan                                    |
| --------------- | ------------------------------------------------------------------------------- | ------------------------------------------ |
| `id`            | `String` (cuid)                                                                  | Kunci utama                                 |
| `eventType`     | `PAGE_VIEW \| ITEM_ACCESS`                                                       |                                             |
| `groupId`       | `String`                                                                         | Selalu terisi                               |
| `itemId`        | `String?`                                                                        | Terisi bila `eventType = ITEM_ACCESS`       |
| `userId`        | `String?`                                                                        | Null bila pengunjung tidak masuk            |
| `visitorName`   | `String?`                                                                        | Salinan saat kejadian                       |
| `visitorEmail`  | `String?`                                                                        | Salinan saat kejadian                       |
| `outcome`       | `GRANTED \| DENIED`                                                              |                                             |
| `denyReason`    | Salah satu nilai pada daftar di bawah, opsional                                   | Terisi bila `outcome = DENIED`              |
| `ipAddress`     | `String?`                                                                        |                                             |
| `userAgent`     | `String?`                                                                        |                                             |
| `createdAt`     | `DateTime`                                                                       | Waktu kejadian                              |

Nilai `denyReason` yang mungkin: `NOT_FOUND`, `REVOKED`,
`EXPIRED`, `PRIVATE`, `ITEM_INACTIVE`, `FILE_MISSING`,
`RATE_LIMITED`, `REQUEST_REJECTED`, `REQUEST_REVOKED`,
`APPROVAL_EXPIRED`.

Indeks gabungan pada `(groupId, createdAt)` dan
`(itemId, createdAt)`.

Aturan pencatatan `PAGE_VIEW`: dicatat bila dan hanya bila
identitas pengunjung diketahui, yaitu pengunjung sedang
masuk. Aturan ini berlaku sama untuk semua nilai
`visibility` — group publik yang kebetulan dibuka
pengunjung yang sedang masuk tetap dicatat. Kunjungan
anonim tidak dicatat, karena barisnya banyak dan tidak
menjawab pertanyaan siapa pun.

`ITEM_ACCESS` selalu dicatat, termasuk untuk pengunjung
anonim pada item terbuka. Barisnya tetap berguna sebagai
hitungan klik meski kolom identitasnya kosong.

Keadaan "belum mengajukan" dan "sedang menunggu keputusan"
**tidak** dicatat sebagai `DENIED`. Keduanya bagian dari
alur normal, bukan penolakan, dan waktunya sudah terekam
di `AccessRequest.createdAt`. Mencatatnya lagi di sini
hanya menggandakan informasi yang sama dan membuat tabel
riwayat sulit dibaca.

**Masa simpan.** Baris `AccessLog` disimpan **satu bulan**,
lalu dipangkas. Kebijakan ini berlaku sejak sekarang;
pemangkasannya sendiri diimplementasikan sebagai pekerjaan
berjadwal setelah rilis. Konsekuensi yang diterima secara
sadar: riwayat sebuah acara hilang sebulan setelahnya,
sehingga dua acara yang berjauhan tidak dapat dibandingkan.
Riwayat dipakai untuk menelusuri satu acara yang baru saja
berlalu, bukan untuk menyusun statistik jangka panjang.

**Tanpa relasi foreign key.** `groupId`, `itemId`, dan `userId` disimpan
sebagai `String` biasa, tanpa relasi Prisma. Menghapus group wajib
menyisakan riwayatnya, sedangkan `groupId` tidak boleh null — dengan
foreign key hanya ada dua hasil, cascade yang ikut menghapus riwayat atau
constraint yang memblokir penghapusan group, dan keduanya melanggar
aturan di atas. Ini sejalan dengan alasan yang sama yang membuat nama dan
email disalin alih-alih dirujuk: riwayat adalah catatan peristiwa, bukan
pandangan atas keadaan sekarang.

## Storage Model

- **PostgreSQL** — seluruh metadata: pengguna, group, item,
  riwayat akses, sesi, dan penghitung rate limit.

Tabel penghitung rate limit **belum didefinisikan** dan sengaja ditunda ke
Unit 4 (K7), tempat logikanya ditulis. Bentuknya tidak pernah dirinci di bagian
Data Model, dan membuat tabel baru tidak memikul risiko yang mendasari
aturan "skema lengkap sejak Unit 1" — risiko itu melekat pada penambahan
kolom atau nilai enum ke tabel yang sudah berisi data.

- **Vercel Blob (private store)** — isi berkas PDF dan gambar
  unggahan. Berkas hanya dapat dibaca melalui route gerbang
  aplikasi. Kunci Blob tidak pernah dikirim ke klien dalam
  bentuk apa pun.
- Tidak ada berkas yang disimpan sebagai base64 atau
  `bytea` di database.

**Sifat privat ditentukan di tingkat store, bukan per berkas.**
Store dibuat privat sejak awal dengan
`vercel blob create-store <nama> --access private`, dan store
yang terlanjur dibuat publik tidak dapat diubah menjadi privat
— berkasnya harus dipindahkan ke store baru. Perlakukan ini
sebagai keputusan sekali jalan.

Autentikasi ke store memakai OIDC secara bawaan ketika kode
berjalan di atas Vercel, dan `BLOB_STORE_ID` terpasang sendiri
dari kaitan store ke proyek. `BLOB_READ_WRITE_TOKEN` hanya
diperlukan kode yang berjalan di luar Vercel, termasuk mesin
pengembangan lokal.

Pemeriksaan izin dilakukan di dalam route handler, tepat di
sebelah panggilan `get()` — bukan di middleware. Respons berkas
privat tidak pernah masuk cache CDN.

Batas ukuran unggahan: 10 MB per berkas, ditegakkan di
server. Tipe yang diterima: `application/pdf`, `image/png`,
`image/jpeg`, `image/webp` — diperiksa dari isi berkas,
bukan dari ekstensi nama.

## Auth and Access Model

- Autentikasi melalui Auth.js dengan provider Google saja.
  Tidak ada kata sandi.
- Peran `OWNER` diberikan bila email pengguna cocok dengan variabel
  lingkungan `OWNER_EMAIL` **setelah keduanya dinormalkan** — spasi di
  kedua ujung dipangkas dan huruf besar-kecil disamakan. `OWNER_EMAIL`
  diketik tangan sedangkan alamatnya datang dari Google, jadi beda satu
  huruf kapital akan mengunci pemilik di luar dashboardnya sendiri, dan
  tidak ada antarmuka untuk memperbaikinya. Subalamat berawalan `+`
  **tidak** dianggap sama. Tidak ada antarmuka untuk mengubah peran.
- Semua pengguna lain berperan `VIEWER`. Peran `VIEWER`
  tidak memberikan akses apa pun ke dashboard.
- Seluruh konten dimiliki oleh pemilik tunggal. Tidak ada
  kolom kepemilikan per baris, karena tidak ada pemilik
  kedua.
- Pengunjung tidak pernah dibuatkan akun secara diam-diam.
  Baris `User` hanya lahir dari tindakan masuk yang
  disengaja.

## Access Evaluation

Seluruh aturan berikut hidup di `lib/access/evaluate-access.ts`
sebagai fungsi murni. Fungsi ini tidak menyentuh database
dan tidak menulis log — ia hanya memutuskan.

Fungsi ini menerima group, item, sesi, dan catatan
`AccessRequest` milik pemohon untuk item tersebut bila ada.
Pengambilan catatan izin dari database adalah tanggung
jawab pemanggil, sehingga fungsi ini tetap murni dan
seluruh matriksnya dapat diuji tanpa database.

### Tahap satu: group

Dievaluasi berurutan, berhenti pada kecocokan pertama.

1. Group tidak ditemukan → `DENIED / NOT_FOUND`
2. Pemohon berperan `OWNER` → `GRANTED`, dengan penanda
   `ownerPreview` bila group sedang dicabut atau kedaluwarsa
3. `shareEnabled = false` → `DENIED / REVOKED`
4. `expiresAt` sudah lewat → `DENIED / EXPIRED`
5. `visibility = PRIVATE` → `DENIED / PRIVATE`
6. `visibility = REQUIRE_LOGIN` dan pemohon belum masuk →
   `NEEDS_LOGIN`
7. Selain itu → `GRANTED`

### Tahap dua: item

Hanya dijalankan bila tahap satu menghasilkan `GRANTED`.

1. Item tidak ditemukan atau bukan milik group ini →
   `DENIED / NOT_FOUND`
2. `isActive = false` → `DENIED / ITEM_INACTIVE`
3. `accessMode = OPEN` → `GRANTED`
4. Pemohon belum masuk → `NEEDS_LOGIN`
   (berlaku untuk `IDENTITY` maupun `APPROVAL`)
5. `accessMode = IDENTITY` → `GRANTED`
6. `accessMode = APPROVAL`, dievaluasi berurutan:
   1. Tidak ada catatan izin → `NEEDS_REQUEST`
   2. `status = PENDING` → `PENDING_APPROVAL`
   3. `status = REJECTED` → `DENIED / REQUEST_REJECTED`
   4. `status = REVOKED` → `DENIED / REQUEST_REVOKED`
   5. `status = APPROVED` dan `expiresAt` sudah lewat →
      `DENIED / APPROVAL_EXPIRED`
   6. `status = APPROVED` → `GRANTED`

Hasil `NEEDS_REQUEST` dan `PENDING_APPROVAL` bukan
penolakan. Keduanya keadaan sah dalam alur, dan
ditampilkan sebagai halaman yang menjelaskan langkah
berikutnya, bukan sebagai halaman tidak ditemukan.

### Cara hasil ditampilkan

Ketiga alasan penolakan `NOT_FOUND`, `REVOKED`, dan
`EXPIRED` menghasilkan halaman 404 yang identik secara
visual maupun secara kode status. Perbedaannya hanya
tercatat di log. Dari luar, group yang dicabut tidak dapat
dibedakan dari slug yang tidak pernah ada.

Tiga alasan yang berkaitan dengan permintaan —
`REQUEST_REJECTED`, `REQUEST_REVOKED`, dan
`APPROVAL_EXPIRED` — justru dijelaskan apa adanya kepada
pemohon. Kerahasiaan tidak lagi relevan di titik ini:
pemohon sudah tahu item itu ada, karena dialah yang
mengajukannya.

## Request Flow

### Halaman group — `GET /g/[slug]`

1. Baca sesi di server.
2. Ambil group beserta item aktifnya. Bila pengunjung
   sedang masuk, ambil sekaligus seluruh `AccessRequest`
   miliknya pada group ini dalam satu query.
3. Panggil `evaluateAccess()` tahap satu.
4. `NEEDS_LOGIN` → alihkan ke Google dengan `callbackUrl`
   menunjuk kembali ke URL ini.
5. `DENIED` → render halaman tidak ditemukan.
6. `GRANTED` → catat `PAGE_VIEW` bila identitas diketahui,
   lalu render daftar item. Setiap item dirender sebagai
   tautan menuju `/g/[slug]/i/[itemId]`, tidak pernah
   menuju tujuan aslinya. Untuk item `accessMode = APPROVAL`,
   keadaan izin pemohon ditampilkan pada kartunya, sehingga
   ia tahu mana yang perlu diajukan tanpa harus mengkliknya
   satu per satu.

### Gerbang item — `GET /g/[slug]/i/[itemId]`

0. Periksa rate limit per alamat IP. Bila terlampaui,
   kembalikan HTTP 429, catat `DENIED / RATE_LIMITED`, dan
   hentikan tanpa menyentuh database lebih jauh.
1. Baca sesi di server.
2. Ambil group, item, dan catatan `AccessRequest` pemohon
   untuk item ini bila pemohon sedang masuk.
3. Panggil `evaluateAccess()` tahap satu lalu tahap dua.
4. `NEEDS_LOGIN` → alihkan ke Google dengan `callbackUrl`
   menunjuk kembali ke URL gerbang ini, sehingga setelah
   masuk pengunjung langsung diteruskan tanpa mengklik lagi.
5. `NEEDS_REQUEST` → render halaman pengajuan izin berisi
   nama item, nama group, dan formulir keperluan opsional.
   Tidak ada yang dicatat di `AccessLog`.
6. `PENDING_APPROVAL` → render halaman menunggu berisi
   waktu pengajuan. Tidak ada yang dicatat di `AccessLog`.
7. `DENIED` → catat `ITEM_ACCESS` dengan `outcome = DENIED`
   beserta alasannya. Untuk alasan yang berkaitan dengan
   permintaan, render halaman penjelasan; selain itu render
   halaman tidak ditemukan.
8. `GRANTED` → catat `ITEM_ACCESS` dengan
   `outcome = GRANTED`, **tunggu penulisan selesai**, lalu:
   - `source = EXTERNAL` → HTTP 302 ke `targetUrl`
   - `source = UPLOAD` → alirkan berkas dari Blob melalui
     respons ini, dengan tiga header berikut:
     `Content-Disposition: inline` untuk PDF dan gambar,
     `Cache-Control: private, no-cache` agar respons berkas
     privat tidak pernah masuk cache CDN, dan
     `X-Content-Type-Options: nosniff` agar peramban tidak
     menebak tipe berkas di luar `mimeType` yang sudah
     diperiksa dari isinya
9. Bila berkas tidak ditemukan di Blob → tandai
   `item.isBroken = true`, catat `DENIED / FILE_MISSING`,
   dan render halaman tidak ditemukan.

Penulisan log ditunggu sampai selesai sebelum pengalihan
dilakukan. Menjadikannya pekerjaan latar berisiko hilang
saat fungsi serverless berhenti setelah respons terkirim.

### Pengajuan izin — server action

Dua bentuk: satu item, atau seluruh item `APPROVAL` di
sebuah group yang belum pernah diajukan pemohon.

1. Wajib ada sesi. Tanpa sesi, tolak.
2. Jalankan `evaluateAccess()` tahap satu untuk group.
   Group yang dicabut atau kedaluwarsa tidak menerima
   pengajuan.
3. Untuk setiap item sasaran, pastikan `accessMode =
   APPROVAL` dan belum ada catatan izin milik pemohon.
   Item yang sudah punya catatan dilewati diam-diam,
   bukan menggagalkan seluruh pengajuan.
4. Buat baris `AccessRequest` berstatus `PENDING`, dengan
   nama dan email disalin dari sesi.
5. Antrekan pemberitahuan ke pemilik lewat `lib/notify/`.

### Keputusan pemilik — server action

1. Wajib `role === OWNER`.
2. Ubah status menjadi `APPROVED`, `REJECTED`, atau
   `REVOKED`, isi `decidedAt` dan `ownerNote` bila ada.
3. Saat `APPROVED`, isi `expiresAt` dari `group.expiresAt`.
4. Kirim email keputusan ke pemohon. Email persetujuan
   memuat tautan langsung ke gerbang item, sehingga pemohon
   tidak perlu mencari kembali halaman group-nya.

Bentuk massal menerima daftar id permintaan dan
menerapkan keputusan yang sama ke semuanya dalam satu
transaksi, lalu mengirim **satu** email berisi seluruh item
yang diputuskan — bukan satu email per item.

### Pemberitahuan ke pemilik

Pemberitahuan permintaan baru dikumpulkan, tidak dikirim
satu per satu. Untuk setiap group berlaku jeda sepuluh
menit: email pertama dikirim segera saat pengajuan, lalu
permintaan yang masuk dalam sepuluh menit berikutnya
digabung menjadi satu email ringkasan berisi jumlah
permintaan tertunda dan tautan ke halaman permintaan.

Mekanismenya: kolom `notifiedAt` pada `Group` menyimpan
waktu email terakhir. Server action pengajuan hanya
mengirim langsung bila jeda sudah lewat. Email ringkasan
untuk permintaan yang tertahan dikirim oleh workflow
GitHub Actions terjadwal yang berjalan setiap lima menit,
memanggil endpoint cron aplikasi dengan header
`CRON_SECRET`, dan memeriksa group yang punya permintaan
`PENDING` lebih baru daripada `notifiedAt`. Server action
tidak pernah menunggu jeda itu sendiri — menahan permintaan
HTTP selama sepuluh menit adalah cara lain untuk mengatakan
permintaan itu gagal.

**Mengapa GitHub Actions, bukan Vercel Cron.** Vercel Cron
pada paket Hobby hanya berjalan sekali sehari, dan ekspresi
cron yang lebih sering ditolak saat deployment — bukan gagal
diam-diam saat berjalan. Jadwal sekali sehari tidak dapat
memenuhi kriteria sukses nomor 10. GitHub Actions memberi
jadwal lima menit tanpa biaya pada repositori publik, dan
endpoint cron aplikasinya tetap sama persis.

Dua batasan GitHub Actions yang perlu diketahui, bukan
ditemukan kembali saat acara sedang berjalan:

- Penjadwalnya **kerap meleset beberapa menit** saat antrean
  GitHub padat. Email ringkasan datang terlambat, tidak hilang.
- Workflow terjadwal **dinonaktifkan otomatis setelah 60 hari**
  repositori tidak aktif. Periksa sebelum tiap acara.

Jadwal lima menit pada repositori **privat** akan menembus
kuota gratis GitHub: tiap job ditagih minimal satu menit, jadi
288 job sehari menghabiskan sekitar 8.640 menit sebulan
terhadap kuota 2.000 menit. Repositori publik tidak dibatasi
menit. Bila repositori kelak dijadikan privat, mekanisme
penjadwalan ini harus ditinjau ulang.

Tanpa pengumpulan ini, satu acara dengan puluhan peserta
yang menekan "ajukan semua" akan mengirim puluhan email
dalam hitungan menit, dan pemberitahuan yang membanjir
adalah pemberitahuan yang berhenti dibaca.

Kegagalan mengirim email tidak pernah membatalkan
pembuatan atau keputusan permintaan. Permintaan tetap
tercatat dan tetap terlihat di dashboard; email hanyalah
lapisan pemberitahuan di atasnya.

## Invariants

1. Setiap jalur menuju konten memanggil
   `lib/access/evaluate-access.ts`. Tidak ada halaman,
   route handler, atau server action yang mengevaluasi
   izin sendiri.
2. `AccessLog` ditulis di server dan penulisannya selesai
   sebelum pengalihan atau pengaliran berkas dimulai.
   Tidak ada pencatatan yang bergantung pada JavaScript
   klien.
3. URL Blob mentah, `fileKey`, dan `targetUrl` item yang
   bersetelan `accessMode = IDENTITY` atau `APPROVAL` tidak
   pernah muncul di HTML, payload data, maupun respons API
   yang dikirim ke pengunjung.
4. Respons halaman publik tidak memuat rujukan apa pun ke
   group lain, termasuk di metadata dan data terserialisasi.
5. Setiap mutasi data memeriksa `role === OWNER` dari sesi
   sisi server. Menyembunyikan tombol di antarmuka tidak
   dihitung sebagai kontrol akses.
6. Item tidak pernah lebih permisif daripada group
   induknya. Tahap dua hanya berjalan setelah tahap satu
   menghasilkan `GRANTED`.
7. Berkas besar tidak pernah disimpan di database.
8. Hanya `lib/storage/` yang mengimpor SDK Vercel Blob.
9. Semua input eksternal divalidasi dengan skema Zod
   sebelum menyentuh logika apa pun.
10. Hanya `lib/requests/` yang mengubah status
    `AccessRequest`, dan hanya `lib/notify/` yang mengimpor
    SDK Resend.
11. Perubahan status `AccessRequest` menjadi `APPROVED`,
    `REJECTED`, atau `REVOKED` hanya boleh dilakukan oleh
    sesi berperan `OWNER`. Pemohon hanya dapat membuat
    baris berstatus `PENDING`.
12. Izin tidak pernah berlaku lebih lama daripada group
    yang menaunginya. `AccessRequest.expiresAt` tidak boleh
    melewati `group.expiresAt`.
13. Kegagalan pengiriman email tidak membatalkan transaksi
    permintaan maupun keputusan.
14. Route handler dan server action tidak menjalankan
    pekerjaan latar berumur panjang. Pekerjaan berjadwal
    dijalankan oleh penjadwal di luar aplikasi — saat ini
    workflow GitHub Actions terjadwal — yang memanggil
    endpoint cron dengan header `CRON_SECRET`.
