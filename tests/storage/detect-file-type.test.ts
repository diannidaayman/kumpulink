import { describe, expect, it } from "vitest";

import {
  detectFileType,
  extensionFor,
  itemTypeFor,
} from "@/lib/storage/detect-file-type";

/** Menyusun byte awal berkas lalu memberinya isi acak sebagai ekor. */
function withSignature(...signature: number[]): Uint8Array {
  const bytes = new Uint8Array(64);
  bytes.set(signature, 0);
  return bytes;
}

const PDF = withSignature(0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37);
const PNG = withSignature(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
const JPEG = withSignature(0xff, 0xd8, 0xff, 0xe0);

function webp(): Uint8Array {
  const bytes = new Uint8Array(64);
  bytes.set([0x52, 0x49, 0x46, 0x46], 0);
  bytes.set([0x24, 0x00, 0x00, 0x00], 4);
  bytes.set([0x57, 0x45, 0x42, 0x50], 8);
  return bytes;
}

describe("mengenali keempat tipe yang diterima dari isi berkasnya", () => {
  it("mengenali PDF dari penanda %PDF-", () => {
    expect(detectFileType(PDF)).toBe("application/pdf");
  });

  it("mengenali PNG dari delapan byte penandanya", () => {
    expect(detectFileType(PNG)).toBe("image/png");
  });

  it("mengenali JPEG dari tiga byte penandanya", () => {
    expect(detectFileType(JPEG)).toBe("image/jpeg");
  });

  it("mengenali WebP dari RIFF di awal dan WEBP di offset delapan", () => {
    expect(detectFileType(webp())).toBe("image/webp");
  });
});

describe("menolak apa pun yang tidak dikenali", () => {
  it("menolak berkas kosong", () => {
    expect(detectFileType(new Uint8Array(0))).toBeNull();
  });

  it("menolak berkas yang lebih pendek daripada penandanya sendiri", () => {
    expect(detectFileType(new Uint8Array([0x25, 0x50]))).toBeNull();
  });

  it("menolak berkas EXE meski namanya berakhiran .pdf", () => {
    // Nama berkas tidak pernah sampai ke fungsi ini, dan itulah intinya.
    expect(detectFileType(withSignature(0x4d, 0x5a, 0x90, 0x00))).toBeNull();
  });

  it("menolak SVG, karena ia dapat menjalankan skrip dan tidak ada di daftar putih", () => {
    expect(detectFileType(withSignature(0x3c, 0x73, 0x76, 0x67))).toBeNull();
  });

  it("menolak RIFF yang bukan WebP, misalnya WAV", () => {
    const wav = new Uint8Array(64);
    wav.set([0x52, 0x49, 0x46, 0x46], 0);
    wav.set([0x57, 0x41, 0x56, 0x45], 8);
    expect(detectFileType(wav)).toBeNull();
  });

  it("menolak PDF yang penandanya tidak berada tepat di awal berkas", () => {
    // Sebagian pembaca PDF memaafkan sampah di depan penanda. Daftar
    // putih tidak memaafkannya: keadaan yang tidak pasti berarti menolak.
    const padded = new Uint8Array(64);
    padded.set([0x25, 0x50, 0x44, 0x46, 0x2d], 4);
    expect(detectFileType(padded)).toBeNull();
  });
});

describe("menurunkan ekstensi dan tipe item dari mime terdeteksi", () => {
  it("memberi ekstensi yang sesuai untuk keempat mime", () => {
    expect(extensionFor("application/pdf")).toBe("pdf");
    expect(extensionFor("image/png")).toBe("png");
    expect(extensionFor("image/jpeg")).toBe("jpg");
    expect(extensionFor("image/webp")).toBe("webp");
  });

  it("memetakan PDF ke tipe PDF dan ketiga gambar ke tipe IMAGE", () => {
    expect(itemTypeFor("application/pdf")).toBe("PDF");
    expect(itemTypeFor("image/png")).toBe("IMAGE");
    expect(itemTypeFor("image/jpeg")).toBe("IMAGE");
    expect(itemTypeFor("image/webp")).toBe("IMAGE");
  });

  it("tidak pernah memetakan unggahan ke tipe LINK", () => {
    // LINK selalu EXTERNAL. Tidak ada berkas yang boleh menghasilkannya.
    const everyMime = ["application/pdf", "image/png", "image/jpeg", "image/webp"] as const;
    expect(everyMime.map(itemTypeFor)).not.toContain("LINK");
  });
});
