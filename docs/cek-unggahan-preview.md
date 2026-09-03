# Pemeriksaan unggahan di preview Vercel

Daftar periksa manual untuk pemilik, dijalankan **sekali**, sebelum
`main` didorong ke `origin`. Mendorong `main` berarti Production, dan
kegagalan Blob di sana baru akan ketahuan dari pengunjung sungguhan.

Semua langkah dijalankan lewat antarmuka. Tidak ada skrip yang perlu
dijalankan dan tidak ada yang perlu ditulis langsung ke basis data —
pemilik dapat membuka group `PRIVATE` miliknya sendiri berikut itemnya,
karena `evaluateGroupAccess()` dan `evaluateItemAccess()` sama-sama
meloloskan peran `OWNER`. Ini sebabnya `scripts-cek/seed.mjs` tidak
dipakai di sini, berbeda dari pemeriksaan Unit 4.

## Yang sedang dibuktikan

Dua hal, dan hanya dua. Keduanya belum pernah dijalankan sekali pun di
luar mesin lokal:

1. **Autentikasi Vercel Blob di atas Vercel.** Di lokal `lib/storage/`
   memakai `BLOB_READ_WRITE_TOKEN` statis. Di atas Vercel jalurnya
   berbeda, dan tidak ada pengujian yang dapat menyentuhnya — ia hanya
   ada di lingkungan itu. Yang diuji dua arah: **tulis** lewat
   `putFile()` saat mengunggah, dan **baca** lewat `getFileStream()`
   saat gerbang mengalirkan berkas. Arah baca yang lebih penting, dan ia
   tidak ikut terbukti oleh unggahan yang berhasil.
2. **Batas 4,5 MB Vercel yang sesungguhnya.** Di lokal batas itu tidak
   ada, sehingga penolakan 413 yang sudah diuji datang dari kode kita
   sendiri. Di atas Vercel ia dapat datang dari platform lebih dulu,
   dengan bentuk respons yang berbeda dan tidak dapat kita kendalikan.

Yang **tidak** sedang diuji ulang: aturan izin, kebocoran HTML, rate
limit, dan ketakterbedaan penolakan. Kesembilannya sudah lulus di Unit 4
dan tidak berubah oleh lingkungan.

## Langkah 0 — prasyarat

Kelimanya diperiksa sebelum menyentuh apa pun. Empat yang pertama
membuat pemeriksaan gagal karena alasan yang salah bila terlewat.

- **P0-a — pakai alias, bukan URL deployment.** Buka persis
  `https://kumpulink-preview.vercel.app`. Jangan memakai URL
  per-deployment (`kumpulink-<hash>.vercel.app`) yang ditawarkan
  dasbor Vercel: hanya tiga redirect URI yang terdaftar di Google, dan
  alias inilah salah satunya. Memakai URL deployment menghasilkan
  `redirect_uri_mismatch` di layar Google — kegagalan yang tidak ada
  hubungannya dengan Blob.
- **P0-b — deployment untuk `dev` berstatus Ready**, dan alias
  benar-benar menunjuk deployment itu. **Jangan lewati butir ini.** Pada
  1 September 2026 tiga deployment berturut-turut gagal build, dan
  alias diam saja di deployment berumur delapan hari — preview
  menyajikan kode sebelum Unit 4 tanpa satu pun tanda di layar.
  Deployment yang gagal tidak pernah mengambil alias, jadi preview yang
  "terbuka dan tampak normal" bukan bukti bahwa kode yang diuji adalah
  kode yang dimaksud. Periksa dari baris perintah, bukan dari layar:

  ```bash
  vercel list kumpulink --scope diandiandian
  ```

  ```bash
  vercel alias ls --scope diandiandian
  ```

  Baris pertama harus `● Ready` dan berumur semenit-dua menit, dan
  alias `kumpulink-preview.vercel.app` harus menunjuk deployment itu.
  Bila statusnya `● Error`, baca sebabnya dengan
  `vercel inspect <url-deployment> --logs --scope diandiandian` dan
  berhenti di situ — tidak ada gunanya melanjutkan.
- **P0-f — preview dilindungi Deployment Protection Vercel.**
  Permintaan anonim dialihkan ke `vercel.com/sso-api`, bukan dilayani
  aplikasi kita. Anda melewatinya karena sudah masuk ke Vercel di
  peramban yang sama. Dua akibatnya: pemeriksaan ini harus dijalankan
  di peramban yang sesi Vercel-nya hidup, dan **pemeriksaan apa pun
  yang menuntut pengunjung anonim tidak dapat dijalankan di preview** —
  ia akan mengukur dinding Vercel, bukan gerbang kita. Tidak ada
  pemeriksaan semacam itu di daftar ini; catatan ini ada supaya
  kekeliruan itu tidak lahir kelak.
