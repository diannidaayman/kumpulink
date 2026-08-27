import { z } from "zod";

/**
 * Parameter route adalah input eksternal, dan input eksternal divalidasi
 * di batas sistem sebelum menyentuh logika apa pun — termasuk sebelum
 * menyentuh Prisma. Panjangnya dibatasi supaya kueri tidak dipakai
 * sebagai saluran untuk mengirim muatan besar.
 */
export const gateParamsSchema = z.object({
  slug: z.string().min(1).max(200),
  itemId: z.string().min(1).max(200),
});
