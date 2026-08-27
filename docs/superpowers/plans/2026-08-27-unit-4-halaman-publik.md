# Unit 4 bagian kedua — halaman publik, gerbang item, dan `lib/audit/`

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun pemanggil `evaluateAccess()` — halaman group publik, gerbang item yang mencatat dan meneruskan, `lib/audit/`, layar masuk dengan `callbackUrl`, dan rate limit per IP di Postgres.

**Architecture:** Gerbang item adalah satu route handler yang memikul rate limit, evaluasi, pencatatan, dan penerusan; keluaran berbentuk HTML dijawab 303 ke route anak yang mengevaluasi ulang dan tidak mencatat. Halaman group adalah server component dinamis yang kuerinya tidak pernah membaca `targetUrl` maupun `fileKey`. Seluruh logika yang dapat dimurnikan — jendela rate limit, penyandian `Content-Disposition`, baris ringkasan, penyusunan `callbackUrl` — hidup sebagai fungsi murni di `lib/`, karena proyek ini tidak memiliki database uji.

**Tech Stack:** Next.js 15 App Router, TypeScript strict, Prisma + PostgreSQL, Auth.js v5 (Google), Vercel Blob private store, Zod, Tailwind + shadcn/ui, Vitest.

**Spesifikasi:** `docs/superpowers/specs/2026-08-27-unit-4-halaman-publik-design.md`. Baca lebih dulu. Keputusan U4-4 sampai U4-9 di sana adalah alasan di balik bentuk yang diminta plan ini.

## Global Constraints

- **Tiga baris merah proyek** (`CLAUDE.md`): semua akses ke konten melewati `lib/access/evaluate-access.ts`; log akses ditulis di server, tuntas, sebelum pengalihan atau pengaliran; keadaan yang tidak pasti selalu berarti menolak.
- Seluruh teks yang dilihat pengguna berbahasa **Indonesia**. Nama variabel, fungsi, tabel, dan kolom berbahasa **Inggris**.
- Jangan mengarang perilaku produk yang tidak terdefinisi di file konteks. Bila menemukan yang ambigu, hentikan dan laporkan — jangan tebak.
- Berkas melewati ±200 baris adalah tanda ia mengerjakan lebih dari satu hal. Kekecualiannya hanya berkas matriks pengujian.
- Nama berkas `kebab-case`, nama komponen `PascalCase`.
- `strict` TypeScript wajib. Tidak ada `any`. Input eksternal divalidasi Zod di batas sistem.
- Server component sebagai bawaan; `"use client"` hanya bila interaktivitas peramban benar-benar diperlukan.
- Setiap `page.tsx` dan `route.ts` di bawah `app/(public)/` memuat `export const dynamic = "force-dynamic"`. Tidak ada `revalidate`, tidak ada `generateStaticParams`, di mana pun di bawah `app/(public)/`.
- Warna hanya lewat token CSS custom property. Tidak ada nilai heksadesimal di komponen. Setiap komponen benar di mode terang **dan** gelap.
- Mobile-first: gaya dasar untuk layar sempit, lalu breakpoint ke atas.
- `components/ui/*` dan `prisma/migrations/*` adalah berkas terlindungi. Jangan disunting.
- Hanya `lib/storage/blob.ts` yang mengimpor SDK `@vercel/blob`.
- Hanya `lib/audit/` yang menyentuh `prisma.accessLog`.
- Empat gerbang wajib hijau sebelum sebuah task dianggap selesai: `npm run typecheck`, `npm run lint` (nol peringatan), `npm test`, dan — pada task terakhir — `npm run build`.
- Commit berbahasa Indonesia, bentuk conventional commit, dan diakhiri baris `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.

## Struktur berkas

**Dibuat:**

| Berkas | Tanggung jawab |
| --- | --- |
| `prisma/schema.prisma` (diubah) | Model `RateLimitCounter` |
| `lib/ratelimit/window.ts` | Jendela dan ambang sebagai fungsi murni |
| `lib/ratelimit/counter.ts` | Baca dan naikkan penghitung di Postgres |
| `lib/audit/forwarded-ip.ts` | Hop pertama `x-forwarded-for`, fungsi murni |
| `lib/audit/request-context.ts` | Membaca header permintaan |
| `lib/audit/log-access.ts` | Satu-satunya penulis `AccessLog` |
| `lib/storage/content-disposition.ts` | Penyandian nama berkas, fungsi murni |
| `lib/storage/blob.ts` (diubah) | `getFileStream()` |
| `lib/db/gate.ts` | Kueri gerbang — satu-satunya kueri publik yang membaca `fileKey` |
| `lib/db/public-group.ts` | Kueri halaman group — tanpa `fileKey` dan `targetUrl` |
| `lib/groups/item-summary.ts` | Baris ringkasan, fungsi murni |
| `lib/auth/callback-url.ts` | Penyusunan dan validasi `redirectTo`, fungsi murni |
| `lib/auth/actions.ts` | Server action masuk dan keluar |
| `app/(public)/layout.tsx` | Kolom terpusat `max-w-2xl` |
| `app/(public)/error.tsx` | Halaman galat pencatatan, HTTP 500 |
| `app/(public)/not-found.tsx` | Halaman tidak tersedia, HTTP 404 |
| `app/(public)/tidak-tersedia/page.tsx` | Sasaran 303 gerbang; badannya `notFound()` |
| `app/(public)/galat-pencatatan/page.tsx` | Sasaran 303 gerbang; badannya `throw` |
| `app/(public)/g/[slug]/page.tsx` | Halaman group publik |
| `app/(public)/g/[slug]/i/[itemId]/route.ts` | Gerbang item |
| `app/(public)/g/[slug]/i/[itemId]/masuk/page.tsx` | Layar masuk gerbang item |
| `components/public/unavailable-page.tsx` | Isi halaman tidak tersedia |
| `components/public/login-screen.tsx` | Layar masuk, dipakai dua tempat |
| `components/public/identity-bar.tsx` | Nama dan tombol keluar |
| `components/public/owner-preview-banner.tsx` | Spanduk pratinjau pemilik |
| `components/public/group-header.tsx` | Judul, slug mono, baris ringkasan |
| `components/public/access-badge.tsx` | Lencana keadaan akses |
| `components/public/item-card.tsx` | Kartu item |

**Pengujian dibuat:** `tests/ratelimit/window.test.ts`, `tests/audit/forwarded-ip.test.ts`, `tests/audit/access-log-boundary.test.ts`, `tests/storage/content-disposition.test.ts`, `tests/db/public-select-boundary.test.ts`, `tests/groups/item-summary.test.ts`, `tests/auth/callback-url.test.ts`, `tests/public/dynamic-rendering-boundary.test.ts`, `tests/public/no-target-url-boundary.test.ts`.

---

### Task 1: Tabel penghitung dan `lib/ratelimit/`

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `lib/ratelimit/window.ts`
- Create: `lib/ratelimit/counter.ts`
- Test: `tests/ratelimit/window.test.ts`
- Modify: `context/architecture.md`, `context/code-standards.md`

**Interfaces:**
- Consumes: `prisma` dari `lib/db/client.ts` (ekspor bernama `prisma`).
- Produces: `WINDOW_MS`, `MAX_FAILURES`, `RETENTION_MS`, `ITEM_GATE_SCOPE`, `resolveWindowStart(now: Date, windowMs?: number): Date`, `isOverLimit(count: number, max?: number): boolean`, `readFailureCount(scope: string, ipAddress: string, now: Date): Promise<number>`, `recordFailure(scope: string, ipAddress: string, now: Date): Promise<void>`.

- [ ] **Step 1: Tulis pengujian yang gagal**

Buat `tests/ratelimit/window.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import {
  MAX_FAILURES,
  WINDOW_MS,
  isOverLimit,
  resolveWindowStart,
} from "@/lib/ratelimit/window";

describe("jendela rate limit", () => {
  it("membulatkan ke bawah ke kelipatan sepuluh menit", () => {
    const now = new Date("2026-08-27T10:07:31.500Z");
    expect(resolveWindowStart(now).toISOString()).toBe("2026-08-27T10:00:00.000Z");
  });

  it("menempatkan waktu tepat di batas jendela pada jendela yang baru", () => {
    const now = new Date("2026-08-27T10:10:00.000Z");
    expect(resolveWindowStart(now).toISOString()).toBe("2026-08-27T10:10:00.000Z");
  });

  it("menempatkan satu milidetik sebelum batas pada jendela sebelumnya", () => {
    const now = new Date("2026-08-27T10:09:59.999Z");
    expect(resolveWindowStart(now).toISOString()).toBe("2026-08-27T10:00:00.000Z");
  });

  it("memakai jendela sepuluh menit", () => {
    expect(WINDOW_MS).toBe(600_000);
  });

  it("meloloskan percobaan gagal ke-20 dan menahan yang ke-21", () => {
    expect(isOverLimit(MAX_FAILURES - 1)).toBe(false);
    expect(isOverLimit(MAX_FAILURES)).toBe(true);
    expect(isOverLimit(MAX_FAILURES + 1)).toBe(true);
  });
});
```

- [ ] **Step 2: Jalankan pengujian dan pastikan ia gagal**

Run: `npm test -- tests/ratelimit/window.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/ratelimit/window"`.

- [ ] **Step 3: Tulis implementasi minimalnya**

Buat `lib/ratelimit/window.ts`:

```ts
/**
 * Jendela tetap sepuluh menit, ambang dua puluh KEGAGALAN — bukan dua
 * puluh permintaan. Alasannya keputusan U4-5: dua ratus peserta di WiFi
 * ruang acara berbagi satu alamat IP, sehingga menghitung seluruh
 * permintaan akan mencekik satu ruangan penuh peserta sah alih-alih
 * penebak itemId. Akses yang berhasil tidak pernah menaikkan penghitung.
 *
 * Murni, tanpa Prisma, supaya batas jendelanya dapat diuji tanpa
 * database — alasan yang sama yang memisahkan lib/groups/ dan lib/access/.
 */
export const WINDOW_MS = 10 * 60 * 1000;
export const MAX_FAILURES = 20;

/** Baris berjendela lebih tua dari ini disapu saat penghitung naik. */
export const RETENTION_MS = 60 * 60 * 1000;

/** Kolom `scope` ada supaya rate limit kedua kelak tidak menuntut tabel kedua. */
export const ITEM_GATE_SCOPE = "item-gate";

export function resolveWindowStart(now: Date, windowMs: number = WINDOW_MS): Date {
  return new Date(Math.floor(now.getTime() / windowMs) * windowMs);
}

export function isOverLimit(count: number, max: number = MAX_FAILURES): boolean {
  return count >= max;
}
```

- [ ] **Step 4: Jalankan pengujian dan pastikan ia lulus**

Run: `npm test -- tests/ratelimit/window.test.ts`
Expected: PASS, 5 pengujian.

- [ ] **Step 5: Tambahkan model Prisma**

Sisipkan di `prisma/schema.prisma`, setelah model `AccessLog`:

```prisma
// K7 — penghitung rate limit per alamat IP untuk route gerbang item.
//
// Bentuknya sengaja ditunda ke Unit 4 oleh architecture.md, tempat
// logikanya ditulis. Penghitung naik HANYA pada percobaan yang gagal
// (keputusan U4-5): satu ruangan berisi dua ratus peserta di balik satu
// IP ber-NAT tidak boleh saling menghabiskan kuota satu sama lain.
model RateLimitCounter {
  id          String   @id @default(cuid())
  scope       String
  ipAddress   String
  windowStart DateTime
  count       Int      @default(0)

  @@unique([scope, ipAddress, windowStart])
  @@index([windowStart])
}
```

- [ ] **Step 6: Jalankan migrasi**

Run: `npm run db:migrate -- --name tambah_rate_limit_counter`
Expected: migrasi baru terbuat di `prisma/migrations/`, klien Prisma di-generate ulang, keluaran memuat `Your database is now in sync with your schema`.

Bila `DATABASE_URL` tidak terjangkau, **hentikan dan laporkan** — jangan menyunting migrasi lama dan jangan melanjutkan ke task berikutnya.

- [ ] **Step 7: Tulis lapisan Postgres-nya**

Buat `lib/ratelimit/counter.ts`:

