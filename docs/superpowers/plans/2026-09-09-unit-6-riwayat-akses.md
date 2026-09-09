# Unit 6 — Halaman riwayat akses per group

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Memberi pemilik satu halaman per group yang menjawab siapa membuka item apa pada jam berapa, dapat disaring menurut item, rentang tanggal, dan hasil, serta dipaginasi dengan posisi baris yang stabil dan dapat dirujuk.

**Architecture:** Seluruh logika yang dapat dimurnikan — pemetaan baris log menjadi model tampilan, terjemahan `denyReason`, aritmetika paginasi, normalisasi `searchParams`, dan batas hari WIT — hidup sebagai fungsi murni di `lib/`, karena proyek ini tidak memiliki database uji dan `vitest.config.mts` berjalan di environment `node` tanpa DOM. Keadaan penyaring dan halaman hidup di URL, dibaca dan divalidasi oleh server component yang mengueri Prisma; satu-satunya komponen klien adalah bilah penyaring, dan ia hanya mendorong URL baru. Pembacaan riwayat tinggal di `lib/db/access-logs.ts`, di luar `lib/audit/`, supaya modul itu tetap murni penulis `AccessLog`.

**Tech Stack:** Next.js 15.5 App Router, TypeScript strict, Prisma 6.19 + PostgreSQL, Auth.js v5, Zod 4, Tailwind v4 + shadcn/ui, Vitest.

**Spesifikasi:** `docs/superpowers/specs/2026-09-09-unit-6-riwayat-akses-design.md`. Baca lebih dulu.

**Keputusan yang mendasari rencana ini:** U6-1 sampai U6-9 di bagian "Keputusan Unit 6" pada dokumen ini, identik dengan yang tertulis di spesifikasi. Keputusan itu ditetapkan bersama pemilik pada 9 September 2026 dan **tidak dinegosiasikan ulang saat eksekusi**. Bila sebuah task tampak menuntut pelanggarannya, hentikan dan tanyakan.

## Global Constraints

Berlaku untuk **setiap** task. Kebutuhan tiap task secara implisit memuat seluruh baris di bawah.

- TypeScript strict wajib aktif; hindari `any`
- server component sebagai bawaan; `"use client"` hanya bila interaktivitas peramban benar-benar diperlukan
- seluruh teks pengguna dalam Bahasa Indonesia; identifier dalam Bahasa Inggris
- nama berkas kebab-case, nama komponen PascalCase
- berkas yang tumbuh melewati ±200 baris dipecah sebelum ditambah fitur
- tidak ada nilai heksadesimal di komponen — hanya token CSS custom property
- setiap komponen benar di mode terang DAN gelap; belum dianggap selesai bila hanya diuji di satu mode
- mobile-first: gaya dasar untuk layar sempit, breakpoint ke atas
- `components/ui/*` adalah berkas hasil generate shadcn dan tidak diedit manual
- bentuk respons galat seragam: `{ error: { code, message } }` dengan `message` dalam Bahasa Indonesia
- tidak ada rahasia berawalan `NEXT_PUBLIC_`

**Skema Prisma ditulis COMPLETE di unit ini**, termasuk `AccessRequest` dan nilai `APPROVAL`, meski fiturnya baru dibangun di Unit 7. Alasannya sudah dicatat di `progress-tracker.md` dan tidak dinegosiasikan ulang: migrasi belakangan tidak boleh menyentuh tabel yang sudah berisi data produksi.

### Kosakata domain — bukan pelanggaran aturan Bahasa Indonesia

**`group` dan `link` adalah istilah domain proyek ini dan ditulis apa adanya di teks pengguna.** Keduanya dipakai konsisten di seluruh file konteks: `group` muncul 95 kali di `project-overview.md`, `ui-context.md`, dan `architecture.md`, sementara ejaan KBBI `grup` **nol kali**. `link` dipakai di kalimat definisi produk itu sendiri.

Sebagiannya bahkan diwajibkan kata per kata: `ui-context.md` menetapkan teks keadaan kosong berbunyi persis *"Belum ada group. Buat group pertama untuk mulai menghimpun tautan dan berkas."*

Menggantinya dengan "grup" akan membuat antarmuka bertentangan dengan spesifikasinya sendiri. Aturan "seluruh teks pengguna dalam Bahasa Indonesia" menyasar kalimat berbahasa Inggris, bukan istilah domain yang sudah ditetapkan.

Catatan terpisah: `tautan` dan `link` **tidak** bersinonim di proyek ini. `tautan` berarti item bertipe `LINK` di dalam group; `link` berarti URL berbagi group itu sendiri. Keduanya dapat muncul dalam satu kalimat tanpa saling bertentangan.

### Dua pengecualian, diputuskan pemilik di Pre-Flight Plan Review

Keduanya adalah konflik nyata antara rencana ini dan Global Constraints di atas, dibawa ke pemilik sebelum task pertama dan diputuskan 20 Agustus 2026. Keduanya **bukan** kelalaian, dan tidak perlu diangkat ulang sebagai temuan.

- **`prisma/schema.prisma` dikecualikan dari batas ±200 baris.** Berkasnya akan berukuran sekitar 215 baris. Aturan itu ada karena berkas panjang biasanya mengerjakan lebih dari satu hal; skema Prisma bersifat deklaratif dan mendeklarasikan satu model data, sehingga memecahnya tidak membuat satu pun bagiannya lebih mudah dipahami — sementara memecahnya menuntut fitur preview `prismaSchemaFolder` di fondasi proyek.

- **Kedua puluh komponen shadcn dipasang di unit ini meski hanya sekitar dua yang terpakai.** Ini lingkup yang ditetapkan pemilik dan tertulis di `ROADMAP.md` Fase 1 serta `context/ui-context.md`. Memasangnya sekali jalan menjaga satu versi shadcn dan satu set dependensi; memasangnya sepotong-sepotong di Unit 2–7 berisiko menarik versi berbeda dan mengulang dialog konfigurasi.

**Direktori kerja:** seluruh perintah dijalankan dari `D:\Kumpulink\kumpulink-app`.

**Rahasia:** `.env.local` sudah terisi lengkap dan terbukti diabaikan Git. Jangan pernah mencetak isinya ke terminal, ke log, atau ke pesan commit.

### Kendala tambahan khusus Unit 6

Muncul dari sesi brainstorming 9 September 2026. Berlaku untuk setiap task di unit ini, sama mengikatnya dengan daftar di atas.

- **Riwayat dibaca dari `AccessLog.visitorName` dan `AccessLog.visitorEmail`, TIDAK PERNAH dari join ke tabel `User`.** Data pengguna berubah kemudian; riwayat harus menunjukkan keadaan pada saat kejadian. Ini kendala terpenting unit ini dan dijaga tiga lapis di Task 4 dan Task 7.
- **Halaman ini tidak menyajikan konten apa pun,** sehingga ia bukan jalur baru menuju konten dan **tidak memanggil `evaluateAccess()`**. Gerbangnya `requireOwner()`. Jangan menambahkan jalur apa pun di unit ini yang mengalirkan berkas atau meneruskan ke `targetUrl`.
- **`targetUrl` dan `fileKey` tidak boleh muncul di `select` mana pun yang ditulis unit ini** — invarian 3.
- **Unit ini tidak menulis satu baris pun ke `AccessLog`.** Hanya `lib/audit/` yang menulis, dan `lib/audit/` tidak disentuh unit ini.
- **Seluruh waktu yang terlihat pemilik memakai `Asia/Jayapura` dan menyertakan label `WIT`** — D2, wajib, bukan opsional.
- **Batas rentang tanggal dihitung di WIT lalu diubah ke UTC.** Batas tengah malam UTC akan membuang sembilan jam pertama setiap hari WIT ke tanggal yang salah. Task 2 menguji jebakan ini secara langsung.
- **Paginasi offset wajib memakai pengurut kedua `id`.** Tanpa itu baris ber-`createdAt` identik dapat muncul di dua halaman sekaligus atau menghilang dari keduanya.
- **Ukuran halaman 50, ditulis satu kali sebagai konstanta** `HISTORY_PAGE_SIZE` di `lib/history/pagination.ts`. Tidak ada angka 50 yang ditulis ulang di tempat lain.
- **Tidak ada pengujian berdatabase di unit ini.** `tests/` belum pernah menyentuh Postgres, dan Unit 6 tidak memperkenalkannya. Bukti "nama lama bertahan" ditulis tiga lapis tanpa database — U6-9.

### Keputusan Unit 6

Ditetapkan bersama pemilik, 9 September 2026, sebelum satu baris kode ditulis.

- **U6-1 — Tabel memuat `PAGE_VIEW` maupun `ITEM_ACCESS`.** Sel Item pada baris `PAGE_VIEW` berbunyi "Membuka halaman group" bergaya redup, bukan dibiarkan kosong: sel kosong tidak dapat dibedakan dari data yang gagal dimuat. Penyaring item otomatis membuang baris `PAGE_VIEW` saat dipakai, karena baris itu tidak menunjuk item mana pun. Alternatif yang ditolak: hanya menampilkan `ITEM_ACCESS`, ditolak karena pemilik kehilangan jawaban atas "siapa saja yang membuka halamannya" dan tidak ada permukaan lain di aplikasi yang menjawabnya.

- **U6-2 — Baris tanpa identitas berbunyi "Tanpa identitas", dan alamat IP naik ke sel Nama.** Baris semacam ini bukan kelainan: setiap klik item `OPEN` oleh pengunjung anonim selalu dicatat, dan setiap baris `DENIED / RATE_LIMITED` ditulis sebelum sesi dibaca (U4-11). Pada baris beridentitas, IP tetap sebagai baris kedua di bawah Waktu. Alternatif yang ditolak: sel dikosongkan, ditolak dengan alasan yang sama seperti U6-1.

- **U6-3 — `max-w-4xl` turun dari `app/(dashboard)/layout.tsx` ke masing-masing halaman, dan bilah atas mengikuti lebar halaman yang sedang dibuka.** Halaman Riwayat memakai `max-w-6xl`; dashboard tetap `max-w-4xl`. Mekanismenya penanda CSS `data-wide` yang dibaca varian `group-has-*`, seluruhnya server, tanpa komponen klien dan tanpa terikat `pathname`. Alternatif yang ditolak: bilah dipatok `max-w-6xl` untuk semua halaman, ditolak karena tepi kiri nama aplikasi tidak lurus dengan isi di halaman dashboard.

- **U6-4 — Alamat halaman `/dashboard/groups/[groupId]/riwayat`.** Memakai `id` yang tidak pernah berubah, bukan slug: slug dapat diubah pemilik lewat panel Bagikan, dan `ui-context.md` menuntut posisi baris riwayat "stabil serta dapat dirujuk". Alamat yang mati karena penggantian slug tidak dapat dirujuk.

- **U6-5 — Ukuran halaman 50 baris, paginasi berbasis offset.** Angka 50 sudah dipakai contoh `1–50 dari 214` di `ui-context.md`. Offset, bukan cursor: cursor tidak mengetahui totalnya dan tidak dapat melompat ke halaman 4, sedangkan keduanya dituntut `ui-context.md`.

- **U6-6 — Baris `DENIED` dibedakan oleh pil berikon dan baris alasan, tanpa perlakuan di tingkat baris.** Pil mengikuti tata bahasa `GroupStatusBadge`: `rounded-full`, garis batas setipis rambut, permukaan bernada tipis, tidak pernah terisi penuh, selalu ikon plus teks — sehingga warna bukan satu-satunya pembawa makna. Penyaring cip "Hanya yang ditolak" sudah menjadi jalan resmi memisahkan baris ini; menandai baris lagi berarti membayar dua kali untuk pekerjaan yang sama. Alternatif yang ditolak: latar baris bernada tipis, ditolak karena pembeda yang murni warna.

- **U6-7 — Kesepuluh `denyReason` diterjemahkan menjadi label pendek, dengan penjelasan panjang di atribut `title`.** `NOT_FOUND` dijaga tetap luas — ia dihasilkan enam cabang berbeda, dan U4-12 sudah menetapkan riwayat tidak boleh berbohong kepada pemilik dengan menjanjikan sebab tunggal. `DENIED` tanpa alasan yang dikenali berbunyi "Alasan tidak diketahui", tidak pernah sel kosong. Konsekuensi yang diterima sadar: penjelasan panjang tidak terjangkau di ponsel yang tidak punya kursor.

- **U6-8 — Baris menunjuk item yang sudah dihapus berbunyi "Item sudah dihapus", dan penyaring item memuat entri untuknya.** `AccessLog` sengaja tidak punya foreign key (`architecture.md` bagian "Tanpa relasi foreign key"), sehingga baris riwayat bertahan setelah itemnya dihapus dan judulnya tidak dapat diambil dari mana pun. Entri penyaring hanya muncul bila riwayat group itu memang memuat baris semacam itu. Alternatif yang ditolak: menyalin `itemTitle` ke `AccessLog`, ditolak karena menuntut migrasi skema di dalam Unit 6 sementara baris yang sudah tertulis tetap tidak punya judul.

- **U6-9 — Bukti "nama lama bertahan" ditulis tiga lapis tanpa database.** Lapis satu, fungsi murni pemetaan baris yang data `User`-nya bahkan bukan argumen. Lapis dua, kueri dengan Prisma di-mock. Lapis tiga, pengujian batas yang membaca teks sumber. Alternatif yang ditolak: pengujian berdatabase sungguhan, ditolak karena menuntut infrastruktur — Postgres uji, migrasi, pembersihan antar pengujian, jalur CI — yang belum pernah ada preseden di repositori ini dan seluruhnya di luar lingkup Unit 6.

### Prasyarat sebelum Task 1

**Keenam pemeriksaan peramban Unit 5 wajib sudah dijalankan pemilik dan lulus.** `progress-tracker.md` bagian "Current Goal" menuntutnya, dan `ai-workflow-rules.md` bagian "Before Moving to the Next Unit" butir 1 menuntut unit sebelumnya berjalan ujung ke ujung. Bila belum, hentikan dan tanyakan sebelum Task 1.

**Worktree.** Unit ini dikerjakan di worktree terpisah lewat skill `superpowers:using-git-worktrees`. Perangkap yang sudah pernah menggigit proyek ini pada 8 September 2026 tercatat di `progress-tracker.md`: server dev yang tampak melayani worktree ternyata berakar di checkout utama. Jalankan `npm run dev` dari **dalam** direktori worktree, dan matikan server lain yang sudah memegang porta 3000 lebih dulu.

## File Structure

**Dibuat:**

| Berkas | Tanggung jawab |
|---|---|
| `lib/types/history.ts` | Tipe bersama: baris log mentah, model tampilan baris, opsi penyaring item |
| `lib/history/deny-reason.ts` | `Record<DenyReason, DenyReasonText>` lengkap, plus teks untuk alasan tak dikenali |
| `lib/history/row.ts` | Fungsi murni: baris log mentah → model tampilan. Data `User` bukan argumennya |
| `lib/history/pagination.ts` | Fungsi murni: `HISTORY_PAGE_SIZE`, offset, jumlah halaman, untai `1–50 dari 214` |
| `lib/history/query-params.ts` | Fungsi murni: normalisasi `searchParams` dan penyusunan untai kanoniknya |
| `lib/validation/history.ts` | Skema Zod per parameter |
| `lib/db/access-logs.ts` | Dua kueri Prisma: baris berpaginasi beserta totalnya, dan deteksi item terhapus |
| `components/dashboard/history-outcome-badge.tsx` | Pil Diizinkan/Ditolak beserta baris alasannya |
| `components/dashboard/history-table.tsx` | Tabel lima kolom, `md` ke atas |
| `components/dashboard/history-cards.tsx` | Tumpukan kartu, di bawah `md` |
| `components/dashboard/history-empty-state.tsx` | Dua keadaan kosong yang berbeda |
| `components/dashboard/history-pagination.tsx` | Kaki tabel: untai hitungan dan dua tombol |
| `components/dashboard/history-filter-bar.tsx` | Satu-satunya komponen klien; mendorong URL |
| `app/(dashboard)/dashboard/groups/[groupId]/riwayat/page.tsx` | Server component: gerbang, validasi, kueri, perakitan |

