import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync("app/globals.css", "utf8");

const ELEVEN_TOKENS = [
  "--bg-base",
  "--bg-surface",
  "--bg-elevated",
  "--text-primary",
  "--text-muted",
  "--accent-primary",
  "--accent-on",
  "--border-default",
  "--state-error",
  "--state-success",
  "--state-warning",
];

function blok(selector: string): string {
  const mulai = css.indexOf(selector + " {");
  if (mulai === -1) throw new Error(`blok ${selector} tidak ditemukan`);
  const buka = css.indexOf("{", mulai);
  const tutup = css.indexOf("}", buka);
  return css.slice(buka, tutup);
}

describe("token warna", () => {
  it.each(ELEVEN_TOKENS)("mendefinisikan %s di mode terang", (token) => {
    expect(blok(":root")).toContain(`${token}:`);
  });

  it.each(ELEVEN_TOKENS)("mendefinisikan %s di mode gelap", (token) => {
    expect(blok(".dark")).toContain(`${token}:`);
  });

  it("tidak memakai --accent-foreground sebagai token Kumpulink", () => {
    expect(blok(":root")).not.toContain("--accent-foreground: #");
    expect(blok(".dark")).not.toContain("--accent-foreground:");
  });

  it("memetakan --primary-foreground ke --accent-on, bukan sebaliknya", () => {
    expect(css).toContain("--primary-foreground: var(--accent-on)");
  });

  it("memberi --accent-foreground arti shadcn, yaitu teks di atas permukaan redup", () => {
    expect(css).toContain("--accent-foreground: var(--text-primary)");
  });
});
