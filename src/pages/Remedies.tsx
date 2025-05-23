
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Filter, Heart, Star, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const Remedies = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: remedies, isLoading } = useQuery({
    queryKey: ["remedies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("remedies")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const filteredRemedies = remedies?.filter(remedy =>
    remedy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    remedy.summary?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const featuredRemedies = filteredRemedies?.slice(0, 2) || [];
  const regularRemedies = filteredRemedies?.slice(2) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header Skeleton */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-10">
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-10 w-full rounded-full" />
          </div>
        </div>
        
        {/* Content Skeleton */}
        <div className="p-4 space-y-6">
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-48 w-full rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-40 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-10">
        <div className="p-4 space-y-4">
          {/* Top bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate(-1)}
                className="rounded-full touch-manipulation"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Natural Remedies</h1>
                <p className="text-sm text-muted-foreground">
                  {filteredRemedies?.length || 0} remedies available
                </p>
              </div>
            </div>
            
            <Button variant="ghost" size="icon" className="rounded-full touch-manipulation">
              <Filter className="h-5 w-5" />
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search remedies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 h-12 rounded-full border-0 bg-muted/50 focus-visible:ring-2 touch-manipulation"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pb-20">
        {featuredRemedies.length > 0 && (
          <div className="p-4 space-y-4">
            {/* Featured Section */}
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-semibold">Featured Remedies</h2>
            </div>

            {/* Featured Cards - Large format */}
            <div className="space-y-4">
              {featuredRemedies.map((remedy, index) => (
                <Link to={`/remedies/${remedy.id}`} key={remedy.id}>
                  <Card className="group overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card to-card/80">
                    <CardContent className="p-0">
                      <div className="relative h-48">
                        <img
                          src={remedy.image_url || "/placeholder.svg"}
                          alt={remedy.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute top-3 right-3">
                          <Badge variant="secondary" className="bg-white/90 text-foreground">
                            Popular
                          </Badge>
                        </div>
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-white text-xl font-bold mb-2 line-clamp-1">
                            {remedy.name}
                          </h3>
                          <p className="text-white/90 text-sm line-clamp-2 mb-3">
                            {remedy.summary}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-white text-sm font-medium">4.8</span>
                            </div>
                            <div className="flex items-center gap-1 text-white/80">
                              <Heart className="h-4 w-4" />
                              <span className="text-sm">2.3k</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Regular Remedies Grid */}
        {regularRemedies.length > 0 && (
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">All Remedies</h2>
            <div className="grid grid-cols-2 gap-3">
              {regularRemedies.map((remedy) => (
                <Link to={`/remedies/${remedy.id}`} key={remedy.id}>
                  <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300 h-full">
                    <CardContent className="p-0 h-full">
                      <div className="relative aspect-square overflow-hidden">
                        <img
                          src={remedy.image_url || "/placeholder.svg"}
                          alt={remedy.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <div className="p-3 space-y-2">
                        <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                          {remedy.name}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {remedy.summary}
                        </p>
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-medium">4.8</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-red-50 hover:text-red-500 transition-colors"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              // Handle favorite action
                            }}
                          >
                            <Heart className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredRemedies?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No remedies found</h3>
                <p className="text-muted-foreground">
                  {searchTerm 
                    ? `No remedies match "${searchTerm}"`
                    : "No remedies are available at the moment"
                  }
                </p>
              </div>
              {searchTerm && (
                <Button
                  variant="outline"
                  onClick={() => setSearchTerm("")}
                  className="touch-manipulation"
                >
                  Clear search
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Remedies;
