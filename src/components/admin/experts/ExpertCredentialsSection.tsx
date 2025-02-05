import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const ExpertCredentialsSection = () => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Credentials & Certifications</h3>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Credential
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <p className="text-muted-foreground text-sm">
            Coming soon: Add professional credentials, certifications, and specializations.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};