/**
 * Satu kolom terpusat max-w-2xl dengan padding lega. Tidak ada bilah
 * samping dan tidak ada navigasi lain — halaman publik hanya boleh
 * memperlihatkan satu group, tanpa jejak group lain (invarian 4).
 *
 * Bilah identitas TIDAK di sini melainkan di halaman yang memilikinya:
 * halaman tidak tersedia tidak boleh tahu apa pun, termasuk siapa yang
 * sedang membukanya.
 */
export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-12">{children}</main>
    </div>
  );
}
