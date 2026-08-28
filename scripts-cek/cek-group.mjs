import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const rows = await prisma.group.findMany({
  where: { slug: { startsWith: "cek-u4-" } },
  select: {
    id: true,
    slug: true,
    title: true,
    visibility: true,
    shareEnabled: true,
    expiresAt: true,
    items: { select: { id: true, title: true, isActive: true, accessMode: true, source: true } },
  },
});

console.log(JSON.stringify(rows, null, 1));
console.log("SEKARANG:", new Date().toISOString());

await prisma.$disconnect();
