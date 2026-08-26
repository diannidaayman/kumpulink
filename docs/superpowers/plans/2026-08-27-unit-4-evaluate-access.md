# Unit 4 bagian pertama — `evaluateAccess()` dan matriksnya: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menulis evaluator izin murni `lib/access/evaluate-access.ts` beserta matriks pengujiannya, sebelum satu halaman pun dibuat.

**Architecture:** Dua fungsi murni di satu berkas. `evaluateGroupAccess()` menjalankan tahap satu; `evaluateItemAccess()` memanggilnya di baris pertamanya lalu menjalankan tahap dua, sehingga invarian 6 — item tidak pernah lebih permisif daripada group induknya — menjadi struktur kode dan bukan disiplin pemanggil. Tipe masukan dan union hasil tinggal di `lib/types/access.ts` karena pemanggil di langkah Unit 4 berikutnya ikut memakainya.

**Tech Stack:** TypeScript strict, Vitest, tipe enum dari `@prisma/client` lewat `import type`.

**Spesifikasi:** `docs/superpowers/specs/2026-08-27-evaluate-access-design.md`. Baca sebelum mulai.

## Global Constraints

- **Fungsi murni.** Tidak menyentuh database, tidak membaca sesi sendiri, tidak menulis log, tidak memanggil `new Date()`. Semua yang dibutuhkan datang sebagai argumen.
- **Tidak ada satu halaman pun dibuat di plan ini.** Tidak ada route, tidak ada komponen, tidak ada `lib/audit/`, tidak ada `getFileStream()`, tidak ada perubahan `prisma/schema.prisma`, tidak ada migrasi.
- **Keadaan tidak pasti berarti menolak.** `accessMode` yang tidak dikenali menghasilkan penolakan lewat cabang `default`, bukan lolos ke cabang terakhir.
- **`resolveGroupStatus()` di `lib/groups/status.ts` TIDAK dipakai ulang.** Ia fungsi tampilan yang cabang terakhirnya permisif. Ambang kedaluwarsanya ditiru (`<=`), kodenya tidak.
- **Semua teks yang dilihat pengguna dalam Bahasa Indonesia; nama variabel, fungsi, tabel, dan kolom dalam Bahasa Inggris.** Judul pengujian ditulis Bahasa Indonesia.
- **Pengujian menyebutkan perilaku, bukan nama fungsi.** Benar: `"menolak group kedaluwarsa meski pengunjung sudah masuk"`. Salah: `"evaluateGroupAccess mengembalikan EXPIRED"`.
- **Gerbang penyelesaian:** `npm test`, `npm run typecheck`, dan `npm run lint` (nol peringatan). `npm run build` bukan gerbang di plan ini — belum ada halaman yang dibangun.
- **Berkas melewati ±200 baris adalah tanda ia mengerjakan lebih dari satu hal.** Evaluator diperkirakan ±90 baris; bila membengkak jauh melewatinya, berhenti dan laporkan.
- Cabang branch kerja: `unit-4-gerbang-akses`. Sudah ada dan sudah aktif.

---

### Task 1: Menuliskan dua aturan baru ke file konteks

Dua keputusan diambil saat brainstorming yang belum tertulis di file konteks. `ai-workflow-rules.md` bagian **Handling Missing Requirements** menuntut kebutuhan yang ambigu diselesaikan di file konteks **sebelum** diimplementasikan, dan bagian **Keeping Docs in Sync** menuntut aturan izin baru ikut memperbarui `architecture.md`. Karena itu task ini berdiri lebih dulu, bukan sebagai pekerjaan rapi-rapi di akhir.

Task ini tidak menyentuh kode dan tidak punya pengujian. Gerbangnya adalah pembacaan ulang.

**Files:**
- Modify: `context/architecture.md` — bagian `### Tahap dua: item` di dalam `## Access Evaluation`
- Modify: `context/progress-tracker.md` — bagian `## Architecture Decisions`

**Interfaces:**
- Consumes: tidak ada.
- Produces: aturan tertulis yang menjadi acuan Task 3. Task 3 mengimplementasikan persis urutan yang ditulis di sini.

- [ ] **Step 1: Baca bagian yang akan diubah**

```bash
grep -n "### Tahap dua: item" -A 20 context/architecture.md
```

Yang akan terlihat adalah daftar bernomor 1–6, dimulai dari "Item tidak ditemukan atau bukan milik group ini".

- [ ] **Step 2: Sisipkan cabang pemilik sebagai langkah 3**

Ganti daftar bernomor di bawah `### Tahap dua: item` sehingga menjadi persis seperti ini — perhatikan bahwa nomor 3 baru, dan nomor 3–6 yang lama bergeser menjadi 4–7:

```markdown
1. Item tidak ditemukan atau bukan milik group ini →
   `DENIED / NOT_FOUND`
2. `isActive = false` → `DENIED / ITEM_INACTIVE`
3. Pemohon berperan `OWNER` → `GRANTED`, mewarisi penanda
   `ownerPreview` dari tahap satu
4. `accessMode = OPEN` → `GRANTED`
5. Pemohon belum masuk → `NEEDS_LOGIN`
   (berlaku untuk `IDENTITY` maupun `APPROVAL`)
6. `accessMode = IDENTITY` → `GRANTED`
7. `accessMode = APPROVAL`, dievaluasi berurutan:
   1. Tidak ada catatan izin → `NEEDS_REQUEST`
   2. `status = PENDING` → `PENDING_APPROVAL`
   3. `status = REJECTED` → `DENIED / REQUEST_REJECTED`
   4. `status = REVOKED` → `DENIED / REQUEST_REVOKED`
   5. `status = APPROVED` dan `expiresAt` sudah lewat →
      `DENIED / APPROVAL_EXPIRED`
   6. `status = APPROVED` → `GRANTED`

**Kenapa cabang pemilik berdiri di nomor 3 dan bukan lebih
awal.** Ditetapkan 27 Agustus 2026. Tanpa cabang ini, pemilik
yang membuka item `APPROVAL` miliknya sendiri akan ditolak —
ia sudah masuk, tetapi tidak memiliki catatan izin atas
namanya. Pemilik meminta izin kepada dirinya sendiri.

Letaknya sesudah kedua pemeriksaan struktural, bukan sebelum.
Kepemilikan tidak memunculkan item yang tidak ada, dan tidak
membatalkan penonaktifan yang pemilik lakukan sendiri — untuk
membuka item nonaktif ia cukup mengaktifkannya lagi di CMS.
Cabang ini hanya melewati aturan `accessMode`, yang memang
ditujukan kepada pengunjung.

**Sikap sementara Unit 4 untuk nomor 7.** Sampai Unit 7
membangun alur permintaan, seluruh cabang `APPROVAL` menolak
dengan `DENIED / NOT_FOUND`. Alasannya di
`progress-tracker.md`. Yang tertulis di atas adalah keadaan
akhir setelah Unit 7, bukan keadaan sekarang.
```

