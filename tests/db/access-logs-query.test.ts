import { beforeEach, describe, expect, it, vi } from "vitest";

const findMany = vi.fn();
const count = vi.fn();
const findFirst = vi.fn();

vi.mock("@/lib/db/client", () => ({
  prisma: { accessLog: { findMany, count, findFirst } },
}));

const { hasDeletedItemLogs, historyWhere, listAccessLogs } = await import("@/lib/db/access-logs");

const DASAR = {
  groupId: "grp-1",
  item: null,
  dari: null,
  sampai: null,
  deniedOnly: false,
};

beforeEach(() => {
  findMany.mockReset().mockResolvedValue([]);
  count.mockReset().mockResolvedValue(0);
  findFirst.mockReset().mockResolvedValue(null);
});

describe("bentuk kueri riwayat", () => {
  it("tidak pernah menjoin ke tabel User", async () => {
    // Garis merah unit ini. Nama dan email HARUS datang dari kolom
    // salinan di barisnya sendiri, bukan dari keadaan pengguna hari ini.
    await listAccessLogs(DASAR, [], 0, 50);

    const args = findMany.mock.calls[0][0];
    expect(args).not.toHaveProperty("include");
    expect(Object.keys(args.select)).not.toContain("user");
    expect(Object.keys(args.select)).not.toContain("userId");
  });

  it("membaca visitorName dan visitorEmail dari barisnya", async () => {
    await listAccessLogs(DASAR, [], 0, 50);

    const { select } = findMany.mock.calls[0][0];
    expect(select.visitorName).toBe(true);
    expect(select.visitorEmail).toBe(true);
  });

  it("mengurutkan menurun dengan pengurut kedua id", async () => {
    // Tanpa pengurut kedua, baris ber-createdAt identik dapat muncul di
    // dua halaman sekaligus atau menghilang dari keduanya.
    await listAccessLogs(DASAR, [], 0, 50);

    expect(findMany.mock.calls[0][0].orderBy).toEqual([
      { createdAt: "desc" },
      { id: "desc" },
    ]);
  });

  it("meneruskan offset dan batas apa adanya", async () => {
    await listAccessLogs(DASAR, [], 100, 50);

    expect(findMany.mock.calls[0][0].skip).toBe(100);
    expect(findMany.mock.calls[0][0].take).toBe(50);
  });

  it("menghitung total dengan where yang sama persis", async () => {
    await listAccessLogs({ ...DASAR, deniedOnly: true }, [], 0, 50);

    expect(count.mock.calls[0][0].where).toEqual(findMany.mock.calls[0][0].where);
  });
});

describe("historyWhere", () => {
  it("selalu mengurung pada satu group", () => {
    expect(historyWhere(DASAR, []).groupId).toBe("grp-1");
  });

  it("menyaring satu item menurut pengenalnya", () => {
    expect(historyWhere({ ...DASAR, item: "item-1" }, ["item-1"]).itemId).toBe("item-1");
  });

  it("menyaring baris yang itemnya sudah tidak ada di group", () => {
    const where = historyWhere({ ...DASAR, item: "dihapus" }, ["item-1"]);
    expect(where.itemId).toEqual({ not: null, notIn: ["item-1"] });
  });

  it("mengubah rentang tanggal menjadi batas WIT, bukan batas UTC", () => {
    // 00:00 WIT tanggal 9 = 15:00 UTC tanggal 8. Batas tengah malam UTC
    // akan membuang sembilan jam pertama setiap hari.
    const where = historyWhere({ ...DASAR, dari: "2026-09-09", sampai: "2026-09-09" }, []);
    const range = where.createdAt as { gte: Date; lte: Date };
    expect(range.gte.toISOString()).toBe("2026-09-08T15:00:00.000Z");
    expect(range.lte.toISOString()).toBe("2026-09-09T14:59:59.999Z");
  });

  it("menerima rentang yang hanya berujung satu", () => {
    const hanyaDari = historyWhere({ ...DASAR, dari: "2026-09-09" }, []);
    expect(hanyaDari.createdAt).toEqual({ gte: new Date("2026-09-08T15:00:00.000Z") });

    const hanyaSampai = historyWhere({ ...DASAR, sampai: "2026-09-09" }, []);
    expect(hanyaSampai.createdAt).toEqual({ lte: new Date("2026-09-09T14:59:59.999Z") });
  });

  it("menyaring hanya baris yang ditolak", () => {
    expect(historyWhere({ ...DASAR, deniedOnly: true }, []).outcome).toBe("DENIED");
  });

  it("tidak menyebut outcome sama sekali ketika cip tidak dipakai", () => {
    expect(historyWhere(DASAR, [])).not.toHaveProperty("outcome");
  });
});

describe("hasDeletedItemLogs", () => {
  it("bertanya cukup satu baris, bukan menghitung seluruhnya", async () => {
    await hasDeletedItemLogs("grp-1", ["item-1"]);

    expect(findFirst).toHaveBeenCalledWith({
      where: { groupId: "grp-1", itemId: { not: null, notIn: ["item-1"] } },
      select: { id: true },
    });
  });

  it("benar ketika ada baris menunjuk item yang tidak ada lagi", async () => {
    findFirst.mockResolvedValue({ id: "log-9" });
    expect(await hasDeletedItemLogs("grp-1", ["item-1"])).toBe(true);
  });

  it("salah ketika seluruh baris menunjuk item yang masih ada", async () => {
    expect(await hasDeletedItemLogs("grp-1", ["item-1"])).toBe(false);
  });
});
