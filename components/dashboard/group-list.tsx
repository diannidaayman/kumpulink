"use client";

import { useCallback, useEffect, useOptimistic, useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";

import { moveGroupAction } from "@/app/(dashboard)/dashboard/actions";
import { GroupDeleteDialog } from "@/components/dashboard/group-delete-dialog";
import { GroupEmptyState } from "@/components/dashboard/group-empty-state";
import { GroupFilterBar } from "@/components/dashboard/group-filter-bar";
import { GroupFormRow } from "@/components/dashboard/group-form-row";
import { GroupReorderButtons } from "@/components/dashboard/group-reorder-buttons";
import { GroupRow } from "@/components/dashboard/group-row";
import { useGroupFilter } from "@/components/dashboard/use-group-filter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { moveGroup } from "@/lib/groups/order";
import type { GroupListItem } from "@/lib/types/group";
import { cn } from "@/lib/utils";

const OPEN_GROUP_KEY = "kumpulink:open-group";

const TRIGGER_ICON_LEFT = cn(
  // ui-context.md menempatkan chevron di KIRI, sedangkan komponen shadcn
  // hasil generate menaruhnya di kanan dengan ml-auto. components/ui/
  // tidak boleh diedit, jadi posisinya digeser lewat className di sini.
  "[&_[data-slot=accordion-trigger-icon]]:order-first",
  "[&_[data-slot=accordion-trigger-icon]]:ml-0",
  "[&_[data-slot=accordion-trigger-icon]]:mr-3",
);

export function GroupList({ groups, now }: { groups: GroupListItem[]; now: Date }) {
  const [openId, setOpenId] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [, startTransition] = useTransition();

  const [order, applyMove] = useOptimistic(
    groups,
    (current: GroupListItem[], move: { id: string; direction: "up" | "down" }) =>
      moveGroup(current, move.id, move.direction),
  );

  // Bawaannya TERLIPAT, lalu group yang tersimpan dibuka setelah mount.
  // Membacanya saat render pertama akan membuat keluaran server berbeda
  // dari klien. Id yang groupnya sudah dihapus diabaikan begitu saja.
  useEffect(() => {
    const stored = window.localStorage.getItem(OPEN_GROUP_KEY);
    if (stored && groups.some((group) => group.id === stored)) setOpenId(stored);
  }, [groups]);

  function handleOpenChange(next: string) {
    setOpenId(next);
    window.localStorage.setItem(OPEN_GROUP_KEY, next);
    if (next === "") return;
    // behavior "auto", bukan "smooth": gulir yang tidak diminta melanggar
    // prefers-reduced-motion.
    requestAnimationFrame(() => {
      document.getElementById(`group-${next}`)?.scrollIntoView({ block: "start" });
    });
  }

  const { query, setQuery, segment, setSegment, filtering, visible } = useGroupFilter(order, now);

  function handleMove(group: GroupListItem, direction: "up" | "down") {
    const moved = moveGroup(order, group.id, direction);
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

            <AccordionContent className="pb-4">
              {editingId === group.id ? (
                <GroupFormRow mode="edit" group={group} onDone={stopEditing} />
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
                      onClick={() => setEditingId(group.id)}
                    >
                      Ubah judul dan slug
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-state-error"
                      onClick={() => setDeletingId(group.id)}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                      Hapus group
                    </Button>
                  </div>
                  {deletingId === group.id && (
                    <GroupDeleteDialog
                      group={group}
                      open
                      onOpenChange={(next) => setDeletingId(next ? group.id : null)}
                    />
                  )}
                </>
              )}
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
