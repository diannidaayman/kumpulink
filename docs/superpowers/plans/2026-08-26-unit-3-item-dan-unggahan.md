# Unit 3 — Item dan Unggahan Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pemilik dapat mengisi satu group dengan item bertipe `LINK`, `PDF`, dan `IMAGE` dari sumber `EXTERNAL` maupun `UPLOAD`, mengunggah PDF, dan menyusun urutannya.

**Architecture:** Berkas unggahan mengalir dari peramban ke route handler kita, diperiksa ukuran dan isinya di sana, lalu baru mendarat di Vercel Blob lewat `lib/storage/` — satu-satunya modul yang mengimpor SDK-nya. Mutasi tanpa berkas tetap memakai server action dengan pola `useActionState` yang sudah mapan di Unit 2. Seluruh aturan yang dapat diuji tanpa basis data — tanda tangan byte, bentuk pathname, validasi URL — hidup sebagai fungsi murni, dengan alasan yang sama yang memurnikan `lib/access/` dan `lib/groups/`.

**Tech Stack:** Next.js 15 App Router, TypeScript strict, Prisma + PostgreSQL (Neon), Zod 4, `@vercel/blob` 2.8, `@dnd-kit/core` + `@dnd-kit/sortable`, Tailwind + shadcn/ui, Vitest.

---

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

### Kosakata domain — bukan pelanggaran aturan Bahasa Indonesia

**`group` dan `link` adalah istilah domain proyek ini dan ditulis apa adanya di teks pengguna.** Keduanya dipakai konsisten di seluruh file konteks: `group` muncul 95 kali di `project-overview.md`, `ui-context.md`, dan `architecture.md`, sementara ejaan KBBI `grup` **nol kali**. `link` dipakai di kalimat definisi produk itu sendiri.

Sebagiannya bahkan diwajibkan kata per kata: `ui-context.md` menetapkan teks keadaan kosong berbunyi persis *"Belum ada group. Buat group pertama untuk mulai menghimpun tautan dan berkas."*

Menggantinya dengan "grup" akan membuat antarmuka bertentangan dengan spesifikasinya sendiri. Aturan "seluruh teks pengguna dalam Bahasa Indonesia" menyasar kalimat berbahasa Inggris, bukan istilah domain yang sudah ditetapkan.

Catatan terpisah: `tautan` dan `link` **tidak** bersinonim di proyek ini. `tautan` berarti item bertipe `LINK` di dalam group; `link` berarti URL berbagi group itu sendiri. Keduanya dapat muncul dalam satu kalimat tanpa saling bertentangan.

**Direktori kerja:** seluruh perintah dijalankan dari `D:\Kumpulink\kumpulink-app`.

**Rahasia:** `.env.local` sudah terisi lengkap dan terbukti diabaikan Git. Jangan pernah mencetak isinya ke terminal, ke log, atau ke pesan commit.

---

## Kendala Khusus Unit 3

Diputuskan bersama pemilik pada sesi brainstorming 26 Agustus 2026. Seluruhnya sudah tertutup dan **tidak dinegosiasikan ulang saat eksekusi**.

**Batas ukuran adalah 4 MB, bukan 10 MB.** Batas badan permintaan Vercel Functions adalah 4,5 MB di tingkat infrastruktur dan tidak dapat dinaikkan lewat konfigurasi; melebihinya menghasilkan `413 FUNCTION_PAYLOAD_TOO_LARGE` sebelum satu baris kode kita berjalan. Angka 10 MB yang tertulis di lima tempat diturunkan di Task 1. Jangan menaikkannya kembali.

**Batas ditegakkan dua kali di server.** Pertama atas header `Content-Length` sebagai penolakan murah, kedua atas `byteLength` buffer yang sebenarnya. Header itu dikirim klien dan **tidak dipercaya**; ia hanya menghemat pembacaan badan permintaan.

**Tipe berkas dibaca dari isi berkas.** Empat tanda tangan, dibandingkan sendiri, tanpa pustaka pendeteksi. `file.type` dan ekstensi nama tidak pernah dipakai untuk memutuskan apa pun. Tipe yang tidak dikenali **menolak**, tidak jatuh ke cabang terakhir.

**`type` item diturunkan dari mime terdeteksi untuk sumber `UPLOAD`.** Pemilik tidak memilih tipe saat mengunggah — tidak ada dua nilai yang bisa saling menyimpang. Pemilihan tipe secara bebas hanya berlaku untuk `EXTERNAL`, tempat ia semata menentukan ikon.

**Hanya `lib/storage/blob.ts` yang mengimpor `@vercel/blob`.** Ditegakkan oleh pengujian yang memindai seluruh pohon sumber, bukan oleh disiplin.

**`fileKey` tidak pernah keluar ke klien.** `listItemsForDashboard` memakai `select` yang tidak memuat kolom itu. Satu-satunya kueri yang membacanya adalah pra-baca di `deleteItemReturningFileKey`, dan nilainya tidak pernah menyeberang ke komponen klien. Respons route handler pun tidak memuatnya.

**Unggahan memakai route handler; mutasi lain memakai server action.** Item `EXTERNAL` tidak punya berkas sama sekali, jadi ia mutasi biasa.

**Urutan saat membuat:** ukuran → magic bytes → `putFile` → sisip baris. Gagal menyisip berarti `deleteFile` di blok `catch`. Tidak satu byte pun mendarat di Blob sebelum ukuran dan isinya lolos.

**Urutan saat menghapus adalah kebalikannya:** baris dulu, berkas sesudah, kegagalan Blob dicatat ke log server lalu **ditelan** — bentuk yang sama dengan aturan email di `code-standards.md`. Begitu barisnya hilang, keterjangkauan berkas sudah hilang; langkah kedua tidak lagi memikul keamanan.

**`targetUrl` divalidasi dengan pengurai URL WHATWG**, lalu `url.protocol` didaftarputihkan ke `http:` dan `https:`. Bukan regex dan bukan `startsWith` — pengurai itulah yang menormalkan `JaVaScRiPt:` dan varian bertab-baris-baru menjadi satu bentuk sebelum dibandingkan.

**`APPROVAL` belum boleh dipilih.** Ditegakkan di skema Zod (`z.enum(["OPEN", "IDENTITY"])`), bukan sekadar disembunyikan dari kontrol pilihan, sehingga nilai yang dikirim tangan ditolak di batas sistem.

**`getFileStream()` sengaja TIDAK ditulis di unit ini.** GATE `ROADMAP.md` Fase 4 menyebutkannya sebagai bagian bentuk `lib/storage/`, tetapi konsumen satu-satunya adalah route gerbang item yang lahir di Unit 4. Menulisnya sekarang berarti mengirim kode mati yang tidak teruji. Ini penyimpangan **yang disengaja dan sudah disetujui pemilik**, bukan kelalaian, dan tidak perlu diangkat ulang sebagai temuan.

**Mengganti berkas pada item yang sudah ada berada DI LUAR lingkup Unit 3.** Menyunting item mencakup judul, deskripsi, dan `accessMode`, ditambah `targetUrl` untuk item `EXTERNAL`. Untuk mengganti berkas, pemilik menghapus item lalu menambahkannya lagi.

**Setiap server action dan setiap route handler memanggil gerbangnya sendiri.** Layout tidak melindungi keduanya.

---

## File Structure

Berkas yang dibuat atau diubah unit ini, beserta tanggung jawab masing-masing.

| Berkas | Tanggung jawab |
| ------ | -------------- |
| `lib/order/move.ts` | **Dipindah** dari `lib/groups/order.ts`. `moveInList()` dan `renumber()` — murni, generik, dipakai group maupun item. |
| `lib/storage/detect-file-type.ts` | Murni. Empat tanda tangan byte, daftar mime diterima, peta mime ke ekstensi, peta mime ke `ItemType`. Tanpa impor SDK. |
| `lib/storage/blob-path.ts` | Murni. `groupBlobPrefix()` dan `buildBlobPath()`. Tanpa impor SDK. |
| `lib/storage/blob.ts` | **Satu-satunya** pengimpor SDK Vercel Blob. `putFile`, `deleteFile`, `deleteFilesByPrefix`. |
| `lib/validation/item.ts` | Skema Zod item, termasuk `targetUrlSchema` dan `itemAccessModeSchema`. |
| `lib/types/item.ts` | `ItemListEntry` — bentuk yang menyeberang ke klien. Tanpa `fileKey`. |
| `lib/types/item-action.ts` | `ItemActionState`, cermin `GroupActionState`. Di luar berkas `"use server"` secara sengaja. |
| `lib/db/items.ts` | Kueri item. Tidak mengambil keputusan. |
| `lib/db/groups.ts` | **Diubah:** tambah `groupExists()`. |
| `lib/auth/session.ts` | **Diubah:** tambah `getOwnerSession()` — varian API yang mengembalikan `null`, bukan mengalihkan. |
| `app/api/groups/[groupId]/items/route.ts` | POST multipart. Satu tanggung jawab: menambah satu item bersumber `UPLOAD`. |
| `app/(dashboard)/dashboard/item-actions.ts` | Server action item. Berkas terpisah — `actions.ts` sudah 167 baris. |
| `app/(dashboard)/dashboard/actions.ts` | **Diubah:** `deleteGroupAction` menyapu berkas group lewat awalan. |
| `app/(dashboard)/dashboard/page.tsx` | **Diubah:** mengambil item bersama group. |
| `components/dashboard/item-card.tsx` | Satu kartu item, mengikuti Item Card Anatomy. |
| `components/dashboard/item-list.tsx` | Daftar item di dalam akordeon: konteks dnd-kit, tombol naik/turun, pengumuman `aria-live`. |
| `components/dashboard/item-external-form.tsx` | Formulir item `EXTERNAL`. Server action + `useActionState`. |
| `components/dashboard/item-upload-form.tsx` | Formulir item `UPLOAD`. `fetch` multipart. |
| `components/dashboard/item-add-panel.tsx` | Sakelar sumber + pembungkus kedua formulir. |
| `components/dashboard/item-delete-dialog.tsx` | Dialog konfirmasi hapus item. |
| `components/dashboard/item-empty-state.tsx` | Keadaan kosong daftar item. |
| `components/dashboard/group-list.tsx` | **Diubah:** merender `ItemList` di dalam `AccordionContent`. |
| `tests/order/move.test.ts` | **Dipindah** dari `tests/groups/order.test.ts`. |
| `tests/storage/detect-file-type.test.ts` | Uji keempat tanda tangan dan seluruh penolakannya. |
| `tests/storage/blob-path.test.ts` | Uji bentuk, keunikan, dan sumber ekstensi. |
| `tests/storage/blob-import-boundary.test.ts` | Memindai pohon sumber; menegakkan exit criteria terakhir Fase 4. |
| `tests/validation/item.test.ts` | Uji `targetUrl`, `accessMode`, judul, deskripsi. |

**Kenapa `detect-file-type.ts` dan `blob-path.ts` terpisah dari `blob.ts`.** Keduanya harus dapat diuji, dan `blob.ts` mengimpor `server-only` beserta SDK yang menuntut token — keduanya melumpuhkan Vitest. Pemisahan ini bukan gaya, melainkan syarat agar aturan berisiko di unit ini punya pengujian. Pola yang sama sudah dipakai `lib/env-schema.ts` terhadap `lib/env.ts` di Unit 1.

---
## Task 1: Amandemen file konteks

Dikerjakan **sebelum baris kode pertama**. `ai-workflow-rules.md` mewajibkan kebutuhan yang ambigu diselesaikan di file konteks lebih dulu, dan angka 10 MB bukan sekadar ambigu melainkan mustahil.

**Files:**
- Modify: `context/architecture.md` — baris 332, bagian Storage Model, Data Model → Item, Request Flow, Invariants
- Modify: `context/progress-tracker.md:679`
- Modify: `ROADMAP.md:359`, `ROADMAP.md:382`
- Modify: `PRODUCT.md:141`
- Modify: `context/code-standards.md` — bagian File Organization

**Interfaces:**
- Consumes: —
- Produces: batas 4 MB sebagai angka resmi proyek; skema pathname `groups/{groupId}/{acak}.{ext}`; aturan penurunan `type` dari mime.

- [ ] **Step 1: Turunkan batas di `context/architecture.md`**

Ganti paragraf yang dimulai di baris 332 (dimulai "Batas ukuran unggahan: 10 MB per berkas") dengan:

```markdown
Batas ukuran unggahan: 4 MB per berkas, ditegakkan di
server. Tipe yang diterima: `application/pdf`, `image/png`,
`image/jpeg`, `image/webp` — diperiksa dari isi berkas,
bukan dari ekstensi nama.

**Kenapa 4 MB dan bukan 10 MB.** Batas badan permintaan
Vercel Functions adalah 4,5 MB di tingkat infrastruktur dan
tidak dapat dinaikkan lewat konfigurasi apa pun; melebihinya
menghasilkan `413 FUNCTION_PAYLOAD_TOO_LARGE` sebelum satu
baris kode aplikasi berjalan. Rumusan sebelumnya menyebut
10 MB, dan angka itu tidak akan pernah tercapai di produksi.

Alternatifnya adalah unggahan langsung dari peramban ke Blob
memakai token bercakupan sempit, dan itu ditolak 26 Agustus
2026: token Blob akan sampai ke klien, berkas mendarat lebih
dulu sebelum isinya diperiksa, dan ada jendela berkas yatim
bila tab ditutup di tengah jalan. Aplikasi ini memilih yang
lebih dapat dipertanggungjawabkan, bukan yang lebih lapang.
```

- [ ] **Step 2: Tambahkan skema pathname, tepat setelah paragraf Step 1**

```markdown
**Bentuk pathname Blob:** `groups/{groupId}/{acak}.{ext}`.
Segmen acak berasal dari 24 byte `crypto.randomBytes` dalam
base64url — sumber acak kriptografis, aturan yang sama
dengan slug acak. Ketidakdapatditebakan sepenuhnya dipikul
segmen itu. Ekstensi diturunkan dari mime **terdeteksi**,
bukan dari nama berkas unggahan. Nama asli berkas tidak
pernah masuk pathname; ia hidup di `Item.fileName` dan hanya
dipakai untuk `Content-Disposition`.

Awalan `groups/{groupId}/` membuat penghapusan group menjadi
operasi yang dapat dibuktikan, bukan lingkaran best-effort di
atas baris basis data: setelah barisnya terhapus, seluruh
berkas di bawah awalan itu disapu — termasuk yatim yang
tertinggal dari kegagalan sebelumnya.

Permukaan `lib/storage/` karena itu berisi empat fungsi:
`putFile`, `getFileStream`, `deleteFile`, dan
`deleteFilesByPrefix`.
```

- [ ] **Step 3: Tambahkan aturan penurunan `type` ke Data Model → Item**

Sisipkan tepat setelah tabel medan `Item` dan sebelum kalimat "Indeks gabungan pada `(groupId, sortOrder)`":

```markdown
**Hubungan `type` dengan `source`.** Untuk `source = UPLOAD`,
`type` **diturunkan** dari mime yang terdeteksi dari isi
berkas: `application/pdf` menghasilkan `PDF`, tiga mime
gambar menghasilkan `IMAGE`. Pemilik tidak memilihnya, karena
tidak boleh ada dua nilai yang dapat saling menyimpang.
`UPLOAD` tidak pernah bertipe `LINK`.

Untuk `source = EXTERNAL`, pemilik memilih `type` secara
bebas dan pilihan itu hanya menentukan ikon — di situlah
kalimat "dua sumbu yang saling bebas" benar-benar bermakna.
`LINK` selalu `EXTERNAL`, tetapi `EXTERNAL` tidak selalu
`LINK`: menempel URL menuju PDF di Drive adalah `EXTERNAL`
bertipe `PDF`.
```

- [ ] **Step 4: Tambahkan alur pembuatan item ke Request Flow**

Sisipkan sebagai subbagian baru tepat sebelum `### Pengajuan izin — server action`:

```markdown
### Pembuatan item — route handler

Berlaku hanya untuk `source = UPLOAD`. Item `EXTERNAL` tidak
memuat berkas dan memakai server action biasa.

`POST /api/groups/[groupId]/items`, multipart:

1. Baca sesi; bukan `OWNER` menghasilkan 403 JSON. Bukan
   pengalihan: pemanggilnya `fetch`, dan pengalihan yang
   diikuti diam-diam akan terbaca sebagai keberhasilan.
2. Tolak bila header `Content-Length` melebihi 4 MB. Murah,
   sebelum badan permintaan dibaca. Header ini **tidak
   dipercaya** — ia hanya menghemat pekerjaan.
3. Pastikan group ada.
4. Validasi judul, deskripsi, dan `accessMode` dengan Zod.
5. Baca buffer, lalu tegakkan 4 MB atas ukuran **sebenarnya**.
   Inilah penegakan yang mengikat.
6. Deteksi mime dari byte awal berkas. Tidak dikenali
   menghasilkan 415.
7. Turunkan `type` dari mime.
8. `putFile()` ke `groups/{groupId}/{acak}.{ext}`.
9. Sisipkan baris `Item`. **Gagal menyisip berarti
   `deleteFile()`** pada berkas yang barusan naik, lalu galat
   dilemparkan kembali.
10. Respons sukses tidak pernah memuat `fileKey`.

Urutan 5, 6, lalu 8 adalah intinya: tidak satu byte pun
mendarat di Blob sebelum ukuran dan isinya lolos.

**Penghapusan berjalan ke arah sebaliknya** — baris dulu,
berkas sesudah. Barislah yang memikul keterjangkauan: setiap
jalur menuju konten berangkat dari baris `Item`, jadi begitu
baris itu hilang berkasnya sudah tidak terjangkau meski
seluruh langkah berikutnya gagal. Kegagalan menghapus di Blob
dicatat ke log server lalu ditelan, sama seperti kegagalan
email. Menghapus group menyapu seluruh awalannya setelah
transaksi commit.
```

