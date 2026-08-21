# Setup Layanan Kumpulink

Daftar periksa manual untuk Fase 0. Seluruh langkah di bawah dijalankan
sendiri oleh pemilik di konsol masing-masing layanan — tidak ada satu
pun yang dijalankan dari sesi Claude Code.

Keluarannya adalah sebelas nilai yang mengisi `.env.local`, dan sejumlah
setelan yang tidak berbentuk nilai tetapi tetap wajib: status publikasi
OAuth, sifat privat Blob store, dan verifikasi domain pengirim.

## Prinsip membaca dokumen ini

**Untuk nilai yang ditampilkan konsol, dokumen ini menyebutkan di mana
nilainya dibaca, bukan nilainya.** Alamat yang dipakai Vercel, record
DKIM Resend, dan bentuk connection string Neon berubah dari waktu ke
waktu. Menyalin dari dashboard selalu benar; menyalin dari dokumen ini
belum tentu masih benar saat Anda membacanya.

Bila tampilan konsol berbeda dari yang tertulis di sini, cari menu
dengan fungsi yang sama — vendor kerap menata ulang antarmukanya tanpa
mengubah konsepnya.

## Urutan pengerjaan

Dua bagian pertama punya waktu tunggu di luar kendali, jadi dikerjakan
lebih dulu dan sisanya dikerjakan sambil menunggu.

| Urutan | Bagian | Waktu tunggu | Status |
| ------ | ------ | ------------ | ------ |
| 1 | Domain `.web.id` | Menit sampai jam, tergantung registrar | **selesai** |
| 2 | Cloudflare DNS | Sampai beberapa jam untuk propagasi nameserver | **selesai** |
| 3 | Resend | Sampai beberapa jam untuk verifikasi DNS | **selesai** |
| 8 | Rahasia lokal | Segera | **selesai** |
| — | `OWNER_EMAIL` | Segera | **selesai** |
| 4 | GitHub | Segera | **selesai** |
| 6 | Neon | Segera | **selesai** |
| 7 | Vercel | Segera | **selesai** |
| 5 | Google Cloud Console | Segera | **selesai** |

**Seluruh bagian selesai pada 20 Agustus 2026.** Kesebelas variabel
terkumpul dan diverifikasi bentuknya; keempat setelan yang tidak
berbentuk nilai diperiksa di layar oleh pemilik.

**Urutan yang dipakai adalah urutan baris tabel di atas — Neon → GitHub
→ Vercel → Google — bukan urutan penomoran bagiannya.** Dicatat di sini
karena penomoran bagian menyesatkan, dan siapa pun yang mengulang
persiapan ini di lingkungan lain sebaiknya mengikuti urutan yang sama:

- **Vercel setelah GitHub**, karena proyek Vercel diimpor dari
  repositori.
- **Google paling akhir**, karena bagian 5.4 meminta tiga redirect URI
  sekaligus dan salah satunya memuat alias preview Vercel, yang baru ada
  setelah bagian 7.2 dikerjakan.
- **Neon paling awal**, karena hasilnya yang pertama dipakai Unit 1:
  menulis `prisma/schema.prisma` lalu menjalankan migrasi pertama.

### Variabel yang sudah terkumpul

| Variabel | Sumber | Status |
| -------- | ------ | ------ |
| `RESEND_API_KEY` | Resend | terisi |
| `EMAIL_FROM` | Resend | terisi |
| `AUTH_SECRET` | dibuat lokal | terisi |
| `CRON_SECRET` | dibuat lokal | terisi |
| `OWNER_EMAIL` | Anda sendiri | terisi |
| `AUTH_GOOGLE_ID` | Google Cloud Console | terisi |
| `AUTH_GOOGLE_SECRET` | Google Cloud Console | terisi |
| `DATABASE_URL` | Neon | terisi |
| `DIRECT_URL` | Neon | terisi |
| `BLOB_READ_WRITE_TOKEN` | Vercel | terisi |
| `BLOB_STORE_ID` | Vercel | terisi |

## Apa yang dihasilkan tiap bagian

| Bagian | Menghasilkan |
| ------ | ------------ |
| Domain | `diandiandian.web.id` — dipakai bagian Vercel dan Resend |
| Google Cloud Console | `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` |
| Neon | `DATABASE_URL`, `DIRECT_URL` |
| Vercel | `BLOB_READ_WRITE_TOKEN`, `BLOB_STORE_ID` |
| Resend | `RESEND_API_KEY`, `EMAIL_FROM` |
| Rahasia lokal | `AUTH_SECRET`, `CRON_SECRET` |
| Anda sendiri | `OWNER_EMAIL` |

