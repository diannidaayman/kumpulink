# Unit 5 — Panel Bagikan, kedaluwarsa, dan QR

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Memberi antarmuka kepada `visibility`, `expiresAt`, dan `shareEnabled` lewat panel Bagikan, menambahkan QR code SVG yang dibuat di server, dan membuat spanduk pratinjau pemilik menyebutkan sebab link mati.

**Architecture:** Seluruh logika yang dapat dimurnikan — penyusunan URL berbagi, konversi tanggal ke akhir hari WIT, penentuan sebab spanduk, pemasangan ukuran fisik pada SVG — hidup sebagai fungsi murni di `lib/`, karena proyek ini tidak memiliki database uji dan `vitest.config.mts` berjalan di environment `node` tanpa DOM. Panel Bagikan adalah `sheet` klien yang dipecah menjadi lima komponen kecil sejak awal. QR dilayani satu route handler di balik `getOwnerSession()`, dipakai pratinjau sekaligus unduhan.

**Tech Stack:** Next.js 15 App Router, TypeScript strict, Prisma + PostgreSQL, Auth.js v5, Zod, Tailwind + shadcn/ui, Vitest, paket `qrcode`.

**Spesifikasi:** `docs/superpowers/specs/2026-09-08-unit-5-panel-bagikan-design.md`. Baca lebih dulu. Keputusan U5-6 sampai U5-13 di sana adalah alasan di balik bentuk yang diminta plan ini, dan tidak dinegosiasikan ulang saat eksekusi.

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

### Catatan atas dua paragraf di atas — dibaca sebelum task pertama

Bagian Global Constraints di atas disalin **apa adanya** dari rencana Unit 1 atas permintaan pemilik. Dua paragraf di dalamnya adalah catatan sejarah Unit 1 dan **tidak menciptakan pekerjaan baru di Unit 5**:

- Skema Prisma sudah lengkap sejak Unit 1. Unit 5 **tidak menyentuh** `prisma/schema.prisma` dan tidak membuat migrasi.
- Kedua puluh komponen shadcn sudah terpasang. Unit 5 **tidak menjalankan `shadcn add`** untuk apa pun; `sheet`, `switch`, `radio-group`, `calendar`, dan `popover` sudah ada di `components/ui/`.

Bila sebuah task tampak menuntut salah satu dari keduanya, itu salah baca — berhenti dan laporkan.

### Tambahan khusus Unit 5

Lahir dari sesi brainstorming 8 September 2026 dan mengikat seluruh task di bawah:

- **`lib/access/evaluate-access.ts` tidak disentuh sama sekali.** Unit ini hanya memberi antarmuka kepada tiga kolom yang sudah dibaca evaluator sejak Unit 4. Tidak ada aturan izin baru, tidak ada baris matriks baru, tidak ada jalur baru menuju konten. Sebuah diff Unit 5 yang menyentuh berkas itu adalah tanda salah arah — berhenti dan laporkan.
- **Tidak ada penulisan `AccessLog` yang ditambah atau diubah.** `lib/audit/` tidak disentuh.
- **Domain adalah konstanta di kode, bukan variabel lingkungan.** `APP_ORIGIN = "https://diandiandian.web.id"`. Jangan menambah variabel lingkungan kedua belas, dan jangan membaca domain dari header permintaan. Alasannya keputusan U5-6.
- **Panel Bagikan dipecah menjadi lima komponen sejak awal**, bukan setelah membengkak. Satu berkas yang memuat saklar, kalender, clipboard, dan QR sekaligus menembus ambang ±200 baris sebelum selesai ditulis.
- **Tidak ada `toast`.** `components/ui/sonner.tsx` ada, tetapi `<Toaster />` belum pernah dipasang di layout mana pun. Pesan hasil ditampilkan sebaris di dalam panel, pola yang sama dengan `group-form-row.tsx`. Memasang provider global adalah pekerjaan unit lain.
- **Dua penyimpangan gaya yang disengaja, sudah disetujui, jangan dilaporkan sebagai temuan:**
  1. `share-qr-panel.tsx` memakai kelas `bg-white` untuk alas pratinjau QR, bukan token tema. QR wajib gelap-di-atas-terang di kedua mode; mengikuti tema akan membuatnya berhenti terpindai di mode gelap. Ini utilitas Tailwind, bukan nilai heksadesimal.
  2. Berkas yang sama memakai `<img>` dengan `eslint-disable-next-line @next/next/no-img-element` beserta alasannya. `next/image` menuntut `dangerouslyAllowSVG` di `next.config.ts`, yang melonggarkan pipeline gambar seluruh aplikasi demi satu pratinjau yang hanya dilihat pemilik.
- **Empat gerbang wajib hijau sebelum sebuah task dianggap selesai:** `npm run typecheck`, `npm run lint` (nol peringatan), `npm test`, dan — pada task terakhir — `npm run build`.
- Commit berbahasa Indonesia, bentuk conventional commit, diakhiri baris `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.

---

## Struktur berkas

**Dibuat:**

| Berkas | Tanggung jawab |
| --- | --- |
| `lib/groups/share-url.ts` | `APP_ORIGIN` dan `shareUrl()` — fungsi murni |
| `lib/time/expiry.ts` | Konversi tanggal ↔ instan akhir hari WIT — fungsi murni |
| `lib/groups/preview-reason.ts` | Sebab spanduk pratinjau pemilik — fungsi murni |
| `lib/groups/qr-svg.ts` | Pemasangan ukuran fisik pada keluaran SVG — fungsi murni |
| `lib/validation/share.ts` | Skema Zod panel Bagikan |
| `lib/types/share-action.ts` | `ShareActionState` dan keadaan awalnya |
| `app/(dashboard)/dashboard/share-actions.ts` | Dua server action |
| `app/api/groups/[groupId]/qr/route.ts` | QR SVG di balik `getOwnerSession()` |
| `components/dashboard/use-sheet-side.ts` | Sisi sheet: kanan di ≥640 px, bawah di bawahnya |
| `components/dashboard/share-sheet.tsx` | Cangkang sheet dan susunan isinya |
| `components/dashboard/share-enabled-switch.tsx` | Saklar yang menyimpan seketika |
| `components/dashboard/share-settings-form.tsx` | Tingkat akses + tanggal kedaluwarsa + Simpan |
| `components/dashboard/share-link-field.tsx` | URL mono dan tombol salin |
| `components/dashboard/share-qr-panel.tsx` | Pratinjau QR dan tombol unduh |
| `tests/groups/share-url.test.ts` | |
| `tests/time/expiry.test.ts` | |
| `tests/groups/preview-reason.test.ts` | |
| `tests/groups/qr-svg.test.ts` | |
| `tests/validation/share.test.ts` | |
| `tests/dashboard/share-actions-boundary.test.ts` | Setiap server action memanggil `requireOwner()` |
| `tests/api/qr-owner-boundary.test.ts` | Gerbang pemilik berdiri sebelum QR dibuat |

**Diubah:**

| Berkas | Perubahan |
| --- | --- |
| `context/ui-context.md` | Isi dan urutan panel Bagikan; dua varian spanduk |
| `context/architecture.md` | Semantik akhir hari WIT; `APP_ORIGIN`; alur panel dan route QR |
| `context/progress-tracker.md` | Keputusan U5-6..U5-13; Current Phase; Current Goal; Next Up |
| `components/public/owner-preview-banner.tsx` | Menerima prop `reason` dan `expiresAt` |
| `app/(public)/g/[slug]/page.tsx` | Menghitung sebab spanduk dan meneruskannya |
| `lib/db/groups.ts` | `setShareEnabled()` dan `updateGroupSharing()` |
| `components/dashboard/group-accordion-body.tsx` | Tombol "Bagikan" dan pemasangan sheet |
| `package.json` | Dependensi `qrcode` dan `@types/qrcode` |

**Sengaja TIDAK dibuat:** `readGroupSharing()` yang disebut spesifikasi. `GroupListItem` sudah memuat `visibility`, `shareEnabled`, dan `expiresAt`, sehingga panel mendapat ketiganya dari prop yang sudah mengalir; route QR hanya butuh slug dan memakai `getGroupSlugById()` yang sudah ada. Menambah kueri yang tidak dipanggil siapa pun melanggar YAGNI.

---

### Task 1: File konteks lebih dulu

`ai-workflow-rules.md` menuntut kebutuhan yang ambigu diselesaikan di file konteks **sebelum** diimplementasikan. Task ini tidak memuat kode dan tidak memuat pengujian; deliverable-nya adalah dua file konteks yang sudah menyatakan perilaku yang akan dibangun sembilan task berikutnya.

**Files:**
- Modify: `context/ui-context.md`
- Modify: `context/architecture.md`

**Interfaces:**
- Consumes: tidak ada.
- Produces: teks normatif yang dirujuk Task 4, 6, 7, 8, dan 9. Nama yang dikunci di sini dan dipakai apa adanya nanti: `APP_ORIGIN`, `shareUrl()`, `endOfDayWIT()`, `resolvePreviewReason()`.

- [ ] **Step 1: Ganti butir panel Bagikan di `context/ui-context.md`**

Cari butir berikut (ada di bagian Layout Patterns, sekitar baris 296):

```markdown
- **Panel Bagikan** — `sheet` yang muncul dari kanan pada
  layar lebar, dan dari bawah pada ponsel. Berisi pilihan
  tingkat akses, tanggal kedaluwarsa, saklar aktif, URL
  yang dapat disalin, dan pratinjau QR code.
```

Ganti seluruhnya dengan:

```markdown
- **Panel Bagikan** — `sheet` yang muncul dari kanan pada
  layar lebar (≥640 px) dan dari bawah pada ponsel. Dibuka
  dari tombol **Bagikan** berikon `Share2` di badan akordeon,
  sebaris dengan "Ubah judul dan slug" dan "Hapus group".

  Urutan isinya dari atas, dan urutan ini bagian dari
  aturannya:

  1. **Saklar "Link berbagi aktif"** — menyimpan pada detik
     digeser, tanpa tombol dan tanpa dialog konfirmasi.
     Lingkup unit ini berbunyi mencabut link *seketika*;
     tombol simpan di antara saklar dan akibatnya membatalkan
     kata itu, dan panel yang tertutup tanpa ditekan simpan
     akan membuang pencabutan yang dikira sudah terjadi.
     Pencabutan dapat dibatalkan dengan menggeser balik, jadi
     konfirmasi hanya menambah satu ketukan pada satu-satunya
     tindakan darurat di panel ini.
  2. **Tingkat akses** — tiga pilihan `radio-group`. Pilihan
     Privat diberi baris penjelas **"Hanya Anda. Berguna saat
     group masih disiapkan."**
  3. **Tanggal kedaluwarsa** — `popover` berisi `calendar`,
     ditambah tombol **"Tanpa batas waktu"** untuk
     mengosongkannya. Tanggal terpilih ditampilkan monospasi
     berlabel WIT.
  4. **Tombol Simpan** — hanya untuk butir 2 dan 3. Keduanya
     sering diubah berbarengan saat menyiapkan acara, dan
     menyimpan tiap ketukan kalender menghasilkan tulisan
     basis data yang tidak diminta siapa pun.
  5. **URL berbagi** — monospasi, selalu terlihat dan dapat
     diseleksi, dengan tombol Salin di sebelahnya.
  6. **QR** — pratinjau persegi, tombol **"Unduh QR (SVG)"**,
     dan baris redup **"QR memuat alamat lengkap group ini.
     Mengubah slug membuat QR yang sudah dicetak berhenti
     berfungsi."**

  **Saklar dan tingkat akses adalah dua pekerjaan berbeda.**
  Saklar menjawab "hidup atau mati"; ketiga pilihan menjawab
  "siapa yang boleh membuka selama hidup". Ketika saklar mati,
  ketiga pilihan **tetap dapat diubah**, disertai keterangan
  bahwa setelan itu belum berlaku selama link mati. Mengunci
  pilihan akan memaksa pemilik menghidupkan link lebih dulu —
  termasuk beberapa detik ke publik — hanya untuk menyiapkan
  setelan acara yang belum ingin ia sebarkan.

  **URL dan QR tetap ditampilkan saat saklar mati.** Pemilik
  menyiapkan bahan acara sebelum menyebarkannya;
  menyembunyikannya memaksa link dihidupkan lebih dulu —
  persis yang tidak ingin ia lakukan.

  **Tombol Salin adalah jalan pintas, bukan satu-satunya
  jalan.** Ketika peramban menolak akses clipboard, teks URL
  diseleksi dan pesannya berbunyi **"Tidak dapat menyalin
  otomatis. Tekan Ctrl+C untuk menyalin."** Tidak ada
  kemunduran diam-diam ke `document.execCommand("copy")`:
  API itu usang dan pada sebagian peramban mengembalikan
  `true` tanpa menyalin apa pun, menghasilkan pesan berhasil
  yang berbohong.

  Ditetapkan 8 September 2026, keputusan U5-7, U5-11, dan
  U5-12.