- [ ] **Step 5: Perkuat invarian 3**

Di bagian Invariants, ganti butir 3 seluruhnya:

```markdown
3. URL Blob mentah dan `fileKey` tidak pernah muncul di HTML,
   payload data, maupun respons API yang dikirim ke peramban
   mana pun — **termasuk CMS pemilik**. Ditegakkan secara
   mekanis, bukan lewat kehati-hatian: kueri yang melayani
   antarmuka memakai `select` yang tidak memuat kolom itu,
   dan satu-satunya kueri yang membacanya adalah pra-baca
   sesaat sebelum penghapusan. `targetUrl` item bersetelan
   `accessMode = IDENTITY` atau `APPROVAL` tidak pernah
   dikirim ke pengunjung; di CMS pemilik ia wajib ada, karena
   di situlah ia disunting.
```

- [ ] **Step 6: Turunkan angka di tiga berkas sisanya**

- `context/progress-tracker.md:679` — ganti `batas 10 MB` menjadi `batas 4 MB`
- `PRODUCT.md:141` — ganti `Batas unggahan 10 MB per berkas` menjadi `Batas unggahan 4 MB per berkas`
- `ROADMAP.md:359` — ganti `batas 10 MB dan pemeriksaan tipe` menjadi `batas 4 MB dan pemeriksaan tipe`

- [ ] **Step 7: Perbaiki dua exit criteria Fase 4 di `ROADMAP.md`**

Ganti baris 382:

```markdown
- [ ] PDF 4 MB diterima, 5 MB ditolak **di server**
```

Ganti kriteria berikutnya, yang berbunyi "Berkas `.pdf` yang isinya bukan PDF ditolak", dengan:

```markdown
- [ ] Berkas yang isinya bukan salah satu dari empat tipe diterima akan ditolak, apa pun ekstensi namanya
```

Dibaca harfiah, rumusan lama menuntut isi dibandingkan dengan **ekstensi** — persis yang dilarang `code-standards.md`. Konsekuensi rumusan baru: `rundown.pdf` yang isinya PNG **diterima sebagai `IMAGE`**, bukan ditolak. Itu aman karena Unit 4 menyajikan `Content-Type` dari mime terdeteksi disertai `X-Content-Type-Options: nosniff`, sehingga peramban tidak pernah menuruti ekstensinya. `rundown.pdf` yang isinya EXE tetap ditolak. Diputuskan pemilik 26 Agustus 2026.

- [ ] **Step 8: Catat `lib/order/` di `context/code-standards.md`**

Di bagian File Organization, sisipkan tepat setelah butir `lib/groups/`:

```markdown
- `lib/order/` — penyusunan ulang urutan sebagai fungsi murni,
  generik atas apa pun yang berid. Dipakai group maupun item;
  berdiri di luar `lib/groups/` justru karena ia bukan milik
  salah satunya
```

- [ ] **Step 9: Buktikan tidak ada angka 10 MB yang tertinggal**

```bash
grep -rn "10 MB\|10MB\|11 MB" context/ ROADMAP.md PRODUCT.md CLAUDE.md
```

Expected: **tidak ada keluaran sama sekali**, dan `grep` keluar dengan kode 1. Bila masih ada kecocokan, perbaiki sebelum commit.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "docs: turunkan batas unggahan ke 4 MB dan tetapkan bentuk penyimpanan

Batas badan permintaan Vercel Functions adalah 4,5 MB di tingkat
infrastruktur. Angka 10 MB yang tertulis di lima tempat tidak akan pernah
tercapai di produksi; PDF sebesar itu mati di pintu Vercel sebelum satu
baris kode aplikasi berjalan. Alternatifnya, unggahan langsung dari
peramban dengan token bercakupan sempit, ditolak karena token Blob akan
sampai ke klien dan berkas mendarat sebelum isinya diperiksa.

Ditetapkan sekalian: bentuk pathname beserta alasan awalan groupId,
penurunan type dari mime terdeteksi untuk sumber UPLOAD, alur pembuatan
item beserta urutan kegagalannya, dan perluasan invarian 3 sehingga
fileKey juga tidak boleh sampai ke CMS pemilik.

Kriteria 'berkas .pdf yang isinya bukan PDF ditolak' dirumuskan ulang:
dibaca harfiah ia menuntut perbandingan dengan ekstensi, persis yang
dilarang code-standards.md."
```

---

## Task 2: Dependensi dan pemindahan `lib/order/`

`lib/groups/order.ts` sudah generik atas `Orderable`, tetapi fungsinya bernama `moveGroup`. Memakainya untuk item berarti menulis `moveGroup(items, ...)` di sepanjang unit ini. Dipindah sekarang, sebelum ada pemanggil baru yang ikut memakai nama lama.

**Files:**
- Modify: `package.json`
- Create: `lib/order/move.ts`
- Delete: `lib/groups/order.ts`
- Create: `tests/order/move.test.ts`
- Delete: `tests/groups/order.test.ts`
- Modify: `lib/db/groups.ts:4`, `lib/db/groups.ts:88`
- Modify: `components/dashboard/group-list.tsx:23`, `components/dashboard/group-list.tsx:41-46`, `components/dashboard/group-list.tsx:55`

**Interfaces:**
- Consumes: `Orderable` dari `lib/groups/order.ts` (dipindah di task ini)
- Produces:
  - `moveInList<T extends Orderable>(list: readonly T[], id: string, direction: "up" | "down"): T[]`
  - `renumber<T extends Orderable>(list: readonly T[]): { id: string; sortOrder: number }[]`
  - `type Orderable = { id: string }`
  - Paket `@vercel/blob`, `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `@dnd-kit/modifiers` terpasang

- [ ] **Step 1: Pasang keempat dependensi**

```bash
npm i @vercel/blob@^2.8.0 @dnd-kit/core@^6.3.1 @dnd-kit/sortable@^10.0.0 @dnd-kit/utilities@^3.2.2 @dnd-kit/modifiers@^9.0.0
```

`@vercel/blob` harus 2.3 atau lebih baru — di bawah itu API private store belum ada. `@dnd-kit/react` yang lebih baru **sengaja tidak dipakai**: ia masih 0.5.0 dan hanya menyatakan React 18 di `peerDependencies`, sedangkan proyek ini React 19.

- [ ] **Step 2: Buktikan versinya memenuhi lantai**

```bash
node -e "const v=require('@vercel/blob/package.json').version; console.log(v); const [a,b]=v.split('.').map(Number); process.exit(a>2||(a===2&&b>=3)?0:1)"
```

Expected: mencetak versi seperti `2.8.0` dan keluar dengan kode 0. Bila keluar dengan kode 1, versinya di bawah lantai 2.3 — hentikan dan laporkan.

- [ ] **Step 3: Pindahkan berkas dengan `git mv` agar riwayatnya terjaga**

```bash
mkdir -p lib/order tests/order
git mv lib/groups/order.ts lib/order/move.ts
git mv tests/groups/order.test.ts tests/order/move.test.ts
```

- [ ] **Step 4: Ganti nama kedua fungsi di `lib/order/move.ts`**

Isi lengkap berkas setelah perubahan:

```ts
export type Orderable = { id: string };

/**
 * Menukar sebuah entri dengan tetangganya. Di tepi larik, dan untuk id
 * yang tidak ada, mengembalikan urutan yang sama — bukan melempar galat.
 * Tombol di tepi memang disembunyikan di antarmuka, jadi keadaan ini
 * hanya tercapai lewat balapan; membatalkan diam-diam lebih baik
 * daripada menjatuhkan halaman.
 *
 * Generik atas apa pun yang berid: group memakainya di dashboard, item
 * memakainya di dalam akordeon. Itulah kenapa ia tidak tinggal di
 * lib/groups/ — ia bukan milik salah satu dari keduanya.
 */
export function moveInList<T extends Orderable>(
  list: readonly T[],
  id: string,
  direction: "up" | "down",
): T[] {
  const from = list.findIndex((entry) => entry.id === id);
  if (from === -1) return [...list];

  const to = direction === "up" ? from - 1 : from + 1;
  if (to < 0 || to >= list.length) return [...list];

  const next = [...list];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}

/**
 * Menomori ulang rapat 0,1,2,… tanpa celah. Dipanggil setiap pemindahan
 * dan setiap penghapusan, sehingga keadaan basis data selalu kanonis dan
 * tidak ada jalur pemulihan celah yang harus ditulis dan diuji.
 */
export function renumber<T extends Orderable>(
  list: readonly T[],
): { id: string; sortOrder: number }[] {
  return list.map((entry, index) => ({ id: entry.id, sortOrder: index }));
}
```

- [ ] **Step 5: Perbarui `tests/order/move.test.ts`**

Ganti setiap `moveGroup` menjadi `moveInList`, setiap `renumberGroups` menjadi `renumber`, dan baris impornya menjadi:

```ts
import { moveInList, renumber } from "@/lib/order/move";
```

Jangan mengubah satu pun kasus uji atau nama pengujiannya — perilakunya tidak berubah, hanya namanya.

- [ ] **Step 6: Perbarui kedua pemanggil**

Di `lib/db/groups.ts`, ganti baris impor:

```ts
import { moveInList, renumber } from "@/lib/order/move";
```

lalu di dalam `moveGroupInTransaction`, ganti baris pemanggilannya:

```ts
    const reordered = renumber(moveInList(groups, id, direction));
```

Di `components/dashboard/group-list.tsx`, ganti baris impor:

```ts
import { moveInList } from "@/lib/order/move";
```

lalu ganti ketiga pemakaiannya — di dalam `useOptimistic` dan di dalam `handleMove`:

```ts
  const [order, applyMove] = useOptimistic(
    groups,
    (current: GroupListItem[], move: { id: string; direction: "up" | "down" }) =>
      moveInList(current, move.id, move.direction),
  );
```

```ts
    const moved = moveInList(order, group.id, direction);
```

- [ ] **Step 7: Buktikan tidak ada nama lama yang tertinggal**

```bash
grep -rn "moveGroup\b\|renumberGroups\|lib/groups/order" lib components app tests
```

Expected: satu-satunya kecocokan adalah `moveGroupInTransaction` di `lib/db/groups.ts` dan `app/(dashboard)/dashboard/actions.ts` — nama itu **tidak** ikut berganti, karena ia memang khusus group. Tidak boleh ada kecocokan untuk `renumberGroups` maupun `lib/groups/order`.

- [ ] **Step 8: Jalankan keempat gerbang**

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

Expected: keempatnya keluar dengan kode 0; `npm test` melaporkan 180 test lulus, jumlah yang sama seperti sebelum pemindahan.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "refactor: pindahkan logika urutan ke lib/order/ dan pasang dependensi Unit 3

Fungsinya sudah generik atas Orderable sejak Unit 2, tetapi namanya
menyebut group. Item akan memakainya juga, dan memanggil moveGroup(items)
di sepanjang unit berikutnya adalah nama yang berbohong. Dipindah
sekarang, sebelum ada pemanggil baru yang ikut memakai nama lama.
Perilakunya tidak berubah; seluruh kasus ujinya dipakai kembali apa
adanya.

@dnd-kit/react yang lebih baru tidak dipakai: masih 0.5.0 dan hanya
menyatakan React 18 di peerDependencies."
```

---
## Task 3: `lib/storage/detect-file-type.ts`

Aturan paling berisiko di unit ini, dan satu-satunya yang menentukan berkas mana yang boleh masuk. Ditulis lebih dulu, murni, dan dengan pengujian yang mendahului implementasinya.

**Files:**
- Create: `lib/storage/detect-file-type.ts`
- Test: `tests/storage/detect-file-type.test.ts`

**Interfaces:**
- Consumes: `ItemType` dari `@prisma/client` (impor tipe saja)
- Produces:
  - `ACCEPTED_MIME_TYPES: readonly ["application/pdf", "image/png", "image/jpeg", "image/webp"]`
  - `type AcceptedMimeType = (typeof ACCEPTED_MIME_TYPES)[number]`
  - `detectFileType(bytes: Uint8Array): AcceptedMimeType | null`
  - `extensionFor(mimeType: AcceptedMimeType): string`
  - `itemTypeFor(mimeType: AcceptedMimeType): ItemType`

- [ ] **Step 1: Tulis pengujian yang gagal**

`tests/storage/detect-file-type.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import {
  detectFileType,
  extensionFor,
  itemTypeFor,
} from "@/lib/storage/detect-file-type";

/** Menyusun byte awal berkas lalu memberinya isi acak sebagai ekor. */
function withSignature(...signature: number[]): Uint8Array {
  const bytes = new Uint8Array(64);
  bytes.set(signature, 0);
  return bytes;
}

