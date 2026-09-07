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

/**
 * Tujuan sepulang dari layar masuk dashboard di `/masuk` — keputusan
 * U5-5. Satu-satunya nilai di luar `/g/` yang diizinkan, dan diizinkan
 * sebagai literal persis, bukan sebagai awalan: `/dashboard/requests`
 * kelak lahir di Unit 7 dan tidak boleh ikut lolos hanya karena namanya
 * berawalan sama.
 */
export const DASHBOARD_CALLBACK_URL = "/dashboard";

const SAFE_CALLBACK = /^\/g\/[^/]+(\/i\/[^/]+)?$/;

export function isSafeCallbackUrl(value: string): boolean {
  return value === DASHBOARD_CALLBACK_URL || SAFE_CALLBACK.test(value);
}
