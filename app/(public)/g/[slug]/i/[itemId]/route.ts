import type { DenyReason } from "@prisma/client";

import { evaluateItemAccess } from "@/lib/access/evaluate-access";
import { logItemAccess } from "@/lib/audit/log-access";
import { readRequestContext, type RequestContext } from "@/lib/audit/request-context";
import type { Visitor } from "@/lib/audit/log-access";
import { auth } from "@/lib/auth";
import { itemGateCallbackUrl } from "@/lib/auth/callback-url";
import { readGateData } from "@/lib/db/gate";
import { ITEM_GATE_SCOPE, isOverLimit } from "@/lib/ratelimit/window";
import { readFailureCount, recordFailure } from "@/lib/ratelimit/counter";
import { gateParamsSchema } from "@/lib/validation/gate";

export const dynamic = "force-dynamic";

const UNAVAILABLE = "/tidak-tersedia";

function seeOther(location: string): Response {
  return new Response(null, { status: 303, headers: { Location: location } });
}

/**
 * Kegagalan menulis log pada PENOLAKAN dicatat ke konsol lalu ditelan:
 * pengunjung yang ditolak tidak sedang menerima apa pun, jadi tidak ada
 * yang perlu dibatalkan (U4-7). Kegagalan pada GRANTED ditangani di
 * cabangnya sendiri dan MEMBATALKAN penerusan.
 */
async function logDenied(input: {
  groupId: string;
  itemId: string;
  visitor: Visitor;
  denyReason: DenyReason;
  context: RequestContext;
}): Promise<void> {
  try {
    await logItemAccess({ ...input, outcome: "DENIED" });
  } catch (error) {
    console.error("Gagal mencatat penolakan akses item:", error);
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; itemId: string }> },
) {
  const parsed = gateParamsSchema.safeParse(await params);
  if (!parsed.success) return seeOther(UNAVAILABLE);
  const { slug, itemId } = parsed.data;

  const now = new Date();
  const context = await readRequestContext();
  const session = await auth();
  const visitor: Visitor = {
    userId: session?.user?.id ?? null,
    visitorName: session?.user?.name ?? null,
    visitorEmail: session?.user?.email ?? null,
  };

  // LANGKAH 0 — rate limit, sebelum menyentuh database lebih jauh.
  if (context.ipAddress !== null) {
    const failures = await readFailureCount(ITEM_GATE_SCOPE, context.ipAddress, now);
    if (isOverLimit(failures)) {
      // Barisnya tetap dicatat: percobaan akses ke link yang sudah mati
      // pun terekam, dan pemilik berhak melihat bahwa seseorang sedang
      // menggedor. groupId dan itemId diisi apa adanya dari URL tanpa
      // kueri, karena langkah ini tidak boleh menyentuh database lagi.
      await logDenied({
        groupId: slug,
        itemId,
        visitor,
        denyReason: "RATE_LIMITED",
        context,
      });
      // Penghitung TIDAK dinaikkan di sini: menghukum klien yang sudah
      // dihentikan hanya membuat jendela sepuluh menitnya tidak pernah
      // berakhir (U4-5).
      return new Response(
        "Terlalu banyak permintaan dari alamat ini. Coba lagi beberapa menit lagi.\n",
        { status: 429, headers: { "Content-Type": "text/plain; charset=utf-8" } },
      );
    }
  }

  const { group, item, request } = await readGateData(slug, itemId, visitor.userId);

  const decision = evaluateItemAccess(
    group,
    item,
    session?.user ? { userId: session.user.id, role: session.user.role } : null,
    request,
    now,
  );

  if (decision.kind === "NEEDS_LOGIN") {
    // Tidak dicatat: belum ada akses yang terjadi, dan meminta pengunjung
    // masuk bukan penolakan.
    return seeOther(`${itemGateCallbackUrl(slug, itemId)}/masuk`);
  }

  if (decision.kind === "NEEDS_REQUEST" || decision.kind === "PENDING_APPROVAL") {
    // TIDAK TERJANGKAU sepanjang Unit 4: cabang APPROVAL evaluator masih
    // menolak, dan accessMode itu belum dapat dipilih di CMS. Ditulis
    // eksplisit supaya keadaan yang belum dibangun MENOLAK alih-alih
    // lolos ke cabang terakhir. Unit 7 menggantinya dengan halaman
    // pengajuan dan halaman menunggu; keduanya tetap tidak dicatat.
    return seeOther(UNAVAILABLE);
  }

  if (decision.kind === "DENIED") {
    // group bisa null di sini — itu justru salah satu sebab penolakan.
    // groupId diisi slug apa adanya supaya barisnya tetap dapat dibaca
    // pemilik, sejalan dengan AccessLog yang memang tanpa foreign key.
    await logDenied({
      groupId: group?.id ?? slug,
      itemId,
      visitor,
      denyReason: decision.reason,
      context,
    });
    if (context.ipAddress !== null) {
      await recordFailure(ITEM_GATE_SCOPE, context.ipAddress, now);
    }
    return seeOther(UNAVAILABLE);
  }

  // GRANTED ditangani di Task 9. Sampai saat itu, sikap bawaannya
  // MENOLAK — bukan lolos.
  return seeOther(UNAVAILABLE);
}
