# Unit 1 — Fondasi dan Autentikasi: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pemilik dapat masuk dengan Google dan melihat dashboard kosong; siapa pun yang bukan pemilik ditolak masuk dashboard.

**Architecture:** Next.js 15 App Router dengan seluruh pemeriksaan izin di server. Peran `OWNER` tidak disimpan sebagai kebenaran melainkan diturunkan ulang dari `OWNER_EMAIL` setiap kali sesi dibaca, sehingga salah konfigurasi sembuh sendiri tanpa menyentuh database. Sebelas token warna Kumpulink menjadi satu-satunya sumber nilai warna, dan nama token yang dicari shadcn didefinisikan sebagai alias yang menunjuk ke sana — sehingga `components/ui/*` tidak pernah perlu disunting.

**Tech Stack:** Next.js 15 (App Router), TypeScript strict, Tailwind CSS v4, shadcn/ui, Prisma + PostgreSQL (Neon), Auth.js v5 provider Google, Zod, Vitest, Node 24.16 / npm 11.13.

**Spesifikasi sumber:** `docs/superpowers/specs/2026-08-20-unit-1-fondasi-autentikasi-design.md`. Keputusan K1–K9 di sana tidak dinegosiasikan ulang di rencana ini.

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

**Skema Prisma ditulis LENGKAP di unit ini**, termasuk `AccessRequest` dan nilai `APPROVAL`, meski fiturnya baru dibangun di Unit 7. Alasannya sudah dicatat di `progress-tracker.md` dan tidak dinegosiasikan ulang: migrasi belakangan tidak boleh menyentuh tabel yang sudah berisi data produksi.

**Direktori kerja:** seluruh perintah dijalankan dari `D:\Kumpulink\kumpulink-app`.

**Rahasia:** `.env.local` sudah terisi lengkap dan terbukti diabaikan Git. Jangan pernah mencetak isinya ke terminal, ke log, atau ke pesan commit.

---

## File Structure

Berkas yang dibuat unit ini, beserta tanggung jawab masing-masing.

| Berkas | Tanggung jawab |
| ------ | -------------- |
| `lib/env-schema.ts` | Skema Zod variabel lingkungan. **Tanpa** `server-only`, supaya dapat diuji. |
| ~~`lib/access/types.ts`~~ | **Tidak dibuat di unit ini.** K5 menetapkan bentuk tipenya, tetapi berkasnya ditulis di Unit 4 bersama `evaluateAccess()`. |
| `lib/env.ts` | `import "server-only"` + parse `process.env` + ekspor objek bertipe. |
| `lib/auth/role.ts` | `resolveRole()` — fungsi murni, tanpa dependensi Auth.js maupun env. |
| `lib/auth/config.ts` | Konfigurasi Auth.js: provider, adapter, callback, event. |
| `lib/auth/index.ts` | Ekspor `{ handlers, auth, signIn, signOut }`. |
| `lib/auth/session.ts` | `requireOwner()` untuk dipakai server component. |
| `lib/db/client.ts` | Singleton `PrismaClient`, aman terhadap hot reload. |
| `types/next-auth.d.ts` | Menambahkan `id` dan `role` ke tipe `Session`. |
| `prisma/schema.prisma` | Sembilan enum, delapan model. |
| `app/globals.css` | Tiga lapis token; satu-satunya tempat nilai warna ditulis. |
| `app/layout.tsx` | Root layout, font, skrip tema pra-lukis. |
| `app/page.tsx` | `redirect("/dashboard")`. |
| `app/akses-ditolak/page.tsx` | Halaman non-pemilik: email yang sedang masuk + tombol keluar. |
| `app/(dashboard)/layout.tsx` | Gerbang: tanpa sesi → Google; bukan `OWNER` → `/akses-ditolak`. |
| `app/(dashboard)/dashboard/page.tsx` | Dashboard kosong. |
| `app/api/auth/[...nextauth]/route.ts` | Route handler Auth.js. |
| `components/theme-toggle.tsx` | Tombol ganti tema. Satu-satunya `"use client"` di unit ini. |
| `tests/env-schema.test.ts` | Uji skema env. |
| `tests/auth/role.test.ts` | Uji `resolveRole()`. |
| `tests/styles/tokens.test.ts` | Penjaga regresi token warna, khususnya K8. |

**Kenapa `lib/env-schema.ts` terpisah dari `lib/env.ts`.** Paket `server-only` melempar galat saat diimpor di luar lingkungan React Server Component — termasuk di dalam Vitest. Menaruh skema di berkas yang sama membuat skemanya mustahil diuji. Pemisahan ini bukan gaya, melainkan syarat agar task 4 punya test yang bisa dijalankan.

---

