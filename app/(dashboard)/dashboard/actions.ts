"use server";

import { revalidatePath } from "next/cache";

import { requireOwner } from "@/lib/auth/session";
import {
  applyGroupOrder,
  deleteGroupById,
  insertGroup,
  listAllSlugs,
  listGroupsForDashboard,
  updateGroupTitleAndSlug,
} from "@/lib/db/groups";
import { isUniqueConstraintError } from "@/lib/db/prisma-errors";
import { moveGroup, renumberGroups } from "@/lib/groups/order";
import { resolveSlug } from "@/lib/groups/resolve-slug";
import type { GroupActionState } from "@/lib/types/group-action";
import { groupFormSchema } from "@/lib/validation/group";

const DASHBOARD_PATH = "/dashboard";

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

  const id = String(formData.get("id") ?? "");
  const currentSlug = String(formData.get("currentSlug") ?? "");
  if (id.length === 0) {
    return { status: "error", error: { code: "NOT_FOUND", message: "Group tidak ditemukan." } };
  }

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
  const id = String(formData.get("id") ?? "");
  if (id.length === 0) return;

  await deleteGroupById(id);
  revalidatePath(DASHBOARD_PATH);
}

export async function moveGroupAction(formData: FormData): Promise<void> {
  await requireOwner();

  const id = String(formData.get("id") ?? "");
  const direction = formData.get("direction") === "up" ? "up" : "down";
  if (id.length === 0) return;

  const groups = await listGroupsForDashboard();
  await applyGroupOrder(renumberGroups(moveGroup(groups, id, direction)));
  revalidatePath(DASHBOARD_PATH);
}
