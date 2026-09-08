# Unit 5 — Panel Bagikan, kedaluwarsa, dan QR

Spesifikasi hasil sesi brainstorming 8 September 2026.
Menjadi keputusan implementasi atas apa yang sudah tertulis di
keenam file konteks — bukan rancangan produk baru.

## Lingkup

Panel Bagikan sebagai sheet, pengaturan `visibility`,
`expiresAt`, dan `shareEnabled`, penyalinan URL berbagi, QR code
per group yang dibuat di server sebagai SVG, dan spanduk
pratinjau pemilik untuk group nonaktif.

**Selesai bila:** pemilik dapat mencabut link dan menyaksikan
halaman publiknya berubah menjadi halaman tidak tersedia,
sementara pemilik sendiri masih dapat membukanya dengan spanduk
peringatan.

## Yang sudah ada sebelum unit ini

Diverifikasi dengan membaca kode, bukan diasumsikan:

- Kolom `visibility`, `shareEnabled`, dan `expiresAt` sudah ada di
  skema dan sudah dibaca `evaluateGroupAccess()` pada urutan
  3 → 4 → 5 (`lib/access/evaluate-access.ts:48`, `:49`, `:51`).
- `resolveGroupStatus()` dan `GroupStatusBadge` sudah menampilkan
  kelima keadaan di baris akordeon, termasuk tanggal kedaluwarsa
  bernada peringatan.
- `OwnerPreviewBanner` sudah ada dan sudah terpasang di
  `app/(public)/g/[slug]/page.tsx:90`, dipicu `decision.ownerPreview`.
- Halaman "tidak tersedia" beserta keidentikannya dengan slug asing
  sudah selesai di Unit 4.
- `components/ui/sheet.tsx`, `switch`, `radio-group`, `calendar`, dan
  `popover` sudah ter-generate.
- `readPublicGroup()` sudah menyertakan `shareEnabled` dan `expiresAt`.

Yang benar-benar baru: antarmuka penyuntingnya, pembuatan QR
beserta rutenya, dan pembedaan sebab pada spanduk.

## Baris merah yang berlaku di unit ini

`lib/access/evaluate-access.ts` **tidak disentuh sama sekali.**
Unit ini hanya memberi antarmuka kepada tiga kolom yang sudah
dibaca evaluator sejak Unit 4. Tidak ada aturan izin baru, karena
itu tidak ada baris matriks baru, dan tidak ada jalur baru menuju
konten.

Unit ini juga tidak menambah maupun mengubah satu pun penulisan
`AccessLog`. Halaman publik dan gerbang item tidak diubah selain
prop `reason` pada spanduk.

## Keputusan

### U5-6 — Domain QR sebagai konstanta di kode, bukan variabel lingkungan

`APP_ORIGIN = "https://diandiandian.web.id"` hidup sebagai
konstanta di `lib/groups/share-url.ts` dan ikut masuk repositori.

Alasannya berasal dari kegagalan U5-1: sepuluh variabel lingkungan
tersimpan kosong di Vercel selama empat belas hari tanpa dapat
dibaca siapa pun, karena nilai bertipe `Sensitive` memang tidak
dapat dibaca ulang. Domain bukan rahasia. Menaruhnya di kode
membuat nilainya terbaca mata di diff dan di code review, dan
membuatnya mustahil kosong tanpa terlihat.

**Gerbang D1 diperiksa ulang, seperti diminta `progress-tracker.md`:**
`docs/setup-layanan.md` menyebut apex `diandiandian.web.id` berstatus
Production dan `www` mengalihkan 308 ke apex. Arah pengalihan tidak
berubah sejak keputusan itu dicatat.

**Konsekuensi yang diterima sadar:** di localhost, URL yang disalin
dan QR menunjuk `diandiandian.web.id`, bukan `localhost:3000`.
Pemeriksaan peramban Unit 5 karena itu tidak dapat menguji tautan
tersebut dengan mengekliknya di mesin lokal. Halaman publiknya
tetap dapat dibuka dengan mengetik path-nya langsung.

