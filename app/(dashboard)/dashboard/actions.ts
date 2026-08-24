"use server";

import { revalidatePath } from "next/cache";

import { DASHBOARD_PATH, requireOwner } from "@/lib/auth/session";
import {
  deleteGroupById,
  getGroupSlugById,
  insertGroup,
  listAllSlugs,
  moveGroupInTransaction,
  updateGroupTitleAndSlug,
} from "@/lib/db/groups";
import { isRecordNotFoundError, isUniqueConstraintError } from "@/lib/db/prisma-errors";
import { resolveSlug } from "@/lib/groups/resolve-slug";
import type { GroupActionState } from "@/lib/types/group-action";
import {
  groupFormSchema,
  groupIdSchema,
  moveDirectionSchema,
} from "@/lib/validation/group";

function fieldError(
  field: "title" | "slug",
  message: string,
  suggestion?: string,
): GroupActionState {
  return {
    status: "error",
    error: { code: field === "title" ? "TITLE_INVALID" : "SLUG_INVALID", message },
    field,
    suggestion,
  };
}

const TAKEN_MESSAGE = (requested: string, suggestion: string) =>
  `Slug ${requested} sudah dipakai group lain. Coba ${suggestion}.`;

async function readForm(formData: FormData) {
  const parsed = groupFormSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
  });
  if (parsed.success) return { ok: true as const, data: parsed.data };

  const issue = parsed.error.issues[0];
  const field = issue.path[0] === "title" ? ("title" as const) : ("slug" as const);
  return { ok: false as const, state: fieldError(field, issue.message) };
}

export async function createGroupAction(
  _prev: GroupActionState,
  formData: FormData,
): Promise<GroupActionState> {
  // Layout TIDAK melindungi server action: badan aksi berjalan sebelum
  // layout dirender ulang. Setiap aksi memanggil gerbangnya sendiri.
  await requireOwner();

  const form = await readForm(formData);
  if (!form.ok) return form.state;

  const resolution = resolveSlug({
    title: form.data.title,
    requestedSlug: form.data.slug,
    takenSlugs: await listAllSlugs(),
  });

  if (resolution.status === "conflict") {
    return fieldError(
      "slug",
      TAKEN_MESSAGE(resolution.requested, resolution.suggestion),
      resolution.suggestion,
    );
  }

  try {
    await insertGroup({ title: form.data.title, slug: resolution.slug });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return fieldError("slug", TAKEN_MESSAGE(resolution.slug, `${resolution.slug}-2`), `${resolution.slug}-2`);
    }
    throw error;
  }

  revalidatePath(DASHBOARD_PATH);
  return { status: "ok" };
}

export async function updateGroupAction(
  _prev: GroupActionState,
  formData: FormData,
): Promise<GroupActionState> {
  await requireOwner();

  const NOT_FOUND_STATE: GroupActionState = {
    status: "error",
    error: { code: "NOT_FOUND", message: "Group tidak ditemukan." },
  };

  const idResult = groupIdSchema.safeParse(formData.get("id"));
  if (!idResult.success) return NOT_FOUND_STATE;
  const id = idResult.data;

  const currentSlug = await getGroupSlugById(id);
  if (currentSlug === null) return NOT_FOUND_STATE;

  const form = await readForm(formData);
  if (!form.ok) return form.state;

  const resolution = resolveSlug({
    title: form.data.title,
    requestedSlug: form.data.slug,
    takenSlugs: await listAllSlugs(),
    currentSlug,
  });

  if (resolution.status === "conflict") {
    return fieldError(
      "slug",
      TAKEN_MESSAGE(resolution.requested, resolution.suggestion),
      resolution.suggestion,
    );
  }

  try {
    await updateGroupTitleAndSlug({ id, title: form.data.title, slug: resolution.slug });
  } catch (error) {
    if (isRecordNotFoundError(error)) return NOT_FOUND_STATE;
    if (isUniqueConstraintError(error)) {
      return fieldError("slug", TAKEN_MESSAGE(resolution.slug, `${resolution.slug}-2`), `${resolution.slug}-2`);
    }
    throw error;
  }

  revalidatePath(DASHBOARD_PATH);
  return { status: "ok" };
}

export async function deleteGroupAction(formData: FormData): Promise<void> {
  await requireOwner();

  const idResult = groupIdSchema.safeParse(formData.get("id"));
  if (!idResult.success) return;

  try {
    await deleteGroupById(idResult.data);
  } catch (error) {
    // Group sudah terhapus (kirim-ganda dialog, atau dua tab terbuka):
    // no-op, bukan galat.
    if (isRecordNotFoundError(error)) return;
    throw error;
  }
  revalidatePath(DASHBOARD_PATH);
}

export async function moveGroupAction(formData: FormData): Promise<void> {
  await requireOwner();

  const idResult = groupIdSchema.safeParse(formData.get("id"));
  const directionResult = moveDirectionSchema.safeParse(formData.get("direction"));
  // Keadaan yang tidak dapat diuraikan berarti TOLAK, bukan jatuh ke
  // cabang permisif terakhir ("down") — batal diam-diam, tanpa menulis.
  if (!idResult.success || !directionResult.success) return;

  await moveGroupInTransaction(idResult.data, directionResult.data);
  revalidatePath(DASHBOARD_PATH);
}
