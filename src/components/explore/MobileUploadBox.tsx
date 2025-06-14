
import React, { useReducer, useRef } from "react";
import { Upload, Loader2, X } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type State = {
  file: File | null;
  previewUrl: string | null;
  status: "idle" | "validating" | "ready" | "uploading" | "uploaded" | "error";
  progress: number;
  error: string | null;
};

type Action =
  | { type: "SELECT_FILE"; file: File; previewUrl: string }
  | { type: "RESET" }
  | { type: "START_UPLOAD" }
  | { type: "PROGRESS"; value: number }
  | { type: "DONE" }
  | { type: "FAIL"; error: string };

function uploadReducer(state: State, action: Action): State {
  switch (action.type) {
    case "SELECT_FILE":
      return {
        ...state,
        file: action.file,
        previewUrl: action.previewUrl,
        status: "ready",
        error: null,
        progress: 0,
      };
    case "RESET":
      return { file: null, previewUrl: null, status: "idle", progress: 0, error: null };
    case "START_UPLOAD":
      return { ...state, status: "uploading", progress: 0, error: null };
    case "PROGRESS":
      return { ...state, progress: action.value };
    case "DONE":
      return { ...state, status: "uploaded", progress: 100, error: null };
    case "FAIL":
      return { ...state, status: "error", error: action.error, progress: 0 };
    default:
      return state;
  }
}

interface MobileUploadBoxProps {
  onUploadSuccess: (publicUrl: string, filename: string, file: File) => void;
  accept?: string;
  maxSizeMB?: number;
}

export const MobileUploadBox: React.FC<MobileUploadBoxProps> = ({
  onUploadSuccess,
  accept = "video/*,image/*",
  maxSizeMB = 50,
}) => {
  const [state, dispatch] = useReducer(uploadReducer, {
    file: null,
    previewUrl: null,
    status: "idle",
    progress: 0,
    error: null,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cleanupPreview = () => {
    if (state.previewUrl) {
      URL.revokeObjectURL(state.previewUrl);
    }
  };

  const handleSelectFile = async (file: File) => {
    cleanupPreview();
    
    // Validate file type
    if (!file.type.startsWith("video/") && !file.type.startsWith("image/")) {
      toast.error("Invalid file type - must be video or image");
      return;
    }
    
    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File too large - max allowed size is ${maxSizeMB}MB`);
      return;
    }
    
    const previewUrl = URL.createObjectURL(file);
    dispatch({ type: "SELECT_FILE", file, previewUrl });
  };

  const handleUpload = async () => {
    if (!state.file) return;
    
    dispatch({ type: "START_UPLOAD" });
    
    try {
      // Check authentication first
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        dispatch({ type: "FAIL", error: "Please sign in to upload files" });
        toast.error("Please sign in to upload files");
        return;
      }

      dispatch({ type: "PROGRESS", value: 25 });

      // Generate unique filename with user folder structure
      const ext = state.file.name.split(".").pop();
      const userId = session.user.id;
      const filename = `${userId}/${crypto.randomUUID()}.${ext}`;
      
      dispatch({ type: "PROGRESS", value: 50 });

      // Upload file to the pre-configured bucket
      const { data, error } = await supabase.storage
        .from("video-media")
        .upload(filename, state.file, {
          cacheControl: "3600",
          upsert: false
        });

      if (error) {
        console.error("Upload error:", error);
        dispatch({ type: "FAIL", error: error.message });
        toast.error(`Upload failed: ${error.message}`);
        return;
      }

      dispatch({ type: "PROGRESS", value: 90 });

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("video-media")
        .getPublicUrl(filename);
      
      dispatch({ type: "PROGRESS", value: 100 });
      dispatch({ type: "DONE" });
      
      onUploadSuccess(publicUrlData.publicUrl, filename, state.file);
      toast.success("Upload complete! Ready to post.");

    } catch (error: any) {
      console.error("Upload error:", error);
      const errorMessage = error?.message || "Upload failed";
      dispatch({ type: "FAIL", error: errorMessage });
      toast.error(`Upload error: ${errorMessage}`);
    }
  };

  const handleRemove = () => {
    cleanupPreview();
    dispatch({ type: "RESET" });
  };

  return (
    <div className="flex flex-col items-center px-2 py-4 w-full">
      {state.status === "idle" || state.status === "error" ? (
        <div
          role="button"
          tabIndex={0}
          className={`border-2 border-dashed rounded-lg w-full max-w-xs mx-auto p-8 flex flex-col items-center text-center transition-all duration-200 
            bg-background min-h-[216px] cursor-pointer ${
              state.status === "error" ? "border-destructive" : "border-border hover:border-primary/60"
            }
          `}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              fileInputRef.current?.click();
            }
          }}
        >
          <Upload className="h-8 w-8 text-primary mb-2" />
          <div className="text-lg font-medium">
            Tap to {state.status === "error" ? "try again" : "upload"}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Supported: Video or Image, up to {maxSizeMB}MB
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={e => {
              if (e.target.files?.[0]) handleSelectFile(e.target.files[0]);
            }}
          />
          {state.status === "error" && (
            <div className="mt-2 text-destructive text-xs">{state.error}</div>
          )}
        </div>
      ) : (
        <div className="relative w-full max-w-xs">
          <AspectRatio ratio={4 / 3} className="rounded-lg bg-black/80 overflow-hidden">
            {state.previewUrl ? (
              state.file?.type.startsWith("video/") ? (
                <video
                  src={state.previewUrl}
                  className="w-full h-full object-contain"
                  controls
                  preload="metadata"
                  tabIndex={-1}
                />
              ) : (
                <img
                  src={state.previewUrl}
                  alt="Preview"
                  className="w-full h-full object-contain"
                  draggable={false}
                  tabIndex={-1}
                />
              )
            ) : null}
          </AspectRatio>
          
          {/* Remove button */}
          <Button
            size="icon"
            variant="destructive"
            className="absolute top-2 right-2 z-20 rounded-full bg-destructive/90 backdrop-blur-sm touch-manipulation"
            type="button"
            aria-label="Remove"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
          
          {/* Upload button - only show when ready */}
          {state.status === "ready" && (
            <Button
              className="mt-4 w-full rounded-full touch-manipulation"
              onClick={handleUpload}
              disabled={false}
              type="button"
            >
              Upload
            </Button>
          )}
          
          {/* Progress indicator - only show when uploading */}
          {state.status === "uploading" && (
            <div className="mt-4 flex flex-col items-center">
              <Loader2 className="h-5 w-5 animate-spin text-primary mb-2" />
              <Progress value={state.progress} className="w-full h-2 rounded" />
              <span className="text-xs text-muted-foreground mt-1">{state.progress}%</span>
            </div>
          )}
          
          {/* Success state */}
          {state.status === "uploaded" && (
            <div className="mt-4 flex flex-col items-center">
              <span className="text-xs text-green-600">
                Upload complete!
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MobileUploadBox;
