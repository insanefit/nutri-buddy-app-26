export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      foods: {
        Row: {
          calories_per_100g: number;
          carbs_per_100g: number;
          created_at: string;
          created_by: string | null;
          fat_per_100g: number;
          id: string;
          is_custom: boolean;
          name: string;
          protein_per_100g: number;
          unit: string;
          updated_at: string;
        };
        Insert: {
          calories_per_100g?: number;
          carbs_per_100g?: number;
          created_at?: string;
          created_by?: string | null;
          fat_per_100g?: number;
          id?: string;
          is_custom?: boolean;
          name: string;
          protein_per_100g?: number;
          unit?: string;
          updated_at?: string;
        };
        Update: {
          calories_per_100g?: number;
          carbs_per_100g?: number;
          created_at?: string;
          created_by?: string | null;
          fat_per_100g?: number;
          id?: string;
          is_custom?: boolean;
          name?: string;
          protein_per_100g?: number;
          unit?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "foods_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      meal_items: {
        Row: {
          calculated_calories: number;
          calculated_carbs: number;
          calculated_fat: number;
          calculated_protein: number;
          created_at: string;
          food_id: string;
          id: string;
          meal_id: string;
          quantity_grams: number;
          updated_at: string;
        };
        Insert: {
          calculated_calories?: number;
          calculated_carbs?: number;
          calculated_fat?: number;
          calculated_protein?: number;
          created_at?: string;
          food_id: string;
          id?: string;
          meal_id: string;
          quantity_grams?: number;
          updated_at?: string;
        };
        Update: {
          calculated_calories?: number;
          calculated_carbs?: number;
          calculated_fat?: number;
          calculated_protein?: number;
          created_at?: string;
          food_id?: string;
          id?: string;
          meal_id?: string;
          quantity_grams?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "meal_items_food_id_fkey";
            columns: ["food_id"];
            isOneToOne: false;
            referencedRelation: "foods";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "meal_items_meal_id_fkey";
            columns: ["meal_id"];
            isOneToOne: false;
            referencedRelation: "meals";
            referencedColumns: ["id"];
          },
        ];
      };
      meals: {
        Row: {
          created_at: string;
          id: string;
          meal_date: string;
          name: string;
          nutritionist_id: string;
          patient_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          meal_date?: string;
          name: string;
          nutritionist_id: string;
          patient_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          meal_date?: string;
          name?: string;
          nutritionist_id?: string;
          patient_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "meals_nutritionist_id_fkey";
            columns: ["nutritionist_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "meals_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
        ];
      };
      patients: {
        Row: {
          category: string;
          created_at: string;
          daily_calorie_goal: number | null;
          email: string | null;
          full_name: string;
          id: string;
          notes: string | null;
          nutritionist_id: string;
          patient_user_id: string | null;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          category?: string;
          created_at?: string;
          daily_calorie_goal?: number | null;
          email?: string | null;
          full_name: string;
          id?: string;
          notes?: string | null;
          nutritionist_id: string;
          patient_user_id?: string | null;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          daily_calorie_goal?: number | null;
          email?: string | null;
          full_name?: string;
          id?: string;
          notes?: string | null;
          nutritionist_id?: string;
          patient_user_id?: string | null;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "patients_nutritionist_id_fkey";
            columns: ["nutritionist_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "patients_patient_user_id_fkey";
            columns: ["patient_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      lgpd_consents: {
        Row: {
          consent_given: boolean;
          consent_version: string;
          created_at: string;
          id: string;
          nutritionist_id: string;
          patient_id: string;
        };
        Insert: {
          consent_given?: boolean;
          consent_version?: string;
          created_at?: string;
          id?: string;
          nutritionist_id: string;
          patient_id: string;
        };
        Update: {
          consent_given?: boolean;
          consent_version?: string;
          created_at?: string;
          id?: string;
          nutritionist_id?: string;
          patient_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lgpd_consents_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          full_name: string | null;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string | null;
          id: string;
          role?: Database["public"]["Enums"]["app_role"];
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string | null;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_patient_with_consent: {
        Args: {
          p_full_name: string;
          p_email: string | null;
          p_phone: string | null;
          p_category: string | null;
          p_daily_calorie_goal: number | null;
          p_notes: string | null;
          p_lgpd_consent: boolean;
        };
        Returns: Json;
      };
      is_nutritionist: {
        Args: {
          lookup_id?: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "nutritionist" | "patient";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["nutritionist", "patient"],
    },
  },
} as const;
