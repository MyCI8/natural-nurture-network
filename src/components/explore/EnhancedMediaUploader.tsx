
import { useRef, useCallback, useState } from "react";
import { Upload, Video, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface EnhancedMediaUploaderProps {
  onMediaUpload: (file: File) => Promise<void>;
  onVideoLinkChange: (url: string) => void;
  compact?: boolean;
  maxSizeMB?: number;
  acceptedTypes?: string[];
}

interface DragState {
  isDragging: boolean;
  dragCounter: number;
}

export function EnhancedMediaUploader({
  onMediaUpload,
  onVideoLinkChange,
  compact = false,
  maxSizeMB = 50,
  acceptedTypes = ["video/*", "image/*"]
}: EnhancedMediaUploaderProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragState, setDragState] = useState<DragState>({ isDragging: false, dragCounter: 0 });

  const validateFile = (file: File): boolean => {
    // Check file type
    const isValidType = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.replace('/*', '/'));
      }
      return file.type === type;
    });

    if (!isValidType) {
      toast({
        title: "Invalid file type",
        description: `Please select a ${acceptedTypes.join(' or ')} file`,
        variant: "destructive",
      });
      return false;
    }

    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `Please select a file smaller than ${maxSizeMB}MB`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const processFile = useCallback(async (file: File) => {
    if (!validateFile(file)) return;

    try {
      await onMediaUpload(file);
    } catch (error) {
      // Error is now handled and toasted in useVideoForm
      console.error("Error during media upload processing:", error);
    }
  }, [onMediaUpload, validateFile]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState(prev => ({
      isDragging: true,
      dragCounter: prev.dragCounter + 1
    }));
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState(prev => {
      const newCounter = prev.dragCounter - 1;
      return {
        isDragging: newCounter > 0,
        dragCounter: newCounter
      };
    });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragState({ isDragging: false, dragCounter: 0 });
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    if (e.target) e.target.value = '';
  };

  const getFileTypeIcon = () => {
    if (acceptedTypes.includes("video/*") && acceptedTypes.includes("image/*")) {
       return <Upload className="h-8 w-8 text-muted-foreground" />;
    }
    if (acceptedTypes.includes("video/*")) {
      return <Video className="h-8 w-8 text-blue-500" />;
    }
    if (acceptedTypes.includes("image/*")) {
      return <Image className="h-8 w-8 text-green-500" />;
    }
    return <Upload className="h-8 w-8 text-muted-foreground" />;
  };

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer",
          compact ? "p-6" : "p-8",
          dragState.isDragging 
            ? "border-primary bg-primary/10 scale-105" 
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            {dragState.isDragging ? (
              <Upload className="h-8 w-8 text-primary animate-bounce" />
            ) : (
              getFileTypeIcon()
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className={cn(
              "font-medium",
              compact ? "text-base" : "text-lg"
            )}>
              {dragState.isDragging ? 'Drop your media here' : 'Upload Media'}
            </h3>
            <p className={cn(
              "text-muted-foreground",
              compact ? "text-xs" : "text-sm"
            )}>
              Drag & drop or click to browse • Max {maxSizeMB}MB
            </p>
            <div className="flex justify-center gap-2 text-xs text-muted-foreground">
              {acceptedTypes.includes("video/*") && (
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                  Video
                </span>
              )}
              {acceptedTypes.includes("image/*") && (
                <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                  Image
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(",")}
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
}
