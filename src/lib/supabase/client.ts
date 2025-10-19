/**
 * Conditional Supabase client creation
 * Only creates client when environment variables are available
 */

let supabaseClient: any = null;

export function createClient() {
  // Return cached client if already created
  if (supabaseClient !== null) {
    return supabaseClient;
  }

  // Return null if Supabase is not configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    supabaseClient = null;
    return null;
  }

  // Dynamically import Supabase only when needed
  try {
    const { createBrowserClient } = require('@supabase/ssr');
    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    return supabaseClient;
  } catch (error) {
    console.warn('Failed to create Supabase client:', error);
    supabaseClient = null;
    return null;
  }
}