- [ ] **Step 3: Catat kedua keputusan di progress tracker**

Tambahkan blok berikut di `context/progress-tracker.md`, tepat di bawah baris `## Architecture Decisions`, sebelum sub-bagian keputusan yang sudah ada:

```markdown
### Keputusan Unit 4 — 27 Agustus 2026

**U4-1 — `APPROVAL` tanpa catatan izin ditolak sebagai
`NOT_FOUND`.** Matriks Unit 4 menyebut hasilnya "ditolak"
tanpa menyebut alasannya, dan enum `DenyReason` tidak punya
nilai untuk keadaan ini: `REQUEST_REJECTED` dan
`REQUEST_REVOKED` keduanya keliru karena tidak ada permintaan
yang pernah dibuat. Dipilih `NOT_FOUND`, nilai yang di bagian
Security Practices `code-standards.md` sudah menjadi wajah
dari "tidak dapat dilayani, dan tidak ada yang perlu diketahui
lebih jauh". Menambah nilai enum baru ditolak karena menuntut
migrasi Prisma di langkah yang lingkupnya justru menolak
menyentuh database, untuk nilai yang mati lagi di Unit 7.
`ITEM_INACTIVE` ditolak karena `isActive` item itu bernilai
true, sehingga riwayat akan berbohong kepada pemilik.

Ini memenuhi kriteria sukses nomor 8: sikap bawaannya menolak,
bukan meloloskan.

**Unit 7 wajib mengganti cabang ini menjadi `NEEDS_REQUEST`
beserta kelima cabang status lainnya.** Selama belum, cabang
`APPROVAL` di `lib/access/evaluate-access.ts` menolak, dan
komentar di sana menyebut hal ini.

**U4-2 — Pemilik lolos di tahap dua, sesudah kedua pemeriksaan
struktural.** Aturan izin baru; sudah dituliskan ke
`architecture.md` bagian Access Evaluation dalam perubahan yang
sama. Alasan letaknya ada di sana.

**U4-3 — Evaluator dipecah dua fungsi.**
`evaluateItemAccess()` memanggil `evaluateGroupAccess()` di
baris pertamanya dan mengembalikan hasilnya bila bukan
`GRANTED`. Dengan begitu invarian 6 menjadi struktur kode,
bukan disiplin pemanggil — tidak ada cara memanggil tahap dua
tanpa tahap satu lolos lebih dulu. Gerbang item memanggil
`evaluateItemAccess()` saja, satu panggilan, bukan dua.
```

- [ ] **Step 4: Periksa ulang bahwa penomoran tidak pecah**

```bash
grep -n "### Tahap dua: item" -A 30 context/architecture.md
```

Expected: daftar bernomor 1 sampai 7, tanpa nomor ganda dan tanpa nomor yang hilang, diikuti ketiga blok penjelasan.

- [ ] **Step 5: Commit**

```bash
git add context/architecture.md context/progress-tracker.md
git commit -m "docs(context): cabang pemilik di tahap dua dan sikap sementara APPROVAL

Dua aturan yang diputuskan saat brainstorming Unit 4 dituliskan sebelum
kodenya ada, sesuai Handling Missing Requirements. Cabang OWNER berdiri
sesudah NOT_FOUND dan ITEM_INACTIVE sehingga kepemilikan hanya melewati
aturan accessMode. Cabang APPROVAL menolak sebagai NOT_FOUND sampai
Unit 7 menggantinya.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: Tipe dan tahap satu

Tipe dan tahap satu berada dalam satu task karena tipe tidak punya pengujian runtime sendiri — yang membuktikannya benar adalah pengujian pertama yang memakainya.

**Files:**
- Create: `lib/types/access.ts`
- Create: `lib/access/evaluate-access.ts`
- Test: `tests/access/group-stage.test.ts`

**Interfaces:**
- Consumes: tipe enum `AccessMode`, `DenyReason`, `RequestStatus`, `Role`, `Visibility` dari `@prisma/client`. Alias impor `@/` sudah terpasang lewat `vite-tsconfig-paths`; pola ini dipakai `lib/types/item.ts`.
- Produces:
  - `AccessDecision`, `AccessDenyReason`, `AccessGroup`, `AccessItem`, `AccessSession`, `AccessRequestRecord` di `@/lib/types/access`
  - `evaluateGroupAccess(group: AccessGroup | null, session: AccessSession, now: Date): AccessDecision` di `@/lib/access/evaluate-access`

- [ ] **Step 1: Tulis berkas tipe**

Buat `lib/types/access.ts`:

```ts
import type {
  AccessMode,
  DenyReason,
  RequestStatus,
  Role,
  Visibility,
} from "@prisma/client";

/**
 * Himpunan bagian dari `DenyReason` yang benar-benar dapat diputuskan
 * evaluator izin.
 *
 * `FILE_MISSING` dan `RATE_LIMITED` sengaja berada di luar. Keduanya
 * keputusan pemanggil — yang pertama baru diketahui saat berkas ternyata
 * tidak ada di Blob, yang kedua diputuskan sebelum evaluator dipanggil
 * sama sekali. Tipe yang jujur mencegah keduanya tertukar dengan
 * keputusan izin.
 *
 * Dipersempit dengan `Extract<>` dan bukan ditulis ulang sebagai union
 * literal, supaya nilai yang dihapus dari skema menghasilkan galat tipe
 * dan bukan tipe yang diam-diam berbeda dari enum database.
 */
export type AccessDenyReason = Extract<
  DenyReason,
  | "NOT_FOUND"
  | "REVOKED"
  | "EXPIRED"
  | "PRIVATE"
  | "ITEM_INACTIVE"
  | "REQUEST_REJECTED"
  | "REQUEST_REVOKED"
  | "APPROVAL_EXPIRED"
>;

/**
 * Hasil evaluasi izin. Union eksplisit, bukan boolean: alasan penolakan
 * diperlukan untuk `AccessLog`, dan keadaan `NEEDS_*` menentukan halaman
 * apa yang dirender.
 *
 * `NEEDS_REQUEST` dan `PENDING_APPROVAL` didefinisikan sekarang tetapi
 * belum pernah dihasilkan. Keduanya lahir di Unit 7. Bentuknya ditulis
 * lebih dulu supaya pemanggil yang dibangun sesudah ini sudah menangani
 * keduanya sejak awal.
 */
