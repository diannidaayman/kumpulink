import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join("app", "(public)");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const files = walk(ROOT).map((file) => file.split("\\").join("/"));
const routable = files.filter(
  (file) => file.endsWith("/page.tsx") || file.endsWith("/route.ts"),
);

/**
 * RISIKO cache Fase 5 sebagai pengujian merah, bukan kewaspadaan. Satu
 * revalidate atau satu generateStaticParams yang lolos berarti satu
 * pengunjung menerima halaman yang dibuat untuk sesi orang lain.
 */
describe("render dinamis di seluruh app/(public)", () => {
  it("menemukan setidaknya satu halaman atau route untuk diperiksa", () => {
    expect(routable.length).toBeGreaterThan(0);
  });

  it.each(routable)("%s dirender dinamis", (file) => {
    expect(readFileSync(file, "utf8")).toContain(`export const dynamic = "force-dynamic"`);
  });

  it.each(files)("%s tidak memakai cache statis", (file) => {
    const source = readFileSync(file, "utf8");
    expect(source).not.toContain("generateStaticParams");
    expect(source).not.toContain("export const revalidate");
  });
});
