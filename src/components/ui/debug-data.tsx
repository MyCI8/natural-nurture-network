
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface DebugDataProps {
  data: any;
  title?: string;
  className?: string;
  expanded?: boolean;
}

export const DebugData = ({ 
  data, 
  title = "Debug Data", 
  className,
  expanded = false
}: DebugDataProps) => {
  const [isVisible, setIsVisible] = useState(expanded);

  // Only show in development environment
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <Card className={cn("bg-zinc-950 text-zinc-50 border-zinc-800", className)}>
      <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-mono">{title}</CardTitle>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800"
          onClick={() => setIsVisible(!isVisible)}
        >
          {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </CardHeader>
      {isVisible && (
        <CardContent className="p-4 pt-0">
          <pre className="text-xs overflow-auto max-h-[400px] font-mono">
            {JSON.stringify(data, null, 2)}
          </pre>
        </CardContent>
      )}
    </Card>
  );
};
