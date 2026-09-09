# Unit 6 — Halaman riwayat akses per group

Spesifikasi hasil sesi brainstorming 9 September 2026.
Menjadi keputusan implementasi atas apa yang sudah tertulis di
keenam file konteks — bukan rancangan produk baru.

## Lingkup

Halaman Riwayat tersendiri per group di dashboard, memuat tabel
berkolom Waktu, Nama, Email, Item, dan Hasil, dengan penyaringan
menurut item dan rentang tanggal, cip "Hanya yang ditolak",
paginasi berbasis halaman, dan tumpukan kartu menggantikan tabel
di lebar ponsel. Alamat IP tampil monospasi.

**Selesai bila:** pemilik dapat melihat siapa mengakses item apa
pada jam berapa, dan menyaringnya.

## Yang sudah ada sebelum unit ini

Diverifikasi dengan membaca kode, bukan diasumsikan:

- Tabel `AccessLog` sudah lengkap di skema, termasuk `visitorName`,
  `visitorEmail`, `outcome`, `denyReason`, `ipAddress`, dan indeks
  gabungan `(groupId, createdAt)` (`prisma/schema.prisma`).
- Kesepuluh nilai `DenyReason` sudah ada sebagai enum Prisma, dan
  seluruhnya sudah benar-benar dihasilkan oleh kode: enam cabang
  menghasilkan `NOT_FOUND` (`lib/access/evaluate-access.ts:38`,
  `:66`, `:97`, `:124`, `:135`, dan `lib/gate/serve-item.ts:43`),
  sisanya masing-masing satu cabang. Tiga nilai — `REQUEST_REJECTED`,
  `REQUEST_REVOKED`, `APPROVAL_EXPIRED` — belum dapat muncul sampai
  Unit 7 ada.
- Baris `AccessLog` sudah ditulis `lib/audit/` di setiap jalur gerbang,
  dan `lib/audit/` adalah **penulis**; belum ada satu pun pembaca.
- Aritmetika WIT tetap sudah ada di `lib/time/expiry.ts`:
  `WIT_UTC_OFFSET_MINUTES`, `isCalendarDate()`, `endOfDayWIT()`,
  `witDateParts()`. Yang belum ada hanyalah batas bawah hari dan
  pemformat berjam — `formatDateWIT()` tidak menyertakan jam sama
  sekali.
- `components/ui/table.tsx`, `select.tsx`, `calendar.tsx`, dan
  `popover.tsx` sudah tergenerate sejak Unit 1.
- Tata bahasa lencana sudah ditetapkan
  `components/dashboard/group-status-badge.tsx`: pil `rounded-full`,
  garis batas setipis rambut, permukaan bernada tipis, tidak pernah
  terisi penuh, selalu ikon plus teks.
- Pola penyaring yang ada (`use-group-filter.ts`) menyaring larik di
  memori tanpa menyentuh database, sehingga **tidak** dapat dipakai
  ulang di sini: setiap perubahan penyaring riwayat adalah kueri baru.
- `tests/` belum pernah menyentuh Postgres. Ketiga puluh berkasnya
  adalah fungsi murni, Prisma yang di-mock, atau pengujian batas yang
  membaca teks sumber.
- `app/(dashboard)/layout.tsx:33` mengunci `<main>` pada `max-w-4xl`
  untuk seluruh halaman di bawahnya.

## Baris merah yang berlaku di unit ini

- **Riwayat dibaca dari `AccessLog.visitorName` dan
  `AccessLog.visitorEmail`, tidak pernah dari join ke tabel `User`.**
  Data pengguna berubah kemudian; riwayat harus menunjukkan keadaan
  pada saat kejadian.
- **Halaman ini tidak menyajikan konten apa pun,** sehingga ia bukan
  jalur menuju konten dan tidak memanggil `evaluateAccess()`.
  Gerbangnya `requireOwner()`.
- **`targetUrl` dan `fileKey` tidak muncul di `select` mana pun** —
  invarian 3.
- **Unit ini tidak menulis satu baris pun ke `AccessLog`.** Hanya
  `lib/audit/` yang menulis, dan modul itu tidak disentuh.