### U5-7 — Saklar menyimpan seketika, dua setelan lain bertombol simpan

Lingkup unit ini berbunyi "mencabut link **seketika**". Tombol
simpan di antara saklar dan akibatnya membatalkan kata itu, dan
panel yang tertutup tanpa ditekan simpan akan membuang pencabutan
yang dikira sudah terjadi.

Tingkat akses dan tanggal kedaluwarsa memakai satu tombol Simpan
bersama: keduanya sering diubah berbarengan saat menyiapkan acara,
dan menyimpan tiap ketukan kalender menghasilkan tulisan basis data
yang tidak diminta siapa pun.

Pencabutan tidak memakai dialog konfirmasi. Ia dapat dibatalkan
dengan menggeser balik, dan konfirmasi menambah satu ketukan pada
satu-satunya tindakan darurat di panel ini.

### U5-8 — `expiresAt` disetel per tanggal, mati pada akhir hari WIT

Pemilik memilih tanggal saja. Tanggal itu disimpan sebagai
23:59:59.999 waktu Asia/Jayapura, sehingga memilih 30 September
berarti link hidup sepanjang 30 September dan mati saat tanggal
berganti — pembacaan yang sama dengan tanggal kedaluwarsa pada
umumnya.

Jam dan menit tidak disediakan: baris akordeon dan lencana
"berakhir 3 hari lagi" hanya menampilkan tanggal, sehingga jam yang
disetel tidak akan terlihat di tempat pemilik biasanya membacanya.

Konversinya aritmetika tetap UTC+9, bukan pustaka zona waktu.
Asia/Jayapura tidak pernah mengenal DST, dan menambah dependensi
untuk satu penjumlahan konstanta tidak sebanding.

Aturan ini ikut mengikat `AccessRequest.expiresAt` yang diwarisi
dari `group.expiresAt` saat izin disetujui di Unit 7.

### U5-9 — QR hanya SVG, 80 mm, koreksi galat M, margin 4 modul

**Format.** SVG saja. Satu rute, satu format, tanpa dependensi
tambahan, dan tetap tajam pada ukuran berapa pun. `architecture.md`
serta `project-overview.md` sudah menyebut SVG, sehingga pilihan ini
tidak menuntut perubahan lingkup.

**Ukuran.** Berkas membawa `width="80mm" height="80mm"` dengan
`viewBox` dipertahankan, sehingga tertempel sebagai 8 cm di Word,
Docs, atau Canva tanpa diseret-seret. Jarak pindai kira-kira
sepuluh kali lebar QR, jadi 8 cm terbaca dari sekitar 80 cm — jarak
orang membaca kertas yang dipegang atau tergeletak di meja rapat.
Karena SVG tetap vektor, membesarkannya menjadi poster tidak
merusak apa pun; angka ini hanya menentukan ukuran bawaan saat
ditempel.

**Margin 4 modul.** Ini quiet zone minimum di spesifikasi QR, bukan
selera. Memangkasnya membuat sebagian pemindai gagal mengunci, dan
itu kegagalan yang muncul di tangan tamu, bukan di layar kita.

**Koreksi galat M.** Menahan cetakan yang tidak sempurna tanpa
merapatkan modul sebanyak Q atau H, yang justru mempersulit
pemindaian saat QR dicetak kecil.

### U5-10 — QR dilayani satu route handler, bukan disisipkan atau disimpan

`GET /api/groups/[groupId]/qr` di balik `getOwnerSession()`.
Pratinjau di panel memakai `<img src>` ke rute itu; unduhan adalah
`<a href download>` ke rute yang sama dengan `?unduh=1`.

Dua alternatif ditolak:

- **Disisipkan sebaris** lewat `dangerouslySetInnerHTML`, dengan
  unduhan dibuat di klien memakai Blob URL. Ditolak karena string
  SVG akan membengkakkan payload dashboard untuk setiap group yang
  panelnya tidak pernah dibuka, dan unduhannya menjadi bergantung
  JavaScript.
