import { Ban, EyeOff, Globe, Link2Off, Lock } from "lucide-react";

import type { GroupStatus } from "@/lib/groups/status";
import { cn } from "@/lib/utils";

type BadgeShape = {
  label: string;
  Icon: typeof Ban;
  tone: string;
};

/**
 * Satu tata bahasa untuk seluruh lencana: pil rounded-full, garis batas
 * setipis rambut, permukaan bernada tipis — TIDAK PERNAH terisi penuh.
 *
 * Aturan itu yang menjaga satu-satunya elemen terisi penuh di layar tetap
 * berupa tombol yang benar-benar dapat ditindak.
 *
 * Nadanya mengikuti siapa penyebabnya: saklar berbagi yang mati adalah
 * pilihan sadar pemilik, jadi netral; kedaluwarsa terjadi tanpa ia
 * memutuskan apa pun, jadi peringatan.
 */
const SHAPES: Record<GroupStatus, BadgeShape> = {
  UNSHARED: {
    label: "Tidak dibagikan",
    Icon: Link2Off,
    tone: "border-border bg-muted text-muted-foreground",
  },
  EXPIRED: {
    label: "Kedaluwarsa",
    Icon: Ban,
    tone: "border-state-warning/40 bg-state-warning/10 text-state-warning",
  },
  PRIVATE: {
    label: "Privat",
    Icon: EyeOff,
    tone: "border-border bg-muted text-muted-foreground",
  },
  REQUIRE_LOGIN: {
    label: "Wajib masuk",
    Icon: Lock,
    tone: "border-primary/40 bg-primary/10 text-primary",
  },
  PUBLIC: {
    label: "Publik",
    Icon: Globe,
    tone: "border-state-success/40 bg-state-success/10 text-state-success",
  },
};

export function GroupStatusBadge({ status }: { status: GroupStatus }) {
  const { label, Icon, tone } = SHAPES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-sm",
        tone,
      )}
    >
      <Icon className="h-4 w-4" aria-hidden />
      {label}
    </span>
  );
}
