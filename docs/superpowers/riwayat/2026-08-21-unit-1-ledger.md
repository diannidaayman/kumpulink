# Progress ledger — Unit 1 Kumpulink

Worktree: unit-1-fondasi (branch worktree-unit-1-fondasi)
Base: 8eea257

## Task 1: complete (commits 8eea257..9fca312, review clean)

Scaffold Next.js, empat gerbang, harness Vitest. Tiga putaran review.

Keputusan penting:
- Next.js di-pin ke 15 (create-next-app@latest kini memasang 16). Sesuai
  architecture.md, ROADMAP.md, dan lingkup unit. Penilaian implementer benar.

Temuan Minor untuk review menyeluruh di akhir:
- package-lock.json bernama "scaffold", bukan "kumpulink-app". Sembuh sendiri
  pada npm install berikutnya, tapi kedua berkas kini tidak konsisten.
- npm test mengeluarkan dua peringatan deprecation Vitest/Vite tiap dijalankan.
  Keluaran test seharusnya bersih. Sebabnya vitest.config.ts memakai sintaks
  ESM sementara package.json tidak bertipe module. Ditunda karena berdampak
  project-wide sebelum Prisma dan Auth.js terpasang.
- npm audit: 3 kerentanan high, seluruhnya transitive dari next sendiri.
  Memperbaikinya menaikkan ke Next 16 dan membatalkan pin di atas.

Catatan keandalan subagent:
- Kedua laporan fixer MENGARANG SHA panjang. Prefix pendeknya benar, sisanya
  karangan. Diverifikasi dengan git rev-parse. Setiap klaim SHA subagent
  wajib diverifikasi sendiri, jangan diterima apa adanya.

Temuan reviewer yang DITOLAK, dengan bukti:
- "group" dan "link" ditandai sebagai teks Inggris. Ditolak: keduanya kosakata
  domain proyek. "group" 95 kemunculan di file konteks, "grup" nol. Sebagian
  teksnya diwajibkan verbatim di ui-context.md:264. Dicatat di Global
  Constraints rencana supaya tidak diangkat ulang.

## Task 2: complete (commits 1ec1f0c..fb8dbfc, review clean)

shadcn/ui terpasang, 20 komponen, cocok persis dengan daftar ui-context.md.
Diverifikasi sendiri: ls components/ui = 20, SHA fb8dbfc cocok.

Kejutan dari luar, keduanya dilaporkan terbuka bukan disembunyikan:
- CLI shadcn tidak lagi menawarkan style "default" maupun baseColor "slate"
  yang diwajibkan brief. Ada sumbu baru "component library": base/radix/aria.
  Terpilih radix + nova; CLI justru melabeli "base" sebagai Recommended.
- shadcn init ikut menyunting app/layout.tsx menambah wiring font Geist.
  Efek samping otomatis, bukan suntingan manual. lang="id" dan teks Indonesia
  utuh. Task 3 menimpa berkas ini dengan Inter + JetBrains Mono.

UNTUK PEMILIK, diputuskan saat unit ditutup:
- Radix vs Base UI belum pernah diputuskan siapa pun dan tidak ada di file
  konteks mana pun. Sekarang 20 komponen bergantung padanya. Tidak memblokir
  Unit 1 karena hampir tidak ada UI di sini, dan jalur baliknya murah.
  Wajib diangkat sebelum Fase 2, tempat UI sungguhan mulai ditulis.

Temuan Minor untuk review menyeluruh:
- app/globals.css tanpa newline di akhir berkas. Moot, Task 3 menulis ulang.
- Peringatan Vitest dari Task 1 masih muncul tiap gerbang dijalankan.

## Task 3: complete (commits fb8dbfc..fa7f6d3, review clean)

Token warna tiga lapis, mode gelap, font. 26 test lulus.

Tiga cacat RENCANA ditemukan dan diperbaiki di sumbernya:
- globals.css menjatuhkan @import tw-animate-css dan shadcn/tailwind.css.
  Enam komponen kehilangan animasi buka-tutup, nol gerbang gagal.