const PDF = withSignature(0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37);
const PNG = withSignature(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
const JPEG = withSignature(0xff, 0xd8, 0xff, 0xe0);

function webp(): Uint8Array {
  const bytes = new Uint8Array(64);
  bytes.set([0x52, 0x49, 0x46, 0x46], 0);
  bytes.set([0x24, 0x00, 0x00, 0x00], 4);
  bytes.set([0x57, 0x45, 0x42, 0x50], 8);
  return bytes;
}

describe("mengenali keempat tipe yang diterima dari isi berkasnya", () => {
  it("mengenali PDF dari penanda %PDF-", () => {
    expect(detectFileType(PDF)).toBe("application/pdf");
  });

  it("mengenali PNG dari delapan byte penandanya", () => {
    expect(detectFileType(PNG)).toBe("image/png");
  });

  it("mengenali JPEG dari tiga byte penandanya", () => {
    expect(detectFileType(JPEG)).toBe("image/jpeg");
  });

  it("mengenali WebP dari RIFF di awal dan WEBP di offset delapan", () => {
    expect(detectFileType(webp())).toBe("image/webp");
  });
});

describe("menolak apa pun yang tidak dikenali", () => {
  it("menolak berkas kosong", () => {
    expect(detectFileType(new Uint8Array(0))).toBeNull();
  });

  it("menolak berkas yang lebih pendek daripada penandanya sendiri", () => {
    expect(detectFileType(new Uint8Array([0x25, 0x50]))).toBeNull();
  });

  it("menolak berkas EXE meski namanya berakhiran .pdf", () => {
    // Nama berkas tidak pernah sampai ke fungsi ini, dan itulah intinya.
    expect(detectFileType(withSignature(0x4d, 0x5a, 0x90, 0x00))).toBeNull();
  });

  it("menolak SVG, karena ia dapat menjalankan skrip dan tidak ada di daftar putih", () => {
    expect(detectFileType(withSignature(0x3c, 0x73, 0x76, 0x67))).toBeNull();
  });

  it("menolak RIFF yang bukan WebP, misalnya WAV", () => {
    const wav = new Uint8Array(64);
    wav.set([0x52, 0x49, 0x46, 0x46], 0);
    wav.set([0x57, 0x41, 0x56, 0x45], 8);
    expect(detectFileType(wav)).toBeNull();
  });

  it("menolak PDF yang penandanya tidak berada tepat di awal berkas", () => {
    // Sebagian pembaca PDF memaafkan sampah di depan penanda. Daftar
    // putih tidak memaafkannya: keadaan yang tidak pasti berarti menolak.
    const padded = new Uint8Array(64);
    padded.set([0x25, 0x50, 0x44, 0x46, 0x2d], 4);
    expect(detectFileType(padded)).toBeNull();
  });
});

describe("menurunkan ekstensi dan tipe item dari mime terdeteksi", () => {
  it("memberi ekstensi yang sesuai untuk keempat mime", () => {
    expect(extensionFor("application/pdf")).toBe("pdf");
    expect(extensionFor("image/png")).toBe("png");
    expect(extensionFor("image/jpeg")).toBe("jpg");
    expect(extensionFor("image/webp")).toBe("webp");
  });

  it("memetakan PDF ke tipe PDF dan ketiga gambar ke tipe IMAGE", () => {
    expect(itemTypeFor("application/pdf")).toBe("PDF");
    expect(itemTypeFor("image/png")).toBe("IMAGE");
    expect(itemTypeFor("image/jpeg")).toBe("IMAGE");
    expect(itemTypeFor("image/webp")).toBe("IMAGE");
  });

  it("tidak pernah memetakan unggahan ke tipe LINK", () => {
    // LINK selalu EXTERNAL. Tidak ada berkas yang boleh menghasilkannya.
    const everyMime = ["application/pdf", "image/png", "image/jpeg", "image/webp"] as const;
    expect(everyMime.map(itemTypeFor)).not.toContain("LINK");
  });
});
```

- [ ] **Step 2: Jalankan pengujian untuk memastikan ia gagal**

```bash
npx vitest run tests/storage/detect-file-type.test.ts
```

Expected: FAIL — `Failed to resolve import "@/lib/storage/detect-file-type"`.

- [ ] **Step 3: Tulis implementasinya**

`lib/storage/detect-file-type.ts`:

```ts
import type { ItemType } from "@prisma/client";

/**
 * Daftar PUTIH, bukan daftar hitam. Menambah tipe baru berarti menambah
 * satu baris di sini beserta tanda tangannya di bawah; apa pun yang tidak
 * cocok dengan salah satunya menghasilkan null, dan null berarti tolak.
 * Cabang terakhir fungsi ini tidak pernah meloloskan apa pun.
 *
 * SVG sengaja TIDAK ada di daftar ini: ia dokumen yang dapat menjalankan
 * skrip, bukan sekadar gambar.
 */
export const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

export type AcceptedMimeType = (typeof ACCEPTED_MIME_TYPES)[number];

const EXTENSIONS: Record<AcceptedMimeType, string> = {
  "application/pdf": "pdf",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

const PDF = [0x25, 0x50, 0x44, 0x46, 0x2d];
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const JPEG = [0xff, 0xd8, 0xff];
const RIFF = [0x52, 0x49, 0x46, 0x46];
const WEBP = [0x57, 0x45, 0x42, 0x50];

function matchesAt(bytes: Uint8Array, signature: readonly number[], offset: number): boolean {
  if (bytes.length < offset + signature.length) return false;
  return signature.every((byte, index) => bytes[offset + index] === byte);
}

/**
 * Membaca tipe berkas dari ISINYA. Nama berkas dan Content-Type kiriman
 * peramban tidak pernah sampai ke sini, karena keduanya dikendalikan
 * pengunggah dan karena itu bukan bukti apa pun.
 *
 * Penanda wajib duduk TEPAT di offset yang ditentukan. Sebagian pembaca
 * PDF memaafkan sampah di depan %PDF-; fungsi ini tidak, karena keadaan
 * yang tidak pasti di aplikasi ini selalu berarti menolak.
 */
export function detectFileType(bytes: Uint8Array): AcceptedMimeType | null {
  if (matchesAt(bytes, PDF, 0)) return "application/pdf";
  if (matchesAt(bytes, PNG, 0)) return "image/png";
  if (matchesAt(bytes, JPEG, 0)) return "image/jpeg";
  if (matchesAt(bytes, RIFF, 0) && matchesAt(bytes, WEBP, 8)) return "image/webp";
  return null;
}

/** Ekstensi untuk pathname Blob. Diturunkan dari mime, bukan dari nama unggahan. */
export function extensionFor(mimeType: AcceptedMimeType): string {
  return EXTENSIONS[mimeType];
}

/**
 * Menurunkan `type` item dari mime terdeteksi. Untuk sumber UPLOAD,
 * pemilik TIDAK memilih tipe — sehingga tidak ada dua nilai yang dapat
 * saling menyimpang. LINK tidak pernah dihasilkan di sini: LINK selalu
 * EXTERNAL, dan EXTERNAL tidak pernah punya berkas.
 */
export function itemTypeFor(mimeType: AcceptedMimeType): ItemType {
  return mimeType === "application/pdf" ? "PDF" : "IMAGE";
}
```

- [ ] **Step 4: Jalankan pengujian untuk memastikan ia lulus**

```bash
npx vitest run tests/storage/detect-file-type.test.ts
```

Expected: PASS — 14 test lulus.

- [ ] **Step 5: Commit**

```bash
git add lib/storage/detect-file-type.ts tests/storage/detect-file-type.test.ts
git commit -m "feat(storage): kenali tipe berkas dari isinya, bukan dari namanya

Empat tanda tangan dibandingkan sendiri, tanpa pustaka pendeteksi.
Daftar tipe yang diterima di proyek ini tepat empat dan beku; pendeteksi
umum mengenali seratusan format lalu sembilan puluh enam persen
keluarannya dibuang, sementara daftar putihnya tetap harus ditulis
sendiri di atasnya.

Penanda wajib duduk tepat di offset nol. Sebagian pembaca PDF memaafkan
sampah di depan %PDF-; fungsi ini tidak, karena keadaan yang tidak pasti
berarti menolak. SVG sengaja di luar daftar: ia dokumen yang dapat
menjalankan skrip."
```

---

## Task 4: `lib/storage/blob-path.ts`

**Files:**
- Create: `lib/storage/blob-path.ts`
- Test: `tests/storage/blob-path.test.ts`

**Interfaces:**
- Consumes: `extensionFor`, `AcceptedMimeType` dari Task 3
- Produces:
  - `groupBlobPrefix(groupId: string): string`
  - `buildBlobPath(groupId: string, mimeType: AcceptedMimeType): string`

- [ ] **Step 1: Tulis pengujian yang gagal**

`tests/storage/blob-path.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { buildBlobPath, groupBlobPrefix } from "@/lib/storage/blob-path";

describe("menyusun pathname Blob yang tidak dapat ditebak dan tidak bertabrakan", () => {
  it("menempatkan berkas di bawah awalan group-nya", () => {
    expect(buildBlobPath("grp_abc", "application/pdf")).toMatch(/^groups\/grp_abc\//);
  });

  it("memberi ekstensi yang berasal dari mime, bukan dari nama unggahan", () => {
    expect(buildBlobPath("grp_abc", "application/pdf")).toMatch(/\.pdf$/);
    expect(buildBlobPath("grp_abc", "image/jpeg")).toMatch(/\.jpg$/);
    expect(buildBlobPath("grp_abc", "image/webp")).toMatch(/\.webp$/);
  });

  it("menghasilkan segmen acak yang panjangnya cukup untuk tidak dapat ditebak", () => {
    const segment = buildBlobPath("grp_abc", "image/png").split("/")[2];
    const [random] = segment.split(".");
    // 24 byte dalam base64url menjadi 32 karakter.
    expect(random).toHaveLength(32);
    expect(random).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("tidak pernah menghasilkan pathname yang sama dua kali", () => {
    const paths = new Set(
      Array.from({ length: 500 }, () => buildBlobPath("grp_abc", "image/png")),
    );
    expect(paths.size).toBe(500);
  });

  it("memakai awalan yang sama dengan yang dipakai untuk menyapu saat group dihapus", () => {
    // Kalau kedua nilai ini pernah berbeda, penghapusan group akan diam-
    // diam meninggalkan seluruh berkasnya. Diikat oleh pengujian ini.
    const path = buildBlobPath("grp_abc", "image/png");
    expect(path.startsWith(groupBlobPrefix("grp_abc"))).toBe(true);
  });

  it("mengakhiri awalan dengan garis miring agar tidak menyeret group lain", () => {
    // Tanpa garis miring, awalan "groups/grp_a" ikut mencakup
    // "groups/grp_abc" — dan penghapusan satu group akan menghapus
    // berkas milik group lain.
    expect(groupBlobPrefix("grp_a")).toBe("groups/grp_a/");
  });
});
```

- [ ] **Step 2: Jalankan pengujian untuk memastikan ia gagal**

```bash
npx vitest run tests/storage/blob-path.test.ts
```

Expected: FAIL — `Failed to resolve import "@/lib/storage/blob-path"`.

- [ ] **Step 3: Tulis implementasinya**

`lib/storage/blob-path.ts`:

```ts
import { randomBytes } from "node:crypto";

import { extensionFor, type AcceptedMimeType } from "@/lib/storage/detect-file-type";

/**
 * 24 byte menjadi 32 karakter base64url. Sumbernya kriptografis, bukan
 * Math.random() — aturan yang sama dengan slug acak, dan alasannya sama:
 * nilai yang dapat diramalkan bukan nilai yang tidak dapat ditebak.
 */
const RANDOM_BYTES = 24;

/**
 * Awalan seluruh berkas milik satu group.
 *
 * Garis miring di ujung WAJIB. Tanpa itu, awalan "groups/grp_a" ikut
 * mencakup "groups/grp_abc", dan menghapus satu group akan menghapus
 * berkas milik group lain.
 */
export function groupBlobPrefix(groupId: string): string {
  return `groups/${groupId}/`;
}

/**
 * Ketidakdapatditebakan sepenuhnya dipikul segmen acak. groupId di
 * awalan tidak memberi apa pun kepada penebak — store-nya privat,
 * sehingga menebak pun tidak berbuah — dan keberadaannya justru yang
 * membuat penghapusan group dapat dibuktikan alih-alih best-effort.
 *
 * Ekstensi berasal dari mime TERDETEKSI. Nama berkas unggahan tidak
 * pernah masuk pathname: ia dapat memuat nama orang, nama proyek, atau
 * kalimat utuh, dan pathname bukan tempat untuk itu.
 */
export function buildBlobPath(groupId: string, mimeType: AcceptedMimeType): string {
  const random = randomBytes(RANDOM_BYTES).toString("base64url");
  return `${groupBlobPrefix(groupId)}${random}.${extensionFor(mimeType)}`;
}
```

- [ ] **Step 4: Jalankan pengujian untuk memastikan ia lulus**

```bash
npx vitest run tests/storage/blob-path.test.ts
```

Expected: PASS — 6 test lulus.

- [ ] **Step 5: Commit**

```bash
git add lib/storage/blob-path.ts tests/storage/blob-path.test.ts
git commit -m "feat(storage): susun pathname Blob yang tidak dapat ditebak dan tidak bertabrakan

Bentuknya groups/{groupId}/{24 byte base64url}.{ext}. Ketidakdapat-
ditebakan dipikul segmen acak; awalan groupId ada untuk alasan lain,
yaitu membuat penghapusan group dapat dibuktikan lewat sapuan awalan
alih-alih lingkaran best-effort di atas baris basis data.

Garis miring di ujung awalan diikat pengujian: tanpa itu, awalan
groups/grp_a ikut mencakup groups/grp_abc dan menghapus satu group akan
menghapus berkas milik group lain.

Nama berkas unggahan tidak pernah masuk pathname."
```

---

## Task 5: `lib/storage/blob.ts` dan penegakan batas impor SDK

**Files:**
- Create: `lib/storage/blob.ts`
- Test: `tests/storage/blob-import-boundary.test.ts`

**Interfaces:**
- Consumes: —
- Produces:
  - `putFile(path: string, body: Uint8Array, contentType: string): Promise<string>` — mengembalikan `pathname`
  - `deleteFile(pathname: string): Promise<void>`
  - `deleteFilesByPrefix(prefix: string): Promise<void>`

- [ ] **Step 1: Tulis pengujian batas impor yang gagal**

Pengujian ini menegakkan exit criteria terakhir Fase 4 `ROADMAP.md` secara otomatis, sehingga ia tidak bergantung pada seseorang mengingat untuk mencarinya.

`tests/storage/blob-import-boundary.test.ts`:

```ts
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOTS = ["app", "components", "lib", "tests"];
const ALLOWED = "lib/storage/blob.ts";

/**
 * Disusun dari potongan supaya nama paketnya TIDAK muncul utuh di berkas
 * ini. Kalau ditulis apa adanya, pengujian ini akan menemukan dirinya
 * sendiri dan gagal selamanya.
 */
const SDK = ["@vercel", "blob"].join("/");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

describe("batas impor SDK object storage", () => {
  it("hanya lib/storage/blob.ts yang mengimpor SDK Vercel Blob", () => {
    const offenders = ROOTS.flatMap(walk)
      .filter((file) => file.endsWith(".ts") || file.endsWith(".tsx"))
      .filter((file) => readFileSync(file, "utf8").includes(SDK))
      .map((file) => file.split("\\").join("/"));

    expect(offenders).toEqual([ALLOWED]);
  });
});
```

- [ ] **Step 2: Jalankan pengujian untuk memastikan ia gagal**

```bash
npx vitest run tests/storage/blob-import-boundary.test.ts
```

Expected: FAIL — `offenders` masih larik kosong `[]` karena `lib/storage/blob.ts` belum ada, sedangkan yang diharapkan `["lib/storage/blob.ts"]`.

- [ ] **Step 3: Tulis implementasinya**

`lib/storage/blob.ts`:

```ts
import "server-only";

import { del, list, put } from "@vercel/blob";

/**
 * SATU-SATUNYA berkas di repositori ini yang mengimpor SDK Vercel Blob.
 * Ditegakkan oleh tests/storage/blob-import-boundary.test.ts, bukan oleh
 * disiplin — batas yang hanya dijaga kebiasaan akan bocor pada unit
 * keempat atau kelima.
 *
 * Sifat privat ditentukan di tingkat store, tetapi `access` tetap wajib
 * dikirim di setiap panggilan: ia membuat konteks keamanan terbaca oleh
 * siapa pun yang membaca baris ini.
 */

/** Mengembalikan pathname kanonis dari Blob, yang menjadi `Item.fileKey`. */
export async function putFile(
  path: string,
  body: Uint8Array,
  contentType: string,
): Promise<string> {
  const result = await put(path, body, {
    access: "private",
    contentType,
    // Pathname-nya SUDAH acak dari lib/storage/blob-path.ts. Membiarkan
    // SDK menambah acak lagi hanya membuat kunci yang disimpan di basis
    // data berbeda dari kunci yang kita susun.
    addRandomSuffix: false,
  });
  return result.pathname;
}

/**
 * `contentType` dikirim EKSPLISIT dari mime terdeteksi. Bila dibiarkan,
 * SDK menebaknya dari ekstensi pathname — dan menebak dari ekstensi
 * adalah persis yang dilarang code-standards.md.
 */

export async function deleteFile(pathname: string): Promise<void> {
  await del(pathname);
}

/**
 * Menyapu seluruh berkas di bawah satu awalan. Dipakai saat group
 * dihapus, dan sekaligus membersihkan berkas yatim yang tertinggal dari
 * kegagalan sebelumnya — kemampuan yang hanya ada karena pathname-nya
 * berawalan groupId.
 *
 * Paginasi ditulis meski satu group tidak akan pernah berisi seribu
 * berkas: lingkaran yang berhenti di halaman pertama adalah kegagalan
 * yang tidak pernah terlihat, hanya berkas yang diam-diam tertinggal.
 */
export async function deleteFilesByPrefix(prefix: string): Promise<void> {
  let cursor: string | undefined;

  do {
    const page = await list({ prefix, cursor });
    if (page.blobs.length > 0) {
      await del(page.blobs.map((blob) => blob.pathname));
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor !== undefined);
}
```

- [ ] **Step 4: Jalankan pengujian untuk memastikan ia lulus**

```bash
npx vitest run tests/storage/blob-import-boundary.test.ts
```

Expected: PASS — 1 test lulus.

- [ ] **Step 5: Buktikan pengujiannya benar-benar menggigit**

Sisipkan sementara baris berikut di paling atas `lib/db/groups.ts`:

```ts
import { del } from "@vercel/blob";
```

Jalankan ulang:

```bash
npx vitest run tests/storage/blob-import-boundary.test.ts
```

Expected: FAIL, dengan `lib/db/groups.ts` muncul di `offenders`. **Hapus kembali baris itu** lalu jalankan sekali lagi untuk memastikan PASS. Langkah ini membuktikan penjaganya hidup; penjaga yang tidak pernah dilihat gagal adalah penjaga yang belum diketahui bekerja.

- [ ] **Step 6: Jalankan keempat gerbang**

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

Expected: keempatnya keluar dengan kode 0.

- [ ] **Step 7: Commit**

```bash
git add lib/storage/blob.ts tests/storage/blob-import-boundary.test.ts
git commit -m "feat(storage): bungkus object storage dan tegakkan batas impornya

putFile, deleteFile, dan deleteFilesByPrefix. getFileStream sengaja
BELUM ditulis: konsumen satu-satunya adalah route gerbang item yang
lahir di Unit 4, dan menulisnya sekarang berarti mengirim kode mati yang
tidak teruji. Penyimpangan dari GATE ROADMAP.md ini disetujui pemilik
26 Agustus 2026.

Batas 'hanya lib/storage/ yang mengimpor SDK Blob' ditegakkan pengujian
yang memindai pohon sumber, bukan oleh disiplin. Penjaganya dibuktikan
menggigit dengan menyisipkan impor pelanggar sementara lalu
menyaksikannya gagal.

contentType dikirim eksplisit dari mime terdeteksi; membiarkan SDK
menebaknya dari ekstensi pathname adalah persis yang dilarang."
```

---
## Task 6: `lib/validation/item.ts`

**Files:**
- Create: `lib/validation/item.ts`
- Test: `tests/validation/item.test.ts`

**Interfaces:**
- Consumes: —
- Produces:
  - `itemTitleSchema`, `itemDescriptionSchema` (menghasilkan `string | null`), `targetUrlSchema`
  - `itemAccessModeSchema` — `z.enum(["OPEN", "IDENTITY"])`
  - `externalItemTypeSchema` — `z.enum(["LINK", "PDF", "IMAGE"])`
  - `itemIdSchema`, `itemActiveSchema` (menghasilkan `boolean`)
  - `externalItemFormSchema` — `{ title, description, targetUrl, type, accessMode }`
  - `uploadItemFieldsSchema` — `{ title, description, accessMode }`
  - `itemMetadataFormSchema` — `{ id, title, description, accessMode }`
  - `reorderItemsSchema` — `{ groupId: string; orderedIds: string[] }`
  - `MAX_ITEM_TITLE_LENGTH`, `MAX_ITEM_DESCRIPTION_LENGTH`, `MAX_TARGET_URL_LENGTH`

- [ ] **Step 1: Tulis pengujian yang gagal**

`tests/validation/item.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import {
  itemAccessModeSchema,
  itemDescriptionSchema,
  itemTitleSchema,
  targetUrlSchema,
} from "@/lib/validation/item";

function accepts(value: string): string {
  const result = targetUrlSchema.safeParse(value);
  if (!result.success) throw new Error(`ditolak padahal seharusnya diterima: ${value}`);
  return result.data;
}

function rejects(value: string): boolean {
  return targetUrlSchema.safeParse(value).success === false;
}

describe("menolak skema URL yang dapat menjalankan kode", () => {
  it("menolak javascript:", () => {
    expect(rejects("javascript:alert(1)")).toBe(true);
  });

  it("menolak javascript: yang huruf besar-kecilnya diacak", () => {
    // Pengurai URL WHATWG menormalkan protocol sebelum dibandingkan.
    // Regex kalah persis di sini, dan itu alasan pengurai yang dipakai.
    expect(rejects("JaVaScRiPt:alert(1)")).toBe(true);
  });

  it("menolak javascript: yang disisipi baris baru", () => {
    expect(rejects("java\nscript:alert(1)")).toBe(true);
  });

  it("menolak javascript: yang disisipi tab", () => {
    expect(rejects("java\tscript:alert(1)")).toBe(true);
  });

  it("menolak data:", () => {
    expect(rejects("data:text/html,<script>alert(1)</script>")).toBe(true);
  });

  it("menolak mailto: dan skema lain di luar http dan https", () => {
    expect(rejects("mailto:orang@contoh.com")).toBe(true);
    expect(rejects("file:///etc/passwd")).toBe(true);
    expect(rejects("ftp://contoh.com/berkas")).toBe(true);
  });
});

describe("menerima dan menormalkan tautan http dan https", () => {
  it("menerima https apa adanya", () => {
    expect(accepts("https://contoh.com/rundown")).toBe("https://contoh.com/rundown");
  });

  it("menerima http", () => {
    expect(accepts("http://contoh.com/")).toBe("http://contoh.com/");
  });

  it("melengkapi https:// untuk host telanjang yang ditempel apa adanya", () => {
    expect(accepts("drive.google.com/abc")).toBe("https://drive.google.com/abc");
  });

  it("memangkas spasi di kedua ujung sebelum menguraikannya", () => {
    expect(accepts("  https://contoh.com/  ")).toBe("https://contoh.com/");
  });

  it("menyimpan satu bentuk kanonis, yaitu bentuk yang nanti masuk header Location", () => {
    expect(accepts("HTTPS://Contoh.COM/Rundown")).toBe("https://contoh.com/Rundown");
  });
});

describe("menolak tautan yang membawa kredensial atau terlalu panjang", () => {
  it("menolak kredensial tertanam", () => {
    expect(rejects("https://orang:rahasia@contoh.com/")).toBe(true);
  });

  it("menolak kredensial tertanam meski hanya nama pengguna", () => {
    expect(rejects("https://orang@contoh.com/")).toBe(true);
  });

  it("menolak tautan yang melewati 2048 karakter", () => {
    expect(rejects(`https://contoh.com/${"a".repeat(2100)}`)).toBe(true);
  });

  it("menolak tautan kosong", () => {
    expect(rejects("   ")).toBe(true);
  });

  it("menolak host bertitik dua yang tidak dapat diuraikan, alih-alih menebaknya", () => {
    expect(rejects("contoh.com:8080/x")).toBe(true);
  });
});

describe("membatasi accessMode pada nilai yang fiturnya sudah ada", () => {
  it("menerima OPEN dan IDENTITY", () => {
    expect(itemAccessModeSchema.safeParse("OPEN").success).toBe(true);
    expect(itemAccessModeSchema.safeParse("IDENTITY").success).toBe(true);
  });

  it("menolak APPROVAL, karena fiturnya baru dibangun di Unit 7", () => {
    // Ditolak di BATAS SISTEM, bukan sekadar disembunyikan dari kontrol
    // pilihan. Fitur yang belum jadi tidak boleh berarti pintu terbuka.
    expect(itemAccessModeSchema.safeParse("APPROVAL").success).toBe(false);
  });

  it("menolak nilai yang tidak dikenali sama sekali", () => {
    expect(itemAccessModeSchema.safeParse("SEMBARANG").success).toBe(false);
  });
});

describe("membatasi judul dan deskripsi item", () => {
  it("menolak judul kosong", () => {
    expect(itemTitleSchema.safeParse("   ").success).toBe(false);
  });

  it("menerima judul 120 karakter dan menolak 121", () => {
    expect(itemTitleSchema.safeParse("a".repeat(120)).success).toBe(true);
    expect(itemTitleSchema.safeParse("a".repeat(121)).success).toBe(false);
  });

  it("mengubah deskripsi kosong menjadi null, bukan string kosong", () => {
    const result = itemDescriptionSchema.safeParse("   ");
    expect(result.success && result.data).toBeNull();
  });

  it("menolak deskripsi yang melewati 300 karakter", () => {
    expect(itemDescriptionSchema.safeParse("a".repeat(301)).success).toBe(false);
  });
});
```

- [ ] **Step 2: Jalankan pengujian untuk memastikan ia gagal**

```bash
npx vitest run tests/validation/item.test.ts
```

Expected: FAIL — `Failed to resolve import "@/lib/validation/item"`.

- [ ] **Step 3: Tulis implementasinya**

`lib/validation/item.ts`:

```ts
import { z } from "zod";

export const MAX_ITEM_TITLE_LENGTH = 120;
export const MAX_ITEM_DESCRIPTION_LENGTH = 300;
export const MAX_TARGET_URL_LENGTH = 2048;

export const itemTitleSchema = z.string().trim().superRefine((value, ctx) => {
  if (value.length === 0) {
    ctx.addIssue({ code: "custom", message: "Judul item tidak boleh kosong." });
    return;
  }
  if (value.length > MAX_ITEM_TITLE_LENGTH) {
    ctx.addIssue({ code: "custom", message: "Judul item maksimal 120 karakter." });
  }
});

export const itemDescriptionSchema = z
  .string()
  .trim()
  .max(MAX_ITEM_DESCRIPTION_LENGTH, "Deskripsi maksimal 300 karakter.")
  // Kolom kosong dikirim formulir sebagai string kosong, sedangkan kolom
  // basis datanya nullable. Dinormalkan di sini supaya tidak ada dua cara
  // menyatakan "tidak ada deskripsi" yang tersimpan berdampingan.
  .transform((value) => (value.length === 0 ? null : value));

/**
 * Menguraikan tautan dengan pengurai URL WHATWG lalu MENDAFTARPUTIHKAN
 * protocol-nya. Bukan regex dan bukan startsWith: pengurai itulah yang
 * menormalkan JaVaScRiPt:, tab tersisip, dan baris baru tersisip menjadi
 * satu bentuk sebelum dibandingkan — dan justru varian itulah yang
 * mengalahkan regex.
 *
 * https:// dilengkapi HANYA bila masukan tidak memuat titik dua sama
 * sekali. Menempel dari bilah alamat sering menghasilkan host telanjang,
 * dan menolaknya akan terasa seperti cacat. Masukan seperti
 * "contoh.com:8080/x" memuat titik dua, jadi ia tidak dilengkapi dan
 * gagal terurai — ditolak dengan pesan jelas, bukan ditebak.
 */
function parseTargetUrl(value: string): string | null {
  const candidate = value.includes(":") ? value : `https://${value}`;

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return null;

  // Kredensial tertanam menyamarkan host yang sebenarnya di mata
  // pembaca, dan ikut tersalin ke mana pun tautan itu diteruskan.
  if (url.username !== "" || url.password !== "") return null;

  return url.toString();
}

export const targetUrlSchema = z
  .string()
  .trim()
  .superRefine((value, ctx) => {
    if (value.length === 0) {
      ctx.addIssue({ code: "custom", message: "Tautan tidak boleh kosong." });
      return;
    }
    if (value.length > MAX_TARGET_URL_LENGTH) {
      ctx.addIssue({ code: "custom", message: "Tautan maksimal 2048 karakter." });
      return;
    }
    if (parseTargetUrl(value) === null) {
      ctx.addIssue({
        code: "custom",
        message: "Tautan harus diawali http:// atau https://.",
      });
    }
  })
  // Diurai dua kali secara sengaja: refinement Zod tidak dapat
  // menyerahkan nilai ke transform, dan menyimpan hasil di variabel luar
  // membuat skema ini tidak aman dipakai bersamaan. Biayanya satu
  // penguraian URL per pengiriman formulir.
  .transform((value) => parseTargetUrl(value) as string);

/**
 * APPROVAL SENGAJA TIDAK ADA di sini. Fiturnya baru dibangun di Unit 7,
 * dan fitur yang belum jadi tidak boleh berarti pintu yang terbuka.
 * Ditolak di batas sistem, bukan sekadar disembunyikan dari antarmuka —
 * menyembunyikan tombol tidak dihitung sebagai kontrol akses.
 *
 * Saat Unit 7 membukanya, tambahkan "APPROVAL" di sini DAN tambahkan
 * kasus ujinya di tests/validation/item.test.ts dalam perubahan yang sama.
 */
export const itemAccessModeSchema = z.enum(["OPEN", "IDENTITY"]);

/** Hanya untuk sumber EXTERNAL. UPLOAD menurunkan tipenya dari isi berkas. */
export const externalItemTypeSchema = z.enum(["LINK", "PDF", "IMAGE"]);

export const itemIdSchema = z.string().trim().superRefine((value, ctx) => {
  if (value.length === 0) {
    ctx.addIssue({ code: "custom", message: "Item tidak ditemukan." });
  }
});

export const itemActiveSchema = z.enum(["true", "false"]).transform((value) => value === "true");

export const externalItemFormSchema = z.object({
  title: itemTitleSchema,
  description: itemDescriptionSchema,
  targetUrl: targetUrlSchema,
  type: externalItemTypeSchema,
  accessMode: itemAccessModeSchema,
});

export const uploadItemFieldsSchema = z.object({
  title: itemTitleSchema,
  description: itemDescriptionSchema,
  accessMode: itemAccessModeSchema,
});

export const itemMetadataFormSchema = z.object({
  id: itemIdSchema,
  title: itemTitleSchema,
  description: itemDescriptionSchema,
  accessMode: itemAccessModeSchema,
});

export const reorderItemsSchema = z.object({
  groupId: itemIdSchema,
  orderedIds: z.array(itemIdSchema).min(1),
});

export type ExternalItemInput = z.infer<typeof externalItemFormSchema>;
export type UploadItemFields = z.infer<typeof uploadItemFieldsSchema>;
```

- [ ] **Step 4: Jalankan pengujian untuk memastikan ia lulus**

```bash
npx vitest run tests/validation/item.test.ts
```

Expected: PASS — 23 test lulus.

- [ ] **Step 5: Commit**

```bash
git add lib/validation/item.ts tests/validation/item.test.ts
git commit -m "feat(validation): skema item, dengan targetUrl diurai bukan dicocokkan regex

Pengurai URL WHATWG menormalkan JaVaScRiPt:, tab tersisip, dan baris baru
tersisip menjadi satu bentuk sebelum protocol didaftarputihkan. Regex
kalah persis pada varian-varian itu, dan pengujiannya menyebut keempatnya
satu per satu.

https:// dilengkapi hanya bila masukan tidak memuat titik dua sama
sekali, sehingga host telanjang hasil tempel tetap jalan sementara
contoh.com:8080/x ditolak alih-alih ditebak. Kredensial tertanam
ditolak. Yang disimpan adalah bentuk kanonis — string yang divalidasi
harus sama dengan string yang nanti masuk header Location.

APPROVAL tidak ada di itemAccessModeSchema. Ditolak di batas sistem,
bukan sekadar disembunyikan dari kontrol pilihan."
```

---

## Task 7: `lib/types/item.ts`, `lib/db/items.ts`, dan dua penambahan kecil

**Files:**
- Create: `lib/types/item.ts`, `lib/types/item-action.ts`, `lib/db/items.ts`
- Modify: `lib/db/groups.ts` (tambah `groupExists`)
- Modify: `lib/auth/session.ts` (tambah `getOwnerSession`)

**Interfaces:**
- Consumes: `moveInList`, `renumber` dari Task 2; `prisma` dari `lib/db/client`
- Produces:
  - `type ItemListEntry` — `{ id, title, description, type, source, targetUrl, fileName, mimeType, sizeBytes, accessMode, isActive, sortOrder }`
  - `type ItemActionState`, `EMPTY_ITEM_ACTION_STATE`
  - `listItemsForDashboard(): Promise<Record<string, ItemListEntry[]>>`
  - `insertItem(input: InsertItemInput): Promise<void>`
  - `updateItemMetadata(input: { id, title, description, accessMode }): Promise<void>`
  - `setItemActive(id: string, isActive: boolean): Promise<void>`
  - `deleteItemReturningFileKey(id: string): Promise<string | null>`
  - `reorderItemsInTransaction(groupId: string, orderedIds: string[]): Promise<void>`
  - `groupExists(id: string): Promise<boolean>`
  - `getOwnerSession(): Promise<Session | null>`

- [ ] **Step 1: Tulis `lib/types/item.ts`**

```ts
import type { AccessMode, ItemSource, ItemType } from "@prisma/client";

/**
 * Bentuk item yang menyeberang dari server component ke cangkang klien.
 *
 * `fileKey` TIDAK ADA di sini, dan ketiadaannya bukan kelalaian. Invarian
 * 3 melarangnya muncul di payload yang dikirim ke peramban mana pun,
 * termasuk CMS pemilik. Menambahkannya "sekadar untuk berjaga" akan
 * mengirim kunci object storage ke setiap tab dashboard yang terbuka.
 *
 * `targetUrl` ADA di sini, dan itu benar: pemilik menyuntingnya. Larangan
 * invarian 3 atasnya menyasar payload yang dikirim ke PENGUNJUNG.
 */
export type ItemListEntry = {
  id: string;
  title: string;
  description: string | null;
  type: ItemType;
  source: ItemSource;
  targetUrl: string | null;
  fileName: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  accessMode: AccessMode;
  isActive: boolean;
  sortOrder: number;
};
```

- [ ] **Step 2: Tulis `lib/types/item-action.ts`**

```ts
/**
 * Berdiri di luar item-actions.ts secara SENGAJA, dengan alasan yang sama
 * seperti group-action.ts: berkas bertanda "use server" hanya boleh
 * mengekspor fungsi async, dan mengekspor konstanta dari sana
 * menggagalkan build.
 */
export type ItemActionState =
  | { status: "idle" }
  | { status: "ok" }
  | {
      status: "error";
      error: { code: string; message: string };
      field?: "title" | "description" | "targetUrl";
    };

export const EMPTY_ITEM_ACTION_STATE: ItemActionState = { status: "idle" };
```

- [ ] **Step 3: Tambahkan `groupExists` ke `lib/db/groups.ts`**

Sisipkan di akhir berkas:

```ts
/**
 * Dipakai route handler unggahan untuk menolak groupId karangan SEBELUM
 * berkas apa pun naik ke object storage.
 */
export async function groupExists(id: string): Promise<boolean> {
  return (await prisma.group.count({ where: { id } })) > 0;
}
```

- [ ] **Step 4: Tambahkan `getOwnerSession` ke `lib/auth/session.ts`**

Sisipkan di akhir berkas:

```ts
/**
 * Varian requireOwner() untuk route handler: mengembalikan null alih-alih
 * mengalihkan.
 *
 * Pengalihan salah tempat di sini. Pemanggilnya `fetch`, dan `fetch`
 * MENGIKUTI pengalihan diam-diam — sehingga sesi yang mati di tengah
 * jalan akan menghasilkan respons 200 berisi halaman masuk Google, dan
 * klien membacanya sebagai unggahan yang berhasil. Route handler
 * mengembalikan 403 JSON supaya kegagalan terbaca sebagai kegagalan.
 *
 * Pembedaan "tanpa sesi" dan "bukan pemilik" sengaja TIDAK dibawa ke
 * sini: keduanya sama-sama berarti permintaan ini tidak boleh dilayani,
 * dan hanya requireOwner() yang perlu membedakannya karena hanya ia yang
 * memilih halaman tujuan.
 */
export async function getOwnerSession(): Promise<Session | null> {
  const session = await auth();
  if (!session?.user || session.user.role !== "OWNER") return null;
  return session;
}
```

- [ ] **Step 5: Tulis `lib/db/items.ts`**

```ts
import "server-only";

import type { AccessMode, ItemSource, ItemType } from "@prisma/client";

import { prisma } from "@/lib/db/client";
import { renumber } from "@/lib/order/move";
import type { ItemListEntry } from "@/lib/types/item";

/**
 * Lapisan ini TIDAK mengambil keputusan, sama seperti lib/db/groups.ts.
 *
 * `fileKey` TIDAK ADA di daftar select ini, dan itu satu-satunya alasan
 * invarian 3 dapat diperiksa dengan membaca sepuluh baris alih-alih
 * menelusuri setiap komponen. Jangan menggantinya dengan `include`, dan
 * jangan menambahkan `fileKey: true` "untuk sementara".
 */
const LIST_SELECT = {
  id: true,
  title: true,
  description: true,
  type: true,
  source: true,
  targetUrl: true,
  fileName: true,
  mimeType: true,
  sizeBytes: true,
  accessMode: true,
  isActive: true,
  sortOrder: true,
} as const;

/**
 * SATU kueri untuk seluruh dashboard, lalu dikelompokkan di memori.
 *
 * Mengambil per group saat akordeonnya dibuka akan lebih hemat, tetapi
 * menuntut endpoint atau server action tersendiri beserta keadaan
 * memuatnya. Pada aplikasi satu pemilik dengan puluhan group berisi
 * belasan item, seluruhnya beberapa ratus baris tanpa kolom besar —
 * fileKey pun tidak ikut terbaca. Kesederhanaannya menang.
 */
export async function listItemsForDashboard(): Promise<Record<string, ItemListEntry[]>> {
  const rows = await prisma.item.findMany({
    orderBy: [{ groupId: "asc" }, { sortOrder: "asc" }],
    select: { ...LIST_SELECT, groupId: true },
  });

  const grouped: Record<string, ItemListEntry[]> = {};
  for (const { groupId, ...item } of rows) {
    (grouped[groupId] ??= []).push(item);
  }
  return grouped;
}

export type InsertItemInput = {
  groupId: string;
  title: string;
  description: string | null;
  type: ItemType;
  source: ItemSource;
  accessMode: AccessMode;
  targetUrl?: string | null;
  fileKey?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
  sizeBytes?: number | null;
};

/**
 * Item baru duduk di DASAR daftar, berbeda dari group yang duduk di
 * puncak. Pemilik mengisi sebuah group dari atas ke bawah mengikuti
 * jalannya acara — absensi, rundown, materi — sehingga menyisipkan item
 * terbaru di puncak justru melawan urutan yang sedang ia bangun.
 */
export async function insertItem(input: InsertItemInput): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const count = await tx.item.count({ where: { groupId: input.groupId } });
    await tx.item.create({ data: { ...input, sortOrder: count } });
  });
}

export async function updateItemMetadata(input: {
  id: string;
  title: string;
  description: string | null;
  accessMode: AccessMode;
}): Promise<void> {
  await prisma.item.update({
    where: { id: input.id },
    data: {
      title: input.title,
      description: input.description,
      accessMode: input.accessMode,
    },
  });
}

export async function setItemActive(id: string, isActive: boolean): Promise<void> {
  await prisma.item.update({ where: { id }, data: { isActive } });
}

/**
 * Menghapus baris lalu MENGEMBALIKAN fileKey-nya, supaya pemanggil dapat
 * menghapus berkasnya sesudah itu.
 *
 * Urutannya disengaja: baris dulu, berkas sesudah. Setiap jalur menuju
 * konten berangkat dari baris Item, jadi begitu baris ini hilang
 * berkasnya sudah tidak terjangkau meski langkah berikutnya gagal
 * seluruhnya. Kebalikannya — berkas dulu — menukar sampah yang tidak
 * terlihat dengan item rusak yang terlihat.
 *
 * Mengembalikan null bila barisnya memang sudah tidak ada, atau bila ia
 * bersumber EXTERNAL dan tidak punya berkas.
 */
export async function deleteItemReturningFileKey(id: string): Promise<string | null> {
  return prisma.$transaction(async (tx) => {
    const item = await tx.item.findUnique({
      where: { id },
      select: { fileKey: true, groupId: true },
    });
    if (item === null) return null;

    await tx.item.delete({ where: { id } });

    const remaining = await tx.item.findMany({
      where: { groupId: item.groupId },
      orderBy: { sortOrder: "asc" },
      select: { id: true },
    });
    // Berurutan, bukan Promise.all: transaksi interaktif Prisma memakai
    // satu koneksi, dan menembakkan pembaruan serentak ke dalamnya adalah
    // sumber kebuntuan yang muncul hanya sesekali.
    for (const entry of renumber(remaining)) {
      await tx.item.update({ where: { id: entry.id }, data: { sortOrder: entry.sortOrder } });
    }

    return item.fileKey;
  });
}

/**
 * Menerima urutan lengkap, bukan satu pemindahan, sehingga geser dan
 * tombol naik/turun memakai satu jalur yang sama.
 *
 * Harganya adalah risiko daftar basi: dua tab terbuka, atau satu
 * penghapusan yang mendahului, membuat klien mengirim urutan yang tidak
 * lagi menggambarkan keadaan. Ditutup dengan membandingkan HIMPUNAN id di
 * dalam transaksi — beda sedikit pun berarti daftar itu sudah basi, dan
 * pembatalan diam-diam lebih baik daripada menimpa urutan yang benar
 * dengan urutan yang usang.
 */
export async function reorderItemsInTransaction(
  groupId: string,
  orderedIds: string[],
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const current = await tx.item.findMany({ where: { groupId }, select: { id: true } });

    if (current.length !== orderedIds.length) return;
    if (new Set(orderedIds).size !== orderedIds.length) return;

    const currentIds = new Set(current.map((item) => item.id));
    if (!orderedIds.every((id) => currentIds.has(id))) return;

    for (const [index, id] of orderedIds.entries()) {
      await tx.item.update({ where: { id }, data: { sortOrder: index } });
    }
  });
}
```

- [ ] **Step 6: Jalankan keempat gerbang**

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

Expected: keempatnya keluar dengan kode 0. `lint` harus bersih **tanpa peringatan** — impor yang tidak terpakai akan tertangkap di sini bila Step 5 dilewatkan.

- [ ] **Step 7: Commit**

```bash
git add lib/types/item.ts lib/types/item-action.ts lib/db/items.ts lib/db/groups.ts lib/auth/session.ts
git commit -m "feat(db): kueri item, dengan fileKey ditahan di sisi server

LIST_SELECT tidak memuat fileKey. Itu satu-satunya alasan invarian 3
dapat diperiksa dengan membaca sepuluh baris alih-alih menelusuri setiap
komponen dashboard.

Penghapusan mengembalikan fileKey supaya pemanggil menghapus berkasnya
SESUDAH barisnya hilang. Keterjangkauan dipikul baris, bukan berkas; arah
sebaliknya menukar sampah tak terlihat dengan item rusak yang terlihat.

Penyusunan ulang menerima urutan lengkap supaya geser dan tombol memakai
satu jalur, dan membandingkan himpunan id di dalam transaksi supaya
daftar basi membatalkan diri alih-alih menimpa urutan yang benar.

getOwnerSession ditambahkan karena requireOwner mengalihkan, dan fetch
mengikuti pengalihan diam-diam — sesi yang mati akan terbaca sebagai
unggahan yang berhasil."
```

---
## Task 8: Route handler unggahan

**Files:**
- Create: `app/api/groups/[groupId]/items/route.ts`
- Create: `lib/storage/limits.ts`

**Interfaces:**
- Consumes: `getOwnerSession` (Task 7), `groupExists` (Task 7), `insertItem` (Task 7), `uploadItemFieldsSchema` (Task 6), `detectFileType`/`itemTypeFor` (Task 3), `buildBlobPath` (Task 4), `putFile`/`deleteFile` (Task 5)
- Produces:
  - `MAX_UPLOAD_BYTES = 4 * 1024 * 1024` dari `lib/storage/limits.ts`
  - `MAX_FILE_NAME_LENGTH = 255` dari `lib/storage/limits.ts`
  - Endpoint `POST /api/groups/{groupId}/items` menerima `multipart/form-data` bermedan `title`, `description`, `accessMode`, `file`; sukses `201 { ok: true }`; gagal `{ error: { code, message } }`

- [ ] **Step 1: Tulis `lib/storage/limits.ts`**

Berdiri terpisah dari route handler supaya komponen klien dapat mengimpornya untuk pesan dan atribut `accept` tanpa ikut menarik `server-only` maupun SDK.

```ts
import { ACCEPTED_MIME_TYPES } from "@/lib/storage/detect-file-type";

/**
 * 4 MB, bukan 10 MB. Batas badan permintaan Vercel Functions adalah
 * 4,5 MB di tingkat infrastruktur dan tidak dapat dinaikkan lewat
 * konfigurasi apa pun; permintaan yang melebihinya mati dengan
 * 413 FUNCTION_PAYLOAD_TOO_LARGE sebelum satu baris kode ini berjalan.
 * Alasan lengkapnya ada di architecture.md bagian Storage Model.
 */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

/** Nama berkas unggahan dipotong sebelum disimpan; ia label, bukan kunci. */
export const MAX_FILE_NAME_LENGTH = 255;

/**
 * Untuk atribut `accept` pada kontrol berkas. Ia SEMATA kenyamanan
 * peramban dan bukan penegakan apa pun — dialog berkas dapat disetel
 * "Semua berkas", dan permintaan dapat disusun tanpa peramban sama
 * sekali. Yang menegakkan adalah detectFileType() di server.
 */
export const ACCEPT_ATTRIBUTE = ACCEPTED_MIME_TYPES.join(",");
```

- [ ] **Step 2: Tulis route handler**

`app/api/groups/[groupId]/items/route.ts`:

```ts
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { DASHBOARD_PATH, getOwnerSession } from "@/lib/auth/session";
import { groupExists } from "@/lib/db/groups";
import { insertItem } from "@/lib/db/items";
import { putFile, deleteFile } from "@/lib/storage/blob";
import { buildBlobPath } from "@/lib/storage/blob-path";
import { detectFileType, itemTypeFor } from "@/lib/storage/detect-file-type";
import { MAX_FILE_NAME_LENGTH, MAX_UPLOAD_BYTES } from "@/lib/storage/limits";
import { uploadItemFieldsSchema } from "@/lib/validation/item";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function failure(status: number, code: string, message: string): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status });
}

/**
 * Satu tanggung jawab: menambahkan SATU item bersumber UPLOAD ke sebuah
 * group. Berkas dan barisnya lahir dalam satu permintaan, atau tidak sama
 * sekali.
 *
 * Pola dua langkah — unggah dulu, lalu server action menautkan fileKey —
 * sengaja tidak dipakai: fileKey akan sampai ke klien, dan langkah kedua
 * akan mempercayai kepemilikan berkas yang dikirim dari klien. Keduanya
 * dilarang code-standards.md.
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ groupId: string }> },
): Promise<NextResponse> {
  if ((await getOwnerSession()) === null) {
    return failure(403, "FORBIDDEN", "Hanya pemilik yang dapat menambah item.");
  }

  // Penolakan MURAH lebih dulu. Header ini dikirim klien dan TIDAK
  // dipercaya sebagai penegakan — ia hanya menghemat pembacaan badan
  // permintaan yang sudah pasti ditolak. Penegakan yang mengikat ada di
  // pemeriksaan byteLength di bawah.
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > MAX_UPLOAD_BYTES) {
    return failure(413, "FILE_TOO_LARGE", "Ukuran berkas maksimal 4 MB.");
  }

  const { groupId } = await context.params;
  if (!(await groupExists(groupId))) {
    return failure(404, "NOT_FOUND", "Group tidak ditemukan.");
  }

  const formData = await request.formData();

  const fields = uploadItemFieldsSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    accessMode: formData.get("accessMode"),
  });
  if (!fields.success) {
    return failure(400, "INVALID_INPUT", fields.error.issues[0].message);
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return failure(400, "FILE_MISSING", "Pilih berkas yang akan diunggah.");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  // Penegakan yang MENGIKAT, atas ukuran sebenarnya.
  if (bytes.byteLength > MAX_UPLOAD_BYTES) {
    return failure(413, "FILE_TOO_LARGE", "Ukuran berkas maksimal 4 MB.");
  }

  // Dari ISI berkas. file.type dan ekstensi nama tidak pernah dibaca di
  // sepanjang berkas ini.
  const mimeType = detectFileType(bytes);
  if (mimeType === null) {
    return failure(
      415,
      "FILE_TYPE_REJECTED",
      "Hanya berkas PDF, PNG, JPEG, dan WebP yang diterima.",
    );
  }

  const fileKey = await putFile(buildBlobPath(groupId, mimeType), bytes, mimeType);

  try {
    await insertItem({
      groupId,
      title: fields.data.title,
      description: fields.data.description,
      type: itemTypeFor(mimeType),
      source: "UPLOAD",
      accessMode: fields.data.accessMode,
      fileKey,
      fileName: file.name.slice(0, MAX_FILE_NAME_LENGTH),
      mimeType,
      sizeBytes: bytes.byteLength,
    });
  } catch (error) {
    // Barisnya gagal lahir, jadi berkasnya tidak boleh hidup. Ini
    // satu-satunya tempat berkas dihapus SEBELUM barisnya — dan hanya
    // karena barisnya tidak pernah ada.
    //
    // Kegagalan penghapusan ditelan: yang penting adalah galat aslinya
    // sampai ke pemanggil, bukan galat pembersihan yang menutupinya.
    await deleteFile(fileKey).catch((cleanupError: unknown) => {
      console.error("Gagal menghapus berkas yatim setelah insert gagal", cleanupError);
    });
    throw error;
  }

  revalidatePath(DASHBOARD_PATH);
  // Respons sukses TIDAK memuat fileKey, dan tidak akan pernah.
  return NextResponse.json({ ok: true }, { status: 201 });
}
```

- [ ] **Step 3: Jalankan keempat gerbang**

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

Expected: keempatnya keluar dengan kode 0.

- [ ] **Step 4: Buktikan penjaga peran menolak permintaan tanpa sesi**

Jalankan server pengembangan di terminal terpisah dengan `npm run dev`, lalu:

```bash
curl -i -X POST http://localhost:3000/api/groups/apa-saja/items -F "title=Uji" -F "accessMode=OPEN"
```

Expected: `HTTP/1.1 403 Forbidden` dan badan `{"error":{"code":"FORBIDDEN","message":"Hanya pemilik yang dapat menambah item."}}`. **Bukan** 307 dan **bukan** halaman HTML — kalau yang muncul pengalihan, `getOwnerSession` tidak terpakai dan `requireOwner` tersisip.

- [ ] **Step 5: Commit**

```bash
git add app/api/groups lib/storage/limits.ts
git commit -m "feat(api): route handler unggahan item, memeriksa byte sebelum menyimpan

Urutannya ukuran, lalu magic bytes, lalu putFile, lalu sisip baris. Tidak
satu byte pun mendarat di object storage sebelum ukuran dan isinya lolos.
Gagal menyisip berarti berkasnya dihapus di blok catch — satu-satunya
tempat berkas dihapus sebelum barisnya, dan hanya karena barisnya tidak
pernah ada.

Batas ditegakkan dua kali: header Content-Length sebagai penolakan murah,
lalu byteLength sebenarnya sebagai penegakan yang mengikat. Header itu
dikirim klien dan tidak dipercaya.

Peran diperiksa dengan getOwnerSession yang mengembalikan 403 JSON, bukan
requireOwner yang mengalihkan: fetch mengikuti pengalihan diam-diam, dan
sesi yang mati akan terbaca sebagai unggahan yang berhasil.

Respons sukses tidak memuat fileKey."
```

---

## Task 9: Server action item dan sapuan berkas saat group dihapus

**Files:**
- Create: `app/(dashboard)/dashboard/item-actions.ts`
- Modify: `app/(dashboard)/dashboard/actions.ts` — `deleteGroupAction`

**Interfaces:**
- Consumes: seluruh keluaran Task 5, Task 6, dan Task 7
- Produces:
  - `createExternalItemAction(prev: ItemActionState, formData: FormData): Promise<ItemActionState>`
  - `updateItemAction(prev: ItemActionState, formData: FormData): Promise<ItemActionState>`
  - `setItemActiveAction(formData: FormData): Promise<void>`
  - `deleteItemAction(formData: FormData): Promise<void>`
  - `reorderItemsAction(groupId: string, orderedIds: string[]): Promise<void>`

- [ ] **Step 1: Tulis `app/(dashboard)/dashboard/item-actions.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";

import { DASHBOARD_PATH, requireOwner } from "@/lib/auth/session";
import { groupExists } from "@/lib/db/groups";
import {
  deleteItemReturningFileKey,
  insertItem,
  reorderItemsInTransaction,
  setItemActive,
  updateItemMetadata,
} from "@/lib/db/items";
import { isRecordNotFoundError } from "@/lib/db/prisma-errors";
import { deleteFile } from "@/lib/storage/blob";
import type { ItemActionState } from "@/lib/types/item-action";
import {
  externalItemFormSchema,
  itemActiveSchema,
  itemIdSchema,
  itemMetadataFormSchema,
  reorderItemsSchema,
} from "@/lib/validation/item";

const NOT_FOUND_STATE: ItemActionState = {
  status: "error",
  error: { code: "NOT_FOUND", message: "Item tidak ditemukan." },
};

/**
 * Memetakan issue pertama Zod ke medan yang tepat, sehingga pesannya
 * muncul di bawah kolom yang salah dan bukan sebagai spanduk umum.
 */
