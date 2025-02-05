import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

interface RelatedLink {
  title: string;
  url: string;
}

interface RelatedLinksSectionProps {
  relatedLinks: RelatedLink[];
  setRelatedLinks: (links: RelatedLink[]) => void;
}

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
      
      {relatedLinks.map((link, index) => (
        <div key={index} className="flex gap-4 items-start">
          <div className="flex-1 space-y-2">
            <Label>Title</Label>
            <Input
              value={link.title}
              onChange={(e) => updateLink(index, "title", e.target.value)}
              placeholder="Link title"
            />
          </div>
          <div className="flex-1 space-y-2">
            <Label>URL</Label>
            <Input
              value={link.url}
              onChange={(e) => updateLink(index, "url", e.target.value)}
              placeholder="https://..."
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="mt-8"
            onClick={() => removeLink(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};