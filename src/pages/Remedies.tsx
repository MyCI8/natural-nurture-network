import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Search, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import PopularRemedies from "@/components/remedies/PopularRemedies";
import { migrateRemedyImages } from "@/utils/remedyImageMigration";
import { useInfiniteRemedies } from "@/hooks/useInfiniteRemedies";
import { useInView } from "react-intersection-observer";
import { Tables } from "@/integrations/supabase/types";
import RemedyFeed from "@/components/remedies/RemedyFeed";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import RemedyRatingModal from "@/components/remedies/RemedyRatingModal";
import RemedyRatingDisplay from "@/components/remedies/RemedyRatingDisplay";

type Remedy = Tables<'remedies'>;

const Remedies = () => {
  const navigate = useNavigate();
  const location = useLocation(); // in case it's needed
  const isMobile = useIsMobile();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const { ref: loadMoreRef, inView } = useInView();
  const [remedyToRate, setRemedyToRate] = useState<Remedy | null>(null);

  // Run migration on page load
  useEffect(() => {
    migrateRemedyImages();
  }, []);
  
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteRemedies(searchTerm);
  
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const remedies = data?.pages.flatMap(page => page) ?? [];

  // Fetch user's likes for remedies
  const { data: userLikesData } = useQuery({
    queryKey: ['remedyLikes', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return [];
      const { data, error } = await (supabase as any)
        .from('remedy_likes')
        .select('remedy_id')
        .eq('user_id', currentUser.id);

      if (error) {
        console.error('Error fetching remedy likes:', error.message);
        return [];
      }
      return data?.map((like: any) => like.remedy_id) ?? [];
    },
    enabled: !!currentUser,
  });
  const userRemedyLikes = new Set<string>(userLikesData);

  // Fetch user's saved remedies
  const { data: userSavesData } = useQuery({
    queryKey: ['savedRemediesList', currentUser?.id], // Unique key for this list
    queryFn: async () => {
      if (!currentUser) return [];
      const { data, error } = await (supabase as any)
        .from('saved_remedies')
        .select('remedy_id')
        .eq('user_id', currentUser.id);
      
      if (error) {
        console.error('Error fetching saved remedies list:', error.message);
        return [];
      }
      return data?.map((save: any) => save.remedy_id) ?? [];
    },
    enabled: !!currentUser,
  });
  const userSavedRemedies = new Set<string>(userSavesData);

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
  const handleRemedyClick = (remedy: Remedy) => {
    navigate(`/remedies/${remedy.id}`);
  };

  const handleLike = async (remedyId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
      toast({ title: "Please sign in to like remedies.", variant: "destructive" });
      navigate('/auth');
      return;
    }

    const isLiked = userRemedyLikes.has(remedyId);
    
    try {
      if (isLiked) {
        const { error } = await (supabase as any)
          .from('remedy_likes')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('remedy_id', remedyId);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any)
          .from('remedy_likes')
          .insert({ user_id: currentUser.id, remedy_id: remedyId });
        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['remedyLikes', currentUser.id] });
    } catch (error) {
      console.error("Error liking/unliking remedy:", error);
      toast({ title: "Something went wrong", description: "Could not update like status.", variant: "destructive" });
    }
  };

  const handleSave = async (remedyId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
      toast({ title: "Please sign in to save remedies.", variant: "destructive" });
      navigate('/auth');
      return;
    }
    
    const isSaved = userSavedRemedies.has(remedyId);

    try {
      if (isSaved) {
        const { error } = await (supabase as any)
          .from('saved_remedies')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('remedy_id', remedyId);
        if (error) throw error;
        toast({ title: "Remedy removed from your saved list." });
      } else {
        const { error } = await (supabase as any)
          .from('saved_remedies')
          .insert({ user_id: currentUser.id, remedy_id: remedyId });
        if (error) throw error;
        toast({ title: "Remedy saved!", description: "You can find it in your profile." });
      }
      
      queryClient.invalidateQueries({ queryKey: ['savedRemediesList', currentUser.id] });
      queryClient.invalidateQueries({ queryKey: ['savedRemedies', currentUser.id] });
    } catch (error) {
      console.error("Error saving/unsaving remedy:", error);
      toast({ title: "Something went wrong", description: "Could not save remedy.", variant: "destructive" });
    }
  };

  const handleShare = async (remedy: Remedy, e: React.MouseEvent) => {
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

  const handleOpenRatingModal = (remedy: Remedy) => {
    if (!currentUser) {
      toast({ title: "Please sign in to rate remedies.", variant: "destructive" });
      navigate('/auth');
      return;
    }
    setRemedyToRate(remedy);
  };

  // ========= Fetch ratings =========
  // We'll get the ratings for all loaded remedies and store by remedy id.
  const remedyIds = data?.pages.flatMap(p => p.map((r: any) => r.id)).filter(Boolean) ?? [];

  // Fetch average rating and count per remedy
  const { data: allRatings } = useQuery({
    queryKey: ['remedyRatings', remedyIds.join(",")],
    enabled: remedyIds.length > 0,
    queryFn: async () => {
      if (!remedyIds.length) return {};
      const { data, error } = await supabase
        .from('remedy_ratings')
        .select('remedy_id, rating')
        .in('remedy_id', remedyIds);
      if (error) throw error;
      // For each remedy id, calculate avg and count
      const byId = {};
      remedyIds.forEach((id: string) => {
        const ratings = (data || []).filter((r: any) => r.remedy_id === id);
        if (ratings.length) {
          const avg = ratings.reduce((a, b) => a + b.rating, 0) / ratings.length;
          byId[id] = { average: avg, count: ratings.length };
        } else {
          byId[id] = { average: 0, count: 0 };
        }
      });
      return byId;
    }
  });

  // Fetch this user's ratings for loaded remedies
  const { data: userRatings } = useQuery({
    queryKey: ["userRemedyRatings", currentUser?.id, remedyIds.join(",")],
    enabled: !!currentUser && remedyIds.length > 0,
    queryFn: async () => {
      if (!currentUser || !remedyIds.length) return {};
      const { data, error } = await supabase
        .from('remedy_ratings')
        .select('remedy_id, rating')
        .eq('user_id', currentUser.id)
        .in('remedy_id', remedyIds);
      if (error) throw error;
      // Map: remedyId -> rating
      const ratings = {};
      for (const { remedy_id, rating } of data || []) {
        ratings[remedy_id] = rating;
      }
      return ratings;
    }
  });

  const handleRatingSubmit = async (rating: number) => {
    if (!remedyToRate || !currentUser) {
      toast({ title: "You must be logged in to rate.", variant: "destructive" });
      return;
    }
    const { error } = await (supabase as any).from('remedy_ratings').upsert(
      {
        remedy_id: remedyToRate.id,
        user_id: currentUser.id,
        rating: rating,
      },
      { onConflict: 'user_id,remedy_id' }
    );
    if (error) {
      toast({
        title: 'Error submitting rating',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Rating submitted!',
        description: `You gave "${remedyToRate.name}" ${rating} star(s).`,
      });
      // Invalidate rating caches so UI refreshes
      queryClient.invalidateQueries({ queryKey: ['remedyRatings'] });
      queryClient.invalidateQueries({ queryKey: ['userRemedyRatings'] });
    }
    setRemedyToRate(null);
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
  // The RemedyFeed component has been extracted to its own file.

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
              <RemedyFeed
                remedies={remedies}
                handleRemedyClick={handleRemedyClick}
                userLikes={userRemedyLikes}
                userSaves={userSavedRemedies}
                handleLike={handleLike}
                handleSave={handleSave}
                handleShare={handleShare}
                handleOpenRatingModal={handleOpenRatingModal}
                loadMoreRef={loadMoreRef}
                isFetchingNextPage={isFetchingNextPage}
                isLoading={isLoading}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                // NEW!
                remedyRatings={allRatings ?? {}}
                userRated={userRatings ?? {}}
              />
            </TabsContent>
            <TabsContent value="popular" className="pt-3">
              <PopularRemedies />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="pt-6 pb-10 w-full">
            <RemedyFeed
              remedies={remedies}
              handleRemedyClick={handleRemedyClick}
              userLikes={userRemedyLikes}
              userSaves={userSavedRemedies}
              handleLike={handleLike}
              handleSave={handleSave}
              handleShare={handleShare}
              handleOpenRatingModal={handleOpenRatingModal}
              loadMoreRef={loadMoreRef}
              isFetchingNextPage={isFetchingNextPage}
              isLoading={isLoading}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              // NEW!
              remedyRatings={allRatings ?? {}}
              userRated={userRatings ?? {}}
            />
          </div>
        )}
      </div>

      {remedyToRate && (
        <RemedyRatingModal
          isOpen={!!remedyToRate}
          onClose={() => setRemedyToRate(null)}
          onSubmit={handleRatingSubmit}
          remedyName={remedyToRate.name || ''}
        />
      )}
    </div>
  );
};

export default Remedies;
