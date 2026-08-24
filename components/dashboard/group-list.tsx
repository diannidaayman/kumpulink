"use client";

import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { GroupRow } from "@/components/dashboard/group-row";
import type { GroupListItem } from "@/lib/types/group";
import { cn } from "@/lib/utils";

const OPEN_GROUP_KEY = "kumpulink:open-group";

export function GroupList({ groups, now }: { groups: GroupListItem[]; now: Date }) {
  const [openId, setOpenId] = useState("");

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
    <Accordion
      type="single"
      collapsible
      value={openId}
      onValueChange={handleOpenChange}
      className="flex flex-col gap-2"
    >
      {groups.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <h2 className="text-base font-medium text-card-foreground">Belum ada group</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Buat group pertama untuk mulai menghimpun tautan dan berkas.
          </p>
        </div>
      )}
      {groups.map((group) => (
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
            <p className="text-sm text-muted-foreground">
              Group ini belum berisi apa-apa. Tambah tautan, PDF, atau gambar.
            </p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
