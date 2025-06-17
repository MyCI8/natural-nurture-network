
import React, { useReducer, useRef } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MediaContainer } from "@/components/media/MediaContainer";
import { isValidMediaFile } from "@/utils/mediaUtils";

type State = {
  file: File | null;
  previewUrl: string | null;
  status: "idle" | "ready" | "error";
  error: string | null;
};

type Action =
  | { type: "SELECT_FILE"; file: File; previewUrl: string }
  | { type: "RESET" }
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
      };
    case "RESET":
      return { file: null, previewUrl: null, status: "idle", error: null };
    case "FAIL":
      return { ...state, status: "error", error: action.error };
    default:
      return state;
  }
}

interface MobileUploadBoxProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
}

export const MobileUploadBox: React.FC<MobileUploadBoxProps> = ({
  onFileSelect,
  accept = "video/*,image/*",
  maxSizeMB = 50,
}) => {
  const [state, dispatch] = useReducer(uploadReducer, {
    file: null,
    previewUrl: null,
    status: "idle",
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
    
    // Use the new validation system
    const validation = isValidMediaFile(file);
    if (!validation.isValid) {
      dispatch({ type: "FAIL", error: validation.error || 'Invalid file type' });
      toast.error(validation.error || 'Invalid file type');
      return;
    }
    
    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      const error = `File too large - max allowed size is ${maxSizeMB}MB`;
      dispatch({ type: "FAIL", error });
      toast.error(error);
      return;
    }
    
    const previewUrl = URL.createObjectURL(file);
    dispatch({ type: "SELECT_FILE", file, previewUrl });
    
    // Notify parent component
    onFileSelect(file);
    toast.success("File selected! Add a description and post.");
  };

  const handleRemove = () => {
    cleanupPreview();
    dispatch({ type: "RESET" });
    onFileSelect(null as any); // Clear the selection
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
            Tap to {state.status === "error" ? "try again" : "select"}
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
          <div className="rounded-lg bg-black/80 overflow-hidden">
            <MediaContainer
              src={state.previewUrl || ''}
              alt="Media preview"
              maxWidth={320}
              maxHeight={240}
              preserveAspectRatio={true}
              objectFit="contain"
            />
          </div>
          
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
          
          <div className="mt-4 text-center">
            <span className="text-xs text-green-600">
              File selected! Ready to post.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileUploadBox;