**Diubah:**

| Berkas | Perubahan |
|---|---|
| `lib/time/expiry.ts` | Ditambah `startOfDayWIT()` |
| `lib/time/format.ts` | Ditambah `formatDateTimeWIT()` |
| `lib/db/groups.ts` | Ditambah `getGroupTitleById()` |
| `lib/db/items.ts` | Ditambah `listItemTitlesByGroup()` |
| `app/(dashboard)/layout.tsx` | `max-w-4xl` menjadi lebar yang mengikuti penanda `data-wide` |
| `components/dashboard/group-accordion-body.tsx` | Ditambah tautan "Riwayat" di baris tombol |
| `context/ui-context.md`, `context/architecture.md`, `context/code-standards.md`, `context/progress-tracker.md` | Task 1 |

**Pengujian dibuat:** `tests/time/wit-range.test.ts`, `tests/time/format-datetime.test.ts`, `tests/history/deny-reason.test.ts`, `tests/history/row.test.ts`, `tests/history/pagination.test.ts`, `tests/history/query-params.test.ts`, `tests/db/access-logs-query.test.ts`, `tests/db/access-log-select-boundary.test.ts`, `tests/dashboard/shell-width.test.ts`, `tests/dashboard/history-owner-boundary.test.ts`.

**Catatan penyimpangan dari rancangan brainstorming.** Rancangan menyebut berkas baru `lib/time/range.ts`. Membaca `lib/time/expiry.ts` menunjukkan aritmetika WIT tetap (`WIT_UTC_OFFSET_MINUTES`, `isCalendarDate`, `endOfDayWIT`) sudah ada di sana, dan `endOfDayWIT()` sudah persis batas atas yang dibutuhkan rentang inklusif. Berkas baru hanya akan menduplikasi konstanta offset. Karena itu `startOfDayWIT()` ditambahkan ke `lib/time/expiry.ts`, dan `lib/time/range.ts` tidak dibuat. Rancangan juga menyebut `groupBy` untuk mendeteksi item terhapus; `findFirst` menjawab pertanyaan yang sama dengan satu baris dan lebih murah, jadi itu yang dipakai.

---

### Task 1: File konteks lebih dulu

File konteks adalah spesifikasi proyek ini, dan `ai-workflow-rules.md` menuntut ambiguitas diselesaikan di sana **sebelum** diimplementasikan. Kesembilan keputusan U6 lahir dari ambiguitas nyata di file konteks; menuliskannya belakangan berarti mengimplementasikan sesuatu yang spesifikasinya belum menyebutnya.

**Files:**
- Modify: `context/ui-context.md:456-495`
- Modify: `context/architecture.md` (bagian `AccessLog`, dan bagian baru setelahnya)
- Modify: `context/code-standards.md` (bagian File Organization)
- Modify: `context/progress-tracker.md` (Current Phase, Current Goal, Architecture Decisions)

**Interfaces:**
- Consumes: tidak ada
- Produces: teks yang mengikat seluruh task berikutnya. Task 3 menyalin label alasan dari sini kata per kata; Task 9 menyalin teks antarmuka dari sini kata per kata.

- [ ] **Step 1: Perluas bagian "Tabel riwayat" di `context/ui-context.md`**

Sisipkan blok berikut tepat sesudah paragraf **Penyaring** yang berakhir di `context/ui-context.md:495`, sebelum butir "Halaman Permintaan":

```markdown
  **Kedua jenis peristiwa tampil.** Tabel memuat `PAGE_VIEW`
  maupun `ITEM_ACCESS`. Baris `PAGE_VIEW` tidak menunjuk item
  mana pun, dan sel Item-nya berbunyi "Membuka halaman group"
  bergaya redup miring — bukan dibiarkan kosong. Sel kosong
  tidak dapat dibedakan dari data yang gagal dimuat, dan ini
  tabel yang dibaca untuk mempertanggungjawabkan kejadian.
  Penyaring item membuang baris `PAGE_VIEW` saat dipakai,
  karena baris itu tidak menunjuk item mana pun.
  Ditetapkan 9 September 2026, keputusan U6-1.

  **Baris tanpa identitas.** Sebagian besar baris memang tidak
  punya nama dan email: klik item `OPEN` oleh pengunjung anonim
  selalu dicatat, dan baris `DENIED / RATE_LIMITED` ditulis
  sebelum sesi dibaca. Sel Nama pada baris semacam ini berbunyi
  "Tanpa identitas" bergaya redup, dan **alamat IP naik ke sel
  itu** sebagai satu-satunya penanda yang tersisa. Pada baris
  beridentitas, IP tetap berada di bawah Waktu.
  Ditetapkan 9 September 2026, keputusan U6-2.

  **Item yang sudah dihapus.** `AccessLog` sengaja tidak punya
  foreign key, sehingga baris riwayat bertahan setelah itemnya
  dihapus dan judulnya tidak dapat diambil dari mana pun. Sel
  Item-nya berbunyi "Item sudah dihapus" bergaya redup, dan
  penyaring item memuat satu entri untuknya — tetapi hanya bila
  riwayat group itu memang memuat baris semacam itu.
  Ditetapkan 9 September 2026, keputusan U6-8.

  **Kolom Hasil.** Pil bertata bahasa yang sama dengan lencana
  status group: `rounded-full`, garis batas setipis rambut,
  permukaan bernada tipis, tidak pernah terisi penuh, selalu
  ikon plus teks. "Diizinkan" berikon `Check` bernada
  `state-success`; "Ditolak" berikon `X` bernada `state-error`.
  Ikon dan teks itulah yang membuat warna bukan satu-satunya
  pembawa makna. **Tidak ada perlakuan di tingkat baris** —
  tanpa tepi berwarna, tanpa latar bernada. Penyaring cip
  "Hanya yang ditolak" sudah menjadi jalan resmi memisahkan
  baris ini. Ditetapkan 9 September 2026, keputusan U6-6.

  **Kesepuluh alasan penolakan** tampil sebagai label pendek di
  baris kedua sel Hasil, dengan penjelasan panjangnya di
  atribut `title`:

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

  Empat pasangan sengaja dijaga tidak bertabrakan: "Link
  dicabut" bukan "Izin dicabut", dan "Group kedaluwarsa" bukan
  "Izin kedaluwarsa". `NOT_FOUND` dijaga tetap luas karena ia
  dihasilkan enam cabang berbeda; menyempitkannya akan membuat
  riwayat berbohong kepada pemilik, preseden U4-12. Baris
  `DENIED` yang alasannya kosong atau tidak dikenali berbunyi
  "Alasan tidak diketahui" — tidak pernah sel kosong.
  Ditetapkan 9 September 2026, keputusan U6-7.

  **Ukuran halaman 50 baris**, dan paginasinya berbasis offset.
  Cursor tidak mengetahui total dan tidak dapat melompat ke
  halaman 4, sedangkan keduanya dituntut paragraf paginasi di
  atas. Ditetapkan 9 September 2026, keputusan U6-5.

  **Alamat IP tetap dihilangkan dari kartu ponsel**, termasuk
  pada baris tanpa identitas — sehingga kartu anonim di ponsel
  hanya berbunyi "Tanpa identitas". Konsekuensi ini diterima
  secara sadar: riwayat forensik dibaca di laptop, dan kartu
  ponsel ada untuk memindai, bukan menelusuri. Mengizinkan IP
  muncul di kartu anonim saja akan menyelamatkan satu kasus
  dengan biaya satu kekecualian yang harus diingat selamanya.
  Ditetapkan 9 September 2026.

  **Dua keadaan kosong yang berbeda.** Group yang belum punya
  satu pun baris berbunyi "Belum ada riwayat", disertai kalimat
  bahwa baris muncul setelah pengunjung membuka group atau
  itemnya. Penyaring yang tidak menghasilkan apa-apa berbunyi
  "Tidak ada baris yang cocok" disertai tombol "Hapus
  penyaring". Menyamakan keduanya membuat group yang sehat
  terbaca seperti penyaring yang salah, dan sebaliknya.

  **Lebar halaman Riwayat `max-w-6xl`**, sedangkan dashboard
  tetap `max-w-4xl`. Bilah atas mengikuti lebar halaman yang
  sedang dibuka, supaya tepi kirinya lurus dengan isi di
  bawahnya. Ditetapkan 9 September 2026, keputusan U6-3.

  **Pintu masuknya** tombol tautan "Riwayat" di baris tombol
  dalam akordeon group, bersebelahan dengan "Bagikan" — satu-
  satunya tempat di aplikasi yang mengumpulkan tindakan per
  group. Alamatnya `/dashboard/groups/[groupId]/riwayat`,
  memakai `id` yang tidak pernah berubah dan bukan slug yang
  dapat diganti pemilik. Ditetapkan 9 September 2026,
  keputusan U6-4.
```

- [ ] **Step 2: Tambahkan bagian pembacaan riwayat ke `context/architecture.md`**

Sisipkan tepat sesudah paragraf "Tanpa relasi foreign key" yang menutup bagian `AccessLog`:

```markdown
### Pembacaan riwayat

**Pembacaan tinggal di `lib/db/access-logs.ts`, bukan di
`lib/audit/`.** Modul `lib/audit/` adalah penulis `AccessLog`
dan tetap murni penulis; menambahkan pembacaan di sana
mengubahnya menjadi dua arah, persis yang dihindari U4-13 saat
memisahkan `lib/gate/`.

**Nama dan email dibaca dari kolom `visitorName` dan
`visitorEmail` pada barisnya, tidak pernah dari join ke tabel
`User`.** Ini bukan pilihan gaya: data pengguna dapat berubah
atau dihapus kemudian, dan riwayat harus tetap menunjukkan
keadaan pada saat kejadian. Aturan ini dijaga tiga lapis —
fungsi pemetaan murni yang data `User`-nya bukan argumen, kueri
yang diuji dengan Prisma di-mock, dan pengujian batas yang
membaca teks sumber sehingga join yang ditambahkan kelak gagal
di CI.

**Judul item dipasangkan di memori** lewat `Map<id, title>`,
bukan lewat `include` — `AccessLog` memang tidak punya relasi
ke `Item`, dengan alasan yang sudah dijelaskan di atas.

**Urutan baca `[{ createdAt: "desc" }, { id: "desc" }]`.**
Pengurut kedua wajib. Paginasi offset mengueri ulang untuk
setiap halaman, dan bila dua baris punya `createdAt` yang sama
persis — tiga puluh peserta yang mengklik dalam detik yang sama
membuat itu wajar — urutan di antara keduanya tidak ditentukan.
Akibatnya satu baris dapat muncul di dua halaman sekaligus
sementara baris lain tidak muncul di mana pun. Untuk tabel
biasa itu gangguan; untuk catatan pertanggungjawaban itu cacat.

**Kontrak `searchParams` halaman Riwayat:** `item`, `dari`,
`sampai`, `ditolak`, `hal` — berbahasa Indonesia mengikuti
segmen rute, bukan mengikuti aturan nama kolom. Kelimanya
divalidasi Zod di halaman, karena `searchParams` adalah input
eksternal. **Satu aturan tunggal untuk nilai yang tidak sah:
parameter itu dibuang dan halaman `redirect()` ke URL
bersihnya,** sehingga alamat dan isi layar tidak pernah
berbeda. Satu kekecualian, `dari` yang lebih besar daripada
`sampai` ditukar alih-alih dibuang, karena maksudnya tidak
ambigu. Nomor halaman di luar jangkauan dijepit ke halaman
terdekat yang sah, juga lewat `redirect()`.

**Batas rentang tanggal dihitung di `Asia/Jayapura` lalu
diubah ke UTC,** memakai `startOfDayWIT()` dan `endOfDayWIT()`
di `lib/time/expiry.ts`. Batas tengah malam UTC akan membuang
sembilan jam pertama setiap hari WIT ke tanggal yang salah:
pemilik menyaring "9 September" lalu kehilangan setiap akses
antara pukul 00.00 dan 09.00 pagi. Kedua ujung rentang
inklusif.

**Halaman Riwayat tidak menyajikan konten,** sehingga ia bukan
jalur menuju konten dan tidak memanggil `evaluateAccess()`.
Gerbangnya `requireOwner()`. `select` kuerinya tidak memuat
`targetUrl` maupun `fileKey` — invarian 3.
```

- [ ] **Step 3: Tambahkan `lib/history/` ke File Organization di `context/code-standards.md`**

Sisipkan tepat sesudah baris `lib/groups/`:

```markdown
- `lib/history/` — tampilan riwayat akses sebagai fungsi murni:
  terjemahan `denyReason`, pemetaan baris log menjadi model
  tampilan, aritmetika paginasi, dan normalisasi `searchParams`.
  Tidak menyentuh database, sehingga seluruh aturannya dapat
  diuji tanpa Prisma — alasan yang sama yang memisahkan
  `lib/access/` dan `lib/groups/`
```

Lalu sisipkan di bagian **Audit Logging**, sesudah baris "Nama dan email disalin ke baris log pada saat kejadian":

```markdown
- **Pembacaan** riwayat tinggal di `lib/db/access-logs.ts`, di
  luar `lib/audit/`, supaya modul itu tetap murni penulis.
  Pembacaan itu tidak pernah menjoin ke tabel `User`.
```

- [ ] **Step 4: Perbarui `context/progress-tracker.md`**

Ganti seluruh isi bagian **Current Goal** dengan:

```markdown
## Current Goal

- **Unit 6 — halaman riwayat akses, sedang berjalan.** Keenam
  pemeriksaan peramban Unit 5 sudah dijalankan pemilik dan lulus,
  sehingga gerbang "unit berjalan ujung ke ujung" tertutup dan Unit 6
  dapat dimulai. Rencananya di
  `docs/superpowers/plans/2026-09-09-unit-6-riwayat-akses.md`, dua
  belas task, dengan kesembilan keputusan U6-1 sampai U6-9 tercatat
  di Architecture Decisions.
- Tidak ada keputusan yang menggantung.
```

Di bagian **Architecture Decisions**, tambahkan sub-bagian `### Keputusan Unit 6 — 9 September 2026` berisi U6-1 sampai U6-9, disalin kata per kata dari bagian "Keputusan Unit 6" pada rencana ini.

Bila ternyata keenam pemeriksaan Unit 5 **belum** dijalankan, hentikan di sini dan tanyakan kepada pemilik — jangan menulis kalimat yang menyatakan sesuatu yang belum terjadi.

- [ ] **Step 5: Jalankan gerbang dokumentasi**

Run: `npm run lint`
Expected: exit 0, nol peringatan. (Perubahan Markdown tidak menyentuh lint, tetapi ini memastikan checkout worktree memang sehat sebelum task pertama yang menulis kode.)

- [ ] **Step 6: Commit**

