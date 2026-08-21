import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

import { resolveRole } from "@/lib/auth/role";
import { prisma } from "@/lib/db/client";
import { env } from "@/lib/env";

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  // Strategi database, bukan JWT. architecture.md menyebut tabel Session
  // eksplisit sebagai bagian skema.
  session: { strategy: "database" },
  providers: [
    Google({
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    // K1 — peran diturunkan ULANG di sini setiap kali sesi dibaca.
    // Kolom User.role bukan sumber kebenaran; ia hanya salinan agar
    // dapat di-query. Menurunkannya di sini membuat salah ketik pada
    // OWNER_EMAIL sembuh sendiri pada permintaan berikutnya, tanpa
    // perlu menyunting database yang memang tidak punya antarmuka.
    session({ session, user }) {
      session.user.id = user.id;
      session.user.role = resolveRole(user.email, env.OWNER_EMAIL);
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      if (!user.id || !user.email) return;
      const role = resolveRole(user.email, env.OWNER_EMAIL);
      try {
        await prisma.user.update({ where: { id: user.id }, data: { role } });
      } catch (error) {
        // Kolom ini bukan sumber kebenaran, jadi kegagalannya tidak boleh
        // menggagalkan proses masuk. Dicatat, lalu ditelan.
        console.error("Gagal menyegarkan kolom role:", error);
      }
    },
  },
};
