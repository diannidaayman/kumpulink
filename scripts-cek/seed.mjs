import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Seluruh data uji berawalan cek-u4- supaya dapat disapu bersih.
await prisma.group.deleteMany({ where: { slug: { startsWith: "cek-u4-" } } });

const publik = await prisma.group.create({
  data: {
    title: "Rapat Kerja CEK U4",
    slug: "cek-u4-publik",
    description: "Group uji untuk pemeriksaan peramban Unit 4.",
    visibility: "PUBLIC",
    shareEnabled: true,
    sortOrder: 900,
  },
});

await prisma.item.createMany({
  data: [
    {
      groupId: publik.id,
      title: "Daftar Hadir",
      description: "Tautan absensi peserta.",
      type: "LINK",
      source: "EXTERNAL",
      // Sengaja mudah dicari di HTML: CEK 1 mencarinya dan harus nol.
      targetUrl: "https://contoh-tujuan-rahasia.example/absensi-open",
      accessMode: "OPEN",
      sortOrder: 0,
    },
    {
      groupId: publik.id,
      title: "Rundown Acara",
      description: "Susunan acara lengkap.",
      type: "PDF",
      source: "EXTERNAL",
      targetUrl: "https://contoh-tujuan-rahasia.example/rundown-identity",
      accessMode: "IDENTITY",
      sortOrder: 1,
    },
    {
      groupId: publik.id,
      title: "Notulen Rapat",
      description: "Berkas unggahan yang sengaja tidak ada di Blob.",
      type: "PDF",
      source: "UPLOAD",
      // Kunci yang tidak pernah ada di store — memicu jalur FILE_MISSING.
      fileKey: `groups/${publik.id}/tidak-pernah-ada-di-blob.pdf`,
      fileName: "notulen rapat (final)'.pdf",
      mimeType: "application/pdf",
      sizeBytes: 1024,
      accessMode: "OPEN",
      sortOrder: 2,
    },
  ],
});

await prisma.group.create({
  data: {
    title: "Group Dicabut CEK U4",
    slug: "cek-u4-dicabut",
    visibility: "PUBLIC",
    shareEnabled: false,
    sortOrder: 901,
  },
});

await prisma.group.create({
  data: {
    title: "Group Kedaluwarsa CEK U4",
    slug: "cek-u4-kedaluwarsa",
    visibility: "PUBLIC",
    shareEnabled: true,
    expiresAt: new Date("2020-01-01T00:00:00Z"),
    sortOrder: 902,
  },
});

await prisma.group.create({
  data: {
    title: "Group Wajib Masuk CEK U4",
    slug: "cek-u4-wajib-masuk",
    visibility: "REQUIRE_LOGIN",
    shareEnabled: true,
    sortOrder: 903,
  },
});

const items = await prisma.item.findMany({
  where: { groupId: publik.id },
  orderBy: { sortOrder: "asc" },
  select: { id: true, title: true, accessMode: true, source: true },
});

console.log("GROUP_PUBLIK_ID:", publik.id);
console.log("ITEMS:", JSON.stringify(items, null, 1));

await prisma.$disconnect();
