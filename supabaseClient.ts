import { createClient } from '@supabase/supabase-js'

// Use the provided Supabase URL and Anon Key
const supabaseUrl = 'https://hebanactdmnjwymiagvt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlYmFuYWN0ZG1uand5bWlhZ3Z0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3Mjc0MjQsImV4cCI6MjA2NzMwMzQyNH0.DmtgQqUKdADd4P-yz0yvCs9ZiurskAeXjvHCqwLpeY4';

export type Json = any;

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          user_id: string
          subscription_plan: "Free" | "Pro" | "Team"
          email: string
          stripe_customer_id: string | null
        }
        Insert: {
          user_id: string
          subscription_plan: "Free" | "Pro" | "Team"
          email: string
          stripe_customer_id?: string | null
        }
        Update: {
          user_id?: string
          subscription_plan?: "Free" | "Pro" | "Team"
          email?: string
          stripe_customer_id?: string | null
        }
      }
      workspaces: {
        Row: {
          id: string
          created_at: string
          name: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
        }
      }
      workspace_members: {
        Row: {
          workspace_id: string
          user_id: string
          role: "Owner" | "Editor"
        }
        Insert: {
          workspace_id: string
          user_id: string
          role: "Owner" | "Editor"
        }
        Update: {
          workspace_id?: string
          user_id?: string
          role?: "Owner" | "Editor"
        }
      }
      folders: {
        Row: {
          id: string
          created_at: string
          name: string
          workspace_id: string
          parent_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          workspace_id: string
          parent_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          workspace_id?: string
          parent_id?: string | null
        }
      }
      templates: {
        Row: {
          id: string
          created_at: string
          name: string
          workspace_id: string
          folder_id: string | null
          tokens: Json
          variables: Json
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          workspace_id: string
          folder_id: string | null
          tokens: Json
          variables: Json
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          workspace_id?: string
          folder_id?: string | null
          tokens?: Json
          variables?: Json
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}


export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)