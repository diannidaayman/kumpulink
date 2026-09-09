import { describe, expect, it } from "vitest";
import { DENY_REASON_TEXT, UNKNOWN_DENY_REASON, denyReasonText } from "@/lib/history/deny-reason";

const SEMUA_ALASAN = [
  "NOT_FOUND",
  "REVOKED",
  "EXPIRED",
  "PRIVATE",
  "ITEM_INACTIVE",
  "FILE_MISSING",
  "RATE_LIMITED",
  "REQUEST_REJECTED",
  "REQUEST_REVOKED",
  "APPROVAL_EXPIRED",
] as const;

describe("terjemahan denyReason", () => {
  it("memberi label dan penjelasan untuk kesepuluh nilai", () => {
    for (const reason of SEMUA_ALASAN) {
      expect(DENY_REASON_TEXT[reason].label.length).toBeGreaterThan(0);
      expect(DENY_REASON_TEXT[reason].description.length).toBeGreaterThan(0);
    }
    expect(Object.keys(DENY_REASON_TEXT)).toHaveLength(SEMUA_ALASAN.length);
  });

  it("tidak memakai satu label untuk dua alasan berbeda", () => {
    // "Link dicabut" bukan "Izin dicabut", dan "Group kedaluwarsa" bukan
    // "Izin kedaluwarsa". Label kembar membuat pemilik salah menyimpulkan
    // sebab dari baris riwayat, dan itu justru satu-satunya gunanya.
    const labels = SEMUA_ALASAN.map((reason) => DENY_REASON_TEXT[reason].label);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it("menjaga NOT_FOUND tetap luas dan tidak menjanjikan berkas", () => {
    // U4-12: item EXTERNAL tanpa targetUrl menghasilkan NOT_FOUND justru
    // supaya riwayat tidak berbohong dengan menyebut kegagalan berkas.
    const { label, description } = DENY_REASON_TEXT.NOT_FOUND;
    expect(`${label} ${description}`.toLowerCase()).not.toContain("berkas");
  });

  it("menyatakan alasan yang tidak dikenali, bukan mengosongkannya", () => {
    expect(denyReasonText(null)).toEqual(UNKNOWN_DENY_REASON);
    expect(UNKNOWN_DENY_REASON.label).toBe("Alasan tidak diketahui");
  });

  it("menyatakan nilai runtime di luar enum sebagai tidak diketahui", () => {
    // Data bisa lebih tua atau lebih baru daripada kode. Nilai asing tidak
    // boleh menghasilkan sel kosong yang terbaca seperti baris normal.
    const asing = "SOMETHING_ELSE" as unknown as Parameters<typeof denyReasonText>[0];
    expect(denyReasonText(asing)).toEqual(UNKNOWN_DENY_REASON);
  });

  it("mengembalikan teks yang benar untuk alasan yang dikenali", () => {
    expect(denyReasonText("RATE_LIMITED").label).toBe("Terlalu banyak percobaan");
  });
});
