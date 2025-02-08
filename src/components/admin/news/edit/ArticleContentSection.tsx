
import TextEditor from "@/components/ui/text-editor";

interface ArticleContentSectionProps {
  content: string;
  onChange: (content: string) => void;
}

export const ArticleContentSection = ({
  content,
  onChange,
}: ArticleContentSectionProps) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Content</h3>
      <TextEditor 
        content={content || ""} 
        onChange={onChange}
      />
    </div>
  );
};