- **Seluruh waktu yang terlihat memakai `Asia/Jayapura` dan
  menyertakan label `WIT`** — D2, wajib.

## Keputusan

### U6-1 — Tabel memuat `PAGE_VIEW` maupun `ITEM_ACCESS`

Kelima kolom di `ui-context.md` tidak menyebut `eventType`, dan baris
`PAGE_VIEW` tidak punya `itemId` sehingga sel Item-nya kosong.

Sel itu tidak dibiarkan kosong. Ia berbunyi **"Membuka halaman group"**
bergaya redup miring, sehingga terbaca sebagai jenis peristiwa lain —
bukan sebagai data yang gagal dimuat. Penyaring item otomatis membuang
baris `PAGE_VIEW` saat dipakai, karena baris itu tidak menunjuk item
mana pun.

**Alternatif yang ditolak:** hanya menampilkan `ITEM_ACCESS`. Lebih
sederhana dan setiap baris pasti punya Item, tetapi pemilik kehilangan
jawaban atas "siapa saja yang membuka halamannya", dan tidak ada
permukaan lain di aplikasi yang menjawabnya.

### U6-2 — Baris tanpa identitas berbunyi "Tanpa identitas", dan IP naik ke sel Nama

Baris tanpa nama dan email bukan kelainan melainkan rancangan: klik
item `OPEN` oleh pengunjung anonim **selalu** dicatat, dan setiap baris
`DENIED / RATE_LIMITED` ditulis sebelum sesi dibaca (U4-11).

Sel Nama berbunyi "Tanpa identitas" bergaya redup, dan **alamat IP naik
dari baris kedua di bawah Waktu menjadi satu-satunya penanda yang
tersisa di kolom identitas**. Pada baris beridentitas, IP tetap di
bawah Waktu.

**Alternatif yang ditolak:** mengosongkan sel. Sel kosong tidak dapat
dibedakan dari kegagalan memuat data.

### U6-3 — Lebar dashboard turun ke halaman, bilah mengikuti

`max-w-4xl` dipindahkan dari `<main>` di layout ke masing-masing
halaman. Dashboard tetap `max-w-4xl`; halaman Riwayat memakai
`max-w-6xl`.

Bilah atas dan `<main>` bersaudara, sehingga bilah tidak dapat membaca
lebar yang disetel halaman di bawahnya. Mekanismenya penanda CSS:
pembungkus terluar diberi `group/shell`, halaman Riwayat merender
`data-wide`, dan kedua container memakai varian
`group-has-[[data-wide]]/shell:max-w-6xl`. Seluruhnya server, tanpa
komponen klien dan tanpa terikat `pathname`.

**Alternatif yang ditolak:** mematok bilah pada `max-w-6xl` untuk semua
halaman — tepi kiri nama aplikasi tidak lurus dengan isi di halaman
dashboard. Dan komponen klien yang membaca `usePathname()` — lebih
lugas dibaca, tetapi menambahkan komponen klien ke layout yang sekarang
seluruhnya server.

### U6-4 — Alamat `/dashboard/groups/[groupId]/riwayat`

Memakai `id` yang tidak pernah berubah, bukan slug. Slug dapat diubah
pemilik lewat panel Bagikan, sedangkan `ui-context.md` menuntut posisi
baris riwayat "stabil serta dapat dirujuk" — dan alamat yang mati
karena penggantian slug tidak dapat dirujuk. Alamatnya tidak terbaca
manusia, tetapi hanya pemilik yang melihatnya.

Pintu masuknya tombol tautan "Riwayat" di baris tombol dalam akordeon
group, bersebelahan dengan "Bagikan" — satu-satunya tempat di aplikasi
yang sudah mengumpulkan tindakan per group.

### U6-5 — Lima puluh baris per halaman, paginasi offset

`ui-context.md` sudah menetapkan paginasi berbasis halaman dengan total
dinyatakan, contohnya `1–50 dari 214`. Dua tuntutan itu — mengetahui
total dan dapat melompat ke halaman mana pun — menutup cursor sebagai
pilihan, karena cursor tidak dapat melakukan keduanya.

