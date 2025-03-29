
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  return (
    <div className={cn("rounded-md border bg-muted/50", className)}>
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <h3 className="text-sm font-medium">{title}</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-7 w-7 p-0"
        >
          {isExpanded ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </Button>
      </div>
      
      {isExpanded && (
        <div className="p-4 overflow-x-auto">
          <pre className="text-xs">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
