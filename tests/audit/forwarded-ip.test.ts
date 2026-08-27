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
