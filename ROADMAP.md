# Kumpulink — Roadmap Rilis

Dari keadaan sekarang (perencanaan selesai, implementasi belum dimulai)
sampai aplikasi berjalan di produksi dan dipakai pada acara pertama.

Disusun 19 Agustus 2026, mengacu pada enam file konteks di
`kumpulink-app/context/` dan `kumpulink-app/CLAUDE.md`.

---

## Cara membaca dokumen ini

Roadmap ini **berbasis milestone, bukan tanggal**. Setiap fase punya
kriteria selesai yang dapat diperiksa, bukan durasi yang dijanjikan.
Estimasi sesi hanya alat kalibrasi — satu "sesi" berarti satu sesi kerja
Claude Code yang terfokus, bukan satuan waktu.

Pasangannya adalah `PROMPT-PLAYBOOK.md`, yang memuat prompt siap salin
untuk setiap fase di bawah ini. Roadmap menjawab *apa dan kapan*;
playbook menjawab *apa yang diketik*.

Tiga tingkat penanda dipakai di dokumen ini:

| Penanda | Arti |
| ------- | ---- |
| **GATE** | Tidak boleh dilewati. Fase berikutnya diblokir sampai ini selesai. |
| **CEK** | Butir verifikasi. Harus dijalankan dan hasilnya dibaca, bukan diasumsikan. |
| **RISIKO** | Hal yang diketahui dapat menggagalkan fase ini. |

---

## Ringkasan jalur rilis

| Fase | Nama | Unit | Skill utama | Estimasi |
| ---- | ---- | ---- | ----------- | -------- |
| 0 | Keputusan dan prasyarat layanan | — | — | 1 sesi + waktu tunggu DNS |
| 1 | Fondasi dan autentikasi | Unit 1 | superpowers (penuh) | 2–3 sesi |
| 2 | Arah desain | — | impeccable init → shape → new-work | 1–2 sesi |
| 3 | CMS group | Unit 2 | superpowers + impeccable | 2 sesi |
| 4 | Item dan unggahan | Unit 3 | superpowers + impeccable | 3 sesi |
| 5 | Gerbang akses dan halaman publik | Unit 4 | superpowers (TDD ketat) | 4–5 sesi |
| 6 | Berbagi, kedaluwarsa, QR | Unit 5 | superpowers + impeccable | 2 sesi |
| 7 | Riwayat akses | Unit 6 | superpowers + impeccable | 2 sesi |
| 8 | Permintaan dan persetujuan | Unit 7 | superpowers (4 langkah terpisah) | 5–6 sesi |
| 9 | Pengerasan pra-rilis | — | impeccable harden/audit/polish + review | 2–3 sesi |
| 10 | Preview deploy dan uji lingkungan nyata | — | verification-before-completion | 1–2 sesi |
| 11 | Rilis produksi | — | finishing-a-development-branch | 1 sesi |
| 12 | Pasca-rilis | — | — | berkelanjutan |

Fase 1 sampai 8 mengikuti urutan tujuh unit di
`context/ai-workflow-rules.md` tanpa perubahan. Fase 2 disisipkan di
antara Unit 1 dan Unit 2 karena itulah titik terakhir sebelum antarmuka
sungguhan mulai ditulis.

---

## Temuan platform yang mengubah rencana

Tiga hal diperiksa ulang terhadap dokumentasi vendor pada Agustus 2026
dan hasilnya berbeda dari yang diasumsikan di file konteks. Semuanya
menyentuh jalur rilis, jadi ditaruh di depan.

### 1. Vercel Cron pada paket Hobby hanya berjalan sekali sehari

`context/architecture.md` menetapkan Vercel Cron **setiap lima menit**
untuk mengirim email ringkasan permintaan yang tertahan jeda. Paket
Hobby membatasi cron ke **satu kali per hari**, dan ekspresi cron yang
lebih sering **gagal saat deployment**, bukan gagal diam-diam saat
berjalan. Interval satu menit baru tersedia di paket Pro.

