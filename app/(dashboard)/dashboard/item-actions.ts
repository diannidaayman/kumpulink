"use server";

import { revalidatePath } from "next/cache";

import { DASHBOARD_PATH, requireOwner } from "@/lib/auth/session";
import { groupExists } from "@/lib/db/groups";
import {
  deleteItemReturningFileKey,
  insertItem,
  reorderItemsInTransaction,
  setItemActive,
  updateItemMetadata,
} from "@/lib/db/items";
import { isRecordNotFoundError } from "@/lib/db/prisma-errors";
import { deleteFile } from "@/lib/storage/blob";
import type { ItemActionState } from "@/lib/types/item-action";
import {
  externalItemFormSchema,
  itemActiveSchema,
  itemIdSchema,
  itemMetadataFormSchema,
  reorderItemsSchema,
} from "@/lib/validation/item";

const NOT_FOUND_STATE: ItemActionState = {
  status: "error",
  error: { code: "NOT_FOUND", message: "Item tidak ditemukan." },
};

/**
 * Memetakan issue pertama Zod ke medan yang tepat, sehingga pesannya
 * muncul di bawah kolom yang salah dan bukan sebagai spanduk umum.
 */
function toFieldError(path: PropertyKey | undefined, message: string): ItemActionState {
  const field =
    path === "title" || path === "description" || path === "targetUrl" ? path : undefined;
  return { status: "error", error: { code: "INVALID_INPUT", message }, field };
}

/**
 * Menghapus berkas SESUDAH barisnya hilang, dan menelan kegagalannya.
 *
 * Bentuknya sama dengan aturan email di code-standards.md, dan alasannya
 * sama: langkah kedua tidak lagi memikul keamanan. Berkas yatim bukan
 * lubang kontrol akses — setiap jalur menuju konten berangkat dari baris
 * Item, jadi tanpa baris tidak ada fileKey, tidak ada gerbang, tidak ada
 * rute. Ia sampah penyimpanan, dan sampah itu masih dapat disapu
 * belakangan lewat awalan group-nya.
 */
async function discardFile(fileKey: string | null): Promise<void> {
  if (fileKey === null) return;
  try {
    await deleteFile(fileKey);
  } catch (error) {
    console.error("Gagal menghapus berkas di object storage", { fileKey, error });
  }
}

export async function createExternalItemAction(
  _prev: ItemActionState,
  formData: FormData,
): Promise<ItemActionState> {
  // Layout TIDAK melindungi server action: badan aksi berjalan sebelum
  // layout dirender ulang. Setiap aksi memanggil gerbangnya sendiri.
  await requireOwner();

  const groupIdResult = itemIdSchema.safeParse(formData.get("groupId"));
  if (!groupIdResult.success) return NOT_FOUND_STATE;
  if (!(await groupExists(groupIdResult.data))) return NOT_FOUND_STATE;

  const parsed = externalItemFormSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    targetUrl: formData.get("targetUrl"),
    type: formData.get("type"),
    accessMode: formData.get("accessMode"),
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return toFieldError(issue.path[0], issue.message);
  }

  await insertItem({
    groupId: groupIdResult.data,
    title: parsed.data.title,
    description: parsed.data.description,
    type: parsed.data.type,
    source: "EXTERNAL",
    accessMode: parsed.data.accessMode,
    targetUrl: parsed.data.targetUrl,
  });

  revalidatePath(DASHBOARD_PATH);
  return { status: "ok" };
}

export async function updateItemAction(
  _prev: ItemActionState,
  formData: FormData,
): Promise<ItemActionState> {
  await requireOwner();

  const parsed = itemMetadataFormSchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    accessMode: formData.get("accessMode"),
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    if (issue.path[0] === "id") return NOT_FOUND_STATE;
    return toFieldError(issue.path[0], issue.message);
  }

  try {
    await updateItemMetadata(parsed.data);
  } catch (error) {
    if (isRecordNotFoundError(error)) return NOT_FOUND_STATE;
    throw error;
  }

  revalidatePath(DASHBOARD_PATH);
  return { status: "ok" };
}

export async function setItemActiveAction(formData: FormData): Promise<void> {
  await requireOwner();

  const idResult = itemIdSchema.safeParse(formData.get("id"));
  const activeResult = itemActiveSchema.safeParse(formData.get("isActive"));
  // Keadaan yang tidak dapat diuraikan berarti BATAL, bukan jatuh ke
  // cabang permisif terakhir. Menonaktifkan item adalah satu-satunya
  // saklar keamanan di unit ini, dan menebak arahnya berarti kadang
  // menyalakan kembali item yang sengaja dimatikan pemilik.
  if (!idResult.success || !activeResult.success) return;

  try {
    await setItemActive(idResult.data, activeResult.data);
  } catch (error) {
    if (isRecordNotFoundError(error)) return;
    throw error;
  }

  revalidatePath(DASHBOARD_PATH);
}

export async function deleteItemAction(formData: FormData): Promise<void> {
  await requireOwner();

  const idResult = itemIdSchema.safeParse(formData.get("id"));
  if (!idResult.success) return;

  const fileKey = await deleteItemReturningFileKey(idResult.data);
  await discardFile(fileKey);

  revalidatePath(DASHBOARD_PATH);
}

/**
 * Menerima urutan lengkap, bukan satu pemindahan, sehingga geser dan
 * tombol naik/turun memakai jalur yang sama. Argumen bertipe alih-alih
 * FormData karena yang diseberangkan memang sebuah larik, dan
 * memaksanya menjadi string yang dipisah koma hanya menambah satu
 * penguraian yang bisa salah.
 */
export async function reorderItemsAction(
  groupId: string,
  orderedIds: string[],
): Promise<void> {
  await requireOwner();

  const parsed = reorderItemsSchema.safeParse({ groupId, orderedIds });
  if (!parsed.success) return;

  await reorderItemsInTransaction(parsed.data.groupId, parsed.data.orderedIds);
  revalidatePath(DASHBOARD_PATH);
}
