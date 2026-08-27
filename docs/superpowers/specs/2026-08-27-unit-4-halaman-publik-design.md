# Unit 4, bagian kedua — halaman publik, gerbang item, dan `lib/audit/`

**Tanggal:** 27 Agustus 2026
**Unit:** 4 — Gerbang akses dan halaman publik (Fase 5)
**Lingkup langkah ini:** pemanggil `evaluateAccess()`, bukan evaluatornya

Bagian pertama Unit 4 sudah tergabung ke `main` di `e10cbda`:
`lib/access/evaluate-access.ts` beserta 48 pengujian di `tests/access/`.
Yang tersisa adalah pemanggilnya. Dokumen ini merancangnya.

## Lingkup

Yang dibangun:

- `app/(public)/g/[slug]/page.tsx` — halaman group publik
- `app/(public)/g/[slug]/i/[itemId]/route.ts` — gerbang item
- `app/(public)/g/[slug]/i/[itemId]/masuk/page.tsx` — layar masuk gerbang
- `app/(public)/tidak-tersedia/page.tsx` dan `app/(public)/not-found.tsx`
- `app/(public)/galat-pencatatan/page.tsx`
- `components/public/` — bilah identitas, kepala group, spanduk pratinjau
  pemilik, kartu item, layar masuk
- `lib/audit/` — penulisan `AccessLog`
- `lib/ratelimit/` — penghitung per IP di Postgres
- `lib/db/gate.ts` dan `lib/db/public-group.ts` — dua kueri baru
- `getFileStream()` di `lib/storage/blob.ts`
- `lib/storage/content-disposition.ts` — penyandian nama berkas
- `lib/groups/item-summary.ts` — baris ringkasan
- Satu migrasi Prisma: tabel `RateLimitCounter`
- Pembaruan lima file konteks

Yang **tidak** dibangun, dan alasannya di bagian Batas Lingkup `APPROVAL`:

- Halaman pengajuan izin, halaman menunggu, dan halaman ditolak
- Kartu item untuk ketujuh keadaan izin
- Panel "Ajukan izin untuk semua"
- `lib/requests/` dan `lib/notify/`
- Pratinjau tertanam untuk item `OPEN` bersumber `UPLOAD`

## Keputusan yang diambil sebelum implementasi

Enam hal tidak terdefinisi di file konteks, atau terdefinisi dengan dua
suara yang bertentangan. Seluruhnya diputuskan lebih dulu di sini, dan
seluruhnya menuntut perubahan file konteks dalam perubahan yang sama.

### U4-4 — `NEEDS_LOGIN` merender layar masuk, bukan mengalihkan ke Google

Tiga dokumen tidak sejalan. `project-overview.md` Alur Pengunjung langkah
2 menyebut pengunjung melihat layar masuk yang **menyebutkan judul
group** agar ia tahu tidak salah alamat. `architecture.md` Request Flow
langkah 4, pada kedua alurnya, menyebut `NEEDS_LOGIN` mengalihkan
langsung ke Google. Brief impeccable menutup barisnya dengan menyatakan
layar masuk itu "berbatasan tapi di luar brief ini".

Ketiganya tidak dapat berlaku sekaligus: pengalihan langsung berarti
tidak ada layar yang menyebut judul group.

**Diputuskan:** layar masuk dibangun, di unit ini, di **kedua** tempat
yang menghasilkan `NEEDS_LOGIN`.

- Halaman group merender layar yang menyebut judul group.
- Gerbang item merender layar yang menyebut judul group **dan nama
  item** — "Masuk untuk membuka *Rundown Acara* di *Rapat Kerja*".

Menyebut nama item di sana bukan kebocoran: pengunjung baru saja
melihatnya di halaman group yang ia klik. Yang ia peroleh adalah
pengetahuan tentang apa yang akan dibuka sebelum ia menyerahkan
identitasnya — sejalan dengan keterangan "Akses Anda akan dicatat" yang
sudah wajib ada di kartu `IDENTITY`.

