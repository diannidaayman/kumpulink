import type { ReactNode } from "react";
import { ExternalLink, FileText, Image as ImageIcon, Link as LinkIcon, Lock } from "lucide-react";

import type { ItemListEntry } from "@/lib/types/item";
import { cn } from "@/lib/utils";

const TYPE_ICONS = {
  LINK: LinkIcon,
  PDF: FileText,
  IMAGE: ImageIcon,
} as const;

/**
 * Bentuknya sama di dashboard dan di halaman publik nanti. Ikon tipe
 * duduk di REL BERLEBAR TETAP, sehingga seluruh judul lurus satu garis
 * sepanjang daftar — pada 8 sampai 20 item, keteraturan itulah yang
 * membuat daftar dapat dipindai sambil berdiri.
 *
 * Di lebar ponsel kartu melipat menjadi dua baris: ikon dengan judul dan
 * deskripsi di baris satu, penanda di baris dua. Tanpa lipatan itu
 * lencana memaksa judul membungkus buruk, dan ponsel adalah jalur
 * pemakaian yang paling sering terjadi.
 *
 * Item OPEN TIDAK berlencana sama sekali. Ketiadaan itu bermakna, dan
 * menambahkan lencana "Terbuka" akan menghapus maknanya.
 */
export function ItemCard({
  item,
  children,
}: {
  item: ItemListEntry;
  children?: ReactNode;
}) {
  const TypeIcon = TYPE_ICONS[item.type];

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-xl border border-border bg-card p-3",
        "sm:flex-row sm:items-center sm:gap-3",
        !item.isActive && "opacity-60",
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
          <TypeIcon className="h-5 w-5 text-muted-foreground" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-base font-medium" title={item.title}>
            {item.title}
          </span>
          {item.description !== null && (
            <span className="mt-0.5 block text-sm text-muted-foreground">{item.description}</span>
          )}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {item.accessMode === "IDENTITY" && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-sm text-primary">
            <Lock className="h-4 w-4" aria-hidden />
            Perlu masuk
          </span>
        )}
        {!item.isActive && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-0.5 text-sm text-muted-foreground">
            Nonaktif
          </span>
        )}
        {item.source === "EXTERNAL" && (
          // Glif kecil bernada redup, SENGAJA berkelas visual lain
          // daripada pil bergaris, supaya ia tidak terbaca sebagai
          // lencana keadaan.
          <ExternalLink className="h-4 w-4 text-muted-foreground" aria-label="Tautan ke luar" />
        )}
        {children}
      </div>
    </div>
  );
}
