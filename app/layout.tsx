import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kumpulink",
  description:
    "Himpun tautan dan berkas ke dalam group, bagikan lewat satu link.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
