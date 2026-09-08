import { NextResponse } from "next/server";
import QRCode from "qrcode";

import { getOwnerSession } from "@/lib/auth/session";
import { getGroupSlugById } from "@/lib/db/groups";
import { withPhysicalSize } from "@/lib/groups/qr-svg";
import { shareUrl } from "@/lib/groups/share-url";
import { groupIdSchema } from "@/lib/validation/group";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function failure(status: number, code: string, message: string): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status });
}

/**
 * Satu tanggung jawab: mengembalikan QR code satu group sebagai SVG.
 * Dipakai dua kali oleh panel Bagikan — sebagai pratinjau lewat <img>,
 * dan sebagai unduhan lewat <a download> dengan ?unduh=1. Keputusan U5-10.
 *
 * getOwnerSession(), bukan requireOwner(): pemanggilnya memuat gambar,
 * dan pengalihan yang diikuti diam-diam menghasilkan 200 berisi halaman
 * masuk alih-alih kegagalan yang terbaca.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ groupId: string }> },
): Promise<NextResponse> {
  if ((await getOwnerSession()) === null) {
    return failure(403, "FORBIDDEN", "Hanya pemilik yang dapat membuka QR code.");
  }

  const groupId = groupIdSchema.safeParse((await context.params).groupId);
  if (!groupId.success) {
    return failure(404, "NOT_FOUND", "Group tidak ditemukan.");
  }

  const slug = await getGroupSlugById(groupId.data);
  if (slug === null) {
    return failure(404, "NOT_FOUND", "Group tidak ditemukan.");
  }

  // margin 4 modul adalah quiet zone MINIMUM di spesifikasi QR, bukan
  // selera. Memangkasnya membuat sebagian pemindai gagal mengunci — dan
  // itu kegagalan yang muncul di tangan tamu, bukan di layar kita.
  const svg = withPhysicalSize(
    await QRCode.toString(shareUrl(slug), {
      type: "svg",
      errorCorrectionLevel: "M",
      margin: 4,
    }),
  );

  // Slug hanya memuat huruf kecil, angka, dan tanda hubung (SLUG_PATTERN),
  // jadi ia aman masuk header tanpa penyandian tambahan.
  const unduh = new URL(request.url).searchParams.get("unduh") === "1";

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Content-Disposition": unduh ? `attachment; filename="qr-${slug}.svg"` : "inline",
      // Slug dapat berubah, dan QR basi di layar akan disalin ke kertas.
      "Cache-Control": "no-store",
    },
  });
}