```bash
git add context/
git commit -m "docs(context): keputusan U6-1..U6-9 dan kontrak halaman riwayat

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: Batas hari WIT dan cap waktu berjam

`lib/time/expiry.ts` sudah memuat aritmetika WIT tetap dan `endOfDayWIT()`, yang persis batas atas rentang inklusif. Yang kurang hanya batas bawahnya dan pemformat berjam — `formatDateWIT()` yang ada tidak menyertakan jam sama sekali.

**Files:**
- Modify: `lib/time/expiry.ts`
- Modify: `lib/time/format.ts`
- Test: `tests/time/wit-range.test.ts`
- Test: `tests/time/format-datetime.test.ts`

**Interfaces:**
- Consumes: `WIT_UTC_OFFSET_MINUTES`, `isCalendarDate` dari `lib/time/expiry.ts` (sudah ada)
- Produces:
  - `startOfDayWIT(isoDate: string): Date` — "2026-09-09" → instan 00:00:00.000 WIT
  - `endOfDayWIT(isoDate: string): Date` — sudah ada, dipakai apa adanya
  - `formatDateTimeWIT(value: Date): string` — instan → `"9 Sep 2026, 14.05 WIT"`

- [ ] **Step 1: Tulis pengujian batas hari yang gagal**

Buat `tests/time/wit-range.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { endOfDayWIT, startOfDayWIT } from "@/lib/time/expiry";

describe("startOfDayWIT", () => {
  // 00:00 di UTC+9 adalah 15:00 UTC pada HARI SEBELUMNYA. Angka inilah
  // yang membedakan penyaring yang benar dari penyaring yang membuang
  // sembilan jam pertama setiap hari.
  it("mengubah tanggal menjadi detik pertama hari itu di Jayapura", () => {
    expect(startOfDayWIT("2026-09-09").toISOString()).toBe("2026-09-08T15:00:00.000Z");
  });

  it("menolak tanggal yang tidak ada di kalender", () => {
    expect(() => startOfDayWIT("2026-02-31")).toThrow();
    expect(() => startOfDayWIT("09-09-2026")).toThrow();
  });
});

describe("rentang inklusif satu hari", () => {
  const from = startOfDayWIT("2026-09-09");
  const to = endOfDayWIT("2026-09-09");

  const inRange = (iso: string) => {
    const at = new Date(iso);
    return at.getTime() >= from.getTime() && at.getTime() <= to.getTime();
  };

  // Inti jebakan D2: batas tengah malam UTC akan membuang baris ini.
  it("memuat peristiwa pukul 02.00 WIT pada tanggal itu", () => {
    // 02:00 WIT tanggal 9 = 17:00 UTC tanggal 8.
    expect(inRange("2026-09-08T17:00:00Z")).toBe(true);
  });

  it("memuat peristiwa pukul 23.30 WIT pada tanggal itu", () => {
    // 23:30 WIT tanggal 9 = 14:30 UTC tanggal 9.
    expect(inRange("2026-09-09T14:30:00Z")).toBe(true);
  });

  it("tidak memuat peristiwa pukul 23.00 WIT pada tanggal sebelumnya", () => {
    // 23:00 WIT tanggal 8 = 14:00 UTC tanggal 8.
    expect(inRange("2026-09-08T14:00:00Z")).toBe(false);
  });

  it("tidak memuat peristiwa pukul 00.30 WIT pada tanggal berikutnya", () => {
    // 00:30 WIT tanggal 10 = 15:30 UTC tanggal 9.
    expect(inRange("2026-09-09T15:30:00Z")).toBe(false);
  });

  it("memilih satu tanggal yang sama di kedua ujung menghasilkan satu hari penuh", () => {
    expect(to.getTime() - from.getTime()).toBe(24 * 60 * 60 * 1000 - 1);
  });
});
```

- [ ] **Step 2: Jalankan pengujian untuk memastikan ia gagal**

Run: `npx vitest run tests/time/wit-range.test.ts`
Expected: FAIL dengan `"startOfDayWIT" is not exported by "lib/time/expiry.ts"`

- [ ] **Step 3: Tambahkan `startOfDayWIT` ke `lib/time/expiry.ts`**

Sisipkan tepat sebelum `endOfDayWIT`:

```ts
/** "2026-09-09" -> instan 00:00:00.000 WIT pada tanggal itu. */
export function startOfDayWIT(isoDate: string): Date {
  const match = ISO_DATE_PATTERN.exec(isoDate);
  if (match === null || !isCalendarDate(isoDate)) {
    throw new Error(`Tanggal tidak dikenali: ${isoDate}`);
  }

  const asUtc = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return new Date(asUtc - WIT_OFFSET_MS);
}
```

- [ ] **Step 4: Jalankan pengujian untuk memastikan ia lulus**

Run: `npx vitest run tests/time/wit-range.test.ts`
Expected: PASS, 7 pengujian

- [ ] **Step 5: Tulis pengujian cap waktu berjam yang gagal**

Buat `tests/time/format-datetime.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { TIME_ZONE_LABEL, formatDateTimeWIT } from "@/lib/time/format";

// Assertion sengaja TIDAK menuntut untai persis. Pemisah jam yang dipakai
// Intl untuk locale id-ID berbeda antar versi ICU, dan pengujian yang
// mematoknya akan merah di mesin lain tanpa satu pun cacat nyata.
describe("formatDateTimeWIT", () => {
  it("memakai Asia/Jayapura, bukan zona waktu mesin", () => {
    // 16:00 UTC tanggal 8 = 01:00 WIT tanggal 9.
    const at = new Date("2026-09-08T16:00:00Z");
    expect(formatDateTimeWIT(at)).toContain("9 Sep");
    expect(formatDateTimeWIT(at)).not.toContain("8 Sep");
  });

  it("menyertakan jam dan menit, tidak hanya tanggal", () => {
    // 05:05 UTC = 14:05 WIT.
    const formatted = formatDateTimeWIT(new Date("2026-09-09T05:05:00Z"));
    expect(formatted).toMatch(/14.05/);
  });

  it("selalu berakhir dengan label zona waktu", () => {
    const formatted = formatDateTimeWIT(new Date("2026-09-09T05:05:00Z"));
    expect(formatted.endsWith(TIME_ZONE_LABEL)).toBe(true);
  });

  it("menyertakan tahun", () => {
    expect(formatDateTimeWIT(new Date("2026-09-09T05:05:00Z"))).toContain("2026");
  });
});
```

- [ ] **Step 6: Jalankan pengujian untuk memastikan ia gagal**

Run: `npx vitest run tests/time/format-datetime.test.ts`
Expected: FAIL dengan `"formatDateTimeWIT" is not exported by "lib/time/format.ts"`

- [ ] **Step 7: Tambahkan `formatDateTimeWIT` ke `lib/time/format.ts`**

Sisipkan di akhir berkas:

```ts
const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  timeZone: DISPLAY_TIME_ZONE,
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/**
 * Cap waktu berjam untuk tabel riwayat. Aturan zonanya sama dengan
 * formatDateWIT: Asia/Jayapura yang dipatok, label WIT yang wajib.
 *
 * Ia dirender monospasi di antarmuka — bukan selera, melainkan karena
 * kolom ini dibandingkan baris demi baris, dan angka berlebar tetap
 * membuat jamnya berbaris lurus ke bawah.
 */
export function formatDateTimeWIT(value: Date): string {
  return `${dateTimeFormatter.format(value)} ${TIME_ZONE_LABEL}`;
}
```

- [ ] **Step 8: Jalankan kedua berkas pengujian**

Run: `npx vitest run tests/time/`
Expected: PASS, seluruh berkas di `tests/time/` hijau

- [ ] **Step 9: Commit**

```bash
git add lib/time/ tests/time/
git commit -m "feat(time): batas hari WIT dan cap waktu berjam untuk riwayat

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: Terjemahan kesepuluh `denyReason`

**Files:**
- Create: `lib/history/deny-reason.ts`
- Test: `tests/history/deny-reason.test.ts`

**Interfaces:**
- Consumes: tipe `DenyReason` dari `@prisma/client`
- Produces:
  - `type DenyReasonText = { label: string; description: string }`
  - `DENY_REASON_TEXT: Record<DenyReason, DenyReasonText>`
  - `UNKNOWN_DENY_REASON: DenyReasonText`
  - `denyReasonText(reason: DenyReason | null): DenyReasonText`

- [ ] **Step 1: Tulis pengujian yang gagal**

Buat `tests/history/deny-reason.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { DENY_REASON_TEXT, UNKNOWN_DENY_REASON, denyReasonText } from "@/lib/history/deny-reason";

const SEMUA_ALASAN = [
  "NOT_FOUND",
  "REVOKED",
  "EXPIRED",
  "PRIVATE",
  "ITEM_INACTIVE",
  "FILE_MISSING",
  "RATE_LIMITED",
  "REQUEST_REJECTED",
  "REQUEST_REVOKED",
  "APPROVAL_EXPIRED",
] as const;

describe("terjemahan denyReason", () => {
  it("memberi label dan penjelasan untuk kesepuluh nilai", () => {
    for (const reason of SEMUA_ALASAN) {
      expect(DENY_REASON_TEXT[reason].label.length).toBeGreaterThan(0);
      expect(DENY_REASON_TEXT[reason].description.length).toBeGreaterThan(0);
    }
    expect(Object.keys(DENY_REASON_TEXT)).toHaveLength(SEMUA_ALASAN.length);
  });

  it("tidak memakai satu label untuk dua alasan berbeda", () => {
    // "Link dicabut" bukan "Izin dicabut", dan "Group kedaluwarsa" bukan
    // "Izin kedaluwarsa". Label kembar membuat pemilik salah menyimpulkan
    // sebab dari baris riwayat, dan itu justru satu-satunya gunanya.
    const labels = SEMUA_ALASAN.map((reason) => DENY_REASON_TEXT[reason].label);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it("menjaga NOT_FOUND tetap luas dan tidak menjanjikan berkas", () => {
    // U4-12: item EXTERNAL tanpa targetUrl menghasilkan NOT_FOUND justru
    // supaya riwayat tidak berbohong dengan menyebut kegagalan berkas.
    const { label, description } = DENY_REASON_TEXT.NOT_FOUND;
    expect(`${label} ${description}`.toLowerCase()).not.toContain("berkas");
  });

  it("menyatakan alasan yang tidak dikenali, bukan mengosongkannya", () => {
    expect(denyReasonText(null)).toEqual(UNKNOWN_DENY_REASON);
    expect(UNKNOWN_DENY_REASON.label).toBe("Alasan tidak diketahui");
  });

  it("menyatakan nilai runtime di luar enum sebagai tidak diketahui", () => {
    // Data bisa lebih tua atau lebih baru daripada kode. Nilai asing tidak
    // boleh menghasilkan sel kosong yang terbaca seperti baris normal.
    const asing = "SOMETHING_ELSE" as unknown as Parameters<typeof denyReasonText>[0];
    expect(denyReasonText(asing)).toEqual(UNKNOWN_DENY_REASON);
  });

  it("mengembalikan teks yang benar untuk alasan yang dikenali", () => {
    expect(denyReasonText("RATE_LIMITED").label).toBe("Terlalu banyak percobaan");
  });
});
```

- [ ] **Step 2: Jalankan pengujian untuk memastikan ia gagal**

Run: `npx vitest run tests/history/deny-reason.test.ts`
Expected: FAIL dengan `Failed to resolve import "@/lib/history/deny-reason"`

- [ ] **Step 3: Tulis `lib/history/deny-reason.ts`**

```ts
import type { DenyReason } from "@prisma/client";

export type DenyReasonText = { label: string; description: string };

/**
 * Label pendek tampil sebagai baris kedua di sel Hasil; penjelasannya
 * tampil di atribut title. Keputusan U6-7.
 *
 * Petanya `Record<DenyReason, ...>` dan BUKAN objek biasa: penambahan
 * anggota enum baru harus menggagalkan kompilasi, bukan menghasilkan
 * sel kosong diam-diam. Disiplin yang sama dengan penjaga `never` di
 * evaluate-access.ts.
 */
export const DENY_REASON_TEXT: Record<DenyReason, DenyReasonText> = {
  // Dihasilkan ENAM cabang berbeda: group tidak ada, item tidak ada, item
  // milik group lain, nilai enum tak dikenali, item APPROVAL selama Unit 7
  // belum ada, dan item EXTERNAL tanpa targetUrl. Labelnya sengaja luas —
  // menyempitkannya membuat riwayat berbohong. Preseden U4-12.
  NOT_FOUND: {
    label: "Tidak ditemukan",
    description:
      "Group atau item yang diminta tidak ada, sudah dihapus, atau tidak menunjuk tujuan mana pun.",
  },
  REVOKED: {
    label: "Link dicabut",
    description: "Saklar berbagi group ini sedang mati saat percobaan terjadi.",
  },
  EXPIRED: {
    label: "Group kedaluwarsa",
    description: "Tanggal kedaluwarsa group sudah lewat saat percobaan terjadi.",
  },
  PRIVATE: {
    label: "Group privat",
    description: "Group disetel privat, sehingga hanya pemilik yang dapat membukanya.",
  },
  ITEM_INACTIVE: {
    label: "Item nonaktif",
    description: "Item ini sedang dinonaktifkan di dashboard saat percobaan terjadi.",
  },
  FILE_MISSING: {
    label: "Berkas hilang",
    description:
      "Berkas item ini tidak ditemukan di penyimpanan, dan itemnya sudah ditandai rusak.",
  },
  RATE_LIMITED: {
    label: "Terlalu banyak percobaan",
    description:
      "Alamat IP ini melewati dua puluh percobaan gagal dalam sepuluh menit, sehingga dihentikan sebelum izinnya dievaluasi. Baris seperti ini tidak punya nama dan email karena sesinya memang belum dibaca.",
  },
  REQUEST_REJECTED: {
    label: "Permintaan ditolak",
    description: "Permintaan izin pemohon ini pernah ditolak dan tidak dapat diajukan ulang.",
  },
  REQUEST_REVOKED: {
    label: "Izin dicabut",
    description: "Izin yang pernah diberikan kepada pemohon ini sudah dicabut.",
  },
  APPROVAL_EXPIRED: {
    label: "Izin kedaluwarsa",
    description: "Izin pemohon ini sudah melewati masa berlakunya.",
  },
};

export const UNKNOWN_DENY_REASON: DenyReasonText = {
  label: "Alasan tidak diketahui",
  description:
    "Baris ini ditolak tanpa alasan yang dikenali. Keadaan yang tidak pasti dinyatakan apa adanya, bukan disamarkan menjadi sel kosong.",
};

/**
 * `?? UNKNOWN_DENY_REASON` bukan pengaman berlebihan: baris AccessLog
 * dapat lebih tua atau lebih baru daripada kode yang membacanya, dan
 * indeks Record yang meleset menghasilkan undefined saat runtime meski
 * tipenya berkata sebaliknya.
 */
export function denyReasonText(reason: DenyReason | null): DenyReasonText {
  if (reason === null) return UNKNOWN_DENY_REASON;
  return DENY_REASON_TEXT[reason] ?? UNKNOWN_DENY_REASON;
}
```

- [ ] **Step 4: Jalankan pengujian untuk memastikan ia lulus**

Run: `npx vitest run tests/history/deny-reason.test.ts`
Expected: PASS, 6 pengujian

- [ ] **Step 5: Commit**