`OWNER_EMAIL` diisi alamat Google yang akan Anda pakai masuk. Nilainya
harus **cocok persis** dengan alamat yang dikembalikan Google saat
masuk. Ini satu-satunya penentu peran `OWNER`, dan tidak ada antarmuka
untuk mengubahnya.

**Ditetapkan 20 Agustus 2026: `laluardiansyah903@gmail.com`.** Nilainya
sudah tertulis di `.env.local`. Perhatikan bahwa alamat ini **berbeda**
dari alamat yang terdaftar di sesi pengembangan
(`laluardian23@gmail.com`) dan berbeda pula dari akun GitHub
(`diannidaayman`) — yang berlaku adalah alamat di atas. Masuk dengan
akun Google mana pun selain itu akan diperlakukan sebagai pengunjung
biasa dan ditolak masuk dashboard.

---

## 1. Domain `.web.id` — SELESAI

Domain dipakai untuk dua hal sekaligus — alamat aplikasi dan alamat
pengirim email — sesuai keputusan D1 dan D3.

| | |
| --- | --- |
| Domain | `diandiandian.web.id` |
| Registrar | DomaiNesia |
| Dibeli | 19 Agustus 2026 |

Registrasi `.web.id` mensyaratkan identitas pendaftar Indonesia.
Catatan ini disimpan untuk perpanjangan tahun berikutnya.

**Setelah bagian ini:** `diandiandian.web.id` sudah dimiliki.

---

## 2. Cloudflare DNS

Bagian ini opsional, tetapi disarankan: DNS untuk Vercel dan DNS untuk
Resend dikelola di satu tempat, gratis, dan perubahannya berlaku cepat.

### 2.1 Memindahkan nameserver — SELESAI

**Status 19 Agustus 2026.** Nameserver sudah berpindah dan terverifikasi
dari luar: `kallie.ns.cloudflare.com` dan `mitchell.ns.cloudflare.com`,
dijawab sama oleh resolver `1.1.1.1` maupun `8.8.8.8`, dengan SOA
menunjuk Cloudflare. Zona dalam keadaan kosong — tidak ada record
warisan DomaiNesia yang perlu dihapus.

Dashboard Cloudflare dapat tertinggal beberapa jam di balik kenyataan
dan masih menampilkan *Waiting for your registrar to propagate your new
nameservers*. Yang menentukan adalah jawaban resolver publik, bukan
tulisan di dashboard. Tekan **Check nameservers now** di halaman
Overview untuk memaksa Cloudflare memeriksa ulang.

Langkah aslinya disimpan di bawah untuk rujukan.


1. Buat akun Cloudflare, tambahkan `diandiandian.web.id`, pilih paket **Free**.
2. Cloudflare memindai DNS yang ada dan mengimpor record yang
   ditemukannya. **Periksa hasil impor itu.** Registrar DomaiNesia kerap
   menyisipkan record bawaan berupa halaman parkir atau iklan. Record
   semacam itu akan bentrok dengan record Vercel nanti — hapus sebelum
   melanjutkan.
3. Cloudflare menampilkan dua nameserver. Salin keduanya ke panel
   registrar DomaiNesia, menggantikan nameserver bawaan. Bila registrar
   menolak, periksa apakah domainnya sedang terkunci.
4. Tunggu Cloudflare menandai domain berstatus **Active**. Ini dapat
   memakan waktu beberapa jam.

Record boleh ditambahkan sebelum status **Active** tercapai. Record itu
baru berlaku bagi dunia luar setelah nameserver-nya benar-benar pindah.

### 2.2 Aturan mengisi kolom record

Berlaku untuk seluruh record di bagian Resend maupun Vercel.

- **Kolom Name diisi bagian di depan domain saja, bukan nama lengkap.**
  Untuk `resend._domainkey.diandiandian.web.id`, isi `resend._domainkey`. Untuk
  domain itu sendiri (apex), isi `@`. Cloudflare menampilkan nama penuh
  hasilnya di bawah kolom saat Anda mengetik — **baca hasilnya, bukan
  ketikan Anda.**
- **Kolom Content disalin apa adanya**, termasuk tanda kutip dan tanda
  titik dua bila ada. Nilai DKIM panjang dan mudah terpotong saat
  disalin; periksa ujungnya.
