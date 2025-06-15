import { useQuery } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Search, Filter, Heart, Star, MessageCircle, Share2, Bookmark } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import PopularRemedies from "@/components/remedies/PopularRemedies";
import { migrateRemedyImages } from "@/utils/remedyImageMigration";

const Remedies = () => {
  const navigate = useNavigate();
  const location = useLocation(); // in case it's needed
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Run migration on page load
  useEffect(() => {
    migrateRemedyImages();
  }, []);
  
  const { data: remedies, isLoading, error } = useQuery({
    queryKey: ["remedies"],
    queryFn: async () => {
      console.log('Fetching remedies...');
      
      // Fetch all remedies (both published and draft) to debug the issue
      const { data, error } = await supabase
        .from("remedies")
        .select("*")
        .in("status", ["published", "draft"]) // Include both published and draft
        .order("created_at", { ascending: false });

      if (error) {
        console.error('Error fetching remedies:', error);
        throw error;
      }
      
      console.log('Fetched remedies count:', data?.length || 0);
      console.log('Remedies data:', data);
      
      // Log remedy statuses and images for debugging
      if (data) {
        const statusCounts = data.reduce((acc, remedy) => {
          acc[remedy.status] = (acc[remedy.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        console.log('Remedy status breakdown:', statusCounts);
        
        // Check specific remedies we're having issues with
        const parasiteRemedy = data.find(r => r.name?.includes('Parasite Cleanse'));
        const mitochondriaRemedy = data.find(r => r.name?.includes('mitochondria'));
        
        if (parasiteRemedy) {
          console.log('Parasite Cleanse remedy:', {
            name: parasiteRemedy.name,
            image_url: parasiteRemedy.image_url,
            status: parasiteRemedy.status
          });
        }
        
        if (mitochondriaRemedy) {
          console.log('Mitochondria remedy:', {
            name: mitochondriaRemedy.name,
            image_url: mitochondriaRemedy.image_url,
            status: mitochondriaRemedy.status
          });
        }
      }
      
      return data || [];
    },
  });

  const filteredRemedies = remedies?.filter(remedy => {
    // Ensure remedy has required fields
    if (!remedy.name) {
      console.warn('Remedy missing name:', remedy);
      return false;
    }
    
    const searchText = searchTerm.toLowerCase();
    const name = (remedy.name || '').toLowerCase();
    const summary = (remedy.summary || '').toLowerCase();
    const briefDescription = (remedy.brief_description || '').toLowerCase();
    
    return name.includes(searchText) || 
           summary.includes(searchText) || 
           briefDescription.includes(searchText);
  });

  const handleSearchIconClick = () => {
    if (isMobile) {
      setIsSearchExpanded(!isSearchExpanded);
      if (!isSearchExpanded) {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 150);
      }
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isMobile) {
      setIsSearchExpanded(false);
      setSearchTerm("");
    }
  };

  // Click-away logic for mobile search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobile &&
        isSearchExpanded &&
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchExpanded(false);
        setSearchTerm("");
      }
    };

    if (isSearchExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchExpanded, isMobile]);

  useEffect(() => {
    if (!isSearchExpanded && isMobile) {
      setSearchTerm("");
    }
  }, [isSearchExpanded, isMobile]);

  // Instead of modal: navigate directly to the remedy page
  const handleRemedyClick = (remedy: any) => {
    navigate(`/remedies/${remedy.id}`);
  };

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
          text: remedy.summary || remedy.brief_description,
          url: `${window.location.origin}/remedies/${remedy.id}`,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/remedies/${remedy.id}`);
    }
  };

  if (error) {
    console.error('Remedies query error:', error);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Error loading remedies</h2>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header Skeleton */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-10">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-5 w-5" />
              </div>
              <Skeleton className="h-10 w-64 rounded-full" />
            </div>
          </div>
        </div>
        
        {/* Content Skeleton */}
        <div className="px-2 space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-80 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Remedy Feed Implementation (Updated)
  const RemedyFeed = () => (
    <div className="flex flex-col gap-6 max-w-lg mx-auto w-full">
      {filteredRemedies && filteredRemedies.length > 0 ? (
        filteredRemedies.map((remedy) => (
          <div
            key={remedy.id}
            tabIndex={0}
            className="group touch-manipulation select-none outline-none transition-all duration-200"
            style={{ WebkitTapHighlightColor: "transparent" }}
            onClick={() => handleRemedyClick(remedy)}
            role="button"
            aria-label={`View remedy: ${remedy.name}`}
          >
            {/* Title */}
            {remedy.name && (
              <h3 className="text-black font-bold text-xl leading-tight mb-3 px-2">
                {remedy.name}
              </h3>
            )}
            
            {/* Image */}
            <div className="relative w-full flex justify-center items-center bg-transparent">
              <img
                src={remedy.image_url || "/placeholder.svg"}
                alt={remedy.name || "Remedy"}
                className="w-full object-contain rounded-xl"
                style={{
                  maxHeight: 400,
                  minHeight: 200,
                }}
                draggable={false}
              />
            </div>
            
            {/* Description and social actions */}
            <div className="flex flex-col gap-3 pt-3 px-2">
              {remedy.summary || remedy.brief_description ? (
                <p className="text-sm text-muted-foreground leading-snug line-clamp-3">
                  {remedy.summary || remedy.brief_description}
                </p>
              ) : null}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 !px-2 hover:text-red-500"
                    onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSave(remedy.id, e);
                    }}
                  >
                    <Heart className="h-4 w-4" />
                    <span className="text-xs">2.3k</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 !px-2"
                    onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-xs">156</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 !px-2"
                    onClick={e => {
                      handleShare(remedy, e);
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="!px-2"
                    onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSave(remedy.id, e);
                    }}
                  >
                    <Bookmark className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-medium">4.8</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
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
                  : remedies && remedies.length === 0 
                    ? "No remedies are available. Try creating your first remedy!"
                    : "No remedies match your search"
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
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-10">
        <div className="p-4">
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
              <h1 className="text-xl font-bold text-black">Natural Remedies</h1>
              <Button variant="ghost" size="icon" className="rounded-full touch-manipulation">
                <Filter className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex items-center">
              {isMobile ? (
                <div className="flex items-center">
                  <div 
                    ref={searchContainerRef}
                    className="relative flex items-center"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleSearchIconClick}
                      className={`rounded-full touch-manipulation transition-all duration-300 ${
                        isSearchExpanded ? 'opacity-0 pointer-events-none absolute' : 'opacity-100'
                      }`}
                    >
                      <Search className="h-5 w-5" />
                    </Button>
                    
                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isSearchExpanded ? 'w-48' : 'w-0'
                    }`}>
                      <Input
                        ref={searchInputRef}
                        placeholder="Search remedies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        className="h-9 rounded-xl border shadow-inner bg-white focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 touch-manipulation text-sm px-3"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                // Desktop Search
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search remedies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 h-10 rounded-full border-0 bg-muted/50 focus-visible:ring-2"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Remedy Feed */}
      <div className="flex flex-col w-full items-center">
        {isMobile ? (
          <Tabs defaultValue="remedies" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mx-2 mt-4">
              <TabsTrigger value="remedies">Remedies</TabsTrigger>
              <TabsTrigger value="popular">Popular</TabsTrigger>
            </TabsList>
            <TabsContent value="remedies" className="pt-3">
              <RemedyFeed />
            </TabsContent>
            <TabsContent value="popular" className="pt-3">
              <PopularRemedies />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="pt-6 pb-10 w-full">
            <RemedyFeed />
          </div>
        )}
      </div>
    </div>
  );
};

export default Remedies;
