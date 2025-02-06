import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Edit2, Trash2, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const ManageExpertsList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "remedies">("name");
  const [expertiseFilter, setExpertiseFilter] = useState<string>("all");

  const { data: experts = [], isLoading } = useQuery({
    queryKey: ["admin-experts", searchQuery, sortBy, expertiseFilter],
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

  const { data: suggestions = [] } = useQuery({
    queryKey: ["expert-suggestions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expert_suggestions")
        .select("*")
        .order("created_at", { ascending: false });

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

  const handleDeleteExpert = async (expertId: string) => {
    const { error } = await supabase
      .from("experts")
      .delete()
      .eq("id", expertId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete expert",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Expert deleted successfully",
      });
    }
  };

  const handleExpertClick = (expertId: string) => {
    navigate(`/experts/${expertId}`);
  };

  const handleApproveSuggestion = async (suggestion: any) => {
    const { error: insertError } = await supabase
      .from("experts")
      .insert([
        {
          full_name: suggestion.full_name,
          image_url: suggestion.image_url,
          social_media: suggestion.social_links,
          bio: suggestion.comment,
        },
      ]);

    if (insertError) {
      toast({
        title: "Error",
        description: "Failed to approve expert suggestion",
        variant: "destructive",
      });
      return;
    }

    const { error: updateError } = await supabase
      .from("expert_suggestions")
      .update({ status: "approved" })
      .eq("id", suggestion.id);

    if (updateError) {
      toast({
        title: "Error",
        description: "Failed to update suggestion status",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Expert suggestion approved successfully",
    });
  };

  const handleRejectSuggestion = async (suggestionId: string) => {
    const { error } = await supabase
      .from("expert_suggestions")
      .update({ status: "rejected" })
      .eq("id", suggestionId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to reject expert suggestion",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Expert suggestion rejected successfully",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="experts">
        <TabsList>
          <TabsTrigger value="experts">Experts</TabsTrigger>
          <TabsTrigger value="suggestions">
            Suggestions
            {suggestions.filter(s => s.status === "pending").length > 0 && (
              <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                {suggestions.filter(s => s.status === "pending").length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="experts">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Manage Experts</h2>
            <Button onClick={() => navigate("/admin/manage-experts/new")}>
              <Plus className="mr-2 h-4 w-4" /> Add New Expert
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
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
              value={expertiseFilter}
              onValueChange={(value) => setExpertiseFilter(value)}
            >
              <SelectTrigger>
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
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="remedies">Most Remedies</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Expertise</TableHead>
                  <TableHead className="text-center">Remedies</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {experts.map((expert) => (
                  <TableRow key={expert.id}>
                    <TableCell>
                      <img
                        src={expert.image_url || "/placeholder.svg"}
                        alt={expert.full_name}
                        className="w-12 h-12 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleExpertClick(expert.id)}
                      />
                    </TableCell>
                    <TableCell 
                      className="font-medium cursor-pointer hover:text-primary transition-colors"
                      onClick={() => handleExpertClick(expert.id)}
                    >
                      {expert.full_name}
                    </TableCell>
                    <TableCell>{expert.field_of_expertise}</TableCell>
                    <TableCell className="text-center">
                      {expert.expert_remedies?.[0]?.count || 0}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/admin/manage-experts/${expert.id}`)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteExpert(expert.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="suggestions">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suggestions.map((suggestion) => (
                  <TableRow key={suggestion.id}>
                    <TableCell>
                      <img
                        src={suggestion.image_url || "/placeholder.svg"}
                        alt={suggestion.full_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {suggestion.full_name}
                    </TableCell>
                    <TableCell>
                      {suggestion.website && (
                        <a
                          href={suggestion.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Visit website
                        </a>
                      )}
                    </TableCell>
                    <TableCell>{suggestion.comment}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        suggestion.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : suggestion.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {suggestion.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {suggestion.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleApproveSuggestion(suggestion)}
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRejectSuggestion(suggestion.id)}
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManageExpertsList;