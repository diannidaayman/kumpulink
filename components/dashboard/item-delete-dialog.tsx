"use client";

import { deleteItemAction } from "@/app/(dashboard)/dashboard/item-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ItemListEntry } from "@/lib/types/item";

/**
 * Menyebutkan akibat yang BERBEDA menurut sumbernya. Untuk item unggahan,
 * berkasnya ikut hilang dan tidak dapat dikembalikan; untuk item
 * eksternal, yang hilang hanya barisnya. Peringatan yang sama untuk dua
 * akibat yang berbeda akan berhenti dibaca.
 */
export function ItemDeleteDialog({
  item,
  open,
  onOpenChange,
}: {
  item: ItemListEntry;
  open: boolean;
  onOpenChange: (next: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>Hapus item ini?</DialogTitle>
          <DialogDescription>
            {item.source === "UPLOAD"
              ? `Item “${item.title}” beserta berkas ${item.fileName ?? "unggahannya"} akan dihapus permanen. Berkas yang sudah dihapus tidak dapat dikembalikan.`
              : `Item “${item.title}” akan dihapus permanen. Tautan tujuannya sendiri tidak ikut terpengaruh.`}{" "}
            Riwayat aksesnya tetap disimpan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" autoFocus onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <form action={deleteItemAction}>
            <input type="hidden" name="id" value={item.id} />
            <Button type="submit" variant="destructive">
              Hapus
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