Angka 50 diambil dari contoh yang sudah tertulis itu sendiri, sehingga
file konteks tidak perlu diubah. Acara dua ratus peserta muat di
sekitar empat sampai sepuluh halaman.

**Alternatif yang ditolak:** 25 baris — satu layar laptop tanpa
menggulir, tetapi jumlah halamannya berlipat dua. Dan 100 baris —
paling sedikit klik, tetapi satu halaman ponsel menjadi seratus kartu.

### U6-6 — Baris `DENIED` dibedakan pil dan alasan, tanpa perlakuan tingkat baris

Kolom Hasil memakai pil bertata bahasa `GroupStatusBadge`: "Diizinkan"
berikon `Check` bernada `state-success`, "Ditolak" berikon `X` bernada
`state-error`. Ikon dan teks itulah yang memenuhi aturan bahwa warna
tidak pernah menjadi satu-satunya pembawa makna. Baris `DENIED` juga
lebih tinggi karena membawa baris alasan.

Tidak ada tepi berwarna dan tidak ada latar bernada di tingkat baris.
Cip "Hanya yang ditolak" sudah menjadi jalan resmi memisahkan baris
ini; menandai baris lagi berarti membayar dua kali untuk pekerjaan yang
sama, dan `ui-context.md` menuntut tidak ada hiasan yang tidak
menjelaskan apa pun.

**Alternatif yang ditolak:** penanda tepi kiri — terlihat saat memindai
dari kiri, tetapi mengulang pekerjaan cip. Dan latar baris bernada
tipis — pembeda yang murni warna, hilang seluruhnya bagi pembaca yang
tidak membedakan warna.

### U6-7 — Kesepuluh `denyReason` sebagai label pendek, penjelasan di `title`

| `denyReason` | Label |
| --- | --- |
| `NOT_FOUND` | Tidak ditemukan |
| `REVOKED` | Link dicabut |
| `EXPIRED` | Group kedaluwarsa |
| `PRIVATE` | Group privat |
| `ITEM_INACTIVE` | Item nonaktif |
| `FILE_MISSING` | Berkas hilang |
| `RATE_LIMITED` | Terlalu banyak percobaan |
| `REQUEST_REJECTED` | Permintaan ditolak |
| `REQUEST_REVOKED` | Izin dicabut |
| `APPROVAL_EXPIRED` | Izin kedaluwarsa |

Empat pasangan sengaja dijaga tidak bertabrakan: "Link dicabut" bukan
"Izin dicabut", dan "Group kedaluwarsa" bukan "Izin kedaluwarsa".

**`NOT_FOUND` dijaga tetap luas.** Ia dihasilkan enam cabang berbeda —
group tidak ada, item tidak ada, item milik group lain, nilai enum tak
dikenali, item `APPROVAL` selama Unit 7 belum ada, dan item `EXTERNAL`
tanpa `targetUrl`. U4-12 sudah menetapkan yang terakhir dicatat sebagai
`NOT_FOUND` justru supaya riwayat tidak berbohong dengan menjanjikan
kegagalan berkas. Label yang menyempit akan membatalkan keputusan itu.

Tiga label tidak menjelaskan dirinya sendiri kepada pemilik yang membuka
riwayat berbulan-bulan kemudian, jadi setiap label membawa kalimat
penjelas di atribut `title` — pola yang sama yang sudah dipakai kolom
Item untuk judul terpotong. Konsekuensi yang diterima secara sadar:
penjelasan itu tidak terjangkau di ponsel, yang memang tidak punya
kursor, dan riwayat forensik memang dibaca di laptop.

Baris `DENIED` yang alasannya kosong atau tidak dikenali berbunyi
**"Alasan tidak diketahui"** — tidak pernah sel kosong. Petanya ditulis
`Record<DenyReason, DenyReasonText>` supaya penambahan anggota enum
menggagalkan kompilasi, disiplin yang sama dengan penjaga `never` di
`evaluate-access.ts`.

**Alternatif yang ditolak:** kalimat penuh langsung di sel — terbaca di
ponsel tanpa interaksi, tetapi membuat tinggi baris bervariasi dan
mendorong kolom Hasil melebar, padahal Waktu wajib berlebar tetap dan
Item yang menyusut lebih dulu.

