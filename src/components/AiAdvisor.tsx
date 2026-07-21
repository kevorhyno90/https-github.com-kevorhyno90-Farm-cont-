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

 const forcedOffline = localStorage.getItem('jr_farm_forced_offline') === 'true';
 const deviceOffline = typeof navigator !== 'undefined' && !navigator.onLine;
 if (forcedOffline || deviceOffline) {
 const localResponse = generateFreeAgroAdvisorResponse(query, farmState, settings);
 const offlineSuffix = forcedOffline
 ? "\n\n[Offline simulation enabled: running local advisory engine.]"
 : "\n\n[Device is offline: running local advisory engine.]";
 setMessages(prev => [...prev, { role: 'model', text: `${localResponse}${offlineSuffix}` }]);
 setIsLoading(false);
 return;
 }

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
 className="flex items-center gap-2.5 bg-green-700 border border-green-800 text-white hover:bg-green-800 px-4.5 py-3.5 rounded-full shadow-lg hover:scale-105 transition-all text-xs font-semibold tracking-tight relative group outline-none cursor-pointer"
 >
 {/* Subtle heartbeat badge */}
 <span className="absolute -top-1.5 -right-1 flex h-3 w-3">
 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
 <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
 </span>
 <Bot size={16} className="animate-pulse" />
 <span>Sovereign AI Advisor</span>
 </button>
 )}

 {/* Expanded Chat Pane */}
 {isOpen && (
 <div className="bg-white border border-gray-200 rounded-3xl shadow-2xl w-80 sm:w-96 h-[480px] flex flex-col overflow-hidden animate-fadeIn">
 {/* Panel Header */}
 <div className="bg-gradient-to-r from-emerald-950 to-emerald-900 p-4 border-b border-gray-200 flex justify-between items-center text-left">
 <div className="flex items-center gap-2">
 <div className="p-1.5 bg-emerald-500/10 text-green-600 rounded-lg border border-emerald-500/20">
 <Sparkles size={16} />
 </div>
 <div>
 <h4 className="text-xs font-semibold text-gray-900  tracking-wide">Sovereign Expert Copilot</h4>
 <p className="text-[9px] text-green-600 font-bold tracking-tight mt-0.5">{managerName}'s Expert Suite</p>
 </div>
 </div>
 <button
 onClick={() => setIsOpen(false)}
 type="button"
 className="p-1.5 text-gray-900 font-medium hover:text-gray-900 rounded-lg hover:bg-gray-50 /10 transition-all cursor-pointer"
 >
 <X size={16} />
 </button>
 </div>

 {/* Messages container list */}
 <div 
 ref={scrollRef}
 className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-white shadow-sm scrollbar-thin scrollbar-thumb-slate-800"
 >
 {messages.map((m, idx) => {
 const isModel = m.role === 'model';
 return (
 <div 
 key={idx} 
 className={`flex items-start gap-2.5 ${isModel ? 'justify-start' : 'justify-end'} text-left animate-slideUp`}
 >
 {isModel && (
 <div className="p-1 bg-white text-green-600 border border-emerald-900 rounded-md shrink-0 mt-0.5">
 <Bot size={11} />
 </div>
 )}
 <div className={`p-3 rounded-2xl max-w-[85%] text-[11px] leading-relaxed shadow-sm font-medium ${
 isModel 
 ? 'bg-white shadow-sm text-gray-900 font-bold border border-gray-200 rounded-tl-xs' 
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
 return <strong key={pIdx} className="font-semibold text-green-600">{part}</strong>;
 }
 return part;
 });

 if (isBullet) {
 return (
 <div key={lIdx} className="flex items-start gap-1.5 ml-1.5 mt-1 text-[11px]">
 <span className="text-green-600 select-none shrink-0">•</span>
 <span className="text-gray-900 font-bold leading-normal">{renderedLine}</span>
 </div>
 );
 }

 // Heading style detection
 const isHeading = trimmed.startsWith('### ') || (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length < 100);
 
 return (
 <p key={lIdx} className={`${lIdx > 0 ? 'mt-1' : ''} ${isHeading ? 'text-[11.5px] font-semibold text-green-600  tracking-wide mt-3 pb-0.5 border-b border-emerald-950/40' : 'text-gray-900 font-bold'}`}>
 {renderedLine}
 </p>
 );
 })}
 </div>
 </div>
 );
 })}

 {isLoading && (
 <div className="flex items-center gap-2 text-[10px] text-gray-900 font-medium font-mono pl-6 py-2">
 <RefreshCw size={10} className="animate-spin text-green-600" />
 <span>AI is scanning multi-spectral indices...</span>
 </div>
 )}
 </div>

 {/* Rapid Suggestions chips bar */}
 <div className="px-4 py-2 bg-white shadow-sm border-t border-gray-200 flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none scroll-smooth">
 {suggestions.map((s, idx) => (
 <button
 key={idx}
 onClick={() => handleSendMessage(s)}
 type="button"
 className="bg-white border border-gray-200 hover:bg-white/80 text-gray-900 font-medium hover:text-gray-900 border border-gray-200 px-2.5 py-1 rounded-full text-[9px] font-bold  transition-all duration-150 cursor-pointer text-left shrink-0"
 >
 {s}
 </button>
 ))}
 </div>

 {/* Form input controls footer */}
 <form 
 onSubmit={(e) => { e.preventDefault(); handleSendMessage(userInput); }}
 className="p-3 bg-white border-t border-gray-200 flex items-center gap-2.5"
 >
 <input
 type="text"
 value={userInput}
 onChange={(e) => setUserInput(e.target.value)}
 placeholder="Ask about crops, feed protein, Gumboro..."
 className="flex-1 bg-white shadow-sm text-gray-900 font-bold placeholder:text-gray-900 font-medium text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-hidden font-medium transition-all"
 />
 <button
 type="submit"
 disabled={!userInput.trim() || isLoading}
 className={`p-2.5 rounded-xl transition-all ${
 userInput.trim() && !isLoading 
 ? 'bg-emerald-500 text-gray-500 hover:bg-emerald-400 cursor-pointer' 
 : 'bg-white border border-gray-200 text-white font-medium cursor-not-allowed'
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
