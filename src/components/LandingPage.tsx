import React, { useState } from 'react';
import { ArrowRight, Leaf, Shield, Sparkles } from 'lucide-react';
import { LOGO_SVG_STRING } from '../App';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

interface LandingPageProps {
  onEnter: (uid: string) => void;
}

export function LandingPage({ onEnter }: LandingPageProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGoogleLogin = async (useRedirect: boolean = false) => {
    try {
      setLoading(true);
      setErrorMsg('');
      if (useRedirect) {
         const { signInWithRedirect } = await import('firebase/auth');
         await signInWithRedirect(auth, googleProvider);
      } else {
         const { signInWithPopup } = await import('firebase/auth');
         const result = await signInWithPopup(auth, googleProvider);
         onEnter(result.user.uid);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

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

        {errorMsg && <div className="text-red-400 mb-4 font-bold text-center">{errorMsg}</div>}

        <div className="flex flex-col gap-3 w-full">
          {/* PC Button */}
          <button
            onClick={() => handleGoogleLogin(false)}
            disabled={loading}
            className="relative overflow-hidden group w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-black text-lg py-5 px-8 rounded-2xl shadow-lg transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="relative flex items-center justify-center gap-3">
              <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="uppercase tracking-widest">{loading ? 'Loading...' : 'Google Login (PC)'}</span>
            </div>
          </button>

          {/* Mobile Button */}
          <button
            onClick={() => handleGoogleLogin(true)}
            disabled={loading}
            className="relative overflow-hidden group w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-black text-lg py-5 px-8 rounded-2xl shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            <div className="relative flex items-center justify-center gap-3">
              <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="uppercase tracking-widest">{loading ? 'Loading...' : 'Google Login (Mobile PWA)'}</span>
              <ArrowRight size={24} />
            </div>
          </button>
        </div>
      </div>
      
      {/* Footer Text */}
      <div className="absolute bottom-6 text-slate-600 text-xs font-bold tracking-widest uppercase">
        © {new Date().getFullYear()} JR Farm Cooperative
      </div>
    </div>
  );
}