## Task 1: Scaffold proyek dan empat gerbang

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
- Create: `vitest.config.ts`, `tests/harness.test.ts`
- Modify: `context/code-standards.md` (catat Vitest — perubahan konteks #4)

**Interfaces:**
- Consumes: —
- Produces: alias impor `@/*` menunjuk akar proyek; skrip npm `dev`, `build`, `start`, `lint`, `typecheck`, `test`.

- [ ] **Step 1: Scaffold di direktori sementara, bukan di tempat**

`create-next-app` menolak folder yang tidak kosong. Folder proyek sudah berisi `.env.example`, `.env.local`, `CLAUDE.md`, `PROMPT-PLAYBOOK.md`, `ROADMAP.md`, dan `context/` — semuanya di luar daftar putihnya. Scaffold di tempat lain lalu salin.

```bash
cd /c/Users/Lalu/AppData/Local/Temp/claude/D--Kumpulink/7aff6981-2a9c-45da-a2a3-dff12aaab637/scratchpad
npx --yes create-next-app@latest scaffold \
  --typescript --tailwind --eslint --app \
  --no-src-dir --import-alias "@/*" --use-npm
```

- [ ] **Step 2: Salin hanya berkas yang dibutuhkan**

`.gitignore` dan `README.md` hasil generate **tidak** disalin — `.gitignore` proyek sudah dibuat khusus dan sudah terbukti menahan `.env*`. Menimpanya akan membocorkan rahasia pada commit berikutnya.

```bash
cd /d/Kumpulink/kumpulink-app
S=/c/Users/Lalu/AppData/Local/Temp/claude/D--Kumpulink/7aff6981-2a9c-45da-a2a3-dff12aaab637/scratchpad/scaffold
cp "$S/package.json" "$S/package-lock.json" "$S/tsconfig.json" "$S/next.config.ts" \
   "$S/eslint.config.mjs" "$S/postcss.config.mjs" "$S/next-env.d.ts" .
cp -r "$S/app" "$S/public" .
npm install
```

- [ ] **Step 3: Buktikan `.gitignore` masih yang lama**

```bash
git diff --name-only -- .gitignore
git check-ignore -v .env.local
```

Expected: perintah pertama **tidak mengeluarkan apa pun**; perintah kedua menyebut `.gitignore:16`. Bila `.gitignore` muncul sebagai berubah, kembalikan dengan `git checkout -- .gitignore` sebelum lanjut.

- [ ] **Step 4: Pastikan TypeScript strict aktif**

Buka `tsconfig.json`, pastikan `compilerOptions.strict` bernilai `true`. `create-next-app` sudah menyetelnya; langkah ini memastikan, bukan mengubah.

- [ ] **Step 5: Pasang Vitest** *(K4)*

```bash
npm i -D vitest vite-tsconfig-paths
```

- [ ] **Step 6: Tulis `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
```

- [ ] **Step 7: Tulis test yang membuktikan harness hidup**

`tests/harness.test.ts`:

```ts
import { describe, expect, it } from "vitest";

describe("harness pengujian", () => {
  it("menjalankan berkas TypeScript tanpa langkah transformasi tambahan", () => {
    const nilai: number = 1 + 1;
    expect(nilai).toBe(2);
  });
});
```

- [ ] **Step 8: Tambahkan empat gerbang ke `package.json`**

Pada objek `scripts`, pastikan keenam baris ini ada:

```json
{
  "dev": "next dev --turbopack",
  "build": "next build",
  "start": "next start",
  "lint": "eslint .",
  "typecheck": "tsc --noEmit",
  "test": "vitest run"
}
```

- [ ] **Step 9: Jalankan keempat gerbang**

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

Expected: keempatnya keluar dengan kode 0. `npm test` melaporkan 1 passed.

**Bila `npm run build` gagal** karena variabel lingkungan: itu tidak seharusnya terjadi di task ini, karena belum ada kode yang membaca `process.env`. Bila tetap terjadi, hentikan dan laporkan — jangan menambal dengan menonaktifkan gerbangnya.

- [ ] **Step 10: Catat Vitest di file konteks** *(perubahan konteks #4)*

Pada `context/code-standards.md`, di bagian `## Testing`, sisipkan sebagai butir pertama:

```markdown
- Kerangka pengujian: **Vitest**, dijalankan lewat `npm test`.
  Dipilih karena berjalan langsung dengan TypeScript dan ESM tanpa
  lapisan transformasi tambahan, dan cepat — matriks izin dijalankan
  berulang kali di Unit 4 dan Unit 7.
```

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "Scaffold Next.js 15 dan pasang empat gerbang

create-next-app dijalankan di direktori sementara lalu berkasnya disalin,
karena folder proyek berisi enam berkas di luar daftar putihnya dan akan
ditolak. .gitignore dan README hasil generate sengaja tidak ikut disalin;
.gitignore proyek sudah terbukti menahan .env dan menimpanya akan
membocorkan rahasia pada commit berikutnya.

Vitest dipasang beserta satu test yang membuktikan harness-nya hidup."
```

---

## Task 2: shadcn/ui dan dua puluh komponen

**Files:**
- Create: `components.json`, `components/ui/*` (20 berkas), `lib/utils.ts`
- Modify: `app/globals.css` (ditimpa shadcn — akan ditulis ulang di Task 3)

**Interfaces:**
- Consumes: alias `@/*` dari Task 1
- Produces: `cn()` dari `lib/utils.ts`; dua puluh komponen di `components/ui/`

**Urutan ini penting.** `shadcn init` menulis ulang `app/globals.css` dengan token bawaannya. Task 2 harus mendahului Task 3, bukan sebaliknya — kalau dibalik, seluruh pekerjaan token di Task 3 terhapus tanpa peringatan.

- [ ] **Step 1: Inisialisasi shadcn**

```bash
npx --yes shadcn@latest init
```

Jawab: style **default**, base color **slate**, CSS variables **yes**.

- [ ] **Step 2: Tambahkan dua puluh komponen sekaligus**

Daftar ini disalin persis dari `context/ui-context.md` bagian Component Library.

```bash
npx --yes shadcn@latest add accordion button card dialog sheet input textarea select switch badge table dropdown-menu sonner skeleton alert calendar popover checkbox radio-group tabs
```

- [ ] **Step 3: Hitung dan buktikan kedua puluhnya ada**

```bash
ls components/ui | wc -l
ls components/ui
```

Expected: 20. Bila kurang, jalankan ulang `add` untuk yang hilang dan sebutkan mana yang gagal.

- [ ] **Step 4: Jalankan gerbang**

```bash
npm run typecheck && npm run lint && npm run build
```

Expected: lulus. Bila `calendar` menimbulkan galat tipe dari `react-day-picker`, catat pesannya apa adanya dan laporkan — **jangan** menyunting berkas di `components/ui/`, itu melanggar Global Constraints.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Pasang shadcn/ui dan dua puluh komponen dari ui-context.md

Dikerjakan sebelum penulisan token warna, karena shadcn init menimpa
app/globals.css. Urutan terbalik akan menghapus pekerjaan token tanpa
peringatan."
```

---

## Task 3: Token warna, mode gelap, dan font

**Files:**
- Modify: `app/globals.css` (tulis ulang penuh), `app/layout.tsx`
- Create: `components/theme-toggle.tsx`, `tests/styles/tokens.test.ts`
- Modify: `context/ui-context.md` (perubahan konteks #1)

**Interfaces:**
- Consumes: `cn()` dari Task 2
- Produces: sebelas token di `:root` dan `.dark`; alias shadcn; `--font-sans`, `--font-mono`

- [ ] **Step 1: Tulis test penjaga token lebih dulu**

Test ini menutup K8 secara permanen. Kalau suatu saat `--accent-on` tertukar kembali menjadi `--accent-foreground`, test inilah yang berteriak — bukan mata seseorang yang kebetulan mengarahkan kursor ke menu.

`tests/styles/tokens.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync("app/globals.css", "utf8");

const ELEVEN_TOKENS = [
  "--bg-base",
  "--bg-surface",
  "--bg-elevated",
  "--text-primary",
  "--text-muted",
  "--accent-primary",
  "--accent-on",
  "--border-default",
  "--state-error",
  "--state-success",
  "--state-warning",
];

function blok(selector: string): string {
  const mulai = css.indexOf(selector + " {");
  if (mulai === -1) throw new Error(`blok ${selector} tidak ditemukan`);
  const buka = css.indexOf("{", mulai);
  const tutup = css.indexOf("}", buka);
  return css.slice(buka, tutup);
}

describe("token warna", () => {
  it.each(ELEVEN_TOKENS)("mendefinisikan %s di mode terang", (token) => {
    expect(blok(":root")).toContain(`${token}:`);
  });

  it.each(ELEVEN_TOKENS)("mendefinisikan %s di mode gelap", (token) => {
    expect(blok(".dark")).toContain(`${token}:`);
  });

  it("tidak memakai --accent-foreground sebagai token Kumpulink", () => {
    expect(blok(":root")).not.toContain("--accent-foreground: #");
    expect(blok(".dark")).not.toContain("--accent-foreground:");
  });

  it("memetakan --primary-foreground ke --accent-on, bukan sebaliknya", () => {
    expect(css).toContain("--primary-foreground: var(--accent-on)");
  });

  it("memberi --accent-foreground arti shadcn, yaitu teks di atas permukaan redup", () => {
    expect(css).toContain("--accent-foreground: var(--text-primary)");
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan GAGAL**

```bash
npm test -- tests/styles/tokens.test.ts
```

Expected: FAIL. `app/globals.css` masih berisi token bawaan shadcn, jadi `--bg-base` dan kawan-kawan belum ada.

- [ ] **Step 3: Tulis ulang `app/globals.css`**

Ganti **seluruh** isinya dengan berikut. Nilai heksadesimal disalin dari tabel di `context/ui-context.md`, dengan satu-satunya perubahan `--accent-foreground` → `--accent-on` sesuai K8.

```css
@import "tailwindcss";

/* Mode gelap berbasis kelas, bukan prefers-color-scheme langsung,
   karena tombol manual harus dapat menang atas setelan sistem. */
@custom-variant dark (&:where(.dark, .dark *));

/* ---- Lapis 1: sebelas token Kumpulink. Satu-satunya tempat
   nilai warna ditulis. Mengubah palet berarti menyunting blok ini. ---- */
:root {
  --bg-base: #f8fafc;
  --bg-surface: #ffffff;
  --bg-elevated: #f1f5f9;
  --text-primary: #0f172a;
  --text-muted: #64748b;
  --accent-primary: #2563eb;
  --accent-on: #ffffff;
  --border-default: #e2e8f0;
  --state-error: #dc2626;
  --state-success: #16a34a;
  --state-warning: #d97706;
  --radius: 0.5rem;
}

.dark {
  --bg-base: #0b0f19;
  --bg-surface: #131a28;
  --bg-elevated: #1c2433;
  --text-primary: #e8edf5;
  --text-muted: #94a3b8;
  --accent-primary: #60a5fa;
  --accent-on: #0b0f19;
  --border-default: #253044;
  --state-error: #f87171;
  --state-success: #4ade80;
  --state-warning: #fbbf24;
}

/* ---- Lapis 2: nama yang dicari komponen shadcn, sebagai alias.
   Cukup didefinisikan di :root — var() diselesaikan di titik pakai,
   jadi elemen di dalam .dark otomatis mengambil nilai gelapnya. ---- */
:root {
  --background: var(--bg-base);
  --foreground: var(--text-primary);
  --card: var(--bg-surface);
  --card-foreground: var(--text-primary);
  --popover: var(--bg-surface);
  --popover-foreground: var(--text-primary);
  --primary: var(--accent-primary);
  --primary-foreground: var(--accent-on);
  --secondary: var(--bg-elevated);
  --secondary-foreground: var(--text-primary);
  --muted: var(--bg-elevated);
  --muted-foreground: var(--text-muted);
  /* Perhatikan: --accent milik shadcn adalah permukaan hover yang redup,
     BUKAN aksen biru. Aksen biru Kumpulink memetakan ke --primary. */
  --accent: var(--bg-elevated);
  --accent-foreground: var(--text-primary);
  --destructive: var(--state-error);
  --destructive-foreground: var(--accent-on);
  --border: var(--border-default);
  --input: var(--border-default);
  --ring: var(--accent-primary);
}

/* ---- Lapis 3: daftarkan menjadi utility Tailwind. ---- */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);

  --color-state-error: var(--state-error);
  --color-state-success: var(--state-success);
  --color-state-warning: var(--state-warning);

  --font-sans: var(--font-inter);
  --font-mono: var(--font-jetbrains-mono);

  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);
}

