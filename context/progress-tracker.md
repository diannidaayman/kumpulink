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
- Tidak ada lagi pertanyaan terbuka.

## Current Goal

- **Fase 2 — arah desain lewat skill impeccable**, sebelum
  antarmuka sungguhan mulai ditulis di Unit 2. Urutannya di
  `ROADMAP.md` Fase 2, prompt P2.1–P2.4 di
  `PROMPT-PLAYBOOK.md`.
- Tidak ada keputusan yang menggantung. D9 menetapkan mesin
  primitif shadcn tetap Radix.

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
  - Cabang masih `worktree-unit-1-fondasi`, belum digabung. HEAD
    sekarang `b9653814d06316639e8b6c1ad44387f2a0adb350`, menggantikan
    `51fc5c0` sebagai commit terbaru sebelum penggabungan.

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
    commit. Belum di-push ke `origin`.

## In Progress

### Unit 2 BERJALAN — dijeda 21 Agustus 2026 karena limit mingguan

Eksekusi Unit 2 sudah dimulai dengan alur **Subagent-Driven
Development** dan dijeda di tengah jalan. Bacalah bagian ini
lebih dulu sebelum melanjutkan.

**Di mana kita berhenti**

| | |
| --- | --- |
| Branch kerja | `unit-2-cms-group`, dicabang dari `a896901` |
| `main` | `a896901`, sejajar dengan pangkal branch |
| Rencana | `docs/superpowers/plans/2026-08-21-unit-2-cms-group.md`, 13 task |
| Task 1 | **Ter-commit di `786770d`, TETAPI BELUM DIREVIEW** |
| Task 2–13 | Belum disentuh |
| Working tree | Bersih |

**Langkah berikutnya, persis:** jalankan task reviewer untuk
Task 1. Paket diff-nya sudah dibuat di
`.superpowers/sdd/review-a896901..786770d.diff`. Jangan
menandai Task 1 selesai sebelum review itu bersih, dan jangan
mengirim Task 2 sebelum Task 1 lolos.

Task 1 menghasilkan `lib/groups/slugify.ts` dan
`tests/groups/slugify.test.ts` — 24 test baru, 78 test total,
ketiga gerbang lulus.

**Peringatan tentang berkas kerja.** Seluruh isi
`.superpowers/sdd/` — ledger, task brief, laporan implementer,
dan paket diff — diabaikan Git oleh `.superpowers/sdd/.gitignore`
dan **tidak ikut ter-commit**. `git clean -fdx` akan
menghapusnya tanpa sisa. Bila itu terjadi, peta pemulihannya
adalah `git log` ditambah bagian ini; task brief dapat dibuat
ulang dari berkas rencana kapan saja.

Hal yang sama berlaku untuk `.impeccable/surfaces/` — kedua
surface brief Fase 2 ada di sana dan diabaikan `.gitignore:24`.

**Empat keputusan Pre-Flight yang sudah diambil pemilik** dan
tidak perlu ditanyakan ulang saat melanjutkan:

1. Pekerjaan Fase 2 di-commit lebih dulu di `main`, lalu
   branch `unit-2-cms-group` dibuat dari sana.
2. Rencana menang atas reviewer soal ketiadaan pengujian
   komponen. Kendalanya disalin apa adanya ke prompt reviewer
   sebagai batasan proyek yang mengikat — reviewer tetap bebas
   menandai, dan pengadilannya dilakukan dengan teks rencana di
   tangan. Task 1–6 tetap dituntut TDD penuh.
3. Task 12 boleh menulis ulang `group-list.tsx` secara utuh;
   alasannya dijelaskan ke reviewernya sebagai fakta.
4. Model per peran: implementer task bertranskripsi kode
   lengkap memakai model termurah, task antarmuka memakai model
   menengah, dan review akhir seluruh branch memakai model
   paling mampu.

### Riwayat sebelumnya

Unit 1 tutup dan bersih:
`main` sudah di-push ke `origin` pada `6b9ec0c`, dependensi
terpasang di checkout utama, worktree `unit-1-fondasi` beserta
cabangnya dihapus setelah terbukti tergabung penuh.

