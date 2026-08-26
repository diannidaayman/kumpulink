"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { GroupDeleteDialog } from "@/components/dashboard/group-delete-dialog";
import { GroupFormRow } from "@/components/dashboard/group-form-row";
import { ItemAddPanel } from "@/components/dashboard/item-add-panel";
import { ItemCard } from "@/components/dashboard/item-card";
import { ItemEmptyState } from "@/components/dashboard/item-empty-state";
import { Button } from "@/components/ui/button";
import type { GroupListItem } from "@/lib/types/group";
import type { ItemListEntry } from "@/lib/types/item";

export function GroupAccordionBody({
  group,
  items,
  editingId,
  deletingId,
  onEditStart,
  onEditDone,
  onDeleteStart,
  onDeleteOpenChange,
}: {
  group: GroupListItem;
  items: ItemListEntry[];
  editingId: string | null;
  deletingId: string | null;
  onEditStart: (id: string) => void;
  onEditDone: () => void;
  onDeleteStart: (id: string) => void;
  onDeleteOpenChange: (next: boolean) => void;
}) {
  const [addingToId, setAddingToId] = useState<string | null>(null);

  return editingId === group.id ? (
    <GroupFormRow mode="edit" group={group} onDone={onEditDone} />
  ) : (
    <>
      {items.length === 0 ? (
        <ItemEmptyState />
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {addingToId === group.id ? (
        <div className="mt-3">
          <ItemAddPanel groupId={group.id} onDone={() => setAddingToId(null)} />
        </div>
      ) : (
        <div className="mt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAddingToId(group.id)}
          >
            <Plus className="h-4 w-4" aria-hidden />
            Tambah item
          </Button>
        </div>
      )}

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
