# Unit 2 — CMS Group: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pemilik dapat membuat beberapa group, mengubah judul dan slugnya, menyusun ulang urutannya, menghapusnya, dan melihat seluruhnya sebagai daftar akordeon yang dapat dilipat.

**Architecture:** Daftar dirender server (`page.tsx` memanggil `requireOwner()` lalu mengambil group beserta jumlah item), interaktivitas dipegang satu cangkang klien, dan seluruh mutasi lewat server action. Setiap logika yang **dapat diputuskan** — turunan slug, penyelesaian bentrok, penomoran ulang urutan, penentuan lencana status, pemformatan waktu — ditulis sebagai fungsi murni di `lib/`, terpisah dari lapisan Prisma yang dibuat setipis mungkin. Proyek ini tidak punya database uji, jadi pemisahan itu bukan estetika: ia satu-satunya cara aturan-aturan tersebut punya pengujian yang benar-benar dijalankan.

**Tech Stack:** Next.js 15.5 App Router · React 19 · TypeScript strict · Prisma 6.19 + PostgreSQL (Neon) · Zod 4 · Tailwind 4 + shadcn/ui (Radix) · Lucide React · Vitest 4 · `node:crypto`

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

**Skema Prisma ditulis COMPLETE di unit sebelumnya**, termasuk `AccessRequest` dan nilai `APPROVAL`, meski fiturnya baru dibangun di Unit 7. Alasannya sudah dicatat di `progress-tracker.md` dan tidak dinegosiasikan ulang: migrasi belakangan tidak boleh menyentuh tabel yang sudah berisi data produksi.

### Kosakata domain — bukan pelanggaran aturan Bahasa Indonesia

**`group` dan `link` adalah istilah domain proyek ini dan ditulis apa adanya di teks pengguna.** Keduanya dipakai konsisten di seluruh file konteks: `group` muncul 95 kali di `project-overview.md`, `ui-context.md`, dan `architecture.md`, sementara ejaan KBBI `grup` **nol kali**. `link` dipakai di kalimat definisi produk itu sendiri.

Sebagiannya bahkan diwajibkan kata per kata: `ui-context.md` menetapkan teks keadaan kosong berbunyi persis *"Belum ada group. Buat group pertama untuk mulai menghimpun tautan dan berkas."*

Menggantinya dengan "grup" akan membuat antarmuka bertentangan dengan spesifikasinya sendiri. Aturan "seluruh teks pengguna dalam Bahasa Indonesia" menyasar kalimat berbahasa Inggris, bukan istilah domain yang sudah ditetapkan.

Catatan terpisah: `tautan` dan `link` **tidak** bersinonim di proyek ini. `tautan` berarti item bertipe `LINK` di dalam group; `link` berarti URL berbagi group itu sendiri. Keduanya dapat muncul dalam satu kalimat tanpa saling bertentangan.

**Direktori kerja:** seluruh perintah dijalankan dari `D:\Kumpulink\kumpulink-app`.

**Rahasia:** `.env.local` sudah terisi lengkap dan terbukti diabaikan Git. Jangan pernah mencetak isinya ke terminal, ke log, atau ke pesan commit.

### Kendala khusus Unit 2

Sepuluh baris berikut adalah hasil sesi brainstorming 21 Agustus 2026. Seluruhnya sudah diputuskan pemilik dan **tidak dinegosiasikan ulang saat eksekusi**.

- **Dashboard boleh bergantung pada JavaScript.** Garis dasar tanpa JavaScript adalah janji untuk pengunjung halaman publik, bukan untuk pemilik. Ini yang membuat penyaring, keadaan akordeon, dan pemindahan optimistis layak dipakai.
- **Group disusun ulang dengan tombol naik dan turun saja.** Tidak ada `dnd-kit` dan tidak ada dependensi baru apa pun di unit ini. Tidak satu pun file konteks pernah menjanjikan geser untuk group; geser hanya dijanjikan untuk item, dan pustakanya masuk di Unit 3.
- **Kontrol urutan disembunyikan — bukan diabukan — saat daftar sedang tersaring.** Kontrol nonaktif yang tetap terlihat sebagai tombol hanya mengundang ketukan yang gagal.
- **Hanya satu akordeon terbuka pada satu waktu**, disimpan sebagai **satu** id group di `localStorage`, bukan sekumpulan id, dan **bukan** di database.
- **Slug acak wajib dari `node:crypto`, bukan `Math.random()`.** Ini baris di `code-standards.md` bagian Security Practices, dan Task 2 memasang penjaga regresi yang membaca berkas sumbernya.
- **Server tidak pernah mempercayai penanda dari klien untuk membedakan slug turunan dari slug ketikan tangan.** Ia menghitung ulang `slugify(judul)` sendiri lalu membandingkannya dengan slug yang dikirim.
- **`@unique` di database adalah penjaga terakhir bentrok slug.** Memeriksa lalu menulis selalu punya celah balapan; `P2002` wajib ditangkap dan dipetakan ke galat bentrok yang sama.
- **Setiap server action memanggil `requireOwner()` sendiri.** Layout tidak melindunginya — badan server action berjalan sebelum layout dirender ulang. Ini sudah tertulis sebagai komentar di `app/(dashboard)/layout.tsx` dan wajib dipatuhi.
- **Tidak ada pengujian komponen di unit ini.** `vitest.config.mts` memakai `environment: "node"` dan proyek tidak memasang jsdom maupun Testing Library. Menambahkannya adalah keputusan dependensi yang belum diambil pemilik. Konsekuensinya diterima secara sadar: task antarmuka (8–12) diverifikasi manual dengan langkah yang tertulis lengkap, bukan dengan test otomatis. Seluruh logika yang **bisa** diuji sudah ditarik keluar menjadi fungsi murni justru karena batasan ini.
- **Empat gerbang wajib lulus sebelum tiap commit:** `npm run typecheck`, `npm run lint`, `npm test`, dan — pada task terakhir — `npm run build`.

---

## File Structure

| Berkas | Tanggung jawab |
| ------ | -------------- |
| `lib/groups/slugify.ts` | `slugify()` untuk judul utuh dan `normalizeSlugInput()` untuk ketikan yang belum selesai. Murni, deterministik, tanpa keacakan. |
| `lib/groups/random-slug.ts` | `randomSlug()` — 12 karakter dari `node:crypto`, abjad 32 huruf tanpa karakter kembar rupa. |
| `lib/groups/resolve-slug.ts` | `resolveSlug()` — memutuskan slug akhir atau melaporkan bentrok. Menerima pembangkit acak sebagai argumen agar dapat diuji. |
| `lib/groups/order.ts` | `moveGroup()` dan `renumberGroups()` — larik → larik, tanpa Prisma. |
| `lib/groups/status.ts` | `resolveGroupStatus()` — lima keadaan lencana dari `shareEnabled`, `expiresAt`, dan `visibility`. |
| `lib/time/format.ts` | `formatDateWIT()` — tanggal di `Asia/Jayapura` berlabel `WIT`. |
| `lib/types/group.ts` | `GroupListItem` — bentuk data yang menyeberang dari server ke klien. |
| `lib/types/group-action.ts` | `GroupActionState` dan `EMPTY_ACTION_STATE`. **Terpisah dari `actions.ts` karena berkas `"use server"` hanya boleh mengekspor fungsi async** — mengekspor konstanta dari sana menggagalkan build. |
| `lib/validation/group.ts` | Skema Zod judul dan slug beserta keenam kalimat galat. |
| `lib/db/prisma-errors.ts` | `isUniqueConstraintError()` — predikat murni atas `P2002`. |
| `lib/db/groups.ts` | Query Prisma. Tanpa satu pun keputusan; seluruh aturan sudah diputuskan di `lib/groups/`. |
| `app/(dashboard)/dashboard/actions.ts` | Empat server action: buat, ubah, hapus, pindah. |
| `app/(dashboard)/dashboard/page.tsx` | **Modifikasi.** Mengambil data lalu menyerahkannya ke `GroupList`. |
| `components/dashboard/group-list.tsx` | Cangkang klien: penyaring, akordeon, urutan optimistis, pengumuman. |
| `components/dashboard/group-row.tsx` | Baris terlipat: chevron, judul, jumlah item, kolom status. |
| `components/dashboard/group-status-badge.tsx` | Lencana lima keadaan. Render tipis di atas `resolveGroupStatus()`. |
| `components/dashboard/group-form-row.tsx` | Baris sisip buat/ubah: judul, slug, peringatan, simpan, batal. |
| `components/dashboard/group-filter-bar.tsx` | Kolom pencarian + segmen Aktif · Nonaktif · Semua. |
| `components/dashboard/group-delete-dialog.tsx` | Dialog konfirmasi hapus berisi konsekuensi terhitung. |
| `components/dashboard/group-reorder-buttons.tsx` | Tombol naik dan turun beserta `aria-label`-nya. |
| `components/dashboard/group-empty-state.tsx` | Dua keadaan kosong: belum ada group, dan tidak ada yang cocok. |
| `tests/groups/slugify.test.ts` | Tabel kasus turunan slug. |
| `tests/groups/random-slug.test.ts` | Bentuk, abjad, dan penjaga regresi `Math.random()`. |
| `tests/groups/resolve-slug.test.ts` | Matriks bentrok: turunan versus ketikan tangan. |
| `tests/groups/order.test.ts` | Pemindahan di tepi dan penomoran ulang. |
| `tests/groups/status.test.ts` | Lima keadaan beserta urutan prioritasnya. |
| `tests/time/format.test.ts` | Pergeseran zona waktu dan label wajib. |
| `tests/validation/group.test.ts` | Keenam kalimat galat, kata per kata. |
| `tests/db/prisma-errors.test.ts` | Pengenalan `P2002`. |

**Kenapa `lib/groups/random-slug.ts` terpisah dari `resolve-slug.ts`.** `resolveSlug()` menerima pembangkit acak sebagai argumen dengan nilai bawaan. Pemisahan itu yang membuat seluruh matriks bentrok dapat diuji secara deterministik, sementara keacakan kriptografisnya diuji sendiri di berkasnya.

---

## Task 1: `slugify()` dan `normalizeSlugInput()`

**Files:**
- Create: `lib/groups/slugify.ts`, `tests/groups/slugify.test.ts`

**Interfaces:**
- Consumes: —
- Produces: dari `lib/groups/slugify.ts` — `MAX_SLUG_LENGTH: 60`, `slugify(title: string): string`, `normalizeSlugInput(value: string): string`

`slugify()` **tidak pernah** memanggil pembangkit acak. Judul yang seluruhnya emoji menghasilkan string kosong, dan yang memutuskan apa yang terjadi berikutnya adalah `resolveSlug()` di Task 2. Menjaga fungsi ini deterministik adalah yang membuat tabel kasusnya dapat ditulis sama sekali.

- [ ] **Step 1: Tulis test lebih dulu**

