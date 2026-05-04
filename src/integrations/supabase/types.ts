export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      event_waitlist: {
        Row: {
          created_at: string
          email: string
          event_slug: string
          goals: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          event_slug?: string
          goals?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          event_slug?: string
          goals?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      landing_pages: {
        Row: {
          cloned_from: string | null
          created_at: string
          cta_label: string | null
          deleted_at: string | null
          description: string | null
          headline: string | null
          hero_image_url: string | null
          id: string
          is_published: boolean
          lead_magnet_type: string | null
          lead_magnet_value: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          subheadline: string | null
          submission_count: number
          title: string
          updated_at: string
          utm_medium: string | null
          view_count: number
        }
        Insert: {
          cloned_from?: string | null
          created_at?: string
          cta_label?: string | null
          deleted_at?: string | null
          description?: string | null
          headline?: string | null
          hero_image_url?: string | null
          id?: string
          is_published?: boolean
          lead_magnet_type?: string | null
          lead_magnet_value?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          subheadline?: string | null
          submission_count?: number
          title: string
          updated_at?: string
          utm_medium?: string | null
          view_count?: number
        }
        Update: {
          cloned_from?: string | null
          created_at?: string
          cta_label?: string | null
          deleted_at?: string | null
          description?: string | null
          headline?: string | null
          hero_image_url?: string | null
          id?: string
          is_published?: boolean
          lead_magnet_type?: string | null
          lead_magnet_value?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          subheadline?: string | null
          submission_count?: number
          title?: string
          updated_at?: string
          utm_medium?: string | null
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "landing_pages_cloned_from_fkey"
            columns: ["cloned_from"]
            isOneToOne: false
            referencedRelation: "landing_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      link_redirects: {
        Row: {
          created_at: string
          destination: string
          id: string
          last_visited_at: string | null
          path: string
          redirect_type: string
          visit_count: number
        }
        Insert: {
          created_at?: string
          destination: string
          id?: string
          last_visited_at?: string | null
          path: string
          redirect_type?: string
          visit_count?: number
        }
        Update: {
          created_at?: string
          destination?: string
          id?: string
          last_visited_at?: string | null
          path?: string
          redirect_type?: string
          visit_count?: number
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          subscribed_at: string
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          email: string
          id?: string
          subscribed_at?: string
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          email?: string
          id?: string
          subscribed_at?: string
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      page_views: {
        Row: {
          created_at: string
          id: string
          page_path: string
        }
        Insert: {
          created_at?: string
          id?: string
          page_path: string
        }
        Update: {
          created_at?: string
          id?: string
          page_path?: string
        }
        Relationships: []
      }
      resource_center_items: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_visible: boolean
          links: Json
          tag: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_visible?: boolean
          links?: Json
          tag?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_visible?: boolean
          links?: Json
          tag?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      resource_intents: {
        Row: {
          created_at: string
          email: string | null
          id: string
          page_path: string | null
          referrer: string | null
          response: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          page_path?: string | null
          referrer?: string | null
          response?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          page_path?: string | null
          referrer?: string | null
          response?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_view_count: { Args: { page_id: string }; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
