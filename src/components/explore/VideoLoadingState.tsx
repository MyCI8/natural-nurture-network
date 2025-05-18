
import React from "react";

interface VideoLoadingStateProps {
  message?: string;
}

export function VideoLoadingState({ message = "Loading video" }: VideoLoadingStateProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center p-6 max-w-md">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h2 className="text-xl font-semibold mb-2">{message}</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Please wait while we prepare your video...
        </p>
      </div>
    </div>
  );
}

export function VideoErrorState({ 
  message = "Unable to load video", 
  onRetry 
}: { 
  message?: string; 
  onRetry?: () => void;
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center p-6 max-w-md bg-gray-50 dark:bg-dm-mist rounded-lg shadow">
        <div className="mb-6 text-red-500">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="48" 
            height="48" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="mx-auto"
          >
            <circle cx="12" cy="12" r="10"/>
            <path d="m15 9-6 6"/>
            <path d="m9 9 6 6"/>
          </svg>
        </div>
        <h2 className="text-xl font-semibold mb-4">{message}</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          There was a problem loading this content. Please try again later.
        </p>
        
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="M21 2v6h-6"/>
              <path d="M3 12a9 9 0 0 1 15-6.7l3 2.7"/>
              <path d="M3 22v-6h6"/>
              <path d="M21 12a9 9 0 0 1-15 6.7l-3-2.7"/>
            </svg>
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
