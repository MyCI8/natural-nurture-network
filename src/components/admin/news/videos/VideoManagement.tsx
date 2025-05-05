
import React from "react";
import { useNavigate } from "react-router-dom";
import { useNewsVideos } from "@/hooks/useNewsVideos";
import VideoHeader from "./VideoHeader";
import VideoStatsCards from "./VideoStatsCards";
import VideoLibraryCard from "./VideoLibraryCard";

const VideoManagement = () => {
  const navigate = useNavigate();
  const {
    videos,
    isLoading,
    filters,
    setSearchQuery,
    setSortBy,
    setVideoFilter,
    deleteVideo,
    archiveVideo
  } = useNewsVideos();

  const handleAddVideo = () => {
    navigate("/admin/videos/new", { 
      state: { 
        returnTo: "/admin/news/videos",
        videoType: "news" 
      } 
    });
  };

  return (
    <div className="space-y-6">
      <VideoHeader onAddVideo={handleAddVideo} />
      <VideoStatsCards videos={videos} />
      <VideoLibraryCard
        videos={videos}
        navigate={navigate}
        isLoading={isLoading}
        filters={filters}
        setSearchQuery={setSearchQuery}
        setSortBy={setSortBy}
        setVideoFilter={setVideoFilter}
        onDelete={deleteVideo}
        onArchive={archiveVideo}
      />
    </div>
  );
};

export default VideoManagement;
