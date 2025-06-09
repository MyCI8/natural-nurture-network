
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import HealthConcernsMarquee from "@/components/HealthConcernsMarquee";
import { Search, ArrowLeft } from "lucide-react";

// Temporary data until migration is applied
const defaultHealthConcerns = [
  {
    id: '1',
    name: 'Sore Throat',
    brief_description: 'Pain or irritation in the throat, often due to infection or strain.',
    remedy_count: 0,
    expert_count: 0
  },
  {
    id: '2',
    name: 'Depression',
    brief_description: 'Persistent sadness or loss of interest in activities.',
    remedy_count: 0,
    expert_count: 0
  },
  {
    id: '3',
    name: 'Joint Pain',
    brief_description: 'Discomfort or stiffness in joints, often linked to arthritis.',
    remedy_count: 0,
    expert_count: 0
  },
  {
    id: '4',
    name: 'Anxiety',
    brief_description: 'Excessive worry or nervousness about everyday situations.',
    remedy_count: 0,
    expert_count: 0
  },
  {
    id: '5',
    name: 'Fatigue',
    brief_description: 'Ongoing tiredness not relieved by rest.',
    remedy_count: 0,
    expert_count: 0
  }
];

const HealthConcerns = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredHealthConcerns = defaultHealthConcerns.filter((concern) =>
    concern.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    concern.brief_description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pt-12 px-0 py-[30px]">
      <div className="max-w-[800px] mx-auto px-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="mb-6 hover:bg-accent/50 dark:hover:bg-accent-dark/50 transition-all rounded-full w-10 h-10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Health Concerns</h1>
          <p className="text-xl text-muted-foreground">
            Explore common health concerns and their natural remedies
          </p>
        </div>

        <HealthConcernsMarquee />

        <div className="my-8 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            type="search"
            placeholder="Search health concerns..."
            className="pl-10 w-full max-w-md bg-background dark:bg-muted/10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="bg-card dark:bg-card rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border dark:border-border">
                <TableHead>Name</TableHead>
                <TableHead>Brief Description</TableHead>
                <TableHead className="text-center">Remedies</TableHead>
                <TableHead className="text-center">Experts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHealthConcerns.map((concern) => (
                <TableRow
                  key={concern.id}
                  className="hover:bg-muted/50 dark:hover:bg-muted/10 border-border dark:border-border"
                >
                  <TableCell className="font-medium">
                    <Link
                      to={`/health-concerns/${concern.id}`}
                      className="text-primary hover:underline"
                    >
                      {concern.name}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <p className="line-clamp-2 text-muted-foreground">
                      {concern.brief_description || 'No description available'}
                    </p>
                  </TableCell>
                  <TableCell className="text-center">
                    {concern.remedy_count}
                  </TableCell>
                  <TableCell className="text-center">
                    {concern.expert_count}
                  </TableCell>
                </TableRow>
              ))}
              {filteredHealthConcerns.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <p className="text-muted-foreground">No health concerns found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default HealthConcerns;
