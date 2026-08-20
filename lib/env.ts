import "server-only";
import { buildEnvSchema, type Env } from "@/lib/env-schema";

const BUILD_PHASE = "phase-production-build";

function read(): Env {
  // Build Next.js berjalan tanpa variabel lingkungan runtime dan tidak
  // melayani satu permintaan pun. Melemparkan galat di sini hanya
  // menggagalkan build tanpa menambah keamanan apa pun.
  if (process.env.NEXT_PHASE === BUILD_PHASE) {
    return process.env as unknown as Env;
  }

  const result = buildEnvSchema({
    onVercel: Boolean(process.env.VERCEL),
  }).safeParse(process.env);

  if (!result.success) {
    const details = result.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(
      `Variabel lingkungan tidak lengkap atau tidak sah:\n${details}\n\n` +
        `Periksa .env.local. Cara memperoleh tiap nilai ada di docs/setup-layanan.md.`,
    );
  }

  return result.data;
}

export const env: Env = read();
