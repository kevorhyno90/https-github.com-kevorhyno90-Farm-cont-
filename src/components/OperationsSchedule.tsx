import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Plus, 
  Layers, 
  HelpCircle, 
  Activity, 
  Filter, 
  ChevronRight, 
  UtensilsCrossed, 
  AlertCircle, 
  ShieldCheck, 
  Trash2 
} from 'lucide-react';

interface TimetableItem {
  id: string;
  category: 'Cows & Calves' | 'Goats & Pigs' | 'Crops & Orchards' | 'Poultry & Dogs';
  operation: string; // E.g., "Deworming dogs", "Foliar Spraying"
  when: string; // E.g., "Every 3 Months"
  how: string; // SOP details
  why: string; // Agricultural or medical reason
  status: 'Completed' | 'Pending';
  custom?: boolean;
}

const DEFAULT_TIMETABLE: TimetableItem[] = [
  // COWS & CALVES
  {
    id: 'tt-1',
    category: 'Cows & Calves',
    operation: 'Teat Dipping & Hygiene Routine',
    when: 'Daily (Every morning and afternoon milking session)',
    how: 'Strip foremilk, dip teats in Chlorhexidine for 30s, wipe dry with single-use towels, and seal post-milking with thick iodine.',
    why: 'Prevents mastitis infections and seals the physical teat sphincter against environmental germs while it contracts.',
    status: 'Completed'
  },
  {
    id: 'tt-2',
    category: 'Cows & Calves',
    operation: 'Calf Decorn/Dehorning',
    when: 'At 2 to 6 Weeks of age',
    how: 'Apply a topical local lidocaine ring block, then use a hot iron dehorner precisely on the horn buds for 5 seconds.',
    why: 'Safer herd management. Prevents horn-gouging injuries among cows in restricted zero-grazing stalls.',
    status: 'Pending'
  },
  {
    id: 'tt-3',
    category: 'Cows & Calves',
    operation: 'Postpartum Selenium Boost',
    when: '4 Weeks before expected calving date',
    how: 'Inject or drench the dry pregnant cow with Vitamin E and Selenium mineral booster mixture.',
    why: 'Prevents retained placenta (delayed membranes separation) and raises calf baseline antibody absorption metrics.',
    status: 'Completed'
  },

  // GOATS & PIGS
  {
    id: 'tt-4',
    category: 'Goats & Pigs',
    operation: 'Hoof Trimming and Copper Dip',
    when: 'Every 4 to 6 Weeks',
    how: 'Trim excess hoof horn flat to parallel the growth ring using hand shear clippers. Dip in 5% Copper Sulfate solution.',
    why: 'Prevents lameness, foot-rot, and joint arthritis on moist concrete surfaces.',
    status: 'Pending'
  },

  // CROPS & ORCHARDS
  {
    id: 'tt-5',
    category: 'Crops & Orchards',
    operation: 'Avocado Pre-Harvest Copper Spray',
    when: '21 to 30 Days before Hass/Fuerte harvest maturity',
    how: 'Spray orchard canopy with Micronized Copper Oxychloride fungicide solution.',
    why: 'Prevents anthracnose fruit spots, guaranteeing GlobalGAP premium export grade clearance.',
    status: 'Completed'
  },
  {
    id: 'tt-6',
    category: 'Crops & Orchards',
    operation: 'Tea Triennial Hard Pruning',
    when: 'Every 3 Years (During cool, dry offseason)',
    how: 'Cut tea branches back to a flat table 24-28 inches high. Paint large cuts with copper paste.',
    why: 'Resets the plucking table width and increases light penetration for vigorous young plucking shoots.',
    status: 'Pending'
  },

  // POULTRY & DOGS
  {
    id: 'tt-7',
    category: 'Poultry & Dogs',
    operation: 'Newcastle and Gumboro Drinking Water Vaccinations',
    when: 'Newcastle on Week 1 & 3; Gumboro on Week 2 booster',
    how: 'Starve birds of water for 2 hours, then mix soluble vaccine vials with cool clean water and dry milk powder stabilizer.',
    why: 'Builds vital antibody titles to protect flock from fatal virus sweep outages.',
    status: 'Completed'
  },
  {
    id: 'tt-8',
    category: 'Poultry & Dogs',
    operation: 'K-9 Parvovirus and Rabies Vaccines',
    when: 'DHLPP Vaccine at 8, 12, & 16 weeks; Rabies at 12 weeks',
    how: 'Administer 1ml vaccine subcutaneously in the loose neck skin folds.',
    why: 'Rabies prevents fatal human spillover. Parvovirus is highly contagious and fatal to young puppies.',
    status: 'Pending'
  }
];

