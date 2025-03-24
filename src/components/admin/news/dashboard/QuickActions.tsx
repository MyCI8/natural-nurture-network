
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Newspaper, Video, Image, ListFilter } from "lucide-react";
import { useNavigate } from "react-router-dom";

const QuickActions = () => {
  const navigate = useNavigate();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Quickly access common tasks
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <Button 
          variant="outline" 
          className="justify-start" 
          onClick={() => navigate("/admin/news/new")}
        >
          <Newspaper className="mr-2 h-4 w-4" />
          Create New Article
        </Button>
        
        <Button 
          variant="outline" 
          className="justify-start"
          onClick={() => navigate("/admin/videos/new", { 
            state: { 
              returnTo: "/admin/news/videos",
              videoType: "news" 
            } 
          })}
        >
          <Video className="mr-2 h-4 w-4" />
          Upload New Video
        </Button>
        
        <Button 
          variant="outline" 
          className="justify-start"
          onClick={() => navigate("/admin/news/media")}
        >
          <Image className="mr-2 h-4 w-4" />
          Manage Media Library
        </Button>
        
        <Button 
          variant="outline" 
          className="justify-start"
          onClick={() => navigate("/admin/news/latest")}
        >
          <ListFilter className="mr-2 h-4 w-4" />
          Configure Latest Videos
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