```ts
import "server-only";

import { prisma } from "@/lib/db/client";
import { RETENTION_MS, resolveWindowStart } from "@/lib/ratelimit/window";

/**
 * Lapisan ini TIDAK mengambil keputusan — ambangnya diputuskan
 * isOverLimit() di lib/ratelimit/window.ts. Pola yang sama dengan
 * lib/db/: yang punya aturan adalah fungsi murni, yang menyentuh
 * database hanya menjalankan.
 */
export async function readFailureCount(
  scope: string,
  ipAddress: string,
  now: Date,
): Promise<number> {
  const row = await prisma.rateLimitCounter.findUnique({
    where: {
      scope_ipAddress_windowStart: {
        scope,
        ipAddress,
        windowStart: resolveWindowStart(now),
      },
    },
    select: { count: true },
  });

  return row?.count ?? 0;
}

/**
 * Menyapu baris kedaluwarsa dalam panggilan yang sama, bukan lewat
 * pekerjaan berjadwal: invarian 14 melarang route handler menjalankan
 * pekerjaan latar, dan kenaikan ini terjadi paling banyak dua puluh kali
 * per IP per sepuluh menit sehingga penyapuannya murah.
 */
export async function recordFailure(
  scope: string,
  ipAddress: string,
  now: Date,
): Promise<void> {
  const windowStart = resolveWindowStart(now);

  await prisma.rateLimitCounter.upsert({
    where: { scope_ipAddress_windowStart: { scope, ipAddress, windowStart } },
    create: { scope, ipAddress, windowStart, count: 1 },
    update: { count: { increment: 1 } },
  });

  await prisma.rateLimitCounter.deleteMany({
    where: { windowStart: { lt: new Date(now.getTime() - RETENTION_MS) } },
  });
}
```

- [ ] **Step 8: Perbarui `context/code-standards.md`**

Di bagian **File Organization**, sisipkan setelah baris `lib/audit/`:

```markdown
- `lib/ratelimit/` — penghitung rate limit per alamat IP. Ambang dan
  jendelanya fungsi murni di `window.ts`, lapisan Postgres-nya di
  `counter.ts` — pemisahan yang sama dengan `lib/groups/`
```

- [ ] **Step 9: Perbarui `context/architecture.md`**

Di bagian **System Boundaries**, sisipkan setelah butir `lib/audit/`:

```markdown
- `lib/ratelimit/` — penghitung rate limit per alamat IP untuk route
  gerbang item. Ambang dan jendela sebagai fungsi murni; hanya
  `counter.ts` yang menyentuh Prisma.
```

Di bagian **Storage Model**, ganti paragraf yang berbunyi "Tabel penghitung rate limit **belum didefinisikan** dan sengaja ditunda ke Unit 4 (K7)…" seluruhnya dengan:

```markdown
Tabel penghitung rate limit adalah `RateLimitCounter`, dibuat di Unit 4:
`scope`, `ipAddress`, `windowStart`, dan `count`, dengan kunci unik
gabungan atas ketiganya yang pertama. Jendela tetap sepuluh menit,
ambang dua puluh, dan baris berjendela lebih tua dari satu jam disapu
saat penghitung naik.

**Penghitung naik hanya pada percobaan yang GAGAL** — keputusan U4-5.
Langkah 0 gerbang item tetap membaca penghitung di setiap permintaan,
tetapi kenaikannya terjadi sesudah evaluasi, di cabang `DENIED` saja.
Alasannya: dua ratus peserta di WiFi ruang acara berbagi satu alamat IP,
sehingga menghitung seluruh permintaan akan mencekik satu ruangan penuh
peserta sah alih-alih penebak `itemId`. Kegagalan `RATE_LIMITED` sendiri
tidak menaikkan penghitung, supaya jendelanya dapat berakhir.
```

- [ ] **Step 10: Jalankan keempat gerbang**

Run: `npm run typecheck && npm run lint && npm test`
Expected: typecheck 0 galat; lint 0 peringatan; seluruh pengujian lulus (285 pengujian, 23 berkas).

- [ ] **Step 11: Commit**

```bash
git add prisma lib/ratelimit tests/ratelimit context/architecture.md context/code-standards.md
git commit -m "$(cat <<'EOF'
feat(ratelimit): tabel penghitung per IP dan jendela sepuluh menit

Penghitung naik hanya pada percobaan yang gagal (U4-5). Menghitung
seluruh permintaan akan mencekik satu ruangan berisi dua ratus peserta
di balik satu IP ber-NAT, bukan penebak itemId.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: `lib/audit/` dan batas penulisan `AccessLog`

**Files:**
- Create: `lib/audit/forwarded-ip.ts`, `lib/audit/request-context.ts`, `lib/audit/log-access.ts`
- Test: `tests/audit/forwarded-ip.test.ts`, `tests/audit/access-log-boundary.test.ts`
- Modify: `context/code-standards.md`, `context/architecture.md`

**Interfaces:**
- Consumes: `prisma` dari `lib/db/client.ts`.
- Produces: `firstForwardedIp(headerValue: string | null): string | null`; `readRequestContext(): Promise<RequestContext>` dengan `type RequestContext = { ipAddress: string | null; userAgent: string | null }`; `type Visitor = { userId: string | null; visitorName: string | null; visitorEmail: string | null }`; `logPageView(input: { groupId: string; visitor: Visitor; context: RequestContext }): Promise<void>`; `logItemAccess(input: { groupId: string; itemId: string; visitor: Visitor; outcome: Outcome; denyReason?: DenyReason | null; context: RequestContext }): Promise<void>`.

- [ ] **Step 1: Tulis pengujian yang gagal untuk pembacaan IP**

Buat `tests/audit/forwarded-ip.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { firstForwardedIp } from "@/lib/audit/forwarded-ip";

describe("pembacaan alamat IP dari x-forwarded-for", () => {
  it("mengambil hop pertama, bukan yang terakhir", () => {
    expect(firstForwardedIp("203.0.113.7, 70.41.3.18, 150.172.238.178")).toBe("203.0.113.7");
  });

  it("memangkas spasi di kedua ujung", () => {
    expect(firstForwardedIp("  203.0.113.7  ")).toBe("203.0.113.7");
  });

  it("mengembalikan null bila headernya tidak ada", () => {
    expect(firstForwardedIp(null)).toBeNull();
  });

  it("mengembalikan null bila headernya kosong atau hanya koma", () => {
    expect(firstForwardedIp("")).toBeNull();
    expect(firstForwardedIp("   ")).toBeNull();
    expect(firstForwardedIp(", 70.41.3.18")).toBeNull();
  });
});
```

- [ ] **Step 2: Jalankan pengujian dan pastikan ia gagal**

Run: `npm test -- tests/audit/forwarded-ip.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/audit/forwarded-ip"`.

- [ ] **Step 3: Tulis implementasinya**

Buat `lib/audit/forwarded-ip.ts`:

```ts
/**
 * Hop PERTAMA, bukan yang terakhir: proksi menambahkan dirinya di ujung
 * kanan, sehingga alamat pengunjung ada di ujung kiri. Di atas Vercel
 * header ini dipasang proksi dan tidak dapat dipalsukan klien.
 *
 * Murni dan berdiri sendiri di luar request-context.ts supaya dapat
 * diuji tanpa memuat `next/headers`.
 */
export function firstForwardedIp(headerValue: string | null): string | null {
  if (headerValue === null) return null;
  const first = headerValue.split(",")[0]?.trim() ?? "";
  return first === "" ? null : first;
}
```

Buat `lib/audit/request-context.ts`:

```ts
import "server-only";

import { headers } from "next/headers";

import { firstForwardedIp } from "@/lib/audit/forwarded-ip";

export type RequestContext = {
  ipAddress: string | null;
  userAgent: string | null;
};

export async function readRequestContext(): Promise<RequestContext> {
  const headerList = await headers();
  return {
    ipAddress: firstForwardedIp(headerList.get("x-forwarded-for")),
    userAgent: headerList.get("user-agent"),
  };
}
```

- [ ] **Step 4: Jalankan pengujian dan pastikan ia lulus**

Run: `npm test -- tests/audit/forwarded-ip.test.ts`
Expected: PASS, 4 pengujian.

- [ ] **Step 5: Tulis penulis `AccessLog`**

Buat `lib/audit/log-access.ts`:

```ts
import "server-only";

import type { DenyReason, Outcome } from "@prisma/client";

import type { RequestContext } from "@/lib/audit/request-context";
import { prisma } from "@/lib/db/client";

/**
 * SATU-SATUNYA berkas di repositori ini yang menyentuh prisma.accessLog.
 * Ditegakkan tests/audit/access-log-boundary.test.ts, bukan oleh
 * disiplin — batas yang hanya dijaga kebiasaan akan bocor pada unit
 * berikutnya.
 *
 * Kedua fungsi MELEMPAR saat gagal dan tidak menelan galat apa pun.
 * Konsekuensi kegagalan berbeda antara GRANTED dan DENIED, dan yang
 * berhak memutuskannya adalah pemanggil — bukan modul ini.
 */

/**
 * Nama dan email DISALIN ke baris log pada saat kejadian, bukan dirujuk.
 * Riwayat adalah catatan peristiwa, bukan pandangan atas keadaan
 * sekarang: data pengguna boleh berubah kemudian tanpa mengubah apa yang
 * tercatat pernah terjadi.
 */
export type Visitor = {
  userId: string | null;
  visitorName: string | null;
  visitorEmail: string | null;
};

/**
 * Dicatat bila DAN HANYA BILA pengunjung sedang masuk — berlaku sama
 * untuk ketiga nilai visibility. Kunjungan anonim tidak dicatat, karena
 * barisnya banyak dan tidak menjawab pertanyaan siapa pun. Pemanggil
 * yang memutuskan syarat itu; fungsi ini hanya menulis.
 */
export async function logPageView(input: {
  groupId: string;
  visitor: Visitor;
  context: RequestContext;
}): Promise<void> {
  await prisma.accessLog.create({
    data: {
      eventType: "PAGE_VIEW",
      groupId: input.groupId,
      outcome: "GRANTED",
      userId: input.visitor.userId,
      visitorName: input.visitor.visitorName,
      visitorEmail: input.visitor.visitorEmail,
      ipAddress: input.context.ipAddress,
      userAgent: input.context.userAgent,
    },
  });
}

/**
 * SELALU dicatat, termasuk untuk pengunjung anonim pada item terbuka.
 * Barisnya tetap berguna sebagai hitungan klik meski kolom identitasnya
 * kosong.
 */
export async function logItemAccess(input: {
  groupId: string;
  itemId: string;
  visitor: Visitor;
  outcome: Outcome;
  denyReason?: DenyReason | null;
  context: RequestContext;
}): Promise<void> {
  await prisma.accessLog.create({
    data: {
      eventType: "ITEM_ACCESS",
      groupId: input.groupId,
      itemId: input.itemId,
      outcome: input.outcome,
      denyReason: input.denyReason ?? null,
      userId: input.visitor.userId,
      visitorName: input.visitor.visitorName,
      visitorEmail: input.visitor.visitorEmail,
      ipAddress: input.context.ipAddress,
      userAgent: input.context.userAgent,
    },
  });
}
```

- [ ] **Step 6: Tulis pengujian batasnya**

Buat `tests/audit/access-log-boundary.test.ts`:

```ts
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOTS = ["app", "components", "lib"];
const ALLOWED = "lib/audit/log-access.ts";

/**
 * Disusun dari potongan supaya namanya TIDAK muncul utuh di berkas ini.
 * Kalau ditulis apa adanya, pengujian ini akan menemukan dirinya sendiri
 * dan gagal selamanya. Pola yang sama dengan blob-import-boundary.test.ts.
 */
const TABLE_ACCESS = ["prisma.access", "Log"].join("");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

describe("batas penulisan AccessLog", () => {
  it("hanya lib/audit/log-access.ts yang menyentuh tabel AccessLog", () => {
    const offenders = ROOTS.flatMap(walk)
      .filter((file) => file.endsWith(".ts") || file.endsWith(".tsx"))
      .filter((file) => readFileSync(file, "utf8").includes(TABLE_ACCESS))
      .map((file) => file.split("\\").join("/"));

    expect(offenders).toEqual([ALLOWED]);
  });
});
```

- [ ] **Step 7: Jalankan pengujian batasnya**

Run: `npm test -- tests/audit/access-log-boundary.test.ts`
Expected: PASS, 1 pengujian.

- [ ] **Step 8: Perbarui `context/code-standards.md`**

Di bagian **Audit Logging**, ganti butir yang berbunyi "Kegagalan menulis log pada akses `GRANTED` membatalkan penerusan…" dengan:

