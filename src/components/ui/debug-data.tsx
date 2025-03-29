
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface DebugDataProps {
  data: any;
  title?: string;
  expanded?: boolean;
  className?: string;
}

export function DebugData({ 
  data, 
  title = "Debug Data",
  expanded = false,
  className
}: DebugDataProps) {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const formattedData = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedData).then(() => {
      setIsCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Debug data has been copied to your clipboard"
      });
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className={cn("rounded-md border bg-muted/50 overflow-hidden", className)}>
      <div className="flex items-center justify-between px-4 py-2 border-b touch-manipulation">
        <h3 className="text-sm font-medium">{title}</h3>
        <div className="flex items-center gap-2">
          {isExpanded && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleCopy}
              className="h-7 w-7 p-0 touch-manipulation"
              aria-label="Copy debug data"
            >
              {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-7 w-7 p-0 touch-manipulation"
            aria-label={isExpanded ? "Hide debug data" : "Show debug data"}
          >
            {isExpanded ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-4 overflow-x-auto max-h-[50vh] scrollbar-thin">
          <pre className="text-xs whitespace-pre-wrap break-words">
            {formattedData}
          </pre>
        </div>
      )}
    </div>
  );
}
