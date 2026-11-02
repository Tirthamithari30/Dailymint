import React, { useState, useRef, useEffect } from 'react';
import { api } from '../../services/api';
import { AIInsight } from '../../types';
import { Sparkles, Send, Bot, User as UserIcon, Lightbulb, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

interface AIChatDrawerProps {
  currency?: string;
  insights?: AIInsight[];
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
}

const SUGGESTED_PROMPTS = [
  'How much did I spend today?',
  'Where is most of my money going?',
  'How much can I spend tomorrow?',
  'Can I afford a ₹1,500 dinner tonight?',
  'How can I reduce my expenses?',
  'How much did I save this month?',
];

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({ currency = '₹', insights = [] }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-welcome',
      sender: 'ai',
      text: `Hello! I'm your **DailyMint AI Advisor**. I track your live spending limit and every recorded transaction in real-time.\n\nAsk me anything about today's spending, category breakdowns, or whether you can safely afford a purchase!`,
      time: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.sendAIChat(textToSend);
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: res.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: 'Apologies, I encountered an issue analyzing your financial logs. Please try again in a moment.',
          time: 'Just now',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Proactive Insights Cards */}
      {insights.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-primary animate-pulse" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Smart Financial Telemetry
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {insights.map((ins) => {
              const isWarning = ins.type === 'warning';
              const isSuccess = ins.type === 'success';
              return (
                <div
                  key={ins.id}
                  className={`p-4 rounded-2xl border text-xs ${
                    isWarning
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                      : isSuccess
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                      : 'bg-surface/80 border-surface-border text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold mb-1">
                    {isWarning ? (
                      <AlertTriangle size={15} className="text-amber-400 shrink-0" />
                    ) : isSuccess ? (
                      <CheckCircle size={15} className="text-emerald-400 shrink-0" />
                    ) : (
                      <Lightbulb size={15} className="text-primary shrink-0" />
                    )}
                    <span>{ins.title}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{ins.message}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Chat Container */}
      <div className="rounded-3xl glass-card border border-surface-border overflow-hidden flex flex-col h-[520px] shadow-card-glow">
        {/* Header */}
        <div className="px-5 py-4 border-b border-surface-border bg-surface/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center border border-primary/30">
              <Bot size={18} />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                DailyMint AI Copilot
                <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
              </div>
              <div className="text-[11px] text-slate-400">Context-aware spending intelligence</div>
            </div>
          </div>
        </div>

        {/* Message Log */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 max-w-[85%] ${
                m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-7 h-7 rounded-xl shrink-0 flex items-center justify-center text-xs ${
                  m.sender === 'user'
                    ? 'bg-primary text-black font-bold'
                    : 'bg-surface-elevated text-primary border border-primary/30'
                }`}
              >
                {m.sender === 'user' ? <UserIcon size={14} /> : <Bot size={14} />}
              </div>

              <div
                className={`p-4 rounded-2xl text-xs md:text-sm leading-relaxed whitespace-pre-wrap ${
                  m.sender === 'user'
                    ? 'bg-primary text-black font-medium rounded-tr-none shadow-neon-sm'
                    : 'bg-surface/90 text-slate-200 border border-surface-border rounded-tl-none'
                }`}
              >
                {m.text}
                <div
                  className={`text-[10px] mt-2 font-mono ${
                    m.sender === 'user' ? 'text-black/60 text-right' : 'text-slate-400'
                  }`}
                >
                  {m.time}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 max-w-[80%] items-center">
              <div className="w-7 h-7 rounded-xl bg-surface-elevated text-primary border border-primary/30 flex items-center justify-center">
                <Bot size={14} />
              </div>
              <div className="p-3.5 rounded-2xl bg-surface border border-surface-border flex items-center gap-1.5 text-xs text-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                <span className="text-slate-400 ml-1 font-mono text-[11px]">Synthesizing ledger data...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompt Chips */}
        <div className="px-4 py-2 border-t border-surface-border/50 bg-surface/40 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSend(prompt)}
              className="px-3 py-1.5 text-xs font-medium rounded-xl bg-surface-card border border-surface-border text-slate-300 hover:text-primary hover:border-primary/40 whitespace-nowrap transition-all shrink-0 active:scale-95"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3.5 border-t border-surface-border bg-surface flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI anything about your money, limit, or expenses..."
            className="flex-1 px-4 py-2.5 bg-surface-elevated text-xs md:text-sm text-white rounded-xl border border-surface-border focus:border-primary focus:outline-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-xl bg-primary text-black font-bold hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-neon-sm shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