```

- [ ] **Step 2: Tambahkan dua varian spanduk di `context/ui-context.md`**

Cari akhir butir **Spanduk pratinjau pemilik** — kalimat terakhirnya berbunyi `Tidak dapat ditutup.` Sisipkan tepat sesudah kalimat itu, di dalam butir yang sama:

```markdown

  **Teksnya membedakan sebab.** Aturan yang sama dengan
  lencana dashboard: nada mengikuti siapa penyebabnya.

  - Dicabut → "Link berbagi group ini Anda matikan. Hanya
    Anda yang dapat melihat halaman ini."
  - Kedaluwarsa → "Link berbagi group ini kedaluwarsa
    30 Sep 2026 WIT. Hanya Anda yang dapat melihat halaman
    ini." Tanggalnya diformat `formatDateWIT()`.

  Bila keduanya berlaku, saklar mati menang — urutan yang sama
  dengan lencana. Bentuk visualnya tidak berubah: satu spanduk,
  satu aksen peringatan, di kedua sebab.

  Sebabnya dihitung fungsi murni `resolvePreviewReason()` dari
  `shareEnabled` dan `expiresAt` yang sudah dibaca halaman.
  `evaluate-access.ts` tidak berubah dan `ownerPreview` tetap
  boolean: ini keputusan teks, bukan keputusan izin.
  Ditetapkan 8 September 2026, keputusan U5-13.
```

- [ ] **Step 3: Tambahkan semantik akhir hari WIT di `context/architecture.md`**

Cari tabel di bagian `### Group`, lalu paragraf sesudahnya yang diawali `Indeks pada `slug``. Sisipkan **sebelum** paragraf itu:

```markdown
**`expiresAt` disetel per tanggal dan mati pada akhir hari
WIT.** Pemilik memilih tanggal saja; nilai yang disimpan adalah
23:59:59.999 waktu `Asia/Jayapura` pada tanggal itu. Memilih
30 September berarti link hidup sepanjang 30 September dan mati
saat tanggal berganti — pembacaan yang sama dengan tanggal
kedaluwarsa pada umumnya.

Konversinya aritmetika tetap UTC+9 di `lib/time/expiry.ts`,
bukan pustaka zona waktu: `Asia/Jayapura` tidak pernah mengenal
DST, dan menambah dependensi untuk satu penjumlahan konstanta
tidak sebanding.

Aturan ini ikut mengikat `AccessRequest.expiresAt`, yang
diwarisi dari `group.expiresAt` saat izin disetujui.
Ditetapkan 8 September 2026, keputusan U5-8.
```

- [ ] **Step 4: Tambahkan alur panel dan route QR di `context/architecture.md`**

Sisipkan dua subbagian berikut di akhir bagian `## Request Flow` — tepat **sebelum** baris `## Invariants`:

```markdown
### Panel Bagikan — server action

Dua server action di `app/(dashboard)/dashboard/share-actions.ts`,
keduanya memanggil `requireOwner()` di baris pertama karena
layout tidak melindungi server action.

- `toggleShareAction(formData)` — menulis `shareEnabled` saja.
  Dipanggil langsung saat saklar digeser. Masukan yang tidak
  dapat diuraikan berarti batal diam-diam tanpa menulis, pola
  yang sama dengan `moveGroupAction`.
- `updateShareSettingsAction(prev, formData)` — menulis
  `visibility` dan `expiresAt` bersama-sama. `expiresOn` masuk
  sebagai string `YYYY-MM-DD` atau kosong; kosong berarti tanpa
  batas waktu, dan yang terisi dilewatkan `endOfDayWIT()`.

Keduanya ditutup `revalidatePath(DASHBOARD_PATH)` sehingga
lencana dan tanggal di baris akordeon ikut berubah tanpa muat
ulang.

### QR code — `GET /api/groups/[groupId]/qr`

Alamat di dalam QR memakai konstanta `APP_ORIGIN` di
`lib/groups/share-url.ts`, bukan variabel lingkungan dan bukan
header permintaan. Domain bukan rahasia, dan nilai yang ikut
masuk repositori terbaca mata di diff — menutup persis kegagalan
U5-1, ketika sepuluh variabel bertipe `Sensitive` tersimpan
kosong selama empat belas hari tanpa dapat dibaca siapa pun.
QR yang sudah dicetak tidak dapat ditarik kembali, jadi
alamatnya tidak boleh bergantung pada environment tempat ia
dirender.

Urutan handler-nya:

1. `getOwnerSession()`; `null` → 403 `{ error: { code, message } }`.
   Bukan `requireOwner()`: pemanggilnya memuat gambar, dan
   pengalihan yang diikuti diam-diam menghasilkan 200 berisi
   halaman masuk.
2. Validasi `groupId`; group tidak ada → 404 berbentuk sama.
3. `qrcode` merender SVG dengan `errorCorrectionLevel: "M"` dan
   `margin: 4` — 4 modul adalah quiet zone minimum spesifikasi
   QR, bukan selera.
4. `withPhysicalSize()` memasang `width="80mm" height="80mm"`
   dan mempertahankan `viewBox`. Jarak pindai kira-kira sepuluh
   kali lebar QR, jadi 8 cm terbaca dari sekitar 80 cm — jarak
   orang membaca kertas di meja rapat. SVG tetap vektor, jadi
   angka ini hanya ukuran bawaan saat ditempel.
5. `?unduh=1` → `Content-Disposition: attachment`; tanpa itu →
   `inline`, dipakai pratinjau di panel. `Cache-Control:
   no-store`, karena slug dapat berubah dan QR basi di layar
   akan disalin ke kertas.

QR tidak pernah disimpan sebagai berkas turunan di Blob:
berkas seperti itu wajib disapu dan dibuat ulang setiap slug
berubah, satu keadaan basi baru demi komputasi yang murah.
Ditetapkan 8 September 2026, keputusan U5-6, U5-9, dan U5-10.
```

- [ ] **Step 5: Verifikasi kedua file terbaca utuh**

Run: `npm run lint`
Expected: nol galat, nol peringatan (kedua berkas adalah Markdown; perintah ini memastikan tidak ada berkas kode yang tersenggol).

Run: `grep -c "U5-1[0-3]\|U5-[6-9]" context/ui-context.md context/architecture.md`
Expected: `context/ui-context.md:2` dan `context/architecture.md:2`.

- [ ] **Step 6: Commit**

```bash
git add context/ui-context.md context/architecture.md
git commit -m "docs(context): panel Bagikan, akhir hari WIT, dan route QR

Menuliskan perilaku Unit 5 ke file konteks SEBELUM
diimplementasikan, sesuai ai-workflow-rules.md.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: `lib/groups/share-url.ts`

**Files:**
- Create: `lib/groups/share-url.ts`
- Test: `tests/groups/share-url.test.ts`

**Interfaces:**
- Consumes: tidak ada.
- Produces: `APP_ORIGIN: string` dan `shareUrl(slug: string): string`. Dipakai Task 7 (route QR) dan Task 9 (kolom URL).

- [ ] **Step 1: Tulis pengujian yang gagal**

Buat `tests/groups/share-url.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { APP_ORIGIN, shareUrl } from "@/lib/groups/share-url";

describe("APP_ORIGIN", () => {
  it("adalah domain produksi tanpa garis miring di ujung", () => {
    expect(APP_ORIGIN).toBe("https://diandiandian.web.id");
  });

  it("memakai https", () => {
    expect(APP_ORIGIN.startsWith("https://")).toBe(true);
  });
});

describe("shareUrl", () => {
  it("menyusun URL absolut ke halaman group", () => {
    expect(shareUrl("rapat-kerja")).toBe("https://diandiandian.web.id/g/rapat-kerja");
  });

  // QR yang sudah dicetak tidak dapat ditarik kembali. Satu garis miring
  // ganda menghasilkan alamat yang tidak pernah sampai ke halaman mana pun.
  it("tidak pernah menghasilkan garis miring ganda", () => {
    expect(shareUrl("rapat-kerja")).not.toContain("//g/");
    expect(shareUrl("a")).not.toMatch(/([^:])\/\//);
  });

  it("dapat diurai sebagai URL yang sah", () => {
    const parsed = new URL(shareUrl("acara-2026"));
    expect(parsed.origin).toBe(APP_ORIGIN);
    expect(parsed.pathname).toBe("/g/acara-2026");
  });
});
```

- [ ] **Step 2: Jalankan dan pastikan gagal**

Run: `npx vitest run tests/groups/share-url.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/groups/share-url"`.

- [ ] **Step 3: Tulis implementasi minimal**

Buat `lib/groups/share-url.ts`:

```ts
/**
 * Domain hidup sebagai KONSTANTA di kode, bukan sebagai variabel
 * lingkungan. Keputusan U5-6.
 *
 * Alasannya kegagalan U5-1: sepuluh variabel tersimpan kosong di Vercel
 * selama empat belas hari tanpa dapat dibaca siapa pun, karena nilai
 * bertipe Sensitive memang tidak dapat dibaca ulang. Domain bukan
 * rahasia, dan nilai yang ikut masuk repositori terbaca mata di diff.
 *
 * QR yang sudah dicetak dan dibagikan tidak dapat ditarik kembali, jadi
 * alamat di dalamnya tidak boleh bergantung pada environment tempat ia
 * kebetulan dirender.
 */
export const APP_ORIGIN = "https://diandiandian.web.id";

export function shareUrl(slug: string): string {
  return `${APP_ORIGIN}/g/${slug}`;
}
```

- [ ] **Step 4: Jalankan dan pastikan lulus**

Run: `npx vitest run tests/groups/share-url.test.ts`
Expected: PASS, 5 pengujian.

- [ ] **Step 5: Gerbang**

Run: `npm run typecheck && npm run lint && npm test`
Expected: keluar 0, nol peringatan, seluruh berkas pengujian hijau.

- [ ] **Step 6: Commit**

```bash
git add lib/groups/share-url.ts tests/groups/share-url.test.ts
git commit -m "feat(groups): APP_ORIGIN dan shareUrl sebagai konstanta di kode

Keputusan U5-6. Domain tidak dibaca dari variabel lingkungan
maupun header permintaan: QR yang sudah dicetak tidak dapat
ditarik kembali.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: `lib/time/expiry.ts`

**Files:**
- Create: `lib/time/expiry.ts`
- Test: `tests/time/expiry.test.ts`

**Interfaces:**
- Consumes: tidak ada.
- Produces:
  - `WIT_UTC_OFFSET_MINUTES: number`
  - `isCalendarDate(value: string): boolean` — dipakai Task 5
  - `endOfDayWIT(isoDate: string): Date` — dipakai Task 6
  - `witDateParts(value: Date): string` — dipakai Task 8
  - `toCalendarDate(isoDate: string): Date` — dipakai Task 8
  - `fromCalendarDate(value: Date): string` — dipakai Task 8

- [ ] **Step 1: Tulis pengujian yang gagal**

Buat `tests/time/expiry.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  endOfDayWIT,
  fromCalendarDate,
  isCalendarDate,
  toCalendarDate,
  witDateParts,
} from "@/lib/time/expiry";

