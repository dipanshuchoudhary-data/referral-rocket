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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          created_at: string
          id: string
          meta: Json | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          meta?: Json | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          meta?: Json | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      badges_earned: {
        Row: {
          badge_key: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_key: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_key?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      challenge_progress: {
        Row: {
          challenge_id: string
          claimed_at: string | null
          completed_at: string | null
          id: string
          progress: number
          user_id: string
        }
        Insert: {
          challenge_id: string
          claimed_at?: string | null
          completed_at?: string | null
          id?: string
          progress?: number
          user_id: string
        }
        Update: {
          challenge_id?: string
          claimed_at?: string | null
          completed_at?: string | null
          id?: string
          progress?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          created_at: string
          description: string | null
          emoji: string | null
          ends_at: string | null
          id: string
          is_active: boolean
          kind: Database["public"]["Enums"]["challenge_kind"]
          metric: string
          reward_cash: number
          reward_xp: number
          starts_at: string | null
          target: number
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          emoji?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          kind: Database["public"]["Enums"]["challenge_kind"]
          metric?: string
          reward_cash?: number
          reward_xp?: number
          starts_at?: string | null
          target?: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          emoji?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          kind?: Database["public"]["Enums"]["challenge_kind"]
          metric?: string
          reward_cash?: number
          reward_xp?: number
          starts_at?: string | null
          target?: number
          title?: string
        }
        Relationships: []
      }
      checkin_logs: {
        Row: {
          created_at: string
          date: string
          id: string
          user_id: string
          xp_earned: number
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          user_id: string
          xp_earned?: number
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          user_id?: string
          xp_earned?: number
        }
        Relationships: []
      }
      lucky_draws: {
        Row: {
          created_at: string
          id: string
          prize_amount: number
          prize_kind: string
          prize_label: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          prize_amount?: number
          prize_kind: string
          prize_label: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          prize_amount?: number
          prize_kind?: string
          prize_label?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read_at: string | null
          title: string
          type: Database["public"]["Enums"]["notif_type"]
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title: string
          type?: Database["public"]["Enums"]["notif_type"]
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notif_type"]
          user_id?: string
        }
        Relationships: []
      }
      payout_methods: {
        Row: {
          account_holder: string | null
          account_number: string | null
          bank_name: string | null
          created_at: string
          id: string
          ifsc: string | null
          kind: string
          updated_at: string
          upi_id: string | null
          user_id: string
        }
        Insert: {
          account_holder?: string | null
          account_number?: string | null
          bank_name?: string | null
          created_at?: string
          id?: string
          ifsc?: string | null
          kind: string
          updated_at?: string
          upi_id?: string | null
          user_id: string
        }
        Update: {
          account_holder?: string | null
          account_number?: string | null
          bank_name?: string | null
          created_at?: string
          id?: string
          ifsc?: string | null
          kind?: string
          updated_at?: string
          upi_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pg_visits: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          property_id: string
          scheduled_at: string
          status: Database["public"]["Enums"]["visit_status"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          property_id: string
          scheduled_at: string
          status?: Database["public"]["Enums"]["visit_status"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          property_id?: string
          scheduled_at?: string
          status?: Database["public"]["Enums"]["visit_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pg_visits_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          last_referral_date: string | null
          level: number
          lucky_tickets: number
          persona: Database["public"]["Enums"]["persona"] | null
          phone: string | null
          referral_code: string
          referred_by: string | null
          streak_days: number
          total_clicks: number
          updated_at: string
          xp: number
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          last_referral_date?: string | null
          level?: number
          lucky_tickets?: number
          persona?: Database["public"]["Enums"]["persona"] | null
          phone?: string | null
          referral_code: string
          referred_by?: string | null
          streak_days?: number
          total_clicks?: number
          updated_at?: string
          xp?: number
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          last_referral_date?: string | null
          level?: number
          lucky_tickets?: number
          persona?: Database["public"]["Enums"]["persona"] | null
          phone?: string | null
          referral_code?: string
          referred_by?: string | null
          streak_days?: number
          total_clicks?: number
          updated_at?: string
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          amenities: string[]
          area: string
          city: string
          created_at: string
          description: string | null
          flash_ends_at: string | null
          flash_multiplier: number | null
          gender: Database["public"]["Enums"]["gender_pref"]
          id: string
          images: string[]
          is_flash: boolean
          is_verified: boolean
          manager_id: string | null
          name: string
          rating: number | null
          rent_max: number
          rent_min: number
          spots_left: number | null
          type: Database["public"]["Enums"]["property_type"]
          updated_at: string
        }
        Insert: {
          amenities?: string[]
          area: string
          city?: string
          created_at?: string
          description?: string | null
          flash_ends_at?: string | null
          flash_multiplier?: number | null
          gender?: Database["public"]["Enums"]["gender_pref"]
          id?: string
          images?: string[]
          is_flash?: boolean
          is_verified?: boolean
          manager_id?: string | null
          name: string
          rating?: number | null
          rent_max?: number
          rent_min?: number
          spots_left?: number | null
          type?: Database["public"]["Enums"]["property_type"]
          updated_at?: string
        }
        Update: {
          amenities?: string[]
          area?: string
          city?: string
          created_at?: string
          description?: string | null
          flash_ends_at?: string | null
          flash_multiplier?: number | null
          gender?: Database["public"]["Enums"]["gender_pref"]
          id?: string
          images?: string[]
          is_flash?: boolean
          is_verified?: boolean
          manager_id?: string | null
          name?: string
          rating?: number | null
          rent_max?: number
          rent_min?: number
          spots_left?: number | null
          type?: Database["public"]["Enums"]["property_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_clicks: {
        Row: {
          code: string
          created_at: string
          id: string
          ip: string | null
          referrer_id: string | null
          user_agent: string | null
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          ip?: string | null
          referrer_id?: string | null
          user_agent?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          ip?: string | null
          referrer_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          admin_note: string | null
          area: string | null
          booked_at: string | null
          created_at: string
          id: string
          notes: string | null
          paid_at: string | null
          payout_status: string
          property_type: string | null
          referee_email: string | null
          referee_name: string
          referee_phone: string
          referrer_id: string
          reward_amount: number
          status: Database["public"]["Enums"]["referral_status"]
          updated_at: string
          verified_at: string | null
        }
        Insert: {
          admin_note?: string | null
          area?: string | null
          booked_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          payout_status?: string
          property_type?: string | null
          referee_email?: string | null
          referee_name: string
          referee_phone: string
          referrer_id: string
          reward_amount?: number
          status?: Database["public"]["Enums"]["referral_status"]
          updated_at?: string
          verified_at?: string | null
        }
        Update: {
          admin_note?: string | null
          area?: string | null
          booked_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          payout_status?: string
          property_type?: string | null
          referee_email?: string | null
          referee_name?: string
          referee_phone?: string
          referrer_id?: string
          reward_amount?: number
          status?: Database["public"]["Enums"]["referral_status"]
          updated_at?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards_ledger: {
        Row: {
          amount: number
          created_at: string
          id: string
          reason: string
          referral_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          reason: string
          referral_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          reason?: string
          referral_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rewards_ledger_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      squad_battles: {
        Row: {
          created_at: string
          ends_at: string
          id: string
          metric: string
          prize_xp: number
          starts_at: string
          team_a_id: string
          team_a_score: number
          team_b_id: string
          team_b_score: number
          winner_id: string | null
        }
        Insert: {
          created_at?: string
          ends_at: string
          id?: string
          metric?: string
          prize_xp?: number
          starts_at?: string
          team_a_id: string
          team_a_score?: number
          team_b_id: string
          team_b_score?: number
          winner_id?: string | null
        }
        Update: {
          created_at?: string
          ends_at?: string
          id?: string
          metric?: string
          prize_xp?: number
          starts_at?: string
          team_a_id?: string
          team_a_score?: number
          team_b_id?: string
          team_b_score?: number
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "squad_battles_team_a_id_fkey"
            columns: ["team_a_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "squad_battles_team_b_id_fkey"
            columns: ["team_b_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          joined_at: string
          team_id: string
          user_id: string
        }
        Insert: {
          joined_at?: string
          team_id: string
          user_id: string
        }
        Update: {
          joined_at?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          captain_id: string | null
          created_at: string
          description: string | null
          emoji: string | null
          id: string
          member_count: number
          name: string
          slug: string
          total_xp: number
        }
        Insert: {
          captain_id?: string | null
          created_at?: string
          description?: string | null
          emoji?: string | null
          id?: string
          member_count?: number
          name: string
          slug: string
          total_xp?: number
        }
        Update: {
          captain_id?: string | null
          created_at?: string
          description?: string | null
          emoji?: string | null
          id?: string
          member_count?: number
          name?: string
          slug?: string
          total_xp?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waitlists: {
        Row: {
          created_at: string
          id: string
          property_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          property_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          property_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "waitlists_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_admin_if_none: { Args: never; Returns: boolean }
      daily_checkin: { Args: never; Returns: Json }
      generate_referral_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      join_team: { Args: { _slug: string }; Returns: undefined }
      leave_team: { Args: { _slug: string }; Returns: undefined }
      level_for_xp: { Args: { _xp: number }; Returns: number }
      set_persona: {
        Args: { _persona: Database["public"]["Enums"]["persona"] }
        Returns: undefined
      }
      spin_lucky: { Args: never; Returns: Json }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      challenge_kind: "DAILY" | "WEEKLY" | "MILESTONE" | "SPECIAL"
      gender_pref: "MALE" | "FEMALE" | "COED"
      notif_type:
        | "REFERRAL"
        | "PAYOUT"
        | "BADGE"
        | "TEAM"
        | "SYSTEM"
        | "VISIT"
        | "CHALLENGE"
      persona:
        | "GUARD"
        | "STUDENT"
        | "EARNER"
        | "PG_MANAGER"
        | "BROKER"
        | "INFLUENCER"
        | "CORPORATE_HR"
      property_type: "PG" | "FLAT_1BHK" | "FLAT_2BHK" | "HOUSE" | "STUDIO"
      referral_status: "pending" | "verified" | "booked" | "rejected"
      visit_status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW"
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
      app_role: ["admin", "moderator", "user"],
      challenge_kind: ["DAILY", "WEEKLY", "MILESTONE", "SPECIAL"],
      gender_pref: ["MALE", "FEMALE", "COED"],
      notif_type: [
        "REFERRAL",
        "PAYOUT",
        "BADGE",
        "TEAM",
        "SYSTEM",
        "VISIT",
        "CHALLENGE",
      ],
      persona: [
        "GUARD",
        "STUDENT",
        "EARNER",
        "PG_MANAGER",
        "BROKER",
        "INFLUENCER",
        "CORPORATE_HR",
      ],
      property_type: ["PG", "FLAT_1BHK", "FLAT_2BHK", "HOUSE", "STUDIO"],
      referral_status: ["pending", "verified", "booked", "rejected"],
      visit_status: ["SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"],
    },
  },
} as const
