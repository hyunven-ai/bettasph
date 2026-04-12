import { createClient } from '@supabase/supabase-js';

// Server-side only client — jangan pernah import di 'use client' component!
// Menggunakan service_role key untuk bypass RLS Supabase.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
