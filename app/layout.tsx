import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Trekr — Job Application Tracker',
  description: 'Track every application, interview, and offer. Stay organised, stay ahead.',
  openGraph: {
    title: 'Trekr',
    description: 'Track every application, interview, and offer.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={inter.variable}>
        <body className="bg-stone-50 text-stone-900 antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
