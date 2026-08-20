# Unit 1 — Fondasi dan Autentikasi

Spesifikasi hasil sesi brainstorming, 20 Agustus 2026.

Dokumen ini bukan perancangan ulang produk. Enam file di `context/`
adalah kebenaran; yang dilakukan di sini hanyalah mengubah spesifikasi
yang sudah ada menjadi keputusan implementasi yang cukup tajam untuk
ditulis sebagai rencana.

---

## Tujuan

Pemilik dapat masuk dengan Google dan melihat dashboard kosong. Orang
lain yang masuk ditolak masuk dashboard.

## Lingkup

**Di dalam lingkup.** Next.js 15 App Router dengan TypeScript strict dan
Tailwind; shadcn/ui dengan dua puluh komponen yang disebut
`ui-context.md`; `prisma/schema.prisma` lengkap termasuk `AccessRequest`
dan ketiga nilai `accessMode`; migrasi pertama ke Neon; Auth.js v5
provider Google dengan adapter Prisma; penentuan peran `OWNER` dari
`OWNER_EMAIL`; layout `app/(dashboard)/` yang menolak selain pemilik;
sebelas token warna di `app/globals.css` dalam blok `:root` dan `.dark`;
landasan pengujian Vitest; empat gerbang di `package.json`.

**Di luar lingkup.** `evaluateAccess()` dan matriksnya (Unit 4). CRUD
group (Unit 2). Item dan unggahan (Unit 3). Tabel rate limit (Unit 4,
lihat K7). Seluruh antarmuka dashboard di luar kerangka kosong.

---

## Keputusan

### K1 — Peran diturunkan ulang setiap kali sesi dibaca

Callback `session` Auth.js membandingkan `user.email` dengan
`env.OWNER_EMAIL` dan menghasilkan `OWNER` atau `VIEWER`. Kolom
`User.role` tetap ada sesuai `architecture.md` dan disegarkan lewat
`events.signIn` agar dapat di-query, tetapi **bukan** dia yang
menentukan keputusan.

*Alasan.* Kolom yang ditulis sekali saat baris `User` dibuat akan basi.
Bila pemilik masuk sebelum `OWNER_EMAIL` benar, barisnya terlanjur
`VIEWER` dan satu-satunya jalan keluar adalah menyunting database
langsung — padahal `project-overview.md` menegaskan tidak ada antarmuka
untuk mengubah peran. Menurunkannya ulang membuat kesalahan konfigurasi
sembuh sendiri pada permintaan berikutnya. Biayanya nol: baris `User`
sudah diambil oleh database session.

### K2 — Non-pemilik dialihkan ke halaman penjelasan

Layout `app/(dashboard)/layout.tsx`:

| Keadaan sesi | Tindakan |
| ------------ | -------- |
| Tidak ada sesi | `redirect()` ke Google, `callbackUrl` kembali ke URL semula |
| Ada sesi, peran bukan `OWNER` | `redirect("/akses-ditolak")` |
| Peran `OWNER` | render dashboard |

`app/akses-ditolak/page.tsx` menampilkan alamat email yang sedang masuk
dan tombol keluar.

*Alasan memilih halaman penjelasan, bukan 404.* `/dashboard` adalah rute
yang dapat ditebak siapa pun dan bukan rahasia yang dijaga aplikasi ini —
yang dijaga adalah slug group dan URL item. Menyembunyikannya tidak
menambah keamanan, sementara biaya diagnostiknya nyata: bila
`OWNER_EMAIL` salah ketik atau pemilik tanpa sadar masuk dengan akun
Google lain, layar inilah satu-satunya yang menyebutkan penyebabnya.

*Alasan memakai `redirect()`, bukan merender pesan dari layout.* Layout
yang sekadar tidak merender `children` tetap menyisakan kemungkinan kode
halaman dashboard dijalankan lebih dulu di server. Invarian 5 menuntut
kepastian, bukan kemungkinan.

### K3 — Validasi lingkungan gagal saat impor, melewati fase build

`lib/env.ts` mengawali dengan `import "server-only"`, memvalidasi
`process.env` dengan skema Zod saat modul diimpor, dan mengekspor objek
bertipe. Galatnya menyebut nama variabel yang bermasalah dalam Bahasa
Indonesia.

Fase build Next.js dikenali dari `process.env.NEXT_PHASE` lalu
dilewati — tidak ada saklar manual yang dapat disalahpakai, dan tidak
ada permintaan yang dilayani selama build.

