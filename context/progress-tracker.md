# Progress Tracker

Perbarui berkas ini setiap kali ada perubahan implementasi
yang berarti.

## Current Phase

- **Fase 0 selesai, 20 Agustus 2026.** Kesebelas variabel
  terkumpul, seluruh konsol dikerjakan, arah pengalihan
  domain dibalik sehingga apex yang berstatus Production.
  Daftar periksanya bersih seluruhnya.
- **Unit 1 TUTUP, 21 Agustus 2026.** Sembilan task dieksekusi
  lewat subagent, masing-masing dengan review dua putusan,
  ditutup review menyeluruh satu cabang penuh dengan model
  paling mampu memakai empat belas invarian
  `architecture.md` sebagai lensa.
- **Digabung ke `main` pada `53e6abc`**, fast-forward, 32
  commit dari `28fc3b9`. Keempat gerbang lulus: `typecheck` 0,
  `lint` 0 tanpa peringatan, 54 test di 6 berkas, `build` 0.
- **Kelima pemeriksaan peramban dijalankan pemilik dan
  lulus** — termasuk yang membuktikan K1: mengubah
  `OWNER_EMAIL` lalu menjalankan ulang server mengubah peran
  tanpa keluar-masuk sekali pun. Peran memang diturunkan
  ulang tiap sesi dibaca, bukan dibaca dari kolom yang bisa
  basi.
- **Unit 2 TUTUP, 24 Agustus 2026.** Tiga belas task dieksekusi
  lewat subagent di worktree `.claude/worktrees/unit-2-cms-group`,
  18 commit dari `a896901`. Keempat gerbang lulus: `typecheck` 0,
  `lint` 0 tanpa peringatan, **180 test di 15 berkas**, `build`
  sukses. Ditutup review menyeluruh satu cabang penuh dengan model
  paling mampu memakai empat belas invarian `architecture.md`
  sebagai lensa.
- **Ketujuh exit criteria Fase 3 ditutup pemilik, 24 Agustus 2026.**
  Sepuluh kelompok pemeriksaan peramban dijalankan dan lulus, termasuk
  mode gelap dan lebar ponsel. Pemeriksaan itu menemukan satu cacat yang
  lolos dari rencana, implementasi, dan seluruh putaran review — isi
  akordeon yang tumbuh ikut terpotong — diperbaiki di `7f9df08` lalu
  diperiksa ulang.
- **Unit 3 SELESAI, 26 Agustus 2026.** Item dan unggahan: ketiga tipe
  item dari kedua sumber, batas 4 MB, pemeriksaan tipe dari isi berkas,
  penyusunan ulang dengan geser dan tombol. 13 commit dari `22a503c`,
  ditambah tujuh temuan review final (empat Important, tiga Minor).
  Keempat gerbang lulus: `typecheck` bersih, `lint` nol peringatan,
  **230 test di 19 berkas**, `build` sukses. Rincian lengkap di bagian
  "Unit 3 SELESAI" di bawah.
- **Digabung dan didorong, 27 Agustus 2026.** `main` di `fe15666`,
  fast-forward 25 commit dari `9fe3b99`, sudah ada di `origin`. Cabang
  `dev` disusulkan ke titik yang sama dengan `merge --ff-only` dan ikut
  didorong, sehingga alias preview Vercel akhirnya menunjuk kode
  sungguhan. Keempat ref — `main`, `origin/main`, `dev`, `origin/dev` —
  dibaca langsung dari GitHub dan seluruhnya `fe15666`.
- **Unit 4 bagian pertama SELESAI, 27 Agustus 2026.**
  `lib/access/evaluate-access.ts` beserta matriks pengujiannya, ditulis
  sebelum satu halaman pun dibuat sesuai gerbang urutan kerja Fase 5.
  Dua fungsi murni, 48 pengujian di tiga berkas `tests/access/`, termasuk
  invarian 6 sebagai berkas tersendiri. Tiga keputusan U4-1 sampai U4-3
  dicatat di Architecture Decisions, dan cabang pemilik di tahap dua
  sudah dituliskan ke `architecture.md`. Belum ada halaman, belum ada
  route, belum ada `lib/audit/`.
- **Digabung ke `main`, 27 Agustus 2026.** `merge --ff-only` dari
  `unit-4-gerbang-akses`, 16 commit dari `6045d50`, `main` kini di
  `e10cbda`. Ketiga gerbang dijalankan ulang di atas `main` setelah
  penggabungan dan lulus: **280 pengujian di 22 berkas**, `typecheck`
  bersih, `lint` nol peringatan. Sepuluh berkas berubah; nol di `app/`,
  `components/`, maupun `prisma/`.
- **Didorong dan `dev` disusulkan, 27 Agustus 2026.** `main` didorong ke
  `origin` — 18 commit, termasuk `6045d50` yang ternyata sudah tertinggal
  sebelum sesi ini dimulai. Cabang `dev` lalu disusulkan dengan
  `merge --ff-only` dan ikut didorong. Keempat ref — `main`,
  `origin/main`, `dev`, `origin/dev` — diperiksa setelah `git fetch` dan
  seluruhnya `205423d`. Prasyarat rilis soal `dev` tertutup lagi, dan
  alias preview `kumpulink-preview.vercel.app` menunjuk kode Unit 4.
- **Enam task dieksekusi lewat subagent** dengan review dua putusan per
  task, ditutup review menyeluruh satu cabang penuh memakai keempat belas
  invarian `architecture.md` sebagai lensa. Review itu menjalankan **16
  mutasi** pada `evaluate-access.ts` dan keenam belasnya membuat pengujian
  merah — tidak ada baris evaluator yang tidak terjaga.

  Tiga cacat ditemukan review dan tidak akan tertangkap tanpa review:
  cabang terakhir tahap satu yang permisif terhadap nilai `Visibility`
  tak dikenal; tiga pengujian yang hijau tanpa menjaga apa pun, termasuk
  satu yang tetap lulus ketika penolakan menyeluruh diganti
  `granted(true)`; dan cabang `default` tahap dua tanpa penjaga
  keterjangkauan `never` padahal komentarnya menjanjikan begitu.
  Ketiganya ditutup sebelum penggabungan.
- **Unit 4 bagian kedua SELESAI, 28 Agustus 2026.** Halaman group
  publik, gerbang item, `lib/audit/`, `lib/gate/`, dan
  `lib/ratelimit/` dibangun. Sepuluh task dieksekusi lewat subagent,
  masing-masing dengan review dua putusan. **324 pengujian di 31
  berkas** di `npm test` akhir sesi. Keempat gerbang lulus:
  `typecheck` bersih, `lint` nol peringatan, `test` 324/324, `build`
  sukses. Kedelapan pemeriksaan peramban dari `.superpowers/sdd/
  task-10-brief.md` (Step 1 sampai 8) **BELUM DIJALANKAN** — agen
  hanya mengerjakan bagian dokumentasi (Step 9 dan 10); pemiliklah
  yang menjalankannya, sama seperti unit-unit sebelumnya. Rinciannya
  di bagian "Pemeriksaan peramban Unit 4" di bawah.
- Tidak ada lagi pertanyaan terbuka.

## Current Goal

- **Pemeriksaan peramban Unit 4, lalu Unit 5.** Kedelapan pemeriksaan
  peramban di `.superpowers/sdd/task-10-brief.md` (Step 1 sampai 8)
  belum dijalankan siapa pun dan harus tuntas di tangan pemilik
  sebelum Unit 4 benar-benar ditutup. Sesudah itu, Unit 5 — panel
  Bagikan. Rinciannya di bagian Next Up.
- Tidak ada keputusan yang menggantung.

  Rumusan sebelumnya di bagian ini masih menyebut Fase 2 sebagai
  tujuan berjalan; itu basi sejak Unit 2 dan diperbaiki
  27 Agustus 2026.

## Completed

- Enam file konteks disusun dan disetujui.
- Model data ditetapkan: `User`, `Group`, `Item`,
  `AccessRequest`, `AccessLog`.
- Aturan evaluasi izin dua tahap ditetapkan, termasuk
  cabang persetujuan.
- Urutan pembangunan tujuh unit ditetapkan.
- Revisi 18 Agustus 2026: alur permintaan-persetujuan
  dipindahkan dari luar lingkup menjadi di dalam lingkup
  atas permintaan pemilik.
- 19 Agustus 2026: `ROADMAP.md` dan `PROMPT-PLAYBOOK.md`
  disusun, menyisipkan Fase 0 sebagai gerbang sebelum Unit 1.
- Fase 0, 19 Agustus 2026:
  - Delapan keputusan D1–D8 ditutup dan dicatat di bagian
    Architecture Decisions di bawah.
  - Repositori Git diinisialisasi dengan cabang `main`.
  - `.gitignore` dibuat dan **dibuktikan** menahan seluruh
    berkas `.env*` kecuali `.env.example`, dengan
    `git check-ignore` pada berkas uji yang lalu dihapus.
  - `.env.example` dibuat berisi sebelas nama variabel,
    seluruhnya tanpa nilai.
  - `docs/setup-layanan.md` ditulis sebagai daftar periksa
    manual untuk pemilik.
  - File konteks diselaraskan dengan temuan platform:
    private store Vercel Blob, header respons pengaliran
    berkas, penjadwal GitHub Actions, zona waktu tampilan,
    dan masa simpan `AccessLog`.
- Prasyarat layanan, 19 Agustus 2026:
  - Domain `diandiandian.web.id` dibeli di DomaiNesia.
    Perhatikan TLD-nya `.web.id`, bukan `.my.id` seperti
    yang diperkirakan saat D1 ditutup.
  - Nameserver dipindahkan ke Cloudflare dan **diverifikasi
    dari luar** — `kallie` dan `mitchell`, dijawab sama oleh
    resolver `1.1.1.1`, `8.8.8.8`, dan `9.9.9.9`. Zona kosong,
    tidak ada record warisan registrar.
  - Empat record DNS Resend dipasang: DKIM pada
    `resend._domainkey`, SPF berupa TXT dan MX pada `send`
    (region `ap-northeast-1`), dan DMARC `p=none` pada
    `_dmarc`. Nilai DKIM dibandingkan karakter demi karakter
    terhadap yang ditampilkan Resend dan cocok persis, 218
    karakter, dibaca sama oleh ketiga resolver.
  - `.env.local` dibuat dari `.env.example` dan terbukti
    diabaikan Git.
  - Empat variabel terisi: `RESEND_API_KEY`, `EMAIL_FROM`,
    `AUTH_SECRET`, dan `CRON_SECRET`. Dua terakhir dibuat
    dengan `openssl rand -base64 32` dan ditulis langsung ke
    berkas tanpa melewati layar.
- Sesi 20 Agustus 2026:
  - **`OWNER_EMAIL` ditetapkan `laluardiansyah903@gmail.com`**
    dan sudah tertulis di `.env.local`. Variabel kelima
    terkumpul.
  - **Alias preview Vercel ditetapkan
    `kumpulink-preview.vercel.app`**, menunjuk ke cabang `dev`.
    Ini membuka pendaftaran ketiga redirect URI sekali jalan
    di Google Cloud Console.
  - **Identitas kelima commit diperbaiki.** Alamat karangan
    `lalu@users.noreply.github.com` diganti alamat noreply asli
    akun `diannidaayman`, dengan tanggal author aslinya terjaga.
    Dibuktikan dengan `git diff` antara tag cadangan dan `main`
    yang kosong — isi berkas identik, hanya identitasnya yang
    berganti.
  - `docs/setup-layanan.md` diperbarui: urutan pengerjaan
    diubah menjadi Neon → GitHub → Vercel → Google beserta
    alasannya, bagian GitHub ditulis ulang memakai `gh repo
    create`, dan jebakan Windows dicatat untuk Vercel CLI serta
    penyuntingan `.env.local`.
  - **Domain Resend dikonfirmasi *Verified*** oleh pemilik.
    Pertanyaan terbuka terakhir tertutup.
  - **Repositori GitHub terbit:**
    `https://github.com/diannidaayman/kumpulink`, Public,
    cabang `main`, remote `origin` terpasang. Sebelum push,
    berkas terlacak disapu terhadap pola kunci Resend, token
    Blob, connection string Postgres, dan kredensial Google —
    nol kecocokan. Sesudah push, dipastikan dari API GitHub
    bahwa hanya tiga belas berkas terlacak yang terkirim dan
    `.env.local` tidak ada di pohon berkasnya.
  - Ruleset **Lindungi main** (id `21075437`) aktif dengan
    `deletion` dan `non_fast_forward`, dibaca dari endpoint
    aturan-yang-berlaku GitHub.
  - GitHub mengatribusikan keenam commit ke akun
    `diannidaayman`, membuktikan perbaikan identitas berlaku.
  - **Neon selesai.** Proyek `kumpulink` di region
    `ap-southeast-1` (Singapura). `DATABASE_URL` terbukti
    memuat `-pooler`, `DIRECT_URL` terbukti tidak, keduanya
    `sslmode=require`.
  - **Google Cloud Console selesai.** Status publikasi *In
    production*, ketiga redirect URI terdaftar.
  - **Vercel selesai.** Blob store privat — diperiksa di
    layar; `BLOB_READ_WRITE_TOKEN` **diuji hidup** ke API
    Vercel Blob dan dijawab HTTP 200, jadi bukan sekadar
    bentuknya yang benar. Alias `kumpulink-preview.vercel.app`
    menunjuk cabang `dev`.
  - **Cabang `dev` dibuat dan di-push.** Diperlukan agar
    Vercel punya cabang untuk dipilih saat alias preview
    ditetapkan. Ini juga menjadi cabang integrasi di bawah
    `main`: pekerjaan unit masuk ke `dev` lebih dulu, tempat
    preview-nya dapat diuji, sebelum naik ke `main`.
  - **Arah pengalihan domain diputuskan: apex yang utama.**
    Vercel semula menyetel `www` sebagai Production dan apex
    mengalihkan 308 ke sana — pola bawaan yang ditawarkannya
    sendiri. Itu akan mematahkan login Google dengan
    `redirect_uri_mismatch`, karena Auth.js menyusun
    `redirect_uri` dari host yang benar-benar melayani
    permintaan sedangkan yang terdaftar di Google adalah apex.
    Gejalanya baru muncul setelah ada deployment sungguhan,
    jadi mudah lolos sampai jauh. Arahnya dibalik. Alasan
    memilih apex: redirect URI sudah terdaftar untuk apex,
    seluruh dokumen memakai apex termasuk `EMAIL_FROM`, dan
    QR code yang dicetak jadi lebih pendek.

