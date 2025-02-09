
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ManageUsers = () => {
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
        <div className="text-center py-8">
          <h2 className="text-2xl font-semibold mb-4">User Management</h2>
          <p className="text-muted-foreground">
            User management functionality will be implemented soon.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
