import { ReactNode } from 'react';
import { SettingsSidebar, SettingsTab } from './SettingsSidebar';

interface SettingsLayoutProps {
  children: ReactNode;
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}

export const SettingsLayout = ({ children, activeTab, onTabChange }: SettingsLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <SettingsSidebar activeTab={activeTab} onTabChange={onTabChange} />
      <main className="ml-52 min-h-screen flex flex-col">
        <div className="p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
};
