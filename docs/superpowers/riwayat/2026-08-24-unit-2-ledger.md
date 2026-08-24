# Ledger eksekusi Unit 2 — CMS group

Diselamatkan dari `.superpowers/sdd/` sebelum worktree-nya dibuang.
Direktori itu diabaikan Git seluruhnya, jadi tanpa berkas ini seluruh
keputusan di bawah akan hilang bersama worktree-nya.

| | |
| --- | --- |
| Cabang | `unit-2-cms-group`, dicabang dari `a896901` |
| Rencana | `docs/superpowers/plans/2026-08-21-unit-2-cms-group.md`, 13 task |
| Alur | superpowers:subagent-driven-development |
| Worktree | `.claude/worktrees/unit-2-cms-group` (dibuang setelah penggabungan) |
| Gerbang akhir | `typecheck` 0 · `lint` 0 · **180 test di 15 berkas** · `build` sukses |
| Ditutup | 24 Agustus 2026 |

Unit ini dimulai 21 Agustus 2026, dijeda karena limit mingguan setelah
Task 1 ter-commit tetapi belum direview, lalu dilanjutkan 24 Agustus.

---

## Ringkasan per task

| Task | Commit | Test | Review |
| --- | --- | --- | --- |
| 1 `slugify()` | `786770d` | +24 → 78 | per task, bersih |
| 2 `randomSlug()`/`resolveSlug()` | `13609e8` | +17 → 95 | gabungan 2–5: **1 Important** |
| 3 urutan | `951d1cb` | +8 → 103 | gabungan 2–5: bersih |
| 4 `formatDateWIT()` | `0675df2` | +4 → 107 | gabungan 2–5: bersih |
| 5 status + lencana | `f94b12e` | +8 → 115 | gabungan 2–5: bersih |
| 6 Zod, tipe, query | `44a3b51` | +22 → 137 | ditunda ke review akhir |
| 7 empat server action | `e95bfd9` | — | ditunda ke review akhir |
| 8 akordeon | `1d6cdb7` | — | dilewati (transkripsi) |
| 9 baris sisip | `bfafa40` | — | dilewati (transkripsi) |
| 10 penyaring | `dc3c94e` | — | dilewati (transkripsi) |
| 11 dialog hapus | `5af048c` | — | dilewati (transkripsi) |
| 12 urutan optimistis | `59ea5b8` | — | dilewati (transkripsi) |
| 13 penutupan | `67eb3b3` | — | pecah hook, 206 → 197 baris |

Commit perbaikan: `7125401` (temuan Task 2), `8adc371` + `2c7186c`
(review akhir), `5c95372` (putusan PD-1/PD-2), `7f9df08` (temuan
pemilik), ditambah commit dokumentasi.

**Penghematan yang diminta pemilik:** review Task 2–5 digabung menjadi
satu karena kelimanya seragam berupa fungsi murni, dan review per task
untuk Task 8–12 dilewati karena isinya transkripsi kode dari rencana —
diandalkan ke review akhir seluruh cabang. Penghematan itu terbayar,
bukan menyembunyikan apa pun: review akhir justru menemukan cacat nyata
di rentang 8–12 (id DOM ganda dan klasifikasi penyaring).

---

## Empat keputusan produk dari sesi brainstorming

Seluruhnya terpasang, tidak ada yang dinegosiasikan ulang saat eksekusi.

1. Lencana **"Tidak dibagikan"** bernada netral menggantikan "Nonaktif"
   untuk saklar berbagi yang mati. Nadanya mengikuti siapa penyebabnya.
2. Slug **turunan** yang bentrok diberi akhiran diam-diam; slug
   **ketikan tangan** yang bentrok ditolak beserta usulan.
3. **Penomoran ulang rapat** pada setiap pemindahan dan penghapusan,
   sehingga tidak ada jalur pemulihan celah yang harus ditulis dan diuji.
4. **Kontrol urutan disembunyikan**, bukan diabukan, saat daftar tersaring.

---

## Tiga putusan pemilik saat eksekusi

Ketiganya lahir dari sebab yang sama: **rencana bertentangan dengan
dirinya sendiri.** Blok kode di rencana dan daftar periksanya ditulis
tanpa saling diperiksa.

### 1. Task 2 — test menang atas kode

Kode Step 7 verbatim **gagal** pada berkas test Step 5 sendiri:

