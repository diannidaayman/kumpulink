import { requireOwner } from "@/lib/auth/session";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Memanggil requireOwner() di sini, bukan di tiap halaman, membuat
  // seluruh rute di bawah grup ini terlindungi secara bawaan. Halaman
  // baru tidak dapat lupa memeriksanya.
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
