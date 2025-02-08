
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface VideoDescriptionInputProps {
  videoDescription: string;
  setVideoDescription: (description: string) => void;
}

export const VideoDescriptionInput = ({
  videoDescription,
  setVideoDescription,
}: VideoDescriptionInputProps) => {
  return (
    <div>
      <Label htmlFor="videoDescription">Video Section Description</Label>
      <Textarea
        id="videoDescription"
        value={videoDescription}
        onChange={(e) => setVideoDescription(e.target.value)}
        placeholder="Add a description for the video section"
      />
    </div>
  );
};
