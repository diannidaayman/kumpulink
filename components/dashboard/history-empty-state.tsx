import Link from "next/link";

import { Button } from "@/components/ui/button";

/**
 * DUA keadaan kosong yang berbeda, dan bedanya penting: menyamakan
 * keduanya membuat group yang sehat terbaca seperti penyaring yang
 * salah, dan sebaliknya.
 */
export function HistoryEmptyState({
  filtering,
  clearHref,
}: {
  filtering: boolean;
  clearHref: string;
}) {
  if (filtering) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-base font-medium">Tidak ada baris yang cocok</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Penyaring yang sedang aktif tidak menemukan satu pun baris di group ini.
        </p>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link href={clearHref}>Hapus penyaring</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-8 text-center">
      <p className="text-base font-medium">Belum ada riwayat</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Baris muncul di sini setelah pengunjung membuka group ini atau salah satu itemnya.
      </p>
    </div>
  );
}