export type AccessDecision =
  | { kind: "GRANTED"; ownerPreview: boolean }
  | { kind: "NEEDS_LOGIN" }
  | { kind: "NEEDS_REQUEST" }
  | { kind: "PENDING_APPROVAL" }
  | { kind: "DENIED"; reason: AccessDenyReason };

/**
 * Bentuk struktural minimal, bukan model Prisma. Hanya kolom yang ikut
 * menentukan keputusan yang masuk — sehingga matriks pengujian dapat
 * ditulis tanpa merakit model lengkap berisi belasan kolom yang tidak
 * berpengaruh.
 */
export type AccessGroup = {
  id: string;
  shareEnabled: boolean;
  expiresAt: Date | null;
  visibility: Visibility;
};

export type AccessItem = {
  id: string;
  groupId: string;
  isActive: boolean;
  accessMode: AccessMode;
};

/** `null` berarti pengunjung belum masuk. */
export type AccessSession = { userId: string; role: Role } | null;

/**
 * Catatan izin pemohon untuk satu item. Diambil oleh pemanggil dan
 * diberikan sebagai argumen; evaluator tidak boleh mengambilnya sendiri,
 * karena itu menghancurkan kemurniannya dan membuat matriksnya
 * memerlukan database.
 */
export type AccessRequestRecord = {
  status: RequestStatus;
  expiresAt: Date | null;
} | null;
```

- [ ] **Step 2: Pastikan berkas tipe bersih**

Run: `npm run typecheck`
Expected: keluar tanpa galat. Berkas tipe belum dipakai siapa pun, jadi ini hanya membuktikan impornya benar.

- [ ] **Step 3: Tulis matriks tahap satu yang gagal**

Buat `tests/access/group-stage.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { evaluateGroupAccess } from "@/lib/access/evaluate-access";
import type { AccessGroup, AccessSession } from "@/lib/types/access";

const NOW = new Date("2026-08-27T10:00:00Z");
const KEMARIN = new Date("2026-08-26T10:00:00Z");
const BESOK = new Date("2026-08-28T10:00:00Z");

/** Group yang sehat: dibagikan, tidak kedaluwarsa, publik. */
const groupAktif: AccessGroup = {
  id: "g1",
  shareEnabled: true,
  expiresAt: null,
  visibility: "PUBLIC",
};

const pemilik: AccessSession = { userId: "u-owner", role: "OWNER" };
const pengunjung: AccessSession = { userId: "u-viewer", role: "VIEWER" };
const belumMasuk: AccessSession = null;

describe("gerbang group", () => {
  it("menolak slug yang tidak ada tanpa membocorkan apa pun", () => {
    expect(evaluateGroupAccess(null, belumMasuk, NOW)).toEqual({
      kind: "DENIED",
      reason: "NOT_FOUND",
    });
  });

  it("membolehkan pemilik membuka group yang sedang aktif, tanpa spanduk pratinjau", () => {
    expect(evaluateGroupAccess(groupAktif, pemilik, NOW)).toEqual({
      kind: "GRANTED",
      ownerPreview: false,
    });
  });

  it("membolehkan pemilik membuka group yang linknya sudah dicabut, dengan spanduk pratinjau", () => {
    expect(
      evaluateGroupAccess({ ...groupAktif, shareEnabled: false }, pemilik, NOW),
    ).toEqual({ kind: "GRANTED", ownerPreview: true });
  });

  it("membolehkan pemilik membuka group yang sudah kedaluwarsa, dengan spanduk pratinjau", () => {
    expect(
      evaluateGroupAccess({ ...groupAktif, expiresAt: KEMARIN }, pemilik, NOW),
    ).toEqual({ kind: "GRANTED", ownerPreview: true });
  });

  // Group privat bukan group yang linknya mati — ia group yang linknya
  // memang belum dibagikan. Spanduk "link sedang tidak aktif" akan
  // berbohong di sana.
  it("tidak memasang spanduk pratinjau untuk group privat yang masih dibagikan", () => {
    expect(
      evaluateGroupAccess({ ...groupAktif, visibility: "PRIVATE" }, pemilik, NOW),
    ).toEqual({ kind: "GRANTED", ownerPreview: false });
  });

  it("menolak group yang linknya dicabut", () => {
    expect(
      evaluateGroupAccess({ ...groupAktif, shareEnabled: false }, pengunjung, NOW),
    ).toEqual({ kind: "DENIED", reason: "REVOKED" });
  });

  it("menolak group kedaluwarsa meski pengunjung sudah masuk", () => {
    expect(
      evaluateGroupAccess({ ...groupAktif, expiresAt: KEMARIN }, pengunjung, NOW),
    ).toEqual({ kind: "DENIED", reason: "EXPIRED" });
  });

  it("menolak group privat meski pengunjung sudah masuk", () => {
    expect(
      evaluateGroupAccess({ ...groupAktif, visibility: "PRIVATE" }, pengunjung, NOW),
    ).toEqual({ kind: "DENIED", reason: "PRIVATE" });
  });

  it("meminta pengunjung masuk lebih dulu pada group yang wajib login", () => {
    expect(
      evaluateGroupAccess(
        { ...groupAktif, visibility: "REQUIRE_LOGIN" },
        belumMasuk,
        NOW,
      ),
    ).toEqual({ kind: "NEEDS_LOGIN" });
  });

  it("membolehkan pengunjung yang sudah masuk pada group yang wajib login", () => {
    expect(
      evaluateGroupAccess(
        { ...groupAktif, visibility: "REQUIRE_LOGIN" },
        pengunjung,
        NOW,
      ),
    ).toEqual({ kind: "GRANTED", ownerPreview: false });
  });

  it("membolehkan pengunjung anonim pada group publik", () => {
    expect(evaluateGroupAccess(groupAktif, belumMasuk, NOW)).toEqual({
      kind: "GRANTED",
      ownerPreview: false,
    });
  });

  it("tidak menganggap group tanpa tanggal kedaluwarsa pernah kedaluwarsa", () => {
    expect(
      evaluateGroupAccess({ ...groupAktif, expiresAt: null }, pengunjung, BESOK),
    ).toEqual({ kind: "GRANTED", ownerPreview: false });
  });
});

