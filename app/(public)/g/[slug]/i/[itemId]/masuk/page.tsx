import { redirect } from "next/navigation";

import { LoginScreen } from "@/components/public/login-screen";
import { evaluateItemAccess } from "@/lib/access/evaluate-access";
import { auth } from "@/lib/auth";
import { itemGateCallbackUrl } from "@/lib/auth/callback-url";
import { readGateData } from "@/lib/db/gate";

export const dynamic = "force-dynamic";

/**
 * Halaman ini MENGEVALUASI ULANG untuk melindungi dirinya sendiri: ia
 * menyebut nama item, dan nama itu hanya boleh disebut kepada seseorang
 * yang keputusannya memang NEEDS_LOGIN. Keputusan lain dialihkan kembali
 * ke gerbang, yang akan menanganinya beserta pencatatannya.
 *
 * Ia TIDAK menulis AccessLog. Tidak ada konten yang disajikan di sini,
 * dan gerbanglah satu-satunya yang mencatat.
 */
export default async function MasukGerbangPage({
  params,
}: {
  params: Promise<{ slug: string; itemId: string }>;
}) {
  const { slug, itemId } = await params;
  const gateUrl = itemGateCallbackUrl(slug, itemId);

  const session = await auth();
  const { group, item, request } = await readGateData(slug, itemId, session?.user?.id ?? null);

  const decision = evaluateItemAccess(
    group,
    item,
    session?.user ? { userId: session.user.id, role: session.user.role } : null,
    request,
    new Date(),
  );

  if (decision.kind !== "NEEDS_LOGIN" || group === null || item === null) {
    redirect(gateUrl);
  }

  return <LoginScreen groupTitle={group.title} itemTitle={item.title} callbackUrl={gateUrl} />;
}
