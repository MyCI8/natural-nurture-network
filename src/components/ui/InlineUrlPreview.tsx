
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ExternalLink } from 'lucide-react';

interface InlineUrlPreviewProps {
  url: string;
  className?: string;
}

export const InlineUrlPreview: React.FC<InlineUrlPreviewProps> = ({ 
  url, 
  className = "" 
}) => {
  const [title, setTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!url) {
      setLoading(false);
      return;
    }

    const fetchTitle = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('link-preview', {
          body: { url }
        });

        if (!error && data?.title) {
          setTitle(data.title);
        }
      } catch (err) {
        console.error('Error fetching title:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTitle();
  }, [url]);

  const displayText = title || url;

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 text-primary hover:underline ${className}`}
    >
      <span className="truncate max-w-xs">{displayText}</span>
      <ExternalLink className="h-3 w-3 flex-shrink-0" />
    </a>
  );
};
