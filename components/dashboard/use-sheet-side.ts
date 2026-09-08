"use client";

import { useEffect, useState } from "react";

const WIDE = "(min-width: 640px)";

/**
 * Dari kanan pada layar lebar, dari bawah pada ponsel — ui-context.md.
 *
 * Dimulai dari "bottom" dan baru membaca matchMedia SETELAH mount:
 * server tidak mengetahui lebar layar, jadi nilai awal yang menebak akan
 * membuat render pertama server dan klien berbeda — persis definisi
 * ketidakcocokan hidrasi.
 */
export function useSheetSide(): "right" | "bottom" {
  const [wide, setWide] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(WIDE);
    const sync = () => setWide(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return wide ? "right" : "bottom";
}
