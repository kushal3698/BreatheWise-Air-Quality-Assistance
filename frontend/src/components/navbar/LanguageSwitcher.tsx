'use client';

import React from 'react';
import { Globe } from 'lucide-react';
import { SupportedLanguage } from '@/lib/i18n';

interface LanguageSwitcherProps {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
}

const LANGUAGES: Array<{ code: SupportedLanguage; label: string }> = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
  { code: 'te', label: 'తెలుగు (Telugu)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
];

export function LanguageSwitcher({ language, setLanguage }: LanguageSwitcherProps) {
  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-slate-400 hidden sm:block" aria-hidden="true" />
      <select
        value={language}
        aria-label="Select application language"
        onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
        className="text-xs font-semibold px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
      >
        {LANGUAGES.map((item) => (
          <option key={item.code} value={item.code}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}