- Sesi 21 Agustus 2026 — Task 5 (skema Prisma dan migrasi
  pertama):
  - **`prisma/schema.prisma` ditulis lengkap**: sembilan enum,
    delapan model, disalin verbatim dari bagian Data Model
    `architecture.md`. `AccessLog` sengaja tanpa relasi
    foreign key; `AccessRequest` cascade dari `Item` dan
    `Group`. Tidak ada tabel rate limit — sengaja ditunda ke
    Unit 4. Kedua keputusan ini sekarang tercatat juga di
    `architecture.md` (akhir bagian `### AccessLog` dan bagian
    `## Storage Model`).
  - **Migrasi pertama diterapkan ke Neon**:
    `prisma/migrations/20260820233450_init/`. Dibuktikan lewat
    `prisma db pull --print`: delapan baris `model`, sembilan
    baris `enum`, persis seperti seharusnya. `DATABASE_URL` dan
    `DIRECT_URL` sama-sama terbukti bekerja — menutup dua butir
    terakhir daftar periksa Fase 0 yang sebelumnya tertunda
    karena `psql` tidak terpasang.
  - **Prisma di-pin ke `6.19.3`, bukan mengikuti `latest`.**
    `npm i -D prisma` tanpa versi menarik `7.9.1`. Prisma 7
    menghapus dukungan properti `url`/`directUrl` di dalam blok
    `datasource` pada berkas skema — keduanya wajib dipindah ke
    `prisma.config.ts` terpisah. Skema di brief Task 5 menulis
    `url` dan `directUrl` langsung di `datasource db {}`, dan
    isi skema itu tidak boleh dinegosiasikan ulang, jadi yang
    disesuaikan adalah versi Prisma-nya, bukan bentuk skemanya.
    `6.19.3` adalah rilis stabil 6.x terbaru yang masih
    mendukung sintaks ini. **Catatan untuk kelak:** bila suatu
    saat proyek ini sengaja pindah ke Prisma 7, ini perubahan
    arsitektur konfigurasi (bukan sekadar bump versi) dan wajib
    disertai pembaruan `architecture.md`.
  - **Prisma CLI tidak membaca `.env.local` secara bawaan** —
    hanya `.env`. Ini beda dari Next.js, yang memang memuat
    `.env.local` sendiri (terbukti dari log `next build`:
    baris "Environments: .env.local"). Untuk sesi ini,
    `npx prisma validate`, `migrate dev`, dan `db pull`
    dijalankan lewat skrip Node sekali pakai yang menggabungkan
    isi `.env.local` ke environment proses anak, tanpa memakai
    `source` (diblokir sandbox worktree) dan tanpa mencetak
    nilainya. Skrip itu tidak masuk repositori. **Task 6/7 yang
    perlu menjalankan perintah Prisma CLI lagi akan mengalami
    galat "Environment variable not found" yang sama** kecuali
    variabelnya disediakan dengan cara serupa — ini bukan
    sesuatu yang sudah diperbaiki secara permanen di proyek,
    hanya dikerjakan-sekitari untuk task ini.
  - `lib/db/client.ts` ditulis: singleton `PrismaClient` di
    `globalThis`, mencegah pool koneksi baru setiap hot reload.
    Belum diimpor dari mana pun — konsumennya baru datang di
    Task 6/7.
  - Keempat gerbang lulus: `typecheck` bersih, `lint` nol
    peringatan, `test` 32/32 di 3 berkas (tidak berubah dari
    sebelumnya), `build` sukses.

- Sesi 21 Agustus 2026 — Task 7 (Auth.js v5 dengan provider
  Google):
  - **`next-auth@beta` terpasang, resolve ke `5.0.0-beta.32`**
    — tetap di jalur mayor 5, sesuai ekspektasi brief.
    `@auth/prisma-adapter@2.11.3` terpasang berdampingan. Tidak
    ada keluhan adapter Prisma soal tipe `email` non-null pada
    model `User`.
  - **`lib/auth/config.ts` ditulis**: adapter Prisma, strategi
    sesi `database` (bukan JWT, sesuai `architecture.md`),
    provider Google dari `env.AUTH_GOOGLE_ID` dan
    `env.AUTH_GOOGLE_SECRET`. Callback `session` menurunkan
    ULANG peran lewat `resolveRole()` (Task 6) setiap kali sesi
    dibaca; kolom `User.role` hanya disegarkan lewat
    `events.signIn` agar dapat di-query, bukan sumber kebenaran.
  - **`lib/auth/index.ts`, `lib/auth/session.ts`,
    `app/api/auth/[...nextauth]/route.ts`, dan
    `types/next-auth.d.ts` ditulis** sesuai brief.
    `session.ts` mengekspor `requireOwner()`: tanpa sesi
    dialihkan ke Google, ada sesi tapi bukan `OWNER` dialihkan
    ke `/akses-ditolak` (halaman ini sendiri belum dibuat —
    menyusul di Task 8).
  - **`tsconfig.json` diperiksa, sengaja tidak diubah.** Pola
    `include` bawaan `**/*.ts` sudah mencakup
    `types/**/*.d.ts` — dibuktikan lewat `typecheck` bersih
    begitu `types/next-auth.d.ts` ditambahkan.
  - **Verifikasi tertunda dari Task 4 ditutup, dengan satu
    catatan penting untuk Task 8.** Mengosongkan `OWNER_EMAIL`
    lalu menjalankan `npm run dev` saja **tidak** membuat server
    menolak start — Next.js dev server meng-compile route
    on-demand, dan belum ada berkas yang eager mengimpor
    `lib/auth` (tidak ada `middleware.ts`; `app/layout.tsx`
    tidak menyentuhnya). Galat yang diharapkan baru muncul
    setelah route `/api/auth/[...nextauth]` benar-benar diminta
    (diuji lewat `GET /api/auth/providers`): HTTP 500 dengan
    pesan yang menyebut `OWNER_EMAIL` persis. **Task 8 yang
    memasang layout dashboard perlu tahu ini** — begitu
    `requireOwner()` dipanggil dari sebuah route yang diminta
    pengunjung, jalur ini otomatis tersentuh dan tidak perlu
    trik serupa lagi, tetapi pemeriksaan env manual berikutnya
    yang hanya mengandalkan "jalankan `npm run dev`" tanpa
    permintaan HTTP akan memberi hasil negatif palsu.
  - Keempat gerbang lulus: `typecheck` bersih, `lint` nol
    peringatan, `test` 44/44 di 4 berkas (tidak berubah), `build`
    sukses.

- Sesi 21 Agustus 2026 — Task 8 (dashboard, gerbang pemilik, dan
  halaman akses ditolak):
  - **`app/(dashboard)/layout.tsx` ditulis.** Memanggil
    `requireOwner()` sekali di sini, bukan di tiap halaman, sehingga
    seluruh rute di bawah grup ini terlindungi secara bawaan dan
    halaman baru tidak dapat lupa memeriksanya — menegakkan
    invarian 5 di `architecture.md`. Header berisi nama aplikasi dan
    `ThemeToggle`.
  - **`app/(dashboard)/dashboard/page.tsx` ditulis**: keadaan kosong
    "Belum ada group", teksnya disalin persis dari bagian Empty and
    Error States `ui-context.md`.
  - **`app/akses-ditolak/page.tsx` ditulis, sengaja di luar grup
    `(dashboard)`.** Kalau di dalam, ia akan melewati gerbangnya
    sendiri dan pengalihannya berputar tanpa henti. Menampilkan
    alamat email sesi yang sedang masuk (`"tidak diketahui"` bila
    tidak ada sesi) dan tombol Keluar berupa server action yang
    memanggil `signOut({ redirectTo: "/" })`.
  - **`app/page.tsx` diganti** dari placeholder statis menjadi
    `redirect("/dashboard")`. Aplikasi ini tidak memiliki halaman
    depan publik; dicatat di `architecture.md`.
  - **`context/architecture.md` bagian System Boundaries
    diperbarui**: dua baris baru mencatat `app/page.tsx` dan
    `app/akses-ditolak/`.
  - **Verifikasi peramban dengan login Google sungguhan (brief Step
    5 dan 6) sengaja tidak dijalankan oleh agen** — alur OAuth
    menuntut kredensial manusia sungguhan yang tidak boleh
    dimasukkan agen, dan Step 6 juga menuntut sesi aktif yang hanya
    ada setelah login sungguhan. **Diserahkan ke pemilik sebelum
    unit ini ditutup.** Sebagai gantinya, diverifikasi lewat
    `npm run dev` sungguhan tanpa sesi apa pun: `GET /dashboard` →
    307 ke `/api/auth/signin?callbackUrl=%2Fdashboard`; `GET /` →
    307 ke `/dashboard`; `GET /akses-ditolak` → 200, teks Bahasa
    Indonesia tampil apa adanya, tanpa pengalihan berputar.
    `npm run build` memuat ketiga rute baru, dengan `/dashboard`
    dan `/akses-ditolak` otomatis terdeteksi Next.js sebagai
    dinamis karena memanggil `auth()` — tidak perlu
    `export const dynamic` manual dan build tidak gagal.
  - **Checklist yang masih perlu tangan pemilik**: masuk sungguhan
    sebagai `laluardiansyah903@gmail.com` untuk membuktikan
    dashboard kosong tampil; memeriksa kontras tombol tema di kedua
    mode (K8); keluar lalu masuk dengan akun Google lain untuk
    membuktikan `/akses-ditolak` menampilkan email yang benar dan
    tombol Keluar mengembalikan ke keadaan belum masuk; dan uji
    perbaikan `OWNER_EMAIL` (brief Step 6) yang menuntut memuat
    ulang `/dashboard` dengan sesi yang sudah ada, tanpa keluar-masuk.
  - Keempat gerbang lulus: `typecheck` bersih, `lint` nol
    peringatan, `test` 50/50 di 5 berkas (tidak berubah — task ini
    tidak menambah logika baru untuk diuji unit, hanya halaman
    server component yang mengonsumsi `requireOwner()` yang sudah
    diuji tuntas di Task 7), `build` sukses. Grep nilai heksadesimal
    di `app/` dan `components/` tidak menemukan apa pun.

