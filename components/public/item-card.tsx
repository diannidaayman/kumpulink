import { ExternalLink, FileText, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import type { ItemType } from "@prisma/client";

import { AccessBadge } from "@/components/public/access-badge";
import type { PublicItem } from "@/lib/db/public-group";
import { itemGateCallbackUrl } from "@/lib/auth/callback-url";

const TYPE_ICON: Record<ItemType, typeof LinkIcon> = {
  LINK: LinkIcon,
  PDF: FileText,
  IMAGE: ImageIcon,
};

/**
 * Setiap item dirender sebagai tautan menuju gerbangnya, TIDAK PERNAH
 * menuju tujuan aslinya. Komponen ini tidak menerima kolom tujuan item
 * maupun kolom sensitif sebagai props, dan kuerinya pun tidak
 * membacanya — ditegakkan tests/public/no-target-url-boundary.test.ts.
 *
 * Ikon tipe duduk di REL BERLEBAR TETAP, sehingga seluruh judul lurus
 * satu garis sepanjang halaman. Pada 8-20 item, keteraturan itulah yang
 * membuat daftar dapat dipindai sambil berdiri.
 *
 * Item APPROVAL tidak dapat ada di database pada akhir Unit 4:
 * ItemAccessModeField tidak menawarkannya dan itemAccessModeSchema
 * menolaknya. Cabangnya tetap ditulis dan bersikap MENOLAK — kartu bukan
 * tautan, tanpa tombol — supaya data yang lebih tua atau lebih baru
 * daripada kode tidak lolos. Unit 7 menggantinya dengan ketujuh keadaan
 * izin beserta tombolnya.
 */
export function PublicItemCard({ item, slug }: { item: PublicItem; slug: string }) {
  const Icon = TYPE_ICON[item.type];
  // AccessBadge mengembalikan null untuk OPEN. Lipatan di bawah hanya
  // berlaku bila lencananya memang ada: memaksa kartu polos ikut melipat
  // menambah satu baris kosong setinggi jarak antarbaris pada kartu yang
  // tidak punya masalah apa pun.
  const berlencana = item.accessMode !== "OPEN";

  const body = (
    <>
      <span className="flex w-6 shrink-0 justify-center pt-0.5">
        <Icon className="h-6 w-6 text-muted-foreground" aria-hidden />
      </span>
      <span
        className={`min-w-0 flex-1${
          // Rel ikon w-6 ditambah gap-3 tepat 2.25rem. Memberi kolom teks
          // sisa seluruh baris memaksa kolom kanan membungkus ke baris
          // sendiri di bawah sm.
          //
          // flex-wrap saja TIDAK cukup, dan itulah cacat yang diperbaiki:
          // min-w-0 flex-1 membuat kolom teks MENYUSUT alih-alih memaksa
          // pembungkusan, sehingga sm:flex-nowrap tidak pernah punya
          // lawan. Terukur di 375 px: kolom teks 123 px melawan 245 px
          // dan 261 px milik kartu polos, membungkus dini padahal ada
          // ruang kosong di sebelahnya.
          berlencana ? " basis-[calc(100%-2.25rem)] sm:basis-auto" : ""
        }`}
      >
        <span className="block font-medium">{item.title}</span>
        {item.description !== null && (
          <span className="mt-0.5 block text-sm text-muted-foreground">{item.description}</span>
        )}
        {item.accessMode === "IDENTITY" && (
          <span className="mt-1 block text-xs text-muted-foreground">
            Akses Anda akan dicatat
          </span>
        )}
      </span>
      <span
        className={`flex shrink-0 items-center gap-2${
          // Sejajar dengan kolom teks di atasnya, bukan dengan rel ikon:
          // 2.25rem yang sama.
          berlencana ? " ml-9 sm:ml-0" : ""
        }`}
      >
        <AccessBadge accessMode={item.accessMode} />
        {item.source === "EXTERNAL" && (
          <ExternalLink className="h-4 w-4 text-muted-foreground" aria-hidden />
        )}
      </span>
    </>
  );

  const shell =
    "flex flex-wrap items-start gap-3 rounded-[var(--radius)] border border-border bg-card p-4 sm:flex-nowrap";

  if (item.accessMode === "APPROVAL") {
    return <div className={shell}>{body}</div>;
  }

  return (
    <a
      href={itemGateCallbackUrl(slug, item.id)}
      target="_blank"
      rel="noopener noreferrer"
      className={`${shell} transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
    >
      {body}
    </a>
  );
}
