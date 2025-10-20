/**
 * Conditional Supabase server client creation
 * Only creates client when environment variables are available
 */

interface CookieToSet {
  name: string;
  value: string;
  options?: any;
}

let supabaseServerClient: any = null;

export async function createClient() {
  // Return cached client if already created
  if (supabaseServerClient !== null) {
    return supabaseServerClient;
  }

  // Return null if Supabase is not configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    supabaseServerClient = null;
    return null;
  }

  // Dynamically import Supabase only when needed
  try {
    const { createServerClient } = require('@supabase/ssr');
    const { cookies } = require('next/headers');
    
    const cookieStore = await cookies();

    supabaseServerClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: CookieToSet[]) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );
    return supabaseServerClient;
  } catch (error) {
    console.warn('Failed to create Supabase server client:', error);
    supabaseServerClient = null;
    return null;
  }
}
