import type { DenyReason, EventType, Outcome } from "@prisma/client";

/**
 * Baris AccessLog apa adanya, sebagaimana dikembalikan lib/db/access-logs.ts.
 *
 * Perhatikan apa yang TIDAK ada di sini: tidak ada `user`, tidak ada
 * relasi, tidak ada nama yang dibaca dari tabel lain. visitorName dan
 * visitorEmail adalah salinan yang dibuat saat kejadian, dan itulah
 * satu-satunya sumber identitas di seluruh permukaan riwayat.
 */
export type HistoryLogRow = {
  id: string;
  eventType: EventType;
  itemId: string | null;
  visitorName: string | null;
  visitorEmail: string | null;
  outcome: Outcome;
  denyReason: DenyReason | null;
  ipAddress: string | null;
  createdAt: Date;
};

/**
 * Model tampilan satu baris. Seluruh teksnya SUDAH JADI — komponen tidak
 * memformat apa pun sendiri, sehingga tabel dan kartu ponsel tidak dapat
 * menyimpang satu sama lain.
 */
export type HistoryRowView = {
  id: string;
  /** "9 Sep 2026, 14.05 WIT" */
  time: string;
  /** Alamat IP di bawah Waktu. Null pada baris tanpa identitas. */
  timeIp: string | null;
  name: string;
  isAnonymous: boolean;
  email: string | null;
  /** Alamat IP di dalam sel Nama. Hanya terisi pada baris tanpa identitas. */
  nameIp: string | null;
  item: string;
  /** Benar untuk PAGE_VIEW dan item yang sudah dihapus; keduanya dirender redup. */
  itemIsAbsent: boolean;
  granted: boolean;
  outcomeLabel: string;
  denyLabel: string | null;
  denyDescription: string | null;
};

/** Satu pilihan di penyaring item. */
export type HistoryItemOption = { value: string; label: string };
