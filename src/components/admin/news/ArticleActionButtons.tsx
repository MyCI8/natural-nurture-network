
import { ArrowLeft, Eye, Save, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface ArticleActionButtonsProps {
  onBack: () => void;
  onSave: (articleData: any, relatedLinks: any[], shouldPublish: boolean) => void;
  formData: any;
  relatedLinks: any[];
}

export const ArticleActionButtons = ({ 
  onBack, 
  onSave,
  formData,
  relatedLinks 
}: ArticleActionButtonsProps) => {
  const { toast } = useToast();

  const handlePreview = () => {
    toast({
      title: "Info",
      description: "Preview functionality coming soon",
    });
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to News
      </Button>
      <div className="space-x-2">
        <Button variant="outline" onClick={handlePreview}>
          <Eye className="mr-2 h-4 w-4" />
          Preview
        </Button>
        <Button variant="outline" onClick={() => onSave(formData, relatedLinks, false)}>
          <Save className="mr-2 h-4 w-4" />
          Save Draft
        </Button>
        <Button onClick={() => onSave(formData, relatedLinks, true)}>
          <Send className="mr-2 h-4 w-4" />
          Publish
        </Button>
      </div>
    </div>
  );
};