`tests/groups/slugify.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { MAX_SLUG_LENGTH, normalizeSlugInput, slugify } from "@/lib/groups/slugify";

describe("slugify", () => {
  it.each([
    ["judul biasa", "Rapat Kerja 2026", "rapat-kerja-2026"],
    ["titik dua dan ampersand", "Rapat Kerja: Sesi I & II", "rapat-kerja-sesi-i-ii"],
    ["tanda kurung", "Anggaran (Draf)", "anggaran-draf"],
    ["persen", "50% Selesai", "50-selesai"],
    ["spasi berlebih", "  Rapat   Kerja  ", "rapat-kerja"],
    ["diakritik", "Café Ramah", "cafe-ramah"],
    ["angka saja", "2026", "2026"],
  ])("mengubah %s", (_label, title, expected) => {
    expect(slugify(title)).toBe(expected);
  });

  // Apostrof sengaja DIHAPUS tanpa sisa, tidak diganti tanda hubung:
  // "qur-an" tidak terbaca, "quran" wajar.
  it.each([
    ["apostrof lurus", "Kajian Qur'an", "kajian-quran"],
    ["apostrof melengkung", "Kajian Qur\u2019an", "kajian-quran"],
  ])("menghapus %s tanpa sisa", (_label, title, expected) => {
    expect(slugify(title)).toBe(expected);
  });

  it.each([
    ["emoji saja", "\u{1F389}\u{1F389}"],
    ["tanda baca saja", "---"],
    ["string kosong", ""],
    ["spasi saja", "   "],
  ])("mengembalikan string kosong untuk %s", (_label, title) => {
    expect(slugify(title)).toBe("");
  });

  it("memotong di batas tanda hubung, tidak di tengah kata", () => {
    const result = slugify("Rapat ".repeat(11));
    expect(result).toBe(Array(10).fill("rapat").join("-"));
    expect(result.length).toBeLessThanOrEqual(MAX_SLUG_LENGTH);
    expect(result.endsWith("-")).toBe(false);
  });

  it("memotong keras bila tidak ada tanda hubung sebelum batas", () => {
    const result = slugify("a".repeat(80));
    expect(result).toBe("a".repeat(MAX_SLUG_LENGTH));
  });
});

describe("normalizeSlugInput", () => {
  // Ketikan yang BELUM selesai. Memangkas tanda hubung di ujung akan
  // membuat pemilik mustahil mengetik "rapat-kerja" — hurufnya hilang
  // seketika setelah ia menekan tanda hubung.
  it("mempertahankan satu tanda hubung di ujung", () => {
    expect(normalizeSlugInput("rapat-")).toBe("rapat-");
  });

  it("menciutkan tanda hubung berganda", () => {
    expect(normalizeSlugInput("rapat--kerja")).toBe("rapat-kerja");
  });

  it("membuang tanda hubung di awal", () => {
    expect(normalizeSlugInput("-rapat")).toBe("rapat");
  });

  it.each([
    ["huruf besar", "Rapat", "rapat"],
    ["spasi", "rapat kerja", "rapat-kerja"],
    ["diakritik", "café", "cafe"],
    ["apostrof", "qur'an", "quran"],
    ["karakter tak sah", "rapat@kerja", "rapat-kerja"],
  ])("menormalkan %s saat mengetik", (_label, typed, expected) => {
    expect(normalizeSlugInput(typed)).toBe(expected);
  });

  it("tidak pernah melewati batas panjang", () => {
    expect(normalizeSlugInput("a".repeat(80))).toHaveLength(MAX_SLUG_LENGTH);
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan GAGAL**

```bash
npm test -- tests/groups/slugify.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/groups/slugify'`.

- [ ] **Step 3: Tulis `lib/groups/slugify.ts`**

```ts
export const MAX_SLUG_LENGTH = 60;

const APOSTROPHES = /['\u2019\u2018`\u00B4]/g;
const COMBINING_MARKS = /[\u0300-\u036f]/g;
const NON_SLUG_RUN = /[^a-z0-9]+/g;

/**
 * Membuang apostrof, meratakan diakritik ke ASCII, lalu mengecilkan huruf.
 *
 * Apostrof ditangani terpisah dan lebih dulu: bila ia ikut aturan umum,
 * "Qur'an" menjadi "qur-an" — terbaca sebagai dua kata padahal satu.
 */
function toAsciiLowercase(value: string): string {
  return value
    .replace(APOSTROPHES, "")
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .toLowerCase();
}

/**
 * Judul utuh menjadi slug. Deterministik: judul yang tidak menyisakan
 * satu pun huruf atau angka menghasilkan string kosong, dan keputusan
 * atas string kosong itu milik resolveSlug(), bukan fungsi ini.
 */
export function slugify(title: string): string {
  const hyphenated = toAsciiLowercase(title)
    .replace(NON_SLUG_RUN, "-")
    .replace(/-{2,}/g, "-");
  const trimmed = hyphenated.replace(/^-+|-+$/g, "");

  if (trimmed.length <= MAX_SLUG_LENGTH) return trimmed;

  const window = trimmed.slice(0, MAX_SLUG_LENGTH + 1);
  const lastHyphen = window.lastIndexOf("-");
  const cut = lastHyphen > 0 ? window.slice(0, lastHyphen) : trimmed.slice(0, MAX_SLUG_LENGTH);
  return cut.replace(/-+$/, "");
}

/**
 * Ketikan tangan yang belum selesai, dinormalkan setiap ketukan huruf
 * supaya yang terlihat di kolom selalu sama dengan yang akan tersimpan.
 *
 * Berbeda dari slugify() dalam satu hal yang menentukan: tanda hubung di
 * UJUNG dipertahankan. Memangkasnya membuat pemilik tidak pernah bisa
 * mengetik kata kedua.
 */
export function normalizeSlugInput(value: string): string {
  return toAsciiLowercase(value)
    .replace(NON_SLUG_RUN, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+/, "")
    .slice(0, MAX_SLUG_LENGTH);
}
```

- [ ] **Step 4: Jalankan test, pastikan LULUS**

```bash
npm test -- tests/groups/slugify.test.ts
```

Expected: PASS, 24 test.

- [ ] **Step 5: Gerbang dan commit**

```bash
npm run typecheck && npm run lint && npm test
git add lib/groups/slugify.ts tests/groups/slugify.test.ts
git commit -m "feat(groups): turunan judul menjadi slug dan normalisasi ketikan"
```

---

## Task 2: `randomSlug()` dan `resolveSlug()`

**Files:**
- Create: `lib/groups/random-slug.ts`, `lib/groups/resolve-slug.ts`, `tests/groups/random-slug.test.ts`, `tests/groups/resolve-slug.test.ts`

**Interfaces:**
- Consumes: `slugify`, `MAX_SLUG_LENGTH` dari `lib/groups/slugify.ts`
- Produces:
  - dari `lib/groups/random-slug.ts` — `RANDOM_SLUG_LENGTH: 12`, `RANDOM_SLUG_ALPHABET: string`, `randomSlug(): string`
  - dari `lib/groups/resolve-slug.ts` — `MIN_SLUG_LENGTH: 3`, `SLUG_PATTERN: RegExp`, `type SlugResolution`, `resolveSlug(input: ResolveSlugInput, generateRandom?: () => string): SlugResolution`
  - `type ResolveSlugInput = { title: string; requestedSlug: string; takenSlugs: readonly string[]; currentSlug?: string | null }`
  - `type SlugResolution = { status: "ok"; slug: string } | { status: "conflict"; requested: string; suggestion: string }`

- [ ] **Step 1: Tulis test slug acak**

`tests/groups/random-slug.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { RANDOM_SLUG_ALPHABET, RANDOM_SLUG_LENGTH, randomSlug } from "@/lib/groups/random-slug";

describe("randomSlug", () => {
  it("selalu sepanjang RANDOM_SLUG_LENGTH", () => {
    for (let i = 0; i < 200; i += 1) {
      expect(randomSlug()).toHaveLength(RANDOM_SLUG_LENGTH);
    }
  });

  it("hanya memakai karakter dari abjadnya", () => {
    const allowed = new Set(RANDOM_SLUG_ALPHABET.split(""));
    for (let i = 0; i < 200; i += 1) {
      for (const char of randomSlug()) {
        expect(allowed.has(char)).toBe(true);
      }
    }
  });

  // Abjadnya berukuran 32 supaya 256 habis dibagi rata. Sisa pembagian
  // pada ukuran lain membuat sebagian karakter lebih sering muncul.
  it("memakai abjad 32 karakter tanpa karakter kembar rupa", () => {
    expect(RANDOM_SLUG_ALPHABET).toHaveLength(32);
    expect(new Set(RANDOM_SLUG_ALPHABET.split("")).size).toBe(32);
    for (const ambiguous of ["0", "1", "i", "l", "O"]) {
      expect(RANDOM_SLUG_ALPHABET).not.toContain(ambiguous);
    }
  });

  it("tidak mengulang nilai dalam seribu penarikan", () => {
    const drawn = new Set<string>();
    for (let i = 0; i < 1000; i += 1) drawn.add(randomSlug());
    expect(drawn.size).toBe(1000);
  });

  // Penjaga regresi atas code-standards.md bagian Security Practices:
  // "Slug acak dibuat dari sumber acak kriptografis, bukan Math.random()".
  it("mengambil keacakan dari node:crypto, bukan Math.random", () => {
    const source = readFileSync("lib/groups/random-slug.ts", "utf8");
    expect(source).toContain("node:crypto");
    expect(source).not.toContain("Math.random");
  });
});
```

- [ ] **Step 2: Jalankan, pastikan GAGAL**

```bash
npm test -- tests/groups/random-slug.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/groups/random-slug'`.

- [ ] **Step 3: Tulis `lib/groups/random-slug.ts`**

```ts
import { randomBytes } from "node:crypto";

export const RANDOM_SLUG_LENGTH = 12;

/**
 * Dua puluh empat huruf (tanpa i dan l) ditambah delapan angka (tanpa 0
 * dan 1). Karakter kembar rupa dibuang karena slug ini dibacakan lisan
 * dan disalin tangan dari layar proyektor.
 *
 * Panjangnya 32 secara sengaja: 256 habis dibagi 32, sehingga sisa
 * pembagian byte tidak membuat sebagian karakter lebih sering muncul.
 */
export const RANDOM_SLUG_ALPHABET = "abcdefghjkmnopqrstuvwxyz23456789";

export function randomSlug(): string {
  const bytes = randomBytes(RANDOM_SLUG_LENGTH);
  let slug = "";
  for (let i = 0; i < RANDOM_SLUG_LENGTH; i += 1) {
    slug += RANDOM_SLUG_ALPHABET[bytes[i] % RANDOM_SLUG_ALPHABET.length];
  }
  return slug;
}
```

- [ ] **Step 4: Jalankan, pastikan LULUS**

```bash
npm test -- tests/groups/random-slug.test.ts
```

Expected: PASS, 5 test.

- [ ] **Step 5: Tulis test penyelesaian bentrok**

`tests/groups/resolve-slug.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { resolveSlug } from "@/lib/groups/resolve-slug";

const FIXED_RANDOM = () => "k7m2q9x4rt3v";

describe("resolveSlug — slug turunan judul", () => {
  it("memakai slug turunan apa adanya bila belum dipakai", () => {
    const result = resolveSlug({
      title: "Rapat Kerja",
      requestedSlug: "rapat-kerja",
      takenSlugs: [],
    }, FIXED_RANDOM);
    expect(result).toEqual({ status: "ok", slug: "rapat-kerja" });
  });

  // Pemilik tidak pernah mengetik slug ini. Menghentikannya dengan galat
  // berarti menyalahkan orang atas sesuatu yang bukan pilihannya.
  it("memberi akhiran urut diam-diam saat bentrok", () => {
    const result = resolveSlug({
      title: "Rapat Kerja",
      requestedSlug: "rapat-kerja",
      takenSlugs: ["rapat-kerja"],
    }, FIXED_RANDOM);
    expect(result).toEqual({ status: "ok", slug: "rapat-kerja-2" });
  });

  it("melanjutkan akhiran sampai menemukan yang bebas", () => {
    const result = resolveSlug({
      title: "Rapat Kerja",
      requestedSlug: "rapat-kerja",
      takenSlugs: ["rapat-kerja", "rapat-kerja-2", "rapat-kerja-3"],
    }, FIXED_RANDOM);
    expect(result).toEqual({ status: "ok", slug: "rapat-kerja-4" });
  });

  it("jatuh ke slug acak setelah lima puluh akhiran habis", () => {
    const taken = ["rapat-kerja"];
    for (let n = 2; n <= 50; n += 1) taken.push(`rapat-kerja-${n}`);
    const result = resolveSlug({
      title: "Rapat Kerja",
      requestedSlug: "rapat-kerja",
      takenSlugs: taken,
    }, FIXED_RANDOM);
    expect(result).toEqual({ status: "ok", slug: "k7m2q9x4rt3v" });
  });

  it("memakai slug acak ketika judul tidak menyisakan huruf atau angka", () => {
    const result = resolveSlug({
      title: "\u{1F389}\u{1F389}",
      requestedSlug: "",
      takenSlugs: [],
    }, FIXED_RANDOM);
    expect(result).toEqual({ status: "ok", slug: "k7m2q9x4rt3v" });
  });

  // Judul dua huruf itu sah — "AI", "HR". Menolaknya karena slugnya
  // kurang dari tiga karakter berarti menghukum judul yang benar.
  it("menambah akhiran acak bila slug turunan lebih pendek dari batas minimum", () => {
    const result = resolveSlug({
      title: "AI",
      requestedSlug: "ai",
      takenSlugs: [],
    }, FIXED_RANDOM);
    expect(result).toEqual({ status: "ok", slug: "ai-k7m2" });
  });

  it("memangkas pangkal agar slug berakhiran tetap muat enam puluh karakter", () => {
    const base = "a".repeat(60);
    const result = resolveSlug({
      title: base,
      requestedSlug: base,
      takenSlugs: [base],
    }, FIXED_RANDOM);
    expect(result).toEqual({ status: "ok", slug: `${"a".repeat(58)}-2` });
  });
});

describe("resolveSlug — slug ketikan tangan", () => {
  // Slug yang berbeda dari turunan judul pasti diketik sendiri. Ia mungkin
  // sudah ditulis di undangan; mengubahnya diam-diam jauh lebih berbahaya
  // daripada menghentikannya di sini.
  it("menolak bentrok dan menyertakan usulan", () => {
    const result = resolveSlug({
      title: "Rapat Kerja",
      requestedSlug: "rakor",
      takenSlugs: ["rakor"],
    }, FIXED_RANDOM);
    expect(result).toEqual({ status: "conflict", requested: "rakor", suggestion: "rakor-2" });
  });

  it("mengusulkan akhiran bebas berikutnya", () => {
    const result = resolveSlug({
      title: "Rapat Kerja",
      requestedSlug: "rakor",
      takenSlugs: ["rakor", "rakor-2"],
    }, FIXED_RANDOM);
    expect(result).toEqual({ status: "conflict", requested: "rakor", suggestion: "rakor-3" });
  });

  it("menerima slug ketikan tangan yang belum dipakai", () => {
    const result = resolveSlug({
      title: "Rapat Kerja",
      requestedSlug: "rakor",
      takenSlugs: ["rapat-kerja"],
    }, FIXED_RANDOM);
    expect(result).toEqual({ status: "ok", slug: "rakor" });
  });
});

describe("resolveSlug — saat mengubah group yang sudah ada", () => {
  it("tidak menganggap slug milik group itu sendiri sebagai bentrok", () => {
    const result = resolveSlug({
      title: "Rapat Kerja",
      requestedSlug: "rakor",
      takenSlugs: ["rakor", "rapat-kerja"],
      currentSlug: "rakor",
    }, FIXED_RANDOM);
    expect(result).toEqual({ status: "ok", slug: "rakor" });
  });

  it("tetap menolak bentrok dengan group lain", () => {
    const result = resolveSlug({
      title: "Rapat Kerja",
      requestedSlug: "rapat-kerja",
      takenSlugs: ["rakor", "rapat-kerja"],
      currentSlug: "rakor",
    }, FIXED_RANDOM);
    expect(result).toEqual({
      status: "conflict",
      requested: "rapat-kerja",
      suggestion: "rapat-kerja-2",
    });
  });
});
```

