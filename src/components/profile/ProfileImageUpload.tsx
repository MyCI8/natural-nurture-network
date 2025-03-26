
import React, { useState, useRef, ChangeEvent } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Upload, Trash } from "lucide-react";
import { uploadProfileImage, dataURLtoFile } from '@/utils/imageUtils';
import { useToast } from "@/components/ui/use-toast";

interface ProfileImageUploadProps {
  userId: string;
  avatarUrl?: string | null;
  fullName?: string;
  onImageUpdate: (url: string) => void;
}

export function ProfileImageUpload({ 
  userId, 
  avatarUrl, 
  fullName, 
  onImageUpdate 
}: ProfileImageUploadProps) {
  const { toast } = useToast();
  const [previewUrl, setPreviewUrl] = useState<string | null>(avatarUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInput = () => {
    // Trigger the hidden file input when the button or avatar is clicked
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      // Create a preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      setIsUploading(true);
      
      // Upload to Supabase storage
      const publicUrl = await uploadProfileImage(file, userId);
      
      if (publicUrl) {
        onImageUpdate(publicUrl);
        toast({
          title: "Success",
          description: "Profile image updated successfully",
        });
      } else {
        throw new Error("Failed to upload image");
      }
    } catch (error) {
      console.error('Profile image upload error:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload profile image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageUpdate('');
  };

  // Get the first letter of the name for the avatar fallback
  const getInitials = () => {
    return fullName ? fullName[0].toUpperCase() : '?';
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="relative">
        <Avatar 
          className="h-32 w-32 cursor-pointer" 
          onClick={handleFileInput}
        >
          <AvatarImage src={previewUrl || ''} alt={fullName || 'User'} />
          <AvatarFallback className="text-2xl bg-primary/10 text-primary">
            {getInitials()}
          </AvatarFallback>
          
          {/* Hover overlay with upload icon */}
          <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
            <Upload className="h-8 w-8 text-white" />
          </div>
        </Avatar>
        
        {/* File input (hidden) */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        
        {/* Remove button (visible when image exists) */}
        {previewUrl && (
          <Button 
            type="button"
            variant="destructive" 
            size="icon"
            className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
            onClick={handleRemoveImage}
            disabled={isUploading}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="flex gap-2">
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          className="flex gap-1" 
          disabled={isUploading}
          onClick={handleFileInput}
        >
          <Upload className="h-4 w-4" />
          <span>{isUploading ? "Uploading..." : "Change Photo"}</span>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        JPG, GIF or PNG. Max size 3MB.
      </p>
    </div>
  );
}
