"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Pratinjau dan unduhan berasal dari SATU rute; ?unduh=1 hanya mengubah
 * Content-Disposition. Keputusan U5-10.
 */
export function ShareQrPanel({
  groupId,
  slug,
  title,
}: {
  groupId: string;
  slug: string;
  title: string;
}) {
  const src = `/api/groups/${groupId}/qr`;

  return (
    <div>
      <span className="text-sm font-medium">QR code</span>
      {/*
        bg-white disengaja dan BUKAN token tema: QR wajib gelap-di-atas-terang
        di kedua mode, dan alas yang mengikuti tema membuatnya berhenti
        terpindai di mode gelap.

        next/image tidak dipakai karena ia menuntut dangerouslyAllowSVG di
        next.config.ts — melonggarkan pipeline gambar seluruh aplikasi demi
        satu pratinjau yang hanya dilihat pemilik.
      */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`QR code untuk group ${title}`}
        width={176}
        height={176}
        className="mt-2 h-44 w-44 rounded-lg border border-border bg-white p-2"
      />
      <div className="mt-3">
        <Button asChild variant="outline" size="sm">
          <a href={`${src}?unduh=1`} download={`qr-${slug}.svg`}>
            <Download className="h-4 w-4" aria-hidden />
            Unduh QR (SVG)
          </a>
        </Button>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        QR memuat alamat lengkap group ini. Mengubah slug membuat QR yang sudah
        dicetak berhenti berfungsi.
      </p>
    </div>
  );
}