describe("isCalendarDate", () => {
  it("menerima tanggal yang benar-benar ada", () => {
    expect(isCalendarDate("2026-09-30")).toBe(true);
    expect(isCalendarDate("2024-02-29")).toBe(true);
  });

  it("menolak tanggal yang tidak ada di kalender", () => {
    expect(isCalendarDate("2026-02-31")).toBe(false);
    expect(isCalendarDate("2026-13-01")).toBe(false);
    expect(isCalendarDate("2025-02-29")).toBe(false);
  });

  it("menolak bentuk yang bukan YYYY-MM-DD", () => {
    expect(isCalendarDate("30-09-2026")).toBe(false);
    expect(isCalendarDate("2026-9-30")).toBe(false);
    expect(isCalendarDate("")).toBe(false);
  });
});

describe("endOfDayWIT", () => {
  // 23:59:59.999 di UTC+9 adalah 14:59:59.999 UTC pada tanggal yang sama.
  it("mengubah tanggal menjadi detik terakhir hari itu di Jayapura", () => {
    expect(endOfDayWIT("2026-09-30").toISOString()).toBe("2026-09-30T14:59:59.999Z");
  });

  it("membuat link hidup sepanjang tanggal yang dipilih", () => {
    const expiresAt = endOfDayWIT("2026-09-30");
    // 23:59 WIT tanggal 30 = 14:59 UTC. Masih hidup.
    expect(expiresAt.getTime() > new Date("2026-09-30T14:58:00Z").getTime()).toBe(true);
    // 00:01 WIT tanggal 1 Oktober = 15:01 UTC tanggal 30. Sudah mati.
    expect(expiresAt.getTime() <= new Date("2026-09-30T15:01:00Z").getTime()).toBe(true);
  });
});

describe("witDateParts", () => {
  it("membaca tanggal WIT dari sebuah instan", () => {
    expect(witDateParts(new Date("2026-09-30T14:59:59.999Z"))).toBe("2026-09-30");
  });

  // Sore hari UTC sudah menjadi hari berikutnya di Jayapura. Kalender yang
  // salah satu hari membuat pemilik menyetel mundur tanpa sadar.
  it("mengikuti hari Jayapura, bukan hari UTC", () => {
    expect(witDateParts(new Date("2026-09-30T16:00:00Z"))).toBe("2026-10-01");
  });

  it("kembali ke tanggal semula saat dibolak-balik", () => {
    expect(witDateParts(endOfDayWIT("2027-01-01"))).toBe("2027-01-01");
    expect(witDateParts(endOfDayWIT("2026-12-31"))).toBe("2026-12-31");
  });
});

describe("toCalendarDate dan fromCalendarDate", () => {
  it("kembali ke string semula saat dibolak-balik", () => {
    expect(fromCalendarDate(toCalendarDate("2026-09-30"))).toBe("2026-09-30");
    expect(fromCalendarDate(toCalendarDate("2026-01-05"))).toBe("2026-01-05");
  });

  it("menghasilkan tanggal lokal yang cocok dengan yang diminta", () => {
    const date = toCalendarDate("2026-09-30");
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(8);
    expect(date.getDate()).toBe(30);
  });

  it("memberi nol di depan pada bulan dan tanggal satu digit", () => {
    expect(fromCalendarDate(new Date(2026, 0, 5, 12, 0, 0))).toBe("2026-01-05");
  });
});
```

- [ ] **Step 2: Jalankan dan pastikan gagal**

Run: `npx vitest run tests/time/expiry.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/time/expiry"`.

- [ ] **Step 3: Tulis implementasi minimal**

Buat `lib/time/expiry.ts`:

```ts
/**
 * Konversi antara tanggal yang dipilih pemilik dan instan yang disimpan
 * `Group.expiresAt`. Keputusan U5-8.
 *
 * Aritmetika tetap UTC+9, bukan pustaka zona waktu: Asia/Jayapura tidak
 * pernah mengenal DST, sehingga offsetnya konstan sepanjang sejarahnya.
 * Menambah dependensi untuk satu penjumlahan konstanta tidak sebanding.
 */
export const WIT_UTC_OFFSET_MINUTES = 9 * 60;

const WIT_OFFSET_MS = WIT_UTC_OFFSET_MINUTES * 60_000;
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/**
 * Benar hanya bila tanggalnya BENAR-BENAR ADA. Pola saja tidak cukup:
 * "2026-02-31" lolos regex, dan Date akan menggesernya diam-diam menjadi
 * 3 Maret — pergeseran senyap adalah bentuk lain dari keadaan tidak pasti
 * yang meloloskan diri.
 */
export function isCalendarDate(value: string): boolean {
  const match = ISO_DATE_PATTERN.exec(value);
  if (match === null) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const rebuilt = new Date(Date.UTC(year, month - 1, day));

  return (
    rebuilt.getUTCFullYear() === year &&
    rebuilt.getUTCMonth() === month - 1 &&
    rebuilt.getUTCDate() === day
  );
}

/** "2026-09-30" -> instan 23:59:59.999 WIT pada tanggal itu. */
export function endOfDayWIT(isoDate: string): Date {
  const match = ISO_DATE_PATTERN.exec(isoDate);
  if (match === null || !isCalendarDate(isoDate)) {
    throw new Error(`Tanggal tidak dikenali: ${isoDate}`);
  }

  const asUtc = Date.UTC(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    23,
    59,
    59,
    999,
  );
  return new Date(asUtc - WIT_OFFSET_MS);
}

/** Instan -> tanggal yang terbaca di Jayapura, sebagai "YYYY-MM-DD". */
export function witDateParts(value: Date): string {
  const shifted = new Date(value.getTime() + WIT_OFFSET_MS);
  return `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}`;
}

/**
 * "YYYY-MM-DD" -> Date LOKAL untuk react-day-picker, yang bekerja dengan
 * tanggal lokal peramban. Tengah hari, bukan tengah malam: tengah malam
 * lokal berjarak nol dari batas hari, dan pergeseran offset sekecil apa
 * pun akan memindahkannya ke tanggal sebelahnya.
 */
export function toCalendarDate(isoDate: string): Date {
  const match = ISO_DATE_PATTERN.exec(isoDate);
  if (match === null) throw new Error(`Tanggal tidak dikenali: ${isoDate}`);
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12, 0, 0, 0);
}

/** Date lokal dari kalender -> "YYYY-MM-DD" apa adanya, tanpa geser zona. */
export function fromCalendarDate(value: Date): string {
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
}
```

- [ ] **Step 4: Jalankan dan pastikan lulus**

Run: `npx vitest run tests/time/expiry.test.ts`
Expected: PASS, 11 pengujian.

- [ ] **Step 5: Gerbang**

Run: `npm run typecheck && npm run lint && npm test`
Expected: keluar 0, nol peringatan, seluruh berkas pengujian hijau.

- [ ] **Step 6: Commit**

```bash
git add lib/time/expiry.ts tests/time/expiry.test.ts
git commit -m "feat(time): konversi tanggal ke akhir hari WIT

Keputusan U5-8. Tanggal yang dipilih pemilik hidup sepanjang
hari itu dan mati saat tanggal berganti di Jayapura.
isCalendarDate menolak tanggal yang tidak ada alih-alih
membiarkan Date menggesernya diam-diam.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: Sebab spanduk pratinjau pemilik

Task pertama yang menghasilkan perubahan terlihat. Setelah task ini, pemilik yang membuka group dicabut dan group kedaluwarsa membaca dua kalimat berbeda.

**Files:**
- Create: `lib/groups/preview-reason.ts`
- Test: `tests/groups/preview-reason.test.ts`
- Modify: `components/public/owner-preview-banner.tsx`
- Modify: `app/(public)/g/[slug]/page.tsx`

**Interfaces:**
- Consumes: `formatDateWIT()` dari `lib/time/format.ts` (sudah ada).
- Produces: `PreviewReason = "REVOKED" | "EXPIRED" | null` dan `resolvePreviewReason(group, now)`. Komponen `OwnerPreviewBanner` berubah tanda tangannya menjadi `{ reason: "REVOKED" | "EXPIRED"; expiresAt: Date | null }`.

- [ ] **Step 1: Tulis pengujian yang gagal**

Buat `tests/groups/preview-reason.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { resolvePreviewReason } from "@/lib/groups/preview-reason";

const NOW = new Date("2026-09-08T00:00:00Z");

describe("resolvePreviewReason", () => {
  it("menyebut REVOKED ketika saklar berbagi mati", () => {
    expect(resolvePreviewReason({ shareEnabled: false, expiresAt: null }, NOW)).toBe("REVOKED");
  });

  it("menyebut EXPIRED ketika tanggalnya sudah lewat", () => {
    expect(
      resolvePreviewReason(
        { shareEnabled: true, expiresAt: new Date("2026-09-07T00:00:00Z") },
        NOW,
      ),
    ).toBe("EXPIRED");
  });

  // Urutan yang SAMA dengan resolveGroupStatus: ketika saklarnya mati,
  // link-nya mati apa pun tanggalnya, dan keadaan yang sedang dipilih
  // pemilik lebih berguna dibaca daripada keadaan yang sudah tidak
  // berpengaruh.
  it("mendahulukan REVOKED ketika saklar mati DAN sudah kedaluwarsa", () => {
    expect(
      resolvePreviewReason(
        { shareEnabled: false, expiresAt: new Date("2026-09-07T00:00:00Z") },
        NOW,
      ),
    ).toBe("REVOKED");
  });

  it("mengembalikan null untuk group yang sehat", () => {
    expect(resolvePreviewReason({ shareEnabled: true, expiresAt: null }, NOW)).toBe(null);
    expect(
      resolvePreviewReason(
        { shareEnabled: true, expiresAt: new Date("2026-09-09T00:00:00Z") },
        NOW,
      ),
    ).toBe(null);
  });

  // Ambangnya `<=`, sama persis dengan isExpired() di evaluate-access.ts
  // dan resolveGroupStatus() di status.ts. Tiga tempat, satu ambang.
  it("menganggap tepat pada detiknya sudah kedaluwarsa", () => {
    expect(resolvePreviewReason({ shareEnabled: true, expiresAt: NOW }, NOW)).toBe("EXPIRED");
  });
});
```

- [ ] **Step 2: Jalankan dan pastikan gagal**

Run: `npx vitest run tests/groups/preview-reason.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/groups/preview-reason"`.

