import { describe, it, expect } from "vitest";
import { buildBlobPath, groupBlobPrefix } from "@/lib/storage/blob-path";
import type { AcceptedMimeType } from "@/lib/storage/detect-file-type";

describe("buildBlobPath() dan groupBlobPrefix()", () => {
  it("membuat jalur dengan struktur groups/{groupId}/{random}.{ext}", () => {
    const path = buildBlobPath("grp_abc123", "image/png");
    expect(path).toMatch(/^groups\/grp_abc123\/[A-Za-z0-9_-]+\.png$/);
  });

  it("menambahkan garis miring di belakang pada awalan grup", () => {
    const prefix = groupBlobPrefix("grp_test");
    expect(prefix).toBe("groups/grp_test/");
  });

  it("menghasilkan segmen acak yang berbeda setiap pemanggilan", () => {
    const path1 = buildBlobPath("grp_test", "image/png");
    const path2 = buildBlobPath("grp_test", "image/png");
    expect(path1).not.toBe(path2);
  });

  it("menggunakan ekstensi yang benar untuk setiap tipe MIME", () => {
    const testCases: Array<[AcceptedMimeType, string]> = [
      ["application/pdf", "pdf"],
      ["image/png", "png"],
      ["image/jpeg", "jpg"],
      ["image/webp", "webp"],
    ];

    testCases.forEach(([mimeType, expectedExt]) => {
      const path = buildBlobPath("grp_test", mimeType);
      expect(path).toMatch(new RegExp(`\\.${expectedExt}$`));
    });
  });

  it("membangun jalur di atas awalan prefix sehingga keduanya tetap sejalan", () => {
    const groupId = "grp_test";
    const path = buildBlobPath(groupId, "image/png");
    const prefix = groupBlobPrefix(groupId);

    // Jalur harus dimulai dengan awalan
    expect(path.startsWith(prefix)).toBe(true);
  });

  it("menghasilkan segmen acak yang tidak dapat ditebak (192 bit entropi)", () => {
    const paths = new Set<string>();

    // Buat 500 jalur dengan grup dan tipe MIME yang sama
    for (let i = 0; i < 500; i++) {
      const path = buildBlobPath("grp_entropy_test", "image/png");
      paths.add(path);
    }

    // Semua jalur harus unik (mustahil ada duplikat dengan entropi 192 bit)
    expect(paths.size).toBe(500);
  });

  it("menghasilkan segmen acak sepanjang 32 karakter base64url", () => {
    // Mengikat entropinya: 24 byte menjadi tepat 32 karakter base64url.
    // Tanpa pengikat ini, RANDOM_BYTES dapat diturunkan diam-diam tanpa
    // satu pun pengujian gagal.
    const segment = buildBlobPath("grp_abc", "image/png").split("/")[2];
    const [random] = segment.split(".");

    expect(random).toHaveLength(32);
    expect(random).toMatch(/^[A-Za-z0-9_-]+$/);
  });
});
