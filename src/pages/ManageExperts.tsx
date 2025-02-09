
import { ArrowLeft } from "lucide-react";
import { useNavigate, Routes, Route } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ManageExpertsList from "@/components/admin/ManageExpertsList";
import EditExpert from "./EditExpert";

const ManageExperts = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Manage Experts</h1>
        </div>
        <Routes>
          <Route index element={<ManageExpertsList />} />
          <Route path=":id" element={<EditExpert />} />
        </Routes>
      </div>
    </div>
  );
};

export default ManageExperts;