- **TTL biarkan Auto.** Tidak ada alasan mengaturnya sendiri di sini.
- **Proxy status** hanya muncul pada record A, AAAA, dan CNAME. Record
  TXT dan MX tidak memilikinya.

### 2.3 Proxy — awan abu, bukan awan oranye

Seluruh record yang menunjuk ke Vercel disetel **DNS only**, yaitu awan
**abu**. Awan oranye berarti lalu lintasnya diproksikan Cloudflare, dan
itu menimbulkan dua persoalan dengan Vercel: lingkaran pengalihan, dan
sertifikat yang tidak pernah selesai diterbitkan.

Bila Anda tetap ingin memproksikannya, mode SSL/TLS di Cloudflare
**wajib** disetel **Full (strict)**. Mode **Flexible** membuat Cloudflare
menghubungi Vercel lewat HTTP sementara Vercel memaksa HTTPS —
hasilnya lingkaran pengalihan yang tidak berujung. Jalur paling aman
tetap DNS only.

### 2.4 Tiga bentrokan yang mudah terjadi

- **Dua record SPF.** Satu domain hanya boleh punya **satu** record SPF.
  Bila sudah ada SPF dari layanan lain, jangan menambah baris kedua —
  gabungkan mekanismenya ke dalam satu record. Dua record SPF membuat
  pemeriksaan gagal, bukan menjadi lebih longgar.
- **Cloudflare Email Routing.** Bila fitur ini aktif, Cloudflare memasang
  record MX miliknya sendiri, yang akan bertabrakan dengan MX jalur balik
  Resend. Matikan Email Routing, atau pakai subdomain terpisah untuk
  Resend sehingga MX-nya tidak berebut tempat.
- **Record warisan dari registrar.** Lihat butir 2 di atas.

### 2.5 Memeriksa hasilnya

Jangan menilai dari tampilan dashboard Cloudflare — di sana record
selalu terlihat benar. Tanyakan ke resolver publik, yang membaca dari
luar seperti Google dan Resend membacanya.

PowerShell, tanpa perlu memasang apa pun:

```
Resolve-DnsName -Name diandiandian.web.id -Type NS -Server 1.1.1.1
```

Ganti `-Type` dan nama sesuai record yang diperiksa:

```
Resolve-DnsName -Name resend._domainkey.diandiandian.web.id -Type TXT -Server 1.1.1.1
```

Menanyakan langsung ke `1.1.1.1` melewati cache DNS mesin Anda. Tanpa
itu, Anda bisa membaca jawaban lama selama berjam-jam dan menyangka
recordnya belum masuk.

**Setelah bagian ini:** DNS `diandiandian.web.id` dapat Anda ubah sendiri, dan
Anda punya cara memeriksa hasilnya dari luar.

---

## 3. Resend — SELESAI

Verifikasi domain lebih dulu karena bagian itu menunggu DNS, baru buat
API key.

### 3.1 Verifikasi domain pengirim

1. Buat akun di resend.com.
2. Buka menu **Domains** lalu **Add Domain**.
3. Masukkan domain pengirim. Dua pilihan yang sama-sama sah:
   - `diandiandian.web.id` langsung, atau
   - subdomain khusus pengiriman, misalnya `mail.diandiandian.web.id`.

   Subdomain khusus lebih dianjurkan, karena reputasi pengiriman
   aplikasi jadi terpisah dari reputasi email pribadi Anda pada domain
   yang sama.
4. Resend menampilkan sejumlah record DNS — umumnya satu TXT untuk
   DKIM, satu TXT untuk SPF, dan satu MX untuk jalur balik. **Salin
   nilainya dari layar Resend, satu per satu.** Nilai DKIM dibuat khusus
   untuk domain Anda dan tidak dapat ditebak dari dokumen mana pun.
5. Tambahkan seluruh record itu di Cloudflare, persis apa adanya.
6. Tekan **Verify** di Resend. Bila masih gagal, tunggu lalu ulangi —
   propagasi DNS butuh waktu.
7. Lanjut hanya setelah status domain menjadi **Verified**.

### 3.2 API key dan alamat pengirim

1. Buka menu **API Keys** lalu **Create API Key**. Beri izin **Sending
   access** saja; aplikasi ini tidak perlu membaca apa pun dari Resend.
2. Salin nilainya **sekarang** — Resend hanya menampilkannya satu kali.
   Ini `RESEND_API_KEY`.
