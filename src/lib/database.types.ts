export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      people: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          phone: string
          status: 'visitor' | 'regular' | 'member' | 'leader' | 'inactive'
          photo: string | null
          address: string | null
          city: string | null
          state: string | null
          zip: string | null
          birth_date: string | null
          join_date: string | null
          first_visit: string | null
          notes: string | null
          tags: string[]
          small_groups: string[]
          family_id: string | null
          organization_id: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['people']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['people']['Insert']>
      }
      interactions: {
        Row: {
          id: string
          person_id: string
          type: 'note' | 'call' | 'email' | 'visit' | 'text' | 'prayer'
          content: string
          created_at: string
          created_by: string
          organization_id: string
        }
        Insert: Omit<Database['public']['Tables']['interactions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['interactions']['Insert']>
      }
      tasks: {
        Row: {
          id: string
          person_id: string | null
          title: string
          description: string | null
          due_date: string
          completed: boolean
          priority: 'low' | 'medium' | 'high'
          assigned_to: string | null
          category: 'follow-up' | 'care' | 'admin' | 'outreach'
          organization_id: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['tasks']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>
      }
      small_groups: {
        Row: {
          id: string
          name: string
          description: string | null
          leader_id: string
          meeting_day: string | null
          meeting_time: string | null
          location: string | null
          members: string[]
          is_active: boolean
          organization_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['small_groups']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['small_groups']['Insert']>
      }
      prayer_requests: {
        Row: {
          id: string
          person_id: string
          content: string
          is_private: boolean
          is_answered: boolean
          testimony: string | null
          organization_id: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['prayer_requests']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['prayer_requests']['Insert']>
      }
      communications: {
        Row: {
          id: string
          person_id: string
          type: 'email' | 'sms'
          subject: string | null
          content: string
          template_used: string | null
          sent_at: string
          sent_by: string
          status: 'sent' | 'failed' | 'pending'
          organization_id: string
        }
        Insert: Omit<Database['public']['Tables']['communications']['Row'], 'id' | 'sent_at'>
        Update: Partial<Database['public']['Tables']['communications']['Insert']>
      }
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          logo: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['organizations']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['organizations']['Insert']>
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          organization_id: string | null
          role: 'admin' | 'staff' | 'volunteer'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
    }
  }
}
