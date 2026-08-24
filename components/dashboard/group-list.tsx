"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { GroupDeleteDialog } from "@/components/dashboard/group-delete-dialog";
import { GroupFormRow } from "@/components/dashboard/group-form-row";
import { GroupRow } from "@/components/dashboard/group-row";
import { GroupFilterBar, type GroupSegment } from "@/components/dashboard/group-filter-bar";
import { GroupEmptyState } from "@/components/dashboard/group-empty-state";
import { resolveGroupStatus } from "@/lib/groups/status";
import type { GroupListItem } from "@/lib/types/group";
import { cn } from "@/lib/utils";

const OPEN_GROUP_KEY = "kumpulink:open-group";

export function GroupList({ groups, now }: { groups: GroupListItem[]; now: Date }) {
  const [openId, setOpenId] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [segment, setSegment] = useState<GroupSegment>("active");

  const filtering = query.trim() !== "" || segment !== "all";
  const visible = groups.filter((group) => {
    const status = resolveGroupStatus(group, now);
    const inactive = status === "UNSHARED" || status === "EXPIRED";
    if (segment === "active" && inactive) return false;
    if (segment === "inactive" && !inactive) return false;
    return group.title.toLowerCase().includes(query.trim().toLowerCase());
  });

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
    // Isi yang baru muncul digulirkan ke atas viewport supaya tidak
    // tertinggal di bawah lipatan. behavior "auto", bukan "smooth":
    // gerakan gulir yang tidak diminta melanggar prefers-reduced-motion.
    requestAnimationFrame(() => {
      document.getElementById(`group-${next}`)?.scrollIntoView({ block: "start" });
    });
  }

  return (
    <>
      <div className="mb-3 flex justify-end">
        <Button type="button" onClick={() => setCreating(true)}>
          <Plus className="h-5 w-5" aria-hidden />
          Group baru
        </Button>
      </div>
      {creating && (
        <div className="mb-2">
          <GroupFormRow mode="create" onDone={() => setCreating(false)} />
        </div>
      )}
      <GroupFilterBar
        query={query}
        segment={segment}
        onQueryChange={setQuery}
        onSegmentChange={setSegment}
      />
      {visible.length === 0 && <GroupEmptyState reason={filtering ? "filtered" : "none"} />}
      <Accordion
        type="single"
        collapsible
        value={openId}
        onValueChange={handleOpenChange}
        className="flex flex-col gap-2"
      >
        {visible.map((group) => (
          <AccordionItem
            key={group.id}
            value={group.id}
            id={`group-${group.id}`}
            className="rounded-xl border border-border bg-card px-4"
          >
            {/* Pemicu akordeon adalah sebuah <button>. Tombol naik/turun di
                Task 12 WAJIB menjadi saudaranya, bukan anaknya — tombol di
                dalam tombol adalah HTML tak sah dan merusak papan ketik.
                Pembungkus flex ini yang menyediakan tempatnya. */}
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <AccordionTrigger
                  className={cn(
                    "gap-3 py-3 hover:no-underline",
                    // ui-context.md menempatkan chevron di KIRI, sedangkan
                    // komponen shadcn hasil generate menaruhnya di kanan
                    // dengan ml-auto. components/ui/ tidak boleh diedit,
                    // jadi posisinya digeser lewat className di sini.
                    "[&_[data-slot=accordion-trigger-icon]]:order-first",
                    "[&_[data-slot=accordion-trigger-icon]]:ml-0",
                    "[&_[data-slot=accordion-trigger-icon]]:mr-3",
                  )}
                >
                  <GroupRow group={group} now={now} />
                </AccordionTrigger>
              </div>
            </div>
            <AccordionContent className="pb-4">
              {editingId === group.id ? (
                <GroupFormRow mode="edit" group={group} onDone={() => setEditingId(null)} />
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Group ini belum berisi apa-apa. Tambah tautan, PDF, atau gambar.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => setEditingId(group.id)}
                  >
                    Ubah judul dan slug
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3 text-state-error"
                    onClick={() => setDeletingId(group.id)}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                    Hapus group
                  </Button>
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
    </>
  );
}
