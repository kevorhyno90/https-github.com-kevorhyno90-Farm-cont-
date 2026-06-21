import React, { useState } from 'react';
import { 
  BookOpen, 
  Sprout, 
  Leaf, 
  Heart, 
  Sparkles, 
  Calculator, 
  Clock, 
  Activity, 
  AlertTriangle, 
  ShieldAlert, 
  Layers, 
  Award, 
  HelpCircle,
  TrendingUp,
  Flame,
  Search,
  CheckCircle,
  Plus,
  Droplets,
  Scale,
  FileText,
  Lightbulb,
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';

export default function FarmerAcademy() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'science' | 'crops' | 'livestock' | 'calculators'>('science');

  // Sub-tabs to detail specific items within categories
  const [selectedCrop, setSelectedCrop] = useState<string>('all');
  const [selectedAnimal, setSelectedAnimal] = useState<string>('all');

  // Calculator states
  const [biogasVolume, setBiogasVolume] = useState<number>(2); // target m3 of gas
  const [heatTime, setHeatTime] = useState<string>('06:00');
  const [heatPeriod, setHeatPeriod] = useState<'morning' | 'afternoon'>('morning');
  const [currentMilk, setCurrentMilk] = useState<number>(15);
  const [currentProtein, setCurrentProtein] = useState<number>(14);

  // Fertilizer calculator states
  const [calcCrop, setCalcCrop] = useState<string>('maize');
  const [calcAcreage, setCalcAcreage] = useState<number>(1);

  // Helper matching filter for global searches
  const filterMatches = (title: string, tags: string[], description: string) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const matchTitle = title.toLowerCase().includes(term);
    const matchDesc = description.toLowerCase().includes(term);
    const matchTags = tags.some(tag => tag.toLowerCase().includes(term));
    return matchTitle || matchDesc || matchTags;
  };

  // NPK Fertilization rules data
  const fertilizerDb: Record<string, { planting: string; topDressing: string; notes: string }> = {
    maize: {
      planting: "DAP (Diammonium Phosphate) — 1 bag (50kg) per acre",
      topDressing: "CAN (Calcium Ammonium Nitrate) — 1.5 bags (75kg) per acre, applied when maize is knee-high (V4-V6 stage)",
      notes: "Place DAP 2 inches to the side and 2 inches below the seed to prevent acidic root burn. Apply CAN after rain or watering when the soil is damp."
    },
    tea: {
      planting: "NPK 25:5:5 or NPK 26:5:5 — 1.2 bags (60kg) per acre",
      topDressing: "NPK 25:5:5 — 2 bags (100kg) per acre annually, usually split into two seasons (March and October)",
      notes: "Tea thrives in acidic soils (pH 4.5 - 5.6). Do not apply wood ash or lime, as it raises pH and stunts tea bush vigor."
    },
    avocado: {
      planting: "Single Super Phosphate (SSP) — 250g per planting hole mixed with 1 wheelbarrow of dry manure",
      topDressing: "CAN — 150g per immature tree, increasing to 500g annually for mature Hass trees. Also apply Solubor (Boron) to boost fruit set",
      notes: "Feed fertilizer around the tree canopy drip-line, never next to the trunk. Mulch tree root zone meticulously with dry leaves."
    },
    banana: {
      planting: "Double Super Phosphate (DSP) — 200g per plant hole, combined with 20kg of dark cured manure",
      topDressing: "Muriate of Potash (MOP) — 150g per mat twice yearly + CAN 100g to support active pseudostem development",
      notes: "Bananas are extremely heavy potassium feeders. Bio-slurry from the biogas digester is highly recommended as a foliar drench."
    },
    sorghum: {
      planting: "NPK 23:21:0 or DAP — 0.8 bags (40kg) per acre",
      topDressing: "CAN — 1 bag (50kg) per acre when plants reach 30cm in height",
      notes: "Highly tolerant of dry soils, but responds exceptionally well to nitrogen top-dressing just before boot-stage elongation."
    },
    beans: {
      planting: "SSP (Single Super Phosphate) — 1 bag (50kg) per acre, inoculating seeds with Rhizobium",
      topDressing: "Foliar trace micro-elements spray at first flowering. Generally requires zero nitrogen CAN top-dressing",
      notes: "Beans actively fix nitrogen from the air. Nitrogen top-dressing is counter-productive as it causes excessive canopy growth, reducing pod yield."
    },
    vegetables: {
      planting: "NPK 17:17:17 — 1 bag per acre mixed thoroughly inside the planting beds",
      topDressing: "Calcium Nitrate (Soluble) — via drip lines (fertigation) weekly at 5kg per acre to prevent physiological blossom-end rot",
      notes: "For tomatoes and sweet peppers, Calcium is critical for cell-wall integrity. Maintain drip irrigation system flush."
    },
    napier: {
      planting: "DAP or NPK 23:21:0 — 1 bag (50kg) per acre inside the planting furrows",
      topDressing: "CAN — 1 bag (50kg) per acre after EVERY second cutting, or continuous Bio-slurry drenching",
      notes: "Napier grass is a highly demanding fodder crop. Nitrogen top-dressing determines raw leaf crude protein (CP) and feed digestibility."
    },
    eucalyptus: {
      planting: "NPK 17:17:17 — 100g per seedling hole mixed with loose soil",
      topDressing: "Generally requires minimal top-dressing once roots reach deep aquifers. Supplement with composted manure during year 1",
      notes: "Ensure windbreaks do not rob water from nearby crop root lines. Dig a deep root-barrier trench to guide Eucalyptus roots vertically."
    }
  };

  return (
    <div className="space-y-6 font-sans antialiased text-slate-800 animate-fadeIn" id="academy-root">
      
      {/* Academy Hero Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 border border-emerald-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-800/15 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl -ml-16 -mb-16"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-emerald-900 text-emerald-300 font-extrabold tracking-widest text-[9px] uppercase px-3 py-1 rounded-full border border-emerald-700/50">
                ⚡ MASTERCLASS SUPER-HUB
              </span>
              <span className="bg-amber-500/20 text-amber-300 font-bold text-[9px] px-2.5 py-1 rounded-full border border-amber-500/30">
                LIVESTOCK + AGRONOMY SPECIFICATIONS
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
              Farmer's Knowledge Academy
            </h2>
            <p className="text-emerald-100 text-xs md:text-sm leading-relaxed max-w-xl font-medium">
              Achieve total compliance and record yields. Access scientific protocols for livestock health, crop-specific calendars, chemical quarantine controls (GlobalGAP PHI), compost engineering, and real-time simulators.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-3">
            <div className="bg-slate-900/60 backdrop-blur-md px-5 py-4 rounded-2xl border border-emerald-800 text-center shadow-md">
              <span className="text-2xl font-black text-yellow-500 block font-mono">15+</span>
              <span className="text-[9px] text-emerald-100 font-bold uppercase tracking-widest block mt-0.5">App Crops & Beasts</span>
            </div>
            <div className="bg-slate-900/60 backdrop-blur-md px-5 py-4 rounded-2xl border border-emerald-800 text-center shadow-md">
              <span className="text-2xl font-black text-emerald-300 block font-mono">4</span>
              <span className="text-[9px] text-emerald-100 font-bold uppercase tracking-widest block mt-0.5">Smart Simulators</span>
            </div>
          </div>
        </div>

        {/* Integrated Real-Time Interactive Search */}
        <div className="mt-6 relative max-w-lg" id="academy-search">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-emerald-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search crop (tea, avocado, bsf), disease (mastitis, rot), protocol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-16 py-3.5 bg-slate-900/55 text-emerald-100 focus:bg-white focus:text-slate-900 placeholder:text-slate-400 rounded-2xl border border-slate-800 focus:border-yellow-500 underline-none focus:outline-none focus:ring-2 focus:ring-yellow-500/30 font-semibold text-xs transition-all shadow-inner"
          />
          {searchTerm ? (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-[10px] text-amber-400 hover:text-amber-300 font-black tracking-wide uppercase border-0 bg-transparent cursor-pointer"
            >
              Clear
            </button>
          ) : (
            <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-[9px] text-slate-500 font-bold">
              KNOWLEDGE ENGINE
            </span>
          )}
        </div>
      </div>

      {/* Main Academy Section Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => { setActiveTab('science'); }}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-black text-xs uppercase tracking-wide transition-all cursor-pointer m-0 ${
            activeTab === 'science'
              ? 'bg-emerald-950 text-white border-emerald-950 shadow-sm'
              : 'bg-white text-slate-500 hover:text-slate-850 hover:bg-slate-50 border-slate-200'
          }`}
          id="tab-science"
        >
          <Sprout size={14} className={activeTab === 'science' ? 'text-yellow-400' : 'text-emerald-700'} />
          Scientific Farming Practices
        </button>

        <button
          onClick={() => { setActiveTab('crops'); }}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-black text-xs uppercase tracking-wide transition-all cursor-pointer m-0 ${
            activeTab === 'crops'
              ? 'bg-emerald-950 text-white border-emerald-950 shadow-sm'
              : 'bg-white text-slate-500 hover:text-slate-850 hover:bg-slate-50 border-slate-200'
          }`}
          id="tab-crops"
        >
          <Leaf size={14} className={activeTab === 'crops' ? 'text-yellow-400' : 'text-emerald-700'} />
          Crop-Specific Guides
        </button>

        <button
          onClick={() => { setActiveTab('livestock'); }}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-black text-xs uppercase tracking-wide transition-all cursor-pointer m-0 ${
            activeTab === 'livestock'
              ? 'bg-emerald-950 text-white border-emerald-950 shadow-sm'
              : 'bg-white text-slate-500 hover:text-slate-850 hover:bg-slate-50 border-slate-200'
          }`}
          id="tab-livestock"
        >
          <Heart size={14} className={activeTab === 'livestock' ? 'text-red-400' : 'text-rose-700'} />
          Livestock Health Protocols
        </button>

        <button
          onClick={() => { setActiveTab('calculators'); }}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-black text-xs uppercase tracking-wide transition-all cursor-pointer m-0 ${
            activeTab === 'calculators'
              ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
              : 'bg-amber-500/10 text-amber-900 hover:bg-amber-500/20 border-amber-300'
          }`}
          id="tab-calculators"
        >
          <Calculator size={14} />
          Interactive Smart Tools
        </button>
      </div>

      {/* 1. SCIENTIFIC FARMING PRACTICES TAB */}
      {activeTab === 'science' && (
        <div className="space-y-6" id="science-section">
          <div className="bg-emerald-50 border border-emerald-100/50 rounded-2xl p-4 flex items-start gap-3">
            <Info className="text-emerald-800 shrink-0 mt-0.5" size={16} />
            <p className="text-xs text-emerald-950 leading-relaxed font-semibold">
              <strong>Core Agricultural Biology Directive:</strong> Scientific farming builds soil structures instead of exhausting nutrients. Always verify biological compatibility, composting heat levels, and pesticide Pre-Harvest Withholding Intervals (PHI) before conducting any farm work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Practice 1: Soil pH & Dynamic Organic Carbon */}
            {filterMatches(
              "Soil Health & Dynamic Organic Carbon", 
              ["soil", "organic", "pH", "testing", "manure", "nitrogen", "calcium"],
              "Comprehensive guidelines on soil test ranges, balancing acidic profiles, boosting microbial life, and organic carbon maintenance"
            ) && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all space-y-4">
                <div className="flex justify-between items-center">
                  <span className="bg-emerald-50 text-emerald-850 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-emerald-100">
                    🔬 Chemistry Lab
                  </span>
                  <Droplets className="text-emerald-700 font-bold" size={18} />
                </div>
                <h3 className="text-base font-black text-slate-900">Soil Health & Dynamic Organic Carbon</h3>
                
                <div className="text-xs leading-relaxed text-slate-600 space-y-3">
                  <p>
                    <strong>1. Soil pH Management targets:</strong> Most crops thrive at pH <span className="font-bold text-slate-900">5.5 to 6.5</span> (slightly acidic). 
                    <br />• <strong>High acidity (pH &lt; 5.0):</strong> Blocks critical phosphorus absorption. Apply agricultural lime (Calcium Carbonate) or dolomite at 1 ton per acre to buffer.
                    <br />• <strong>Alkalinity (pH &gt; 7.5):</strong> Stunts trace elements like iron and zinc. Use chemical agricultural sulfur powder.
                  </p>
                  <p>
                    <strong>2. Boosting Humus & Microbial Life:</strong> Organic matter acts as a biological sponge. Maintain soil carbon levels at &gt;3% by continuous zero-till mulching, applying dark compost, and scheduling rotational plantings.
                  </p>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-start gap-2.5">
                    <span className="text-lg">🧪</span>
                    <div>
                      <h4 className="font-black text-slate-800 text-[10px] uppercase tracking-wide">Dynamic Nitrogen Fixation Note:</h4>
                      <p className="text-[10px] leading-relaxed text-slate-500 font-medium">Intercropping beans with maize releases natural fixed atmospheric nitrogen, reducing CAN fertilizer expenses by up to 35% annually.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Practice 2: Composting Engineering */}
            {filterMatches(
              "Bovine & Poultry Compost Windrow Engineering", 
              ["composting", "manure", "windrows", "temperature", "carbon", "nitrogen", "turning"],
              "Guidelines for compost piling, optimal C:N ratio, temperature monitoring curve, and hydration"
            ) && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all space-y-4">
                <div className="flex justify-between items-center">
                  <span className="bg-amber-50 text-amber-900 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-amber-200">
                    🍂 Biomass Lab
                  </span>
                  <Layers className="text-amber-600" size={18} />
                </div>
                <h3 className="text-base font-black text-slate-900">Bovine & Poultry Compost Windrow Engineering</h3>
                
                <div className="text-xs leading-relaxed text-slate-600 space-y-3">
                  <p>
                    <strong>1. The Golden Carbon-to-Nitrogen (C:N) Ratio:</strong> Achieve a target of <span className="font-bold text-slate-900">30:1</span>.
                    <br />• <strong>Browns (Carbon):</strong> Dry twigs, maize stalks, wood chips, dry tea prunings (3 parts).
                    <br />• <strong>Greens (Nitrogen):</strong> Fresh green weeds, poultry droppings, cattle manure, bio-digester slurry (1 part).
                  </p>
                  <p>
                    <strong>2. Active Thermophilic Temperature Curve:</strong> Pile compost in active windrows 1.5m high.
                    <br />• Monitor with a probe. Within 4 days, heat must spike to <span className="font-bold text-rose-600 font-mono">55°C - 65°C</span>. This high heat physically pasteurizes weed seeds and pathogenic bacteria.
                    <br />• If heat drops below 45°C, turn and hydrate the compost pile immediately to re-activate aerobic digestion.
                  </p>
                  <p className="font-bold text-emerald-800 bg-emerald-50 p-2.5 rounded text-[11px] leading-snug">
                    ✓ Cured compost must smell like sweet forest rain, be completely dark crumbly humus, and feel cool to the touch (within 60 days).
                  </p>
                </div>
              </div>
            )}

            {/* Practice 3: Integrated Pest Management (IPM) */}
            {filterMatches(
              "Integrated Pest Management (IPM) & GlobalGAP Rules", 
              ["ipm", "pesticides", "traps", "biological", "globalgap", "quarantine", "withholding"],
              "How to track and control crop pests organically, sticky traps, predatory insects, and quarantine safety"
            ) && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all space-y-4">
                <div className="flex justify-between items-center">
                  <span className="bg-rose-50 text-rose-800 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-rose-150">
                    🛡️ GlobalGAP
                  </span>
                  <ShieldCheck className="text-rose-700" size={18} />
                </div>
                <h3 className="text-base font-black text-slate-900">Integrated Pest Management & Chemical Control</h3>
                
                <div className="text-xs leading-relaxed text-slate-600 space-y-3">
                  <p>
                    <strong>1. Eco-Friendly Pest Trapping protocols:</strong> Do not spray chemical poisons at first sight. Use physical traps:
                    <br />• <strong>Yellow Sticky Traps:</strong> Capture whiteflies, thrips, and aphids in tomato drip greenhouses.
                    <br />• <strong>Pheromone Traps:</strong> Catch fruit flies in avocado groves to protect export fruits from puncture rot.
                  </p>
                  <p>
                    <strong>2. Biological Predatory insects:</strong> Leverage nature. Maintain wild floral margins around bean fields to attract predatory ladybirds (which devour aphids) and parasitic wasps (for leafminer control).
                  </p>
                  <p className="bg-slate-900 text-slate-100 p-3.5 rounded-xl text-[10px] space-y-1">
                    <span className="text-yellow-405 font-black uppercase block tracking-wider">⚠️ STRICT EXPORT QUARANTINE (PHI):</span>
                    <span>Pre-Harvest Intervals are legally binding. When chemical drenching is unavoidable, always check the chemical label. The sprayed crops MUST remain quarantined (absolutely zero harvesting allowed) until the PHI safe expiration date.</span>
                  </p>
                </div>
              </div>
            )}

            {/* Practice 4: Precision Drip & Gravity Water Engineering */}
            {filterMatches(
              "Precision Drip & Gravity Water Engineering", 
              ["water", "drip", "irrigation", "soil", "gravity", "flow", "mulching"],
              "High-efficiency drip lines, calculating flow rates, avoiding waterlogging, and soil moisture lock techniques"
            ) && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all space-y-4">
                <div className="flex justify-between items-center">
                  <span className="bg-blue-50 text-blue-900 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-blue-100">
                    💧 Hydrology Lab
                  </span>
                  <Activity className="text-blue-700" size={18} />
                </div>
                <h3 className="text-base font-black text-slate-900">Precision Drip & Gravity Water Engineering</h3>
                
                <div className="text-xs leading-relaxed text-slate-600 space-y-3">
                  <p>
                    <strong>1. Drip Line Calibration:</strong> Gravity-fed low pressure systems require header tanks raised &gt;2 meters above the fields. 
                    <br />• Use pressure-compensating drip buttons to supply a uniform <span className="font-bold text-slate-900 font-mono">1.5 - 2.0 Liters per hour</span> per plant emitter, avoiding water wasted on pathways.
                  </p>
                  <p>
                    <strong>2. Crop Waterlogging Defenses:</strong> Clay soils lock water, inducing anaerobic root asphyxiation (robbing roots of oxygen). Prepare high-raised soil beds at least 30cm tall, and till wood chips inside clay basins.
                  </p>
                  <p>
                    <strong>3. Moisture Lock (Mulching):</strong> Mulch crop rows with dry Napier grass or tea pruning clippings. Organic mulch blocks solar reflection, cutting surface water evaporation by up to 70% and suppressing weeds.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 2. CROP-SPECIFIC GUIDES TAB */}
      {activeTab === 'crops' && (
        <div className="space-y-6 text-slate-805" id="crops-section">
          
          {/* Crop Selector Filter pills */}
          <div className="flex flex-wrap gap-2.5 items-center bg-slate-50 p-2.5 rounded-2xl border">
            <span className="text-[10px] font-black uppercase text-slate-505 block tracking-wide pl-2">Filter Crop:</span>
            {[
              { id: 'all', label: 'All Crops' },
              { id: 'tea', label: 'Tea Highlands' },
              { id: 'avocado', label: 'Avocado Hass/Fuerte' },
              { id: 'banana', label: 'Banana Groves' },
              { id: 'sorghum', label: 'Sorghum Fields' },
              { id: 'maize', label: 'Maize Staples' },
              { id: 'beans', label: 'Nitrogen Beans' },
              { id: 'vegetables', label: 'Drip Veggies' },
              { id: 'napier', label: 'Napier & Eucalyptus' }
            ].map(pill => (
              <button
                key={pill.id}
                onClick={() => setSelectedCrop(pill.id)}
                className={`px-3 py-1.5 rounded-xl border text-[11px] font-black uppercase cursor-pointer transition-all ${
                  selectedCrop === pill.id
                    ? 'bg-emerald-900 text-white border-emerald-900'
                    : 'bg-white text-slate-500 hover:text-slate-800'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Tea Highlands Card */}
            {(selectedCrop === 'all' || selectedCrop === 'tea') && filterMatches(
              "Tea Cultivation, Pruning & Diseases", 
              ["tea", "clones", "pruning", "grey blight", "rust", "armillaria"],
              "Pruning cycle, plucking standards, Triennial cycles, Grey Blight control, and Armillaria root rot"
            ) && (
              <div className="bg-white border border-slate-200 rounded-3xl p-5 hover:shadow-md transition-all space-y-4">
                <div className="flex justify-between items-center">
                  <span className="bg-teal-50 text-teal-850 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-teal-200">
                    🍃 TEA HIGHLANDS
                  </span>
                  <Leaf className="text-teal-700 font-bold" size={16} />
                </div>
                <h3 className="text-base font-black text-slate-900">Tea Cultivation, Pruning & Disease Control</h3>
                <div className="text-xs leading-relaxed text-slate-600 space-y-3">
                  <p>
                    <strong>• The Pruning SOP (Triennial):</strong> Pruning back tea bushes every 3 years is mandatory to renew young vegetative flushing stems. Maintain a flat plucking table 24–28 inches above ground.
                  </p>
                  <p>
                    <strong>• Grey Blight (Pestalotiopsis):</strong> Causes circular leaf spots with dark concentric bands, killing young plucking terminals. Protect crops by spraying micronized copper foliar mix right after hard pruning.
                  </p>
                  <p>
                    <strong>• Armillaria Root Rot:</strong> The split lower stems show thick white fungal fans. Dig out the roots of dead plants physically to stop structural propagation across neighboring tea grids.
                  </p>
                </div>
              </div>
            )}

            {/* Avocado Card */}
            {(selectedCrop === 'all' || selectedCrop === 'avocado') && filterMatches(
              "Avocado Fuerte & Hass Agronomy", 
              ["avocado", "hass", "fuerte", "root rot", "anthracnose", "planting", "manure", "ssp"],
              "Avocado planting hole mix, managing Anthracnose spots, Phytophthora Root Rot, and SSP fertilizer needs"
            ) && (
              <div className="bg-white border border-slate-200 rounded-3xl p-5 hover:shadow-md transition-all space-y-4">
                <div className="flex justify-between items-center">
                  <span className="bg-emerald-50 text-emerald-900 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-emerald-100">
                    🥑 AVOCADO HASS & FUERTE
                  </span>
                  <Sprout className="text-emerald-700" size={16} />
                </div>
                <h3 className="text-base font-black text-slate-900">Avocado Planting & Disease Prevention</h3>
                <div className="text-xs leading-relaxed text-slate-600 space-y-3">
                  <p>
                    <strong>• Planting Hole Protocol:</strong> Excavate holes exactly <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-800">2ft x 2ft x 2ft</code>. Backfill mix: Topsoil + 1 wheelbarrow of composted dry cow manure + 250g of Single Super Phosphate (SSP) fertilizer per hole.
                  </p>
                  <p>
                    <strong>• Phytophthora Root Rot:</strong> Yellowing dead leaves and sparse twig diebacks indicate drowned rotten roots. Apply Copper Oxychloride (Ridomil Gold) soil drench and plant in high-draining sandy areas.
                  </p>
                  <p>
                    <strong>• Anthracnose (Colletotrichum):</strong> Sunken black spots on avocado fruits. Maintain high GlobalGAP branch canopy trimming to allow sunlight. Spray copper hydroxide 21 days pre-harvest.
                  </p>
                </div>
              </div>
            )}

            {/* Banana Card */}
            {(selectedCrop === 'all' || selectedCrop === 'banana') && filterMatches(
              "Banana Plantation Management", 
              ["banana", "spacing", "sigatoka", "weevil", "mulching", "propping", "manure"],
              "Banana grove layouts, Sigatoka spot control, stem weevils, propping heavier banana bunches, dynamic mulching"
            ) && (
              <div className="bg-white border border-slate-200 rounded-3xl p-5 hover:shadow-md transition-all space-y-4">
                <div className="flex justify-between items-center">
                  <span className="bg-yellow-50 text-amber-950 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-yellow-250">
                    🍌 BANANA GROVES
                  </span>
                  <Award className="text-yellow-600" size={16} />
                </div>
                <h3 className="text-base font-black text-slate-900">Banana Husbandry & Pest Management</h3>
                <div className="text-xs leading-relaxed text-slate-600 space-y-3">
                  <p>
                    <strong>• Spacing & Field Layout:</strong> Plant banana suckers in rows using <span className="font-bold text-slate-900">3 meters x 3 meters</span> grid spacing. Keep only 1 active mother, 1 daughter, and 1 granddaughter stem per clump.
                  </p>
                  <p>
                    <strong>• Black Sigatoka Disease:</strong> Dark leaf streaks that cause premature leaf drop, reducing bunch weights. Prune affected leaves immediately and bury or burn them.
                  </p>
                  <p>
                    <strong>• Stem Weevils & Bunch Support:</strong> Larvae hole the pseudostem base. Keep stem residues neatly chopped to suppress laying spaces. Prop expanding bunches with strong fork branches to stop heavy storm snaps.
                  </p>
                </div>
              </div>
            )}

            {/* Sorghum Card */}
            {(selectedCrop === 'all' || selectedCrop === 'sorghum') && filterMatches(
              "Sorghum Cereal Dryland Agronomy", 
              ["sorghum", "spacing", "smut", "dryland", "hybrid", "moisture", "birds"],
              "Sorghum cereal spacing, wind-resistant seeds, moisture bounds, head smut control, bird scaring"
            ) && (
              <div className="bg-white border border-slate-200 rounded-3xl p-5 hover:shadow-md transition-all space-y-4">
                <div className="flex justify-between items-center">
                  <span className="bg-orange-50 text-orange-950 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-orange-150">
                    🌾 SORGHUM DRYLAND
                  </span>
                  <TrendingUp className="text-orange-700" size={16} />
                </div>
                <h3 className="text-base font-black text-slate-900">Sorghum Husbandry & Head Smut Control</h3>
                <div className="text-xs leading-relaxed text-slate-600 space-y-3">
                  <p>
                    <strong>• Row Spacing & Seeding:</strong> Plant seeds directly in furrows spaced <span className="font-bold text-slate-900">60cm apart</span>, then thin seedlings to 15cm per stand. This supports sturdy stalks, preventing dryland wind-bending.
                  </p>
                  <p>
                    <strong>• Sphacelotheca Head Smut:</strong> Black carbon soot bags replace normal starch grains. Plant resistant certified hybrid seeds and practice crop-rotations annually.
                  </p>
                  <p>
                    <strong>• Crop moisture & Bird defenses:</strong> Extremely hardy and drought-tolerant. Protect maturing ears from birds using sound tape, reflective ribbons, or physical bird-mesh nets.
                  </p>
                </div>
              </div>
            )}

            {/* Maize Staples Card */}
            {(selectedCrop === 'all' || selectedCrop === 'maize') && filterMatches(
              "Maize Staples Masterclass", 
              ["maize", "corn", "spacing", "fall armyworm", "borer", "crop", "neem", "sand"],
              "Maize planting layout, Fall Armyworm sand drenching, neem oil whorl dosage, stalk borer prevention"
            ) && (
              <div className="bg-white border border-slate-200 rounded-3xl p-5 hover:shadow-md transition-all space-y-4">
                <div className="flex justify-between items-center">
                  <span className="bg-amber-50 text-amber-950 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-amber-205">
                    🌽 MAIZE STAPLES
                  </span>
                  <Award className="text-amber-700" size={16} />
                </div>
                <h3 className="text-base font-black text-slate-900">Maize Spacing, Pests & Hybrid Selection</h3>
                <div className="text-xs leading-relaxed text-slate-600 space-y-3">
                  <p>
                    <strong>• Field Spacing Rule:</strong> Maintain spacing at <span className="font-bold text-slate-900">75cm between rows x 25cm between hills</span> (1 seed per hill). Plant with DAP (Diammonium Phosphate) placed slightly side-shifted.
                  </p>
                  <p>
                    <strong>• Fall Armyworm & Stalk Borer Treatment:</strong> Whorl damage shows ragged leaf holes. Drop fine dry sand, wood ash, or active neem oil solution directly down the plant leaf whorl at early vegetative growth stage.
                  </p>
                  <p>
                    <strong>• Composting & CAN Top-Dressing:</strong> Drench fields with processed cow manure compost at planting. Apply CAN (Calcium Ammonium Nitrate) top-dressing at knee-high height.
                  </p>
                </div>
              </div>
            )}

            {/* Beans Nitrogen Card */}
            {(selectedCrop === 'all' || selectedCrop === 'beans') && filterMatches(
              "Beans Legume Intercropping Layouts", 
              ["beans", "legumes", "intercropping", "nitrogen", "rhizobium", "fly", "rust"],
              "Bean legume intercropping spacing, Rhizobium seedling innoculant, pod yield, bean fly control, bean rust"
            ) && (
              <div className="bg-white border border-slate-200 rounded-3xl p-5 hover:shadow-md transition-all space-y-4">
                <div className="flex justify-between items-center">
                  <span className="bg-purple-50 text-purple-950 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-purple-200">
                    🌰 ROTATIONAL BEANS
                  </span>
                  <Activity className="text-purple-700" size={16} />
                </div>
                <h3 className="text-base font-black text-slate-900">Beans Inoculation & Intercropping</h3>
                <div className="text-xs leading-relaxed text-slate-600 space-y-3">
                  <p>
                    <strong>• Legume Seed Inoculation:</strong> Inoculate bean seeds with <span className="font-bold text-slate-900">Rhizobium bacteria powder</span> before planting to jump-start nitrogen-fixing nodules. Use single super phosphate.
                  </p>
                  <p>
                    <strong>• Intercropping with Maize:</strong> Alternate crops utilizing 2 rows of maize and 1 row of beans. This arrangement provides structural shade for beans and supplies local nitrogen to maize lines.
                  </p>
                  <p>
                    <strong>• Bean Fly (Ophiomyia):</strong> Thinned dark stems and wilting seedlings. Ensure early planting with damp healthy composts. Treat severe infestations with organic garlic sprays.
                  </p>
                </div>
              </div>
            )}

            {/* Vegetables Drip Card */}
            {(selectedCrop === 'all' || selectedCrop === 'vegetables') && filterMatches(
              "Vegetables Drip Lines & Wilt", 
              ["vegetables", "tomatoes", "cabbage", "wilt", "calcium", "blossom-end", "drip", "greenhouse"],
              "Drip tomato greenhouses, physical insect sticky traps, crop rotations against bacterial wilt, prevent blossom-end rot"
            ) && (
              <div className="bg-white border border-slate-200 rounded-3xl p-5 hover:shadow-md transition-all space-y-4">
                <div className="flex justify-between items-center">
                  <span className="bg-blue-50 text-blue-900 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-blue-150">
                    🍅 DRIP VEGETABLES
                  </span>
                  <Droplets className="text-blue-700" size={16} />
                </div>
                <h3 className="text-base font-black text-slate-900">Tomato, Cabbage & Pepper Drip Husbandry</h3>
                <div className="text-xs leading-relaxed text-slate-600 space-y-3">
                  <p>
                    <strong>• Water Management & Blossom Rot:</strong> Drip tomatoes must receive steady watering. Blossom-End Rot is caused by dry-spell calcium transport failures. Fertigate with water-soluble calcium nitrate.
                  </p>
                  <p>
                    <strong>• Bacterial Wilt (Ralstonia):</strong> Sudden daytime wilting while the plant leaves stay bright green. This pathogen stays dormant in soil. Rotate beds annually with onions or cereals to break the cycle.
                  </p>
                  <p>
                    <strong>• Organic Pesticides & GlobalGAP compliance:</strong> Use yellow sticky insect plates in greenhouse entries. Track pesticide quarantine intervals closely to guarantee biochemical safety of food.
                  </p>
                </div>
              </div>
            )}

            {/* Napier & Eucalyptus Card */}
            {(selectedCrop === 'all' || selectedCrop === 'napier') && filterMatches(
              "Napier & Eucalyptus Agronomy", 
              ["napier", "eucalyptus", "fodder", "windbreak", "timber", "roots"],
              "Napier organic multi-cut zero-grazing feed, Eucalyptus windbreak layout, safeguarding water water tables"
            ) && (
              <div className="bg-white border border-slate-200 rounded-3xl p-5 hover:shadow-md transition-all space-y-4">
                <div className="flex justify-between items-center">
                  <span className="bg-emerald-100 text-emerald-900 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-emerald-250">
                    🌳 FODDER & SILVICULTURE
                  </span>
                  <Sprout className="text-emerald-800" size={16} />
                </div>
                <h3 className="text-base font-black text-slate-900">Napier Fodcer & Eucalyptus Woodlots</h3>
                <div className="text-xs leading-relaxed text-slate-605 space-y-3">
                  <p>
                    <strong>• Napier Grass Multi-Cut SOP:</strong> Plant root slips in rows using <span className="font-bold text-slate-900">1m x 1m</span> layouts. Harvest only when the canopy is between <span className="font-bold">2.5 and 4 feet high</span>. Cutting too early reduces overall yield, while cutting too late yields tough, woody, indigestible fodder.
                  </p>
                  <p>
                    <strong>• Eucalyptus Windbreak Architecture:</strong> Fast wind gusts stunt avocado fruit-set. Plant Eucalyptus around field perimeters. Excavate a <span className="font-bold text-slate-900">1.2-meter-deep trench</span> parallel to windbreaks to prevent aggressive Eucalyptus roots from robbing your crops of moisture.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 3. LIVESTOCK HEALTH MANAGEMENT PROTOCOLS TAB */}
      {activeTab === 'livestock' && (
        <div className="space-y-6 text-slate-805" id="livestock-section">

          {/* Animal Selector pills */}
          <div className="flex flex-wrap gap-2.5 items-center bg-slate-50 p-2.5 rounded-2xl border">
            <span className="text-[10px] font-black uppercase text-slate-505 block tracking-wide pl-2">Filter Animal:</span>
            {[
              { id: 'all', label: 'All Beasts' },
              { id: 'cows', label: 'Dairy Bovine' },
              { id: 'goats', label: 'Goats Caprine' },
              { id: 'calves', label: 'Maternity Calves' },
              { id: 'poultry', label: 'Poultry Farm' },
              { id: 'canines', label: 'K-9 Guard Security' },
              { id: 'bsf', label: 'BSF Larvae protein' }
            ].map(pill => (
              <button
                key={pill.id}
                onClick={() => setSelectedAnimal(pill.id)}
                className={`px-3 py-1.5 rounded-xl border text-[11px] font-black uppercase cursor-pointer transition-all ${
                  selectedAnimal === pill.id
                    ? 'bg-rose-955 bg-rose-950 text-white border-rose-950'
                    : 'bg-white text-slate-505 hover:text-slate-800'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Dairy Cows Card */}
            {(selectedAnimal === 'all' || selectedAnimal === 'cows') && filterMatches(
              "Dairy Bovine Veterinary Protocols", 
              ["cows", "milk", "bovine", "foot rot", "milk fever", "mastitis", "calcium", "stripping", "iodine"],
              "Treating milk fever postpartum, 5% copper sulfate footbath, 3-step hygiene stripping mastitis control"
            ) && (
              <div className="bg-white border border-slate-205 rounded-3xl p-5 hover:shadow-md transition-all space-y-4">
                <div className="flex justify-between items-center">
                  <span className="bg-rose-55 bg-rose-100 text-rose-950 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-rose-200">
                    🐄 DAIRY BOVINE
                  </span>
                  <Activity className="text-rose-700" size={16} />
                </div>
                <h3 className="text-base font-black text-slate-900 font-sans">Dairy Cow Yield & Disease Prevention</h3>
                
                <div className="text-xs leading-relaxed text-slate-600 space-y-3">
                  <p>
                    <strong>• Postpartum Milk Fever Emergency:</strong> S-curve neck, cold extremities, sternal collapse. DO NOT feed oral drench (danger of aspiration). Slowly infuse <span className="font-bold text-rose-700">450ml of Calcium Borogluconate 20%</span> directly into the jugular vein.
                  </p>
                  <p>
                    <strong>• Mastitis Control (3-Step Hygiene):</strong>
                    <br />1. Strip 2 test streams per teat to flush bacteria.
                    <br />2. Pre-dip with Chlorhexidine, wait 30 sec, wipe dry.
                    <br />3. Seal teats immediately post-milking with thick antiseptic iodine drench.
                  </p>
                  <p>
                    <strong>• Foot Rot (Fusobacterium):</strong> Prevent pasture mud lock. Lead herd through a weekly footbath loaded with <span className="font-bold">5% Copper Sulfate drench</span>.
                  </p>
                </div>
              </div>
            )}

            {/* Goats Card */}
            {(selectedAnimal === 'all' || selectedAnimal === 'goats') && filterMatches(
              "Caprine Kids & Goat Husbandry", 
              ["goats", "caprine", "orf", "ccpp", "elevated", "diet", "foot rot"],
              "Vaccinating goats against CCPP, Orf viral sores, designing elevated wooden goat pens, browsing nutrition"
            ) && (
              <div className="bg-white border border-slate-205 rounded-3xl p-5 hover:shadow-md transition-all space-y-4">
                <div className="flex justify-between items-center">
                  <span className="bg-orange-50 text-orange-950 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-orange-200">
                    🐐 CAPRINE GOATS
                  </span>
                  <HelpCircle className="text-orange-700" size={16} />
                </div>
                <h3 className="text-base font-black text-slate-900">Goat Health & Raised-Floor Housing</h3>
                
                <div className="text-xs leading-relaxed text-slate-600 space-y-3">
                  <p>
                    <strong>• Housing (Elevated Slatted Flooring):</strong> Goats cannot stand damp mud. Construct elevated timber floors <span className="font-bold text-slate-900">0.8 meters high</span> with 1.5cm slats. This design allows droppings to fall through cleanly, keeping feet dry to eliminate Foot Rot.
                  </p>
                  <p>
                    <strong>• Contagious Caprine Pleuropneumonia (CCPP):</strong> Highly contagious respiratory disease. Schedule annual vaccines for the entire goat herd. Quarantine new caprine stock for 21 days first.
                  </p>
                  <p>
                    <strong>• Orf (Sore Mouth Virus):</strong> Red, bleeding crusty sores around lips and mouth. Feed soft wilted grass. Keep infected kids isolated and apply mild iodine or potassium permanganate solution directly to sores.
                  </p>
                </div>
              </div>
            )}

            {/* Calves Maternity Card */}
            {(selectedAnimal === 'all' || selectedAnimal === 'calves') && filterMatches(
              "Calf Rearing Maternity Protocols", 
              ["calves", "maternity", "colostrum", "navel", "dehorning", "castration", "burdizzo"],
              "Dynamic 10% colostrum weight within 2 hours, navel dipping with 10% iodine, electric dehorning, bloodless Burdizzo"
            ) && (
              <div className="bg-white border border-slate-205 rounded-3xl p-5 hover:shadow-md transition-all space-y-4">
                <div className="flex justify-between items-center">
                  <span className="bg-teal-50 text-teal-950 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-teal-200">
                    🍼 MATERNITY CALVES
                  </span>
                  <Award className="text-teal-700" size={16} />
                </div>
                <h3 className="text-base font-black text-slate-900">Maternity Calf Care & Management</h3>
                
                <div className="text-xs leading-relaxed text-slate-605 space-y-3">
                  <p>
                    <strong>• The 10% Colostrum Gold Standard:</strong> Within exactly <span className="font-bold text-slate-900">2 hours of birth</span>, hand-feed the calf warm colostrum equal to <span className="text-slate-950 font-extrabold text-sm font-mono">10% of its body weight</span>. Colostrum locks maternal antibodies into the calf's digestive tract before it seals.
                  </p>
                  <p>
                    <strong>• Navel Infection Prevention:</strong> Drench the hanging umbilical stem inside a cup of <span className="font-bold text-emerald-800">10% iodine solution</span> immediately post-birth. Repeat daily for 3 days to block systemic bacteria.
                  </p>
                  <p>
                    <strong>• Dehorning & Castration:</strong> Bud horns using an electric iron before 4 weeks. Perform bloodless castration using a <span className="font-bold">Burdizzo clamp</span> before 3 months of age to avoid septic infections.
                  </p>
                </div>
              </div>
            )}

            {/* Poultry Card */}
            {(selectedAnimal === 'all' || selectedAnimal === 'poultry') && filterMatches(
              "Poultry Vaccination & Litter Husbandry", 
              ["poultry", "layers", "coccidiosis", "brooder", "chicken", "vaccines", "gumboro", "amprolium"],
              "Brooder hot air settings 32-35C, Marek Newcastle Gumboro drops, damp sand coccidiosis, amprolium"
            ) && (
              <div className="bg-white border border-slate-205 rounded-3xl p-5 hover:shadow-md transition-all space-y-4">
                <div className="flex justify-between items-center">
                  <span className="bg-yellow-50 text-amber-955 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-yellow-200">
                    🐔 POULTRY FLOCK
                  </span>
                  <TrendingUp className="text-yellow-600" size={16} />
                </div>
                <h3 className="text-base font-black text-slate-900">Poultry Vaccination & Brooding</h3>
                
                <div className="text-xs leading-relaxed text-slate-600 space-y-3">
                  <p>
                    <strong>• Brooder Environmental Parameters:</strong> Day-old chicks require hover temps strictly at <span className="font-bold font-mono">32°C - 35°C</span>. Reduce by 2°C weekly. Top with clean, dry wood shaving layers; avoid fine sawdust, which triggers irreversible poultry respiratory infections.
                  </p>
                  <p>
                    <strong>• Strict Vaccination Pathway:</strong>
                    <br />• Day 1: Marek's & Infectious Bronchitis (Hatchery)
                    <br />• Week 1 & 3: Newcastle disease drops in fresh drinking water.
                    <br />• Week 2: Gumboro (Infectious Bursal Disease) vaccine.
                  </p>
                  <p>
                    <strong>• Coccidiosis Management:</strong> Look for bloody droppings or ruffled feathers. Coccidia thrives in damp conditions. Keep the waterers on raised wire racks. Treat outbreaks immediately with <span className="font-bold">Amprolium 20% Soluble powder</span> or Sulfaclozine in drinking water for 3-5 days. Ensure full 7-day withdrawal period limit.
                  </p>
                </div>
              </div>
            )}

            {/* Canine Card */}
            {(selectedAnimal === 'all' || selectedAnimal === 'canines') && filterMatches(
              "Canine Guard Dog Care & Duty Training", 
              ["canines", "dogs", "rabies", "parvovirus", "ticks", "obedience", "dhlpp"],
              "DHLPP vaccine intervals, canine parvo defense, tick-borne ehrlichia, guard training boundaries"
            ) && (
              <div className="bg-white border border-slate-205 rounded-3xl p-5 hover:shadow-md transition-all space-y-4">
                <div className="flex justify-between items-center">
                  <span className="bg-blue-50 text-blue-900 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-blue-200">
                    🐕 K-9 SECURE SECURITY
                  </span>
                  <ShieldActionIcon className="text-blue-700" />
                </div>
                <h3 className="text-base font-black text-slate-900">Canine Immunization & Duties</h3>
                
                <div className="text-xs leading-relaxed text-slate-605 space-y-3 text-left">
                  <p>
                    <strong>• Parvovirus Defense Pathway:</strong> Parvo is highly contagious and fatal. Administer canine <span className="font-bold text-slate-900">DHLPP combo shots</span> at weeks 8, 12, and 16, followed by annual boosters. Deliver rabies shots annually.
                  </p>
                  <p>
                    <strong>• Tick-Borne Illness Protection:</strong> Ehrlichia and Babesia parasites destroy canine red blood cells rapidly. Maintain Bravecto chews or weekly flumethrin washes to prevent tick bites.
                  </p>
                  <p>
                    <strong>• Guard Obedience Boundaries:</strong> K-9 units must respect commands completely and release instantly upon human trigger commands. Socialize guard dogs to differentiate roster-approved workers from strangers.
                  </p>
                </div>
              </div>
            )}

            {/* BSF Protein Card */}
            {(selectedAnimal === 'all' || selectedAnimal === 'bsf') && filterMatches(
              "Black Soldier Fly (BSF) Larval Breeding", 
              ["bsf", "larvae", "black soldier", "substrate", "protein", "organic", "poultry", "feed"],
              "Larval nursery setup, substrate C:N ratios, moisture range 60-70%, harvesting prep, bypass protein replacement"
            ) && (
              <div className="bg-white border border-slate-205 rounded-3xl p-5 hover:shadow-md transition-all space-y-4">
                <div className="flex justify-between items-center">
                  <span className="bg-emerald-50 text-emerald-950 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-emerald-200">
                    🔬 BSF PROTEIN SYSTEMS
                  </span>
                  <Layers className="text-emerald-700" size={16} />
                </div>
                <h3 className="text-base font-black text-slate-900">Black Soldier Fly Protein Production</h3>
                
                <div className="text-xs leading-relaxed text-slate-600 space-y-3">
                  <p>
                    <strong>• Hermetia illucens Larval Nursery:</strong> Setup cages for adult flies to mate and lay eggs near structural cardboard slots. Collect hatched tiny larvae and transfer them directly into organic feed waste trays.
                  </p>
                  <p>
                    <strong>• Substrate Feeding & Moisture:</strong> Feed larvae organic fruit leftovers or vegetable residues. Maintain moisture levels meticulously between <span className="font-bold text-slate-900">60% and 70%</span>. Substrates that are too dry halt larval eating, while soggy piles drown larvae.
                  </p>
                  <p>
                    <strong>• Protein Harvesting & Replacement:</strong> Harvest fat larvae after 12 to 14 days, just before they turn into dark pre-pupae. Boil and solar-dry the larvae to produce a premium insect meal containing <span className="font-bold font-mono">42% crude protein</span>. This can replace 50% of commercial fish meal in poultry and fish feed rations.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 4. INTERACTIVE SMART TOOLS TAB */}
      {activeTab === 'calculators' && (
        <div className="space-y-6 animate-fadeIn" id="calculators-section">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Tool 1: Standing Heat & AI Window Calculator */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:shadow-sm space-y-4">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Clock className="text-purple-700 font-bold animate-spin-slow" size={18} />
                AM-PM Reproductive Insemination Window Planner
              </h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Maximize heifers conception ratios. Input exact standing heat observation hours to chart the biological ovulation timing window.
              </p>

              <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                      Time Heat Observed
                    </label>
                    <input 
                      type="time" 
                      value={heatTime}
                      onChange={(e) => setHeatTime(e.target.value)}
                      className="w-full bg-white border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl font-bold font-mono focus:border-purple-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                      Observation Focus Period
                    </label>
                    <select
                      value={heatPeriod}
                      onChange={(e) => setHeatPeriod(e.target.value as any)}
                      className="w-full bg-white border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl font-bold focus:border-purple-500 outline-none cursor-pointer"
                    >
                      <option value="morning">Morning (AM Standing Mount)</option>
                      <option value="afternoon">Evening/Afternoon (PM Standing Mount)</option>
                    </select>
                  </div>
                </div>

                <div className="bg-purple-950 text-purple-100 p-4 rounded-xl space-y-2 border border-purple-800">
                  <span className="text-[10px] font-black uppercase bg-purple-800 text-white px-2 py-0.5 rounded tracking-wide">
                    👑 CRITICAL VET AI INSIGHT RECOMMENDATION
                  </span>
                  
                  <div className="text-xs leading-relaxed space-y-2">
                    {heatPeriod === 'morning' ? (
                      <div>
                        • Optimal Semen Insertion: <span className="font-extrabold text-yellow-405 block text-sm mt-0.5">Today between 3:00 PM and 9:00 PM</span>
                        • Rationale: Inseminate in the evening for morning heats. This timing ensures sperm capacitation aligns with ovulation (about 10 hours later).
                      </div>
                    ) : (
                      <div>
                        • Optimal Semen Insertion: <span className="font-extrabold text-yellow-405 block text-sm mt-0.5">Tomorrow morning before 11:30 AM</span>
                        • Rationale: Inseminate the following morning for evening heats, to ensure viable sperm meet the released ovum.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tool 2: Biogas Digester Loading Optimizer */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:shadow-sm space-y-4">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Flame className="text-amber-500 font-bold" size={18} />
                Biogas Slurry Loading & Yield Estimator
              </h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Estimate how many kilograms of fresh bovine dung and water are needed daily to generate high methane gas pressures without souring risks.
              </p>

              <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    Target Gas Generation: <strong className="text-emerald-800 font-mono font-black">{biogasVolume} m³</strong> per day
                  </label>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    step="0.5"
                    value={biogasVolume}
                    onChange={(e) => setBiogasVolume(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-850" 
                  />
                  <div className="flex justify-between text-[10px] font-bold text-slate-450 mt-1 font-mono">
                    <span>1 m³ (Single Burner)</span>
                    <span>10 m³ (Large Generator)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-xl border border-slate-150 text-center">
                    <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">Cattle Dung Required</span>
                    <span className="text-lg font-black text-slate-900 font-mono mt-1 block">{(biogasVolume * 25).toFixed(0)} KG</span>
                    <span className="text-[9px] text-slate-400 block font-semibold">Roughly {(biogasVolume * 2.5).toFixed(1)} cows</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-150 text-center">
                    <span className="text-[9px] font-black uppercase text-slate-405 block tracking-wider">Water Mix Amount</span>
                    <span className="text-lg font-black text-slate-900 font-mono mt-1 block">{(biogasVolume * 25).toFixed(0)} Liters</span>
                    <span className="text-[9px] text-slate-400 block font-semibold">1:1 Dilution standard</span>
                  </div>
                </div>

                <div className="bg-emerald-950 text-slate-100 p-3.5 rounded-xl text-xs space-y-1">
                  <span className="text-yellow-405 font-black block text-[10px] uppercase tracking-wide">🍂 Recycling Bio-slurry bypass:</span>
                  <span>This system yields approximately <strong className="font-mono text-white">{(biogasVolume * 45).toFixed(0)} L</strong> of ammoniacal premium fertilizer daily, perfect for avocado trees or Napier crops.</span>
                </div>
              </div>
            </div>

            {/* Tool 3: TMR Feed Protein Optimizer */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:shadow-sm space-y-4 md:col-span-1 lg:col-span-2">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Calculator className="text-emerald-700 font-bold" size={18} />
                Lactation Dairy CP Protein Target Estimator
              </h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Determine if your feeding mixture satisfies the Crude Protein (CP) threshold required for high-yield dairy cows versus low yield or dry cows.
              </p>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-450 block mb-1">
                      Current Cow Daily Milk Yield (Liters/day)
                    </label>
                    <input 
                      type="number"
                      value={currentMilk}
                      onChange={(e) => setCurrentMilk(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-white border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl font-bold font-mono focus:border-emerald-600 outline-none" 
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-450 block mb-1">
                      Estimated Crude Protein (CP) of Feed Mix (%)
                    </label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="range" 
                        min="10" 
                        max="22" 
                        value={currentProtein}
                        onChange={(e) => setCurrentProtein(parseInt(e.target.value))}
                        className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-700" 
                      />
                      <span className="text-xs font-black font-mono bg-white px-2.5 py-1 rounded border border-emerald-200/50 text-emerald-800">{currentProtein}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center">
                  {(() => {
                    const requiredProtein = currentMilk < 10 ? 12 : currentMilk < 20 ? 14 : currentMilk < 30 ? 16 : 18;
                    const isFading = currentProtein >= requiredProtein;
                    return (
                      <div className={`p-4 rounded-2xl border transition-all ${
                        isFading 
                          ? 'bg-emerald-50 text-emerald-950 border-emerald-200' 
                          : 'bg-rose-50 text-rose-950 border-rose-200'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className={isFading ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'} size={18} />
                          <span className="text-xs font-black uppercase tracking-tight">
                            {isFading ? 'Dietary Protein Satisfied!' : 'Protein Deficiency Alert'}
                          </span>
                        </div>
                        <div className="text-xs space-y-2 font-medium">
                          <p>
                            • A cow yielding <strong className="font-mono text-sm">{currentMilk}L</strong> requires a minimum dietary ration crude protein level of <strong className="font-sans text-sm">{requiredProtein}% CP</strong>.
                          </p>
                          <p>
                            • Your estimated diet is <strong className="font-mono text-sm">{currentProtein}% CP</strong>.
                          </p>
                          {!isFading && (
                            <p className="bg-rose-950/10 p-2.5 rounded font-black text-[10px] text-rose-900 leading-normal">
                              💡 Upgrade Advice: Incorporate high-protein bypass concentrates like cottonseed cake, sunflower meal, or brewer's dried grains to avoid milk production drops and cow mineral depletion.
                            </p>
                          )}
                          {isFading && (
                            <p className="bg-emerald-950/10 p-2.5 rounded font-black text-[10px] text-emerald-900 leading-normal">
                              🚀 Perfect! Your feed mix provides ideal nitrogen densities to foster active rumen bacteria fermentation, maximizing milk volumes.
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Tool 4: NPK & SSP Organic Planting Fertilizer Dosage Calculator */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:shadow-sm space-y-4 md:col-span-1 lg:col-span-2">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Calculator className="text-amber-600 font-bold" size={18} />
                NPK & SSP Crop Fertilizer Dosage Calculator
              </h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Determine exactly how many 50kg bags of planting and top-dressing fertilizers are required based on your target crop type and acreage.
              </p>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-450 block mb-1">
                      Target Crop Name
                    </label>
                    <select
                      value={calcCrop}
                      onChange={(e) => setCalcCrop(e.target.value)}
                      className="w-full bg-white border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl font-bold cursor-pointer focus:border-amber-500 outline-none"
                    >
                      <option value="maize">Maize Staples</option>
                      <option value="tea">Tea Highlands</option>
                      <option value="avocado">Avocado Hass/Fuerte</option>
                      <option value="banana">Banana Groves</option>
                      <option value="sorghum">Sorghum Cereal</option>
                      <option value="beans">Rotational Beans</option>
                      <option value="vegetables">Drip Vegetables</option>
                      <option value="napier">Napier Fodder grass</option>
                      <option value="eucalyptus">Eucalyptus Woodlots</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-450 block mb-1">
                      Farm Area (Acres): <strong className="text-amber-800 font-mono text-xs">{calcAcreage} Acre(s)</strong>
                    </label>
                    <input 
                      type="range" 
                      min="0.5" 
                      max="20" 
                      step="0.5"
                      value={calcAcreage}
                      onChange={(e) => setCalcAcreage(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500" 
                    />
                    <div className="flex justify-between text-[9px] font-bold text-slate-405 mt-1 font-mono">
                      <span>0.5 Acre</span>
                      <span>20 Acres</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center">
                  {(() => {
                    const data = fertilizerDb[calcCrop];
                    if (!data) return null;
                    return (
                      <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 text-slate-800 space-y-3">
                        <div className="flex items-center gap-2 border-b border-amber-200 pb-2">
                          <span className="text-base">🧪</span>
                          <span className="text-[11px] font-black uppercase tracking-wider text-amber-900">
                            Calculation results ({calcAcreage} Acre{calcAcreage !== 1 ? 's' : ''})
                          </span>
                        </div>
                        
                        <div className="text-xs space-y-2">
                          <p>
                            • <strong>Planting Requirement:</strong>
                            <span className="block font-bold text-slate-900 font-mono mt-0.5 text-xs">
                              {data.planting.includes('—') 
                                ? `${data.planting.split('—')[0]}— ${(parseFloat(data.planting.split('—')[1]) * calcAcreage).toFixed(1)} bag(s)`
                                : `${calcAcreage} crop dose volume equivalent`}
                            </span>
                          </p>
                          <p>
                            • <strong>Top-Dressing Requirement:</strong>
                            <span className="block font-bold text-slate-900 font-mono mt-0.5 text-xs">
                              {data.topDressing.includes('—') 
                                ? `${data.topDressing.split('—')[0]}— ${(parseFloat(data.topDressing.split('—')[1]) * calcAcreage).toFixed(1)} bag(s)`
                                : `${calcAcreage} crop top-dose equivalents`}
                            </span>
                          </p>
                          <div className="bg-white p-2.5 rounded-xl border border-amber-200/50 mt-2 text-[10px] text-slate-505 font-semibold leading-normal">
                            <span className="font-black text-amber-900 block mb-0.5">💡 APPLICATION SOP:</span>
                            {data.notes}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// Inline auxiliary icons to guarantee standard execution without missing imports
function ShieldActionIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      style={{ width: '16px', height: '16px' }}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}
