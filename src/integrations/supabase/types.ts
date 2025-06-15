export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string
          id: string
          key_value: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          key_value: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          key_value?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "video_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          remedy_id: string | null
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          remedy_id?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          remedy_id?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_remedy_id_fkey"
            columns: ["remedy_id"]
            isOneToOne: false
            referencedRelation: "remedies"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_remedies: {
        Row: {
          created_at: string | null
          expert_id: string
          remedy_id: string
        }
        Insert: {
          created_at?: string | null
          expert_id: string
          remedy_id: string
        }
        Update: {
          created_at?: string | null
          expert_id?: string
          remedy_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expert_remedies_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "experts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expert_remedies_remedy_id_fkey"
            columns: ["remedy_id"]
            isOneToOne: false
            referencedRelation: "remedies"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_searches: {
        Row: {
          biography: string | null
          created_at: string | null
          credentials: string[] | null
          id: string
          image_url: string | null
          name: string | null
          social_links: Json | null
          updated_at: string | null
        }
        Insert: {
          biography?: string | null
          created_at?: string | null
          credentials?: string[] | null
          id?: string
          image_url?: string | null
          name?: string | null
          social_links?: Json | null
          updated_at?: string | null
        }
        Update: {
          biography?: string | null
          created_at?: string | null
          credentials?: string[] | null
          id?: string
          image_url?: string | null
          name?: string | null
          social_links?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      expert_suggestions: {
        Row: {
          comment: string | null
          created_at: string | null
          full_name: string
          id: string
          image_url: string | null
          social_links: Json | null
          status: string | null
          submitted_by: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          full_name: string
          id?: string
          image_url?: string | null
          social_links?: Json | null
          status?: string | null
          submitted_by?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          image_url?: string | null
          social_links?: Json | null
          status?: string | null
          submitted_by?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      experts: {
        Row: {
          affiliations: string[] | null
          bio: string | null
          created_at: string | null
          credentials: string[] | null
          field_of_expertise: string | null
          full_name: string
          id: string
          image_url: string | null
          media_links: Json | null
          social_media: Json | null
          title: string
          updated_at: string | null
        }
        Insert: {
          affiliations?: string[] | null
          bio?: string | null
          created_at?: string | null
          credentials?: string[] | null
          field_of_expertise?: string | null
          full_name: string
          id?: string
          image_url?: string | null
          media_links?: Json | null
          social_media?: Json | null
          title: string
          updated_at?: string | null
        }
        Update: {
          affiliations?: string[] | null
          bio?: string | null
          created_at?: string | null
          credentials?: string[] | null
          field_of_expertise?: string | null
          full_name?: string
          id?: string
          image_url?: string | null
          media_links?: Json | null
          social_media?: Json | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      health_concern_suggestions: {
        Row: {
          concern_name: string
          created_at: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          suggested_by: string | null
        }
        Insert: {
          concern_name: string
          created_at?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          suggested_by?: string | null
        }
        Update: {
          concern_name?: string
          created_at?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          suggested_by?: string | null
        }
        Relationships: []
      }
      ingredients: {
        Row: {
          brief_description: string | null
          created_at: string | null
          full_description: string | null
          id: string
          image_url: string | null
          name: string
          status: string | null
          summary: string | null
          videos: Json | null
        }
        Insert: {
          brief_description?: string | null
          created_at?: string | null
          full_description?: string | null
          id?: string
          image_url?: string | null
          name: string
          status?: string | null
          summary?: string | null
          videos?: Json | null
        }
        Update: {
          brief_description?: string | null
          created_at?: string | null
          full_description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          status?: string | null
          summary?: string | null
          videos?: Json | null
        }
        Relationships: []
      }
      login_attempts: {
        Row: {
          attempted_at: string | null
          id: string
          ip_address: string | null
          success: boolean
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          attempted_at?: string | null
          id?: string
          ip_address?: string | null
          success: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          attempted_at?: string | null
          id?: string
          ip_address?: string | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      news_article_links: {
        Row: {
          article_id: string | null
          created_at: string | null
          id: string
          thumbnail_url: string | null
          title: string
          url: string
        }
        Insert: {
          article_id?: string | null
          created_at?: string | null
          id?: string
          thumbnail_url?: string | null
          title: string
          url: string
        }
        Update: {
          article_id?: string | null
          created_at?: string | null
          id?: string
          thumbnail_url?: string | null
          title?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_article_links_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "news_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      news_articles: {
        Row: {
          content: string
          created_at: string | null
          id: string
          image_caption: string | null
          image_credit: string | null
          image_url: string | null
          last_edited_by: string | null
          main_image_description: string | null
          main_image_url: string | null
          published_at: string | null
          related_experts: string[] | null
          related_links: Json | null
          scheduled_publish_date: string | null
          slug: string | null
          status: string
          summary: string | null
          thumbnail_description: string | null
          title: string
          updated_at: string | null
          video_description: string | null
          video_links: Json | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          image_caption?: string | null
          image_credit?: string | null
          image_url?: string | null
          last_edited_by?: string | null
          main_image_description?: string | null
          main_image_url?: string | null
          published_at?: string | null
          related_experts?: string[] | null
          related_links?: Json | null
          scheduled_publish_date?: string | null
          slug?: string | null
          status?: string
          summary?: string | null
          thumbnail_description?: string | null
          title: string
          updated_at?: string | null
          video_description?: string | null
          video_links?: Json | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          image_caption?: string | null
          image_credit?: string | null
          image_url?: string | null
          last_edited_by?: string | null
          main_image_description?: string | null
          main_image_url?: string | null
          published_at?: string | null
          related_experts?: string[] | null
          related_links?: Json | null
          scheduled_publish_date?: string | null
          slug?: string | null
          status?: string
          summary?: string | null
          thumbnail_description?: string | null
          title?: string
          updated_at?: string | null
          video_description?: string | null
          video_links?: Json | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_status: string
          avatar_url: string | null
          created_at: string
          email: string
          failed_login_attempts: number | null
          full_name: string
          id: string
          last_failed_login_at: string | null
          last_login_at: string | null
          name: string | null
          role_id: string | null
          settings: Json | null
          updated_at: string
          username: string | null
        }
        Insert: {
          account_status?: string
          avatar_url?: string | null
          created_at?: string
          email: string
          failed_login_attempts?: number | null
          full_name: string
          id: string
          last_failed_login_at?: string | null
          last_login_at?: string | null
          name?: string | null
          role_id?: string | null
          settings?: Json | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          account_status?: string
          avatar_url?: string | null
          created_at?: string
          email?: string
          failed_login_attempts?: number | null
          full_name?: string
          id?: string
          last_failed_login_at?: string | null
          last_login_at?: string | null
          name?: string | null
          role_id?: string | null
          settings?: Json | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      remedies: {
        Row: {
          brief_description: string | null
          click_count: number | null
          created_at: string | null
          description: string | null
          expert_recommendations: string[] | null
          id: string
          image_url: string | null
          ingredients: string[] | null
          main_image_description: string | null
          main_image_url: string | null
          name: string
          related_links: Json | null
          shopping_list: Json | null
          status: string | null
          summary: string
          symptoms: Database["public"]["Enums"]["symptom_type"][] | null
          thumbnail_description: string | null
          video_description: string | null
          video_url: string | null
        }
        Insert: {
          brief_description?: string | null
          click_count?: number | null
          created_at?: string | null
          description?: string | null
          expert_recommendations?: string[] | null
          id?: string
          image_url?: string | null
          ingredients?: string[] | null
          main_image_description?: string | null
          main_image_url?: string | null
          name: string
          related_links?: Json | null
          shopping_list?: Json | null
          status?: string | null
          summary: string
          symptoms?: Database["public"]["Enums"]["symptom_type"][] | null
          thumbnail_description?: string | null
          video_description?: string | null
          video_url?: string | null
        }
        Update: {
          brief_description?: string | null
          click_count?: number | null
          created_at?: string | null
          description?: string | null
          expert_recommendations?: string[] | null
          id?: string
          image_url?: string | null
          ingredients?: string[] | null
          main_image_description?: string | null
          main_image_url?: string | null
          name?: string
          related_links?: Json | null
          shopping_list?: Json | null
          status?: string | null
          summary?: string
          symptoms?: Database["public"]["Enums"]["symptom_type"][] | null
          thumbnail_description?: string | null
          video_description?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      remedy_likes: {
        Row: {
          created_at: string
          id: string
          remedy_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          remedy_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          remedy_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "remedy_likes_remedy_id_fkey"
            columns: ["remedy_id"]
            isOneToOne: false
            referencedRelation: "remedies"
            referencedColumns: ["id"]
          },
        ]
      }
      remedy_ratings: {
        Row: {
          created_at: string
          id: string
          rating: number
          remedy_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          rating: number
          remedy_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          rating?: number
          remedy_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "remedy_ratings_remedy_id_fkey"
            columns: ["remedy_id"]
            isOneToOne: false
            referencedRelation: "remedies"
            referencedColumns: ["id"]
          },
        ]
      }
      role_settings: {
        Row: {
          created_at: string
          id: string
          permissions: Json
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          permissions?: Json
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          permissions?: Json
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      saved_posts: {
        Row: {
          created_at: string | null
          id: string
          user_id: string
          video_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          user_id: string
          video_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_posts_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_remedies: {
        Row: {
          created_at: string
          id: string
          remedy_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          remedy_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          remedy_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_remedies_remedy_id_fkey"
            columns: ["remedy_id"]
            isOneToOne: false
            referencedRelation: "remedies"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_items: {
        Row: {
          affiliate_link: string | null
          created_at: string | null
          id: string
          name: string
          remedy_id: string | null
          url: string | null
        }
        Insert: {
          affiliate_link?: string | null
          created_at?: string | null
          id?: string
          name: string
          remedy_id?: string | null
          url?: string | null
        }
        Update: {
          affiliate_link?: string | null
          created_at?: string | null
          id?: string
          name?: string
          remedy_id?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shopping_items_remedy_id_fkey"
            columns: ["remedy_id"]
            isOneToOne: false
            referencedRelation: "remedies"
            referencedColumns: ["id"]
          },
        ]
      }
      symptom_clicks: {
        Row: {
          clicked_at: string | null
          id: string
          symptom: Database["public"]["Enums"]["symptom_type"]
          user_id: string | null
        }
        Insert: {
          clicked_at?: string | null
          id?: string
          symptom: Database["public"]["Enums"]["symptom_type"]
          user_id?: string | null
        }
        Update: {
          clicked_at?: string | null
          id?: string
          symptom?: Database["public"]["Enums"]["symptom_type"]
          user_id?: string | null
        }
        Relationships: []
      }
      symptom_details: {
        Row: {
          brief_description: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          related_experts: string[] | null
          related_ingredients: string[] | null
          symptom: Database["public"]["Enums"]["symptom_type"]
          thumbnail_description: string | null
          updated_at: string | null
          video_description: string | null
          video_links: Json | null
          video_url: string | null
        }
        Insert: {
          brief_description?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          related_experts?: string[] | null
          related_ingredients?: string[] | null
          symptom: Database["public"]["Enums"]["symptom_type"]
          thumbnail_description?: string | null
          updated_at?: string | null
          video_description?: string | null
          video_links?: Json | null
          video_url?: string | null
        }
        Update: {
          brief_description?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          related_experts?: string[] | null
          related_ingredients?: string[] | null
          symptom?: Database["public"]["Enums"]["symptom_type"]
          thumbnail_description?: string | null
          updated_at?: string | null
          video_description?: string | null
          video_links?: Json | null
          video_url?: string | null
        }
        Relationships: []
      }
      symptom_experts: {
        Row: {
          created_at: string | null
          expert_id: string
          symptom_id: string
        }
        Insert: {
          created_at?: string | null
          expert_id: string
          symptom_id: string
        }
        Update: {
          created_at?: string | null
          expert_id?: string
          symptom_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "symptom_experts_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "experts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "symptom_experts_symptom_id_fkey"
            columns: ["symptom_id"]
            isOneToOne: false
            referencedRelation: "symptom_details"
            referencedColumns: ["id"]
          },
        ]
      }
      symptom_related_articles: {
        Row: {
          article_id: string | null
          created_at: string | null
          id: string
          symptom_id: string | null
        }
        Insert: {
          article_id?: string | null
          created_at?: string | null
          id?: string
          symptom_id?: string | null
        }
        Update: {
          article_id?: string | null
          created_at?: string | null
          id?: string
          symptom_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "symptom_related_articles_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "news_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "symptom_related_articles_symptom_id_fkey"
            columns: ["symptom_id"]
            isOneToOne: false
            referencedRelation: "symptom_details"
            referencedColumns: ["id"]
          },
        ]
      }
      symptom_related_links: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          symptom_id: string | null
          title: string
          url: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          symptom_id?: string | null
          title: string
          url: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          symptom_id?: string | null
          title?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "symptom_related_links_symptom_id_fkey"
            columns: ["symptom_id"]
            isOneToOne: false
            referencedRelation: "symptom_details"
            referencedColumns: ["id"]
          },
        ]
      }
      symptom_remedies: {
        Row: {
          created_at: string | null
          remedy_id: string
          symptom_id: string
        }
        Insert: {
          created_at?: string | null
          remedy_id: string
          symptom_id: string
        }
        Update: {
          created_at?: string | null
          remedy_id?: string
          symptom_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "symptom_remedies_remedy_id_fkey"
            columns: ["remedy_id"]
            isOneToOne: false
            referencedRelation: "remedies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "symptom_remedies_symptom_id_fkey"
            columns: ["symptom_id"]
            isOneToOne: false
            referencedRelation: "symptom_details"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_logs: {
        Row: {
          activity_details: Json | null
          activity_type: string
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          activity_details?: Json | null
          activity_type: string
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          activity_details?: Json | null
          activity_type?: string
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          modified_by: string | null
          new_values: Json | null
          old_values: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          modified_by?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          modified_by?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_profile_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      video_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          likes_count: number | null
          parent_id: string | null
          tagged_user_ids: string[] | null
          user_id: string
          video_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          parent_id?: string | null
          tagged_user_ids?: string[] | null
          user_id: string
          video_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          parent_id?: string | null
          tagged_user_ids?: string[] | null
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "video_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_comments_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      video_likes: {
        Row: {
          created_at: string | null
          id: string
          user_id: string
          video_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          user_id: string
          video_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_likes_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      video_product_links: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          position_x: number | null
          position_y: number | null
          price: number | null
          title: string
          url: string
          video_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          position_x?: number | null
          position_y?: number | null
          price?: number | null
          title: string
          url: string
          video_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          position_x?: number | null
          position_y?: number | null
          price?: number | null
          title?: string
          url?: string
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_product_links_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          created_at: string | null
          creator_id: string | null
          description: string | null
          id: string
          likes_count: number | null
          related_article_id: string | null
          show_in_latest: boolean | null
          status: Database["public"]["Enums"]["video_status"] | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          video_type: string | null
          video_url: string
          views_count: number | null
        }
        Insert: {
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          id?: string
          likes_count?: number | null
          related_article_id?: string | null
          show_in_latest?: boolean | null
          status?: Database["public"]["Enums"]["video_status"] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          video_type?: string | null
          video_url: string
          views_count?: number | null
        }
        Update: {
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          id?: string
          likes_count?: number | null
          related_article_id?: string | null
          show_in_latest?: boolean | null
          status?: Database["public"]["Enums"]["video_status"] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          video_type?: string | null
          video_url?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "videos_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "videos_related_article_id_fkey"
            columns: ["related_article_id"]
            isOneToOne: false
            referencedRelation: "news_articles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      check_user_role: {
        Args: {
          _checking_user_id: string
          required_roles: Database["public"]["Enums"]["user_role"][]
        }
        Returns: boolean
      }
      delete_user_data: {
        Args: { user_id: string; delete_content: boolean }
        Returns: undefined
      }
      generate_slug: {
        Args: { title: string }
        Returns: string
      }
      get_symptom_by_id: {
        Args: { id_param: string }
        Returns: {
          brief_description: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          related_experts: string[] | null
          related_ingredients: string[] | null
          symptom: Database["public"]["Enums"]["symptom_type"]
          thumbnail_description: string | null
          updated_at: string | null
          video_description: string | null
          video_links: Json | null
          video_url: string | null
        }[]
      }
      get_symptom_related_content: {
        Args: { p_symptom: Database["public"]["Enums"]["symptom_type"] }
        Returns: {
          related_remedies: Json
          related_ingredients: Json
          related_experts: Json
          related_articles: Json
          related_links: Json
        }[]
      }
      get_top_symptoms: {
        Args: { limit_count?: number }
        Returns: {
          symptom: Database["public"]["Enums"]["symptom_type"]
          click_count: number
        }[]
      }
      increment_video_views: {
        Args: { video_id: string }
        Returns: undefined
      }
      log_admin_action: {
        Args: { action: string; entity_type: string; entity_id: string }
        Returns: string
      }
      log_user_activity: {
        Args: {
          user_id: string
          activity_type: string
          activity_details?: Json
        }
        Returns: string
      }
    }
    Enums: {
      symptom_type:
        | "Cough"
        | "Cold"
        | "Sore Throat"
        | "Cancer"
        | "Stress"
        | "Anxiety"
        | "Depression"
        | "Insomnia"
        | "Headache"
        | "Joint Pain"
        | "Digestive Issues"
        | "Fatigue"
        | "Skin Irritation"
        | "High Blood Pressure"
        | "Allergies"
        | "Weak Immunity"
        | "Back Pain"
        | "Poor Circulation"
        | "Hair Loss"
        | "Eye Strain"
      user_role: "user" | "admin" | "super_admin"
      video_status: "draft" | "published" | "archived"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      symptom_type: [
        "Cough",
        "Cold",
        "Sore Throat",
        "Cancer",
        "Stress",
        "Anxiety",
        "Depression",
        "Insomnia",
        "Headache",
        "Joint Pain",
        "Digestive Issues",
        "Fatigue",
        "Skin Irritation",
        "High Blood Pressure",
        "Allergies",
        "Weak Immunity",
        "Back Pain",
        "Poor Circulation",
        "Hair Loss",
        "Eye Strain",
      ],
      user_role: ["user", "admin", "super_admin"],
      video_status: ["draft", "published", "archived"],
    },
  },
} as const
