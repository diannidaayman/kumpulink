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

const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  timeZone: DISPLAY_TIME_ZONE,
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/**
 * Cap waktu berjam untuk tabel riwayat. Aturan zonanya sama dengan
 * formatDateWIT: Asia/Jayapura yang dipatok, label WIT yang wajib.
 *
 * Ia dirender monospasi di antarmuka — bukan selera, melainkan karena
 * kolom ini dibandingkan baris demi baris, dan angka berlebar tetap
 * membuat jamnya berbaris lurus ke bawah.
 */
export function formatDateTimeWIT(value: Date): string {
  return `${dateTimeFormatter.format(value)} ${TIME_ZONE_LABEL}`;
}