```bash
git add lib/history/deny-reason.ts tests/history/deny-reason.test.ts
git commit -m "feat(history): terjemahan kesepuluh denyReason ke Bahasa Indonesia

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: Pemetaan baris — lapis satu dari bukti "nama lama bertahan"

Ini task terpenting unit ini. Fungsi yang ditulis di sini adalah satu-satunya tempat teks baris riwayat lahir, dan **data `User` tidak menjadi argumennya sama sekali** — itulah bentuk bukti bahwa nama pengguna yang berubah tidak dapat menulis ulang masa lalu.

**Files:**
- Create: `lib/types/history.ts`
- Create: `lib/history/row.ts`
- Test: `tests/history/row.test.ts`

**Interfaces:**
- Consumes: `formatDateTimeWIT` (Task 2), `denyReasonText` (Task 3)
- Produces:
  - `type HistoryLogRow` — bentuk baris mentah yang dikembalikan Task 7
  - `type HistoryRowView` — model tampilan yang dibaca Task 9
  - `toHistoryRow(row: HistoryLogRow, itemTitles: Map<string, string>): HistoryRowView`
  - Konstanta teks `ANONYMOUS_NAME`, `PAGE_VIEW_ITEM`, `DELETED_ITEM`

- [ ] **Step 1: Tulis pengujian yang gagal**

Buat `tests/history/row.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { ANONYMOUS_NAME, DELETED_ITEM, PAGE_VIEW_ITEM, toHistoryRow } from "@/lib/history/row";
import type { HistoryLogRow } from "@/lib/types/history";

const JUDUL = new Map<string, string>([["item-1", "Rundown acara"]]);

function baris(patch: Partial<HistoryLogRow> = {}): HistoryLogRow {
  return {
    id: "log-1",
    eventType: "ITEM_ACCESS",
    itemId: "item-1",
    visitorName: "Ani Pratama",
    visitorEmail: "ani@contoh.id",
    outcome: "GRANTED",
    denyReason: null,
    ipAddress: "203.0.113.9",
    createdAt: new Date("2026-09-09T05:05:00Z"),
    ...patch,
  };
}

describe("riwayat dibaca dari baris log, bukan dari tabel User", () => {
  // INI pengujian yang menjaga alasan aplikasi ini ada. Nama pengguna
  // dapat berubah kapan saja; baris riwayat harus tetap menunjukkan
  // keadaan pada SAAT KEJADIAN.
  it("menampilkan nama yang tersalin di baris, bukan nama pengguna hari ini", () => {
    const lama = toHistoryRow(baris({ visitorName: "Nama Lama" }), JUDUL);
    expect(lama.name).toBe("Nama Lama");
  });

  it("tidak berubah ketika data pengguna berubah, karena data itu bukan argumennya", () => {
    // Perubahan nama pengguna diwakili di sini sebagai fakta bahwa fungsi
    // ini HANYA menerima baris log dan peta judul item. Tidak ada saluran
    // yang dapat membawa "Nama Baru" masuk. Memanggilnya dua kali dengan
    // baris yang sama menghasilkan hasil yang sama, apa pun isi tabel User.
    const row = baris({ visitorName: "Nama Lama", visitorEmail: "lama@contoh.id" });
    expect(toHistoryRow(row, JUDUL)).toEqual(toHistoryRow(row, JUDUL));
    expect(toHistoryRow(row, JUDUL).email).toBe("lama@contoh.id");
    expect(toHistoryRow(row, JUDUL).name).not.toContain("Baru");
  });

  it("menerima tepat dua argumen, dan tidak satu pun bertipe data pengguna", () => {
    // Penjaga mekanis: menambahkan argumen ketiga berisi User akan
    // membuat pengujian ini merah sebelum sempat dipakai di halaman.
    expect(toHistoryRow.length).toBe(2);
  });
});

describe("kolom Waktu dan alamat IP", () => {
  it("memformat waktu dalam WIT beserta labelnya", () => {
    expect(toHistoryRow(baris(), JUDUL).time).toContain("WIT");
    expect(toHistoryRow(baris(), JUDUL).time).toContain("9 Sep");
  });

  it("menaruh IP di bawah Waktu pada baris beridentitas", () => {
    const view = toHistoryRow(baris(), JUDUL);
    expect(view.timeIp).toBe("203.0.113.9");
    expect(view.nameIp).toBeNull();
  });

  it("menaikkan IP ke sel Nama pada baris tanpa identitas", () => {
    // Keputusan U6-2: di baris anonim, IP adalah satu-satunya penanda
    // yang tersisa, jadi ia berdiri di kolom identitas.
    const view = toHistoryRow(baris({ visitorName: null, visitorEmail: null }), JUDUL);
    expect(view.nameIp).toBe("203.0.113.9");
    expect(view.timeIp).toBeNull();
  });
});

describe("kolom Nama", () => {
  it("menyebut baris tanpa nama dan email sebagai Tanpa identitas", () => {
    const view = toHistoryRow(baris({ visitorName: null, visitorEmail: null }), JUDUL);
    expect(view.name).toBe(ANONYMOUS_NAME);
    expect(view.isAnonymous).toBe(true);
    expect(view.email).toBeNull();
  });

  it("memakai email sebagai nama bila hanya email yang tersalin", () => {
    const view = toHistoryRow(baris({ visitorName: null }), JUDUL);
    expect(view.name).toBe("ani@contoh.id");
    expect(view.isAnonymous).toBe(false);
    // Tidak diulang sebagai baris kedua; satu alamat dua kali hanya
    // menghabiskan ruang kolom yang sudah sempit.
    expect(view.email).toBeNull();
  });
});

describe("kolom Item", () => {
  it("memakai judul item yang masih ada", () => {
    const view = toHistoryRow(baris(), JUDUL);
    expect(view.item).toBe("Rundown acara");
    expect(view.itemIsAbsent).toBe(false);
  });

  it("menandai baris PAGE_VIEW sebagai kunjungan halaman", () => {
    const view = toHistoryRow(baris({ eventType: "PAGE_VIEW", itemId: null }), JUDUL);
    expect(view.item).toBe(PAGE_VIEW_ITEM);
    expect(view.itemIsAbsent).toBe(true);
  });

  it("menandai item yang tidak ada lagi di group sebagai sudah dihapus", () => {
    const view = toHistoryRow(baris({ itemId: "item-hilang" }), JUDUL);
    expect(view.item).toBe(DELETED_ITEM);
    expect(view.itemIsAbsent).toBe(true);
  });
});

describe("kolom Hasil", () => {
  it("menyebut baris GRANTED sebagai Diizinkan tanpa alasan", () => {
    const view = toHistoryRow(baris(), JUDUL);
    expect(view.granted).toBe(true);
    expect(view.outcomeLabel).toBe("Diizinkan");
    expect(view.denyLabel).toBeNull();
    expect(view.denyDescription).toBeNull();
  });

  it("menyebut baris DENIED sebagai Ditolak beserta label alasannya", () => {
    const view = toHistoryRow(baris({ outcome: "DENIED", denyReason: "EXPIRED" }), JUDUL);
    expect(view.granted).toBe(false);
    expect(view.outcomeLabel).toBe("Ditolak");
    expect(view.denyLabel).toBe("Group kedaluwarsa");
    expect(view.denyDescription).not.toBeNull();
  });

  it("menyatakan DENIED tanpa alasan sebagai tidak diketahui", () => {
    const view = toHistoryRow(baris({ outcome: "DENIED", denyReason: null }), JUDUL);
    expect(view.denyLabel).toBe("Alasan tidak diketahui");
  });
});
```

- [ ] **Step 2: Jalankan pengujian untuk memastikan ia gagal**

Run: `npx vitest run tests/history/row.test.ts`
Expected: FAIL dengan `Failed to resolve import "@/lib/history/row"`

- [ ] **Step 3: Tulis `lib/types/history.ts`**

```ts
import type { DenyReason, EventType, Outcome } from "@prisma/client";

/**
 * Baris AccessLog apa adanya, sebagaimana dikembalikan lib/db/access-logs.ts.
 *
 * Perhatikan apa yang TIDAK ada di sini: tidak ada `user`, tidak ada
 * relasi, tidak ada nama yang dibaca dari tabel lain. visitorName dan
 * visitorEmail adalah salinan yang dibuat saat kejadian, dan itulah
 * satu-satunya sumber identitas di seluruh permukaan riwayat.
 */
export type HistoryLogRow = {
  id: string;
  eventType: EventType;
  itemId: string | null;
  visitorName: string | null;
  visitorEmail: string | null;
  outcome: Outcome;
  denyReason: DenyReason | null;
  ipAddress: string | null;
  createdAt: Date;
};

/**
 * Model tampilan satu baris. Seluruh teksnya SUDAH JADI — komponen tidak
 * memformat apa pun sendiri, sehingga tabel dan kartu ponsel tidak dapat
 * menyimpang satu sama lain.
 */
export type HistoryRowView = {
  id: string;
  /** "9 Sep 2026, 14.05 WIT" */
  time: string;
  /** Alamat IP di bawah Waktu. Null pada baris tanpa identitas. */
  timeIp: string | null;
  name: string;
  isAnonymous: boolean;
  email: string | null;
  /** Alamat IP di dalam sel Nama. Hanya terisi pada baris tanpa identitas. */
  nameIp: string | null;
  item: string;
  /** Benar untuk PAGE_VIEW dan item yang sudah dihapus; keduanya dirender redup. */
  itemIsAbsent: boolean;
  granted: boolean;
  outcomeLabel: string;
  denyLabel: string | null;
  denyDescription: string | null;
};

/** Satu pilihan di penyaring item. */
export type HistoryItemOption = { value: string; label: string };
```

- [ ] **Step 4: Tulis `lib/history/row.ts`**

```ts
import { denyReasonText } from "@/lib/history/deny-reason";
import { formatDateTimeWIT } from "@/lib/time/format";
import type { HistoryLogRow, HistoryRowView } from "@/lib/types/history";

export const ANONYMOUS_NAME = "Tanpa identitas";
export const PAGE_VIEW_ITEM = "Membuka halaman group";
export const DELETED_ITEM = "Item sudah dihapus";

function resolveItem(
  row: HistoryLogRow,
  itemTitles: Map<string, string>,
): { item: string; itemIsAbsent: boolean } {
  // PAGE_VIEW tidak menunjuk item mana pun menurut rancangan, bukan karena
  // datanya rusak. Keputusan U6-1: dinyatakan, bukan dikosongkan.
  if (row.eventType === "PAGE_VIEW" || row.itemId === null) {
    return { item: PAGE_VIEW_ITEM, itemIsAbsent: true };
  }

  // AccessLog sengaja tanpa foreign key, sehingga baris ini bertahan
  // setelah itemnya dihapus dan judulnya tidak ada lagi di mana pun.
  // Keputusan U6-8.
  const title = itemTitles.get(row.itemId);
  if (title === undefined) return { item: DELETED_ITEM, itemIsAbsent: true };

  return { item: title, itemIsAbsent: false };
}

/**
 * Satu-satunya tempat teks baris riwayat lahir.
 *
 * DATA `User` BUKAN ARGUMEN FUNGSI INI, dan itu disengaja. Nama dan email
 * datang dari kolom visitorName dan visitorEmail pada barisnya sendiri —
 * salinan yang dibuat saat kejadian. Pengguna yang berganti nama besok
 * tidak punya satu pun saluran untuk menulis ulang baris hari ini.
 *
 * Menambahkan argumen ketiga berisi data pengguna adalah pelanggaran
 * garis merah unit ini, bukan penyempurnaan.
 */
export function toHistoryRow(
  row: HistoryLogRow,
  itemTitles: Map<string, string>,
): HistoryRowView {
  const anonymous = row.visitorName === null && row.visitorEmail === null;
  const granted = row.outcome === "GRANTED";
  const deny = granted ? null : denyReasonText(row.denyReason);

  return {
    id: row.id,
    time: formatDateTimeWIT(row.createdAt),
    timeIp: anonymous ? null : row.ipAddress,
    name: anonymous ? ANONYMOUS_NAME : (row.visitorName ?? row.visitorEmail ?? ANONYMOUS_NAME),
    isAnonymous: anonymous,
    // Email hanya menjadi baris kedua bila namanya memang ada. Bila hanya
    // email yang tersalin, ia sudah berdiri sebagai nama di atas.
    email: row.visitorName === null ? null : row.visitorEmail,
    nameIp: anonymous ? row.ipAddress : null,
    ...resolveItem(row, itemTitles),
    granted,
    outcomeLabel: granted ? "Diizinkan" : "Ditolak",
    denyLabel: deny?.label ?? null,
    denyDescription: deny?.description ?? null,
  };
}
```

- [ ] **Step 5: Jalankan pengujian untuk memastikan ia lulus**

Run: `npx vitest run tests/history/row.test.ts`
Expected: PASS, 13 pengujian

- [ ] **Step 6: Commit**

```bash
git add lib/types/history.ts lib/history/row.ts tests/history/row.test.ts
git commit -m "feat(history): pemetaan baris riwayat dari kolom salinan, bukan dari User

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: Aritmetika paginasi

**Files:**
- Create: `lib/history/pagination.ts`
- Test: `tests/history/pagination.test.ts`

**Interfaces:**
- Consumes: tidak ada
- Produces:
  - `HISTORY_PAGE_SIZE: 50`
  - `type HistoryPagination = { page: number; pageCount: number; skip: number; take: number; summary: string }`
  - `pageCountFor(total: number): number`
  - `clampPage(page: number, total: number): number`
  - `buildPagination(page: number, total: number): HistoryPagination`

- [ ] **Step 1: Tulis pengujian yang gagal**

Buat `tests/history/pagination.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  HISTORY_PAGE_SIZE,
  buildPagination,
  clampPage,
  pageCountFor,
} from "@/lib/history/pagination";

describe("ukuran halaman", () => {
  it("lima puluh baris, ditulis satu kali sebagai konstanta", () => {
    expect(HISTORY_PAGE_SIZE).toBe(50);
  });
});

describe("pageCountFor", () => {
  it("membulatkan ke atas untuk halaman terakhir yang tidak penuh", () => {
    expect(pageCountFor(214)).toBe(5);
    expect(pageCountFor(50)).toBe(1);
    expect(pageCountFor(51)).toBe(2);
  });

  it("tetap satu halaman ketika tidak ada baris sama sekali", () => {
    // Nol halaman akan membuat penjepitan menghasilkan halaman 0, dan
    // tidak ada halaman 0 yang dapat dirujuk.
    expect(pageCountFor(0)).toBe(1);
  });
});

describe("clampPage", () => {
  it("menjepit halaman di atas jangkauan ke halaman terakhir", () => {
    expect(clampPage(9, 214)).toBe(5);
  });

  it("menjepit halaman di bawah satu ke halaman pertama", () => {
    expect(clampPage(0, 214)).toBe(1);
    expect(clampPage(-3, 214)).toBe(1);
  });

  it("membiarkan halaman yang sah apa adanya", () => {
    expect(clampPage(3, 214)).toBe(3);
  });
});

describe("buildPagination", () => {
  it("menyusun untai hitungan seperti yang ditetapkan ui-context", () => {
    expect(buildPagination(1, 214).summary).toBe("1–50 dari 214");
  });

  it("menghitung batas halaman terakhir yang tidak penuh", () => {
    const last = buildPagination(5, 214);
    expect(last.skip).toBe(200);
    expect(last.summary).toBe("201–214 dari 214");
  });

  it("menghitung offset halaman tengah", () => {
    const middle = buildPagination(3, 214);
    expect(middle.skip).toBe(100);
    expect(middle.take).toBe(50);
    expect(middle.summary).toBe("101–150 dari 214");
  });

  it("menjepit halaman di luar jangkauan lalu memakai hasil jepitnya", () => {
    const clamped = buildPagination(9, 214);
    expect(clamped.page).toBe(5);
    expect(clamped.skip).toBe(200);
  });

  it("menyatakan keadaan kosong tanpa rentang palsu", () => {
    const empty = buildPagination(1, 0);
    expect(empty.page).toBe(1);
    expect(empty.pageCount).toBe(1);
    expect(empty.skip).toBe(0);
    expect(empty.summary).toBe("Tidak ada baris");
  });
});
```