- Sesi 21 Agustus 2026 — Penerapan temuan review final Unit 1 (sebelum
  penggabungan), dua commit terpisah:
  - **KELOMPOK 1 (`4189bea`), tiga temuan Important:**
    - `tests/auth/config.test.ts` ditulis — callback `session` di
      `lib/auth/config.ts` sebelumnya satu-satunya penegak K1 tanpa
      test sama sekali. Kasus paling mengikat: `user.role = "OWNER"`
      dengan email yang tidak cocok `OWNER_EMAIL` tetap menghasilkan
      `VIEWER`, membuktikan kolom database bukan sumber kebenaran.
      Alasan lama untuk melewatkannya (mengimpor `config.ts` menarik
      `lib/env.ts`) diatasi dengan mem-mock `@/lib/env`,
      `@/lib/db/client`, dan `@auth/prisma-adapter`, persis pola yang
      sudah dipakai `tests/auth/session.test.ts` untuk `@/lib/auth`.
    - Komentar `app/(dashboard)/layout.tsx` diperbaiki: sebelumnya
      menjanjikan "halaman baru tidak dapat lupa memeriksanya" tanpa
      menyebut tiga jalur yang tidak dilindungi layout ini — route
      handler, server action (badan aksinya berjalan sebelum layout
      dirender ulang), dan navigasi lunak antar segmen bersaudara.
      Hanya komentar yang berubah, bukan kode.
    - `docs/setup-layanan.md` baris checklist `DATABASE_URL`
      dikembalikan ke `- [ ]` — migrasi dan introspeksi Task 5
      keduanya memakai `DIRECT_URL`, belum ada query runtime Prisma
      yang benar-benar menempuh `DATABASE_URL`. Baris `DIRECT_URL`
      tidak disentuh, terbukti benar.
  - **KELOMPOK 2 (`b965381`), enam temuan dirapikan selagi murah:**
    - `prisma/schema.prisma`: `@@index([slug])` dihapus dari `Group`
      — berlebih di atas `slug` yang sudah `@unique`, yang di Postgres
      otomatis membuat indeks btree unik sendiri (`Group_slug_key`).
      Migrasi baru diterapkan sungguhan ke Neon:
      `prisma/migrations/20260821081525_drop_redundant_group_slug_index/`,
      isinya hanya `DROP INDEX "Group_slug_idx"`. `architecture.md`
      diberi catatan bahwa constraint unique itu sendiri yang
      memenuhi "Indeks pada `slug`" — bukan penyimpangan.
    - `lib/db/client.ts` sekarang membangun `PrismaClient` dari
      `env.DATABASE_URL` tervalidasi (`datasourceUrl`), bukan
      langsung dari skema Prisma. Modul ini kini ikut mewarisi
      `server-only` lewat `lib/env.ts` — dikonfirmasi tidak
      mematahkan test manapun, karena satu-satunya test yang
      menyentuh rantai impor ini (`tests/auth/config.test.ts`)
      mem-mock `@/lib/db/client` secara langsung.
    - `app/akses-ditolak/page.tsx`: pengunjung anonim yang membuka
      URL ini langsung tanpa sesi tidak lagi melihat "sedang masuk
      sebagai: tidak diketahui" — dialihkan ke jalur masuk
      (`/api/auth/signin?callbackUrl=/dashboard`). Tidak berputar
      karena halaman ini di luar grup `(dashboard)` dan tidak
      memanggil `requireOwner()`.
    - Tiga ketidakcocokan dokumen diselaraskan: baris `role` di tabel
      `User` `architecture.md` (baris 98) disamakan dengan kalimat
      "diturunkan ulang tiap sesi dibaca" yang sudah ada di berkas
      yang sama; baris `User.emailVerified` (dituntut adapter Prisma
      Auth.js) ditambahkan ke tabel yang sama; `types/` didaftarkan
      sebagai lokasi augmentasi tipe pihak ketiga di
      `code-standards.md` (File Organization) dan `architecture.md`
      (System Boundaries), terpisah dari `lib/types/` — isinya tidak
      dipindah.
    - `vitest.config.ts` diganti nama menjadi `vitest.config.mts`,
      plugin `vite-tsconfig-paths` dilepas demi `resolve.tsconfigPaths`
      bawaan Vite. Kedua peringatan deprecation saat `npm test` hilang;
      alias `@/` dikonfirmasi tetap bekerja sebelum lanjut ke butir
      berikutnya.
    - `public/next.svg`, `vercel.svg`, `file.svg`, `globe.svg`,
      `window.svg` dihapus — sisa branding `create-next-app`, dibuktikan
      tidak dirujuk lewat grep di seluruh repo sebelum dihapus.
  - Tidak ada satu pun butir yang dilewati. Keempat gerbang lulus
    bersih setelah kedua commit: `typecheck` bersih, `lint` nol
    peringatan, `test` **54/54 di 6 berkas** (naik dari 50 — bertambah
    tepat 4 test baru dari `config.test.ts`), `build` sukses. Rincian
    lengkap beserta keluaran mentah ada di
    `.superpowers/sdd/final-review-fixes.md`.
  - Cabang masih `worktree-unit-1-fondasi`, belum digabung *pada saat
    itu*. HEAD sekarang `b9653814d06316639e8b6c1ad44387f2a0adb350`,
    menggantikan `51fc5c0` sebagai commit terbaru sebelum penggabungan.
    Sudah tergabung sejak `53e6abc`.

- Sesi 21 Agustus 2026 — penutupan Unit 1:
  - **Review menyeluruh satu cabang penuh** dengan model paling
    mampu, memakai empat belas invarian `architecture.md`
    sebagai lensa. Putusannya *fix first*: tiga temuan Important
    dan enam minor, seluruhnya diterapkan. Yang paling
    menentukan: callback `session` — satu-satunya penegak K1 —
    ter-ship tanpa test, dan mengganti `resolveRole(...)`
    menjadi `user.role` akan membalik K1 sepenuhnya tanpa satu
    pun dari lima puluh test gagal. Sekarang diuji.
  - **Indeks ganda `Group.slug` dihapus** lewat migrasi
    sungguhan ke Neon. `@unique` sudah membuat indeks btree
    unik, jadi `@@index([slug])` hanya menambah beban tulis.
    Dikerjakan selagi tabelnya masih kosong — persis alasan
    skema ditulis lengkap sejak Unit 1.
  - **Kelima pemeriksaan peramban dijalankan pemilik, lulus
    semua.** Termasuk yang membuktikan K1 tanpa keluar-masuk.
  - **Tombol keluar dan nama akun ditambahkan di bilah atas
    dashboard**, lalu diuji pemilik dan bekerja. Celahnya ada di
    spesifikasi, bukan implementasi: `ui-context.md` mewajibkan
    bilah identitas hanya untuk halaman publik dan diam soal
    dashboard, sehingga rencana, implementasi, dan tujuh putaran
    review lolos bersama-sama. Tidak ada gerbang atau reviewer
    yang bisa menangkap sesuatu yang tidak pernah diminta —
    yang menangkapnya adalah pemilik yang mencoba memakainya.
    Aturannya kini tertulis di `ui-context.md`.
  - **Digabung ke `main` pada `53e6abc`**, fast-forward, 32
    commit. Belum di-push ke `origin` *pada saat itu* — didorong
    kemudian, lihat "Integrasi Unit 2" di bawah.

## In Progress

**Kosong.** Unit 3 selesai dan **ketujuh butir "Before Moving to the Next
Unit" tertutup, 26 Agustus 2026.**

Keempat pemeriksaan peramban dijalankan pemilik dan lulus: urutan lewat
papan ketik saja, source `/dashboard` nol kecocokan untuk `fileKey`,
`blob.vercel-storage.com`, dan `groups/`, unggahan tepat 4 MB diterima
sementara 4 MB lebih satu byte ditolak, serta berkas benar-benar hilang
dari Blob saat item dan group dihapus.

**Butir 4 dan 5 juga ditutup pemilik** — antarmuka diperiksa di mode
terang dan gelap serta di lebar ponsel, berikut tiga jalur yang belum
tersentuh keempat pemeriksaan di atas: menambah item lewat tab Tempel
URL, menyusun ulang dengan seret, dan menonaktifkan item. Seluruhnya
lulus.

Agen tidak dapat melakukan pemeriksaan ini sendiri dan tidak
mengakuinya: seluruh antarmuka Unit 3 hidup di `/dashboard` di balik
`requireOwner()`, dan sesi peramban agen bukan sesi pemilik — agen hanya
sampai di layar masuk bawaan Auth.js. Yang dapat dibuktikan agen hanyalah
bahwa tidak ada warna yang lolos dari sistem token: nol nilai
heksadesimal di seluruh komponen `item-*` dan `group-accordion-body`,
sepuluh token yang dipakai punya definisi di kedua mode, dan
`item-card.tsx:39-40` mobile-first. Bahwa hasilnya benar dilihat hanya
dapat dibuktikan dengan membukanya, dan itu yang dikerjakan pemilik.

**Keputusan lingkup baru, 26 Agustus 2026: pratinjau tertanam.**
Dipindahkan dari Out of Scope ke dalam lingkup atas permintaan pemilik,
**dibatasi pada item bermode `OPEN` yang bersumber `UPLOAD`**. Item
`IDENTITY` dan `APPROVAL` tetap wajib diklik, karena berkas yang tampil
tanpa diklik membuat `AccessLog` mencatat akses yang tidak pernah
diputuskan siapa pun — dan itu menggerus sasaran nomor 4 sekaligus
alasan riwayat akses ada. Belum dibangun: menunggu Unit 4 menyediakan
rute penyajian berkas, lalu dijadwalkan Unit 5 atau sesudahnya. Tercatat
di `project-overview.md`, `ui-context.md`, `ROADMAP.md`, dan `PRODUCT.md`.

### Unit 3 SELESAI — 26 Agustus 2026

Branch `worktree-unit-3-item-dan-unggahan`, 13 commit dari `22a503c`
sampai `4657b47`, ditambah temuan review final di bawah — seluruhnya 25
commit. **Digabung ke `main` pada `fe15666`, fast-forward, lalu didorong
ke `origin` 27 Agustus 2026.** Worktree dan cabang fiturnya sudah
dihapus. Rencana:
`docs/superpowers/plans/2026-08-26-unit-3-item-dan-unggahan.md`.

**Yang dibangun.** Pemilik dapat menambahkan item bertipe `LINK`,
`PDF`, `IMAGE` dari sumber `EXTERNAL` maupun `UPLOAD` ke sebuah group,
menyunting metadatanya, menonaktifkan, menghapus, dan menyusun ulang
urutannya dengan geser atau tombol naik/turun. `accessMode` dibatasi
`OPEN` dan `IDENTITY` — `APPROVAL` belum muncul di CMS, sesuai lingkup
Fase 4.

**Keputusan yang tidak dapat dipulihkan dari kode, dicatat di sini
supaya tidak perlu ditemukan ulang:**

- **Batas unggahan 4 MB, bukan 10 MB seperti draf awal.** Batas badan
  permintaan Vercel Functions adalah 4,5 MB di tingkat infrastruktur
  dan tidak dapat dinaikkan lewat konfigurasi apa pun — permintaan
  yang melebihinya mati dengan 413 `FUNCTION_PAYLOAD_TOO_LARGE`
  sebelum satu baris kode aplikasi berjalan. 4 MB menyisakan ruang
  untuk amplop multipart di bawah pagu infrastruktur itu.
  (`lib/storage/limits.ts`)
- **Pemeriksaan tipe berkas dari magic bytes ditulis sendiri, bukan
  memakai pustaka.** Hanya empat tanda tangan biner yang perlu
  dikenali (`%PDF-`, `\x89PNG`, `\xFF\xD8\xFF`, `RIFF....WEBP`), dan
  menambah dependensi untuk empat perbandingan byte adalah beban yang
  tidak sepadan. Daftarnya PUTIH: apa pun yang tidak cocok salah satu
  tanda tangan menghasilkan `null`, dan `null` berarti tolak — bukan
  jatuh ke cabang permisif. (`lib/storage/detect-file-type.ts`)
- **Pathname Blob berbentuk `groups/{groupId}/{24 byte acak base64url}.{ext}`.**
  Awalan `groupId` bukan hiasan: ia yang membuat penghapusan sebuah
  group dapat menyapu seluruh berkasnya dalam satu operasi list-lalu-
  del berawalan (`deleteFilesByPrefix`), termasuk berkas yatim yang
  tertinggal dari kegagalan sebelumnya. Segmen acaknya memakai
  `crypto.randomBytes`, bukan `Math.random()`, supaya tidak dapat
  ditebak. (`lib/storage/blob-path.ts`)
- **Urutan hapus item: baris basis data dulu, berkas Blob kedua, dan
  kegagalan langkah kedua ditelan.** Setiap jalur menuju konten
  berangkat dari baris `Item`, jadi begitu barisnya hilang berkasnya
  sudah tidak terjangkau lewat aplikasi meski penghapusan Blob gagal
  total. Kebalikannya — berkas dulu — menukar sampah penyimpanan yang
  tidak terlihat dengan item rusak yang terlihat pemilik. Pola yang
  sama dipakai saat insert gagal: berkas yang sudah terlanjur naik
  dihapus, kegagalannya ditelan, galat aslinya yang diteruskan.
  (`lib/db/items.ts`, `app/(dashboard)/dashboard/item-actions.ts`,
  `app/api/groups/[groupId]/items/route.ts`)
- **`getFileStream()` tidak ditulis di unit ini — sengaja ditunda ke
  Unit 4.** `lib/storage/blob.ts` hanya berisi `putFile`, `deleteFile`,
  `deleteFilesByPrefix`. Mengalirkan berkas ke pengunjung menuntut
  gerbang akses yang belum ada (`evaluateAccess()`), dan menulis
  fungsi pengaliran tanpa gerbang yang memanggilnya berarti kode mati
  yang tidak diuji jalur nyatanya.
- **Mengganti berkas yang sudah diunggah tetap di luar lingkup.**
  Formulir sunting item (`item-edit-form.tsx`) hanya mengubah judul,
  deskripsi, `accessMode`, dan — khusus item `EXTERNAL` — `targetUrl`.
  Jalur ganti-berkas memikul bobot yang sama dengan jalur buat
  (multipart kedua, magic bytes lagi, urutan tukar-lalu-hapus-yang-
  lama beserta kegagalannya sendiri) demi kasus yang jarang; untuk
  mengganti berkas, pemilik menghapus item lalu menambahkannya lagi.
