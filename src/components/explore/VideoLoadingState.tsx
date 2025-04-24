
import React from "react";

export function VideoLoadingState() {
  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto p-4 sm:p-6 max-w-[1000px]">
        <div className="flex items-center justify-center h-64">
          <p>Loading video data...</p>
        </div>
      </div>
    </div>
  );
}
