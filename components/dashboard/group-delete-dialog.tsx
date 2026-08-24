"use client";

import { deleteGroupAction } from "@/app/(dashboard)/dashboard/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { GroupListItem } from "@/lib/types/group";

/**
 * Dialognya menyebut ANGKA sungguhan, bukan peringatan umum. Peringatan
 * yang tidak menyebutkan apa yang hilang tidak menolong siapa pun
 * memutuskan.
 *
 * Selalu muncul tanpa syarat, supaya perilakunya sama di Unit 2 dan Unit
 * 3. Aturan bersyarat akan membuat dialog ini tidak pernah tampil di Unit
 * 2 — dan fitur yang tidak pernah tampil adalah fitur yang tidak teruji.
 */
export function GroupDeleteDialog({
  group,
  open,
  onOpenChange,
}: {
  group: GroupListItem;
  open: boolean;
  onOpenChange: (next: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>Hapus group ini?</DialogTitle>
          <DialogDescription>
            Group “{group.title}” beserta {group.itemCount} item akan dihapus permanen.
            Riwayat aksesnya tetap disimpan. Link yang sudah disebarkan akan berhenti
            berfungsi.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" autoFocus onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <form action={deleteGroupAction}>
            <input type="hidden" name="id" value={group.id} />
            <Button type="submit" variant="destructive">
              Hapus
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
