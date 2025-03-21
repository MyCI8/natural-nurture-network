
import { useState } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SettingsModal } from "./SettingsModal";

interface SettingsButtonProps {
  userId?: string;
  compact?: boolean;
  variant?: "default" | "ghost" | "outline";
}

export function SettingsButton({ userId, compact = false, variant = "ghost" }: SettingsButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <Button
              variant={variant}
              size={compact ? "icon" : "default"}
              onClick={() => setOpen(true)}
              className={compact ? "h-9 w-9 rounded-full" : ""}
              aria-label="Settings"
            >
              <Settings className="h-[1.2rem] w-[1.2rem]" />
              {!compact && <span className="ml-2">Settings</span>}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Settings</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <SettingsModal
        open={open}
        onOpenChange={setOpen}
        userId={userId}
      />
    </>
  );
}
