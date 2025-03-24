
import React from "react";
import { useNavigate } from "react-router-dom";
import { Newspaper, Video, ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const ManageNews = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">News Management</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Newspaper className="h-5 w-5 mr-2" />
              Articles
            </CardTitle>
            <CardDescription>
              Manage news articles with full editorial control
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Create, edit, and publish news articles. Organize content with categories, tags, and featured images.
            </p>
            <Button 
              onClick={() => navigate("/admin/news/articles")}
              className="w-full"
            >
              Manage Articles
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Video className="h-5 w-5 mr-2" />
              Videos
            </CardTitle>
            <CardDescription>
              Publish and organize news videos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Upload, publish, and organize news-related videos. Connect videos to articles or display them independently.
            </p>
            <Button 
              onClick={() => navigate("/admin/news/videos")}
              className="w-full"
            >
              Manage Videos
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ListFilter className="h-5 w-5 mr-2" />
              Latest Videos
            </CardTitle>
            <CardDescription>
              Configure videos appearing in the Latest Videos section
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Control which videos appear in the Latest Videos section on the news page. Drag and drop to set display order.
            </p>
            <Button 
              onClick={() => navigate("/admin/news/latest")}
              className="w-full"
            >
              Configure Latest Videos
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManageNews;
