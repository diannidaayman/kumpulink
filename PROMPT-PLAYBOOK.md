# Kumpulink — Prompt Playbook untuk Claude Code

Prompt siap salin untuk setiap fase di `ROADMAP.md`, disusun untuk
dijalankan di Claude Code dengan plugin **superpowers** dan
**impeccable** terpasang.

Roadmap menjawab *apa dan kapan*. Playbook ini menjawab *apa yang
diketik*.

---

## Cara pakai

1. Buka Claude Code di `D:\Kumpulink\kumpulink-app`.
2. Pastikan `CLAUDE.md` dan enam file di `context/` ada di repo. Claude
   membacanya otomatis di awal sesi.
3. Salin prompt yang sesuai fase, tempel apa adanya. Prompt di bawah
   sudah lengkap — tidak ada yang perlu diisi kecuali yang ditandai
   `«…»`.
4. Jangan menggabungkan dua prompt dalam satu pesan. Setiap prompt
   adalah satu langkah yang punya titik berhenti sendiri.

### Aturan yang berlaku untuk seluruh playbook

| Aturan | Alasan |
| ------ | ------ |
| Satu unit fitur dalam satu waktu | `ai-workflow-rules.md` — Scoping Rules |
| Sebut nama skill secara eksplisit | Skill yang tidak disebut sering tidak dipanggil |
| Jangan pernah bilang "lanjut saja" pada langkah yang punya gerbang verifikasi | Itu cara tercepat melewati satu-satunya pemeriksaan yang penting |
| Jawab pertanyaan subagent sebelum menyuruhnya melanjutkan | `subagent-driven-development` — subagent yang bertanya sedang menemukan celah spesifikasi |
| Kalau Claude bilang "selesai" tanpa menempelkan keluaran perintah, minta buktinya | `verification-before-completion` — Iron Law |

### Kalimat yang sebaiknya tidak dipakai

Empat kalimat ini secara andal membuat Claude melewati proses yang justru
Anda pasang:

- "Ini sederhana, langsung saja" → mematikan `brainstorming`
- "Skip test dulu, nanti ditambahkan" → mematikan `test-driven-development`
- "Sepertinya sudah benar" → mematikan `verification-before-completion`
- "Perbaiki cepat saja" → mematikan `systematic-debugging`

---

## Blok pembuka standar

Tempelkan ini **sekali di awal setiap sesi baru**, sebelum prompt fase.
Ini tidak menggantikan `CLAUDE.md`; ini menegaskan hal yang paling
mudah tergerus di sesi panjang.

```text
Sebelum menjawab apa pun, gunakan skill superpowers:using-superpowers.

Konteks proyek ini ada di CLAUDE.md dan enam file di context/. Baca
berurutan sebelum mengambil keputusan implementasi apa pun.

Tiga hal berikut adalah baris merah. Bila sebuah permintaan saya tampak
mengharuskan pelanggarannya, hentikan dan tanyakan dulu — jangan cari
jalan memutar:

1. Semua akses ke konten melewati lib/access/evaluate-access.ts.
2. Log akses ditulis di server, tuntas, sebelum pengalihan atau
   pengaliran berkas terjadi.
3. Keadaan yang tidak pasti selalu berarti menolak. Mode akses yang
   belum diimplementasikan, catatan izin yang tidak ditemukan, dan nilai
   enum yang tidak dikenali menghasilkan penolakan.

Seluruh teks yang dilihat pengguna ditulis dalam Bahasa Indonesia. Nama
variabel, fungsi, tabel, dan kolom ditulis dalam Bahasa Inggris.

Jangan mengarang perilaku produk yang tidak terdefinisi di file konteks.
Bila sebuah kebutuhan ambigu, selesaikan dulu di file konteks yang
relevan sebelum mengimplementasikan.
```

---

# Fase 0 — Keputusan dan prasyarat

## P0.1 — Menutup delapan keputusan terbuka

```text
Gunakan skill superpowers:brainstorming untuk membantu saya menutup
keputusan terbuka proyek ini. Ini bukan sesi implementasi — tidak ada
kode yang ditulis di sesi ini.

Baca context/progress-tracker.md bagian "Open Questions", lalu bahas
delapan keputusan berikut bersama saya, SATU PER SATU, menunggu jawaban
saya sebelum lanjut ke berikutnya:

D1. Domain produksi — domain kustom atau subdomain vercel.app?
    Konsekuensi: redirect URI Google, dan isi setiap QR code yang
    dicetak.

D2. Zona waktu tampilan riwayat akses — tetap Asia/Jayapura atau
    mengikuti perangkat pembaca? Server berjalan dalam UTC.

D3. Domain pengirim email dan alamat notifikasi pemilik. Catatan
    penting: domain uji bawaan Resend hanya dapat mengirim ke alamat
    pemilik sendiri, sedangkan email keputusan harus sampai ke pemohon —
    orang lain. Jelaskan konsekuensi ini ke saya sebelum saya menjawab.

D4. Masa simpan AccessLog — selamanya, atau retensi berapa bulan?

D5. Mekanisme cron lima menit. Vercel Cron pada paket Hobby hanya
    berjalan sekali sehari, dan ekspresi cron yang lebih sering GAGAL
    SAAT DEPLOYMENT. Paparkan tiga opsi ke saya: berlangganan Vercel
    Pro, GitHub Actions terjadwal yang memanggil endpoint cron dengan
    header CRON_SECRET, atau layanan cron pihak ketiga. Sebutkan
    konsekuensi masing-masing terhadap kriteria sukses nomor 10.

D6. Kewenangan context/ui-context.md terhadap skill impeccable nanti.
    Mengikat (impeccable memperluas sistem yang sudah ada) atau bebas
    (impeccable boleh mengganti dunia visualnya)? Bila bebas,
    ui-context.md harus ditulis ulang dari hasil build.

D7. Jalur build impeccable — comp-led (gambar dulu) atau code-led
    (langsung kode)? Jelaskan pertukarannya sebelum saya menjawab.

D8. Status publikasi aplikasi OAuth Google. Selama berstatus Testing,
    aplikasi dibatasi 100 pengguna dan setiap orang melihat layar
    peringatan aplikasi belum terverifikasi. project-overview.md
    menyebut satu acara dengan dua ratus peserta.

Setelah kedelapan terjawab, tulis hasilnya ke
context/progress-tracker.md: pindahkan dari bagian "Open Questions"
menjadi keputusan beserta alasannya di bagian "Architecture Decisions".
Lalu commit.
```

## P0.2 — Menyiapkan layanan eksternal

```text
Buatkan saya daftar periksa langkah demi langkah untuk menyiapkan
seluruh layanan eksternal Kumpulink, dalam satu file
docs/setup-layanan.md. Saya yang akan menjalankannya secara manual di
konsol masing-masing layanan — tugas Anda menulis daftarnya selengkap
mungkin, termasuk nilai persis yang harus saya ketikkan.

Cakup:

1. Google Cloud Console — proyek, OAuth consent screen, OAuth 2.0
   Client ID tipe Web. Redirect URI yang harus didaftarkan sekaligus:
     http://localhost:3000/api/auth/callback/google
     https://«domain-produksi»/api/auth/callback/google
   Scope: openid, email, profile — tidak lebih.
   Ubah status publikasi menjadi "In production" (keputusan D8).
   Catat juga: URL deployment preview Vercel berubah setiap deploy,
   sedangkan Google hanya menerima redirect URI yang terdaftar persis.
   Sarankan cara menetapkan satu domain preview yang stabil.

2. Neon — proyek Postgres. Saya butuh DUA connection string: yang
   ter-pool untuk DATABASE_URL dan yang langsung untuk DIRECT_URL
   (dipakai migrasi Prisma). Jelaskan cara membedakan keduanya di
   dashboard Neon.

3. Vercel Blob — store harus dibuat sebagai PRIVATE, bukan public.
   Store publik tidak dapat diubah menjadi privat belakangan. Sertakan
   perintah CLI-nya dan langkah menghubungkan store ke proyek agar
   BLOB_STORE_ID terpasang otomatis.

4. Resend — verifikasi domain pengirim (record SPF dan DKIM), API key,
   dan alamat EMAIL_FROM. Sebutkan bahwa verifikasi DNS butuh waktu
   tunggu dan sebaiknya dimulai paling awal.

5. Pembuatan AUTH_SECRET dan CRON_SECRET secara lokal, dengan perintah
   persisnya.

Setelah daftar itu selesai, buat .env.example berisi kesebelas nama
variabel tanpa nilai, dan pastikan .gitignore mengabaikan .env*.

Terakhir, dua pembaruan ke context/progress-tracker.md:
- tambahkan DIRECT_URL dan BLOB_STORE_ID ke daftar variabel lingkungan;
  keduanya belum tercatat di sana
- catat batas 100 pengguna pada status OAuth "Testing" sebagai prasyarat
  rilis, agar tidak ditemukan kembali saat acara sedang berjalan
```

## P0.3 — Menyelaraskan file konteks dengan temuan platform

