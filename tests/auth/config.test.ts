import { describe, expect, it, vi } from "vitest";

import type { Role } from "@/lib/auth/role";

const OWNER_ADDRESS = "pemilik@contoh.com";

// Alasan mengimpor lib/auth/config.ts butuh mock ini: berkas itu mengimpor
// lib/env.ts (yang memvalidasi variabel lingkungan dan melempar galat bila
// tidak ada) dan lib/db/client.ts (klien Prisma sungguhan), lewat rantai
// yang sama seperti tests/auth/session.test.ts sudah mem-mock @/lib/auth
// untuk alasan serupa.
vi.mock("@/lib/env", () => ({
  env: {
    OWNER_EMAIL: "pemilik@contoh.com",
    AUTH_GOOGLE_ID: "x",
    AUTH_GOOGLE_SECRET: "y",
  },
}));
vi.mock("@/lib/db/client", () => ({ prisma: {} }));
vi.mock("@auth/prisma-adapter", () => ({ PrismaAdapter: () => ({}) }));

const { authConfig } = await import("@/lib/auth/config");

// Tipe minimal yang benar-benar dipakai callback session di config.ts —
// bukan tipe union rumit dari next-auth. Callback sungguhan hanya
// menyentuh session.user.id, session.user.role, user.id, dan user.email.
type MinimalSessionCallback = (params: {
  session: { user: Record<string, unknown> };
  user: { id: string; email: string; role: Role };
}) => unknown;

// Di-cast ke tipe non-undefined secara langsung (bukan "as unknown as X |
// undefined") supaya narrowing dari pemeriksaan di bawah tidak perlu
// menembus batas closure resultingRole() — TypeScript tidak mempersempit
// variabel luar yang ditangkap fungsi bersarang. Pemeriksaan runtime-nya
// tetap ada sebagai jaring pengaman sungguhan, bukan sekadar type guard.
const sessionCallback = authConfig.callbacks
  ?.session as unknown as MinimalSessionCallback;

if (!sessionCallback) {
  throw new Error("authConfig.callbacks.session tidak terdefinisi");
}

async function resultingRole(user: {
  email: string;
  role: Role;
}): Promise<Role> {
  const result = (await sessionCallback({
    session: { user: {} },
    user: { id: "user-1", email: user.email, role: user.role },
  })) as { user: { role: Role } };
  return result.user.role;
}

describe("authConfig", () => {
  it("memakai strategi sesi database, bukan JWT", () => {
    expect(authConfig.session?.strategy).toBe("database");
  });

  it("callback session menghasilkan OWNER untuk alamat pemilik", async () => {
    expect(await resultingRole({ email: OWNER_ADDRESS, role: "VIEWER" })).toBe(
      "OWNER",
    );
  });

  it("callback session menghasilkan VIEWER untuk alamat lain", async () => {
    expect(
      await resultingRole({ email: "orang@contoh.com", role: "VIEWER" }),
    ).toBe("VIEWER");
  });

  // K1 — baris merah proyek ini. Bila implementasi diam-diam diganti
  // membaca user.role alih-alih menurunkan ulang dari kecocokan email,
  // kasus ini gagal: kolom database berkata OWNER padahal emailnya bukan
  // OWNER_EMAIL. Mengandalkan kolom itu berarti pemilik yang terlanjur
  // tercatat VIEWER terkunci permanen tanpa antarmuka perbaikan.
  it("tetap menghasilkan VIEWER ketika user.role bernilai OWNER tetapi emailnya tidak cocok dengan OWNER_EMAIL", async () => {
    expect(
      await resultingRole({ email: "orang@contoh.com", role: "OWNER" }),
    ).toBe("VIEWER");
  });
});