- [ ] **Step 6: Jalankan, pastikan GAGAL**

```bash
npm test -- tests/groups/resolve-slug.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/groups/resolve-slug'`.

- [ ] **Step 7: Tulis `lib/groups/resolve-slug.ts`**

```ts
import { randomSlug } from "@/lib/groups/random-slug";
import { MAX_SLUG_LENGTH, slugify } from "@/lib/groups/slugify";

export const MIN_SLUG_LENGTH = 3;
export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const MAX_SUFFIX = 50;
const SHORT_SLUG_SUFFIX_LENGTH = 4;

export type ResolveSlugInput = {
  title: string;
  requestedSlug: string;
  takenSlugs: readonly string[];
  currentSlug?: string | null;
};

export type SlugResolution =
  | { status: "ok"; slug: string }
  | { status: "conflict"; requested: string; suggestion: string };

/** Memangkas pangkal supaya pangkal + akhiran tetap muat MAX_SLUG_LENGTH. */
function withSuffix(base: string, suffix: string): string {
  const room = MAX_SLUG_LENGTH - suffix.length - 1;
  return `${base.slice(0, room).replace(/-+$/, "")}-${suffix}`;
}

function firstFreeSuffixed(base: string, taken: ReadonlySet<string>): string | null {
  for (let n = 2; n <= MAX_SUFFIX; n += 1) {
    const candidate = withSuffix(base, String(n));
    if (!taken.has(candidate)) return candidate;
  }
  return null;
}

/**
 * Memutuskan slug akhir sebuah group.
 *
 * Bentuk dan panjang slug TIDAK divalidasi di sini — itu tugas skema Zod
 * di lib/validation/group.ts. Fungsi ini hanya mengurus ketersediaan.
 *
 * Pembangkit acak diterima sebagai argumen supaya seluruh matriks di
 * bawah dapat diuji tanpa keacakan.
 */
export function resolveSlug(
  input: ResolveSlugInput,
  generateRandom: () => string = randomSlug,
): SlugResolution {
  const taken = new Set(input.takenSlugs);
  if (input.currentSlug) taken.delete(input.currentSlug);

  const derived = slugify(input.title);
  const isDerived = input.requestedSlug === derived;

  if (!isDerived) {
    if (!taken.has(input.requestedSlug)) {
      return { status: "ok", slug: input.requestedSlug };
    }
    const suggestion =
      firstFreeSuffixed(input.requestedSlug, taken) ?? generateRandom();
    return { status: "conflict", requested: input.requestedSlug, suggestion };
  }

  // Judul yang tidak menyisakan huruf atau angka sama sekali.
  if (derived.length === 0) {
    let candidate = generateRandom();
    while (taken.has(candidate)) candidate = generateRandom();
    return { status: "ok", slug: candidate };
  }

  // Judul sah tetapi terlalu pendek — "AI", "HR". Diperpanjang, bukan
  // ditolak: yang salah bukan judulnya.
  const base =
    derived.length < MIN_SLUG_LENGTH
      ? `${derived}-${generateRandom().slice(0, SHORT_SLUG_SUFFIX_LENGTH)}`
      : derived;

  if (!taken.has(base)) return { status: "ok", slug: base };

  const suffixed = firstFreeSuffixed(base, taken);
  if (suffixed) return { status: "ok", slug: suffixed };

  let candidate = generateRandom();
  while (taken.has(candidate)) candidate = generateRandom();
  return { status: "ok", slug: candidate };
}
```

- [ ] **Step 8: Jalankan, pastikan LULUS**

```bash
npm test -- tests/groups/resolve-slug.test.ts
```

Expected: PASS, 12 test.

- [ ] **Step 9: Gerbang dan commit**

```bash
npm run typecheck && npm run lint && npm test
git add lib/groups/random-slug.ts lib/groups/resolve-slug.ts tests/groups/random-slug.test.ts tests/groups/resolve-slug.test.ts
git commit -m "feat(groups): slug acak kriptografis dan penyelesaian bentrok slug"
```

---

## Task 3: Pemindahan dan penomoran ulang urutan

**Files:**
- Create: `lib/groups/order.ts`, `tests/groups/order.test.ts`

**Interfaces:**
- Consumes: —
- Produces: dari `lib/groups/order.ts` — `type Orderable = { id: string }`, `moveGroup<T extends Orderable>(groups: readonly T[], id: string, direction: "up" | "down"): T[]`, `renumberGroups<T extends Orderable>(groups: readonly T[]): { id: string; sortOrder: number }[]`

- [ ] **Step 1: Tulis test lebih dulu**

`tests/groups/order.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { moveGroup, renumberGroups } from "@/lib/groups/order";

const GROUPS = [{ id: "a" }, { id: "b" }, { id: "c" }];
const ids = (list: readonly { id: string }[]) => list.map((g) => g.id);

describe("moveGroup", () => {
  it("menaikkan satu posisi", () => {
    expect(ids(moveGroup(GROUPS, "b", "up"))).toEqual(["b", "a", "c"]);
  });

  it("menurunkan satu posisi", () => {
    expect(ids(moveGroup(GROUPS, "b", "down"))).toEqual(["a", "c", "b"]);
  });

  it("tidak mengubah apa pun saat menaikkan yang sudah paling atas", () => {
    expect(ids(moveGroup(GROUPS, "a", "up"))).toEqual(["a", "b", "c"]);
  });

  it("tidak mengubah apa pun saat menurunkan yang sudah paling bawah", () => {
    expect(ids(moveGroup(GROUPS, "c", "down"))).toEqual(["a", "b", "c"]);
  });

  it("tidak mengubah apa pun untuk id yang tidak ada", () => {
    expect(ids(moveGroup(GROUPS, "z", "up"))).toEqual(["a", "b", "c"]);
  });

  it("tidak mengubah larik asalnya", () => {
    moveGroup(GROUPS, "b", "up");
    expect(ids(GROUPS)).toEqual(["a", "b", "c"]);
  });
});

describe("renumberGroups", () => {
  it("menomori ulang rapat mulai dari nol", () => {
    expect(renumberGroups(GROUPS)).toEqual([
      { id: "a", sortOrder: 0 },
      { id: "b", sortOrder: 1 },
      { id: "c", sortOrder: 2 },
    ]);
  });

  it("mengembalikan larik kosong untuk masukan kosong", () => {
    expect(renumberGroups([])).toEqual([]);
  });
});
```

- [ ] **Step 2: Jalankan, pastikan GAGAL**

```bash
npm test -- tests/groups/order.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/groups/order'`.

- [ ] **Step 3: Tulis `lib/groups/order.ts`**

```ts
export type Orderable = { id: string };

/**
 * Menukar sebuah group dengan tetangganya. Di tepi larik, dan untuk id
 * yang tidak ada, mengembalikan urutan yang sama — bukan melempar galat.
 * Tombol di tepi memang disembunyikan di antarmuka, jadi keadaan ini
 * hanya tercapai lewat balapan; membatalkan diam-diam lebih baik
 * daripada menjatuhkan halaman.
 */
export function moveGroup<T extends Orderable>(
  groups: readonly T[],
  id: string,
  direction: "up" | "down",
): T[] {
  const from = groups.findIndex((group) => group.id === id);
  if (from === -1) return [...groups];

  const to = direction === "up" ? from - 1 : from + 1;
  if (to < 0 || to >= groups.length) return [...groups];

  const next = [...groups];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}

/**
 * Menomori ulang rapat 0,1,2,… tanpa celah. Dipanggil setiap pemindahan
 * dan setiap penghapusan, sehingga keadaan basis data selalu kanonis dan
 * tidak ada jalur pemulihan celah yang harus ditulis dan diuji.
 */
export function renumberGroups<T extends Orderable>(
  groups: readonly T[],
): { id: string; sortOrder: number }[] {
  return groups.map((group, index) => ({ id: group.id, sortOrder: index }));
}
```

- [ ] **Step 4: Jalankan, pastikan LULUS**

```bash
npm test -- tests/groups/order.test.ts
```

Expected: PASS, 8 test.

- [ ] **Step 5: Gerbang dan commit**

```bash
npm run typecheck && npm run lint && npm test
git add lib/groups/order.ts tests/groups/order.test.ts
git commit -m "feat(groups): pemindahan dan penomoran ulang urutan group"
```

---

## Task 4: `formatDateWIT()`

**Files:**
- Create: `lib/time/format.ts`, `tests/time/format.test.ts`

**Interfaces:**
- Consumes: —
- Produces: dari `lib/time/format.ts` — `DISPLAY_TIME_ZONE: "Asia/Jayapura"`, `TIME_ZONE_LABEL: "WIT"`, `formatDateWIT(value: Date): string`

Hanya bentuk **tanggal** yang dibangun di unit ini, karena hanya tanggal kedaluwarsa yang tampil. Bentuk tanggal-dan-jam menyusul di Unit 6 bersama tabel riwayat, saat ada yang memakainya.

- [ ] **Step 1: Tulis test lebih dulu**

`tests/time/format.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { TIME_ZONE_LABEL, formatDateWIT } from "@/lib/time/format";

describe("formatDateWIT", () => {
  // Perilaku yang benar-benar penting, dan satu-satunya yang tidak
  // bergantung versi ICU: instan UTC diterjemahkan ke Asia/Jayapura
  // (UTC+9), bukan ke zona waktu mesin yang membacanya.
  it("memakai Asia/Jayapura, bukan zona waktu mesin", () => {
    const beforeMidnightUtc = new Date("2026-08-19T16:00:00Z");
    expect(formatDateWIT(beforeMidnightUtc)).toContain("20");
    expect(formatDateWIT(beforeMidnightUtc)).not.toContain("19");
  });

  it("selalu menyertakan label zona waktu", () => {
    expect(formatDateWIT(new Date("2026-08-19T05:00:00Z"))).toContain(TIME_ZONE_LABEL);
  });

  it("menyertakan tahun", () => {
    expect(formatDateWIT(new Date("2026-08-19T05:00:00Z"))).toContain("2026");
  });

  it("berakhir dengan labelnya, bukan menyisipkannya di tengah", () => {
    expect(formatDateWIT(new Date("2026-08-19T05:00:00Z")).endsWith(TIME_ZONE_LABEL)).toBe(true);
  });
});
```