- [ ] **Step 3: Tulis implementasi minimal**

Buat `lib/groups/preview-reason.ts`:

```ts
export type PreviewReason = "REVOKED" | "EXPIRED";

export type PreviewReasonInput = {
  shareEnabled: boolean;
  expiresAt: Date | null;
};

/**
 * Sebab spanduk pratinjau pemilik. Keputusan U5-13.
 *
 * BUKAN keputusan izin: `evaluate-access.ts` sudah memutuskan bahwa
 * pemilik boleh masuk, dan `ownerPreview` sudah memberitahu bahwa
 * spanduknya harus muncul. Yang dijawab fungsi ini hanya kalimat mana
 * yang dibaca — itulah sebabnya ia berdiri di sini dan bukan di dalam
 * evaluator, yang matriksnya tidak perlu bertambah demi teks.
 *
 * Ambang `<=` dan urutan saklar-sebelum-tanggal sengaja sama dengan
 * `resolveGroupStatus()`. Yang dibagi hanyalah aturannya, bukan kodenya.
 */
export function resolvePreviewReason(
  group: PreviewReasonInput,
  now: Date,
): PreviewReason | null {
  if (!group.shareEnabled) return "REVOKED";
  if (group.expiresAt !== null && group.expiresAt.getTime() <= now.getTime()) {
    return "EXPIRED";
  }
  return null;
}
```

- [ ] **Step 4: Jalankan dan pastikan lulus**

Run: `npx vitest run tests/groups/preview-reason.test.ts`
Expected: PASS, 5 pengujian.

- [ ] **Step 5: Ubah spanduk agar menerima sebabnya**

Ganti seluruh isi `components/public/owner-preview-banner.tsx` dengan:

```tsx
import { Ban } from "lucide-react";

import type { PreviewReason } from "@/lib/groups/preview-reason";
import { formatDateWIT } from "@/lib/time/format";

/**
 * DI ATAS judul group, sehingga terbaca sebagai bingkai halaman dan bukan
 * sebagai item di dalamnya. Satu-satunya elemen di halaman ini yang
 * memakai aksen peringatan, dan sengaja dibuat LEBIH DATAR daripada
 * kartu item — tanpa bayangan, tanpa bobot tebal — supaya terbaca sebagai
 * chrome, bukan isi. Tidak dapat ditutup.
 *
 * Teksnya membedakan sebab, mengikuti aturan yang sudah berlaku pada
 * lencana dashboard: nada mengikuti siapa penyebabnya. Bentuk visualnya
 * tidak ikut berubah — satu spanduk, satu aksen, di kedua sebab.
 */
export function OwnerPreviewBanner({
  reason,
  expiresAt,
}: {
  reason: PreviewReason;
  expiresAt: Date | null;
}) {
  // expiresAt tidak pernah null saat reason EXPIRED — resolvePreviewReason
  // baru mengembalikannya setelah membaca tanggalnya. Cabang null tetap
  // ditulis karena tipenya mengizinkannya, dan kalimat tanpa tanggal lebih
  // baik daripada kalimat yang berakhir dengan spasi lalu titik.
  const kalimat =
    reason === "REVOKED"
      ? "Link berbagi group ini Anda matikan."
      : expiresAt === null
        ? "Link berbagi group ini sudah kedaluwarsa."
        : `Link berbagi group ini kedaluwarsa ${formatDateWIT(expiresAt)}.`;

  return (
    <div className="mb-6 flex items-start gap-3 border-l-4 border-[var(--state-warning)] bg-[var(--bg-elevated)] px-4 py-3">
      <Ban className="mt-0.5 h-4 w-4 shrink-0 text-[var(--state-warning)]" aria-hidden />
      <p className="text-sm">
        {kalimat} Hanya Anda yang dapat melihat halaman ini.
      </p>
    </div>
  );
}
```

- [ ] **Step 6: Hitung sebabnya di halaman group**

Di `app/(public)/g/[slug]/page.tsx`, tambahkan dua impor di antara impor yang sudah ada:

```tsx
import { resolvePreviewReason } from "@/lib/groups/preview-reason";
```

Ganti dua baris berikut:

```tsx
  const group = await readPublicGroup(slug);
  const decision = evaluateGroupAccess(
    group,
    session?.user ? { userId: session.user.id, role: session.user.role } : null,
    new Date(),
  );
```

menjadi:

```tsx
  // Satu instan untuk kedua keputusan. Dua panggilan new Date() akan
  // membuat evaluator dan spanduk membaca waktu yang berbeda, dan pada
  // detik pergantian keduanya bisa tidak sepakat.
  const now = new Date();
  const group = await readPublicGroup(slug);
  const decision = evaluateGroupAccess(
    group,
    session?.user ? { userId: session.user.id, role: session.user.role } : null,
    now,
  );
```

Lalu ganti baris pemasangan spanduk:

```tsx
      {decision.ownerPreview && <OwnerPreviewBanner />}
```

menjadi:

```tsx
      {previewReason !== null && (
        <OwnerPreviewBanner reason={previewReason} expiresAt={group.expiresAt} />
      )}
```

dan sisipkan perhitungannya tepat sebelum `return (`:

```tsx
  // decision.ownerPreview sudah memutuskan APAKAH spanduk muncul; fungsi
  // ini hanya memilih kalimatnya. Dijaga oleh syarat pertama supaya
  // pengunjung biasa tidak pernah sampai ke sini.
  const previewReason = decision.ownerPreview ? resolvePreviewReason(group, now) : null;
```

- [ ] **Step 7: Gerbang**

Run: `npm run typecheck && npm run lint && npm test`
Expected: keluar 0, nol peringatan, seluruh berkas pengujian hijau — termasuk `tests/public/no-target-url-boundary.test.ts` dan `tests/public/dynamic-rendering-boundary.test.ts` yang membaca berkas halaman ini.

- [ ] **Step 8: Commit**

```bash
git add lib/groups/preview-reason.ts tests/groups/preview-reason.test.ts components/public/owner-preview-banner.tsx "app/(public)/g/[slug]/page.tsx"
git commit -m "feat(public): spanduk pratinjau pemilik menyebut sebab link mati

Keputusan U5-13. Dicabut dan kedaluwarsa membaca kalimat
berbeda, mengikuti aturan nada-mengikuti-sebab yang sudah
berlaku pada lencana dashboard.

evaluate-access.ts tidak disentuh: ownerPreview tetap boolean,
dan sebabnya dihitung fungsi murni dari kolom yang sudah dibaca
halaman.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: `lib/validation/share.ts`

**Files:**
- Create: `lib/validation/share.ts`
- Test: `tests/validation/share.test.ts`

**Interfaces:**
- Consumes: `isCalendarDate()` dari Task 3.
- Produces: `visibilitySchema`, `expiresOnSchema`, `shareSettingsSchema`, `shareEnabledSchema`, dan tipe `ShareSettingsInput`. Dipakai Task 6.

- [ ] **Step 1: Tulis pengujian yang gagal**

Buat `tests/validation/share.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  shareEnabledSchema,
  shareSettingsSchema,
  visibilitySchema,
} from "@/lib/validation/share";

describe("visibilitySchema", () => {
  it.each(["PRIVATE", "REQUIRE_LOGIN", "PUBLIC"])("menerima %s", (value) => {
    expect(visibilitySchema.safeParse(value).success).toBe(true);
  });

  // Keadaan yang tidak pasti berarti MENOLAK. Nilai karangan tidak boleh
  // lolos menjadi tulisan basis data.
  it.each(["OPEN", "public", "", "SEMUA_ORANG"])("menolak %s", (value) => {
    expect(visibilitySchema.safeParse(value).success).toBe(false);
  });
});

describe("shareSettingsSchema", () => {
  it("menerima tanggal kosong sebagai tanpa batas waktu", () => {
    const parsed = shareSettingsSchema.safeParse({ visibility: "PUBLIC", expiresOn: "" });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.expiresOn).toBe("");
  });

  it("menerima tanggal yang benar", () => {
    const parsed = shareSettingsSchema.safeParse({
      visibility: "REQUIRE_LOGIN",
      expiresOn: "2026-09-30",
    });
    expect(parsed.success).toBe(true);
  });

  it("menolak tanggal yang tidak ada di kalender", () => {
    const parsed = shareSettingsSchema.safeParse({
      visibility: "PUBLIC",
      expiresOn: "2026-02-31",
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0].message).toBe("Tanggal kedaluwarsa tidak ada di kalender.");
    }
  });

  it("menolak bentuk tanggal yang tidak dikenali", () => {
    const parsed = shareSettingsSchema.safeParse({
      visibility: "PUBLIC",
      expiresOn: "30 September 2026",
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0].message).toBe("Tanggal kedaluwarsa tidak dikenali.");
    }
  });

  it("menolak nilai null yang datang dari FormData kosong", () => {
    expect(shareSettingsSchema.safeParse({ visibility: null, expiresOn: "" }).success).toBe(false);
  });
});

describe("shareEnabledSchema", () => {
  it("mengubah string menjadi boolean", () => {
    expect(shareEnabledSchema.parse("true")).toBe(true);
    expect(shareEnabledSchema.parse("false")).toBe(false);
  });

  // Bukan "selain 'true' berarti false": nilai yang tidak dikenali harus
  // membatalkan penulisan, bukan diam-diam mematikan link orang.
  it.each(["1", "on", "", "TRUE"])("menolak %s alih-alih menebak", (value) => {
    expect(shareEnabledSchema.safeParse(value).success).toBe(false);
  });
});
```

- [ ] **Step 2: Jalankan dan pastikan gagal**

Run: `npx vitest run tests/validation/share.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/validation/share"`.

- [ ] **Step 3: Tulis implementasi minimal**

Buat `lib/validation/share.ts`:

```ts
import { z } from "zod";

import { isCalendarDate } from "@/lib/time/expiry";

export const visibilitySchema = z.enum(["PRIVATE", "REQUIRE_LOGIN", "PUBLIC"]);

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Kosong BERARTI tanpa batas waktu, dan itu keadaan yang sah — bukan
 * kelalaian mengisi. Yang ditolak hanyalah tanggal yang tidak dapat
 * dibaca atau tidak ada di kalender.
 *
 * superRefine dipakai, bukan rantai .regex(), supaya tiap keadaan punya
 * SATU kalimat yang pasti dan urutan pelaporannya tidak bergantung pada
 * urutan internal Zod. Pola yang sama dengan lib/validation/group.ts.
 */
export const expiresOnSchema = z.string().trim().superRefine((value, ctx) => {
  if (value.length === 0) return;
  if (!ISO_DATE_PATTERN.test(value)) {
    ctx.addIssue({ code: "custom", message: "Tanggal kedaluwarsa tidak dikenali." });
    return;
  }
  if (!isCalendarDate(value)) {
    ctx.addIssue({ code: "custom", message: "Tanggal kedaluwarsa tidak ada di kalender." });
  }
});

export const shareSettingsSchema = z.object({
  visibility: visibilitySchema,
  expiresOn: expiresOnSchema,
});

export type ShareSettingsInput = z.infer<typeof shareSettingsSchema>;

/**
 * Dua nilai eksplisit, bukan "selain 'true' berarti false". Nilai yang
 * tidak dikenali membatalkan penulisan — mematikan link orang karena
 * salah baca satu string adalah kegagalan yang tidak terlihat sampai
 * seseorang mengeluh linknya mati.
 */
export const shareEnabledSchema = z
  .enum(["true", "false"])
  .transform((value) => value === "true");
```

