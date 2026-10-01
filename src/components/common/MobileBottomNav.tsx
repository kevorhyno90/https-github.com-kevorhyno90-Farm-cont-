import React, { useState } from 'react';
import {
  LayoutDashboard, Activity, Plus, Warehouse, Coins,
  X, Milk, Egg, Stethoscope, PackageMinus, DollarSign,
  Leaf, ChevronRight, Sparkles, AlertCircle
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  activeAlarmsCount?: number;
}

export function MobileBottomNav({
  activeTab,
  onSelectTab,
  activeAlarmsCount = 0
}: MobileBottomNavProps) {
  const [speedDialOpen, setSpeedDialOpen] = useState(false);

  const navItems = [
    { id: 'dash', label: 'Home', icon: LayoutDashboard },
    { id: 'dairy', label: 'Dairy', icon: Activity },
    // Center is the Speed Dial (+) button
    { id: 'poultry', label: 'Poultry', icon: Egg },
    { id: 'inventory', label: 'Store', icon: Warehouse }
  ];

  const quickActions = [
    {
      title: 'Log Daily Milk Yield',
      desc: 'Record morning or evening cow milking volumes',
      icon: Milk,
      color: 'bg-blue-500 text-white',
      badge: 'Dairy',
      tabId: 'dairy'
    },
    {
      title: 'Record Egg Collection',
      desc: 'Log daily flock eggs (good, cracked, crates sold)',
      icon: Egg,
      color: 'bg-amber-500 text-white',
      badge: 'Poultry',
      tabId: 'poultry'
    },
    {
      title: 'Log Veterinary Treatment',
      desc: 'Administer drugs, vaccines, or treat clinical symptoms',
      icon: Stethoscope,
      color: 'bg-rose-500 text-white',
      badge: 'Health',
      tabId: 'dairy'
    },
    {
      title: 'Quick Dispense Stock',
      desc: 'Consume feed bags, veterinary drugs, or chemicals',
      icon: PackageMinus,
      color: 'bg-emerald-600 text-white',
      badge: 'Inventory',
      tabId: 'inventory'
    },
    {
      title: 'Record Financial Transaction',
      desc: 'Log operating expenses, feed purchases, or farm income',
      icon: DollarSign,
      color: 'bg-violet-600 text-white',
      badge: 'Finance',
      tabId: 'finance'
    },
    {
      title: 'KTDA Tea Pluck Delivery',
      desc: 'Record daily green leaf harvest weights and casual wages',
      icon: Leaf,
      color: 'bg-emerald-500 text-white',
      badge: 'Tea',
      tabId: 'tea'
    }
  ];

  const handleActionClick = (tabId: string) => {
    setSpeedDialOpen(false);
    onSelectTab(tabId);
  };

  return (
    <>
      {/* QUICK ACTION SPEED DIAL BOTTOM SHEET OVERLAY */}
      {speedDialOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex flex-col justify-end animate-fadeIn"
          onClick={() => setSpeedDialOpen(false)}
        >
          <div
            className="bg-white rounded-t-3xl p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto animate-slideUp"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 tracking-tight">Quick Action Speed Dial</h3>
                  <p className="text-[11px] text-slate-500">1-Tap operations for field officers & attendants</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSpeedDialOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer border-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Action Grid */}
            <div className="grid grid-cols-1 gap-2.5">
              {quickActions.map((action, idx) => {
                const IconComponent = action.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleActionClick(action.tabId)}
                    className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-emerald-50/70 hover:border-emerald-200 transition-all text-left cursor-pointer group"
                  >
                    <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform`}>
                      <IconComponent size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-slate-900 truncate">{action.title}</h4>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                          {action.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{action.desc}</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                );
              })}
            </div>

            {/* Hint */}
            <div className="pt-2 text-center">
              <span className="text-[10px] text-slate-400 font-medium">
                Tap anywhere outside to close • Powered by JR Farm Engine
              </span>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE PINNED BOTTOM BAR */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-xl px-2 py-1 safe-area-bottom"
      >
        <div className="flex items-center justify-around relative">
          {/* Tab 1: Home / Dash */}
          <button
            type="button"
            onClick={() => onSelectTab(navItems[0].id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer border-0 bg-transparent ${
              activeTab === navItems[0].id ? 'text-emerald-700 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <LayoutDashboard size={20} className={activeTab === navItems[0].id ? 'scale-110 text-emerald-600' : ''} />
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">{navItems[0].label}</span>
          </button>

          {/* Tab 2: Dairy */}
          <button
            type="button"
            onClick={() => onSelectTab(navItems[1].id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer border-0 bg-transparent ${
              activeTab === navItems[1].id ? 'text-emerald-700 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Activity size={20} className={activeTab === navItems[1].id ? 'scale-110 text-emerald-600' : ''} />
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">{navItems[1].label}</span>
          </button>

          {/* CENTER ELEVATED FLOATING (+) ACTION BUTTON */}
          <div className="relative -top-5 flex flex-col items-center">
            <button
              type="button"
              onClick={() => setSpeedDialOpen(!speedDialOpen)}
              className="w-13 h-13 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/40 ring-4 ring-white active:scale-95 transition-all cursor-pointer border-0"
              title="Quick Action Speed Dial"
            >
              <Plus size={26} className={speedDialOpen ? 'rotate-45 transition-transform' : 'transition-transform'} />
            </button>
            <span className="text-[9px] font-black text-emerald-800 uppercase tracking-wider mt-0.5">Quick</span>
          </div>

          {/* Tab 3: Poultry */}
          <button
            type="button"
            onClick={() => onSelectTab(navItems[2].id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer border-0 bg-transparent ${
              activeTab === navItems[2].id ? 'text-emerald-700 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Egg size={20} className={activeTab === navItems[2].id ? 'scale-110 text-emerald-600' : ''} />
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">{navItems[2].label}</span>
          </button>

          {/* Tab 4: Store / Inventory */}
          <button
            type="button"
            onClick={() => onSelectTab(navItems[3].id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer border-0 bg-transparent ${
              activeTab === navItems[3].id ? 'text-emerald-700 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Warehouse size={20} className={activeTab === navItems[3].id ? 'scale-110 text-emerald-600' : ''} />
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">{navItems[3].label}</span>
          </button>
        </div>
      </nav>
    </>
  );
}
