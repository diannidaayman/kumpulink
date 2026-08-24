"use client";

import { useEffect, useState } from "react";

import type { GroupListItem } from "@/lib/types/group";

const OPEN_GROUP_KEY = "kumpulink:open-group";

/**
 * Keadaan akordeon: SATU id group yang sedang terbuka, disimpan di
 * localStorage dan bukan di basis data. Hanya satu boleh terbuka pada
 * satu waktu, jadi yang disimpan satu id — bukan sekumpulan id.
 */
export function useOpenGroup(groups: readonly GroupListItem[]) {
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
    // behavior "auto", bukan "smooth": gulir yang tidak diminta melanggar
    // prefers-reduced-motion.
    requestAnimationFrame(() => {
      document.getElementById(`group-${next}`)?.scrollIntoView({ block: "start" });
    });
  }

  return { openId, handleOpenChange };
}