Harganya satu ketukan tambahan di jalur terpanas, dan itu diterima
secara sadar: `ai-workflow-rules.md` menyuruh memilih yang lebih dapat
dipertanggungjawabkan ketika pilihannya berhadapan dengan yang lebih
nyaman.

`architecture.md` diperbarui: langkah 4 pada kedua alur berbunyi
"render layar masuk yang menyebut group (dan item)", dan pengalihan ke
Google terjadi ketika pengunjung menekan tombolnya.

### U4-5 — Penghitung rate limit hanya menghitung percobaan yang gagal

`architecture.md` bagian Storage Model menyatakan tabel penghitungnya
"belum didefinisikan dan sengaja ditunda ke Unit 4 (K7), tempat
logikanya ditulis". Jadi bentuk dan angkanya memang diputuskan di sini.

Kendala yang mengubah jawaban yang tampak jelas: **dua ratus peserta di
WiFi ruang acara berbagi satu alamat IP.** Rate limit per IP yang
menghitung seluruh permintaan akan mencekik satu ruangan penuh peserta
sah, dan `project-overview.md` menyebut acara dengan dua ratus peserta
sebagai skenario nyata, bukan hipotetis.

**Diputuskan:** penghitung naik **hanya** ketika gerbang berakhir
`DENIED` — termasuk `FILE_MISSING`, tidak termasuk `RATE_LIMITED` itu
sendiri. Ambangnya **20 kegagalan per 10 menit per IP**, jendela tetap.

Akses yang berhasil tidak pernah menaikkan penghitung, sehingga ruangan
berisi dua ratus peserta yang membuka item sah tidak pernah mendekatinya.
Penebak `itemId` — yang setiap tebakannya menghasilkan `NOT_FOUND` —
berhenti pada percobaan ke-21. Itu persis pemakaian yang hendak dibatasi.

Konsekuensi yang diterima: langkah 0 tetap **membaca** penghitung di
setiap permintaan, tetapi kenaikannya terjadi sesudah evaluasi, bukan di
langkah 0. `architecture.md` menerima satu kalimat tambahan yang
menyatakan hal itu. Sifat "berhenti tanpa menyentuh database lebih jauh"
ketika ambang terlampaui tidak berubah.

Kegagalan `RATE_LIMITED` sendiri tidak menaikkan penghitung: menghukum
klien yang sudah dihentikan hanya memperpanjang hukumannya tanpa
menambah perlindungan, dan membuat jendela sepuluh menit menjadi tidak
pernah berakhir selama klien terus mencoba.

### U4-6 — Gerbang item berbentuk route handler, halaman keadaan sebagai anaknya

Gerbang item harus menghasilkan delapan keluaran dari satu URL: layar
masuk, halaman pengajuan, halaman menunggu, halaman penjelasan
penolakan, halaman tidak tersedia, halaman galat pencatatan, HTTP 302 ke
`targetUrl`, dan aliran byte dari Blob. Next.js tidak memiliki satu
bentuk berkas yang sanggup melakukan semuanya: `page.tsx` tidak dapat
mengalirkan byte, `route.ts` tidak dapat merender komponen React.

Alternatif yang ditolak: gerbang sebagai `page.tsx` dengan route anak
`/berkas` untuk mengalirkan byte. Ditolak karena dua sebab yang keduanya
menyentuh baris merah. Pertama, route berkas itu dapat dibuka langsung,
sehingga ia wajib ikut mencatat — dan `ITEM_ACCESS` akan ditulis dari dua
tempat, dengan pembagian "yang ini untuk `EXTERNAL`, yang itu untuk
`UPLOAD`" yang hanya dijaga kehati-hatian. Kedua, berkas unggahan
sensitif justru menjadi jalur terpanjang: dua render server, dua
evaluasi, satu perjalanan bolak-balik tambahan di jaringan seluler.

