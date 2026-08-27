"use server";

import { signIn, signOut } from "@/lib/auth";
import { isSafeCallbackUrl } from "@/lib/auth/callback-url";

/**
 * `callbackUrl` datang sebagai argumen TERIKAT lewat `.bind()`, bukan
 * sebagai medan formulir. Argumen terikat dienkripsi Next.js dan tidak
 * dapat disunting klien; medan tersembunyi dapat. Ini yang membuat
 * keputusan U4-9 berlaku sampai ke bentuk formulirnya.
 */
export async function signInWithGoogle(callbackUrl: string): Promise<void> {
  if (!isSafeCallbackUrl(callbackUrl)) {
    throw new Error("callbackUrl di luar batas yang diizinkan");
  }
  await signIn("google", { redirectTo: callbackUrl });
}

export async function signOutTo(callbackUrl: string): Promise<void> {
  if (!isSafeCallbackUrl(callbackUrl)) {
    throw new Error("callbackUrl di luar batas yang diizinkan");
  }
  await signOut({ redirectTo: callbackUrl });
}
