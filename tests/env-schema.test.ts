import { describe, expect, it } from "vitest";
import { buildEnvSchema } from "@/lib/env-schema";

// Sepuluh variabel yang wajib di mana pun. BLOB_READ_WRITE_TOKEN sengaja
// tidak ada di sini karena kewajibannya bersyarat — di atas Vercel ia
// memang tidak dipasang. Menyusunnya begini, bukan dengan membuang satu
// kunci dari objek lengkap, membuat kedua keadaan itu terbaca langsung.
const WITHOUT_TOKEN = {
  DATABASE_URL: "postgresql://u:p@host-pooler.example/db?sslmode=require",
  DIRECT_URL: "postgresql://u:p@host.example/db?sslmode=require",
  AUTH_SECRET: "a".repeat(43),
  AUTH_GOOGLE_ID: "123-abc.apps.googleusercontent.com",
  AUTH_GOOGLE_SECRET: "GOCSPX-rahasia",
  OWNER_EMAIL: "pemilik@contoh.com",
  BLOB_STORE_ID: "store_abc",
  RESEND_API_KEY: "re_kunci",
  EMAIL_FROM: "Kumpulink <no-reply@contoh.com>",
  CRON_SECRET: "b".repeat(43),
};

const COMPLETE = {
  ...WITHOUT_TOKEN,
  BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_token",
};

describe("skema variabel lingkungan", () => {
  it("menerima sebelas nilai yang lengkap dan sah", () => {
    const result = buildEnvSchema({ onVercel: false }).safeParse(COMPLETE);
    expect(result.success).toBe(true);
  });

  it("menolak dan menyebut nama variabel yang kosong", () => {
    const result = buildEnvSchema({ onVercel: false }).safeParse({
      ...COMPLETE,
      DATABASE_URL: "",
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues[0]?.path).toContain("DATABASE_URL");
  });

  it("menolak OWNER_EMAIL yang bukan alamat email", () => {
    const result = buildEnvSchema({ onVercel: false }).safeParse({
      ...COMPLETE,
      OWNER_EMAIL: "bukan-email",
    });
    expect(result.success).toBe(false);
  });

  it("menolak AUTH_SECRET yang terlalu pendek", () => {
    const result = buildEnvSchema({ onVercel: false }).safeParse({
      ...COMPLETE,
      AUTH_SECRET: "pendek",
    });
    expect(result.success).toBe(false);
  });

  // K3: di atas Vercel, BLOB_READ_WRITE_TOKEN sengaja tidak dipasang —
  // autentikasi Blob memakai OIDC. Mewajibkannya membuat aplikasi mati
  // saat start di produksi.
  it("membolehkan BLOB_READ_WRITE_TOKEN kosong ketika berjalan di Vercel", () => {
    const result = buildEnvSchema({ onVercel: true }).safeParse(WITHOUT_TOKEN);
    expect(result.success).toBe(true);
  });

  it("mewajibkan BLOB_READ_WRITE_TOKEN ketika berjalan di luar Vercel", () => {
    const result = buildEnvSchema({ onVercel: false }).safeParse(WITHOUT_TOKEN);
    expect(result.success).toBe(false);
  });
});
