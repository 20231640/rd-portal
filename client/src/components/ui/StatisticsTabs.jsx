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
    <div className="flex space-x-1 bg-muted p-1 rounded-lg overflow-x-auto scrollbar-hide -mx-2 sm:mx-0 px-2 sm:px-0">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center gap-2 sm:gap-3 px-4 py-3 sm:px-5 sm:py-3 rounded-md transition-colors whitespace-nowrap min-w-max flex-shrink-0 text-base sm:text-lg font-medium ${
            activeTab === tab.id 
              ? 'bg-background shadow-lg border-2 border-primary' 
              : 'hover:bg-background/60 text-muted-foreground hover:text-foreground'
          }`}
        >
          <span className="text-xl sm:text-2xl">{tab.icon}</span>
          <span className="hidden xs:inline">{tab.label}</span>
          {/* Versão compacta para mobile muito pequeno - TAMBÉM MAIOR */}
          <span className="xs:hidden text-sm font-medium">
            {tab.id === 'overview' ? 'Geral' :
             tab.id === 'geography' ? 'Geo' :
             tab.id === 'kits' ? 'Kits' :
             tab.id === 'schools' ? 'Escolas' :
             'Probs'}
          </span>
        </button>
      ))}
    </div>
  );
}