- **Disimpan di Blob** saat setelan disimpan. Ditolak karena ia
  menciptakan berkas turunan yang wajib disapu dan dibuat ulang
  setiap slug berubah — satu keadaan basi baru yang harus dijaga,
  demi komputasi yang murah.

`getOwnerSession()` dipakai, bukan `requireOwner()`, mengikuti
alasan yang sudah tertulis di `lib/auth/session.ts`: pemanggilnya
memuat gambar, dan pengalihan yang diikuti diam-diam akan
menghasilkan respons 200 berisi halaman masuk.

### U5-11 — Tombol salin adalah jalan pintas, bukan satu-satunya jalan

URL berbagi tampil utuh dalam monospasi dan dapat diseleksi sejak
panel dibuka. Ketika penulisan clipboard melempar — konteks tidak
aman, izin ditolak, peramban lawas — kode menyeleksi seluruh teks
URL lalu menampilkan **"Tidak dapat menyalin otomatis. Tekan Ctrl+C
untuk menyalin."**

Mundur diam-diam ke `document.execCommand("copy")` ditolak: API itu
sudah usang dan pada sebagian peramban mengembalikan `true` tanpa
menyalin apa pun, menghasilkan pesan berhasil yang berbohong —
kegagalan yang lebih buruk daripada yang jujur.

Monospasi untuk URL berbagi bukan keputusan baru; `ui-context.md`
sudah menetapkannya bersama slug dan alamat IP.

### U5-12 — Saklar dan tingkat akses adalah dua pekerjaan berbeda

Saklar berlabel **"Link berbagi aktif"** berdiri di atas ketiga
pilihan tingkat akses. Ia menjawab "hidup atau mati". Ketiga pilihan
menjawab "siapa yang boleh membuka selama hidup". Pilihan Privat
diberi baris penjelas **"Hanya Anda. Berguna saat group masih
disiapkan."**

Ketika saklar mati, ketiga pilihan **tetap dapat diubah**, disertai
keterangan bahwa setelan itu belum berlaku selama link mati.
Mengunci pilihan akan memaksa pemilik menghidupkan link lebih dulu —
termasuk beberapa detik ke publik — hanya untuk menyiapkan setelan
acara yang belum ingin ia sebarkan.

Menggabungkan keduanya menjadi satu daftar empat nilai
(Mati · Privat · Wajib masuk · Publik) ditolak: ia menulis dua kolom
dari satu masukan, sehingga mematikan link akan melupakan tingkat
akses yang sudah disetel, dan pencabutan seketika berubah menjadi
memilih satu baris di daftar alih-alih menggeser satu saklar.

### U5-13 — Spanduk pratinjau pemilik membedakan sebabnya

`ui-context.md` sudah menetapkan bahwa pada lencana dashboard,
**sebab menentukan nada**: saklar mati adalah pilihan sadar pemilik
dan bernada netral, sedangkan kedaluwarsa terjadi tanpa ia
memutuskan apa pun. Spanduk mengikuti aturan yang sama.

- Dicabut → "Link berbagi group ini Anda matikan. Hanya Anda yang
  dapat melihat halaman ini."
- Kedaluwarsa → "Link berbagi group ini kedaluwarsa 30 Sep 2026 WIT.
  Hanya Anda yang dapat melihat halaman ini."

Bila keduanya berlaku, saklar mati menang — urutan yang sama dengan
lencana dashboard.

Sebabnya ditentukan fungsi murni `resolvePreviewReason()` yang
membaca `shareEnabled` dan `expiresAt`, keduanya sudah tersedia di
`readPublicGroup()`. **`evaluate-access.ts` tidak diubah**, dan
`ownerPreview` tetap boolean. Ini murni keputusan teks, bukan
keputusan izin.

Bentuk visual spanduk tidak berubah sedikit pun: rule tebal di tepi
kiri beraksen peringatan di atas `--bg-elevated`, ikon `Ban`, lebih
datar daripada kartu item, tidak dapat ditutup.

## Modul dan batasnya

