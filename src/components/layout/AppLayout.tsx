import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { FloatingAddButton } from '../trades/FloatingAddButton';

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <div className="p-8">
          {children}
        </div>
      </main>
      <FloatingAddButton />
    </div>
  );
};