```text
Tiga hal di context/architecture.md perlu diperbarui karena berbeda dari
kenyataan platform per Agustus 2026. Perbarui file konteksnya sekarang,
sebelum implementasi dimulai, sesuai aturan "Keeping Docs in Sync" di
ai-workflow-rules.md.

1. Vercel Blob privat. Bentuknya bukan setelan per berkas di atas store
   biasa, melainkan private store tersendiri:
   - store dibuat dengan akses private sejak awal
   - butuh @vercel/blob versi 2.3 atau lebih baru
   - unggah: put(path, file, { access: 'private' })
   - baca: get(pathname, { access: 'private' }) — mengembalikan objek
     berisi stream, blob.contentType, blob.etag, dan statusCode
   - di atas Vercel autentikasi memakai OIDC; BLOB_READ_WRITE_TOKEN
     hanya untuk kode yang berjalan di luar Vercel
   Perbarui bagian Storage Model dan deskripsi lib/storage/ agar
   putFile, getFileStream, dan deleteFile dijelaskan di atas API ini.

2. Header respons pengaliran berkas. Selain Content-Disposition: inline
   yang sudah tertulis, tambahkan Cache-Control: private, no-cache dan
   X-Content-Type-Options: nosniff pada bagian "Gerbang item" di Request
   Flow. Respons blob privat tidak boleh masuk cache CDN.

3. Vercel Cron. Interval lima menit menuntut paket Pro; paket Hobby
   hanya mengizinkan sekali sehari dan menolak deployment bila
   ekspresinya lebih sering. Catat mekanisme yang saya pilih di
   keputusan D5 pada bagian Stack dan bagian "Pemberitahuan ke pemilik".

Jangan mengubah invarian, aturan izin, atau lingkup fitur — hanya tiga
hal di atas. Tunjukkan diff-nya ke saya sebelum commit.
```

---

# Fase 1 — Fondasi dan autentikasi (Unit 1)

Fase ini memakai rangkaian superpowers **secara penuh**, karena inilah
tempat pola kerja untuk enam unit sesudahnya dibentuk. Empat prompt,
empat titik berhenti.

## P1.1 — Brainstorming

```text
Gunakan skill superpowers:brainstorming untuk Unit 1 Kumpulink.

Perencanaan produk sudah selesai dan tertulis di enam file context/.
Tugas sesi ini BUKAN merancang ulang produk, melainkan mengubah
spesifikasi yang sudah ada menjadi keputusan implementasi yang cukup
tajam untuk ditulis sebagai rencana. Perlakukan file konteks sebagai
kebenaran; kalau ada yang ambigu, tanyakan ke saya dan selesaikan di
file konteksnya, jangan diputuskan sendiri.

Lingkup Unit 1, dari ai-workflow-rules.md:
- Next.js 15 App Router, TypeScript mode strict, Tailwind
- shadcn/ui, dengan dua puluh komponen yang disebut di ui-context.md
- prisma/schema.prisma LENGKAP — termasuk AccessRequest dan ketiga nilai
  accessMode, meski fitur persetujuan baru dibangun di Unit 7
- migrasi pertama ke Neon
- Auth.js v5 provider Google dengan adapter Prisma
- penentuan peran OWNER dari variabel lingkungan OWNER_EMAIL
- layout app/(dashboard)/ yang menolak siapa pun selain pemilik
- token warna di app/globals.css, dua blok :root dan .dark, sebelas
  token masing-masing, sesuai tabel di ui-context.md

Selesai bila: pemilik dapat masuk dan melihat dashboard kosong; orang
lain yang masuk ditolak masuk dashboard.

Hal-hal yang saya ingin Anda putuskan bersama saya di sesi ini:
- bentuk helper sesi di lib/auth/, dan di mana peran OWNER dihitung
  (callback Auth.js yang mana, dan kenapa di situ)
- cara layout dashboard menolak non-pemilik: redirect ke mana, atau
  halaman apa
- bentuk validasi variabel lingkungan saat boot, mengingat
  code-standards.md mewajibkan variabel lingkungan divalidasi sebagai
  input eksternal
- kerangka pengujian yang dipakai, dan bagaimana matriks
  evaluateAccess() nanti dijalankan tanpa database

Jangan menulis kode sampai saya menyetujui desainnya.
```

## P1.2 — Menulis rencana

```text
Gunakan skill superpowers:writing-plans untuk membuat rencana
implementasi Unit 1 dari spesifikasi yang barusan kita setujui.

Simpan ke docs/superpowers/plans/2026-08-19-unit-1-fondasi.md.

Bagian Global Constraints wajib memuat, disalin persis:
- TypeScript strict wajib aktif; hindari any
- server component sebagai bawaan; "use client" hanya bila
  interaktivitas peramban benar-benar diperlukan
- seluruh teks pengguna dalam Bahasa Indonesia; identifier dalam Bahasa
  Inggris
- nama berkas kebab-case, nama komponen PascalCase
- berkas yang tumbuh melewati ±200 baris dipecah sebelum ditambah fitur
- tidak ada nilai heksadesimal di komponen — hanya token CSS custom
  property
- setiap komponen benar di mode terang DAN gelap; belum dianggap selesai
  bila hanya diuji di satu mode
- mobile-first: gaya dasar untuk layar sempit, breakpoint ke atas
- components/ui/* adalah berkas hasil generate shadcn dan tidak diedit
  manual
- bentuk respons galat seragam: { error: { code, message } } dengan
  message dalam Bahasa Indonesia
- tidak ada rahasia berawalan NEXT_PUBLIC_

Skema Prisma ditulis LENGKAP di unit ini, termasuk AccessRequest dan
nilai APPROVAL, meski fiturnya baru dibangun di Unit 7. Alasannya sudah
dicatat di progress-tracker.md dan tidak dinegosiasikan ulang: migrasi
belakangan tidak boleh menyentuh tabel yang sudah berisi data produksi.

Setelah rencananya jadi, jalankan Self-Review yang diminta skill itu,
lalu tunjukkan hasilnya ke saya. Jangan mulai eksekusi.
```

## P1.3 — Eksekusi

```text
Gunakan skill superpowers:using-git-worktrees untuk menyiapkan workspace
terisolasi, lalu gunakan skill superpowers:subagent-driven-development
untuk mengeksekusi docs/superpowers/plans/2026-08-19-unit-1-fondasi.md.

Aturan eksekusi:
- Setiap subagent implementer memakai superpowers:test-driven-development.
  Test dulu, lihat gagal, baru implementasi.
- Jalankan Pre-Flight Plan Review sebelum task pertama. Bila ada konflik
  antara rencana dan Global Constraints, tanyakan ke saya sekaligus di
  awal, bukan satu interupsi per temuan.
- Sebutkan model secara eksplisit di setiap dispatch, sesuai panduan
  Model Selection di skill itu.
- Jalan terus tanpa berhenti bertanya "lanjut?" di antara task. Berhenti
  hanya bila BLOKIR yang tidak dapat Anda selesaikan, atau seluruh task
  selesai.
- Task reviewer harus mengembalikan DUA putusan: kepatuhan spesifikasi
  dan kualitas kode. Laporan yang kehilangan salah satunya ditolak.
- Temuan Critical dan Important diperbaiki sebelum lanjut. Temuan Minor
  dicatat di ledger untuk review menyeluruh di akhir.

Setelah seluruh task selesai, jalankan review menyeluruh satu cabang
penuh dengan superpowers:requesting-code-review, memakai model paling
mampu yang tersedia. Berikan reviewer daftar invarian di
context/architecture.md sebagai lensa perhatiannya.
```

## P1.4 — Penutupan unit

```text
Gunakan skill superpowers:verification-before-completion, lalu
superpowers:finishing-a-development-branch.

Sebelum mengklaim apa pun selesai, jalankan perintah berikut dan
tempelkan keluaran mentahnya ke jawaban Anda. Bukan ringkasannya —
keluarannya:

  npx tsc --noEmit
  npm run lint
  npm test
  npm run build

Bila skrip lint atau test belum ada di package.json, buat dulu di unit
ini — keempat perintah ini akan dipakai sebagai gerbang di setiap unit
sesudahnya, dan gerbang yang tidak bisa dijalankan bukan gerbang.

Lalu periksa tujuh butir "Before Moving to the Next Unit" di
ai-workflow-rules.md satu per satu, dan untuk masing-masing sebutkan
bukti konkret bahwa butir itu terpenuhi:

1. Unit berjalan ujung ke ujung sesuai lingkupnya
2. Tidak ada invarian di architecture.md yang dilanggar
3. Matriks pengujian evaluateAccess() lulus — bila unit ini menyentuhnya
4. Antarmuka diperiksa di mode terang dan gelap
5. Halaman publik diperiksa di lebar layar ponsel
6. progress-tracker.md mencerminkan pekerjaan yang selesai
7. npm run build lulus

Untuk butir 4 dan 5, "diperiksa" berarti Anda benar-benar membukanya,
bukan menyimpulkan dari kode.

Setelah itu perbarui context/progress-tracker.md: Current Phase, Current
Goal, Completed, Next Up. Lalu jalankan
superpowers:finishing-a-development-branch dan tawarkan pilihan
integrasinya ke saya.
```

---

# Fase 2 — Arah desain (impeccable)

Empat prompt. Dijalankan setelah Unit 1 selesai dan sebelum Unit 2
dimulai — titik terakhir sebelum antarmuka sungguhan ditulis.

## P2.1 — Menangkap kebenaran produk

