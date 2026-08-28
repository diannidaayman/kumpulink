import { evaluateItemAccess } from "@/lib/access/evaluate-access";
import { logItemAccess, type Visitor } from "@/lib/audit/log-access";
import { readRequestContext } from "@/lib/audit/request-context";
import { auth } from "@/lib/auth";
import { itemGateCallbackUrl } from "@/lib/auth/callback-url";
import { readGateData, readGroupIdBySlug } from "@/lib/db/gate";
import { logDenied } from "@/lib/gate/deny";
import { serveGrantedItem } from "@/lib/gate/serve-item";
import { ITEM_GATE_SCOPE, isOverLimit, rateLimitKey } from "@/lib/ratelimit/window";
import { readFailureCount, recordFailure } from "@/lib/ratelimit/counter";
import { gateParamsSchema } from "@/lib/validation/gate";

export const dynamic = "force-dynamic";

const UNAVAILABLE = "/tidak-tersedia";
const LOGGING_ERROR = "/galat-pencatatan";

function seeOther(location: string): Response {
  return new Response(null, { status: 303, headers: { Location: location } });
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

  // LANGKAH 0 — rate limit. Langkah ini tidak mengambil group, item,
  // maupun catatan izin, dan tidak membaca sesi; satu pencarian id
  // berindeks dilakukan semata supaya barisnya terjangkau riwayat per
  // group, karena baris yang tertulis tetapi tak terbaca sama saja
  // dengan baris yang hilang.
  const failures = await readFailureCount(ITEM_GATE_SCOPE, rateLimitKey(context.ipAddress), now);
  if (isOverLimit(failures)) {
    // Sesi sengaja belum dibaca karena membacanya adalah kueri database
    // dan langkah 0 berhenti sebelum menyentuh database lebih jauh.
    // Alamat IP adalah penanda yang relevan untuk penebak, yang hampir
    // selalu anonim.
    const anonymousVisitor: Visitor = {
      userId: null,
      visitorName: null,
      visitorEmail: null,
    };
    // Barisnya tetap dicatat: percobaan akses ke link yang sudah mati
    // pun terekam, dan pemilik berhak melihat bahwa seseorang sedang
    // menggedor. groupId diisi dari id sungguhan bila slug-nya
    // dikenal, dengan slug sendiri sebagai fallback untuk keadaan
    // group memang tidak ada — sejalan dengan cabang DENIED di bawah.
    const resolvedGroupId = await readGroupIdBySlug(slug);
    await logDenied({
      groupId: resolvedGroupId ?? slug,
      itemId,
      visitor: anonymousVisitor,
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

  const session = await auth();
  const visitor: Visitor = {
    userId: session?.user?.id ?? null,
    visitorName: session?.user?.name ?? null,
    visitorEmail: session?.user?.email ?? null,
  };

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
    await recordFailure(ITEM_GATE_SCOPE, rateLimitKey(context.ipAddress), now);
    return seeOther(UNAVAILABLE);
  }

  // GRANTED. Mulai dari sini item dan group dijamin ada: evaluator
  // menolak keduanya sebagai NOT_FOUND lebih dulu. Penyempitan tipe
  // berikut ada supaya compiler ikut membacanya.
  if (group === null || item === null) return seeOther(UNAVAILABLE);

  // Log ditunggu SAMPAI SELESAI sebelum satu byte pun mengalir dan
  // sebelum pengalihan disusun. Menjadikannya pekerjaan latar berarti
  // log hilang saat fungsi serverless berhenti setelah respons terkirim.
  // Kegagalannya MEMBATALKAN penerusan: meneruskan pengunjung tanpa
  // jejak lebih buruk daripada gagal membuka berkas — itu justru
  // menghapus alasan aplikasi ini dibuat.
  try {
    await logItemAccess({
      groupId: group.id,
      itemId: item.id,
      visitor,
      outcome: "GRANTED",
      context,
    });
  } catch (error) {
    console.error("Gagal mencatat akses item yang diloloskan:", error);
    return seeOther(LOGGING_ERROR);
  }

  // 302 untuk EXTERNAL, aliran byte untuk UPLOAD, atau penolakan bila
  // berkasnya ternyata tidak dapat dilayani — lihat lib/gate/serve-item.ts.
  return serveGrantedItem(group, item, visitor, context, now, UNAVAILABLE);
}
