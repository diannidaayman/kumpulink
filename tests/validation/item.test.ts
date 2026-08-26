import { describe, expect, it } from "vitest";

import {
  itemAccessModeSchema,
  itemDescriptionSchema,
  itemMetadataFormSchema,
  itemTitleSchema,
  targetUrlSchema,
} from "@/lib/validation/item";

function accepts(value: string): string {
  const result = targetUrlSchema.safeParse(value);
  if (!result.success) throw new Error(`ditolak padahal seharusnya diterima: ${value}`);
  return result.data;
}

function rejects(value: string): boolean {
  return targetUrlSchema.safeParse(value).success === false;
}

describe("menolak skema URL yang dapat menjalankan kode", () => {
  it("menolak javascript:", () => {
    expect(rejects("javascript:alert(1)")).toBe(true);
  });

  it("menolak javascript: yang huruf besar-kecilnya diacak", () => {
    // Pengurai URL WHATWG menormalkan protocol sebelum dibandingkan.
    // Regex kalah persis di sini, dan itu alasan pengurai yang dipakai.
    expect(rejects("JaVaScRiPt:alert(1)")).toBe(true);
  });

  it("menolak javascript: yang disisipi baris baru", () => {
    expect(rejects("java\nscript:alert(1)")).toBe(true);
  });

  it("menolak javascript: yang disisipi tab", () => {
    expect(rejects("java\tscript:alert(1)")).toBe(true);
  });

  it("menolak data:", () => {
    expect(rejects("data:text/html,<script>alert(1)</script>")).toBe(true);
  });

  it("menolak mailto: dan skema lain di luar http dan https", () => {
    expect(rejects("mailto:orang@contoh.com")).toBe(true);
    expect(rejects("file:///etc/passwd")).toBe(true);
    expect(rejects("ftp://contoh.com/berkas")).toBe(true);
  });
});

describe("menerima dan menormalkan tautan http dan https", () => {
  it("menerima https apa adanya", () => {
    expect(accepts("https://contoh.com/rundown")).toBe("https://contoh.com/rundown");
  });

  it("menerima http", () => {
    expect(accepts("http://contoh.com/")).toBe("http://contoh.com/");
  });

  it("melengkapi https:// untuk host telanjang yang ditempel apa adanya", () => {
    expect(accepts("drive.google.com/abc")).toBe("https://drive.google.com/abc");
  });

  it("memangkas spasi di kedua ujung sebelum menguraikannya", () => {
    expect(accepts("  https://contoh.com/  ")).toBe("https://contoh.com/");
  });

  it("menyimpan satu bentuk kanonis, yaitu bentuk yang nanti masuk header Location", () => {
    expect(accepts("HTTPS://Contoh.COM/Rundown")).toBe("https://contoh.com/Rundown");
  });
});

describe("menolak tautan yang membawa kredensial atau terlalu panjang", () => {
  it("menolak kredensial tertanam", () => {
    expect(rejects("https://orang:rahasia@contoh.com/")).toBe(true);
  });

  it("menolak kredensial tertanam meski hanya nama pengguna", () => {
    expect(rejects("https://orang@contoh.com/")).toBe(true);
  });

  it("menolak tautan yang melewati 2048 karakter", () => {
    expect(rejects(`https://contoh.com/${"a".repeat(2100)}`)).toBe(true);
  });

  it("menolak tautan kosong", () => {
    expect(rejects("   ")).toBe(true);
  });

  it("menolak host bertitik dua yang tidak dapat diuraikan, alih-alih menebaknya", () => {
    expect(rejects("contoh.com:8080/x")).toBe(true);
  });

  it("menolak host telanjang yang MELEWATI batas hanya setelah dilengkapi https://", () => {
    // 2045 karakter mentah lolos gerbang pertama, lalu menjadi 2053
    // setelah dilengkapi. Yang mengikat adalah panjang bentuk kanonis,
    // karena itulah yang disimpan dan yang masuk header Location.
    const bareHost = `contoh.com/${"a".repeat(2034)}`;
    expect(bareHost).toHaveLength(2045);
    expect(rejects(bareHost)).toBe(true);
  });
});

describe("menerima titik dua yang bukan penanda skema", () => {
  it("menerima host telanjang yang memuat titik dua di query", () => {
    // Stempel waktu YouTube. Rumusan lama memakai includes(":") dan
    // menolak tautan ini, padahal ia sah dan lazim ditempel.
    expect(accepts("youtu.be/watch?v=abc&t=1:30")).toBe(
      "https://youtu.be/watch?v=abc&t=1:30",
    );
  });

  it("menerima host telanjang yang memuat titik dua di jalur", () => {
    expect(accepts("contoh.com/rapat/10:00")).toBe("https://contoh.com/rapat/10:00");
  });
});

describe("membatasi accessMode pada nilai yang fiturnya sudah ada", () => {
  it("menerima OPEN dan IDENTITY", () => {
    expect(itemAccessModeSchema.safeParse("OPEN").success).toBe(true);
    expect(itemAccessModeSchema.safeParse("IDENTITY").success).toBe(true);
  });

  it("menolak APPROVAL, karena fiturnya baru dibangun di Unit 7", () => {
    // Ditolak di BATAS SISTEM, bukan sekadar disembunyikan dari kontrol
    // pilihan. Fitur yang belum jadi tidak boleh berarti pintu terbuka.
    expect(itemAccessModeSchema.safeParse("APPROVAL").success).toBe(false);
  });

  it("menolak nilai yang tidak dikenali sama sekali", () => {
    expect(itemAccessModeSchema.safeParse("SEMBARANG").success).toBe(false);
  });
});

describe("membatasi judul dan deskripsi item", () => {
  it("menolak judul kosong", () => {
    expect(itemTitleSchema.safeParse("   ").success).toBe(false);
  });

  it("menerima judul 120 karakter dan menolak 121", () => {
    expect(itemTitleSchema.safeParse("a".repeat(120)).success).toBe(true);
    expect(itemTitleSchema.safeParse("a".repeat(121)).success).toBe(false);
  });

  it("mengubah deskripsi kosong menjadi null, bukan string kosong", () => {
    const result = itemDescriptionSchema.safeParse("   ");
    expect(result.success && result.data).toBeNull();
  });

  it("menolak deskripsi yang melewati 300 karakter", () => {
    expect(itemDescriptionSchema.safeParse("a".repeat(301)).success).toBe(false);
  });
});

describe("itemMetadataFormSchema — targetUrl opsional untuk edit item", () => {
  const base = {
    id: "item_1",
    title: "Judul",
    description: "",
    accessMode: "OPEN",
  };

  it("menerima targetUrl yang valid", () => {
    const result = itemMetadataFormSchema.safeParse({
      ...base,
      targetUrl: "https://contoh.com/rundown",
    });
    expect(result.success).toBe(true);
  });

  it("menolak targetUrl berskema javascript:", () => {
    const result = itemMetadataFormSchema.safeParse({
      ...base,
      targetUrl: "javascript:alert(1)",
    });
    expect(result.success).toBe(false);
  });

  it("valid tanpa targetUrl sama sekali — kasus item UPLOAD", () => {
    const result = itemMetadataFormSchema.safeParse(base);
    expect(result.success).toBe(true);
  });
});