Ledger eksekusi sembilan task diselamatkan ke
`docs/superpowers/riwayat/2026-08-21-unit-1-ledger.md` sebelum
worktree-nya dibuang — isinya keputusan per task, temuan
reviewer, dan temuan yang ditolak beserta buktinya.

**Fase 2 SELESAI, 21 Agustus 2026.** Seluruh exit criteria
terpenuhi, dan belum ada satu baris kode antarmuka pun
ditulis:

- `PRODUCT.md` ada di akar `kumpulink-app/`, memuat Brand
  Commitments dari `ui-context.md` — kedua tabel token
  lengkap dengan nilai heksadesimalnya, tipografi, skala
  radius, dan tujuh komitmen lain. Ditulis lewat `init`.
- Dua surface brief tersimpan lewat `surface-brief.mjs`:
  `.impeccable/surfaces/app-public-g-slug.md` dan
  `.impeccable/surfaces/app-dashboard.md`.
- Direction contract terpasang di `app/layout.tsx` sebagai
  komentar HTML — lima blok, 137 kata, plus baris `FINISH`.
  **Diverifikasi bertahan di build produksi:** komentarnya
  utuh di `.next/server/app/_not-found.html` dan
  `pages/404.html`, 79 karakter setelah `<body>`. Tidak
  muncul di `index.html` karena rute `/` hanya `redirect()`
  dan tidak pernah merender badan halaman.
- `.impeccable/config.json` mencatat `"buildPath": "code"`
  sesuai D7.

Konsekuensi yang menyentuh berkas lain, seluruhnya disetujui
pemilik butir demi butir: `ui-context.md` diperbarui pada
lima belas titik, `project-overview.md` langkah 8 berubah
(riwayat jadi halaman tersendiri, bukan tab), dan
`architecture.md` menegaskan `localStorage` menyimpan satu id
group, bukan sekumpulan.

Empat keputusan produk baru yang lahir di fase ini dan
sebelumnya tidak ada di dokumen mana pun: jumlah group
realistis 20–50 dan menumpuk; tambah item lewat baris sisip
di tempat; riwayat sebagai halaman tersendiri; dan
penayangan proyektor **tidak lagi** mengunci arah visual.

## Next Up

1. **Fase 3 — Unit 2, CMS group.** Membuat, mengubah,
   menghapus, dan menyusun ulang group; akordeon dashboard;
   pembuatan dan validasi keunikan slug.

   Dua hal dari Unit 1 yang wajib ditangani begitu unit ini
   mulai, keduanya sudah terdiagnosis:
   - **`requireOwner()` di layout hanya melindungi halaman.**
     Route handler tidak pernah dibungkus layout; badan server
     action berjalan sebelum layout dirender ulang; navigasi
     lunak antar segmen bersaudara tidak menjalankan ulang
     layout bersarang. Ketiganya wajib memanggil
     `requireOwner()` sendiri. Sudah tertulis sebagai komentar
     di `app/(dashboard)/layout.tsx`.
   - **`callbackUrl` selalu menunjuk `/dashboard`**, bukan URL
     yang diminta. Benar selama `/dashboard` satu-satunya rute
     di grup; begitu `/dashboard/requests` ada, pengunjung yang
     belum masuk akan mendarat di tempat yang salah. Ini
     penyimpangan dari K2 yang diterima sementara.

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
- **Cabang `dev` harus disusulkan sebelum Fase 10.** Alias
  preview Vercel `kumpulink-preview.vercel.app` menunjuk ke
  `dev`, sementara per 21 Agustus 2026 `dev` tertinggal 37
  commit di belakang `main` — isinya masih keadaan Fase 0.
  Tidak ada yang gagal karenanya sampai Fase 10, tempat alur
  uji utama dijalankan di lingkungan preview; di titik itu
  preview akan menampilkan aplikasi yang salah tanpa
  peringatan apa pun.

- **Repositori harus tetap publik** selama penjadwalan
  memakai GitHub Actions tiap lima menit. Repositori privat
  menembus kuota gratis; lihat keputusan D5.

## Architecture Decisions

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
