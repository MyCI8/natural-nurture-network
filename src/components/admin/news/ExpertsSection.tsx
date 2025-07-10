
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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";
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
      onExpertAdded(); // This will trigger a refresh of the experts list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add expert",
        variant: "destructive",
      });
    }
  };

  const handleExpertSelect = (value: string) => {
    if (!selectedExperts.includes(value)) {
      setSelectedExperts([...selectedExperts, value]);
    }
  };

  const removeExpert = (expertId: string) => {
    setSelectedExperts(selectedExperts.filter(id => id !== expertId));
  };

  const getExpertName = (id: string) => {
    const expert = experts.find(e => e.id === id);
    return expert ? expert.full_name : "Unknown Expert";
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Related Experts</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="touch-manipulation">
              <Plus className="h-4 w-4 mr-2" />
              Add Expert
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-background">
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

      <div className="relative">
        <Select onValueChange={handleExpertSelect}>
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Select an expert" />
          </SelectTrigger>
          <SelectContent className="bg-background z-50 max-h-60 overflow-y-auto">
            {experts.map((expert) => (
              <SelectItem key={expert.id} value={expert.id}>
                {expert.full_name} - {expert.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="mt-4 flex flex-wrap gap-2">
          {selectedExperts.map((expertId) => (
            <Badge 
              key={expertId} 
              variant="secondary"
              className="flex items-center gap-1 px-3 py-1 touch-manipulation"
            >
              {getExpertName(expertId)}
              <X
                className="h-3 w-3 cursor-pointer ml-1"
                onClick={() => removeExpert(expertId)}
              />
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};
