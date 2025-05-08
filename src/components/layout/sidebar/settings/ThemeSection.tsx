
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useEffect, useState } from "react";

export const ThemeSection = () => {
  const [mounted, setMounted] = useState(false);
  
  // Only show the correct theme UI after hydration to avoid mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return null;
  }
  
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="space-y-1">
        <Label htmlFor="dark-mode-toggle" className="flex items-center gap-2 dark:text-dm-text">
          Theme
        </Label>
        <p className="text-sm text-muted-foreground dark:text-dm-text-supporting">
          Toggle dark mode appearance
        </p>
      </div>
      <ThemeToggle />
    </div>
  );
};
