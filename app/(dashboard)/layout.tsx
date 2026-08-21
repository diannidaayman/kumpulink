import { signOut } from "@/lib/auth";
import { requireOwner } from "@/lib/auth/session";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Memanggil requireOwner() di sini melindungi setiap HALAMAN di bawah
  // grup ini secara bawaan — halaman baru tidak dapat lupa memeriksanya.
  // Jaminan itu TIDAK berlaku untuk tiga jalur lain:
  //   - Route handler (route.ts) tidak pernah dibungkus layout sama sekali.
  //   - Server action: badan aksinya berjalan SEBELUM layout ini dirender
  //     ulang, sehingga tulisannya sudah terjadi sebelum pengalihan baru
  //     dari sini sempat berlaku.
  //   - Navigasi lunak antar segmen bersaudara sengaja tidak menjalankan
  //     ulang layout bersarang.
  // Route handler dan server action wajib memanggil requireOwner() sendiri.
  const session = await requireOwner();

  // Nama akun dan tombol keluar selalu terlihat, tanpa perlu membuka menu.
  // Ini pola yang sama yang ditetapkan `ui-context.md` untuk bilah identitas
  // halaman publik, dan alasannya sama: laptop ruang rapat dipakai
  // bergantian. Tanpa jalan keluar yang terlihat, riwayat akses mencatat
  // orang berikutnya sebagai orang yang pertama masuk — dan riwayat itulah
  // alasan aplikasi ini dibuat.
  const identity = session.user.name ?? session.user.email;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
          <span className="shrink-0 text-base font-medium">Kumpulink</span>
          <div className="flex min-w-0 items-center gap-2">
            <span
              className="truncate text-sm text-muted-foreground"
              title={session.user.email ?? undefined}
            >
              {identity}
            </span>
            <ThemeToggle />
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <Button type="submit" variant="outline" size="sm">
                Keluar
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </div>
  );
}
