
import TextEditor from "@/components/ui/text-editor";

interface RemedyContentSectionProps {
  content: string;
  onChange: (content: string) => void;
}

export const RemedyContentSection = ({
  content,
  onChange,
}: RemedyContentSectionProps) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Content</h3>
      <TextEditor 
        content={content} 
        onChange={onChange}
      />
    </div>
  );
};
