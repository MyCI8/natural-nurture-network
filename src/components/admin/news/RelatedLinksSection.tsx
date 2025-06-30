
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, RefreshCw } from "lucide-react";
import { SimpleUrlPreview } from "@/components/ui/SimpleUrlPreview";
import { useUrlPreview } from "@/hooks/useUrlPreview";
import { isValidUrl } from "@/utils/urlDetection";

interface RelatedLink {
  title: string;
  url: string;
  thumbnail_url?: string;
}

interface RelatedLinksSectionProps {
  relatedLinks: RelatedLink[];
  setRelatedLinks: (links: RelatedLink[]) => void;
}

const LinkPreviewItem = ({ 
  link, 
  index, 
  onUpdate, 
  onRemove 
}: { 
  link: RelatedLink; 
  index: number; 
  onUpdate: (index: number, field: keyof RelatedLink, value: string) => void;
  onRemove: (index: number) => void;
}) => {
  const { preview, loading, refetch } = useUrlPreview(link.url);

  const handleRefresh = () => {
    if (preview) {
      onUpdate(index, 'title', preview.title);
      onUpdate(index, 'thumbnail_url', preview.thumbnailUrl);
    }
    refetch();
  };

  return (
    <div className="space-y-3 p-4 border rounded-lg">
      <div className="flex gap-2">
        <div className="flex-1">
          <Label>URL</Label>
          <Input
            value={link.url}
            onChange={(e) => onUpdate(index, "url", e.target.value)}
            placeholder="https://..."
          />
        </div>
        <div className="flex-1">
          <Label>Title</Label>
          <div className="flex gap-2">
            <Input
              value={link.title}
              onChange={(e) => onUpdate(index, "title", e.target.value)}
              placeholder="Link title"
            />
            {isValidUrl(link.url) && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(index)}
          className="mt-6"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      
      {isValidUrl(link.url) && (
        <div className="mt-3">
          <SimpleUrlPreview url={link.url} />
        </div>
      )}
    </div>
  );
};

export const RelatedLinksSection = ({
  relatedLinks,
  setRelatedLinks,
}: RelatedLinksSectionProps) => {
  const addLink = () => {
    setRelatedLinks([...relatedLinks, { title: "", url: "" }]);
  };

  const removeLink = (index: number) => {
    setRelatedLinks(relatedLinks.filter((_, i) => i !== index));
  };

  const updateLink = (index: number, field: keyof RelatedLink, value: string) => {
    const newLinks = [...relatedLinks];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setRelatedLinks(newLinks);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Related Links</h3>
        <Button variant="outline" size="sm" onClick={addLink}>
          <Plus className="h-4 w-4 mr-2" />
          Add Link
        </Button>
      </div>
      
      <div className="space-y-4">
        {relatedLinks.map((link, index) => (
          <LinkPreviewItem
            key={index}
            link={link}
            index={index}
            onUpdate={updateLink}
            onRemove={removeLink}
          />
        ))}
      </div>
    </div>
  );
};
