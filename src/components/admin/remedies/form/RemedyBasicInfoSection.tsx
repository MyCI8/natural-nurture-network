
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface RemedyBasicInfoSectionProps {
  name: string;
  summary: string;
  description: string;
  video_url: string;
  onNameChange: (value: string) => void;
  onSummaryChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onVideoUrlChange: (value: string) => void;
}

export const RemedyBasicInfoSection = ({
  name,
  summary,
  description,
  video_url,
  onNameChange,
  onSummaryChange,
  onDescriptionChange,
  onVideoUrlChange,
}: RemedyBasicInfoSectionProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="summary">Summary</Label>
        <Input
          id="summary"
          value={summary}
          onChange={(e) => onSummaryChange(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className="min-h-[200px]"
        />
      </div>

      <div>
        <Label htmlFor="video_url">Video URL</Label>
        <Input
          id="video_url"
          value={video_url}
          onChange={(e) => onVideoUrlChange(e.target.value)}
          placeholder="YouTube or MP4 link"
        />
      </div>
    </div>
  );
};
