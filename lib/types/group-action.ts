/**
 * Berdiri di luar actions.ts secara SENGAJA. Berkas bertanda "use server"
 * hanya boleh mengekspor fungsi async — mengekspor konstanta dari sana
 * menggagalkan build, bukan sekadar melanggar gaya.
 *
 * Bentuk galatnya mengikuti code-standards.md: { error: { code, message } }
 * dengan message berbahasa Indonesia dan aman ditampilkan apa adanya.
 */
export type GroupActionState =
  | { status: "idle" }
  | { status: "ok" }
  | {
      status: "error";
      error: { code: string; message: string };
      field?: "title" | "slug";
      suggestion?: string;
    };

export const EMPTY_ACTION_STATE: GroupActionState = { status: "idle" };
