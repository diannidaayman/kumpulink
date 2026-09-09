import { describe, expect, it } from "vitest";
import {
  HISTORY_PAGE_SIZE,
  buildPagination,
  clampPage,
  pageCountFor,
} from "@/lib/history/pagination";

describe("ukuran halaman", () => {
  it("lima puluh baris, ditulis satu kali sebagai konstanta", () => {
    expect(HISTORY_PAGE_SIZE).toBe(50);
  });
});

describe("pageCountFor", () => {
  it("membulatkan ke atas untuk halaman terakhir yang tidak penuh", () => {
    expect(pageCountFor(214)).toBe(5);
    expect(pageCountFor(50)).toBe(1);
    expect(pageCountFor(51)).toBe(2);
  });

  it("tetap satu halaman ketika tidak ada baris sama sekali", () => {
    // Nol halaman akan membuat penjepitan menghasilkan halaman 0, dan
    // tidak ada halaman 0 yang dapat dirujuk.
    expect(pageCountFor(0)).toBe(1);
  });
});

describe("clampPage", () => {
  it("menjepit halaman di atas jangkauan ke halaman terakhir", () => {
    expect(clampPage(9, 214)).toBe(5);
  });

  it("menjepit halaman di bawah satu ke halaman pertama", () => {
    expect(clampPage(0, 214)).toBe(1);
    expect(clampPage(-3, 214)).toBe(1);
  });

  it("membiarkan halaman yang sah apa adanya", () => {
    expect(clampPage(3, 214)).toBe(3);
  });
});

describe("buildPagination", () => {
  it("menyusun untai hitungan seperti yang ditetapkan ui-context", () => {
    expect(buildPagination(1, 214).summary).toBe("1–50 dari 214");
  });

  it("menghitung batas halaman terakhir yang tidak penuh", () => {
    const last = buildPagination(5, 214);
    expect(last.skip).toBe(200);
    expect(last.summary).toBe("201–214 dari 214");
  });

  it("menghitung offset halaman tengah", () => {
    const middle = buildPagination(3, 214);
    expect(middle.skip).toBe(100);
    expect(middle.take).toBe(50);
    expect(middle.summary).toBe("101–150 dari 214");
  });

  it("menjepit halaman di luar jangkauan lalu memakai hasil jepitnya", () => {
    const clamped = buildPagination(9, 214);
    expect(clamped.page).toBe(5);
    expect(clamped.skip).toBe(200);
  });

  it("menyatakan keadaan kosong tanpa rentang palsu", () => {
    const empty = buildPagination(1, 0);
    expect(empty.page).toBe(1);
    expect(empty.pageCount).toBe(1);
    expect(empty.skip).toBe(0);
    expect(empty.summary).toBe("Tidak ada baris");
  });
});
