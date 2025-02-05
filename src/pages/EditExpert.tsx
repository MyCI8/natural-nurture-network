import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ExpertForm } from "@/components/admin/experts/ExpertForm";

const EditExpert = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/manage-experts")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Experts
          </Button>
          <h1 className="text-3xl font-bold">
            {id ? "Edit Expert" : "Add New Expert"}
          </h1>
        </div>
        <ExpertForm expertId={id} />
      </div>
    </div>
  );
};

export default EditExpert;