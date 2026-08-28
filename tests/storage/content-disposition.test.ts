import { describe, expect, it } from "vitest";

import { inlineContentDisposition } from "@/lib/storage/content-disposition";

describe("header Content-Disposition", () => {
  it("selalu inline, tidak pernah attachment", () => {
    expect(inlineContentDisposition("rundown.pdf")).toContain("inline");
    expect(inlineContentDisposition("rundown.pdf")).not.toContain("attachment");
  });

  it("menyertakan nama berkas ASCII apa adanya", () => {
    expect(inlineContentDisposition("rundown.pdf")).toBe(
      `inline; filename="rundown.pdf"; filename*=UTF-8''rundown.pdf`,
    );
  });

  it("menyandikan nama berkas non-ASCII di filename* dan menggantinya di filename", () => {
    const header = inlineContentDisposition("notulen–rapat.pdf");
    expect(header).toContain(`filename="notulen_rapat.pdf"`);
    expect(header).toContain(`filename*=UTF-8''notulen%E2%80%93rapat.pdf`);
  });

  it("menetralkan tanda kutip ganda yang akan memutus header", () => {
    const header = inlineContentDisposition(`ru"ndown.pdf`);
    expect(header).toContain(`filename="ru_ndown.pdf"`);
  });

  it("menetralkan karakter kendali yang akan menyisipkan header baru", () => {
    const header = inlineContentDisposition("rundown\r\nX-Injected: 1.pdf");
    expect(header).not.toContain("\r");
    expect(header).not.toContain("\n");
  });

  it("menyandikan karakter RFC 5987 ' ( ) * di filename*", () => {
    const header = inlineContentDisposition("rapat(1)'.pdf");
    expect(header).toContain("filename*=UTF-8''rapat%281%29%27.pdf");
  });

  it("mengembalikan inline saja bila nama berkas tidak ada atau kosong", () => {
    expect(inlineContentDisposition(null)).toBe("inline");
    expect(inlineContentDisposition("   ")).toBe("inline");
  });
});
