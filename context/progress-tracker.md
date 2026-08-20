# Progress Tracker

Perbarui berkas ini setiap kali ada perubahan implementasi
yang berarti.

## Current Phase

- **Fase 0 selesai, 20 Agustus 2026.** Kesebelas variabel
  terkumpul dan diverifikasi bentuknya, seluruh konsol
  dikerjakan, dan setelan yang tidak berbentuk nilai
  diperiksa di layar oleh pemilik.
- Menyisakan satu pekerjaan konfigurasi: membalik arah
  pengalihan domain agar apex `diandiandian.web.id` yang
  berstatus Production dan `www` yang mengalihkan ke sana.
  Lihat bagian 7.1a di `docs/setup-layanan.md`.
- Tidak ada lagi pertanyaan terbuka.
- Belum ada satu baris pun kode aplikasi. **Unit 1 siap
  dimulai** dari prompt P1.1 di `PROMPT-PLAYBOOK.md`.

## Current Goal

- Masuk ke Unit 1 — Fondasi dan autentikasi: Next.js,
  Prisma, skema database lengkap, dan Auth.js dengan provider
  Google, sampai pemilik dapat masuk dan melihat dashboard
  kosong. Prasyarat layanannya sudah tuntas, jadi tidak ada
  lagi yang menahan.

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

## In Progress

Prasyarat layanan eksternal **selesai**. Papan statusnya ada
di bagian **Urutan pengerjaan** pada `docs/setup-layanan.md`,
dan seluruh barisnya bertanda selesai.

Menyisakan satu pekerjaan konfigurasi di Vercel: membalik arah
pengalihan domain agar apex `diandiandian.web.id` berstatus
Production dan `www.diandiandian.web.id` yang mengalihkan 308
ke sana. Langkahnya beserta alasannya ada di bagian **7.1a**
`docs/setup-layanan.md`. Urutannya tidak boleh dibalik —
menyetel `www` lebih dulu membuat Vercel menolaknya sebagai
lingkaran pengalihan.

Selama belum dibalik, tidak ada yang tampak rusak, karena
belum ada deployment. Yang rusak baru terlihat saat login
Google dicoba di produksi.

## Next Up

0. Balik arah pengalihan domain di Vercel — bagian 7.1a
   `docs/setup-layanan.md`. Ini tidak menahan Unit 1, karena
   pengembangan berjalan di `localhost:3000` yang redirect
   URI-nya terpisah. Yang tertahan adalah uji di produksi,
   jadi kerjakan sebelum Fase 10.

   Mulai Unit 1 dari prompt **P1.1** di `PROMPT-PLAYBOOK.md`
   — brainstorming. Butir 1–6 di bawah adalah isi unit itu,
   bukan langkah yang dikerjakan satu per satu tanpa rencana.
1. Inisialisasi proyek Next.js 15 dengan TypeScript dan
   Tailwind.
2. Pasang shadcn/ui dan tambahkan komponen yang disebut di
   `ui-context.md`.
3. Tulis `prisma/schema.prisma` lengkap sesuai bagian Data
   Model di `architecture.md`, lalu jalankan migrasi
   pertama.
4. Pasang Auth.js v5 dengan provider Google dan adapter
   Prisma.
5. Terapkan penentuan peran `OWNER` dari `OWNER_EMAIL` saat
   masuk.
6. Buat layout `app/(dashboard)/` yang menolak siapa pun
   selain pemilik.

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
