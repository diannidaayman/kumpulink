import { describe, expect, it } from "vitest";
import { filterGroups } from "@/lib/groups/filter";
import type { GroupListItem } from "@/lib/types/group";

const NOW = new Date("2026-08-21T00:00:00Z");

function group(overrides: Partial<GroupListItem> & { id: string; title: string }): GroupListItem {
  return {
    slug: overrides.id,
    sortOrder: 0,
    itemCount: 0,
    shareEnabled: true,
    expiresAt: null,
    visibility: "PRIVATE",
    ...overrides,
  };
}

const UNSHARED = group({ id: "a", title: "Rapat Kerja", shareEnabled: false });
const EXPIRED = group({
  id: "b",
  title: "Arsip Lama",
  expiresAt: new Date("2026-08-20T00:00:00Z"),
});
const PRIVATE = group({ id: "c", title: "Dokumen Privat", visibility: "PRIVATE" });
const REQUIRE_LOGIN = group({ id: "d", title: "Butuh Login", visibility: "REQUIRE_LOGIN" });
const PUBLIC = group({ id: "e", title: "Terbuka Untuk Semua", visibility: "PUBLIC" });

const ALL_STATUSES = [UNSHARED, EXPIRED, PRIVATE, REQUIRE_LOGIN, PUBLIC];

describe("filterGroups — segmen", () => {
  it.each([
    ["UNSHARED", UNSHARED, "active", true],
    ["EXPIRED", EXPIRED, "active", false],
    ["PRIVATE", PRIVATE, "active", true],
    ["REQUIRE_LOGIN", REQUIRE_LOGIN, "active", true],
    ["PUBLIC", PUBLIC, "active", true],
    ["UNSHARED", UNSHARED, "inactive", false],
    ["EXPIRED", EXPIRED, "inactive", true],
    ["PRIVATE", PRIVATE, "inactive", false],
    ["REQUIRE_LOGIN", REQUIRE_LOGIN, "inactive", false],
    ["PUBLIC", PUBLIC, "inactive", false],
    ["UNSHARED", UNSHARED, "all", true],
    ["EXPIRED", EXPIRED, "all", true],
    ["PRIVATE", PRIVATE, "all", true],
    ["REQUIRE_LOGIN", REQUIRE_LOGIN, "all", true],
    ["PUBLIC", PUBLIC, "all", true],
  ] as const)("status %s pada segmen %s -> tampil=%s", (_label, item, segment, expected) => {
    const visible = filterGroups([item], { query: "", segment }, NOW);
    expect(visible.length === 1).toBe(expected);
  });
});

describe("filterGroups — pencarian judul", () => {
  it("query kosong menampilkan semua group pada segmen", () => {
    const visible = filterGroups(ALL_STATUSES, { query: "", segment: "all" }, NOW);
    expect(visible).toHaveLength(5);
  });

  it("query spasi saja diperlakukan sama seperti kosong", () => {
    const visible = filterGroups(ALL_STATUSES, { query: "   ", segment: "all" }, NOW);
    expect(visible).toHaveLength(5);
  });

  it("pencarian tidak peka besar-kecil huruf", () => {
    const visible = filterGroups(ALL_STATUSES, { query: "RAPAT", segment: "all" }, NOW);
    expect(visible.map((g) => g.id)).toEqual(["a"]);
  });

  it("mencocokkan sebagian judul", () => {
    const visible = filterGroups(ALL_STATUSES, { query: "priv", segment: "all" }, NOW);
    expect(visible.map((g) => g.id)).toEqual(["c"]);
  });

  it("query yang tidak cocok apa pun mengembalikan larik kosong", () => {
    const visible = filterGroups(ALL_STATUSES, { query: "tidak-ada-yang-cocok", segment: "all" }, NOW);
    expect(visible).toEqual([]);
  });

  it("query dan segmen digabung: hanya group aktif yang judulnya cocok", () => {
    const visible = filterGroups(ALL_STATUSES, { query: "a", segment: "active" }, NOW);
    expect(visible.map((g) => g.id).sort()).toEqual(["a", "c", "e"]);
  });
});

describe("filterGroups — imutabilitas", () => {
  it("tidak mengubah larik masukan", () => {
    const input = [...ALL_STATUSES];
    const snapshot = [...input];
    filterGroups(input, { query: "a", segment: "all" }, NOW);
    expect(input).toEqual(snapshot);
  });
});
