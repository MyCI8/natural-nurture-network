
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Check, X } from "lucide-react";
import { format } from "date-fns";

type EntryType = "all" | "users" | "experts" | "remedies" | "ingredients" | "comments";

const RecentEntries = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [entryType, setEntryType] = useState<EntryType>("all");

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["recent-entries", entryType],
    queryFn: async () => {
      const limit = 10;
      const queries = [];

      if (entryType === "all" || entryType === "users") {
        queries.push(
          supabase
            .from("profiles")
            .select("id, full_name, created_at, account_status")
            .order("created_at", { ascending: false })
            .limit(limit)
        );
      }

      if (entryType === "all" || entryType === "experts") {
        queries.push(
          supabase
            .from("experts")
            .select("id, full_name, created_at")
            .order("created_at", { ascending: false })
            .limit(limit)
        );
      }

      if (entryType === "all" || entryType === "remedies") {
        queries.push(
          supabase
            .from("remedies")
            .select("id, name, created_at, status")
            .order("created_at", { ascending: false })
            .limit(limit)
        );
      }

      if (entryType === "all" || entryType === "ingredients") {
        queries.push(
          supabase
            .from("ingredients")
            .select("id, name, created_at, status")
            .order("created_at", { ascending: false })
            .limit(limit)
        );
      }

      if (entryType === "all" || entryType === "comments") {
        queries.push(
          supabase
            .from("comments")
            .select("id, content, created_at, status")
            .order("created_at", { ascending: false })
            .limit(limit)
        );
      }

      const results = await Promise.all(queries);
      const allEntries = results.flatMap((result, index) => {
        if (result.error) throw result.error;
        const type = ["users", "experts", "remedies", "ingredients", "comments"][index];
        return result.data.map((item: any) => ({ ...item, type }));
      });

      return allEntries.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ).slice(0, limit);
    },
  });

  const handleModerateComment = async (commentId: string, approve: boolean) => {
    try {
      const { error } = await supabase
        .from("comments")
        .update({ status: approve ? "approved" : "rejected" })
        .eq("id", commentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Comment ${approve ? "approved" : "rejected"} successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to moderate comment",
        variant: "destructive",
      });
    }
  };

  const getEntryTitle = (entry: any) => {
    switch (entry.type) {
      case "users":
      case "experts":
        return entry.full_name;
      case "remedies":
      case "ingredients":
        return entry.name;
      case "comments":
        return entry.content.length > 50
          ? `${entry.content.substring(0, 50)}...`
          : entry.content;
      default:
        return "Unknown";
    }
  };

  const getEntryLink = (entry: any) => {
    switch (entry.type) {
      case "users":
        return `/admin/users/${entry.id}`;
      case "experts":
        return `/admin/manage-experts/${entry.id}`;
      case "remedies":
        return `/admin/remedies/edit/${entry.id}`;
      case "ingredients":
        return `/admin/ingredients/${entry.id}`;
      case "comments":
        return `/admin/comments/${entry.id}`;
      default:
        return "#";
    }
  };

  const getStatusBadge = (entry: any) => {
    const status = entry.status || entry.account_status || "active";
    const variant = 
      status === "pending" ? "warning" :
      status === "approved" || status === "active" || status === "published" ? "success" :
      "destructive";

    return (
      <Badge variant={variant as any}>{status}</Badge>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Recent Entries</h2>
        <Select value={entryType} onValueChange={(value) => setEntryType(value as EntryType)}>
          <SelectTrigger className="w-[180px] bg-background">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent className="bg-background">
            <SelectItem value="all">All Entries</SelectItem>
            <SelectItem value="users">Users</SelectItem>
            <SelectItem value="experts">Experts</SelectItem>
            <SelectItem value="remedies">Remedies</SelectItem>
            <SelectItem value="ingredients">Ingredients</SelectItem>
            <SelectItem value="comments">Comments</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Title/Name</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry: any) => (
              <TableRow key={`${entry.type}-${entry.id}`}>
                <TableCell className="capitalize">{entry.type}</TableCell>
                <TableCell>{getEntryTitle(entry)}</TableCell>
                <TableCell>
                  {format(new Date(entry.created_at), "MMM d, yyyy HH:mm")}
                </TableCell>
                <TableCell>{getStatusBadge(entry)}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(getEntryLink(entry))}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {entry.type === "comments" && entry.status === "pending" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600"
                          onClick={() => handleModerateComment(entry.id, true)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600"
                          onClick={() => handleModerateComment(entry.id, false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default RecentEntries;