function toFieldError(path: PropertyKey | undefined, message: string): ItemActionState {
  const field =
    path === "title" || path === "description" || path === "targetUrl" ? path : undefined;
  return { status: "error", error: { code: "INVALID_INPUT", message }, field };
}

/**
 * Menghapus berkas SESUDAH barisnya hilang, dan menelan kegagalannya.
 *
 * Bentuknya sama dengan aturan email di code-standards.md, dan alasannya
 * sama: langkah kedua tidak lagi memikul keamanan. Berkas yatim bukan
 * lubang kontrol akses — setiap jalur menuju konten berangkat dari baris
 * Item, jadi tanpa baris tidak ada fileKey, tidak ada gerbang, tidak ada
 * rute. Ia sampah penyimpanan, dan sampah itu masih dapat disapu
 * belakangan lewat awalan group-nya.
 */
async function discardFile(fileKey: string | null): Promise<void> {
  if (fileKey === null) return;
  try {
    await deleteFile(fileKey);
  } catch (error) {
    console.error("Gagal menghapus berkas di object storage", { fileKey, error });
  }
}

export async function createExternalItemAction(
  _prev: ItemActionState,
  formData: FormData,
): Promise<ItemActionState> {
  // Layout TIDAK melindungi server action: badan aksi berjalan sebelum
  // layout dirender ulang. Setiap aksi memanggil gerbangnya sendiri.
  await requireOwner();

  const groupIdResult = itemIdSchema.safeParse(formData.get("groupId"));
  if (!groupIdResult.success) return NOT_FOUND_STATE;
  if (!(await groupExists(groupIdResult.data))) return NOT_FOUND_STATE;

  const parsed = externalItemFormSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    targetUrl: formData.get("targetUrl"),
    type: formData.get("type"),
    accessMode: formData.get("accessMode"),
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return toFieldError(issue.path[0], issue.message);
  }

  await insertItem({
    groupId: groupIdResult.data,
    title: parsed.data.title,
    description: parsed.data.description,
    type: parsed.data.type,
    source: "EXTERNAL",
    accessMode: parsed.data.accessMode,
    targetUrl: parsed.data.targetUrl,
  });

  revalidatePath(DASHBOARD_PATH);
  return { status: "ok" };
}

