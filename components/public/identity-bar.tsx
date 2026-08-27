import { signOutTo } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

/**
 * Nama dan tombol keluar selalu terlihat, tanpa perlu membuka menu.
 * Laptop ruang rapat dipakai bergantian; tanpa tombol ini, riwayat akses
 * akan mencatat lima orang berikutnya sebagai orang yang pertama masuk —
 * dan riwayat itulah alasan aplikasi ini dibuat.
 *
 * Tidak ada tombol ganti tema di sini: bilah ini hanya muncul bagi
 * pengunjung yang sedang masuk, sehingga tombolnya akan hilang justru
 * bagi mayoritas pengunjung. Halaman publik mengikuti prefers-color-scheme.
 */
export function IdentityBar({
  name,
  email,
  callbackUrl,
}: {
  name: string | null;
  email: string | null;
  callbackUrl: string;
}) {
  return (
    <div className="mb-6 flex items-center justify-between gap-3 border-b border-border pb-3">
      <span className="min-w-0 truncate text-sm text-muted-foreground" title={email ?? undefined}>
        {name ?? email}
      </span>
      <form action={signOutTo.bind(null, callbackUrl)}>
        <Button type="submit" variant="outline" size="sm">
          Keluar
        </Button>
      </form>
    </div>
  );
}