```markdown
- Kegagalan menulis log pada peristiwa yang MENYAJIKAN sesuatu berarti
  tidak ada yang disajikan. Itu berlaku untuk `ITEM_ACCESS / GRANTED`
  yang membatalkan penerusan, dan sama persis untuk `PAGE_VIEW` yang
  membatalkan render halaman group. Meneruskan pengunjung tanpa jejak
  lebih buruk daripada gagal membuka berkas — itu justru menghapus
  alasan aplikasi ini dibuat. Dua aturan berbeda untuk dua peristiwa
  akan menjadi dua perilaku yang harus diingat, dan yang lebih longgar
  akan menjadi preseden bagi yang berikutnya.
- Kegagalan menulis `ITEM_ACCESS / DENIED` dicatat ke konsol server lalu
  ditelan, dan halaman tidak tersedia tetap tampil. Pengunjung yang
  ditolak tidak sedang menerima apa pun, jadi tidak ada yang perlu
  dibatalkan. Ditetapkan 27 Agustus 2026 sebagai keputusan U4-7.
```

- [ ] **Step 9: Perbarui `context/architecture.md`**

Di bagian **AccessLog**, tepat setelah paragraf yang dimulai "`ITEM_ACCESS` selalu dicatat…", sisipkan:

```markdown
**Kegagalan menulis log.** Peristiwa yang menyajikan sesuatu —
`ITEM_ACCESS / GRANTED` dan `PAGE_VIEW` — membatalkan penyajiannya
ketika penulisan lognya gagal, dan pengunjung menerima halaman galat
pencatatan berstatus 500. Penolakan tidak: kegagalan menulis
`ITEM_ACCESS / DENIED` dicatat ke konsol server lalu ditelan.
Ditetapkan 27 Agustus 2026, keputusan U4-7.
```

- [ ] **Step 10: Jalankan keempat gerbang**

Run: `npm run typecheck && npm run lint && npm test`
Expected: typecheck 0 galat; lint 0 peringatan; seluruh pengujian lulus.

- [ ] **Step 11: Commit**

```bash
git add lib/audit tests/audit context/architecture.md context/code-standards.md
git commit -m "$(cat <<'EOF'
feat(audit): penulisan AccessLog dengan satu batas yang diuji

Kedua fungsi melempar saat gagal; yang memutuskan konsekuensinya adalah
pemanggil, karena akibat kegagalan berbeda antara GRANTED dan DENIED
(U4-7).

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Penyandian `Content-Disposition` dan `getFileStream()`

**Files:**
- Create: `lib/storage/content-disposition.ts`
- Modify: `lib/storage/blob.ts`
- Test: `tests/storage/content-disposition.test.ts`

**Interfaces:**
- Produces: `inlineContentDisposition(fileName: string | null): string`; `getFileStream(pathname: string): Promise<StoredFile | null>` dengan `type StoredFile = { stream: ReadableStream<Uint8Array>; contentType: string | null }`. Mengembalikan `null` berarti berkasnya tidak ada di Blob.

- [ ] **Step 1: Tulis pengujian yang gagal**

Buat `tests/storage/content-disposition.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { inlineContentDisposition } from "@/lib/storage/content-disposition";

describe("header Content-Disposition", () => {
  it("selalu inline, tidak pernah attachment", () => {
    expect(inlineContentDisposition("rundown.pdf")).toContain("inline");
    expect(inlineContentDisposition("rundown.pdf")).not.toContain("attachment");
  });

  it("menyertakan nama berkas ASCII apa adanya", () => {
    expect(inlineContentDisposition("rundown.pdf")).toBe(
      `inline; filename="rundown.pdf"; filename*=UTF-8''rundown.pdf`,
    );
  });

  it("menyandikan nama berkas non-ASCII di filename* dan menggantinya di filename", () => {
    const header = inlineContentDisposition("notulen–rapat.pdf");
    expect(header).toContain(`filename="notulen_rapat.pdf"`);
    expect(header).toContain(`filename*=UTF-8''notulen%E2%80%93rapat.pdf`);
  });

  it("menetralkan tanda kutip ganda yang akan memutus header", () => {
    const header = inlineContentDisposition(`ru"ndown.pdf`);
    expect(header).toContain(`filename="ru_ndown.pdf"`);
  });

  it("menetralkan karakter kendali yang akan menyisipkan header baru", () => {
    const header = inlineContentDisposition("rundown\r\nX-Injected: 1.pdf");
    expect(header).not.toContain("\r");
    expect(header).not.toContain("\n");
  });

  it("mengembalikan inline saja bila nama berkas tidak ada atau kosong", () => {
    expect(inlineContentDisposition(null)).toBe("inline");
    expect(inlineContentDisposition("   ")).toBe("inline");
  });
});
```

- [ ] **Step 2: Jalankan pengujian dan pastikan ia gagal**

Run: `npm test -- tests/storage/content-disposition.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/storage/content-disposition"`.

- [ ] **Step 3: Tulis implementasinya**

Buat `lib/storage/content-disposition.ts`:

```ts
/**
 * `route.ts` unggahan sudah membersihkan fileName saat MENULIS, tetapi
 * yang menaruh nilai itu di sebuah header adalah Unit 4 — dan sanitasi
 * di sisi tulis tidak melindungi baris yang sudah terlanjur ada di
 * database. Penyandiannya karena itu ditegakkan lagi di sini, di titik
 * nilai itu menjadi header.
 *
 * Dua bentuk sekaligus, sesuai RFC 6266: `filename` ASCII sebagai jalur
 * mundur, dan `filename*` bersandi UTF-8 untuk peramban yang memahaminya.
 */
const NON_ASCII_OR_UNSAFE = /[^\x20-\x7e]|["\\]/g;

function toAsciiFallback(fileName: string): string {
  return fileName.replace(NON_ASCII_OR_UNSAFE, "_");
}

function toRfc5987(fileName: string): string {
  return encodeURIComponent(fileName).replace(
    /['()*]/g,
    (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

export function inlineContentDisposition(fileName: string | null): string {
  if (fileName === null || fileName.trim() === "") return "inline";
  return `inline; filename="${toAsciiFallback(fileName)}"; filename*=UTF-8''${toRfc5987(fileName)}`;
}
```

- [ ] **Step 4: Jalankan pengujian dan pastikan ia lulus**

Run: `npm test -- tests/storage/content-disposition.test.ts`
Expected: PASS, 6 pengujian.

- [ ] **Step 5: Baca bentuk sebenarnya `get()` di SDK yang terpasang**

Run: `npx tsc --noEmit --declaration false 2>/dev/null; cat node_modules/@vercel/blob/dist/index.d.ts | grep -n "declare function get\|GetBlobResult\|statusCode\|stream" | head -40`
Expected: keluaran memperlihatkan tanda tangan `get()` beserta bentuk kembaliannya.

`architecture.md` menyebut kembaliannya memuat `stream`, `blob.contentType`, `blob.etag`, dan `statusCode`. **Sesuaikan Step 6 dengan yang benar-benar ada di `.d.ts`, bukan dengan yang tertulis di dokumen.** Bila keduanya berbeda, tulis kode mengikuti SDK dan laporkan selisihnya supaya `architecture.md` diperbaiki di task terakhir.

- [ ] **Step 6: Tambahkan `getFileStream()` ke `lib/storage/blob.ts`**

Sisipkan di `lib/storage/blob.ts`. Ubah baris impor menjadi `import { del, get, list, put } from "@vercel/blob";`, lalu tambahkan setelah `putFile()`:

```ts
export type StoredFile = {
  stream: ReadableStream<Uint8Array>;
  contentType: string | null;
};

/**
 * Ia MENGALIRKAN isi berkas, bukan menyusun URL. Tidak ada URL Blob yang
 * boleh sampai ke peramban dalam bentuk apa pun — invarian 3.
 *
 * Mengembalikan null bila berkasnya tidak ada. Pemanggilnya yang
 * menandai item.isBroken dan mencatat DENIED / FILE_MISSING; modul ini
 * tidak tahu apa-apa tentang item maupun riwayat.
 */
export async function getFileStream(pathname: string): Promise<StoredFile | null> {
  try {
    const result = await get(pathname, { access: "private" });
    if (result === null || result.statusCode === 404) return null;
    return { stream: result.stream, contentType: result.blob.contentType ?? null };
  } catch {
    // Berkas tidak ditemukan tidak boleh terbaca sebagai kegagalan
    // server. Bentuk galatnya berbeda antar versi SDK, jadi yang
    // dipegang di sini adalah hasilnya: tidak ada berkas untuk
    // dialirkan.
    return null;
  }
}
```

- [ ] **Step 7: Jalankan keempat gerbang**

Run: `npm run typecheck && npm run lint && npm test`
Expected: typecheck 0 galat; lint 0 peringatan; seluruh pengujian lulus, termasuk `blob-import-boundary` yang tetap hijau karena `get` diimpor di berkas yang sama.

- [ ] **Step 8: Commit**

```bash
git add lib/storage tests/storage
git commit -m "$(cat <<'EOF'
feat(storage): getFileStream dan penyandian Content-Disposition

Sanitasi fileName ditegakkan lagi di titik ia menjadi header, karena
sanitasi di sisi tulis tidak melindungi baris yang sudah ada.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Dua kueri baru dan batas kolom halaman publik

**Files:**
- Create: `lib/db/gate.ts`, `lib/db/public-group.ts`
- Test: `tests/db/public-select-boundary.test.ts`
- Modify: `context/architecture.md`

**Interfaces:**
- Consumes: `prisma`; `AccessRequestRecord`, `AccessGroup`, `AccessItem` dari `lib/types/access.ts`.
- Produces:
  - `readGateData(slug: string, itemId: string, userId: string | null): Promise<GateData>` dengan `type GateData = { group: GateGroup | null; item: GateItem | null; request: AccessRequestRecord }`.
  - `type GateGroup = { id: string; title: string; slug: string; shareEnabled: boolean; expiresAt: Date | null; visibility: Visibility }`.
  - `type GateItem = { id: string; groupId: string; title: string; isActive: boolean; accessMode: AccessMode; source: ItemSource; targetUrl: string | null; fileKey: string | null; fileName: string | null; mimeType: string | null }`.
  - `markItemBroken(itemId: string): Promise<void>`.
  - `readPublicGroup(slug: string): Promise<PublicGroup | null>` dengan `type PublicGroup = { id: string; title: string; slug: string; description: string | null; shareEnabled: boolean; expiresAt: Date | null; visibility: Visibility; items: PublicItem[] }` dan `type PublicItem = { id: string; title: string; description: string | null; type: ItemType; source: ItemSource; accessMode: AccessMode }`.

- [ ] **Step 1: Tulis kueri gerbang**

Buat `lib/db/gate.ts`:

```ts
import "server-only";

import type { AccessMode, ItemSource, Visibility } from "@prisma/client";

import { prisma } from "@/lib/db/client";
import type { AccessRequestRecord } from "@/lib/types/access";

/**
 * Kueri KEDUA di repositori ini yang membaca fileKey dan targetUrl; yang
 * pertama adalah pra-baca sesaat sebelum penghapusan. Keduanya hidup di
 * server dan hasilnya TIDAK PERNAH terserialisasi ke peramban —
 * kembalian fungsi ini hanya dibaca route handler gerbang, yang
 * memakainya untuk menyusun 302 atau mengalirkan byte, lalu membuangnya.
 *
 * Kueri halaman group ada di lib/db/public-group.ts dan sengaja TIDAK
 * memuat kedua kolom itu.
 */
export type GateGroup = {
  id: string;
  title: string;
  slug: string;
  shareEnabled: boolean;
  expiresAt: Date | null;
  visibility: Visibility;
};

export type GateItem = {
  id: string;
  groupId: string;
  title: string;
  isActive: boolean;
  accessMode: AccessMode;
  source: ItemSource;
  targetUrl: string | null;
  fileKey: string | null;
  fileName: string | null;
  mimeType: string | null;
};

export type GateData = {
  group: GateGroup | null;
  item: GateItem | null;
  request: AccessRequestRecord;
};

/**
 * Catatan AccessRequest diambil DI SINI dan diberikan ke evaluator
 * sebagai argumen — evaluator tidak boleh mengambilnya sendiri, karena
 * itu menghancurkan kemurniannya. Ia diambil meski cabang APPROVAL masih
 * menolak sepanjang Unit 4, supaya Unit 7 mengubah isi evaluator dan
 * bukan pemanggilnya.
 */
