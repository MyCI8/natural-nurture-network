
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";

interface VideoLink {
  url: string;
  title: string;
}

interface VideoLinkInputProps {
  link: VideoLink;
  index: number;
  updateVideoLink: (index: number, field: keyof VideoLink, value: string) => void;
  removeVideoLink: (index: number) => void;
}

export const VideoLinkInput = ({
  link,
  index,
  updateVideoLink,
  removeVideoLink,
}: VideoLinkInputProps) => {
  return (
    <div className="flex gap-4 items-start">
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
  );
};
