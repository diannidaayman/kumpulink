/**
 * Berdiri di luar item-actions.ts secara SENGAJA, dengan alasan yang sama
 * seperti group-action.ts: berkas bertanda "use server" hanya boleh
 * mengekspor fungsi async, dan mengekspor konstanta dari sana
 * menggagalkan build.
 */
export type ItemActionState =
  | { status: "idle" }
  | { status: "ok" }
  | {
      status: "error";
      error: { code: string; message: string };
      field?: "title" | "description" | "targetUrl";
    };

export const EMPTY_ITEM_ACTION_STATE: ItemActionState = { status: "idle" };
