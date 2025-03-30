
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
      <div className="p-3 bg-primary/20 flex items-center justify-between">
        <h3 className="font-medium text-sm">{title}</h3>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full touch-manipulation"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full touch-manipulation"
            onClick={handleCopy}
          >
            {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
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
