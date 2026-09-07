import { LogIn } from "lucide-react";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { signInWithGoogle } from "@/lib/auth/actions";
import { DASHBOARD_CALLBACK_URL } from "@/lib/auth/callback-url";
import { ACCESS_DENIED_PATH, DASHBOARD_PATH } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";

/**
 * Pintu dashboard — keputusan U5-5. Ia menggantikan halaman bawaan
 * Auth.js di `/api/auth/signin`, yang berbahasa Inggris dan tanpa merek;
 * karena `app/page.tsx` mengalihkan `/` ke `/dashboard`, halaman itu
 * menjadi wajah akar domain dan ditandai Chrome sebagai rekayasa sosial.
 *
 * Berada di LUAR grup `(dashboard)` dengan alasan yang sama seperti
 * `/akses-ditolak`: halaman di dalam grup itu memanggil `requireOwner()`
 * lewat layoutnya, dan sebuah layar masuk yang menuntut sesi untuk
 * ditampilkan akan mengalihkan dirinya sendiri tanpa henti.
 */
export default async function SignInPage() {
  const session = await auth();

  // Sesi yang sudah ada tidak perlu melihat layar ini. Pemilik langsung
  // ke dashboard; yang bukan pemilik ke halaman yang menjelaskan sebabnya,
  // bukan ke tombol masuk yang tidak akan mengubah apa pun baginya.
  if (session?.user) {
    redirect(session.user.role === "OWNER" ? DASHBOARD_PATH : ACCESS_DENIED_PATH);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-center">
        <h1 className="text-base font-medium text-card-foreground">Kumpulink</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Dashboard ini hanya dapat dibuka oleh pemiliknya. Masuk dengan akun
          Google pemilik untuk melanjutkan.
        </p>
        <form
          action={signInWithGoogle.bind(null, DASHBOARD_CALLBACK_URL)}
          className="mt-6"
        >
          <Button type="submit" className="w-full">
            <LogIn className="h-5 w-5" aria-hidden />
            Masuk dengan Google
          </Button>
        </form>
      </div>
    </div>
  );
}
