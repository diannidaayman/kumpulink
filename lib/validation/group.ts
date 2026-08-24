import { z } from "zod";

import { MIN_SLUG_LENGTH, SLUG_PATTERN } from "@/lib/groups/resolve-slug";
import { MAX_SLUG_LENGTH } from "@/lib/groups/slugify";

const MAX_TITLE_LENGTH = 120;

export const groupTitleSchema = z.string().trim().superRefine((value, ctx) => {
  if (value.length === 0) {
    ctx.addIssue({ code: "custom", message: "Judul tidak boleh kosong." });
    return;
  }
  if (value.length > MAX_TITLE_LENGTH) {
    ctx.addIssue({ code: "custom", message: "Judul maksimal 120 karakter." });
  }
});

/**
 * superRefine dipakai, bukan rantai .min()/.max()/.regex(), supaya tiap
 * keadaan punya SATU kalimat yang pasti dan urutan pelaporannya tidak
 * bergantung pada urutan internal Zod. Keenam kalimat ini disetujui
 * pemilik kata per kata dan tidak ditulis ulang saat eksekusi.
 */
export const groupSlugSchema = z.string().trim().superRefine((value, ctx) => {
  if (value.length === 0) {
    ctx.addIssue({ code: "custom", message: "Slug tidak boleh kosong. Isi dengan huruf atau angka." });
    return;
  }
  if (value.length < MIN_SLUG_LENGTH) {
    ctx.addIssue({ code: "custom", message: "Slug minimal 3 karakter." });
    return;
  }
  if (value.length > MAX_SLUG_LENGTH) {
    ctx.addIssue({ code: "custom", message: "Slug maksimal 60 karakter." });
    return;
  }
  if (!SLUG_PATTERN.test(value)) {
    ctx.addIssue({ code: "custom", message: "Slug hanya boleh memuat huruf kecil, angka, dan tanda hubung." });
  }
});

export const groupFormSchema = z.object({
  title: groupTitleSchema,
  slug: groupSlugSchema,
});

export type GroupFormInput = z.infer<typeof groupFormSchema>;

export const groupIdSchema = z.string().trim().superRefine((value, ctx) => {
  if (value.length === 0) {
    ctx.addIssue({ code: "custom", message: "Group tidak ditemukan." });
  }
});

export const moveDirectionSchema = z.enum(["up", "down"]);
