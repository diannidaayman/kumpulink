import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default async function AccessDeniedPage() {
  const session = await auth();

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
