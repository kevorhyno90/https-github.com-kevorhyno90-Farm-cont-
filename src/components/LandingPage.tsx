import React, { useState } from 'react';
import { ArrowRight, Leaf, Shield, Sparkles } from 'lucide-react';
import { LOGO_SVG_STRING } from '../App';

interface LandingPageProps {
  onEnter: () => void;
}

export function LandingPage({ onEnter }: LandingPageProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900 overflow-hidden font-sans">
      {/* Animated Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-teal-900/40 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-emerald-900/30 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
        <div className="absolute top-[30%] left-[60%] w-[30%] h-[30%] bg-amber-900/20 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-lg w-full px-6 animate-slideIn">
        {/* Logo Container with Glassmorphism */}
        <div className="mb-10 relative group">
          <div className="absolute inset-0 bg-teal-500/20 rounded-full blur-xl group-hover:bg-teal-400/30 transition-all duration-700"></div>
          <div 
            className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full border border-teal-800/50 bg-slate-800/50 backdrop-blur-md shadow-2xl p-4 flex items-center justify-center transform transition-transform duration-700 hover:scale-105"
            dangerouslySetInnerHTML={{ __html: LOGO_SVG_STRING }}
          />
        </div>

        {/* Text Section */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-200 via-emerald-100 to-amber-100 tracking-tight drop-shadow-sm">
            JR Farm Estate
          </h1>
          <p className="text-slate-400 text-lg sm:text-xl font-medium tracking-wide">
            Omni-Estate Management System
          </p>
        </div>

        {/* Feature Badges */}
        <div className="flex justify-center gap-4 mb-12 w-full">
          <div className="flex flex-col items-center gap-2 text-slate-500">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center backdrop-blur-sm">
              <Leaf size={24} className="text-emerald-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider">Sustainable</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-slate-500">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center backdrop-blur-sm">
              <Sparkles size={24} className="text-amber-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider">Premium</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-slate-500">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center backdrop-blur-sm">
              <Shield size={24} className="text-teal-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider">Secure</span>
          </div>
        </div>

        {/* Enter Button */}
        <button
          onClick={onEnter}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative overflow-hidden group w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-black text-lg py-5 px-8 rounded-2xl shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
          <div className="relative flex items-center justify-center gap-3">
            <span className="uppercase tracking-widest">Enter Dashboard</span>
            <ArrowRight 
              size={24} 
              className={`transition-transform duration-300 ${isHovered ? 'translate-x-2' : ''}`} 
            />
          </div>
        </button>
      </div>
      
      {/* Footer Text */}
      <div className="absolute bottom-6 text-slate-600 text-xs font-bold tracking-widest uppercase">
        © {new Date().getFullYear()} JR Farm Cooperative
      </div>
    </div>
  );
}