**Diputuskan:** gerbang adalah `route.ts`. Keluaran yang berbentuk HTML
dijawab dengan 303 ke route anak yang mengevaluasi ulang untuk
melindungi dirinya sendiri dan tidak menulis log, karena tak satu pun
dari mereka menyajikan konten.

Hasilnya: **tepat satu berkas yang menulis `ITEM_ACCESS` dan meneruskan
konten.** Itu persis hal yang dijaga baris merah pertama dan kedua, dan
di bentuk ini ia dijaga oleh struktur berkas, bukan oleh disiplin.

Harga yang dibayar: HTTP 429 tidak dapat menjadi pengalihan tanpa
kehilangan kode statusnya, padahal kode itu tertulis eksplisit di exit
criteria Fase 5. Dijawab dengan satu kalimat `text/plain` berbahasa
Indonesia — permukaan yang sengaja tidak dirancang, untuk klien yang
memang sedang tidak dilayani.

### U4-7 — Kegagalan pencatatan berarti tidak ada yang disajikan

`code-standards.md` bagian Audit Logging hanya mengatur kegagalan pada
`ITEM_ACCESS / GRANTED`. Halaman group menulis `PAGE_VIEW`, dan nasib
kegagalannya tidak tertulis di mana pun.

**Diputuskan:** satu aturan untuk keduanya. Penulisan log yang gagal pada
peristiwa yang menyajikan sesuatu berarti tidak ada yang disajikan.
Halaman group yang gagal menulis `PAGE_VIEW` menampilkan halaman galat
pencatatan, HTTP 500, bukan daftar item.

Dua aturan berbeda untuk dua peristiwa akan menjadi dua perilaku yang
harus diingat, dan yang lebih longgar akan menjadi preseden bagi yang
berikutnya. Keadaan yang memicunya — basis data tidak dapat ditulis —
hampir selalu berarti kuerinya sendiri sudah gagal lebih dulu, sehingga
biaya nyata aturan ketat ini mendekati nol.

Penolakan berbeda dan tetap longgar: kegagalan menulis
`ITEM_ACCESS / DENIED` dicatat ke konsol server lalu ditelan, dan halaman
tidak tersedia tetap tampil. Pengunjung yang ditolak tidak sedang
menerima apa pun, jadi tidak ada yang perlu dibatalkan.

### U4-8 — Pengunjung yang gagal dicatat melihat halaman galat tersendiri

Bahwa penerusan dibatalkan sudah ditetapkan `code-standards.md`. Yang
tidak tertulis adalah apa yang dilihat pengunjung.

**Diputuskan:** halaman galat pencatatan tersendiri, HTTP 500, berisi
pernyataan bahwa akses tidak dapat dicatat sehingga item tidak dibuka,
dan saran mencoba lagi. Tidak menyebut apa pun tentang isi item.

Memakai kembali halaman tidak tersedia ditolak: ia berbohong. Pengunjung
akan menyimpulkan linknya mati dan berhenti mencoba, padahal berkasnya
ada dan gerbangnya baru saja meloloskannya — dan pemilik tidak punya
jejak apa pun, karena penulisan log itulah yang gagal. Halaman galat
bawaan Next.js ditolak karena teksnya berbahasa Inggris.

Kalimatnya ditambahkan ke bagian Empty and Error States di
`ui-context.md`, tempat seluruh kalimat keadaan aplikasi ini hidup.

### U4-9 — `redirectTo` disusun dari parameter route, tidak pernah dari query

Tombol masuk memanggil `signIn("google", { redirectTo })`.

**Diputuskan:** nilai `redirectTo` disusun di server dari parameter route
halaman yang bersangkutan — `/g/[slug]` untuk layar halaman group,
`/g/[slug]/i/[itemId]` untuk layar gerbang item. Ia tidak pernah dibaca
dari query string, dan tidak ada layar masuk yang menerima tujuan sebagai
masukan.

Karena nilainya tidak pernah berasal dari masukan pengunjung, pengalihan
terbuka tidak mungkin terjadi — bukan karena divalidasi dengan benar,
melainkan karena tidak ada tempat masuknya.

