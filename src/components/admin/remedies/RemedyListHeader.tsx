
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const RemedyListHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Manage Remedies</h2>
      <Button onClick={() => navigate(`/admin/remedies/edit/new`)}>
        <Plus className="mr-2 h-4 w-4" /> Add New Remedy
      </Button>
    </div>
  );
};

export default RemedyListHeader;