```text
/impeccable init

Konteks yang perlu Anda baca sebelum wawancara, agar tidak menanyakan
hal yang sudah terjawab:
- context/project-overview.md — pengguna, tujuan, alur, lingkup
- context/architecture.md — stack dan batas sistem
- context/ui-context.md — komitmen visual yang sudah ditetapkan

Platform: web. Aplikasi Next.js 15, sudah ada scaffold-nya.

Yang berikut ini adalah BRAND COMMITMENTS yang mengikat sesuai keputusan
D6 — bukan bahan yang boleh dipertimbangkan ulang. Catat apa adanya di
PRODUCT.md:
- sebelas token warna mode terang dan sebelas token mode gelap, dengan
  nilai heksadesimal persis seperti di ui-context.md
- Inter untuk teks UI, JetBrains Mono untuk slug, URL berbagi, dan
  alamat IP
- skala border radius: rounded-md, rounded-xl, rounded-2xl, rounded-full
- shadcn/ui di atas Tailwind; components/ui/ hasil generate, tidak
  diedit manual
- halaman publik mobile-first — peserta acara membukanya dari ponsel
  setelah memindai QR
- seluruh teks pengguna dalam Bahasa Indonesia, sudah ditulis untuk
  keadaan kosong dan halaman galat
- warna tidak pernah menjadi satu-satunya pembawa makna; status akses
  selalu disertai teks atau ikon
- kontras WCAG AA di kedua mode

Catat juga sebagai Operating Context: halaman publik kadang ditayangkan
di proyektor ruang rapat, jadi keterbacaan dari jarak jauh lebih penting
daripada gaya; dan laptop ruang rapat dipakai bergantian, sehingga
tombol keluar harus selalu terlihat.

Jalur build: «code-led ATAU comp-led — sesuai keputusan D7».

Jangan menulis DESIGN.md di langkah ini.
```

## P2.2 — Membentuk halaman group publik

```text
/impeccable shape halaman group publik

Permukaan yang dibentuk: app/(public)/g/[slug]/ — halaman group yang
dibuka pengunjung, beserta halaman-halaman keadaannya.

Mode: Operate. Pengunjung datang untuk satu hal — membuka satu berkas
atau satu tautan. Ekspresi tidak boleh menutupi tugas, keadaan, atau
afordansi yang sudah dikenal.

Situasi pemakaian sungguhan: seseorang memindai QR code di ruangan
acara, dari ponselnya, di jaringan seluler, sambil berdiri, mungkin
belum masuk. Ia perlu tahu dalam beberapa detik: ini halaman apa, mana
yang bisa langsung dibuka, mana yang perlu masuk, dan mana yang perlu
izin.

Yang SUDAH ditetapkan dan tidak dibuka ulang (ui-context.md):
- satu kolom terpusat max-w-2xl, tidak ada bilah samping, tidak ada
  navigasi lain
- bilah identitas di atas bila pengunjung sedang masuk, dengan nama dan
  tombol keluar yang selalu terlihat
- anatomi kartu item: ikon tipe di kiri, judul dan deskripsi di tengah,
  penanda di kanan
- ikon Lucide: Link, FileText, Image untuk tipe; ExternalLink untuk item
  bersumber EXTERNAL
- lencana Lock "Perlu masuk" dan keterangan "Akses Anda akan dicatat"
  pada item IDENTITY
- ukuran teks mulai dari text-base, tidak lebih kecil
- kartu membuka tab baru dengan rel="noopener noreferrer"
- halaman pokok harus tetap berfungsi tanpa JavaScript

Yang saya ingin Anda pecahkan:
1. Tujuh keadaan izin pada kartu item APPROVAL — belum masuk, belum
   mengajukan, menunggu, disetujui, ditolak, dicabut, kedaluwarsa.
   Tabelnya ada di ui-context.md bagian "Item Bermode Persetujuan".
   Bagaimana ketujuhnya terbaca sekilas di lebar ponsel tanpa membuat
   kartu jadi ramai, dan tanpa membuat kartu yang disetujui kehilangan
   sifatnya sebagai tautan biasa?
2. Hierarki saat satu group memuat item OPEN, IDENTITY, dan APPROVAL
   sekaligus. Mana yang harus terbaca lebih dulu?
3. Penempatan tombol "Ajukan izin untuk semua" — muncul kapan, dan
   bagaimana hubungannya dengan tombol per kartu?
4. Bentuk empat halaman keadaan: pengajuan izin, menunggu keputusan,
   permintaan ditolak, dan halaman tidak tersedia. Kalimatnya sudah
   ditulis di ui-context.md; bentuknya belum.
5. Spanduk pratinjau pemilik pada group yang nonaktif — bagaimana ia
   membedakan diri dari isi halaman tanpa mendominasinya.

Kendala yang mengikat: halaman ini dirender di server, dinamis, tanpa
cache. Apa pun yang Anda rancang harus bisa berdiri tanpa JavaScript
untuk daftar item dan penerusan lewat gerbang.

Kembalikan brief-nya. Jangan menulis kode.
```

## P2.3 — Membentuk dashboard pemilik

```text
/impeccable shape dashboard pemilik

Permukaan yang dibentuk: app/(dashboard)/ — antarmuka CMS untuk satu
orang, pemilik tunggal.

Mode: Operate. Dunia visualnya sama persis dengan halaman group publik;
yang berbeda hanyalah komposisi dan kepadatannya. Ini bukan latihan
identitas baru.

Situasi pemakaian sungguhan: satu orang yang sama, berulang kali, di
laptop, biasanya sedang menyiapkan acara dan sedang terburu-buru.
Kriteria sukses nomor 1 menuntut satu acara lengkap — membuat group,
mengisi item, mengatur izin, menyalin link dan QR — selesai di bawah
lima menit tanpa meninggalkan dashboard.

Yang SUDAH ditetapkan (ui-context.md):
- bilah atas dengan garis batas bawah, lalu satu kolom terpusat max-w-4xl
- isi utamanya daftar group berbentuk akordeon, bawaannya terlipat
- akordeon terlipat menampilkan judul, jumlah item, lencana status
  berbagi, dan tanggal kedaluwarsa
- akordeon terbuka menampilkan daftar item yang dapat digeser urutannya,
  dengan tombol tambah item di bawah
- panel Bagikan sebagai sheet: dari kanan di layar lebar, dari bawah di
  ponsel
- tabel riwayat lebar penuh, berubah menjadi tumpukan kartu di ponsel
- halaman Permintaan dikelompokkan per group lalu per pemohon, dengan
  tombol "Setujui semua" dan "Tolak semua" di kepala kartu
- lencana jumlah permintaan tertunda di bilah atas, terlihat dari
  halaman mana pun
- radio-group untuk memilih accessMode, ketiga pilihan ditampilkan
  bersamaan beserta satu baris penjelasan masing-masing

Yang saya ingin Anda pecahkan:
1. Ritme akordeon saat berisi banyak group. Pada berapa banyak group
   daftar ini mulai sulit dipindai, dan apa yang menahannya?
2. Bagaimana lencana status — Privat, Wajib masuk, Publik, Nonaktif —
   terbaca dalam satu sapuan mata pada baris akordeon yang terlipat.
3. Bentuk radio-group accessMode. Ini setelan yang menentukan siapa
   boleh melihat apa; akibat memilihnya harus terbaca SAAT memilih,
   bukan setelah salah pilih.
4. Bagaimana peringatan kombinasi APPROVAL + EXTERNAL muncul tanpa
   terbaca sebagai galat, tetapi juga tanpa bisa diabaikan.
5. Tabel riwayat: kolom Waktu, Nama, Email, Item, Hasil — mana yang
   dikorbankan lebih dulu saat layar menyempit, dan bagaimana bentuk
   kartunya di ponsel.
6. Bentuk kartu pemohon di halaman Permintaan, saat satu orang meminta
   satu item dan saat ia meminta lima item sekaligus.

Kembalikan brief-nya. Jangan menulis kode.
```

## P2.4 — Mengunci arah dan menyelaraskan konteks

```text
Dua brief sudah ada. Sekarang tiga hal:

1. Simpan kedua brief lewat surface-brief.mjs, masing-masing pada target
   permukaannya: app/(public)/g/[slug]/ dan app/(dashboard)/.

2. Tulis direction contract sesuai bentuk yang diminta impeccable — lima
   blok, maksimal 150 kata, ditambah baris FINISH — dan pasang sebagai
   komentar HTML anak pertama body di root layout, sehingga ia bertahan
   di keluaran build produksi. Setelah build produksi pertama nanti,
   saya ingin Anda grep keluarannya untuk memastikan komentar itu masih
   ada.

3. Bandingkan seluruh keputusan desain yang barusan diambil terhadap
   context/ui-context.md. Untuk setiap perbedaan, tunjukkan ke saya:
   apa yang berbeda, dan mana yang menurut Anda benar. Jangan mengubah
   ui-context.md tanpa persetujuan saya per butir.

   Setelah saya menyetujui, perbarui ui-context.md dalam sesi ini juga.
   Dua dokumen yang menjelaskan tampilan yang sama dengan isi berbeda
   adalah cara paling andal membuat unit-unit berikutnya saling
   bertentangan.

Jangan mulai membangun antarmuka apa pun. Itu Unit 2.
```

---

# Fase 3–8 — Siklus unit

Enam unit sisanya memakai siklus empat langkah yang sama seperti Unit 1.
Bagian ini memberi templat siklusnya sekali, lalu blok konteks untuk
setiap unit.

## Templat siklus

Ganti `«BLOK KONTEKS UNIT»` dengan blok dari bagian di bawahnya, dan
`«N»` dengan nomor unit.

**Langkah A — brainstorming**

