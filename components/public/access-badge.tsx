import type { AccessMode } from "@prisma/client";
import { Lock, ShieldCheck } from "lucide-react";

/**
 * Satu tata bahasa lencana untuk seluruh keadaan: pil rounded-full berisi
 * ikon h-4 w-4 dan teks, garis batas setipis rambut dalam warna keadaan
 * di atas permukaan bernada tipis dari warna yang sama. LENCANA TIDAK
 * PERNAH TERISI PENUH.
 *
 * Alasannya bukan selera: bila lencana boleh terisi penuh, ia bersaing
 * dengan tombol, dan pemakai kehilangan cara membedakan penanda dari
 * kontrol. Dengan aturan ini, satu-satunya elemen terisi penuh di layar
 * mana pun adalah tombol yang benar-benar dapat ditindak.
 *
 * Item OPEN TIDAK berlencana sama sekali — ketiadaan itu bermakna, dan
 * ditopang oleh afordansi tautan kartunya, bukan oleh warna.
 */
export function AccessBadge({ accessMode }: { accessMode: AccessMode }) {
  if (accessMode === "OPEN") return null;

  const isApproval = accessMode === "APPROVAL";
  const Icon = isApproval ? ShieldCheck : Lock;

  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-xs text-foreground">
      <Icon className="h-4 w-4" aria-hidden />
      {isApproval ? "Butuh persetujuan" : "Perlu masuk"}
    </span>
  );
}