## Arsitektur

### `lib/audit/`

Dua berkas.

`request-context.ts` — `readRequestContext()` membaca `x-forwarded-for`
dan `user-agent` dari `next/headers`, mengembalikan
`{ ipAddress, userAgent }`. Alamat IP diambil dari hop pertama
`x-forwarded-for`; bila header itu tidak ada, `null`. Di atas Vercel
header itu dipasang proksi dan tidak dapat dipalsukan klien.

`log-access.ts` — `logPageView()` dan `logItemAccess()`. Ini
satu-satunya berkas di repositori yang menyentuh `prisma.accessLog`,
ditegakkan pengujian batas.

Nama dan email **disalin** ke argumen oleh pemanggil dari sesi yang
sedang berjalan, bukan di-join saat riwayat dibaca. Kedua fungsi
**melempar** saat gagal; modul ini tidak menelan galat, karena yang
memutuskan konsekuensinya adalah pemanggil, dan konsekuensinya berbeda
antara `GRANTED` dan `DENIED`.

### `lib/ratelimit/`

Direktori baru. Ditambahkan ke System Boundaries di `architecture.md` dan
ke File Organization di `code-standards.md`.

`window.ts` — fungsi murni `resolveWindowStart(now, windowMs)` beserta
konstanta `WINDOW_MS` (10 menit) dan `MAX_FAILURES` (20). Murni supaya
dapat diuji tanpa database, mengikuti alasan yang sama yang memisahkan
`lib/groups/` dan `lib/access/`.

`counter.ts` — `readFailureCount(scope, ipAddress, now)` dan
`recordFailure(scope, ipAddress, now)`.

### Tabel `RateLimitCounter`

```prisma
model RateLimitCounter {
  id          String   @id @default(cuid())
  scope       String
  ipAddress   String
  windowStart DateTime
  count       Int      @default(0)

  @@unique([scope, ipAddress, windowStart])
  @@index([windowStart])
}
```

Jendela tetap sepuluh menit, dibulatkan ke bawah dari waktu sekarang.
`scope` diisi `"item-gate"`; kolomnya ada supaya rate limit kedua kelak
tidak menuntut tabel kedua.

`recordFailure()` melakukan `upsert` dengan `increment`, lalu menyapu
baris berjendela lebih tua dari satu jam dalam panggilan yang sama.
Kenaikan terjadi paling banyak 20 kali per IP per sepuluh menit, jadi
penyapuan itu murah dan tidak menuntut pekerjaan berjadwal — yang
memang dilarang invarian 14 untuk route handler.

Ini satu-satunya migrasi Prisma di unit ini. Membuat tabel baru tidak
memikul risiko yang mendasari aturan "skema lengkap sejak Unit 1";
risiko itu melekat pada penambahan kolom atau nilai enum ke tabel yang
sudah berisi data.

### Gerbang item — `app/(public)/g/[slug]/i/[itemId]/route.ts`

`export const dynamic = "force-dynamic"`, hanya `GET`.

0. `readFailureCount()`. `>= MAX_FAILURES` →
   `logItemAccess(DENIED / RATE_LIMITED)`, lalu HTTP 429 berisi satu
   kalimat `text/plain`. Penghitung **tidak** dinaikkan. Berhenti.
1. Baca sesi lewat `auth()`.
2. Satu kueri di `lib/db/gate.ts` mengambil group, item, dan — bila
   pengunjung sedang masuk — catatan `AccessRequest` miliknya untuk item
   ini. Catatan itu diambil meski cabang `APPROVAL` masih menolak, supaya
   Unit 7 mengubah isi evaluator dan bukan pemanggilnya.
