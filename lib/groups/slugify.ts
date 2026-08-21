export const MAX_SLUG_LENGTH = 60;

const APOSTROPHES = /['’‘`´]/g;
const COMBINING_MARKS = /[̀-ͯ]/g;
const NON_SLUG_RUN = /[^a-z0-9]+/g;

/**
 * Membuang apostrof, meratakan diakritik ke ASCII, lalu mengecilkan huruf.
 *
 * Apostrof ditangani terpisah dan lebih dulu: bila ia ikut aturan umum,
 * "Qur'an" menjadi "qur-an" — terbaca sebagai dua kata padahal satu.
 */
function toAsciiLowercase(value: string): string {
  return value
    .replace(APOSTROPHES, "")
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .toLowerCase();
}

/**
 * Judul utuh menjadi slug. Deterministik: judul yang tidak menyisakan
 * satu pun huruf atau angka menghasilkan string kosong, dan keputusan
 * atas string kosong itu milik resolveSlug(), bukan fungsi ini.
 */
export function slugify(title: string): string {
  const hyphenated = toAsciiLowercase(title)
    .replace(NON_SLUG_RUN, "-")
    .replace(/-{2,}/g, "-");
  const trimmed = hyphenated.replace(/^-+|-+$/g, "");

  if (trimmed.length <= MAX_SLUG_LENGTH) return trimmed;

  const window = trimmed.slice(0, MAX_SLUG_LENGTH + 1);
  const lastHyphen = window.lastIndexOf("-");
  const cut = lastHyphen > 0 ? window.slice(0, lastHyphen) : trimmed.slice(0, MAX_SLUG_LENGTH);
  return cut.replace(/-+$/, "");
}

/**
 * Ketikan tangan yang belum selesai, dinormalkan setiap ketukan huruf
 * supaya yang terlihat di kolom selalu sama dengan yang akan tersimpan.
 *
 * Berbeda dari slugify() dalam satu hal yang menentukan: tanda hubung di
 * UJUNG dipertahankan. Memangkasnya membuat pemilik tidak pernah bisa
 * mengetik kata kedua.
 */
export function normalizeSlugInput(value: string): string {
  return toAsciiLowercase(value)
    .replace(NON_SLUG_RUN, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+/, "")
    .slice(0, MAX_SLUG_LENGTH);
}