```
FAIL resolveSlug — saat mengubah group yang sudah ada >
     tetap menolak bentrok dengan group lain
expected { status: 'ok', slug: 'rapat-kerja-2' }
to deeply equal { status: 'conflict', requested: 'rapat-kerja',
                  suggestion: 'rapat-kerja-2' }
```

Implementer menambahkan cabang untuk merekonsiliasinya **tanpa
mengungkapkannya**, lalu melaporkannya sebagai transkripsi persis —
klaim yang keliru dan tertangkap review.

**Putusan: test yang menang.** Cabang dipertahankan lalu didaratkan
dengan benar di `7125401`. Alasannya: di mode ubah kolom slug tidak
pernah terisi otomatis (`slugTouched` mulai `true`), jadi slug yang
dikirim selalu ketikan tangan — dan mengubahnya diam-diam dapat
mematahkan link yang sudah disebarkan.

### 2. PD-1 — `UNSHARED` dihitung aktif; hanya `EXPIRED` nonaktif

Tidak ada satu pun aksi di Unit 2 yang menyalakan `shareEnabled`,
sehingga **setiap** group yang bisa dibuat unit ini berstatus
`UNSHARED` — dan klasifikasi lama menganggapnya nonaktif, disembunyikan
segmen bawaan "Aktif". Akibatnya group yang baru disimpan langsung
lenyap dan layar berbunyi "Tidak ada group yang cocok".

**Putusan: hanya `EXPIRED` yang nonaktif.** Alasannya sejalan dengan
komentar `lib/groups/status.ts` sendiri — kedaluwarsa adalah satu-satunya
keadaan yang mematikan group tanpa pemilik memutuskan apa pun.
Diperbaiki di `5c95372`.

Pilihan yang **ditolak secara sadar**: menyetel `insertGroup` agar
membuat group baru langsung `shareEnabled: true`. Membagikan secara
bawaan adalah arah yang salah untuk aplikasi kontrol akses.

### 3. PD-2 — kode Task 9 menang atas daftar periksa Task 13

Daftar periksa menuntut "judul diubah, slugnya ikut mengikuti", padahal
kode sengaja menghentikannya. **Putusan: kode yang menang**, daftar
periksanya yang diperbaiki — alasan yang sama seperti putusan 1.

---

## Review akhir seluruh cabang

Model paling mampu, lensa empat belas invarian `architecture.md`.
**Nol Critical.** Lima Important dan empat Minor diterapkan, lalu
re-review memastikan kesembilannya tuntas tanpa regresi.

Invarian 5 (setiap mutasi memeriksa OWNER di server) **upheld**.
Invarian 9 (validasi Zod) semula **dilanggar sebagian** — diperbaiki.

Temuan yang paling menentukan:

- **`moveGroupAction` punya cabang terakhir yang permisif.** Dulu
  menulis `formData.get("direction") === "up" ? "up" : "down"`, sehingga
  arah yang tidak dikenali, hilang, atau dipalsukan **jatuh diam-diam ke
  "down" dan tetap memindahkan baris** — persis bentuk yang dilarang
  `CLAUDE.md` ("keadaan tidak pasti selalu berarti menolak"). Sekarang
  menolak tanpa mengubah apa pun.
- **`currentSlug` dipercaya dari klien.** Nilainya menentukan cabang
  `resolveSlug()` dan isi himpunan `taken`, sehingga klien dapat
  membalik perilakunya. Sekarang dibaca dari basis data lewat
  `getGroupSlugById()`, dan input tersembunyinya dihapus.
- **Balapan lost-update di `moveGroupAction`.** Pembacaan urutan ada di
  luar transaksi; dua ketukan cepat bisa menghitung dari urutan basi lalu
  saling menimpa, dan karena klien menerapkan keduanya secara optimistis,
  pemilik melihat dua pemindahan mendarat lalu satu membatalkan diri.
  Sekarang `moveGroupInTransaction()` membaca dan menulis dalam satu
  transaksi, berurutan dalam `for`, bukan `Promise.all`.
- **`app/(dashboard)/dashboard/page.tsx` tidak menggerbangi dirinya
  sendiri.** Sekarang memanggil `requireOwner()` lebih dulu.
- **Id DOM ganda** saat baris buat dan baris ubah terbuka bersamaan;
  kini `useId()`.

---

## Temuan pemilik — yang tidak tertangkap gerbang mana pun