3. `evaluateItemAccess()`. Satu panggilan, bukan dua, sesuai U4-3.
4. `NEEDS_LOGIN` → 303 ke `/g/[slug]/i/[itemId]/masuk`. Tidak dicatat.
5. `NEEDS_REQUEST` dan `PENDING_APPROVAL` → tidak terjangkau di Unit 4.
   Ditangani eksplisit sebagai 303 ke `/tidak-tersedia`, dengan komentar
   yang menyebut Unit 7 menggantinya. Tidak dicatat, sesuai aturan
   `AccessLog`.
6. `DENIED` → `logItemAccess(DENIED, reason)`, `recordFailure()`, lalu
   303 ke `/tidak-tersedia`. Kegagalan menulis log di cabang ini dicatat
   ke konsol lalu ditelan.
7. `GRANTED` → `logItemAccess(GRANTED)` **ditunggu sampai selesai**.
   Gagal → 303 ke `/galat-pencatatan`, tidak diteruskan. Berhasil →
   `EXTERNAL` menghasilkan HTTP 302 ke `targetUrl`; `UPLOAD` memanggil
   `getFileStream()` dan mengalirkan byte dari respons yang sama.
8. Berkas tidak ada di Blob → `item.isBroken = true`,
   `logItemAccess(DENIED / FILE_MISSING)`, `recordFailure()`, 303 ke
   `/tidak-tersedia`.

Header respons berkas:

- `Content-Type` dari `Item.mimeType`, yang sudah diperiksa dari isi
  berkas saat unggah — bukan dari tebakan SDK Blob
- `Content-Disposition: inline` dengan `filename*=UTF-8''…` dari
  `Item.fileName`
- `Cache-Control: private, no-cache`
- `X-Content-Type-Options: nosniff`

`getFileStream()` ditambahkan ke `lib/storage/blob.ts`, membungkus
`get(pathname, { access: 'private' })`. Berkas itu tetap satu-satunya
yang mengimpor SDK Blob, sesuai invarian 8.

`lib/storage/content-disposition.ts` berisi penyandiannya sebagai fungsi
murni beserta pengujiannya. Ini menutup butir warisan Unit 3 tentang
sanitasi `fileName` sebelum ia menjadi header.

`lib/db/gate.ts` adalah kueri **kedua** di repositori yang membaca
`fileKey` dan `targetUrl`; yang pertama adalah pra-baca sebelum
penghapusan. Rumusan invarian 3 di `architecture.md` menyebut
"satu-satunya kueri", dan diperbarui supaya mengenal keduanya. Keduanya
hidup di server dan hasilnya tidak pernah terserialisasi ke peramban.

### Route anak

`/g/[slug]/i/[itemId]/masuk` — layar masuk yang menyebut judul group dan
nama item. Mengevaluasi ulang untuk melindungi dirinya sendiri; keputusan
selain `NEEDS_LOGIN` dialihkan kembali ke gerbang. Tidak mencatat apa
pun.

`/tidak-tersedia` — badannya hanya memanggil `notFound()`, sehingga Next
merender `app/(public)/not-found.tsx` dengan status 404. Halaman group
yang ditolak memanggil `notFound()` langsung. Keduanya karena itu
menghasilkan berkas komponen yang sama dan kode status yang sama, dan CEK
3 lulus secara struktural alih-alih karena dua halaman kebetulan ditulis
mirip.

`/galat-pencatatan` — halaman galat pencatatan, HTTP 500.

### Halaman group — `app/(public)/g/[slug]/page.tsx`

`force-dynamic`. Baca sesi, satu kueri di `lib/db/public-group.ts`
mengambil group beserta item aktifnya, lalu `evaluateGroupAccess()`.

- `NEEDS_LOGIN` → layar masuk yang menyebut judul group
- `DENIED` → `notFound()`
- `GRANTED` → tunggu `logPageView()` bila pengunjung sedang masuk, lalu
  render. Kegagalannya mengalihkan ke `/galat-pencatatan` sesuai U4-7.

`PAGE_VIEW` dicatat bila dan hanya bila pengunjung sedang masuk, untuk
semua nilai `visibility`, termasuk ketika yang membuka adalah pemilik.
Kunjungan anonim tidak dicatat.

