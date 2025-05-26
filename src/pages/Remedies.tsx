
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Filter, Heart, Star, MessageCircle, Share2, Bookmark } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import PopularRemedies from "@/components/remedies/PopularRemedies";
import MediaContainer from "@/components/ui/media-container";

const Remedies = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
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

  const handleSave = async (remedyId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Save remedy:", remedyId);
    // TODO: Implement save functionality
  };

  const handleShare = async (remedy: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: remedy.name,
          text: remedy.summary,
          url: `${window.location.origin}/remedies/${remedy.id}`,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/remedies/${remedy.id}`);
    }
  };

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
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const RemedyFeed = () => (
    <div className="space-y-4">
      {filteredRemedies?.map((remedy) => (
        <Link to={`/remedies/${remedy.id}`} key={remedy.id}>
          <Card className="x-media-card group overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-0">
              <MediaContainer 
                aspectRatio="auto"
                imageUrl={remedy.image_url || "/placeholder.svg"}
                imageAlt={remedy.name}
                className="bg-muted"
              >
                <img
                  src={remedy.image_url || "/placeholder.svg"}
                  alt={remedy.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white text-xl font-bold mb-2 line-clamp-2">
                    {remedy.name}
                  </h3>
                  <p className="text-white/90 text-sm line-clamp-2 mb-3">
                    {remedy.summary}
                  </p>
                </div>
              </MediaContainer>
              
              {/* Social Actions */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 hover:bg-red-50 hover:text-red-500"
                      onClick={(e) => handleSave(remedy.id, e)}
                    >
                      <Heart className="h-4 w-4" />
                      <span className="text-sm">2.3k</span>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-sm">156</span>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2"
                      onClick={(e) => handleShare(remedy, e)}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleSave(remedy.id, e)}
                    >
                      <Bookmark className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">4.8</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-10">
        <div className="p-4 space-y-4">
          {/* Top bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isMobile && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => navigate(-1)}
                  className="rounded-full touch-manipulation"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
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
        {isMobile ? (
          <Tabs defaultValue="remedies" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mx-4 mt-4">
              <TabsTrigger value="remedies">Remedies</TabsTrigger>
              <TabsTrigger value="popular">Popular</TabsTrigger>
            </TabsList>
            
            <TabsContent value="remedies" className="p-4 mt-4">
              <RemedyFeed />
            </TabsContent>
            
            <TabsContent value="popular" className="p-4 mt-4">
              <PopularRemedies />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="p-4">
            <RemedyFeed />
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