```text
Gunakan skill superpowers:brainstorming untuk Unit «N» Kumpulink.

Spesifikasi sudah ada di enam file context/. Sesi ini mengubahnya
menjadi keputusan implementasi, bukan merancang ulang produk.

«BLOK KONTEKS UNIT»

Bila ada yang ambigu di file konteks, tanyakan ke saya dan selesaikan di
file konteksnya lebih dulu. Jangan menulis kode sampai saya menyetujui
desainnya.
```

**Langkah B — rencana**

```text
Gunakan skill superpowers:writing-plans untuk Unit «N».
Simpan ke docs/superpowers/plans/«tanggal»-unit-«N»-«nama».md.

Salin bagian Global Constraints dari rencana Unit 1 apa adanya, lalu
tambahkan kendala khusus unit ini yang muncul di sesi brainstorming tadi.

Jalankan Self-Review yang diminta skill itu sebelum menunjukkannya ke
saya. Jangan mulai eksekusi.
```

**Langkah C — eksekusi**

```text
Gunakan skill superpowers:using-git-worktrees, lalu
superpowers:subagent-driven-development untuk mengeksekusi rencana Unit
«N».

Aturan sama seperti Unit 1: TDD di setiap task, Pre-Flight Plan Review
sebelum task pertama, model disebut eksplisit di setiap dispatch, dua
putusan dari task reviewer, Critical dan Important diperbaiki sebelum
lanjut, jalan terus tanpa bertanya "lanjut?".

Setelah seluruh task selesai, review menyeluruh satu cabang dengan
superpowers:requesting-code-review memakai model paling mampu, dengan
daftar invarian di architecture.md sebagai lensanya.
```

**Langkah D — penutupan**

```text
Gunakan skill superpowers:verification-before-completion, lalu
superpowers:finishing-a-development-branch.

Tempelkan keluaran mentah dari npx tsc --noEmit, npm run lint, npm test,
dan npm run build. Lalu periksa tujuh butir "Before Moving to the Next
Unit" satu per satu dengan bukti konkret masing-masing, termasuk
pemeriksaan mode terang dan gelap serta lebar ponsel yang benar-benar
Anda buka.

Perbarui context/progress-tracker.md, lalu tawarkan pilihan integrasinya.
```

---

## Blok konteks — Unit 2 (CMS group)

```text
Lingkup Unit 2:
- membuat, mengubah, menghapus, dan menyusun ulang group
- akordeon dashboard, bawaannya terlipat, keadaan lipat disimpan di
  localStorage peramban dan BUKAN di database
- pembuatan slug otomatis dari judul, dapat diubah
- validasi keunikan slug, dengan pesan galat Bahasa Indonesia
- slug acak dibuat dari sumber acak kriptografis, bukan Math.random()

Selesai bila: pemilik dapat membuat beberapa group, mengubah judul dan
slugnya, dan melihatnya sebagai daftar akordeon yang dapat dilipat.

Ikuti brief dashboard yang dihasilkan impeccable di Fase 2 untuk seluruh
keputusan tampilan.

Yang perlu diputuskan bersama saya:
- bentuk pembuatan slug dari judul Bahasa Indonesia — penanganan spasi,
  huruf kapital, tanda baca, dan angka
- perilaku saat slug bentrok: menolak, atau menawarkan alternatif
- apakah menghapus group meminta konfirmasi, dan bentuk konfirmasinya
- bagaimana urutan group disimpan saat disusun ulang, mengingat
  sortOrder adalah Int

Catatan aksesibilitas yang mengikat: akordeon dapat dioperasikan penuh
dengan papan ketik dan mengumumkan keadaan terlipat atau terbuka.
Penyusunan ulang dengan geser wajib punya alternatif tombol naik dan
turun.
```

## Blok konteks — Unit 3 (item dan unggahan)

```text
Lingkup Unit 3:
- menambah item bertipe LINK, PDF, dan IMAGE
- sumber EXTERNAL (menempel URL) maupun UPLOAD (mengunggah berkas)
- lib/storage/ sebagai satu-satunya modul yang mengimpor SDK Vercel Blob
- batas 10 MB per berkas, ditegakkan di SERVER
- tipe yang diterima: application/pdf, image/png, image/jpeg, image/webp
- penyusunan ulang urutan item, dengan alternatif papan ketik
- menonaktifkan item tanpa menghapusnya
- pemilihan accessMode DIBATASI pada OPEN dan IDENTITY. APPROVAL belum
  boleh muncul di CMS — fiturnya baru dibangun di Unit 7, dan fitur yang
  belum jadi tidak boleh berarti pintu yang terbuka.

Selesai bila: pemilik dapat mengisi satu group dengan ketiga tipe item,
mengunggah PDF, dan menyusun urutannya.

Bentuk lib/storage/ mengikuti API private store Vercel Blob:
  putFile(path, file)     → put(path, file, { access: 'private' })
  getFileStream(pathname) → get(pathname, { access: 'private' })
  deleteFile(pathname)    → del(...)
Butuh @vercel/blob versi 2.3 atau lebih baru. Kunci Blob tidak pernah
dikirim ke klien, termasuk di dalam props server component yang
terserialisasi.

Yang perlu diputuskan bersama saya:
- cara memeriksa tipe berkas DARI ISI BERKAS. code-standards.md
  mewajibkan ini, dan memeriksa file.type atau ekstensi nama tidak
  memenuhinya. Bahas apakah kita membaca magic bytes sendiri atau
  memakai pustaka pendeteksi, beserta pertukarannya.
- bentuk path/pathname Blob: bagaimana disusun agar tidak dapat ditebak
  dan tidak bertabrakan
- apa yang terjadi pada berkas di Blob ketika item dihapus dan ketika
  group dihapus
- validasi targetUrl: hanya skema http dan https, untuk mencegah
  javascript: dan data:
- unggahan memakai route handler, bukan server action — ini sudah
  ditetapkan di code-standards.md; putuskan bentuk endpoint-nya
```

## Blok konteks — Unit 5 (berbagi, kedaluwarsa, QR)

```text
Lingkup Unit 5:
- panel Bagikan sebagai sheet: dari kanan di layar lebar, dari bawah di
  ponsel
- pengaturan visibility (PRIVATE, REQUIRE_LOGIN, PUBLIC)
- pengaturan expiresAt, boleh kosong
- saklar shareEnabled untuk mencabut link seketika
- penyalinan URL berbagi
- QR code per group, dibuat DI SERVER sebagai SVG dengan paket qrcode,
  tanpa layanan pihak ketiga
- spanduk pratinjau pemilik untuk group nonaktif

Selesai bila: pemilik dapat mencabut link dan menyaksikan halaman
publiknya berubah menjadi halaman tidak tersedia, sementara pemilik
sendiri masih dapat membukanya dengan spanduk peringatan.

QR code memuat URL absolut dengan domain produksi — keputusan D1. QR
yang sudah dicetak dan dibagikan tidak dapat ditarik kembali, jadi
pastikan domain yang dipakai sudah final.

Yang perlu diputuskan bersama saya:
- format unduhan QR: SVG saja, atau juga PNG untuk ditempel di dokumen
- ukuran dan margin QR agar terpindai dari jarak ruang rapat
- apakah URL berbagi ditampilkan dengan font monospasi (ui-context.md
  menyebut slug dan URL berbagi memakai monospasi)
- perilaku tombol salin di peramban yang menolak akses clipboard
```

## Blok konteks — Unit 6 (riwayat akses)

```text
Lingkup Unit 6:
- tabel riwayat per group di dashboard
- kolom Waktu, Nama, Email, Item, Hasil
- penyaringan berdasarkan item dan rentang tanggal
- paginasi
- pada ponsel berubah menjadi tumpukan kartu
- alamat IP ditampilkan dengan font monospasi

Selesai bila: pemilik dapat melihat siapa mengakses item apa pada jam
berapa, dan menyaringnya.

Zona waktu tampilan mengikuti keputusan D2, dan zona waktunya DITULIS di
antarmuka — tidak diserahkan pada tebakan pembaca. Server berjalan dalam
UTC.

Aturan yang mengikat dan mudah dilanggar tanpa sadar: riwayat dibaca
dari kolom visitorName dan visitorEmail pada baris AccessLog, BUKAN dari
join ke tabel User. Data pengguna bisa berubah kemudian, dan riwayat
harus tetap menunjukkan keadaan pada saat kejadian. Sertakan pengujian
yang membuktikan ini: ubah nama pengguna, lalu pastikan baris lama tetap
menampilkan nama lama.

Yang perlu diputuskan bersama saya:
- ukuran halaman paginasi, dan apakah paginasi berbasis offset atau
  cursor
- bagaimana baris DENIED dibedakan dari GRANTED secara visual, mengingat
  warna tidak boleh menjadi satu-satunya pembawa makna
- bagaimana sepuluh nilai denyReason diterjemahkan ke Bahasa Indonesia
  yang dapat dibaca pemilik
- kolom mana yang dikorbankan lebih dulu saat layar menyempit
```

---

## P5 — Unit 4: gerbang akses dan halaman publik

Unit paling berisiko. Prompt-nya ditulis penuh, tidak memakai templat,
dan **dipecah menjadi dua** — aturan izin dulu, antarmuka menyusul.

### P5.1 — Aturan izin lebih dulu, tanpa satu halaman pun

