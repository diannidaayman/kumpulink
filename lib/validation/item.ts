import { z } from "zod";

export const MAX_ITEM_TITLE_LENGTH = 120;
export const MAX_ITEM_DESCRIPTION_LENGTH = 300;
export const MAX_TARGET_URL_LENGTH = 2048;

export const itemTitleSchema = z.string().trim().superRefine((value, ctx) => {
  if (value.length === 0) {
    ctx.addIssue({ code: "custom", message: "Judul item tidak boleh kosong." });
    return;
  }
  if (value.length > MAX_ITEM_TITLE_LENGTH) {
    ctx.addIssue({ code: "custom", message: "Judul item maksimal 120 karakter." });
  }
});

export const itemDescriptionSchema = z
  .string()
  .trim()
  .max(MAX_ITEM_DESCRIPTION_LENGTH, "Deskripsi maksimal 300 karakter.")
  // Kolom kosong dikirim formulir sebagai string kosong, sedangkan kolom
  // basis datanya nullable. Dinormalkan di sini supaya tidak ada dua cara
  // menyatakan "tidak ada deskripsi" yang tersimpan berdampingan.
  .transform((value) => (value.length === 0 ? null : value));

/**
 * Menandai masukan yang SUDAH membawa skema, sehingga ia tidak dilengkapi
 * https:// di depan.
 *
 * Diuji di AWAL string, bukan titik dua di mana saja. Rumusan sebelumnya
 * memakai value.includes(":") dan ikut menolak tautan sah yang memuat
 * titik dua di jalur atau query — stempel waktu YouTube seperti
 * youtu.be/watch?v=x&t=1:30 salah satunya. Itu persis cacat yang hendak
 * dihindari oleh pelengkapan https:// ini.
 *
 * Titik dua sesudah rangkaian karakter skema yang sah tetap dianggap
 * skema, sehingga contoh.com:8080/x TETAP ditolak alih-alih ditebak —
 * pertukaran yang sudah diputuskan pemilik.
 */
const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:/i;

/**
 * Menguraikan tautan dengan pengurai URL WHATWG lalu MENDAFTARPUTIHKAN
 * protocol-nya. Bukan regex dan bukan startsWith: pengurai itulah yang
 * menormalkan JaVaScRiPt:, tab tersisip, dan baris baru tersisip menjadi
 * satu bentuk sebelum dibandingkan — dan justru varian itulah yang
 * mengalahkan regex.
 */

function parseTargetUrl(value: string): string | null {
  const candidate = HAS_SCHEME.test(value) ? value : `https://${value}`;

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return null;

  // Kredensial tertanam menyamarkan host yang sebenarnya di mata
  // pembaca, dan ikut tersalin ke mana pun tautan itu diteruskan.
  if (url.username !== "" || url.password !== "") return null;

  return url.toString();
}

export const targetUrlSchema = z
  .string()
  .trim()
  .superRefine((value, ctx) => {
    if (value.length === 0) {
      ctx.addIssue({ code: "custom", message: "Tautan tidak boleh kosong." });
      return;
    }
    if (value.length > MAX_TARGET_URL_LENGTH) {
      ctx.addIssue({ code: "custom", message: "Tautan maksimal 2048 karakter." });
      return;
    }

    const normalized = parseTargetUrl(value);
    if (normalized === null) {
      ctx.addIssue({
        code: "custom",
        message: "Tautan harus diawali http:// atau https://.",
      });
      return;
    }

    // Diperiksa ULANG setelah normalisasi. Pemeriksaan di atas berjalan
    // atas masukan mentah, sedangkan pelengkapan https:// menambah
    // delapan karakter — sehingga host telanjang sepanjang 2044 sampai
    // 2048 karakter akan lolos gerbang pertama lalu melewati batas.
    // Yang mengikat adalah panjang bentuk kanonis, karena itulah yang
    // disimpan dan yang nanti masuk header Location.
    if (normalized.length > MAX_TARGET_URL_LENGTH) {
      ctx.addIssue({ code: "custom", message: "Tautan maksimal 2048 karakter." });
    }
  })
  // Diurai dua kali secara sengaja: refinement Zod tidak dapat
  // menyerahkan nilai ke transform, dan menyimpan hasil di variabel luar
  // membuat skema ini tidak aman dipakai bersamaan. Biayanya satu
  // penguraian URL per pengiriman formulir.
  .transform((value) => parseTargetUrl(value) as string);

/**
 * APPROVAL SENGAJA TIDAK ADA di sini. Fiturnya baru dibangun di Unit 7,
 * dan fitur yang belum jadi tidak boleh berarti pintu yang terbuka.
 * Ditolak di batas sistem, bukan sekadar disembunyikan dari antarmuka —
 * menyembunyikan tombol tidak dihitung sebagai kontrol akses.
 *
 * Saat Unit 7 membukanya, tambahkan "APPROVAL" di sini DAN tambahkan
 * kasus ujinya di tests/validation/item.test.ts dalam perubahan yang sama.
 */
export const itemAccessModeSchema = z.enum(["OPEN", "IDENTITY"]);

/** Hanya untuk sumber EXTERNAL. UPLOAD menurunkan tipenya dari isi berkas. */
export const externalItemTypeSchema = z.enum(["LINK", "PDF", "IMAGE"]);

export const itemIdSchema = z.string().trim().superRefine((value, ctx) => {
  if (value.length === 0) {
    ctx.addIssue({ code: "custom", message: "Item tidak ditemukan." });
  }
});

export const itemActiveSchema = z.enum(["true", "false"]).transform((value) => value === "true");

export const externalItemFormSchema = z.object({
  title: itemTitleSchema,
  description: itemDescriptionSchema,
  targetUrl: targetUrlSchema,
  type: externalItemTypeSchema,
  accessMode: itemAccessModeSchema,
});

export const uploadItemFieldsSchema = z.object({
  title: itemTitleSchema,
  description: itemDescriptionSchema,
  accessMode: itemAccessModeSchema,
});

/**
 * `targetUrl` opsional: hanya item `EXTERNAL` boleh mengubahnya, dan
 * `formData.get()` mengembalikan `null` untuk medan yang tidak ada —
 * pemanggil wajib memetakan `null` ke `undefined` sebelum sampai di
 * sini, karena Zod 4 memperlakukan `undefined` sebagai "absen" tetapi
 * `null` tetap diuji terhadap skema dan gagal.
 */
export const itemMetadataFormSchema = z.object({
  id: itemIdSchema,
  title: itemTitleSchema,
  description: itemDescriptionSchema,
  accessMode: itemAccessModeSchema,
  targetUrl: targetUrlSchema.optional(),
});

export const reorderItemsSchema = z.object({
  groupId: itemIdSchema,
  orderedIds: z.array(itemIdSchema).min(1),
});

export type ExternalItemInput = z.infer<typeof externalItemFormSchema>;
export type UploadItemFields = z.infer<typeof uploadItemFieldsSchema>;
