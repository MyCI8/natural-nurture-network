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
      experts: {
        Row: {
          bio: string | null
          created_at: string | null
          full_name: string
          id: string
          image_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          full_name: string
          id?: string
          image_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          image_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ingredients: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          summary: string | null
          videos: Json | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          summary?: string | null
          videos?: Json | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          summary?: string | null
          videos?: Json | null
        }
        Relationships: []
      }
      news_article_links: {
        Row: {
          article_id: string | null
          created_at: string | null
          id: string
          title: string
          url: string
        }
        Insert: {
          article_id?: string | null
          created_at?: string | null
          id?: string
          title: string
          url: string
        }
        Update: {
          article_id?: string | null
          created_at?: string | null
          id?: string
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
          published_at: string | null
          related_experts: string[] | null
          related_links: Json | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          image_caption?: string | null
          image_credit?: string | null
          image_url?: string | null
          published_at?: string | null
          related_experts?: string[] | null
          related_links?: Json | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          image_caption?: string | null
          image_credit?: string | null
          image_url?: string | null
          published_at?: string | null
          related_experts?: string[] | null
          related_links?: Json | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_status: string
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          account_status?: string
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          account_status?: string
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      remedies: {
        Row: {
          click_count: number | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string
          ingredients: string[] | null
          name: string
          shopping_list: Json | null
          status: string | null
          summary: string
          symptoms: Database["public"]["Enums"]["symptom_type"][] | null
          video_url: string | null
        }
        Insert: {
          click_count?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url: string
          ingredients?: string[] | null
          name: string
          shopping_list?: Json | null
          status?: string | null
          summary: string
          symptoms?: Database["public"]["Enums"]["symptom_type"][] | null
          video_url?: string | null
        }
        Update: {
          click_count?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string
          ingredients?: string[] | null
          name?: string
          shopping_list?: Json | null
          status?: string | null
          summary?: string
          symptoms?: Database["public"]["Enums"]["symptom_type"][] | null
          video_url?: string | null
        }
        Relationships: []
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
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_user_data: {
        Args: {
          user_id: string
          delete_content: boolean
        }
        Returns: undefined
      }
      get_top_symptoms: {
        Args: {
          limit_count?: number
        }
        Returns: {
          symptom: Database["public"]["Enums"]["symptom_type"]
          click_count: number
        }[]
      }
      has_role: {
        Args: {
          role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          action: string
          entity_type: string
          entity_id: string
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
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