body {
  background-color: var(--bg-base);
  color: var(--text-primary);
}
```

- [ ] **Step 4: Jalankan test, pastikan LULUS**

```bash
npm test -- tests/styles/tokens.test.ts
```

Expected: PASS, seluruh kasus.

- [ ] **Step 5: Tulis ulang `app/layout.tsx` dengan font dan skrip tema**

Skrip tema harus berjalan **sebelum halaman dilukis**, kalau tidak ada kedipan putih sesaat pada mode gelap. Karena skrip itu mengubah kelas `<html>` sebelum React hidrasi, `suppressHydrationWarning` wajib ada — tanpa itu React akan mengeluh setiap muat halaman.

```tsx
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "Kumpulink",
  description: "Himpun tautan dan berkas ke dalam group, bagikan lewat satu link.",
};

const SKRIP_TEMA = `(function(){try{
var t=localStorage.getItem("theme");
var gelap=t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches);
document.documentElement.classList.toggle("dark",gelap);
}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SKRIP_TEMA }} />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Tulis `components/theme-toggle.tsx`**

Satu-satunya `"use client"` di unit ini. Dibenarkan karena `localStorage` dan `matchMedia` hanya ada di peramban.

```tsx
"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [gelap, setGelap] = useState(false);

  useEffect(() => {
    setGelap(document.documentElement.classList.contains("dark"));
  }, []);

  function ganti() {
    const berikutnya = !gelap;
    document.documentElement.classList.toggle("dark", berikutnya);
    localStorage.setItem("theme", berikutnya ? "dark" : "light");
    setGelap(berikutnya);
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={ganti}
      aria-label={gelap ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
    >
      {gelap ? (
        <Sun className="h-5 w-5" aria-hidden />
      ) : (
        <Moon className="h-5 w-5" aria-hidden />
      )}
    </Button>
  );
}
```

- [ ] **Step 7: Ganti nama token di file konteks** *(perubahan konteks #1)*

Pada `context/ui-context.md`, di **kedua** tabel warna, ganti `--accent-foreground` menjadi `--accent-on`. Nilai `#FFFFFF` dan `#0B0F19` tidak berubah. Lalu sisipkan setelah tabel mode gelap:

```markdown
**Kenapa `--accent-on`, bukan `--accent-foreground`.** Nama yang kedua
sudah dipakai shadcn/ui dengan arti berbeda — di sana ia berarti teks di
atas permukaan hover yang redup, bukan teks di atas aksen biru. Satu nama
properti CSS tidak dapat bernilai dua hal dalam scope yang sama.
Dibiarkan, setiap tombol `ghost` dan setiap baris `dropdown-menu` akan
menampilkan teks putih di atas latar abu muda saat di-hover. Nilai
paletnya tidak berubah; hanya ejaan nama variabelnya.
```

- [ ] **Step 8: Jalankan gerbang**

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "Tulis sebelas token warna, mode gelap, dan font

Token Kumpulink jadi satu-satunya sumber nilai warna; nama yang dicari
shadcn didefinisikan sebagai alias yang menunjuk ke sana, sehingga
components/ui tidak perlu disunting.

--accent-foreground diganti --accent-on karena bertabrakan arti dengan
shadcn. tests/styles/tokens.test.ts menjaga agar tidak tertukar kembali."
```

---

## Task 4: Validasi variabel lingkungan

**Files:**
- Create: `lib/env-schema.ts`, `lib/env.ts`, `tests/env-schema.test.ts`

**Interfaces:**
- Consumes: —
- Produces:
  - `buildEnvSchema(opsi: { diVercel: boolean }): z.ZodObject<...>` dari `lib/env-schema.ts`
  - `env: Env` dari `lib/env.ts`, dengan `Env = z.infer<ReturnType<typeof buildEnvSchema>>`

- [ ] **Step 1: Pasang dependensi**

```bash
npm i zod server-only
```

- [ ] **Step 2: Tulis test lebih dulu**

`tests/env-schema.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildEnvSchema } from "@/lib/env-schema";

const LENGKAP = {
  DATABASE_URL: "postgresql://u:p@host-pooler.example/db?sslmode=require",
  DIRECT_URL: "postgresql://u:p@host.example/db?sslmode=require",
  AUTH_SECRET: "a".repeat(43),
  AUTH_GOOGLE_ID: "123-abc.apps.googleusercontent.com",
  AUTH_GOOGLE_SECRET: "GOCSPX-rahasia",
  OWNER_EMAIL: "pemilik@contoh.com",
  BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_token",
  BLOB_STORE_ID: "store_abc",
  RESEND_API_KEY: "re_kunci",
  EMAIL_FROM: "Kumpulink <no-reply@contoh.com>",
  CRON_SECRET: "b".repeat(43),
};