- [ ] **Step 4: Jalankan dan pastikan lulus**

Run: `npx vitest run tests/validation/share.test.ts`
Expected: PASS, 17 pengujian.

- [ ] **Step 5: Gerbang**

Run: `npm run typecheck && npm run lint && npm test`
Expected: keluar 0, nol peringatan, seluruh berkas pengujian hijau.

- [ ] **Step 6: Commit**

```bash
git add lib/validation/share.ts tests/validation/share.test.ts
git commit -m "feat(validation): skema Zod panel Bagikan

Tanggal kosong berarti tanpa batas waktu; tanggal yang tidak
ada di kalender ditolak. Saklar menerima dua nilai eksplisit,
bukan menebak dari selain-true.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 6: Dua server action dan kueri penulisnya

**Files:**
- Create: `lib/types/share-action.ts`
- Create: `app/(dashboard)/dashboard/share-actions.ts`
- Modify: `lib/db/groups.ts`
- Test: `tests/dashboard/share-actions-boundary.test.ts`

**Interfaces:**
- Consumes: `endOfDayWIT()` (Task 3), `shareSettingsSchema` dan `shareEnabledSchema` (Task 5), `groupIdSchema` dari `lib/validation/group.ts` (sudah ada), `requireOwner` dan `DASHBOARD_PATH` dari `lib/auth/session.ts` (sudah ada).
- Produces:
  - `ShareActionState` dan `EMPTY_SHARE_ACTION_STATE` dari `lib/types/share-action.ts`
  - `toggleShareAction(formData: FormData): Promise<void>`
  - `updateShareSettingsAction(prev: ShareActionState, formData: FormData): Promise<ShareActionState>`
  - `setShareEnabled(id: string, enabled: boolean): Promise<void>`
  - `updateGroupSharing(input: { id: string; visibility: Visibility; expiresAt: Date | null }): Promise<void>`

  Dipakai Task 8.

- [ ] **Step 1: Tulis pengujian batas yang gagal**

Buat `tests/dashboard/share-actions-boundary.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const SOURCE = readFileSync("app/(dashboard)/dashboard/share-actions.ts", "utf8");

/**
 * Layout TIDAK melindungi server action: badan aksi berjalan sebelum
 * layout dirender ulang, sehingga tulisannya sudah terjadi sebelum
 * pengalihan sempat berlaku. Satu aksi yang lupa memanggil gerbangnya
 * sendiri adalah satu jalur menulis tanpa pemilik.
 */