- [ ] **Step 2: Jalankan pengujian untuk memastikan ia gagal**

Run: `npx vitest run tests/history/pagination.test.ts`
Expected: FAIL dengan `Failed to resolve import "@/lib/history/pagination"`

- [ ] **Step 3: Tulis `lib/history/pagination.ts`**

```ts
/**
 * Ukuran halaman riwayat. Keputusan U6-5, dan angka yang sudah dipakai
 * contoh "1–50 dari 214" di ui-context.md.
 *
 * Ditulis SATU KALI di sini. Angka 50 yang muncul kedua kalinya di
 * berkas lain adalah cacat, bukan pengulangan yang tidak berbahaya.
 */
export const HISTORY_PAGE_SIZE = 50;

export type HistoryPagination = {
  page: number;
  pageCount: number;
  skip: number;
  take: number;
  /** "1–50 dari 214", atau "Tidak ada baris" saat kosong. */
  summary: string;
};

/**
 * Nol baris tetap menghasilkan SATU halaman, bukan nol. Nol halaman
 * membuat penjepitan menghasilkan halaman 0, dan halaman 0 tidak dapat
 * dirujuk maupun ditampilkan.
 */
export function pageCountFor(total: number): number {
  return total === 0 ? 1 : Math.ceil(total / HISTORY_PAGE_SIZE);
}

export function clampPage(page: number, total: number): number {
  if (page < 1) return 1;
  const count = pageCountFor(total);
  return page > count ? count : page;
}

export function buildPagination(page: number, total: number): HistoryPagination {
  const clamped = clampPage(page, total);
  const skip = (clamped - 1) * HISTORY_PAGE_SIZE;
  const last = Math.min(skip + HISTORY_PAGE_SIZE, total);

  return {
    page: clamped,
    pageCount: pageCountFor(total),
    skip,
    take: HISTORY_PAGE_SIZE,
    // Tanda pisahnya en dash, mengikuti contoh di ui-context.md.
    summary: total === 0 ? "Tidak ada baris" : `${skip + 1}–${last} dari ${total}`,
  };
}
```

- [ ] **Step 4: Jalankan pengujian untuk memastikan ia lulus**

Run: `npx vitest run tests/history/pagination.test.ts`
Expected: PASS, 10 pengujian

- [ ] **Step 5: Commit**

```bash
git add lib/history/pagination.ts tests/history/pagination.test.ts
git commit -m "feat(history): aritmetika paginasi offset lima puluh baris

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 6: Validasi dan normalisasi `searchParams`

`searchParams` adalah input eksternal, dan `code-standards.md` menuntutnya divalidasi Zod di batas sistem. Aturannya tunggal: nilai yang tidak sah **dibuang**, lalu halaman `redirect()` ke untai kanoniknya, sehingga alamat dan isi layar tidak pernah berbeda.

**Files:**
- Create: `lib/validation/history.ts`
- Create: `lib/history/query-params.ts`
- Test: `tests/history/query-params.test.ts`

**Interfaces:**
- Consumes: `isCalendarDate` dari `lib/time/expiry.ts`
- Produces:
  - `DELETED_ITEM_VALUE = "dihapus"`
  - `type HistoryParams = { item: string | null; dari: string | null; sampai: string | null; deniedOnly: boolean; page: number }`
  - `normalizeHistoryParams(raw: RawSearchParams): HistoryParams`
  - `historyQueryString(params: HistoryParams): string`
  - `givenQueryString(raw: RawSearchParams): string`
  - `historyHref(groupId: string, params: HistoryParams): string`

- [ ] **Step 1: Tulis pengujian yang gagal**

Buat `tests/history/query-params.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  DELETED_ITEM_VALUE,
  givenQueryString,
  historyHref,
  historyQueryString,
  normalizeHistoryParams,
} from "@/lib/history/query-params";

describe("normalizeHistoryParams", () => {
  it("membaca kelima parameter yang sah", () => {
    const params = normalizeHistoryParams({
      item: "cm1abc",
      dari: "2026-09-01",
      sampai: "2026-09-09",
      ditolak: "1",
      hal: "3",
    });
    expect(params).toEqual({
      item: "cm1abc",
      dari: "2026-09-01",
      sampai: "2026-09-09",
      deniedOnly: true,
      page: 3,
    });
  });

  it("mengembalikan keadaan bawaan ketika tidak ada parameter", () => {
    expect(normalizeHistoryParams({})).toEqual({
      item: null,
      dari: null,
      sampai: null,
      deniedOnly: false,
      page: 1,
    });
  });

  it("menerima nilai khusus untuk item yang sudah dihapus", () => {
    expect(normalizeHistoryParams({ item: DELETED_ITEM_VALUE }).item).toBe(DELETED_ITEM_VALUE);
  });

  it("membuang tanggal yang tidak ada di kalender", () => {
    // "2026-02-31" lolos regex tetapi tidak ada; Date akan menggesernya
    // diam-diam menjadi 3 Maret, dan pergeseran senyap adalah keadaan
    // tidak pasti yang meloloskan diri.
    expect(normalizeHistoryParams({ dari: "2026-02-31" }).dari).toBeNull();
    expect(normalizeHistoryParams({ sampai: "09-09-2026" }).sampai).toBeNull();
  });

  it("membuang nomor halaman yang bukan bilangan bulat positif", () => {
    expect(normalizeHistoryParams({ hal: "0" }).page).toBe(1);
    expect(normalizeHistoryParams({ hal: "-2" }).page).toBe(1);
    expect(normalizeHistoryParams({ hal: "dua" }).page).toBe(1);
    expect(normalizeHistoryParams({ hal: "1.5" }).page).toBe(1);
  });

  it("membuang nilai ditolak selain 1", () => {
    expect(normalizeHistoryParams({ ditolak: "ya" }).deniedOnly).toBe(false);
    expect(normalizeHistoryParams({ ditolak: "0" }).deniedOnly).toBe(false);
  });

  it("membuang item yang bukan pengenal yang mungkin", () => {
    expect(normalizeHistoryParams({ item: "bukan id!" }).item).toBeNull();
    expect(normalizeHistoryParams({ item: "" }).item).toBeNull();
  });

  it("menukar dari dan sampai yang terbalik, bukan membuangnya", () => {
    // Maksud pemilik tidak ambigu di sini, dan membuang keduanya berarti
    // membuang pekerjaannya. Ini satu-satunya kekecualian aturan buang.
    const params = normalizeHistoryParams({ dari: "2026-09-09", sampai: "2026-09-01" });
    expect(params.dari).toBe("2026-09-01");
    expect(params.sampai).toBe("2026-09-09");
  });

  it("memakai nilai pertama ketika parameter dikirim berulang", () => {
    expect(normalizeHistoryParams({ hal: ["2", "9"] }).page).toBe(2);
  });
});

describe("historyQueryString", () => {
  it("menghilangkan halaman pertama dari untai kanoniknya", () => {
    const params = normalizeHistoryParams({ hal: "1" });
    expect(historyQueryString(params)).toBe("");
  });

  it("menulis parameter dalam urutan tetap", () => {
    const params = normalizeHistoryParams({
      hal: "2",
      ditolak: "1",
      sampai: "2026-09-09",
      dari: "2026-09-01",
      item: "cm1abc",
    });
    expect(historyQueryString(params)).toBe(
      "item=cm1abc&dari=2026-09-01&sampai=2026-09-09&ditolak=1&hal=2",
    );
  });
});

describe("givenQueryString", () => {
  it("menyusun ulang apa yang benar-benar dikirim, dalam urutan yang sama", () => {
    expect(givenQueryString({ hal: "2", item: "cm1abc" })).toBe("item=cm1abc&hal=2");
  });

  it("berbeda dari untai kanonik ketika ada nilai yang tidak sah", () => {
    // Perbedaan inilah yang memicu redirect di halaman.
    const raw = { dari: "2026-02-31" };
    expect(givenQueryString(raw)).not.toBe(historyQueryString(normalizeHistoryParams(raw)));
  });

  it("sama dengan untai kanonik ketika seluruh nilainya sah", () => {
    const raw = { item: "cm1abc", hal: "2" };
    expect(givenQueryString(raw)).toBe(historyQueryString(normalizeHistoryParams(raw)));
  });
});

describe("historyHref", () => {
  it("menyusun alamat halaman riwayat beserta penyaringnya", () => {
    const params = normalizeHistoryParams({ item: "cm1abc", hal: "2" });
    expect(historyHref("grp-1", params)).toBe(
      "/dashboard/groups/grp-1/riwayat?item=cm1abc&hal=2",
    );
  });

  it("tidak menyisakan tanda tanya ketika tidak ada penyaring", () => {
    expect(historyHref("grp-1", normalizeHistoryParams({}))).toBe(
      "/dashboard/groups/grp-1/riwayat",
    );
  });
});
```

- [ ] **Step 2: Jalankan pengujian untuk memastikan ia gagal**

Run: `npx vitest run tests/history/query-params.test.ts`
Expected: FAIL dengan `Failed to resolve import "@/lib/history/query-params"`

- [ ] **Step 3: Tulis `lib/validation/history.ts`**

```ts
import { z } from "zod";

import { isCalendarDate } from "@/lib/time/expiry";

/** Nilai penyaring item untuk baris yang itemnya sudah dihapus. U6-8. */
export const DELETED_ITEM_VALUE = "dihapus";

/**
 * Pengenal item dipakai sebagai pembanding kesamaan lewat Prisma, jadi
 * tidak ada risiko injeksi. Pola ini menyaring bentuk yang jelas bukan
 * pengenal supaya kueri tidak dijalankan untuk untai sampah.
 */
const itemIdSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[A-Za-z0-9_-]+$/);

export const historyItemSchema = z.union([z.literal(DELETED_ITEM_VALUE), itemIdSchema]);

/**
 * Pola saja tidak cukup: "2026-02-31" lolos regex, dan Date akan
 * menggesernya diam-diam menjadi 3 Maret. isCalendarDate menolak tanggal
 * yang tidak benar-benar ada.
 */
export const historyDateSchema = z.string().refine(isCalendarDate);

export const historyDeniedSchema = z.literal("1");

export const historyPageSchema = z
  .string()
  .regex(/^\d+$/)
  .transform(Number)
  .refine((value) => Number.isSafeInteger(value) && value >= 1);
```

- [ ] **Step 4: Tulis `lib/history/query-params.ts`**

```ts
import {
  DELETED_ITEM_VALUE,
  historyDateSchema,
  historyDeniedSchema,
  historyItemSchema,
  historyPageSchema,
} from "@/lib/validation/history";

export { DELETED_ITEM_VALUE };

export type RawSearchParams = Record<string, string | string[] | undefined>;

export type HistoryParams = {
  item: string | null;
  dari: string | null;
  sampai: string | null;
  deniedOnly: boolean;
  page: number;
};

/** Urutan tetap, dipakai untai kanonik maupun untai yang dikirim. */
const ORDERED_KEYS = ["item", "dari", "sampai", "ditolak", "hal"] as const;

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

/**
 * Satu aturan: nilai yang tidak sah DIBUANG, tidak pernah ditebak dan
 * tidak pernah menggagalkan halaman. Pemanggilnya membandingkan hasil
 * untai kanoniknya dengan untai yang dikirim, lalu redirect bila berbeda
 * — sehingga alamat dan isi layar tidak pernah bercerita berbeda.
 *
 * Satu kekecualian: dari yang lebih besar daripada sampai DITUKAR, bukan
 * dibuang. Maksudnya tidak ambigu, dan membuang keduanya berarti membuang
 * pekerjaan pemilik.
 */
export function normalizeHistoryParams(raw: RawSearchParams): HistoryParams {
  // safeParse dipanggil langsung per medan, bukan lewat pembungkus
  // generik. Pembungkus generik menuntut menuliskan tipe skema Zod
  // sendiri, dan tipe itu berbeda antara skema biasa dan skema
  // ber-transform seperti historyPageSchema — jalan tercepat menuju
  // `any`, yang dilarang Global Constraints.
  const itemResult = historyItemSchema.safeParse(first(raw.item));
  const dariResult = historyDateSchema.safeParse(first(raw.dari));
  const sampaiResult = historyDateSchema.safeParse(first(raw.sampai));
  const deniedResult = historyDeniedSchema.safeParse(first(raw.ditolak));
  const pageResult = historyPageSchema.safeParse(first(raw.hal));

  const item = itemResult.success ? itemResult.data : null;
  let dari = dariResult.success ? dariResult.data : null;
  let sampai = sampaiResult.success ? sampaiResult.data : null;
  const deniedOnly = deniedResult.success;
  const page = pageResult.success ? pageResult.data : 1;

  if (dari !== null && sampai !== null && dari > sampai) {
    [dari, sampai] = [sampai, dari];
  }

  return { item, dari, sampai, deniedOnly, page };
}

/** Untai kueri kanonik. Halaman pertama tidak ditulis. */
export function historyQueryString(params: HistoryParams): string {
  const search = new URLSearchParams();
  if (params.item !== null) search.set("item", params.item);
  if (params.dari !== null) search.set("dari", params.dari);
  if (params.sampai !== null) search.set("sampai", params.sampai);
  if (params.deniedOnly) search.set("ditolak", "1");
  if (params.page > 1) search.set("hal", String(params.page));
  return search.toString();
}

/**
 * Untai kueri yang BENAR-BENAR dikirim, disusun ulang dalam urutan yang
 * sama supaya dapat dibandingkan dengan untai kanonik. Kunci di luar
 * kelima yang dikenali sengaja diabaikan; ia tidak berbahaya dan tidak
 * layak memicu pengalihan.
 */
export function givenQueryString(raw: RawSearchParams): string {
  const search = new URLSearchParams();
  for (const key of ORDERED_KEYS) {
    const value = first(raw[key]);
    if (value !== undefined && value !== "") search.set(key, value);
  }
  return search.toString();
}

export function historyHref(groupId: string, params: HistoryParams): string {
  const query = historyQueryString(params);
  const path = `/dashboard/groups/${groupId}/riwayat`;
  return query === "" ? path : `${path}?${query}`;
}
```

- [ ] **Step 5: Jalankan pengujian untuk memastikan ia lulus**

Run: `npx vitest run tests/history/query-params.test.ts`
Expected: PASS, 15 pengujian

- [ ] **Step 6: Commit**

```bash
git add lib/validation/history.ts lib/history/query-params.ts tests/history/query-params.test.ts
git commit -m "feat(history): validasi searchParams dengan aturan buang-lalu-kanonik

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 7: Kueri riwayat — lapis dua dan tiga dari bukti

**Files:**
- Create: `lib/db/access-logs.ts`
- Test: `tests/db/access-logs-query.test.ts`
- Test: `tests/db/access-log-select-boundary.test.ts`

**Interfaces:**
- Consumes: `HistoryLogRow` (Task 4), `startOfDayWIT` dan `endOfDayWIT` (Task 2)
- Produces:
  - `type HistoryFilter = { groupId: string; item: string | null; dari: string | null; sampai: string | null; deniedOnly: boolean }`
  - `historyWhere(filter: HistoryFilter, liveItemIds: string[]): Prisma.AccessLogWhereInput`
  - `listAccessLogs(filter, liveItemIds, skip, take): Promise<{ rows: HistoryLogRow[]; total: number }>`
  - `hasDeletedItemLogs(groupId: string, liveItemIds: string[]): Promise<boolean>`
  - `getGroupTitleById(id: string): Promise<string | null>` di `lib/db/groups.ts`
  - `listItemTitlesByGroup(groupId: string): Promise<{ id: string; title: string }[]>` di `lib/db/items.ts`

