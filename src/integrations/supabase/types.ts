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
      cart_items: {
        Row: {
          brand: string | null
          color: string | null
          created_at: string
          id: string
          quantity: number | null
          shoe_id: string
          size: number
          updated_at: string
          user_id: string
        }
        Insert: {
          brand?: string | null
          color?: string | null
          created_at?: string
          id?: string
          quantity?: number | null
          shoe_id: string
          size: number
          updated_at?: string
          user_id: string
        }
        Update: {
          brand?: string | null
          color?: string | null
          created_at?: string
          id?: string
          quantity?: number | null
          shoe_id?: string
          size?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_shoe_id_fkey"
            columns: ["shoe_id"]
            isOneToOne: false
            referencedRelation: "shoes"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          color: string
          created_at: string | null
          id: string
          order_id: string
          price: number
          quantity: number
          shoe_id: string
          size: number
        }
        Insert: {
          color?: string
          created_at?: string | null
          id?: string
          order_id: string
          price: number
          quantity: number
          shoe_id: string
          size: number
        }
        Update: {
          color?: string
          created_at?: string | null
          id?: string
          order_id?: string
          price?: number
          quantity?: number
          shoe_id?: string
          size?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_shoe_id_fkey"
            columns: ["shoe_id"]
            isOneToOne: false
            referencedRelation: "shoes"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string
          apartment: string | null
          city: string
          created_at: string | null
          discount_code: string | null
          email: string
          email_newsletter: boolean | null
          first_name: string
          id: string
          last_name: string
          order_code: string | null
          payment_method: string | null
          phone: string
          postal_code: string
          shipping_cost: number
          shipping_method: string
          status: string
          subtotal: number
          tax: number
          total: number
          user_id: string
        }
        Insert: {
          address: string
          apartment?: string | null
          city: string
          created_at?: string | null
          discount_code?: string | null
          email: string
          email_newsletter?: boolean | null
          first_name: string
          id?: string
          last_name: string
          order_code?: string | null
          payment_method?: string | null
          phone: string
          postal_code: string
          shipping_cost?: number
          shipping_method?: string
          status?: string
          subtotal: number
          tax: number
          total: number
          user_id: string
        }
        Update: {
          address?: string
          apartment?: string | null
          city?: string
          created_at?: string | null
          discount_code?: string | null
          email?: string
          email_newsletter?: boolean | null
          first_name?: string
          id?: string
          last_name?: string
          order_code?: string | null
          payment_method?: string | null
          phone?: string
          postal_code?: string
          shipping_cost?: number
          shipping_method?: string
          status?: string
          subtotal?: number
          tax?: number
          total?: number
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          phone: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id: string
          phone?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          phone?: string | null
          username?: string | null
        }
        Relationships: []
      }
      recently_viewed: {
        Row: {
          id: string
          shoe_id: string
          user_id: string
          viewed_at: string | null
        }
        Insert: {
          id?: string
          shoe_id: string
          user_id: string
          viewed_at?: string | null
        }
        Update: {
          id?: string
          shoe_id?: string
          user_id?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recently_viewed_shoe_id_fkey"
            columns: ["shoe_id"]
            isOneToOne: false
            referencedRelation: "shoes"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          rating: number
          shoe_id: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating: number
          shoe_id: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number
          shoe_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_shoe_id_fkey"
            columns: ["shoe_id"]
            isOneToOne: false
            referencedRelation: "shoes"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_addresses: {
        Row: {
          address: string
          apartment: string | null
          city: string
          created_at: string | null
          id: string
          is_default: boolean
          last_used: string | null
          phone: string
          postal_code: string
          user_id: string
        }
        Insert: {
          address: string
          apartment?: string | null
          city: string
          created_at?: string | null
          id?: string
          is_default?: boolean
          last_used?: string | null
          phone: string
          postal_code: string
          user_id: string
        }
        Update: {
          address?: string
          apartment?: string | null
          city?: string
          created_at?: string | null
          id?: string
          is_default?: boolean
          last_used?: string | null
          phone?: string
          postal_code?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_payment_methods: {
        Row: {
          card_brand: string | null
          card_expiry: string | null
          card_last_four: string | null
          cardholder_name: string | null
          created_at: string | null
          id: string
          is_default: boolean | null
          payment_type: string
          user_id: string
        }
        Insert: {
          card_brand?: string | null
          card_expiry?: string | null
          card_last_four?: string | null
          cardholder_name?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          payment_type: string
          user_id: string
        }
        Update: {
          card_brand?: string | null
          card_expiry?: string | null
          card_last_four?: string | null
          cardholder_name?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          payment_type?: string
          user_id?: string
        }
        Relationships: []
      }
      shoes: {
        Row: {
          brand: string
          created_at: string | null
          id: string
          image_url: string | null
          name: string
          price: number
          sizes: number[]
          status: Database["public"]["Enums"]["shoe_status"]
        }
        Insert: {
          brand: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          name: string
          price: number
          sizes?: number[]
          status?: Database["public"]["Enums"]["shoe_status"]
        }
        Update: {
          brand?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          sizes?: number[]
          status?: Database["public"]["Enums"]["shoe_status"]
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          added_at: string | null
          id: string
          shoe_id: string
          user_id: string
        }
        Insert: {
          added_at?: string | null
          id?: string
          shoe_id: string
          user_id: string
        }
        Update: {
          added_at?: string | null
          id?: string
          shoe_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_shoe_id_fkey"
            columns: ["shoe_id"]
            isOneToOne: false
            referencedRelation: "shoes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      profiles_public: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string | null
          username: string | null
        }
        Relationships: []
      }
      reviews_public: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string | null
          rating: number | null
          reviewer_username: string | null
          shoe_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_shoe_id_fkey"
            columns: ["shoe_id"]
            isOneToOne: false
            referencedRelation: "shoes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      check_is_admin: {
        Args: {
          check_user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      validate_shoe_sizes: {
        Args: {
          sizes: number[]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "customer"
      shoe_status: "in_stock" | "sold_out"
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
    Enums: {
      app_role: ["admin", "customer"],
      shoe_status: ["in_stock", "sold_out"],
    },
  },
} as const