Select-nya **tidak memuat** `targetUrl` maupun `fileKey` — bukan karena
komponennya tidak memakainya, melainkan supaya keduanya tidak pernah
sampai ke berkas yang merender. Kartu `EXTERNAL` hanya butuh kolom
`source` untuk memasang glif `ExternalLink`.

Komponen di `components/public/`: bilah identitas, spanduk pratinjau
pemilik, kepala group, kartu item, layar masuk. Seluruh keputusan
tampilan mengikuti `.impeccable/surfaces/app-public-g-slug.md` dan
`ui-context.md` apa adanya; tidak ada kalimat keadaan yang ditulis ulang.

Setiap item dirender sebagai tautan ke `/g/[slug]/i/[itemId]` dengan
`target="_blank"` dan `rel="noopener noreferrer"` — tidak pernah ke
tujuan aslinya.

Baris ringkasan (`8 item · 3 perlu masuk · 2 butuh persetujuan`) dihitung
fungsi murni `lib/groups/item-summary.ts`, diuji tanpa database.

Bilah identitas memuat tombol keluar berupa `<form>` yang memanggil
server action pembungkus `signOut()`, sehingga bekerja tanpa JavaScript.

## Batas lingkup `APPROVAL`

Brief impeccable memerikan tujuh keadaan izin, tiga kelas perilaku kartu,
halaman pengajuan, halaman menunggu, halaman ditolak, dan panel "Ajukan
izin untuk semua". **Seluruhnya Unit 7**, sesuai Build Order di
`ai-workflow-rules.md` langkah 2.

Alasannya bukan penghematan waktu: item `APPROVAL` **tidak dapat ada di
database** pada akhir Unit 4. `ItemAccessModeField` tidak menawarkan
pilihannya dan `itemAccessModeSchema` menolaknya di batas sistem — dua
lapis, sengaja, sejak Unit 3. Membangun antarmukanya sekarang berarti
membangun tampilan untuk data yang belum dapat dibuat, dengan
`lib/requests/` yang belum ada.

Yang dibangun adalah kedua kelas yang datanya sudah mungkin: kartu `OPEN`
tanpa lencana sama sekali, dan kartu `IDENTITY` berlencana `Lock` "Perlu
masuk" beserta keterangan "Akses Anda akan dicatat".

Satu pengecualian dibangun sekarang, dan alasannya sikap bawaan, bukan
kelengkapan: **kartu tetap menangani `accessMode = APPROVAL` secara
defensif.** Bila baris semacam itu muncul — data lebih tua atau lebih
baru daripada kode — kartunya dirender sebagai kartu bukan-tautan
berlencana `ShieldCheck` "Butuh persetujuan" tanpa tombol, dan gerbangnya
tetap menolak. Cabang tak terjangkau yang menolak lebih murah daripada
cabang yang tidak ada dan lolos.

## Pengujian

Proyek ini tidak memiliki database uji. Yang diuji adalah fungsi murni
dan batas yang dapat diperiksa secara mekanis.

**Fungsi murni:**

- `resolveWindowStart()`, termasuk batas jendela persis
- Penyandian `Content-Disposition` untuk nama berkas ber-Unicode,
  berkutip ganda, dan berkarakter kendali
- `item-summary.ts` untuk group kosong, satu tipe saja, dan campuran
- Penyusunan `redirectTo` dari parameter route

**Empat pengujian batas**, mengikuti pola `blob-import-boundary.test.ts`
yang sudah terbukti di Unit 3:

1. Hanya `lib/audit/` yang menyebut `prisma.accessLog`, dicari di seluruh
   `app/` dan `lib/`
2. Setiap `page.tsx` dan `route.ts` di bawah `app/(public)/` memuat
   `force-dynamic`, dan tidak satu pun memuat `revalidate` atau
   `generateStaticParams`. Ini menjadikan RISIKO cache Fase 5 sebagai
   pengujian merah, bukan kewaspadaan