### U6-8 — Item terhapus dinyatakan, dan penyaringnya memuat entri untuknya

`AccessLog` sengaja tidak punya foreign key: menghapus group wajib
menyisakan riwayatnya. Akibatnya baris riwayat bertahan setelah itemnya
dihapus, sementara judul item **tidak** ikut disalin ke baris log —
hanya nama dan email pengunjung yang disalin.

Sel Item pada baris semacam itu berbunyi "Item sudah dihapus" bergaya
redup, dan penyaring item memuat satu entri untuknya — tetapi hanya
bila riwayat group itu memang memuat baris semacam itu. Baris tetap
terhitung dalam total dan paginasi.

**Alternatif yang ditolak:** menambah kolom `itemTitle` ke `AccessLog`
dan mengisinya saat kejadian, dengan alasan yang sama yang membuat
`visitorName` disalin. Menyelesaikan masalahnya di akar untuk
seterusnya, tetapi menuntut migrasi skema dan perubahan `lib/audit/` di
dalam Unit 6 — sementara baris yang sudah tertulis sebelum migrasi
tetap tidak punya judul, sehingga keadaan "Item sudah dihapus" tetap
harus ada.

### U6-9 — Bukti "nama lama bertahan" ditulis tiga lapis tanpa database

Pengujian yang dituntut pemilik — ubah nama pengguna, pastikan baris
lama tetap menampilkan nama lama — menyentuh database, dan repositori
ini belum pernah menjalankan satu pun pengujian berdatabase.

Bentuknya tiga lapis, mengikuti pola yang sudah ada:

1. **Fungsi murni pemetaan baris.** `toHistoryRow()` menerima baris log
   dan peta judul item, dan **tidak ada argumen ketiga bertipe data
   pengguna**. "Nama Baru" tidak punya satu pun saluran untuk masuk.
   Salah satu kasus ujinya menegaskan `toHistoryRow.length === 2`,
   sehingga penambahan argumen berisi `User` memerahkan pengujian
   sebelum sempat dipakai di halaman.
2. **Kueri dengan Prisma di-mock.** Memastikan tidak ada `include`
   maupun `select` yang menyentuh relasi `user`, dan `orderBy` memuat
   pengurut kedua `id`.
3. **Pengujian batas yang membaca teks sumber.** Memastikan
   `lib/db/access-logs.ts` tidak pernah memuat `include`, `prisma.user`,
   maupun `userId`. Join yang ditambahkan kelak gagal di CI sebelum
   sempat berjalan sekali pun. Preseden:
   `tests/db/public-select-boundary.test.ts`.

**Alternatif yang ditolak:** pengujian berdatabase sungguhan. Paling
meyakinkan karena menguji perilaku sebenarnya, tetapi menuntut Postgres
uji, migrasi, pembersihan antar pengujian, dan jalur CI — seluruhnya di
luar lingkup Unit 6 dan tanpa preseden di repositori ini.

## Modul dan batasnya

**Pembacaan riwayat tinggal di `lib/db/access-logs.ts`, bukan di
`lib/audit/`.** `code-standards.md` menyatakan hanya `lib/audit/` yang
**menulis** ke `AccessLog`, dan `lib/db/` adalah tempat fungsi query.
Menaruh pembacaan di `lib/audit/` mengubah modul yang sekarang murni
penulis menjadi dua arah — persis alasan U4-13 memisahkan `lib/gate/`.

| Berkas | Tanggung jawab |
| --- | --- |
| `lib/db/access-logs.ts` | Baris berpaginasi beserta totalnya, dan deteksi item terhapus |
| `lib/db/groups.ts` | Ditambah `getGroupTitleById()` |
| `lib/db/items.ts` | Ditambah `listItemTitlesByGroup()` |
| `lib/history/deny-reason.ts` | Terjemahan kesepuluh alasan |
| `lib/history/row.ts` | Baris log → model tampilan; data `User` bukan argumennya |
| `lib/history/pagination.ts` | `HISTORY_PAGE_SIZE`, offset, jumlah halaman, untai hitungan |
| `lib/history/query-params.ts` | Normalisasi `searchParams` dan untai kanoniknya |
| `lib/validation/history.ts` | Skema Zod per parameter |
| `lib/types/history.ts` | Tipe bersama |
| `lib/time/expiry.ts` | Ditambah `startOfDayWIT()` |
| `lib/time/format.ts` | Ditambah `formatDateTimeWIT()` |

