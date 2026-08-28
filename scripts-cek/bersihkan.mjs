import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Menyapu SELURUH jejak data uji pemeriksaan peramban Unit 4.
// AccessLog sengaja disimpan tanpa relasi foreign key, jadi barisnya
// tidak ikut terhapus bersama group — ia dihapus di sini secara eksplisit
// berdasarkan groupId yang sempat dipakai.
const groups = await prisma.group.findMany({
  where: { slug: { startsWith: "cek-u4-" } },
  select: { id: true, slug: true },
});

const ids = groups.map((g) => g.id);

const logs = await prisma.accessLog.deleteMany({ where: { groupId: { in: ids } } });
// Baris RATE_LIMITED lama dapat memakai slug pada kolom groupId bila
// tertulis sebelum perbaikan review akhir; disapu juga.
const logsBySlug = await prisma.accessLog.deleteMany({
  where: { groupId: { in: groups.map((g) => g.slug) } },
});
const removed = await prisma.group.deleteMany({ where: { id: { in: ids } } });
const counters = await prisma.rateLimitCounter.deleteMany({});

console.log("group dihapus:", removed.count, groups.map((g) => g.slug).join(", "));
console.log("baris AccessLog dihapus:", logs.count + logsBySlug.count);
console.log("baris RateLimitCounter dihapus:", counters.count);
console.log("sisa group:", await prisma.group.count());

await prisma.$disconnect();
