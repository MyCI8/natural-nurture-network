import { QueryClient } from '@tanstack/react-query';

// Centralized query key factory
export const queryKeys = {
  // Auth
  auth: ['auth'] as const,
  user: (id?: string) => ['user', id] as const,
  userRole: (id?: string) => ['user', 'role', id] as const,
  
  // Experts
  experts: ['experts'] as const,
  expert: (id: string) => ['expert', id] as const,
  expertSuggestions: ['expert-suggestions'] as const,
  
  // Remedies
  remedies: ['remedies'] as const,
  remedy: (id: string) => ['remedy', id] as const,
  remedyLikes: (id: string) => ['remedy', id, 'likes'] as const,
  remedyRatings: (id: string) => ['remedy', id, 'ratings'] as const,
  
  // Ingredients
  ingredients: ['ingredients'] as const,
  ingredient: (id: string) => ['ingredient', id] as const,
  
  // Health Concerns
  healthConcerns: ['health-concerns'] as const,
  healthConcern: (id: string) => ['health-concern', id] as const,
  healthConcernSuggestions: ['health-concern-suggestions'] as const,
  
  // News
  news: ['news'] as const,
  newsArticle: (id: string) => ['news', id] as const,
  newsVideos: ['news', 'videos'] as const,
  
  // Videos
  videos: ['videos'] as const,
  video: (id: string) => ['video', id] as const,
  videoComments: (id: string) => ['video', id, 'comments'] as const,
  videoLikes: (id: string) => ['video', id, 'likes'] as const,
  
  // Admin
  adminLogs: ['admin', 'logs'] as const,
  adminStats: ['admin', 'stats'] as const,
} as const;

// Create the global query client
export const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        if (error?.status >= 400 && error?.status < 500 && 
            error?.status !== 408 && error?.status !== 429) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
    }
  }
});