- [ ] **Step 2: Jalankan, pastikan GAGAL**

```bash
npm test -- tests/time/format.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/time/format'`.

- [ ] **Step 3: Tulis `lib/time/format.ts`**

```ts
export const DISPLAY_TIME_ZONE = "Asia/Jayapura";
export const TIME_ZONE_LABEL = "WIT";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  timeZone: DISPLAY_TIME_ZONE,
  day: "numeric",
  month: "short",
  year: "numeric",
});

/**
 * Menampilkan tanggal dalam zona waktu TETAP Asia/Jayapura, tidak
 * mengikuti perangkat pembaca, dan selalu menyertakan labelnya.
 *
 * Label itu wajib, bukan hiasan: waktu di aplikasi ini dipakai untuk
 * mempertanggungjawabkan kejadian, dan dua orang yang membahas baris
 * yang sama harus membaca angka yang sama.
 */
export function formatDateWIT(value: Date): string {
  return `${dateFormatter.format(value)} ${TIME_ZONE_LABEL}`;
}
```

- [ ] **Step 4: Jalankan, pastikan LULUS**

```bash
npm test -- tests/time/format.test.ts
```

Expected: PASS, 4 test.

- [ ] **Step 5: Gerbang dan commit**

```bash
npm run typecheck && npm run lint && npm test
git add lib/time/format.ts tests/time/format.test.ts
git commit -m "feat(time): pemformatan tanggal Asia/Jayapura berlabel WIT"
```

---

## Task 5: `resolveGroupStatus()` dan lencana status

**Files:**
- Create: `lib/groups/status.ts`, `tests/groups/status.test.ts`, `components/dashboard/group-status-badge.tsx`

**Interfaces:**
- Consumes: —
- Produces:
  - dari `lib/groups/status.ts` — `type GroupStatus = "UNSHARED" | "EXPIRED" | "PRIVATE" | "REQUIRE_LOGIN" | "PUBLIC"`, `resolveGroupStatus(group: GroupStatusInput, now: Date): GroupStatus`
  - `type GroupStatusInput = { shareEnabled: boolean; expiresAt: Date | null; visibility: "PRIVATE" | "REQUIRE_LOGIN" | "PUBLIC" }`
  - dari `components/dashboard/group-status-badge.tsx` — `GroupStatusBadge({ status }: { status: GroupStatus })`

- [ ] **Step 1: Tulis test lebih dulu**

`tests/groups/status.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { resolveGroupStatus } from "@/lib/groups/status";

const NOW = new Date("2026-08-21T00:00:00Z");
const base = { shareEnabled: true, expiresAt: null, visibility: "PRIVATE" as const };

describe("resolveGroupStatus", () => {
  it("menandai group yang saklar berbaginya mati sebagai UNSHARED", () => {
    expect(resolveGroupStatus({ ...base, shareEnabled: false }, NOW)).toBe("UNSHARED");
  });

  it("menandai group yang baru dibuat sebagai UNSHARED, bukan EXPIRED", () => {
    // Bawaan Prisma: shareEnabled false, visibility PRIVATE, expiresAt null.
    expect(resolveGroupStatus({ shareEnabled: false, expiresAt: null, visibility: "PRIVATE" }, NOW)).toBe("UNSHARED");
  });

  it("menandai group yang tanggalnya lewat sebagai EXPIRED", () => {
    expect(resolveGroupStatus({ ...base, expiresAt: new Date("2026-08-20T00:00:00Z") }, NOW)).toBe("EXPIRED");
  });

  // Saklar mati menang: link-nya mati apa pun tanggalnya, dan keadaan
  // yang sedang DIPILIH pemilik lebih berguna dibaca daripada keadaan
  // yang sudah tidak berpengaruh.
  it("mendahulukan UNSHARED ketika saklar mati DAN sudah kedaluwarsa", () => {
    expect(resolveGroupStatus(
      { shareEnabled: false, expiresAt: new Date("2026-08-20T00:00:00Z"), visibility: "PUBLIC" },
      NOW,
    )).toBe("UNSHARED");
  });

  it("tidak menandai EXPIRED tepat pada detik tanggalnya belum lewat", () => {
    expect(resolveGroupStatus({ ...base, expiresAt: new Date("2026-08-21T00:00:01Z") }, NOW)).toBe("PRIVATE");
  });

  it.each([
    ["PRIVATE" as const],
    ["REQUIRE_LOGIN" as const],
    ["PUBLIC" as const],
  ])("mengembalikan visibilitas %s untuk group aktif", (visibility) => {
    expect(resolveGroupStatus({ ...base, visibility }, NOW)).toBe(visibility);
  });
});
```

- [ ] **Step 2: Jalankan, pastikan GAGAL**

```bash
npm test -- tests/groups/status.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/groups/status'`.

- [ ] **Step 3: Tulis `lib/groups/status.ts`**

```ts
export type GroupStatus =
  | "UNSHARED"
  | "EXPIRED"
  | "PRIVATE"
  | "REQUIRE_LOGIN"
  | "PUBLIC";

export type GroupStatusInput = {
  shareEnabled: boolean;
  expiresAt: Date | null;
  visibility: "PRIVATE" | "REQUIRE_LOGIN" | "PUBLIC";
};

/**
 * Satu baris akordeon selalu memuat TEPAT SATU lencana.
 *
 * Ketiga nilai visibility adalah SETELAN, sedangkan tidak-dibagikan dan
 * kedaluwarsa adalah KEADAAN yang membatalkan setelan itu — group yang
 * tidak dapat dicapai siapa pun tidak lagi punya tingkat akses yang
 * berarti. Karena itu keduanya menggantikan lencana visibilitas, bukan
 * menemaninya.
 */
export function resolveGroupStatus(group: GroupStatusInput, now: Date): GroupStatus {
  if (!group.shareEnabled) return "UNSHARED";
  if (group.expiresAt !== null && group.expiresAt.getTime() <= now.getTime()) {
    return "EXPIRED";
  }
  return group.visibility;
}
```

- [ ] **Step 4: Jalankan, pastikan LULUS**

```bash
npm test -- tests/groups/status.test.ts
```

Expected: PASS, 8 test.

- [ ] **Step 5: Tulis `components/dashboard/group-status-badge.tsx`**

```tsx
import { Ban, EyeOff, Globe, Link2Off, Lock } from "lucide-react";

import type { GroupStatus } from "@/lib/groups/status";
import { cn } from "@/lib/utils";

type BadgeShape = {
  label: string;
  Icon: typeof Ban;
  tone: string;
};

/**
 * Satu tata bahasa untuk seluruh lencana: pil rounded-full, garis batas
 * setipis rambut, permukaan bernada tipis — TIDAK PERNAH terisi penuh.
 *
 * Aturan itu yang menjaga satu-satunya elemen terisi penuh di layar tetap
 * berupa tombol yang benar-benar dapat ditindak.
 *
 * Nadanya mengikuti siapa penyebabnya: saklar berbagi yang mati adalah
 * pilihan sadar pemilik, jadi netral; kedaluwarsa terjadi tanpa ia
 * memutuskan apa pun, jadi peringatan.
 */
const SHAPES: Record<GroupStatus, BadgeShape> = {
  UNSHARED: {
    label: "Tidak dibagikan",
    Icon: Link2Off,
    tone: "border-border bg-muted text-muted-foreground",
  },
  EXPIRED: {
    label: "Kedaluwarsa",
    Icon: Ban,
    tone: "border-state-warning/40 bg-state-warning/10 text-state-warning",
  },
  PRIVATE: {
    label: "Privat",
    Icon: EyeOff,
    tone: "border-border bg-muted text-muted-foreground",
  },
  REQUIRE_LOGIN: {
    label: "Wajib masuk",
    Icon: Lock,
    tone: "border-primary/40 bg-primary/10 text-primary",
  },
  PUBLIC: {
    label: "Publik",
    Icon: Globe,
    tone: "border-state-success/40 bg-state-success/10 text-state-success",
  },
};

export function GroupStatusBadge({ status }: { status: GroupStatus }) {
  const { label, Icon, tone } = SHAPES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-sm",
        tone,
      )}
    >
      <Icon className="h-4 w-4" aria-hidden />
      {label}
    </span>
  );
}
```

- [ ] **Step 6: Gerbang dan commit**

```bash
npm run typecheck && npm run lint && npm test
git add lib/groups/status.ts tests/groups/status.test.ts components/dashboard/group-status-badge.tsx
git commit -m "feat(groups): lima keadaan lencana status group"
```

---

## Task 6: Skema Zod, tipe bersama, dan lapisan query

**Files:**
- Create: `lib/validation/group.ts`, `lib/types/group.ts`, `lib/db/prisma-errors.ts`, `lib/db/groups.ts`, `tests/validation/group.test.ts`, `tests/db/prisma-errors.test.ts`

**Interfaces:**
- Consumes: `MIN_SLUG_LENGTH`, `SLUG_PATTERN` dari `lib/groups/resolve-slug.ts`; `MAX_SLUG_LENGTH` dari `lib/groups/slugify.ts`
- Produces:
  - dari `lib/validation/group.ts` — `groupTitleSchema`, `groupSlugSchema`, `groupFormSchema`, `type GroupFormInput = z.infer<typeof groupFormSchema>`
  - dari `lib/types/group.ts` — `type GroupListItem`
  - dari `lib/db/prisma-errors.ts` — `isUniqueConstraintError(error: unknown): boolean`
  - dari `lib/db/groups.ts` — `listGroupsForDashboard(): Promise<GroupListItem[]>`, `listAllSlugs(): Promise<string[]>`, `insertGroup(input: { title: string; slug: string }): Promise<void>`, `updateGroupTitleAndSlug(input: { id: string; title: string; slug: string }): Promise<void>`, `deleteGroupById(id: string): Promise<void>`, `applyGroupOrder(entries: { id: string; sortOrder: number }[]): Promise<void>`, `countGroupItems(id: string): Promise<number>`

- [ ] **Step 1: Tulis test skema Zod**

`tests/validation/group.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { groupSlugSchema, groupTitleSchema } from "@/lib/validation/group";

function firstMessage(result: { success: boolean; error?: { issues: { message: string }[] } }): string {
  return result.error?.issues[0]?.message ?? "";
}

describe("groupTitleSchema", () => {
  it("menerima judul biasa", () => {
    expect(groupTitleSchema.safeParse("Rapat Kerja").success).toBe(true);
  });

  it.each([
    ["kosong", "", "Judul tidak boleh kosong."],
    ["spasi saja", "   ", "Judul tidak boleh kosong."],
    ["lebih dari 120 karakter", "a".repeat(121), "Judul maksimal 120 karakter."],
  ])("menolak judul %s", (_label, value, message) => {
    const result = groupTitleSchema.safeParse(value);
    expect(result.success).toBe(false);
    expect(firstMessage(result)).toBe(message);
  });
});

describe("groupSlugSchema", () => {
  it.each([
    ["slug biasa", "rapat-kerja"],
    ["angka saja", "2026"],
    ["tiga karakter", "abc"],
    ["enam puluh karakter", "a".repeat(60)],
  ])("menerima %s", (_label, value) => {
    expect(groupSlugSchema.safeParse(value).success).toBe(true);
  });

  it.each([
    ["kosong", "", "Slug tidak boleh kosong. Isi dengan huruf atau angka."],
    ["dua karakter", "ab", "Slug minimal 3 karakter."],
    ["lebih dari 60 karakter", "a".repeat(61), "Slug maksimal 60 karakter."],
    ["huruf besar", "Rapat-Kerja", "Slug hanya boleh memuat huruf kecil, angka, dan tanda hubung."],
    ["spasi", "rapat kerja", "Slug hanya boleh memuat huruf kecil, angka, dan tanda hubung."],
    ["tanda hubung di ujung", "rapat-", "Slug hanya boleh memuat huruf kecil, angka, dan tanda hubung."],
    ["tanda hubung berganda", "rapat--kerja", "Slug hanya boleh memuat huruf kecil, angka, dan tanda hubung."],
  ])("menolak slug %s dengan pesannya sendiri", (_label, value, message) => {
    const result = groupSlugSchema.safeParse(value);
    expect(result.success).toBe(false);
    expect(firstMessage(result)).toBe(message);
  });
});
```

- [ ] **Step 2: Tulis test pengenalan galat Prisma**

