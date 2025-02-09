
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
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="mb-6 hover:bg-accent/50 transition-all rounded-full w-10 h-10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Manage Experts</h1>
        <Routes>
          <Route index element={<ManageExpertsList />} />
          <Route path=":id" element={<EditExpert />} />
        </Routes>
      </div>
    </div>
  );
};

export default ManageExperts;
