"use client";

import { useId, useOptimistic, useTransition } from "react";

import { toggleShareAction } from "@/app/(dashboard)/dashboard/share-actions";
import { Switch } from "@/components/ui/switch";

/**
 * Menyimpan pada detik digeser, tanpa tombol dan tanpa dialog konfirmasi.
 * Keputusan U5-7: mencabut link adalah tindakan darurat, dan ia dapat
 * dibatalkan dengan menggeser balik.
 *
 * useOptimistic supaya saklar bergerak sebelum server menjawab. Tanpa itu
 * saklar terasa macet selama satu perjalanan bolak-balik, dan pemilik
 * yang sedang panik akan menggesernya dua kali.
 */
export function ShareEnabledSwitch({
  groupId,
  shareEnabled,
}: {
  groupId: string;
  shareEnabled: boolean;
}) {
  const id = useId();
  const [optimistic, setOptimistic] = useOptimistic(shareEnabled);
  const [, startTransition] = useTransition();

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <label htmlFor={id} className="text-sm font-medium">
          Link berbagi aktif
        </label>
        <p className="mt-1 text-sm text-muted-foreground">
          Mematikannya mencabut link seketika. Hanya Anda yang masih dapat membuka
          halamannya.
        </p>
      </div>
      <Switch
        id={id}
        checked={optimistic}
        onCheckedChange={(next) => {
          startTransition(async () => {
            setOptimistic(next);
            const formData = new FormData();
            formData.set("id", groupId);
            formData.set("enabled", next ? "true" : "false");
            await toggleShareAction(formData);
          });
        }}
      />
    </div>
  );
}
