import { describe, expect, it } from "vitest";
import { evaluateGroupAccess } from "@/lib/access/evaluate-access";
import type { AccessGroup, AccessSession } from "@/lib/types/access";

const NOW = new Date("2026-08-27T10:00:00Z");
const KEMARIN = new Date("2026-08-26T10:00:00Z");
const BESOK = new Date("2026-08-28T10:00:00Z");

/** Group yang sehat: dibagikan, tidak kedaluwarsa, publik. */
const groupAktif: AccessGroup = {
  id: "g1",
  shareEnabled: true,
  expiresAt: null,
  visibility: "PUBLIC",
};

const pemilik: AccessSession = { userId: "u-owner", role: "OWNER" };
const pengunjung: AccessSession = { userId: "u-viewer", role: "VIEWER" };
const belumMasuk: AccessSession = null;

describe("gerbang group", () => {
  it("menolak slug yang tidak ada tanpa membocorkan apa pun", () => {
    expect(evaluateGroupAccess(null, belumMasuk, NOW)).toEqual({
      kind: "DENIED",
      reason: "NOT_FOUND",
    });
  });

  it("membolehkan pemilik membuka group yang sedang aktif, tanpa spanduk pratinjau", () => {
    expect(evaluateGroupAccess(groupAktif, pemilik, NOW)).toEqual({
      kind: "GRANTED",
      ownerPreview: false,
    });
  });

  it("membolehkan pemilik membuka group yang linknya sudah dicabut, dengan spanduk pratinjau", () => {
    expect(
      evaluateGroupAccess({ ...groupAktif, shareEnabled: false }, pemilik, NOW),
    ).toEqual({ kind: "GRANTED", ownerPreview: true });
  });

  it("membolehkan pemilik membuka group yang sudah kedaluwarsa, dengan spanduk pratinjau", () => {
    expect(
      evaluateGroupAccess({ ...groupAktif, expiresAt: KEMARIN }, pemilik, NOW),
    ).toEqual({ kind: "GRANTED", ownerPreview: true });
  });

  // Group privat bukan group yang linknya mati — ia group yang linknya
  // memang belum dibagikan. Spanduk "link sedang tidak aktif" akan
  // berbohong di sana.
  it("tidak memasang spanduk pratinjau untuk group privat yang masih dibagikan", () => {
    expect(
      evaluateGroupAccess({ ...groupAktif, visibility: "PRIVATE" }, pemilik, NOW),
    ).toEqual({ kind: "GRANTED", ownerPreview: false });
  });

  it("menolak group yang linknya dicabut", () => {
    expect(
      evaluateGroupAccess({ ...groupAktif, shareEnabled: false }, pengunjung, NOW),
    ).toEqual({ kind: "DENIED", reason: "REVOKED" });
  });

  it("menolak group kedaluwarsa meski pengunjung sudah masuk", () => {
    expect(
      evaluateGroupAccess({ ...groupAktif, expiresAt: KEMARIN }, pengunjung, NOW),
    ).toEqual({ kind: "DENIED", reason: "EXPIRED" });
  });

  it("menolak group privat meski pengunjung sudah masuk", () => {
    expect(
      evaluateGroupAccess({ ...groupAktif, visibility: "PRIVATE" }, pengunjung, NOW),
    ).toEqual({ kind: "DENIED", reason: "PRIVATE" });
  });

  it("meminta pengunjung masuk lebih dulu pada group yang wajib login", () => {
    expect(
      evaluateGroupAccess(
        { ...groupAktif, visibility: "REQUIRE_LOGIN" },
        belumMasuk,
        NOW,
      ),
    ).toEqual({ kind: "NEEDS_LOGIN" });
  });

  it("membolehkan pengunjung yang sudah masuk pada group yang wajib login", () => {
    expect(
      evaluateGroupAccess(
        { ...groupAktif, visibility: "REQUIRE_LOGIN" },
        pengunjung,
        NOW,
      ),
    ).toEqual({ kind: "GRANTED", ownerPreview: false });
  });

  it("membolehkan pengunjung anonim pada group publik", () => {
    expect(evaluateGroupAccess(groupAktif, belumMasuk, NOW)).toEqual({
      kind: "GRANTED",
      ownerPreview: false,
    });
  });

  it("tidak menganggap group tanpa tanggal kedaluwarsa pernah kedaluwarsa", () => {
    expect(
      evaluateGroupAccess({ ...groupAktif, expiresAt: null }, pengunjung, BESOK),
    ).toEqual({ kind: "GRANTED", ownerPreview: false });
  });
});

// Urutan aturan adalah bagian dari aturannya. Ketiga pengujian berikut
// memastikan "berhenti pada kecocokan pertama" benar-benar berlaku dan
// bukan kebetulan yang lolos karena kasus ujinya tidak pernah bertabrakan.
describe("urutan aturan gerbang group", () => {
  it("memperlakukan slug tak dikenal sebagai tidak ada, bahkan bagi pemilik", () => {
    expect(evaluateGroupAccess(null, pemilik, NOW)).toEqual({
      kind: "DENIED",
      reason: "NOT_FOUND",
    });
  });

  it("menyebut link yang dicabut sebagai dicabut, bukan kedaluwarsa, ketika keduanya berlaku", () => {
    expect(
      evaluateGroupAccess(
        { ...groupAktif, shareEnabled: false, expiresAt: KEMARIN },
        pengunjung,
        NOW,
      ),
    ).toEqual({ kind: "DENIED", reason: "REVOKED" });
  });

  it("menyebut group kedaluwarsa sebagai kedaluwarsa, bukan privat, ketika keduanya berlaku", () => {
    expect(
      evaluateGroupAccess(
        { ...groupAktif, expiresAt: KEMARIN, visibility: "PRIVATE" },
        pengunjung,
        NOW,
      ),
    ).toEqual({ kind: "DENIED", reason: "EXPIRED" });
  });
});

// Ambangnya harus sama persis dengan resolveGroupStatus() di
// lib/groups/status.ts, supaya lencana di dashboard dan gerbang publik
// tidak menjawab beda pada detik yang sama.
describe("ambang kedaluwarsa", () => {
  it("menganggap group kedaluwarsa tepat pada detik tanggalnya", () => {
    expect(
      evaluateGroupAccess({ ...groupAktif, expiresAt: NOW }, pengunjung, NOW),
    ).toEqual({ kind: "DENIED", reason: "EXPIRED" });
  });

  it("belum menganggap kedaluwarsa satu detik sebelum tanggalnya", () => {
    expect(
      evaluateGroupAccess(
        { ...groupAktif, expiresAt: new Date("2026-08-27T10:00:01Z") },
        pengunjung,
        NOW,
      ),
    ).toEqual({ kind: "GRANTED", ownerPreview: false });
  });
});
