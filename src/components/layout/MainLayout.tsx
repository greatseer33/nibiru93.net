import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { StarField } from '@/components/StarField';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <StarField />
      <div className="relative z-10">
        <Navbar />
        <main className="pt-16">
          {children}
        </main>
      </div>
    </div>
  );
}
