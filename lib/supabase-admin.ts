import { createClient } from '@supabase/supabase-js'

// Admin client that bypasses RLS for admin operations
// Uses service role key which has full access to the database

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL

// Prefer SUPABASE_SERVICE_KEY (actual service_role) but fall back to legacy env names
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  ''

if (!supabaseUrl) {
  throw new Error('Missing Supabase URL')
}

if (!supabaseServiceKey || supabaseServiceKey.length < 200) {
  throw new Error(
    'Missing Supabase Service Role Key. Set SUPABASE_SERVICE_KEY to the service_role key in your .env.local file'
  )
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  }
})

// Note: For production use, you should either:
// 1. Implement proper Supabase authentication for admins
// 2. Use a service role key with server-side only API routes
// 3. Set up proper RLS policies with role-based access