- [ ] **Step 1: Tulis pengujian kueri yang gagal**

Buat `tests/db/access-logs-query.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const findMany = vi.fn();
const count = vi.fn();
const findFirst = vi.fn();

vi.mock("@/lib/db/client", () => ({
  prisma: { accessLog: { findMany, count, findFirst } },
}));

const { hasDeletedItemLogs, historyWhere, listAccessLogs } = await import("@/lib/db/access-logs");

const DASAR = {
  groupId: "grp-1",
  item: null,
  dari: null,
  sampai: null,
  deniedOnly: false,
};

beforeEach(() => {
  findMany.mockReset().mockResolvedValue([]);
  count.mockReset().mockResolvedValue(0);
  findFirst.mockReset().mockResolvedValue(null);
});

describe("bentuk kueri riwayat", () => {
  it("tidak pernah menjoin ke tabel User", async () => {
    // Garis merah unit ini. Nama dan email HARUS datang dari kolom
    // salinan di barisnya sendiri, bukan dari keadaan pengguna hari ini.
    await listAccessLogs(DASAR, [], 0, 50);

    const args = findMany.mock.calls[0][0];
    expect(args).not.toHaveProperty("include");
    expect(Object.keys(args.select)).not.toContain("user");
    expect(Object.keys(args.select)).not.toContain("userId");
  });

  it("membaca visitorName dan visitorEmail dari barisnya", async () => {
    await listAccessLogs(DASAR, [], 0, 50);

    const { select } = findMany.mock.calls[0][0];
    expect(select.visitorName).toBe(true);
    expect(select.visitorEmail).toBe(true);
  });

  it("mengurutkan menurun dengan pengurut kedua id", async () => {
    // Tanpa pengurut kedua, baris ber-createdAt identik dapat muncul di
    // dua halaman sekaligus atau menghilang dari keduanya.
    await listAccessLogs(DASAR, [], 0, 50);

    expect(findMany.mock.calls[0][0].orderBy).toEqual([
      { createdAt: "desc" },
      { id: "desc" },
    ]);
  });

  it("meneruskan offset dan batas apa adanya", async () => {
    await listAccessLogs(DASAR, [], 100, 50);

    expect(findMany.mock.calls[0][0].skip).toBe(100);
    expect(findMany.mock.calls[0][0].take).toBe(50);
  });

  it("menghitung total dengan where yang sama persis", async () => {
    await listAccessLogs({ ...DASAR, deniedOnly: true }, [], 0, 50);

    expect(count.mock.calls[0][0].where).toEqual(findMany.mock.calls[0][0].where);
  });
});

describe("historyWhere", () => {
  it("selalu mengurung pada satu group", () => {
    expect(historyWhere(DASAR, []).groupId).toBe("grp-1");
  });

  it("menyaring satu item menurut pengenalnya", () => {
    expect(historyWhere({ ...DASAR, item: "item-1" }, ["item-1"]).itemId).toBe("item-1");
  });

  it("menyaring baris yang itemnya sudah tidak ada di group", () => {
    const where = historyWhere({ ...DASAR, item: "dihapus" }, ["item-1"]);
    expect(where.itemId).toEqual({ not: null, notIn: ["item-1"] });
  });

  it("mengubah rentang tanggal menjadi batas WIT, bukan batas UTC", () => {
    // 00:00 WIT tanggal 9 = 15:00 UTC tanggal 8. Batas tengah malam UTC
    // akan membuang sembilan jam pertama setiap hari.
    const where = historyWhere({ ...DASAR, dari: "2026-09-09", sampai: "2026-09-09" }, []);
    const range = where.createdAt as { gte: Date; lte: Date };
    expect(range.gte.toISOString()).toBe("2026-09-08T15:00:00.000Z");
    expect(range.lte.toISOString()).toBe("2026-09-09T14:59:59.999Z");
  });

  it("menerima rentang yang hanya berujung satu", () => {
    const hanyaDari = historyWhere({ ...DASAR, dari: "2026-09-09" }, []);
    expect(hanyaDari.createdAt).toEqual({ gte: new Date("2026-09-08T15:00:00.000Z") });

    const hanyaSampai = historyWhere({ ...DASAR, sampai: "2026-09-09" }, []);
    expect(hanyaSampai.createdAt).toEqual({ lte: new Date("2026-09-09T14:59:59.999Z") });
  });

  it("menyaring hanya baris yang ditolak", () => {
    expect(historyWhere({ ...DASAR, deniedOnly: true }, []).outcome).toBe("DENIED");
  });

  it("tidak menyebut outcome sama sekali ketika cip tidak dipakai", () => {
    expect(historyWhere(DASAR, [])).not.toHaveProperty("outcome");
  });
});

describe("hasDeletedItemLogs", () => {
  it("bertanya cukup satu baris, bukan menghitung seluruhnya", async () => {
    await hasDeletedItemLogs("grp-1", ["item-1"]);

    expect(findFirst).toHaveBeenCalledWith({
      where: { groupId: "grp-1", itemId: { not: null, notIn: ["item-1"] } },
      select: { id: true },
    });
  });

  it("benar ketika ada baris menunjuk item yang tidak ada lagi", async () => {
    findFirst.mockResolvedValue({ id: "log-9" });
    expect(await hasDeletedItemLogs("grp-1", ["item-1"])).toBe(true);
  });

  it("salah ketika seluruh baris menunjuk item yang masih ada", async () => {
    expect(await hasDeletedItemLogs("grp-1", ["item-1"])).toBe(false);
  });
});
```

- [ ] **Step 2: Jalankan pengujian untuk memastikan ia gagal**

Run: `npx vitest run tests/db/access-logs-query.test.ts`
Expected: FAIL dengan `Failed to resolve import "@/lib/db/access-logs"`

- [ ] **Step 3: Tulis `lib/db/access-logs.ts`**

```ts
import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/client";
import { endOfDayWIT, startOfDayWIT } from "@/lib/time/expiry";
import type { HistoryLogRow } from "@/lib/types/history";
import { DELETED_ITEM_VALUE } from "@/lib/validation/history";

/**
 * Kolom yang dibaca riwayat.
 *
 * visitorName dan visitorEmail datang DARI BARIS INI. Tidak ada `include`
 * di berkas ini, tidak ada relasi yang diikuti, dan tidak ada kueri ke
 * tabel User di mana pun — data pengguna berubah kemudian, sedangkan
 * riwayat harus menunjukkan keadaan pada saat kejadian. Menambahkan join
 * "supaya namanya selalu terbaru" adalah pelanggaran garis merah, bukan
 * penyempurnaan, dan tests/db/access-log-select-boundary.test.ts akan
 * menangkapnya.
 *
 * userId dan userAgent sengaja TIDAK dibaca: keduanya tidak dipakai satu
 * pun kolom di layar.
 */
const HISTORY_SELECT = {
  id: true,
  eventType: true,
  itemId: true,
  visitorName: true,
  visitorEmail: true,
  outcome: true,
  denyReason: true,
  ipAddress: true,
  createdAt: true,
} as const;

export type HistoryFilter = {
  groupId: string;
  /** Pengenal item, "dihapus", atau null untuk seluruh baris. */
  item: string | null;
  dari: string | null;
  sampai: string | null;
  deniedOnly: boolean;
};

function itemCondition(
  item: string | null,
  liveItemIds: string[],
): Prisma.AccessLogWhereInput["itemId"] | undefined {
  if (item === null) return undefined;
  // Baris PAGE_VIEW ber-itemId null otomatis terbuang oleh kedua cabang
  // di bawah — persis yang diminta U6-1 saat penyaring item dipakai.
  if (item === DELETED_ITEM_VALUE) return { not: null, notIn: liveItemIds };
  return item;
}

function createdAtCondition(
  dari: string | null,
  sampai: string | null,
): Prisma.DateTimeFilter | undefined {
  if (dari === null && sampai === null) return undefined;

  // Batas dihitung di Asia/Jayapura lalu diubah ke UTC. Batas tengah
  // malam UTC akan membuang setiap akses antara 00.00 dan 09.00 WIT ke
  // tanggal yang salah. Kedua ujung inklusif.
  const range: Prisma.DateTimeFilter = {};
  if (dari !== null) range.gte = startOfDayWIT(dari);
  if (sampai !== null) range.lte = endOfDayWIT(sampai);
  return range;
}

export function historyWhere(
  filter: HistoryFilter,
  liveItemIds: string[],
): Prisma.AccessLogWhereInput {
  const where: Prisma.AccessLogWhereInput = { groupId: filter.groupId };

  const itemId = itemCondition(filter.item, liveItemIds);
  if (itemId !== undefined) where.itemId = itemId;

  const createdAt = createdAtCondition(filter.dari, filter.sampai);
  if (createdAt !== undefined) where.createdAt = createdAt;

  if (filter.deniedOnly) where.outcome = "DENIED";

  return where;
}

/**
 * Pengurut kedua `id` WAJIB. Paginasi offset mengueri ulang untuk setiap
 * halaman; bila dua baris punya createdAt yang sama persis — dan tiga
 * puluh peserta yang mengklik dalam detik yang sama membuat itu wajar —
 * urutan di antara keduanya tidak ditentukan, sehingga satu baris dapat
 * muncul di dua halaman sekaligus sementara baris lain hilang.
 */
export async function listAccessLogs(
  filter: HistoryFilter,
  liveItemIds: string[],
  skip: number,
  take: number,
): Promise<{ rows: HistoryLogRow[]; total: number }> {
  const where = historyWhere(filter, liveItemIds);

  const [rows, total] = await Promise.all([
    prisma.accessLog.findMany({
      where,
      select: HISTORY_SELECT,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip,
      take,
    }),
    prisma.accessLog.count({ where }),
  ]);

  return { rows, total };
}

/**
 * Menjawab satu pertanyaan saja: perlukah penyaring item memuat entri
 * "Item sudah dihapus". Satu baris sudah cukup menjawabnya, jadi ini
 * findFirst, bukan hitungan maupun groupBy.
 */
export async function hasDeletedItemLogs(
  groupId: string,
  liveItemIds: string[],
): Promise<boolean> {
  const row = await prisma.accessLog.findFirst({
    where: { groupId, itemId: { not: null, notIn: liveItemIds } },
    select: { id: true },
  });
  return row !== null;
}
```

- [ ] **Step 4: Jalankan pengujian untuk memastikan ia lulus**

Run: `npx vitest run tests/db/access-logs-query.test.ts`
Expected: PASS, 14 pengujian

- [ ] **Step 5: Tulis pengujian batas teks sumber**

Buat `tests/db/access-log-select-boundary.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const SOURCE = readFileSync("lib/db/access-logs.ts", "utf8");

/**
 * Lapis ketiga dari bukti bahwa riwayat dibaca dari kolom salinan.
 *
 * Dua lapis sebelumnya menguji perilaku hari ini; lapis ini menjaga hari
 * esok. Join ke tabel User yang ditambahkan kelak "supaya namanya selalu
 * terbaru" akan membuat berkas ini merah di CI sebelum sempat berjalan
 * satu kali pun. Preseden: tests/db/public-select-boundary.test.ts.
 */
describe("batas pembacaan riwayat", () => {
  it("tidak pernah memakai include", () => {
    // AccessLog memang tidak punya relasi Prisma sama sekali — foreign
    // key-nya sengaja ditiadakan supaya menghapus group tidak ikut
    // menghapus riwayatnya. `include` di sini berarti seseorang
    // menambahkan relasi itu kembali.
    expect(SOURCE).not.toMatch(/\binclude\s*:/);
  });

  it("tidak pernah mengueri tabel User", () => {
    expect(SOURCE).not.toContain("prisma.user");
  });

  it("tidak membaca kolom userId", () => {
    // Membacanya tidak salah dengan sendirinya, tetapi ia satu-satunya
    // jembatan menuju tabel User dan tidak dipakai satu pun kolom layar.
    expect(SOURCE).not.toContain("userId");
  });

  it("membaca kedua kolom salinan identitas", () => {
    expect(SOURCE).toContain("visitorName: true");
    expect(SOURCE).toContain("visitorEmail: true");
  });

  it("tidak pernah membaca kolom yang dilarang invarian 3", () => {
    expect(SOURCE).not.toContain("targetUrl");
    expect(SOURCE).not.toContain("fileKey");
  });
});
```

- [ ] **Step 6: Jalankan pengujian batas untuk memastikan ia lulus**

Run: `npx vitest run tests/db/access-log-select-boundary.test.ts`
Expected: PASS, 5 pengujian

- [ ] **Step 7: Tambahkan dua kueri pendamping ke modulnya masing-masing**

Halaman Riwayat juga membutuhkan judul group dan judul itemnya. Keduanya bukan kueri riwayat, jadi keduanya **tidak** tinggal di `lib/db/access-logs.ts` — setiap kueri di proyek ini hidup di modul `lib/db/` yang sesuai, dan halaman tidak pernah memanggil Prisma sendiri.

Tambahkan ke akhir `lib/db/groups.ts`:

```ts
export async function getGroupTitleById(id: string): Promise<string | null> {
  const group = await prisma.group.findUnique({ where: { id }, select: { title: true } });
  return group?.title ?? null;
}
```

Tambahkan ke akhir `lib/db/items.ts`:

```ts
/**
 * Judul item untuk tabel riwayat, beserta urutan tampilnya di penyaring.
 *
 * `fileKey` dan `targetUrl` TIDAK ada di select ini — invarian 3, dan
 * halaman riwayat memang tidak punya urusan dengan keduanya.
 */
export async function listItemTitlesByGroup(
  groupId: string,
): Promise<{ id: string; title: string }[]> {
  return prisma.item.findMany({
    where: { groupId },
    orderBy: { sortOrder: "asc" },
    select: { id: true, title: true },
  });
}
```

- [ ] **Step 8: Jalankan typecheck**

Run: `npm run typecheck`
Expected: exit 0.

- [ ] **Step 9: Commit**

```bash
git add lib/db/ tests/db/access-logs-query.test.ts tests/db/access-log-select-boundary.test.ts
git commit -m "feat(db): kueri riwayat tanpa join ke User, dijaga dua lapis pengujian

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 8: Lebar dashboard mengikuti halaman

**Files:**
- Modify: `app/(dashboard)/layout.tsx:30-35`
- Test: `tests/dashboard/shell-width.test.ts`

**Interfaces:**
- Consumes: tidak ada
- Produces: kontrak `data-wide` — halaman mana pun yang merender elemen ber-atribut `data-wide` melebarkan bilah atas dan `<main>` menjadi `max-w-6xl`. Dipakai Task 11.

- [ ] **Step 1: Tulis pengujian yang gagal**

Buat `tests/dashboard/shell-width.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const SOURCE = readFileSync("app/(dashboard)/layout.tsx", "utf8");

/**
 * Keputusan U6-3. Bilah atas dan <main> bersaudara, sehingga bilah tidak
 * dapat membaca lebar yang disetel halaman di bawahnya. Penanda data-wide
 * yang dibaca varian group-has-* menyelesaikannya tanpa satu pun komponen
 * klien di layout yang sekarang seluruhnya server.
 */
