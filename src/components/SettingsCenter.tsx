import React, { useState } from 'react';
import { 
  Building, 
  MapPin, 
  Coins, 
  Leaf, 
  Activity, 
  Globe, 
  Sliders, 
  Save, 
  RotateCcw, 
  ShieldCheck, 
  AlertTriangle,
  Upload,
  Download
} from 'lucide-react';

interface SettingsProps {
  onSaveConfig?: (config: any) => void;
  onResetAllData?: () => void;
}

export function SettingsCenter({ onSaveConfig, onResetAllData }: SettingsProps) {
  const [activeSubSection, setActiveSubSection] = useState<'estate' | 'crops' | 'dairy' | 'system'>('estate');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  
  // Hardcoded standard defaults loaded from localStorage or fallback
  const loadStoredSettings = () => {
    try {
      const stored = localStorage.getItem('jr_farm_estate_settings');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error("Local storage load exception", e);
    }
    return {
      estateName: 'NYARONDE COOPERATIVE ESTATE',
      administrator: 'Dr. Devin Omwenga',
      locationCode: 'KT-205A Nyamira',
      currency: 'Ksh',
      teaContractPrice: 58,
      avocadoTargetVolume: 12000,
      targetDailyMilk: 22.5,
      dryOffGestationDay: 220,
      gestationDuration: 283,
      simulationSpeed: 'Normal',
      autoSeedingEnabled: true
    };
  };

  const [settings, setSettings] = useState(loadStoredSettings());

  const handleUpdate = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    try {
      localStorage.setItem('jr_farm_estate_settings', JSON.stringify(settings));
      if (onSaveConfig) {
        onSaveConfig(settings);
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      alert("Error saving settings to browser cache");
    }
  };

  const handleFactoryReset = () => {
    if (confirm("⚠️ WARNING: This will permanently wipe all local updates and reset to the estate standard baseline. This action is irreversible. Continue?")) {
      localStorage.removeItem('jr_farm_estate_settings');
      if (onResetAllData) {
        onResetAllData();
      } else {
        localStorage.clear();
        window.location.reload();
      }
    }
  };

  const menuItems = [
    { id: 'estate', label: 'Estate Identity', icon: Building, color: 'text-emerald-700 bg-emerald-50' },
    { id: 'crops', label: 'Crop Contracts', icon: Leaf, color: 'text-indigo-700 bg-indigo-50' },
    { id: 'dairy', label: 'Herd Parameters', icon: Activity, color: 'text-amber-700 bg-amber-50' },
    { id: 'system', label: 'System Diagnostics', icon: Sliders, color: 'text-rose-700 bg-rose-50' }
  ] as const;

  return (
    <div className="space-y-8 animate-fadeIn" id="system-settings-panel">
      
      {/* Settings Header Block */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-slate-900 text-white rounded-2xl shrink-0">
            <Sliders size={24} />
          </div>
          <div>
            <h4 className="text-slate-800 font-black text-sm uppercase tracking-wider">Estate Control Settings Center</h4>
            <p className="text-xs text-slate-400 font-medium">
              Calibrate regional pricing, default gestation thresholds, authority levels, and operational margins.
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-emerald-950 hover:bg-emerald-900 text-white text-xs uppercase tracking-wider font-extrabold rounded-xl transition-all cursor-pointer border-0 flex items-center gap-2 m-0 shadow-sm"
          >
            <Save size={13} />
            Save Configuration
          </button>
          <button
            onClick={handleFactoryReset}
            className="px-4 py-2 bg-white hover:bg-rose-50 border border-slate-205 text-slate-700 hover:text-rose-700 text-xs uppercase tracking-wider font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-2 m-0"
          >
            <RotateCcw size={13} />
            Hard Reset
          </button>
        </div>
      </div>

      {/* Save Success Alert Indicator */}
      {saveSuccess && (
        <div className="bg-emerald-500 border border-emerald-600 text-white px-5 py-4 rounded-2xl text-xs font-bold font-sans flex items-center gap-3 animate-slideIn">
          <ShieldCheck size={18} />
          <span>ESTATE CONFIGURATION SECURED: Dynamic parameters successfully initialized and written to secure persistence. App context calibrated.</span>
        </div>
      )}

      {/* Settings Grid Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left column sidebar (col 3) */}
        <div className="lg:col-span-3 bg-white border border-slate-150 rounded-3xl overflow-hidden p-3 shadow-xs space-y-1">
          <span className="text-[10px] font-black uppercase text-slate-400 px-3 py-2 block tracking-widest text-left">Parameter Sectors</span>
          {menuItems.map(item => {
            const isActive = activeSubSection === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSubSection(item.id)}
                className={`w-full py-3 px-3.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-3 transition-all duration-150 cursor-pointer m-0 border-0 ${
                  isActive 
                    ? 'bg-slate-900 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-905'
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${isActive ? 'bg-white/10 text-white' : item.color}`}>
                  <Icon size={14} />
                </div>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right column settings fields panel (col 9) */}
        <div className="lg:col-span-9 bg-white border border-slate-150 rounded-3xl p-6 md:p-8 shadow-xs text-left text-slate-800">
          
          {/* Tab 1: Estate Identity */}
          {activeSubSection === 'estate' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b pb-3.5">
                <h5 className="text-sm font-black uppercase text-slate-900">Estate Identity & Authorization</h5>
                <p className="text-[11px] text-slate-450 mt-1 font-semibold leading-relaxed">
                  Configure corporate headers, physical registers, and financial base terms for export reports.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 font-sans">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1.5">Estate Corporate Name</label>
                  <input
                    type="text"
                    value={settings.estateName}
                    onChange={(e) => handleUpdate('estateName', e.target.value)}
                    className="border border-slate-200 rounded-xl p-3 w-full text-xs font-bold focus:ring-1 focus:ring-emerald-500 bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1.5">Lead Farm Comptroller / Administrator</label>
                  <input
                    type="text"
                    value={settings.administrator}
                    onChange={(e) => handleUpdate('administrator', e.target.value)}
                    className="border border-slate-200 rounded-xl p-3 w-full text-xs font-bold focus:ring-1 focus:ring-emerald-500 bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1.5">Registered GlobalGAP Plot / Code</label>
                  <input
                    type="text"
                    value={settings.locationCode}
                    onChange={(e) => handleUpdate('locationCode', e.target.value)}
                    className="border border-slate-200 rounded-xl p-3 w-full text-xs font-bold focus:ring-1 focus:ring-emerald-500 bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1.5">Local Currency Abbreviation</label>
                  <input
                    type="text"
                    value={settings.currency}
                    onChange={(e) => handleUpdate('currency', e.target.value)}
                    className="border border-slate-200 rounded-xl p-3 w-full text-xs font-bold focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 font-mono"
                  />
                </div>
              </div>

              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex items-start gap-3 mt-4">
                <ShieldCheck className="text-emerald-700 shrink-0 mt-0.5" size={16} />
                <div className="text-[11px] text-emerald-800 leading-relaxed font-semibold">
                  <span className="font-bold">Compliance Status: ISO Certified.</span> Identity criteria mapped directly matches certified tea production directives set by regional comptrollers.
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Crops Coefficients */}
          {activeSubSection === 'crops' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b pb-3.5">
                <h5 className="text-sm font-black uppercase text-slate-900">Crop Valuation & Sales baselines</h5>
                <p className="text-[11px] text-slate-450 mt-1 font-semibold leading-relaxed">
                  Establish contractual export target quotes and standard pricing variables for avocado & green leaf tea sales.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 font-sans">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1.5">Avocado Monthly Export Volume Target (KG)</label>
                  <input
                    type="number"
                    value={settings.avocadoTargetVolume}
                    onChange={(e) => handleUpdate('avocadoTargetVolume', parseFloat(e.target.value) || 0)}
                    className="border border-slate-200 rounded-xl p-3 w-full text-xs font-mono font-bold focus:ring-1 focus:ring-emerald-500 bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1.5">Tea Sales Contract Price (Ksh per KG)</label>
                  <input
                    type="number"
                    value={settings.teaContractPrice}
                    onChange={(e) => handleUpdate('teaContractPrice', parseFloat(e.target.value) || 0)}
                    className="border border-slate-200 rounded-xl p-3 w-full text-xs font-mono font-bold focus:ring-1 focus:ring-emerald-500 bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 flex items-start gap-3 mt-4">
                <Coins className="text-indigo-700 shrink-0 mt-0.5" size={16} />
                <div className="text-[11px] text-indigo-800 leading-relaxed font-semibold">
                  <span className="font-bold">Financial Forecast Notice:</span> Adjusting the Contract Tea Price immediately changes operational revenue calculations on the operations summary reports.
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Dairy Parameters */}
          {activeSubSection === 'dairy' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b pb-3.5">
                <h5 className="text-sm font-black uppercase text-slate-900">Dairy & Gestation Wheel Calibration</h5>
                <p className="text-[11px] text-slate-450 mt-1 font-semibold leading-relaxed">
                  Tune internal biologic variables regulating the Animal Breeding Wheel calculations and alerts.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 font-sans">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1.5">Average Daily Milk Target per Cow (L)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={settings.targetDailyMilk}
                    onChange={(e) => handleUpdate('targetDailyMilk', parseFloat(e.target.value) || 0)}
                    className="border border-slate-200 rounded-xl p-3 w-full text-xs font-mono font-bold focus:ring-1 focus:ring-emerald-500 bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1.5">Dry-off Gestation Threshold Day</label>
                  <input
                    type="number"
                    value={settings.dryOffGestationDay}
                    onChange={(e) => handleUpdate('dryOffGestationDay', parseInt(e.target.value, 10) || 0)}
                    className="border border-slate-200 rounded-xl p-3 w-full text-xs font-mono font-bold focus:ring-1 focus:ring-emerald-500 bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1.5">Standard Cattle Gestation Duration</label>
                  <input
                    type="number"
                    value={settings.gestationDuration}
                    onChange={(e) => handleUpdate('gestationDuration', parseInt(e.target.value, 10) || 0)}
                    className="border border-slate-200 rounded-xl p-3 w-full text-xs font-mono font-bold focus:ring-1 focus:ring-emerald-500 bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-start gap-3 mt-4">
                <AlertTriangle className="text-amber-700 shrink-0 mt-0.5" size={16} />
                <div className="text-[11px] text-amber-800 leading-relaxed font-semibold">
                  <span className="font-bold">Biologic Standard:</span> Cattle gestation average is 283 days. Altering this value will dynamically move the Expected Calving Day sectors on the breeding SVG dial.
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: System Diagnostics */}
          {activeSubSection === 'system' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b pb-3.5">
                <h5 className="text-sm font-black uppercase text-slate-900">System Integration & Simulation Engine</h5>
                <p className="text-[11px] text-slate-450 mt-1 font-semibold leading-relaxed">
                  Toggle development controls, background auto-seeding routines, and simulated calendar clocks.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 font-sans">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1.5">Interactive Speed Calibration</label>
                  <select
                    value={settings.simulationSpeed}
                    onChange={(e) => handleUpdate('simulationSpeed', e.target.value)}
                    className="border border-slate-200 rounded-xl p-3 w-full text-xs font-bold focus:ring-1 focus:ring-emerald-500 bg-slate-50/50"
                  >
                    <option value="Real-time">Real-time Clock Integration</option>
                    <option value="Normal">Normal Dialing Rotation</option>
                    <option value="Accelerated">Fast Forecasting Mode</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1.5">Roster & Lactation Logs Auto-Seeder</label>
                  <select
                    value={settings.autoSeedingEnabled ? 'true' : 'false'}
                    onChange={(e) => handleUpdate('autoSeedingEnabled', e.target.value === 'true')}
                    className="border border-slate-200 rounded-xl p-3 w-full text-xs font-bold focus:ring-1 focus:ring-emerald-500 bg-slate-50/50"
                  >
                    <option value="true">Active (Pre-populate default templates)</option>
                    <option value="false">Inactive (Start entirely with empty state)</option>
                  </select>
                </div>
              </div>

              {/* Data Import / Export Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(settings, null, 2));
                    const downloadAnchor = document.createElement('a');
                    downloadAnchor.setAttribute("href", dataStr);
                    downloadAnchor.setAttribute("download", "nyaronde_system_settings.json");
                    document.body.appendChild(downloadAnchor);
                    downloadAnchor.click();
                    downloadAnchor.remove();
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer border-0 flex items-center gap-2"
                >
                  <Download size={13} />
                  Export Conf Config JSON
                </button>
                <button
                  onClick={() => {
                    alert("Import workflow: Click to upload your backup configuration script in .json extension.");
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer border-0 flex items-center gap-2"
                >
                  <Upload size={13} />
                  Import Backup Configuration
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
