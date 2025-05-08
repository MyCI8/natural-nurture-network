
import { useEffect, useState } from "react";
import { ThemeSection } from "./settings/ThemeSection";
import { SettingsNavigation } from "./settings/SettingsNavigation";

export const SettingsPanel = () => {
  const [mounted, setMounted] = useState(false);
  
  // Only show the correct theme UI after hydration to avoid mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return null;
  }
  
  return (
    <div className="px-4 space-y-6">
      <h2 className="text-lg font-semibold mb-4 dark:text-dm-text">Settings</h2>
      
      <ThemeSection />
      <SettingsNavigation />
    </div>
  );
};
