import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import RemedyForm from "./RemedyForm";
import { Database } from "@/integrations/supabase/types";

type SymptomType = Database['public']['Enums']['symptom_type'];

const defaultSymptoms: SymptomType[] = [
  'Cough', 'Cold', 'Sore Throat', 'Cancer', 'Stress', 
  'Anxiety', 'Depression', 'Insomnia', 'Headache', 'Joint Pain',
  'Digestive Issues', 'Fatigue', 'Skin Irritation', 'High Blood Pressure', 'Allergies',
  'Weak Immunity', 'Back Pain', 'Poor Circulation', 'Hair Loss', 'Eye Strain'
];

const ManageRemedies = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [symptomFilter, setSymptomFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<"popularity" | "recent">("recent");
  const [showForm, setShowForm] = useState(false);

  const { data: remedies = [], isLoading } = useQuery({
    queryKey: ["admin-remedies", searchQuery, symptomFilter, sortBy],
    queryFn: async () => {
      let query = supabase
        .from("remedies")
        .select(`
          *,
          experts:expert_remedies(
            expert:experts(*)
          )
        `);

      if (searchQuery) {
        query = query.ilike("name", `%${searchQuery}%`);
      }

      if (symptomFilter) {
        query = query.contains("symptoms", [symptomFilter]);
      }

      if (sortBy === "popularity") {
        query = query.order("click_count", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Remedies</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add New Remedy
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search remedies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        <Select value={symptomFilter} onValueChange={setSymptomFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by symptom" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Symptoms</SelectItem>
            {defaultSymptoms.map((symptom) => (
              <SelectItem key={symptom} value={symptom}>
                {symptom}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sortBy}
          onValueChange={(value: "popularity" | "recent") => setSortBy(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="popularity">Most Popular</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {remedies.map((remedy) => (
          <Card key={remedy.id}>
            <CardContent className="p-4">
              <div className="aspect-video mb-4">
                <img
                  src={remedy.image_url}
                  alt={remedy.name}
                  className="w-full h-full object-cover rounded"
                />
              </div>
              <h3 className="font-semibold mb-2">{remedy.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">
                {remedy.summary}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowForm(true)}
                >
                  Edit
                </Button>
                <Button variant="destructive" size="sm">
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showForm && <RemedyForm onClose={() => setShowForm(false)} />}
    </div>
  );
};

export default ManageRemedies;