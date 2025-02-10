
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import TextEditor from "@/components/ui/text-editor";

interface DescriptionSectionProps {
  briefDescription: string;
  fullDescription: string;
  onBriefDescriptionChange: (value: string) => void;
  onFullDescriptionChange: (value: string) => void;
}

const DescriptionSection = ({
  briefDescription,
  fullDescription,
  onBriefDescriptionChange,
  onFullDescriptionChange,
}: DescriptionSectionProps) => {
  return (
    <>
      <div>
        <Label htmlFor="brief_description">Brief Description</Label>
        <Textarea
          id="brief_description"
          value={briefDescription}
          onChange={(e) => onBriefDescriptionChange(e.target.value)}
          placeholder="Enter a brief summary of the ingredient..."
          className="h-20"
        />
      </div>

      <div>
        <Label htmlFor="full_description">Full Description</Label>
        <TextEditor
          content={fullDescription}
          onChange={onFullDescriptionChange}
        />
      </div>
    </>
  );
};

export default DescriptionSection;
