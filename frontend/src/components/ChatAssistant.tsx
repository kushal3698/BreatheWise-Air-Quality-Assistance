'use client';

import React, { useState } from 'react';
import { Send, Bot, User, Sparkles, BookOpen, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { sendChatMessage, ChatMessage, HouseholdProfile } from '@/lib/api';
import { generateLocalChatReply } from '@/lib/chatEngine';

interface ChatAssistantProps {
  city: string;
  language: string;
  household?: HouseholdProfile;
}

const DEFAULT_SUGGESTIONS = [
  "Should my 8-year-old play outside at 4 PM?",
  "Plan my commute tomorrow to minimise pollution",
  "Is it worth buying a purifier or building a DIY one?",
  "Give me a 3-day low-emission plan for my family",
];

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ city, language, household }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Hello! I am BreatheWise, your urban air quality and low-emission planner for **${city}**.\n\nAsk me about safe outdoor timing for your children or parents, commute hacks to avoid smog, or how to set up clean indoor air.`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [citations, setCitations] = useState<string[]>(['kb/indoor_air_quality.md']);
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_SUGGESTIONS);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const resp = await sendChatMessage(text, city, language, household, messages);
      const assistantMsg: ChatMessage = { role: 'assistant', content: resp.reply };
      setMessages(prev => [...prev, assistantMsg]);
      if (resp.grounded_sources && resp.grounded_sources.length > 0) {
        setCitations(resp.grounded_sources);
      }
      if (resp.suggested_questions && resp.suggested_questions.length > 0) {
        setSuggestions(resp.suggested_questions);
      }
    } catch (err) {
      console.warn('Backend unavailable, using grounded local chat engine:', err);
      const localResp = generateLocalChatReply(text, city, language, household);
      const assistantMsg: ChatMessage = { role: 'assistant', content: localResp.reply };
      setMessages(prev => [...prev, assistantMsg]);
      if (localResp.grounded_sources && localResp.grounded_sources.length > 0) {
        setCitations(localResp.grounded_sources);
      }
      if (localResp.suggested_questions && localResp.suggested_questions.length > 0) {
        setSuggestions(localResp.suggested_questions);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[650px] overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm flex items-center gap-2">
              BreatheWise GenAI Advisor
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                RAG Grounded
              </span>
            </h3>
            <p className="text-xs text-slate-400">Live data + Household context: {city}</p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex gap-3 max-w-[85%] ${
              m.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                m.role === 'user'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-emerald-600" />}
            </div>

            <div
              className={`rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'bg-emerald-600 text-white rounded-tr-none'
                  : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-none whitespace-pre-wrap'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 max-w-[85%] mr-auto">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs shrink-0">
              <Bot className="w-4 h-4 text-emerald-600 animate-spin" />
            </div>
            <div className="bg-slate-50 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-slate-500 border border-slate-200/80 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>Analyzing live air quality & retrieving health guidance...</span>
            </div>
          </div>
        )}
      </div>

      {/* Citations bar */}
      {citations && citations.length > 0 && (
        <div className="px-4 py-2 bg-slate-50/70 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500 overflow-x-auto">
          <BookOpen className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="font-semibold text-slate-700">Grounded in:</span>
          {citations.map((c, i) => (
            <span key={i} className="bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-600 text-[10px]">
              {c.replace('kb/', '').replace('.md', '')}
            </span>
          ))}
        </div>
      )}

      {/* Suggested Questions */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 shrink-0">
          Try:
        </span>
        {suggestions.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSend(q)}
            className="text-[11px] bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-700 px-2.5 py-1 rounded-full shrink-0 transition-all cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask about routines, safe windows or purifier hacks in ${city}...`}
          className="flex-1 text-xs px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl transition-all cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