`lib/history/` berdiri di luar `lib/db/` dengan alasan yang sama yang
memisahkan `lib/access/` dan `lib/groups/`: ia tidak menyentuh database,
sehingga seluruh aturannya dapat diuji tanpa Prisma.

`lib/time/range.ts` sengaja **tidak** dibuat. `lib/time/expiry.ts` sudah
memuat aritmetika WIT tetap dan `endOfDayWIT()` — persis batas atas
rentang inklusif — jadi berkas baru hanya akan menduplikasi konstanta
offsetnya.

## Aliran data

**Parameter URL** `?item=&dari=&sampai=&ditolak=&hal=`, berbahasa
Indonesia mengikuti segmen rute yang sudah ada (`/masuk`,
`/akses-ditolak`, `/riwayat`) dan bukan mengikuti aturan nama kolom yang
berbahasa Inggris. Pemilik membacanya di bilah alamat.

Kelimanya divalidasi Zod di halaman, karena `searchParams` adalah input
eksternal. **Satu aturan tunggal: nilai yang tidak sah dibuang, lalu
halaman `redirect()` ke URL bersihnya**, sehingga alamat dan isi layar
tidak pernah berbeda. Satu kekecualian: `dari` yang lebih besar daripada
`sampai` **ditukar**, bukan dibuang — maksudnya tidak ambigu, dan
membuang keduanya berarti membuang pekerjaan pemilik. Nomor halaman di
luar jangkauan dijepit ke halaman terdekat yang sah, juga lewat
`redirect()`.

**Kueri baris:**

```
where: { groupId }
  + item=<id>     → { itemId: <id> }        // otomatis membuang PAGE_VIEW
  + item=dihapus  → itemId not null AND notIn <id item yang masih ada>
  + dari/sampai   → createdAt >= startOfDayWIT(dari)
                    AND createdAt <= endOfDayWIT(sampai)
  + ditolak=1     → { outcome: "DENIED" }
orderBy: [{ createdAt: "desc" }, { id: "desc" }]
skip: (hal - 1) * 50,  take: 50
```

**Pengurut kedua `id` wajib.** Paginasi offset mengueri ulang untuk
setiap halaman. Bila dua baris punya `createdAt` yang sama persis — dan
tiga puluh peserta yang mengklik dalam detik yang sama membuat itu wajar
— urutan di antara keduanya tidak ditentukan, sehingga satu baris dapat
muncul di halaman 1 **dan** halaman 2 sementara baris lain tidak muncul
di mana pun. Untuk tabel biasa itu gangguan; untuk catatan
pertanggungjawaban itu cacat.

**Batas rentang tanggal dihitung di WIT lalu diubah ke UTC.** Batas
tengah malam UTC akan membuang sembilan jam pertama setiap hari WIT ke
tanggal yang salah: pemilik menyaring "9 September" lalu kehilangan
setiap akses antara pukul 00.00 dan 09.00 pagi. Kedua ujung inklusif,
sehingga memilih satu tanggal yang sama di kedua ujung menghasilkan
tepat satu hari penuh.

**Urutan kuerinya berurutan karena masing-masing memberi masukan bagi
yang berikutnya,** bukan karena kelalaian: judul group lebih dulu, dan
group yang tidak ada langsung menghasilkan `notFound()` tanpa membayar
kueri apa pun sesudahnya; lalu judul item, yang menghasilkan daftar id
item yang masih hidup — dan daftar itulah yang dibutuhkan penyaring
"Item sudah dihapus"; lalu baris dan `count` yang **berjalan bersamaan**
dalam satu `Promise.all` karena keduanya memakai `where` yang sama; lalu
satu `findFirst` yang menjawab apakah entri "Item sudah dihapus" perlu
muncul di penyaring.

