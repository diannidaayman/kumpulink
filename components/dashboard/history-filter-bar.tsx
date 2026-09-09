"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { historyHref, isFiltering, type HistoryParams } from "@/lib/history/query-params";
import type { HistoryItemOption } from "@/lib/types/history";
import { cn } from "@/lib/utils";

const SEMUA_ITEM = "semua";

/**
 * Komponen ini tidak menyaring apa pun sendiri. Ia menyusun URL baru dan
 * mendorongnya; server yang mengueri. Itulah yang membuat alamat halaman
 * 3 dengan penyaring aktif dapat disalin, ditandai, dan dimuat ulang —
 * tuntutan "posisi baris harus stabil serta dapat dirujuk".
 *
 * Setiap perubahan penyaring MENGEMBALIKAN halaman ke 1. Tanpa itu
 * pemilik mendarat di halaman 7 dari hasil yang hanya punya 2 halaman.
 */
export function HistoryFilterBar({
  groupId,
  params,
  itemOptions,
}: {
  groupId: string;
  params: HistoryParams;
  itemOptions: HistoryItemOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const apply = (patch: Partial<HistoryParams>) => {
    startTransition(() => {
      router.replace(historyHref(groupId, { ...params, ...patch, page: 1 }));
    });
  };

  const filtering = isFiltering(params);

  return (
    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end">
      <label className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-sm text-muted-foreground">Item</span>
        <select
          value={params.item ?? SEMUA_ITEM}
          disabled={pending}
          onChange={(event) =>
            apply({ item: event.target.value === SEMUA_ITEM ? null : event.target.value })
          }
          className="h-9 rounded-md border border-border bg-card px-3 text-base"
        >
          <option value={SEMUA_ITEM}>Semua item</option>
          {itemOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-muted-foreground">Dari (WIT)</span>
        <Input
          type="date"
          value={params.dari ?? ""}
          disabled={pending}
          onChange={(event) => apply({ dari: event.target.value === "" ? null : event.target.value })}
          className="font-mono"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-muted-foreground">Sampai (WIT)</span>
        <Input
          type="date"
          value={params.sampai ?? ""}
          disabled={pending}
          onChange={(event) =>
            apply({ sampai: event.target.value === "" ? null : event.target.value })
          }
          className="font-mono"
        />
      </label>

      <div className="flex gap-2">
        <button
          type="button"
          aria-pressed={params.deniedOnly}
          disabled={pending}
          onClick={() => apply({ deniedOnly: !params.deniedOnly })}
          className={cn(
            "h-9 rounded-md border px-3 text-sm",
            params.deniedOnly
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border text-muted-foreground",
          )}
        >
          Hanya yang ditolak
        </button>
        {filtering && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() => apply({ item: null, dari: null, sampai: null, deniedOnly: false })}
          >
            Hapus penyaring
          </Button>
        )}
      </div>
    </div>
  );
}