- Kelas variabel next/font ditaruh di <body> sementara Tailwind v4 membaca
  --font-sans di :root yaitu induknya. Seluruh halaman jatuh ke system font.
  Reviewer membuktikannya dengan membangun aplikasi lalu membaca
  getComputedStyle, bukan menalar dari kode. Nol gerbang gagal.
- Identifier Bahasa Indonesia: gelap, ganti, SKRIP_TEMA, blok. Satu di
  antaranya bersembunyi di dalam template string THEME_SCRIPT dan lolos dari
  putaran perbaikan pertama.

Diverifikasi sendiri sesudah perbaikan:
- <html lang="id" class="__variable_f367f3 __variable_3c557b"> di HTML hasil
  render, jadi rantai --font-sans -> --font-inter tersambung di elemen sama.

Temuan Minor untuk review menyeluruh:
- tokens.test.ts: helper block() selalu mencocokkan blok :root pertama, jadi
  assertion not.toContain("--accent-foreground: #") memeriksa blok yang toh
  tidak mungkin memuatnya. Assertion yang menentukan ada di dua baris lain
  yang memeriksa teks seluruh berkas, dan itu memang menangkap regresi K8.
- 22 kasus "mendefinisikan token" hanya memeriksa NAMA token ada, bukan
  nilainya benar. Tidak ada jaring untuk salah ketik heksadesimal.
- Pesan galat di tokens.test.ts:22 masih berbunyi "blok" padahal fungsinya
  sudah bernama block.

## Task 4: complete (commits 9135c81..a4ecdab, review clean)

Validasi env dengan Zod. 32 test lulus. Lint NOL peringatan.
SHA a4ecdab diverifikasi sendiri; SHA di laporan juga cocok kali ini.

Sebelum Task 4, seluruh rencana disapu dari identifier Bahasa Indonesia
(commit 9135c81). Kelas cacat ini sudah tertangkap tiga kali di review dan
akarnya memang ada di rencananya sendiri - Task 1, 4, 6, 7, 8 semuanya
menulis identifier Indonesia sambil mencantumkan aturan sebaliknya di
Global Constraints yang sama. Task 5-9 kini bersih di sumbernya.

Keputusan controller:
- Fixture test dibalik: WITHOUT_TOKEN sepuluh variabel dulu, COMPLETE
  menambahkan tokennya. Bentuk lama membuang satu kunci lewat destructuring
  dan ditandai no-unused-vars karena ignoreRestSiblings bawaannya false di
  eslint-config-next. Ini menghapus peringatan tanpa eslint-disable dan
  tanpa melonggarkan konfigurasi lint bersama.

DITUNDA ke Task 7, bukan dianggap selesai:
- Brief Step 7 menyuruh mengosongkan satu variabel lalu memastikan aplikasi
  menolak start. Belum bisa dijalankan: NOL berkas mengimpor lib/env, jadi
  dev server tidak pernah memuatnya. read() karena itu belum punya
  verifikasi apa pun - unit test hanya menutupi buildEnvSchema. Task 7
  mengimpor env di konfigurasi Auth.js; kerjakan pemeriksaan itu di sana.

Temuan Minor untuk review menyeluruh:
- Env["BLOB_READ_WRITE_TOKEN"] selalu bertipe string|undefined apa pun
  cabangnya. Gagal ke arah aman, tapi pemakainya nanti perlu null check.
- CRON_SECRET .min(32) tidak diuji langsung; hanya AUTH_SECRET yang
  strukturnya identik.
- Boolean(process.env.VERCEL) menganggap "0" dan "false" sebagai truthy.
- Formatting pesan galat di read() bisa dipindah ke env-schema.ts sebagai
  fungsi murni agar dapat diuji, menyisakan read() sebagai glue sepele.

## Task 5: complete (commits a4ecdab..276c078, review clean)

