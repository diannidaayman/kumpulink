import { TIDAK_TERSEDIA } from "@/lib/public/keadaan";

/**
 * Halaman terpendek di aplikasi, dan satu-satunya yang tidak boleh tahu
 * apa pun: tanpa nama group, tanpa baris kembali, tanpa tautan ke /g/
 * mana pun, tanpa saran alamat, dan tanpa "mungkin maksud Anda". Semua
 * keramahan semacam itu membocorkan keberadaan group. Kekosongannya
 * adalah fiturnya.
 *
 * Kalimatnya datang dari lib/public/keadaan.ts, sumber yang SAMA dengan
 * route handler /tidak-tersedia. Sejak permukaan keadaan menjadi route
 * handler, komponen ini hanya melayani not-found.tsx — yaitu alamat di
 * bawah app/(public)/ yang tidak cocok dengan rute mana pun. Ia tidak
 * lagi berada di jalur penolakan group; jalur itu mengalihkan ke route
 * handler supaya kalimatnya sampai tanpa JavaScript.
 */
export function UnavailablePage() {
  return (
    <div className="py-16">
      <h1 className="text-xl font-medium">{TIDAK_TERSEDIA.judul}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{TIDAK_TERSEDIA.penjelasan}</p>
    </div>
  );
}
