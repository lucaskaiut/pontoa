'use client';

import { BottomNav } from '@/components/navigation/BottomNav';

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <>
      <main className="min-h-screen pb-18 md:pb-0 md:pt-[72px]">{children}</main>
      <BottomNav />
    </>
  );
}
