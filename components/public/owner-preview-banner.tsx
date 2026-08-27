import { Ban } from "lucide-react";

/**
 * DI ATAS judul group, sehingga terbaca sebagai bingkai halaman dan bukan
 * sebagai item di dalamnya. Satu-satunya elemen di halaman ini yang
 * memakai aksen peringatan, dan sengaja dibuat LEBIH DATAR daripada
 * kartu item — tanpa bayangan, tanpa bobot tebal — supaya terbaca sebagai
 * chrome, bukan isi. Tidak dapat ditutup.
 */
export function OwnerPreviewBanner() {
  return (
    <div className="mb-6 flex items-start gap-3 border-l-4 border-[var(--state-warning)] bg-[var(--bg-elevated)] px-4 py-3">
      <Ban className="mt-0.5 h-4 w-4 shrink-0 text-[var(--state-warning)]" aria-hidden />
      <p className="text-sm">
        Link berbagi group ini sedang tidak aktif. Hanya Anda yang dapat melihat
        halaman ini.
      </p>
    </div>
  );
}