// Urutan aturan adalah bagian dari aturannya. Ketiga pengujian berikut
// memastikan "berhenti pada kecocokan pertama" benar-benar berlaku dan
// bukan kebetulan yang lolos karena kasus ujinya tidak pernah bertabrakan.
describe("urutan aturan gerbang group", () => {
  it("memperlakukan slug tak dikenal sebagai tidak ada, bahkan bagi pemilik", () => {
    expect(evaluateGroupAccess(null, pemilik, NOW)).toEqual({
      kind: "DENIED",
      reason: "NOT_FOUND",
    });
  });

  it("menyebut link yang dicabut sebagai dicabut, bukan kedaluwarsa, ketika keduanya berlaku", () => {
    expect(
      evaluateGroupAccess(
        { ...groupAktif, shareEnabled: false, expiresAt: KEMARIN },
        pengunjung,
        NOW,
      ),
    ).toEqual({ kind: "DENIED", reason: "REVOKED" });
  });

  it("menyebut group kedaluwarsa sebagai kedaluwarsa, bukan privat, ketika keduanya berlaku", () => {
    expect(
      evaluateGroupAccess(
        { ...groupAktif, expiresAt: KEMARIN, visibility: "PRIVATE" },
        pengunjung,
        NOW,
      ),
    ).toEqual({ kind: "DENIED", reason: "EXPIRED" });
  });
});

// Ambangnya harus sama persis dengan resolveGroupStatus() di
// lib/groups/status.ts, supaya lencana di dashboard dan gerbang publik
// tidak menjawab beda pada detik yang sama.
describe("ambang kedaluwarsa", () => {
  it("menganggap group kedaluwarsa tepat pada detik tanggalnya", () => {
    expect(
      evaluateGroupAccess({ ...groupAktif, expiresAt: NOW }, pengunjung, NOW),
    ).toEqual({ kind: "DENIED", reason: "EXPIRED" });
  });

  it("belum menganggap kedaluwarsa satu detik sebelum tanggalnya", () => {
    expect(
      evaluateGroupAccess(
        { ...groupAktif, expiresAt: new Date("2026-08-27T10:00:01Z") },
        pengunjung,
        NOW,
      ),
    ).toEqual({ kind: "GRANTED", ownerPreview: false });
  });
});
```

- [ ] **Step 4: Jalankan dan pastikan gagal**

Run: `npx vitest run tests/access/group-stage.test.ts`
Expected: FAIL. Galatnya adalah kegagalan resolusi impor — `Failed to resolve import "@/lib/access/evaluate-access"` — karena berkasnya belum ada. Ini kegagalan yang benar untuk langkah ini.

- [ ] **Step 5: Tulis tahap satu**

Buat `lib/access/evaluate-access.ts`:

```ts
import type {
  AccessDecision,
  AccessDenyReason,
  AccessGroup,
  AccessSession,
} from "@/lib/types/access";

function denied(reason: AccessDenyReason): AccessDecision {
  return { kind: "DENIED", reason };
}

function granted(ownerPreview: boolean): AccessDecision {
  return { kind: "GRANTED", ownerPreview };
}

/**
 * Ambangnya `<=`, sama persis dengan `resolveGroupStatus()` di
 * `lib/groups/status.ts`. Keduanya sengaja TIDAK berbagi kode: yang di
 * sana fungsi tampilan yang cabang terakhirnya permisif, yang di sini
 * evaluator izin yang bawaannya menolak. Yang dibagi hanyalah ambang.
 */
function isExpired(group: AccessGroup, now: Date): boolean {
  return group.expiresAt !== null && group.expiresAt.getTime() <= now.getTime();
}

/**
 * Tahap satu — gerbang group. Dievaluasi berurutan, berhenti pada
 * kecocokan pertama. Urutannya adalah bagian dari aturannya dan tidak
 * boleh ditukar tanpa menukar pengujiannya juga.
 */
export function evaluateGroupAccess(
  group: AccessGroup | null,
  session: AccessSession,
  now: Date,
): AccessDecision {
  if (group === null) return denied("NOT_FOUND");

  // Pemilik selalu dapat membuka groupnya sendiri. Penanda ownerPreview
  // memberitahu halaman untuk memasang spanduk "link sedang tidak aktif".
  // Group PRIVATE tidak memicunya: linknya tidak mati, ia memang belum
  // dibagikan.
  if (session?.role === "OWNER") {
    return granted(!group.shareEnabled || isExpired(group, now));
  }

  if (!group.shareEnabled) return denied("REVOKED");
  if (isExpired(group, now)) return denied("EXPIRED");
  if (group.visibility === "PRIVATE") return denied("PRIVATE");
  if (group.visibility === "REQUIRE_LOGIN" && session === null) {
    return { kind: "NEEDS_LOGIN" };
  }

  return granted(false);
}
```

- [ ] **Step 6: Jalankan dan pastikan lulus**

Run: `npx vitest run tests/access/group-stage.test.ts`
Expected: PASS, 17 pengujian lulus di 1 berkas.

- [ ] **Step 7: Jalankan gerbang statis**

Run: `npm run typecheck && npm run lint`
Expected: keduanya keluar bersih, nol galat dan nol peringatan.

- [ ] **Step 8: Commit**

```bash
git add lib/types/access.ts lib/access/evaluate-access.ts tests/access/group-stage.test.ts
git commit -m "feat(access): gerbang group sebagai fungsi murni beserta matriksnya

Tujuh aturan tahap satu, dievaluasi berurutan dan berhenti pada
kecocokan pertama. Union hasil eksplisit, bukan boolean: alasan
penolakan diperlukan AccessLog dan keadaan NEEDS_* menentukan halaman
yang dirender. Ambang kedaluwarsa meniru resolveGroupStatus tanpa
berbagi kode dengannya.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: Tahap dua — pemeriksaan struktural dan cabang pemilik

Tahap dua dibangun dalam dua task supaya cabang pemilik yang baru diputuskan (U4-2) dapat ditolak seorang reviewer tanpa ikut menolak aturan `accessMode` yang sudah lama tertulis.

**Files:**
- Modify: `lib/access/evaluate-access.ts`
- Test: `tests/access/item-stage.test.ts`

**Interfaces:**
- Consumes: `evaluateGroupAccess(group, session, now)` dan seluruh tipe dari Task 2.
- Produces: `evaluateItemAccess(group: AccessGroup | null, item: AccessItem | null, session: AccessSession, request: AccessRequestRecord, now: Date): AccessDecision` di `@/lib/access/evaluate-access`. Urutan argumennya tetap dan dipakai Task 4 apa adanya.

- [ ] **Step 1: Tulis pengujian struktural dan cabang pemilik yang gagal**

