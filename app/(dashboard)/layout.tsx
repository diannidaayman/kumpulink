import { requireOwner } from "@/lib/auth/session";
import { ThemeToggle } from "@/components/theme-toggle";

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
  await requireOwner();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <span className="text-base font-medium">Kumpulink</span>
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </div>
  );
}