describe("gerbang pemilik di share-actions.ts", () => {
  const segments = SOURCE.split("export async function").slice(1);

  it("menemukan kedua server action untuk diperiksa", () => {
    expect(segments).toHaveLength(2);
  });

  it.each(segments.map((segment) => [segment.split("(")[0].trim(), segment]))(
    "%s memanggil requireOwner()",
    (_name, segment) => {
      expect(segment).toContain("await requireOwner()");
    },
  );

  it("memanggil requireOwner sebelum menyentuh basis data", () => {
    for (const segment of segments) {
      const gate = segment.indexOf("await requireOwner()");
      const write = segment.search(/await (setShareEnabled|updateGroupSharing)\(/);
      expect(gate).toBeGreaterThanOrEqual(0);
      expect(write).toBeGreaterThan(gate);
    }
  });
});
```

- [ ] **Step 2: Jalankan dan pastikan gagal**

Run: `npx vitest run tests/dashboard/share-actions-boundary.test.ts`
Expected: FAIL — `ENOENT: no such file or directory, open 'app/(dashboard)/dashboard/share-actions.ts'`.

- [ ] **Step 3: Tambahkan dua kueri penulis di `lib/db/groups.ts`**

Tambahkan impor tipe di bagian atas berkas, di bawah impor yang sudah ada:

```ts
import type { Visibility } from "@prisma/client";
```

Lalu tambahkan dua fungsi berikut di akhir berkas:

```ts
/**
 * Satu kolom, satu tulisan. Dipanggil saat saklar digeser, dan disengaja
 * TIDAK digabung dengan updateGroupSharing(): pencabutan harus dapat
 * terjadi tanpa ikut menulis setelan lain yang mungkin sedang disunting
 * pemilik di formulir yang belum ia simpan.
 */
export async function setShareEnabled(id: string, enabled: boolean): Promise<void> {
  await prisma.group.update({ where: { id }, data: { shareEnabled: enabled } });
}

export async function updateGroupSharing(input: {
  id: string;
  visibility: Visibility;
  expiresAt: Date | null;
}): Promise<void> {
  await prisma.group.update({
    where: { id: input.id },
    data: { visibility: input.visibility, expiresAt: input.expiresAt },
  });
}
```

- [ ] **Step 4: Buat tipe keadaan aksi**

Buat `lib/types/share-action.ts`:

```ts
/**
 * Berdiri di luar share-actions.ts secara SENGAJA. Berkas bertanda
 * "use server" hanya boleh mengekspor fungsi async — mengekspor konstanta
 * dari sana menggagalkan build, bukan sekadar melanggar gaya. Alasan yang
 * sama dengan lib/types/group-action.ts.
 */
export type ShareActionState =
  | { status: "idle" }
  | { status: "ok" }
  | { status: "error"; error: { code: string; message: string } };

export const EMPTY_SHARE_ACTION_STATE: ShareActionState = { status: "idle" };
```

- [ ] **Step 5: Tulis kedua server action**

Buat `app/(dashboard)/dashboard/share-actions.ts`:

```ts
"use server";

import { revalidatePath } from "next/cache";

import { DASHBOARD_PATH, requireOwner } from "@/lib/auth/session";
import { setShareEnabled, updateGroupSharing } from "@/lib/db/groups";
import { endOfDayWIT } from "@/lib/time/expiry";
import type { ShareActionState } from "@/lib/types/share-action";
import { groupIdSchema } from "@/lib/validation/group";
import { shareEnabledSchema, shareSettingsSchema } from "@/lib/validation/share";

/**
 * Menyimpan pada detik saklar digeser, tanpa tombol simpan. Keputusan
 * U5-7: lingkup unit ini berbunyi mencabut link SEKETIKA, dan tombol di
 * antara saklar dan akibatnya membatalkan kata itu.
 *
 * Layout TIDAK melindungi server action: badan aksi berjalan sebelum
 * layout dirender ulang. Setiap aksi memanggil gerbangnya sendiri.
 */
export async function toggleShareAction(formData: FormData): Promise<void> {
  await requireOwner();

  const id = groupIdSchema.safeParse(formData.get("id"));
  const enabled = shareEnabledSchema.safeParse(formData.get("enabled"));
  // Keadaan yang tidak dapat diuraikan berarti TOLAK — batal diam-diam,
  // tanpa menulis. Pola yang sama dengan moveGroupAction.
  if (!id.success || !enabled.success) return;

  await setShareEnabled(id.data, enabled.data);
  revalidatePath(DASHBOARD_PATH);
}

export async function updateShareSettingsAction(
  _prev: ShareActionState,
  formData: FormData,
): Promise<ShareActionState> {
  await requireOwner();

  const id = groupIdSchema.safeParse(formData.get("id"));
  if (!id.success) {
    return { status: "error", error: { code: "NOT_FOUND", message: "Group tidak ditemukan." } };
  }

  const parsed = shareSettingsSchema.safeParse({
    visibility: formData.get("visibility"),
    expiresOn: formData.get("expiresOn") ?? "",
  });
  if (!parsed.success) {
    return {
      status: "error",
      error: { code: "INVALID_INPUT", message: parsed.error.issues[0].message },
    };
  }

  await updateGroupSharing({
    id: id.data,
    visibility: parsed.data.visibility,
    expiresAt: parsed.data.expiresOn === "" ? null : endOfDayWIT(parsed.data.expiresOn),
  });
  revalidatePath(DASHBOARD_PATH);

  return { status: "ok" };
}
```

- [ ] **Step 6: Jalankan dan pastikan lulus**

Run: `npx vitest run tests/dashboard/share-actions-boundary.test.ts`
Expected: PASS, 4 pengujian.

- [ ] **Step 7: Gerbang**

Run: `npm run typecheck && npm run lint && npm test`
Expected: keluar 0, nol peringatan, seluruh berkas pengujian hijau.

- [ ] **Step 8: Commit**

```bash
git add lib/types/share-action.ts "app/(dashboard)/dashboard/share-actions.ts" lib/db/groups.ts tests/dashboard/share-actions-boundary.test.ts
git commit -m "feat(dashboard): dua server action panel Bagikan

toggleShareAction menulis satu kolom dan dipanggil saat saklar
digeser; updateShareSettingsAction menulis visibility dan
expiresAt bersama-sama di balik satu tombol Simpan. Keputusan
U5-7.

Pengujian batas menjaga keduanya memanggil requireOwner()
sebelum menyentuh basis data.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 7: QR — dependensi, ukuran fisik, dan route handler

**Files:**
- Modify: `package.json` (lewat `npm install`)
- Create: `lib/groups/qr-svg.ts`
- Create: `app/api/groups/[groupId]/qr/route.ts`
- Test: `tests/groups/qr-svg.test.ts`
- Test: `tests/api/qr-owner-boundary.test.ts`

**Interfaces:**
- Consumes: `shareUrl()` (Task 2), `getOwnerSession` dari `lib/auth/session.ts`, `getGroupSlugById` dari `lib/db/groups.ts`, `groupIdSchema` dari `lib/validation/group.ts` — ketiganya sudah ada.
- Produces: `QR_PHYSICAL_SIZE: string`, `withPhysicalSize(svg: string): string`, dan rute `GET /api/groups/[groupId]/qr`. Dipakai Task 9.

- [ ] **Step 1: Pasang dependensi**

Run: `npm install qrcode && npm install --save-dev @types/qrcode`
Expected: keduanya masuk `package.json`; tidak ada peringatan modul native.

- [ ] **Step 2: Tulis pengujian yang gagal**

Buat `tests/groups/qr-svg.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { QR_PHYSICAL_SIZE, withPhysicalSize } from "@/lib/groups/qr-svg";

// Bentuk keluaran paket qrcode saat opsi width tidak diberikan: tanpa
// width, tanpa height, dengan viewBox.
const TANPA_UKURAN =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 33 33" shape-rendering="crispEdges"><path d="M0 0h33v33H0z"/></svg>';

const SUDAH_BERUKURAN =
  '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 33 33"><path d="M0 0h33v33H0z"/></svg>';

describe("QR_PHYSICAL_SIZE", () => {
  it("adalah 80mm", () => {
    expect(QR_PHYSICAL_SIZE).toBe("80mm");
  });
});

describe("withPhysicalSize", () => {
  it("memasang lebar dan tinggi dalam milimeter", () => {
    const hasil = withPhysicalSize(TANPA_UKURAN);
    expect(hasil).toContain('width="80mm"');
    expect(hasil).toContain('height="80mm"');
  });

  // viewBox adalah satu-satunya yang membuat SVG tetap dapat diskalakan.
  // Kehilangannya berarti QR yang dibesarkan menjadi poster ikut pecah.
  it("mempertahankan viewBox", () => {
    expect(withPhysicalSize(TANPA_UKURAN)).toContain('viewBox="0 0 33 33"');
  });

  it("mengganti ukuran piksel yang sudah ada, bukan menambah yang kedua", () => {
    const hasil = withPhysicalSize(SUDAH_BERUKURAN);
    expect(hasil).not.toContain('width="128"');
    expect(hasil).not.toContain('height="128"');
    expect(hasil.match(/width=/g)).toHaveLength(1);
    expect(hasil.match(/height=/g)).toHaveLength(1);
  });

  it("tidak menyentuh isi di dalam elemen", () => {
    expect(withPhysicalSize(TANPA_UKURAN)).toContain('<path d="M0 0h33v33H0z"/>');
  });

  // Keadaan yang tidak dikenali berarti MENOLAK, bukan mengembalikan
  // masukan apa adanya. QR tanpa ukuran yang lolos diam-diam akan
  // tertempel seukuran sembarang di dokumen orang.
  it("melempar bila masukannya bukan SVG", () => {
    expect(() => withPhysicalSize("bukan svg")).toThrow();
    expect(() => withPhysicalSize("")).toThrow();
  });
});
```

Buat `tests/api/qr-owner-boundary.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const SOURCE = readFileSync("app/api/groups/[groupId]/qr/route.ts", "utf8");

/**
 * Route handler tidak pernah dibungkus layout, sehingga gerbangnya harus
 * berdiri di dalam berkas ini. Ia juga harus berdiri SEBELUM QR dibuat:
 * membuat QR lebih dulu berarti alamat berbagi sudah tersusun di memori
 * sebuah permintaan yang seharusnya ditolak.
 */
describe("gerbang pemilik di route QR", () => {
  it("memakai getOwnerSession, bukan requireOwner", () => {
    // requireOwner mengalihkan, dan <img> mengikuti pengalihan diam-diam:
    // hasilnya 200 berisi halaman masuk, bukan kegagalan yang terbaca.
    //
    // Yang dicari adalah PANGGILAN `await requireOwner(`, bukan kata
    // "requireOwner" di mana pun — komentar berkas itu menyebut namanya
    // untuk menjelaskan kenapa ia justru tidak dipakai.
    expect(SOURCE).toContain("await getOwnerSession()");
    expect(SOURCE).not.toMatch(/await\s+requireOwner\s*\(/);
  });

  it("menempatkan gerbang sebelum QR dibuat", () => {
    const gate = SOURCE.indexOf("getOwnerSession()");
    const render = SOURCE.indexOf("QRCode.toString");
    expect(gate).toBeGreaterThanOrEqual(0);
    expect(render).toBeGreaterThan(gate);
  });

  it("dirender dinamis dan tidak pernah di-cache", () => {
    expect(SOURCE).toContain(`export const dynamic = "force-dynamic"`);
    expect(SOURCE).toContain("no-store");
  });
});
```

- [ ] **Step 3: Jalankan dan pastikan gagal**

Run: `npx vitest run tests/groups/qr-svg.test.ts tests/api/qr-owner-boundary.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/groups/qr-svg"` dan `ENOENT ... qr/route.ts`.

- [ ] **Step 4: Tulis pemasang ukuran**

Buat `lib/groups/qr-svg.ts`:

```ts
/**
 * Ukuran fisik pada berkas QR. Keputusan U5-9.
 *
 * Jarak pindai kira-kira SEPULUH KALI lebar QR, jadi 80 mm terbaca dari
 * sekitar 80 cm — jarak orang membaca kertas yang dipegang atau
 * tergeletak di meja rapat. Karena SVG tetap vektor, angka ini hanya
 * menentukan ukuran BAWAAN saat ditempel; membesarkannya menjadi poster
 * tidak merusak apa pun.
 */
export const QR_PHYSICAL_SIZE = "80mm";

const OPENING_TAG = /^<svg\b[^>]*>/;
const PIXEL_SIZE_ATTRS = /\s(?:width|height)="[^"]*"/g;

/**
 * Memasang ukuran fisik pada tag pembuka dan MEMPERTAHANKAN viewBox.
 * Melempar bila masukannya tidak dikenali: keluaran yang lolos tanpa
 * ukuran akan tertempel seukuran sembarang di dokumen orang, dan itu
 * kegagalan yang baru terlihat setelah dicetak.
 */
export function withPhysicalSize(svg: string): string {
  const match = OPENING_TAG.exec(svg);
  if (match === null) {
    throw new Error("Keluaran QR bukan SVG yang dikenali.");
  }

  const sized = match[0]
    .replace(PIXEL_SIZE_ATTRS, "")
    .replace(/^<svg/, `<svg width="${QR_PHYSICAL_SIZE}" height="${QR_PHYSICAL_SIZE}"`);

  return sized + svg.slice(match[0].length);
}
```

- [ ] **Step 5: Tulis route handler**

Buat `app/api/groups/[groupId]/qr/route.ts`:

```ts
import { NextResponse } from "next/server";
import QRCode from "qrcode";

import { getOwnerSession } from "@/lib/auth/session";
import { getGroupSlugById } from "@/lib/db/groups";
import { withPhysicalSize } from "@/lib/groups/qr-svg";
import { shareUrl } from "@/lib/groups/share-url";
import { groupIdSchema } from "@/lib/validation/group";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function failure(status: number, code: string, message: string): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status });
}

/**
 * Satu tanggung jawab: mengembalikan QR code satu group sebagai SVG.
 * Dipakai dua kali oleh panel Bagikan — sebagai pratinjau lewat <img>,
 * dan sebagai unduhan lewat <a download> dengan ?unduh=1. Keputusan U5-10.
 *
 * getOwnerSession(), bukan requireOwner(): pemanggilnya memuat gambar,
 * dan pengalihan yang diikuti diam-diam menghasilkan 200 berisi halaman
 * masuk alih-alih kegagalan yang terbaca.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ groupId: string }> },
): Promise<NextResponse> {
  if ((await getOwnerSession()) === null) {
    return failure(403, "FORBIDDEN", "Hanya pemilik yang dapat membuka QR code.");
  }

  const groupId = groupIdSchema.safeParse((await context.params).groupId);
  if (!groupId.success) {
    return failure(404, "NOT_FOUND", "Group tidak ditemukan.");
  }

  const slug = await getGroupSlugById(groupId.data);
  if (slug === null) {
    return failure(404, "NOT_FOUND", "Group tidak ditemukan.");
  }

  // margin 4 modul adalah quiet zone MINIMUM di spesifikasi QR, bukan
  // selera. Memangkasnya membuat sebagian pemindai gagal mengunci — dan
  // itu kegagalan yang muncul di tangan tamu, bukan di layar kita.
  const svg = withPhysicalSize(
    await QRCode.toString(shareUrl(slug), {
      type: "svg",
      errorCorrectionLevel: "M",
      margin: 4,
    }),
  );

  // Slug hanya memuat huruf kecil, angka, dan tanda hubung (SLUG_PATTERN),
  // jadi ia aman masuk header tanpa penyandian tambahan.
  const unduh = new URL(request.url).searchParams.get("unduh") === "1";

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Content-Disposition": unduh ? `attachment; filename="qr-${slug}.svg"` : "inline",
      // Slug dapat berubah, dan QR basi di layar akan disalin ke kertas.
      "Cache-Control": "no-store",
    },
  });
}
```

- [ ] **Step 6: Jalankan dan pastikan lulus**

Run: `npx vitest run tests/groups/qr-svg.test.ts tests/api/qr-owner-boundary.test.ts`
Expected: PASS, 9 pengujian.

- [ ] **Step 7: Gerbang**

Run: `npm run typecheck && npm run lint && npm test`
Expected: keluar 0, nol peringatan, seluruh berkas pengujian hijau.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json lib/groups/qr-svg.ts "app/api/groups/[groupId]/qr/route.ts" tests/groups/qr-svg.test.ts tests/api/qr-owner-boundary.test.ts
git commit -m "feat(api): route QR code SVG per group

Keputusan U5-9 dan U5-10. SVG 80mm, koreksi galat M, margin 4
modul, di balik getOwnerSession(). Satu rute melayani pratinjau
dan unduhan; tidak ada berkas turunan yang bisa basi saat slug
berubah.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 8: Sheet, saklar, dan formulir setelan

Setelah task ini panel sudah dapat dibuka dan mengubah ketiga kolom. URL dan QR menyusul di Task 9.

**Files:**
- Create: `components/dashboard/use-sheet-side.ts`
- Create: `components/dashboard/share-enabled-switch.tsx`
- Create: `components/dashboard/share-settings-form.tsx`
- Create: `components/dashboard/share-sheet.tsx`
- Modify: `components/dashboard/group-accordion-body.tsx`

**Interfaces:**
- Consumes: `toggleShareAction`, `updateShareSettingsAction` (Task 6); `EMPTY_SHARE_ACTION_STATE`, `ShareActionState` (Task 6); `witDateParts`, `toCalendarDate`, `fromCalendarDate` (Task 3); `formatDateWIT` dari `lib/time/format.ts`; `GroupListItem` dari `lib/types/group.ts`.
- Produces: `ShareSheet({ group, open, onOpenChange })`. Task 9 menyisipkan dua komponen ke dalamnya.

- [ ] **Step 1: Tulis hook sisi sheet**

Buat `components/dashboard/use-sheet-side.ts`:

```ts
"use client";

import { useEffect, useState } from "react";

const WIDE = "(min-width: 640px)";

/**
 * Dari kanan pada layar lebar, dari bawah pada ponsel — ui-context.md.
 *
 * Dimulai dari "bottom" dan baru membaca matchMedia SETELAH mount:
 * server tidak mengetahui lebar layar, jadi nilai awal yang menebak akan
 * membuat render pertama server dan klien berbeda — persis definisi
 * ketidakcocokan hidrasi.
 */
export function useSheetSide(): "right" | "bottom" {
  const [wide, setWide] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(WIDE);
    const sync = () => setWide(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return wide ? "right" : "bottom";
}
```

- [ ] **Step 2: Tulis saklar yang menyimpan seketika**

Buat `components/dashboard/share-enabled-switch.tsx`:

```tsx
"use client";

import { useId, useOptimistic, useTransition } from "react";

import { toggleShareAction } from "@/app/(dashboard)/dashboard/share-actions";
import { Switch } from "@/components/ui/switch";

/**
 * Menyimpan pada detik digeser, tanpa tombol dan tanpa dialog konfirmasi.
 * Keputusan U5-7: mencabut link adalah tindakan darurat, dan ia dapat
 * dibatalkan dengan menggeser balik.
 *
 * useOptimistic supaya saklar bergerak sebelum server menjawab. Tanpa itu
 * saklar terasa macet selama satu perjalanan bolak-balik, dan pemilik
 * yang sedang panik akan menggesernya dua kali.
 */
export function ShareEnabledSwitch({
  groupId,
  shareEnabled,
}: {
  groupId: string;
  shareEnabled: boolean;
}) {
  const id = useId();
  const [optimistic, setOptimistic] = useOptimistic(shareEnabled);
  const [, startTransition] = useTransition();

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <label htmlFor={id} className="text-sm font-medium">
          Link berbagi aktif
        </label>
        <p className="mt-1 text-sm text-muted-foreground">
          Mematikannya mencabut link seketika. Hanya Anda yang masih dapat membuka
          halamannya.
        </p>
      </div>
      <Switch
        id={id}
        checked={optimistic}
        onCheckedChange={(next) => {
          startTransition(async () => {
            setOptimistic(next);
            const formData = new FormData();
            formData.set("id", groupId);
            formData.set("enabled", next ? "true" : "false");
            await toggleShareAction(formData);
          });
        }}
      />
    </div>
  );
}
```

- [ ] **Step 3: Tulis formulir tingkat akses dan kedaluwarsa**

Buat `components/dashboard/share-settings-form.tsx`:

```tsx
"use client";

import { CalendarDays } from "lucide-react";
import { useActionState, useEffect, useId, useState } from "react";

import { updateShareSettingsAction } from "@/app/(dashboard)/dashboard/share-actions";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { fromCalendarDate, toCalendarDate, witDateParts } from "@/lib/time/expiry";
import { formatDateWIT } from "@/lib/time/format";
import { EMPTY_SHARE_ACTION_STATE, type ShareActionState } from "@/lib/types/share-action";
import type { GroupListItem } from "@/lib/types/group";

const PILIHAN = [
  { value: "PRIVATE", label: "Privat", penjelas: "Hanya Anda. Berguna saat group masih disiapkan." },
  { value: "REQUIRE_LOGIN", label: "Wajib masuk", penjelas: "Penerima link harus masuk dengan Google lebih dulu." },
  { value: "PUBLIC", label: "Publik", penjelas: "Siapa pun yang memegang link dapat membuka halamannya." },
] as const;

export function ShareSettingsForm({ group }: { group: GroupListItem }) {
  const uid = useId();
  const [state, formAction, pending] = useActionState<ShareActionState, FormData>(
    updateShareSettingsAction,
    EMPTY_SHARE_ACTION_STATE,
  );

  const [visibility, setVisibility] = useState<string>(group.visibility);
  const [expiresOn, setExpiresOn] = useState(
    group.expiresAt === null ? "" : witDateParts(group.expiresAt),
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [tersimpan, setTersimpan] = useState(false);

  useEffect(() => {
    if (state.status !== "ok") return;
    setTersimpan(true);
    const timer = setTimeout(() => setTersimpan(false), 4000);
    return () => clearTimeout(timer);
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={group.id} />
      <input type="hidden" name="visibility" value={visibility} />
      <input type="hidden" name="expiresOn" value={expiresOn} />

      <fieldset>
        <legend className="text-sm font-medium">Tingkat akses</legend>
        <RadioGroup
          className="mt-2 gap-3"
          value={visibility}
          onValueChange={setVisibility}
        >
          {PILIHAN.map((pilihan) => (
            <div key={pilihan.value} className="flex items-start gap-3">
              <RadioGroupItem
                id={`${uid}-${pilihan.value}`}
                value={pilihan.value}
                className="mt-1"
              />
              <div className="min-w-0">
                <label htmlFor={`${uid}-${pilihan.value}`} className="text-sm">
                  {pilihan.label}
                </label>
                <p className="text-sm text-muted-foreground">{pilihan.penjelas}</p>
              </div>
            </div>
          ))}
        </RadioGroup>
      </fieldset>

      {!group.shareEnabled && (
        <p className="text-sm text-muted-foreground">
          Setelan ini belum berlaku selama link berbagi mati. Anda tetap dapat
          menyiapkannya dari sekarang.
        </p>
      )}

      <div>
        <span className="text-sm font-medium">Tanggal kedaluwarsa</span>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline" size="sm">
                <CalendarDays className="h-4 w-4" aria-hidden />
                {expiresOn === "" ? "Pilih tanggal" : "Ubah tanggal"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={expiresOn === "" ? undefined : toCalendarDate(expiresOn)}
                onSelect={(dipilih) => {
                  if (dipilih === undefined) return;
                  setExpiresOn(fromCalendarDate(dipilih));
                  setPickerOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
          {expiresOn !== "" && (
            <Button type="button" variant="outline" size="sm" onClick={() => setExpiresOn("")}>
              Tanpa batas waktu
            </Button>
          )}
        </div>
        <p className="mt-2 font-mono text-sm text-muted-foreground">
          {expiresOn === ""
            ? "Tanpa batas waktu"
            : `Berlaku sampai akhir hari ${formatDateWIT(toCalendarDate(expiresOn))}`}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Menyimpan…" : "Simpan"}
        </Button>
        {tersimpan && <span className="text-sm text-muted-foreground">Setelan disimpan.</span>}
        {state.status === "error" && (
          <span className="text-sm text-state-error">{state.error.message}</span>
        )}
      </div>
    </form>
  );
}
```

- [ ] **Step 4: Tulis cangkang sheet**

Buat `components/dashboard/share-sheet.tsx`:

```tsx
"use client";

import { ShareEnabledSwitch } from "@/components/dashboard/share-enabled-switch";
import { ShareSettingsForm } from "@/components/dashboard/share-settings-form";
import { useSheetSide } from "@/components/dashboard/use-sheet-side";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { GroupListItem } from "@/lib/types/group";

/**
 * Urutan isinya adalah bagian dari aturannya, bukan selera tata letak:
 * saklar lebih dulu karena ia satu-satunya kontrol yang berlaku seketika,
 * lalu setelan yang menunggu tombol Simpan, lalu hasil yang disebarkan.
 */
export function ShareSheet({
  group,
  open,
  onOpenChange,
}: {
  group: GroupListItem;
  open: boolean;
  onOpenChange: (next: boolean) => void;
}) {
  const side = useSheetSide();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={side} className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Bagikan {group.title}</SheetTitle>
          <SheetDescription>
            Atur siapa yang dapat membuka group ini dan sampai kapan.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-6 px-4 pb-8">
          <ShareEnabledSwitch groupId={group.id} shareEnabled={group.shareEnabled} />
          <ShareSettingsForm group={group} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

- [ ] **Step 5: Pasang tombol Bagikan di badan akordeon**

Di `components/dashboard/group-accordion-body.tsx`, tambahkan impor:

```tsx
import { Share2 } from "lucide-react";
import { ShareSheet } from "@/components/dashboard/share-sheet";
```

Catatan: `Share2` masuk ke baris impor `lucide-react` yang sudah ada, menjadi `import { Plus, Share2, Trash2 } from "lucide-react";`.

Tambahkan satu keadaan di sebelah `addingToId`:

```tsx
  const [shareOpen, setShareOpen] = useState(false);
```

Lalu di dalam blok tombol `mt-3 flex gap-2`, sisipkan tombol berikut **sebelum** tombol "Ubah judul dan slug":

```tsx
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShareOpen(true)}
        >
          <Share2 className="h-4 w-4" aria-hidden />
          Bagikan
        </Button>
```

Dan sisipkan sheet-nya tepat sebelum `{deletingId === group.id && (`:

```tsx
      <ShareSheet group={group} open={shareOpen} onOpenChange={setShareOpen} />
```

- [ ] **Step 6: Gerbang**

Run: `npm run typecheck && npm run lint && npm test`
Expected: keluar 0, nol peringatan, seluruh berkas pengujian hijau.

- [ ] **Step 7: Periksa di peramban sebelum commit**

Run: `npm run dev`

Buka `http://localhost:3000/dashboard`, buka satu akordeon group, tekan **Bagikan**. Yang harus terlihat:
- Sheet muncul dari kanan pada jendela lebar; kecilkan jendela ke bawah 640 px, tutup dan buka lagi — kini muncul dari bawah.
- Menggeser saklar mengubah lencana di baris akordeon tanpa muat ulang halaman.
- Memilih tanggal lalu menekan Simpan memunculkan "Setelan disimpan." dan tanggal muncul di baris akordeon.
- Menekan "Tanpa batas waktu" lalu Simpan menghapus tanggal itu.
- Saat saklar mati, keterangan "Setelan ini belum berlaku…" muncul dan ketiga pilihan tetap dapat diklik.

Hentikan server dengan Ctrl+C setelah selesai.

- [ ] **Step 8: Commit**

```bash
git add components/dashboard/use-sheet-side.ts components/dashboard/share-enabled-switch.tsx components/dashboard/share-settings-form.tsx components/dashboard/share-sheet.tsx components/dashboard/group-accordion-body.tsx
git commit -m "feat(dashboard): panel Bagikan dengan saklar dan setelan

Sheet dari kanan di layar lebar dan dari bawah di ponsel.
Saklar menyimpan seketika; tingkat akses dan tanggal
kedaluwarsa menunggu satu tombol Simpan bersama. Keputusan
U5-7 dan U5-12.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 9: Kolom URL dan panel QR

**Files:**
- Create: `components/dashboard/share-link-field.tsx`
- Create: `components/dashboard/share-qr-panel.tsx`
- Modify: `components/dashboard/share-sheet.tsx`

**Interfaces:**
- Consumes: `shareUrl()` (Task 2); rute `GET /api/groups/[groupId]/qr` (Task 7); `ShareSheet` (Task 8).
- Produces: tidak ada yang dikonsumsi task berikutnya.

- [ ] **Step 1: Tulis kolom URL**

Buat `components/dashboard/share-link-field.tsx`:

```tsx
"use client";

import { Copy } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { shareUrl } from "@/lib/groups/share-url";

/**
 * URL selalu terlihat dan dapat diseleksi. Tombol Salin adalah jalan
 * pintas, BUKAN satu-satunya jalan — keputusan U5-11.
 *
 * Tidak ada kemunduran ke document.execCommand("copy"): API itu usang
 * dan pada sebagian peramban mengembalikan true tanpa menyalin apa pun,
 * menghasilkan pesan berhasil yang berbohong. Kegagalan yang jujur lebih
 * baik daripada keberhasilan yang palsu.
 */
export function ShareLinkField({ slug }: { slug: string }) {
  const url = shareUrl(slug);
  const teksRef = useRef<HTMLSpanElement>(null);
  const [pesan, setPesan] = useState<string | null>(null);

  function seleksiTeks() {
    const node = teksRef.current;
    const selection = window.getSelection();
    if (node === null || selection === null) return;
    const range = document.createRange();
    range.selectNodeContents(node);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  async function salin() {
    try {
      if (navigator.clipboard === undefined) {
        throw new Error("Clipboard tidak tersedia.");
      }
      await navigator.clipboard.writeText(url);
      setPesan("URL disalin.");
    } catch {
      seleksiTeks();
      setPesan("Tidak dapat menyalin otomatis. Tekan Ctrl+C untuk menyalin.");
    }
  }

  return (
    <div>
      <span className="text-sm font-medium">URL berbagi</span>
      <div className="mt-2 flex items-start gap-2">
        <span
          ref={teksRef}
          className="min-w-0 flex-1 break-all rounded-md border border-border bg-[var(--bg-elevated)] px-3 py-2 font-mono text-sm"
        >
          {url}
        </span>
        <Button type="button" variant="outline" size="sm" onClick={salin}>
          <Copy className="h-4 w-4" aria-hidden />
          Salin
        </Button>
      </div>
      {pesan !== null && (
        <p className="mt-2 text-sm text-muted-foreground" role="status">
          {pesan}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Tulis panel QR**

Buat `components/dashboard/share-qr-panel.tsx`:

```tsx
"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Pratinjau dan unduhan berasal dari SATU rute; ?unduh=1 hanya mengubah
 * Content-Disposition. Keputusan U5-10.
 */
export function ShareQrPanel({
  groupId,
  slug,
  title,
}: {
  groupId: string;
  slug: string;
  title: string;
}) {
  const src = `/api/groups/${groupId}/qr`;

  return (
    <div>
      <span className="text-sm font-medium">QR code</span>
      {/*
        bg-white disengaja dan BUKAN token tema: QR wajib gelap-di-atas-terang
        di kedua mode, dan alas yang mengikuti tema membuatnya berhenti
        terpindai di mode gelap.

        next/image tidak dipakai karena ia menuntut dangerouslyAllowSVG di
        next.config.ts — melonggarkan pipeline gambar seluruh aplikasi demi
        satu pratinjau yang hanya dilihat pemilik.
      */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`QR code untuk group ${title}`}
        width={176}
        height={176}
        className="mt-2 h-44 w-44 rounded-lg border border-border bg-white p-2"
      />
      <div className="mt-3">
        <Button asChild variant="outline" size="sm">
          <a href={`${src}?unduh=1`} download={`qr-${slug}.svg`}>
            <Download className="h-4 w-4" aria-hidden />
            Unduh QR (SVG)
          </a>
        </Button>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        QR memuat alamat lengkap group ini. Mengubah slug membuat QR yang sudah
        dicetak berhenti berfungsi.
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Sisipkan keduanya ke dalam sheet**

Di `components/dashboard/share-sheet.tsx`, tambahkan dua impor:

```tsx
import { ShareLinkField } from "@/components/dashboard/share-link-field";
import { ShareQrPanel } from "@/components/dashboard/share-qr-panel";
```

Lalu tambahkan dua komponen setelah `<ShareSettingsForm group={group} />`:

```tsx
          <ShareLinkField slug={group.slug} />
          <ShareQrPanel groupId={group.id} slug={group.slug} title={group.title} />
```

- [ ] **Step 4: Gerbang**

Run: `npm run typecheck && npm run lint && npm test`
Expected: keluar 0, nol peringatan — termasuk `@next/next/no-img-element` yang dibungkam satu baris beserta alasannya.

- [ ] **Step 5: Periksa di peramban sebelum commit**

Run: `npm run dev`

Buka panel Bagikan sebuah group. Yang harus terlihat:
- URL tampil monospasi berbunyi `https://diandiandian.web.id/g/<slug>`, bukan `localhost`. Ini benar dan disengaja — keputusan U5-6.
- Tombol Salin memunculkan "URL disalin."
- Pratinjau QR muncul sebagai gambar hitam-putih, tetap terbaca di mode gelap.
- Menekan "Unduh QR (SVG)" mengunduh `qr-<slug>.svg`. Buka berkasnya di peramban — QR tampil, dan `<svg>`-nya memuat `width="80mm"` beserta `viewBox`.
- Pindai QR dari layar memakai ponsel — hasilnya `https://diandiandian.web.id/g/<slug>`.

Hentikan server dengan Ctrl+C setelah selesai.

- [ ] **Step 6: Commit**

```bash
git add components/dashboard/share-link-field.tsx components/dashboard/share-qr-panel.tsx components/dashboard/share-sheet.tsx
git commit -m "feat(dashboard): kolom URL berbagi dan panel QR

URL monospasi yang selalu dapat diseleksi; gagal menyalin
berarti teks terseleksi dan pesan Ctrl+C, bukan kemunduran
diam-diam ke execCommand. Keputusan U5-11.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 10: Pemeriksaan peramban dan penutupan unit

**Files:**
- Modify: `context/progress-tracker.md`

**Interfaces:**
- Consumes: seluruh task sebelumnya.
- Produces: unit tertutup.

- [ ] **Step 1: Jalankan keempat gerbang, termasuk build**

Run: `npm run typecheck && npm run lint && npm test && npm run build`
Expected: keluar 0 di keempatnya, nol peringatan lint, dan `npm run build` selesai tanpa galat. Catat jumlah pengujian dan jumlah berkasnya dari keluaran `npm test` — angka itu masuk ke tracker di Step 3.

- [ ] **Step 2: Jalankan keenam pemeriksaan peramban**

Run: `npm run dev`

Jalankan seluruhnya di **mode terang dan gelap**, dan ulangi pemeriksaan panel pada lebar 375 px:

1. **Halaman hidup.** Setel sebuah group `PUBLIC` dengan saklar hidup. Buka `/g/<slug>` di jendela penyamaran — halaman group tampil.
2. **Pencabutan terlihat dari luar.** Matikan saklar di panel Bagikan. Muat ulang jendela penyamaran — halaman tidak tersedia muncul, identik dengan membuka slug karangan seperti `/g/tidak-pernah-ada`. Bandingkan keduanya berdampingan.
3. **Pemilik tetap masuk, dengan sebab yang benar.** Buka slug yang sama di jendela biasa sebagai pemilik — halaman tampil dengan spanduk berbunyi "Link berbagi group ini Anda matikan."
4. **Kedaluwarsa berbunyi lain.** Hidupkan kembali saklar, setel tanggal kedaluwarsa ke kemarin, simpan. Ulangi langkah 2 dan 3 — pengunjung melihat halaman tidak tersedia, pemilik melihat spanduk "Link berbagi group ini kedaluwarsa <tanggal> WIT."
5. **QR terpindai.** Unduh QR, tampilkan seukuran 8 cm atau cetak, lalu pindai dari sekitar 80 cm. Hasilnya `https://diandiandian.web.id/g/<slug>`.
6. **Salin yang gagal tetap berguna.** Di setelan situs peramban, tolak izin clipboard untuk `localhost`. Tekan Salin — teks URL terseleksi dan pesan "Tidak dapat menyalin otomatis. Tekan Ctrl+C untuk menyalin." muncul.

Hentikan server dengan Ctrl+C setelah selesai. Bila salah satu gagal, **berhenti dan laporkan** — jangan tutup unit.

- [ ] **Step 3: Catat keputusan dan hasilnya di `context/progress-tracker.md`**

Sisipkan blok berikut di bagian `## Architecture Decisions`, **di atas** `### Keputusan U5-5`, sehingga urutannya tetap dari yang terbaru:

```markdown
### Keputusan U5-6 sampai U5-13 — 8 September 2026

Delapan keputusan Unit 5, diambil di sesi brainstorming dan
dicatat lengkap beserta alternatif yang ditolak di
`docs/superpowers/specs/2026-09-08-unit-5-panel-bagikan-design.md`.
Ringkasannya:

- **U5-6 — domain QR sebagai konstanta di kode.**
  `APP_ORIGIN = "https://diandiandian.web.id"` di
  `lib/groups/share-url.ts`, bukan variabel lingkungan kedua belas.
  Alasannya langsung dari U5-1: nilai `Sensitive` yang tersimpan
  kosong tidak dapat dibaca siapa pun, sedangkan konstanta di kode
  terbaca di diff. Domain bukan rahasia. Konsekuensi yang diterima
  sadar: URL dan QR di localhost menunjuk domain produksi.
- **U5-7 — saklar menyimpan seketika, dua setelan lain bertombol
  Simpan.** Lingkup unit berbunyi mencabut link *seketika*.
- **U5-8 — `expiresAt` per tanggal, mati akhir hari WIT.**
  23:59:59.999 Asia/Jayapura. Aritmetika tetap UTC+9 di
  `lib/time/expiry.ts`, bukan pustaka zona waktu; Papua tidak
  pernah mengenal DST. Aturan ini ikut mengikat
  `AccessRequest.expiresAt` di Unit 7.
- **U5-9 — QR hanya SVG, 80 mm, koreksi galat M, margin 4 modul.**
  Jarak pindai ≈ sepuluh kali lebar QR. Margin 4 modul adalah quiet
  zone minimum spesifikasi QR, bukan selera.
- **U5-10 — QR dilayani satu route handler.** Pratinjau dan unduhan
  dari rute yang sama; tidak ada berkas turunan di Blob yang wajib
  disapu saat slug berubah.
- **U5-11 — tombol Salin adalah jalan pintas.** URL selalu terlihat
  dan dapat diseleksi. Kemunduran ke `document.execCommand("copy")`
  ditolak: pada sebagian peramban ia mengembalikan `true` tanpa
  menyalin apa pun.
- **U5-12 — saklar dan tingkat akses dua pekerjaan berbeda.**
  Menggabungkannya menjadi satu daftar empat nilai ditolak: itu
  menulis dua kolom dari satu masukan dan membuat pencabutan
  melupakan tingkat akses yang sudah disetel.
- **U5-13 — spanduk pratinjau pemilik membedakan sebabnya.**
  Mengikuti aturan nada-mengikuti-sebab yang sudah berlaku pada
  lencana. `evaluate-access.ts` tidak diubah dan `ownerPreview`
  tetap boolean: sebabnya dihitung `resolvePreviewReason()` dari
  kolom yang sudah dibaca halaman.

**Yang TIDAK berubah di unit ini, dan itu disengaja:**
`lib/access/evaluate-access.ts` tidak disentuh sama sekali, matriks
izinnya tidak bertambah satu baris pun, dan tidak ada penulisan
`AccessLog` yang ditambah atau diubah. Unit 5 hanya memberi
antarmuka kepada tiga kolom yang sudah dibaca evaluator sejak
Unit 4.
```

Lalu perbarui tiga bagian berikut — tulis angka yang **benar-benar keluar** dari Step 1 dan Step 2, jangan menyalin angka dari unit sebelumnya:

- **`## Current Phase`** — tambahkan butir "**Unit 5 SELESAI, 8 September 2026.**" beserta jumlah task, jumlah commit, dan keempat gerbang dengan jumlah pengujian dan jumlah berkasnya.
- **`## Current Goal`** — ganti isinya menjadi Unit 6, tampilan riwayat akses.
- **`## Next Up`** — hapus butir 1 (Unit 5) yang sudah selesai, dan naikkan Unit 6 sebagai butir pertama.

- [ ] **Step 4: Commit**

```bash
git add context/progress-tracker.md
git commit -m "docs(context): Unit 5 selesai, delapan keputusan U5-6..U5-13

Panel Bagikan, QR SVG di server, dan spanduk pemilik yang
menyebut sebab. Keenam pemeriksaan peramban dijalankan di mode
terang dan gelap serta pada lebar 375 px.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

- [ ] **Step 5: Laporkan ke pemilik**

Sampaikan: jumlah commit, keempat gerbang beserta angkanya, keenam pemeriksaan peramban beserta hasilnya, dan satu kalimat yang menyatakan bahwa `lib/access/evaluate-access.ts` tidak muncul di satu pun diff unit ini. Jangan menggabungkan ke `main` tanpa instruksi.
