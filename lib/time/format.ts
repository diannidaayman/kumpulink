export const DISPLAY_TIME_ZONE = "Asia/Jayapura";
export const TIME_ZONE_LABEL = "WIT";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  timeZone: DISPLAY_TIME_ZONE,
  day: "numeric",
  month: "short",
  year: "numeric",
});

/**
 * Menampilkan tanggal dalam zona waktu TETAP Asia/Jayapura, tidak
 * mengikuti perangkat pembaca, dan selalu menyertakan labelnya.
 *
 * Label itu wajib, bukan hiasan: waktu di aplikasi ini dipakai untuk
 * mempertanggungjawabkan kejadian, dan dua orang yang membahas baris
 * yang sama harus membaca angka yang sama.
 */
export function formatDateWIT(value: Date): string {
  return `${dateFormatter.format(value)} ${TIME_ZONE_LABEL}`;
}
