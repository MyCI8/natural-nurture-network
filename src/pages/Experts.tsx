import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Search, Filter, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const Experts = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [expertiseFilter, setExpertiseFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"name" | "remedies">("name");

  const { data: experts = [], isLoading } = useQuery({
    queryKey: ["experts", searchQuery, expertiseFilter, sortBy],
    queryFn: async () => {
      let query = supabase
        .from("experts")
        .select(`
          *,
          expert_remedies(count)
        `);

      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,field_of_expertise.ilike.%${searchQuery}%`);
      }

      if (expertiseFilter !== "all") {
        query = query.eq("field_of_expertise", expertiseFilter);
      }

      if (sortBy === "name") {
        query = query.order("full_name");
      } else {
        query = query.order("expert_remedies(count)", { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: expertiseFields = [] } = useQuery({
    queryKey: ["expertise-fields"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experts")
        .select("field_of_expertise")
        .not("field_of_expertise", "is", null);

      if (error) throw error;
      return [...new Set(data.map(e => e.field_of_expertise))].filter(Boolean);
    },
  });

  console.log("Experts data:", experts); // Add this line for debugging

  return (
    <Layout>
      <div className="min-h-screen bg-background pt-16">
        {/* Hero Section with Page Title and Brief */}
        <section className="relative bg-gradient-to-b from-secondary to-background py-20">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-center mb-4">Our Health Experts</h1>
            <p className="text-lg text-text-light text-center mb-8 max-w-2xl mx-auto">
              Connect with leading practitioners in natural medicine and holistic health. Our experts bring years of experience and deep knowledge to help you on your wellness journey.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search experts by name or expertise..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 shadow-md"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Experts Grid Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">Meet Our Experts</h2>
            
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <Select
                  value={expertiseFilter}
                  onValueChange={(value) => setExpertiseFilter(value)}
                >
                  <SelectTrigger className="w-[200px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by expertise" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Expertise</SelectItem>
                    {expertiseFields.map((field) => (
                      <SelectItem key={field} value={field || "unknown"}>
                        {field || "Unknown"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={sortBy}
                  onValueChange={(value: "name" | "remedies") => setSortBy(value)}
                >
                  <SelectTrigger className="w-[200px]">
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="remedies">Most Remedies</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={() => navigate("/suggest-expert")}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Suggest an Expert
              </Button>
            </div>

            {/* Experts Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center gap-4">
                      <Skeleton className="w-16 h-16 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-28" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {experts.map((expert) => (
                  <div
                    key={expert.id}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                    onClick={() => navigate(`/experts/${expert.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={expert.image_url || "/placeholder.svg"}
                        alt={expert.full_name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-secondary"
                      />
                      <div>
                        <h3 className="font-bold text-lg text-primary">
                          {expert.full_name}
                        </h3>
                        <p className="text-text-light text-sm">
                          {expert.field_of_expertise || "Alternative Medicine"}
                        </p>
                        <p className="text-primary text-sm mt-1 font-medium">
                          {expert.expert_remedies?.[0]?.count || 0} remedies
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {experts.length === 0 && !isLoading && (
              <div className="text-center py-12 bg-secondary/20 rounded-lg">
                <p className="text-text-light">No experts found matching your criteria.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Experts;