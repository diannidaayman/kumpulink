import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * Sasaran 303 dari route handler gerbang item, yang tidak dapat merender
 * komponen React sendiri. Badannya memanggil notFound() supaya Next
 * merender app/(public)/not-found.tsx dengan status 404 — halaman dan
 * kode status yang sama persis dengan yang diterima pengunjung halaman
 * group yang ditolak.
 */
export default function TidakTersediaPage() {
  notFound();
}
