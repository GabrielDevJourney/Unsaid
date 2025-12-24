export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export type Database = {
    graphql_public: {
        Tables: {
            [_ in never]: never;
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            graphql: {
                Args: {
                    extensions?: Json;
                    operationName?: string;
                    query?: string;
                    variables?: Json;
                };
                Returns: Json;
            };
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
    public: {
        Tables: {
            entries: {
                Row: {
                    content: string;
                    created_at: string;
                    embedding: string | null;
                    id: string;
                    updated_at: string;
                    user_id: string;
                    word_count: number;
                };
                Insert: {
                    content: string;
                    created_at?: string;
                    embedding?: string | null;
                    id?: string;
                    updated_at?: string;
                    user_id: string;
                    word_count?: number;
                };
                Update: {
                    content?: string;
                    created_at?: string;
                    embedding?: string | null;
                    id?: string;
                    updated_at?: string;
                    user_id?: string;
                    word_count?: number;
                };
                Relationships: [
                    {
                        foreignKeyName: "entries_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: false;
                        referencedRelation: "users";
                        referencedColumns: ["user_id"];
                    },
                ];
            };
            entry_insights: {
                Row: {
                    content: string;
                    created_at: string;
                    entry_id: string;
                    id: string;
                    updated_at: string;
                    user_id: string;
                };
                Insert: {
                    content: string;
                    created_at?: string;
                    entry_id: string;
                    id?: string;
                    updated_at?: string;
                    user_id: string;
                };
                Update: {
                    content?: string;
                    created_at?: string;
                    entry_id?: string;
                    id?: string;
                    updated_at?: string;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "entry_insights_entry_id_fkey";
                        columns: ["entry_id"];
                        isOneToOne: true;
                        referencedRelation: "entries";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "entry_insights_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: false;
                        referencedRelation: "users";
                        referencedColumns: ["user_id"];
                    },
                ];
            };
            progress_insights: {
                Row: {
                    content: string;
                    created_at: string;
                    id: string;
                    recent_entry_ids: string[];
                    related_past_entry_ids: string[] | null;
                    updated_at: string;
                    user_id: string;
                };
                Insert: {
                    content: string;
                    created_at?: string;
                    id?: string;
                    recent_entry_ids?: string[];
                    related_past_entry_ids?: string[] | null;
                    updated_at?: string;
                    user_id: string;
                };
                Update: {
                    content?: string;
                    created_at?: string;
                    id?: string;
                    recent_entry_ids?: string[];
                    related_past_entry_ids?: string[] | null;
                    updated_at?: string;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "progress_insights_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: false;
                        referencedRelation: "users";
                        referencedColumns: ["user_id"];
                    },
                ];
            };
            prompts: {
                Row: {
                    created_at: string;
                    id: string;
                    is_used: boolean | null;
                    prompt_text: string;
                    updated_at: string;
                    user_id: string;
                };
                Insert: {
                    created_at?: string;
                    id?: string;
                    is_used?: boolean | null;
                    prompt_text: string;
                    updated_at?: string;
                    user_id: string;
                };
                Update: {
                    created_at?: string;
                    id?: string;
                    is_used?: boolean | null;
                    prompt_text?: string;
                    updated_at?: string;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "prompts_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: false;
                        referencedRelation: "users";
                        referencedColumns: ["user_id"];
                    },
                ];
            };
            user_progress: {
                Row: {
                    entry_count_at_last_progress: number;
                    total_entries: number;
                    updated_at: string;
                    user_id: string;
                };
                Insert: {
                    entry_count_at_last_progress?: number;
                    total_entries?: number;
                    updated_at?: string;
                    user_id: string;
                };
                Update: {
                    entry_count_at_last_progress?: number;
                    total_entries?: number;
                    updated_at?: string;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "user_progress_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: true;
                        referencedRelation: "users";
                        referencedColumns: ["user_id"];
                    },
                ];
            };
            users: {
                Row: {
                    created_at: string;
                    deleted_at: string | null;
                    email: string;
                    id: string;
                    subscription_status: string;
                    trial_ends_at: string | null;
                    trial_started_at: string | null;
                    updated_at: string;
                    user_id: string;
                };
                Insert: {
                    created_at?: string;
                    deleted_at?: string | null;
                    email: string;
                    id?: string;
                    subscription_status?: string;
                    trial_ends_at?: string | null;
                    trial_started_at?: string | null;
                    updated_at?: string;
                    user_id: string;
                };
                Update: {
                    created_at?: string;
                    deleted_at?: string | null;
                    email?: string;
                    id?: string;
                    subscription_status?: string;
                    trial_ends_at?: string | null;
                    trial_started_at?: string | null;
                    updated_at?: string;
                    user_id?: string;
                };
                Relationships: [];
            };
            weekly_insight_patterns: {
                Row: {
                    created_at: string;
                    description: string;
                    evidence: string[];
                    id: string;
                    pattern_type: string;
                    question: string | null;
                    suggested_experiment: string | null;
                    title: string;
                    weekly_insight_id: string;
                };
                Insert: {
                    created_at?: string;
                    description: string;
                    evidence?: string[];
                    id?: string;
                    pattern_type: string;
                    question?: string | null;
                    suggested_experiment?: string | null;
                    title: string;
                    weekly_insight_id: string;
                };
                Update: {
                    created_at?: string;
                    description?: string;
                    evidence?: string[];
                    id?: string;
                    pattern_type?: string;
                    question?: string | null;
                    suggested_experiment?: string | null;
                    title?: string;
                    weekly_insight_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "weekly_insight_patterns_weekly_insight_id_fkey";
                        columns: ["weekly_insight_id"];
                        isOneToOne: false;
                        referencedRelation: "weekly_insights";
                        referencedColumns: ["id"];
                    },
                ];
            };
            weekly_insights: {
                Row: {
                    created_at: string;
                    entry_ids: string[];
                    id: string;
                    updated_at: string;
                    user_id: string;
                    week_start: string;
                };
                Insert: {
                    created_at?: string;
                    entry_ids?: string[];
                    id?: string;
                    updated_at?: string;
                    user_id: string;
                    week_start: string;
                };
                Update: {
                    created_at?: string;
                    entry_ids?: string[];
                    id?: string;
                    updated_at?: string;
                    user_id?: string;
                    week_start?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "weekly_insights_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: false;
                        referencedRelation: "users";
                        referencedColumns: ["user_id"];
                    },
                ];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
    keyof Database,
    "public"
>];

export type Tables<
    DefaultSchemaTableNameOrOptions extends
        | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
        | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
              DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
        : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
          DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
          Row: infer R;
      }
        ? R
        : never
    : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
            DefaultSchema["Views"])
      ? (DefaultSchema["Tables"] &
            DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
            Row: infer R;
        }
          ? R
          : never
      : never;

export type TablesInsert<
    DefaultSchemaTableNameOrOptions extends
        | keyof DefaultSchema["Tables"]
        | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
        : never = never,
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
        | keyof DefaultSchema["Tables"]
        | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
        : never = never,
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
        | keyof DefaultSchema["Enums"]
        | { schema: keyof DatabaseWithoutInternals },
    EnumName extends DefaultSchemaEnumNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
        : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
      ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
      : never;

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
        | keyof DefaultSchema["CompositeTypes"]
        | { schema: keyof DatabaseWithoutInternals },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
        : never = never,
> = PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
      ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
      : never;

export const Constants = {
    graphql_public: {
        Enums: {},
    },
    public: {
        Enums: {},
    },
} as const;