```text
Gunakan skill superpowers:brainstorming lalu superpowers:writing-plans
untuk bagian PERTAMA Unit 4 Kumpulink: lib/access/evaluate-access.ts
beserta matriks pengujiannya.

Di langkah ini TIDAK ADA satu halaman pun yang dibuat. Tidak ada route,
tidak ada komponen, tidak ada penulisan log. Hanya fungsi murni dan
pengujiannya. ai-workflow-rules.md menyebut unit ini yang paling
berisiko dalam proyek, dan urutan ini adalah cara menurunkan risikonya.

Sifat fungsi ini, dari code-standards.md:
- fungsi murni: tidak menyentuh database, tidak membaca sesi sendiri,
  tidak menulis log
- menerima group, item, sesi, dan catatan AccessRequest milik pemohon
  sebagai ARGUMEN. Pengambilan catatan izin adalah tanggung jawab
  pemanggil.
- mengembalikan union tipe eksplisit: GRANTED, NEEDS_LOGIN,
  NEEDS_REQUEST, PENDING_APPROVAL, atau DENIED beserta alasannya. Bukan
  boolean.
- nilai accessMode yang tidak dikenali ditangani sebagai PENOLAKAN,
  bukan kasus yang lolos ke cabang terakhir

Matriks pengujian yang harus lulus di langkah ini.

Tahap satu, group, dievaluasi berurutan dan berhenti pada kecocokan
pertama:
  group tidak ditemukan          → DENIED / NOT_FOUND
  pemohon OWNER, group aktif     → GRANTED
  pemohon OWNER, group dicabut   → GRANTED + penanda ownerPreview
  pemohon OWNER, group kedaluwarsa → GRANTED + penanda ownerPreview
  shareEnabled = false           → DENIED / REVOKED
  expiresAt sudah lewat          → DENIED / EXPIRED
  visibility = PRIVATE           → DENIED / PRIVATE
  REQUIRE_LOGIN, belum masuk     → NEEDS_LOGIN
  REQUIRE_LOGIN, sudah masuk     → GRANTED
  PUBLIC, belum masuk            → GRANTED

Tahap dua, item, hanya berjalan bila tahap satu GRANTED:
  item bukan milik group ini     → DENIED / NOT_FOUND
  isActive = false               → DENIED / ITEM_INACTIVE
  OPEN, belum masuk              → GRANTED
  IDENTITY, belum masuk          → NEEDS_LOGIN
  IDENTITY, sudah masuk          → GRANTED
  APPROVAL, belum masuk          → NEEDS_LOGIN
  APPROVAL, sudah masuk, tanpa catatan izin → ditolak
      (Unit 7 nanti mengubahnya menjadi NEEDS_REQUEST; sampai saat itu
       sikapnya menolak, bukan meloloskan)
  accessMode bernilai tidak dikenal → ditolak

Satu pengujian tambahan yang bukan baris tabel, tetapi invarian nomor 6
dan wajib ada: tahap dua tidak pernah berjalan ketika tahap satu
menghasilkan DENIED. Item tidak pernah lebih permisif daripada group
induknya.

Pengujian menyebutkan PERILAKU, bukan nama fungsi. Contoh yang benar:
"menolak group kedaluwarsa meski pengunjung sudah masuk". Jangan menulis
pengujian yang hanya mengulang implementasi.

Setelah rencana jadi, eksekusi dengan
superpowers:subagent-driven-development, TDD ketat. Berhenti setelah
matriks lulus. Jangan lanjut ke halaman.
```

### P5.2 — Halaman publik dan gerbang item

```text
Matriks evaluateAccess() sudah lulus. Sekarang bagian KEDUA Unit 4.

Gunakan superpowers:brainstorming lalu superpowers:writing-plans untuk:
- app/(public)/g/[slug]/ — halaman group publik
- app/(public)/g/[slug]/i/[itemId]/ — route gerbang item
- lib/audit/ — penulisan AccessLog
- alur masuk Google dengan callbackUrl yang mengembalikan pengunjung ke
  titik semula
- rate limit per alamat IP pada route gerbang, dengan penghitung di
  Postgres

Ikuti brief halaman group publik yang dihasilkan impeccable di Fase 2
untuk seluruh keputusan tampilan.

Alur gerbang item, dari architecture.md, berurutan:
  0. periksa rate limit per IP. Terlampaui → HTTP 429, catat
     DENIED / RATE_LIMITED, berhenti tanpa menyentuh database lebih jauh
  1. baca sesi di server
  2. ambil group, item, dan catatan AccessRequest pemohon bila ia masuk
  3. panggil evaluateAccess() tahap satu lalu tahap dua
  4. NEEDS_LOGIN → alihkan ke Google dengan callbackUrl menunjuk kembali
     ke URL gerbang ini
  5. NEEDS_REQUEST → halaman pengajuan. TIDAK dicatat di AccessLog.
  6. PENDING_APPROVAL → halaman menunggu. TIDAK dicatat di AccessLog.
  7. DENIED → catat ITEM_ACCESS dengan outcome DENIED beserta alasannya
  8. GRANTED → catat ITEM_ACCESS dengan outcome GRANTED, TUNGGU
     PENULISAN SELESAI, lalu:
       EXTERNAL → HTTP 302 ke targetUrl
       UPLOAD   → alirkan berkas dari Blob melalui respons ini
  9. berkas tidak ditemukan di Blob → tandai item.isBroken = true, catat
     DENIED / FILE_MISSING, render halaman tidak ditemukan

Header respons untuk berkas yang dialirkan:
  Content-Disposition: inline
  Cache-Control: private, no-cache
  X-Content-Type-Options: nosniff

Aturan pencatatan:
  PAGE_VIEW dicatat bila DAN HANYA BILA pengunjung sedang masuk, untuk
  semua nilai visibility. Kunjungan anonim tidak dicatat.
  ITEM_ACCESS SELALU dicatat, termasuk untuk pengunjung anonim pada item
  terbuka.
  Nama dan email DISALIN ke baris log pada saat kejadian, bukan dirujuk.

Tiga hal yang tidak boleh dikompromikan:
1. Penulisan log ditunggu dengan await sampai selesai sebelum
   pengalihan atau pengaliran dimulai. Bukan pekerjaan latar — fungsi
   serverless dapat berhenti segera setelah respons terkirim. Kegagalan
   menulis log pada akses GRANTED MEMBATALKAN penerusan.
2. Setiap item dirender sebagai tautan ke /g/[slug]/i/[itemId], tidak
   pernah ke tujuan aslinya. targetUrl dan fileKey item bersetelan
   IDENTITY atau APPROVAL tidak pernah muncul di HTML, payload data,
   maupun respons API.
3. Seluruh halaman dan gerbang di app/(public)/ dirender DINAMIS. Tidak
   ada cache statis, tidak ada ISR, tidak ada revalidate, di jalur mana
   pun yang hasilnya bergantung pada sesi pengunjung.

Eksekusi dengan superpowers:subagent-driven-development.
```

### P5.3 — Empat pemeriksaan yang tidak bisa diganti pengujian unit

```text
Gunakan skill superpowers:verification-before-completion.

Empat hal berikut adalah kriteria sukses 3, 4, 5, dan 7 di
project-overview.md. Tidak satu pun bisa dibuktikan oleh pengujian unit.
Jalankan keempatnya sungguhan, dan laporkan bukti mentahnya — bukan
kesimpulannya.

1. HTML halaman group.
   Ambil HTML yang benar-benar dikirim ke pengunjung untuk sebuah group
   berisi item OPEN, IDENTITY, dan APPROVAL. Cari di dalamnya:
     - targetUrl item mana pun
     - host penyimpanan Blob
     - fileKey mana pun
     - slug atau id group lain milik pemilik
   Tempelkan perintah yang Anda pakai dan hasil pencariannya. Nol
   kecocokan untuk keempatnya.

2. Pencatatan tanpa JavaScript.
   Matikan JavaScript, akses item IDENTITY sebagai pengguna yang sudah
   masuk. Buktikan penerusan tetap terjadi dan tepat SATU baris
   AccessLog tertulis, berisi nama, email, dan waktu. Tempelkan baris
   yang tertulis di database.

3. Tiga keadaan yang harus tidak dapat dibedakan.
   Buka slug yang dicabut, slug yang kedaluwarsa, dan slug yang tidak
   pernah ada. Bandingkan kode status HTTP dan isi HTML ketiganya.
   Ketiganya harus identik. Tempelkan kode status dan hasil
   perbandingannya.

4. Pratinjau pemilik.
   Masuk sebagai pemilik, buka group yang dicabut. Halaman tampil normal
   dengan spanduk peringatan, bukan halaman tidak tersedia.

Bila salah satu gagal, JANGAN perbaiki sambil jalan. Gunakan
superpowers:systematic-debugging: temukan akar masalahnya lebih dulu,
baru usulkan perbaikannya.
```

---

## P8 — Unit 7: permintaan dan persetujuan

Unit terbesar, dikerjakan dalam empat langkah terpisah. **Setiap langkah
diverifikasi sebelum langkah berikutnya dimulai.** Menggabungkannya
menghasilkan alur izin yang tampak jalan tetapi bocor di salah satu
cabangnya.

### P8.1 — Aturan izin