- **`lib/groups/order.ts` dari Unit 2 dipindah menjadi `lib/order/move.ts`**
  sebelum task pertama Unit 3 mulai (`22a503c`), supaya `moveInList`
  dan `renumber` dapat dipakai bersama oleh urutan group maupun urutan
  item tanpa satu sisi mengimpor direktori milik sisi lain.

**Temuan review final yang diterapkan, empat Important dan tiga
Minor:**

- **Pemeriksaan `Content-Length` murah membebankan overhead amplop
  multipart ke pagu per-berkas.** `Content-Length` mengukur SELURUH
  badan permintaan — boundary, header tiap bagian, medan `title`,
  `description`, `accessMode` — bukan hanya berkasnya, sehingga berkas
  tepat 4 MB salah ditolak 413 sebelum pemeriksaan `byteLength` yang
  mengikat sempat berjalan. Ditambah `MULTIPART_ENVELOPE_ALLOWANCE`
  (8 KiB) khusus pada pemeriksaan murah ini; pemeriksaan `byteLength`
  yang mengikat tidak disentuh.
- **Menyunting item `EXTERNAL` tidak bisa mengubah `targetUrl`-nya.**
  Bagian dari lingkup Unit 3 yang tertulis di rencana tapi belum
  dibangun. `itemMetadataFormSchema` sekarang menerima `targetUrl`
  opsional (absen untuk item `UPLOAD`, divalidasi `targetUrlSchema`
  bila hadir), diteruskan lewat `updateItemAction` dan
  `updateItemMetadata`, dan formulirnya menampilkan kolom Tautan hanya
  untuk `item.source === "EXTERNAL"`.
- **Penyusunan ulang item tidak mengumumkan apa pun ke pembaca
  layar.** `components/dashboard/group-list.tsx` sudah punya wilayah
  `aria-live="polite"` untuk pemindahan group; `item-list.tsx` tidak
  punya padanannya. Ditambahkan, mengumumkan lewat jalur tombol
  maupun jalur seret.
- **`countGroupItems()` dihapus.** Nol pemanggil di seluruh
  repositori (diverifikasi dengan pencarian), dan dialog hapus group
  sudah memakai `group.itemCount` dari payload daftar.
- Nama berkas unggahan dibersihkan dari karakter kendali dan tanda
  kutip ganda sebelum disimpan — Unit 4 akan menaruhnya di header
  `Content-Disposition`, dan kedua karakter itu adalah bentuk klasik
  injeksi header.
- `groupId` dari parameter rute kini diurai `itemIdSchema` sebelum
  dipakai, bukan hanya diselamatkan oleh urutan `groupExists()` yang
  kebetulan dipanggil lebih dulu.
- Pola tab ARIA yang setengah jadi di `item-add-panel.tsx`
  (`role="tablist"`/`role="tab"`/`aria-selected` tanpa `tabpanel`,
  `aria-controls`, atau roving tabindex) dilepas seluruhnya menjadi
  dua tombol biasa berlabel — jujur dan tetap sepenuhnya dapat
  dioperasikan, alih-alih pola yang mengumumkan kendali yang tidak
  sungguhan.

**Keempat gerbang lulus:** `typecheck` bersih, `lint` nol peringatan,
**230 test** di 19 berkas (naik dari 227 — tiga test baru untuk
`targetUrl` opsional di `itemMetadataFormSchema`), `build` sukses.

**Yang MASIH menunggu tangan pemilik.** Sama seperti Unit 1 dan 2,
tidak ada pemeriksaan peramban yang dijalankan agen — alur unggah
sungguhan dan penghapusan Blob sungguhan menuntut store nyata dan
sesi OAuth nyata. `ROADMAP.md` Fase 4 mencatat exit criteria mana
yang menunggu ini secara eksplisit.

### Unit 2 SELESAI — 24 Agustus 2026

Branch `unit-2-cms-group`, 18 commit dari `a896901`, belum
digabung. Rencana: `docs/superpowers/plans/2026-08-21-unit-2-cms-group.md`.

**Yang dibangun.** Pemilik dapat membuat, mengubah, menghapus,
dan menyusun ulang group, serta melihat seluruhnya sebagai daftar
akordeon yang dapat dilipat. Daftar dirender server, interaktivitas
dipegang satu cangkang klien, seluruh mutasi lewat server action.

**Bentuknya mengikuti satu keputusan arsitektur.** Setiap aturan
yang *dapat diputuskan* ditulis sebagai fungsi murni di `lib/`,
terpisah dari lapisan Prisma yang setipis mungkin. Proyek ini tidak
punya database uji dan tidak punya lingkungan uji DOM, jadi
pemisahan itu bukan estetika — ia satu-satunya cara aturan-aturan
tersebut punya pengujian yang benar-benar dijalankan. Hasilnya 180
test, seluruhnya atas fungsi murni.

**Empat keputusan yang lahir di sesi brainstorming**, seluruhnya
terpasang:

1. Lencana **"Tidak dibagikan"** bernada netral menggantikan
   "Nonaktif" untuk saklar berbagi yang mati. Nadanya mengikuti
   siapa penyebabnya: saklar mati adalah pilihan sadar pemilik,
   sedangkan kedaluwarsa terjadi tanpa ia memutuskan apa pun.
2. Slug **turunan** yang bentrok diberi akhiran diam-diam;
   slug **ketikan tangan** yang bentrok ditolak beserta usulan.
   Pemilik tidak pernah mengetik slug turunan, jadi menghentikannya
   dengan galat berarti menyalahkan orang atas sesuatu yang bukan
   pilihannya.
3. **Penomoran ulang rapat** pada setiap pemindahan dan setiap
   penghapusan, sehingga keadaan basis data selalu kanonis dan tidak
   ada jalur pemulihan celah yang harus ditulis dan diuji.
4. **Kontrol urutan disembunyikan**, bukan diabukan, saat daftar
   sedang tersaring. Kontrol nonaktif yang tetap terlihat sebagai
   tombol hanya mengundang ketukan yang gagal.

**Tiga keputusan tambahan yang diambil pemilik saat eksekusi,**
seluruhnya karena rencana bertentangan dengan dirinya sendiri:

- **Rencana Task 2 tidak lolos berkas test-nya sendiri.** Kode
  Step 7 verbatim menghasilkan `{ status: "ok", slug: "rapat-kerja-2" }`
  pada kasus "mengubah group, slug turunan bentrok dengan group lain",
  sedangkan test Step 5 menuntut `{ status: "conflict", ... }`.
  Implementer diam-diam menambahkan cabang untuk merekonsiliasinya dan
  melaporkannya sebagai transkripsi persis — klaim yang keliru dan
  tertangkap review. **Putusan: test yang menang.** Cabangnya
  dipertahankan lalu didaratkan dengan benar di `7125401`: komentar
  alasannya, tiga test tambahan, dan teks rencana diperbaiki.
  Alasannya kuat — di mode ubah kolom slug tidak pernah terisi
  otomatis, jadi slug yang dikirim selalu ketikan tangan, dan
  mengubahnya diam-diam dapat mematahkan link yang sudah disebarkan.
- **Segmen bawaan "Aktif" menyembunyikan setiap group yang bisa
  dibuat Unit 2.** Tidak ada satu pun aksi di unit ini yang menyalakan
  `shareEnabled`, sehingga semua group berstatus `UNSHARED` — dan
  klasifikasi lama menganggapnya nonaktif. Akibatnya group yang baru
  disimpan langsung lenyap dan layar berbunyi "Tidak ada group yang
  cocok". **Putusan: hanya `EXPIRED` yang nonaktif;** `UNSHARED` ikut
  tampil di segmen Aktif. Alasannya sejalan dengan komentar
  `lib/groups/status.ts` sendiri — kedaluwarsa adalah satu-satunya
  keadaan yang mematikan group tanpa pemilik memutuskan apa pun.
- **Daftar periksa Task 13 menuntut slug ikut berubah saat judul
  diubah**, padahal kode Task 9 sengaja menghentikannya
  (`slugTouched` mulai `true` di mode ubah). **Putusan: kode yang
  menang**, daftar periksanya yang diperbaiki — dengan alasan yang
  sama seperti butir pertama.

**Temuan review akhir yang diterapkan.** Reviewer memakai empat belas
invarian `architecture.md` sebagai lensa. Tidak ada temuan Critical.
Lima temuan Important dan empat Minor diterapkan di `8adc371`,
`2c7186c`, dan `5c95372`:

- **`app/(dashboard)/dashboard/page.tsx` tidak menggerbangi dirinya
  sendiri**, hanya bersandar pada layout. Next.js merender layout dan
  halaman bersamaan, dan navigasi lunak antar segmen bersaudara tidak
  menjalankan ulang layout bersarang — jadi begitu Unit 3 menambah
  rute saudara, halaman ini terbuka tanpa gerbang. Sekarang memanggil
  `requireOwner()` sebagai pernyataan pertamanya.
- **`id`, `currentSlug`, dan `direction` tidak melewati Zod** —
  pelanggaran invarian 9. `currentSlug` kini dibaca dari basis data
  lewat `getGroupSlugById()`, bukan dari formulir, karena nilainya
  menentukan cabang `resolveSlug()` dan isi himpunan `taken`.
  `id` dan `direction` divalidasi skema. Yang paling menentukan:
  `moveGroupAction` dulu menulis
  `formData.get("direction") === "up" ? "up" : "down"`, sehingga nilai
  yang tidak dikenali **jatuh diam-diam ke "down" dan tetap
  memindahkan baris** — persis bentuk yang dilarang `CLAUDE.md`.
  Sekarang arah yang tidak terbaca tidak mengubah apa pun.
- **Balapan lost-update di `moveGroupAction`.** Pembacaan urutan ada
  di luar transaksi, jadi dua ketukan cepat bisa menghitung dari
  urutan basi lalu saling menimpa — dan karena klien menerapkan
  keduanya secara optimistis, pemilik melihat dua pemindahan mendarat
  lalu satu membatalkan diri. Sekarang `moveGroupInTransaction()`
  membaca dan menulis di dalam satu transaksi, berurutan dalam
  `for`, bukan `Promise.all`.
- **Id DOM ganda** di `group-form-row.tsx` saat baris buat dan baris
  ubah terbuka bersamaan; kini memakai `useId()`.
- **`DASHBOARD_PATH` terduplikasi** — satu sasaran `redirect()`, satu
  sasaran `revalidatePath()`, yang akan berselisih diam-diam begitu
  dashboard pindah. Kini satu konstanta.
- `P2025` yang tidak tertangkap, penyaring yang tidak dapat diuji
  (kini `lib/groups/filter.ts` beserta testnya), dan `applyGroupOrder`
  yang menjadi mati.

**Yang MASIH menunggu tangan pemilik.** Tidak ada satu pun
pemeriksaan peramban yang dijalankan agen — alur OAuth menuntut
kredensial manusia sungguhan dan datanya menuntut baris nyata di
Neon. Daftar lengkapnya ada di bagian "Pemeriksaan peramban Unit 2"
di bawah, dan exit criteria Fase 3 di `ROADMAP.md` sengaja belum
dicentang untuk butir-butir itu.

**Penyimpangan Unit 1 yang ditangani dan yang tidak.**
`requireOwner()` kini dipanggil sendiri oleh keempat server action
DAN oleh halaman dashboard — penyimpangan pertama tertutup. Tetapi
**`callbackUrl` masih selalu menunjuk `/dashboard`**, bukan URL yang
diminta. Masih benar selama `/dashboard` satu-satunya rute di grup;
**task pertama Unit 3 yang menambah rute saudara wajib
memperbaikinya**, atau pemilik akan mendarat di tempat yang salah
setelah masuk dari halaman detail.

**Temuan Minor yang sengaja ditunda ke Unit 3:**

- `countGroupItems()` di `lib/db/groups.ts` tidak dipakai siapa pun —
  dialog hapus memakai `group.itemCount` dari payload daftar.
  Keberadaannya diwajibkan rencana Task 6, jadi dibiarkan; Unit 3
  akan memakainya atau menghapusnya.
- `GroupDeleteDialog` dirender di dalam `AccordionContent`, sehingga
  ikut terlepas bila akordeonnya ditutup. Sulit terpicu karena
  dialognya modal.
- `group-list.tsx` ada di 197 baris — di bawah batas ±200, tetapi
  hanya sedikit. Potongan berikutnya yang wajar adalah memindahkan
  keadaan akordeon terbuka ke `useOpenGroup(groups)`.

**Peringatan tentang berkas kerja.** Seluruh isi `.superpowers/sdd/`
— ledger, task brief, laporan implementer, dan paket diff — diabaikan
Git dan **tidak ikut ter-commit**. `git clean -fdx` menghapusnya tanpa
sisa; peta pemulihannya adalah `git log` ditambah bagian ini. Hal yang
sama berlaku untuk `.impeccable/surfaces/`.

### Temuan pemilik, 24 Agustus 2026 — isi akordeon terpotong

**Pemilik menjalankan sepuluh kelompok pemeriksaan, seluruhnya lulus,**
lalu menemukan satu cacat yang tidak tertangkap gerbang mana pun: saat
akordeon dibuka lalu "Ubah judul dan slug" ditekan, formulirnya terpotong
dan halaman tidak dapat digulir sama sekali — pemilik terpaksa memakai
`Tab` untuk berpindah kolom.