export async function readGateData(
  slug: string,
  itemId: string,
  userId: string | null,
): Promise<GateData> {
  const [group, item] = await Promise.all([
    prisma.group.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
        shareEnabled: true,
        expiresAt: true,
        visibility: true,
      },
    }),
    prisma.item.findUnique({
      where: { id: itemId },
      select: {
        id: true,
        groupId: true,
        title: true,
        isActive: true,
        accessMode: true,
        source: true,
        targetUrl: true,
        fileKey: true,
        fileName: true,
        mimeType: true,
      },
    }),
  ]);

  const request =
    userId === null
      ? null
      : await prisma.accessRequest.findUnique({
          where: { itemId_userId: { itemId, userId } },
          select: { status: true, expiresAt: true },
        });

  return { group, item, request };
}

export async function markItemBroken(itemId: string): Promise<void> {
  await prisma.item.update({ where: { id: itemId }, data: { isBroken: true } });
}
```

- [ ] **Step 2: Tulis kueri halaman group**

Buat `lib/db/public-group.ts`:

```ts
import "server-only";

import type { AccessMode, ItemSource, ItemType, Visibility } from "@prisma/client";

import { prisma } from "@/lib/db/client";

/**
 * Kolom tujuan item TIDAK ADA di select ini, dan itu satu-satunya alasan
 * kriteria sukses nomor 3 dapat diperiksa dengan membaca sepuluh baris
 * alih-alih menelusuri setiap komponen. Pola yang sama dengan LIST_SELECT
 * di lib/db/items.ts, dan alasan yang sama pula: bukan karena
 * komponennya tidak memakainya, melainkan supaya nilainya tidak pernah
 * sampai ke berkas yang merender.
 *
 * Jangan menggantinya dengan `include`, dan jangan menambahkan
 * `targetUrl` "untuk pratinjau". Pratinjau pun melewati gerbang item.
 * Ditegakkan tests/db/public-select-boundary.test.ts.
 */
export type PublicItem = {
  id: string;
  title: string;
  description: string | null;
  type: ItemType;
  source: ItemSource;
  accessMode: AccessMode;
};

export type PublicGroup = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  shareEnabled: boolean;
  expiresAt: Date | null;
  visibility: Visibility;
  items: PublicItem[];
};

export async function readPublicGroup(slug: string): Promise<PublicGroup | null> {
  return prisma.group.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      shareEnabled: true,
      expiresAt: true,
      visibility: true,
      items: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          source: true,
          accessMode: true,
        },
      },
    },
  });
}
```

- [ ] **Step 3: Tulis pengujian batasnya**

Buat `tests/db/public-select-boundary.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("lib/db/public-group.ts", "utf8");

const FORBIDDEN = ["targetUrl", "fileKey"];

describe("batas kolom kueri halaman publik", () => {
  it.each(FORBIDDEN)("tidak pernah membaca kolom %s", (column) => {
    expect(source).not.toContain(column);
  });
});
```

- [ ] **Step 4: Jalankan pengujian dan pastikan ia lulus**

Run: `npm test -- tests/db/public-select-boundary.test.ts`
Expected: PASS, 2 pengujian.

Bila ia MERAH, jangan melonggarkan pengujiannya — hapus kolomnya dari kueri.

- [ ] **Step 5: Perbarui rumusan invarian 3 di `context/architecture.md`**

Di bagian **Invariants** butir 3, ganti kalimat "kueri yang melayani antarmuka memakai `select` yang tidak memuat kolom itu, dan satu-satunya kueri yang membacanya adalah pra-baca sesaat sebelum penghapusan" dengan:

```markdown
kueri yang melayani antarmuka memakai `select` yang tidak memuat kolom
itu, dan hanya dua kueri yang membacanya: pra-baca sesaat sebelum
penghapusan, dan `lib/db/gate.ts` yang melayani route handler gerbang
item. Keduanya hidup di server, dan kembaliannya dipakai untuk menyusun
pengalihan atau mengalirkan byte — tidak pernah diserahkan ke komponen
yang dirender.
```

- [ ] **Step 6: Jalankan keempat gerbang**

Run: `npm run typecheck && npm run lint && npm test`
Expected: typecheck 0 galat; lint 0 peringatan; seluruh pengujian lulus.

- [ ] **Step 7: Commit**

```bash
git add lib/db tests/db context/architecture.md
git commit -m "$(cat <<'EOF'
feat(db): kueri gerbang dan kueri halaman publik yang terpisah

Kueri halaman publik tidak pernah membaca targetUrl maupun fileKey, dan
pemisahan itu ditegakkan pengujian batas, bukan kehati-hatian.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Kerangka `app/(public)/` dan ketiga halaman keadaan

**Files:**
- Create: `app/(public)/layout.tsx`, `app/(public)/not-found.tsx`, `app/(public)/error.tsx`, `app/(public)/tidak-tersedia/page.tsx`, `app/(public)/galat-pencatatan/page.tsx`
- Create: `components/public/unavailable-page.tsx`
- Test: `tests/public/dynamic-rendering-boundary.test.ts`
- Modify: `context/ui-context.md`

**Interfaces:**
- Produces: rute `/tidak-tersedia` (303 dari gerbang → 404) dan `/galat-pencatatan` (303 dari gerbang → 500); komponen `UnavailablePage` tanpa props.

- [ ] **Step 1: Tulis pengujian batas render dinamis**

Buat `tests/public/dynamic-rendering-boundary.test.ts`:

```ts
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join("app", "(public)");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const files = walk(ROOT).map((file) => file.split("\\").join("/"));
const routable = files.filter(
  (file) => file.endsWith("/page.tsx") || file.endsWith("/route.ts"),
);

/**
 * RISIKO cache Fase 5 sebagai pengujian merah, bukan kewaspadaan. Satu
 * revalidate atau satu generateStaticParams yang lolos berarti satu
 * pengunjung menerima halaman yang dibuat untuk sesi orang lain.
 */
describe("render dinamis di seluruh app/(public)", () => {
  it("menemukan setidaknya satu halaman atau route untuk diperiksa", () => {
    expect(routable.length).toBeGreaterThan(0);
  });

  it.each(routable)("%s dirender dinamis", (file) => {
    expect(readFileSync(file, "utf8")).toContain(`export const dynamic = "force-dynamic"`);
  });

  it.each(files)("%s tidak memakai cache statis", (file) => {
    const source = readFileSync(file, "utf8");
    expect(source).not.toContain("generateStaticParams");
    expect(source).not.toContain("export const revalidate");
  });
});
```

- [ ] **Step 2: Jalankan pengujian dan pastikan ia gagal**

Run: `npm test -- tests/public/dynamic-rendering-boundary.test.ts`
Expected: FAIL — `ENOENT: no such file or directory, scandir 'app\(public)'`.

- [ ] **Step 3: Buat layout publik**

Buat `app/(public)/layout.tsx`:

```tsx
/**
 * Satu kolom terpusat max-w-2xl dengan padding lega. Tidak ada bilah
 * samping dan tidak ada navigasi lain — halaman publik hanya boleh
 * memperlihatkan satu group, tanpa jejak group lain (invarian 4).
 *
 * Bilah identitas TIDAK di sini melainkan di halaman yang memilikinya:
 * halaman tidak tersedia tidak boleh tahu apa pun, termasuk siapa yang
 * sedang membukanya.
 */
export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-12">{children}</main>
    </div>
  );
}
```

- [ ] **Step 4: Buat halaman tidak tersedia**

Buat `components/public/unavailable-page.tsx`:

```tsx
/**
 * Halaman terpendek di aplikasi, dan satu-satunya yang tidak boleh tahu
 * apa pun: tanpa nama group, tanpa baris kembali, tanpa tautan ke /g/
 * mana pun, tanpa saran alamat, dan tanpa "mungkin maksud Anda". Semua
 * keramahan semacam itu membocorkan keberadaan group. Kekosongannya
 * adalah fiturnya.
 *
 * Dipakai not-found.tsx untuk NOT_FOUND, REVOKED, dan EXPIRED sekaligus,
 * sehingga ketiganya menghasilkan halaman dan kode status yang identik —
 * kriteria sukses nomor 5, dijaga oleh satu berkas komponen dan bukan
 * oleh dua halaman yang kebetulan ditulis mirip.
 */
export function UnavailablePage() {
  return (
    <div className="py-16">
      <h1 className="text-xl font-medium">Halaman ini tidak tersedia.</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Link mungkin sudah tidak berlaku atau alamatnya keliru.
      </p>
    </div>
  );
}
```

Buat `app/(public)/not-found.tsx`:

```tsx
import { UnavailablePage } from "@/components/public/unavailable-page";

export default function PublicNotFound() {
  return <UnavailablePage />;
}
```

Buat `app/(public)/tidak-tersedia/page.tsx`:

```tsx
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * Sasaran 303 dari route handler gerbang item, yang tidak dapat merender
 * komponen React sendiri. Badannya memanggil notFound() supaya Next
 * merender app/(public)/not-found.tsx dengan status 404 — halaman dan
 * kode status yang sama persis dengan yang diterima pengunjung halaman
 * group yang ditolak.
 */
export default function TidakTersediaPage() {
  notFound();
}
```

- [ ] **Step 5: Buat halaman galat pencatatan**

Buat `app/(public)/error.tsx`:

```tsx
"use client";

/**
 * Halaman galat pencatatan — keputusan U4-8.
 *
 * Aplikasi ini membatalkan penerusan ketika penulisan AccessLog gagal,
 * dan pengunjung berhak tahu bahwa keadaannya sementara. Memakai kembali
 * halaman tidak tersedia ditolak karena ia berbohong: pengunjung akan
 * menyimpulkan linknya mati dan berhenti mencoba, padahal gerbangnya
 * baru saja meloloskannya.
 *
 * Client component karena Next.js menuntutnya untuk error boundary. Ia
 * memberi HTTP 500 dengan sendirinya.
 */
export default function PublicError() {
  return (
    <div className="py-16">
      <h1 className="text-xl font-medium">Akses Anda tidak dapat dicatat.</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Aplikasi ini tidak meneruskan apa pun yang tidak dapat ia catat, jadi
        halaman ini tidak dibuka. Coba lagi sebentar lagi.
      </p>
    </div>
  );
}
```

Buat `app/(public)/galat-pencatatan/page.tsx`:

```tsx
export const dynamic = "force-dynamic";

/**
 * Sasaran 303 dari gerbang item ketika penulisan AccessLog gagal.
 * Badannya melempar supaya Next merender app/(public)/error.tsx dengan
 * status 500 — sebuah halaman tidak dapat menetapkan kode statusnya
 * sendiri, dan 200 untuk kegagalan adalah kebohongan yang terbaca mesin.
 */
export default function GalatPencatatanPage() {
  throw new Error("GAGAL_MENCATAT_AKSES");
}
```

- [ ] **Step 6: Jalankan pengujian batasnya**

Run: `npm test -- tests/public/dynamic-rendering-boundary.test.ts`
Expected: PASS. Kedua `page.tsx` memuat `force-dynamic`; `layout.tsx`, `not-found.tsx`, dan `error.tsx` hanya diperiksa terhadap cache statis.

- [ ] **Step 7: Perbarui `context/ui-context.md`**

Di bagian **Empty and Error States**, sisipkan tepat setelah butir "Halaman publik tidak ditemukan, dicabut, atau kedaluwarsa" beserta paragraf penjelasnya:

```markdown
- Akses gagal dicatat — "Akses Anda tidak dapat dicatat. Aplikasi ini
  tidak meneruskan apa pun yang tidak dapat ia catat, jadi halaman ini
  tidak dibuka. Coba lagi sebentar lagi." HTTP 500, halaman tersendiri,
  bukan halaman tidak tersedia.

  Dua halaman ini sengaja berbeda. Yang satu berarti tidak ada apa-apa
  di sini; yang ini berarti ada, dan gerbangnya baru saja meloloskan
  Anda, tetapi jejaknya gagal ditulis. Memakai kalimat yang pertama
  untuk keadaan yang kedua membuat pengunjung berhenti mencoba padahal
  percobaan berikutnya mungkin berhasil. Ditetapkan 27 Agustus 2026,
  keputusan U4-8.
```

- [ ] **Step 8: Jalankan keempat gerbang**

Run: `npm run typecheck && npm run lint && npm test`
Expected: typecheck 0 galat; lint 0 peringatan; seluruh pengujian lulus.

- [ ] **Step 9: Commit**

