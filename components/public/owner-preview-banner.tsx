import { Ban } from "lucide-react";

import type { PreviewReason } from "@/lib/groups/preview-reason";
import { formatDateWIT } from "@/lib/time/format";

/**
 * DI ATAS judul group, sehingga terbaca sebagai bingkai halaman dan bukan
 * sebagai item di dalamnya. Satu-satunya elemen di halaman ini yang
 * memakai aksen peringatan, dan sengaja dibuat LEBIH DATAR daripada
 * kartu item — tanpa bayangan, tanpa bobot tebal — supaya terbaca sebagai
 * chrome, bukan isi. Tidak dapat ditutup.
 *
 * Teksnya membedakan sebab, mengikuti aturan yang sudah berlaku pada
 * lencana dashboard: nada mengikuti siapa penyebabnya. Bentuk visualnya
 * tidak ikut berubah — satu spanduk, satu aksen, di kedua sebab.
 */
export function OwnerPreviewBanner({
  reason,
  expiresAt,
}: {
  reason: PreviewReason;
  expiresAt: Date | null;
}) {
  // expiresAt tidak pernah null saat reason EXPIRED — resolvePreviewReason
  // baru mengembalikannya setelah membaca tanggalnya. Cabang null tetap
  // ditulis karena tipenya mengizinkannya, dan kalimat tanpa tanggal lebih
  // baik daripada kalimat yang berakhir dengan spasi lalu titik.
  const kalimat =
    reason === "REVOKED"
      ? "Link berbagi group ini Anda matikan."
      : expiresAt === null
        ? "Link berbagi group ini sudah kedaluwarsa."
        : `Link berbagi group ini kedaluwarsa ${formatDateWIT(expiresAt)}.`;

  return (
    <div className="mb-6 flex items-start gap-3 border-l-4 border-[var(--state-warning)] bg-[var(--bg-elevated)] px-4 py-3">
      <Ban className="mt-0.5 h-4 w-4 shrink-0 text-[var(--state-warning)]" aria-hidden />
      <p className="text-sm">
        {kalimat} Hanya Anda yang dapat melihat halaman ini.
      </p>
    </div>
  );
}