3. Tetapkan `EMAIL_FROM` memakai domain yang baru diverifikasi,
   misalnya `Kumpulink <no-reply@diandiandian.web.id>`. Alamat di luar domain
   terverifikasi akan ditolak saat pengiriman.

**Mengapa domain uji tidak cukup.** Domain bawaan `resend.dev` hanya
dapat mengirim ke alamat pemilik akun Resend. Email keputusan Kumpulink
justru ditujukan ke pemohon — orang lain. Tanpa domain terverifikasi,
kriteria sukses nomor 9 tidak dapat dipenuhi.

**Setelah bagian ini:** `RESEND_API_KEY` dan `EMAIL_FROM` di tangan.

---

## 4. GitHub — SELESAI

**Status 20 Agustus 2026.** Repositori terbit di
`https://github.com/diannidaayman/kumpulink`, visibilitas **Public**,
cabang bawaan `main`, remote `origin` terpasang di repositori lokal.

Diverifikasi dari sisi GitHub, bukan diasumsikan:

- Tiga belas berkas terkirim — persis yang terlacak Git. `.env.local`
  **tidak ada** di pohon berkas GitHub.
- Enam berkas terlacak disapu lebih dulu terhadap pola kunci Resend,
  token Blob, connection string Postgres, dan kredensial Google — nol
  kecocokan.
- Ruleset **Lindungi main** (id `21075437`) aktif, memuat `deletion` dan
  `non_fast_forward`. Dibaca dari endpoint aturan-yang-berlaku milik
  GitHub, bukan dari fakta bahwa rulesetnya sempat dibuat.
- Keenam commit diatribusikan GitHub ke akun `diannidaayman` —
  perbaikan identitas terbukti berlaku.

Langkah aslinya disimpan di bawah untuk rujukan.

Repositori dibuat **publik**, sesuai keputusan D5. GitHub Actions tidak
dibatasi menit pada repositori publik, sedangkan repositori privat hanya
mendapat 2.000 menit sebulan — dan jadwal lima menit menghabiskan
sekitar 8.640 menit sebulan, karena setiap job ditagih minimal satu
menit meski hanya berjalan beberapa detik.

**Akun GitHub sudah ada: `diannidaayman`.** GitHub CLI (`gh`) juga sudah
terpasang dan sudah login di mesin ini, jadi pembuatan repositori,
pemasangan remote, dan push pertama cukup satu perintah — tidak perlu
membuka peramban untuk langkah 1 dan 2.

**Identitas commit sudah diperbaiki, 20 Agustus 2026.** Kelima commit
lama memakai alamat karangan `lalu@users.noreply.github.com`. Seluruhnya
sudah ditulis ulang ke alamat noreply asli akun `diannidaayman`, dengan
tanggal aslinya terjaga. Tidak ada lagi yang perlu dikerjakan di sini
sebelum push.

1. Periksa dulu bahwa rahasia benar-benar tertahan. Perintah pertama
   harus tidak mengeluarkan apa pun; perintah kedua harus menyebut baris
   `.gitignore` yang menahannya:

   ```
   git status --porcelain
   git check-ignore -v .env.local
   ```

   Bila `.env.local` justru muncul di `git status`, hentikan dan
   perbaiki sebelum melanjutkan.

2. Buat repositori publik, pasang remote `origin`, dan push cabang
   `main` — sekaligus, dijalankan dari `D:\Kumpulink\kumpulink-app`:

   ```
   gh repo create kumpulink --public --source=. --remote=origin --push
   ```

   Bentuk lama yang manual (buat repo lewat peramban, lalu
   `git remote add origin ...`) tetap sah bila `gh` tidak tersedia di
   mesin lain.

3. Aktifkan perlindungan cabang `main` lewat **Settings → Rules →
   Rulesets** → **New ruleset** → **New branch ruleset**, target `main`.
   Setidaknya aktifkan **Restrict deletions** dan **Block force pushes**.

   Tautan langsungnya:
   `https://github.com/diannidaayman/kumpulink/settings/rules`

**Repositori publik dan rahasia.** Tidak ada rahasia yang boleh masuk ke
Git. `.gitignore` sudah menahan seluruh berkas `.env*` kecuali
`.env.example`, dan `.env.example` hanya memuat nama tanpa nilai.
Sebelum push pertama, pastikan sekali lagi:

```
git status --porcelain
git check-ignore -v .env.local
```

