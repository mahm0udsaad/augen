import { createClient } from '@supabase/supabase-js'

// Admin client that bypasses RLS for admin operations
// Uses service role key which has full access to the database

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl) {
  throw new Error('Missing Supabase URL')
}

if (!supabaseServiceKey) {
  throw new Error('Missing Supabase Service Role Key. Please set SUPABASE_SERVICE_ROLE_KEY in your .env.local file')
}

// Verify it's actually a service role key (should start with 'eyJ' and be longer than anon key)
if (supabaseServiceKey.length < 200) {
  console.warn('Warning: Service role key seems too short. Make sure you are using the service_role key, not the anon key.')
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