```bash
git add "app/(public)" components/public tests/public context/ui-context.md
git commit -m "$(cat <<'EOF'
feat(public): kerangka app/(public) dan ketiga halaman keadaan

Halaman tidak tersedia dan halaman galat pencatatan sengaja berbeda: yang
satu berarti tidak ada apa-apa di sini, yang lain berarti ada tetapi
jejaknya gagal ditulis (U4-8). Render dinamis dijaga pengujian batas.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Layar masuk, `callbackUrl`, dan server action autentikasi

**Files:**
- Create: `lib/auth/callback-url.ts`, `lib/auth/actions.ts`, `components/public/login-screen.tsx`, `components/public/identity-bar.tsx`
- Test: `tests/auth/callback-url.test.ts`
- Modify: `context/architecture.md`, `context/project-overview.md`, `context/ui-context.md`

**Interfaces:**
- Consumes: `signIn`, `signOut` dari `lib/auth` (ekspor bernama).
- Produces: `groupCallbackUrl(slug: string): string`; `itemGateCallbackUrl(slug: string, itemId: string): string`; `isSafeCallbackUrl(value: string): boolean`; server action `signInWithGoogle(callbackUrl: string): Promise<void>` dan `signOutTo(callbackUrl: string): Promise<void>`; komponen `LoginScreen({ groupTitle, itemTitle, callbackUrl }: { groupTitle: string; itemTitle?: string; callbackUrl: string })` dan `IdentityBar({ name, email, callbackUrl }: { name: string | null; email: string | null; callbackUrl: string })`.

- [ ] **Step 1: Tulis pengujian yang gagal**

Buat `tests/auth/callback-url.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import {
  groupCallbackUrl,
  isSafeCallbackUrl,
  itemGateCallbackUrl,
} from "@/lib/auth/callback-url";

describe("penyusunan callbackUrl", () => {
  it("menyusun tujuan halaman group dari slugnya", () => {
    expect(groupCallbackUrl("rapat-kerja")).toBe("/g/rapat-kerja");
  });

  it("menyusun tujuan gerbang item dari slug dan id", () => {
    expect(itemGateCallbackUrl("rapat-kerja", "clx123")).toBe("/g/rapat-kerja/i/clx123");
  });

  it("menyandikan segmen yang memuat karakter di luar slug", () => {
    expect(groupCallbackUrl("rapat kerja")).toBe("/g/rapat%20kerja");
    expect(itemGateCallbackUrl("a/b", "c?d")).toBe("/g/a%2Fb/i/c%3Fd");
  });
});

describe("penjagaan callbackUrl", () => {
  it("menerima tujuan yang disusun kedua fungsi di atas", () => {
    expect(isSafeCallbackUrl(groupCallbackUrl("rapat-kerja"))).toBe(true);
    expect(isSafeCallbackUrl(itemGateCallbackUrl("rapat-kerja", "clx123"))).toBe(true);
  });

  it("menolak tujuan di luar aplikasi", () => {
    expect(isSafeCallbackUrl("https://contoh.example/g/rapat-kerja")).toBe(false);
    expect(isSafeCallbackUrl("//contoh.example")).toBe(false);
  });

  it("menolak tujuan di luar /g/", () => {
    expect(isSafeCallbackUrl("/dashboard")).toBe(false);
    expect(isSafeCallbackUrl("/g/rapat-kerja/i/clx123/berkas")).toBe(false);
  });
});
```

- [ ] **Step 2: Jalankan pengujian dan pastikan ia gagal**

Run: `npm test -- tests/auth/callback-url.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/auth/callback-url"`.

- [ ] **Step 3: Tulis implementasinya**

Buat `lib/auth/callback-url.ts`:

```ts
/**
 * Tujuan sepulang dari Google DISUSUN DI SERVER dari parameter route,
 * tidak pernah dibaca dari query string — keputusan U4-9. Tidak ada
 * layar masuk yang menerima tujuan sebagai masukan pengunjung.
 *
 * Pengalihan terbuka karena itu tidak mungkin terjadi, bukan karena
 * divalidasi dengan benar melainkan karena tidak ada tempat masuknya.
 * isSafeCallbackUrl() adalah lapis kedua: server action memeriksanya
 * lagi sebelum menyerahkannya ke Auth.js, supaya sebuah jalur baru yang
 * kelak lalai tetap tertahan.
 */
export function groupCallbackUrl(slug: string): string {
  return `/g/${encodeURIComponent(slug)}`;
}

export function itemGateCallbackUrl(slug: string, itemId: string): string {
  return `/g/${encodeURIComponent(slug)}/i/${encodeURIComponent(itemId)}`;
}

const SAFE_CALLBACK = /^\/g\/[^/]+(\/i\/[^/]+)?$/;

export function isSafeCallbackUrl(value: string): boolean {
  return SAFE_CALLBACK.test(value);
}
```

- [ ] **Step 4: Jalankan pengujian dan pastikan ia lulus**

Run: `npm test -- tests/auth/callback-url.test.ts`
Expected: PASS, 6 pengujian.

- [ ] **Step 5: Tulis server action-nya**

Buat `lib/auth/actions.ts`:

```ts
"use server";

import { signIn, signOut } from "@/lib/auth";
import { isSafeCallbackUrl } from "@/lib/auth/callback-url";

/**
 * `callbackUrl` datang sebagai argumen TERIKAT lewat `.bind()`, bukan
 * sebagai medan formulir. Argumen terikat dienkripsi Next.js dan tidak
 * dapat disunting klien; medan tersembunyi dapat. Ini yang membuat
 * keputusan U4-9 berlaku sampai ke bentuk formulirnya.
 */
export async function signInWithGoogle(callbackUrl: string): Promise<void> {
  if (!isSafeCallbackUrl(callbackUrl)) {
    throw new Error("callbackUrl di luar batas yang diizinkan");
  }
  await signIn("google", { redirectTo: callbackUrl });
}

export async function signOutTo(callbackUrl: string): Promise<void> {
  if (!isSafeCallbackUrl(callbackUrl)) {
    throw new Error("callbackUrl di luar batas yang diizinkan");
  }
  await signOut({ redirectTo: callbackUrl });
}
```

- [ ] **Step 6: Tulis layar masuk dan bilah identitas**

Buat `components/public/login-screen.tsx`:

```tsx
import { LogIn } from "lucide-react";

import { signInWithGoogle } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

/**
 * Satu layar untuk dua tempat — keputusan U4-4. Halaman group menyebut
 * judul group saja; gerbang item menyebut judul group DAN nama item,
 * supaya pengunjung tahu apa yang akan ia buka sebelum menyerahkan
 * identitasnya. Menyebut nama item di sana bukan kebocoran: ia baru saja
 * melihatnya di halaman group yang ia klik.
 *
 * Tombolnya adalah <form> dengan server action, sehingga bekerja tanpa
 * JavaScript lewat peningkatan progresif — halaman publik dapat dipakai
 * tanpa JavaScript untuk hal pokoknya.
 */
export function LoginScreen({
  groupTitle,
  itemTitle,
  callbackUrl,
}: {
  groupTitle: string;
  itemTitle?: string;
  callbackUrl: string;
}) {
  return (
    <div className="py-12">
      <h1 className="text-xl font-medium">
        {itemTitle === undefined ? groupTitle : itemTitle}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {itemTitle === undefined
          ? "Halaman ini hanya dapat dibuka setelah Anda masuk."
          : `Item ini ada di group ${groupTitle} dan hanya dapat dibuka setelah Anda masuk. Akses Anda akan dicatat.`}
      </p>
      <form action={signInWithGoogle.bind(null, callbackUrl)} className="mt-6">
        <Button type="submit">
          <LogIn className="h-5 w-5" aria-hidden />
          Masuk dengan Google
        </Button>
      </form>
    </div>
  );
}
```

Buat `components/public/identity-bar.tsx`:

```tsx
import { signOutTo } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

/**
 * Nama dan tombol keluar selalu terlihat, tanpa perlu membuka menu.
 * Laptop ruang rapat dipakai bergantian; tanpa tombol ini, riwayat akses
 * akan mencatat lima orang berikutnya sebagai orang yang pertama masuk —
 * dan riwayat itulah alasan aplikasi ini dibuat.
 *
 * Tidak ada tombol ganti tema di sini: bilah ini hanya muncul bagi
 * pengunjung yang sedang masuk, sehingga tombolnya akan hilang justru
 * bagi mayoritas pengunjung. Halaman publik mengikuti prefers-color-scheme.
 */
export function IdentityBar({
  name,
  email,
  callbackUrl,
}: {
  name: string | null;
  email: string | null;
  callbackUrl: string;
}) {
  return (
    <div className="mb-6 flex items-center justify-between gap-3 border-b border-border pb-3">
      <span className="min-w-0 truncate text-sm text-muted-foreground" title={email ?? undefined}>
        {name ?? email}
      </span>
      <form action={signOutTo.bind(null, callbackUrl)}>
        <Button type="submit" variant="outline" size="sm">
          Keluar
        </Button>
      </form>
    </div>
  );
}
```

- [ ] **Step 7: Perbarui `context/architecture.md`**

Di bagian **Request Flow → Halaman group**, ganti butir 4 dengan:

```markdown
4. `NEEDS_LOGIN` → render layar masuk yang **menyebut judul group**,
   dengan tombol yang memanggil `signIn("google", { redirectTo })`.
   Pengalihan ke Google terjadi saat pengunjung menekan tombolnya, bukan
   sebelum ia melihat halaman apa pun. Nilai `redirectTo` disusun di
   server dari parameter route dan tidak pernah dibaca dari query
   string. Ditetapkan 27 Agustus 2026, keputusan U4-4 dan U4-9.
```

Di bagian **Request Flow → Gerbang item**, ganti butir 4 dengan:

```markdown
4. `NEEDS_LOGIN` → 303 ke `/g/[slug]/i/[itemId]/masuk`, yang merender
   layar masuk yang menyebut judul group **dan nama item**. Sepulang
   dari Google pengunjung mendarat kembali di URL gerbang ini, sehingga
   ia langsung diteruskan tanpa mengklik lagi. Tidak ada yang dicatat.
```

- [ ] **Step 8: Perbarui `context/project-overview.md`**

Di **Alur Pengunjung**, ganti langkah 5 dengan:

```markdown
5. Pengunjung mengklik item `IDENTITY`. Jika belum masuk, ia melihat
   layar masuk yang menyebut nama item dan judur group, lalu masuk dan
   dikembalikan ke titik semula dan diteruskan. Item semacam ini diberi
   keterangan bahwa aksesnya dicatat.
```

Perbaiki salah ketik `judur` menjadi `judul` saat menulisnya.

- [ ] **Step 9: Perbarui `context/ui-context.md`**

Di bagian **Layout Patterns**, sisipkan setelah butir "Bilah identitas halaman publik":

```markdown
- **Layar masuk** — bentuknya sama di kedua tempat yang
  memerlukannya. Judul, satu kalimat penjelas, lalu satu tombol
  terisi "Masuk dengan Google" berikon `LogIn`. Tanpa lencana, tanpa
  kartu, tanpa ilustrasi.

  Di halaman group ia menyebut **judul group**, menjawab "saya tidak
  salah alamat" sebelum pengunjung menyerahkan identitasnya. Di gerbang
  item ia menyebut **nama item** sebagai judul dan judul group di
  kalimat penjelasnya, ditambah kalimat "Akses Anda akan dicatat" yang
  sama dengan yang ada di kartu `IDENTITY`.

  Tombolnya `<form>` dengan server action, bukan tombol berpenangan
  klik: halaman publik wajib dapat dipakai tanpa JavaScript.
  Ditetapkan 27 Agustus 2026, keputusan U4-4.
```

- [ ] **Step 10: Jalankan keempat gerbang**

Run: `npm run typecheck && npm run lint && npm test`
Expected: typecheck 0 galat; lint 0 peringatan; seluruh pengujian lulus.

- [ ] **Step 11: Commit**

