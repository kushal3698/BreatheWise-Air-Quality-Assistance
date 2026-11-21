'use client';

import React from 'react';

interface FooterProps {
  disclaimer: string;
}

export function Footer({ disclaimer }: FooterProps) {
  return (
    <footer className="mt-auto bg-white border-t border-slate-200 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800">BreatheWise</span>
          <span>• Urban Air Quality Companion</span>
        </div>
        <div className="text-[11px] text-slate-500 text-center sm:text-right max-w-full break-words">
          {disclaimer}
        </div>
      </div>
    </footer>
  );
}
