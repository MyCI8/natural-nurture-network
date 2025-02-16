
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const EditVideo = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto p-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="mb-6 hover:bg-accent/50 transition-all rounded-full w-10 h-10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold mb-6">Edit Video</h1>
        {/* Full implementation coming soon */}
        <p>Video editing functionality will be implemented in the next phase.</p>
      </div>
    </div>
  );
};

export default EditVideo;