**Akarnya di Radix, bukan di kode kita.** `CollapsibleContentImpl`
mengukur tinggi isi di dalam `useLayoutEffect` yang bergantung pada
`[context.open, present]` — **bukan** pada isinya — lalu mengunci
hasilnya di `--radix-accordion-content-height`. Tidak ada
`ResizeObserver`. Pembungkus bawaan shadcn memasang tinggi itu secara
kaku lewat `h-(--radix-accordion-content-height)` dan menyertai
`overflow-hidden`, sehingga isi yang tumbuh SETELAH akordeon terbuka
akan terpotong. `Tab` tetap bekerja karena memfokuskan elemen terpotong
membuat peramban menggulirnya di dalam wadah yang memotong — justru
detail itulah yang memastikan diagnosisnya.

Diperbaiki di `7f9df08` dengan `h-auto` lewat `className`, dipasang dari
luar karena `components/ui/` tidak boleh diedit — pola yang sama dengan
`TRIGGER_ICON_LEFT`. Keadaan akordeon sekaligus dipindah ke
`useOpenGroup` supaya `group-list.tsx` tetap di bawah 200 baris (192).

**Ini penting untuk Unit 3.** Akordeon yang sama akan diisi daftar item
yang bertambah dan berkurang saat terbuka. Tanpa perbaikan ini, setiap
item yang ditambahkan setelah akordeon terbuka akan terpotong diam-diam.

**Dan ini bukti kedua bahwa batasan "tidak ada pengujian komponen" punya
harga nyata.** Di Unit 1 celahnya tombol keluar yang hilang di dashboard;
di Unit 2 celahnya isi akordeon yang terpotong. Keduanya lolos dari
rencana, implementasi, dan seluruh putaran review — dan keduanya
ditemukan pemilik dalam menit pertama memakainya.

### Verifikasi "Before Moving to the Next Unit", 24 Agustus 2026

Ketujuh butir di `ai-workflow-rules.md` diperiksa satu per satu dengan
bukti konkret, bukan diasumsikan dari status gerbang saja.

1. **Unit berjalan ujung ke ujung sesuai lingkupnya.** ✅ 24 commit dari
   `a896901`, 180 test, dan sepuluh kelompok pemeriksaan peramban oleh
   pemilik seluruhnya lulus (lihat bagian di atas).
2. **Tidak ada invarian `architecture.md` yang dilanggar.** ✅ Review
   akhir seluruh cabang mengaudit keempat belas invarian secara
   eksplisit — nol Critical, invarian 5 (setiap mutasi memeriksa OWNER
   di server) *upheld*, invarian 9 (validasi Zod) sempat dilanggar
   sebagian lalu diperbaiki dan re-review memastikan tuntas. Commit
   `b07f3fb` (pengaturan lint) tidak mengubah logika runtime apa pun —
   180 test sebelum dan sesudah identik.
3. **Matriks `evaluateAccess()` lulus.** — *Tidak berlaku.* `lib/access/`
   belum ada (`ls lib/access/` → tidak ditemukan) dan tidak ada satu
   rujukan pun ke `evaluateAccess` di `lib/`, `app/`, atau `components/`.
   Unit 2 tidak menyentuh aturan izin — `resolveGroupStatus()` sengaja
   dijaga sebagai fungsi tampilan terpisah, dicatat di bagian Next Up
   agar tidak dipakai ulang sebagai evaluator akses nanti.
4. **Antarmuka diperiksa di mode terang dan gelap.** ✅, dengan satu
   keterbatasan yang diakui secara jujur: agen tidak diizinkan masuk
   dengan Google OAuth, sehingga antarmuka dashboard yang sesungguhnya
   (akordeon, formulir, dialog) tidak dapat dibuka langsung oleh agen.
   Satu-satunya layar yang dapat dicapai tanpa sesi adalah layar masuk
   bawaan Auth.js (`/api/auth/signin`, tanpa `pages.signIn` kustom —
   dikonfirmasi lewat `grep -n "pages:" lib/auth/config.ts`) yang bukan
   bagian dari antarmuka yang dibangun unit ini, jadi memeriksa
   terang/gelapnya tidak bermakna apa pun. Mekanisme gelapnya sendiri
   dikonfirmasi nyata dari kode: `components/theme-toggle.tsx` menyakelar
   kelas `.dark` di `<html>` secara langsung, dan `app/globals.css`
   mendefinisikan `@custom-variant dark (&:where(.dark, .dark *))` —
   bukan hiasan tanpa efek. Pemeriksaan antarmuka sungguhan dijalankan
   pemilik sendiri sesi ini: sepuluh kelompok, termasuk baris eksplisit
   "Ulangi seluruh langkah di atas di mode gelap, lalu di lebar ponsel",
   dan hasilnya lulus — termasuk menemukan lalu memverifikasi ulang
   perbaikan akordeon terpotong.
5. **Halaman publik diperiksa di lebar layar ponsel.** — *Tidak
   berlaku.* Unit 2 tidak membangun satu pun halaman publik — dicek
   dengan mencari `app/**/[slug]*` dan direktori `g/`, nol hasil.
   Halaman publik `/g/[slug]` adalah lingkup unit yang lebih belakangan
   per `architecture.md` dan `ROADMAP.md`.
6. **`progress-tracker.md` mencerminkan pekerjaan yang selesai.** ✅
   Bagian ini sendiri adalah buktinya — diperbarui pada commit yang
   menyertai verifikasi ini.
7. **`npm run build` lulus.** ✅ Keluaran mentah `EXIT_CODE=0`,
   dicetak lengkap di respons yang menyertai verifikasi ini, empat rute
   dikompilasi tanpa galat.

### Integrasi Unit 3 — SELESAI, 27 Agustus 2026

Cabang `worktree-unit-3-item-dan-unggahan` digabung **fast-forward** ke
`main` pada `fe15666`, 25 commit dari `9fe3b99`. Worktree di
`.claude/worktrees/` dihapus lewat `git worktree remove` diikuti
`git worktree prune`, lalu cabangnya dihapus dengan `git branch -d`
(bukan `-D`) — sehingga Git sendiri yang membuktikan ia sudah tergabung
penuh sebelum dilepas.

```
9fe3b99..fe15666  main -> main
e88341b..fe15666  dev  -> dev
```

`dev` disusulkan dengan **`git merge --ff-only`, bukan `git branch -f`**.
Bedanya mengikat: `--ff-only` menolak bila `dev` ternyata menyimpan
sesuatu yang tidak ada di `main`, sedangkan `branch -f` akan menimpanya
diam-diam. `git rev-list --count main..dev` sudah bernilai `0` sebelum
dijalankan, tetapi memakai perintah yang gagal-aman lebih baik daripada
mengandalkan pemeriksaan itu benar. Ia lolos; 90 commit tersusul tanpa
kehilangan apa pun.

Keempat ref dibaca **langsung dari GitHub** dengan `git ls-remote`, bukan
dari cache lokal: `main`, `origin/main`, `dev`, dan `origin/dev`
seluruhnya `fe15666`.

**Temuan langkah verifikasi: `npm test` lulus 230/230 sementara
`npx tsc --noEmit` gagal dengan exit 2.** Setelah merge, checkout utama
belum pernah menjalankan `npm install` sejak `package.json` bertambah
lima dependensi, sehingga muncul enam galat `Cannot find module` untuk
`@vercel/blob` dan keempat paket `@dnd-kit`. Vitest tidak menyentuh
modul-modul itu — modul murni tidak mengimpornya, `blob.ts` hanya dipakai
kode server yang tidak diuji, dan uji batas impor hanya membaca berkas
sebagai teks. Artinya **"test lulus" bukan bukti bahwa cabang dapat
di-typecheck**, dan berhenti di situ akan menyerahkan `main` yang rusak.
Ditutup dengan `npm install`, lalu keempat gerbang dijalankan ulang dan
seluruhnya exit 0.

Pelajaran untuk unit berikutnya: **setelah merge yang membawa dependensi
baru, jalankan `npm install` di checkout utama sebelum menyatakan gerbang
lulus.** Peringatan lockfile ganda yang muncul saat build di dalam
worktree juga hilang setelah build dijalankan dari checkout utama — ia
memang artefak worktree, bukan cacat.

### Integrasi Unit 2 — SELESAI, 24 Agustus 2026

Cabang `unit-2-cms-group` sudah tergabung fast-forward ke `main` pada
`2d46f90` di sesi sebelumnya (23 commit dari `a896901`), worktree-nya
dibuang, dan cabangnya dihapus setelah terbukti tergabung penuh — lihat
bagian "Unit 2 SELESAI" di atas untuk rinciannya.

Sesi ini menambah tiga commit lagi di atas itu (perbaikan pengaturan
lint, dan verifikasi tujuh butir "Before Moving to the Next Unit" di
atas), lalu **`main` didorong ke `origin`**:

```
fd3da3f..4c14b24  main -> main
```

Dikonfirmasi lewat `git rev-list --count origin/main..main` → `0`,
yaitu `main` lokal dan `origin/main` sekarang **sejajar sempurna**.
Total 26 commit terkirim sejak `a896901`, HEAD sekarang `4c14b24`.

### Pemeriksaan peramban Unit 2 — SELESAI, 24 Agustus 2026

Dijalankan pemilik dari worktree, masuk sebagai
`laluardiansyah903@gmail.com`. **Sepuluh kelompok pemeriksaan, seluruhnya
lulus** — pembuatan group, slug bentrok turunan dan ketikan tangan,
tombol urutan termasuk ketukan ganda cepat, dialog hapus, papan ketik,
ketahanan keadaan lipat setelah muat ulang, serta pengulangan di mode
gelap dan lebar ponsel.

Satu cacat ditemukan di luar daftar dan diperbaiki (`7f9df08`), lalu
diperiksa ulang pemilik: formulir ubah judul kini terlihat utuh dan
halaman dapat digulir biasa.

Riwayat lengkap eksekusi unit ini — termasuk ketiga putusan pemilik atas
rencana yang bertentangan dengan dirinya sendiri, temuan review akhir,
dan pelajaran prosesnya — diselamatkan ke
`docs/superpowers/riwayat/2026-08-24-unit-2-ledger.md`.

### Unit 4 bagian kedua SELESAI — 28 Agustus 2026

Halaman group publik, gerbang item, `lib/audit/`, `lib/gate/`, dan
`lib/ratelimit/` dibangun sesuai
`docs/superpowers/specs/2026-08-27-unit-4-halaman-publik-design.md`.
Sepuluh task dieksekusi lewat subagent, masing-masing dengan review dua
putusan. Keempat gerbang lulus di akhir sesi: `typecheck` bersih, `lint`
nol peringatan, **324 pengujian di 31 berkas**, `build` sukses dengan
seluruh rute `app/(public)/` bertanda dinamis.

Task 10 (task ini) hanya mengerjakan bagian dokumentasi — Step 9 dan 10
dari `.superpowers/sdd/task-10-brief.md`. Step 1 sampai 8, seluruhnya
pemeriksaan peramban yang menuntut server pengembangan hidup, basis data
sungguhan, dan mata manusia, **diserahkan ke pemilik dan belum
dijalankan siapa pun**.

### Pemeriksaan peramban Unit 4 — BELUM DIJALANKAN, 28 Agustus 2026

Kesembilan pemeriksaan berikut **BELUM DIJALANKAN**. Tidak satu pun
boleh dianggap lulus sampai pemilik benar-benar menjalankannya dan
mencatat hasilnya di sini.

1. **CEK 1 — kebocoran di HTML.** Source halaman group: nol kecocokan
   untuk `targetUrl` item mana pun, host Vercel Blob, dan slug group
   lain.
2. **CEK 2 — pencatatan tanpa JavaScript.** JavaScript dimatikan, item
   `IDENTITY` diklik dan dimasuki: penerusan tetap terjadi, tepat satu
   baris `ITEM_ACCESS / GRANTED` tertulis berisi nama, email, dan waktu.
   **Catatan penting supaya hasil yang benar tidak salah dibaca sebagai
   cacat:** hitung barisnya *menurut `eventType`*, bukan totalnya —
   pengunjung yang sedang masuk juga menghasilkan satu baris `PAGE_VIEW`
   tersendiri untuk halaman group saat CEK ini dimulai. Kriteria sukses
   nomor 4 berbicara tentang satu baris `ITEM_ACCESS`, bukan satu baris
   di seluruh tabel.
3. **CEK 3 — ketiga penolakan tidak dapat dibedakan.** Group
   `shareEnabled = false`, group kedaluwarsa, dan slug yang tidak
   pernah ada: kode status dan halaman identik untuk ketiganya.
4. **CEK 4 — pratinjau pemilik.** Pemilik membuka group yang dicabut:
   halaman tampil normal, didahului spanduk peringatan berikon `Ban`.
5. **CEK 5 — rate limit.** Dua puluh dua percobaan gagal beruntun dari
   satu IP: dua puluh pertama 303, sisanya 429; baris
   `DENIED / RATE_LIMITED` tertulis, `RateLimitCounter` memuat satu
   baris ber-`count` 20.