`tests/db/prisma-errors.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { isUniqueConstraintError } from "@/lib/db/prisma-errors";

describe("isUniqueConstraintError", () => {
  it("mengenali P2002", () => {
    expect(isUniqueConstraintError({ code: "P2002" })).toBe(true);
  });

  it.each([
    ["kode Prisma lain", { code: "P2025" }],
    ["objek tanpa kode", {}],
    ["null", null],
    ["undefined", undefined],
    ["string", "P2002"],
    ["Error biasa", new Error("gagal")],
  ])("menolak %s", (_label, value) => {
    expect(isUniqueConstraintError(value)).toBe(false);
  });
});
```

- [ ] **Step 3: Jalankan keduanya, pastikan GAGAL**

```bash
npm test -- tests/validation/group.test.ts tests/db/prisma-errors.test.ts
```

Expected: FAIL — kedua modul belum ada.

- [ ] **Step 4: Tulis `lib/validation/group.ts`**

```ts
import { z } from "zod";

import { MIN_SLUG_LENGTH, SLUG_PATTERN } from "@/lib/groups/resolve-slug";
import { MAX_SLUG_LENGTH } from "@/lib/groups/slugify";

const MAX_TITLE_LENGTH = 120;

export const groupTitleSchema = z.string().trim().superRefine((value, ctx) => {
  if (value.length === 0) {
    ctx.addIssue({ code: "custom", message: "Judul tidak boleh kosong." });
    return;
  }
  if (value.length > MAX_TITLE_LENGTH) {
    ctx.addIssue({ code: "custom", message: "Judul maksimal 120 karakter." });
  }
});

/**
 * superRefine dipakai, bukan rantai .min()/.max()/.regex(), supaya tiap
 * keadaan punya SATU kalimat yang pasti dan urutan pelaporannya tidak
 * bergantung pada urutan internal Zod. Keenam kalimat ini disetujui
 * pemilik kata per kata dan tidak ditulis ulang saat eksekusi.
 */
export const groupSlugSchema = z.string().trim().superRefine((value, ctx) => {
  if (value.length === 0) {
    ctx.addIssue({ code: "custom", message: "Slug tidak boleh kosong. Isi dengan huruf atau angka." });
    return;
  }
  if (value.length < MIN_SLUG_LENGTH) {
    ctx.addIssue({ code: "custom", message: "Slug minimal 3 karakter." });
    return;
  }
  if (value.length > MAX_SLUG_LENGTH) {
    ctx.addIssue({ code: "custom", message: "Slug maksimal 60 karakter." });
    return;
  }
  if (!SLUG_PATTERN.test(value)) {
    ctx.addIssue({ code: "custom", message: "Slug hanya boleh memuat huruf kecil, angka, dan tanda hubung." });
  }
});

export const groupFormSchema = z.object({
  title: groupTitleSchema,
  slug: groupSlugSchema,
});

export type GroupFormInput = z.infer<typeof groupFormSchema>;
```

- [ ] **Step 5: Tulis `lib/types/group.ts`**

```ts
import type { GroupStatusInput } from "@/lib/groups/status";

/**
 * Bentuk data yang menyeberang dari server component ke cangkang klien.
 * Sengaja tidak memuat kolom yang belum dipakai antarmuka Unit 2.
 */
export type GroupListItem = GroupStatusInput & {
  id: string;
  title: string;
  slug: string;
  sortOrder: number;
  itemCount: number;
};
```

- [ ] **Step 6: Tulis `lib/db/prisma-errors.ts`**

```ts
/**
 * P2002 = pelanggaran constraint unik.
 *
 * Ini penjaga TERAKHIR bentrok slug, bukan yang pertama: memeriksa
 * ketersediaan lalu menulis selalu menyisakan celah balapan, sekecil apa
 * pun pada aplikasi satu pemilik.
 */
export function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === "P2002"
  );
}
```

- [ ] **Step 7: Tulis `lib/db/groups.ts`**

```ts
import "server-only";

import { prisma } from "@/lib/db/client";
import type { GroupListItem } from "@/lib/types/group";

/**
 * Lapisan ini TIDAK mengambil keputusan. Seluruh aturan slug, urutan, dan
 * status sudah diputuskan fungsi murni di lib/groups/ sebelum sampai ke
 * sini — itu yang membuat aturannya punya pengujian, karena proyek ini
 * tidak memiliki database uji.
 */
export async function listGroupsForDashboard(): Promise<GroupListItem[]> {
  const rows = await prisma.group.findMany({
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      title: true,
      slug: true,
      visibility: true,
      shareEnabled: true,
      expiresAt: true,
      sortOrder: true,
      _count: { select: { items: true } },
    },
  });

  return rows.map(({ _count, ...group }) => ({ ...group, itemCount: _count.items }));
}

export async function listAllSlugs(): Promise<string[]> {
  const rows = await prisma.group.findMany({ select: { slug: true } });
  return rows.map((row) => row.slug);
}

/** Group baru duduk di puncak daftar, sejajar dengan baris sisipnya. */
export async function insertGroup(input: { title: string; slug: string }): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.group.updateMany({ data: { sortOrder: { increment: 1 } } });
    await tx.group.create({ data: { title: input.title, slug: input.slug, sortOrder: 0 } });
  });
}

export async function updateGroupTitleAndSlug(input: {
  id: string;
  title: string;
  slug: string;
}): Promise<void> {
  await prisma.group.update({
    where: { id: input.id },
    data: { title: input.title, slug: input.slug },
  });
}

export async function deleteGroupById(id: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.group.delete({ where: { id } });
    const remaining = await tx.group.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true },
    });
    // Berurutan, bukan Promise.all: transaksi interaktif Prisma memakai
    // satu koneksi, dan menembakkan pembaruan serentak ke dalamnya adalah
    // sumber kebuntuan yang muncul hanya sesekali — jenis kegagalan yang
    // paling mahal ditemukan belakangan.
    for (const [index, group] of remaining.entries()) {
      await tx.group.update({ where: { id: group.id }, data: { sortOrder: index } });
    }
  });
}

export async function applyGroupOrder(
  entries: { id: string; sortOrder: number }[],
): Promise<void> {
  await prisma.$transaction(
    entries.map((entry) =>
      prisma.group.update({ where: { id: entry.id }, data: { sortOrder: entry.sortOrder } }),
    ),
  );
}

export async function countGroupItems(id: string): Promise<number> {
  return prisma.item.count({ where: { groupId: id } });
}
```

- [ ] **Step 8: Jalankan test, pastikan LULUS**

```bash
npm test -- tests/validation/group.test.ts tests/db/prisma-errors.test.ts
```

Expected: PASS, 22 test.

- [ ] **Step 9: Gerbang dan commit**

```bash
npm run typecheck && npm run lint && npm test
git add lib/validation/group.ts lib/types/group.ts lib/db/prisma-errors.ts lib/db/groups.ts tests/validation/group.test.ts tests/db/prisma-errors.test.ts
git commit -m "feat(groups): skema validasi, tipe bersama, dan lapisan query"
```

---

## Task 7: Empat server action

**Files:**
- Create: `app/(dashboard)/dashboard/actions.ts`

**Interfaces:**
- Consumes: `requireOwner` dari `lib/auth/session.ts`; `resolveSlug` dari `lib/groups/resolve-slug.ts`; `moveGroup`, `renumberGroups` dari `lib/groups/order.ts`; `groupFormSchema` dari `lib/validation/group.ts`; `isUniqueConstraintError` dari `lib/db/prisma-errors.ts`; seluruh fungsi `lib/db/groups.ts`
- Produces:
  - dari `lib/types/group-action.ts` — `type GroupActionState`, `EMPTY_ACTION_STATE`
  - dari `app/(dashboard)/dashboard/actions.ts` — `createGroupAction(prev: GroupActionState, formData: FormData): Promise<GroupActionState>`, `updateGroupAction(prev: GroupActionState, formData: FormData): Promise<GroupActionState>`, `deleteGroupAction(formData: FormData): Promise<void>`, `moveGroupAction(formData: FormData): Promise<void>`

- [ ] **Step 1: Tulis `lib/types/group-action.ts`**

```ts
/**
 * Berdiri di luar actions.ts secara SENGAJA. Berkas bertanda "use server"
 * hanya boleh mengekspor fungsi async — mengekspor konstanta dari sana
 * menggagalkan build, bukan sekadar melanggar gaya.
 *
 * Bentuk galatnya mengikuti code-standards.md: { error: { code, message } }
 * dengan message berbahasa Indonesia dan aman ditampilkan apa adanya.
 */
export type GroupActionState =
  | { status: "idle" }
  | { status: "ok" }
  | {
      status: "error";
      error: { code: string; message: string };
      field?: "title" | "slug";
      suggestion?: string;
    };

export const EMPTY_ACTION_STATE: GroupActionState = { status: "idle" };
```

- [ ] **Step 2: Tulis `app/(dashboard)/dashboard/actions.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";

import { requireOwner } from "@/lib/auth/session";
import {
  applyGroupOrder,
  deleteGroupById,
  insertGroup,
  listAllSlugs,
  listGroupsForDashboard,
  updateGroupTitleAndSlug,
} from "@/lib/db/groups";
import { isUniqueConstraintError } from "@/lib/db/prisma-errors";
import { moveGroup, renumberGroups } from "@/lib/groups/order";
import { resolveSlug } from "@/lib/groups/resolve-slug";
import type { GroupActionState } from "@/lib/types/group-action";
import { groupFormSchema } from "@/lib/validation/group";

const DASHBOARD_PATH = "/dashboard";

function fieldError(
  field: "title" | "slug",
  message: string,
  suggestion?: string,
): GroupActionState {
  return {
    status: "error",
    error: { code: field === "title" ? "TITLE_INVALID" : "SLUG_INVALID", message },
    field,
    suggestion,
  };
}

const TAKEN_MESSAGE = (requested: string, suggestion: string) =>
  `Slug ${requested} sudah dipakai group lain. Coba ${suggestion}.`;

async function readForm(formData: FormData) {
  const parsed = groupFormSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
  });
  if (parsed.success) return { ok: true as const, data: parsed.data };

  const issue = parsed.error.issues[0];
  const field = issue.path[0] === "title" ? ("title" as const) : ("slug" as const);
  return { ok: false as const, state: fieldError(field, issue.message) };
}

export async function createGroupAction(
  _prev: GroupActionState,
  formData: FormData,
): Promise<GroupActionState> {
  // Layout TIDAK melindungi server action: badan aksi berjalan sebelum
  // layout dirender ulang. Setiap aksi memanggil gerbangnya sendiri.
  await requireOwner();

  const form = await readForm(formData);
  if (!form.ok) return form.state;

  const resolution = resolveSlug({
    title: form.data.title,
    requestedSlug: form.data.slug,
    takenSlugs: await listAllSlugs(),
  });

  if (resolution.status === "conflict") {
    return fieldError(
      "slug",
      TAKEN_MESSAGE(resolution.requested, resolution.suggestion),
      resolution.suggestion,
    );
  }

  try {
    await insertGroup({ title: form.data.title, slug: resolution.slug });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return fieldError("slug", TAKEN_MESSAGE(resolution.slug, `${resolution.slug}-2`), `${resolution.slug}-2`);
    }
    throw error;
  }

  revalidatePath(DASHBOARD_PATH);
  return { status: "ok" };
}

export async function updateGroupAction(
  _prev: GroupActionState,
  formData: FormData,
): Promise<GroupActionState> {
  await requireOwner();

  const id = String(formData.get("id") ?? "");
  const currentSlug = String(formData.get("currentSlug") ?? "");
  if (id.length === 0) {
    return { status: "error", error: { code: "NOT_FOUND", message: "Group tidak ditemukan." } };
  }

  const form = await readForm(formData);
  if (!form.ok) return form.state;

  const resolution = resolveSlug({
    title: form.data.title,
    requestedSlug: form.data.slug,
    takenSlugs: await listAllSlugs(),
    currentSlug,
  });

  if (resolution.status === "conflict") {
    return fieldError(
      "slug",
      TAKEN_MESSAGE(resolution.requested, resolution.suggestion),
      resolution.suggestion,
    );
  }

  try {
    await updateGroupTitleAndSlug({ id, title: form.data.title, slug: resolution.slug });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return fieldError("slug", TAKEN_MESSAGE(resolution.slug, `${resolution.slug}-2`), `${resolution.slug}-2`);
    }
    throw error;
  }

  revalidatePath(DASHBOARD_PATH);
  return { status: "ok" };
}

export async function deleteGroupAction(formData: FormData): Promise<void> {
  await requireOwner();
  const id = String(formData.get("id") ?? "");
  if (id.length === 0) return;

  await deleteGroupById(id);
  revalidatePath(DASHBOARD_PATH);
}

export async function moveGroupAction(formData: FormData): Promise<void> {
  await requireOwner();

  const id = String(formData.get("id") ?? "");
  const direction = formData.get("direction") === "up" ? "up" : "down";
  if (id.length === 0) return;

  const groups = await listGroupsForDashboard();
  await applyGroupOrder(renumberGroups(moveGroup(groups, id, direction)));
  revalidatePath(DASHBOARD_PATH);
}
```

