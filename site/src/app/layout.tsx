import { AuthProvider } from '@/contexts/AuthContext';
import Header from '@/components/header';
import { Inter } from 'next/font/google';

import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning className={inter.variable}>
      <body suppressHydrationWarning>
        <AuthProvider>
            <Header />
            {children}
        </AuthProvider>
      </body>
    </html>
  );
}