Judul item dipasangkan **di memori** lewat `Map<id, title>`, bukan lewat
`include` — `AccessLog` memang tidak punya relasi ke `Item`.

## Antarmuka

**Satu model tampilan, dua permukaan.** `lib/history/row.ts` menghasilkan
model baris; tabel (`md` ke atas) dan tumpukan kartu (di bawah `md`)
sama-sama membacanya. Tidak ada teks yang ditulis dua kali, jadi tidak
ada teks yang dapat menyimpang di salah satu permukaan.

**Kolom, dan urutan pengorbanannya.** Pada `lg` ke atas ada lima kolom
dan Email berdiri sendiri. Antara `md` dan `lg`, kolom Email hilang dan
isinya turun menjadi baris kedua mono redup di dalam sel Nama — itu
pengorbanan pertama menurut `ui-context.md`, bukan keadaan bawaan. Item
menyusut dengan elipsis dan judul utuhnya tetap di `title`; Hasil tidak
pernah dikorbankan; Waktu berlebar tetap.

| Kolom | Isi |
| --- | --- |
| Waktu | Mono, lebar tetap, `9 Sep 2026, 14.05 WIT`. Baris kedua mono redup: alamat IP, hanya pada baris beridentitas |
| Nama | `text-base font-medium`; "Tanpa identitas" redup pada baris anonim, dengan IP naik ke sini |
| Email | Mono redup; melebur ke sel Nama di bawah `lg` |
| Item | Terpotong elipsis dengan `title`; "Membuka halaman group" atau "Item sudah dihapus" bergaya redup |
| Hasil | Pil berikon, dengan label alasan di baris kedua dan penjelasannya di `title` |

**Kartu di ponsel** disusun menurut pertanyaan yang dijawab, tanpa label
medan sama sekali: nama paling kuat, email mono redup di bawahnya, judul
item, waktu mono redup berlabel zona, dan Hasil sebagai pil di slot
penanda kanan.

**Alamat IP tetap dihilangkan dari kartu ponsel**, termasuk pada baris
tanpa identitas — sehingga kartu anonim hanya berbunyi "Tanpa
identitas". Ini menjaga `ui-context.md` apa adanya. Konsekuensinya
diterima secara sadar: riwayat forensik dibaca di laptop, dan kartu
ponsel ada untuk memindai, bukan menelusuri. Mengizinkan IP muncul di
kartu anonim saja akan menyelamatkan satu kasus dengan biaya satu
kekecualian yang harus diingat selamanya.

**Bilah penyaring** adalah satu-satunya komponen klien, dan ia tidak
menyaring apa pun sendiri — ia menyusun URL baru dan mendorongnya. Isinya
select item, dua input tanggal berlabel WIT, cip "Hanya yang ditolak",
dan tombol "Hapus penyaring" yang muncul hanya saat ada penyaring aktif.
**Setiap perubahan penyaring mengembalikan halaman ke 1**; tanpa itu
pemilik mendarat di halaman 7 dari hasil yang hanya punya 2 halaman.

**Kaki tabel** memuat `1–50 dari 214` dan dua tombol yang membawa serta
seluruh penyaring, mati di kedua ujung.

**Dua keadaan kosong yang berbeda.** Group tanpa satu pun baris berbunyi
"Belum ada riwayat"; penyaring yang tidak menghasilkan apa-apa berbunyi
"Tidak ada baris yang cocok" disertai tombol "Hapus penyaring".
Menyamakan keduanya membuat group yang sehat terbaca seperti penyaring
yang salah, dan sebaliknya. Membedakannya tidak menuntut kueri tambahan.

## Pengujian

Tujuh berkas, seluruhnya tanpa database:

- `tests/time/wit-range.test.ts` — jebakan D2 secara langsung:
  `startOfDayWIT("2026-09-09")` bernilai `2026-09-08T15:00:00Z`;
  peristiwa pukul 02.00 WIT tanggal 9 masuk ke penyaring 9–9 September;
  peristiwa pukul 23.00 WIT tanggal 8 tidak