Buat `tests/access/item-stage.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { evaluateItemAccess } from "@/lib/access/evaluate-access";
import type {
  AccessGroup,
  AccessItem,
  AccessSession,
} from "@/lib/types/access";

const NOW = new Date("2026-08-27T10:00:00Z");

/** Group yang sudah lolos tahap satu untuk siapa pun. */
const groupAktif: AccessGroup = {
  id: "g1",
  shareEnabled: true,
  expiresAt: null,
  visibility: "PUBLIC",
};

const itemTerbuka: AccessItem = {
  id: "i1",
  groupId: "g1",
  isActive: true,
  accessMode: "OPEN",
};

const pemilik: AccessSession = { userId: "u-owner", role: "OWNER" };
const pengunjung: AccessSession = { userId: "u-viewer", role: "VIEWER" };

const TANPA_IZIN = null;

describe("gerbang item — keberadaan dan keaktifan", () => {
  it("menolak item yang tidak ada", () => {
    expect(
      evaluateItemAccess(groupAktif, null, pengunjung, TANPA_IZIN, NOW),
    ).toEqual({ kind: "DENIED", reason: "NOT_FOUND" });
  });

  // Tanpa pemeriksaan ini, menempelkan id item milik group lain ke URL
  // group yang terbuka akan menyajikan berkas yang bukan miliknya.
  it("menolak item milik group lain yang id-nya ditempelkan ke URL group ini", () => {
    expect(
      evaluateItemAccess(
        groupAktif,
        { ...itemTerbuka, groupId: "g-lain" },
        pengunjung,
        TANPA_IZIN,
        NOW,
      ),
    ).toEqual({ kind: "DENIED", reason: "NOT_FOUND" });
  });

  it("menolak item yang dinonaktifkan pemilik", () => {
    expect(
      evaluateItemAccess(
        groupAktif,
        { ...itemTerbuka, isActive: false },
        pengunjung,
        TANPA_IZIN,
        NOW,
      ),
    ).toEqual({ kind: "DENIED", reason: "ITEM_INACTIVE" });
  });
});

describe("gerbang item — pemilik", () => {
  it("membolehkan pemilik membuka item yang butuh persetujuan tanpa mengajukan izin kepada dirinya sendiri", () => {
    expect(
      evaluateItemAccess(
        groupAktif,
        { ...itemTerbuka, accessMode: "APPROVAL" },
        pemilik,
        TANPA_IZIN,
        NOW,
      ),
    ).toEqual({ kind: "GRANTED", ownerPreview: false });
  });

  it("membolehkan pemilik membuka item yang butuh identitas", () => {
    expect(
      evaluateItemAccess(
        groupAktif,
        { ...itemTerbuka, accessMode: "IDENTITY" },
        pemilik,
        TANPA_IZIN,
        NOW,
      ),
    ).toEqual({ kind: "GRANTED", ownerPreview: false });
  });

  // Cabang pemilik berdiri SESUDAH pemeriksaan keaktifan. Kepemilikan
  // hanya melewati aturan accessMode, bukan membatalkan penonaktifan yang
  // pemilik lakukan sendiri — untuk membukanya ia cukup mengaktifkannya
  // lagi di CMS.
  it("tetap menolak item nonaktif meski yang membuka adalah pemiliknya", () => {
    expect(
      evaluateItemAccess(
        groupAktif,
        { ...itemTerbuka, isActive: false },
        pemilik,
        TANPA_IZIN,
        NOW,
      ),
    ).toEqual({ kind: "DENIED", reason: "ITEM_INACTIVE" });
  });

  it("meneruskan spanduk pratinjau tahap satu kepada pemilik yang membuka item di group yang dicabut", () => {
    expect(
      evaluateItemAccess(
        { ...groupAktif, shareEnabled: false },
        itemTerbuka,
        pemilik,
        TANPA_IZIN,
        NOW,
      ),
    ).toEqual({ kind: "GRANTED", ownerPreview: true });
  });
});
```

- [ ] **Step 2: Jalankan dan pastikan gagal**

Run: `npx vitest run tests/access/item-stage.test.ts`
Expected: FAIL dengan `"evaluateItemAccess" is not exported by "lib/access/evaluate-access.ts"` — fungsinya belum ada.

- [ ] **Step 3: Tambahkan tahap dua sebatas struktural dan pemilik**

Tambahkan di `lib/access/evaluate-access.ts`, di bawah `evaluateGroupAccess()`. Perbarui juga baris impor tipenya di bagian atas berkas sehingga menjadi:

```ts
import type {
  AccessDecision,
  AccessDenyReason,
  AccessGroup,
  AccessItem,
  AccessRequestRecord,
  AccessSession,
} from "@/lib/types/access";
```

Lalu tambahkan fungsinya:

```ts
/**
 * Tahap dua — gerbang item.
 *
 * Baris pertamanya menjalankan tahap satu dan mengembalikan hasilnya apa
 * adanya bila bukan `GRANTED`. Itulah invarian 6 — item tidak pernah
 * lebih permisif daripada group induknya — sebagai struktur kode, bukan
 * sebagai disiplin pemanggil. Gerbang item memanggil fungsi ini SAJA,
 * satu panggilan, bukan dua.
 *
 * `request` belum dibaca: cabang `APPROVAL` menolak lebih dulu selama
 * Unit 7 belum ada. Ia sudah ada di tanda tangan sejak sekarang supaya
 * Unit 7 mengubah isi fungsi, bukan setiap pemanggilnya.
 */
export function evaluateItemAccess(
  group: AccessGroup | null,
  item: AccessItem | null,
  session: AccessSession,
  request: AccessRequestRecord,
  now: Date,
): AccessDecision {
  const groupDecision = evaluateGroupAccess(group, session, now);
  if (groupDecision.kind !== "GRANTED") return groupDecision;

  // `group === null` sudah ditolak tahap satu sebagai NOT_FOUND; ia
  // disebut lagi di sini semata agar penyempitan tipenya terbaca compiler.
  if (group === null || item === null || item.groupId !== group.id) {
    return denied("NOT_FOUND");
  }

  if (!item.isActive) return denied("ITEM_INACTIVE");

  // Pemilik melewati aturan accessMode, yang memang ditujukan kepada
  // pengunjung. Letaknya sesudah kedua pemeriksaan di atas: kepemilikan
  // tidak memunculkan item yang tidak ada, dan tidak membatalkan
  // penonaktifan yang pemilik lakukan sendiri.
  if (session?.role === "OWNER") return granted(groupDecision.ownerPreview);

  return denied("NOT_FOUND");
}
```

Baris `return denied("NOT_FOUND")` terakhir bersifat sementara dan diganti seluruhnya oleh `switch` di Task 4. Ia ditulis begitu, dan bukan dibiarkan tanpa `return`, supaya keadaan setengah jadi ini pun bersikap menolak.