Perintah kedua harus menyebutkan baris `.gitignore` yang menahannya.
Bila `.env.local` justru muncul di `git status`, hentikan dan perbaiki
sebelum melanjutkan.

**Setelah bagian ini:** repositori publik siap untuk deploy Vercel dan
untuk workflow terjadwal di Fase 8.

---

## 5. Google Cloud Console — SELESAI

Menghasilkan kredensial masuk dengan Google. Sejak 2025 sebagian menu
ini bernama **Google Auth Platform**; pada tampilan lama namanya
**APIs & Services → OAuth consent screen** dan **Credentials**.
Fungsinya sama.

### 5.1 Proyek dan layar persetujuan

1. Buka console.cloud.google.com, buat proyek baru bernama `Kumpulink`.
2. Buka **Google Auth Platform** lalu mulai konfigurasi.
3. Jenis pengguna: **External**.
4. Isi nama aplikasi, email dukungan, dan email kontak pengembang.

**JANGAN memasang logo kustom.** Dengan hanya scope tidak sensitif,
peninjauan penuh oleh Google umumnya tidak berlaku — tetapi memasang
logo atau branding kustom dapat memicu proses peninjauan tersendiri yang
justru menunda rilis. Biarkan bagian branding sepolos mungkin.

### 5.2 Scope

Pada halaman **Data Access** — atau **Scopes** pada tampilan lama —
tambahkan **tepat tiga** scope, tidak lebih:

```
openid
.../auth/userinfo.email
.../auth/userinfo.profile
```

Ketiganya tergolong tidak sensitif. Menambah scope di luar ketiga ini
menarik aplikasi ke jalur peninjauan yang panjang.

### 5.3 Status publikasi — In production

Pada halaman **Audience**, ubah status publikasi dari **Testing**
menjadi **In production**. Ini keputusan D8.

Selama berstatus *Testing*, aplikasi hanya dapat dipakai oleh alamat
yang didaftarkan sebagai penguji, **dibatasi 100 orang**, dan setiap
orang melihat layar peringatan bahwa aplikasi belum terverifikasi.
`context/project-overview.md` menyebut acara dengan dua ratus peserta,
jadi batas ini bukan detail administratif — ini penghalang rilis.

**Pastikan sendiri di layar bahwa statusnya benar-benar berubah.**
Jangan menganggapnya sudah berubah hanya karena tombolnya sudah ditekan.

### 5.4 Client ID

1. Buka **Clients** lalu **Create client**.
2. Jenis aplikasi: **Web application**.
3. Pada **Authorized redirect URIs**, daftarkan **ketiganya sekaligus
   sekarang**:

   ```
   http://localhost:3000/api/auth/callback/google
   https://diandiandian.web.id/api/auth/callback/google
   https://kumpulink-preview.vercel.app/api/auth/callback/google
   ```

   Alasan mendaftarkan sekaligus: Google hanya menerima redirect URI
   yang terdaftar **persis**, sedangkan setiap deployment preview Vercel
   mendapat URL acak yang berbeda tiap kali. Tanpa satu alias preview
   yang tetap, masuk dengan Google tidak akan berfungsi di preview.

   **Alias preview ditetapkan `kumpulink-preview.vercel.app`**, diputuskan
   20 Agustus 2026. Alias itu dibuat di bagian 7.2. Karena bagian Google
   dikerjakan **setelah** bagian Vercel, nilainya sudah diketahui saat
   Anda sampai di sini — ketiganya terisi sekali jalan, tanpa perlu
   kembali.
4. Salin **Client ID** menjadi `AUTH_GOOGLE_ID`, dan **Client secret**
   menjadi `AUTH_GOOGLE_SECRET`.

**Setelah bagian ini:** `AUTH_GOOGLE_ID` dan `AUTH_GOOGLE_SECRET` di
tangan, status publikasi *In production*, tiga redirect URI terdaftar.

---

## 6. Neon — SELESAI

Menghasilkan **dua** connection string yang berbeda. Keduanya wajib:
aplikasi memakai koneksi ter-pool, sedangkan migrasi Prisma menuntut
koneksi langsung.

1. Buat akun di neon.tech, buat proyek `kumpulink`.
2. Pilih region terdekat dengan pengguna.
3. Buka widget **Connection string** di dashboard proyek.
4. Widget itu punya saklar atau pilihan **Pooled connection**:
   - **aktif** → salin menjadi `DATABASE_URL`
   - **nonaktif** → salin menjadi `DIRECT_URL`

