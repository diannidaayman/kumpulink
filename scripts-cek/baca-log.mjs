import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const groups = await prisma.group.findMany({
  where: { slug: { startsWith: "cek-u4-" } },
  select: { id: true, slug: true },
});
const idBySlug = Object.fromEntries(groups.map((g) => [g.id, g.slug]));
const keys = [...groups.map((g) => g.id), ...groups.map((g) => g.slug)];

const logs = await prisma.accessLog.findMany({
  where: { groupId: { in: keys } },
  orderBy: { createdAt: "asc" },
  select: {
    eventType: true,
    groupId: true,
    itemId: true,
    outcome: true,
    denyReason: true,
    visitorName: true,
    visitorEmail: true,
    ipAddress: true,
    createdAt: true,
  },
});

console.log("JUMLAH BARIS:", logs.length);
for (const l of logs) {
  console.log(
    [
      l.createdAt.toISOString(),
      l.eventType,
      l.outcome,
      l.denyReason ?? "-",
      "group=" + (idBySlug[l.groupId] ?? "SLUG_MENTAH:" + l.groupId),
      "item=" + (l.itemId ?? "-"),
      "nama=" + (l.visitorName ?? "null"),
      "ip=" + (l.ipAddress ?? "null"),
    ].join("  "),
  );
}

const items = await prisma.item.findMany({
  where: { group: { slug: { startsWith: "cek-u4-" } } },
  select: { id: true, title: true, isBroken: true, source: true, accessMode: true },
  orderBy: { sortOrder: "asc" },
});
console.log("\nITEM:", JSON.stringify(items, null, 1));

console.log(
  "\nPENGHITUNG:",
  JSON.stringify(
    await prisma.rateLimitCounter.findMany({
      select: { scope: true, ipAddress: true, windowStart: true, count: true },
    }),
    null,
    1,
  ),
);

await prisma.$disconnect();
