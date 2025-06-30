
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import PopularRemedies from "@/components/remedies/PopularRemedies";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import RemedyRatingModal from "@/components/remedies/RemedyRatingModal";
import { supabase } from "@/integrations/supabase/client";
import { useOptimizedRemedies } from "@/hooks/useOptimizedRemedies";
import OptimizedRemedyCard from "@/components/remedies/OptimizedRemedyCard";

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
  const [remedyToRate, setRemedyToRate] = useState<any>(null);

  const { 
    remedies, 
    userInteractions, 
    ratings, 
    isLoading, 
    error 
  } = useOptimizedRemedies(searchTerm);

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

  const handleRemedyClick = (remedyId: string) => {
    navigate(`/remedies/${remedyId}`);
  };

  const handleLike = async (remedyId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
      toast({ title: "Please sign in to like remedies.", variant: "destructive" });
      navigate('/auth');
      return;
    }

    const isLiked = userInteractions.likedRemedies.has(remedyId);
    
    try {
      if (isLiked) {
        const { error } = await supabase
          .from('remedy_likes')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('remedy_id', remedyId);
        if (error) throw error;
      } else {
        const { error } = await supabase
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
    
    const isSaved = userInteractions.savedRemedies.has(remedyId);

    try {
      if (isSaved) {
        const { error } = await supabase
          .from('saved_remedies')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('remedy_id', remedyId);
        if (error) throw error;
        toast({ title: "Remedy removed from your saved list." });
      } else {
        const { error } = await supabase
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
      toast({ title: "Link copied to clipboard!" });
    }
  };

  const handleOpenRatingModal = (remedy: any) => {
    setRemedyToRate(remedy);
  };

  const handleRatingSubmit = async (rating: number) => {
    if (!remedyToRate || !currentUser) return;
    
    const { data: existing } = await supabase
      .from('remedy_ratings')
      .select('*')
      .eq('remedy_id', remedyToRate.id)
      .eq('user_id', currentUser.id)
      .maybeSingle();

    let upsertResult;
    if (existing) {
      upsertResult = await supabase
        .from('remedy_ratings')
        .update({ rating, updated_at: new Date().toISOString() })
        .eq('remedy_id', remedyToRate.id)
        .eq('user_id', currentUser.id);
    } else {
      upsertResult = await supabase
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
      queryClient.invalidateQueries({ queryKey: ['remedy-ratings-optimized'] });
    }
    setRemedyToRate(null);
  };

  if (error) {
    console.error('Remedies query error:', error);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Error loading remedies</h2>
          <p className="text-muted-foreground">Please try again later</p>
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
        
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="h-80 w-full rounded-xl" />
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

      {/* Content */}
      <div className="flex flex-col w-full items-center">
        {isMobile ? (
          <Tabs defaultValue="remedies" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="remedies">Remedies</TabsTrigger>
              <TabsTrigger value="popular">Popular</TabsTrigger>
            </TabsList>
            <TabsContent value="remedies" className="pt-3">
              <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {remedies.map((remedy) => (
                    <OptimizedRemedyCard
                      key={remedy.id}
                      remedy={remedy}
                      isLiked={userInteractions.likedRemedies.has(remedy.id)}
                      isSaved={userInteractions.savedRemedies.has(remedy.id)}
                      rating={ratings.remedyRatings[remedy.id]}
                      userRating={ratings.userRated[remedy.id]}
                      onRemedyClick={handleRemedyClick}
                      onLike={handleLike}
                      onSave={handleSave}
                      onShare={handleShare}
                      onOpenRatingModal={handleOpenRatingModal}
                    />
                  ))}
                </div>
                {remedies.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No remedies found
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="popular" className="pt-3">
              <PopularRemedies />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="pt-6 pb-10 w-full max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {remedies.map((remedy) => (
                <OptimizedRemedyCard
                  key={remedy.id}
                  remedy={remedy}
                  isLiked={userInteractions.likedRemedies.has(remedy.id)}
                  isSaved={userInteractions.savedRemedies.has(remedy.id)}
                  rating={ratings.remedyRatings[remedy.id]}
                  userRating={ratings.userRated[remedy.id]}
                  onRemedyClick={handleRemedyClick}
                  onLike={handleLike}
                  onSave={handleSave}
                  onShare={handleShare}
                  onOpenRatingModal={handleOpenRatingModal}
                />
              ))}
            </div>
            {remedies.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No remedies found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {remedyToRate && (
        <RemedyRatingModal
          isOpen={!!remedyToRate}
          onClose={() => setRemedyToRate(null)}
          onSubmit={handleRatingSubmit}
          remedyName={remedyToRate.name || ''}
          initialRating={ratings.userRated[remedyToRate.id] || 0}
        />
      )}
    </div>
  );
};

export default Remedies;
