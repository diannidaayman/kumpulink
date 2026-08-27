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
