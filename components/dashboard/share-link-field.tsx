"use client";

import { Copy } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { shareUrl } from "@/lib/groups/share-url";

/**
 * URL selalu terlihat dan dapat diseleksi. Tombol Salin adalah jalan
 * pintas, BUKAN satu-satunya jalan — keputusan U5-11.
 *
 * Tidak ada kemunduran ke document.execCommand("copy"): API itu usang
 * dan pada sebagian peramban mengembalikan true tanpa menyalin apa pun,
 * menghasilkan pesan berhasil yang berbohong. Kegagalan yang jujur lebih
 * baik daripada keberhasilan yang palsu.
 */
export function ShareLinkField({ slug }: { slug: string }) {
  const url = shareUrl(slug);
  const teksRef = useRef<HTMLSpanElement>(null);
  const [pesan, setPesan] = useState<string | null>(null);

  function seleksiTeks() {
    const node = teksRef.current;
    const selection = window.getSelection();
    if (node === null || selection === null) return;
    const range = document.createRange();
    range.selectNodeContents(node);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  async function salin() {
    try {
      if (navigator.clipboard === undefined) {
        throw new Error("Clipboard tidak tersedia.");
      }
      await navigator.clipboard.writeText(url);
      setPesan("URL disalin.");
    } catch {
      seleksiTeks();
      setPesan("Tidak dapat menyalin otomatis. Tekan Ctrl+C untuk menyalin.");
    }
  }

  return (
    <div>
      <span className="text-sm font-medium">URL berbagi</span>
      <div className="mt-2 flex items-start gap-2">
        <span
          ref={teksRef}
          className="min-w-0 flex-1 break-all rounded-md border border-border bg-[var(--bg-elevated)] px-3 py-2 font-mono text-sm"
        >
          {url}
        </span>
        <Button type="button" variant="outline" size="sm" onClick={salin}>
          <Copy className="h-4 w-4" aria-hidden />
          Salin
        </Button>
      </div>
      {pesan !== null && (
        <p className="mt-2 text-sm text-muted-foreground" role="status">
          {pesan}
        </p>
      )}
    </div>
  );
}
