
import { HealthConcernSuggestions } from "@/components/admin/health-concerns/HealthConcernSuggestions";

const ManageHealthConcerns = () => {
  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto p-6">
        <HealthConcernSuggestions />
      </div>
    </div>
  );
};

export default ManageHealthConcerns;
