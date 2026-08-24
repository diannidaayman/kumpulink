"use client";

import { useActionState, useEffect, useState } from "react";

import { createGroupAction, updateGroupAction } from "@/app/(dashboard)/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { normalizeSlugInput, slugify } from "@/lib/groups/slugify";
import { EMPTY_ACTION_STATE, type GroupActionState } from "@/lib/types/group-action";
import type { GroupListItem } from "@/lib/types/group";

export type GroupFormRowProps = {
  mode: "create" | "edit";
  group?: GroupListItem;
  onDone: () => void;
};

export function GroupFormRow({ mode, group, onDone }: GroupFormRowProps) {
  const action = mode === "create" ? createGroupAction : updateGroupAction;
  const [state, formAction, pending] = useActionState<GroupActionState, FormData>(
    action,
    EMPTY_ACTION_STATE,
  );

  const [title, setTitle] = useState(group?.title ?? "");
  const [slug, setSlug] = useState(group?.slug ?? "");
  // Kolom slug mengikuti judul SAMPAI disentuh. Setelah itu ia berhenti
  // mengikuti — pemilik sudah memilih dengan sadar.
  const [slugTouched, setSlugTouched] = useState(mode === "edit");

  // Di dalam efek, BUKAN di badan render. Memanggil onDone() saat render
  // mengubah keadaan komponen induk di tengah render anaknya — React
  // memperingatkannya, dan pada kasus terburuk ia berulang tak henti.
  useEffect(() => {
    if (state.status === "ok") onDone();
  }, [state.status, onDone]);

  const error = state.status === "error" ? state : null;
  const suggestion = error?.suggestion;

  return (
    <form action={formAction} className="rounded-xl border border-border bg-card p-4">
      {mode === "edit" && group && (
        <>
          <input type="hidden" name="id" value={group.id} />
          <input type="hidden" name="currentSlug" value={group.slug} />
        </>
      )}

      <label className="block text-sm text-muted-foreground" htmlFor="group-title">
        Judul
      </label>
      <Input
        id="group-title"
        name="title"
        value={title}
        autoFocus
        aria-invalid={error?.field === "title"}
        onChange={(event) => {
          setTitle(event.target.value);
          if (!slugTouched) setSlug(slugify(event.target.value));
        }}
      />
      {error?.field === "title" && (
        <p className="mt-1 text-sm text-state-error">{error.error.message}</p>
      )}

      <label className="mt-3 block text-sm text-muted-foreground" htmlFor="group-slug">
        Slug
      </label>
      <Input
        id="group-slug"
        name="slug"
        value={slug}
        className="font-mono"
        aria-invalid={error?.field === "slug"}
        onChange={(event) => {
          setSlugTouched(true);
          setSlug(normalizeSlugInput(event.target.value));
        }}
      />
      {error?.field === "slug" && (
        <p className="mt-1 text-sm text-state-error">
          {error.error.message}{" "}
          {suggestion && (
            <button type="button" className="underline" onClick={() => setSlug(suggestion)}>
              Pakai {suggestion}
            </button>
          )}
        </p>
      )}

      {/* Hanya muncul bila ada link hidup yang bisa mati. Peringatan yang
          muncul saat tidak ada akibatnya akan berhenti dibaca justru
          ketika akibatnya nyata. */}
      {mode === "edit" && group?.shareEnabled && slug !== group.slug && (
        <p className="mt-1 text-sm text-state-warning">
          Mengubah slug membuat link yang sudah disebarkan berhenti berfungsi.
        </p>
      )}

      <div className="mt-4 flex gap-2">
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
