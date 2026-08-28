import "server-only";

import type { Visitor } from "@/lib/audit/log-access";
import type { RequestContext } from "@/lib/audit/request-context";
import type { GateGroup, GateItem } from "@/lib/db/gate";
import { denyBrokenItem } from "@/lib/gate/deny";
import { getFileStream } from "@/lib/storage/blob";
import { inlineContentDisposition } from "@/lib/storage/content-disposition";

/**
 * Menyusun respons terminal untuk item yang SUDAH dinyatakan GRANTED:
 * 302 untuk EXTERNAL, aliran byte untuk UPLOAD, atau penolakan bila
 * berkasnya ternyata tidak dapat dilayani. Dipisah dari route.ts supaya
 * berkas rute tetap di bawah ambang ±200 baris.
 *
 * Pemanggil MENJAMIN log GRANTED sudah selesai ditulis sebelum memanggil
 * fungsi ini — modul ini hanya menulis log DENIED, dan hanya bila
 * jalurnya berakhir menolak (EXTERNAL tanpa targetUrl, atau berkas
 * UPLOAD yang tidak ditemukan di Blob).
 */
export async function serveGrantedItem(
  group: GateGroup,
  item: GateItem,
  visitor: Visitor,
  context: RequestContext,
  now: Date,
  unavailablePath: string,
): Promise<Response> {
  if (item.source === "EXTERNAL") {
    if (item.targetUrl === null) {
      // Item EXTERNAL tanpa targetUrl tidak dapat ada: skema Zod
      // mewajibkannya. Cabangnya tetap ditulis dan MENOLAK, bukan
      // mengalihkan ke tempat kosong.
      //
      // Alasannya NOT_FOUND dan bukan FILE_MISSING: tidak ada berkas
      // yang terlibat, dan riwayat tidak boleh berbohong kepada pemilik.
      // `isBroken` tetap ditandai, karena itulah kolom yang memberi tahu
      // pemilik ada baris yang perlu ia perbaiki.
      await denyBrokenItem({
        groupId: group.id,
        itemId: item.id,
        visitor,
        denyReason: "NOT_FOUND",
        context,
        now,
      });
      return new Response(null, { status: 303, headers: { Location: unavailablePath } });
    }
    // 302, bukan 303: architecture.md menetapkan ini untuk EXTERNAL.
    return new Response(null, { status: 302, headers: { Location: item.targetUrl } });
  }

  // UPLOAD — berkas dialirkan melalui respons ini. Tidak ada URL Blob
  // yang pernah sampai ke peramban.
  //
  // getFileStream() TIDAK LAGI menangkap galat (Task 3): null berarti
  // berkasnya memang tidak ada, sedangkan lemparan berarti kegagalan
  // Blob yang sungguhan (Blob tumbang, token salah, rate limit). Kedua
  // keadaan itu ditangani berbeda di bawah — menyamakannya akan
  // menandai item pemilik rusak padahal berkasnya mungkin baik-baik saja.
  let stored;
  try {
    stored = item.fileKey === null ? null : await getFileStream(item.fileKey);
  } catch (error) {
    // Kegagalan sungguhan dari Blob. item.isBroken TIDAK ditandai dan
    // FILE_MISSING TIDAK dicatat: berkasnya mungkin baik-baik saja, dan
    // menandainya rusak akan merusak data pemilik serta menulis riwayat
    // yang berbohong. Log GRANTED sudah tertulis sebelum fungsi ini
    // dipanggil — itu diterima secara sadar, karena gerbang memang
    // meloloskan akses ini; byte-nya saja yang gagal sampai.
    console.error("Gagal mengambil berkas dari Blob:", error);
    return new Response("Berkas sedang tidak dapat diambil. Coba lagi beberapa saat lagi.\n", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  if (stored === null) {
    await denyBrokenItem({
      groupId: group.id,
      itemId: item.id,
      visitor,
      denyReason: "FILE_MISSING",
      context,
      now,
    });
    return new Response(null, { status: 303, headers: { Location: unavailablePath } });
  }

  return new Response(stored.stream, {
    status: 200,
    headers: {
      // mimeType diperiksa dari ISI berkas saat unggah. Tebakan SDK Blob
      // tidak dipakai: menebak dari ekstensi adalah persis yang dilarang
      // code-standards.md.
      "Content-Type": item.mimeType ?? stored.contentType ?? "application/octet-stream",
      "Content-Disposition": inlineContentDisposition(item.fileName),
      // Respons berkas privat tidak pernah masuk cache CDN.
      "Cache-Control": "private, no-cache",
      // Peramban tidak menebak tipe berkas di luar mimeType yang sudah
      // diperiksa dari isinya.
      "X-Content-Type-Options": "nosniff",
    },
  });
}
