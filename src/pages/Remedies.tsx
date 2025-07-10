import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import PopularRemedies from "@/components/remedies/PopularRemedies";
import { useInfiniteRemedies } from "@/hooks/useInfiniteRemedies";
import { useInView } from "react-intersection-observer";
import { Tables } from "@/integrations/supabase/types";
import RemedyFeed from "@/components/remedies/RemedyFeed";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import RemedyRatingModal from "@/components/remedies/RemedyRatingModal";
import { useOptimizedRemedies } from "@/hooks/useOptimizedRemedies";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

type Remedy = Tables<'remedies'>;

const Remedies = () => {
  const navigate = useNavigate();
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

  // Use optimized remedies for better performance
  const { userLikes, userSaves, remedyRatings, userRated } = useOptimizedRemedies();
  
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

  const handleSearchIconClick = () => {
    setIsSearchExpanded(true);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsSearchExpanded(false);
      setSearchTerm("");
    } else if (e.key === 'Enter') {
      searchInputRef.current?.blur();
    }
  };

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

    const isLiked = userLikes.has(remedyId);
    
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

      queryClient.invalidateQueries({ queryKey: ['user-interactions', currentUser.id] });
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
    
    const isSaved = userSaves.has(remedyId);

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
      
      queryClient.invalidateQueries({ queryKey: ['user-interactions', currentUser.id] });
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
    setRemedyToRate(remedy);
  };

  const handleRatingSubmit = async (rating: number) => {
    if (!remedyToRate || !currentUser) return;
    
    const { data: existing, error: findError } = await (supabase as any)
      .from('remedy_ratings')
      .select('*')
      .eq('remedy_id', remedyToRate.id)
      .eq('user_id', currentUser.id)
      .maybeSingle();

    let upsertResult;
    if (existing) {
      upsertResult = await (supabase as any)
        .from('remedy_ratings')
        .update({ rating, updated_at: new Date().toISOString() })
        .eq('remedy_id', remedyToRate.id)
        .eq('user_id', currentUser.id);
    } else {
      upsertResult = await (supabase as any)
        .from('remedy_ratings')
        .insert({
          remedy_id: remedyToRate.id,
          user_id: currentUser.id,
          rating,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    }
    
    if (upsertResult?.error) {
      toast({ title: "Could not save rating", variant: "destructive" });
    } else {
      toast({ title: "Thank you for your rating!" });
      queryClient.invalidateQueries({ queryKey: ['remedy-ratings'] });
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
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-10">
          <div className="px-2 py-3">
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
        
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-80 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-10">
        <div className="px-2 py-3">
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

      <div className="flex flex-col w-full items-center">
        {isMobile ? (
          <Tabs defaultValue="remedies" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="remedies">Remedies</TabsTrigger>
              <TabsTrigger value="popular">Popular</TabsTrigger>
            </TabsList>
            <TabsContent value="remedies" className="pt-3">
              <RemedyFeed
                remedies={remedies}
                handleRemedyClick={handleRemedyClick}
                userLikes={userLikes}
                userSaves={userSaves}
                handleLike={handleLike}
                handleSave={handleSave}
                handleShare={handleShare}
                loadMoreRef={loadMoreRef}
                isFetchingNextPage={isFetchingNextPage}
                isLoading={isLoading}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                remedyRatings={remedyRatings}
                userRated={userRated}
                onOpenRatingModal={handleOpenRatingModal}
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
              userLikes={userLikes}
              userSaves={userSaves}
              handleLike={handleLike}
              handleSave={handleSave}
              handleShare={handleShare}
              loadMoreRef={loadMoreRef}
              isFetchingNextPage={isFetchingNextPage}
              isLoading={isLoading}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              remedyRatings={remedyRatings}
              userRated={userRated}
              onOpenRatingModal={handleOpenRatingModal}
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
          initialRating={userRated[remedyToRate.id] || 0}
        />
      )}
    </div>
  );
};

export default Remedies;
