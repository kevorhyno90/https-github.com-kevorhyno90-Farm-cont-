import React, { useEffect, useState } from 'react';
import { Smartphone } from 'lucide-react';

export function PortraitEnforcer() {
  const [isLandscapeMobile, setIsLandscapeMobile] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      // Check if the device is in landscape mode AND is likely a mobile device (by checking height or touch)
      const isLandscape = window.matchMedia('(orientation: landscape)').matches;
      // Typical mobile phones in landscape have a very small height (usually under 500px)
      // Tablets can be higher, but we want to enforce portrait on mobile specifically if needed.
      // Let's use max-height 600px as a heuristic for a rotated mobile phone.
      const isMobileHeight = window.innerHeight < 600;
      // Also check if it's a touch device to avoid blocking small desktop windows
      const isTouch = window.matchMedia('(pointer: coarse)').matches;

      if (isLandscape && isMobileHeight && isTouch) {
        setIsLandscapeMobile(true);
      } else {
        setIsLandscapeMobile(false);
      }
    };

    // Initial check
    checkOrientation();

    // Listen for resize and orientation changes
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (!isLandscapeMobile) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900 flex flex-col items-center justify-center p-6 text-center animate-fadeIn backdrop-blur-md">
      <div className="bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-700 flex flex-col items-center max-w-sm">
        <div className="w-24 h-24 bg-slate-700 rounded-full flex items-center justify-center mb-6 shadow-inner shadow-slate-900">
          <Smartphone size={48} className="text-teal-400 rotate-90 animate-pulse transform transition-transform duration-1000" />
        </div>
        <h2 className="text-2xl font-black text-white mb-3 uppercase tracking-wide">Rotate Device</h2>
        <p className="text-slate-300 font-medium mb-6">
          JR Farm Omni-Estate is designed for <strong className="text-teal-400">Portrait Mode</strong>. Please rotate your device back to upright to continue.
        </p>
      </div>
    </div>
  );
}
