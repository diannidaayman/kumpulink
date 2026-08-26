import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { DASHBOARD_PATH, getOwnerSession } from "@/lib/auth/session";
import { groupExists } from "@/lib/db/groups";
import { insertItem } from "@/lib/db/items";
import { putFile, deleteFile } from "@/lib/storage/blob";
import { buildBlobPath } from "@/lib/storage/blob-path";
import { detectFileType, itemTypeFor } from "@/lib/storage/detect-file-type";
import { MAX_FILE_NAME_LENGTH, MAX_UPLOAD_BYTES } from "@/lib/storage/limits";
import { uploadItemFieldsSchema } from "@/lib/validation/item";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function failure(status: number, code: string, message: string): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status });
}

/**
 * Satu tanggung jawab: menambahkan SATU item bersumber UPLOAD ke sebuah
 * group. Berkas dan barisnya lahir dalam satu permintaan, atau tidak sama
 * sekali.
 *
 * Pola dua langkah — unggah dulu, lalu server action menautkan fileKey —
 * sengaja tidak dipakai: fileKey akan sampai ke klien, dan langkah kedua
 * akan mempercayai kepemilikan berkas yang dikirim dari klien. Keduanya
 * dilarang code-standards.md.
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ groupId: string }> },
): Promise<NextResponse> {
  if ((await getOwnerSession()) === null) {
    return failure(403, "FORBIDDEN", "Hanya pemilik yang dapat menambah item.");
  }

  // Penolakan MURAH lebih dulu. Header ini dikirim klien dan TIDAK
  // dipercaya sebagai penegakan — ia hanya menghemat pembacaan badan
  // permintaan yang sudah pasti ditolak. Penegakan yang mengikat ada di
  // pemeriksaan byteLength di bawah.
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > MAX_UPLOAD_BYTES) {
    return failure(413, "FILE_TOO_LARGE", "Ukuran berkas maksimal 4 MB.");
  }

  const { groupId } = await context.params;
  if (!(await groupExists(groupId))) {
    return failure(404, "NOT_FOUND", "Group tidak ditemukan.");
  }

  const formData = await request.formData();

  const fields = uploadItemFieldsSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    accessMode: formData.get("accessMode"),
  });
  if (!fields.success) {
    return failure(400, "INVALID_INPUT", fields.error.issues[0].message);
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return failure(400, "FILE_MISSING", "Pilih berkas yang akan diunggah.");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  // Penegakan yang MENGIKAT, atas ukuran sebenarnya.
  if (bytes.byteLength > MAX_UPLOAD_BYTES) {
    return failure(413, "FILE_TOO_LARGE", "Ukuran berkas maksimal 4 MB.");
  }

  // Dari ISI berkas. file.type dan ekstensi nama tidak pernah dibaca di
  // sepanjang berkas ini.
  const mimeType = detectFileType(bytes);
  if (mimeType === null) {
    return failure(
      415,
      "FILE_TYPE_REJECTED",
      "Hanya berkas PDF, PNG, JPEG, dan WebP yang diterima.",
    );
  }

  const fileKey = await putFile(buildBlobPath(groupId, mimeType), bytes, mimeType);

  try {
    await insertItem({
      groupId,
      title: fields.data.title,
      description: fields.data.description,
      type: itemTypeFor(mimeType),
      source: "UPLOAD",
      accessMode: fields.data.accessMode,
      fileKey,
      fileName: file.name.slice(0, MAX_FILE_NAME_LENGTH),
      mimeType,
      sizeBytes: bytes.byteLength,
    });
  } catch (error) {
    // Barisnya gagal lahir, jadi berkasnya tidak boleh hidup. Ini
    // satu-satunya tempat berkas dihapus SEBELUM barisnya — dan hanya
    // karena barisnya tidak pernah ada.
    //
    // Kegagalan penghapusan ditelan: yang penting adalah galat aslinya
    // sampai ke pemanggil, bukan galat pembersihan yang menutupinya.
    await deleteFile(fileKey).catch((cleanupError: unknown) => {
      console.error("Gagal menghapus berkas yatim setelah insert gagal", cleanupError);
    });
    throw error;
  }

  revalidatePath(DASHBOARD_PATH);
  // Respons sukses TIDAK memuat fileKey, dan tidak akan pernah.
  return NextResponse.json({ ok: true }, { status: 201 });
}
