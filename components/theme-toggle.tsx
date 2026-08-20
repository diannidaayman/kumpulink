"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [gelap, setGelap] = useState(false);

  useEffect(() => {
    setGelap(document.documentElement.classList.contains("dark"));
  }, []);

  function ganti() {
    const berikutnya = !gelap;
    document.documentElement.classList.toggle("dark", berikutnya);
    localStorage.setItem("theme", berikutnya ? "dark" : "light");
    setGelap(berikutnya);
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={ganti}
      aria-label={gelap ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
    >
      {gelap ? (
        <Sun className="h-5 w-5" aria-hidden />
      ) : (
        <Moon className="h-5 w-5" aria-hidden />
      )}
    </Button>
  );
}
