// src/lib/supabase.ts
// Konfiguracja klienta Supabase

import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Helper do pobierania aktualnego użytkownika
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Helper do sprawdzania sesji
export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}
