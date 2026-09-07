import { describe, expect, it } from "vitest";

import {
  DASHBOARD_CALLBACK_URL,
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

  // Ditambahkan 7 September 2026, keputusan U5-5. /dashboard adalah
  // tujuan sah bagi layar masuk di /masuk, dan ia diizinkan sebagai
  // LITERAL PERSIS — bukan sebagai awalan. "/dashboard/apa-pun" tetap
  // ditolak, sehingga daftar putih ini tidak melebar diam-diam.
  it("menerima /dashboard sebagai literal persis", () => {
    expect(isSafeCallbackUrl(DASHBOARD_CALLBACK_URL)).toBe(true);
    expect(isSafeCallbackUrl("/dashboard")).toBe(true);
  });

  it("menolak tujuan di luar /g/ dan di luar /dashboard persis", () => {
    expect(isSafeCallbackUrl("/dashboard/requests")).toBe(false);
    expect(isSafeCallbackUrl("/dashboardx")).toBe(false);
    expect(isSafeCallbackUrl("/g/rapat-kerja/i/clx123/berkas")).toBe(false);
  });
});
