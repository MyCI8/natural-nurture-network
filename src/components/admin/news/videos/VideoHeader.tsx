
import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoHeaderProps {
  onAddVideo: () => void;
}

const VideoHeader: React.FC<VideoHeaderProps> = ({ onAddVideo }) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate("/admin/news")}
          className="mr-2 hover:bg-accent/50 transition-all rounded-full w-10 h-10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Manage News Videos</h2>
          <p className="text-muted-foreground">
            Create and manage videos for news content
          </p>
        </div>
      </div>
      <Button onClick={onAddVideo}>
        <Plus className="mr-2 h-4 w-4" /> Create News Video
      </Button>
    </div>
  );
};

export default VideoHeader;
