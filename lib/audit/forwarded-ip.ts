/**
 * Hop PERTAMA, bukan yang terakhir: proksi menambahkan dirinya di ujung
 * kanan, sehingga alamat pengunjung ada di ujung kiri. Di atas Vercel
 * header ini dipasang proksi dan tidak dapat dipalsukan klien.
 *
 * Murni dan berdiri sendiri di luar request-context.ts supaya dapat
 * diuji tanpa memuat `next/headers`.
 */
export function firstForwardedIp(headerValue: string | null): string | null {
  if (headerValue === null) return null;
  const first = headerValue.split(",")[0]?.trim() ?? "";
  return first === "" ? null : first;
}