```bash
git add lib/auth components/public tests/auth context/architecture.md context/project-overview.md context/ui-context.md
git commit -m "$(cat <<'EOF'
feat(auth): layar masuk yang menyebut group dan item, callbackUrl dari route

Tujuan sepulang dari Google disusun di server dari parameter route dan
terikat lewat bind(), bukan medan formulir (U4-9). Pengalihan terbuka
tidak mungkin karena tidak ada tempat masuknya.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Halaman group publik

**Files:**
- Create: `lib/groups/item-summary.ts`, `components/public/access-badge.tsx`, `components/public/item-card.tsx`, `components/public/group-header.tsx`, `components/public/owner-preview-banner.tsx`, `app/(public)/g/[slug]/page.tsx`
- Test: `tests/groups/item-summary.test.ts`, `tests/public/no-target-url-boundary.test.ts`

**Interfaces:**
- Consumes: `readPublicGroup`, `PublicGroup`, `PublicItem` (Task 4); `evaluateGroupAccess` dari `lib/access/evaluate-access.ts`; `logPageView`, `readRequestContext` (Task 2); `LoginScreen`, `IdentityBar`, `groupCallbackUrl` (Task 6); `auth` dari `lib/auth`.
- Produces: `summarizeItems(items: { accessMode: AccessMode }[]): ItemSummary` dengan `type ItemSummary = { total: number; needsLogin: number; needsApproval: number }`; `formatItemSummary(summary: ItemSummary): string`; komponen `AccessBadge({ accessMode }: { accessMode: AccessMode })`, `PublicItemCard({ item, slug }: { item: PublicItem; slug: string })`, `GroupHeader({ title, slug, description, summary }: { title: string; slug: string; description: string | null; summary: string })`, `OwnerPreviewBanner()`.

- [ ] **Step 1: Tulis pengujian baris ringkasan yang gagal**

Buat `tests/groups/item-summary.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { formatItemSummary, summarizeItems } from "@/lib/groups/item-summary";

describe("ringkasan item", () => {
  it("menghitung ketiga angkanya", () => {
    const summary = summarizeItems([
      { accessMode: "OPEN" },
      { accessMode: "OPEN" },
      { accessMode: "IDENTITY" },
      { accessMode: "APPROVAL" },
    ]);
    expect(summary).toEqual({ total: 4, needsLogin: 1, needsApproval: 1 });
  });

  it("menyebut ketiganya bila ketiganya ada", () => {
    expect(
      formatItemSummary({ total: 8, needsLogin: 3, needsApproval: 2 }),
    ).toBe("8 item · 3 perlu masuk · 2 butuh persetujuan");
  });

  it("menghilangkan ruas yang bernilai nol, bukan menuliskannya", () => {
    expect(formatItemSummary({ total: 5, needsLogin: 0, needsApproval: 0 })).toBe("5 item");
    expect(formatItemSummary({ total: 5, needsLogin: 2, needsApproval: 0 })).toBe(
      "5 item · 2 perlu masuk",
    );
  });

  it("tetap menyebut jumlah total saat group tidak berisi item aktif", () => {
    expect(formatItemSummary(summarizeItems([]))).toBe("0 item");
  });
});
```

- [ ] **Step 2: Jalankan pengujian dan pastikan ia gagal**

Run: `npm test -- tests/groups/item-summary.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/groups/item-summary"`.

- [ ] **Step 3: Tulis implementasinya**

Buat `lib/groups/item-summary.ts`:

```ts
import type { AccessMode } from "@prisma/client";

/**
 * Baris ringkasan bernada mono di bawah judul group: memberi bentuk
 * halaman sebelum digulir, dan gratis dihitung di server. Murni, tanpa
 * Prisma, karena proyek ini tidak memiliki database uji.
 */
export type ItemSummary = {
  total: number;
  needsLogin: number;
  needsApproval: number;
};

export function summarizeItems(items: { accessMode: AccessMode }[]): ItemSummary {
  return {
    total: items.length,
    needsLogin: items.filter((item) => item.accessMode === "IDENTITY").length,
    needsApproval: items.filter((item) => item.accessMode === "APPROVAL").length,
  };
}

/**
 * Ruas bernilai nol dihilangkan, bukan ditulis sebagai "0 perlu masuk":
 * baris ini dibaca sekilas, dan angka nol menuntut dibaca dulu untuk
 * kemudian diabaikan.
 */
export function formatItemSummary(summary: ItemSummary): string {
  const parts = [`${summary.total} item`];
  if (summary.needsLogin > 0) parts.push(`${summary.needsLogin} perlu masuk`);
  if (summary.needsApproval > 0) parts.push(`${summary.needsApproval} butuh persetujuan`);
  return parts.join(" · ");
}
```

- [ ] **Step 4: Jalankan pengujian dan pastikan ia lulus**

Run: `npm test -- tests/groups/item-summary.test.ts`
Expected: PASS, 4 pengujian.

- [ ] **Step 5: Tulis lencana keadaan akses**

Buat `components/public/access-badge.tsx`:

```tsx
import type { AccessMode } from "@prisma/client";
import { Lock, ShieldCheck } from "lucide-react";

/**
 * Satu tata bahasa lencana untuk seluruh keadaan: pil rounded-full berisi
 * ikon h-4 w-4 dan teks, garis batas setipis rambut dalam warna keadaan
 * di atas permukaan bernada tipis dari warna yang sama. LENCANA TIDAK
 * PERNAH TERISI PENUH.
 *
 * Alasannya bukan selera: bila lencana boleh terisi penuh, ia bersaing
 * dengan tombol, dan pemakai kehilangan cara membedakan penanda dari
 * kontrol. Dengan aturan ini, satu-satunya elemen terisi penuh di layar
 * mana pun adalah tombol yang benar-benar dapat ditindak.
 *
 * Item OPEN TIDAK berlencana sama sekali — ketiadaan itu bermakna, dan
 * ditopang oleh afordansi tautan kartunya, bukan oleh warna.
 */
export function AccessBadge({ accessMode }: { accessMode: AccessMode }) {
  if (accessMode === "OPEN") return null;

  const isApproval = accessMode === "APPROVAL";
  const Icon = isApproval ? ShieldCheck : Lock;

  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-xs text-foreground">
      <Icon className="h-4 w-4" aria-hidden />
      {isApproval ? "Butuh persetujuan" : "Perlu masuk"}
    </span>
  );
}
```

- [ ] **Step 6: Tulis kartu item**

Buat `components/public/item-card.tsx`:

```tsx
import { ExternalLink, FileText, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import type { ItemType } from "@prisma/client";

import { AccessBadge } from "@/components/public/access-badge";
import type { PublicItem } from "@/lib/db/public-group";
import { itemGateCallbackUrl } from "@/lib/auth/callback-url";

const TYPE_ICON: Record<ItemType, typeof LinkIcon> = {
  LINK: LinkIcon,
  PDF: FileText,
  IMAGE: ImageIcon,
};

/**
 * Setiap item dirender sebagai tautan menuju gerbangnya, TIDAK PERNAH
 * menuju tujuan aslinya. Komponen ini tidak menerima targetUrl maupun
 * fileKey sebagai props, dan kuerinya pun tidak membacanya — ditegakkan
 * tests/public/no-target-url-boundary.test.ts.
 *
 * Ikon tipe duduk di REL BERLEBAR TETAP, sehingga seluruh judul lurus
 * satu garis sepanjang halaman. Pada 8-20 item, keteraturan itulah yang
 * membuat daftar dapat dipindai sambil berdiri.
 *
 * Item APPROVAL tidak dapat ada di database pada akhir Unit 4:
 * ItemAccessModeField tidak menawarkannya dan itemAccessModeSchema
 * menolaknya. Cabangnya tetap ditulis dan bersikap MENOLAK — kartu bukan
 * tautan, tanpa tombol — supaya data yang lebih tua atau lebih baru
 * daripada kode tidak lolos. Unit 7 menggantinya dengan ketujuh keadaan
 * izin beserta tombolnya.
 */
export function PublicItemCard({ item, slug }: { item: PublicItem; slug: string }) {
  const Icon = TYPE_ICON[item.type];

  const body = (
    <>
      <span className="flex w-6 shrink-0 justify-center pt-0.5">
        <Icon className="h-6 w-6 text-muted-foreground" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-medium">{item.title}</span>
        {item.description !== null && (
          <span className="mt-0.5 block text-sm text-muted-foreground">{item.description}</span>
        )}
        {item.accessMode === "IDENTITY" && (
          <span className="mt-1 block text-xs text-muted-foreground">
            Akses Anda akan dicatat
          </span>
        )}
      </span>
      <span className="flex shrink-0 items-center gap-2">
        <AccessBadge accessMode={item.accessMode} />
        {item.source === "EXTERNAL" && (
          <ExternalLink className="h-4 w-4 text-muted-foreground" aria-hidden />
        )}
      </span>
    </>
  );

  const shell =
    "flex flex-wrap items-start gap-3 rounded-[var(--radius)] border border-border bg-card p-4 sm:flex-nowrap";

  if (item.accessMode === "APPROVAL") {
    return <div className={shell}>{body}</div>;
  }

  return (
    <a
      href={itemGateCallbackUrl(slug, item.id)}
      target="_blank"
      rel="noopener noreferrer"
      className={`${shell} transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
    >
      {body}
    </a>
  );
}
```

- [ ] **Step 7: Tulis kepala group dan spanduk pemilik**

Buat `components/public/group-header.tsx`:

```tsx
/**
 * Slug tampil SEKALI dalam mono di bawah judul. Itu benda yang barusan
 * dipindai pengunjung, dan menampilkannya menjawab "saya tidak salah
 * alamat" tanpa satu kalimat pun.
 */
export function GroupHeader({
  title,
  slug,
  description,
  summary,
}: {
  title: string;
  slug: string;
  description: string | null;
  summary: string;
}) {
  return (
    <header className="mb-6">
      <h1 className="text-2xl font-medium">{title}</h1>
      <p className="mt-1 font-mono text-xs text-muted-foreground">/g/{slug}</p>
      <p className="mt-1 font-mono text-xs text-muted-foreground">{summary}</p>
      {description !== null && <p className="mt-3 text-sm">{description}</p>}
    </header>
  );
}
```

Buat `components/public/owner-preview-banner.tsx`:

```tsx
import { Ban } from "lucide-react";

/**
 * DI ATAS judul group, sehingga terbaca sebagai bingkai halaman dan bukan
 * sebagai item di dalamnya. Satu-satunya elemen di halaman ini yang
 * memakai aksen peringatan, dan sengaja dibuat LEBIH DATAR daripada
 * kartu item — tanpa bayangan, tanpa bobot tebal — supaya terbaca sebagai
 * chrome, bukan isi. Tidak dapat ditutup.
 */
export function OwnerPreviewBanner() {
  return (
    <div className="mb-6 flex items-start gap-3 border-l-4 border-[var(--state-warning)] bg-[var(--bg-elevated)] px-4 py-3">
      <Ban className="mt-0.5 h-4 w-4 shrink-0 text-[var(--state-warning)]" aria-hidden />
      <p className="text-sm">
        Link berbagi group ini sedang tidak aktif. Hanya Anda yang dapat melihat
        halaman ini.
      </p>
    </div>
  );
}
```

- [ ] **Step 8: Tulis halaman group**

Buat `app/(public)/g/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";

import { GroupHeader } from "@/components/public/group-header";
import { IdentityBar } from "@/components/public/identity-bar";
import { LoginScreen } from "@/components/public/login-screen";
import { OwnerPreviewBanner } from "@/components/public/owner-preview-banner";
import { PublicItemCard } from "@/components/public/item-card";
import { evaluateGroupAccess } from "@/lib/access/evaluate-access";
import { logPageView } from "@/lib/audit/log-access";
import { readRequestContext } from "@/lib/audit/request-context";
import { auth } from "@/lib/auth";
import { groupCallbackUrl } from "@/lib/auth/callback-url";
import { readPublicGroup } from "@/lib/db/public-group";
import { formatItemSummary, summarizeItems } from "@/lib/groups/item-summary";

export const dynamic = "force-dynamic";

