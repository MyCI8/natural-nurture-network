
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { VideoDescriptionInput } from "./video/VideoDescriptionInput";
import { VideoLinkInput } from "./video/VideoLinkInput";

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

      <VideoDescriptionInput
        videoDescription={videoDescription}
        setVideoDescription={setVideoDescription}
      />

      <div className="space-y-4">
        {videoLinks.map((link, index) => (
          <VideoLinkInput
            key={index}
            link={link}
            index={index}
            updateVideoLink={updateVideoLink}
            removeVideoLink={removeVideoLink}
          />
        ))}
      </div>
    </div>
  );
};
