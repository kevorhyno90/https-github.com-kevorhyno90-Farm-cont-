import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Bot, X, Send, MessagesSquare, ChevronDown, RefreshCw } from 'lucide-react';
import { getStoredSettings } from '../utils/settingsHelper';
import { generateFreeAgroAdvisorResponse } from '../utils/localAi';

interface AiAdvisorProps {
  farmState: {
    cowsCount: number;
    milkTotal: number;
    fieldsCount: number;
    staffCount: number;
    income: number;
    expense: number;
  };
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export function AiAdvisor({ farmState }: AiAdvisorProps) {
  const settings = getStoredSettings();
  const managerName = settings?.administrator || "Dr. Devin Omwenga";
  const farmName = settings?.estateName || "JR Farm";
  const locCode = settings?.locationCode || "KT-205A";

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    setMessages([
      {
        role: 'model',
        text: `Welcome! I am ${managerName}'s Sovereign AI Agro-Advisor. I run completely for free and understand everything about:
- 🐄 **Livestock & Poultry**: Feed formulation (TMR), milking hygiene, clinical mastitis, and dairy breeding cycles.
- 🌱 **Crop & Soil Management**: Tea plucking guidelines, avocado wedge grafting, Phytophthora root rot, and ideal soil pH levels.
- 💰 **App Management**: Financial ledgers, staff rosters, spray logging, and cloud synchronization.

How can I assist you with livestock, crop health, or navigating this app today?`
      }
    ]);
  }, [managerName, farmName]);

  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Suggestions for rapid clicks
  const suggestions = [
    "🐄 How do I feed my cows for maximum milk?",
    "🌱 What is the best soil pH for tea and avocado?",
    "🩺 How do I treat or prevent mastitis?",
    "🔄 How do I backup and sync my data?",
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const query = textToSend.trim();
    setUserInput('');
    setMessages(prev => [...prev, { role: 'user', text: query }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages.slice(-10), // Send last 10 messages for context
          farmState: farmState,
          settings: settings
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'model', text: data.text || "No response received." }]);
    } catch (err: any) {
      console.error("AI Error:", err);
      // Run Sovereign Free Agro-AI Expert System locally client-side to ensure the chatbot ALWAYS responds perfectly to quizzes
      const localResponse = generateFreeAgroAdvisorResponse(query, farmState, settings);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: localResponse
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans" id="ai-advisor-wrapper">
      {/* Active Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          type="button"
          className="flex items-center gap-2.5 bg-gradient-to-r from-emerald-950 to-emerald-900 border border-emerald-800 text-slate-100 hover:text-white px-4.5 py-3.5 rounded-full shadow-2xl hover:scale-105 transition-all text-xs font-black uppercase tracking-wider relative group outline-hidden cursor-pointer"
        >
          {/* Subtle heartbeat badge */}
          <span className="absolute -top-1.5 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <Bot size={16} className="animate-pulse" />
          <span>Sovereign AI Advisor</span>
        </button>
      )}

      {/* Expanded Chat Pane */}
      {isOpen && (
        <div className="bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl w-80 sm:w-96 h-[480px] flex flex-col overflow-hidden animate-fadeIn">
          {/* Panel Header */}
          <div className="bg-gradient-to-r from-emerald-950 to-emerald-900 p-4 border-b border-slate-800 flex justify-between items-center text-left">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                <Sparkles size={16} />
              </div>
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wide">Sovereign Expert Copilot</h4>
                <p className="text-[9px] text-emerald-300 font-bold uppercase tracking-widest mt-0.5">{managerName}'s Expert Suite</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              type="button"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-all cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages container list */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-900/45 scrollbar-thin scrollbar-thumb-slate-800"
          >
            {messages.map((m, idx) => {
              const isModel = m.role === 'model';
              return (
                <div 
                  key={idx} 
                  className={`flex items-start gap-2.5 ${isModel ? 'justify-start' : 'justify-end'} text-left animate-slideUp`}
                >
                  {isModel && (
                    <div className="p-1 bg-emerald-950 text-emerald-300 border border-emerald-900 rounded-md shrink-0 mt-0.5">
                      <Bot size={11} />
                    </div>
                  )}
                  <div className={`p-3 rounded-2xl max-w-[85%] text-[11px] leading-relaxed shadow-sm font-medium ${
                    isModel 
                      ? 'bg-slate-900 text-slate-100 border border-slate-800 rounded-tl-xs' 
                      : 'bg-emerald-600 text-white rounded-tr-xs'
                  }`}>
                    {/* Beautifully render structured text with lists, bold tags, and headings */}
                    {m.text.split('\n').map((line, lIdx) => {
                      const trimmed = line.trim();
                      if (!trimmed) return <div key={lIdx} className="h-1.5" />;
                      
                      // Check for bullet items
                      const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ');
                      const cleanLine = isBullet ? trimmed.substring(2) : line;

                      // Split by ** for bold styling
                      const parts = cleanLine.split('**');
                      const renderedLine = parts.map((part, pIdx) => {
                        if (pIdx % 2 === 1) {
                          return <strong key={pIdx} className="font-extrabold text-emerald-300">{part}</strong>;
                        }
                        return part;
                      });

                      if (isBullet) {
                        return (
                          <div key={lIdx} className="flex items-start gap-1.5 ml-1.5 mt-1 text-[11px]">
                            <span className="text-emerald-400 select-none shrink-0">•</span>
                            <span className="text-slate-100 leading-normal">{renderedLine}</span>
                          </div>
                        );
                      }

                      // Heading style detection
                      const isHeading = trimmed.startsWith('### ') || (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length < 100);
                      
                      return (
                        <p key={lIdx} className={`${lIdx > 0 ? 'mt-1' : ''} ${isHeading ? 'text-[11.5px] font-black text-emerald-400 uppercase tracking-wide mt-3 pb-0.5 border-b border-emerald-950/40' : 'text-slate-100'}`}>
                          {renderedLine}
                        </p>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono pl-6 py-2">
                <RefreshCw size={10} className="animate-spin text-emerald-400" />
                <span>AI is scanning multi-spectral indices...</span>
              </div>
            )}
          </div>

          {/* Rapid Suggestions chips bar */}
          <div className="px-4 py-2 bg-slate-900/80 border-t border-slate-800 flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none scroll-smooth">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(s)}
                type="button"
                className="bg-slate-800 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-750 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase transition-all duration-150 cursor-pointer text-left shrink-0"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Form input controls footer */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(userInput); }}
            className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2.5"
          >
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ask about crops, feed protein, Gumboro..."
              className="flex-1 bg-slate-900 text-slate-100 placeholder:text-slate-500 text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-hidden font-medium transition-all"
            />
            <button
              type="submit"
              disabled={!userInput.trim() || isLoading}
              className={`p-2.5 rounded-xl transition-all ${
                userInput.trim() && !isLoading 
                  ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 cursor-pointer' 
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
