
import React from "react";

export function VideoLoadingState() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center p-6 max-w-md">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h2 className="text-xl font-semibold mb-2">Loading video</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Please wait while we prepare your video...
        </p>
      </div>
    </div>
  );
}
