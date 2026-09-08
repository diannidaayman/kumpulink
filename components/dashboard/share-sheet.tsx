"use client";

import { ShareEnabledSwitch } from "@/components/dashboard/share-enabled-switch";
import { ShareSettingsForm } from "@/components/dashboard/share-settings-form";
import { useSheetSide } from "@/components/dashboard/use-sheet-side";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { GroupListItem } from "@/lib/types/group";

/**
 * Urutan isinya adalah bagian dari aturannya, bukan selera tata letak:
 * saklar lebih dulu karena ia satu-satunya kontrol yang berlaku seketika,
 * lalu setelan yang menunggu tombol Simpan, lalu hasil yang disebarkan.
 */
export function ShareSheet({
  group,
  open,
  onOpenChange,
}: {
  group: GroupListItem;
  open: boolean;
  onOpenChange: (next: boolean) => void;
}) {
  const side = useSheetSide();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={side} className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Bagikan {group.title}</SheetTitle>
          <SheetDescription>
            Atur siapa yang dapat membuka group ini dan sampai kapan.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-6 px-4 pb-8">
          <ShareEnabledSwitch groupId={group.id} shareEnabled={group.shareEnabled} />
          <ShareSettingsForm group={group} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
