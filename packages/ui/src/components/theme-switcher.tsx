"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Sun03Icon, Moon01Icon } from "@hugeicons/core-free-icons";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "./button";

function ThemeSwitcher({ size = "icon" }: { size?: "icon-xs" | "icon-sm" | "icon" | "icon-lg" }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button 
        size={size} 
        variant="ghost" 
        aria-label="Toggle theme"
        className="rounded-full text-neutral-700 dark:text-neutral-200"
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      size={size}
      variant="ghost"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      className="rounded-full text-neutral-700 dark:text-neutral-200 hover:bg-transparent"
    >
      {isDark ? (
        <HugeiconsIcon icon={Sun03Icon} size={20} />
      ) : (
        <HugeiconsIcon icon={Moon01Icon} size={20} />
      )}
    </Button>
  );
}

export { ThemeSwitcher };