| Berkas | Isi | Sifat |
| --- | --- | --- |
| `lib/groups/share-url.ts` | `APP_ORIGIN`, `shareUrl(slug)` | murni, diuji |
| `lib/time/expiry.ts` | `endOfDayWIT()`, `witDateParts()` | murni, diuji |
| `lib/groups/preview-reason.ts` | `resolvePreviewReason()` | murni, diuji |
| `lib/validation/share.ts` | skema Zod panel Bagikan | murni, diuji |
| `lib/db/groups.ts` | `readGroupSharing`, `updateGroupSharing`, `setShareEnabled` | menyentuh Prisma |
| `app/(dashboard)/dashboard/share-actions.ts` | dua server action | gerbang + mutasi |
| `app/api/groups/[groupId]/qr/route.ts` | SVG QR | route handler |
| `components/dashboard/share-sheet.tsx` | cangkang sheet | klien |
| `components/dashboard/share-settings-form.tsx` | tingkat akses + kedaluwarsa | klien |
| `components/dashboard/share-link-field.tsx` | URL mono + tombol salin | klien |
| `components/dashboard/share-qr-panel.tsx` | pratinjau + unduh | klien |
| `components/dashboard/use-sheet-side.ts` | kanan di ≥640 px, bawah di bawahnya | klien |

Panel dipecah menjadi empat komponen sejak awal, bukan setelah
membengkak: satu berkas yang memuat saklar, kalender, clipboard, dan
QR sekaligus akan menembus ambang ±200 baris `code-standards.md`
sebelum selesai ditulis.

`lib/types/group.ts` tidak berubah — `GroupListItem` sudah memuat
ketiga kolomnya.

Dependensi baru: `qrcode` dan `@types/qrcode`. Murni JavaScript,
tanpa modul native.

## Panel Bagikan

Dibuka dari tombol **Bagikan** berikon `Share2` di badan akordeon,
sebaris dengan "Ubah judul dan slug" dan "Hapus group".

Sheet muncul dari kanan pada lebar ≥640 px dan dari bawah di
bawahnya. Sisinya dipilih `use-sheet-side.ts`, yang membaca
`matchMedia` **setelah mount** dan memulai dari `"bottom"` supaya
render pertama server dan klien identik.

Urutan isinya dari atas:

1. **Saklar "Link berbagi aktif"** — menulis pada detik digeser.
2. **Tingkat akses** — `radio-group` tiga pilihan, dengan penjelas
   pada Privat.
3. **Tanggal kedaluwarsa** — `Popover` berisi `Calendar`, ditambah
   tombol "Tanpa batas waktu" untuk mengosongkannya. Tanggal
   terpilih ditampilkan mono ber-label WIT.
4. **Tombol Simpan** — hanya untuk butir 2 dan 3.
5. **URL berbagi** — mono, dapat diseleksi, dengan tombol Salin.
6. **QR** — pratinjau 176 px persegi, tombol "Unduh QR (SVG)", dan
   baris redup **"QR memuat alamat lengkap group ini. Mengubah slug
   membuat QR yang sudah dicetak berhenti berfungsi."**

URL dan QR **tetap ditampilkan saat saklar mati.** Pemilik
menyiapkan bahan acara sebelum menyebarkannya; menyembunyikannya
memaksa link dihidupkan lebih dulu — persis yang tidak ingin ia
lakukan.

## Aksi server

Dua server action di `share-actions.ts`, keduanya memanggil
`requireOwner()` di baris pertama karena layout tidak melindungi
server action — badan aksi berjalan sebelum layout dirender ulang.

- `toggleShareAction(groupId, enabled)` — satu kolom, satu tulisan.
- `updateShareSettingsAction(groupId, { visibility, expiresOn })` —
  `expiresOn` berupa string `YYYY-MM-DD` atau kosong.

Urutan tetap di keduanya, mengikuti `code-standards.md`: baca sesi,
periksa peran, validasi dengan Zod, jalankan, kembalikan bentuk
respons yang konsisten. Bentuk galatnya
`{ error: { code, message } }` dengan pesan berbahasa Indonesia.

