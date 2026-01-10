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
            feedback: {
                Row: {
                    category: string | null;
                    created_at: string;
                    description: string;
                    id: string;
                    parent_id: string | null;
                    status: string;
                    title: string | null;
                    updated_at: string;
                    upvotes: number;
                    user_id: string;
                };
                Insert: {
                    category?: string | null;
                    created_at?: string;
                    description: string;
                    id?: string;
                    parent_id?: string | null;
                    status?: string;
                    title?: string | null;
                    updated_at?: string;
                    upvotes?: number;
                    user_id: string;
                };
                Update: {
                    category?: string | null;
                    created_at?: string;
                    description?: string;
                    id?: string;
                    parent_id?: string | null;
                    status?: string;
                    title?: string | null;
                    updated_at?: string;
                    upvotes?: number;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "feedback_parent_id_fkey";
                        columns: ["parent_id"];
                        isOneToOne: false;
                        referencedRelation: "feedback";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "feedback_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: false;
                        referencedRelation: "users";
                        referencedColumns: ["user_id"];
                    },
                ];
            };
            feedback_votes: {
                Row: {
                    created_at: string;
                    feedback_id: string;
                    user_id: string;
                };
                Insert: {
                    created_at?: string;
                    feedback_id: string;
                    user_id: string;
                };
                Update: {
                    created_at?: string;
                    feedback_id?: string;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "feedback_votes_feedback_id_fkey";
                        columns: ["feedback_id"];
                        isOneToOne: false;
                        referencedRelation: "feedback";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "feedback_votes_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: false;
                        referencedRelation: "users";
                        referencedColumns: ["user_id"];
                    },
                ];
            };
            payment_events: {
                Row: {
                    created_at: string;
                    event_type: string;
                    id: string;
                    lemon_event_id: string;
                    payload: Json;
                    processed_at: string | null;
                    user_id: string | null;
                };
                Insert: {
                    created_at?: string;
                    event_type: string;
                    id?: string;
                    lemon_event_id: string;
                    payload: Json;
                    processed_at?: string | null;
                    user_id?: string | null;
                };
                Update: {
                    created_at?: string;
                    event_type?: string;
                    id?: string;
                    lemon_event_id?: string;
                    payload?: Json;
                    processed_at?: string | null;
                    user_id?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "payment_events_user_id_fkey";
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
            subscriptions: {
                Row: {
                    canceled_at: string | null;
                    created_at: string;
                    current_period_end: string | null;
                    customer_portal_url: string | null;
                    id: string;
                    lemon_customer_id: string | null;
                    lemon_subscription_id: string | null;
                    plan_id: string | null;
                    status: string;
                    trial_ends_at: string | null;
                    updated_at: string;
                    user_id: string;
                };
                Insert: {
                    canceled_at?: string | null;
                    created_at?: string;
                    current_period_end?: string | null;
                    customer_portal_url?: string | null;
                    id?: string;
                    lemon_customer_id?: string | null;
                    lemon_subscription_id?: string | null;
                    plan_id?: string | null;
                    status?: string;
                    trial_ends_at?: string | null;
                    updated_at?: string;
                    user_id: string;
                };
                Update: {
                    canceled_at?: string | null;
                    created_at?: string;
                    current_period_end?: string | null;
                    customer_portal_url?: string | null;
                    id?: string;
                    lemon_customer_id?: string | null;
                    lemon_subscription_id?: string | null;
                    plan_id?: string | null;
                    status?: string;
                    trial_ends_at?: string | null;
                    updated_at?: string;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "subscriptions_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: true;
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
                    role: string;
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
                    role?: string;
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
                    role?: string;
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
            find_related_entries: {
                Args: {
                    entry_id_param: string;
                    match_count?: number;
                    match_threshold?: number;
                    user_id_param: string;
                };
                Returns: {
                    content: string;
                    created_at: string;
                    id: string;
                    similarity: number;
                    updated_at: string;
                    user_id: string;
                    word_count: number;
                }[];
            };
            search_entries_by_embedding: {
                Args: {
                    match_count?: number;
                    match_threshold?: number;
                    query_embedding: string;
                    user_id_param: string;
                };
                Returns: {
                    content: string;
                    created_at: string;
                    id: string;
                    similarity: number;
                    updated_at: string;
                    user_id: string;
                    word_count: number;
                }[];
            };
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