Skema Prisma lengkap dan migrasi pertama ke Neon. 8 model, 9 enum.
Diverifikasi sendiri: 17 baris model/enum, nol ALTER TABLE "AccessLog" di
migration.sql, dan npm run db:inspect membaca 17 dari database sungguhan.
SHA 78726eb cocok dengan klaim implementer.

K6 dan K7 terbukti di artefak yang benar-benar sampai ke Neon, bukan cuma di
berkas skema: AccessLog nol foreign key, AccessRequest cascade dari Item,
Group, dan User. Tidak ada tabel rate limit yang dikarang.

DUA BUTIR TERAKHIR DAFTAR PERIKSA FASE 0 KINI TERBUKTI: migrasi berjalan
lewat DIRECT_URL dan aplikasi memakai DATABASE_URL. Keduanya tertunda sejak
psql tidak terpasang.

Keputusan penting:
- Prisma di-pin 6.19.3. npm i -D prisma tanpa versi memasang 7.9.1, dan
  Prisma 7 menghapus url/directUrl dari blok datasource - persis bentuk yang
  ditulis rencana. Migrasi ke Prisma 7 adalah perubahan arsitektur dan harus
  direncanakan sendiri, bukan efek samping npm i yang tidak di-pin.
- Skrip db:* ditambahkan memakai dotenv-cli. Prisma CLI hanya membaca .env,
  bukan .env.local. Tanpa ini setiap perintah Prisma di unit berikutnya gagal.
- db:inspect memakai --print. Bentuk polos prisma db pull MENIMPA
  schema.prisma - terbukti saat menguji, 88 baris tertulis ulang dan
  dipulihkan dari commit.

Klaim laporan yang TERBUKTI KELIRU:
- Laporan Task 5 menyatakan keenam kerentanan npm audit pre-existing. Tiga
  justru dibawa task itu sendiri. Ditutup dengan override deepmerge-ts 8.0.0.
  Reviewer yang menemukannya, dan saya verifikasi ulang sebelum bertindak.

Temuan Minor untuk review menyeluruh:
- Group.slug punya @unique DAN @@index([slug]) - indeks ganda pada kolom yang
  sama. Berasal dari rencana, menambah beban tulis tanpa manfaat query.
- User.emailVerified ada di skema tapi tidak ada barisnya di tabel User pada
  architecture.md. Dituntut adapter Auth.js.

## Task 6: complete (commits 276c078..01cc240, review clean)

resolveRole() sebagai fungsi murni. 44 test lulus di 4 berkas.
SHA c05eb72 cocok dengan klaim implementer.

Dua sifat yang jadi alasan task ini ada, keduanya terverifikasi dari diff:
- Murni: nol import di lib/auth/role.ts. Testnya hanya mengimpor vitest dan
  fungsinya sendiri - tanpa mock, tanpa sesi, tanpa database.
- Normalisasi dua arah: trim dan lowercase diterapkan ke KEDUA argumen,
  dibuktikan test yang membalik sisi ownerEmail. Subalamat +tag tetap VIEWER
  karena implementasinya memang tidak punya logika pemotongannya sama sekali.

Dua cacat lanjutan dari sapuan identifier commit 9135c81, keduanya ditutup:
- normalkan->normalize menabrak prosa: dinormalkan jadi dinormalize di
  komentar role.ts, architecture.md, dan rencana.
- PEMILIK->OWNER_ADDRESS menabrak isi string literal, menghasilkan alamat uji
  "OWNER_ADDRESS@CONTOH.COM". Bila disalin apa adanya testnya gagal.
  Implementer menangkapnya; sumbernya ditutup di 01cc240.

Pelajaran: pencarian-ganti global pada berkas rencana menabrak prosa dan
string literal, bukan cuma identifier. Sapuan berikutnya harus dibatasi.

Temuan Minor untuk review menyeluruh:
- Guard if (!email) memakai falsy check, bukan blank-after-trim. Email berisi
  spasi saja lolos guard. Baru berbahaya bila OWNER_EMAIL juga kosong, yang
  sudah merusak aplikasi lewat jalur normal - dan lib/env.ts menolaknya.