*Alasan `server-only`.* Ia menegakkan aturan "tidak ada rahasia
berawalan `NEXT_PUBLIC_`" secara mekanis: berkas ini gagal dikompilasi
bila ada kode klien yang mengimpornya. Disiplin manusia tidak diperlukan.

**`BLOB_READ_WRITE_TOKEN` wajib hanya ketika `process.env.VERCEL` tidak
ada.** Menurut `architecture.md` dan tabel variabel Fase 11 di
`ROADMAP.md`, variabel ini hanya dipasang di mesin lokal; di atas Vercel
autentikasi Blob memakai OIDC dan variabelnya sengaja tidak ada.
Menandainya wajib tanpa syarat akan membuat aplikasi mati saat start di
produksi. Sepuluh variabel lainnya wajib di mana pun.

### K4 — Vitest

Berjalan langsung dengan TypeScript dan ESM tanpa lapisan transformasi
tambahan, dan cepat — penting karena matriks izin akan dijalankan
berulang kali di Unit 4 dan Unit 7.

### K5 — `evaluateAccess()` menerima tipe sempit, bukan tipe Prisma

`lib/access/types.ts` mendefinisikan hanya kolom yang benar-benar
menentukan keputusan izin. Untuk `Item` hanya `id`, `groupId`,
`isActive`, dan `accessMode`.

*Alasan.* `targetUrl` dan `fileKey` menjadi berada di luar jangkauan
fungsi itu, sehingga aturan izin yang mengintip URL tujuan menjadi
**mustahil ditulis**, bukan sekadar dilarang. Fixture uji juga menyusut
dari belasan kolom menjadi empat, dan menambah kolom pada `Item` tidak
lagi menyentuh lapisan izin.

**Berkasnya ditulis di Unit 4**, bersama fungsinya — bukan di Unit 1.
Lingkup Unit 1 tidak memuat `lib/access/`, dan `ai-workflow-rules.md`
melarang menggabungkan batas sistem yang tidak berhubungan dalam satu
langkah implementasi. Yang dikerjakan sekarang hanyalah mencatat
keputusannya, supaya Unit 4 tidak membukanya kembali dari nol.

### K6 — `AccessLog` tanpa relasi foreign key

`AccessLog.groupId`, `itemId`, dan `userId` disimpan sebagai `String`
biasa, tanpa relasi Prisma dan tanpa constraint foreign key.

*Alasan.* Dua aturan di `architecture.md` saling menekan.
`code-standards.md` menyatakan menghapus group menghapus seluruh item dan
berkasnya, sementara **baris `AccessLog` tetap disimpan**. Sekaligus
`AccessLog.groupId` bertanda "Selalu terisi" — tidak boleh null. Dengan
foreign key hanya ada dua hasil: cascade ikut menghapus riwayatnya, atau
constraint memblokir penghapusan group. Keduanya melanggar aturan itu.

Ini sejalan dengan alasan yang sudah tertulis di dokumen yang sama: nama
dan email pun disalin ke baris log, bukan dirujuk, agar riwayat tetap
utuh meskipun data pengguna berubah atau dihapus. Riwayat adalah catatan
peristiwa, bukan pandangan atas keadaan sekarang.

`AccessRequest` sebaliknya tetap cascade dari `Item` dan `Group`, karena
ia memang keadaan, bukan riwayat.

### K7 — Tabel rate limit ditunda ke Unit 4

*Alasan.* GATE "skema lengkap sejak Unit 1" ada untuk mencegah migrasi
belakangan menyentuh tabel yang sudah berisi data produksi — risiko yang
melekat pada penambahan kolom atau nilai enum, seperti `APPROVAL` pada
`Item`. Membuat tabel yang sama sekali baru tidak memikul risiko itu.

Bentuknya juga belum terdefinisi di file konteks mana pun:
`architecture.md` menyebut "penghitung di Postgres per IP" di tabel Stack
dan di Storage Model, tetapi bagian Data Model tidak pernah
mendefinisikan tabelnya. Merancangnya sekarang berarti mengarang
spesifikasi yang belum ada.

### K8 — `--accent-foreground` diganti nama menjadi `--accent-on`

Perubahan pada `ui-context.md`, satu baris tabel, nilai palet tidak
berubah.

*Alasan.* Nama itu ada di kedua sistem dengan arti yang berbeda. Di
`ui-context.md` ia berarti teks di atas aksen biru (`#FFFFFF` terang). Di
shadcn/ui ia berarti teks di atas permukaan hover abu, yang seharusnya
`#0F172A`. Satu nama properti CSS tidak dapat bernilai dua hal dalam
scope yang sama.

