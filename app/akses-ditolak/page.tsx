import { redirect } from "next/navigation";

import { auth, signOut } from "@/lib/auth";
import { DASHBOARD_PATH } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";

export default async function AccessDeniedPage() {
  const session = await auth();

  // Pengunjung anonim yang membuka URL ini langsung tidak "sedang masuk
  // sebagai tidak diketahui" — ia belum masuk sama sekali. Alihkan ke
  // jalur masuk alih-alih menampilkan pernyataan yang keliru. Tidak ada
  // risiko berputar: halaman ini berada di luar grup (dashboard) dan
  // tidak memanggil requireOwner().
  if (!session?.user) {
    redirect(
      `/api/auth/signin?callbackUrl=${encodeURIComponent(DASHBOARD_PATH)}`,
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-center">
        <h1 className="text-base font-medium text-card-foreground">
          Akun ini bukan pemilik
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Dashboard Kumpulink hanya dapat dibuka oleh pemiliknya. Anda sedang
          masuk sebagai:
        </p>
        <p className="mt-3 font-mono text-sm text-card-foreground">
          {session?.user?.email ?? "tidak diketahui"}
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Bila Anda pemiliknya, keluar lalu masuk kembali dengan akun Google
          yang benar.
        </p>
        <form
          className="mt-6"
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <Button type="submit" className="w-full">
            Keluar
          </Button>
        </form>
      </div>
    </div>
  );
}
