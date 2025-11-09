import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          style: string
          price: number
          image: string
          description: string
          material: string
          color: string
          category: string
          color_options: Array<{ name: string; hex: string }>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          style: string
          price: number
          image: string
          description: string
          material: string
          color: string
          category?: string
          color_options?: Array<{ name: string; hex: string }>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          style?: string
          price?: number
          image?: string
          description?: string
          material?: string
          color?: string
          category?: string
          color_options?: Array<{ name: string; hex: string }>
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