describe("lebar shell dashboard", () => {
  it("memberi pembungkus terluar nama group/shell", () => {
    expect(SOURCE).toContain("group/shell");
  });

  it("melebarkan bilah atas dan main ketika halaman menandai dirinya lebar", () => {
    const matches = SOURCE.match(/group-has-\[\[data-wide\]\]\/shell:max-w-6xl/g);
    // Dua tempat: container bilah atas, dan <main>. Satu saja berarti
    // tepi kiri nama aplikasi tidak lurus dengan isi di bawahnya.
    expect(matches).toHaveLength(2);
  });

  it("tetap max-w-4xl sebagai lebar bawaan", () => {
    // Halaman dashboard tidak boleh ikut melebar hanya karena halaman
    // Riwayat membutuhkannya.
    expect(SOURCE.match(/max-w-4xl/g)).toHaveLength(2);
  });

  it("tidak memakai komponen klien untuk memilih lebarnya", () => {
    expect(SOURCE).not.toContain("use client");
    expect(SOURCE).not.toContain("usePathname");
  });
});
```

- [ ] **Step 2: Jalankan pengujian untuk memastikan ia gagal**

Run: `npx vitest run tests/dashboard/shell-width.test.ts`
Expected: FAIL pada `expect(SOURCE).toContain("group/shell")`

- [ ] **Step 3: Ubah `app/(dashboard)/layout.tsx`**

Ganti blok `return` menjadi:

```tsx
  return (
    // group/shell adalah jangkar bagi varian group-has-* di bawahnya.
    // Halaman yang merender elemen ber-atribut data-wide melebarkan
    // bilah atas DAN <main> sekaligus, sehingga tepi kirinya tetap lurus.
    // Keputusan U6-3.
    <div className="group/shell min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3 px-4 py-3 group-has-[[data-wide]]/shell:max-w-6xl">
          <span className="shrink-0 text-base font-medium">Kumpulink</span>
          <div className="flex min-w-0 items-center gap-2">
            <span
              className="truncate text-sm text-muted-foreground"
              title={session.user.email ?? undefined}
            >
              {identity}
            </span>
            <ThemeToggle />
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <Button type="submit" variant="outline" size="sm">
                Keluar
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl px-4 py-8 group-has-[[data-wide]]/shell:max-w-6xl">
        {children}
      </main>
    </div>
  );
```

- [ ] **Step 4: Jalankan pengujian untuk memastikan ia lulus**

Run: `npx vitest run tests/dashboard/shell-width.test.ts`
Expected: PASS, 4 pengujian

- [ ] **Step 5: Buktikan dashboard tidak berubah tampilannya**

Run: `npm run build`
Expected: exit 0.

Lalu jalankan `npm run dev` **dari dalam direktori worktree**, buka `http://localhost:3000/dashboard`, dan pastikan lebar isi dan tepi kiri bilah atas identik dengan sebelum perubahan. Halaman ini belum merender `data-wide` mana pun, jadi keduanya wajib tetap `max-w-4xl`.

- [ ] **Step 6: Commit**

```bash
git add "app/(dashboard)/layout.tsx" tests/dashboard/shell-width.test.ts
git commit -m "feat(dashboard): lebar shell mengikuti halaman lewat penanda data-wide

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 9: Komponen tampilan riwayat

Lima komponen server, seluruhnya membaca `HistoryRowView` yang sudah jadi dari Task 4. Tidak satu pun memformat waktu, menerjemahkan alasan, atau menyentuh Prisma.

**Task ini dan Task 10 tidak memiliki pengujian otomatis, dan itu disengaja.** `vitest.config.mts` berjalan di environment `node` tanpa DOM, dan repositori ini belum pernah memuat satu pun pengujian komponen. Menambahkan jsdom dan pustaka render di tengah Unit 6 adalah perubahan infrastruktur yang tidak diminta lingkup unit ini. Konsekuensinya diterima secara sadar: seluruh jaminan kedua task ini bersandar pada Task 12, yang memeriksanya di peramban di kedua mode dan di lebar ponsel. Itulah sebabnya seluruh **logika** sudah dipindahkan ke fungsi murni di Task 2 sampai Task 6 — yang tersisa di sini hanyalah penempatan, dan penempatan memang hanya dapat dinilai dengan mata.

**Files:**
- Create: `components/dashboard/history-outcome-badge.tsx`
- Create: `components/dashboard/history-table.tsx`
- Create: `components/dashboard/history-cards.tsx`
- Create: `components/dashboard/history-empty-state.tsx`
- Create: `components/dashboard/history-pagination.tsx`

**Interfaces:**
- Consumes: `HistoryRowView` (Task 4), `HistoryPagination` (Task 5), `historyHref` dan `HistoryParams` (Task 6)
- Produces:
  - `<HistoryOutcomeBadge row={HistoryRowView} />`
  - `<HistoryTable rows={HistoryRowView[]} />`
  - `<HistoryCards rows={HistoryRowView[]} />`
  - `<HistoryEmptyState filtering={boolean} clearHref={string} />`
  - `<HistoryPaginationBar groupId={string} params={HistoryParams} pagination={HistoryPagination} />`

- [ ] **Step 1: Tulis `components/dashboard/history-outcome-badge.tsx`**

```tsx
import { Check, X } from "lucide-react";

import type { HistoryRowView } from "@/lib/types/history";
import { cn } from "@/lib/utils";

/**
 * Tata bahasa pil yang sama dengan GroupStatusBadge: rounded-full, garis
 * batas setipis rambut, permukaan bernada tipis, TIDAK PERNAH terisi
 * penuh, selalu ikon plus teks.
 *
 * Ikon dan teks itulah yang membuat warna bukan satu-satunya pembawa
 * makna. Tidak ada perlakuan di tingkat baris — keputusan U6-6.
 */
export function HistoryOutcomeBadge({ row }: { row: HistoryRowView }) {
  const Icon = row.granted ? Check : X;

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-sm",
          row.granted
            ? "border-state-success/40 bg-state-success/10 text-state-success"
            : "border-state-error/40 bg-state-error/10 text-state-error",
        )}
      >
        <Icon className="h-4 w-4" aria-hidden />
        {row.outcomeLabel}
      </span>
      {row.denyLabel !== null && (
        <span
          className="text-sm text-muted-foreground"
          title={row.denyDescription ?? undefined}
        >
          {row.denyLabel}
        </span>
      )}
    </span>
  );
}
```

- [ ] **Step 2: Tulis `components/dashboard/history-table.tsx`**

```tsx
import { HistoryOutcomeBadge } from "@/components/dashboard/history-outcome-badge";
import type { HistoryRowView } from "@/lib/types/history";
import { cn } from "@/lib/utils";

/**
 * Tabel lima kolom untuk md ke atas; di bawahnya HistoryCards yang
 * tampil. Keduanya membaca model tampilan yang sama, sehingga teksnya
 * tidak dapat menyimpang satu sama lain.
 *
 * Urutan pengorbanan saat layar menyempit ditetapkan ui-context, dan
 * dijalankan LITERAL di sini: pada lg ke atas ada LIMA kolom, dan Email
 * berdiri sendiri. Antara md dan lg, kolom Email hilang dan isinya turun
 * menjadi baris kedua mono redup di dalam sel Nama — itu pengorbanan
 * pertama, bukan keadaan bawaan. Item menyusut dengan elipsis dan judul
 * utuhnya tetap tersedia di atribut title; Hasil tidak pernah
 * dikorbankan; Waktu berlebar tetap dan tidak pernah menyusut.
 */
export function HistoryTable({ rows }: { rows: HistoryRowView[] }) {
  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-border">
            <th scope="col" className="w-56 px-3 py-2 text-sm font-medium text-muted-foreground">
              Waktu
            </th>
            <th scope="col" className="px-3 py-2 text-sm font-medium text-muted-foreground">
              Nama
            </th>
            <th
              scope="col"
              className="hidden px-3 py-2 text-sm font-medium text-muted-foreground lg:table-cell"
            >
              Email
            </th>
            <th scope="col" className="px-3 py-2 text-sm font-medium text-muted-foreground">
              Item
            </th>
            <th scope="col" className="w-52 px-3 py-2 text-sm font-medium text-muted-foreground">
              Hasil
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-border align-top">
              <td className="w-56 px-3 py-3">
                <span className="block font-mono text-sm">{row.time}</span>
                {row.timeIp !== null && (
                  <span className="block font-mono text-sm text-muted-foreground">
                    {row.timeIp}
                  </span>
                )}
              </td>
              <td className="min-w-0 px-3 py-3">
                <span
                  className={cn(
                    "block truncate text-base",
                    row.isAnonymous ? "text-muted-foreground" : "font-medium",
                  )}
                  title={row.name}
                >
                  {row.name}
                </span>
                {/* Pengorbanan pertama: di bawah lg, Email turun ke sini. */}
                {row.email !== null && (
                  <span
                    className="block truncate font-mono text-sm text-muted-foreground lg:hidden"
                    title={row.email}
                  >
                    {row.email}
                  </span>
                )}
                {row.nameIp !== null && (
                  <span className="block font-mono text-sm text-muted-foreground">
                    {row.nameIp}
                  </span>
                )}
              </td>
              <td className="hidden min-w-0 px-3 py-3 lg:table-cell">
                {row.email !== null && (
                  <span
                    className="block truncate font-mono text-sm text-muted-foreground"
                    title={row.email}
                  >
                    {row.email}
                  </span>
                )}
              </td>
              <td className="min-w-0 px-3 py-3">
                <span
                  className={cn(
                    "block truncate text-base",
                    row.itemIsAbsent && "italic text-muted-foreground",
                  )}
                  title={row.item}
                >
                  {row.item}
                </span>
              </td>
              <td className="w-52 px-3 py-3">
                <HistoryOutcomeBadge row={row} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 3: Tulis `components/dashboard/history-cards.tsx`**

```tsx
import { HistoryOutcomeBadge } from "@/components/dashboard/history-outcome-badge";
import type { HistoryRowView } from "@/lib/types/history";
import { cn } from "@/lib/utils";

/**
 * Kartu ponsel, TANPA LABEL MEDAN SAMA SEKALI — posisi dan gaya huruf
 * yang memikulnya. Nama paling kuat, email mono redup, judul item, waktu
 * mono redup berlabel zona, dan Hasil sebagai pil di slot penanda kanan.
 *
 * Alamat IP sengaja tidak ikut, termasuk pada baris tanpa identitas,
 * sehingga kartu anonim hanya berbunyi "Tanpa identitas". Konsekuensi
 * yang diterima sadar: riwayat forensik dibaca di laptop, dan kartu ini
 * ada untuk memindai, bukan menelusuri.
 */
export function HistoryCards({ rows }: { rows: HistoryRowView[] }) {
  return (
    <ul className="flex flex-col gap-3 md:hidden">
      {rows.map((row) => (
        <li
          key={row.id}
          className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-4"
        >
          <div className="min-w-0">
            <p
              className={cn(
                "truncate text-base",
                row.isAnonymous ? "text-muted-foreground" : "font-medium",
              )}
            >
              {row.name}
            </p>
            {row.email !== null && (
              <p className="truncate font-mono text-sm text-muted-foreground">{row.email}</p>
            )}
            <p
              className={cn(
                "mt-1 truncate text-base",
                row.itemIsAbsent && "italic text-muted-foreground",
              )}
            >
              {row.item}
            </p>
            <p className="mt-1 font-mono text-sm text-muted-foreground">{row.time}</p>
          </div>
          <div className="shrink-0">
            <HistoryOutcomeBadge row={row} />
          </div>
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 4: Tulis `components/dashboard/history-empty-state.tsx`**

```tsx
import Link from "next/link";

import { Button } from "@/components/ui/button";

/**
 * DUA keadaan kosong yang berbeda, dan bedanya penting: menyamakan
 * keduanya membuat group yang sehat terbaca seperti penyaring yang
 * salah, dan sebaliknya.
 */
export function HistoryEmptyState({
  filtering,
  clearHref,
}: {
  filtering: boolean;
  clearHref: string;
}) {
  if (filtering) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-base font-medium">Tidak ada baris yang cocok</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Penyaring yang sedang aktif tidak menemukan satu pun baris di group ini.
        </p>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link href={clearHref}>Hapus penyaring</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-8 text-center">
      <p className="text-base font-medium">Belum ada riwayat</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Baris muncul di sini setelah pengunjung membuka group ini atau salah satu itemnya.
      </p>
    </div>
  );
}
```

- [ ] **Step 5: Tulis `components/dashboard/history-pagination.tsx`**

```tsx
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { historyHref, type HistoryParams } from "@/lib/history/query-params";
import type { HistoryPagination } from "@/lib/history/pagination";

/**
 * Paginasi berbasis halaman dengan totalnya dinyatakan, bukan gulir tak
 * berujung: ini catatan pertanggungjawaban, dan posisi baris harus stabil
 * serta dapat dirujuk. Kedua tombol membawa serta seluruh penyaring yang
 * sedang aktif.
 */
