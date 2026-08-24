import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      // Worktree terisolasi letaknya DI DALAM direktori kerja repo, dan
      // ESLint v9 tidak membaca `.gitignore`. Tanpa baris ini, `npm run
      // lint` dari repo utama ikut memindai seluruh salinan worktree
      // beserta keluaran `.next`-nya — saat Unit 2 digabung, itu berarti
      // 7027 masalah palsu yang mudah disalahartikan sebagai kode rusak.
      // Pola `node_modules/**` dan `.next/**` di atas relatif terhadap
      // akar repo, jadi keduanya TIDAK menjangkau yang bersarang di
      // dalam worktree.
      ".claude/worktrees/**",
    ],
  },
];

export default eslintConfig;
