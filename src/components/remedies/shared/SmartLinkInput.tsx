
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, X, ExternalLink, Video, RefreshCw } from 'lucide-react';
import { useVideoMetadata } from '@/hooks/useVideoMetadata';

interface LinkData {
  url: string;
  title?: string;
  description?: string;
  type: 'link' | 'video';
}

interface SmartLinkInputProps {
  links: LinkData[];
  onLinksChange: (links: LinkData[]) => void;
}

const isVideoUrl = (url: string): boolean => {
  const videoPatterns = [
    /youtube\.com\/watch/,
    /youtu\.be\//,
    /vimeo\.com\//,
    /dailymotion\.com\//,
    /twitch\.tv\//,
    /\.mp4$/,
    /\.webm$/,
    /\.mov$/,
    /\.avi$/
  ];
  
  return videoPatterns.some(pattern => pattern.test(url.toLowerCase()));
};

export const SmartLinkInput = ({ links, onLinksChange }: SmartLinkInputProps) => {
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [titleFetched, setTitleFetched] = useState(false);
  const { fetchVideoMetadata, isLoading } = useVideoMetadata();

  const fetchTitleForUrl = async (url: string) => {
    if (!isVideoUrl(url)) {return;}
    
    const metadata = await fetchVideoMetadata(url);
    if (metadata?.title) {
      setNewTitle(metadata.title);
      setTitleFetched(true);
    }
  };

  useEffect(() => {
    if (newUrl.trim() && isVideoUrl(newUrl) && !titleFetched) {
      const timeoutId = setTimeout(() => {
        fetchTitleForUrl(newUrl);
      }, 500); // Debounce for 500ms

      return () => clearTimeout(timeoutId);
    }
  }, [newUrl, titleFetched]);

  const handleUrlChange = (url: string) => {
    setNewUrl(url);
    setNewTitle('');
    setTitleFetched(false);
  };

  const refreshTitle = async () => {
    if (newUrl.trim() && isVideoUrl(newUrl)) {
      setNewTitle('');
      setTitleFetched(false);
      await fetchTitleForUrl(newUrl);
    }
  };

  const addLink = () => {
    if (!newUrl.trim()) {return;}
    
    const type = isVideoUrl(newUrl) ? 'video' : 'link';
    const newLink: LinkData = {
      url: newUrl.trim(),
      title: newTitle.trim() || undefined,
      type
    };
    
    onLinksChange([...links, newLink]);
    setNewUrl('');
    setNewTitle('');
    setTitleFetched(false);
  };

  const removeLink = (index: number) => {
    const updatedLinks = links.filter((_, i) => i !== index);
    onLinksChange(updatedLinks);
  };

  const regularLinks = links.filter(link => link.type === 'link');
  const videoLinks = links.filter(link => link.type === 'video');

  return (
    <div className="space-y-6">
      {/* Add New Link */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Links & Videos</h3>
        
        <div className="space-y-2">
          <Label htmlFor="new-url">URL</Label>
          <Input
            id="new-url"
            value={newUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://example.com or video URL"
            className="touch-manipulation bg-background"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="new-title">Title {isVideoUrl(newUrl) ? '(auto-fetched)' : '(optional)'}</Label>
            {isVideoUrl(newUrl) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={refreshTitle}
                disabled={isLoading || !newUrl.trim()}
                className="h-6 px-2 text-xs"
              >
                <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </div>
          <Input
            id="new-title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder={isLoading ? "Fetching title..." : isVideoUrl(newUrl) ? "Video title will be fetched automatically" : "Link title"}
            className="touch-manipulation bg-background"
            disabled={isLoading}
          />
        </div>
        
        <Button
          type="button"
          onClick={addLink}
          disabled={!newUrl.trim() || isLoading}
          className="w-full touch-manipulation"
        >
          <Plus className="h-4 w-4 mr-2" />
          {isLoading ? 'Fetching...' : `Add ${isVideoUrl(newUrl) ? 'Video' : 'Link'}`}
        </Button>
      </div>

      {/* Regular Links */}
      {regularLinks.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium flex items-center">
            <ExternalLink className="h-4 w-4 mr-2" />
            Links ({regularLinks.length})
          </h4>
          <div className="space-y-2">
            {regularLinks.map((link, index) => (
              <div key={`link-${index}`} className="flex items-center justify-between p-2 border rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {link.title || new URL(link.url).hostname}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {link.url}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeLink(links.indexOf(link))}
                  className="ml-2 touch-manipulation"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video Links */}
      {videoLinks.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium flex items-center">
            <Video className="h-4 w-4 mr-2" />
            Videos ({videoLinks.length})
          </h4>
          <div className="space-y-2">
            {videoLinks.map((link, index) => (
              <div key={`video-${index}`} className="flex items-center justify-between p-2 border rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">Video</Badge>
                    <p className="text-sm font-medium truncate">
                      {link.title || new URL(link.url).hostname}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {link.url}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeLink(links.indexOf(link))}
                  className="ml-2 touch-manipulation"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
