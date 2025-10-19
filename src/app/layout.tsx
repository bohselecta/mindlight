import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Reflector - Epistemic Autonomy Training',
  description: 'A self-guided reflection suite that helps you notice when your thinking patterns might be outsourced to groups, authorities, or echo chambers.',
  keywords: ['epistemic autonomy', 'critical thinking', 'bias detection', 'metacognition', 'self-reflection'],
  authors: [{ name: 'Reflector Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'noindex, nofollow', // Privacy-first approach
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
