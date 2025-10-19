import type { Metadata } from 'next';
import './globals.css';
import { PWAProvider } from '@/components/pwa/PWAProvider';
import { OnboardingWrapper } from '@/components/onboarding/OnboardingWrapper';
import { AuthProvider } from '@/components/auth/AuthProvider';

export const metadata: Metadata = {
  title: 'Mindlight - Epistemic Autonomy Training',
  description: 'A self-guided reflection suite that helps you notice when your thinking patterns might be outsourced to groups, authorities, or echo chambers.',
  keywords: ['epistemic autonomy', 'critical thinking', 'bias detection', 'metacognition', 'self-reflection'],
  authors: [{ name: 'Mindlight Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'noindex, nofollow', // Privacy-first approach
  manifest: '/manifest.json',
  themeColor: '#3b82f6',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Mindlight'
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <AuthProvider>
          <PWAProvider>
            <OnboardingWrapper>
              {children}
            </OnboardingWrapper>
          </PWAProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