- [ ] **Step 3: Gerbang**

```bash
npm run typecheck && npm run lint && npm test
```

Expected: ketiganya lulus. Berkas ini tidak punya test otomatis — seluruh keputusannya sudah diuji sebagai fungsi murni di Task 1–6, dan sisanya adalah perkabelan yang diverifikasi manual di Task 13.

- [ ] **Step 4: Commit**

```bash
git add lib/types/group-action.ts "app/(dashboard)/dashboard/actions.ts"
git commit -m "feat(dashboard): empat server action untuk group"
```

---

## Task 8: Daftar akordeon, baris terlipat, dan keadaan `localStorage`

**Files:**
- Create: `components/dashboard/group-list.tsx`, `components/dashboard/group-row.tsx`
- Modify: `app/(dashboard)/dashboard/page.tsx`

**Interfaces:**
- Consumes: `GroupListItem` dari `lib/types/group.ts`; `resolveGroupStatus` dari `lib/groups/status.ts`; `GroupStatusBadge` dari `components/dashboard/group-status-badge.tsx`; `formatDateWIT` dari `lib/time/format.ts`; `listGroupsForDashboard` dari `lib/db/groups.ts`
- Produces: `GroupList({ groups }: { groups: GroupListItem[] })` dari `components/dashboard/group-list.tsx`; `GroupRow({ group, now }: { group: GroupListItem; now: Date })` dari `components/dashboard/group-row.tsx`

Task ini menghasilkan daftar yang **dapat dibuka dan dilipat**, belum bisa diubah isinya. Task 9–12 menambahkan tindakan ke dalamnya.

- [ ] **Step 1: Tulis `components/dashboard/group-row.tsx`**

```tsx
import type { GroupListItem } from "@/lib/types/group";
import { resolveGroupStatus } from "@/lib/groups/status";
import { formatDateWIT } from "@/lib/time/format";
import { GroupStatusBadge } from "@/components/dashboard/group-status-badge";

/**
 * Baris terlipat berketinggian TETAP: judul dipotong satu baris dan tidak
 * pernah membungkus. Daftar berbaris seragam dapat dipindai lewat posisi;
 * daftar bergerigi tidak. Judul utuh tetap tersedia di atribut title.
 *
 * Jumlah item ditulis sebagai angka mono redup, sengaja BUKAN lencana,
 * supaya tidak bersaing dengan garis status di kolom kanan.
 */
export function GroupRow({ group, now }: { group: GroupListItem; now: Date }) {
  const status = resolveGroupStatus(group, now);

  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <span className="min-w-0 flex-1 truncate text-base font-medium" title={group.title}>
        {group.title}
      </span>
      <span className="shrink-0 font-mono text-sm text-muted-foreground">
        {group.itemCount} item
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1">
        <GroupStatusBadge status={status} />
        {group.expiresAt !== null && (
          <span className="font-mono text-sm text-muted-foreground">
            {formatDateWIT(group.expiresAt)}
          </span>
        )}
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Tulis `components/dashboard/group-list.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { GroupRow } from "@/components/dashboard/group-row";
import type { GroupListItem } from "@/lib/types/group";
import { cn } from "@/lib/utils";

const OPEN_GROUP_KEY = "kumpulink:open-group";