- Varian spasi pada argumen ownerEmail tidak diuji, hanya varian huruf.
- Laporan Task 6 menulis "Labels in Portuguese" - boilerplate keliru; label
  testnya benar Bahasa Indonesia.

## Task 7: complete (commits 01cc240..2cd9222, review clean)

Auth.js v5 provider Google, adapter Prisma, strategi sesi database.
50 test lulus di 5 berkas. SHA 7422f7b cocok dengan klaim implementer.
next-auth 5.0.0-beta.32, @auth/prisma-adapter 2.11.3.

K1 terverifikasi dari kode, bukan dari komentar: callback session memanggil
resolveRole(user.email, env.OWNER_EMAIL) tiap kali sesi dibaca, dan kolom
User.role tidak pernah dibaca di callback itu. events.signIn menulis kolomnya
tapi tulisan itu tidak pernah kembali memengaruhi keputusan.

requireOwner() gagal-tertutup di semua cabang. Peran tak dikenal seperti
"ADMIN" atau undefined DITOLAK, bukan lolos - diuji, dan reviewer memutasi
implementasinya dengan tangan untuk membuktikan assertion-nya tidak kosong.

VERIFIKASI TERTUNDA TASK 4 AKHIRNYA SELESAI, dan menyingkap cacat rencana:
- Rencana menyuruh "jalankan npm run dev, harap server menolak start". Next
  App Router meng-compile rute sesuai permintaan, jadi server mencetak Ready
  dan tampak sehat meski OWNER_EMAIL kosong.
- Implementer tidak berhenti di situ: ia meminta /api/auth/providers dan
  mendapat HTTP 500 berisi pesan yang tepat, stack trace menunjuk read() di
  lib/env.ts. Mekanismenya terbukti benar.
- Prosedur di rencana diperbaiki di f73673d.
- .env.local diverifikasi pulih penuh: 11 dari 11, cadangan terhapus.

Keputusan controller:
- next-auth diubah dari caret ke pin persis. Caret pada versi pra-rilis
  menerima beta berikutnya DAN 5.x stabil sekaligus. Mengikuti preseden pin
  next dan prisma yang sudah ada.
- requireOwner() diberi test. Alasan melewatkan TDD berlaku untuk config.ts
  yang menarik lib/env.ts, tapi tidak untuk session.ts yang hanya mengimpor
  auth dan redirect - keduanya sepele di-mock.

Temuan Minor untuk review menyeluruh:
- AUTH_SECRET tidak lewat objek env tervalidasi; Auth.js membacanya sendiri
  dari process.env. Tidak ada celah fungsional karena read() memvalidasi
  seluruh skema, tapi tidak konsisten dengan AUTH_GOOGLE_ID di berkas sama.
- Validasi env bersifat reaktif per-rute-tersentuh, bukan proaktif saat boot.
  Tidak ada middleware.ts maupun instrumentation.ts yang mengimpor rantainya.

## Task 8: complete (commits 2cd9222..5f0b7b6, review clean)

Dashboard, gerbang pemilik, halaman akses ditolak, pengalihan /.
50 test lulus di 5 berkas. SHA 5f0b7b6 cocok dengan klaim implementer.

Diverifikasi sendiri: requireOwner() di layout grup, akses-ditolak di luar
grup, nol "use client" di app/, nol heksadesimal di app/.

Bukti runtime tanpa sesi:
- GET /dashboard -> 307 ke /api/auth/signin?callbackUrl=%2Fdashboard
- GET / -> 307 ke /dashboard
- GET /akses-ditolak -> 200, HTML Indonesia lengkap, tanpa putaran

Reviewer memverifikasi kedua janji struktural DARI KODE: tidak ada
middleware.ts, tidak ada pemeriksaan per-halaman, tidak ada error boundary
di app/layout.tsx yang bisa menelan redirect. Dan akses-ditolak nol panggilan
redirect() - mustahil berputar secara konstruksi, bukan cuma secara observasi.

