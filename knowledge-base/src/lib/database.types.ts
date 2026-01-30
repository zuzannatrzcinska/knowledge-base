// src/lib/database.types.ts
// Typy TypeScript dla bazy danych Supabase
// Wygenerowane ze schematu SQL

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
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url: string | null
          role: 'admin' | 'member'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          avatar_url?: string | null
          role?: 'admin' | 'member'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          avatar_url?: string | null
          role?: 'admin' | 'member'
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          color: string | null
          parent_id: string | null
          sort_order: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string | null
          color?: string | null
          parent_id?: string | null
          sort_order?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string | null
          color?: string | null
          parent_id?: string | null
          sort_order?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      topics: {
        Row: {
          id: string
          title: string
          description: string | null
          category_id: string | null
          created_by: string | null
          is_pinned: boolean
          is_archived: boolean
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category_id?: string | null
          created_by?: string | null
          is_pinned?: boolean
          is_archived?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          category_id?: string | null
          created_by?: string | null
          is_pinned?: boolean
          is_archived?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      notes: {
        Row: {
          id: string
          topic_id: string
          title: string | null
          content: string
          content_type: 'markdown' | 'html' | 'plain'
          sort_order: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          topic_id: string
          title?: string | null
          content: string
          content_type?: 'markdown' | 'html' | 'plain'
          sort_order?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          topic_id?: string
          title?: string | null
          content?: string
          content_type?: 'markdown' | 'html' | 'plain'
          sort_order?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          color?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          created_at?: string
        }
      }
      note_tags: {
        Row: {
          note_id: string
          tag_id: string
        }
        Insert: {
          note_id: string
          tag_id: string
        }
        Update: {
          note_id?: string
          tag_id?: string
        }
      }
      topic_tags: {
        Row: {
          topic_id: string
          tag_id: string
        }
        Insert: {
          topic_id: string
          tag_id: string
        }
        Update: {
          topic_id?: string
          tag_id?: string
        }
      }
      attachments: {
        Row: {
          id: string
          note_id: string | null
          file_name: string
          file_path: string
          file_size: number | null
          mime_type: string | null
          thumbnail_path: string | null
          uploaded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          note_id?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          mime_type?: string | null
          thumbnail_path?: string | null
          uploaded_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          note_id?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          mime_type?: string | null
          thumbnail_path?: string | null
          uploaded_by?: string | null
          created_at?: string
        }
      }
      note_links: {
        Row: {
          id: string
          source_note_id: string
          target_note_id: string
          link_type: 'reference' | 'related' | 'parent' | 'child'
          created_at: string
        }
        Insert: {
          id?: string
          source_note_id: string
          target_note_id: string
          link_type?: 'reference' | 'related' | 'parent' | 'child'
          created_at?: string
        }
        Update: {
          id?: string
          source_note_id?: string
          target_note_id?: string
          link_type?: 'reference' | 'related' | 'parent' | 'child'
          created_at?: string
        }
      }
      note_history: {
        Row: {
          id: string
          note_id: string
          title: string | null
          content: string
          changed_by: string | null
          change_type: 'create' | 'edit' | 'restore'
          created_at: string
        }
        Insert: {
          id?: string
          note_id: string
          title?: string | null
          content: string
          changed_by?: string | null
          change_type?: 'create' | 'edit' | 'restore'
          created_at?: string
        }
        Update: {
          id?: string
          note_id?: string
          title?: string | null
          content?: string
          changed_by?: string | null
          change_type?: 'create' | 'edit' | 'restore'
          created_at?: string
        }
      }
      favorites: {
        Row: {
          user_id: string
          topic_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          topic_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          topic_id?: string
          created_at?: string
        }
      }
      recent_views: {
        Row: {
          id: string
          user_id: string
          topic_id: string
          viewed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          topic_id: string
          viewed_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          topic_id?: string
          viewed_at?: string
        }
      }
    }
    Views: {
      topics_with_stats: {
        Row: {
          id: string
          title: string
          description: string | null
          category_id: string | null
          created_by: string | null
          is_pinned: boolean
          is_archived: boolean
          view_count: number
          created_at: string
          updated_at: string
          author_name: string
          author_avatar: string | null
          category_name: string | null
          category_color: string | null
          notes_count: number
          tags: Tag[]
        }
      }
    }
    Functions: {
      search_notes: {
        Args: {
          search_query: string
        }
        Returns: {
          note_id: string
          topic_id: string
          title: string | null
          content_preview: string
          rank: number
          category_name: string | null
          topic_title: string
        }[]
      }
      get_category_tree: {
        Args: Record<string, never>
        Returns: {
          id: string
          name: string
          description: string | null
          icon: string | null
          color: string | null
          parent_id: string | null
          level: number
          path: string
        }[]
      }
    }
  }
}

// Typy pomocnicze
export type User = Database['public']['Tables']['users']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Topic = Database['public']['Tables']['topics']['Row']
export type Note = Database['public']['Tables']['notes']['Row']
export type Tag = Database['public']['Tables']['tags']['Row']
export type Attachment = Database['public']['Tables']['attachments']['Row']
export type NoteLink = Database['public']['Tables']['note_links']['Row']
export type NoteHistory = Database['public']['Tables']['note_history']['Row']

export type TopicWithStats = Database['public']['Views']['topics_with_stats']['Row']
export type SearchResult = Database['public']['Functions']['search_notes']['Returns'][0]
export type CategoryTreeItem = Database['public']['Functions']['get_category_tree']['Returns'][0]

// Typy do tworzenia
export type NewTopic = Database['public']['Tables']['topics']['Insert']
export type NewNote = Database['public']['Tables']['notes']['Insert']
export type NewTag = Database['public']['Tables']['tags']['Insert']
export type NewCategory = Database['public']['Tables']['categories']['Insert']
export type NewAttachment = Database['public']['Tables']['attachments']['Insert']
