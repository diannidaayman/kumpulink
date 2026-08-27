/**
 * Tujuan sepulang dari Google DISUSUN DI SERVER dari parameter route,
 * tidak pernah dibaca dari query string — keputusan U4-9. Tidak ada
 * layar masuk yang menerima tujuan sebagai masukan pengunjung.
 *
 * Pengalihan terbuka karena itu tidak mungkin terjadi, bukan karena
 * divalidasi dengan benar melainkan karena tidak ada tempat masuknya.
 * isSafeCallbackUrl() adalah lapis kedua: server action memeriksanya
 * lagi sebelum menyerahkannya ke Auth.js, supaya sebuah jalur baru yang
 * kelak lalai tetap tertahan.
 */
export function groupCallbackUrl(slug: string): string {
  return `/g/${encodeURIComponent(slug)}`;
}

export function itemGateCallbackUrl(slug: string, itemId: string): string {
  return `/g/${encodeURIComponent(slug)}/i/${encodeURIComponent(itemId)}`;
}

const SAFE_CALLBACK = /^\/g\/[^/]+(\/i\/[^/]+)?$/;

export function isSafeCallbackUrl(value: string): boolean {
  return SAFE_CALLBACK.test(value);
}
