import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    // "server-only" hanya mengekspor stub kosong di bawah kondisi resolusi
    // "react-server" (lihat exports di package.json-nya); tanpa penanganan
    // ini, modul apa pun yang mengimpornya langsung — seperti lib/db/*.ts —
    // melempar error saat diimpor dari pengujian, karena Vitest memuat
    // berkas pengujian lewat jalur SSR Vite. Menyetel kondisi itu secara
    // global (ssr.resolve.conditions) BUKAN pilihan: itu menggantikan
    // seluruh daftar kondisi bawaan Vite, sehingga build "react" untuk
    // seluruh suite ikut berubah menjadi build RSC tanpa useState,
    // useEffect, useRef, useContext, maupun Component. Alias satu modul
    // ini mencapai tujuan yang sama tanpa efek samping itu.
    alias: {
      "server-only": fileURLToPath(new URL("./node_modules/server-only/empty.js", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
