import React from 'react';

// Lazy Loaded Tabs are imported at the top of App.tsx, so we just accept them as props or children.
// To avoid massive prop drilling typescript errors, we use any for the props in this wrapper component.
// In a full architecture refactor, this would consume FarmContext directly.

export const TabManager: React.FC<{
  activeTab: string;
  tabs: Record<string, React.ReactNode>;
}> = ({ activeTab, tabs }) => {
  return (
    <>
      {tabs[activeTab] || null}
    </>
  );
};
