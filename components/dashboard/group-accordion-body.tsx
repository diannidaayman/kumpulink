"use client";

import { Trash2 } from "lucide-react";

import { GroupDeleteDialog } from "@/components/dashboard/group-delete-dialog";
import { GroupFormRow } from "@/components/dashboard/group-form-row";
import { Button } from "@/components/ui/button";
import type { GroupListItem } from "@/lib/types/group";

export function GroupAccordionBody({
  group,
  editingId,
  deletingId,
  onEditStart,
  onEditDone,
  onDeleteStart,
  onDeleteOpenChange,
}: {
  group: GroupListItem;
  editingId: string | null;
  deletingId: string | null;
  onEditStart: (id: string) => void;
  onEditDone: () => void;
  onDeleteStart: (id: string) => void;
  onDeleteOpenChange: (next: boolean) => void;
}) {
  return editingId === group.id ? (
    <GroupFormRow mode="edit" group={group} onDone={onEditDone} />
  ) : (
    <>
      <p className="text-sm text-muted-foreground">
        Group ini belum berisi apa-apa. Tambah tautan, PDF, atau gambar.
      </p>
      <div className="mt-3 flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onEditStart(group.id)}
        >
          Ubah judul dan slug
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-state-error"
          onClick={() => onDeleteStart(group.id)}
        >
          <Trash2 className="h-4 w-4" aria-hidden />
          Hapus group
        </Button>
      </div>
      {deletingId === group.id && (
        <GroupDeleteDialog group={group} open onOpenChange={onDeleteOpenChange} />
      )}
    </>
  );
}
