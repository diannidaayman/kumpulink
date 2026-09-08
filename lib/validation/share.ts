import { z } from "zod";

import { isCalendarDate } from "@/lib/time/expiry";

export const visibilitySchema = z.enum(["PRIVATE", "REQUIRE_LOGIN", "PUBLIC"]);

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Kosong BERARTI tanpa batas waktu, dan itu keadaan yang sah — bukan
 * kelalaian mengisi. Yang ditolak hanyalah tanggal yang tidak dapat
 * dibaca atau tidak ada di kalender.
 *
 * superRefine dipakai, bukan rantai .regex(), supaya tiap keadaan punya
 * SATU kalimat yang pasti dan urutan pelaporannya tidak bergantung pada
 * urutan internal Zod. Pola yang sama dengan lib/validation/group.ts.
 */
export const expiresOnSchema = z.string().trim().superRefine((value, ctx) => {
  if (value.length === 0) return;
  if (!ISO_DATE_PATTERN.test(value)) {
    ctx.addIssue({ code: "custom", message: "Tanggal kedaluwarsa tidak dikenali." });
    return;
  }
  if (!isCalendarDate(value)) {
    ctx.addIssue({ code: "custom", message: "Tanggal kedaluwarsa tidak ada di kalender." });
  }
});

export const shareSettingsSchema = z.object({
  visibility: visibilitySchema,
  expiresOn: expiresOnSchema,
});

export type ShareSettingsInput = z.infer<typeof shareSettingsSchema>;

/**
 * Dua nilai eksplisit, bukan "selain 'true' berarti false". Nilai yang
 * tidak dikenali membatalkan penulisan — mematikan link orang karena
 * salah baca satu string adalah kegagalan yang tidak terlihat sampai
 * seseorang mengeluh linknya mati.
 */
export const shareEnabledSchema = z
  .enum(["true", "false"])
  .transform((value) => value === "true");
