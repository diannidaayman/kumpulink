import { LogIn } from "lucide-react";

import { signInWithGoogle } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

/**
 * Satu layar untuk dua tempat — keputusan U4-4. Halaman group menyebut
 * judul group saja; gerbang item menyebut judul group DAN nama item,
 * supaya pengunjung tahu apa yang akan ia buka sebelum menyerahkan
 * identitasnya. Menyebut nama item di sana bukan kebocoran: ia baru saja
 * melihatnya di halaman group yang ia klik.
 *
 * Tombolnya adalah <form> dengan server action, sehingga bekerja tanpa
 * JavaScript lewat peningkatan progresif — halaman publik dapat dipakai
 * tanpa JavaScript untuk hal pokoknya.
 */
export function LoginScreen({
  groupTitle,
  itemTitle,
  callbackUrl,
}: {
  groupTitle: string;
  itemTitle?: string;
  callbackUrl: string;
}) {
  return (
    <div className="py-12">
      <h1 className="text-xl font-medium">
        {itemTitle === undefined ? groupTitle : itemTitle}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {itemTitle === undefined
          ? "Halaman ini hanya dapat dibuka setelah Anda masuk."
          : `Item ini ada di group ${groupTitle} dan hanya dapat dibuka setelah Anda masuk. Akses Anda akan dicatat.`}
      </p>
      <form action={signInWithGoogle.bind(null, callbackUrl)} className="mt-6">
        <Button type="submit">
          <LogIn className="h-5 w-5" aria-hidden />
          Masuk dengan Google
        </Button>
      </form>
    </div>
  );
}
