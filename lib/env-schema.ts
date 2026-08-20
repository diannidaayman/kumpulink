import { z } from "zod";

const required = (name: string) =>
  z.string().min(1, `${name} wajib diisi dan tidak boleh kosong`);

export function buildEnvSchema(options: { onVercel: boolean }) {
  return z.object({
    DATABASE_URL: required("DATABASE_URL"),
    DIRECT_URL: required("DIRECT_URL"),
    AUTH_SECRET: z
      .string()
      .min(32, "AUTH_SECRET harus minimal 32 karakter"),
    AUTH_GOOGLE_ID: required("AUTH_GOOGLE_ID"),
    AUTH_GOOGLE_SECRET: required("AUTH_GOOGLE_SECRET"),
    OWNER_EMAIL: z
      .string()
      .email("OWNER_EMAIL harus berupa alamat email yang sah"),
    BLOB_READ_WRITE_TOKEN: options.onVercel
      ? z.string().optional()
      : required("BLOB_READ_WRITE_TOKEN"),
    BLOB_STORE_ID: required("BLOB_STORE_ID"),
    RESEND_API_KEY: required("RESEND_API_KEY"),
    EMAIL_FROM: required("EMAIL_FROM"),
    CRON_SECRET: z
      .string()
      .min(32, "CRON_SECRET harus minimal 32 karakter"),
  });
}

export type Env = z.infer<ReturnType<typeof buildEnvSchema>>;
