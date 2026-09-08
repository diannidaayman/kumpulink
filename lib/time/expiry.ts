/**
 * Konversi antara tanggal yang dipilih pemilik dan instan yang disimpan
 * `Group.expiresAt`. Keputusan U5-8.
 *
 * Aritmetika tetap UTC+9, bukan pustaka zona waktu: Asia/Jayapura tidak
 * pernah mengenal DST, sehingga offsetnya konstan sepanjang sejarahnya.
 * Menambah dependensi untuk satu penjumlahan konstanta tidak sebanding.
 */
export const WIT_UTC_OFFSET_MINUTES = 9 * 60;

const WIT_OFFSET_MS = WIT_UTC_OFFSET_MINUTES * 60_000;
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/**
 * Benar hanya bila tanggalnya BENAR-BENAR ADA. Pola saja tidak cukup:
 * "2026-02-31" lolos regex, dan Date akan menggesernya diam-diam menjadi
 * 3 Maret — pergeseran senyap adalah bentuk lain dari keadaan tidak pasti
 * yang meloloskan diri.
 */
export function isCalendarDate(value: string): boolean {
  const match = ISO_DATE_PATTERN.exec(value);
  if (match === null) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const rebuilt = new Date(Date.UTC(year, month - 1, day));

  return (
    rebuilt.getUTCFullYear() === year &&
    rebuilt.getUTCMonth() === month - 1 &&
    rebuilt.getUTCDate() === day
  );
}

/** "2026-09-30" -> instan 23:59:59.999 WIT pada tanggal itu. */
export function endOfDayWIT(isoDate: string): Date {
  const match = ISO_DATE_PATTERN.exec(isoDate);
  if (match === null || !isCalendarDate(isoDate)) {
    throw new Error(`Tanggal tidak dikenali: ${isoDate}`);
  }

  const asUtc = Date.UTC(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    23,
    59,
    59,
    999,
  );
  return new Date(asUtc - WIT_OFFSET_MS);
}

/** Instan -> tanggal yang terbaca di Jayapura, sebagai "YYYY-MM-DD". */
export function witDateParts(value: Date): string {
  const shifted = new Date(value.getTime() + WIT_OFFSET_MS);
  return `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}`;
}

/**
 * "YYYY-MM-DD" -> Date LOKAL untuk react-day-picker, yang bekerja dengan
 * tanggal lokal peramban. Tengah hari, bukan tengah malam: tengah malam
 * lokal berjarak nol dari batas hari, dan pergeseran offset sekecil apa
 * pun akan memindahkannya ke tanggal sebelahnya.
 */
export function toCalendarDate(isoDate: string): Date {
  const match = ISO_DATE_PATTERN.exec(isoDate);
  if (match === null) throw new Error(`Tanggal tidak dikenali: ${isoDate}`);
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12, 0, 0, 0);
}

/** Date lokal dari kalender -> "YYYY-MM-DD" apa adanya, tanpa geser zona. */
export function fromCalendarDate(value: Date): string {
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
}