- [ ] **Step 4: Jalankan dan pastikan lulus**

Run: `npx vitest run tests/access/item-stage.test.ts`
Expected: PASS, 7 pengujian lulus.

- [ ] **Step 5: Jalankan gerbang statis**

Run: `npm run typecheck && npm run lint`
Expected: bersih. Parameter `request` yang belum terpakai tidak dilaporkan karena `now` sesudahnya terpakai, dan aturan `no-unused-vars` bawaan memakai `args: "after-used"`. Bila ternyata dilaporkan juga, JANGAN menghapus parameternya — laporkan temuan itu, karena urutan argumen sudah dipakai Task 4.

- [ ] **Step 6: Commit**

```bash
git add lib/access/evaluate-access.ts tests/access/item-stage.test.ts
git commit -m "feat(access): tahap dua gerbang item, pemeriksaan struktural dan cabang pemilik

evaluateItemAccess menjalankan tahap satu di baris pertamanya, sehingga
invarian 6 menjadi struktur kode dan bukan disiplin pemanggil. Cabang
pemilik berdiri sesudah NOT_FOUND dan ITEM_INACTIVE: kepemilikan hanya
melewati aturan accessMode. Cabang accessMode menyusul.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: Tahap dua — aturan `accessMode`

**Files:**
- Modify: `lib/access/evaluate-access.ts`
- Modify: `tests/access/item-stage.test.ts`

**Interfaces:**
- Consumes: `evaluateItemAccess()` dengan tanda tangan dari Task 3, tidak berubah.
- Produces: perilaku akhir tahap dua untuk keempat nilai `accessMode` termasuk nilai tak dikenal.

- [ ] **Step 1: Tambahkan pengujian accessMode yang gagal**

Tambahkan di akhir `tests/access/item-stage.test.ts`. Impor `AccessMode` diperlukan untuk pengujian nilai tak dikenal, jadi ubah dulu baris impor tipe di bagian atas berkas menjadi:

```ts
import type { AccessMode } from "@prisma/client";
import type {
  AccessGroup,
  AccessItem,
  AccessSession,
} from "@/lib/types/access";
```

Tambahkan juga satu konstanta sesi di bawah deklarasi `pengunjung` yang sudah ada, karena seluruh cabang `NEEDS_LOGIN` di bawah memerlukannya. Ia sengaja tidak dideklarasikan di Task 3: di sana belum ada satu pun pengujian yang memakainya, dan konstanta yang menganggur membuat `npm run lint` mengeluarkan peringatan.

```ts
const belumMasuk: AccessSession = null;
```

Lalu tambahkan di akhir berkas:

```ts
describe("gerbang item — tingkat akses", () => {
  it("meneruskan pengunjung anonim ke item terbuka", () => {
    expect(
      evaluateItemAccess(groupAktif, itemTerbuka, belumMasuk, TANPA_IZIN, NOW),
    ).toEqual({ kind: "GRANTED", ownerPreview: false });
  });

  it("meminta pengunjung masuk lebih dulu pada item yang aksesnya dicatat", () => {
    expect(
      evaluateItemAccess(
        groupAktif,
        { ...itemTerbuka, accessMode: "IDENTITY" },
        belumMasuk,
        TANPA_IZIN,
        NOW,
      ),
    ).toEqual({ kind: "NEEDS_LOGIN" });
  });

  it("meneruskan pengunjung yang sudah masuk ke item yang aksesnya dicatat", () => {
    expect(
      evaluateItemAccess(
        groupAktif,
        { ...itemTerbuka, accessMode: "IDENTITY" },
        pengunjung,
        TANPA_IZIN,
        NOW,
      ),
    ).toEqual({ kind: "GRANTED", ownerPreview: false });
  });

  it("meminta pengunjung masuk lebih dulu pada item yang butuh persetujuan", () => {
    expect(
      evaluateItemAccess(
        groupAktif,
        { ...itemTerbuka, accessMode: "APPROVAL" },
        belumMasuk,
        TANPA_IZIN,
        NOW,
      ),
    ).toEqual({ kind: "NEEDS_LOGIN" });
  });

  // Kriteria sukses nomor 8: item APPROVAL tanpa catatan izin berstatus
  // APPROVED selalu ditolak, TERMASUK ketika fitur persetujuannya belum
  // selesai dibangun. Unit 7 mengubah baris ini menjadi NEEDS_REQUEST;
  // sampai saat itu yang benar adalah penolakan. Lihat U4-1 di
  // progress-tracker.md.
  it("menolak pengunjung yang sudah masuk pada item yang butuh persetujuan selama alur izin belum ada", () => {
    expect(
      evaluateItemAccess(
        groupAktif,
        { ...itemTerbuka, accessMode: "APPROVAL" },
        pengunjung,
        TANPA_IZIN,
        NOW,
      ),
    ).toEqual({ kind: "DENIED", reason: "NOT_FOUND" });
  });

  // Pemeranan tipenya disengaja. Yang sedang diuji adalah data yang lebih
  // tua atau lebih baru daripada kode — baris database yang ditulis versi
  // berikutnya lalu dibaca versi sekarang. TypeScript tidak melindungi
  // dari itu; cabang `default` yang melindunginya, dan pengujian inilah
  // buktinya. Menambah mode baru tidak boleh diam-diam membuka akses.
  it("menolak nilai tingkat akses yang tidak dikenalinya", () => {
    expect(
      evaluateItemAccess(
        groupAktif,
        { ...itemTerbuka, accessMode: "SOMETHING_ELSE" as AccessMode },
        pengunjung,
        TANPA_IZIN,
        NOW,
      ),
    ).toEqual({ kind: "DENIED", reason: "NOT_FOUND" });
  });

  it("menolak nilai tingkat akses yang tidak dikenali bahkan sebelum meminta pengunjung masuk", () => {
    expect(
      evaluateItemAccess(
        groupAktif,
        { ...itemTerbuka, accessMode: "SOMETHING_ELSE" as AccessMode },
        belumMasuk,
        TANPA_IZIN,
        NOW,
      ),
    ).toEqual({ kind: "DENIED", reason: "NOT_FOUND" });
  });
});
```

- [ ] **Step 2: Jalankan dan pastikan gagal**

Run: `npx vitest run tests/access/item-stage.test.ts`
Expected: FAIL pada empat pengujian baru — item `OPEN` anonim, kedua `IDENTITY`, dan `APPROVAL` yang belum masuk — karena implementasi Task 3 masih menolak semuanya dengan `NOT_FOUND`. Ketiga sisanya, yaitu kedua nilai tak dikenal dan penolakan `APPROVAL` bagi pengunjung yang sudah masuk, sudah lulus sejak sekarang. Itu benar dan bukan kebetulan: keadaan setengah jadi memang harus menolak.

- [ ] **Step 3: Ganti penolakan sementara dengan aturan accessMode**

Di `lib/access/evaluate-access.ts`, ganti baris terakhir `evaluateItemAccess()` — `return denied("NOT_FOUND");` yang ditandai sementara di Task 3 — dengan:

```ts
  switch (item.accessMode) {
    case "OPEN":
      return granted(groupDecision.ownerPreview);

    case "IDENTITY":
      if (session === null) return { kind: "NEEDS_LOGIN" };
      return granted(groupDecision.ownerPreview);

    case "APPROVAL":
      if (session === null) return { kind: "NEEDS_LOGIN" };
      // SEMENTARA — Unit 7 mengganti seluruh cabang ini dengan keenam
      // keadaan AccessRequest: tanpa catatan → NEEDS_REQUEST, PENDING →
      // PENDING_APPROVAL, REJECTED, REVOKED, APPROVED kedaluwarsa, dan
      // APPROVED. Sampai saat itu sikapnya menolak, bukan meloloskan —
      // kriteria sukses nomor 8, dan keputusan U4-1 di
      // progress-tracker.md. Ini keputusan, bukan cabang yang kelupaan.
      return denied("NOT_FOUND");

    default:
      // Nilai yang tidak dikenali menolak, dan TIDAK lolos ke cabang
      // terakhir. Penambahan mode baru tidak boleh diam-diam membuka
      // akses; ia harus gagal dengan berisik di sini lebih dulu.
      return denied("NOT_FOUND");
  }