**Cara membedakan bila saklarnya tidak terlihat.** Nama host koneksi
ter-pool memuat penanda `-pooler`, sedangkan koneksi langsung tidak.
Bentuknya kira-kira begini:

```
DATABASE_URL : ...@ep-nama-123-pooler.region.aws.neon.tech/db?sslmode=require
DIRECT_URL   : ...@ep-nama-123.region.aws.neon.tech/db?sslmode=require
```

Pastikan keduanya menyertakan `sslmode=require`.

**Mengapa dua-duanya perlu.** Migrasi Prisma membuka transaksi panjang
dan pernyataan DDL yang tidak dapat dilewatkan pooler. Menjalankan
migrasi lewat koneksi ter-pool menghasilkan galat yang membingungkan,
karena penyebab sebenarnya tidak disebut di pesan galatnya.

**Setelah bagian ini:** `DATABASE_URL` dan `DIRECT_URL` di tangan.

---

## 7. Vercel — SELESAI

### 7.1 Proyek dan domain

1. Buat akun di vercel.com, impor repositori `kumpulink` dari GitHub.
2. Deploy pertama akan kosong atau gagal — belum ada kode aplikasi. Ini
   wajar; yang dibutuhkan sekarang hanyalah proyeknya ada.
3. Buka **Settings → Domains**, tambahkan `diandiandian.web.id`.
4. Vercel menampilkan record DNS yang harus dibuat. **Baca nilainya dari
   layar Vercel**, jangan dari ingatan atau dokumen lama — alamat yang
   dipakai Vercel berubah dari waktu ke waktu.
5. Tambahkan record itu di Cloudflare sebagai **DNS only** (awan abu).
6. Tunggu Vercel menandai domain **Valid Configuration**.

### 7.1a Apex yang utama, bukan `www` — JEBAKAN

**Vercel kerap menawarkan pola sebaliknya sebagai bawaan saat domain
ditambahkan:** `www` dijadikan Production dan apex dialihkan 308 ke sana.
Menerima tawaran itu **mematahkan login Google**, dan gejalanya tidak
muncul sampai ada deployment sungguhan — jadi mudah lolos sampai jauh.

Sebabnya: Auth.js menyusun `redirect_uri` dari host yang benar-benar
melayani permintaan. Bila produksi dilayani di `www`, yang dikirim ke
Google adalah `https://www.diandiandian.web.id/api/auth/callback/google`,
sedangkan yang terdaftar apex. Google menolaknya dengan
`redirect_uri_mismatch` dan login gagal total — bukan sekadar tampil
aneh.

**Konfigurasi yang benar** di Settings → Domains:

| Domain | Harus tertulis |
| ------ | -------------- |
| `diandiandian.web.id` | **Production** |
| `www.diandiandian.web.id` | **308 → `diandiandian.web.id`** |
| `kumpulink-preview.vercel.app` | cabang **`dev`** |
| `kumpulink-mu.vercel.app` | Production — bawaan Vercel, biarkan |

**Bila arahnya terlanjur terbalik, perbaiki dalam urutan ini.** Membalik
urutannya membuat Vercel menolak karena mendeteksi lingkaran pengalihan:

1. Edit `diandiandian.web.id` → lepaskan redirect, jadikan **Production**
2. Baru edit `www.diandiandian.web.id` → jadikan **Redirect to**
   `diandiandian.web.id`, kode **308**

Apex dipilih sebagai host utama, bukan `www`, karena tiga alasan: redirect
URI di Google sudah terdaftar untuk apex; seluruh dokumen proyek memakai
apex, termasuk D1 dan `EMAIL_FROM`; dan QR code yang dicetak jadi lebih
pendek, sehingga lebih mudah dipindai.

### 7.2 Alias preview yang tetap

Bagian ini menjawab persoalan redirect URI di bagian 5.4.

**Diputuskan 20 Agustus 2026: alias preview dibuat.** Namanya
`kumpulink-preview.vercel.app`, menunjuk ke cabang `dev`.

1. Di **Settings → Domains**, tambahkan `kumpulink-preview.vercel.app`.
2. Tetapkan agar menunjuk ke cabang **`dev`**, bukan ke `main`. Cabang
   `dev` belum ada — Vercel tetap menerima konfigurasinya; cabangnya
   dibuat saat Unit 1 mulai.
