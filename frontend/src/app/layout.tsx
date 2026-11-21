import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BreatheWise | GenAI Urban Air Quality Companion',
  description: 'Turn live air-quality data into personal, low-emission daily routines and indoor hacks that protect your family.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