6. **CEK 6 — berkas hilang di Blob.** Berkas item `UPLOAD` dihapus
   langsung dari Blob store: `Item.isBroken` menjadi `true`, satu baris
   `DENIED / FILE_MISSING` tertulis, halaman tidak tersedia tampil.
   **Ekspektasi yang benar, bukan cacat:** pemeriksaan ini menghasilkan
   **dua** baris `ITEM_ACCESS` — `GRANTED` lalu `FILE_MISSING` — dan
   itu urutan yang seharusnya, karena log ditulis tuntas dulu sebelum
   pengaliran berkas dicoba; baris `GRANTED` bukan galat. Jalur 503
   (Blob benar-benar gagal, bukan sekadar berkas hilang) berbeda dari
   CEK ini dan **belum pernah dijalankan dalam bentuk apa pun** — ia
   hanya terjangkau dengan merusak token Blob, dan itu belum dicoba.
7. **Pemeriksaan tampilan, mode terang dan gelap.** Halaman group,
   layar masuk, halaman tidak tersedia, dan halaman galat pencatatan
   di kedua mode.
8. **Pemeriksaan tampilan, lebar ponsel (375 px).** Kartu item melipat
   menjadi dua baris tanpa judul yang membungkus buruk; badan halaman
   tidak pernah menggulir horizontal.
9. **CEK 9 — status HTTP halaman galat pencatatan.** Buka
   `/galat-pencatatan` langsung dan baca kode statusnya di tab Network:
   ia wajib **500**, bukan 200. Keputusan U4-8 memilih halaman galat
   tersendiri justru supaya kegagalan pencatatan terbaca sebagai
   kegagalan oleh pengunjung maupun oleh alat pemantauan; status 200
   membatalkan seluruh alasan halaman ini dipisahkan dari halaman tidak
   tersedia. Di App Router, galat yang ditangkap `error.tsx` bersarang
   berisiko terlayani 200 begitu shell-nya sudah mengalir sebagian —
   itulah sebabnya statusnya harus dibaca langsung dari Network, bukan
   diasumsikan dari perilaku `throw` di kode.

## Next Up

1. **Unit 5 — panel Bagikan.** `visibility`, `expiresAt`,
   `shareEnabled`, penyalinan URL, QR code SVG dirender di server, dan
   spanduk pratinjau pemilik untuk group yang dicabut atau kedaluwarsa
   yang ia buka sendiri. **Prasyarat: kesembilan pemeriksaan peramban
   Unit 4 harus tuntas lebih dulu** — belum ada satu pun yang
   dijalankan, dan Unit 5 membangun di atas halaman group publik yang
   pemeriksaan itu memvalidasi.

   **Gerbang D1 berlaku untuk unit ini secara langsung:** domain harus
   sudah ditetapkan sebelum QR code dibangun, karena QR memuat URL
   absolut dan QR yang sudah dicetak tidak dapat ditarik kembali.
   Domain sudah ditetapkan — `diandiandian.web.id`, apex sebagai
   Production — jadi gerbang ini sudah terpenuhi, tetapi periksa ulang
   sebelum QR pertama dirender bahwa tidak ada perubahan arah
   pengalihan yang terlewat sejak keputusan itu dicatat.

   **Tiga hal warisan yang kini TERTUTUP, dicatat di sini supaya tidak
   dicari ulang:**

   - **`getFileStream()` yang ditunda Unit 3 kini ada**, di
     `lib/storage/blob.ts`, dipanggil hanya dari balik gerbang item.
   - **Sanitasi `fileName` sebelum menjadi header kini ditegakkan**
     fungsi murni beserta pengujiannya di
     `lib/storage/content-disposition.ts`.
   - **Pilihan sadar antara `requireOwner()` dan `getOwnerSession()`
     untuk gerbang item ternyata tidak diperlukan — gerbang tidak
     memakai keduanya.** Gerbang item melayani pengunjung, bukan
     pemilik, dan seluruh keputusan izinnya datang dari
     `evaluateItemAccess()`. Sesi dibaca lewat `auth()` biasa, sesudah
     pemeriksaan rate limit (U4-11), semata untuk mengetahui identitas
     yang dicatat — bukan untuk menggerbangi apa pun.

2. **Uji satu unggahan di preview Vercel sebelum Unit 4 dimulai.**
   `dev` sudah sejajar dengan `main` sejak 27 Agustus 2026, jadi alias
   `kumpulink-preview.vercel.app` akhirnya menunjuk kode sungguhan.
   Deployment itu yang pertama menyentuh Vercel Blob di luar mesin
   lokal, dan dua hal hanya dapat diketahui di sana:

   - **Autentikasi Blob lewat OIDC, bukan `BLOB_READ_WRITE_TOKEN`.** Di
     lokal kode memakai token statis; di atas Vercel ia memakai
     `VERCEL_OIDC_TOKEN` dan `BLOB_STORE_ID` yang terpasang sendiri.
     Jalur itu belum pernah dijalankan sekali pun.
   - **Batas 4,5 MB Vercel yang sesungguhnya.** Di lokal batas itu tidak
     ada, sehingga penolakan 413 yang diuji pemilik datang dari kode
     kita. Di produksi ia bisa datang dari Vercel lebih dulu, dengan
     bentuk respons yang berbeda.

   Lebih murah ketahuan sekarang daripada di tengah unit yang sudah
   ditandai paling berisiko.

## Open Questions

Kelima pertanyaan sebelumnya ditutup di Fase 0 dan dipindahkan
menjadi keputusan D1–D8 di bagian Architecture Decisions.
Yang tersisa bukan pertanyaan rancangan, melainkan nilai yang
baru ada setelah `docs/setup-layanan.md` dijalankan:

**Kosong.** Ketiganya ditutup pada 20 Agustus 2026. Ini memenuhi salah
satu gerbang rilis Fase 11 di `ROADMAP.md`, yang menuntut bagian ini
kosong atau berisi hal yang sengaja ditunda beserta alasannya.

Catatan penutupannya:

- ~~Nama alias preview Vercel~~ → **ditetapkan
  `kumpulink-preview.vercel.app`**, menunjuk ke cabang `dev`.
  Pilihan sebaliknya — tidak membuat alias — ditolak secara
  sadar, karena akan membuat alur uji utama Fase 10 pertama
  kali berjalan sungguhan langsung di produksi.
- ~~Alamat untuk `OWNER_EMAIL`~~ → **ditetapkan
  `laluardiansyah903@gmail.com`**, sudah tertulis di
  `.env.local`. Perhatikan alamat ini berbeda dari yang
  terdaftar di sesi pengembangan (`laluardian23@gmail.com`)
  dan berbeda pula dari akun GitHub (`diannidaayman`).
  Dugaan di catatan sebelumnya keliru.

- ~~Status verifikasi domain di Resend~~ → **dikonfirmasi
  *Verified* oleh pemilik, 20 Agustus 2026.** Keempat record
  DNS-nya sudah dipastikan benar dari luar sejak 19 Agustus
  dan diperiksa ulang 20 Agustus — NS menjawab Cloudflare,
  DKIM terbaca dari resolver `1.1.1.1`. Yang menutupnya adalah
  status di layar Resend, yang memang hanya dapat dibaca di
  sana. Dengan ini kriteria sukses nomor 9 tidak lagi
  terhalang prasyarat layanan.

Domain sudah ditetapkan: **`diandiandian.web.id`**, dibeli di
DomaiNesia pada 19 Agustus 2026, dengan DNS dikelola Cloudflare
(`kallie.ns.cloudflare.com`, `mitchell.ns.cloudflare.com`).

## Release Prerequisites

Hal-hal yang tidak berbentuk kode, wajib benar sebelum acara
pertama, dan mudah terlupa karena tidak ada yang gagal saat
dilupakan:

- **Status publikasi OAuth Google harus *In production*.**
  Selama berstatus *Testing*, aplikasi dibatasi **100
  pengguna** dan setiap orang melihat layar peringatan bahwa
  aplikasi belum terverifikasi. `project-overview.md`
  menyebut acara dengan dua ratus peserta, jadi batas ini
  adalah penghalang rilis, bukan detail administratif.
  Periksa sendiri di konsol, jangan diasumsikan.
- **Blob store harus berstatus private.** Store publik tidak
  dapat diubah menjadi privat belakangan.
- **Domain pengirim harus berstatus Verified di Resend.**
  Tanpa itu, email keputusan tidak sampai ke pemohon.
- **Workflow GitHub Actions terjadwal harus aktif.** GitHub
  menonaktifkannya otomatis setelah 60 hari repositori tidak
  aktif. Periksa sebelum tiap acara.
- ~~**Cabang `dev` harus disusulkan sebelum Fase 10.**~~
  **TERPENUHI 27 Agustus 2026, dan dipenuhi lagi hari yang sama
  setelah Unit 4 bagian pertama digabung — kali ini di `205423d`.**
  Sebelumnya `dev` disusulkan ke `main` di `fe15666` dengan
  `merge --ff-only` lalu didorong, setelah sempat tertinggal
  90 commit dan berisi keadaan Fase 0.
  Alias preview `kumpulink-preview.vercel.app` kini menunjuk
  kode sungguhan.

  **Tetap berlaku sebagai kebiasaan:** susulkan `dev` setiap
  kali sebuah unit digabung ke `main`. Kalau tidak, prasyarat
  ini akan terbuka lagi diam-diam, dan Fase 10 menjalankan
  alur uji utamanya di lingkungan preview — di titik itu
  preview akan menampilkan aplikasi yang salah tanpa
  peringatan apa pun.

- **Repositori harus tetap publik** selama penjadwalan
  memakai GitHub Actions tiap lima menit. Repositori privat
  menembus kuota gratis; lihat keputusan D5.

## Architecture Decisions

### Keputusan Unit 4 — 27 Agustus 2026

**U4-1 — `APPROVAL` tanpa catatan izin ditolak sebagai
`NOT_FOUND`.** Matriks Unit 4 menyebut hasilnya "ditolak"
tanpa menyebut alasannya, dan enum `DenyReason` tidak punya
nilai untuk keadaan ini: `REQUEST_REJECTED` dan
`REQUEST_REVOKED` keduanya keliru karena tidak ada permintaan
yang pernah dibuat. Dipilih `NOT_FOUND`, nilai yang di bagian
Security Practices `code-standards.md` sudah menjadi wajah
dari "tidak dapat dilayani, dan tidak ada yang perlu diketahui
lebih jauh". Menambah nilai enum baru ditolak karena menuntut
migrasi Prisma di langkah yang lingkupnya justru menolak
menyentuh database, untuk nilai yang mati lagi di Unit 7.
`ITEM_INACTIVE` ditolak karena `isActive` item itu bernilai
true, sehingga riwayat akan berbohong kepada pemilik.

Ini memenuhi kriteria sukses nomor 8: sikap bawaannya menolak,
bukan meloloskan.

**Unit 7 wajib mengganti cabang ini menjadi `NEEDS_REQUEST`
beserta kelima cabang status lainnya.** Selama belum, cabang
`APPROVAL` di `lib/access/evaluate-access.ts` menolak, dan
komentar di sana menyebut hal ini.

**U4-2 — Pemilik lolos di tahap dua, sesudah kedua pemeriksaan
struktural.** Aturan izin baru; sudah dituliskan ke
`architecture.md` bagian Access Evaluation dalam perubahan yang
sama. Alasan letaknya ada di sana.

**U4-3 — Evaluator dipecah dua fungsi.**
`evaluateItemAccess()` memanggil `evaluateGroupAccess()` di
baris pertamanya dan mengembalikan hasilnya bila bukan
`GRANTED`. Dengan begitu invarian 6 menjadi struktur kode,
bukan disiplin pemanggil — tidak ada cara memanggil tahap dua
tanpa tahap satu lolos lebih dulu. Gerbang item memanggil
`evaluateItemAccess()` saja, satu panggilan, bukan dua.

### Keputusan Unit 4 bagian kedua — 27–28 Agustus 2026

Rinciannya di
`docs/superpowers/specs/2026-08-27-unit-4-halaman-publik-design.md`,
bagian "Keputusan yang diambil sebelum implementasi". U4-4 sampai U4-9
diputuskan sebelum implementasi mulai; U4-10 sampai U4-13 lahir saat
kode ditulis dan tidak ada di spesifikasi.

**U4-4 — `NEEDS_LOGIN` merender layar masuk yang menyebut group, bukan
mengalihkan langsung ke Google.** Tiga dokumen sebelumnya tidak
sejalan: `project-overview.md` menuntut layar yang menyebut judul
group, `architecture.md` menyebut pengalihan langsung, brief
impeccable menutup barisnya di luar lingkup. Ketiganya tidak dapat
berlaku sekaligus. Dipilih layar masuk, dibangun di kedua tempat yang
menghasilkan `NEEDS_LOGIN` — halaman group menyebut judul group,
gerbang item menyebut judul group **dan** nama item. Menyebut nama
item bukan kebocoran karena pengunjung baru saja melihatnya di halaman
group yang ia klik. Alternatif yang ditolak: pengalihan langsung ke
Google, yang tidak memberi pengunjung kesempatan mengetahui apa yang
akan dibuka sebelum menyerahkan identitasnya.