export default function OperationsSchedule() {
  const [items, setItems] = useState<TimetableItem[]>(() => {
    const saved = localStorage.getItem('jr_farm_custom_timetable');
    return saved ? JSON.parse(saved) : DEFAULT_TIMETABLE;
  });

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New timetable item form state
  const [category, setCategory] = useState<TimetableItem['category']>('Cows & Calves');
  const [operation, setOperation] = useState('');
  const [when, setWhen] = useState('');
  const [how, setHow] = useState('');
  const [why, setWhy] = useState('');

  const handleSaveToLocalStorage = (newItems: TimetableItem[]) => {
    setItems(newItems);
    localStorage.setItem('jr_farm_custom_timetable', JSON.stringify(newItems));
  };

  const handleToggleStatus = (id: string) => {
    const updated = items.map(item => {
      if (item.id === id) {
        return { ...item, status: item.status === 'Completed' ? 'Pending' : 'Completed' as any };
      }
      return item;
    });
    handleSaveToLocalStorage(updated);
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!operation || !when || !how || !why) return;

    const newItem: TimetableItem = {
      id: `tt-custom-${Date.now()}`,
      category,
      operation,
      when,
      how,
      why,
      status: 'Pending',
      custom: true
    };

    const updated = [newItem, ...items];
    handleSaveToLocalStorage(updated);

    // Reset Form
    setOperation('');
    setWhen('');
    setHow('');
    setWhy('');
    setShowAddModal(false);
  };

  const handleDeleteItem = (id: string) => {
    const updated = items.filter(item => item.id !== id);
    handleSaveToLocalStorage(updated);
  };

  const filteredItems = filterCategory === 'all' 
    ? items 
    : items.filter(i => i.category === filterCategory);

  return (
    <div className="space-y-6 font-sans antialiased text-slate-800 animate-fadeIn" id="timetable-root">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 bg-yellow-100 text-yellow-800 rounded-lg text-[9px] font-black uppercase tracking-wider">
              Chronological Ledger
            </span>
            <span className="text-[10px] text-slate-400 font-black tracking-widest uppercase">
              Operations Timetable System
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Calendar className="text-emerald-700" size={22} />
            On-Farm Standard Operating Procedures
          </h2>
          <p className="text-xs text-slate-450 font-medium">
            Monitor which operations are performed when, how they are executed, and why they are vital to secure maximum dairy, crop, and canine yields.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 bg-emerald-950 hover:bg-emerald-900 active:scale-[0.98] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer border-0 m-0"
        >
          <Plus size={15} />
          Create Custom SOP Task
        </button>
      </div>

      {/* Filter and Stats Segment */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 border border-slate-100 p-4 rounded-2xl">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <span className="text-[10px] font-black uppercase text-slate-405 flex items-center gap-1">
            <Filter size={12} /> Filter Feed:
          </span>
          <div className="flex gap-1 flex-wrap">
            {['all', 'Cows & Calves', 'Goats & Pigs', 'Crops & Orchards', 'Poultry & Dogs'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg border transition-all cursor-pointer m-0 ${
                  filterCategory === cat
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-500 hover:text-slate-800 border-slate-200'
                }`}
              >
                {cat === 'all' ? 'Show All' : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-bold">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block"></span>
            <span>Completed: {items.filter(i => i.status === 'Completed').length}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 font-bold">
            <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full inline-block"></span>
            <span>Pending: {items.filter(i => i.status === 'Pending').length}</span>
          </div>
        </div>
      </div>

      {/* TIMETABLE LIST SECTION */}
      <div className="space-y-4" id="timetable-timeline">
        {filteredItems.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-400 font-bold text-xs space-y-2">
            <AlertCircle className="mx-auto text-slate-300" size={32} />
            <p>No operations scheduled in this category.</p>
            <p className="text-[11px] font-normal text-slate-400">Add a custom SOP using the button above.</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div 
              key={item.id} 
              className={`bg-white border rounded-3xl p-5 md:p-6 transition-all shadow-xs relative overflow-hidden ${
                item.status === 'Completed' 
                  ? 'border-slate-150 bg-slate-50/50 opacity-90' 
                  : 'border-slate-100 hover:border-emerald-700/20'
              }`}
            >
              {/* Completed decorative line */}
              {item.status === 'Completed' && (
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-600"></div>
              )}

              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-3 flex-1">
                  
                  {/* Category, Status & Delete button header */}
                  <div className="flex items-center justify-between md:justify-start gap-2.5 flex-wrap">
                    <span className="bg-slate-150 text-slate-800 text-[8.5px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide">
                      {item.category}
                    </span>
                    <button
                      onClick={() => handleToggleStatus(item.id)}
                      className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider cursor-pointer m-0 ${
                        item.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {item.status === 'Completed' ? '✓ Completed' : '● Scheduled'}
                    </button>
                    {item.custom && (
                      <span className="bg-purple-100 text-purple-800 text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide">
                        Custom Added
                      </span>
                    )}

                    {item.custom && (
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-rose-600 hover:text-rose-800 font-bold text-xs p-1 ml-auto cursor-pointer m-0 bg-transparent border-0"
                        title="Delete Custom Task"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>

                  {/* Operation Name */}
                  <h3 className={`text-base font-black text-slate-900 ${item.status === 'Completed' ? 'line-through text-slate-450' : ''}`}>
                    {item.operation}
                  </h3>

                  {/* Operational Timeline Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    {/* WHEN */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                        <Clock size={11} className="text-amber-500" /> When is it done?
                      </span>
                      <p className="text-xs font-black text-slate-850 bg-slate-100/30 p-2.5 rounded-xl border border-slate-150/50">
                        {item.when}
                      </p>
                    </div>

                    {/* HOW */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                        <Activity size={11} className="text-blue-500" /> How is it executed?
                      </span>
                      <p className="text-xs text-slate-650 bg-slate-100/30 p-2.5 rounded-xl border border-slate-150/50 leading-relaxed font-medium">
                        {item.how}
                      </p>
                    </div>

                    {/* WHY */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                        <HelpCircle size={11} className="text-purple-500" /> Why is it vital?
                      </span>
                      <p className="text-xs text-slate-650 bg-slate-100/30 p-2.5 rounded-xl border border-slate-150/50 leading-relaxed italic font-medium">
                        "{item.why}"
                      </p>
                    </div>
                  </div>

                </div>

                {/* Desktop Toggle status side click */}
                <div className="shrink-0 flex items-center pt-2 md:pt-4">
                  <button
                    onClick={() => handleToggleStatus(item.id)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer m-0 ${
                      item.status === 'Completed'
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/10'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600'
                    }`}
                    title={item.status === 'Completed' ? 'Mark Task as Pending' : 'Mark Task as Done'}
                  >
                    <CheckCircle2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE CUSTOM SOP TIMETABLE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 md:p-8 space-y-5 animate-scaleUp border border-slate-100 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <span className="bg-purple-100 text-purple-900 px-2 py-0.5 rounded-md text-[8px] font-black uppercase">
                  Standard Operating Procedures
                </span>
                <h3 className="text-base font-black text-slate-950">Add Custom SOP Operation</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-base bg-slate-100 rounded-full w-7 h-7 flex items-center justify-center cursor-pointer border-0 m-0"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustom} className="space-y-4">
              
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  Farm Section Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-xs"
                >
                  <option value="Cows & Calves">Cows & Calves</option>
                  <option value="Goats & Pigs">Goats & Pigs</option>
                  <option value="Crops & Orchards">Crops & Orchards</option>
                  <option value="Poultry & Dogs">Poultry & Dogs</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  Operation Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Alfalfa hay sorting & visual feed mold quarantine"
                  value={operation}
                  onChange={(e) => setOperation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 focus:border-emerald-700 rounded-xl px-3 py-2.5 font-bold text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  When is it done? (Temporal cadence/Cadence triggers)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Every Monday at 8:00 AM, or Week 5 post-calving"
                  value={when}
                  onChange={(e) => setWhen(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 focus:border-emerald-700 rounded-xl px-3 py-2.5 font-bold text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  How is it executed? (Action SOP)
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g., Pull visual samples from center of silage stack. Sift manually for white, pinkish spores. Dump or lock moldy silage slices in safe quarantine dump."
                  value={how}
                  onChange={(e) => setHow(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 focus:border-emerald-700 rounded-xl px-3 py-2 font-semibold text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  Why is it vital? (Technical agricultural justification)
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g., Silage mold contains deadly mycotoxins like aflatoxins that trigger immediate dairy liver damage and induce spontaneous calving abortions."
                  value={why}
                  onChange={(e) => setWhy(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 focus:border-emerald-700 rounded-xl px-3 py-2 font-semibold text-xs leading-relaxed"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black uppercase text-xs rounded-xl py-3 transition-colors cursor-pointer border-0 m-0"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-950 hover:bg-emerald-900 text-white font-black uppercase text-xs rounded-xl py-3 transition-colors cursor-pointer border-0 m-0"
                >
                  Save SOP Task
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
