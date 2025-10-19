import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/profile')
  }

  return new Response(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Sign in to Mindlight</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: system-ui, sans-serif; margin: 0; padding: 0; background: white; }
          .container { max-width: 400px; margin: 0 auto; padding: 2rem; }
          .logo { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 2rem; }
          .logo img { height: 2rem; }
          .logo h1 { font-size: 1.5rem; font-weight: bold; color: #0f172a; }
          h2 { font-size: 1.25rem; font-weight: bold; color: #0f172a; margin-bottom: 0.5rem; }
          p { color: #64748b; margin-bottom: 1.5rem; }
          form { display: flex; flex-direction: column; gap: 1rem; }
          input { padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; }
          button { padding: 0.75rem; background: linear-gradient(to right, #06b6d4, #3b82f6); color: white; border: none; border-radius: 0.5rem; font-weight: 500; }
          .privacy { background: #f0f9ff; border: 1px solid #bae6fd; padding: 1rem; border-radius: 0.5rem; margin-top: 1rem; font-size: 0.875rem; color: #0369a1; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <img src="/hero-logo.svg" alt="Mindlight" />
            <h1>Mindlight</h1>
          </div>
          
          <h2>Sign in to sync your data</h2>
          <p>Get a magic link sent to your email to sign in securely</p>
          
          <form method="post">
            <input type="email" name="email" placeholder="Enter your email address" required />
            <button type="submit">Send Magic Link</button>
          </form>
          
          <div class="privacy">
            Your data is encrypted on your device before sync. We can't read your assessments or progress.
          </div>
        </div>
      </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' }
  })
}

export async function POST(request: Request) {
  const formData = await request.formData()
  const email = String(formData.get('email'))
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    return redirect('/auth/signin?error=Could not authenticate user')
  }

  return redirect('/auth/signin?message=Check your email for the magic link')
}