describe("skema variabel lingkungan", () => {
  it("menerima sebelas nilai yang lengkap dan sah", () => {
    const hasil = buildEnvSchema({ diVercel: false }).safeParse(LENGKAP);
    expect(hasil.success).toBe(true);
  });

  it("menolak dan menyebut nama variabel yang kosong", () => {
    const hasil = buildEnvSchema({ diVercel: false }).safeParse({
      ...LENGKAP,
      DATABASE_URL: "",
    });
    expect(hasil.success).toBe(false);
    if (hasil.success) return;
    expect(hasil.error.issues[0]?.path).toContain("DATABASE_URL");
  });

  it("menolak OWNER_EMAIL yang bukan alamat email", () => {
    const hasil = buildEnvSchema({ diVercel: false }).safeParse({
      ...LENGKAP,
      OWNER_EMAIL: "bukan-email",
    });
    expect(hasil.success).toBe(false);
  });

  it("menolak AUTH_SECRET yang terlalu pendek", () => {
    const hasil = buildEnvSchema({ diVercel: false }).safeParse({
      ...LENGKAP,
      AUTH_SECRET: "pendek",
    });
    expect(hasil.success).toBe(false);
  });

  // K3: di atas Vercel, BLOB_READ_WRITE_TOKEN sengaja tidak dipasang —
  // autentikasi Blob memakai OIDC. Mewajibkannya membuat aplikasi mati
  // saat start di produksi.
  it("membolehkan BLOB_READ_WRITE_TOKEN kosong ketika berjalan di Vercel", () => {
    const { BLOB_READ_WRITE_TOKEN, ...tanpaToken } = LENGKAP;
    const hasil = buildEnvSchema({ diVercel: true }).safeParse(tanpaToken);
    expect(hasil.success).toBe(true);
  });

  it("mewajibkan BLOB_READ_WRITE_TOKEN ketika berjalan di luar Vercel", () => {
    const { BLOB_READ_WRITE_TOKEN, ...tanpaToken } = LENGKAP;
    const hasil = buildEnvSchema({ diVercel: false }).safeParse(tanpaToken);
    expect(hasil.success).toBe(false);
  });
});
```

- [ ] **Step 3: Jalankan test, pastikan GAGAL**

```bash
npm test -- tests/env-schema.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/env-schema'`.

- [ ] **Step 4: Tulis `lib/env-schema.ts`**

Berkas ini **tidak** mengimpor `server-only`. Itu disengaja: `server-only` melempar galat saat diimpor di luar lingkungan React Server Component, termasuk di dalam Vitest, sehingga skemanya jadi mustahil diuji.

```ts
import { z } from "zod";

const wajib = (nama: string) =>
  z.string().min(1, `${nama} wajib diisi dan tidak boleh kosong`);

export function buildEnvSchema(opsi: { diVercel: boolean }) {
  return z.object({
    DATABASE_URL: wajib("DATABASE_URL"),
    DIRECT_URL: wajib("DIRECT_URL"),
    AUTH_SECRET: z
      .string()
      .min(32, "AUTH_SECRET harus minimal 32 karakter"),
    AUTH_GOOGLE_ID: wajib("AUTH_GOOGLE_ID"),
    AUTH_GOOGLE_SECRET: wajib("AUTH_GOOGLE_SECRET"),
    OWNER_EMAIL: z
      .string()
      .email("OWNER_EMAIL harus berupa alamat email yang sah"),
    BLOB_READ_WRITE_TOKEN: opsi.diVercel
      ? z.string().optional()
      : wajib("BLOB_READ_WRITE_TOKEN"),
    BLOB_STORE_ID: wajib("BLOB_STORE_ID"),
    RESEND_API_KEY: wajib("RESEND_API_KEY"),
    EMAIL_FROM: wajib("EMAIL_FROM"),
    CRON_SECRET: z
      .string()
      .min(32, "CRON_SECRET harus minimal 32 karakter"),
  });
}

export type Env = z.infer<ReturnType<typeof buildEnvSchema>>;
```

- [ ] **Step 5: Jalankan test, pastikan LULUS**

```bash
npm test -- tests/env-schema.test.ts
```

Expected: PASS, enam kasus.

- [ ] **Step 6: Tulis `lib/env.ts`**

```ts
import "server-only";
import { buildEnvSchema, type Env } from "@/lib/env-schema";

const FASE_BUILD = "phase-production-build";

function baca(): Env {
  // Build Next.js berjalan tanpa variabel lingkungan runtime dan tidak
  // melayani satu permintaan pun. Melemparkan galat di sini hanya
  // menggagalkan build tanpa menambah keamanan apa pun.
  if (process.env.NEXT_PHASE === FASE_BUILD) {
    return process.env as unknown as Env;
  }

  const hasil = buildEnvSchema({
    diVercel: Boolean(process.env.VERCEL),
  }).safeParse(process.env);

  if (!hasil.success) {
    const rincian = hasil.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(
      `Variabel lingkungan tidak lengkap atau tidak sah:\n${rincian}\n\n` +
        `Periksa .env.local. Cara memperoleh tiap nilai ada di docs/setup-layanan.md.`,
    );
  }

  return hasil.data;
}

export const env: Env = baca();
```

- [ ] **Step 7: Buktikan galatnya benar-benar muncul dan menyebut nama variabelnya**

Ini pemeriksaan manual, dan hasilnya wajib dibaca — bukan diasumsikan.

```bash
cp .env.local .env.local.bak
sed -i 's/^OWNER_EMAIL=.*$/OWNER_EMAIL=/' .env.local
npm run dev
```

Expected: server menolak start, pesannya memuat baris `- OWNER_EMAIL: OWNER_EMAIL harus berupa alamat email yang sah`.

Kembalikan segera:

```bash
mv .env.local.bak .env.local
grep -c '^OWNER_EMAIL=.\+' .env.local
```

Expected: `1`. Bila `0`, `.env.local` rusak — pulihkan sebelum lanjut.

- [ ] **Step 8: Jalankan gerbang dan commit**

```bash
npm run typecheck && npm run lint && npm test && npm run build
git add -A
git commit -m "Validasi variabel lingkungan dengan Zod, gagal saat impor

Skema dipisah ke lib/env-schema.ts tanpa server-only supaya dapat diuji;
server-only melempar galat di dalam Vitest dan akan membuat skemanya
mustahil dites bila disatukan.

BLOB_READ_WRITE_TOKEN wajib hanya di luar Vercel. Di atas Vercel ia
sengaja tidak dipasang karena autentikasi Blob memakai OIDC, jadi
mewajibkannya akan membuat aplikasi mati saat start di produksi."
```

---

## Task 5: Skema Prisma dan migrasi pertama