Akibat konkret bila dibiarkan: setiap tombol `ghost` dan setiap baris
`dropdown-menu` yang di-hover menampilkan teks putih di atas latar abu
muda — praktis tidak terbaca. Ini tidak tertangkap `tsc` maupun
`npm run build`; baru ketahuan saat ada yang mengarahkan kursor ke menu.

Yang dikomitmenkan D6 adalah paletnya, bukan ejaan nama variabelnya.

### K9 — Perbandingan email dinormalkan sebelum dibandingkan

`resolveRole()` memangkas spasi di kedua ujung dan menyamakan huruf
besar-kecil sebelum membandingkan. Cocok berarti `OWNER`; selain itu —
termasuk sesi kosong dan email kosong — `VIEWER`.

*Alasan.* `OWNER_EMAIL` diketik tangan ke `.env.local`, sedangkan
alamatnya datang dari Google. Beda satu huruf kapital atau satu spasi
tersalin mengunci pemilik di luar dashboardnya sendiri, dan
`project-overview.md` menegaskan tidak ada antarmuka untuk mengubah
peran — jalan keluarnya hanya menyunting database langsung.

Ini tidak melonggarkan keamanan. Google menormalkan alamatnya sendiri dan
tidak pernah menerbitkan dua akun yang hanya berbeda huruf besar-kecil,
jadi tidak ada alamat lain yang bisa cocok karenanya. Sikap "keadaan
tidak pasti berarti menolak" tetap utuh: yang tidak cocok tetap `VIEWER`.

---

## Arsitektur

### Token warna — tiga lapis di `app/globals.css`

```
:root / .dark     sebelas token Kumpulink — nilai heksadesimal sebenarnya
      ↓
alias shadcn      --card: var(--bg-surface), --primary: var(--accent-primary), …
      ↓
@theme inline     mendaftarkan keduanya menjadi utility Tailwind
```

Nilai warna hanya ditulis sekali, di lapisan paling atas. Mengubah palet
berarti menyunting satu blok, dan `components/ui/*` tetap tidak
tersentuh — sesuai daftar Protected Files.

Pemetaan sepuluh token lainnya bersih. Hanya `--accent-foreground` yang
bertabrakan; lihat K8.

### Mode gelap

Kelas `.dark` pada `<html>`, bukan `prefers-color-scheme` langsung,
karena tombol manual harus dapat menang atas setelan sistem. Tailwind v4
tidak menyediakan ini secara bawaan, jadi ditambahkan:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

Satu skrip kecil berjalan di `<head>` **sebelum halaman dilukis**: baca
`localStorage`, bila kosong ikuti `matchMedia`. Tanpa itu ada kedipan
putih sesaat sebelum tema gelap terpasang. Konsekuensinya `<html>` perlu
`suppressHydrationWarning`, karena kelasnya sudah berubah sebelum React
hidrasi.

Font Inter dan JetBrains Mono lewat `next/font`, diekspos sebagai
`--font-sans` dan `--font-mono`.

### Autentikasi

```
lib/auth/config.ts     konfigurasi Auth.js — provider, adapter, callback
lib/auth/index.ts      ekspor { handlers, auth, signIn, signOut }
lib/auth/role.ts       resolveRole(email, ownerEmail) — fungsi murni
lib/auth/session.ts    getSession(), requireOwner()
types/next-auth.d.ts   menambahkan id dan role ke tipe Session
```

Strategi sesi **database**, bukan JWT. Ini bukan pilihan yang diambil di
sesi ini melainkan yang sudah ditetapkan `architecture.md`, yang menyebut
tabel `Session` eksplisit sebagai bagian skema.

`resolveRole()` berdiri terpisah dari Auth.js supaya penentuan peran
dapat diuji tanpa menyalakan Next.js, tanpa sesi, dan tanpa database.

### Skema Prisma

Sembilan enum: `Role`, `Visibility`, `ItemType`, `ItemSource`,
`AccessMode`, `RequestStatus`, `EventType`, `Outcome`, `DenyReason`.

Delapan model: `User`, `Account`, `Session`, `VerificationToken`,
`Group`, `Item`, `AccessRequest`, `AccessLog`.

Seluruh kolom, indeks, nilai bawaan, dan kunci unik disalin apa adanya
dari bagian Data Model `architecture.md`. Yang tidak dapat disalin mentah
dan sudah diputuskan di sini: relasi `AccessLog` (K6) dan ketiadaan tabel
rate limit (K7).

