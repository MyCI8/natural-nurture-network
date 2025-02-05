import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
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

const ManageExpertsList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "name">("recent");

  const { data: experts = [], isLoading } = useQuery({
    queryKey: ["admin-experts", searchQuery, sortBy],
    queryFn: async () => {
      let query = supabase
        .from("experts")
        .select("*");

      if (searchQuery) {
        query = query.ilike("full_name", `%${searchQuery}%`);
      }

      if (sortBy === "name") {
        query = query.order("full_name", { ascending: true });
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
        <h2 className="text-2xl font-bold">Manage Experts</h2>
        <Button onClick={() => navigate("/admin/manage-experts/new")}>
          <Plus className="mr-2 h-4 w-4" /> Add New Expert
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="relative">
          <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search experts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        <Select
          value={sortBy}
          onValueChange={(value: "recent" | "name") => setSortBy(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {experts.map((expert) => (
          <Card key={expert.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="aspect-square mb-4">
                <img
                  src={expert.image_url || "/placeholder.svg"}
                  alt={expert.full_name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <h3 className="font-semibold mb-1">{expert.full_name}</h3>
              <p className="text-sm text-muted-foreground mb-2">{expert.title}</p>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {expert.bio}
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate(`/admin/manage-experts/${expert.id}`)}
              >
                Edit Expert
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ManageExpertsList;