BELUM TERBUKTI, WAJIB DIKERJAKAN PEMILIK - ini kriteria selesai Unit 1:
- Pemilik masuk dengan Google lalu benar-benar mendarat di /dashboard
- Akun lain masuk lalu mendarat di /akses-ditolak melihat emailnya SENDIRI
- Tombol keluar benar-benar menghapus sesi
- Mode terang dan gelap diperiksa dengan mata, termasuk hover tombol ghost
- Mengubah OWNER_EMAIL lalu jalankan ulang server mengubah peran tanpa
  keluar-masuk
Agen tidak dapat melakukannya: alur OAuth menuntut kredensial manusia.

Temuan Minor untuk review menyeluruh:
- akses-ditolak menulis "Anda sedang masuk sebagai: tidak diketahui" bagi
  pengunjung tanpa sesi yang membuka URL itu langsung - menyatakan ia sedang
  masuk padahal tidak. Teksnya dari rencana, jadi perbaikannya juga di sana.
- Alamat email di halaman itu font-mono tanpa break-all; alamat panjang bisa
  meluber di layar sempit.
- callbackUrl selalu menunjuk DASHBOARD_PATH, bukan URL yang diminta. Benar
  sekarang karena /dashboard satu-satunya rute di grup, tapi Unit 2 menambah
  /dashboard/requests dan pengunjung akan mendarat di tempat yang salah.
- app/page.tsx redirect tidak diuji, padahal pola mock-nya sudah ada di
  tests/auth/session.test.ts dan biayanya lima baris.

## Task 9 + review menyeluruh: selesai (commits 5f0b7b6..0aa52e3)

Penutupan unit dan review satu cabang penuh dengan model paling mampu,
memakai empat belas invarian architecture.md sebagai lensa.

Putusan review: FIX FIRST. Tiga Important, seluruhnya diterapkan:
1. Callback session ter-ship tanpa test. Mengganti resolveRole(...) menjadi
   user.role akan MEMBALIK K1 - kolom jadi otoritas, pemilik yang terlanjur
   VIEWER terkunci permanen - dan kelima puluh test tetap lulus. Alasan
   melewatkannya dibantah berkas sebelahnya sendiri yang sudah mem-mock
   persis untuk itu. Sekarang diuji, termasuk kasus yang paling mengikat:
   user.role="OWNER" tapi email tidak cocok tetap menghasilkan VIEWER.
2. Komentar layout menjanjikan "halaman baru tidak dapat lupa memeriksanya".
   Benar untuk halaman, SALAH untuk route handler, server action, dan
   navigasi lunak - ketiganya ditambahkan Unit 2 sejak hari pertama.
3. setup-layanan.md mencentang DATABASE_URL sebagai terbukti. Migrasi dan
   introspeksi keduanya memakai directUrl; belum pernah ada query runtime.
   Dikembalikan ke belum, dan dipindah ke daftar pemeriksaan pemilik.

Enam minor juga dirapikan: indeks ganda Group.slug dihapus lewat migrasi
sungguhan ke Neon, lib/db/client.ts kini memvalidasi env, halaman
akses-ditolak berhenti berbohong pada pengunjung anonim, tiga
ketidakcocokan dokumen diluruskan, keluaran test jadi bersih, lima SVG
sisa scaffold dihapus.

Reviewer MENOLAK satu butir ledger saya sebagai keliru: pesan galat "blok"
di tokens.test.ts adalah prosa Indonesia yang benar. Memperbaikinya justru
melanggar aturan proyek. Butir itu dicabut.

Keadaan akhir diverifikasi sendiri: 54 test di 6 berkas, keempat gerbang
exit 0, keluaran test bersih tanpa peringatan, .env.local nol di git
ls-files, indeks ganda terbukti hilang dari database sungguhan lewat
db:inspect.

BELUM TUTUP. Lima pemeriksaan peramban menunggu pemilik - lihat bagian
In Progress di context/progress-tracker.md.