export default async function PublicGroupPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();

  const group = await readPublicGroup(slug);
  const decision = evaluateGroupAccess(
    group,
    session?.user ? { userId: session.user.id, role: session.user.role } : null,
    new Date(),
  );

  if (decision.kind === "NEEDS_LOGIN") {
    // Judul group boleh disebut di sini: itu justru gunanya layar ini.
    return <LoginScreen groupTitle={group?.title ?? ""} callbackUrl={groupCallbackUrl(slug)} />;
  }

  // NOT_FOUND, REVOKED, dan EXPIRED menghasilkan halaman DAN kode status
  // yang identik. Dari luar, group yang dicabut tidak dapat dibedakan
  // dari slug yang tidak pernah ada. Perbedaannya hanya tercatat di log.
  if (decision.kind !== "GRANTED" || group === null) notFound();

  // PAGE_VIEW dicatat bila DAN HANYA BILA identitas diketahui — berlaku
  // sama untuk ketiga nilai visibility, termasuk ketika yang membuka
  // adalah pemilik. Kegagalannya MELEMPAR, dan lemparannya sengaja tidak
  // ditangkap: app/(public)/error.tsx merendernya sebagai halaman galat
  // pencatatan berstatus 500 (U4-7).
  if (session?.user) {
    await logPageView({
      groupId: group.id,
      visitor: {
        userId: session.user.id,
        visitorName: session.user.name ?? null,
        visitorEmail: session.user.email ?? null,
      },
      context: await readRequestContext(),
    });
  }

  return (
    <>
      {session?.user && (
        <IdentityBar
          name={session.user.name ?? null}
          email={session.user.email ?? null}
          callbackUrl={groupCallbackUrl(slug)}
        />
      )}
      {decision.ownerPreview && <OwnerPreviewBanner />}
      <GroupHeader
        title={group.title}
        slug={group.slug}
        description={group.description}
        summary={formatItemSummary(summarizeItems(group.items))}
      />
      <ul className="flex flex-col gap-3">
        {group.items.map((item) => (
          <li key={item.id}>
            <PublicItemCard item={item} slug={group.slug} />
          </li>
        ))}
      </ul>
    </>
  );
}
```

- [ ] **Step 9: Tulis pengujian batas kolom tujuan di komponen**

Buat `tests/public/no-target-url-boundary.test.ts`:

```ts
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOTS = [join("components", "public"), join("app", "(public)", "g")];
const FORBIDDEN = ["targetUrl", "fileKey"];

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

/**
 * Kriteria sukses nomor 3: HTML yang dikirim ke pengunjung tidak memuat
 * URL tujuan item mana pun dan tidak memuat alamat penyimpanan berkas
 * mana pun. Cara termurah menjaganya adalah memastikan berkas yang
 * merender tidak pernah menyebut nama kolomnya sama sekali.
 *
 * Route handler gerbang di app/(public)/g/[slug]/i/[itemId]/route.ts
 * MEMBACA keduanya dan tidak merender apa pun; ia dikecualikan.
 */
const ALLOWED = "app/(public)/g/[slug]/i/[itemId]/route.ts";

describe("batas kolom tujuan di permukaan yang dirender", () => {
  it.each(FORBIDDEN)("tidak ada berkas perender yang menyebut %s", (column) => {
    const offenders = ROOTS.flatMap(walk)
      .map((file) => file.split("\\").join("/"))
      .filter((file) => file !== ALLOWED)
      .filter((file) => readFileSync(file, "utf8").includes(column));

    expect(offenders).toEqual([]);
  });
});
```

- [ ] **Step 10: Jalankan keempat gerbang**

Run: `npm run typecheck && npm run lint && npm test`
Expected: typecheck 0 galat; lint 0 peringatan; seluruh pengujian lulus, termasuk kedua pengujian batas baru.

- [ ] **Step 11: Commit**

```bash
git add lib/groups components/public "app/(public)" tests/groups tests/public
git commit -m "$(cat <<'EOF'
feat(public): halaman group dengan kartu item yang menunjuk gerbangnya

Setiap item dirender sebagai tautan ke /g/[slug]/i/[itemId], tidak pernah
ke tujuan aslinya, dan tidak ada berkas perender yang menyebut targetUrl
maupun fileKey. Keduanya ditegakkan pengujian batas.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Gerbang item — rate limit, evaluasi, dan keadaan tanpa konten

**Files:**
- Create: `app/(public)/g/[slug]/i/[itemId]/route.ts`, `app/(public)/g/[slug]/i/[itemId]/masuk/page.tsx`
- Create: `lib/validation/gate.ts`
- Modify: `context/architecture.md`

**Interfaces:**
- Consumes: `readGateData`, `markItemBroken` (Task 4); `evaluateItemAccess`; `logItemAccess`, `readRequestContext`, `Visitor` (Task 2); `readFailureCount`, `recordFailure`, `isOverLimit`, `ITEM_GATE_SCOPE` (Task 1); `itemGateCallbackUrl` (Task 6); `LoginScreen` (Task 6).
- Produces: `gateParamsSchema` di `lib/validation/gate.ts`; route `GET /g/[slug]/i/[itemId]`. Task 9 menambahkan cabang `GRANTED` ke berkas yang sama.

- [ ] **Step 1: Tulis skema validasi parameter route**

Buat `lib/validation/gate.ts`:

```ts
import { z } from "zod";

/**
 * Parameter route adalah input eksternal, dan input eksternal divalidasi
 * di batas sistem sebelum menyentuh logika apa pun — termasuk sebelum
 * menyentuh Prisma. Panjangnya dibatasi supaya kueri tidak dipakai
 * sebagai saluran untuk mengirim muatan besar.
 */
export const gateParamsSchema = z.object({
  slug: z.string().min(1).max(200),
  itemId: z.string().min(1).max(200),
});
```

- [ ] **Step 2: Tulis route handler gerbang, tanpa cabang GRANTED**

Buat `app/(public)/g/[slug]/i/[itemId]/route.ts`:

```ts
import type { DenyReason } from "@prisma/client";

import { evaluateItemAccess } from "@/lib/access/evaluate-access";
import { logItemAccess } from "@/lib/audit/log-access";
import { readRequestContext, type RequestContext } from "@/lib/audit/request-context";
import type { Visitor } from "@/lib/audit/log-access";
import { auth } from "@/lib/auth";
import { itemGateCallbackUrl } from "@/lib/auth/callback-url";
import { readGateData } from "@/lib/db/gate";
import { ITEM_GATE_SCOPE, isOverLimit } from "@/lib/ratelimit/window";
import { readFailureCount, recordFailure } from "@/lib/ratelimit/counter";
import { gateParamsSchema } from "@/lib/validation/gate";

export const dynamic = "force-dynamic";

const UNAVAILABLE = "/tidak-tersedia";

function seeOther(location: string): Response {
  return new Response(null, { status: 303, headers: { Location: location } });
}

/**
 * Kegagalan menulis log pada PENOLAKAN dicatat ke konsol lalu ditelan:
 * pengunjung yang ditolak tidak sedang menerima apa pun, jadi tidak ada
 * yang perlu dibatalkan (U4-7). Kegagalan pada GRANTED ditangani di
 * cabangnya sendiri dan MEMBATALKAN penerusan.
 */
async function logDenied(input: {
  groupId: string;
  itemId: string;
  visitor: Visitor;
  denyReason: DenyReason;
  context: RequestContext;
}): Promise<void> {
  try {
    await logItemAccess({ ...input, outcome: "DENIED" });
  } catch (error) {
    console.error("Gagal mencatat penolakan akses item:", error);
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; itemId: string }> },
) {
  const parsed = gateParamsSchema.safeParse(await params);
  if (!parsed.success) return seeOther(UNAVAILABLE);
  const { slug, itemId } = parsed.data;

  const now = new Date();
  const context = await readRequestContext();
  const session = await auth();
  const visitor: Visitor = {
    userId: session?.user?.id ?? null,
    visitorName: session?.user?.name ?? null,
    visitorEmail: session?.user?.email ?? null,
  };

  // LANGKAH 0 — rate limit, sebelum menyentuh database lebih jauh.
  if (context.ipAddress !== null) {
    const failures = await readFailureCount(ITEM_GATE_SCOPE, context.ipAddress, now);
    if (isOverLimit(failures)) {
      // Barisnya tetap dicatat: percobaan akses ke link yang sudah mati
      // pun terekam, dan pemilik berhak melihat bahwa seseorang sedang
      // menggedor. groupId dan itemId diisi apa adanya dari URL tanpa
      // kueri, karena langkah ini tidak boleh menyentuh database lagi.
      await logDenied({
        groupId: slug,
        itemId,
        visitor,
        denyReason: "RATE_LIMITED",
        context,
      });
      // Penghitung TIDAK dinaikkan di sini: menghukum klien yang sudah
      // dihentikan hanya membuat jendela sepuluh menitnya tidak pernah
      // berakhir (U4-5).
      return new Response(
        "Terlalu banyak permintaan dari alamat ini. Coba lagi beberapa menit lagi.\n",
        { status: 429, headers: { "Content-Type": "text/plain; charset=utf-8" } },
      );
    }
  }

  const { group, item, request } = await readGateData(slug, itemId, visitor.userId);

  const decision = evaluateItemAccess(
    group,
    item,
    session?.user ? { userId: session.user.id, role: session.user.role } : null,
    request,
    now,
  );

  if (decision.kind === "NEEDS_LOGIN") {
    // Tidak dicatat: belum ada akses yang terjadi, dan meminta pengunjung
    // masuk bukan penolakan.
    return seeOther(`${itemGateCallbackUrl(slug, itemId)}/masuk`);
  }

  if (decision.kind === "NEEDS_REQUEST" || decision.kind === "PENDING_APPROVAL") {
    // TIDAK TERJANGKAU sepanjang Unit 4: cabang APPROVAL evaluator masih
    // menolak, dan accessMode itu belum dapat dipilih di CMS. Ditulis
    // eksplisit supaya keadaan yang belum dibangun MENOLAK alih-alih
    // lolos ke cabang terakhir. Unit 7 menggantinya dengan halaman
    // pengajuan dan halaman menunggu; keduanya tetap tidak dicatat.
    return seeOther(UNAVAILABLE);
  }

  if (decision.kind === "DENIED") {
    // group bisa null di sini — itu justru salah satu sebab penolakan.
    // groupId diisi slug apa adanya supaya barisnya tetap dapat dibaca
    // pemilik, sejalan dengan AccessLog yang memang tanpa foreign key.
    await logDenied({
      groupId: group?.id ?? slug,
      itemId,
      visitor,
      denyReason: decision.reason,
      context,
    });
    if (context.ipAddress !== null) {
      await recordFailure(ITEM_GATE_SCOPE, context.ipAddress, now);
    }
    return seeOther(UNAVAILABLE);
  }

  // GRANTED ditangani di Task 9. Sampai saat itu, sikap bawaannya
  // MENOLAK — bukan lolos.
  return seeOther(UNAVAILABLE);
}
```

- [ ] **Step 3: Tulis layar masuk gerbang item**

Buat `app/(public)/g/[slug]/i/[itemId]/masuk/page.tsx`:

```tsx
import { redirect } from "next/navigation";

import { LoginScreen } from "@/components/public/login-screen";
import { evaluateItemAccess } from "@/lib/access/evaluate-access";
import { auth } from "@/lib/auth";
import { itemGateCallbackUrl } from "@/lib/auth/callback-url";
import { readGateData } from "@/lib/db/gate";

export const dynamic = "force-dynamic";

/**
 * Halaman ini MENGEVALUASI ULANG untuk melindungi dirinya sendiri: ia
 * menyebut nama item, dan nama itu hanya boleh disebut kepada seseorang
 * yang keputusannya memang NEEDS_LOGIN. Keputusan lain dialihkan kembali
 * ke gerbang, yang akan menanganinya beserta pencatatannya.
 *
 * Ia TIDAK menulis AccessLog. Tidak ada konten yang disajikan di sini,
 * dan gerbanglah satu-satunya yang mencatat.
 */
export default async function MasukGerbangPage({
  params,
}: {
  params: Promise<{ slug: string; itemId: string }>;
}) {
  const { slug, itemId } = await params;
  const gateUrl = itemGateCallbackUrl(slug, itemId);

  const session = await auth();
  const { group, item, request } = await readGateData(slug, itemId, session?.user?.id ?? null);

  const decision = evaluateItemAccess(
    group,
    item,
    session?.user ? { userId: session.user.id, role: session.user.role } : null,
    request,
    new Date(),
  );

  if (decision.kind !== "NEEDS_LOGIN" || group === null || item === null) {
    redirect(gateUrl);
  }

  return <LoginScreen groupTitle={group.title} itemTitle={item.title} callbackUrl={gateUrl} />;
}
```

- [ ] **Step 4: Perbarui `context/architecture.md`**

Di bagian **System Boundaries**, ganti butir `app/(public)/g/[slug]/` dengan:

```markdown
- `app/(public)/g/[slug]/` — halaman group publik dan route gerbang item.
  Satu-satunya jalan masuk pengunjung ke konten.

  Gerbang item adalah **route handler**, bukan halaman: hanya route
  handler yang dapat mengalirkan byte berkas, dan menempatkan seluruh
  keluarannya di satu berkas membuat pencatatan dan penerusan punya
  tepat satu tempat. Keluaran yang berbentuk HTML dijawab 303 ke route
  anak — `/masuk`, `/tidak-tersedia`, `/galat-pencatatan` — yang
  mengevaluasi ulang untuk melindungi dirinya sendiri dan **tidak**
  menulis log, karena tak satu pun menyajikan konten. Ditetapkan
  27 Agustus 2026, keputusan U4-6.
```

