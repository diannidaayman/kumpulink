import { redirect } from "next/navigation";
import type { Session } from "next-auth";

import { auth } from "@/lib/auth";

export const DASHBOARD_PATH = "/dashboard";
export const ACCESS_DENIED_PATH = "/akses-ditolak";

/**
 * Dipakai server component yang hanya boleh dibuka pemilik.
 *
 * Tanpa sesi -> dialihkan ke Google. Ada sesi tetapi bukan pemilik ->
 * dialihkan ke halaman penjelasan, bukan 404: /dashboard adalah rute yang
 * dapat ditebak siapa pun dan bukan rahasia yang dijaga aplikasi ini,
 * sementara layar itu satu-satunya yang menyebutkan penyebabnya ketika
 * OWNER_EMAIL salah ketik.
 */
export async function requireOwner(): Promise<Session> {
  const session = await auth();

  if (!session?.user) {
    redirect(
      `/api/auth/signin?callbackUrl=${encodeURIComponent(DASHBOARD_PATH)}`,
    );
  }

  if (session.user.role !== "OWNER") {
    redirect(ACCESS_DENIED_PATH);
  }

  return session;
}
