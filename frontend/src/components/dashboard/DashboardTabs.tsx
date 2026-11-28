'use client';

import React, { useRef } from 'react';
import { Activity, Calendar, Bot, TrendingDown, Users, School } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type DashboardTabId = 'dashboard' | 'planner' | 'chat' | 'impact' | 'community' | 'school';

export interface DashboardTabLabels {
  dashboard: string;
  planner: string;
  assistant: string;
  impact: string;
  community: string;
  school: string;
}

interface DashboardTabsProps {
  activeTab: DashboardTabId;
  onChange: (tab: DashboardTabId) => void;
  labels: DashboardTabLabels;
}

const TAB_CONFIG: Array<{ id: DashboardTabId; labelKey: keyof DashboardTabLabels; Icon: LucideIcon }> = [
  { id: 'dashboard', labelKey: 'dashboard', Icon: Activity },
  { id: 'planner', labelKey: 'planner', Icon: Calendar },
  { id: 'chat', labelKey: 'assistant', Icon: Bot },
  { id: 'impact', labelKey: 'impact', Icon: TrendingDown },
  { id: 'community', labelKey: 'community', Icon: Users },
  { id: 'school', labelKey: 'school', Icon: School },
];

export function DashboardTabs({ activeTab, onChange, labels }: DashboardTabsProps) {
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIdx: number | null = null;
    if (e.key === 'ArrowRight') nextIdx = (index + 1) % TAB_CONFIG.length;
    else if (e.key === 'ArrowLeft') nextIdx = (index - 1 + TAB_CONFIG.length) % TAB_CONFIG.length;
    else if (e.key === 'Home') nextIdx = 0;
    else if (e.key === 'End') nextIdx = TAB_CONFIG.length - 1;

    if (nextIdx !== null) {
      e.preventDefault();
      const targetTab = TAB_CONFIG[nextIdx];
      if (targetTab) {
        onChange(targetTab.id);
        buttonRefs.current[nextIdx]?.focus();
      }
    }
  };

  return (
    <nav role="tablist" aria-label="Main application tabs" className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 text-xs font-bold text-slate-600">
        {TAB_CONFIG.map(({ id, labelKey, Icon }, idx) => {
          const selected = activeTab === id;
          return (
            <button
              key={id}
              ref={(el) => {
                buttonRefs.current[idx] = el;
              }}
              type="button"
              role="tab"
              id={`tab-${id}`}
              aria-controls={`panel-${id}`}
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(id)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                selected ? 'bg-emerald-700 text-white shadow-xs' : 'hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              <span>{labels[labelKey]}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