3. Nama alias ini dipakai sebagai redirect URI ketiga di bagian 5.4.
   Karena bagian Google dikerjakan setelah bagian ini, nilainya sudah
   diketahui saat Anda sampai di sana.

Pilihan sebaliknya — tidak membuat alias preview — sudah ditolak secara
sadar. Konsekuensinya adalah uji masuk dengan Google hanya dapat
dilakukan di lokal dan di produksi, sehingga alur uji utama Fase 10 baru
pertama kali berjalan sungguhan langsung di produksi.

### 7.3 Blob store — WAJIB privat

**Store publik tidak dapat diubah menjadi privat belakangan.** Bila
store terlanjur dibuat publik, seluruh berkas harus dipindahkan ke store
baru. Perlakukan langkah ini sebagai keputusan sekali jalan.

1. Pasang dan masuk ke Vercel CLI:

   ```
   npm i -g vercel
   vercel login
   ```

   **Jebakan Windows.** Setelah pemasangan global, PowerShell sering
   menolak menjalankan `vercel` dengan pesan *"running scripts is
   disabled on this system"*. Bila itu terjadi, **jangan** mengubah
   execution policy — cukup awali setiap perintah dengan `npx`:
   `npx vercel login`, `npx vercel blob ...`, dan seterusnya.

2. Periksa dulu bentuk perintahnya, karena sintaks CLI Vercel berubah
   dari waktu ke waktu:

   ```
   vercel blob --help
   ```

3. Buat store dengan akses privat sejak awal:

   ```
   vercel blob create-store kumpulink-files --access private
   ```

   Bila `--help` menunjukkan bentuk yang berbeda, ikuti yang dari
   `--help`. Yang tidak boleh berubah adalah **aksesnya harus private**.

4. Hubungkan store ke proyek `kumpulink`, agar `BLOB_STORE_ID` terpasang
   otomatis di lingkungan Vercel.
5. Buka dashboard Vercel, menu **Storage**, pilih store tersebut, lalu
   **pastikan di layar bahwa aksesnya tertulis private.** Jangan lanjut
   sebelum melihatnya sendiri.
6. Salin `BLOB_READ_WRITE_TOKEN` dan `BLOB_STORE_ID` dari setelan store
   ke `.env.local`.

**Untuk apa tiap nilai.** Di atas Vercel, autentikasi Blob memakai OIDC
secara bawaan dan `BLOB_STORE_ID` sudah tersedia dari kaitan proyek.
`BLOB_READ_WRITE_TOKEN` dibutuhkan kode yang berjalan **di luar**
Vercel — termasuk mesin pengembangan lokal Anda.

**Setelah bagian ini:** `BLOB_READ_WRITE_TOKEN` dan `BLOB_STORE_ID` di
tangan, dan store terbukti privat di layar.

---

## 8. Rahasia lokal — SELESAI

`AUTH_SECRET` dan `CRON_SECRET` dibuat sendiri, bukan diambil dari
konsol mana pun. Keduanya wajib berasal dari sumber acak kriptografis —
bukan diketik sendiri, dan bukan dari `Math.random()`.

Jalankan dua kali, satu untuk tiap variabel. Pilih salah satu perintah:

Git Bash:

```
openssl rand -base64 32
```

Node.js:

