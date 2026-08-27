import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("lib/db/public-group.ts", "utf8");

const FORBIDDEN = ["targetUrl", "fileKey"];

describe("batas kolom kueri halaman publik", () => {
  it.each(FORBIDDEN)("tidak pernah membaca kolom %s", (column) => {
    expect(source).not.toContain(column);
  });
});
