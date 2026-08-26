"use client";

import { useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { setItemActiveAction } from "@/app/(dashboard)/dashboard/item-actions";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { ItemListEntry } from "@/lib/types/item";

/**
 * Saklar nonaktif, sunting, dan hapus. Menonaktifkan BUKAN menghapus:
 * barisnya tinggal, urutannya tidak berubah, dan riwayat aksesnya tetap
 * merujuk item yang sama. Kartunya meredup di tempat alih-alih melompat
 * ke dasar daftar — pemilik menyusun urutan itu karena ada alasannya.
 */
export function ItemRowActions({
  item,
  onEdit,
  onDelete,
}: {
  item: ItemListEntry;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [pending, startTransition] = useTransition();

  function handleToggle(next: boolean) {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", item.id);
      formData.set("isActive", next ? "true" : "false");
      await setItemActiveAction(formData);
    });
  }

  return (
    <span className="flex shrink-0 items-center gap-2">
      <Switch
        checked={item.isActive}
        disabled={pending}
        aria-label={`Aktifkan ${item.title}`}
        onCheckedChange={handleToggle}
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-8 w-8"
        aria-label={`Ubah ${item.title}`}
        onClick={onEdit}
      >
        <Pencil className="h-4 w-4" aria-hidden />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-8 w-8 text-state-error"
        aria-label={`Hapus ${item.title}`}
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4" aria-hidden />
      </Button>
    </span>
  );
}