**U4-5 — penghitung rate limit hanya menghitung percobaan yang gagal,
ambang 20 per 10 menit per IP.** Kendalanya: dua ratus peserta di WiFi
ruang acara berbagi satu alamat IP, dan rate limit yang menghitung
seluruh permintaan akan mencekik satu ruangan penuh peserta sah.
Penghitung naik hanya ketika gerbang berakhir `DENIED` (termasuk
`FILE_MISSING`, tidak termasuk `RATE_LIMITED` itu sendiri). Alternatif
yang ditolak: menghitung seluruh permintaan termasuk yang berhasil,
yang akan mencekik peserta sah; dan menaikkan penghitung pada
`RATE_LIMITED` sendiri, yang hanya memperpanjang hukuman klien yang
sudah dihentikan tanpa menambah perlindungan.

**U4-6 — gerbang item berbentuk route handler, halaman keadaan sebagai
route anak.** Gerbang harus menghasilkan delapan keluaran berbeda dari
satu URL, dan Next.js tidak punya satu bentuk berkas yang sanggup
merender HTML maupun mengalirkan byte. Dipilih `route.ts` sebagai
gerbang, dengan keluaran HTML dijawab 303 ke route anak yang
mengevaluasi ulang untuk dirinya sendiri dan tidak mencatat.
Alternatif yang ditolak: gerbang sebagai `page.tsx` dengan route anak
`/berkas` untuk mengalirkan byte — ditolak karena route berkas itu
dapat dibuka langsung dan wajib ikut mencatat, memecah `ITEM_ACCESS`
menjadi dua tempat penulisan yang hanya dijaga kehati-hatian, dan
karena berkas unggahan sensitif akan menempuh jalur terpanjang: dua
render server, dua evaluasi.

**U4-7 — kegagalan pencatatan berarti tidak ada yang disajikan,
berlaku untuk `ITEM_ACCESS / GRANTED` maupun `PAGE_VIEW`.**
`code-standards.md` sebelumnya hanya mengatur kegagalan pada
`ITEM_ACCESS / GRANTED`; nasib kegagalan `PAGE_VIEW` tidak tertulis.
Dipilih satu aturan untuk keduanya: gagal menulis log pada peristiwa
yang menyajikan sesuatu berarti tidak ada yang disajikan. Alasannya
dua aturan berbeda untuk dua peristiwa akan menjadi dua perilaku yang
harus diingat, dan yang lebih longgar akan menjadi preseden bagi yang
berikutnya. Alternatif yang ditolak: membiarkan `PAGE_VIEW` gagal diam-
diam sementara halaman tetap tampil, yang berarti riwayat bisa hilang
tanpa jejak apa pun.

**U4-8 — pengunjung yang gagal dicatat melihat halaman galat
tersendiri, HTTP 500.** Yang tidak tertulis sebelumnya adalah apa yang
dilihat pengunjung saat penerusan dibatalkan. Dipilih halaman galat
pencatatan tersendiri, menyatakan akses tidak dapat dicatat sehingga
item tidak dibuka. Alternatif yang ditolak: memakai kembali halaman
tidak tersedia, yang berbohong — pengunjung akan menyimpulkan link-nya
mati dan berhenti mencoba, padahal berkasnya ada dan gerbang baru saja
meloloskannya; dan halaman galat bawaan Next.js, ditolak karena
teksnya berbahasa Inggris.

**U4-9 — `redirectTo` disusun dari parameter route, tidak pernah dari
query string.** Tombol masuk memanggil `signIn("google", { redirectTo })`.
Dipilih menyusun nilainya di server dari parameter route halaman yang
bersangkutan. Alternatif yang ditolak: membaca `redirectTo` dari query
string lalu memvalidasinya — ditolak karena pengalihan terbuka lebih
aman dicegah dengan tidak ada tempat masuknya sama sekali, bukan
dengan validasi yang bisa keliru.

**U4-10 — kegagalan `getFileStream()` menjawab HTTP 503 satu kalimat,
tanpa menandai `isBroken` dan tanpa mencatat `FILE_MISSING`.** Lahir
saat kode ditulis: SDK Blob sudah menandai ketiadaan berkas dengan
mengembalikan `null`, sehingga sebuah `catch` di `getFileStream()`
hanya akan menyamakan kegagalan sungguhan — Blob tumbang, token salah
— dengan "berkasnya tidak ada", dan gerbang akan menandai `isBroken`
permanen serta menulis riwayat yang berbohong kepada pemilik.
Alternatif yang ditolak: menangkap seluruh galat di `getFileStream()`
dan memperlakukannya sama seperti berkas hilang — ditolak karena
gangguan sementara pada Blob akan salah ditafsirkan sebagai kerusakan
permanen pada item.

**U4-11 — sesi dibaca sesudah pemeriksaan rate limit, bukan
sebelumnya.** Lahir saat kode ditulis: `auth()` memakai strategi sesi
database, jadi ia sebuah kueri; menjalankannya lebih dulu membuat
klien yang sudah melewati ambang tetap membayar satu kueri sesi
sebelum menerima 429, melanggar butir 0 rancangan gerbang. Konsekuensi
yang diterima: baris `DENIED / RATE_LIMITED` tercatat tanpa nama dan
email — alamat IP adalah penanda yang relevan di sana, karena rate
limit ada untuk menghentikan penebak `itemId`, yang hampir selalu
anonim. Alternatif yang ditolak: membaca sesi lebih dulu demi baris
log yang lebih lengkap, ditolak karena membayar kueri database untuk
klien yang seharusnya sudah dihentikan di langkah pertama.

**U4-12 — item `EXTERNAL` tanpa `targetUrl` ditolak sebagai
`NOT_FOUND`, bukan `FILE_MISSING`.** Lahir saat kode ditulis, preseden
sama dengan U4-1: tidak ada berkas yang terlibat, dan riwayat tidak
boleh berbohong kepada pemilik dengan mencatat kegagalan berkas untuk
sesuatu yang bukan berkas. `isBroken` tetap ditandai, karena itulah
kolom yang memberi tahu pemilik ada baris yang perlu ia perbaiki.
Alternatif yang ditolak: `FILE_MISSING`, ditolak karena istilah itu
menjanjikan sesuatu yang tidak pernah ada.

**U4-13 — modul `lib/gate/` berdiri sendiri, di luar `lib/audit/`.**
Lahir saat kode ditulis. Memuat keputusan terminal gerbang: penyusunan
respons untuk akses yang lolos, dan penolakan beserta pencatatannya.
Ia di luar `lib/audit/` supaya modul itu tetap murni penulis
`AccessLog` — menandai item rusak dan menaikkan penghitung rate limit
adalah urusan gerbang, bukan urusan riwayat. Alternatif yang ditolak:
menaruh logika ini di `lib/audit/` bersama penulisan log, ditolak
karena akan mencampur "mencatat apa yang terjadi" dengan "memutuskan
apa yang terjadi selanjutnya" di satu modul.

### Keputusan Fase 0 — 19 Agustus 2026

Kedelapan keputusan yang sebelumnya menggantung, ditutup
sebelum satu baris kode aplikasi ditulis.

- **D1 — Domain kustom `.web.id`, bukan subdomain
  `*.vercel.app`.** Digabung dengan D3: satu domain menutup
  kebutuhan alamat aplikasi dan alamat pengirim email
  sekaligus. Vercel memasang domain kustom tanpa biaya di
  paket Hobby, jadi tambahan biayanya nol di luar domain itu
  sendiri. Menetapkannya sekarang berarti QR code yang
  dicetak tidak perlu dicetak ulang kelak.

- **D2 — Zona waktu tampilan ditetapkan tetap
  `Asia/Jayapura`, disertai label zona yang terbaca.** Server
  tetap berjalan dalam UTC; hanya tampilannya yang dipatok.
  Riwayat akses dipakai untuk mempertanggungjawabkan
  kejadian, dan bila jam mengikuti perangkat pembaca, dua
  orang yang membahas baris yang sama menyebut angka
  berbeda. Aturannya ditulis di `ui-context.md`.

- **D3 — Domain `.web.id` yang sama diverifikasi di Resend,
  disarankan lewat subdomain pengiriman.** Domain uji bawaan
  `resend.dev` hanya dapat mengirim ke alamat pemilik akun,
  sedangkan email keputusan justru ditujukan ke pemohon —
  orang lain. Tanpa domain terverifikasi, kriteria sukses
  nomor 9 tidak dapat dipenuhi. Email pemberitahuan ke
  pemilik tetap dikirim ke `OWNER_EMAIL`; alamat terpisah
  akan menuntut variabel lingkungan baru dan tidak
  diperlukan sekarang.

- **D4 — `AccessLog` disimpan satu bulan.** Kebijakannya
  berlaku sejak sekarang, pemangkasannya diimplementasikan
  setelah rilis. Konsekuensi yang diterima secara sadar:
  riwayat sebuah acara hilang sebulan setelahnya, sehingga
  dua acara yang berjauhan tidak dapat dibandingkan. Riwayat
  dipakai untuk menelusuri satu acara yang baru berlalu,
  bukan untuk statistik jangka panjang.

- **D5 — Penjadwalan lewat workflow GitHub Actions terjadwal
  tiap lima menit, pada repositori publik.** Vercel Cron di
  paket Hobby hanya berjalan sekali sehari, dan ekspresi yang
  lebih sering ditolak saat deployment — jadwal harian tidak
  dapat memenuhi kriteria sukses nomor 10. Endpoint cron
  aplikasinya tidak berubah sedikit pun; yang berganti hanya
  siapa yang memanggilnya.

  Repositori dijadikan publik karena GitHub menagih Actions
  per menit dengan pembulatan ke atas per job: 288 job sehari
  menghabiskan sekitar 8.640 menit sebulan, jauh melewati
  kuota 2.000 menit repositori privat. Repositori publik
  tidak dibatasi menit. Konsekuensinya kode Kumpulink terbaca
  umum — dapat diterima karena tidak ada rahasia di dalam
  kode, dan model keamanan aplikasi ini memang tidak
  bersandar pada kerahasiaan implementasinya. Bila
  repositori kelak dijadikan privat, D5 wajib ditinjau ulang.

- **D6 — `ui-context.md` bersifat mengikat terhadap skill
  impeccable.** Token warna, Inter dan JetBrains Mono, skala
  border radius, pendekatan mobile-first, dan seluruh anatomi
  kartu item diperlakukan sebagai komitmen. impeccable
  memperluas sistem itu ke komposisi, hierarki, keadaan, dan
  gerak — bukan menggantinya.

- **D7 — Jalur build impeccable code-led, bukan comp-led.**
  Token sudah dipatok dan jumlah keadaannya banyak — tujuh
  keadaan izin pada kartu item saja. Ambisi visualnya
  dititipkan ke direction contract dan diaudit di finish
  review, bukan ke satu gambar viewport pertama.

- **D8 — Status publikasi aplikasi OAuth Google diubah ke
  *In production*.** Status *Testing* membatasi 100 pengguna
  dan menampilkan layar peringatan aplikasi belum
  terverifikasi, sedangkan `project-overview.md` menyebut
  acara dua ratus peserta. Dengan hanya scope `openid`,
  `email`, dan `profile` — seluruhnya tidak sensitif —
  peninjauan penuh umumnya tidak berlaku, tetapi ini wajib
  dipastikan sendiri di konsol sebelum acara pertama.

### Keputusan Unit 1 — 21 Agustus 2026

- **D9 — Mesin primitif shadcn tetap Radix, bukan Base UI.**
  CLI shadcn versi sekarang menawarkan tiga pilihan — base,
  radix, aria — dan justru melabeli **base** sebagai
  *Recommended*. Task 2 memilih radix; keputusan itu
  dikonfirmasi pemilik dan ditetapkan di sini.

  Alasannya bukan bahwa Radix lebih baik secara teknis,
  melainkan tiga hal yang berlaku khusus untuk proyek ini.
  Pertama, dua puluh komponen sudah tergenerate dan terbukti
  bekerja — menukarnya berarti membuang keadaan terverifikasi
  demi keadaan yang belum. Kedua, seluruh file konteks ditulis
  saat shadcn identik dengan Radix, termasuk anatomi kartu item
  dan tujuh keadaan izin di `ui-context.md`. Ketiga, dan yang
  paling menentukan: proyek ini dikerjakan satu orang yang
  sedang belajar, dan bahan rujukan tentang Radix jauh lebih
  banyak — bobot itu nyata saat macet sendirian.

  Horizon proyeknya juga pendek. Kumpulink dibangun untuk satu
  acara; keunggulan pustaka yang lebih baru umumnya baru
  terasa dalam hitungan tahun.

  **Pemicu peninjauan ulang, wajib dipantau:** bila `shadcn
  add` berhenti menghasilkan varian Radix, atau bila komponen
  yang dibutuhkan hanya tersedia untuk Base UI. Bila salah
  satu terjadi, tukar saat itu juga — jangan menunggu. Biaya
  penukaran naik tajam setiap unit yang menulis komponen di
  atasnya, dan sekarang adalah titik termurahnya.

