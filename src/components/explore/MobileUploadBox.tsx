import React, { useReducer, useRef } from "react";
import { Upload, Loader2, X } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
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
  const { toast } = useToast();
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

  // Validate, create preview, and update reducer
  const handleSelectFile = async (file: File) => {
    cleanupPreview();
    // Validate size/type
    if (!file.type.startsWith("video/") && !file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Must be video or image.",
        variant: "destructive",
      });
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `Max allowed size is ${maxSizeMB}MB.`,
        variant: "destructive",
      });
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    dispatch({ type: "SELECT_FILE", file, previewUrl });
  };

  // Single upload handler; could be extended for chunked handling
  const handleUpload = async () => {
    if (!state.file) return;
    dispatch({ type: "START_UPLOAD" });
    try {
      // Ensure the bucket exists
      const { data: buckets, error: bucketsErr } = await supabase.storage.listBuckets();
      if (bucketsErr) throw new Error("Bucket check failed.");
      if (!buckets.some((b: any) => b.name === "video-media")) {
        const { error: createErr } = await supabase.storage.createBucket("video-media", { public: true });
        if (createErr) throw new Error("Failed to create bucket");
      }

      // Use UUID for filename to avoid clashing
      const ext = state.file.name.split(".").pop();
      const filename = `${crypto.randomUUID()}.${ext}`;
      let result;
      // NOTE: Supabase Storage currently does not support 'onUploadProgress'
      // So, we remove it from the upload options.
      for (let attempt = 1; attempt <= 3; attempt++) {
        const { data, error } = await supabase.storage.from("video-media").upload(
          filename,
          state.file,
          {
            cacheControl: "3600",
            upsert: false
            // onUploadProgress removed; not supported by supabase-js v2+
          }
        );
        if (error) {
          if (attempt < 3) {
            // Retry after short delay
            await new Promise((r) => setTimeout(r, 300 * attempt));
            continue;
          }
          dispatch({ type: "FAIL", error: error.message || "Upload error" });
          toast({ title: "Upload failed", description: error.message, variant: "destructive" });
          return;
        }
        result = data;
        break;
      }
      if (!result) {
        dispatch({ type: "FAIL", error: "Unknown upload error" });
        return;
      }
      dispatch({ type: "DONE" });
      const publicUrl =
        supabase.storage.from("video-media").getPublicUrl(filename).data.publicUrl;
      onUploadSuccess(publicUrl, filename, state.file);
      toast({ title: "Upload complete", description: "Media ready!" });
    } catch (error: any) {
      dispatch({ type: "FAIL", error: error.message || "Unknown upload failure" });
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    }
  };

  const handleRemove = () => {
    cleanupPreview();
    dispatch({ type: "RESET" });
  };

  // File input + full mobile tap target
  return (
    <div className="flex flex-col items-center px-2 py-4 w-full">
      {state.status === "idle" || state.status === "error" ? (
        <div
          role="button"
          tabIndex={0}
          className={`border-2 border-dashed rounded-lg w-full max-w-xs mx-auto p-8 flex flex-col items-center text-center transition-all duration-200 
            bg-background min-h-[216px] ${state.status === "error" ? "border-destructive" : "hover:border-primary/60"}
          `}
          onClick={() => fileInputRef.current?.click()}
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
            <div className="mt-2 text-red-700 text-xs">{state.error}</div>
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
                  poster=""
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
          {/* Remove button over preview */}
          <Button
            size="icon"
            variant="destructive"
            className="absolute top-2 right-2 z-20 rounded-full bg-destructive/90 bg-blur touch-manipulation"
            type="button"
            aria-label="Remove"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
          {/* Upload Progress/Action */}
          {state.status === "ready" && (
            <Button
              className="mt-4 w-full rounded-full"
              onClick={handleUpload}
              disabled={state.status === "uploading"}
            >
              Upload
            </Button>
          )}
          {state.status === "uploading" && (
            <div className="absolute inset-x-0 bottom-6 flex flex-col items-center">
              <Loader2 className="h-5 w-5 animate-spin text-primary mb-2" />
              <Progress value={state.progress} className="w-full h-2 rounded" />
              <span className="text-xs text-muted-foreground mt-1">{state.progress}%</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MobileUploadBox;
