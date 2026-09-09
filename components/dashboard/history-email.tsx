import { cn } from "@/lib/utils";

/**
 * Email mono redup terpotong, satu-satunya tempat gayanya ditetapkan.
 *
 * Ia dipakai TIGA kali: dua di tabel — sekali di dalam sel Nama untuk
 * lebar di bawah lg, sekali di kolom Email tersendiri untuk lg ke atas,
 * karena peleburan Email adalah pengorbanan pertama menurut ui-context —
 * dan sekali di kartu ponsel. Kelas pembungkusnya berbeda di tiap tempat;
 * gaya emailnya tidak, dan karena itu ia berdiri sendiri di sini.
 */
export function HistoryEmail({
  email,
  className,
}: {
  email: string;
  className?: string;
}) {
  return (
    <span
      className={cn("block truncate font-mono text-sm text-muted-foreground", className)}
      title={email}
    >
      {email}
    </span>
  );
}
