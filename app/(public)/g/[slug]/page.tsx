import { notFound } from "next/navigation";

import { GroupHeader } from "@/components/public/group-header";
import { IdentityBar } from "@/components/public/identity-bar";
import { LoginScreen } from "@/components/public/login-screen";
import { OwnerPreviewBanner } from "@/components/public/owner-preview-banner";
import { PublicItemCard } from "@/components/public/item-card";
import { evaluateGroupAccess } from "@/lib/access/evaluate-access";
import { logPageView } from "@/lib/audit/log-access";
import { readRequestContext } from "@/lib/audit/request-context";
import { auth } from "@/lib/auth";
import { groupCallbackUrl } from "@/lib/auth/callback-url";
import { readPublicGroup } from "@/lib/db/public-group";
import { formatItemSummary, summarizeItems } from "@/lib/groups/item-summary";

export const dynamic = "force-dynamic";

export default async function PublicGroupPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();

  const group = await readPublicGroup(slug);
  const decision = evaluateGroupAccess(
    group,
    session?.user ? { userId: session.user.id, role: session.user.role } : null,
    new Date(),
  );

  if (decision.kind === "NEEDS_LOGIN") {
    // Judul group boleh disebut di sini: itu justru gunanya layar ini.
    return <LoginScreen groupTitle={group?.title ?? ""} callbackUrl={groupCallbackUrl(slug)} />;
  }

  // NOT_FOUND, REVOKED, dan EXPIRED menghasilkan halaman DAN kode status
  // yang identik. Dari luar, group yang dicabut tidak dapat dibedakan
  // dari slug yang tidak pernah ada. Perbedaannya hanya tercatat di log.
  if (decision.kind !== "GRANTED" || group === null) notFound();

  // PAGE_VIEW dicatat bila DAN HANYA BILA identitas diketahui — berlaku
  // sama untuk ketiga nilai visibility, termasuk ketika yang membuka
  // adalah pemilik. Kegagalannya MELEMPAR, dan lemparannya sengaja tidak
  // ditangkap: app/(public)/error.tsx merendernya sebagai halaman galat
  // pencatatan berstatus 500 (U4-7).
  if (session?.user) {
    await logPageView({
      groupId: group.id,
      visitor: {
        userId: session.user.id,
        visitorName: session.user.name ?? null,
        visitorEmail: session.user.email ?? null,
      },
      context: await readRequestContext(),
    });
  }

  return (
    <>
      {session?.user && (
        <IdentityBar
          name={session.user.name ?? null}
          email={session.user.email ?? null}
          callbackUrl={groupCallbackUrl(slug)}
        />
      )}
      {decision.ownerPreview && <OwnerPreviewBanner />}
      <GroupHeader
        title={group.title}
        slug={group.slug}
        description={group.description}
        summary={formatItemSummary(summarizeItems(group.items))}
      />
      <ul className="flex flex-col gap-3">
        {group.items.map((item) => (
          <li key={item.id}>
            <PublicItemCard item={item} slug={group.slug} />
          </li>
        ))}
      </ul>
    </>
  );
}