```

- [ ] **Step 4: Jalankan dan pastikan lulus**

Run: `npx vitest run tests/access/item-stage.test.ts`
Expected: PASS, 14 pengujian lulus.

- [ ] **Step 5: Jalankan gerbang statis**

Run: `npm run typecheck && npm run lint`
Expected: bersih, nol peringatan.

- [ ] **Step 6: Commit**

```bash
git add lib/access/evaluate-access.ts tests/access/item-stage.test.ts
git commit -m "feat(access): aturan accessMode di tahap dua, dengan bawaan menolak

OPEN meneruskan siapa pun, IDENTITY dan APPROVAL menuntut masuk lebih
dulu, IDENTITY meneruskan sesudahnya. APPROVAL menolak selama Unit 7
belum ada, dan nilai yang tidak dikenali menolak lewat cabang default
alih-alih lolos ke cabang terakhir.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: Invarian 6 sebagai pengujian tersendiri

Bukan baris tabel, melainkan alasan tabelnya disusun berurutan. Berkasnya berdiri sendiri supaya tidak tenggelam di antara belasan baris matriks.

Pengujian ini kemungkinan besar **langsung lulus**, karena Task 3 sudah menjadikan invariannya struktur kode. Itu bukan alasan melewatkannya: yang dijaga di sini adalah agar perubahan di kemudian hari tidak diam-diam membalik urutannya.

**Files:**
- Test: `tests/access/stage-order.test.ts`

**Interfaces:**
- Consumes: `evaluateItemAccess()` dan `evaluateGroupAccess()` dari Task 2–4, tidak berubah.
- Produces: tidak ada kode baru.

- [ ] **Step 1: Tulis pengujian invarian**

Buat `tests/access/stage-order.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  evaluateGroupAccess,
  evaluateItemAccess,
} from "@/lib/access/evaluate-access";
import type {
  AccessDecision,
  AccessGroup,
  AccessItem,
  AccessSession,
} from "@/lib/types/access";

const NOW = new Date("2026-08-27T10:00:00Z");
const KEMARIN = new Date("2026-08-26T10:00:00Z");

const groupAktif: AccessGroup = {
  id: "g1",
  shareEnabled: true,
  expiresAt: null,
  visibility: "PUBLIC",
};

/**
 * Item paling permisif yang mungkin ada: terbuka untuk siapa pun, aktif,
 * dan benar-benar milik group itu. Kalau item semacam ini pun tidak dapat
 * melonggarkan keputusan groupnya, tidak ada item yang bisa.
 */
const itemPalingPermisif: AccessItem = {
  id: "i1",
  groupId: "g1",
  isActive: true,
  accessMode: "OPEN",
};

const pengunjung: AccessSession = { userId: "u-viewer", role: "VIEWER" };
const belumMasuk: AccessSession = null;

type Keadaan = {
  nama: string;
  group: AccessGroup | null;
  session: AccessSession;
  hasil: AccessDecision;
};

const keadaanYangDitolakTahapSatu: Keadaan[] = [
  {
    nama: "group tidak ada",
    group: null,
    session: pengunjung,
    hasil: { kind: "DENIED", reason: "NOT_FOUND" },
  },
  {
    nama: "link group dicabut",
    group: { ...groupAktif, shareEnabled: false },
    session: pengunjung,
    hasil: { kind: "DENIED", reason: "REVOKED" },
  },
  {
    nama: "group kedaluwarsa",
    group: { ...groupAktif, expiresAt: KEMARIN },
    session: pengunjung,
    hasil: { kind: "DENIED", reason: "EXPIRED" },
  },
  {
    nama: "group privat",
    group: { ...groupAktif, visibility: "PRIVATE" },
    session: pengunjung,
    hasil: { kind: "DENIED", reason: "PRIVATE" },
  },
];

describe("item tidak pernah lebih permisif daripada group induknya", () => {
  it.each(keadaanYangDitolakTahapSatu)(
    "tetap menolak item terbuka ketika $nama",
    ({ group, session, hasil }) => {
      expect(
        evaluateItemAccess(group, itemPalingPermisif, session, null, NOW),
      ).toEqual(hasil);
    },
  );

  it.each(keadaanYangDitolakTahapSatu)(
    "memberi alasan yang sama dengan gerbang groupnya ketika $nama",
    ({ group, session }) => {
      expect(
        evaluateItemAccess(group, itemPalingPermisif, session, null, NOW),
      ).toEqual(evaluateGroupAccess(group, session, NOW));
    },
  );

  // Item terbuka di dalam group yang wajib login tidak membuat group itu
  // terbuka. Yang menang adalah tahap satu.
  it("tetap meminta pengunjung masuk pada item terbuka di group yang wajib login", () => {
    expect(
      evaluateItemAccess(
        { ...groupAktif, visibility: "REQUIRE_LOGIN" },
        itemPalingPermisif,
        belumMasuk,
        null,
        NOW,
      ),
    ).toEqual({ kind: "NEEDS_LOGIN" });
  });
});
```