```text
Unit 7 langkah 1 dari 4: aturan izin lebih dulu.

Gunakan superpowers:brainstorming lalu superpowers:writing-plans lalu
superpowers:subagent-driven-development dengan TDD ketat.

Perluas lib/access/evaluate-access.ts dengan cabang APPROVAL beserta
seluruh matriks pengujiannya. BELUM ADA ANTARMUKA APA PUN di langkah
ini. Tidak ada halaman, tidak ada komponen, tidak ada email.

Matriks yang harus lulus, dievaluasi berurutan setelah pemohon terbukti
sudah masuk:
  tidak ada catatan izin                 → NEEDS_REQUEST
  status PENDING                         → PENDING_APPROVAL
  status REJECTED                        → DENIED / REQUEST_REJECTED
  status REVOKED                         → DENIED / REQUEST_REVOKED
  status APPROVED, expiresAt sudah lewat → DENIED / APPROVAL_EXPIRED
  status APPROVED, masih berlaku         → GRANTED

Satu kasus tambahan yang wajib diuji: catatan izin berstatus APPROVED
dan masih berlaku, TETAPI group-nya sudah kedaluwarsa. Hasilnya tetap
penolakan, karena tahap satu berhenti lebih dulu. Ini kriteria sukses
nomor 11.

Ingatkan diri Anda pada satu hal yang mudah salah: NEEDS_REQUEST dan
PENDING_APPROVAL BUKAN penolakan. Keduanya keadaan sah dalam alur, dan
tidak boleh menghasilkan baris AccessLog maupun halaman tidak ditemukan.

Setiap perubahan pada evaluate-access.ts wajib disertai penambahan kasus
uji pada matriksnya di dalam perubahan yang sama — ini aturan Protected
Files di ai-workflow-rules.md.

Berhenti setelah matriks lulus.
```

### P8.2 — Sisi pemohon

```text
Unit 7 langkah 2 dari 4: sisi pemohon. Matriks izin sudah lulus.

Lingkup:
- halaman pengajuan izin
- halaman menunggu keputusan
- halaman permintaan ditolak
- kartu item bermode persetujuan dengan tujuh keadaannya
- tombol "Ajukan izin untuk semua"
- lib/requests/ untuk pembuatan permintaan

BELUM ADA EMAIL di langkah ini.

Ikuti brief halaman group publik dari Fase 2 untuk bentuk ketujuh
keadaan kartu dan keempat halaman keadaan.

Aturan yang mengikat:
- hanya lib/requests/ yang membuat atau mengubah baris AccessRequest
- pengajuan hanya boleh menghasilkan status PENDING
- kunci unik gabungan (itemId, userId): satu orang tidak dapat mengantre
  dua kali untuk item yang sama
- pengajuan untuk item yang sudah punya catatan izin milik pemohon
  DILEWATI DIAM-DIAM, bukan menggagalkan seluruh pengajuan massal
- pengajuan wajib ada sesi; tanpa sesi, tolak
- jalankan evaluateAccess() tahap satu lebih dulu — group yang dicabut
  atau kedaluwarsa tidak menerima pengajuan
- keperluan opsional, maksimal 300 karakter, ditegakkan di server
  dengan Zod
- nama dan email disalin dari sesi ke baris AccessRequest saat pengajuan

Satu hal yang wajib ada di dialog pengajuan, dari ui-context.md: nama
dan email yang akan terkirim ke pemilik ditampilkan APA ADANYA sebelum
tombol kirim ditekan. Orang berhak tahu identitas apa yang sedang ia
serahkan.

Halaman permintaan ditolak TIDAK menyediakan tombol mengajukan ulang.
Hanya pemilik yang dapat mengubah keputusannya.

Gunakan superpowers:writing-plans lalu
superpowers:subagent-driven-development. Berhenti setelah tujuh keadaan
kartu dapat dimunculkan seluruhnya dan saya memeriksanya.
```

### P8.3 — Sisi pemilik

```text
Unit 7 langkah 3 dari 4: sisi pemilik. Sisi pemohon sudah selesai.

Lingkup:
- halaman /dashboard/requests, dikelompokkan per group lalu per pemohon
- lencana jumlah permintaan tertunda di bilah atas, terlihat dari
  halaman dashboard mana pun
- keputusan satuan dan keputusan massal per pemohon
- pencabutan izin yang sudah disetujui
- membuka pilihan APPROVAL di CMS, lengkap dengan peringatan untuk item
  bersumber EXTERNAL

BELUM ADA EMAIL di langkah ini.

Aturan yang mengikat:
- perubahan status ke APPROVED, REJECTED, atau REVOKED memeriksa
  role === OWNER dari sesi sisi server lebih dulu. Menyembunyikan tombol
  di antarmuka tidak dihitung sebagai kontrol akses.
- keputusan massal dijalankan dalam SATU TRANSAKSI. Jika satu baris
  gagal, seluruhnya dibatalkan. Pemilik tidak boleh berakhir dengan
  sebagian orang disetujui dan sebagian tidak tanpa mengetahuinya.
- saat menyetujui, expiresAt diambil dari group.expiresAt PADA SAAT
  KEPUTUSAN DIBUAT, bukan dibiarkan null lalu dihitung belakangan
- izin tidak pernah berlaku lebih lama daripada group yang menaunginya

Peringatan APPROVAL + EXTERNAL, dari ui-context.md: ketika APPROVAL
dipilih pada item bersumber EXTERNAL, tampilkan alert bahwa persetujuan
tidak menghalangi pemohon yang sudah disetujui untuk menyalin dan
menyebarkan URL aslinya, dan sarankan mengunggah berkasnya.

Sertakan pengujian yang memastikan HANYA pemilik yang dapat memutuskan.
Ini aturan Protected Files untuk lib/requests/ di ai-workflow-rules.md.

Gunakan superpowers:writing-plans lalu
superpowers:subagent-driven-development.
```

### P8.4 — Email dan cron

```text
Unit 7 langkah 4 dari 4: email. Sisi pemohon dan sisi pemilik sudah
selesai.

Lingkup:
- lib/notify/ sebagai SATU-SATUNYA modul yang mengimpor SDK Resend
- templat email permintaan baru ke pemilik
- templat email keputusan ke pemohon
- logika pengumpulan pemberitahuan lewat kolom Group.notifiedAt
- endpoint cron beserta pengamannya

Mekanisme pengumpulan, dari architecture.md:
- jeda sepuluh menit per group
- email pertama dikirim segera saat pengajuan bila jeda sudah lewat
- permintaan yang masuk dalam sepuluh menit berikutnya digabung menjadi
  satu email ringkasan berisi jumlah permintaan tertunda dan tautan ke
  halaman permintaan
- email ringkasan dikirim oleh cron yang berjalan setiap lima menit,
  memeriksa group yang punya permintaan PENDING lebih baru daripada
  notifiedAt
- server action TIDAK PERNAH menahan permintaan HTTP untuk menunggu
  jeda. Menahan permintaan selama sepuluh menit adalah cara lain untuk
  mengatakan permintaan itu gagal.

Aturan yang mengikat:
- pengiriman email TIDAK PERNAH berada di dalam transaksi database, dan
  kegagalannya TIDAK PERNAH membatalkan transaksi. Kegagalan dicatat ke
  log server lalu ditelan.
- endpoint cron menolak permintaan tanpa header rahasia CRON_SECRET.
  Jadwal yang dapat dipicu siapa saja bukan jadwal.
- templat email tidak memuat isi rahasia. Cukup nama item, nama group,
  dan tautan ke aplikasi — kotak masuk bukan tempat yang dilindungi
  gerbang.
- email persetujuan memuat tautan LANGSUNG ke gerbang item, sehingga
  pemohon tidak perlu mencari kembali halaman group-nya
- keputusan massal mengirim SATU email berisi seluruh item yang
  diputuskan, bukan satu email per item

Domain pengirim dan alamat notifikasi pemilik mengikuti keputusan D3.
Bila domain kustom belum terverifikasi di Resend, pengembangan boleh
memakai domain uji bawaan — tetapi ingat bahwa domain uji hanya dapat
mengirim ke alamat pemilik sendiri, sehingga email keputusan ke pemohon
BELUM benar-benar teruji sampai domain kustom siap. Catat ini sebagai
hal yang tertunda, jangan dianggap lulus.

Mekanisme penjadwalan mengikuti keputusan D5. Bila proyek masih di paket
Hobby Vercel, vercel.json TIDAK BOLEH memuat ekspresi cron yang berjalan
lebih sering daripada sekali sehari — deployment akan ditolak. Terapkan
mekanisme yang saya pilih di D5, dan pastikan endpoint-nya tetap sama
apa pun pemicunya.

Gunakan superpowers:writing-plans lalu
superpowers:subagent-driven-development.

Setelah selesai, verifikasi dua hal ini secara khusus dan tunjukkan
buktinya:
1. Cari di seluruh repo: hanya lib/notify/ yang mengimpor SDK Resend.
2. Panggil endpoint cron tanpa header CRON_SECRET dan tunjukkan
   responsnya. Harus ditolak.
```

---

# Fase 9 — Pengerasan pra-rilis

## P9.1 — Lintasan impeccable

```text
Seluruh tujuh unit selesai. Sekarang lintasan mutu terakhir, satu per
satu, dan tunjukkan hasilnya ke saya sebelum lanjut ke berikutnya:

1. /impeccable audit halaman group publik
   Fokus: aksesibilitas, performa, perilaku responsif. Halaman ini
   dibuka dari ponsel di jaringan seluler oleh orang yang belum pernah
   melihatnya.

2. /impeccable audit dashboard pemilik

3. /impeccable harden
   Keadaan galat, kasus tepi, dan keadaan ekstrem pada kedua permukaan.

4. /impeccable polish
   Lintasan mutu terakhir sebelum rilis.

5. /impeccable document
   Menulis DESIGN.md DARI HASIL BUILD, bukan dari niat.

Setelah DESIGN.md ada, bandingkan isinya dengan
context/ui-context.md. Bila keduanya berbeda, salah satunya salah —
tunjukkan setiap perbedaan ke saya beserta pendapat Anda tentang mana
yang benar, lalu damaikan setelah saya memutuskan. Dua dokumen yang
menjelaskan tampilan yang sama dengan isi berbeda akan menyesatkan
setiap perubahan berikutnya.
```