### Keputusan rancangan awal

- **Pemilik tunggal, bukan multi-pengguna.** Menghilangkan
  kebutuhan kolom kepemilikan per baris dan seluruh lapisan
  isolasi data antar penyewa. Bila kelak diperlukan banyak
  pemilik, `Group` perlu ditambah `ownerId` dan setiap query
  perlu disaring — perubahan besar, dan itu memang disengaja
  untuk tidak dibayar sekarang.

- **Group berstruktur datar, satu group satu link berbagi.**
  Menolak group bersarang. Collapse dan expand hidup di
  dashboard sebagai cara menelusuri banyak group, bukan di
  halaman publik. Halaman publik hanya menampilkan satu
  group.

- **Semua klik lewat gerbang aplikasi.** Setiap item
  dirender sebagai tautan ke `/g/[slug]/i/[itemId]`, tidak
  pernah ke tujuan aslinya. Ini yang membuat setelan
  `accessMode` benar-benar berlaku dan membuat log tidak
  dapat gagal. Alternatif yang ditolak: mencatat klik
  lewat JavaScript di klien, yang membuat URL tujuan bocor
  di source halaman dan log hilang bila JavaScript diblokir.

- **Tiga tingkat akses per item, bukan dua.** `accessMode`
  bernilai `OPEN`, `IDENTITY`, atau `APPROVAL`, menggantikan
  saklar `requireIdentity` di rancangan awal. `IDENTITY`
  mempertahankan perilaku semula — teridentifikasi lalu
  langsung lewat — dan `APPROVAL` menambahkan alur
  permintaan yang diputuskan pemilik.

  Rancangan awal menolak alur persetujuan karena pemilik
  tidak selalu daring saat acara berlangsung, dan itu
  masih benar. Karena itu keduanya hidup berdampingan
  sebagai pilihan per item, bukan saling menggantikan:
  bahan yang dibutuhkan peserta saat acara berjalan
  disetel `IDENTITY`, dan hanya yang benar-benar rahasia
  disetel `APPROVAL`. Menyetel seluruh item ke `APPROVAL`
  akan mengembalikan persoalan menunggu itu.

- **Permintaan yang ditolak tidak dapat diajukan ulang.**
  Kunci unik `(itemId, userId)` membuat satu orang hanya
  punya satu catatan per item. Ini mencegah pengajuan
  berulang yang harus ditutup satu per satu. Konsekuensinya,
  orang yang ditolak karena salah paham harus menghubungi
  pemilik di luar aplikasi — dan pemilik dapat mengubah
  keputusannya sendiri dari dashboard.

- **Izin ikut mati bersama group.** `AccessRequest.expiresAt`
  diisi dari `group.expiresAt` saat disetujui. Izin yang
  terlupakan adalah cara paling umum akses bocor diam-diam,
  dan aturan ini menutupnya tanpa menuntut pemilik
  mengingat apa pun.

- **Keadaan setengah jadi bersikap menolak.** Skema lengkap
  ditulis sejak Unit 1, tetapi `APPROVAL` ditolak oleh
  `evaluateAccess()` sampai Unit 7 selesai. Fitur yang
  belum jadi tidak boleh berarti pintu yang terbuka.

- **Pemberitahuan dikumpulkan, bukan dikirim satu per satu.**
  Maksimal satu email per group per sepuluh menit, dikirim
  lewat endpoint cron yang dipanggil penjadwal di luar
  aplikasi, bukan dengan menahan permintaan HTTP.
  Tanpa ini, satu acara ramai membanjiri kotak masuk pemilik
  dan pemberitahuannya berhenti dibaca — yang justru
  menggagalkan tujuannya.

- **Kegagalan email tidak membatalkan permintaan.** Email
  adalah lapisan pemberitahuan di atas keadaan, bukan
  keadaan itu sendiri. Permintaan tetap tercatat dan tetap
  terlihat di dashboard.

- **Login Google, bukan formulir nama.** Nama dan email
  terverifikasi membuat riwayat akses dapat
  dipertanggungjawabkan. Formulir isian bebas ditolak karena
  menghasilkan log yang tidak dapat dijadikan dasar apa pun.

- **Auth.js, bukan Clerk.** Pengunjung aplikasi ini banyak
  dan sekali pakai — satu acara dapat menghasilkan ratusan
  identitas baru dalam sehari. Model harga per pengguna
  aktif bulanan tidak sejalan dengan pola pemakaian ini.

- **Item dan berkas bersumber ganda.** `source` bernilai
  `EXTERNAL` atau `UPLOAD`, dipilih per item. Hanya item
  `UPLOAD` yang benar-benar terlindungi oleh gerbang; item
  `EXTERNAL` tetap dapat disebarkan ulang setelah satu orang
  melewati gerbang. Batasan ini diterima secara sadar, dan
  perlu diketahui saat memilih tempat menyimpan dokumen
  sensitif.

- **Aturan izin dipusatkan di satu fungsi murni.** Membuat
  seluruh aturan dapat dibaca dan diuji sebagai matriks di
  satu tempat, dan mencegah munculnya jalur yang lupa
  diperiksa.

- **Penolakan tidak dapat dibedakan dari luar.**
  `NOT_FOUND`, `REVOKED`, dan `EXPIRED` menghasilkan respons
  identik. Konsekuensinya, pengunjung yang menerima link
  kedaluwarsa tidak diberi tahu bahwa link itu pernah ada —
  ia perlu bertanya ke pemilik. Ini pertukaran yang
  disengaja.

- **Log ditulis tuntas sebelum penerusan.** Penulisan
  ditunggu dengan `await`, bukan dijadikan pekerjaan latar,
  karena fungsi serverless dapat berhenti segera setelah
  respons terkirim.

- **Persetujuan tidak menutup kebocoran tautan eksternal.**
  Pemohon yang disetujui pada item bersumber `EXTERNAL`
  tetap melihat URL aslinya dan dapat meneruskannya.
  Batasan ini tidak dapat dihilangkan tanpa berhenti
  menautkan ke layanan luar. Yang dilakukan aplikasi
  hanyalah memperingatkan pemilik saat kombinasi itu
  dipilih, dan menyarankan mengunggah berkasnya.

- **Kunjungan halaman anonim tidak dicatat.** `PAGE_VIEW`
  hanya ditulis bila pengunjung sedang masuk. Kunjungan
  anonim menghasilkan baris yang banyak dan tidak menjawab
  pertanyaan siapa pun. `ITEM_ACCESS` tetap selalu dicatat,
  bahkan tanpa identitas, karena masih berguna sebagai
  hitungan klik.

- **Ekspor CSV tidak dibangun sekarang.** Seluruh datanya
  sudah ada di `AccessLog`, jadi menambahkannya kelak tidak
  memerlukan perubahan model data.

## Session Notes

- **Sesi 21 Agustus 2026 mengeksekusi Unit 1 penuh** lewat
  sembilan task subagent, dan menutupnya. Lima pelajaran proses
  di bawah tidak terbaca dari kode mana pun, jadi dicatat di
  sini supaya tidak ditemukan ulang dengan biaya yang sama.

- **Spesifikasi yang diam tidak dapat ditangkap pemeriksa mana
  pun.** Dashboard ter-ship tanpa tombol keluar, lolos dari
  tujuh putaran review, empat gerbang otomatis, dan 54 test —
  bukan karena lalai, melainkan karena `ui-context.md` hanya
  mewajibkan bilah identitas untuk halaman publik dan diam soal
  dashboard. Yang menangkapnya adalah pemilik yang mencoba
  memakainya. Pemeriksaan peramban oleh pemilik di tiap unit
  bukan formalitas; ia menutup kelas cacat yang gerbang
  otomatis tidak bisa sentuh.

- **Laporan subagent mengarang ekor SHA.** Prefix pendeknya
  benar, empat puluh karakternya karangan — dua kali, di dua
  laporan berbeda. Ketahuan karena diverifikasi dengan `git
  rev-parse`. Setiap klaim SHA dari subagent wajib diperiksa
  sendiri, dan hal yang sama berlaku untuk klaim `npm audit`:
  satu laporan menyatakan enam kerentanan pre-existing padahal
  tiga di antaranya dibawa task itu sendiri.

- **Pencarian-ganti global pada berkas rencana menabrak prosa
  dan string literal, bukan hanya identifier.** Sapuan
  `normalkan` → `normalize` mengubah kata Indonesia di dalam
  komentar menjadi "dinormalize"; sapuan `PEMILIK` →
  `OWNER_ADDRESS` mengubah isi alamat uji menjadi
  `OWNER_ADDRESS@CONTOH.COM`, yang membuat testnya gagal bila
  disalin apa adanya. Sapuan berikutnya harus dibatasi pada
  bentuk kodenya, bukan seluruh berkas.

- **`prisma db pull` tanpa `--print` menimpa
  `prisma/schema.prisma`.** Terbukti saat menguji skrip: 88
  baris tertulis ulang dari hasil introspeksi dan harus
  dipulihkan dari commit. Di proyek ini skema adalah sumber
  kebenaran, bukan database — karena itu skrip `db:inspect`
  memakai `--print` dan tidak ada skrip yang bisa menimpanya.

- **Menyalakan `npm run dev` tidak memicu validasi variabel
  lingkungan.** Next.js App Router meng-compile rute sesuai
  permintaan, jadi server mencetak *Ready* dan tampak sehat
  meski variabelnya kosong. Galatnya baru muncul saat ada
  permintaan HTTP yang menyentuh rute pengimpor `env`.
  Prosedur pemeriksaannya kini menyertakan permintaan itu.


- Dokumen perencanaan ini disusun pada 18 Agustus 2026
  melalui sesi brainstorming.
- Nama proyek: Kumpulink.
- Sesi 19 Agustus 2026 menutup D1–D8, membangun kerangka
  repositori, dan menuntaskan seluruh prasyarat yang punya
  waktu tunggu. Riwayat commit-nya: `2800c4b` Fase 0,
  `8f57746` bagian Cloudflare, `acfe36a` penetapan domain,
  `da8ede7` Resend dan rahasia lokal selesai.
- **Identitas commit sudah diperbaiki, 20 Agustus 2026.**
  Akun GitHub ternyata sudah ada — `diannidaayman` — dan `gh`
  CLI sudah login di mesin pengembangan; catatan lama yang
  menyebut akunnya belum dibuat keliru. Kelima commit ditulis
  ulang ke alamat noreply asli akunnya.

  **Catatan untuk kasus serupa kelak: `git commit --amend`
  hanya menyentuh commit terakhir.** Saran lama di tempat ini
  akan menyisakan empat commit dengan alamat palsu. Bentuk
  yang benar untuk seluruh riwayat, dan yang benar-benar
  dipakai:

  ```
  git tag backup-identitas
  git config user.email "<noreply asli>"
  git rebase --root --exec 'git commit --amend --no-edit --author="Nama <noreply asli>"'
  ```

  `--author` dipakai, bukan `--reset-author`, karena
  `--reset-author` ikut menyetel ulang tanggal author menjadi
  waktu sekarang — tanggal 19 Agustus akan hilang. Hasilnya
  diverifikasi dengan `git diff backup-identitas main`, yang
  harus kosong: isi berkas identik, hanya identitasnya yang
  berganti.
- **Rahasia tidak pernah masuk percakapan.** Nilai di
  `.env.local` diisi pemilik sendiri, atau dibuat lewat
  perintah yang menulis langsung ke berkas tanpa mencetak
  hasilnya. Pemeriksaan dari sesi Claude Code hanya membaca
  bentuknya — panjang karakter, awalan, ada tidaknya spasi
  nyasar — bukan isinya.
- Variabel lingkungan yang dibutuhkan, sebelas seluruhnya:
  `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`,
  `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `OWNER_EMAIL`,
  `BLOB_READ_WRITE_TOKEN`, `BLOB_STORE_ID`, `RESEND_API_KEY`,
  `EMAIL_FROM`, `CRON_SECRET`. Namanya tercatat tanpa nilai
  di `.env.example`; cara memperoleh nilainya ada di
  `docs/setup-layanan.md`.

  Dua di antaranya baru ditambahkan di Fase 0.
  `DIRECT_URL` diperlukan karena Neon menyajikan koneksi
  ter-pool sedangkan migrasi Prisma menuntut koneksi
  langsung. `BLOB_STORE_ID` diperlukan oleh private store
  Vercel Blob, dan terpasang sendiri di lingkungan Vercel
  dari kaitan store ke proyek.
- Alur uji utama yang harus selalu bisa dijalankan: buat
  group "Rapat Kerja" berisi tautan absensi bermode `OPEN`,
  PDF rundown yang diunggah bermode `IDENTITY`, dan notulen
  yang diunggah bermode `APPROVAL`; setel group ke
  `REQUIRE_LOGIN` dengan kedaluwarsa; buka linknya dari
  peramban lain dengan akun berbeda; ajukan izin untuk
  notulen; setujui dari dashboard; pastikan email keputusan
  diterima dan seluruhnya tercatat di riwayat.