**Files:**
- Create: `prisma/schema.prisma`, `lib/db/client.ts`, `prisma/migrations/*`
- Modify: `context/architecture.md` (perubahan konteks #2 dan #3)

**Interfaces:**
- Consumes: —
- Produces: `prisma` (instance `PrismaClient`) dari `lib/db/client.ts`; tipe hasil generate `@prisma/client`

- [ ] **Step 1: Pasang Prisma**

```bash
npm i -D prisma
npm i @prisma/client
```

- [ ] **Step 2: Tulis `prisma/schema.prisma` lengkap**

Sembilan enum dan delapan model. Kolom, indeks, nilai bawaan, dan kunci unik disalin dari bagian Data Model `context/architecture.md`.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

enum Role {
  OWNER
  VIEWER
}

enum Visibility {
  PRIVATE
  REQUIRE_LOGIN
  PUBLIC
}

enum ItemType {
  LINK
  PDF
  IMAGE
}

enum ItemSource {
  EXTERNAL
  UPLOAD
}

enum AccessMode {
  OPEN
  IDENTITY
  APPROVAL
}

enum RequestStatus {
  PENDING
  APPROVED
  REJECTED
  REVOKED
}

enum EventType {
  PAGE_VIEW
  ITEM_ACCESS
}

enum Outcome {
  GRANTED
  DENIED
}

enum DenyReason {
  NOT_FOUND
  REVOKED
  EXPIRED
  PRIVATE
  ITEM_INACTIVE
  FILE_MISSING
  RATE_LIMITED
  REQUEST_REJECTED
  REQUEST_REVOKED
  APPROVAL_EXPIRED
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  emailVerified DateTime?
  role          Role      @default(VIEWER)
  createdAt     DateTime  @default(now())

  accounts Account[]
  sessions Session[]
  requests AccessRequest[]
}

model Account {
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@id([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String
  expires    DateTime

  @@unique([identifier, token])
}

model Group {
  id          String     @id @default(cuid())
  title       String
  slug        String     @unique
  description String?
  visibility  Visibility @default(PRIVATE)
  shareEnabled Boolean   @default(false)
  expiresAt   DateTime?
  sortOrder   Int        @default(0)
  notifiedAt  DateTime?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  items    Item[]
  requests AccessRequest[]

  @@index([slug])
}

model Item {
  id          String     @id @default(cuid())
  groupId     String
  title       String
  description String?
  type        ItemType
  source      ItemSource
  targetUrl   String?
  fileKey     String?
  fileName    String?
  mimeType    String?
  sizeBytes   Int?
  accessMode  AccessMode @default(OPEN)
  isActive    Boolean    @default(true)
  isBroken    Boolean    @default(false)
  sortOrder   Int        @default(0)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  group    Group           @relation(fields: [groupId], references: [id], onDelete: Cascade)
  requests AccessRequest[]

  @@index([groupId, sortOrder])
}

model AccessRequest {
  id             String        @id @default(cuid())
  itemId         String
  groupId        String
  userId         String
  requesterName  String
  requesterEmail String
  message        String?
  status         RequestStatus @default(PENDING)
  ownerNote      String?
  decidedAt      DateTime?
  expiresAt      DateTime?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  item  Item  @relation(fields: [itemId], references: [id], onDelete: Cascade)
  group Group @relation(fields: [groupId], references: [id], onDelete: Cascade)
  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([itemId, userId])
  @@index([groupId, status])
  @@index([userId, status])
}

// K6 — AccessLog TIDAK memiliki relasi foreign key.
//
// code-standards.md mewajibkan penghapusan group ikut menghapus seluruh
// item dan berkasnya, sementara baris AccessLog TETAP DISIMPAN. Sekaligus
// groupId bertanda "Selalu terisi" sehingga tidak boleh null. Dengan
// foreign key hanya ada dua hasil: cascade yang ikut menghapus riwayat,
// atau constraint yang memblokir penghapusan group. Keduanya melanggar.
//
// Riwayat adalah catatan peristiwa, bukan pandangan atas keadaan
// sekarang — alasan yang sama membuat nama dan email disalin, bukan
// dirujuk.
model AccessLog {
  id           String      @id @default(cuid())
  eventType    EventType
  groupId      String
  itemId       String?
  userId       String?
  visitorName  String?
  visitorEmail String?
  outcome      Outcome
  denyReason   DenyReason?
  ipAddress    String?
  userAgent    String?
  createdAt    DateTime    @default(now())

  @@index([groupId, createdAt])
  @@index([itemId, createdAt])
}
```

- [ ] **Step 3: Format dan validasi skema sebelum menyentuh database**

```bash
npx prisma format
npx prisma validate
```

Expected: `The schema at prisma/schema.prisma is valid`.

- [ ] **Step 4: Jalankan migrasi pertama**

Prisma memakai `directUrl` untuk migrasi. Ini yang membuktikan `DIRECT_URL` benar — dan sekaligus menutup dua butir terakhir daftar periksa Fase 0.

```bash
npx prisma migrate dev --name init
```

Expected: migrasi dibuat di `prisma/migrations/<timestamp>_init/` dan diterapkan; Prisma Client tergenerate.

**Bila gagal dengan galat yang tidak menyebut penyebabnya**, curigai `DATABASE_URL` dan `DIRECT_URL` tertukar. Periksa: yang ber-`-pooler` harus `DATABASE_URL`.

- [ ] **Step 5: Buktikan tabel dan enum benar-benar ada di Neon**

```bash
npx prisma db pull --print | grep -E "^(model|enum) " | sort
```

Expected: delapan baris `model` dan sembilan baris `enum`.

- [ ] **Step 6: Tulis `lib/db/client.ts`**

Singleton diperlukan karena hot reload di mode dev membuat modul dievaluasi ulang, dan tanpa ini setiap perubahan berkas membuka pool koneksi baru sampai Neon menolak.

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

- [ ] **Step 7: Catat kedua keputusan di file konteks** *(perubahan konteks #2 dan #3)*

Pada `context/architecture.md`, di akhir bagian `### AccessLog`, sisipkan:

```markdown
**Tanpa relasi foreign key.** `groupId`, `itemId`, dan `userId` disimpan
sebagai `String` biasa, tanpa relasi Prisma. Menghapus group wajib
menyisakan riwayatnya, sedangkan `groupId` tidak boleh null — dengan
foreign key hanya ada dua hasil, cascade yang ikut menghapus riwayat atau
constraint yang memblokir penghapusan group, dan keduanya melanggar
aturan di atas. Ini sejalan dengan alasan yang sama yang membuat nama dan
email disalin alih-alih dirujuk: riwayat adalah catatan peristiwa, bukan
pandangan atas keadaan sekarang.
```

Lalu pada bagian `## Storage Model`, setelah kalimat tentang penghitung rate limit, sisipkan:

```markdown
Tabel penghitung rate limit **belum didefinisikan** dan sengaja ditunda ke
Unit 4, tempat logikanya ditulis. Bentuknya tidak pernah dirinci di bagian
Data Model, dan membuat tabel baru tidak memikul risiko yang mendasari
aturan "skema lengkap sejak Unit 1" — risiko itu melekat pada penambahan
kolom atau nilai enum ke tabel yang sudah berisi data.
```

- [ ] **Step 8: Jalankan gerbang dan commit**

```bash
npm run typecheck && npm run lint && npm test && npm run build
git add -A
git commit -m "Skema Prisma lengkap dan migrasi pertama ke Neon

Delapan model dan sembilan enum, termasuk AccessRequest dan nilai
APPROVAL meski fiturnya baru dibangun di Unit 7 — migrasi belakangan
tidak boleh menyentuh tabel yang sudah berisi data produksi.

AccessLog sengaja tanpa foreign key. Menghapus group wajib menyisakan
riwayatnya sedangkan groupId tidak boleh null; dengan FK hanya ada
cascade yang menghapus riwayat atau constraint yang memblokir
penghapusan, dan keduanya melanggar aturan yang tertulis.

Migrasi berjalan lewat DIRECT_URL, sekaligus menutup dua butir terakhir
daftar periksa Fase 0 yang tertunda karena psql tidak terpasang."
```

---

## Task 6: `resolveRole()` — penentuan peran sebagai fungsi murni

**Files:**
- Create: `lib/auth/role.ts`, `tests/auth/role.test.ts`
- Modify: `context/architecture.md` (perubahan konteks #7)

**Interfaces:**
- Consumes: —
- Produces: `type Role = "OWNER" | "VIEWER"` dan `resolveRole(email: string | null | undefined, ownerEmail: string): Role` dari `lib/auth/role.ts`

Fungsi ini berdiri terpisah dari Auth.js dan **tidak** mengimpor `lib/env.ts`, sehingga dapat diuji tanpa menyalakan Next.js, tanpa sesi, dan tanpa database.

- [ ] **Step 1: Tulis test lebih dulu**

`tests/auth/role.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { resolveRole } from "@/lib/auth/role";

const PEMILIK = "pemilik@contoh.com";

describe("resolveRole", () => {
  it("memberi OWNER pada alamat yang sama persis", () => {
    expect(resolveRole("pemilik@contoh.com", PEMILIK)).toBe("OWNER");
  });

  // K9 — OWNER_EMAIL diketik tangan ke .env.local sedangkan alamatnya
  // datang dari Google. Beda huruf kapital mengunci pemilik di luar
  // dashboardnya sendiri, tanpa antarmuka untuk memperbaikinya.
  it.each([
    ["huruf besar di awal", "Pemilik@contoh.com"],
    ["huruf besar seluruhnya", "PEMILIK@CONTOH.COM"],
    ["spasi di depan", "  pemilik@contoh.com"],
    ["spasi di belakang", "pemilik@contoh.com  "],
  ])("memberi OWNER meski %s", (_nama, email) => {
    expect(resolveRole(email, PEMILIK)).toBe("OWNER");
  });

  it("memberi OWNER meski OWNER_EMAIL sendiri yang berbeda huruf besar-kecil", () => {
    expect(resolveRole("pemilik@contoh.com", "PeMiLiK@Contoh.Com")).toBe("OWNER");
  });

  it.each([
    ["alamat lain", "orang@contoh.com"],
    ["domain lain", "pemilik@lain.com"],
    ["subalamat plus", "pemilik+tag@contoh.com"],
  ])("memberi VIEWER pada %s", (_nama, email) => {
    expect(resolveRole(email, PEMILIK)).toBe("VIEWER");
  });

  it.each([
    ["null", null],
    ["undefined", undefined],
    ["string kosong", ""],
  ])("memberi VIEWER ketika email %s", (_nama, email) => {
    expect(resolveRole(email, PEMILIK)).toBe("VIEWER");
  });
});
```

Catatan pada kasus `pemilik+tag@contoh.com`: subalamat **tidak** dianggap sama. Gmail memperlakukannya sebagai kotak masuk yang sama, tetapi menyamakannya di sini berarti siapa pun yang dapat menerima surat pada subalamat itu menjadi pemilik. Sikap "keadaan tidak pasti berarti menolak" berlaku.

- [ ] **Step 2: Jalankan test, pastikan GAGAL**

```bash
npm test -- tests/auth/role.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/auth/role'`.

- [ ] **Step 3: Tulis `lib/auth/role.ts`**

```ts
export type Role = "OWNER" | "VIEWER";

function normalkan(nilai: string): string {
  return nilai.trim().toLowerCase();
}

/**
 * Menentukan peran dari alamat email, tanpa menyentuh database maupun
 * sesi. Ini satu-satunya tempat aturan peran ditulis.
 *
 * Perbandingannya dinormalkan lebih dulu (K9): OWNER_EMAIL diketik tangan
 * sedangkan alamatnya datang dari Google, sehingga beda huruf kapital
 * atau spasi tersalin akan mengunci pemilik di luar dashboardnya sendiri.
 * Ini tidak melonggarkan keamanan — Google menormalkan alamatnya sendiri
 * dan tidak pernah menerbitkan dua akun yang hanya berbeda huruf.
 */
export function resolveRole(
  email: string | null | undefined,
  ownerEmail: string,
): Role {
  if (!email) return "VIEWER";
  return normalkan(email) === normalkan(ownerEmail) ? "OWNER" : "VIEWER";
}
```

- [ ] **Step 4: Jalankan test, pastikan LULUS**

```bash
npm test -- tests/auth/role.test.ts
```

Expected: PASS, seluruh kasus.

- [ ] **Step 5: Perbaiki frasa "sama persis" di file konteks** *(perubahan konteks #7)*

Pada `context/architecture.md`, bagian `## Auth and Access Model`, ganti butir kedua:

Dari:
```markdown
- Peran `OWNER` diberikan saat masuk bila email pengguna
  sama persis dengan variabel lingkungan `OWNER_EMAIL`.
  Tidak ada antarmuka untuk mengubah peran.
```

Menjadi:
```markdown
- Peran `OWNER` diberikan bila email pengguna cocok dengan variabel
  lingkungan `OWNER_EMAIL` **setelah keduanya dinormalkan** — spasi di
  kedua ujung dipangkas dan huruf besar-kecil disamakan. `OWNER_EMAIL`
  diketik tangan sedangkan alamatnya datang dari Google, jadi beda satu
  huruf kapital akan mengunci pemilik di luar dashboardnya sendiri, dan
  tidak ada antarmuka untuk memperbaikinya. Subalamat berawalan `+`
  **tidak** dianggap sama. Tidak ada antarmuka untuk mengubah peran.
```

- [ ] **Step 6: Jalankan gerbang dan commit**

```bash
npm run typecheck && npm run lint && npm test && npm run build
git add -A
git commit -m "resolveRole sebagai fungsi murni, perbandingan dinormalkan

Berdiri terpisah dari Auth.js dan tidak mengimpor lib/env.ts, sehingga
dapat diuji tanpa Next.js, sesi, maupun database.

Frasa 'sama persis' di architecture.md diganti. OWNER_EMAIL diketik
tangan sedangkan alamatnya datang dari Google; beda satu huruf kapital
mengunci pemilik di luar dashboardnya sendiri. Subalamat +tag tetap tidak
dianggap sama."
```

---

## Task 7: Auth.js v5 dengan provider Google

**Files:**
- Create: `lib/auth/config.ts`, `lib/auth/index.ts`, `lib/auth/session.ts`, `types/next-auth.d.ts`, `app/api/auth/[...nextauth]/route.ts`
- Modify: `tsconfig.json` (sertakan `types/`), `context/architecture.md` (perubahan konteks #5)

**Interfaces:**
- Consumes: `prisma` dari `lib/db/client.ts`; `env` dari `lib/env.ts`; `resolveRole`, `Role` dari `lib/auth/role.ts`
- Produces:
  - `{ handlers, auth, signIn, signOut }` dari `lib/auth/index.ts`
  - `requireOwner(): Promise<Session>` dari `lib/auth/session.ts`
  - `Session["user"]` bertambah `id: string` dan `role: Role`

- [ ] **Step 1: Pasang Auth.js dan adapternya**

```bash
npm i next-auth@beta @auth/prisma-adapter
```

Lalu **baca versi yang benar-benar terpasang** dan catat di pesan commit:

```bash
npm ls next-auth @auth/prisma-adapter
```

Expected: `next-auth` versi 5.x. Bila yang terpasang 4.x, hentikan — API-nya berbeda total dan seluruh kode di bawah tidak berlaku.

- [ ] **Step 2: Tulis `types/next-auth.d.ts`**

```ts
import type { DefaultSession } from "next-auth";
import type { Role } from "@/lib/auth/role";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
  }
}
```

- [ ] **Step 3: Pastikan `types/` ikut terbaca TypeScript**

Pada `tsconfig.json`, pastikan `include` memuat `types/**/*.d.ts`. Bentuk bawaan `create-next-app` sudah memuat `**/*.ts`, yang mencakupnya — periksa, jangan asal tambah.

- [ ] **Step 4: Tulis `lib/auth/config.ts`**

```ts
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

import { resolveRole } from "@/lib/auth/role";
import { prisma } from "@/lib/db/client";
import { env } from "@/lib/env";

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  // Strategi database, bukan JWT. architecture.md menyebut tabel Session
  // eksplisit sebagai bagian skema.
  session: { strategy: "database" },
  providers: [
    Google({
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    // K1 — peran diturunkan ULANG di sini setiap kali sesi dibaca.
    // Kolom User.role bukan sumber kebenaran; ia hanya salinan agar
    // dapat di-query. Menurunkannya di sini membuat salah ketik pada
    // OWNER_EMAIL sembuh sendiri pada permintaan berikutnya, tanpa
    // perlu menyunting database yang memang tidak punya antarmuka.
    session({ session, user }) {
      session.user.id = user.id;
      session.user.role = resolveRole(user.email, env.OWNER_EMAIL);
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      if (!user.id || !user.email) return;
      const role = resolveRole(user.email, env.OWNER_EMAIL);
      try {
        await prisma.user.update({ where: { id: user.id }, data: { role } });
      } catch (galat) {
        // Kolom ini bukan sumber kebenaran, jadi kegagalannya tidak boleh
        // menggagalkan proses masuk. Dicatat, lalu ditelan.
        console.error("Gagal menyegarkan kolom role:", galat);
      }
    },
  },
};
```

- [ ] **Step 5: Tulis `lib/auth/index.ts`**

```ts
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/config";

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
```

- [ ] **Step 6: Tulis `lib/auth/session.ts`**

```ts
import { redirect } from "next/navigation";
import type { Session } from "next-auth";

import { auth } from "@/lib/auth";

export const JALUR_DASHBOARD = "/dashboard";
export const JALUR_AKSES_DITOLAK = "/akses-ditolak";

/**
 * Dipakai server component yang hanya boleh dibuka pemilik.
 *
 * Tanpa sesi -> dialihkan ke Google. Ada sesi tetapi bukan pemilik ->
 * dialihkan ke halaman penjelasan, bukan 404: /dashboard adalah rute yang
 * dapat ditebak siapa pun dan bukan rahasia yang dijaga aplikasi ini,
 * sementara layar itu satu-satunya yang menyebutkan penyebabnya ketika
 * OWNER_EMAIL salah ketik.
 */
export async function requireOwner(): Promise<Session> {
  const session = await auth();

  if (!session?.user) {
    redirect(
      `/api/auth/signin?callbackUrl=${encodeURIComponent(JALUR_DASHBOARD)}`,
    );
  }

  if (session.user.role !== "OWNER") {
    redirect(JALUR_AKSES_DITOLAK);
  }

  return session;
}
```

- [ ] **Step 7: Tulis route handler**

`app/api/auth/[...nextauth]/route.ts`:

```ts
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
```

- [ ] **Step 8: Catat penurunan peran di file konteks** *(perubahan konteks #5)*

Pada `context/architecture.md`, bagian `## System Boundaries`, ganti baris `lib/auth/`:

```markdown
- `lib/auth/` — konfigurasi Auth.js, helper sesi, dan penentuan peran
  pemilik. `role.ts` berisi `resolveRole()` sebagai fungsi murni tanpa
  dependensi Auth.js maupun variabel lingkungan, sehingga dapat diuji
  tanpa database. Peran diturunkan ulang di callback `session` setiap
  kali sesi dibaca; kolom `User.role` hanya salinan agar dapat di-query
  dan **bukan** sumber kebenaran.
```

- [ ] **Step 9: Jalankan gerbang dan commit**

```bash
npm run typecheck && npm run lint && npm test && npm run build
git add -A
git commit -m "Pasang Auth.js v5 provider Google dengan adapter Prisma

Strategi sesi database, sesuai architecture.md yang menyebut tabel
Session eksplisit sebagai bagian skema.

Peran diturunkan ulang di callback session setiap kali sesi dibaca.
Kolom User.role tetap disegarkan lewat events.signIn agar dapat di-query,
tetapi bukan dia yang menentukan keputusan - kolom yang ditulis sekali
akan basi, dan pemilik yang terlanjur tercatat VIEWER tidak punya
antarmuka untuk memperbaikinya."
```

---

## Task 8: Dashboard, halaman akses ditolak, dan pengalihan `/`

**Menegakkan K2** — non-pemilik mendarat di halaman penjelasan, bukan 404.

**Files:**
- Create: `app/(dashboard)/layout.tsx`, `app/(dashboard)/dashboard/page.tsx`, `app/akses-ditolak/page.tsx`
- Modify: `app/page.tsx`, `context/architecture.md` (perubahan konteks #6)

**Interfaces:**
- Consumes: `requireOwner` dari `lib/auth/session.ts`; `auth`, `signOut` dari `lib/auth`; `ThemeToggle` dari `components/theme-toggle`; `Button`, `Card` dari `components/ui/`
- Produces: rute `/`, `/dashboard`, `/akses-ditolak`

- [ ] **Step 1: `app/page.tsx` mengalihkan ke dashboard**

```tsx
import { redirect } from "next/navigation";

export default function Beranda() {
  redirect("/dashboard");
}
```

- [ ] **Step 2: Tulis gerbang layout dashboard**

`app/(dashboard)/layout.tsx`:

```tsx
import { requireOwner } from "@/lib/auth/session";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Memanggil requireOwner() di sini, bukan di tiap halaman, membuat
  // seluruh rute di bawah grup ini terlindungi secara bawaan. Halaman
  // baru tidak dapat lupa memeriksanya.
  await requireOwner();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <span className="text-base font-medium">Kumpulink</span>
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </div>
  );
}
```

- [ ] **Step 3: Tulis dashboard kosong**

`app/(dashboard)/dashboard/page.tsx`. Teks keadaan kosong disalin persis dari `context/ui-context.md` bagian Empty and Error States.

```tsx
export default function DashboardPage() {
  return (
    <div className="rounded-xl border border-border bg-card p-8 text-center">
      <h1 className="text-base font-medium text-card-foreground">
        Belum ada group
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Buat group pertama untuk mulai menghimpun tautan dan berkas.
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Tulis halaman akses ditolak**

`app/akses-ditolak/page.tsx`. Halaman ini **di luar** grup `(dashboard)`, jadi tidak melewati gerbangnya — kalau di dalam, pengalihannya akan berputar tanpa henti.

```tsx
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default async function AksesDitolakPage() {
  const session = await auth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-center">
        <h1 className="text-base font-medium text-card-foreground">
          Akun ini bukan pemilik
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Dashboard Kumpulink hanya dapat dibuka oleh pemiliknya. Anda sedang
          masuk sebagai:
        </p>
        <p className="mt-3 font-mono text-sm text-card-foreground">
          {session?.user?.email ?? "tidak diketahui"}
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Bila Anda pemiliknya, keluar lalu masuk kembali dengan akun Google
          yang benar.
        </p>
        <form
          className="mt-6"
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <Button type="submit" className="w-full">
            Keluar
          </Button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Uji ketiga jalur di peramban sungguhan**

Jalankan `npm run dev`, lalu periksa satu per satu. Hasilnya **dibaca**, bukan diasumsikan.

| Langkah | Yang harus terjadi |
| ------- | ------------------ |
| Buka `http://localhost:3000/` tanpa masuk | Dialihkan ke Google |
| Masuk dengan `laluardiansyah903@gmail.com` | Mendarat di `/dashboard`, melihat "Belum ada group" |
| Tekan tombol tema | Seluruh halaman berganti mode; muat ulang tetap pada mode itu |
| Arahkan kursor ke tombol tema di **kedua** mode | Teksnya terbaca — ini pemeriksaan K8 |
| Keluar, lalu masuk dengan akun Google lain | Mendarat di `/akses-ditolak`, alamat emailnya sendiri tampil |
| Tekan Keluar di halaman itu | Kembali ke keadaan belum masuk |

- [ ] **Step 6: Uji bahwa perbaikan `OWNER_EMAIL` sembuh tanpa menyentuh database**

Ini yang membuktikan K1 benar-benar berlaku, bukan sekadar tertulis.

```bash
cp .env.local .env.local.bak
sed -i 's/^OWNER_EMAIL=.*$/OWNER_EMAIL=orang-lain@contoh.com/' .env.local
```

Jalankan ulang `npm run dev`, muat `/dashboard` **tanpa keluar-masuk**. Expected: mendarat di `/akses-ditolak`.

```bash
mv .env.local.bak .env.local
```

Jalankan ulang `npm run dev`, muat `/dashboard` lagi, masih tanpa keluar-masuk. Expected: dashboard terbuka. Bila masih ditolak, `resolveRole()` tidak dipanggil di callback `session` — kembali ke Task 7.

- [ ] **Step 7: Catat kedua rute di file konteks** *(perubahan konteks #6)*

Pada `context/architecture.md`, bagian `## System Boundaries`, sisipkan dua baris sebelum baris `app/(public)/`:

```markdown
- `app/page.tsx` — mengalihkan `/` ke `/dashboard`. Aplikasi ini tidak
  memiliki halaman depan publik; pengunjung selalu tiba lewat
  `/g/[slug]`, tidak pernah lewat akar.
- `app/akses-ditolak/` — halaman untuk sesi yang bukan pemilik. Berada di
  luar grup `(dashboard)` supaya tidak melewati gerbangnya sendiri, yang
  akan membuat pengalihannya berputar tanpa henti.
```

- [ ] **Step 8: Jalankan gerbang dan commit**

```bash
npm run typecheck && npm run lint && npm test && npm run build
git add -A
git commit -m "Dashboard kosong, gerbang pemilik, dan halaman akses ditolak

requireOwner() dipanggil di layout grup, bukan di tiap halaman, sehingga
rute baru di bawahnya terlindungi secara bawaan dan tidak dapat lupa
memeriksanya.

Halaman akses ditolak berada di luar grup (dashboard) supaya tidak
melewati gerbangnya sendiri; kalau di dalam, pengalihannya berputar.
Halaman itu menampilkan alamat email yang sedang masuk, karena itulah
satu-satunya layar yang menyebutkan penyebabnya ketika OWNER_EMAIL salah
ketik dan tidak ada antarmuka untuk memperbaikinya."
```

---

## Task 9: Penutupan unit

**Files:**
- Modify: `context/progress-tracker.md`, `docs/setup-layanan.md`

- [ ] **Step 1: Jalankan keempat gerbang dan tempelkan keluaran mentahnya**

Bukan ringkasannya — keluarannya.

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

- [ ] **Step 2: Buktikan tidak ada heksadesimal warna di komponen**

Global Constraints melarangnya, tetapi larangan tanpa pemeriksaan hanya
harapan. Satu-satunya tempat nilai heksadesimal boleh muncul adalah
`app/globals.css`.

```bash
grep -rnE '#[0-9a-fA-F]{3,8}' app components --include='*.tsx' --include='*.ts'
```

Expected: **tidak ada keluaran.** Bila ada di `components/ui/`, itu berkas
hasil generate shadcn — catat temuannya dan laporkan, jangan disunting.
Bila ada di berkas tulisan sendiri, ganti dengan token.

- [ ] **Step 3: Buktikan tidak ada rahasia yang bocor ke berkas terlacak**

```bash
git status --porcelain
git check-ignore -v .env.local
git ls-files | grep -c '^\.env\.local$'
```

Expected: perintah ketiga menjawab `0`.

- [ ] **Step 4: Tutup dua butir terakhir daftar periksa Fase 0**

Pada `docs/setup-layanan.md` bagian 10, centang kedua baris sambungan Neon — migrasi Task 5 sudah membuktikan keduanya. Ganti paragraf penjelas di bawahnya menjadi catatan bahwa keduanya terbukti lewat `prisma migrate dev` pada Unit 1.

- [ ] **Step 5: Perbarui `context/progress-tracker.md`**

- *Current Phase* → Unit 1 selesai, masuk Fase 2 (arah desain, impeccable)
- *Current Goal* → menjalankan `/impeccable init`, `shape`, dan mengunci arah
- *Completed* → tambahkan Unit 1 beserta sembilan keputusan K1–K9 secara ringkas
- *Next Up* → ganti dengan urutan Fase 2 dari `ROADMAP.md`
- *Architecture Decisions* → tambahkan K1, K6, K8, dan K9 sebagai keputusan yang mengubah file konteks

- [ ] **Step 6: Periksa tujuh butir "Before Moving to the Next Unit"**

Dari `context/ai-workflow-rules.md`. Untuk masing-masing, sebutkan bukti konkret — bukan pernyataan bahwa butirnya terpenuhi.

1. Unit berjalan ujung ke ujung sesuai lingkupnya
2. Tidak ada invarian di `architecture.md` yang dilanggar
3. Matriks `evaluateAccess()` — **tidak berlaku**, unit ini tidak menyentuh aturan izin
4. Antarmuka diperiksa di mode terang dan gelap
5. Halaman publik diperiksa di lebar ponsel — **tidak berlaku**, belum ada halaman publik
6. `progress-tracker.md` mencerminkan pekerjaan yang selesai
7. `npm run build` lulus

- [ ] **Step 7: Commit dan push**

```bash
git add -A
git commit -m "Tutup Unit 1: fondasi dan autentikasi

Keempat gerbang lulus. Tujuh perubahan file konteks selesai di dalam unit
ini, bukan ditunda.

Dua butir terakhir daftar periksa Fase 0 ikut tertutup: sambungan Neon
lewat DATABASE_URL dan DIRECT_URL terbukti saat migrasi pertama."
git push origin dev
```

---

## Verifikasi keseluruhan

Unit 1 selesai bila seluruh baris berikut **dijalankan dan hasilnya dibaca**:

- [ ] Pemilik masuk dengan Google → `/dashboard` terbuka
- [ ] Akun lain masuk → `/akses-ditolak`, alamat emailnya sendiri tampil, tombol keluar berfungsi
- [ ] Belum masuk membuka `/dashboard` → dialihkan ke Google, lalu kembali ke `/dashboard`
- [ ] `OWNER_EMAIL` diubah lalu server dijalankan ulang → peran ikut berubah tanpa menyentuh database dan tanpa keluar-masuk
- [ ] Satu variabel lingkungan dikosongkan → server menolak start, pesannya menyebut nama variabelnya
- [ ] `npx prisma db pull --print` menunjukkan delapan model dan sembilan enum
- [ ] Mode terang dan gelap keduanya benar; tombol `ghost` terbaca saat di-hover di **kedua** mode
- [ ] Muat ulang halaman tidak menimbulkan kedipan tema
- [ ] `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` keempatnya lulus
- [ ] `git ls-files` tidak memuat `.env.local`
- [ ] Tidak ada nilai heksadesimal di `app/` maupun `components/` di luar `globals.css` dan berkas generate shadcn
- [ ] Ketujuh perubahan file konteks selesai
