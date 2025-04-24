
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  onClick: () => void;
}

export function BackButton({ onClick }: BackButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="mb-4 hover:bg-accent/50 transition-all rounded-full w-10 h-10 touch-manipulation"
    >
      <ArrowLeft className="h-5 w-5" />
    </Button>
  );
}
