"use client";

import { useOptimistic, useState, useTransition } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

import { reorderItemsAction } from "@/app/(dashboard)/dashboard/item-actions";
import { ItemCard } from "@/components/dashboard/item-card";
import { ItemDeleteDialog } from "@/components/dashboard/item-delete-dialog";
import { ItemEditForm } from "@/components/dashboard/item-edit-form";
import { ItemEmptyState } from "@/components/dashboard/item-empty-state";
import { ItemReorderButtons } from "@/components/dashboard/item-reorder-buttons";
import { ItemRowActions } from "@/components/dashboard/item-row-actions";
import { moveInList } from "@/lib/order/move";
import type { ItemListEntry } from "@/lib/types/item";

/**
 * Pegangan seret TERPISAH dari badan kartu. Menjadikan seluruh kartu
 * dapat diseret akan menelan klik pada saklar nonaktif dan pada tombol
 * naik/turun yang duduk di dalamnya.
 */
function SortableItemRow({
  item,
  index,
  total,
  onMove,
  onEdit,
  onDelete,
}: {
  item: ItemListEntry;
  index: number;
  total: number;
  onMove: (direction: "up" | "down") => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? "relative z-10 opacity-80" : undefined}
    >
      <ItemCard item={item}>
        <ItemRowActions item={item} onEdit={onEdit} onDelete={onDelete} />
        <ItemReorderButtons title={item.title} index={index} total={total} onMove={onMove} />
        <button
          type="button"
          className="flex h-8 w-8 shrink-0 cursor-grab items-center justify-center rounded-md text-muted-foreground"
          aria-label={`Seret untuk memindahkan ${item.title}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" aria-hidden />
        </button>
      </ItemCard>
    </div>
  );
}

export function ItemList({ groupId, items }: { groupId: string; items: ItemListEntry[] }) {
  const [, startTransition] = useTransition();
  const [order, applyOrder] = useOptimistic(
    items,
    (_current: ItemListEntry[], next: ItemListEntry[]) => next,
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");

  // Jarak aktivasi 8 piksel: tanpa itu, setiap klik pada pegangan
  // terhitung sebagai seret sepanjang nol piksel, dan tombol di
  // sekitarnya berhenti dapat ditekan di perangkat sentuh.
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  function announceMove(id: string, next: ItemListEntry[]) {
    const item = next.find((entry) => entry.id === id);
    if (item === undefined) return;
    const position = next.findIndex((entry) => entry.id === id) + 1;
    setAnnouncement(`${item.title} dipindah ke posisi ${position} dari ${next.length}.`);
  }

  function commit(next: ItemListEntry[]) {
    startTransition(async () => {
      applyOrder(next);
      await reorderItemsAction(
        groupId,
        next.map((item) => item.id),
      );
    });
  }

  function handleMove(id: string, direction: "up" | "down") {
    const next = moveInList(order, id, direction);
    announceMove(id, next);
    commit(next);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over === null || active.id === over.id) return;

    const from = order.findIndex((item) => item.id === active.id);
    const to = order.findIndex((item) => item.id === over.id);
    if (from === -1 || to === -1) return;

    const next = [...order];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    announceMove(String(active.id), next);
    commit(next);
  }

  if (order.length === 0) return <ItemEmptyState />;

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={order.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {order.map((item, index) =>
              editingId === item.id ? (
                <ItemEditForm key={item.id} item={item} onDone={() => setEditingId(null)} />
              ) : (
                <div key={item.id}>
                  <SortableItemRow
                    item={item}
                    index={index}
                    total={order.length}
                    onMove={(direction) => handleMove(item.id, direction)}
                    onEdit={() => setEditingId(item.id)}
                    onDelete={() => setDeletingId(item.id)}
                  />
                  {deletingId === item.id && (
                    <ItemDeleteDialog
                      item={item}
                      open
                      onOpenChange={(next) => setDeletingId(next ? item.id : null)}
                    />
                  )}
                </div>
              ),
            )}
          </div>
        </SortableContext>
      </DndContext>

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </>
  );
}
