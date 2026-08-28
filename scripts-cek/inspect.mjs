import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const groups = await prisma.group.findMany({
  select: {
    id: true,
    slug: true,
    title: true,
    visibility: true,
    shareEnabled: true,
    expiresAt: true,
    _count: { select: { items: true } },
  },
});

console.log("GROUPS:", JSON.stringify(groups, null, 1));
console.log("ITEMS:", await prisma.item.count());
console.log("LOGS:", await prisma.accessLog.count());
console.log("COUNTERS:", await prisma.rateLimitCounter.count());

await prisma.$disconnect();
