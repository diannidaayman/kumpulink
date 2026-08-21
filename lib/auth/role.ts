export type Role = "OWNER" | "VIEWER";

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Menentukan peran dari alamat email, tanpa menyentuh database maupun
 * sesi. Ini satu-satunya tempat aturan peran ditulis.
 *
 * Perbandingannya dinormalkan lebih dulu (K9): OWNER_EMAIL diketik tangan
 * sedangkan alamatnya datang dari Google, sehingga beda huruf kapital
 * atau spasi tersalin akan mengunci pemilik di luar dashboardnya sendiri.
 * Ini tidak melonggarkan keamanan — Google menormalkan alamatnya sendiri
 * dan tidak pernah menerbitkan dua akun yang hanya berbeda huruf.
 */
export function resolveRole(
  email: string | null | undefined,
  ownerEmail: string,
): Role {
  if (!email) return "VIEWER";
  return normalize(email) === normalize(ownerEmail) ? "OWNER" : "VIEWER";
}
