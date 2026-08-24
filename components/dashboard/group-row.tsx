import type { GroupListItem } from "@/lib/types/group";
import { resolveGroupStatus } from "@/lib/groups/status";
import { formatDateWIT } from "@/lib/time/format";
import { GroupStatusBadge } from "@/components/dashboard/group-status-badge";

/**
 * Baris terlipat berketinggian TETAP: judul dipotong satu baris dan tidak
 * pernah membungkus. Daftar berbaris seragam dapat dipindai lewat posisi;
 * daftar bergerigi tidak. Judul utuh tetap tersedia di atribut title.
 *
 * Jumlah item ditulis sebagai angka mono redup, sengaja BUKAN lencana,
 * supaya tidak bersaing dengan garis status di kolom kanan.
 */
export function GroupRow({ group, now }: { group: GroupListItem; now: Date }) {
  const status = resolveGroupStatus(group, now);

  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <span className="min-w-0 flex-1 truncate text-base font-medium" title={group.title}>
        {group.title}
      </span>
      <span className="shrink-0 font-mono text-sm text-muted-foreground">
        {group.itemCount} item
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1">
        <GroupStatusBadge status={status} />
        {group.expiresAt !== null && (
          <span className="font-mono text-sm text-muted-foreground">
            {formatDateWIT(group.expiresAt)}
          </span>
        )}
      </span>
    </div>
  );
}
