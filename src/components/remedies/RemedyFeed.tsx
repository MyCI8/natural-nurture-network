import React from 'react';
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, Bookmark, Star, Search } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type Remedy = Tables<'remedies'>;

interface RemedyFeedProps {
  remedies: Remedy[];
  handleRemedyClick: (remedy: Remedy) => void;
  userLikes: Set<string>;
  userSaves: Set<string>;
  handleLike: (remedyId: string, e: React.MouseEvent) => void;
  handleSave: (remedyId: string, e: React.MouseEvent) => void;
  handleShare: (remedy: Remedy, e: React.MouseEvent) => void;
  loadMoreRef: (node?: Element | null) => void;
  isFetchingNextPage: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isLoading: boolean;
}

const RemedyFeed: React.FC<RemedyFeedProps> = ({
  remedies,
  handleRemedyClick,
  userLikes,
  userSaves,
  handleLike,
  handleSave,
  handleShare,
  loadMoreRef,
  isFetchingNextPage,
  searchTerm,
  setSearchTerm,
  isLoading,
}) => {
  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto w-full">
      {remedies && remedies.length > 0 ? (
        remedies.map((remedy) => {
          const isLiked = userLikes.has(remedy.id);
          const isSaved = userSaves.has(remedy.id);

          return (
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
                      className={`gap-1 !px-2 ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
                      onClick={e => {
                        handleLike(remedy.id, e);
                      }}
                    >
                      <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
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
                        handleSave(remedy.id, e);
                      }}
                    >
                      <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                    </Button>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium">4.8</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })
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
                  : remedies && remedies.length === 0 && !isLoading
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
       <div ref={loadMoreRef} className="h-10" />
        {isFetchingNextPage && (
          <div className="text-center py-4">
            <p className="text-muted-foreground">Loading more remedies...</p>
          </div>
        )}
    </div>
  );
};

export default RemedyFeed;
