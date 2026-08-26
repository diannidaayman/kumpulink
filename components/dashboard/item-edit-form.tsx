"use client";

import { useActionState, useEffect, useId } from "react";

import { updateItemAction } from "@/app/(dashboard)/dashboard/item-actions";
import { ItemAccessModeField } from "@/components/dashboard/item-access-mode-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EMPTY_ITEM_ACTION_STATE, type ItemActionState } from "@/lib/types/item-action";
import type { ItemListEntry } from "@/lib/types/item";

/**
 * Menyunting metadata saja: judul, deskripsi, dan tingkat akses.
 *
 * Mengganti BERKAS berada di luar lingkup Unit 3 dan itu disengaja.
 * Jalur ganti-berkas memikul bobot yang sama dengan jalur buat —
 * multipart kedua, magic bytes lagi, dan urutan tukar-lalu-hapus-yang-
 * lama beserta kegagalannya sendiri — demi kasus yang jarang. Untuk
 * mengganti berkas, pemilik menghapus item lalu menambahkannya lagi.
 */
export function ItemEditForm({ item, onDone }: { item: ItemListEntry; onDone: () => void }) {
  const uid = useId();
  const [state, formAction, pending] = useActionState<ItemActionState, FormData>(
    updateItemAction,
    EMPTY_ITEM_ACTION_STATE,
  );

  useEffect(() => {
    if (state.status === "ok") onDone();
  }, [state.status, onDone]);

  const error = state.status === "error" ? state : null;

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <input type="hidden" name="id" value={item.id} />

      <div>
        <label className="block text-sm text-muted-foreground" htmlFor={`${uid}-title`}>
          Judul
        </label>
        <Input
          id={`${uid}-title`}
          name="title"
          defaultValue={item.title}
          autoFocus
          aria-invalid={error?.field === "title"}
        />
        {error?.field === "title" && (
          <p className="mt-1 text-sm text-state-error">{error.error.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm text-muted-foreground" htmlFor={`${uid}-desc`}>
          Deskripsi <span className="text-muted-foreground">(opsional)</span>
        </label>
        <Textarea id={`${uid}-desc`} name="description" rows={2} defaultValue={item.description ?? ""} />
        {error?.field === "description" && (
          <p className="mt-1 text-sm text-state-error">{error.error.message}</p>
        )}
      </div>

      <ItemAccessModeField id={`${uid}-mode`} defaultValue={item.accessMode} />

      {item.source === "UPLOAD" && (
        <p className="text-sm text-muted-foreground">
          Berkas tidak dapat diganti di sini. Hapus item ini lalu tambahkan lagi dengan berkas
          yang baru.
        </p>
      )}

      {error !== null && error.field === undefined && (
        <p className="text-sm text-state-error">{error.error.message}</p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          Simpan
        </Button>
        <Button type="button" variant="outline" onClick={onDone} disabled={pending}>
          Batal
        </Button>
      </div>
    </form>
  );
}