## P9.2 — Menyapu empat belas invarian

```text
Gunakan skill superpowers:requesting-code-review untuk pemeriksaan
keamanan menyeluruh, dengan model paling mampu yang tersedia.

Reviewer memeriksa kode yang BENAR-BENAR ADA terhadap keempat belas
invarian di context/architecture.md, satu per satu, dan untuk masing-
masing menyebutkan berkas dan baris yang membuktikannya — bukan
menyatakan bahwa invariannya terpenuhi.

Lima yang paling mudah bocor tanpa disadari, periksa lebih teliti:

Invarian 1 — Cari SETIAP jalur menuju konten: server component, route
handler, server action. Pastikan tidak ada satu pun yang mengevaluasi
izin sendiri alih-alih memanggil evaluateAccess().

Invarian 3 — Cari fileKey dan targetUrl item bersetelan IDENTITY atau
APPROVAL di HTML yang dikirim, di payload data terserialisasi, dan di
respons API. Termasuk di dalam props server component.

Invarian 5 — Setiap server action dan route handler yang melakukan
mutasi memeriksa role === OWNER dari sesi sisi server.

Invarian 8 dan 10 — Batas impor masih utuh: hanya lib/storage/ yang
mengimpor SDK Vercel Blob, hanya lib/notify/ yang mengimpor SDK Resend,
hanya lib/requests/ yang mengubah status AccessRequest, hanya lib/audit/
yang menulis ke AccessLog.

Invarian 14 — Tidak ada pekerjaan latar berumur panjang di route handler
maupun server action.

Sertakan juga daftar temuan Minor yang terkumpul di ledger selama Fase 1
sampai 8, agar reviewer dapat memilah mana yang harus diperbaiki sebelum
merge.
```

## P9.3 — Keadaan ekstrem

```text
Gunakan skill superpowers:verification-before-completion.

Buat data uji dan jalankan keadaan berikut sungguhan. Untuk setiap
butir, laporkan apa yang terjadi — bukan apa yang seharusnya terjadi.

1. Satu group berisi 50 item. Akordeon dashboard dan halaman publik
   masih terbaca dan masih responsif?
2. 500 baris AccessLog pada satu group. Paginasi dan penyaringan masih
   cepat? Berapa lama query-nya?
3. Judul group 200 karakter dan judul item 200 karakter. Tata letak
   rusak di mana?
4. Group tanpa deskripsi, item tanpa deskripsi.
5. Berkas yang dihapus dari Blob tetapi item-nya masih ada. Apakah
   isBroken tertandai dan halaman tidak ditemukan tampil?
6. Group tanpa item sama sekali — keadaan kosong tampil dengan kalimat
   yang benar?
7. Pengunjung sedang membuka halaman group, lalu pemilik mencabut
   linknya. Apa yang dilihat pengunjung saat mengklik item berikutnya?
8. Pemohon yang izinnya dicabut saat halaman sedang terbuka.
9. Dua puluh permintaan izin tertunda dari sepuluh pemohon berbeda pada
   satu group. Halaman Permintaan masih terbaca?

Untuk setiap yang bermasalah, gunakan superpowers:systematic-debugging —
akar masalah dulu, perbaikan kemudian.
```

---

# Fase 10 — Preview deploy dan uji lingkungan nyata

## P10.1 — Menyiapkan deployment preview

```text
Bantu saya menyiapkan deployment preview di Vercel dan verifikasi bahwa
lingkungannya benar sebelum kita menguji apa pun.

Buat daftar periksa di docs/preview-checklist.md, lalu bantu saya
menjalankannya:

1. Seluruh sebelas variabel lingkungan terpasang di environment Preview.
   Periksa SATU PER SATU terhadap tabel di ROADMAP.md — jangan disalin
   buta.
2. Blob store terhubung ke proyek, BLOB_STORE_ID terpasang otomatis.
3. Migrasi Prisma berjalan pada database preview. Perhatikan bahwa
   migrasi memakai DIRECT_URL, bukan DATABASE_URL yang ter-pool.
4. Domain preview stabil sudah ditetapkan, dan redirect URI-nya
   terdaftar di Google Cloud Console. Tanpa ini, masuk dengan Google
   tidak akan berfungsi di preview karena URL deployment berubah setiap
   deploy.
5. Jadwal cron aktif sesuai mekanisme D5.
6. Setelah build produksi pertama, grep keluaran build untuk seed key
   direction contract impeccable. Komentar yang terhapus build adalah
   komentar yang tidak bisa diaudit siapa pun.

Laporkan apa yang berhasil dan apa yang gagal, dengan keluaran
mentahnya.
```

## P10.2 — Alur uji utama, sungguhan

```text
Gunakan skill superpowers:verification-before-completion.

Jalankan alur uji utama Kumpulink di deployment preview. Ini alur yang
tertulis di context/progress-tracker.md bagian Session Notes, dan
dijalankan UTUH — dua akun Google sungguhan, peramban kedua, bukan
simulasi.

Alur:
1. Masuk sebagai pemilik. Buat group "Rapat Kerja".
2. Isi dengan tiga item: tautan absensi bermode OPEN, PDF rundown yang
   diunggah bermode IDENTITY, dan notulen yang diunggah bermode APPROVAL.
3. Setel group ke REQUIRE_LOGIN dengan tanggal kedaluwarsa.
4. Salin link dan unduh QR code.
5. Buka link dari peramban lain dengan akun Google berbeda.
6. Klik item absensi — harus langsung diteruskan.
7. Klik rundown — harus diminta masuk, lalu diteruskan, dan tercatat.
8. Ajukan izin untuk notulen.
9. Kembali sebagai pemilik, periksa email permintaan masuk, setujui dari
   dashboard.
10. Periksa email keputusan diterima pemohon, dan tautan di dalamnya
    membuka notulen langsung.
11. Buka tab Riwayat Akses dan pastikan seluruh langkah di atas tercatat
    dengan nama, email, dan waktu yang benar.

Selain alur itu, verifikasi delapan hal yang HANYA bisa diuji di sini,
bukan di lokal:

- [ ] Migrasi Prisma berjalan pada database yang sudah berisi data
- [ ] Alur OAuth Google berfungsi pada domain sungguhan
- [ ] Unggah dan aliran berkas dari private Blob store berfungsi di
      lingkungan Vercel dengan OIDC, bukan token lokal
- [ ] Email Resend sampai ke KOTAK MASUK, bukan folder spam. Uji ke
      Gmail dan bila memungkinkan ke satu penyedia lain.
- [ ] Endpoint cron benar-benar terpicu sesuai jadwal
- [ ] Pengumpulan email: ajukan sepuluh permintaan berurutan dalam satu
      menit, lalu HITUNG berapa email yang masuk dalam sepuluh menit
      pertama. Harus paling banyak satu.
- [ ] Rate limit berperilaku benar di belakang CDN Vercel. Periksa
      header alamat IP mana yang sebenarnya dibaca aplikasi — bila salah,
      seluruh pengunjung akan terbaca sebagai satu IP.
- [ ] Header respons berkas: Content-Disposition: inline, Cache-Control:
      private, no-cache, X-Content-Type-Options: nosniff
- [ ] Pindai QR dari ponsel yang belum pernah masuk, di jaringan seluler
- [ ] Jam yang tercatat di riwayat sesuai dengan jam sungguhan saat
      pengujian. Server berjalan dalam UTC; tampilan mengikuti keputusan
      D2.

Laporkan hasil mentah setiap butir. Bila ada yang gagal, gunakan
superpowers:systematic-debugging.
```

---

# Fase 11 — Rilis produksi

## P11.1 — Gerbang rilis

```text
Gunakan skill superpowers:verification-before-completion.

Sebelum saya merilis, periksa gerbang berikut dan laporkan bukti
konkret untuk masing-masing. Jangan menyimpulkan dari ingatan sesi
sebelumnya — jalankan ulang di sesi ini.

Perintah yang harus dijalankan dan keluarannya ditempelkan mentah:
  npx tsc --noEmit
  npm run lint
  npm test
  npm run build

Sebelas kriteria sukses di context/project-overview.md, satu per satu,
dengan bukti masing-masing:
 1. Satu group berisi tautan + PDF unggahan + tautan Drive, beserta link
    dan QR, selesai dalam satu sesi tanpa meninggalkan dashboard
 2. REQUIRE_LOGIN mengalihkan ke Google dan kembali ke halaman yang sama
 3. HTML halaman group tidak memuat URL tujuan item maupun alamat
    penyimpanan berkas
 4. Item IDENTITY menghasilkan tepat satu baris AccessLog, tertulis meski
    JavaScript dimatikan
 5. Link dicabut, kedaluwarsa, dan tidak pernah ada tidak dapat
    dibedakan dari luar
 6. Pemilik tetap dapat membuka group nonaktif, dengan spanduk
 7. Halaman publik tidak memuat rujukan apa pun ke group lain
 8. Item APPROVAL tanpa catatan APPROVED selalu ditolak
 9. Pemohon menerima kabar lewat email meski menutup peramban
10. Tiga puluh pengajuan dalam satu menit → paling banyak satu email
    dalam sepuluh menit
11. Group kedaluwarsa membuat izin yang sudah disetujui berhenti
    berlaku, tanpa tindakan tambahan

Tiga baris merah di CLAUDE.md, masing-masing dengan berkas dan baris
yang membuktikannya.

Terakhir: apakah bagian "Open Questions" di context/progress-tracker.md
sudah kosong, atau berisi hanya hal yang sengaja ditunda beserta
alasannya?

Bila ada satu saja yang belum terpenuhi, katakan apa adanya. Jangan
menghaluskannya.
```