- `tests/time/format-datetime.test.ts` — zona, jam, dan label
- `tests/history/row.test.ts` — lapis satu U6-9, ditambah baris anonim,
  `PAGE_VIEW`, item terhapus, dan `DENIED` tanpa alasan
- `tests/db/access-logs-query.test.ts` — lapis dua U6-9
- `tests/db/access-log-select-boundary.test.ts` — lapis tiga U6-9
- `tests/history/pagination.test.ts` — offset, penjepitan, untai hitungan
- `tests/history/query-params.test.ts` — parameter dibuang, `dari`
  ditukar, `hal` dijepit
- `tests/history/deny-reason.test.ts` — kesepuluh nilai, label tidak
  kembar, `NOT_FOUND` tidak menjanjikan berkas
- `tests/dashboard/shell-width.test.ts` dan
  `tests/dashboard/history-owner-boundary.test.ts` — gerbang dan lebar

**Komponen tampilan tidak diuji otomatis, dan itu disengaja.**
`vitest.config.mts` berjalan di environment `node` tanpa DOM, dan
repositori ini belum pernah memuat pengujian komponen. Menambahkan jsdom
di tengah Unit 6 adalah perubahan infrastruktur yang tidak diminta
lingkup unit ini. Seluruh **logika** karena itu dipindahkan ke fungsi
murni lebih dulu; yang tersisa di komponen hanyalah penempatan, dan
penempatan hanya dapat dinilai dengan mata.

## Verifikasi ujung ke ujung

Dijalankan pemilik di peramban, masing-masing di mode terang **dan**
gelap, setelah membuat baris riwayat yang beragam — akses anonim ke item
`OPEN`, akses `IDENTITY` sesudah masuk, percobaan ke link yang dicabut,
item yang dinonaktifkan, dan satu item yang dihapus setelah pernah
diklik.

1. Tabel terbaca dan lengkap, termasuk baris `PAGE_VIEW`, baris anonim
   berikut IP di sel Nama, baris item terhapus, dan baris `DENIED`
   beserta penjelasan di `title`
2. Setiap cap waktu berakhir dengan `WIT` dan berbaris lurus ke bawah
3. Penyaring bekerja, alamatnya dapat disalin dan dibuka di tab lain
   dengan hasil identik, dan mengubah penyaring mengembalikan halaman
   ke 1
4. Menyaring satu tanggal yang memuat akses sebelum pukul 09.00 WIT
   tetap memunculkan baris itu
5. Paginasi menyatakan totalnya, tombolnya mati di kedua ujung, dan
   `hal` di luar jangkauan meluruskan alamatnya sendiri
6. Di lebar 375 px tabel berganti menjadi kartu tanpa label medan, tanpa
   alamat IP, tanpa gulir mendatar — dan `/dashboard` tidak ikut melebar

**Sebelum memercayai satu pemeriksaan pun,** pastikan server dev
benar-benar melayani cabang Unit 6 dan bukan checkout utama — perangkap
yang sudah menggigit proyek ini pada 8 September 2026.

## Perubahan file konteks

Dikerjakan **sebelum** kode, sesuai `ai-workflow-rules.md`:

- `ui-context.md` — kedua jenis peristiwa, baris tanpa identitas, item
  terhapus, tata bahasa pil Hasil, kesepuluh label alasan, ukuran
  halaman, konsekuensi IP di kartu ponsel, dua keadaan kosong, lebar
  halaman, dan pintu masuknya
- `architecture.md` — bagian "Pembacaan riwayat": batas modul, larangan
  join ke `User`, pengurut kedua, kontrak `searchParams`, dan aturan
  batas hari WIT
- `code-standards.md` — `lib/history/` di File Organization, dan
  penegasan bahwa pembacaan riwayat tinggal di `lib/db/`
- `progress-tracker.md` — Current Goal, dan U6-1 sampai U6-9 di
  Architecture Decisions

## Rencana implementasi

`docs/superpowers/plans/2026-09-09-unit-6-riwayat-akses.md` — dua belas
task, masing-masing berakhir pada deliverable yang dapat diuji sendiri.
