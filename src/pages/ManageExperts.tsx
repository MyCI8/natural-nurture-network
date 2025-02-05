import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ExpertDetailsSection } from "@/components/admin/experts/ExpertDetailsSection";
import { ImageManagementSection } from "@/components/admin/experts/ImageManagementSection";
import { ExpertCredentialsSection } from "@/components/admin/experts/ExpertCredentialsSection";

const ManageExperts = () => {
  const { id } = useParams();
  const isNewExpert = id === 'new';
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [fullName, setFullName] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const { data: expert, isLoading } = useQuery({
    queryKey: ["expert", id],
    queryFn: async () => {
      if (isNewExpert) return null;
      
      const { data, error } = await supabase
        .from("experts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !isNewExpert,
  });

  const handleSave = async () => {
    try {
      const expertData = {
        full_name: fullName,
        title,
        bio,
        image_url: imageUrl,
        updated_at: new Date().toISOString(),
      };

      if (isNewExpert) {
        const { data: newExpert, error } = await supabase
          .from("experts")
          .insert([expertData])
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "Success",
          description: "Expert created successfully",
        });
      } else {
        const { error } = await supabase
          .from("experts")
          .update(expertData)
          .eq("id", id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Expert updated successfully",
        });
      }
      
      navigate("/admin/manage-experts");
    } catch (error) {
      toast({
        title: "Error",
        description: isNewExpert ? "Failed to create expert" : "Failed to update expert",
        variant: "destructive",
      });
    }
  };

  if (isLoading && !isNewExpert) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/manage-experts")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Experts
          </Button>
          <div className="space-x-2">
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Expert
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            <ExpertDetailsSection
              fullName={fullName}
              setFullName={setFullName}
              title={title}
              setTitle={setTitle}
              bio={bio}
              setBio={setBio}
            />

            <ExpertCredentialsSection />
          </div>

          <div className="space-y-6">
            <ImageManagementSection
              imageUrl={imageUrl}
              setImageUrl={setImageUrl}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageExperts;