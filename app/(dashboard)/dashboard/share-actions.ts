"use server";

import { revalidatePath } from "next/cache";

import { DASHBOARD_PATH, requireOwner } from "@/lib/auth/session";
import { setShareEnabled, updateGroupSharing } from "@/lib/db/groups";
import { endOfDayWIT } from "@/lib/time/expiry";
import type { ShareActionState } from "@/lib/types/share-action";
import { groupIdSchema } from "@/lib/validation/group";
import { shareEnabledSchema, shareSettingsSchema } from "@/lib/validation/share";

/**
 * Menyimpan pada detik saklar digeser, tanpa tombol simpan. Keputusan
 * U5-7: lingkup unit ini berbunyi mencabut link SEKETIKA, dan tombol di
 * antara saklar dan akibatnya membatalkan kata itu.
 *
 * Layout TIDAK melindungi server action: badan aksi berjalan sebelum
 * layout dirender ulang. Setiap aksi memanggil gerbangnya sendiri.
 */
export async function toggleShareAction(formData: FormData): Promise<void> {
  await requireOwner();

  const id = groupIdSchema.safeParse(formData.get("id"));
  const enabled = shareEnabledSchema.safeParse(formData.get("enabled"));
  // Keadaan yang tidak dapat diuraikan berarti TOLAK — batal diam-diam,
  // tanpa menulis. Pola yang sama dengan moveGroupAction.
  if (!id.success || !enabled.success) return;

  await setShareEnabled(id.data, enabled.data);
  revalidatePath(DASHBOARD_PATH);
}

export async function updateShareSettingsAction(
  _prev: ShareActionState,
  formData: FormData,
): Promise<ShareActionState> {
  await requireOwner();

  const id = groupIdSchema.safeParse(formData.get("id"));
  if (!id.success) {
    return { status: "error", error: { code: "NOT_FOUND", message: "Group tidak ditemukan." } };
  }

  const parsed = shareSettingsSchema.safeParse({
    visibility: formData.get("visibility"),
    expiresOn: formData.get("expiresOn") ?? "",
  });
  if (!parsed.success) {
    return {
      status: "error",
      error: { code: "INVALID_INPUT", message: parsed.error.issues[0].message },
    };
  }

  await updateGroupSharing({
    id: id.data,
    visibility: parsed.data.visibility,
    expiresAt: parsed.data.expiresOn === "" ? null : endOfDayWIT(parsed.data.expiresOn),
  });
  revalidatePath(DASHBOARD_PATH);

  return { status: "ok" };
}
