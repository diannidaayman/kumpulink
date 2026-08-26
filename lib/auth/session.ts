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

/**
 * Varian requireOwner() untuk route handler: mengembalikan null alih-alih
 * mengalihkan.
 *
 * Pengalihan salah tempat di sini. Pemanggilnya `fetch`, dan `fetch`
 * MENGIKUTI pengalihan diam-diam — sehingga sesi yang mati di tengah
 * jalan akan menghasilkan respons 200 berisi halaman masuk Google, dan
 * klien membacanya sebagai unggahan yang berhasil. Route handler
 * mengembalikan 403 JSON supaya kegagalan terbaca sebagai kegagalan.
 *
 * Pembedaan "tanpa sesi" dan "bukan pemilik" sengaja TIDAK dibawa ke
 * sini: keduanya sama-sama berarti permintaan ini tidak boleh dilayani,
 * dan hanya requireOwner() yang perlu membedakannya karena hanya ia yang
 * memilih halaman tujuan.
 */
export async function getOwnerSession(): Promise<Session | null> {
  const session = await auth();
  if (!session?.user || session.user.role !== "OWNER") return null;
  return session;
}