Akibatnya: kriteria sukses nomor 10 ("tiga puluh pengunjung dalam satu
menit menghasilkan paling banyak satu email dalam sepuluh menit
pertama") tidak dapat dipenuhi di Hobby dengan Vercel Cron. Lihat
keputusan **D5**.

### 2. Vercel Blob privat butuh *private store*, bukan sekadar setelan unggah

Akses privat sudah tersedia umum, tetapi bentuknya berbeda dari yang
tersirat di file konteks:

- Akses ditentukan **di tingkat store, bukan per berkas**. Store harus
  dibuat privat sejak awal
  (`vercel blob create-store <nama> --access private`). Perlakukan ini
  sebagai keputusan sekali jalan: rencanakan pemindahan berkas bila
  ternyata store terlanjur dibuat publik.
- Butuh `@vercel/blob` versi 2.3 atau lebih baru.
- Unggah memakai `put(path, file, { access: 'private' })`.
- Baca memakai `get(pathname, { access: 'private' })`, yang
  mengembalikan objek berisi `stream`, `blob.contentType`, `blob.etag`,
  dan `statusCode`.
- Di atas Vercel, autentikasi memakai OIDC secara bawaan; store perlu
  dihubungkan ke proyek agar `BLOB_STORE_ID` terpasang otomatis.
  `BLOB_READ_WRITE_TOKEN` dipakai untuk kode yang berjalan di luar
  Vercel — termasuk mesin pengembangan lokal.

Dokumentasi Vercel juga menyarankan hal yang kebetulan sama persis
dengan invarian Kumpulink: **verifikasi izin di dalam route handler,
tepat di sebelah panggilan `get()`, bukan di middleware**, dan jangan
menaruh respons blob privat di cache CDN.

Akibatnya untuk `lib/storage/`: `getFileStream` membungkus `get()`,
bukan menyusun URL. Header respons gerbang item memakai
`Cache-Control: private, no-cache` dan `X-Content-Type-Options: nosniff`
di samping `Content-Disposition: inline` yang sudah ditetapkan.

### 3. Aplikasi OAuth Google berstatus *Testing* dibatasi 100 pengguna

Selama status publikasi masih *Testing*, aplikasi hanya dapat dipakai
oleh pengguna yang didaftarkan sebagai penguji, dengan batas 100 orang,
dan setiap orang melihat layar peringatan aplikasi belum terverifikasi.

`context/project-overview.md` menyebut satu acara dengan dua ratus
peserta sebagai pola pemakaian yang diharapkan. Batas ini karena itu
bukan detail administratif — ini penghalang rilis. Lihat keputusan
**D8**.

---

## GATE — Keputusan yang harus diambil

Semua pertanyaan terbuka di `context/progress-tracker.md` ada di sini,
ditambah tiga yang muncul dari temuan di atas. Kolom "paling lambat"
menyebut fase yang tidak dapat diselesaikan tanpa jawabannya.

| # | Keputusan | Pilihan | Rekomendasi | Paling lambat |
| - | --------- | ------- | ----------- | ------------- |
| **D1** | Domain produksi | Domain kustom · subdomain `*.vercel.app` | Tetapkan domain kustom sekarang bila akan dipakai; mengganti domain belakangan berarti mendaftarkan ulang redirect URI di Google dan mencetak ulang setiap QR yang sudah beredar | Fase 6 (QR) |
| **D2** | Zona waktu tampilan riwayat | Tetap Asia/Jayapura · mengikuti perangkat pembaca | Tetap Asia/Jayapura, dengan label zona waktu tertulis di antarmuka. Riwayat akses dipakai untuk mempertanggungjawabkan kejadian; dua orang yang membaca baris yang sama harus membaca jam yang sama | Fase 7 |
| **D3** | Domain pengirim email dan alamat notifikasi pemilik | Domain kustom terverifikasi di Resend · domain uji `resend.dev` | Domain kustom. Domain uji Resend hanya dapat mengirim ke alamat pemilik sendiri, sedangkan email keputusan **harus sampai ke pemohon** — orang lain. Domain uji cukup untuk pengembangan, tidak cukup untuk rilis | Fase 8 langkah 4 |
| **D4** | Masa simpan `AccessLog` | Selamanya · retensi N bulan | Tetapkan angkanya sebelum rilis; implementasi pemangkasan boleh menyusul di Fase 12. Yang penting sekarang adalah kebijakannya tertulis, bukan kodenya jalan | Fase 11 (tertulis) |
| **D5** | Mekanisme cron lima menit | Vercel Pro · GitHub Actions terjadwal · layanan cron pihak ketiga | GitHub Actions bila belum ingin berlangganan: satu workflow `schedule` memanggil endpoint cron dengan header `CRON_SECRET`, dan endpoint-nya tetap sama persis. Vercel Pro bila ingin satu vendor dan presisi per menit. Apa pun pilihannya, `vercel.json` **tidak boleh** memuat ekspresi cron di bawah sekali sehari selama proyek masih di Hobby — deployment akan ditolak | Fase 8 langkah 4 |
| **D6** | Kewenangan `ui-context.md` terhadap impeccable | Mengikat, impeccable memperluas · bebas, impeccable boleh mengganti dunia visual | **Mengikat.** Token warna, Inter/JetBrains Mono, skala radius, mobile-first, dan seluruh anatomi kartu item di `ui-context.md` diperlakukan sebagai *brand commitment* yang dicatat di PRODUCT.md. impeccable memperluas sistem itu ke komposisi, hierarki, keadaan, dan gerak — bukan menggantinya. Bila memilih "bebas", `ui-context.md` harus ditulis ulang dari hasil build di akhir Fase 2, bukan dibiarkan berbeda dari kode | Fase 2 |
| **D7** | Jalur build impeccable | comp-led (gambar dulu) · code-led (kode langsung) | **code-led.** Kedua permukaan bermode Operate dengan token yang sudah dipatok dan banyak keadaan (tujuh keadaan izin pada kartu item saja). Ambisinya dititipkan ke *direction contract* dan diaudit di finish review, bukan ke satu gambar viewport pertama | Fase 2 |
| **D8** | Status publikasi aplikasi OAuth Google | Testing · In production | **In production**, dilakukan di Fase 0 dan diverifikasi ulang di Fase 10. Dengan hanya `openid`, `email`, dan `profile` — seluruhnya cakupan tidak sensitif — proses peninjauan penuh umumnya tidak berlaku, tetapi **ini wajib dipastikan sendiri di konsol sebelum acara pertama**, bukan diasumsikan | Fase 11 |

Cara memakai tabel ini di sesi Claude Code ada di bagian **Fase 0** pada
`PROMPT-PLAYBOOK.md`. Jawaban setiap keputusan ditulis ke
`context/progress-tracker.md` pada bagian *Open Questions*, dipindahkan
dari pertanyaan menjadi keputusan beserta alasannya.

---

## Fase 0 — Keputusan dan prasyarat layanan

**Tujuan.** Menghabiskan seluruh hal yang butuh waktu tunggu di luar
kendali (verifikasi DNS, propagasi, konsol pihak ketiga) sebelum satu
baris kode ditulis, sehingga tidak ada fase implementasi yang berhenti
menunggu.

**Keluaran.**

1. Delapan keputusan D1–D8 terjawab dan tertulis di
   `context/progress-tracker.md`.
2. Repositori Git terinisialisasi, `main` dilindungi sebagai cabang
   integrasi, `.gitignore` memuat `.env*`.
3. Akun dan sumber daya berikut sudah ada:

| Layanan | Yang dibuat | Menghasilkan |
| ------- | ----------- | ------------ |
| Google Cloud Console | Proyek, OAuth consent screen, OAuth 2.0 Client ID (Web) | `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` |
| Neon | Proyek Postgres, satu database | `DATABASE_URL` (pooled), `DIRECT_URL` (non-pooled) |
| Vercel | Proyek, **private Blob store** | `BLOB_READ_WRITE_TOKEN`, `BLOB_STORE_ID` |
| Resend | Domain terverifikasi (SPF + DKIM), API key | `RESEND_API_KEY`, `EMAIL_FROM` |
| — | Rahasia acak dibuat lokal | `AUTH_SECRET`, `CRON_SECRET` |

4. `.env.example` berisi seluruh nama variabel tanpa nilai;
   `.env.local` berisi nilainya dan tidak masuk Git.

**GATE — Redirect URI Google.** Daftarkan keduanya sekaligus sekarang,
bukan satu per satu saat dibutuhkan:

```
http://localhost:3000/api/auth/callback/google
https://<domain-produksi>/api/auth/callback/google
```

**GATE — Status publikasi OAuth.** Ubah dari *Testing* ke *In
production* (D8). Selama masih *Testing*, batas 100 pengguna berlaku dan
setiap peserta acara melihat layar peringatan.

**RISIKO — Deployment preview dan OAuth.** Setiap deployment preview di
Vercel mendapat URL unik, sedangkan Google hanya menerima redirect URI
yang terdaftar persis. Masuk dengan Google **tidak akan berfungsi di URL
preview acak**. Tetapkan satu domain preview stabil (alias cabang, mis.
`kumpulink-preview.vercel.app`) dan daftarkan redirect URI-nya juga,
atau terima bahwa uji autentikasi hanya dilakukan di lokal dan produksi.

**RISIKO — `DIRECT_URL` tidak ada di daftar variabel.**
`context/progress-tracker.md` mencantumkan sembilan variabel dan
`DIRECT_URL` bukan salah satunya. Neon menyajikan koneksi ter-pool, dan
migrasi Prisma memerlukan koneksi langsung. Tambahkan `DIRECT_URL` dan
`BLOB_STORE_ID` ke daftar variabel di `progress-tracker.md` sebagai
bagian dari fase ini.

**CEK sebelum lanjut.**

- [ ] D1–D8 terjawab dan tertulis, masing-masing dengan alasannya
- [ ] `psql`/Prisma dapat terhubung ke Neon dari mesin lokal
- [ ] Blob store berstatus **private**, bukan public
- [ ] Domain pengirim berstatus *verified* di Resend
- [ ] Status OAuth = *In production*
- [ ] `.env.local` lengkap, `.env.example` lengkap tanpa nilai
- [ ] `git status` bersih dan `.env*` benar-benar terabaikan

---

## Fase 1 — Fondasi dan autentikasi (Unit 1)

**Tujuan.** Pemilik dapat masuk dengan Google dan melihat dashboard
kosong. Orang lain yang masuk ditolak masuk dashboard.

**Lingkup.** Next.js 15 App Router + TypeScript strict + Tailwind;
shadcn/ui dengan dua puluh komponen yang disebut di `ui-context.md`;
`prisma/schema.prisma` **lengkap** termasuk `AccessRequest` dan ketiga
nilai `accessMode`; migrasi pertama; Auth.js v5 provider Google dengan
adapter Prisma; penentuan peran `OWNER` dari `OWNER_EMAIL`; layout
`app/(dashboard)/` yang menolak selain pemilik; token warna di
`app/globals.css` dalam blok `:root` dan `.dark`.

**Skill.** Rangkaian penuh superpowers: `brainstorming` (memvalidasi
spesifikasi yang sudah ada, bukan mengarang ulang) → `writing-plans` →
`using-git-worktrees` → `subagent-driven-development` (TDD di setiap
task) → `requesting-code-review` → `verification-before-completion` →
`finishing-a-development-branch`.

**GATE — Skema ditulis lengkap sejak sekarang.** `AccessRequest` dan
nilai `APPROVAL` masuk ke skema di fase ini meski fiturnya baru
dikerjakan di Fase 8. Ini keputusan arsitektur yang sudah diambil
(`progress-tracker.md`, "Keadaan setengah jadi bersikap menolak") — agar
migrasi tidak menyentuh tabel yang sudah berisi data produksi.

**Exit criteria.**

- [ ] Pemilik masuk dengan Google → `/dashboard` terbuka
- [ ] Akun lain masuk → ditolak masuk `/dashboard`
- [ ] `role` terhitung dari `OWNER_EMAIL`, tidak dapat diubah lewat antarmuka
- [ ] Migrasi pertama terpasang, seluruh tabel dan enum ada di Neon
- [ ] `npx tsc --noEmit` bersih, `npm run build` lulus
- [ ] Mode terang dan gelap berjalan, token dibaca dari CSS custom property
- [ ] `context/progress-tracker.md` diperbarui

---

## Fase 2 — Arah desain (impeccable)

**Tujuan.** Memutuskan arah desain untuk dua permukaan sekaligus,
sebelum antarmuka sungguhan mulai ditulis di Fase 3.

**Kenapa di sini.** Sebelum Fase 1, `context.mjs` belum punya apa-apa
untuk dipindai. Setelah Fase 3, keputusan desain akan diambil
sepotong-sepotong sambil menulis komponen — dan itu cara paling andal
menghasilkan dua permukaan yang terasa dibuat oleh dua orang berbeda.

**Urutan perintah.**

1. `/impeccable init` — menulis `PRODUCT.md` dari
   `context/project-overview.md`, `architecture.md`, dan `ui-context.md`.
   Seluruh komitmen visual di `ui-context.md` masuk sebagai **Brand
   Commitments** (D6). Platform: `web`. `buildPath`: sesuai D7.
2. `/impeccable shape halaman group publik` — permukaan paling berisiko
   dan paling sering dilihat. Mode: **Operate**. Menghasilkan brief,
   belum kode.
3. `/impeccable shape dashboard pemilik` — mode **Operate**. Brief
   kedua.
4. Alur **new-work** dijalankan dari dalam `shape` untuk menetapkan
   komposisi dan konsep permukaan, lalu berhenti sebelum implementasi.

**Dua permukaan, dua brief, satu dunia visual.** Halaman publik dan
dashboard berbagi token, tipografi, dan bahasa komponen yang sama, tetapi
brief-nya terpisah: halaman publik dibuka orang asing dari ponsel setelah
memindai QR, dashboard dibuka satu orang yang sama berulang kali di
laptop. `surface-brief.mjs` menyimpan keduanya secara terpisah.

**GATE — impeccable tidak boleh mengganti apa yang sudah diputuskan.**
Kecuali D6 dijawab "bebas", hal-hal berikut adalah masukan yang mengikat,
bukan bahan yang bisa dipertimbangkan ulang: sebelas token warna terang
dan gelap, Inter dan JetBrains Mono, skala radius, mobile-first pada
halaman publik, anatomi kartu item, tujuh keadaan kartu `APPROVAL`, dan
seluruh teks keadaan kosong yang sudah ditulis dalam Bahasa Indonesia.

**Yang justru diharapkan dari impeccable.** Komposisi dan hierarki
halaman group di lebar ponsel; bagaimana tujuh keadaan izin terbaca
tanpa membuat kartu jadi ramai; ritme akordeon dashboard saat berisi
banyak group; bentuk tabel riwayat yang berubah menjadi tumpukan kartu;
gerak yang menjelaskan perubahan keadaan, bukan menghias; dan keadaan
kosong yang sudah ditulis kalimatnya tetapi belum ditetapkan bentuknya.

**Exit criteria.**

- [ ] `PRODUCT.md` ada, memuat Brand Commitments dari `ui-context.md`
- [ ] Dua surface brief tersimpan lewat `surface-brief.mjs`
- [ ] Arah terpilih dicatat sebagai *direction contract* untuk dipasang di layout
- [ ] `.impeccable/config.json` memuat `buildPath` sesuai D7
- [ ] Tidak ada token, font, atau teks Bahasa Indonesia yang berubah tanpa persetujuan eksplisit
- [ ] Bila ada yang berubah dengan persetujuan → `context/ui-context.md` diperbarui **dalam fase ini juga**

**`DESIGN.md` sengaja belum ditulis di fase ini.** impeccable menulisnya
dari dunia visual yang sudah terbangun, bukan dari niat — rulebook yang
ditulis sebelum build berakhir dipertahankan melawan kenyataan alih-alih
menjelaskannya. Tempatnya di Fase 9, lewat `/impeccable document`.

---

## Fase 3 — CMS group (Unit 2)

**Tujuan.** Pemilik dapat membuat beberapa group, mengubah judul dan
slug, dan melihatnya sebagai daftar akordeon yang dapat dilipat.

**Lingkup.** CRUD group; penyusunan ulang; akordeon dashboard dengan
keadaan lipat disimpan di `localStorage`; pembuatan slug otomatis dari
judul; validasi keunikan slug; slug acak dari sumber acak kriptografis
(bukan `Math.random()`).

**Exit criteria.**

- [ ] Buat, ubah, hapus, dan susun ulang group berfungsi
- [ ] Slug bentrok ditolak dengan pesan Bahasa Indonesia
- [ ] Akordeon dapat dioperasikan penuh dengan papan ketik dan mengumumkan keadaannya
- [ ] Keadaan lipat bertahan setelah muat ulang halaman
- [ ] Setiap mutasi memeriksa `role === OWNER` di server
- [ ] Terang, gelap, dan lebar ponsel diperiksa
- [ ] `npm run build` lulus

---

## Fase 4 — Item dan unggahan (Unit 3)

**Tujuan.** Pemilik dapat mengisi satu group dengan ketiga tipe item,
mengunggah PDF, dan menyusun urutannya.

**Lingkup.** Item bertipe `LINK`, `PDF`, `IMAGE` dari sumber `EXTERNAL`
maupun `UPLOAD`; `lib/storage/` sebagai satu-satunya pengimpor SDK Blob;
batas 10 MB dan pemeriksaan tipe **dari isi berkas**; penyusunan ulang
dengan geser beserta alternatif tombol naik/turun; pilihan `accessMode`
dibatasi pada `OPEN` dan `IDENTITY` — `APPROVAL` belum muncul di CMS.

**GATE — bentuk `lib/storage/`.** Ditulis di atas API private store
(temuan platform 2), bukan di atas URL publik:

```ts
putFile(path, file)      → put(path, file, { access: 'private' })
getFileStream(pathname)  → get(pathname, { access: 'private' })
deleteFile(pathname)     → del(url atau pathname)
```

**RISIKO — pemeriksaan tipe berkas.** `code-standards.md` mewajibkan
tipe diperiksa dari isi berkas, bukan dari ekstensi maupun
`Content-Type` kiriman peramban. Ini berarti membaca *magic bytes*
(`%PDF-`, `\x89PNG`, `\xFF\xD8\xFF`, `RIFF....WEBP`) atau memakai
pustaka pendeteksi. Memeriksa `file.type` saja tidak memenuhi standar
ini dan akan tertangkap di review.

**Exit criteria.**

- [ ] Ketiga tipe item dapat ditambahkan dari kedua sumber
- [ ] PDF 10 MB diterima, 11 MB ditolak **di server**
- [ ] Berkas `.pdf` yang isinya bukan PDF ditolak
- [ ] `targetUrl` hanya menerima skema `http` dan `https`
- [ ] Menghapus item juga menghapus berkasnya di Blob
- [ ] Urutan dapat diubah dengan geser dan dengan papan ketik
- [ ] `APPROVAL` belum dapat dipilih di CMS
- [ ] Hanya `lib/storage/` yang mengimpor `@vercel/blob` (diverifikasi dengan pencarian di seluruh repo)

---

## Fase 5 — Gerbang akses dan halaman publik (Unit 4)

**Fase paling berisiko dalam proyek.** Di sinilah aplikasi ini menjadi
aplikasi kontrol akses, bukan kumpulan tautan.

**Tujuan.** Seluruh matriks pengujian izin lulus; halaman group publik
tampil benar untuk ketiga nilai `visibility`; item `IDENTITY`
mengalihkan ke Google lalu meneruskan ke tujuan; item `APPROVAL` ditolak
karena belum ada catatan izin; setiap akses tercatat.

**GATE — urutan kerja tidak boleh dibalik.** `evaluateAccess()` beserta
matriks pengujiannya ditulis **sebelum satu halaman pun dibuat**.
Fungsinya murni: tidak menyentuh database, tidak membaca sesi sendiri,
tidak menulis log. Catatan `AccessRequest` diberikan oleh pemanggil
sebagai argumen.

**Matriks pengujian minimum untuk fase ini.**

Tahap satu — group:

| Keadaan | Hasil |
| ------- | ----- |
| Group tidak ditemukan | `DENIED / NOT_FOUND` |
| Pemohon `OWNER`, group aktif | `GRANTED` |
| Pemohon `OWNER`, group dicabut | `GRANTED` + `ownerPreview` |
| Pemohon `OWNER`, group kedaluwarsa | `GRANTED` + `ownerPreview` |
| `shareEnabled = false` | `DENIED / REVOKED` |
| `expiresAt` sudah lewat | `DENIED / EXPIRED` |
| `visibility = PRIVATE` | `DENIED / PRIVATE` |
| `REQUIRE_LOGIN`, belum masuk | `NEEDS_LOGIN` |
| `REQUIRE_LOGIN`, sudah masuk | `GRANTED` |
| `PUBLIC`, belum masuk | `GRANTED` |

Tahap dua — item:

| Keadaan | Hasil |
| ------- | ----- |
| Item bukan milik group ini | `DENIED / NOT_FOUND` |
| `isActive = false` | `DENIED / ITEM_INACTIVE` |
| `OPEN`, belum masuk | `GRANTED` |
| `IDENTITY`, belum masuk | `NEEDS_LOGIN` |
| `IDENTITY`, sudah masuk | `GRANTED` |
| `APPROVAL`, belum masuk | `NEEDS_LOGIN` |
| `APPROVAL`, sudah masuk, tanpa catatan izin | ditolak (Fase 8 mengubahnya menjadi `NEEDS_REQUEST`) |
| `accessMode` bernilai tidak dikenal | ditolak |
| Tahap satu `DENIED` | tahap dua tidak pernah berjalan |

Baris terakhir bukan formalitas: itu invarian nomor 6 — item tidak
pernah lebih permisif daripada group induknya.

**CEK — empat pemeriksaan yang tidak bisa diganti pengujian unit.**

1. **Buka source halaman group.** Cari `targetUrl` item mana pun, cari
   host Blob, cari slug group lain. Nol kecocokan. Ini kriteria sukses
   nomor 3 dan 7, dan satu-satunya cara memeriksanya adalah membaca HTML
   yang benar-benar terkirim.
2. **Matikan JavaScript di peramban, lalu akses item `IDENTITY`.**
   Penerusan tetap terjadi dan tepat satu baris `AccessLog` tertulis.
   Ini kriteria sukses nomor 4.
3. **Buka slug yang dicabut, slug yang kedaluwarsa, dan slug yang tidak
   pernah ada.** Ketiganya harus menghasilkan kode status yang sama dan
   halaman yang sama persis. Ini kriteria sukses nomor 5.
4. **Masuk sebagai pemilik, buka group yang dicabut.** Halaman tampil
   normal dengan spanduk peringatan. Ini kriteria sukses nomor 6.

**RISIKO — log ditulis tuntas sebelum penerusan.** `await` penulisan
`AccessLog` selesai sebelum `redirect()` atau pengaliran berkas dimulai.
Menjadikannya pekerjaan latar berarti log hilang saat fungsi serverless
berhenti setelah respons terkirim. Kegagalan menulis log pada akses
`GRANTED` **membatalkan** penerusan.

**RISIKO — cache.** Setiap halaman dan gerbang di `app/(public)/`
dirender dinamis. Satu `revalidate` atau satu `generateStaticParams`
yang lolos berarti satu pengunjung menerima halaman yang dibuat untuk
sesi orang lain.

**Exit criteria.**

- [ ] Seluruh matriks di atas lulus, dijalankan tanpa database
- [ ] Empat pemeriksaan CEK di atas dilakukan dan hasilnya dicatat
- [ ] Rate limit per IP pada route gerbang berfungsi; kelebihan menghasilkan 429 dan `DENIED / RATE_LIMITED`
- [ ] `callbackUrl` mengembalikan pengunjung ke gerbang item, bukan ke halaman depan
- [ ] Berkas hilang di Blob → `isBroken = true`, `DENIED / FILE_MISSING`, halaman tidak ditemukan
- [ ] Halaman publik dapat dipakai tanpa JavaScript untuk hal pokoknya
- [ ] Halaman publik diperiksa di lebar ponsel

---

## Fase 6 — Berbagi, kedaluwarsa, dan QR (Unit 5)

**Tujuan.** Pemilik dapat mencabut link dan menyaksikan halaman
publiknya berubah menjadi halaman tidak tersedia, sementara pemilik
sendiri masih dapat membukanya dengan spanduk peringatan.

**Lingkup.** Panel Bagikan sebagai `sheet` (dari kanan di layar lebar,
dari bawah di ponsel); pengaturan `visibility`, `expiresAt`,
`shareEnabled`; penyalinan URL; QR code SVG dibuat di server dengan
paket `qrcode`; spanduk pratinjau pemilik.

**GATE — D1 harus sudah dijawab.** QR code memuat URL absolut. QR yang
dicetak dengan domain lama tidak dapat ditarik kembali dari tangan
peserta.

**Exit criteria.**

- [ ] Saklar cabut langsung mengubah halaman publik
- [ ] Tanggal kedaluwarsa berlaku tanpa tindakan tambahan
- [ ] Pemilik melihat spanduk, bukan halaman 404
- [ ] QR dapat diunduh dan **dipindai dengan ponsel sungguhan** sampai halaman terbuka
- [ ] URL yang disalin sama persis dengan yang ada di QR
- [ ] Panel Bagikan benar di layar lebar dan di ponsel

---

## Fase 7 — Tampilan riwayat akses (Unit 6)

**Tujuan.** Pemilik dapat melihat siapa mengakses item apa pada jam
berapa, dan menyaringnya.

**Lingkup.** Tabel riwayat per group; penyaringan berdasarkan item dan
rentang tanggal; paginasi; tampilan berubah menjadi tumpukan kartu di
ponsel; kolom Waktu, Nama, Email, Item, Hasil.

**GATE — D2 harus sudah dijawab.** Zona waktu tampilan ditetapkan di
fase ini dan **ditulis di antarmuka**, bukan diserahkan pada tebakan
pembaca.

**CEK.** Riwayat dibaca dari kolom `visitorName` dan `visitorEmail` di
baris log, bukan dari join ke tabel `User`. Cara memverifikasinya: ubah
nama seorang pengguna di database, lalu buka riwayat — baris lama harus
tetap menampilkan nama lama.

**Exit criteria.**

- [ ] Tabel menampilkan `PAGE_VIEW` dan `ITEM_ACCESS`
- [ ] Baris `DENIED` tampil beserta alasannya
- [ ] Penyaringan item dan rentang tanggal berfungsi
- [ ] Paginasi berfungsi pada data yang banyak
- [ ] Zona waktu tertulis di antarmuka
- [ ] Tumpukan kartu di ponsel terbaca
- [ ] Alamat IP memakai font monospasi

---

## Fase 8 — Permintaan dan persetujuan akses (Unit 7)

**Unit terbesar.** Dikerjakan dalam empat langkah terpisah, dan
**setiap langkah diverifikasi sebelum langkah berikutnya dimulai**.
Menggabungkan langkah di sini adalah cara paling cepat menghasilkan alur
izin yang tampak jalan tetapi bocor di salah satu cabangnya.

### Langkah 1 — Aturan izin lebih dulu

Perluas `evaluateAccess()` dengan cabang `APPROVAL` beserta seluruh
matriksnya. **Belum ada antarmuka apa pun di langkah ini.**

| Keadaan catatan izin | Hasil |
| -------------------- | ----- |
| Tidak ada catatan | `NEEDS_REQUEST` |
| `PENDING` | `PENDING_APPROVAL` |
| `REJECTED` | `DENIED / REQUEST_REJECTED` |
| `REVOKED` | `DENIED / REQUEST_REVOKED` |
| `APPROVED`, `expiresAt` sudah lewat | `DENIED / APPROVAL_EXPIRED` |
| `APPROVED`, masih berlaku | `GRANTED` |
| `APPROVED`, tetapi group kedaluwarsa | tetap ditolak — tahap satu berhenti lebih dulu |

- [ ] Seluruh baris lulus; `NEEDS_REQUEST` dan `PENDING_APPROVAL` bukan `DENIED`

### Langkah 2 — Sisi pemohon

Halaman pengajuan, halaman menunggu, halaman ditolak; kartu item bermode
persetujuan dengan tujuh keadaan; tombol ajukan sekaligus;
`lib/requests/` untuk pembuatan permintaan. **Belum ada email.**

- [ ] Tujuh keadaan kartu di `ui-context.md` semuanya dapat dimunculkan
- [ ] Dialog pengajuan menampilkan nama dan email yang akan terkirim, apa adanya
- [ ] Keperluan dibatasi 300 karakter, ditegakkan di server
- [ ] Pengajuan kedua untuk item yang sama ditolak
- [ ] Pengajuan massal melewati item yang sudah punya catatan, tanpa menggagalkan seluruhnya
- [ ] Pengajuan pada group yang dicabut atau kedaluwarsa ditolak
- [ ] `NEEDS_REQUEST` dan `PENDING_APPROVAL` **tidak** menulis `AccessLog`

### Langkah 3 — Sisi pemilik

Halaman `/dashboard/requests` dikelompokkan per group lalu per pemohon;
lencana jumlah tertunda di bilah atas; keputusan satuan dan massal;
pencabutan izin; membuka pilihan `APPROVAL` di CMS lengkap dengan
peringatan untuk item bersumber `EXTERNAL`.

- [ ] Hanya sesi `OWNER` yang dapat mengubah status
- [ ] Keputusan massal berjalan dalam **satu transaksi**; satu baris gagal membatalkan seluruhnya
- [ ] `expiresAt` diisi dari `group.expiresAt` **saat keputusan dibuat**
- [ ] Izin tidak pernah berumur lebih panjang daripada group-nya
- [ ] Peringatan `APPROVAL` + `EXTERNAL` muncul di CMS
- [ ] Lencana terlihat dari halaman dashboard mana pun

### Langkah 4 — Email

`lib/notify/` sebagai satu-satunya pengimpor SDK Resend; templat;
pengumpulan lewat `notifiedAt`; endpoint cron beserta pengamannya.

**GATE — D3 dan D5 harus sudah dijawab.**

- [ ] Hanya `lib/notify/` yang mengimpor Resend (diverifikasi dengan pencarian di seluruh repo)
- [ ] Endpoint cron menolak permintaan tanpa header `CRON_SECRET`
- [ ] Kegagalan email **tidak** membatalkan transaksi permintaan maupun keputusan
- [ ] Email keputusan yang menyetujui memuat tautan langsung ke gerbang item
- [ ] Keputusan massal mengirim **satu** email, bukan satu per item
- [ ] Templat email tidak memuat isi rahasia
- [ ] Tiga puluh pengajuan dalam satu menit → paling banyak satu email dalam sepuluh menit pertama

Butir terakhir adalah kriteria sukses nomor 10 dan **tidak dapat
diverifikasi di lokal** — jadwalnya baru berjalan sungguhan di Fase 10.
Yang diverifikasi di sini adalah logikanya: `notifiedAt` diperbarui
dengan benar dan endpoint cron memilih group yang tepat.

---

## Fase 9 — Pengerasan pra-rilis

**Tujuan.** Menutup jarak antara "seluruh unit selesai" dan "layak
dibuka orang lain".

**Bagian A — impeccable.**

1. `/impeccable audit` pada halaman group publik dan dashboard —
   aksesibilitas, performa, perilaku responsif.
2. `/impeccable harden` — keadaan galat, kasus tepi, keadaan ekstrem.
3. `/impeccable polish` — lintasan mutu terakhir.
4. `/impeccable document` — menulis `DESIGN.md` **dari hasil build**,
   bukan dari niat. Bila `DESIGN.md` berbeda dari
   `context/ui-context.md`, salah satunya salah; damaikan sekarang.

**Bagian B — pemeriksaan keamanan menyeluruh.**

Empat belas invarian di `context/architecture.md` diperiksa satu per
satu terhadap kode yang benar-benar ada, bukan terhadap ingatan tentang
kode itu. Yang paling mudah bocor tanpa disadari:

- Invarian 1 — cari setiap jalur menuju konten; pastikan semuanya
  memanggil `evaluateAccess()`
- Invarian 3 — `fileKey` dan `targetUrl` item terproteksi tidak muncul
  di HTML, payload data terserialisasi, maupun respons API
- Invarian 5 — setiap server action dan route handler memeriksa peran
  dari sesi sisi server
- Invarian 8 dan 10 — batas impor `lib/storage/`, `lib/notify/`, dan
  `lib/requests/` masih utuh
- Invarian 14 — tidak ada pekerjaan latar berumur panjang di route
  handler maupun server action

**Bagian C — keadaan ekstrem.**

- [ ] Group berisi 50 item — akordeon dan halaman publik masih terbaca
- [ ] 500 baris `AccessLog` — paginasi dan penyaringan masih cepat
- [ ] Judul group dan judul item yang sangat panjang tidak merusak tata letak
- [ ] Group tanpa deskripsi, item tanpa deskripsi
- [ ] Berkas rusak dan berkas hilang di Blob
- [ ] Pengunjung yang izinnya dicabut saat halaman sedang terbuka

**Bagian D — review menyeluruh.**

`superpowers:requesting-code-review` atas seluruh cabang, dengan model
paling mampu yang tersedia, memakai `context/architecture.md` sebagai
daftar periksa.

---

## Fase 10 — Preview deploy dan uji lingkungan nyata

**Tujuan.** Menjalankan alur uji utama di lingkungan yang bentuknya sama
dengan produksi, sebelum produksi.

**Alur uji utama** (dari `context/progress-tracker.md`, Session Notes):

> Buat group "Rapat Kerja" berisi tautan absensi bermode `OPEN`, PDF
> rundown yang diunggah bermode `IDENTITY`, dan notulen yang diunggah
> bermode `APPROVAL`; setel group ke `REQUIRE_LOGIN` dengan kedaluwarsa;
> buka linknya dari peramban lain dengan akun berbeda; ajukan izin untuk
> notulen; setujui dari dashboard; pastikan email keputusan diterima dan
> seluruhnya tercatat di riwayat.

Alur ini dijalankan **utuh, dengan dua akun Google sungguhan, dengan
peramban kedua**. Bukan disimulasikan.

**Yang hanya bisa diuji di sini, bukan di lokal.**

- [ ] Migrasi Prisma berjalan pada database yang sudah berisi data
- [ ] Alur OAuth Google pada domain sungguhan
- [ ] Unggah dan aliran berkas dari private Blob store di lingkungan Vercel (OIDC, bukan token lokal)
- [ ] Email Resend benar-benar sampai — ke kotak masuk, bukan ke folder spam
- [ ] Endpoint cron benar-benar terpicu sesuai jadwal (mekanisme D5)
- [ ] Pengumpulan email: ajukan banyak permintaan berurutan, hitung email yang masuk
- [ ] Rate limit berperilaku benar di belakang CDN Vercel — periksa header IP yang dibaca aplikasi
- [ ] Header respons berkas: `Content-Disposition: inline`, `Cache-Control: private, no-cache`, `X-Content-Type-Options: nosniff`
- [ ] Pindai QR dari ponsel yang belum pernah masuk, di jaringan seluler

**RISIKO — kotak masuk.** Email dari domain yang baru diverifikasi
sering masuk spam pada pengiriman pertama. Uji ke Gmail, dan bila
memungkinkan ke satu penyedia lain.

**RISIKO — zona waktu server.** Server berjalan dalam UTC. Bandingkan
jam yang tercatat di riwayat dengan jam sungguhan saat pengujian, di
lingkungan preview — bukan di lokal, yang zona waktunya berbeda.

---

## Fase 11 — Rilis produksi

**GATE — tidak ada yang tersisa terbuka.**

- [ ] Seluruh keputusan D1–D8 terjawab dan tertulis
- [ ] Bagian *Open Questions* di `progress-tracker.md` kosong atau berisi hal yang sengaja ditunda beserta alasannya
- [ ] Fase 10 lulus seluruhnya
- [ ] `npm run build` lulus
- [ ] Seluruh pengujian lulus, dijalankan dalam sesi ini juga

**Langkah rilis.**

1. Variabel lingkungan lengkap terpasang di environment **Production**
   Vercel — diperiksa satu per satu terhadap tabel di bawah, bukan
   disalin buta dari Preview.
2. Domain produksi terpasang, HTTPS aktif.
3. Redirect URI produksi terdaftar di Google Cloud Console.
4. Status publikasi OAuth = *In production* (D8).
5. Jadwal cron aktif sesuai mekanisme D5.
6. Migrasi produksi dijalankan.
7. Deploy.
8. **Uji asap di produksi**: masuk sebagai pemilik, buat satu group uji,
   buka dari peramban lain dengan akun berbeda, periksa riwayat, lalu
   hapus group uji itu.
9. `superpowers:finishing-a-development-branch` — gabungkan, beri tag
   versi, bersihkan.
10. `context/progress-tracker.md` diperbarui: fase saat ini menjadi
    "Rilis 1.0 — produksi".

### Variabel lingkungan lengkap

Sebelas variabel. Dua di antaranya (`DIRECT_URL`, `BLOB_STORE_ID`) belum
tercatat di `progress-tracker.md` dan perlu ditambahkan.

| Variabel | Lokal | Preview | Produksi | Catatan |
| -------- | :---: | :-----: | :------: | ------- |
| `DATABASE_URL` | ✓ | ✓ | ✓ | Koneksi ter-pool Neon |
| `DIRECT_URL` | ✓ | ✓ | ✓ | Koneksi langsung, untuk migrasi Prisma |
| `AUTH_SECRET` | ✓ | ✓ | ✓ | Acak, berbeda per lingkungan |
| `AUTH_GOOGLE_ID` | ✓ | ✓ | ✓ | |
| `AUTH_GOOGLE_SECRET` | ✓ | ✓ | ✓ | |
| `OWNER_EMAIL` | ✓ | ✓ | ✓ | Menentukan peran `OWNER` |
| `BLOB_READ_WRITE_TOKEN` | ✓ | — | — | Hanya untuk kode di luar Vercel; di Vercel dipakai OIDC |
| `BLOB_STORE_ID` | ✓ | ✓ | ✓ | Terpasang otomatis saat store dihubungkan ke proyek |
| `RESEND_API_KEY` | ✓ | ✓ | ✓ | |
| `EMAIL_FROM` | ✓ | ✓ | ✓ | Domain terverifikasi (D3) |
| `CRON_SECRET` | ✓ | ✓ | ✓ | Header pengaman endpoint cron |

Tidak satu pun berawalan `NEXT_PUBLIC_`.

---

## Fase 12 — Pasca-rilis

**Segera setelah rilis.**

- [ ] Pantau log Vercel selama acara pertama
- [ ] Periksa tabel `AccessLog` setelah acara: apakah isinya menjawab pertanyaan yang memang ingin dijawab?
- [ ] Periksa apakah ada permintaan izin yang tidak sengaja dibiarkan tertunda

**Sengaja ditunda** (`project-overview.md`, Deliberately Deferred) —
model datanya sudah tidak menghalangi:

| Fitur | Sudah tersedia di | Kebutuhan |
| ----- | ----------------- | --------- |
| Ekspor riwayat ke CSV | `AccessLog` | Tampilan saja |
| Ringkasan klik per item | `AccessLog` | Agregasi saja |
| Pratinjau PDF tertanam | — | Cara menampilkan saja |
| Persetujuan otomatis per domain email | `AccessRequest.requesterEmail` | Aturan saja |
| Pemangkasan `AccessLog` | — | Bergantung pada D4 |

Menambahkan salah satunya kelak dimulai dari
`superpowers:brainstorming`, bukan langsung menulis kode.

---

## Definition of Done — daftar periksa rilis

Diperiksa sekali lagi, utuh, sebelum Fase 11 langkah 7.

**Sebelas kriteria sukses di `project-overview.md`:**

- [ ] 1 — Satu group berisi tautan + PDF unggahan + tautan Drive, beserta link dan QR, selesai dalam satu sesi tanpa meninggalkan dashboard
- [ ] 2 — `REQUIRE_LOGIN` mengalihkan ke Google dan kembali ke halaman yang sama
- [ ] 3 — HTML halaman group tidak memuat URL tujuan item maupun alamat penyimpanan berkas
- [ ] 4 — Item `IDENTITY` menghasilkan tepat satu baris `AccessLog`, tertulis meski JavaScript dimatikan
- [ ] 5 — Link dicabut, kedaluwarsa, dan tidak pernah ada tidak dapat dibedakan dari luar
- [ ] 6 — Pemilik tetap dapat membuka group nonaktif, dengan spanduk
- [ ] 7 — Halaman publik tidak memuat rujukan apa pun ke group lain
- [ ] 8 — Item `APPROVAL` tanpa catatan `APPROVED` selalu ditolak
- [ ] 9 — Pemohon menerima kabar lewat email meski menutup peramban
- [ ] 10 — Tiga puluh pengajuan dalam satu menit → paling banyak satu email dalam sepuluh menit
- [ ] 11 — Group kedaluwarsa membuat izin yang sudah disetujui berhenti berlaku, tanpa tindakan tambahan

**Tiga baris merah di `CLAUDE.md`:**

- [ ] Semua akses ke konten melewati `lib/access/evaluate-access.ts`
- [ ] Log akses ditulis di server sebelum pengalihan atau pengaliran berkas
- [ ] Keadaan yang tidak pasti selalu berarti menolak

**Tujuh butir "Before Moving to the Next Unit" di
`ai-workflow-rules.md`**, diterapkan pada seluruh proyek sekaligus.

---

## Matriks risiko

| Risiko | Kemungkinan | Dampak | Penanganan |
| ------ | ----------- | ------ | ---------- |
| Cron lima menit tidak jalan di Hobby | **Pasti**, bila tidak ditangani | Kriteria sukses 10 gagal; deployment ditolak | D5 dijawab di Fase 0 |
| OAuth masih *Testing* saat acara | Sedang | Peserta ke-101 tidak dapat masuk sama sekali | D8 dilakukan di Fase 0, diverifikasi di Fase 10 |
| Domain email belum terverifikasi | Sedang | Pemohon tidak pernah menerima keputusan | D3 dijawab di Fase 0; verifikasi DNS butuh waktu tunggu |
| Store Blob terlanjur dibuat publik | Sedang | Berkas dapat diakses tanpa melewati gerbang; memperbaikinya berarti membuat store baru dan memindahkan berkas | Periksa akses store di Fase 0, sebelum unggahan pertama |
| Logika izin bocor lewat jalur baru | Sedang | Kebocoran senyap | Invarian 1 diperiksa di Fase 9; setiap jalur baru memanggil `evaluateAccess()` |
| URL tujuan bocor di HTML | Sedang | Kriteria sukses 3 gagal | CEK 1 di Fase 5, diulang di Fase 9 |
| Log hilang karena fungsi serverless berhenti | Rendah | Riwayat tidak lengkap tanpa ketahuan | `await` sebelum penerusan; diverifikasi di Fase 5 |
| Halaman publik ter-cache | Rendah | Halaman satu sesi terkirim ke sesi lain | Render dinamis; diperiksa di Fase 5 dan Fase 10 |
| Redirect URI preview tidak terdaftar | Tinggi | Masuk dengan Google gagal di preview | Domain preview stabil didaftarkan di Fase 0 |
| Email masuk folder spam | Sedang | Pemohon merasa tidak dikabari | Diuji ke dua penyedia di Fase 10 |
| impeccable mengganti token yang sudah diputuskan | Sedang | Kode dan `ui-context.md` berbeda diam-diam | D6 ditegaskan di prompt Fase 2 |
| Riwayat menampilkan nama hasil join, bukan salinan | Rendah | Riwayat berubah saat data pengguna berubah | CEK di Fase 7 |

---

## Peta ketergantungan

```
Fase 0 (D1–D8, layanan)
   │
   ├──> Fase 1  Unit 1  fondasi + skema lengkap + auth
   │       │
   │       └──> Fase 2  arah desain (impeccable)   [butuh D6, D7]
   │               │
   │               └──> Fase 3  Unit 2  CMS group
   │                       │
   │                       └──> Fase 4  Unit 3  item + unggahan
   │                               │
   │                               └──> Fase 5  Unit 4  gerbang + halaman publik  ★
   │                                       │
   │                                       ├──> Fase 6  Unit 5  berbagi + QR      [butuh D1]
   │                                       ├──> Fase 7  Unit 6  riwayat           [butuh D2]
   │                                       └──> Fase 8  Unit 7  persetujuan       [butuh D3, D5]
   │                                               │
   └───────────────────────────────────────────────┴──> Fase 9  pengerasan
                                                            │
                                                            └──> Fase 10  preview
                                                                    │
                                                                    └──> Fase 11  produksi  [butuh D8]
                                                                            │
                                                                            └──> Fase 12
```

★ Fase 5 adalah simpul tunggal yang menahan seluruh fase sesudahnya.
Fase 6, 7, dan 8 saling bebas dan boleh ditukar urutannya bila ada
alasan; Fase 5 tidak boleh dipercepat.

---

## Yang harus diperbarui di file konteks

Roadmap ini menemukan enam hal yang perlu masuk ke file konteks, sesuai
aturan "Keeping Docs in Sync" di `ai-workflow-rules.md`:

| # | Perubahan | File |
| - | --------- | ---- |
| 1 | Tambahkan `DIRECT_URL` dan `BLOB_STORE_ID` ke daftar variabel lingkungan | `progress-tracker.md` |
| 2 | Perjelas bahwa Vercel Blob memakai **private store** dengan `put({access:'private'})` dan `get({access:'private'})`, dan sebutkan versi SDK minimum | `architecture.md` |
| 3 | Catat bahwa Vercel Cron lima menit menuntut paket Pro, beserta mekanisme pengganti yang dipilih | `architecture.md` |
| 4 | Tambahkan header `Cache-Control: private, no-cache` dan `X-Content-Type-Options: nosniff` pada respons pengaliran berkas | `architecture.md` |
| 5 | Pindahkan lima pertanyaan terbuka menjadi keputusan beserta alasannya | `progress-tracker.md` |
| 6 | Catat batas 100 pengguna pada status OAuth *Testing* sebagai prasyarat rilis | `progress-tracker.md` |

Butir 1–4 dan 6 dikerjakan di Fase 0. Butir 5 menyusul setiap kali satu
keputusan terjawab.

---

## Sumber

- [Usage & Pricing for Cron Jobs — Vercel](https://vercel.com/docs/cron-jobs/usage-and-pricing)
- [Private Storage — Vercel Blob](https://vercel.com/docs/vercel-blob/private-storage)
- [When is verification not needed — Google Cloud Console Help](https://support.google.com/cloud/answer/13464323)
