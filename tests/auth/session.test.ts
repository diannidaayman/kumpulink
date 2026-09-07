import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "next-auth";

import type { Role } from "@/lib/auth/role";

const auth = vi.fn();

vi.mock("@/lib/auth", () => ({ auth }));

// redirect() sungguhan melempar galat dan tidak pernah kembali. Mock yang
// hanya mengembalikan undefined akan membuat kode lanjut mengeksekusi baris
// di bawahnya — perilaku yang tidak pernah terjadi di produksi, dan test
// yang menguji fiksi. Karena itu mock ini ikut melempar.
vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    throw new Error(`REDIRECT:${path}`);
  },
}));

const { requireOwner, SIGN_IN_PATH, ACCESS_DENIED_PATH } = await import(
  "@/lib/auth/session"
);

const SESSION_EXPIRES = "2999-01-01T00:00:00.000Z";
// Layar masuk kita sendiri, bukan halaman bawaan Auth.js — keputusan
// U5-5. Pengujian ini yang menahan tempat itu: mengembalikannya ke
// /api/auth/signin akan membuat halaman berbahasa Inggris tanpa merek
// menjadi wajah akar domain lagi.
const SIGNIN_REDIRECT = `REDIRECT:${SIGN_IN_PATH}`;
const ACCESS_DENIED_REDIRECT = `REDIRECT:${ACCESS_DENIED_PATH}`;

function buildSession(role: string | undefined): Session {
  return {
    user: { id: "user-1", role: role as Role },
    expires: SESSION_EXPIRES,
  } as unknown as Session;
}

describe("requireOwner", () => {
  beforeEach(() => {
    auth.mockReset();
  });

  it("mengalihkan ke layar masuk kita sendiri ketika tidak ada sesi", async () => {
    auth.mockResolvedValue(null);

    await expect(requireOwner()).rejects.toThrow(SIGNIN_REDIRECT);
  });

  it("tetap mengalihkan ke layar masuk ketika sesi ada tetapi user tidak ada", async () => {
    auth.mockResolvedValue({ expires: SESSION_EXPIRES } as unknown as Session);

    await expect(requireOwner()).rejects.toThrow(SIGNIN_REDIRECT);
  });

  it("mengalihkan ke /akses-ditolak untuk sesi berperan VIEWER", async () => {
    auth.mockResolvedValue(buildSession("VIEWER"));

    await expect(requireOwner()).rejects.toThrow(ACCESS_DENIED_REDIRECT);
  });

  it("mengembalikan sesi apa adanya tanpa pengalihan untuk sesi berperan OWNER", async () => {
    const session = buildSession("OWNER");
    auth.mockResolvedValue(session);

    await expect(requireOwner()).resolves.toBe(session);
  });

  // Baris merah: keadaan yang tidak pasti selalu berarti menolak. Peran
  // yang tidak dikenal wajib dialihkan ke /akses-ditolak, bukan lolos ke
  // cabang terakhir seperti seharusnya OWNER.
  it.each([
    ["string tak dikenal (ADMIN)", "ADMIN"],
    ["undefined", undefined],
  ])(
    "menolak, bukan meloloskan, sesi dengan peran %s",
    async (_label, role) => {
      auth.mockResolvedValue(buildSession(role));

      await expect(requireOwner()).rejects.toThrow(ACCESS_DENIED_REDIRECT);
    },
  );
});