3. Select pada `lib/db/public-group.ts` tidak memuat `targetUrl` maupun
   `fileKey`
4. Tidak ada berkas di `components/public/` yang menyebut `targetUrl`
   atau `fileKey`

**Enam pemeriksaan peramban** dijalankan pemilik di akhir unit; empat
pertama adalah CEK Fase 5 di `ROADMAP.md`, dua terakhir dari exit
criteria-nya:

1. Baca source halaman group: nol kecocokan untuk `targetUrl` item mana
   pun, host Blob, dan slug group lain
2. Matikan JavaScript, akses item `IDENTITY`: penerusan tetap terjadi dan
   tepat satu baris `AccessLog` tertulis
3. Buka slug dicabut, kedaluwarsa, dan tidak pernah ada: kode status dan
   halaman identik untuk ketiganya
4. Masuk sebagai pemilik, buka group dicabut: halaman tampil normal
   dengan spanduk peringatan
5. Rate limit: 21 percobaan gagal dari satu IP menghasilkan 429 dan baris
   `DENIED / RATE_LIMITED`
6. Berkas dihapus dari Blob: `isBroken` menjadi true,
   `DENIED / FILE_MISSING` tercatat, halaman tidak tersedia tampil

Ditambah dua pemeriksaan wajib dari `ai-workflow-rules.md`: antarmuka
diperiksa di mode terang dan gelap, dan halaman publik diperiksa di lebar
ponsel.

## Perubahan file konteks

Seluruhnya dilakukan di dalam perubahan yang sama dengan kode yang
menuntutnya, bukan sesudahnya.

- **`architecture.md`** — `NEEDS_LOGIN` merender layar masuk (U4-4);
  bentuk gerbang sebagai route handler beserta route anaknya (U4-6);
  tabel `RateLimitCounter` dan aturan kenaikan sesudah evaluasi (U4-5);
  `lib/ratelimit/` di System Boundaries; rumusan invarian 3 yang kini
  mengenal dua kueri sisi server; aturan kegagalan pencatatan untuk kedua
  jenis peristiwa (U4-7)
- **`ui-context.md`** — kalimat halaman galat pencatatan di Empty and
  Error States (U4-8), dan bentuk layar masuk
- **`code-standards.md`** — `lib/ratelimit/` di File Organization; aturan
  kegagalan `PAGE_VIEW` di Audit Logging
- **`project-overview.md`** — Alur Pengunjung langkah 2 dan 5 disesuaikan
  dengan layar masuk yang menyebut item
- **`progress-tracker.md`** — keputusan U4-4 sampai U4-9 di Architecture
  Decisions, dan Next Up yang diarahkan ke Unit 5

`.impeccable/surfaces/app-public-g-slug.md` dibiarkan apa adanya. Ia
brief, bukan file konteks.

## Invarian yang dijaga langkah ini

Dari keempat belas invarian `architecture.md`, langkah ini menyentuh
tujuh:

1. **Setiap jalur menuju konten memanggil `evaluate-access.ts`** —
   gerbang, halaman group, dan layar masuk gerbang, seluruhnya
2. **`AccessLog` ditulis di server dan selesai sebelum penerusan** —
   satu berkas yang menulisnya, `await` sebelum 302 dan sebelum aliran
   byte
3. **`fileKey` dan URL Blob tidak pernah sampai ke peramban** — select
   halaman publik tanpa keduanya, ditegakkan pengujian batas
4. **Halaman publik tidak merujuk group lain** — kuerinya berangkat dari
   satu slug dan tidak pernah menyebut group kedua
6. **Item tidak pernah lebih permisif daripada group induknya** — sudah
   menjadi struktur kode di `evaluateItemAccess()`
8. **Hanya `lib/storage/` yang mengimpor SDK Blob** — `getFileStream()`
   ditambahkan di sana
9. **Seluruh input eksternal divalidasi Zod** — parameter route gerbang
   divalidasi sebelum menyentuh basis data