## P11.2 — Rilis

```text
Gerbang rilis lulus. Bantu saya merilis ke produksi.

Buat daftar periksa di docs/release-checklist.md dan pandu saya
menjalankannya:

1. Kesebelas variabel lingkungan terpasang di environment PRODUCTION.
   Periksa satu per satu terhadap tabel di ROADMAP.md. Jangan menyalin
   buta dari Preview — AUTH_SECRET harus berbeda per lingkungan.
2. Domain produksi terpasang, HTTPS aktif.
3. Redirect URI produksi terdaftar di Google Cloud Console:
   https://«domain-produksi»/api/auth/callback/google
4. Status publikasi OAuth = "In production". Selama masih Testing,
   aplikasi dibatasi 100 pengguna dan setiap peserta melihat layar
   peringatan aplikasi belum terverifikasi.
5. Jadwal cron aktif sesuai mekanisme D5.
6. Migrasi produksi dijalankan.
7. Deploy.

Setelah deploy, uji asap di produksi:
- masuk sebagai pemilik
- buat satu group uji berisi satu tautan
- buka dari peramban lain dengan akun berbeda
- periksa riwayat mencatatnya
- hapus group uji itu

Laporkan hasil setiap langkah dengan keluaran mentahnya.
```

## P11.3 — Penutupan

```text
Gunakan skill superpowers:finishing-a-development-branch.

Setelah integrasi selesai, perbarui context/progress-tracker.md:
- Current Phase → "Rilis 1.0 — produksi"
- Current Goal → kosongkan atau isi dengan pekerjaan pasca-rilis
- Completed → ringkas ketujuh unit dan tanggal rilisnya
- Next Up → butir pasca-rilis dari ROADMAP.md Fase 12
- Open Questions → hanya D4 bila kebijakan retensi log belum
  diimplementasikan, beserta catatan bahwa kebijakannya sudah tertulis
- Session Notes → tambahkan alur uji utama yang sudah terbukti berjalan
  di produksi

Beri tag versi pada commit rilis.
```

---

# Prompt darurat

Empat situasi yang paling sering muncul di tengah pengembangan.

## Ada bug

```text
Gunakan skill superpowers:systematic-debugging.

Gejalanya: «jelaskan apa yang Anda lihat, bukan apa yang Anda kira
penyebabnya»

Jangan mengusulkan perbaikan sebelum Fase 1 skill itu selesai. Saya
ingin melihat akar masalahnya lebih dulu, beserta bukti yang
mendukungnya. Perbaikan gejala adalah kegagalan.
```

## Menerima masukan review

```text
Gunakan skill superpowers:receiving-code-review.

Masukan yang saya terima: «tempel masukannya»

Verifikasi setiap butir terhadap kode yang sebenarnya sebelum
mengimplementasikan apa pun. Bila ada butir yang menurut Anda keliru
untuk basis kode ini, dorong balik dengan alasan teknis — jangan
menyetujui begitu saja. Bila ada butir yang tidak jelas, tanyakan
sebelum mengerjakan butir mana pun, karena butir-butirnya bisa saling
berhubungan.
```

## Claude bilang selesai tanpa bukti

```text
Gunakan skill superpowers:verification-before-completion.

Jalankan perintah yang membuktikan klaim itu, di pesan ini juga, dan
tempelkan keluaran mentahnya. Bukan ringkasannya, bukan "seharusnya
lulus", bukan hasil dari sesi sebelumnya.
```

## File konteks tidak lagi cocok dengan kode

```text
Implementasi sudah berbeda dari file konteks. Sesuai aturan "Keeping
Docs in Sync" di ai-workflow-rules.md, ini harus diselesaikan sebelum
pekerjaan berikutnya dimulai.

Bandingkan kode yang ada dengan enam file di context/, dan untuk setiap
perbedaan tunjukkan ke saya:
- apa yang berbeda
- mana yang menurut Anda benar, dan kenapa
- file konteks mana yang perlu diperbarui, atau kode mana yang perlu
  dikembalikan

Jangan mengubah apa pun sampai saya memutuskan per butir.
```

---

# Lampiran A — Kartu skill

Kapan memanggil apa. Ini ringkasan; skill-nya sendiri yang berwenang.

## superpowers

| Skill | Dipakai saat | Titik berhenti |
| ----- | ------------ | -------------- |
| `using-superpowers` | Awal setiap sesi | — |
| `brainstorming` | Sebelum pekerjaan kreatif apa pun | Desain disetujui pengguna |
| `writing-plans` | Setelah spesifikasi ada, sebelum menyentuh kode | Rencana tersimpan dan di-self-review |
| `using-git-worktrees` | Sebelum eksekusi rencana | Workspace terisolasi siap |
| `subagent-driven-development` | Mengeksekusi rencana di sesi ini | Seluruh task selesai dan direview |
| `executing-plans` | Alternatif: eksekusi inline di sesi terpisah | Sama |
| `test-driven-development` | Setiap implementasi, oleh subagent | Merah → hijau → refactor |
| `systematic-debugging` | Bug, test gagal, perilaku tak terduga | Akar masalah ditemukan |
| `requesting-code-review` | Setelah task, setelah fitur besar, sebelum merge | Temuan diterima |
| `receiving-code-review` | Saat menerima masukan review | Setiap butir diverifikasi |
| `dispatching-parallel-agents` | 2+ masalah yang benar-benar saling bebas | Semua agen kembali |
| `verification-before-completion` | Sebelum mengklaim apa pun selesai | Keluaran perintah ditempelkan |
| `finishing-a-development-branch` | Implementasi selesai, test lulus | Pilihan integrasi dijalankan |
| `writing-skills` | Membuat atau mengubah skill | — |

## impeccable

| Perintah | Dipakai di | Menghasilkan |
| -------- | ---------- | ------------ |
| `/impeccable init` | Fase 2 | `PRODUCT.md` |
| `/impeccable shape «permukaan»` | Fase 2 | Brief desain, tanpa kode |
| alur new-work | Di dalam `shape` | Arah visual dan konsep permukaan |
| `/impeccable audit «target»` | Fase 9 | Temuan a11y, performa, responsif |
| `/impeccable harden «target»` | Fase 9 | Keadaan galat dan kasus tepi |
| `/impeccable polish «target»` | Fase 9 | Lintasan mutu terakhir |
| `/impeccable document` | Fase 9 | `DESIGN.md` dari hasil build |
| `/impeccable clarify «target»` | Bila perlu | Perbaikan teks UI dan pesan galat |
| `/impeccable adapt «target»` | Bila perlu | Penyesuaian lintas ukuran layar |
| `/impeccable critique «target»` | Bila perlu | Review UX bernilai |
| `/impeccable live` | Bila perlu | Iterasi visual langsung di peramban |

Perintah impeccable yang sengaja **tidak** dipakai di proyek ini:
`bolder`, `overdrive`, `delight`, `colorize`. Kedua permukaan bermode
Operate dengan bahasa visual yang sudah ditetapkan tenang dan formal;
memanggil perintah-perintah itu berarti melawan brief sendiri.

---

# Lampiran B — Urutan lengkap

Seluruh prompt playbook ini dari awal sampai rilis, berurutan.

```
Fase 0    P0.1  keputusan D1–D8
          P0.2  prasyarat layanan
          P0.3  selaraskan file konteks

Fase 1    P1.1  brainstorming Unit 1
          P1.2  rencana Unit 1
          P1.3  eksekusi Unit 1
          P1.4  penutupan Unit 1

Fase 2    P2.1  /impeccable init
          P2.2  /impeccable shape halaman group publik
          P2.3  /impeccable shape dashboard pemilik
          P2.4  kunci arah, selaraskan ui-context.md

Fase 3    templat siklus A–D + blok konteks Unit 2
Fase 4    templat siklus A–D + blok konteks Unit 3

Fase 5    P5.1  aturan izin, tanpa halaman
          P5.2  halaman publik dan gerbang item
          P5.3  empat pemeriksaan manual

Fase 6    templat siklus A–D + blok konteks Unit 5
Fase 7    templat siklus A–D + blok konteks Unit 6

Fase 8    P8.1  aturan izin APPROVAL
          P8.2  sisi pemohon
          P8.3  sisi pemilik
          P8.4  email dan cron

Fase 9    P9.1  lintasan impeccable
          P9.2  sapu empat belas invarian
          P9.3  keadaan ekstrem

Fase 10   P10.1 siapkan preview
          P10.2 alur uji utama, sungguhan

Fase 11   P11.1 gerbang rilis
          P11.2 rilis
          P11.3 penutupan
```

Tiga puluh prompt. Tidak satu pun boleh dilewati diam-diam; yang boleh
adalah melewatinya dengan sadar dan mencatat alasannya di
`context/progress-tracker.md`.
