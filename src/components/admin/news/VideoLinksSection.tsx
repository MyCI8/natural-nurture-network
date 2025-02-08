
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";

interface VideoLink {
  url: string;
  title: string;
}

interface VideoLinksSectionProps {
  videoLinks: VideoLink[];
  setVideoLinks: (links: VideoLink[]) => void;
  videoDescription: string;
  setVideoDescription: (description: string) => void;
}

export const VideoLinksSection = ({
  videoLinks,
  setVideoLinks,
  videoDescription,
  setVideoDescription,
}: VideoLinksSectionProps) => {
  const addVideoLink = () => {
    setVideoLinks([...videoLinks, { url: "", title: "" }]);
  };

  const removeVideoLink = (index: number) => {
    setVideoLinks(videoLinks.filter((_, i) => i !== index));
  };

  const updateVideoLink = (index: number, field: keyof VideoLink, value: string) => {
    const newLinks = [...videoLinks];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setVideoLinks(newLinks);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Video Links</h3>
        <Button variant="outline" size="sm" onClick={addVideoLink}>
          <Plus className="h-4 w-4 mr-2" />
          Add Video
        </Button>
      </div>

      <div>
        <Label htmlFor="videoDescription">Video Section Description</Label>
        <Textarea
          id="videoDescription"
          value={videoDescription}
          onChange={(e) => setVideoDescription(e.target.value)}
          placeholder="Add a description for the video section"
        />
      </div>

      <div className="space-y-4">
        {videoLinks.map((link, index) => (
          <div key={index} className="flex gap-4 items-start">
            <div className="flex-1 space-y-2">
              <Label>Title</Label>
              <Input
                value={link.title}
                onChange={(e) => updateVideoLink(index, "title", e.target.value)}
                placeholder="Video title"
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label>URL</Label>
              <Input
                value={link.url}
                onChange={(e) => updateVideoLink(index, "url", e.target.value)}
                placeholder="https://youtube.com/..."
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="mt-8"
              onClick={() => removeVideoLink(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
