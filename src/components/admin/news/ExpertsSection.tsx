import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Expert {
  id: string;
  full_name: string;
  title: string;
  bio?: string;
}

interface ExpertsSectionProps {
  experts: Expert[];
  selectedExperts: string[];
  setSelectedExperts: (experts: string[]) => void;
  onExpertAdded: () => void;
}

export const ExpertsSection = ({
  experts,
  selectedExperts,
  setSelectedExperts,
  onExpertAdded,
}: ExpertsSectionProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newExpert, setNewExpert] = useState({
    full_name: "",
    title: "",
    bio: "",
  });
  const { toast } = useToast();

  const handleExpertCreate = async () => {
    try {
      const { data, error } = await supabase
        .from("experts")
        .insert([newExpert])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Expert added successfully",
      });

      setIsDialogOpen(false);
      setNewExpert({ full_name: "", title: "", bio: "" });
      onExpertAdded();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add expert",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Related Experts</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Expert
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Expert</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input
                  value={newExpert.full_name}
                  onChange={(e) =>
                    setNewExpert({ ...newExpert, full_name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Title</Label>
                <Input
                  value={newExpert.title}
                  onChange={(e) =>
                    setNewExpert({ ...newExpert, title: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Bio</Label>
                <Textarea
                  value={newExpert.bio}
                  onChange={(e) =>
                    setNewExpert({ ...newExpert, bio: e.target.value })
                  }
                />
              </div>
              <Button onClick={handleExpertCreate}>Create Expert</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Select
        value={selectedExperts[0]}
        onValueChange={(value) => setSelectedExperts([value])}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select an expert" />
        </SelectTrigger>
        <SelectContent>
          {experts.map((expert) => (
            <SelectItem key={expert.id} value={expert.id}>
              {expert.full_name} - {expert.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};