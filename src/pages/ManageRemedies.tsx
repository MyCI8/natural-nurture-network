
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ManageRemediesComponent from "@/components/admin/ManageRemedies";

const ManageRemedies = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto p-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="mb-6 hover:bg-accent/50 transition-all rounded-full w-10 h-10 touch-manipulation"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <ManageRemediesComponent />
      </div>
    </div>
  );
};

export default ManageRemedies;