- **P0-c — variabel lingkungan terpasang di environment Preview**, bukan
  hanya Production: `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`,
  `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, dan `OWNER_EMAIL`.
  `OWNER_EMAIL` harus `laluardiansyah903@gmail.com` — bila salah atau
  kosong, dashboard menolak masuk dan tidak ada satu pun langkah di
  bawah yang dapat dijalankan.
- **P0-d — kredensial Blob di environment Preview.** Periksa di layar
  apakah store Blob tertaut ke proyek dan kredensial mana yang
  benar-benar berlaku untuk Preview. Bila tidak ada satu pun, unggahan
  gagal di tingkat store dan CEK P2 akan merah karena sebab yang sudah
  diketahui — perbaiki dulu, jangan dicatat sebagai temuan.
- **P0-e — ketahui basis data mana yang dipakai preview.** Bandingkan
  `DATABASE_URL` Preview dengan yang ada di `.env.local`. Bila sama,
  data uji hari ini bercampur dengan sisa pemeriksaan Unit 4, dan
  pembersihan di CEK P6 wajib. Bila berbeda, pastikan migrasi sudah
  diterapkan ke basis data itu — dashboard yang menampilkan galat
  Prisma berarti belum, bukan berarti Blob gagal.

## CEK P1 — masuk sebagai pemilik

Buka `https://kumpulink-preview.vercel.app/dashboard`, masuk dengan
Google memakai alamat `OWNER_EMAIL`.

**LULUS bila** dashboard terbuka. **GAGAL bila** terlempar ke
`/akses-ditolak` — itu berarti `OWNER_EMAIL` di Preview tidak cocok
(P0-c), bukan temuan.

## CEK P2 — unggah berkas kecil

Buat group baru berjudul **`Cek Preview`**. Buka akordeonnya, tambah
item bersumber unggahan dengan sebuah PDF kecil (± 100 KB), mode akses
**`OPEN`**.

**LULUS bila** item muncul di daftar dengan tipe `PDF`.

**GAGAL bila** muncul galat. Ini `putFile()` yang pertama kali berjalan
di atas Vercel. Perhatikan bentuk galatnya di tab Network peramban:
rute unggah tidak membungkus `putFile()` dengan `try`, jadi kegagalan
Blob keluar sebagai **500**, bukan sebagai `{ error: { code } }` yang
rapi. 500 di sini berarti autentikasi Blob arah tulis gagal.

## CEK P3 — buka item lewat gerbang

**Ini pemeriksaan yang menentukan.** Unggahan yang berhasil belum
membuktikan arah baca.

Buka halaman group sebagai pemilik — `/g/<slug>`, slug-nya terlihat di
dashboard — lalu klik item yang baru diunggah. Halaman akan menampilkan
spanduk pratinjau pemilik; itu wajar, group ini `PRIVATE`. Buka tab
**Network** di peramban sebelum mengklik, dan baca status responsnya.

Tiga hasil yang mungkin, dan ketiganya membedakan sebab yang berbeda:

| Hasil | Artinya | Putusan |
|---|---|---|
| **200**, PDF tampil di peramban | `getFileStream()` bekerja. Autentikasi Blob dua arah terbukti. | **LULUS** |
| **503**, teks `Berkas sedang tidak dapat diambil.` | Blob melempar galat. Inilah kegagalan yang sedang dicari. | **GAGAL** |
| **303** ke `/tidak-tersedia` | Blob menjawab, tetapi berkasnya tidak ada di sana. `putFile()` dan `getFileStream()` menyentuh store yang berbeda. | **GAGAL** |

Bedanya penting dan sengaja dibuat begitu di `lib/gate/serve-item.ts`:
lemparan berarti kegagalan Blob sungguhan dan item **tidak** ditandai
rusak, sedangkan `null` berarti berkasnya memang tidak ditemukan dan
item **ditandai** `isBroken = true` secara permanen berikut satu baris
`AccessLog` `DENIED / FILE_MISSING`.

**Bila hasilnya 303, hentikan pemeriksaan.** Item itu kini bertanda
rusak di basis data. Jangan mengulanginya berkali-kali untuk memastikan
— hasilnya sama dan setiap percobaan menambah baris riwayat.

Perhatikan juga responsnya memuat `Content-Disposition: inline` dengan
nama berkas yang benar, dan `Content-Type: application/pdf`.

## CEK P4 — unggah gambar

