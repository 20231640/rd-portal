import { useState } from "react";

const tabs = [
  { id: 'overview', label: 'Visão Geral', icon: '📊' },
  { id: 'geography', label: 'Geografia', icon: '🗺️' },
  { id: 'kits', label: 'Kits', icon: '📦' },
  { id: 'schools', label: 'Escolas', icon: '🏫' },
  { id: 'problems', label: 'Problemas', icon: '🚨' }
];

export function StatisticsTabs({ activeTab, onTabChange }) {
  return (
    <div className="flex space-x-1 bg-muted p-1 rounded-lg overflow-x-auto">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors whitespace-nowrap min-w-max ${
            activeTab === tab.id 
              ? 'bg-background shadow-sm font-medium' 
              : 'hover:bg-background/50 text-muted-foreground'
          }`}
        >
          <span className="text-lg">{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}