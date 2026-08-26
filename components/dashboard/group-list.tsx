"use client";

import { useCallback, useOptimistic, useState, useTransition } from "react";
import { Plus } from "lucide-react";

import { moveGroupAction } from "@/app/(dashboard)/dashboard/actions";
import { GroupAccordionBody } from "@/components/dashboard/group-accordion-body";
import { GroupEmptyState } from "@/components/dashboard/group-empty-state";
import { GroupFilterBar } from "@/components/dashboard/group-filter-bar";
import { GroupFormRow } from "@/components/dashboard/group-form-row";
import { GroupReorderButtons } from "@/components/dashboard/group-reorder-buttons";
import { GroupRow } from "@/components/dashboard/group-row";
import { useGroupFilter } from "@/components/dashboard/use-group-filter";
import { useOpenGroup } from "@/components/dashboard/use-open-group";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { moveInList } from "@/lib/order/move";
import type { GroupListItem } from "@/lib/types/group";
import type { ItemListEntry } from "@/lib/types/item";
import { cn } from "@/lib/utils";

const TRIGGER_ICON_LEFT = cn(
  // ui-context.md menempatkan chevron di KIRI, sedangkan komponen shadcn
  // hasil generate menaruhnya di kanan dengan ml-auto. components/ui/
  // tidak boleh diedit, jadi posisinya digeser lewat className di sini.
  "[&_[data-slot=accordion-trigger-icon]]:order-first",
  "[&_[data-slot=accordion-trigger-icon]]:ml-0",
  "[&_[data-slot=accordion-trigger-icon]]:mr-3",
);

export function GroupList({
  groups,
  itemsByGroup,
  now,
}: {
  groups: GroupListItem[];
  itemsByGroup: Record<string, ItemListEntry[]>;
  now: Date;
}) {
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [, startTransition] = useTransition();

  const [order, applyMove] = useOptimistic(
    groups,
    (current: GroupListItem[], move: { id: string; direction: "up" | "down" }) =>
      moveInList(current, move.id, move.direction),
  );

  const { openId, handleOpenChange } = useOpenGroup(groups);

  const { query, setQuery, segment, setSegment, filtering, visible } = useGroupFilter(order, now);

  function handleMove(group: GroupListItem, direction: "up" | "down") {
    const moved = moveInList(order, group.id, direction);
    const position = moved.findIndex((entry) => entry.id === group.id) + 1;
    setAnnouncement(`${group.title} dipindah ke posisi ${position} dari ${moved.length}.`);
    startTransition(async () => {
      applyMove({ id: group.id, direction });
      const formData = new FormData();
      formData.set("id", group.id);
      formData.set("direction", direction);
      await moveGroupAction(formData);
    });
  }

  const stopCreating = useCallback(() => setCreating(false), []);
  const stopEditing = useCallback(() => setEditingId(null), []);

  return (
    <>
      <GroupFilterBar
        query={query}
        segment={segment}
        onQueryChange={setQuery}
        onSegmentChange={setSegment}
      />

      <div className="mb-3 flex justify-end">
        <Button type="button" onClick={() => setCreating(true)}>
          <Plus className="h-5 w-5" aria-hidden />
          Group baru
        </Button>
      </div>

      {creating && (
        <div className="mb-2">
          <GroupFormRow mode="create" onDone={stopCreating} />
        </div>
      )}

      {visible.length === 0 && <GroupEmptyState reason={filtering ? "filtered" : "none"} />}

      <Accordion
        type="single"
        collapsible
        value={openId}
        onValueChange={handleOpenChange}
        className="flex flex-col gap-2"
      >
        {visible.map((group, index) => (
          <AccordionItem
            key={group.id}
            value={group.id}
            id={`group-${group.id}`}
            className="rounded-xl border border-border bg-card px-4"
          >
            {/* Pemicu akordeon adalah sebuah <button>. Tombol naik/turun
                WAJIB menjadi saudaranya, bukan anaknya — tombol di dalam
                tombol adalah HTML tak sah dan merusak papan ketik. */}
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <AccordionTrigger className={cn("gap-3 py-3 hover:no-underline", TRIGGER_ICON_LEFT)}>
                  <GroupRow group={group} now={now} />
                </AccordionTrigger>
              </div>
              {!filtering && (
                <GroupReorderButtons
                  group={group}
                  index={index}
                  total={visible.length}
                  onMove={(direction) => handleMove(group, direction)}
                />
              )}
            </div>

            {/* `h-auto` WAJIB, bukan hiasan. Radix mengukur tinggi isi
                akordeon sekali saja — layout effect-nya bergantung pada
                [open, present], bukan pada isinya — lalu mengunci hasilnya
                di `--radix-accordion-content-height`. Pembungkus bawaan
                shadcn memasang tinggi itu secara kaku dan menyertai
                `overflow-hidden`, sehingga isi yang TUMBUH setelah akordeon
                terbuka akan terpotong: menekan "Ubah judul dan slug"
                menukar paragraf pendek dengan formulir yang jauh lebih
                tinggi, dan sisanya terpotong tanpa bisa digulir sama
                sekali. `h-auto` menang atas tinggi kaku itu lewat
                tailwind-merge, sehingga akordeon ikut tumbuh mengikuti
                isinya. components/ui/ tidak boleh diedit, jadi
                perbaikannya dipasang dari luar — pola yang sama dengan
                TRIGGER_ICON_LEFT di atas. */}
            <AccordionContent className="h-auto pb-4">
              <GroupAccordionBody
                group={group}
                items={itemsByGroup[group.id] ?? []}
                editingId={editingId}
                deletingId={deletingId}
                onEditStart={setEditingId}
                onEditDone={stopEditing}
                onDeleteStart={setDeletingId}
                onDeleteOpenChange={(next) => setDeletingId(next ? group.id : null)}
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {filtering && (
        <p className="mt-3 text-sm text-muted-foreground">
          Urutan hanya dapat diubah saat menampilkan Semua.
        </p>
      )}

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </>
  );
}
