import { describe, expect, it } from "vitest";
import { resolveSlug } from "@/lib/groups/resolve-slug";

const FIXED_RANDOM = () => "k7m2q9x4rt3v";

describe("resolveSlug — slug turunan judul", () => {
  it("memakai slug turunan apa adanya bila belum dipakai", () => {
    const result = resolveSlug({
      title: "Rapat Kerja",
      requestedSlug: "rapat-kerja",
      takenSlugs: [],
    }, FIXED_RANDOM);
    expect(result).toEqual({ status: "ok", slug: "rapat-kerja" });
  });

  // Pemilik tidak pernah mengetik slug ini. Menghentikannya dengan galat
  // berarti menyalahkan orang atas sesuatu yang bukan pilihannya.
  it("memberi akhiran urut diam-diam saat bentrok", () => {
    const result = resolveSlug({
      title: "Rapat Kerja",
      requestedSlug: "rapat-kerja",
      takenSlugs: ["rapat-kerja"],
    }, FIXED_RANDOM);
    expect(result).toEqual({ status: "ok", slug: "rapat-kerja-2" });
  });

  it("melanjutkan akhiran sampai menemukan yang bebas", () => {
    const result = resolveSlug({
      title: "Rapat Kerja",
      requestedSlug: "rapat-kerja",
      takenSlugs: ["rapat-kerja", "rapat-kerja-2", "rapat-kerja-3"],
    }, FIXED_RANDOM);
    expect(result).toEqual({ status: "ok", slug: "rapat-kerja-4" });
  });

  it("jatuh ke slug acak setelah lima puluh akhiran habis", () => {
    const taken = ["rapat-kerja"];
    for (let n = 2; n <= 50; n += 1) taken.push(`rapat-kerja-${n}`);
    const result = resolveSlug({
      title: "Rapat Kerja",
      requestedSlug: "rapat-kerja",
      takenSlugs: taken,
    }, FIXED_RANDOM);
    expect(result).toEqual({ status: "ok", slug: "k7m2q9x4rt3v" });
  });

  it("memakai slug acak ketika judul tidak menyisakan huruf atau angka", () => {
    const result = resolveSlug({
      title: "\u{1F389}\u{1F389}",
      requestedSlug: "",
      takenSlugs: [],
    }, FIXED_RANDOM);
    expect(result).toEqual({ status: "ok", slug: "k7m2q9x4rt3v" });
  });

  // Judul dua huruf itu sah — "AI", "HR". Menolaknya karena slugnya
  // kurang dari tiga karakter berarti menghukum judul yang benar.
  it("menambah akhiran acak bila slug turunan lebih pendek dari batas minimum", () => {
    const result = resolveSlug({
      title: "AI",
      requestedSlug: "ai",
      takenSlugs: [],
    }, FIXED_RANDOM);
    expect(result).toEqual({ status: "ok", slug: "ai-k7m2" });
  });

  it("memangkas pangkal agar slug berakhiran tetap muat enam puluh karakter", () => {
    const base = "a".repeat(60);
    const result = resolveSlug({
      title: base,
      requestedSlug: base,
      takenSlugs: [base],
    }, FIXED_RANDOM);
    expect(result).toEqual({ status: "ok", slug: `${"a".repeat(58)}-2` });
  });
});

describe("resolveSlug — slug ketikan tangan", () => {
  // Slug yang berbeda dari turunan judul pasti diketik sendiri. Ia mungkin
  // sudah ditulis di undangan; mengubahnya diam-diam jauh lebih berbahaya
  // daripada menghentikannya di sini.
  it("menolak bentrok dan menyertakan usulan", () => {
    const result = resolveSlug({
      title: "Rapat Kerja",
      requestedSlug: "rakor",
      takenSlugs: ["rakor"],
    }, FIXED_RANDOM);
    expect(result).toEqual({ status: "conflict", requested: "rakor", suggestion: "rakor-2" });
  });

  it("mengusulkan akhiran bebas berikutnya", () => {
    const result = resolveSlug({
      title: "Rapat Kerja",
      requestedSlug: "rakor",
      takenSlugs: ["rakor", "rakor-2"],
    }, FIXED_RANDOM);
    expect(result).toEqual({ status: "conflict", requested: "rakor", suggestion: "rakor-3" });
  });

  it("menerima slug ketikan tangan yang belum dipakai", () => {
    const result = resolveSlug({
      title: "Rapat Kerja",
      requestedSlug: "rakor",
      takenSlugs: ["rapat-kerja"],
    }, FIXED_RANDOM);
    expect(result).toEqual({ status: "ok", slug: "rakor" });
  });
});

describe("resolveSlug — saat mengubah group yang sudah ada", () => {
  it("tidak menganggap slug milik group itu sendiri sebagai bentrok", () => {
    const result = resolveSlug({
      title: "Rapat Kerja",
      requestedSlug: "rakor",
      takenSlugs: ["rakor", "rapat-kerja"],
      currentSlug: "rakor",
    }, FIXED_RANDOM);
    expect(result).toEqual({ status: "ok", slug: "rakor" });
  });

  it("tetap menolak bentrok dengan group lain", () => {
    const result = resolveSlug({
      title: "Rapat Kerja",
      requestedSlug: "rapat-kerja",
      takenSlugs: ["rakor", "rapat-kerja"],
      currentSlug: "rakor",
    }, FIXED_RANDOM);
    expect(result).toEqual({
      status: "conflict",
      requested: "rapat-kerja",
      suggestion: "rapat-kerja-2",
    });
  });

  // Kontras dengan tes di atas: tanpa currentSlug (jalur buat baru), slug
  // turunan yang bentrok tetap diberi akhiran diam-diam. Ini membuktikan
  // cabang tolak-bentrok di atas tidak bocor ke jalur pembuatan group.
  it("jalur buat baru tidak terpengaruh — tetap diberi akhiran diam-diam", () => {
    const result = resolveSlug({
      title: "Rapat Kerja",
      requestedSlug: "rapat-kerja",
      takenSlugs: ["rapat-kerja"],
    }, FIXED_RANDOM);
    expect(result).toEqual({ status: "ok", slug: "rapat-kerja-2" });
  });

  // Menyimpan ubahan tanpa mengganti judul: derived sama dengan currentSlug
  // sendiri, dan takenSlugs memuat slug itu karena itu slug group ini
  // sendiri. Group tidak boleh dianggap bentrok dengan dirinya sendiri.
  it("menyimpan ubahan tanpa ganti judul tidak dianggap bentrok", () => {
    const result = resolveSlug({
      title: "Rapat Kerja",
      requestedSlug: "rapat-kerja",
      takenSlugs: ["rapat-kerja"],
      currentSlug: "rapat-kerja",
    }, FIXED_RANDOM);
    expect(result).toEqual({ status: "ok", slug: "rapat-kerja" });
  });

  it("jatuh ke slug acak setelah lima puluh akhiran habis di jalur ubah", () => {
    const taken = ["rapat-kerja"];
    for (let n = 2; n <= 50; n += 1) taken.push(`rapat-kerja-${n}`);
    const result = resolveSlug({
      title: "Rapat Kerja",
      requestedSlug: "rapat-kerja",
      takenSlugs: taken,
      currentSlug: "rakor",
    }, FIXED_RANDOM);
    expect(result).toEqual({
      status: "conflict",
      requested: "rapat-kerja",
      suggestion: "k7m2q9x4rt3v",
    });
  });
});