```
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

PowerShell:

```
$b = New-Object byte[] 32; [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b); [Convert]::ToBase64String($b)
```

`CRON_SECRET` nantinya dikirim sebagai header oleh workflow GitHub
Actions, dan disimpan sebagai repository secret di GitHub — **bukan**
ditulis di dalam berkas workflow. Endpoint cron menolak permintaan yang
tidak menyertakan header ini; jadwal yang dapat dipicu siapa saja bukan
jadwal.

**Setelah bagian ini:** `AUTH_SECRET` dan `CRON_SECRET` di tangan.

---

## 9. Menyusun `.env.local`

1. Salin `.env.example` menjadi `.env.local`.
2. Isi kesebelas nilainya.
3. Jangan pernah menambahkan awalan `NEXT_PUBLIC_` pada satu pun di
   antaranya. Awalan itu membuat nilainya ikut terkirim ke peramban.

```
cp .env.example .env.local
```

**Jebakan Windows saat menyunting berkas ini.**

- **Jangan membuka Notepad lewat menu klik-kanan → New.** Notepad
  menambahkan `.txt` di belakang nama saat menyimpan, dan
  `.env.local.txt` tidak akan pernah dibaca aplikasi. Pakai VS Code,
  atau perintah `notepad .env.local` dari dalam folder proyek — bentuk
  ini aman karena berkasnya sudah ada.
- **Bentuk baris: `NAMA=nilai`** — tanpa spasi sebelum dan sesudah `=`,
  dan tanpa spasi nyasar di ujung baris. Spasi di ujung adalah penyebab
  galat koneksi yang paling sering dan paling sulit terlihat.
- **Tanda kutip hanya bila nilainya mengandung spasi.** `EMAIL_FROM`
  memerlukannya karena berbentuk `Kumpulink <no-reply@…>`; kesepuluh
  variabel lainnya tidak.
- **Semua perintah dijalankan dari `D:\Kumpulink\kumpulink-app`.** Di
  PowerShell, berpindah cukup `cd D:\Kumpulink\kumpulink-app` — tidak
  perlu mengetik `D:` lebih dulu seperti di Command Prompt lama.

Nilai yang sama nantinya juga dipasang di **Vercel → Settings →
Environment Variables**, kecuali `BLOB_STORE_ID` yang terpasang sendiri
dari kaitan store, dan `BLOB_READ_WRITE_TOKEN` yang di atas Vercel tidak
diperlukan.

---

## 10. Daftar periksa akhir

Fase 0 tutup bila seluruh baris berikut **diperiksa di layar**, bukan
diasumsikan sudah benar.

Nilai:

- [x] `.env.local` memuat kesebelas nilai, tidak ada yang kosong
- [x] `.env.local` tidak muncul di `git status`
- [x] `git check-ignore -v .env.local` menyebutkan baris `.gitignore`
- [x] Tidak ada satu pun variabel berawalan `NEXT_PUBLIC_`

Bentuk kesebelas nilai diverifikasi dari sesi Claude Code tanpa
menampilkan isinya: `-pooler` ada di `DATABASE_URL` dan tidak ada di
`DIRECT_URL`, keduanya `sslmode=require`; `AUTH_GOOGLE_ID` berakhiran
`.apps.googleusercontent.com`; `AUTH_GOOGLE_SECRET` diawali `GOCSPX-`;
`BLOB_READ_WRITE_TOKEN` diawali `vercel_blob_rw_` dan **diuji hidup** ke
API Vercel Blob dengan jawaban HTTP 200.

Setelan yang tidak berbentuk nilai:

- [x] Blob store tertulis **private** di dashboard Vercel
- [x] Domain pengirim berstatus **Verified** di Resend
- [x] Status publikasi OAuth tertulis **In production**
- [x] Ketiga redirect URI terdaftar di Google Cloud Console
- [x] Domain `diandiandian.web.id` berstatus **Valid Configuration** di Vercel
- [x] Alias `kumpulink-preview.vercel.app` terpasang ke cabang `dev`
- [x] `diandiandian.web.id` berstatus **Production**, `www` mengalihkan 308 ke apex — lihat 7.1a
- [x] Repositori GitHub berstatus **Public**
- [x] Cabang `main` terlindungi dari `force push` dan penghapusan
- [x] Cabang `dev` ada di GitHub, dipakai alias preview
- [x] Keenam commit memakai alamat noreply `294433957+diannidaayman@…`
- [x] `.env.local` terbukti tidak ada di pohon berkas GitHub

Sambungan:

- [ ] Neon dapat dihubungi dari mesin lokal memakai `DATABASE_URL`
- [x] Neon dapat dihubungi dari mesin lokal memakai `DIRECT_URL`

Migrasi dan introspeksi di atas keduanya menempuh `DIRECT_URL`, bukan
`DATABASE_URL` — belum ada satu query runtime Prisma pun yang berjalan
lewat koneksi ter-pool. Baris pertama baru teruji saat pemilik masuk
dengan Google untuk pertama kalinya, karena itulah permintaan pertama
yang benar-benar menempuh `DATABASE_URL`.

**Dua baris terakhir sengaja ditunda ke Unit 1.** `psql` tidak terpasang
di mesin ini, jadi tidak ada cara menguji sambungannya sekarang tanpa
memasang perkakas tambahan yang toh hanya dipakai sekali. Keduanya akan
teruji sendiri saat `prisma migrate dev` dijalankan pertama kali di Unit
1 — migrasi memakai `DIRECT_URL`, aplikasinya memakai `DATABASE_URL`,
sehingga keduanya terbukti dalam satu langkah yang memang harus
dijalankan.