Keduanya ditutup `revalidatePath(DASHBOARD_PATH)` sehingga lencana
dan tanggal di baris akordeon ikut berubah tanpa muat ulang.

## Route QR

`GET /api/groups/[groupId]/qr`

1. `getOwnerSession()`; `null` → 403 `{ error: { code, message } }`.
2. Validasi `groupId` dengan Zod; group tidak ada → 404 berbentuk
   sama.
3. `qrcode.toString(shareUrl(slug), { type: "svg",
   errorCorrectionLevel: "M", margin: 4 })`, lalu dimensi `80mm`
   dipasang pada elemen SVG dengan `viewBox` dipertahankan.
4. `Content-Type: image/svg+xml`.
   `?unduh=1` → `Content-Disposition: attachment;
   filename="qr-<slug>.svg"`; tanpa itu → `inline`.
5. `Cache-Control: no-store`. Slug dapat berubah, dan QR basi di
   layar akan disalin ke kertas.

`export const dynamic = "force-dynamic"` dan `runtime = "nodejs"`,
sama dengan route handler unggahan yang sudah ada.

## Pengujian

Unit test Vitest untuk keempat modul murni:

- `shareUrl()` — bentuk URL absolut, dan tidak ada slash ganda.
- `endOfDayWIT()` dan `witDateParts()` — termasuk tanggal yang
  instannya menyeberang batas hari UTC, dan bolak-balik yang
  kembali ke tanggal semula.
- `resolvePreviewReason()` — dicabut, kedaluwarsa, dan keadaan
  ketika keduanya berlaku bersamaan.
- Skema Zod — nilai `visibility` di luar enum ditolak, tanggal
  berbentuk salah ditolak, string kosong berarti tanpa batas waktu.

Tidak ada penambahan pada matriks `evaluateAccess()`, karena tidak
ada aturan izin yang berubah.

## Verifikasi ujung ke ujung

Pemeriksaan peramban yang membuktikan kriteria selesai unit ini,
dijalankan di mode terang dan gelap serta pada lebar ponsel:

1. Setel group `PUBLIC`, saklar hidup. Buka slug-nya di jendela
   penyamaran — halaman group tampil.
2. Matikan saklar di panel Bagikan. Muat ulang jendela penyamaran —
   halaman tidak tersedia, identik dengan membuka slug yang tidak
   pernah ada.
3. Buka slug yang sama sebagai pemilik — halaman tampil dengan
   spanduk varian **dicabut**.
4. Hidupkan saklar, setel kedaluwarsa ke tanggal kemarin. Ulangi
   langkah 2 dan 3 — halaman tidak tersedia bagi pengunjung, dan
   spanduk varian **kedaluwarsa** menyebut tanggalnya bagi pemilik.
5. Unduh QR, buka berkasnya, pindai dari sekitar 80 cm setelah
   dicetak atau ditampilkan seukuran 8 cm — hasil pindaiannya
   `https://diandiandian.web.id/g/<slug>`.
6. Tolak izin clipboard di peramban, tekan Salin — teks terseleksi
   dan pesan Ctrl+C muncul.

## Perubahan file konteks

Wajib dilakukan **sebelum** kode ditulis, mengikuti aturan
"selesaikan dulu di file konteks yang relevan":

- **`ui-context.md`** — isi dan urutan panel Bagikan, perilaku
  saklar yang menyimpan seketika, penjelas pilihan Privat, dua
  varian teks spanduk pratinjau pemilik.
- **`architecture.md`** — `APP_ORIGIN` sebagai konstanta di kode
  beserta alasannya, route QR dan geometrinya, aturan akhir-hari
  WIT untuk `expiresAt` berikut akibatnya pada
  `AccessRequest.expiresAt` yang diwarisi.
- **`progress-tracker.md`** — keputusan U5-6 sampai U5-13.

`project-overview.md` dan `code-standards.md` tidak perlu diubah:
keduanya sudah menyebut QR SVG dirender di server, dan tidak ada
konvensi kode baru yang lahir di unit ini.