Migrasi pertama dijalankan lewat `DIRECT_URL`, bukan `DATABASE_URL` —
migrasi Prisma menuntut koneksi langsung, dan menjalankannya lewat
koneksi ter-pool menghasilkan galat yang tidak menyebut penyebab
sebenarnya.

### Pengujian

Vitest dengan pola tabel `it.each`, dipakai sejak sekarang supaya Unit 4
tinggal menambah baris matriks ke bentuk yang sudah terbukti jalan.

Yang diuji di Unit 1:

- `resolveRole()` — email yang cocok `OWNER_EMAIL` menghasilkan `OWNER`,
  yang tidak cocok menghasilkan `VIEWER`, dan sesi kosong menghasilkan
  `VIEWER`. Kasus uji mencakup beda huruf besar-kecil dan spasi di ujung,
  keduanya harus tetap dikenali sebagai pemilik (K9)
- skema env — nilai sah lolos; yang kosong ditolak dengan pesan yang
  menyebut nama variabelnya; `BLOB_READ_WRITE_TOKEN` opsional ketika
  `VERCEL` ada dan wajib ketika tidak

### Empat gerbang

`npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.
Keempatnya dipasang di Unit 1 karena P1.4 menuntutnya sebagai gerbang
penutup setiap unit sesudahnya, dan gerbang yang tidak dapat dijalankan
bukan gerbang.

---

## Perubahan yang wajib masuk ke file konteks

Sesuai aturan Keeping Docs in Sync di `ai-workflow-rules.md`, dikerjakan
**di dalam Unit 1**, bukan ditunda:

| # | Perubahan | File |
| - | --------- | ---- |
| 1 | `--accent-foreground` → `--accent-on` pada kedua tabel warna (K8) | `context/ui-context.md` |
| 2 | Catat bahwa `AccessLog` menyimpan `groupId`, `itemId`, `userId` tanpa foreign key, beserta alasannya (K6) | `context/architecture.md` |
| 3 | Catat bahwa tabel rate limit didefinisikan di Unit 4, bukan Unit 1 (K7) | `context/architecture.md` |
| 4 | Catat Vitest sebagai kerangka pengujian (K4) | `context/code-standards.md` |
| 5 | Catat bahwa peran diturunkan di callback `session`, dan kolom `role` bukan sumber kebenaran (K1) | `context/architecture.md` |
| 6 | Catat `/` mengalihkan ke `/dashboard`, dan `/akses-ditolak` sebagai rute non-pemilik (K2) | `context/architecture.md` |
| 7 | Ganti frasa peran diberikan bila email **"sama persis"** dengan `OWNER_EMAIL`, menjadi cocok setelah dinormalkan huruf besar-kecil dan spasi ujungnya (K9) | `context/architecture.md` |

---

## Kriteria selesai

Dari `ROADMAP.md` Fase 1, ditambah yang muncul dari keputusan di atas:

- [ ] Pemilik masuk dengan Google → `/dashboard` terbuka
- [ ] Akun lain masuk → mendarat di `/akses-ditolak`, melihat alamat
      emailnya sendiri dan tombol keluar
- [ ] Belum masuk membuka `/dashboard` → dialihkan ke Google, lalu
      kembali ke `/dashboard`, bukan ke halaman depan
- [ ] `role` terhitung dari `OWNER_EMAIL` dan tidak dapat diubah lewat
      antarmuka
- [ ] Mengubah `OWNER_EMAIL` lalu **menjalankan ulang server** mengubah
      peran tanpa menyentuh database dan tanpa perlu keluar-masuk. Bukan
      sekadar muat ulang halaman — `lib/env.ts` membaca `process.env`
      saat modul diimpor, jadi nilainya baru terbaca setelah proses
      dijalankan ulang. Di produksi itu berarti deploy ulang
- [ ] Migrasi pertama terpasang; seluruh tabel dan enum ada di Neon
- [ ] `DATABASE_URL` dan `DIRECT_URL` terbukti dapat dihubungi — ini
      sekaligus menutup dua butir terakhir daftar periksa Fase 0
- [ ] `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`
      keempatnya lulus
- [ ] Mode terang dan gelap berjalan, token dibaca dari CSS custom
      property, tidak ada heksadesimal di komponen
- [ ] Tombol `ghost` dan `dropdown-menu` terbaca saat di-hover di kedua
      mode — pemeriksaan khusus untuk K8
- [ ] Aplikasi menolak start ketika satu variabel lingkungan dikosongkan,
      dengan pesan yang menyebut nama variabelnya
- [ ] Keenam perubahan file konteks di atas selesai
- [ ] `context/progress-tracker.md` diperbarui
