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

function block(selector: string): string {
  const start = css.indexOf(selector + " {");
  if (start === -1) throw new Error(`blok ${selector} tidak ditemukan`);
  const open = css.indexOf("{", start);
  const close = css.indexOf("}", open);
  return css.slice(open, close);
}

describe("token warna", () => {
  it.each(ELEVEN_TOKENS)("mendefinisikan %s di mode terang", (token) => {
    expect(block(":root")).toContain(`${token}:`);
  });

  it.each(ELEVEN_TOKENS)("mendefinisikan %s di mode gelap", (token) => {
    expect(block(".dark")).toContain(`${token}:`);
  });

  it("tidak memakai --accent-foreground sebagai token Kumpulink", () => {
    expect(block(":root")).not.toContain("--accent-foreground: #");
    expect(block(".dark")).not.toContain("--accent-foreground:");
  });

  it("memetakan --primary-foreground ke --accent-on, bukan sebaliknya", () => {
    expect(css).toContain("--primary-foreground: var(--accent-on)");
  });

  it("memberi --accent-foreground arti shadcn, yaitu teks di atas permukaan redup", () => {
    expect(css).toContain("--accent-foreground: var(--text-primary)");
  });
});
