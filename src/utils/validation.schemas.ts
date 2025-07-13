/**
 * Comprehensive Zod validation schemas for production-ready input validation
 */

import { z } from 'zod';

// Base validation schemas
export const emailSchema = z.string().email('Please enter a valid email address');
export const urlSchema = z.string().url('Please enter a valid URL');
export const nonEmptyStringSchema = z.string().min(1, 'This field is required');

// User-related schemas
export const userProfileSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').max(100, 'Full name must be less than 100 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username must be less than 30 characters').optional(),
  email: emailSchema,
  avatar_url: z.string().url('Please enter a valid avatar URL').optional().or(z.literal('')),
});

// News article schemas
export const newsArticleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  slug: z.string().min(1, 'Slug is required').max(100, 'Slug must be less than 100 characters'),
  summary: z.string().max(500, 'Summary must be less than 500 characters').optional(),
  content: z.string().min(1, 'Content is required'),
  image_url: z.string().url('Please enter a valid image URL').optional().or(z.literal('')),
  main_image_url: z.string().url('Please enter a valid main image URL').optional().or(z.literal('')),
  thumbnail_description: z.string().max(200, 'Thumbnail description must be less than 200 characters').optional(),
  main_image_description: z.string().max(200, 'Main image description must be less than 200 characters').optional(),
  status: z.enum(['draft', 'published']),
  scheduled_publish_date: z.date().optional(),
  related_experts: z.array(z.string().uuid()).optional(),
  video_links: z.array(z.object({
    title: z.string().min(1, 'Video title is required'),
    url: z.string().url('Please enter a valid video URL')
  })).optional(),
  video_description: z.string().max(500, 'Video description must be less than 500 characters').optional(),
});

// Remedy schemas
export const remedySchema = z.object({
  name: z.string().min(1, 'Remedy name is required').max(100, 'Remedy name must be less than 100 characters'),
  summary: z.string().min(1, 'Summary is required').max(500, 'Summary must be less than 500 characters'),
  description: z.string().optional(),
  brief_description: z.string().max(300, 'Brief description must be less than 300 characters').optional(),
  image_url: z.string().url('Please enter a valid image URL').optional().or(z.literal('')),
  main_image_url: z.string().url('Please enter a valid main image URL').optional().or(z.literal('')),
  thumbnail_description: z.string().max(200, 'Thumbnail description must be less than 200 characters').optional(),
  main_image_description: z.string().max(200, 'Main image description must be less than 200 characters').optional(),
  video_url: z.string().url('Please enter a valid video URL').optional().or(z.literal('')),
  video_description: z.string().max(500, 'Video description must be less than 500 characters').optional(),
  ingredients: z.array(z.string()).optional(),
  expert_recommendations: z.array(z.string().uuid()).optional(),
  health_concerns: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published']),
  shopping_list: z.array(z.object({
    name: z.string().min(1, 'Item name is required'),
    url: z.string().url('Please enter a valid URL').optional(),
    affiliate_link: z.string().url('Please enter a valid affiliate link').optional()
  })).optional(),
  related_links: z.array(z.object({
    title: z.string().min(1, 'Link title is required'),
    url: z.string().url('Please enter a valid URL')
  })).optional(),
});

// Expert schemas
export const expertSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').max(100, 'Full name must be less than 100 characters'),
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  bio: z.string().max(1000, 'Bio must be less than 1000 characters').optional(),
  field_of_expertise: z.string().max(100, 'Field of expertise must be less than 100 characters').optional(),
  image_url: z.string().url('Please enter a valid image URL').optional().or(z.literal('')),
  credentials: z.array(z.string()).optional(),
  affiliations: z.array(z.string()).optional(),
  social_media: z.object({
    twitter: z.string().url('Please enter a valid Twitter URL').optional().or(z.literal('')),
    linkedin: z.string().url('Please enter a valid LinkedIn URL').optional().or(z.literal('')),
    youtube: z.string().url('Please enter a valid YouTube URL').optional().or(z.literal('')),
    instagram: z.string().url('Please enter a valid Instagram URL').optional().or(z.literal('')),
    website: z.string().url('Please enter a valid website URL').optional().or(z.literal(''))
  }).optional(),
  media_links: z.object({
    podcasts: z.array(z.string().url()).optional(),
    youtube_videos: z.array(z.string().url()).optional(),
    news_articles: z.array(z.string().url()).optional(),
    research_papers: z.array(z.string().url()).optional()
  }).optional(),
});

// Video schemas
export const videoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  video_url: z.string().url('Please enter a valid video URL'),
  thumbnail_url: z.string().url('Please enter a valid thumbnail URL').optional().or(z.literal('')),
  video_type: z.enum(['general', 'news', 'remedy', 'expert']).optional(),
  status: z.enum(['draft', 'published']),
  related_article_id: z.string().uuid().optional(),
  show_in_latest: z.boolean().optional(),
});

// Product link schemas
export const productLinkSchema = z.object({
  title: z.string().min(1, 'Product title is required').max(100, 'Product title must be less than 100 characters'),
  description: z.string().max(300, 'Product description must be less than 300 characters').optional(),
  url: z.string().url('Please enter a valid product URL'),
  image_url: z.string().url('Please enter a valid image URL').optional().or(z.literal('')),
  price: z.number().positive('Price must be positive').optional(),
  position_x: z.number().int().min(0).max(100).optional(),
  position_y: z.number().int().min(0).max(100).optional(),
});

// Comment schemas
export const commentSchema = z.object({
  content: z.string().min(1, 'Comment content is required').max(1000, 'Comment must be less than 1000 characters'),
  video_id: z.string().uuid().optional(),
  remedy_id: z.string().uuid().optional(),
  parent_id: z.string().uuid().optional(),
});

// Search and filter schemas
export const searchParamsSchema = z.object({
  query: z.string().max(100, 'Search query must be less than 100 characters').optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
  sort: z.enum(['created_at', 'updated_at', 'name', 'title', 'popularity']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

// Form validation helper
export const createFormValidator = <T extends z.ZodType>(schema: T) => {
  return {
    validate: (data: unknown): { success: boolean; data?: z.infer<T>; errors?: Record<string, string> } => {
      const result = schema.safeParse(data);
      
      if (result.success) {
        return { success: true, data: result.data };
      }
      
      const errors: Record<string, string> = {};
      result.error.errors.forEach((error) => {
        const path = error.path.join('.');
        errors[path] = error.message;
      });
      
      return { success: false, errors };
    }
  };
};