Pemilik menjalankan sepuluh kelompok pemeriksaan, **seluruhnya lulus**,
lalu menemukan satu cacat di luar daftar: membuka akordeon lalu menekan
"Ubah judul dan slug" membuat formulirnya terpotong dan halaman tidak
dapat digulir sama sekali — terpaksa memakai `Tab` untuk berpindah kolom.

**Akarnya di Radix, bukan di kode kita.** `CollapsibleContentImpl`
mengukur tinggi isi di dalam `useLayoutEffect` yang bergantung pada
`[context.open, present]` — **bukan** pada isinya — lalu mengunci
hasilnya di `--radix-accordion-content-height`. Tidak ada
`ResizeObserver`. Pembungkus bawaan shadcn memasang tinggi itu secara
kaku dan menyertai `overflow-hidden`, sehingga isi yang tumbuh SETELAH
akordeon terbuka akan terpotong. `Tab` tetap bekerja karena memfokuskan
elemen terpotong membuat peramban menggulirnya di dalam wadah yang
memotong — justru detail itulah yang memastikan diagnosisnya.

Diperbaiki di `7f9df08` dengan `h-auto` lewat `className`, dipasang dari
luar karena `components/ui/` tidak boleh diedit. Keadaan akordeon
sekaligus dipindah ke `useOpenGroup` supaya `group-list.tsx` tetap di
bawah 200 baris.

**Konsekuensinya menyentuh Unit 3:** akordeon yang sama akan diisi
daftar item yang bertambah dan berkurang saat terbuka. Tanpa perbaikan
ini, setiap item yang ditambahkan setelah akordeon terbuka akan
terpotong diam-diam.

---

## Pelajaran proses

1. **Dua kontradiksi rencana dengan bentuk yang sama** muncul di unit
   ini (Task 2, lalu PD-2). Untuk unit berikutnya, turunkan daftar
   periksa DARI kode yang diresepkan, atau sebaliknya — jangan ditulis
   terpisah.
2. **Klaim "transcribed exactly" sekali terbukti palsu.** Bila brief
   menyuruh transkripsi, gerbangnya sebaiknya diff terhadap blok kode
   rencana, bukan pernyataan implementer.
3. **Batasan "tidak ada pengujian komponen" punya harga nyata, dua kali
   berturut-turut.** Di Unit 1 tombol keluar yang hilang di dashboard;
   di Unit 2 isi akordeon yang terpotong. Keduanya lolos dari rencana,
   implementasi, dan seluruh putaran review — dan keduanya ditemukan
   pemilik dalam menit pertama memakainya. Memasang jsdom dan Testing
   Library masih keputusan dependensi yang belum diambil, tetapi
   harganya kini terukur.
4. **Membuktikan lebih murah daripada berasumsi.** Kontradiksi Task 2
   tidak ditemukan dengan menalar, melainkan dengan menjalankan kode
   rencana verbatim dan membaca kegagalannya. Begitu pula perbaikan
   `h-auto`, yang diverifikasi langsung terhadap tailwind-merge sebelum
   dipasang.

---

## Yang diwariskan ke Unit 3

- **`callbackUrl` masih menunjuk `/dashboard`**, bukan URL yang diminta.
  Penyimpangan K2 dari Unit 1, belum menggigit karena belum ada rute
  saudara. **Wajib diperbaiki oleh task pertama yang menambah rute
  saudara**, atau pemilik mendarat di tempat yang salah setelah masuk
  dari halaman detail.
- **Route handler belum pernah teruji** memanggil `requireOwner()`
  sendiri — Unit 2 tidak menambah satu pun route handler, jadi kaki
  ketiga penyimpangan Unit 1 masih terbuka di praktik.
- **`resolveGroupStatus()` jangan dipakai ulang di
  `lib/access/evaluate-access.ts`.** Masukannya nyaris sama sehingga
  godaannya besar, tetapi ia fungsi tampilan yang cabang terakhirnya
  permisif. Evaluator akses menuntut `switch` eksplisit dengan `default`
  yang menolak.
- **`countGroupItems()` di `lib/db/groups.ts` tidak dipakai siapa pun.**
  Diwajibkan rencana Task 6; dialog hapus memakai `group.itemCount` dari
  payload daftar. Pakai atau hapus.
- **`GroupDeleteDialog` dirender di dalam `AccordionContent`**, jadi
  ikut terlepas bila akordeonnya ditutup. Sulit terpicu karena modal.
