
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import SymptomsMarquee from "@/components/SymptomsMarquee";
import { Search } from "lucide-react";

interface Expert {
  id: string;
  full_name: string;
  image_url: string | null;
}

interface Remedy {
  id: string;
  name: string;
}

interface Symptom {
  id: string;
  symptom: string;
  brief_description: string | null;
  symptom_remedies: { remedy: Remedy }[];
  symptom_experts: { expert: Expert }[];
}

const Symptoms = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: symptoms, isLoading, error } = useQuery({
    queryKey: ["symptoms"],
    queryFn: async () => {
      console.log("Fetching symptoms...");
      const { data, error } = await supabase
        .from("symptom_details")
        .select(`
          id,
          symptom,
          brief_description,
          symptom_remedies(
            remedy(
              id,
              name
            )
          ),
          symptom_experts(
            expert(
              id,
              full_name,
              image_url
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase query error:", error);
        throw error;
      }

      console.log("Fetched symptoms data:", data);
      return data as Symptom[];
    },
  });

  const filteredSymptoms = symptoms?.filter((symptom) =>
    symptom.symptom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    symptom.brief_description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (error) {
    console.error("Query error:", error);
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary to-background pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Error loading symptoms</h1>
            <p className="mt-2 text-gray-600">Please try again later</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary to-background pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <Skeleton className="h-12 w-48 mb-4" />
            <Skeleton className="h-6 w-96" />
          </div>
          <Skeleton className="h-12 w-full mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  console.log("Filtered symptoms:", filteredSymptoms);

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Symptoms</h1>
          <p className="text-xl text-text-light">
            Explore common health symptoms and their natural remedies
          </p>
        </div>

        <SymptomsMarquee />

        <div className="my-8 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light h-5 w-5" />
          <Input
            type="search"
            placeholder="Search symptoms..."
            className="pl-10 w-full max-w-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Brief Description</TableHead>
                <TableHead className="text-center">Remedies</TableHead>
                <TableHead className="text-center">Experts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSymptoms?.map((symptom) => (
                <TableRow key={symptom.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <Link 
                      to={`/symptoms/${symptom.id}`}
                      className="text-primary hover:underline"
                    >
                      {symptom.symptom}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <p className="line-clamp-2 text-text-light">
                      {symptom.brief_description}
                    </p>
                  </TableCell>
                  <TableCell className="text-center">
                    {symptom.symptom_remedies?.length || 0}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center -space-x-2">
                      {symptom.symptom_experts?.slice(0, 3).map(({ expert }) => (
                        <img
                          key={expert.id}
                          src={expert.image_url || "/placeholder.svg"}
                          alt={expert.full_name}
                          className="w-8 h-8 rounded-full border-2 border-white"
                          title={expert.full_name}
                        />
                      ))}
                      {symptom.symptom_experts?.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm border-2 border-white">
                          +{symptom.symptom_experts.length - 3}
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Symptoms;