Ulangi CEK P2 dan CEK P3 dengan sebuah PNG atau JPEG kecil. Jalur
`mimeType` kedua, dan `Content-Type` responsnya harus `image/png` atau
`image/jpeg` — bukan `application/octet-stream`.

Cukup satu putaran. Bila P3 lulus untuk PDF, kegagalan di sini hampir
pasti soal deteksi tipe, bukan soal Blob.

## CEK P5 — batas ukuran

Tiga berkas, tiga ukuran, dijalankan berurutan. Ukurannya ditulis dalam
byte dengan sengaja: `MAX_UPLOAD_BYTES` bernilai **4.194.304 byte**, dan
"4 MB" dalam percakapan sehari-hari bisa berarti 4.000.000 — selisih
yang persis cukup untuk membuat pemeriksaan ini menjawab pertanyaan yang
salah.

Menyiapkan berkasnya di PowerShell, dari sebuah PDF kecil mana pun
sebagai benih. Byte nol ditambahkan di belakang; `detectFileType()`
membaca magic bytes di awal berkas, jadi tipenya tetap terdeteksi PDF.

```powershell
$benih = "C:\path\ke\berkas-kecil.pdf"
foreach ($n in 4194304, 4194305, 5000000) {
  $isi = [System.IO.File]::ReadAllBytes($benih)
  $keluar = New-Object byte[] $n
  [Array]::Copy($isi, $keluar, [Math]::Min($isi.Length, $n))
  [System.IO.File]::WriteAllBytes("$env:TEMP\cek-$n.pdf", $keluar)
}
```

| Berkas | Ukuran | Yang diharapkan |
|---|---|---|
| **A** | 4.194.304 byte — tepat di batas | **Diterima**, 201. Syarat penolakan adalah `>` batas, bukan `>=`. Sama seperti yang sudah terbukti di lokal. |
| **B** | 4.194.305 byte — batas lebih satu byte | **Ditolak 413** oleh kode kita, badan respons `{"error":{"code":"FILE_TOO_LARGE","message":"Ukuran berkas maksimal 4 MB."}}`. Total amplopnya masih di bawah 4,5 MB, jadi Vercel seharusnya meneruskannya kepada kita. |
| **C** | 5.000.000 byte — di atas batas infrastruktur | **Inilah yang belum diketahui.** Bila Vercel menolak lebih dulu, responsnya bukan JSON kita melainkan halaman `FUNCTION_PAYLOAD_TOO_LARGE` milik Vercel. |

Baca ketiganya di tab Network. Yang dicatat untuk berkas C: **kode
statusnya, apakah badan responsnya JSON atau HTML, dan apa yang
sebenarnya dilihat pemilik di layar dashboard** — kode penanganan galat
di klien mengharapkan bentuk `{ error: { code, message } }`, dan bila
Vercel mengirim HTML, pemilik mungkin melihat pesan kosong atau galat
parsing alih-alih kalimat yang berguna.

Hasil berkas C tidak menggagalkan pemeriksaan apa pun. Ia informasi yang
menentukan apakah Unit 5 perlu menangani bentuk galat kedua. Catat apa
adanya di `progress-tracker.md`.

## CEK P6 — pembersihan

Hapus group **`Cek Preview`** dari dashboard. Penghapusan group menyapu
seluruh item berikut berkasnya di Blob lewat `deleteFilesByPrefix()`.

Yang **tetap tertinggal, sesuai rancangan**: baris-baris `AccessLog`
dari setiap kali item dibuka di CEK P3 dan P4. `AccessLog` tidak
memiliki foreign key dan tidak pernah ikut terhapus. Bila preview
memakai basis data yang sama dengan lokal (P0-e), baris-baris ini akan
ikut terlihat saat tabel riwayat dibangun di Unit 6 — tidak berbahaya,
tetapi ketahuilah asalnya sebelum bingung mencarinya.

## Sesudahnya

**Bila P1–P4 lulus:** dorong `main` ke `origin`, lalu susulkan `dev`
dengan `merge --ff-only` dan dorong juga — kebiasaan yang dicatat di
bagian Release Prerequisites. Setelah itu Unit 5 terbuka.

**Bila P3 gagal (503 atau 303):** jangan dorong `main`. Kegagalannya ada
di lapisan kredensial atau penautan store, bukan di kode gerbang, dan
memperbaikinya di Production berarti memperbaikinya di depan pengunjung.

Catat hasil kelima pemeriksaan di `context/progress-tracker.md`, di
bagian yang sama tempat CEK 1–9 Unit 4 dicatat, berikut bentuk respons
berkas C apa adanya.
