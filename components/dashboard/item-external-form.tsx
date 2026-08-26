"use client";

import { useActionState, useEffect, useId, useState } from "react";

import { createExternalItemAction } from "@/app/(dashboard)/dashboard/item-actions";
import { ItemAccessModeField } from "@/components/dashboard/item-access-mode-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EMPTY_ITEM_ACTION_STATE, type ItemActionState } from "@/lib/types/item-action";

export function ItemExternalForm({
  groupId,
  onDone,
}: {
  groupId: string;
  onDone: () => void;
}) {
  // Id unik per instans: dua panel dapat terbuka bersamaan di dua group,
  // dan id DOM yang sama membuat <label htmlFor> keduanya resolve ke
  // input yang pertama.
  const uid = useId();
  const [state, formAction, pending] = useActionState<ItemActionState, FormData>(
    createExternalItemAction,
    EMPTY_ITEM_ACTION_STATE,
  );
  const [type, setType] = useState("LINK");

  // Di dalam efek, BUKAN di badan render — memanggil onDone() saat render
  // mengubah keadaan induk di tengah render anaknya.
  useEffect(() => {
    if (state.status === "ok") onDone();
  }, [state.status, onDone]);

  const error = state.status === "error" ? state : null;

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="groupId" value={groupId} />

      <div>
        <label className="block text-sm text-muted-foreground" htmlFor={`${uid}-title`}>
          Judul
        </label>
        <Input id={`${uid}-title`} name="title" autoFocus aria-invalid={error?.field === "title"} />
        {error?.field === "title" && (
          <p className="mt-1 text-sm text-state-error">{error.error.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm text-muted-foreground" htmlFor={`${uid}-url`}>
          Tautan
        </label>
        <Input
          id={`${uid}-url`}
          name="targetUrl"
          className="font-mono"
          placeholder="https://"
          aria-invalid={error?.field === "targetUrl"}
        />
        {error?.field === "targetUrl" && (
          <p className="mt-1 text-sm text-state-error">{error.error.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm text-muted-foreground" htmlFor={`${uid}-desc`}>
          Deskripsi <span className="text-muted-foreground">(opsional)</span>
        </label>
        <Textarea id={`${uid}-desc`} name="description" rows={2} />
        {error?.field === "description" && (
          <p className="mt-1 text-sm text-state-error">{error.error.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label className="block text-sm text-muted-foreground" htmlFor={`${uid}-type`}>
            Tipe
          </label>
          {/* Untuk sumber EXTERNAL, tipe hanya menentukan IKON. Sumber
              UPLOAD tidak punya kontrol ini sama sekali: tipenya
              diturunkan dari isi berkas. */}
          <select
            id={`${uid}-type`}
            name="type"
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-base md:text-sm"
          >
            <option value="LINK">Tautan</option>
            <option value="PDF">PDF</option>
            <option value="IMAGE">Gambar</option>
          </select>
        </div>
        <div className="flex-1">
          <ItemAccessModeField id={`${uid}-mode`} />
        </div>
      </div>

      {error !== null && error.field === undefined && (
        <p className="text-sm text-state-error">{error.error.message}</p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          Tambah item
        </Button>
        <Button type="button" variant="outline" onClick={onDone} disabled={pending}>
          Batal
        </Button>
      </div>
    </form>
  );
}