export function GroupList({ groups, now }: { groups: GroupListItem[]; now: Date }) {
  const [openId, setOpenId] = useState("");

  // Bawaannya TERLIPAT, lalu group yang tersimpan dibuka setelah mount.
  // Membacanya saat render pertama akan membuat keluaran server berbeda
  // dari klien. Id yang groupnya sudah dihapus diabaikan begitu saja.
  useEffect(() => {
    const stored = window.localStorage.getItem(OPEN_GROUP_KEY);
    if (stored && groups.some((group) => group.id === stored)) setOpenId(stored);
  }, [groups]);

  function handleOpenChange(next: string) {
    setOpenId(next);
    window.localStorage.setItem(OPEN_GROUP_KEY, next);
    if (next === "") return;
    // Isi yang baru muncul digulirkan ke atas viewport supaya tidak
    // tertinggal di bawah lipatan. behavior "auto", bukan "smooth":
    // gerakan gulir yang tidak diminta melanggar prefers-reduced-motion.
    requestAnimationFrame(() => {
      document.getElementById(`group-${next}`)?.scrollIntoView({ block: "start" });
    });
  }

  return (
    <Accordion
      type="single"
      collapsible
      value={openId}
      onValueChange={handleOpenChange}
      className="flex flex-col gap-2"
    >
      {groups.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <h2 className="text-base font-medium text-card-foreground">Belum ada group</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Buat group pertama untuk mulai menghimpun tautan dan berkas.
          </p>
        </div>
      )}
      {groups.map((group) => (
        <AccordionItem
          key={group.id}
          value={group.id}
          id={`group-${group.id}`}
          className="rounded-xl border border-border bg-card px-4"
        >
          {/* Pemicu akordeon adalah sebuah <button>. Tombol naik/turun di
              Task 12 WAJIB menjadi saudaranya, bukan anaknya — tombol di
              dalam tombol adalah HTML tak sah dan merusak papan ketik.
              Pembungkus flex ini yang menyediakan tempatnya. */}
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <AccordionTrigger
                className={cn(
                  "gap-3 py-3 hover:no-underline",
                  // ui-context.md menempatkan chevron di KIRI, sedangkan
                  // komponen shadcn hasil generate menaruhnya di kanan
                  // dengan ml-auto. components/ui/ tidak boleh diedit,
                  // jadi posisinya digeser lewat className di sini.
                  "[&_[data-slot=accordion-trigger-icon]]:order-first",
                  "[&_[data-slot=accordion-trigger-icon]]:ml-0",
                  "[&_[data-slot=accordion-trigger-icon]]:mr-3",
                )}
              >
                <GroupRow group={group} now={now} />
              </AccordionTrigger>
            </div>
          </div>
          <AccordionContent className="pb-4">
            <p className="text-sm text-muted-foreground">
              Group ini belum berisi apa-apa. Tambah tautan, PDF, atau gambar.
            </p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
```

- [ ] **Step 3: Ubah `app/(dashboard)/dashboard/page.tsx`**

```tsx
import { GroupList } from "@/components/dashboard/group-list";
import { listGroupsForDashboard } from "@/lib/db/groups";

export default async function DashboardPage() {
  const groups = await listGroupsForDashboard();

  // Keadaan kosong dirender DI DALAM GroupList, bukan sebagai kembalian
  // awal di sini. Mengembalikannya lebih awal ikut menyembunyikan tombol
  // "Group baru", sehingga daftar kosong menjadi jalan buntu — persis
  // pada layar yang paling membutuhkan jalan keluar.
  //
  // `now` dihitung di SERVER lalu diturunkan sebagai prop. Menghitungnya
  // di dalam komponen klien membuat render server dan render klien
  // memakai dua waktu berbeda, dan lencana status ikut berbeda di antara
  // keduanya — persis definisi ketidakcocokan hidrasi.
  return <GroupList groups={groups} now={new Date()} />;
}
```

- [ ] **Step 4: Verifikasi manual**

```bash
npm run dev
```

Buka `http://localhost:3000/dashboard` dan periksa:

- [ ] Daftar kosong menampilkan kalimat "Belum ada group. Buat group pertama…"
- [ ] Setelah beberapa baris `Group` disisipkan lewat `npm run db:studio`, seluruhnya tampil **terlipat**
- [ ] Membuka satu group menutup group yang tadinya terbuka
- [ ] Muat ulang halaman → group yang sama terbuka kembali
- [ ] `Tab` sampai ke pemicu akordeon, lalu `Enter` dan `Space` keduanya membuka dan menutup
- [ ] Pemeriksa elemen menunjukkan `aria-expanded` berubah `false` ↔ `true`
- [ ] Judul panjang terpotong satu baris dan judul utuhnya muncul sebagai tooltip
- [ ] Benar di mode terang **dan** gelap

- [ ] **Step 5: Gerbang dan commit**

```bash
npm run typecheck && npm run lint && npm test
git add components/dashboard/group-list.tsx components/dashboard/group-row.tsx "app/(dashboard)/dashboard/page.tsx"
git commit -m "feat(dashboard): daftar group berbentuk akordeon dengan keadaan tersimpan"
```

---

## Task 9: Baris sisip buat dan ubah

**Files:**
- Create: `components/dashboard/group-form-row.tsx`
- Modify: `components/dashboard/group-list.tsx`

**Interfaces:**
- Consumes: `createGroupAction`, `updateGroupAction`, `EMPTY_ACTION_STATE`, `GroupActionState` dari `app/(dashboard)/dashboard/actions.ts`; `normalizeSlugInput`, `slugify` dari `lib/groups/slugify.ts`
- Produces: `GroupFormRow({ mode, group, onDone }: GroupFormRowProps)` dari `components/dashboard/group-form-row.tsx`, dengan `type GroupFormRowProps = { mode: "create" | "edit"; group?: GroupListItem; onDone: () => void }`

- [ ] **Step 1: Tulis `components/dashboard/group-form-row.tsx`**

```tsx
"use client";

import { useActionState, useEffect, useState } from "react";

import { createGroupAction, updateGroupAction } from "@/app/(dashboard)/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { normalizeSlugInput, slugify } from "@/lib/groups/slugify";
import { EMPTY_ACTION_STATE, type GroupActionState } from "@/lib/types/group-action";
import type { GroupListItem } from "@/lib/types/group";

export type GroupFormRowProps = {
  mode: "create" | "edit";
  group?: GroupListItem;
  onDone: () => void;
};

export function GroupFormRow({ mode, group, onDone }: GroupFormRowProps) {
  const action = mode === "create" ? createGroupAction : updateGroupAction;
  const [state, formAction, pending] = useActionState<GroupActionState, FormData>(
    action,
    EMPTY_ACTION_STATE,
  );

  const [title, setTitle] = useState(group?.title ?? "");
  const [slug, setSlug] = useState(group?.slug ?? "");
  // Kolom slug mengikuti judul SAMPAI disentuh. Setelah itu ia berhenti
  // mengikuti — pemilik sudah memilih dengan sadar.
  const [slugTouched, setSlugTouched] = useState(mode === "edit");

  // Di dalam efek, BUKAN di badan render. Memanggil onDone() saat render
  // mengubah keadaan komponen induk di tengah render anaknya — React
  // memperingatkannya, dan pada kasus terburuk ia berulang tak henti.
  useEffect(() => {
    if (state.status === "ok") onDone();
  }, [state.status, onDone]);

  const error = state.status === "error" ? state : null;
  const suggestion = error?.suggestion;

  return (
    <form action={formAction} className="rounded-xl border border-border bg-card p-4">
      {mode === "edit" && group && (
        <>
          <input type="hidden" name="id" value={group.id} />
          <input type="hidden" name="currentSlug" value={group.slug} />
        </>
      )}

      <label className="block text-sm text-muted-foreground" htmlFor="group-title">
        Judul
      </label>
      <Input
        id="group-title"
        name="title"
        value={title}
        autoFocus
        aria-invalid={error?.field === "title"}
        onChange={(event) => {
          setTitle(event.target.value);
          if (!slugTouched) setSlug(slugify(event.target.value));
        }}
      />
      {error?.field === "title" && (
        <p className="mt-1 text-sm text-state-error">{error.error.message}</p>
      )}

      <label className="mt-3 block text-sm text-muted-foreground" htmlFor="group-slug">
        Slug
      </label>
      <Input
        id="group-slug"
        name="slug"
        value={slug}
        className="font-mono"
        aria-invalid={error?.field === "slug"}
        onChange={(event) => {
          setSlugTouched(true);
          setSlug(normalizeSlugInput(event.target.value));
        }}
      />
      {error?.field === "slug" && (
        <p className="mt-1 text-sm text-state-error">
          {error.error.message}{" "}
          {suggestion && (
            <button type="button" className="underline" onClick={() => setSlug(suggestion)}>
              Pakai {suggestion}
            </button>
          )}
        </p>
      )}

      {/* Hanya muncul bila ada link hidup yang bisa mati. Peringatan yang
          muncul saat tidak ada akibatnya akan berhenti dibaca justru
          ketika akibatnya nyata. */}
      {mode === "edit" && group?.shareEnabled && slug !== group.slug && (
        <p className="mt-1 text-sm text-state-warning">
          Mengubah slug membuat link yang sudah disebarkan berhenti berfungsi.
        </p>
      )}

      <div className="mt-4 flex gap-2">
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

- [ ] **Step 2: Sambungkan ke `components/dashboard/group-list.tsx`**

> `group-list.tsx` tumbuh bertahap lewat Task 9, 10, dan 11. Bentuk **finalnya ditulis utuh di Task 12 Step 2** dan itulah yang menang bila ada perbedaan. Potongan di bawah cukup untuk membuat task ini dapat diverifikasi sendiri.

Tambahkan impor:

```tsx
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GroupFormRow } from "@/components/dashboard/group-form-row";
```

Tambahkan keadaan di dalam `GroupList`:

```tsx
const [creating, setCreating] = useState(false);
const [editingId, setEditingId] = useState<string | null>(null);
```

Sisipkan tepat sebelum `<Accordion …>`:

```tsx
<div className="mb-3 flex justify-end">
  <Button type="button" onClick={() => setCreating(true)}>
    <Plus className="h-5 w-5" aria-hidden />
    Group baru
  </Button>
</div>
{creating && (
  <div className="mb-2">
    <GroupFormRow mode="create" onDone={() => setCreating(false)} />
  </div>
)}
```

Dan di dalam `groups.map`, ganti isi `AccordionContent` menjadi:

```tsx
<AccordionContent className="pb-4">
  {editingId === group.id ? (
    <GroupFormRow mode="edit" group={group} onDone={() => setEditingId(null)} />
  ) : (
    <>
      <p className="text-sm text-muted-foreground">
        Group ini belum berisi apa-apa. Tambah tautan, PDF, atau gambar.
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3"
        onClick={() => setEditingId(group.id)}
      >
        Ubah judul dan slug
      </Button>
    </>
  )}
</AccordionContent>
```

- [ ] **Step 3: Verifikasi manual**

```bash
npm run dev
```

- [ ] "Group baru" → baris formulir muncul di puncak daftar, kursor di kolom Judul
- [ ] Mengetik `Rapat Kerja 2026` → kolom Slug ikut menjadi `rapat-kerja-2026`
- [ ] Menyunting kolom Slug lalu mengetik judul lagi → Slug **tidak** ikut berubah
- [ ] Mengetik `Rapat Kerja:` di kolom Slug → yang tampil `rapat-kerja-` dan tanda hubung di ujung **tetap ada**
- [ ] Menyimpan judul kosong → "Judul tidak boleh kosong."
- [ ] Membuat dua group berjudul sama → yang kedua tersimpan sebagai `rapat-kerja-2` **tanpa galat**
- [ ] Mengetik slug yang sudah dipakai → galat muncul beserta tombol "Pakai …", dan menekannya mengisi kolom
- [ ] Batal menutup baris tanpa menulis apa pun ke database
- [ ] Benar di mode terang **dan** gelap

- [ ] **Step 4: Gerbang dan commit**

```bash
npm run typecheck && npm run lint && npm test
git add components/dashboard/group-form-row.tsx components/dashboard/group-list.tsx
git commit -m "feat(dashboard): baris sisip untuk membuat dan mengubah group"
```

---

## Task 10: Bilah penyaring dan kedua keadaan kosong

**Files:**
- Create: `components/dashboard/group-filter-bar.tsx`, `components/dashboard/group-empty-state.tsx`
- Modify: `components/dashboard/group-list.tsx`

**Interfaces:**
- Consumes: `GroupListItem`, `resolveGroupStatus`
- Produces:
  - `type GroupSegment = "active" | "inactive" | "all"`, `GroupFilterBar({ query, segment, onQueryChange, onSegmentChange })` dari `components/dashboard/group-filter-bar.tsx`
  - `GroupEmptyState({ reason }: { reason: "none" | "filtered" })` dari `components/dashboard/group-empty-state.tsx`

- [ ] **Step 1: Tulis `components/dashboard/group-empty-state.tsx`**

```tsx
/**
 * Dua kalimat yang sengaja berbeda. Menyatakan "belum ada group" ketika
 * yang terjadi adalah penyaring terlalu sempit membuat pemilik
 * menyimpulkan hal yang keliru tentang datanya sendiri.
 */
const MESSAGES = {
  none: {
    title: "Belum ada group",
    body: "Buat group pertama untuk mulai menghimpun tautan dan berkas.",
  },
  filtered: {
    title: "Tidak ada group yang cocok",
    body: "Kosongkan kolom pencarian atau pilih Semua.",
  },
} as const;

export function GroupEmptyState({ reason }: { reason: "none" | "filtered" }) {
  const { title, body } = MESSAGES[reason];
  return (
    <div className="rounded-xl border border-border bg-card p-8 text-center">
      <h2 className="text-base font-medium text-card-foreground">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
```

- [ ] **Step 2: Tulis `components/dashboard/group-filter-bar.tsx`**

```tsx
"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type GroupSegment = "active" | "inactive" | "all";

const SEGMENTS: { value: GroupSegment; label: string }[] = [
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Nonaktif" },
  { value: "all", label: "Semua" },
];

export function GroupFilterBar({
  query,
  segment,
  onQueryChange,
  onSegmentChange,
}: {
  query: string;
  segment: GroupSegment;
  onQueryChange: (value: string) => void;
  onSegmentChange: (value: GroupSegment) => void;
}) {
  return (
    <div className="sticky top-0 z-10 mb-3 flex flex-col gap-2 bg-background py-2 sm:flex-row sm:items-center">
      <div className="relative min-w-0 flex-1">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          className="pl-9"
          placeholder="Cari group"
          aria-label="Cari group"
        />
      </div>
      <div role="group" aria-label="Saring menurut keadaan" className="flex gap-1">
        {SEGMENTS.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={segment === option.value}
            onClick={() => onSegmentChange(option.value)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm",
              segment === option.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Sambungkan ke `components/dashboard/group-list.tsx`**

Tambahkan impor dan keadaan:

```tsx
import { GroupFilterBar, type GroupSegment } from "@/components/dashboard/group-filter-bar";
import { GroupEmptyState } from "@/components/dashboard/group-empty-state";
import { resolveGroupStatus } from "@/lib/groups/status";

const [query, setQuery] = useState("");
const [segment, setSegment] = useState<GroupSegment>("active");

const filtering = query.trim() !== "" || segment !== "all";
const visible = groups.filter((group) => {
  const status = resolveGroupStatus(group, now);
  const inactive = status === "UNSHARED" || status === "EXPIRED";
  if (segment === "active" && inactive) return false;
  if (segment === "inactive" && !inactive) return false;
  return group.title.toLowerCase().includes(query.trim().toLowerCase());
});
```

Render `<GroupFilterBar …>` di atas `<Accordion>`, ganti `groups.map` menjadi `visible.map`, dan sisipkan sebelum akordeon:

```tsx
{visible.length === 0 && <GroupEmptyState reason={filtering ? "filtered" : "none"} />}
```

- [ ] **Step 4: Verifikasi manual**

- [ ] Bawaan segmen adalah **Aktif**, dan group yang belum dibagikan tidak tampil
- [ ] Segmen **Semua** menampilkan seluruhnya
- [ ] Mengetik di kolom pencarian menyaring menurut judul, tanpa memuat ulang halaman
- [ ] Pencarian yang tidak menemukan apa pun → "Tidak ada group yang cocok…" — **bukan** "Belum ada group"
- [ ] Bilahnya tetap menempel di atas saat daftar digulir
- [ ] Segmen dapat dicapai dengan `Tab` dan ditekan dengan `Enter`; `aria-pressed` berubah
- [ ] Benar di mode terang **dan** gelap

- [ ] **Step 5: Gerbang dan commit**

```bash
npm run typecheck && npm run lint && npm test
git add components/dashboard/group-filter-bar.tsx components/dashboard/group-empty-state.tsx components/dashboard/group-list.tsx
git commit -m "feat(dashboard): bilah penyaring group dan dua keadaan kosong"
```

---

## Task 11: Dialog hapus dengan konsekuensi terhitung

**Files:**
- Create: `components/dashboard/group-delete-dialog.tsx`
- Modify: `components/dashboard/group-list.tsx`

**Interfaces:**
- Consumes: `deleteGroupAction` dari `app/(dashboard)/dashboard/actions.ts`
- Produces: `GroupDeleteDialog({ group, open, onOpenChange })` dari `components/dashboard/group-delete-dialog.tsx`

- [ ] **Step 1: Tulis `components/dashboard/group-delete-dialog.tsx`**

```tsx
"use client";

import { deleteGroupAction } from "@/app/(dashboard)/dashboard/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { GroupListItem } from "@/lib/types/group";

/**
 * Dialognya menyebut ANGKA sungguhan, bukan peringatan umum. Peringatan
 * yang tidak menyebutkan apa yang hilang tidak menolong siapa pun
 * memutuskan.
 *
 * Selalu muncul tanpa syarat, supaya perilakunya sama di Unit 2 dan Unit
 * 3. Aturan bersyarat akan membuat dialog ini tidak pernah tampil di Unit
 * 2 — dan fitur yang tidak pernah tampil adalah fitur yang tidak teruji.
 */
export function GroupDeleteDialog({
  group,
  open,
  onOpenChange,
}: {
  group: GroupListItem;
  open: boolean;
  onOpenChange: (next: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>Hapus group ini?</DialogTitle>
          <DialogDescription>
            Group “{group.title}” beserta {group.itemCount} item akan dihapus permanen.
            Riwayat aksesnya tetap disimpan. Link yang sudah disebarkan akan berhenti
            berfungsi.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" autoFocus onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <form action={deleteGroupAction}>
            <input type="hidden" name="id" value={group.id} />
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

- [ ] **Step 2: Sambungkan ke `components/dashboard/group-list.tsx`**

Tambahkan impor `GroupDeleteDialog` dan `Trash2`, keadaan `const [deletingId, setDeletingId] = useState<string | null>(null);`, lalu di dalam `AccordionContent` tambahkan di samping tombol "Ubah judul dan slug":

```tsx
<Button
  type="button"
  variant="outline"
  size="sm"
  className="mt-3 text-state-error"
  onClick={() => setDeletingId(group.id)}
>
  <Trash2 className="h-4 w-4" aria-hidden />
  Hapus group
</Button>
{deletingId === group.id && (
  <GroupDeleteDialog
    group={group}
    open
    onOpenChange={(next) => setDeletingId(next ? group.id : null)}
  />
)}
```

- [ ] **Step 3: Verifikasi manual**

- [ ] Dialog menyebut judul group dan **jumlah item sungguhan**
- [ ] Fokus mendarat di **Batal**, bukan di Hapus
- [ ] `Esc` menutup dialog tanpa menghapus
- [ ] Menghapus group di tengah daftar → daftar tetap berurut rapat tanpa celah
- [ ] Benar di mode terang **dan** gelap

- [ ] **Step 4: Gerbang dan commit**

```bash
npm run typecheck && npm run lint && npm test
git add components/dashboard/group-delete-dialog.tsx components/dashboard/group-list.tsx
git commit -m "feat(dashboard): dialog hapus group dengan konsekuensi terhitung"
```

---

## Task 12: Tombol naik dan turun, urutan optimistis, dan pengumuman

**Files:**
- Create: `components/dashboard/group-reorder-buttons.tsx`
- Modify: `components/dashboard/group-list.tsx`

**Interfaces:**
- Consumes: `moveGroupAction` dari `app/(dashboard)/dashboard/actions.ts`; `moveGroup` dari `lib/groups/order.ts`
- Produces: `GroupReorderButtons({ group, index, total, onMove })` dari `components/dashboard/group-reorder-buttons.tsx`

- [ ] **Step 1: Tulis `components/dashboard/group-reorder-buttons.tsx`**

```tsx
"use client";

import { ChevronDown, ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { GroupListItem } from "@/lib/types/group";

/**
 * Tombol di tepi DISEMBUNYIKAN, bukan diabukan. Kontrol nonaktif yang
 * tetap terlihat sebagai tombol hanya mengundang ketukan yang gagal.
 *
 * Ini juga satu-satunya cara menyusun ulang group di unit ini — bukan
 * cadangan bagi geser, melainkan jalur utamanya.
 */
export function GroupReorderButtons({
  group,
  index,
  total,
  onMove,
}: {
  group: GroupListItem;
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
          aria-label={`Naikkan urutan ${group.title}`}
          onClick={(event) => {
            event.stopPropagation();
            onMove("up");
          }}
        >
          <ChevronUp className="h-4 w-4" aria-hidden />
        </Button>
      )}
      {index < total - 1 && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={`Turunkan urutan ${group.title}`}
          onClick={(event) => {
            event.stopPropagation();
            onMove("down");
          }}
        >
          <ChevronDown className="h-4 w-4" aria-hidden />
        </Button>
      )}
    </span>
  );
}
```

- [ ] **Step 2: Tulis ulang `components/dashboard/group-list.tsx` secara utuh**

Berkas ini tumbuh lewat Task 8, 9, 10, dan 11. Di bawah adalah bentuk **finalnya** — tulis apa adanya, menggantikan seluruh isi berkas, supaya tidak ada perakitan yang perlu ditebak.

```tsx
"use client";

import { useCallback, useEffect, useOptimistic, useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";

import { moveGroupAction } from "@/app/(dashboard)/dashboard/actions";
import { GroupDeleteDialog } from "@/components/dashboard/group-delete-dialog";
import { GroupEmptyState } from "@/components/dashboard/group-empty-state";
import { GroupFilterBar, type GroupSegment } from "@/components/dashboard/group-filter-bar";
import { GroupFormRow } from "@/components/dashboard/group-form-row";
import { GroupReorderButtons } from "@/components/dashboard/group-reorder-buttons";
import { GroupRow } from "@/components/dashboard/group-row";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { moveGroup } from "@/lib/groups/order";
import { resolveGroupStatus } from "@/lib/groups/status";
import type { GroupListItem } from "@/lib/types/group";
import { cn } from "@/lib/utils";

const OPEN_GROUP_KEY = "kumpulink:open-group";

const TRIGGER_ICON_LEFT = cn(
  // ui-context.md menempatkan chevron di KIRI, sedangkan komponen shadcn
  // hasil generate menaruhnya di kanan dengan ml-auto. components/ui/
  // tidak boleh diedit, jadi posisinya digeser lewat className di sini.
  "[&_[data-slot=accordion-trigger-icon]]:order-first",
  "[&_[data-slot=accordion-trigger-icon]]:ml-0",
  "[&_[data-slot=accordion-trigger-icon]]:mr-3",
);

export function GroupList({ groups, now }: { groups: GroupListItem[]; now: Date }) {
  const [openId, setOpenId] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [segment, setSegment] = useState<GroupSegment>("active");
  const [announcement, setAnnouncement] = useState("");
  const [, startTransition] = useTransition();

  const [order, applyMove] = useOptimistic(
    groups,
    (current: GroupListItem[], move: { id: string; direction: "up" | "down" }) =>
      moveGroup(current, move.id, move.direction),
  );

  // Bawaannya TERLIPAT, lalu group yang tersimpan dibuka setelah mount.
  // Membacanya saat render pertama akan membuat keluaran server berbeda
  // dari klien. Id yang groupnya sudah dihapus diabaikan begitu saja.
  useEffect(() => {
    const stored = window.localStorage.getItem(OPEN_GROUP_KEY);
    if (stored && groups.some((group) => group.id === stored)) setOpenId(stored);
  }, [groups]);

  function handleOpenChange(next: string) {
    setOpenId(next);
    window.localStorage.setItem(OPEN_GROUP_KEY, next);
    if (next === "") return;
    // behavior "auto", bukan "smooth": gulir yang tidak diminta melanggar
    // prefers-reduced-motion.
    requestAnimationFrame(() => {
      document.getElementById(`group-${next}`)?.scrollIntoView({ block: "start" });
    });
  }

  const filtering = query.trim() !== "" || segment !== "all";
  const visible = order.filter((group) => {
    const status = resolveGroupStatus(group, now);
    const inactive = status === "UNSHARED" || status === "EXPIRED";
    if (segment === "active" && inactive) return false;
    if (segment === "inactive" && !inactive) return false;
    return group.title.toLowerCase().includes(query.trim().toLowerCase());
  });

  function handleMove(group: GroupListItem, direction: "up" | "down") {
    const moved = moveGroup(order, group.id, direction);
    const position = moved.findIndex((entry) => entry.id === group.id) + 1;
    setAnnouncement(`${group.title} dipindah ke posisi ${position} dari ${moved.length}.`);
    startTransition(async () => {
      applyMove({ id: group.id, direction });
      const formData = new FormData();
      formData.set("id", group.id);
      formData.set("direction", direction);
      await moveGroupAction(formData);
    });
  }

  const stopCreating = useCallback(() => setCreating(false), []);
  const stopEditing = useCallback(() => setEditingId(null), []);

  return (
    <>
      <GroupFilterBar
        query={query}
        segment={segment}
        onQueryChange={setQuery}
        onSegmentChange={setSegment}
      />

      <div className="mb-3 flex justify-end">
        <Button type="button" onClick={() => setCreating(true)}>
          <Plus className="h-5 w-5" aria-hidden />
          Group baru
        </Button>
      </div>

      {creating && (
        <div className="mb-2">
          <GroupFormRow mode="create" onDone={stopCreating} />
        </div>
      )}

      {visible.length === 0 && <GroupEmptyState reason={filtering ? "filtered" : "none"} />}

      <Accordion
        type="single"
        collapsible
        value={openId}
        onValueChange={handleOpenChange}
        className="flex flex-col gap-2"
      >
        {visible.map((group, index) => (
          <AccordionItem
            key={group.id}
            value={group.id}
            id={`group-${group.id}`}
            className="rounded-xl border border-border bg-card px-4"
          >
            {/* Pemicu akordeon adalah sebuah <button>. Tombol naik/turun
                WAJIB menjadi saudaranya, bukan anaknya — tombol di dalam
                tombol adalah HTML tak sah dan merusak papan ketik. */}
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <AccordionTrigger className={cn("gap-3 py-3 hover:no-underline", TRIGGER_ICON_LEFT)}>
                  <GroupRow group={group} now={now} />
                </AccordionTrigger>
              </div>
              {!filtering && (
                <GroupReorderButtons
                  group={group}
                  index={index}
                  total={visible.length}
                  onMove={(direction) => handleMove(group, direction)}
                />
              )}
            </div>

            <AccordionContent className="pb-4">
              {editingId === group.id ? (
                <GroupFormRow mode="edit" group={group} onDone={stopEditing} />
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Group ini belum berisi apa-apa. Tambah tautan, PDF, atau gambar.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingId(group.id)}
                    >
                      Ubah judul dan slug
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-state-error"
                      onClick={() => setDeletingId(group.id)}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                      Hapus group
                    </Button>
                  </div>
                  {deletingId === group.id && (
                    <GroupDeleteDialog
                      group={group}
                      open
                      onOpenChange={(next) => setDeletingId(next ? group.id : null)}
                    />
                  )}
                </>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {filtering && (
        <p className="mt-3 text-sm text-muted-foreground">
          Urutan hanya dapat diubah saat menampilkan Semua.
        </p>
      )}

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </>
  );
}
```

- [ ] **Step 3: Verifikasi manual**

- [ ] Segmen **Semua** → tombol naik/turun tampil
- [ ] Segmen **Aktif** atau kolom pencarian terisi → tombol **hilang**, dan keterangan "Urutan hanya dapat diubah saat menampilkan Semua." muncul
- [ ] Baris teratas tidak punya tombol naik; baris terbawah tidak punya tombol turun
- [ ] Menekan tombol memindahkan baris **seketika**, sebelum server menjawab
- [ ] Muat ulang halaman → urutannya bertahan
- [ ] Menekan tombol tidak ikut membuka atau menutup akordeonnya
- [ ] Pembaca layar mengumumkan "… dipindah ke posisi 2 dari 7."
- [ ] Benar di mode terang **dan** gelap

- [ ] **Step 4: Gerbang dan commit**

```bash
npm run typecheck && npm run lint && npm test
git add components/dashboard/group-reorder-buttons.tsx components/dashboard/group-list.tsx
git commit -m "feat(dashboard): penyusunan ulang group dengan tombol naik dan turun"
```

---

## Task 13: Penutupan unit

**Files:**
- Modify: `context/progress-tracker.md`, `ROADMAP.md`

**Interfaces:**
- Consumes: seluruh task sebelumnya
- Produces: —

- [ ] **Step 1: Periksa ukuran berkas**

```bash
npx --yes wc -l components/dashboard/*.tsx lib/groups/*.ts "app/(dashboard)/dashboard/actions.ts"
```

Expected: tidak satu pun melewati 200 baris. Bila `group-list.tsx` melewatinya, pecah keadaan penyaring ke dalam hook `components/dashboard/use-group-filter.ts` sebelum melanjutkan.

- [ ] **Step 2: Jalankan keempat gerbang**

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

Expected: `typecheck` 0 galat · `lint` 0 peringatan · seluruh test lulus · `build` sukses.

- [ ] **Step 3: Pastikan direction contract masih ada di keluaran build**

```bash
python -c "import re;h=open('.next/server/app/_not-found.html',encoding='utf-8').read();print(bool(re.search(r'<!--\s*\nTHESIS(?:(?!-->).)*provenance\s*\n-->',h,re.S)))"
```

Expected: `True`.

- [ ] **Step 4: Verifikasi ujung ke ujung**

- [ ] Pemilik membuat tiga group berturut-turut, seluruhnya di bawah satu menit
- [ ] Dua di antaranya berjudul sama → slugnya `rapat-kerja` dan `rapat-kerja-2`
- [ ] Judul salah satunya diubah, slugnya ikut mengikuti
- [ ] Slug salah satunya diketik tangan menjadi milik group lain → ditolak beserta usulan
- [ ] Ketiganya disusun ulang dengan tombol, urutannya bertahan setelah muat ulang
- [ ] Satu group dihapus lewat dialog, sisanya tetap berurut rapat
- [ ] Seluruh langkah di atas diulang di mode gelap

- [ ] **Step 5: Perbarui `context/progress-tracker.md` dan `ROADMAP.md`**

Catat di `## Current Phase`: Unit 2 tutup, tanggalnya, keempat gerbang, dan **empat keputusan yang lahir di sesi brainstorming**: lencana "Tidak dibagikan" bernada netral menggantikan "Nonaktif" untuk saklar mati; slug turunan diberi akhiran diam-diam sedangkan slug ketikan tangan ditolak; penomoran ulang rapat pada setiap pemindahan dan penghapusan; kontrol urutan disembunyikan saat daftar tersaring. Centang exit criteria Fase 3 di `ROADMAP.md`.

- [ ] **Step 6: Commit**

```bash
git add context/progress-tracker.md ROADMAP.md
git commit -m "docs: tutup Unit 2 di progress-tracker dan ROADMAP"
```

---

## Verifikasi keseluruhan

Unit 2 selesai bila seluruh baris berikut **dijalankan dan hasilnya dibaca**:

- [ ] Pemilik membuat beberapa group, mengubah judul dan slugnya, dan melihatnya sebagai daftar akordeon yang dapat dilipat — kriteria "Selesai bila" dari `ai-workflow-rules.md`
- [ ] Bawaan akordeon terlipat; hanya satu terbuka pada satu waktu; keadaannya bertahan setelah muat ulang
- [ ] Keadaan lipat tersimpan di `localStorage`, dan **tidak ada** kolom database yang menyimpannya
- [ ] Akordeon dapat dioperasikan penuh dengan papan ketik dan `aria-expanded` berubah
- [ ] Tombol naik/turun punya `aria-label` dan pemindahannya diumumkan lewat `aria-live`
- [ ] Slug turunan bentrok mendapat akhiran diam-diam; slug ketikan tangan bentrok ditolak beserta usulan
- [ ] Keenam kalimat galat tampil persis seperti yang tertulis di rencana ini
- [ ] `grep -rn "Math.random" lib/ app/ components/` tidak menghasilkan apa pun
- [ ] Menghapus group meminta konfirmasi dan menyebutkan jumlah item sungguhan
- [ ] `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` keempatnya lulus
- [ ] Tidak ada nilai heksadesimal di `components/dashboard/`
- [ ] Seluruh permukaan benar di mode terang dan gelap