export function HistoryPaginationBar({
  groupId,
  params,
  pagination,
}: {
  groupId: string;
  params: HistoryParams;
  pagination: HistoryPagination;
}) {
  const first = pagination.page <= 1;
  const last = pagination.page >= pagination.pageCount;

  return (
    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-muted-foreground">{pagination.summary}</span>
      <div className="flex gap-2">
        <Button asChild={!first} variant="outline" size="sm" disabled={first}>
          {first ? (
            <span>Sebelumnya</span>
          ) : (
            <Link href={historyHref(groupId, { ...params, page: pagination.page - 1 })}>
              Sebelumnya
            </Link>
          )}
        </Button>
        <Button asChild={!last} variant="outline" size="sm" disabled={last}>
          {last ? (
            <span>Berikutnya</span>
          ) : (
            <Link href={historyHref(groupId, { ...params, page: pagination.page + 1 })}>
              Berikutnya
            </Link>
          )}
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Jalankan typecheck dan lint**

Run: `npm run typecheck`
Expected: exit 0.

Run: `npm run lint`
Expected: exit 0, nol peringatan.

- [ ] **Step 7: Commit**

```bash
git add components/dashboard/history-outcome-badge.tsx components/dashboard/history-table.tsx components/dashboard/history-cards.tsx components/dashboard/history-empty-state.tsx components/dashboard/history-pagination.tsx
git commit -m "feat(dashboard): komponen tabel, kartu, pil hasil, dan kaki riwayat

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 10: Bilah penyaring

Satu-satunya komponen klien di unit ini. Ia tidak menyimpan hasil apa pun — ia hanya menyusun URL baru dan mendorongnya.

**Penyaring item memakai `<select>` bawaan peramban, bukan `components/ui/select.tsx`.** Ini penyimpangan sadar dari kebiasaan memakai komponen shadcn, dan alasannya bukan kemalasan: `select.tsx` shadcn adalah listbox Radix yang menuntut keadaan terkendali, portal, dan penanganan papan ketik sendiri, sementara yang dibutuhkan di sini hanyalah satu daftar pilihan yang mengubah URL. Bila pemilik lebih memilih bentuk shadcn demi keseragaman visual dengan panel Bagikan, tukar di sini — perilakunya tidak berubah, karena logikanya seluruhnya ada di `historyHref()`.

**Files:**
- Create: `components/dashboard/history-filter-bar.tsx`

**Interfaces:**
- Consumes: `HistoryParams`, `historyHref`, `DELETED_ITEM_VALUE` (Task 6), `HistoryItemOption` (Task 4)
- Produces: `<HistoryFilterBar groupId={string} params={HistoryParams} itemOptions={HistoryItemOption[]} />`

- [ ] **Step 1: Tulis `components/dashboard/history-filter-bar.tsx`**

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { historyHref, type HistoryParams } from "@/lib/history/query-params";
import type { HistoryItemOption } from "@/lib/types/history";
import { cn } from "@/lib/utils";

const SEMUA_ITEM = "semua";

/**
 * Komponen ini tidak menyaring apa pun sendiri. Ia menyusun URL baru dan
 * mendorongnya; server yang mengueri. Itulah yang membuat alamat halaman
 * 3 dengan penyaring aktif dapat disalin, ditandai, dan dimuat ulang —
 * tuntutan "posisi baris harus stabil serta dapat dirujuk".
 *
 * Setiap perubahan penyaring MENGEMBALIKAN halaman ke 1. Tanpa itu
 * pemilik mendarat di halaman 7 dari hasil yang hanya punya 2 halaman.
 */
export function HistoryFilterBar({
  groupId,
  params,
  itemOptions,
}: {
  groupId: string;
  params: HistoryParams;
  itemOptions: HistoryItemOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const apply = (patch: Partial<HistoryParams>) => {
    startTransition(() => {
      router.replace(historyHref(groupId, { ...params, ...patch, page: 1 }));
    });
  };

  const filtering =
    params.item !== null ||
    params.dari !== null ||
    params.sampai !== null ||
    params.deniedOnly;

  return (
    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end">
      <label className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-sm text-muted-foreground">Item</span>
        <select
          value={params.item ?? SEMUA_ITEM}
          disabled={pending}
          onChange={(event) =>
            apply({ item: event.target.value === SEMUA_ITEM ? null : event.target.value })
          }
          className="h-9 rounded-md border border-border bg-card px-3 text-base"
        >
          <option value={SEMUA_ITEM}>Semua item</option>
          {itemOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-muted-foreground">Dari (WIT)</span>
        <Input
          type="date"
          value={params.dari ?? ""}
          disabled={pending}
          onChange={(event) => apply({ dari: event.target.value === "" ? null : event.target.value })}
          className="font-mono"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-muted-foreground">Sampai (WIT)</span>
        <Input
          type="date"
          value={params.sampai ?? ""}
          disabled={pending}
          onChange={(event) =>
            apply({ sampai: event.target.value === "" ? null : event.target.value })
          }
          className="font-mono"
        />
      </label>

      <div className="flex gap-2">
        <button
          type="button"
          aria-pressed={params.deniedOnly}
          disabled={pending}
          onClick={() => apply({ deniedOnly: !params.deniedOnly })}
          className={cn(
            "h-9 rounded-md border px-3 text-sm",
            params.deniedOnly
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border text-muted-foreground",
          )}
        >
          Hanya yang ditolak
        </button>
        {filtering && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() =>
              startTransition(() => {
                router.replace(
                  historyHref(groupId, {
                    item: null,
                    dari: null,
                    sampai: null,
                    deniedOnly: false,
                    page: 1,
                  }),
                );
              })
            }
          >
            Hapus penyaring
          </Button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Jalankan typecheck dan lint**

Run: `npm run typecheck`
Expected: exit 0.

Run: `npm run lint`
Expected: exit 0, nol peringatan.

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/history-filter-bar.tsx
git commit -m "feat(dashboard): bilah penyaring riwayat yang mendorong URL

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 11: Halaman Riwayat dan pintu masuknya

**Files:**
- Create: `app/(dashboard)/dashboard/groups/[groupId]/riwayat/page.tsx`
- Modify: `components/dashboard/group-accordion-body.tsx:60-84`
- Test: `tests/dashboard/history-owner-boundary.test.ts`

**Interfaces:**
- Consumes: seluruh keluaran Task 2 sampai Task 10
- Produces: halaman yang dapat dibuka pemilik di `/dashboard/groups/[groupId]/riwayat`

- [ ] **Step 1: Tulis pengujian batas gerbang yang gagal**

Buat `tests/dashboard/history-owner-boundary.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const SOURCE = readFileSync(
  "app/(dashboard)/dashboard/groups/[groupId]/riwayat/page.tsx",
  "utf8",
);

/**
 * Layout dashboard memang memanggil requireOwner(), tetapi jaminan itu
 * TIDAK berlaku pada navigasi lunak antar segmen bersaudara — komentar di
 * app/(dashboard)/layout.tsx sudah menjelaskannya, dan halaman dashboard
 * memanggil gerbangnya sendiri karena alasan yang sama.
 */
describe("gerbang pemilik di halaman Riwayat", () => {
  it("memanggil requireOwner sendiri", () => {
    expect(SOURCE).toMatch(/await\s+requireOwner\s*\(/);
  });

  it("tidak memanggil evaluateAccess", () => {
    // Halaman ini tidak menyajikan konten apa pun, jadi ia bukan jalur
    // menuju konten. Memanggil evaluator di sini berarti seseorang
    // membuat halaman ini menyajikan sesuatu.
    expect(SOURCE).not.toContain("evaluateAccess");
    expect(SOURCE).not.toContain("evaluateItemAccess");
  });

  it("tidak membaca kolom yang dilarang invarian 3", () => {
    expect(SOURCE).not.toContain("targetUrl");
    expect(SOURCE).not.toContain("fileKey");
  });

  it("menandai dirinya sebagai halaman lebar", () => {
    expect(SOURCE).toContain("data-wide");
  });
});
```

- [ ] **Step 2: Jalankan pengujian untuk memastikan ia gagal**

Run: `npx vitest run tests/dashboard/history-owner-boundary.test.ts`
Expected: FAIL dengan `ENOENT: no such file or directory`

- [ ] **Step 3: Tulis halaman**

Buat `app/(dashboard)/dashboard/groups/[groupId]/riwayat/page.tsx`:

```tsx
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { HistoryCards } from "@/components/dashboard/history-cards";
import { HistoryEmptyState } from "@/components/dashboard/history-empty-state";
import { HistoryFilterBar } from "@/components/dashboard/history-filter-bar";
import { HistoryPaginationBar } from "@/components/dashboard/history-pagination";
import { HistoryTable } from "@/components/dashboard/history-table";
import { requireOwner } from "@/lib/auth/session";
import { hasDeletedItemLogs, listAccessLogs } from "@/lib/db/access-logs";
import { getGroupTitleById } from "@/lib/db/groups";
import { listItemTitlesByGroup } from "@/lib/db/items";
import { HISTORY_PAGE_SIZE, buildPagination } from "@/lib/history/pagination";
import {
  DELETED_ITEM_VALUE,
  givenQueryString,
  historyHref,
  historyQueryString,
  normalizeHistoryParams,
  type RawSearchParams,
} from "@/lib/history/query-params";
import { toHistoryRow } from "@/lib/history/row";
import type { HistoryItemOption } from "@/lib/types/history";

export const dynamic = "force-dynamic";

export default async function HistoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ groupId: string }>;
  searchParams: Promise<RawSearchParams>;
}) {
  // Layout tidak menjamin gerbang ini saat navigasi lunak antar saudara.
  // Pola yang sama dengan app/(dashboard)/dashboard/page.tsx.
  await requireOwner();

  const { groupId } = await params;
  const raw = await searchParams;

  // Aturan tunggal: nilai yang tidak sah dibuang, lalu alamatnya
  // diluruskan. Alamat dan isi layar tidak boleh bercerita berbeda.
  const query = normalizeHistoryParams(raw);
  if (givenQueryString(raw) !== historyQueryString(query)) {
    redirect(historyHref(groupId, query));
  }

  const groupTitle = await getGroupTitleById(groupId);
  if (groupTitle === null) notFound();

  const items = await listItemTitlesByGroup(groupId);
  const liveItemIds = items.map((item) => item.id);
  const itemTitles = new Map(items.map((item) => [item.id, item.title]));

  const filter = {
    groupId,
    item: query.item,
    dari: query.dari,
    sampai: query.sampai,
    deniedOnly: query.deniedOnly,
  };

  // Hitungan diambil lebih dulu bersama barisnya. Halaman di luar
  // jangkauan baru dapat diketahui setelah totalnya ada, dan alamatnya
  // diluruskan dengan aturan yang sama seperti parameter tidak sah.
  const { rows, total } = await listAccessLogs(
    filter,
    liveItemIds,
    (query.page - 1) * HISTORY_PAGE_SIZE,
    HISTORY_PAGE_SIZE,
  );
  const pagination = buildPagination(query.page, total);
  if (pagination.page !== query.page) {
    redirect(historyHref(groupId, { ...query, page: pagination.page }));
  }

  const deletedItemsPresent = await hasDeletedItemLogs(groupId, liveItemIds);
  const itemOptions: HistoryItemOption[] = [
    ...items.map((item) => ({ value: item.id, label: item.title })),
    ...(deletedItemsPresent
      ? [{ value: DELETED_ITEM_VALUE, label: "Item sudah dihapus" }]
      : []),
  ];

  const views = rows.map((row) => toHistoryRow(row, itemTitles));
  const filtering =
    query.item !== null || query.dari !== null || query.sampai !== null || query.deniedOnly;

  return (
    // data-wide melebarkan bilah atas DAN <main> menjadi max-w-6xl.
    // Kontraknya ditetapkan app/(dashboard)/layout.tsx, keputusan U6-3.
    <div data-wide>
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm text-muted-foreground underline">
          Kembali ke dashboard
        </Link>
        <h1 className="mt-2 text-base font-medium">Riwayat akses — {groupTitle}</h1>
      </div>

      <HistoryFilterBar groupId={groupId} params={query} itemOptions={itemOptions} />

      {views.length === 0 ? (
        <HistoryEmptyState
          filtering={filtering}
          clearHref={historyHref(groupId, {
            item: null,
            dari: null,
            sampai: null,
            deniedOnly: false,
            page: 1,
          })}
        />
      ) : (
        <>
          <HistoryTable rows={views} />
          <HistoryCards rows={views} />
          <HistoryPaginationBar
            groupId={groupId}
            params={query}
            pagination={pagination}
          />
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Jalankan pengujian batas untuk memastikan ia lulus**

Run: `npx vitest run tests/dashboard/history-owner-boundary.test.ts`
Expected: PASS, 4 pengujian

- [ ] **Step 5: Tambahkan tautan "Riwayat" ke akordeon**

Di `components/dashboard/group-accordion-body.tsx`, tambahkan impor:

```tsx
import Link from "next/link";
import { History, Plus, Share2, Trash2 } from "lucide-react";
```

Lalu sisipkan tombol berikut di dalam `<div className="mt-3 flex gap-2">`, tepat sesudah tombol "Bagikan":

```tsx
        <Button asChild variant="outline" size="sm">
          <Link href={`/dashboard/groups/${group.id}/riwayat`}>
            <History className="h-4 w-4" aria-hidden />
            Riwayat
          </Link>
        </Button>
```

- [ ] **Step 6: Jalankan keempat gerbang**

Run: `npm run typecheck`
Expected: exit 0.

Run: `npm run lint`
Expected: exit 0, nol peringatan.

Run: `npm test`
Expected: seluruh berkas hijau, jumlah pengujian bertambah dari angka Unit 5.

Run: `npm run build`
Expected: exit 0.

- [ ] **Step 7: Commit**

```bash
git add "app/(dashboard)/dashboard/groups" components/dashboard/group-accordion-body.tsx tests/dashboard/history-owner-boundary.test.ts
git commit -m "feat(dashboard): halaman riwayat akses per group beserta pintu masuknya

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 12: Pemeriksaan peramban dan penutupan unit

Keempat gerbang kode tidak membuktikan satu pun hal yang hanya terlihat di layar. `ai-workflow-rules.md` bagian "Before Moving to the Next Unit" menuntut antarmuka diperiksa di **kedua** mode dan di lebar ponsel.

**Files:**
- Modify: `context/progress-tracker.md`

**Interfaces:**
- Consumes: seluruh task sebelumnya
- Produces: unit yang dapat dinyatakan tutup

- [ ] **Step 1: Nyalakan server dev dari dalam worktree**

Run: `npm run dev`

**Sebelum memercayai satu pemeriksaan pun**, pastikan server benar-benar melayani cabang ini dan bukan checkout utama — perangkap yang sudah menggigit proyek ini pada 8 September 2026. Buka `/dashboard/groups/apa-saja/riwayat` tanpa masuk. Pengalihan ke `/masuk` berarti server melayani kode Unit 6; **404 HTML** berarti ia melayani `main` dan seluruh pemeriksaan berikutnya tidak membuktikan apa pun.

- [ ] **Step 2: Siapkan baris riwayat yang beragam**

Buka satu group publik sebagai pengunjung anonim dan klik item `OPEN`; masuk lalu buka halaman group dan klik item `IDENTITY`; matikan saklar berbagi lalu coba buka linknya dari peramban lain; nonaktifkan satu item lalu coba buka; hapus satu item yang sudah pernah diklik. Kelimanya menghasilkan jenis baris yang berbeda, dan tanpa itu tabelnya tidak dapat diperiksa dengan jujur.

- [ ] **Step 3: Keenam pemeriksaan, masing-masing di mode terang DAN gelap**

1. **Tabel terbaca dan lengkap.** Keempat kolom tampil; baris `PAGE_VIEW` berbunyi "Membuka halaman group"; baris anonim berbunyi "Tanpa identitas" dengan alamat IP di sel Nama; baris item terhapus berbunyi "Item sudah dihapus"; baris `DENIED` menampilkan pil "Ditolak" beserta label alasannya, dan penjelasan panjang muncul saat kursor berhenti di atas labelnya.
2. **Waktu berlabel zona.** Setiap cap waktu berakhir dengan `WIT` dan dirender monospasi, berbaris lurus ke bawah.
3. **Penyaring bekerja dan dapat dirujuk.** Pilih satu item, pilih rentang tanggal, nyalakan cip "Hanya yang ditolak". Salin alamatnya, buka di tab baru, dan pastikan hasilnya identik. Ubah salah satu penyaring saat berada di halaman 2 dan pastikan halamannya kembali ke 1.
4. **Jebakan zona waktu.** Saring satu tanggal yang Anda tahu memuat akses pada pagi hari WIT sebelum pukul 09.00. Baris itu **wajib** muncul. Bila hilang, batasnya dihitung di UTC dan Task 2 gagal menjaganya.
5. **Paginasi.** Dengan lebih dari lima puluh baris, pastikan kaki tabel berbunyi `1–50 dari <total>`, tombol Sebelumnya mati di halaman 1, dan tombol Berikutnya mati di halaman terakhir. Ubah `hal` di bilah alamat menjadi angka di luar jangkauan dan pastikan alamatnya diluruskan sendiri.
6. **Lebar 375 px.** Tabel berganti menjadi tumpukan kartu tanpa label medan; alamat IP tidak muncul di kartu mana pun; halaman tidak menggulir mendatar. Lalu buka `/dashboard` di lebar yang sama dan pastikan ia tidak ikut melebar.

- [ ] **Step 4: Perbarui `context/progress-tracker.md`**

Tulis di **Current Phase**: Unit 6 selesai, tanggalnya, jumlah task, jumlah commit, dan angka keempat gerbang (`typecheck`, `lint`, jumlah pengujian dan jumlah berkasnya, `build`). Tulis di **Current Goal**: keadaan berikutnya, yaitu Unit 7. Bila salah satu pemeriksaan Step 3 menemukan cacat, catat cacat itu beserta commit perbaikannya — bukan hanya hasil akhirnya yang bersih.

- [ ] **Step 5: Commit**

```bash
git add context/progress-tracker.md
git commit -m "docs(context): Unit 6 selesai, angka gerbang dan hasil pemeriksaan peramban

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

- [ ] **Step 6: Serahkan keputusan penggabungan ke pemilik**

Gunakan skill `superpowers:finishing-a-development-branch`. Jangan menggabungkan ke `main` tanpa keputusan pemilik. Bila digabung, susulkan `dev` dengan `merge --ff-only` lalu dorong keduanya — prasyarat rilis di `progress-tracker.md` menuntutnya setiap kali sebuah unit digabung, dan melewatkannya membuat alias preview menampilkan aplikasi yang salah tanpa peringatan apa pun.
