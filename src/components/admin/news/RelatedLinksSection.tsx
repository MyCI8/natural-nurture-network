
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchLinkPreview = async (url: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('link-preview', {
        body: { url }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching link preview:', error);
      return null;
    }
  };

  const addLink = () => {
    setRelatedLinks([...relatedLinks, { title: "", url: "" }]);
  };

  const removeLink = (index: number) => {
    setRelatedLinks(relatedLinks.filter((_, i) => i !== index));
  };

  const updateLink = async (index: number, field: keyof RelatedLink, value: string) => {
    const newLinks = [...relatedLinks];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setRelatedLinks(newLinks);

    // If URL field is updated and is a valid URL, fetch preview
    if (field === 'url' && value && isValidUrl(value)) {
      setIsProcessing(true);
      try {
        const preview = await fetchLinkPreview(value);
        if (preview) {
          newLinks[index] = {
            ...newLinks[index],
            title: preview.title || newLinks[index].title,
          };
          setRelatedLinks(newLinks);
        }
      } catch (error) {
        console.error('Error updating link preview:', error);
        toast({
          title: "Error",
          description: "Failed to fetch link preview",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
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
              className={isProcessing ? "opacity-50" : ""}
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

