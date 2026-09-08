"use client";

import { CalendarDays } from "lucide-react";
import { useActionState, useEffect, useId, useState } from "react";

import { updateShareSettingsAction } from "@/app/(dashboard)/dashboard/share-actions";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { endOfDayWIT, fromCalendarDate, toCalendarDate, witDateParts } from "@/lib/time/expiry";
import { formatDateWIT } from "@/lib/time/format";
import { EMPTY_SHARE_ACTION_STATE, type ShareActionState } from "@/lib/types/share-action";
import type { GroupListItem } from "@/lib/types/group";

const PILIHAN = [
  { value: "PRIVATE", label: "Privat", penjelas: "Hanya Anda. Berguna saat group masih disiapkan." },
  { value: "REQUIRE_LOGIN", label: "Wajib masuk", penjelas: "Penerima link harus masuk dengan Google lebih dulu." },
  { value: "PUBLIC", label: "Publik", penjelas: "Siapa pun yang memegang link dapat membuka halamannya." },
] as const;

export function ShareSettingsForm({ group }: { group: GroupListItem }) {
  const uid = useId();
  const [state, formAction, pending] = useActionState<ShareActionState, FormData>(
    updateShareSettingsAction,
    EMPTY_SHARE_ACTION_STATE,
  );

  const [visibility, setVisibility] = useState<string>(group.visibility);
  const [expiresOn, setExpiresOn] = useState(
    group.expiresAt === null ? "" : witDateParts(group.expiresAt),
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [tersimpan, setTersimpan] = useState(false);

  useEffect(() => {
    if (state.status !== "ok") return;
    setTersimpan(true);
    const timer = setTimeout(() => setTersimpan(false), 4000);
    return () => clearTimeout(timer);
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={group.id} />
      <input type="hidden" name="visibility" value={visibility} />
      <input type="hidden" name="expiresOn" value={expiresOn} />

      <fieldset>
        <legend className="text-sm font-medium">Tingkat akses</legend>
        <RadioGroup
          className="mt-2 gap-3"
          value={visibility}
          onValueChange={setVisibility}
        >
          {PILIHAN.map((pilihan) => (
            <div key={pilihan.value} className="flex items-start gap-3">
              <RadioGroupItem
                id={`${uid}-${pilihan.value}`}
                value={pilihan.value}
                className="mt-1"
              />
              <div className="min-w-0">
                <label htmlFor={`${uid}-${pilihan.value}`} className="text-sm">
                  {pilihan.label}
                </label>
                <p className="text-sm text-muted-foreground">{pilihan.penjelas}</p>
              </div>
            </div>
          ))}
        </RadioGroup>
      </fieldset>

      {!group.shareEnabled && (
        <p className="text-sm text-muted-foreground">
          Setelan ini belum berlaku selama link berbagi mati. Anda tetap dapat
          menyiapkannya dari sekarang.
        </p>
      )}

      <div>
        <span className="text-sm font-medium">Tanggal kedaluwarsa</span>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline" size="sm">
                <CalendarDays className="h-4 w-4" aria-hidden />
                {expiresOn === "" ? "Pilih tanggal" : "Ubah tanggal"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={expiresOn === "" ? undefined : toCalendarDate(expiresOn)}
                onSelect={(dipilih) => {
                  if (dipilih === undefined) return;
                  setExpiresOn(fromCalendarDate(dipilih));
                  setPickerOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
          {expiresOn !== "" && (
            <Button type="button" variant="outline" size="sm" onClick={() => setExpiresOn("")}>
              Tanpa batas waktu
            </Button>
          )}
        </div>
        <p className="mt-2 font-mono text-sm text-muted-foreground">
          {expiresOn === ""
            ? "Tanpa batas waktu"
            : // toCalendarDate() di atas sengaja memakai tengah hari LOKAL
              // untuk kalender; label ini harus mencerminkan instan yang
              // benar-benar TERSIMPAN, yaitu akhir hari WIT — endOfDayWIT(),
              // bukan toCalendarDate(). Di sisi barat UTC-3, tengah hari
              // lokal jatuh ke hari WIT berikutnya, sehingga memakai
              // toCalendarDate() di sini akan salah menampilkan tanggal.
              `Berlaku sampai akhir hari ${formatDateWIT(endOfDayWIT(expiresOn))}`}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Menyimpan…" : "Simpan"}
        </Button>
        {tersimpan && <span className="text-sm text-muted-foreground">Setelan disimpan.</span>}
        {state.status === "error" && (
          <span className="text-sm text-state-error">{state.error.message}</span>
        )}
      </div>
    </form>
  );
}