export async function updateItemAction(
  _prev: ItemActionState,
  formData: FormData,
): Promise<ItemActionState> {
  await requireOwner();

  const parsed = itemMetadataFormSchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    accessMode: formData.get("accessMode"),
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    if (issue.path[0] === "id") return NOT_FOUND_STATE;
    return toFieldError(issue.path[0], issue.message);
  }

  try {
    await updateItemMetadata(parsed.data);
  } catch (error) {
    if (isRecordNotFoundError(error)) return NOT_FOUND_STATE;
    throw error;
  }

  revalidatePath(DASHBOARD_PATH);
  return { status: "ok" };
}

export async function setItemActiveAction(formData: FormData): Promise<void> {
  await requireOwner();

  const idResult = itemIdSchema.safeParse(formData.get("id"));
  const activeResult = itemActiveSchema.safeParse(formData.get("isActive"));
  // Keadaan yang tidak dapat diuraikan berarti BATAL, bukan jatuh ke
  // cabang permisif terakhir. Menonaktifkan item adalah satu-satunya
  // saklar keamanan di unit ini, dan menebak arahnya berarti kadang
  // menyalakan kembali item yang sengaja dimatikan pemilik.
  if (!idResult.success || !activeResult.success) return;

  try {
    await setItemActive(idResult.data, activeResult.data);
  } catch (error) {
    if (isRecordNotFoundError(error)) return;
    throw error;
  }

  revalidatePath(DASHBOARD_PATH);
}

export async function deleteItemAction(formData: FormData): Promise<void> {
  await requireOwner();

  const idResult = itemIdSchema.safeParse(formData.get("id"));
  if (!idResult.success) return;

  const fileKey = await deleteItemReturningFileKey(idResult.data);
  await discardFile(fileKey);

  revalidatePath(DASHBOARD_PATH);
}

/**
 * Menerima urutan lengkap, bukan satu pemindahan, sehingga geser dan
 * tombol naik/turun memakai jalur yang sama. Argumen bertipe alih-alih
 * FormData karena yang diseberangkan memang sebuah larik, dan
 * memaksanya menjadi string yang dipisah koma hanya menambah satu
 * penguraian yang bisa salah.
 */
export async function reorderItemsAction(
  groupId: string,
  orderedIds: string[],
): Promise<void> {
  await requireOwner();

  const parsed = reorderItemsSchema.safeParse({ groupId, orderedIds });
  if (!parsed.success) return;

  await reorderItemsInTransaction(parsed.data.groupId, parsed.data.orderedIds);
  revalidatePath(DASHBOARD_PATH);
}
```

- [ ] **Step 2: Sapu berkas group di `deleteGroupAction`**

Di `app/(dashboard)/dashboard/actions.ts`, tambahkan dua impor:

```ts
import { deleteFilesByPrefix } from "@/lib/storage/blob";
import { groupBlobPrefix } from "@/lib/storage/blob-path";
```

lalu ganti badan `deleteGroupAction` seluruhnya:

```ts
export async function deleteGroupAction(formData: FormData): Promise<void> {
  await requireOwner();

  const idResult = groupIdSchema.safeParse(formData.get("id"));
  if (!idResult.success) return;

  try {
    await deleteGroupById(idResult.data);
  } catch (error) {
    // Group sudah terhapus (kirim-ganda dialog, atau dua tab terbuka):
    // no-op, bukan galat.
    if (isRecordNotFoundError(error)) return;
    throw error;
  }

  // SETELAH transaksi commit, bukan di dalamnya. Menahan transaksi basis
  // data terbuka selama panggilan jaringan ke object storage adalah pola
  // yang sudah dilarang code-standards.md untuk email, dan alasannya
  // sama.
  //
  // Menyapu lewat awalan, bukan melingkar di atas fileKey yang terbaca
  // dari baris: cascade Prisma sudah menghapus baris Item di dalam
  // basis data tanpa kode ini pernah melihatnya, dan sapuan awalan
  // sekaligus membersihkan berkas yatim dari kegagalan sebelumnya.
  try {
    await deleteFilesByPrefix(groupBlobPrefix(idResult.data));
  } catch (error) {
    console.error("Gagal menyapu berkas group di object storage", {
      groupId: idResult.data,
      error,
    });
  }

  revalidatePath(DASHBOARD_PATH);
}
```

- [ ] **Step 3: Jalankan keempat gerbang**

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

Expected: keempatnya keluar dengan kode 0.

- [ ] **Step 4: Commit**

```bash
git add "app/(dashboard)/dashboard/item-actions.ts" "app/(dashboard)/dashboard/actions.ts"
git commit -m "feat(dashboard): server action item dan sapuan berkas saat group dihapus

Item EXTERNAL tidak punya berkas, jadi ia mutasi biasa lewat server
action — persis bunyi aturan di code-standards.md, dan mewarisi pola
useActionState Unit 2. Hanya unggahan yang memakai route handler.

Penghapusan berkas terjadi SESUDAH barisnya hilang dan kegagalannya
ditelan ke log server. Berkas yatim bukan lubang kontrol akses: setiap
jalur menuju konten berangkat dari baris Item.

Penghapusan group menyapu lewat awalan, setelah transaksi commit. Cascade
Prisma menghapus baris Item di dalam basis data tanpa kode ini pernah
melihat fileKey-nya, jadi melingkar di atas baris tidak mungkin; sapuan
awalan sekaligus membersihkan yatim dari kegagalan sebelumnya."
```

---
## Task 10: Kartu item dan daftar baca-saja di dalam akordeon

Item dirender lebih dulu, sebelum ada satu pun cara menambahkannya lewat antarmuka. Deliverable task ini dapat diperiksa dengan menyisipkan satu baris lewat `npm run db:studio`, dan itu memisahkan "kartunya benar" dari "formulirnya benar" menjadi dua penolakan yang berbeda bagi peninjau.

**Files:**
- Create: `components/dashboard/item-card.tsx`, `components/dashboard/item-empty-state.tsx`
- Modify: `app/(dashboard)/dashboard/page.tsx`
- Modify: `components/dashboard/group-list.tsx`

**Interfaces:**
- Consumes: `ItemListEntry` dan `listItemsForDashboard()` (Task 7)
- Produces:
  - `<ItemCard item={ItemListEntry}>{children}</ItemCard>`
  - `<ItemEmptyState />`
  - `GroupList` menerima prop baru `itemsByGroup: Record<string, ItemListEntry[]>`

- [ ] **Step 1: Tulis `components/dashboard/item-empty-state.tsx`**

```tsx
export function ItemEmptyState() {
  return (
    <p className="text-sm text-muted-foreground">
      Group ini belum berisi apa-apa. Tambah tautan, PDF, atau gambar.
    </p>
  );
}
```

Kalimatnya sengaja sama persis dengan yang sudah tampil di `group-list.tsx` sejak Unit 2. Ia dipindahkan ke komponennya sendiri, bukan ditulis ulang.

- [ ] **Step 2: Tulis `components/dashboard/item-card.tsx`**

```tsx
import type { ReactNode } from "react";
import { ExternalLink, FileText, Image as ImageIcon, Link as LinkIcon, Lock } from "lucide-react";

import type { ItemListEntry } from "@/lib/types/item";
import { cn } from "@/lib/utils";

const TYPE_ICONS = {
  LINK: LinkIcon,
  PDF: FileText,
  IMAGE: ImageIcon,
} as const;

/**
 * Bentuknya sama di dashboard dan di halaman publik nanti. Ikon tipe
 * duduk di REL BERLEBAR TETAP, sehingga seluruh judul lurus satu garis
 * sepanjang daftar — pada 8 sampai 20 item, keteraturan itulah yang
 * membuat daftar dapat dipindai sambil berdiri.
 *
 * Di lebar ponsel kartu melipat menjadi dua baris: ikon dengan judul dan
 * deskripsi di baris satu, penanda di baris dua. Tanpa lipatan itu
 * lencana memaksa judul membungkus buruk, dan ponsel adalah jalur
 * pemakaian yang paling sering terjadi.
 *
 * Item OPEN TIDAK berlencana sama sekali. Ketiadaan itu bermakna, dan
 * menambahkan lencana "Terbuka" akan menghapus maknanya.
 */
export function ItemCard({
  item,
  children,
}: {
  item: ItemListEntry;
  children?: ReactNode;
}) {
  const TypeIcon = TYPE_ICONS[item.type];

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-xl border border-border bg-card p-3",
        "sm:flex-row sm:items-center sm:gap-3",
        !item.isActive && "opacity-60",
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
          <TypeIcon className="h-5 w-5 text-muted-foreground" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-base font-medium" title={item.title}>
            {item.title}
          </span>
          {item.description !== null && (
            <span className="mt-0.5 block text-sm text-muted-foreground">{item.description}</span>
          )}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {item.accessMode === "IDENTITY" && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-sm text-primary">
            <Lock className="h-4 w-4" aria-hidden />
            Perlu masuk
          </span>
        )}
        {!item.isActive && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-0.5 text-sm text-muted-foreground">
            Nonaktif
          </span>
        )}
        {item.source === "EXTERNAL" && (
          // Glif kecil bernada redup, SENGAJA berkelas visual lain
          // daripada pil bergaris, supaya ia tidak terbaca sebagai
          // lencana keadaan.
          <ExternalLink className="h-4 w-4 text-muted-foreground" aria-label="Tautan ke luar" />
        )}
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Ambil item di `app/(dashboard)/dashboard/page.tsx`**

Tambahkan impor lalu turunkan sebagai prop:

```tsx
import { listItemsForDashboard } from "@/lib/db/items";
```

```tsx
  const [groups, itemsByGroup] = await Promise.all([
    listGroupsForDashboard(),
    listItemsForDashboard(),
  ]);

  return <GroupList groups={groups} itemsByGroup={itemsByGroup} now={new Date()} />;
```

- [ ] **Step 4: Render daftar item di dalam `AccordionContent`**

Di `components/dashboard/group-list.tsx`, tambahkan impor:

```tsx
import { ItemCard } from "@/components/dashboard/item-card";
import { ItemEmptyState } from "@/components/dashboard/item-empty-state";
import type { ItemListEntry } from "@/lib/types/item";
```

Ubah tanda tangan komponennya:

```tsx
export function GroupList({
  groups,
  itemsByGroup,
  now,
}: {
  groups: GroupListItem[];
  itemsByGroup: Record<string, ItemListEntry[]>;
  now: Date;
}) {
```

Lalu di dalam `AccordionContent`, ganti paragraf `<p className="text-sm text-muted-foreground">Group ini belum berisi apa-apa…</p>` dengan:

```tsx
                  {(itemsByGroup[group.id] ?? []).length === 0 ? (
                    <ItemEmptyState />
                  ) : (
                    <div className="flex flex-col gap-2">
                      {(itemsByGroup[group.id] ?? []).map((item) => (
                        <ItemCard key={item.id} item={item} />
                      ))}
                    </div>
                  )}
```

- [ ] **Step 5: Jalankan keempat gerbang**

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

Expected: keempatnya keluar dengan kode 0.

- [ ] **Step 6: Periksa di peramban dengan data sungguhan**

```bash
npm run db:studio
```

Di Prisma Studio, tambahkan tiga baris `Item` pada satu group yang sudah ada:

| title | type | source | targetUrl | accessMode | isActive | sortOrder |
| --- | --- | --- | --- | --- | --- | --- |
| Absensi | LINK | EXTERNAL | `https://contoh.com/absen` | OPEN | true | 0 |
| Rundown | PDF | EXTERNAL | `https://contoh.com/rundown` | IDENTITY | true | 1 |
| Materi lama | IMAGE | EXTERNAL | `https://contoh.com/materi` | OPEN | false | 2 |

Lalu `npm run dev`, buka `/dashboard`, buka akordeon group itu, dan pastikan:
- ketiga ikon tipe berbeda dan lurus satu garis
- hanya baris Rundown yang berlencana "Perlu masuk"
- baris Materi lama meredup dan berlencana "Nonaktif"
- ketiganya menampilkan glif `ExternalLink` di kanan
- **periksa di mode terang DAN gelap**
- **persempit jendela ke lebar ponsel** dan pastikan kartunya melipat menjadi dua baris tanpa judul yang membungkus buruk

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(dashboard): kartu item dan daftarnya di dalam akordeon

Dirender lebih dulu, sebelum ada cara menambahkannya lewat antarmuka,
supaya 'kartunya benar' dan 'formulirnya benar' menjadi dua penolakan
berbeda bagi peninjau.

Ikon tipe duduk di rel berlebar tetap sehingga judul lurus satu garis.
Item OPEN tidak berlencana sama sekali: ketiadaan itu bermakna, dan
lencana 'Terbuka' justru akan menghapus maknanya. Glif ExternalLink
sengaja berkelas visual lain daripada pil bergaris supaya tidak terbaca
sebagai lencana keadaan.

Item seluruh dashboard diambil dalam satu kueri lalu dikelompokkan di
memori; fileKey tidak ikut terbaca."
```

---

## Task 11: Formulir tambah item

**Files:**
- Create: `components/dashboard/item-access-mode-field.tsx`, `components/dashboard/item-external-form.tsx`, `components/dashboard/item-upload-form.tsx`, `components/dashboard/item-add-panel.tsx`
- Modify: `components/dashboard/group-list.tsx`

**Interfaces:**
- Consumes: `createExternalItemAction` (Task 9), endpoint `POST /api/groups/{groupId}/items` (Task 8), `MAX_UPLOAD_BYTES` dan `ACCEPT_ATTRIBUTE` (Task 8), `EMPTY_ITEM_ACTION_STATE` (Task 7)
- Produces:
  - `<ItemAddPanel groupId={string} onDone={() => void} />`
  - `<ItemAccessModeField id={string} defaultValue?={string} />`

- [ ] **Step 1: Tulis `components/dashboard/item-access-mode-field.tsx`**

Berdiri sebagai berkasnya sendiri sejak awal: ia dipakai tiga formulir — tambah eksternal, unggah, dan sunting.

```tsx
"use client";

/**
 * APPROVAL TIDAK ADA di sini, dan itu hanya separuh penegakannya —
 * separuh lainnya ada di itemAccessModeSchema, yang menolaknya di batas
 * sistem. Menyembunyikan pilihan saja tidak dihitung sebagai kontrol
 * akses; fitur yang belum jadi tidak boleh berarti pintu yang terbuka.
 *
 * Saat Unit 7 membukanya, tambahkan opsinya di sini, tambahkan
 * "APPROVAL" di skema Zod, dan tambahkan peringatan untuk item bersumber
 * EXTERNAL — ketiganya dalam perubahan yang sama.
 */
export function ItemAccessModeField({
  id,
  defaultValue = "OPEN",
}: {
  id: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="block text-sm text-muted-foreground" htmlFor={id}>
        Tingkat akses
      </label>
      <select
        id={id}
        name="accessMode"
        defaultValue={defaultValue}
        className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-base md:text-sm"
      >
        <option value="OPEN">Terbuka</option>
        <option value="IDENTITY">Perlu masuk</option>
      </select>
    </div>
  );
}
```

- [ ] **Step 2: Tulis `components/dashboard/item-external-form.tsx`**

```tsx
"use client";

import { useActionState, useEffect, useId, useState } from "react";

import { createExternalItemAction } from "@/app/(dashboard)/dashboard/item-actions";
import { ItemAccessModeField } from "@/components/dashboard/item-access-mode-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EMPTY_ITEM_ACTION_STATE, type ItemActionState } from "@/lib/types/item-action";