Di bagian **Request Flow → Gerbang item** butir 0, sisipkan kalimat penutup:

```markdown
   Penghitungnya dibaca di sini tetapi dinaikkan di butir 7 dan 9 saja —
   hanya percobaan yang gagal. `RATE_LIMITED` sendiri tidak menaikkannya.
```

- [ ] **Step 5: Jalankan keempat gerbang**

Run: `npm run typecheck && npm run lint && npm test`
Expected: typecheck 0 galat; lint 0 peringatan; seluruh pengujian lulus. Pengujian batas render dinamis kini ikut memeriksa `route.ts` dan `masuk/page.tsx`; keduanya memuat `force-dynamic`.

- [ ] **Step 6: Commit**

```bash
git add "app/(public)" lib/validation/gate.ts context/architecture.md
git commit -m "$(cat <<'EOF'
feat(gate): rate limit, evaluasi, dan keadaan tanpa konten di gerbang item

Gerbang berbentuk route handler supaya pencatatan dan penerusan punya
tepat satu tempat (U4-6). Cabang GRANTED belum ada, dan sampai ia ada
sikap bawaannya menolak.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: Gerbang item — penerusan konten

**Files:**
- Modify: `app/(public)/g/[slug]/i/[itemId]/route.ts`

**Interfaces:**
- Consumes: `getFileStream`, `inlineContentDisposition` (Task 3); `markItemBroken` (Task 4); seluruh yang sudah dipakai Task 8.
- Produces: perilaku terminal gerbang. Tidak ada ekspor baru.

- [ ] **Step 1: Tambahkan impor yang diperlukan**

Di `app/(public)/g/[slug]/i/[itemId]/route.ts`, tambahkan:

```ts
import { markItemBroken, readGateData } from "@/lib/db/gate";
import { inlineContentDisposition } from "@/lib/storage/content-disposition";
import { getFileStream } from "@/lib/storage/blob";
```

(`readGateData` sudah diimpor; gabungkan `markItemBroken` ke baris impor yang sama.)

Tambahkan konstanta di sebelah `UNAVAILABLE`:

```ts
const LOGGING_ERROR = "/galat-pencatatan";
```

- [ ] **Step 2: Ganti cabang GRANTED sementara dengan penerusan yang sebenarnya**

Ganti kedua baris terakhir `GET()` — komentar "GRANTED ditangani di Task 9" beserta `return seeOther(UNAVAILABLE);` — dengan:

```ts
  // GRANTED. Mulai dari sini item dan group dijamin ada: evaluator
  // menolak keduanya sebagai NOT_FOUND lebih dulu. Penyempitan tipe
  // berikut ada supaya compiler ikut membacanya.
  if (group === null || item === null) return seeOther(UNAVAILABLE);

  // Log ditunggu SAMPAI SELESAI sebelum satu byte pun mengalir dan
  // sebelum pengalihan disusun. Menjadikannya pekerjaan latar berarti
  // log hilang saat fungsi serverless berhenti setelah respons terkirim.
  // Kegagalannya MEMBATALKAN penerusan: meneruskan pengunjung tanpa
  // jejak lebih buruk daripada gagal membuka berkas — itu justru
  // menghapus alasan aplikasi ini dibuat.
  try {
    await logItemAccess({
      groupId: group.id,
      itemId: item.id,
      visitor,
      outcome: "GRANTED",
      context,
    });
  } catch (error) {
    console.error("Gagal mencatat akses item yang diloloskan:", error);
    return seeOther(LOGGING_ERROR);
  }

  if (item.source === "EXTERNAL") {
    if (item.targetUrl === null) {
      // Item EXTERNAL tanpa targetUrl tidak dapat ada: skema Zod
      // mewajibkannya. Cabangnya tetap ditulis dan MENOLAK, bukan
      // mengalihkan ke tempat kosong.
      //
      // Alasannya NOT_FOUND dan bukan FILE_MISSING: tidak ada berkas
      // yang terlibat, dan riwayat tidak boleh berbohong kepada pemilik.
      // Ini preseden yang sama dengan keputusan U4-1, tempat keadaan yang
      // tidak dapat dilayani memakai NOT_FOUND alih-alih menambah nilai
      // enum baru. `isBroken` tetap ditandai, karena itulah kolom yang
      // memberi tahu pemilik ada baris yang perlu ia perbaiki.
      await markItemBroken(item.id);
      await logDenied({
        groupId: group.id,
        itemId: item.id,
        visitor,
        denyReason: "NOT_FOUND",
        context,
      });
      if (context.ipAddress !== null) {
        await recordFailure(ITEM_GATE_SCOPE, context.ipAddress, now);
      }
      return seeOther(UNAVAILABLE);
    }
    return new Response(null, { status: 302, headers: { Location: item.targetUrl } });
  }

  // UPLOAD — berkas dialirkan melalui respons ini. Tidak ada URL Blob
  // yang pernah sampai ke peramban.
  const stored = item.fileKey === null ? null : await getFileStream(item.fileKey);

  if (stored === null) {
    await markItemBroken(item.id);
    await logDenied({
      groupId: group.id,
      itemId: item.id,
      visitor,
      denyReason: "FILE_MISSING",
      context,
    });
    if (context.ipAddress !== null) {
      await recordFailure(ITEM_GATE_SCOPE, context.ipAddress, now);
    }
    return seeOther(UNAVAILABLE);
  }

  return new Response(stored.stream, {
    status: 200,
    headers: {
      // mimeType diperiksa dari ISI berkas saat unggah. Tebakan SDK Blob
      // tidak dipakai: menebak dari ekstensi adalah persis yang dilarang
      // code-standards.md.
      "Content-Type": item.mimeType ?? stored.contentType ?? "application/octet-stream",
      "Content-Disposition": inlineContentDisposition(item.fileName),
      // Respons berkas privat tidak pernah masuk cache CDN.
      "Cache-Control": "private, no-cache",
      // Peramban tidak menebak tipe berkas di luar mimeType yang sudah
      // diperiksa dari isinya.
      "X-Content-Type-Options": "nosniff",
    },
  });
```

- [ ] **Step 3: Periksa bahwa berkasnya masih di bawah ambang ukuran**

Run: `npx tsc --noEmit && node -e "console.log(require('fs').readFileSync('app/(public)/g/[slug]/i/[itemId]/route.ts','utf8').split('\n').length)"`
Expected: typecheck bersih, dan jumlah baris di bawah 200. Bila melewatinya, pindahkan `logDenied()` dan penanganan berkas hilang ke `lib/audit/gate-denial.ts` sebelum melanjutkan — berkas yang tumbuh melewati ambang itu adalah tanda ia mengerjakan lebih dari satu hal.

- [ ] **Step 4: Jalankan keempat gerbang**

Run: `npm run typecheck && npm run lint && npm test && npm run build`
Expected: typecheck 0 galat; lint 0 peringatan; seluruh pengujian lulus; `build` sukses tanpa peringatan render statis pada rute mana pun di bawah `app/(public)/`.

- [ ] **Step 5: Commit**

```bash
git add "app/(public)"
git commit -m "$(cat <<'EOF'
feat(gate): penerusan konten setelah log ditulis tuntas

302 untuk EXTERNAL, aliran byte dari Blob untuk UPLOAD, dan keduanya
hanya setelah penulisan AccessLog selesai. Kegagalan menulis log
membatalkan penerusan; berkas yang hilang menandai isBroken dan mencatat
FILE_MISSING.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 10: Pemeriksaan peramban dan penutupan unit

**Files:**
- Modify: `context/progress-tracker.md`

**Interfaces:**
- Consumes: seluruh task sebelumnya.
- Produces: catatan hasil pemeriksaan, dan `Next Up` yang menunjuk Unit 5.

- [ ] **Step 1: Jalankan server pengembangan**

Run: `npm run dev`
Expected: server hidup di `http://localhost:3000`.

Siapkan data uji lewat dashboard: satu group `PUBLIC` berisi satu item `OPEN` bersumber `EXTERNAL`, satu item `IDENTITY` bersumber `UPLOAD` berupa PDF, dan satu item `OPEN` bersumber `UPLOAD`. Lalu satu group `REQUIRE_LOGIN`, dan satu group dengan `shareEnabled = false`.

- [ ] **Step 2: CEK 1 — kebocoran di HTML**

Buka halaman group publik, lihat source-nya (`Ctrl+U`), cari `targetUrl` item mana pun, host Vercel Blob, dan slug group lain.
Expected: **nol kecocokan untuk ketiganya.** Ini kriteria sukses nomor 3 dan 7.

- [ ] **Step 3: CEK 2 — pencatatan tanpa JavaScript**

Matikan JavaScript di peramban, buka halaman group, klik item `IDENTITY`, masuk, dan pastikan penerusannya terjadi.
Run: `npm run db:studio`, buka tabel `AccessLog`.
Expected: penerusan tetap terjadi, dan **tepat satu** baris `ITEM_ACCESS / GRANTED` tertulis berisi nama, email, dan waktu. Ini kriteria sukses nomor 4.

- [ ] **Step 4: CEK 3 — ketiga penolakan tidak dapat dibedakan**

Buka group yang `shareEnabled = false`, group yang `expiresAt`-nya sudah lewat, dan slug yang tidak pernah ada.
Expected: **kode status dan halaman identik** untuk ketiganya — 404 dengan kalimat "Halaman ini tidak tersedia." Periksa kode statusnya di tab Network, bukan hanya tampilannya. Ini kriteria sukses nomor 5.

- [ ] **Step 5: CEK 4 — pratinjau pemilik**

Masuk sebagai pemilik, buka group yang dicabut.
Expected: halaman tampil normal, didahului spanduk peringatan berikon `Ban`. Ini kriteria sukses nomor 6.

- [ ] **Step 6: CEK 5 — rate limit**

Run: `for i in $(seq 1 22); do curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000/g/<slug>/i/tidak-ada-$i"; done`
Expected: dua puluh permintaan pertama menghasilkan 303, lalu sisanya menghasilkan **429**. Periksa `AccessLog`: ada baris `DENIED / RATE_LIMITED`, dan `RateLimitCounter` memuat satu baris ber-`count` 20.

- [ ] **Step 7: CEK 6 — berkas hilang di Blob**

Hapus berkas sebuah item `UPLOAD` langsung dari Blob store, lalu buka gerbang itemnya.
Expected: `Item.isBroken` menjadi `true`, satu baris `DENIED / FILE_MISSING` tertulis, dan halaman tidak tersedia tampil.

- [ ] **Step 8: Pemeriksaan tampilan**

Periksa halaman group, layar masuk, halaman tidak tersedia, dan halaman galat pencatatan di **mode terang dan gelap**, lalu di **lebar ponsel** (375 px).
Expected: kontras terbaca di kedua mode; cincin fokus terlihat di keduanya; kartu item melipat menjadi dua baris di lebar ponsel tanpa judul yang membungkus buruk; badan halaman tidak pernah menggulir horizontal.

- [ ] **Step 9: Catat hasilnya di `context/progress-tracker.md`**

Di bagian **Current Phase**, tambahkan butir yang menyebut Unit 4 bagian kedua selesai, jumlah task, jumlah pengujian akhir dari `npm test`, dan status keempat gerbang. Di **Architecture Decisions**, tambahkan sub-bagian "Keputusan Unit 4 bagian kedua — 27 Agustus 2026" berisi U4-4 sampai U4-9 dengan alasan ringkas masing-masing dan alternatif yang ditolak. Di **Next Up**, ganti isinya dengan Unit 5 — panel Bagikan, `visibility`, `expiresAt`, `shareEnabled`, penyalinan URL, dan QR code — beserta gerbang D1.

Catat juga hasil kedelapan pemeriksaan di atas apa adanya, termasuk yang gagal. Pemeriksaan yang dicatat sebagai lulus tanpa dijalankan adalah cacat yang lebih mahal daripada pemeriksaan yang gagal.

- [ ] **Step 10: Jalankan keempat gerbang untuk terakhir kali**

Run: `npm run typecheck && npm run lint && npm test && npm run build`
Expected: keempatnya lulus.

- [ ] **Step 11: Commit**

```bash
git add context/progress-tracker.md
git commit -m "$(cat <<'EOF'
docs(context): tutup Unit 4 bagian kedua dan arahkan Next Up ke Unit 5

Delapan pemeriksaan peramban dijalankan dan hasilnya dicatat apa adanya,
termasuk keempat CEK Fase 5 yang tidak dapat digantikan pengujian unit.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```
