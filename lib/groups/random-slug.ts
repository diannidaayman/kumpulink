import { randomBytes } from "node:crypto";

export const RANDOM_SLUG_LENGTH = 12;

/**
 * Dua puluh empat huruf (tanpa i dan l) ditambah delapan angka (tanpa 0
 * dan 1). Karakter kembar rupa dibuang karena slug ini dibacakan lisan
 * dan disalin tangan dari layar proyektor.
 *
 * Panjangnya 32 secara sengaja: 256 habis dibagi 32, sehingga sisa
 * pembagian byte tidak membuat sebagian karakter lebih sering muncul.
 */
export const RANDOM_SLUG_ALPHABET = "abcdefghjkmnopqrstuvwxyz23456789";

export function randomSlug(): string {
  const bytes = randomBytes(RANDOM_SLUG_LENGTH);
  let slug = "";
  for (let i = 0; i < RANDOM_SLUG_LENGTH; i += 1) {
    slug += RANDOM_SLUG_ALPHABET[bytes[i] % RANDOM_SLUG_ALPHABET.length];
  }
  return slug;
}