export function ItemExternalForm({
  groupId,
  onDone,
}: {
  groupId: string;
  onDone: () => void;
}) {
  // Id unik per instans: dua panel dapat terbuka bersamaan di dua group,
  // dan id DOM yang sama membuat <label htmlFor> keduanya resolve ke
  // input yang pertama.
  const uid = useId();
  const [state, formAction, pending] = useActionState<ItemActionState, FormData>(
    createExternalItemAction,
    EMPTY_ITEM_ACTION_STATE,
  );
  const [type, setType] = useState("LINK");

  // Di dalam efek, BUKAN di badan render — memanggil onDone() saat render
  // mengubah keadaan induk di tengah render anaknya.
  useEffect(() => {
    if (state.status === "ok") onDone();
  }, [state.status, onDone]);

  const error = state.status === "error" ? state : null;

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="groupId" value={groupId} />

      <div>
        <label className="block text-sm text-muted-foreground" htmlFor={`${uid}-title`}>
          Judul
        </label>
        <Input id={`${uid}-title`} name="title" autoFocus aria-invalid={error?.field === "title"} />
        {error?.field === "title" && (
          <p className="mt-1 text-sm text-state-error">{error.error.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm text-muted-foreground" htmlFor={`${uid}-url`}>
          Tautan
        </label>
        <Input
          id={`${uid}-url`}
          name="targetUrl"
          className="font-mono"
          placeholder="https://"
          aria-invalid={error?.field === "targetUrl"}
        />
        {error?.field === "targetUrl" && (
          <p className="mt-1 text-sm text-state-error">{error.error.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm text-muted-foreground" htmlFor={`${uid}-desc`}>
          Deskripsi <span className="text-muted-foreground">(opsional)</span>
        </label>
        <Textarea id={`${uid}-desc`} name="description" rows={2} />
        {error?.field === "description" && (
          <p className="mt-1 text-sm text-state-error">{error.error.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label className="block text-sm text-muted-foreground" htmlFor={`${uid}-type`}>
            Tipe
          </label>
          {/* Untuk sumber EXTERNAL, tipe hanya menentukan IKON. Sumber
              UPLOAD tidak punya kontrol ini sama sekali: tipenya
              diturunkan dari isi berkas. */}
          <select
            id={`${uid}-type`}
            name="type"
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-base md:text-sm"
          >
            <option value="LINK">Tautan</option>
            <option value="PDF">PDF</option>
            <option value="IMAGE">Gambar</option>
          </select>
        </div>
        <div className="flex-1">
          <ItemAccessModeField id={`${uid}-mode`} />
        </div>
      </div>

      {error !== null && error.field === undefined && (
        <p className="text-sm text-state-error">{error.error.message}</p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          Tambah item
        </Button>
        <Button type="button" variant="outline" onClick={onDone} disabled={pending}>
          Batal
        </Button>
      </div>
    </form>
  );
}
```

- [ ] **Step 3: Tulis `components/dashboard/item-upload-form.tsx`**

```tsx
"use client";

import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { ItemAccessModeField } from "@/components/dashboard/item-access-mode-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ACCEPT_ATTRIBUTE, MAX_UPLOAD_BYTES } from "@/lib/storage/limits";

/**
 * Satu-satunya formulir di CMS yang TIDAK memakai server action.
 * Unggahan berkas memakai route handler, dan itu ditetapkan
 * code-standards.md.
 *
 * Tidak ada pemilih tipe di sini. Untuk sumber UPLOAD, `type` diturunkan
 * dari isi berkas di server — sehingga tidak ada dua nilai yang dapat
 * saling menyimpang.
 */
export function ItemUploadForm({ groupId, onDone }: { groupId: string; onDone: () => void }) {
  const uid = useId();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const file = formData.get("file");

    // Penolakan dini semata KENYAMANAN: ia menghemat pengiriman 20 MB
    // yang sudah pasti gagal. Penegakannya ada di server, dan tetap ada
    // di sana meski pemeriksaan ini dilewati sepenuhnya.
    if (file instanceof File && file.size > MAX_UPLOAD_BYTES) {
      setMessage("Ukuran berkas maksimal 4 MB.");
      setPending(false);
      return;
    }

    try {
      const response = await fetch(`/api/groups/${groupId}/items`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const body: unknown = await response.json().catch(() => null);
        const detail =
          typeof body === "object" &&
          body !== null &&
          "error" in body &&
          typeof (body as { error: { message?: unknown } }).error?.message === "string"
            ? (body as { error: { message: string } }).error.message
            : "Unggahan gagal. Coba lagi.";
        setMessage(detail);
        return;
      }

      formRef.current?.reset();
      // Route handler sudah memanggil revalidatePath, tetapi halaman ini
      // dicapai lewat fetch, bukan navigasi — jadi hasilnya perlu ditarik.
      router.refresh();
      onDone();
    } catch {
      setMessage("Unggahan gagal. Periksa koneksi lalu coba lagi.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <label className="block text-sm text-muted-foreground" htmlFor={`${uid}-title`}>
          Judul
        </label>
        <Input id={`${uid}-title`} name="title" autoFocus required />
      </div>

      <div>
        <label className="block text-sm text-muted-foreground" htmlFor={`${uid}-file`}>
          Berkas
        </label>
        <Input id={`${uid}-file`} name="file" type="file" accept={ACCEPT_ATTRIBUTE} required />
        <p className="mt-1 text-sm text-muted-foreground">
          PDF, PNG, JPEG, atau WebP. Maksimal 4 MB.
        </p>
      </div>

      <div>
        <label className="block text-sm text-muted-foreground" htmlFor={`${uid}-desc`}>
          Deskripsi <span className="text-muted-foreground">(opsional)</span>
        </label>
        <Textarea id={`${uid}-desc`} name="description" rows={2} />
      </div>

      <ItemAccessModeField id={`${uid}-mode`} />

      {message !== null && <p className="text-sm text-state-error">{message}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Mengunggah…" : "Unggah item"}
        </Button>
        <Button type="button" variant="outline" onClick={onDone} disabled={pending}>
          Batal
        </Button>
      </div>
    </form>
  );
}
```

- [ ] **Step 4: Tulis `components/dashboard/item-add-panel.tsx`**

```tsx
"use client";

import { useState } from "react";

import { ItemExternalForm } from "@/components/dashboard/item-external-form";
import { ItemUploadForm } from "@/components/dashboard/item-upload-form";
import { cn } from "@/lib/utils";

type Source = "EXTERNAL" | "UPLOAD";

const TABS: { value: Source; label: string }[] = [
  { value: "EXTERNAL", label: "Tempel URL" },
  { value: "UPLOAD", label: "Unggah berkas" },
];

export function ItemAddPanel({ groupId, onDone }: { groupId: string; onDone: () => void }) {
  const [source, setSource] = useState<Source>("EXTERNAL");

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div role="tablist" aria-label="Sumber item" className="mb-4 flex gap-1 rounded-lg bg-muted p-1">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={source === tab.value}
            onClick={() => setSource(tab.value)}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-sm",
              source === tab.value
                ? "bg-card text-card-foreground shadow-sm"
                : "text-muted-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {source === "EXTERNAL" ? (
        <ItemExternalForm groupId={groupId} onDone={onDone} />
      ) : (
        <ItemUploadForm groupId={groupId} onDone={onDone} />
      )}
    </div>
  );
}
```

- [ ] **Step 5: Pasang tombol tambah item di `group-list.tsx`**

Tambahkan impor:

```tsx
import { ItemAddPanel } from "@/components/dashboard/item-add-panel";
```

Tambahkan keadaan di dalam komponen, di samping `editingId`:

```tsx
  const [addingToId, setAddingToId] = useState<string | null>(null);
```

Lalu di dalam `AccordionContent`, tepat setelah blok daftar item dari Task 10, sisipkan:

```tsx
                  {addingToId === group.id ? (
                    <div className="mt-3">
                      <ItemAddPanel groupId={group.id} onDone={() => setAddingToId(null)} />
                    </div>
                  ) : (
                    <div className="mt-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setAddingToId(group.id)}
                      >
                        <Plus className="h-4 w-4" aria-hidden />
                        Tambah item
                      </Button>
                    </div>
                  )}
```

- [ ] **Step 6: Jalankan keempat gerbang**

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

Expected: keempatnya keluar dengan kode 0.

- [ ] **Step 7: Periksa di peramban — jalur bahagia dan jalur penolakan**

`npm run dev`, buka `/dashboard`, buka satu group, tekan "Tambah item":

1. **Tempel URL** — isi judul "Absensi", tautan `contoh.com/absen` (**tanpa** `https://`), tipe Tautan, tingkat Terbuka. Kirim. Kartunya muncul. Periksa di Prisma Studio bahwa `targetUrl` tersimpan sebagai `https://contoh.com/absen`.
2. **Tempel URL yang berbahaya** — tautan `javascript:alert(1)`. Kirim. Muncul pesan "Tautan harus diawali http:// atau https://." di bawah kolom tautan, dan tidak ada baris baru di basis data.
3. **Unggah berkas** — unggah satu PDF di bawah 4 MB. Kartunya muncul berikon `FileText`.
4. **Unggah berkas yang berbohong** — salin sembarang gambar menjadi `palsu.pdf` lewat penyalinan berkas biasa, lalu unggah. Muncul "Hanya berkas PDF, PNG, JPEG, dan WebP yang diterima." **hanya bila** isinya memang di luar keempat tipe; bila yang disalin adalah PNG, ia justru **diterima sebagai gambar** — itu perilaku yang benar dan sudah diputuskan. Untuk menguji penolakan, ganti nama sembarang `.zip` atau `.exe` menjadi `.pdf`.
5. Periksa **mode terang dan gelap**, dan **lebar ponsel**.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(dashboard): formulir tambah item untuk kedua sumber

Sakelar Tempel URL dan Unggah berkas. EXTERNAL memakai server action dan
useActionState dengan galat per-medan seperti Unit 2; UPLOAD memakai
fetch multipart ke route handler, dan itu satu-satunya formulir CMS yang
tidak memakai server action.

Formulir unggah TIDAK punya pemilih tipe: untuk sumber UPLOAD, type
diturunkan dari isi berkas di server, sehingga tidak ada dua nilai yang
dapat saling menyimpang.

Pemeriksaan ukuran di klien semata kenyamanan — ia menghemat pengiriman
yang sudah pasti gagal, dan penegakannya tetap di server meski
pemeriksaan itu dilewati sepenuhnya. Hal yang sama berlaku untuk atribut
accept.

APPROVAL tidak ada di kontrol pilihan, dan itu hanya separuh
penegakannya; separuh lainnya menolaknya di skema Zod."
```

---
## Task 12: Penyusunan ulang dengan geser dan dengan tombol

Daftar item dipindahkan dari `group-list.tsx` ke komponennya sendiri di task ini. `group-list.tsx` sudah 200 baris lebih sejak Unit 2, dan menambahkan konteks seret ke dalamnya melanggar batas yang sama yang dijaga sepanjang proyek.

**Files:**
- Create: `components/dashboard/item-list.tsx`, `components/dashboard/item-reorder-buttons.tsx`
- Modify: `components/dashboard/group-list.tsx`

**Interfaces:**
- Consumes: `reorderItemsAction` (Task 9), `ItemCard` (Task 10), `ItemEmptyState` (Task 10), `moveInList` (Task 2)
- Produces:
  - `<ItemList groupId={string} items={ItemListEntry[]} />`
  - `<ItemReorderButtons title={string} index={number} total={number} onMove={(d: "up" | "down") => void} />`

- [ ] **Step 1: Tulis `components/dashboard/item-reorder-buttons.tsx`**

Bentuknya mengikuti `group-reorder-buttons.tsx` yang sudah ada, dengan satu perbedaan: ukurannya lebih kecil, karena ia duduk di dalam kartu dan bukan di baris akordeon.

```tsx
"use client";

import { ChevronDown, ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * ui-context.md mewajibkan alternatif papan ketik bagi geser berupa
 * TOMBOL NAIK DAN TURUN — bukan sensor papan ketik pustaka seret. Karena
 * itu tombol ini bukan cadangan: ia jalur yang setara, dan ia yang
 * membuat penyusunan ulang dapat diselesaikan tanpa menyentuh tetikus.
 *
 * Tombol di tepi DISEMBUNYIKAN, bukan diabukan — kontrol nonaktif yang
 * tetap terlihat sebagai tombol hanya mengundang ketukan yang gagal.
 */
export function ItemReorderButtons({
  title,
  index,
  total,
  onMove,
}: {
  title: string;
  index: number;
  total: number;
  onMove: (direction: "up" | "down") => void;
}) {
  return (
    <span className="flex shrink-0 items-center gap-1">
      {index > 0 && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          aria-label={`Naikkan urutan ${title}`}
          onClick={() => onMove("up")}
        >
          <ChevronUp className="h-4 w-4" aria-hidden />
        </Button>
      )}
      {index < total - 1 && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          aria-label={`Turunkan urutan ${title}`}
          onClick={() => onMove("down")}
        >
          <ChevronDown className="h-4 w-4" aria-hidden />
        </Button>
      )}
    </span>
  );
}
```

- [ ] **Step 2: Tulis `components/dashboard/item-list.tsx`**

```tsx
"use client";

import { useOptimistic, useTransition } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

import { reorderItemsAction } from "@/app/(dashboard)/dashboard/item-actions";
import { ItemCard } from "@/components/dashboard/item-card";
import { ItemEmptyState } from "@/components/dashboard/item-empty-state";
import { ItemReorderButtons } from "@/components/dashboard/item-reorder-buttons";
import { moveInList } from "@/lib/order/move";
import type { ItemListEntry } from "@/lib/types/item";

/**
 * Pegangan seret TERPISAH dari badan kartu. Menjadikan seluruh kartu
 * dapat diseret akan menelan klik pada saklar nonaktif dan pada tombol
 * naik/turun yang duduk di dalamnya.
 */
function SortableItemRow({
  item,
  index,
  total,
  onMove,
}: {
  item: ItemListEntry;
  index: number;
  total: number;
  onMove: (direction: "up" | "down") => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? "relative z-10 opacity-80" : undefined}
    >
      <ItemCard item={item}>
        <ItemReorderButtons title={item.title} index={index} total={total} onMove={onMove} />
        <button
          type="button"
          className="flex h-8 w-8 shrink-0 cursor-grab items-center justify-center rounded-md text-muted-foreground"
          aria-label={`Seret untuk memindahkan ${item.title}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" aria-hidden />
        </button>
      </ItemCard>
    </div>
  );
}

export function ItemList({ groupId, items }: { groupId: string; items: ItemListEntry[] }) {
  const [, startTransition] = useTransition();
  const [order, applyOrder] = useOptimistic(
    items,
    (_current: ItemListEntry[], next: ItemListEntry[]) => next,
  );

  // Jarak aktivasi 8 piksel: tanpa itu, setiap klik pada pegangan
  // terhitung sebagai seret sepanjang nol piksel, dan tombol di
  // sekitarnya berhenti dapat ditekan di perangkat sentuh.
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  function commit(next: ItemListEntry[]) {
    startTransition(async () => {
      applyOrder(next);
      await reorderItemsAction(
        groupId,
        next.map((item) => item.id),
      );
    });
  }

  function handleMove(id: string, direction: "up" | "down") {
    commit(moveInList(order, id, direction));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over === null || active.id === over.id) return;

    const from = order.findIndex((item) => item.id === active.id);
    const to = order.findIndex((item) => item.id === over.id);
    if (from === -1 || to === -1) return;

    const next = [...order];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    commit(next);
  }

  if (order.length === 0) return <ItemEmptyState />;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={order.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {order.map((item, index) => (
            <SortableItemRow
              key={item.id}
              item={item}
              index={index}
              total={order.length}
              onMove={(direction) => handleMove(item.id, direction)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
```

- [ ] **Step 3: Pakai `ItemList` di `group-list.tsx`**

Ganti impor `ItemCard` dan `ItemEmptyState` dengan:

```tsx
import { ItemList } from "@/components/dashboard/item-list";
```

lalu ganti blok daftar item dari Task 10 Step 5 dengan satu baris:

```tsx
                  <ItemList groupId={group.id} items={itemsByGroup[group.id] ?? []} />
```

- [ ] **Step 4: Jalankan keempat gerbang**

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

Expected: keempatnya keluar dengan kode 0.

- [ ] **Step 5: Periksa kedua jalur penyusunan ulang di peramban**

`npm run dev`, buka satu group berisi minimal tiga item:

1. **Geser** — seret pegangan item ketiga ke posisi pertama. Ia berpindah, dan urutannya bertahan setelah halaman dimuat ulang.
2. **Papan ketik** — tekan Tab sampai tombol "Naikkan urutan …" terfokus, tekan Enter. Item naik satu posisi. Ulangi dengan "Turunkan urutan …". **Seluruh penyusunan ulang harus dapat diselesaikan tanpa menyentuh tetikus sama sekali** — ini kewajiban `ui-context.md`, bukan pelengkap.
3. **Cincin fokus** terlihat di mode terang dan gelap.
4. **Sentuh** — persempit jendela ke lebar ponsel, aktifkan emulasi sentuh peramban, dan pastikan pegangan seret masih bekerja sementara tombol naik/turun tetap dapat ditekan.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(dashboard): susun ulang item dengan geser dan dengan tombol

Daftar item dipindahkan keluar dari group-list.tsx, yang sudah melewati
200 baris sejak Unit 2.

Tombol naik/turun bukan cadangan bagi geser: ui-context.md mewajibkan
alternatif papan ketik BERUPA TOMBOL, jadi sensor papan ketik dnd-kit
tidak dipakai dan penyusunan ulang harus dapat diselesaikan tanpa
menyentuh tetikus.

Pegangan seret terpisah dari badan kartu — kartu yang seluruhnya dapat
diseret akan menelan klik pada tombol di dalamnya. Jarak aktivasi 8
piksel supaya klik tidak terhitung sebagai seret sepanjang nol piksel.

Kedua jalur mengirim urutan LENGKAP ke satu server action yang sama, dan
action itu membandingkan himpunan id di dalam transaksi supaya daftar
basi membatalkan diri."
```

---

## Task 13: Menonaktifkan, menyunting, dan menghapus item

**Files:**
- Create: `components/dashboard/item-delete-dialog.tsx`, `components/dashboard/item-edit-form.tsx`, `components/dashboard/item-row-actions.tsx`
- Modify: `components/dashboard/item-list.tsx`

**Interfaces:**
- Consumes: `setItemActiveAction`, `deleteItemAction`, `updateItemAction` (Task 9)
- Produces:
  - `<ItemRowActions item={ItemListEntry} onEdit={() => void} />`
  - `<ItemDeleteDialog item={ItemListEntry} open={boolean} onOpenChange={(next: boolean) => void} />`
  - `<ItemEditForm item={ItemListEntry} onDone={() => void} />`

- [ ] **Step 1: Tulis `components/dashboard/item-delete-dialog.tsx`**

```tsx
"use client";

import { deleteItemAction } from "@/app/(dashboard)/dashboard/item-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ItemListEntry } from "@/lib/types/item";

/**
 * Menyebutkan akibat yang BERBEDA menurut sumbernya. Untuk item unggahan,
 * berkasnya ikut hilang dan tidak dapat dikembalikan; untuk item
 * eksternal, yang hilang hanya barisnya. Peringatan yang sama untuk dua
 * akibat yang berbeda akan berhenti dibaca.
 */
export function ItemDeleteDialog({
  item,
  open,
  onOpenChange,
}: {
  item: ItemListEntry;
  open: boolean;
  onOpenChange: (next: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>Hapus item ini?</DialogTitle>
          <DialogDescription>
            {item.source === "UPLOAD"
              ? `Item “${item.title}” beserta berkas ${item.fileName ?? "unggahannya"} akan dihapus permanen. Berkas yang sudah dihapus tidak dapat dikembalikan.`
              : `Item “${item.title}” akan dihapus permanen. Tautan tujuannya sendiri tidak ikut terpengaruh.`}{" "}
            Riwayat aksesnya tetap disimpan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" autoFocus onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <form action={deleteItemAction}>
            <input type="hidden" name="id" value={item.id} />
            <Button type="submit" variant="destructive">
              Hapus
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Tulis `components/dashboard/item-edit-form.tsx`**

```tsx
"use client";

import { useActionState, useEffect, useId } from "react";

import { updateItemAction } from "@/app/(dashboard)/dashboard/item-actions";
import { ItemAccessModeField } from "@/components/dashboard/item-access-mode-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EMPTY_ITEM_ACTION_STATE, type ItemActionState } from "@/lib/types/item-action";
import type { ItemListEntry } from "@/lib/types/item";

/**
 * Menyunting metadata saja: judul, deskripsi, dan tingkat akses.
 *
 * Mengganti BERKAS berada di luar lingkup Unit 3 dan itu disengaja.
 * Jalur ganti-berkas memikul bobot yang sama dengan jalur buat —
 * multipart kedua, magic bytes lagi, dan urutan tukar-lalu-hapus-yang-
 * lama beserta kegagalannya sendiri — demi kasus yang jarang. Untuk
 * mengganti berkas, pemilik menghapus item lalu menambahkannya lagi.
 */
export function ItemEditForm({ item, onDone }: { item: ItemListEntry; onDone: () => void }) {
  const uid = useId();
  const [state, formAction, pending] = useActionState<ItemActionState, FormData>(
    updateItemAction,
    EMPTY_ITEM_ACTION_STATE,
  );

  useEffect(() => {
    if (state.status === "ok") onDone();
  }, [state.status, onDone]);

  const error = state.status === "error" ? state : null;

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <input type="hidden" name="id" value={item.id} />

      <div>
        <label className="block text-sm text-muted-foreground" htmlFor={`${uid}-title`}>
          Judul
        </label>
        <Input
          id={`${uid}-title`}
          name="title"
          defaultValue={item.title}
          autoFocus
          aria-invalid={error?.field === "title"}
        />
        {error?.field === "title" && (
          <p className="mt-1 text-sm text-state-error">{error.error.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm text-muted-foreground" htmlFor={`${uid}-desc`}>
          Deskripsi <span className="text-muted-foreground">(opsional)</span>
        </label>
        <Textarea id={`${uid}-desc`} name="description" rows={2} defaultValue={item.description ?? ""} />
        {error?.field === "description" && (
          <p className="mt-1 text-sm text-state-error">{error.error.message}</p>
        )}
      </div>

      <ItemAccessModeField id={`${uid}-mode`} defaultValue={item.accessMode} />

      {item.source === "UPLOAD" && (
        <p className="text-sm text-muted-foreground">
          Berkas tidak dapat diganti di sini. Hapus item ini lalu tambahkan lagi dengan berkas
          yang baru.
        </p>
      )}

      {error !== null && error.field === undefined && (
        <p className="text-sm text-state-error">{error.error.message}</p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          Simpan
        </Button>
        <Button type="button" variant="outline" onClick={onDone} disabled={pending}>
          Batal
        </Button>
      </div>
    </form>
  );
}
```

- [ ] **Step 3: Tulis `components/dashboard/item-row-actions.tsx`**

```tsx
"use client";

import { useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { setItemActiveAction } from "@/app/(dashboard)/dashboard/item-actions";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { ItemListEntry } from "@/lib/types/item";

/**
 * Saklar nonaktif, sunting, dan hapus. Menonaktifkan BUKAN menghapus:
 * barisnya tinggal, urutannya tidak berubah, dan riwayat aksesnya tetap
 * merujuk item yang sama. Kartunya meredup di tempat alih-alih melompat
 * ke dasar daftar — pemilik menyusun urutan itu karena ada alasannya.
 */
export function ItemRowActions({
  item,
  onEdit,
  onDelete,
}: {
  item: ItemListEntry;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [pending, startTransition] = useTransition();

  function handleToggle(next: boolean) {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", item.id);
      formData.set("isActive", next ? "true" : "false");
      await setItemActiveAction(formData);
    });
  }

  return (
    <span className="flex shrink-0 items-center gap-2">
      <Switch
        checked={item.isActive}
        disabled={pending}
        aria-label={`Aktifkan ${item.title}`}
        onCheckedChange={handleToggle}
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-8 w-8"
        aria-label={`Ubah ${item.title}`}
        onClick={onEdit}
      >
        <Pencil className="h-4 w-4" aria-hidden />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-8 w-8 text-state-error"
        aria-label={`Hapus ${item.title}`}
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4" aria-hidden />
      </Button>
    </span>
  );
}
```

- [ ] **Step 4: Rangkai ketiganya di `item-list.tsx`**

Tambahkan impor:

```tsx
import { useState } from "react";

import { ItemDeleteDialog } from "@/components/dashboard/item-delete-dialog";
import { ItemEditForm } from "@/components/dashboard/item-edit-form";
import { ItemRowActions } from "@/components/dashboard/item-row-actions";
```

Tambahkan dua keadaan di dalam `ItemList`:

```tsx
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
```

Perluas `SortableItemRow` agar menerima dan meneruskan ketiganya. Ganti seluruh isi `<ItemCard>` di dalamnya menjadi:

```tsx
      <ItemCard item={item}>
        <ItemRowActions item={item} onEdit={onEdit} onDelete={onDelete} />
        <ItemReorderButtons title={item.title} index={index} total={total} onMove={onMove} />
        <button
          type="button"
          className="flex h-8 w-8 shrink-0 cursor-grab items-center justify-center rounded-md text-muted-foreground"
          aria-label={`Seret untuk memindahkan ${item.title}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" aria-hidden />
        </button>
      </ItemCard>
```

dengan tanda tangan komponen yang bertambah dua prop:

```tsx
function SortableItemRow({
  item,
  index,
  total,
  onMove,
  onEdit,
  onDelete,
}: {
  item: ItemListEntry;
  index: number;
  total: number;
  onMove: (direction: "up" | "down") => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
```

Lalu di dalam `order.map(...)`, ganti badannya menjadi:

```tsx
          {order.map((item, index) =>
            editingId === item.id ? (
              <ItemEditForm key={item.id} item={item} onDone={() => setEditingId(null)} />
            ) : (
              <div key={item.id}>
                <SortableItemRow
                  item={item}
                  index={index}
                  total={order.length}
                  onMove={(direction) => handleMove(item.id, direction)}
                  onEdit={() => setEditingId(item.id)}
                  onDelete={() => setDeletingId(item.id)}
                />
                {deletingId === item.id && (
                  <ItemDeleteDialog
                    item={item}
                    open
                    onOpenChange={(next) => setDeletingId(next ? item.id : null)}
                  />
                )}
              </div>
            ),
          )}
```

- [ ] **Step 5: Jalankan keempat gerbang**

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

Expected: keempatnya keluar dengan kode 0.

- [ ] **Step 6: Periksa ketiga tindakan di peramban**

1. **Nonaktifkan** satu item lewat saklarnya. Kartunya meredup, berlencana "Nonaktif", dan **tetap di posisinya**. Muat ulang halaman; keadaannya bertahan.
2. **Sunting** judul dan tingkat akses satu item. Ubah dari Terbuka menjadi Perlu masuk; lencana "Perlu masuk" muncul.
3. **Hapus item unggahan.** Sebelum menghapus, catat `fileKey`-nya lewat `npm run db:studio`. Setelah menghapus, buka dasbor Vercel Blob dan cari pathname itu — **berkasnya harus sudah tidak ada**. Ini exit criteria "Menghapus item juga menghapus berkasnya di Blob".
4. **Periksa mode terang dan gelap**, dan **lebar ponsel**.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(dashboard): nonaktifkan, sunting, dan hapus item

Menonaktifkan bukan menghapus: barisnya tinggal, urutannya tidak berubah,
dan riwayat aksesnya tetap merujuk item yang sama. Kartunya meredup di
tempat alih-alih melompat ke dasar daftar.

Menyunting mencakup judul, deskripsi, dan tingkat akses. Mengganti berkas
berada di luar lingkup Unit 3 dan formulirnya mengatakan itu apa adanya,
lengkap dengan jalan keluarnya.

Dialog hapus menyebutkan akibat yang berbeda menurut sumber item:
unggahan kehilangan berkasnya secara permanen, eksternal tidak. Peringatan
yang sama untuk dua akibat berbeda akan berhenti dibaca."
```

---

## Task 14: Verifikasi ujung ke ujung dan penutupan unit

**Files:**
- Modify: `context/progress-tracker.md`

**Interfaces:**
- Consumes: seluruh task sebelumnya
- Produces: catatan penutup Unit 3

- [ ] **Step 1: Jalankan keempat gerbang satu kali lagi, bersih**

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

Expected: keempatnya keluar dengan kode 0, `lint` **tanpa satu peringatan pun**, dan jumlah test bertambah dari 180 menjadi 224.

- [ ] **Step 2: Buktikan batas impor SDK, dengan pencarian di seluruh repo**

Ini exit criteria terakhir Fase 4, dan `ROADMAP.md` menuntutnya diverifikasi dengan pencarian, bukan dengan kepercayaan.

```bash
grep -rn "@vercel/blob" app components lib tests --include=*.ts --include=*.tsx
```

Expected: tepat **dua** baris — impor di `lib/storage/blob.ts`, dan komentar penjelas di berkas yang sama. Berkas pengujian batasnya tidak muncul, karena nama paketnya di sana disusun dari potongan.

- [ ] **Step 3: Buktikan batas 4 MB ditegakkan di SERVER, bukan di peramban**

Formulir menolak berkas besar lebih dulu di peramban, jadi pengujian ini **melewati formulir sepenuhnya** dan berbicara langsung ke endpoint.

`curl` tanpa sesi **tidak dapat dipakai di sini**: route handler memeriksa peran sebelum memeriksa ukuran, jadi permintaan tanpa sesi selalu berhenti di 403 dan tidak pernah menyentuh batas ukuran sama sekali. Pengujiannya harus dijalankan dari peramban yang **sudah masuk sebagai pemilik**, lewat konsol DevTools di `/dashboard`, sehingga kukinya ikut terkirim.

Ganti `GANTI_DENGAN_ID_GROUP` dengan id group sungguhan — salin dari `npm run db:studio`.

Sepuluh byte pertama membentuk penanda `%PDF-`, supaya yang diuji benar-benar batas ukuran dan bukan penolakan tipe:

```js
async function coba(ukuran) {
  const bytes = new Uint8Array(ukuran);
  bytes.set([0x25, 0x50, 0x44, 0x46, 0x2d], 0);
  const fd = new FormData();
  fd.set("title", `Uji ${ukuran} byte`);
  fd.set("accessMode", "OPEN");
  fd.set("file", new File([bytes], "besar.pdf"));
  const r = await fetch("/api/groups/GANTI_DENGAN_ID_GROUP/items", { method: "POST", body: fd });
  console.log(ukuran, r.status, await r.json());
}

await coba(4 * 1024 * 1024 + 1);
await coba(4 * 1024 * 1024);
```

Expected: panggilan pertama `413` dengan `{ error: { code: "FILE_TOO_LARGE", … } }`; panggilan kedua `201`. Batasnya **inklusif** — tepat 4 MB diterima, satu byte di atasnya ditolak.

Hapus item yang lahir dari panggilan kedua setelah selesai.

- [ ] **Step 4: Buktikan `APPROVAL` ditolak di batas sistem**

Dari konsol DevTools peramban yang sudah masuk sebagai pemilik:

```js
const fd = new FormData();
fd.set("title", "Coba approval");
fd.set("accessMode", "APPROVAL");
fd.set("file", new File([new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d])], "kecil.pdf"));
const r = await fetch("/api/groups/GANTI_DENGAN_ID_GROUP/items", { method: "POST", body: fd });
console.log(r.status, await r.json());
```

Expected: `400` dengan pesan Bahasa Indonesia. **Tidak boleh** 201, dan tidak boleh ada baris `Item` bernilai `APPROVAL` di basis data.

- [ ] **Step 5: Buktikan `fileKey` tidak pernah sampai ke peramban**

Buka `/dashboard`, buka akordeon group yang berisi item unggahan, lalu di DevTools tekan Ctrl+U untuk membuka source halaman dan cari:

- `fileKey` — nol kecocokan
- `blob.vercel-storage.com` — nol kecocokan
- potongan pathname `groups/` diikuti id group — nol kecocokan

Ini invarian 3 sebagaimana diperkuat di Task 1, dan satu-satunya cara memeriksanya adalah membaca HTML yang benar-benar terkirim.

- [ ] **Step 6: Jalankan skenario penutup Unit 3 dari awal**

Ini definisi "selesai" menurut `ai-workflow-rules.md`. Dari dashboard kosong:

1. Buat group baru bernama "Rapat Kerja".
2. Tambah item **Tempel URL**: judul "Absensi", tautan `contoh.com/absen`, tipe Tautan, Terbuka.
3. Tambah item **Unggah berkas**: judul "Rundown", satu PDF sungguhan di bawah 4 MB, Perlu masuk.
4. Tambah item **Tempel URL**: judul "Materi", tautan Google Drive mana pun, tipe Gambar, Terbuka.
5. Susun ulang ketiganya dengan **geser**, lalu susun ulang lagi dengan **tombol**.
6. Nonaktifkan satu item, lalu aktifkan kembali.
7. Muat ulang halaman dan pastikan seluruh keadaan bertahan.
8. Hapus group tersebut, lalu buka dasbor Vercel Blob dan pastikan tidak ada berkas tersisa di bawah `groups/{idGroupItu}/`.

- [ ] **Step 7: Perbarui `context/progress-tracker.md`**

Di bagian Current Phase, sisipkan sebagai butir terbaru:

```markdown
- **Unit 3 TUTUP, 26 Agustus 2026.** Empat belas task dieksekusi, keempat
  gerbang lulus. Keputusan yang diambil di sesi brainstorming dan tidak
  berasal dari file konteks sebelumnya:
  - **Batas unggahan turun dari 10 MB ke 4 MB.** Batas badan permintaan
    Vercel Functions adalah 4,5 MB di tingkat infrastruktur; angka lama
    tidak akan pernah tercapai di produksi. Unggahan langsung dari
    peramban ditolak sebagai alternatif, karena token Blob akan sampai ke
    klien dan berkas mendarat sebelum isinya diperiksa.
  - **Magic bytes ditulis sendiri**, bukan memakai pustaka pendeteksi.
    Daftar tipe yang diterima tepat empat dan beku; pendeteksi umum
    mengenali seratusan format sementara daftar putihnya tetap harus
    ditulis sendiri di atasnya.
  - **Pathname `groups/{groupId}/{acak}.{ext}`.** Awalan groupId dipilih
    supaya penghapusan group menjadi sapuan awalan yang dapat dibuktikan,
    bukan lingkaran best-effort di atas baris basis data.
  - **Penghapusan berjalan baris dulu, berkas sesudah**, dan kegagalan
    Blob ditelan ke log server. Berkas yatim bukan lubang kontrol akses.
  - **Mengganti berkas pada item yang sudah ada di luar lingkup.**
  - **`getFileStream()` ditunda ke Unit 4**, tempat konsumennya lahir.
  - `lib/groups/order.ts` dipindah ke `lib/order/move.ts` sebagai
    `moveInList` dan `renumber`, karena item memakainya juga.
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "docs: tutup Unit 3 dan catat keputusan yang tidak berasal dari file konteks

Ketujuh keputusan yang diambil di sesi brainstorming dicatat beserta
alasannya, supaya yang membaca berikutnya tidak menegosiasikannya ulang
dari nol — terutama batas 4 MB, yang tanpa catatan ini akan terbaca
sebagai kompromi sembarangan alih-alih batas platform."
```

---
