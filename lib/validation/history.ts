import { z } from "zod";

import { isCalendarDate } from "@/lib/time/expiry";

/** Nilai penyaring item untuk baris yang itemnya sudah dihapus. U6-8. */
export const DELETED_ITEM_VALUE = "dihapus";

/**
 * Pengenal item dipakai sebagai pembanding kesamaan lewat Prisma, jadi
 * tidak ada risiko injeksi. Pola ini menyaring bentuk yang jelas bukan
 * pengenal supaya kueri tidak dijalankan untuk untai sampah.
 */
const itemIdSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[A-Za-z0-9_-]+$/);

export const historyItemSchema = z.union([z.literal(DELETED_ITEM_VALUE), itemIdSchema]);

/**
 * Pola saja tidak cukup: "2026-02-31" lolos regex, dan Date akan
 * menggesernya diam-diam menjadi 3 Maret. isCalendarDate menolak tanggal
 * yang tidak benar-benar ada.
 */
export const historyDateSchema = z.string().refine(isCalendarDate);

export const historyDeniedSchema = z.literal("1");

export const historyPageSchema = z
  .string()
  .regex(/^\d+$/)
  .transform(Number)
  .refine((value) => Number.isSafeInteger(value) && value >= 1);