- [ ] **Step 2: Jalankan**

Run: `npx vitest run tests/access/stage-order.test.ts`
Expected: PASS, 9 pengujian lulus.

Bila ada yang GAGAL, jangan mengubah pengujiannya. Kegagalan di sini berarti invarian 6 memang dilanggar implementasinya — hentikan dan laporkan.

- [ ] **Step 3: Commit**

```bash
git add tests/access/stage-order.test.ts
git commit -m "test(access): invarian 6 sebagai berkas tersendiri

Untuk setiap keadaan yang membuat tahap satu menolak, item paling
permisif yang mungkin ada tetap menghasilkan penolakan tahap satu
beserta alasannya. Berdiri sendiri agar tidak tenggelam di antara
belasan baris matriks.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 6: Gerbang penyelesaian dan penutupan catatan

**Files:**
- Modify: `context/progress-tracker.md` — bagian `## Current Phase` dan `## Next Up`

**Interfaces:**
- Consumes: seluruh hasil Task 1–5.
- Produces: catatan yang membuat langkah Unit 4 berikutnya tahu apa yang sudah ada dan apa yang belum.

- [ ] **Step 1: Jalankan seluruh gerbang**

```bash
npm test && npm run typecheck && npm run lint
```

Expected: seluruh pengujian lulus — 230 pengujian yang sudah ada sebelumnya, ditambah 40 dari `tests/access/`, di 22 berkas. `typecheck` nol galat, `lint` nol peringatan.

Bila jumlahnya berbeda dari itu, jangan menyesuaikan angkanya di sini begitu saja — periksa dulu apakah ada pengujian yang tidak sengaja terlewat atau tertimpa.

- [ ] **Step 2: Pastikan tidak ada berkas di luar lingkup yang berubah**

```bash
git diff --stat main...HEAD
```

Expected: tepat delapan berkas — `context/architecture.md`, `context/progress-tracker.md`, `docs/superpowers/specs/2026-08-27-evaluate-access-design.md`, `docs/superpowers/plans/2026-08-27-unit-4-evaluate-access.md`, `lib/types/access.ts`, `lib/access/evaluate-access.ts`, dan ketiga berkas di `tests/access/`.

Tidak boleh ada `prisma/`, tidak boleh ada `app/`, tidak boleh ada `components/`. Bila ada, hentikan dan laporkan — lingkup langkah ini dilanggar.

- [ ] **Step 3: Catat penyelesaian di progress tracker**

Tambahkan di bagian `## Current Phase` di `context/progress-tracker.md`, sebagai butir terakhir:

```markdown
- **Unit 4 bagian pertama SELESAI, 27 Agustus 2026.**
  `lib/access/evaluate-access.ts` beserta matriks pengujiannya, ditulis
  sebelum satu halaman pun dibuat sesuai gerbang urutan kerja Fase 5.
  Dua fungsi murni, 40 pengujian di tiga berkas `tests/access/`, termasuk
  invarian 6 sebagai berkas tersendiri. Tiga keputusan U4-1 sampai U4-3
  dicatat di Architecture Decisions, dan cabang pemilik di tahap dua
  sudah dituliskan ke `architecture.md`. Belum ada halaman, belum ada
  route, belum ada `lib/audit/`.
```

Lalu ganti butir 1 di bagian `## Next Up` sehingga menyebut sisa Unit 4 yang belum dikerjakan:

```markdown
1. **Unit 4 lanjutan — halaman publik, gerbang item, dan `lib/audit/`.**
   Evaluator izinnya sudah ada dan matriksnya lulus; yang tersisa adalah
   pemanggilnya. Halaman group `/g/[slug]` memanggil
   `evaluateGroupAccess()`, gerbang item `/g/[slug]/i/[itemId]` memanggil
   `evaluateItemAccess()` — satu panggilan, bukan dua. `getFileStream()`
   yang ditunda Unit 3 dibangun di sini, dipanggil hanya dari balik
   gerbang. Penulisan `AccessLog` ditunggu sampai selesai sebelum
   pengalihan atau pengaliran berkas dimulai.

   Ketiga hal warisan Unit 3 di bawah masih berlaku dan wajib ditangani
   di task yang menyentuhnya.
```

Ketiga butir warisan Unit 3 yang sudah ada di bawahnya — `resolveGroupStatus()`, pilihan `getOwnerSession()` lawan `requireOwner()`, dan sanitasi `fileName` — **dibiarkan apa adanya**, kecuali butir `resolveGroupStatus()` yang diberi tambahan satu kalimat di akhirnya:

```markdown
     (Ditangani 27 Agustus 2026: evaluator menulis ambang kedaluwarsanya
     sendiri dan tidak mengimpor `lib/groups/status.ts`.)
```

- [ ] **Step 4: Commit**

```bash
git add context/progress-tracker.md
git commit -m "docs(context): tutup Unit 4 bagian pertama, arahkan Next Up ke pemanggilnya

Evaluator izin dan matriksnya selesai; yang tersisa di Unit 4 adalah
halaman publik, gerbang item, dan lib/audit/. Butir warisan Unit 3 soal
resolveGroupStatus ditandai sudah ditangani.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

- [ ] **Step 5: Berhenti**

Jangan lanjut membuat halaman. `ai-workflow-rules.md` menuntut satu unit fitur dalam satu waktu, dan gerbang urutan kerja Fase 5 sudah terpenuhi begitu matriks lulus. Langkah berikutnya dibuka dengan brainstorming dan rencananya sendiri.

---

## Catatan untuk reviewer tiap task

Tiga hal yang paling mudah lolos dari review di plan ini, dan layak
diperiksa khusus:

1. **Cabang `default` di `switch (item.accessMode)` benar-benar ada.**
   Menghapusnya tidak membuat satu pengujian pun gagal selain dua
   pengujian nilai tak dikenal — dan itulah gunanya keduanya ada.
2. **`evaluateItemAccess()` memanggil `evaluateGroupAccess()` sendiri.**
   Bila di kemudian hari ada yang "merapikan" dengan memindahkan
   panggilan itu ke pemanggil, invarian 6 berubah dari struktur menjadi
   disiplin — dan `tests/access/stage-order.test.ts` tetap lulus, karena
   ia menguji fungsinya, bukan pemanggilnya. Perubahan semacam itu harus
   ditolak di review, bukan diserahkan kepada pengujian.
3. **Tidak ada `new Date()` di dalam `lib/access/`.** Cari dengan
   `grep -rn "new Date()" lib/access/` — harus nol kecocokan.
