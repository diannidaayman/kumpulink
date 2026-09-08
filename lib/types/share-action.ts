/**
 * Berdiri di luar share-actions.ts secara SENGAJA. Berkas bertanda
 * "use server" hanya boleh mengekspor fungsi async — mengekspor konstanta
 * dari sana menggagalkan build, bukan sekadar melanggar gaya. Alasan yang
 * sama dengan lib/types/group-action.ts.
 */
export type ShareActionState =
  | { status: "idle" }
  | { status: "ok" }
  | { status: "error"; error: { code: string; message: string } };

export const EMPTY_SHARE_ACTION_STATE: ShareActionState = { status: "idle" };
