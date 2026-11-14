import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { CONFIRM_EVENT, ConfirmRequest } from '../../utils/appConfirm';

export const ConfirmDialog: React.FC = () => {
  const [queue, setQueue] = useState<ConfirmRequest[]>([]);

  useEffect(() => {
    const onConfirm = (e: Event) => {
      const detail = (e as CustomEvent<ConfirmRequest>).detail;
      if (detail) {
        setQueue((prev) => [...prev, detail]);
      }
    };
    window.addEventListener(CONFIRM_EVENT, onConfirm);
    return () => window.removeEventListener(CONFIRM_EVENT, onConfirm);
  }, []);

  const current = queue[0];

  useEffect(() => {
    if (!current) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        current.resolve(false);
        setQueue((prev) => prev.slice(1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current]);

  if (!current) return null;

  const handleChoice = (accepted: boolean) => {
    current.resolve(accepted);
    setQueue((prev) => prev.slice(1));
  };

  return (
    <div
      className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => handleChoice(false)}
    >
      <div
        className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div className="text-sm text-slate-800 font-medium leading-relaxed whitespace-pre-line">
            {current.message}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => handleChoice(false)}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleChoice(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm cursor-pointer"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

