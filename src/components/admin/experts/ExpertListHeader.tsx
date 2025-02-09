
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ExpertListHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Manage Experts</h2>
      <Button onClick={() => navigate("/admin/manage-experts/new")}>
        <Plus className="mr-2 h-4 w-4" /> Add New Expert
      </Button>
    </div>
  );
};

export default ExpertListHeader;
