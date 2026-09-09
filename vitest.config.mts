import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  ssr: {
    // "server-only" hanya mengekspor stub kosong di bawah kondisi
    // "react-server" (lihat exports di package.json-nya); tanpa ini,
    // modul apa pun yang mengimpornya langsung — seperti lib/db/*.ts —
    // melempar error saat diimpor dari pengujian, karena Vitest memuat
    // berkas pengujian lewat jalur SSR Vite.
    resolve: {
      conditions: ["react-server"],
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
