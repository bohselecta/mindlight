'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
import { Mail, Loader2 } from 'lucide-react';

interface SignInButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function SignInButton({ 
  className = '', 
  variant = 'outline',
  size = 'md' 
}: SignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const supabase = createClient();
      
      if (!supabase) {
        setMessage('Sync not available - please check configuration');
        return;
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setMessage('Error: ' + error.message);
      } else {
        setMessage('Check your email for the magic link!');
      }
    } catch (error) {
      setMessage('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const buttonClasses = {
    default: 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white',
    outline: 'border border-slate-300 text-slate-700 hover:bg-slate-50',
    ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <div className="relative">
      <form onSubmit={handleSignIn} className="flex items-center gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className={`${sizeClasses[size]} border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !email}
          className={`
            ${buttonClasses[variant]}
            ${sizeClasses[size]}
            rounded-lg font-medium transition-all
            disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center gap-2
            ${className}
          `}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Mail className="w-4 h-4" />
          )}
          Sign in to sync
        </button>
      </form>
      
      {message && (
        <div className={`mt-2 text-sm ${
          message.includes('Error') ? 'text-red-600' : 'text-green-600'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}
