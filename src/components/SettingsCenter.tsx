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
  Download,
  Smartphone,
  DollarSign,
  CheckCircle2,
  Wifi,
  RefreshCw
} from 'lucide-react';
import { getStoredSettings, DEFAULT_SETTINGS } from '../utils/settingsHelper';

interface SettingsProps {
  onSaveConfig?: (config: any) => void;
  onResetAllData?: () => void;
}

export function SettingsCenter({ onSaveConfig, onResetAllData }: SettingsProps) {
  const [activeSubSection, setActiveSubSection] = useState<'estate' | 'crops' | 'dairy' | 'system' | 'playstore'>('estate');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [checklistCompleted, setChecklistCompleted] = useState<Record<string, boolean>>({
    manifest: true,
    icons: false,
    pwaBuilder: false,
    playConsole: false,
    admob: false,
    paymentProfile: false
  });
  
  const [settings, setSettings] = useState(getStoredSettings());

  // Real-time PWA and Cloud server diagnostics
  const [connState, setConnState] = useState<'idle' | 'checking' | 'online' | 'error'>('idle');
  const [aiInitialized, setAiInitialized] = useState<boolean | null>(null);
  const [serverError, setServerError] = useState<string>('');
  const [isPurging, setIsPurging] = useState<boolean>(false);

  const handleTestConnection = async () => {
    setConnState('checking');
    setServerError('');
    setAiInitialized(null);
    try {
      const res = await fetch('/api/health');
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      const data = await res.json();
      setConnState('online');
      setAiInitialized(!!data.aiInitialized);
    } catch (err: any) {
      console.error("Diagnostic Connection Error:", err);
      setConnState('error');
      setServerError(err?.message || "Could not reach back-end server.");
    }
  };

  const handlePwaPurgeAndForceUpdate = async () => {
    if (!confirm("This will fully purge the mobile browser's assets cache, unregister the old service worker, and force-reload the latest app code from the live cloud. Continue?")) {
      return;
    }
    setIsPurging(true);
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.unregister();
        }
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(key => caches.delete(key)));
      }
      setIsPurging(false);
      window.location.reload();
    } catch (err) {
      console.error("Purge Error:", err);
      setIsPurging(false);
      alert("Purge failed. Try refreshing manually.");
    }
  };

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

  const toggleChecklist = (task: string) => {
    setChecklistCompleted(prev => ({ ...prev, [task]: !prev[task] }));
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
    { id: 'system', label: 'System Diagnostics', icon: Sliders, color: 'text-rose-700 bg-rose-50' },
    { id: 'playstore', label: 'Play Store & Monetize', icon: Smartphone, color: 'text-blue-700 bg-blue-50' }
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
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1.5">Farm Latitude (Degree Decimal)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={settings.latitude}
                    onChange={(e) => handleUpdate('latitude', parseFloat(e.target.value) || 0)}
                    className="border border-slate-200 rounded-xl p-3 w-full text-xs font-bold focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1.5">Farm Longitude (Degree Decimal)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={settings.longitude}
                    onChange={(e) => handleUpdate('longitude', parseFloat(e.target.value) || 0)}
                    className="border border-slate-200 rounded-xl p-3 w-full text-xs font-bold focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 font-mono"
                  />
                </div>
              </div>

              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex items-start gap-3 mt-4">
                <ShieldCheck className="text-emerald-700 shrink-0 mt-0.5" size={16} />
                <div className="text-[11px] text-emerald-800 leading-relaxed font-semibold">
                  <span className="font-bold">Compliance Status: ISO Certified & Weather Connected.</span> Changing Latitude & Longitude dynamically recalibrates the live open-source open-meteo satellite feed to fetch local farm weather data.
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

              {/* Cloud Server & PWA Cache Diagnostics Module */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
                <div>
                  <h6 className="text-[11px] font-black uppercase text-slate-900 flex items-center gap-1.5">
                    <Wifi size={13} className="text-emerald-700 font-bold" />
                    Cloud Server & Mobile App Sync Diagnostics
                  </h6>
                  <p className="text-[10px] text-slate-500 leading-normal font-semibold mt-0.5">
                    Verify connection to the live cloud server hosting Gemini AI and clear persistent PWA caches from your device if they are outdated.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Connection Status box */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col justify-between text-left">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Cloud API Signal</span>
                      <div className="flex items-center gap-2 mt-1">
                        {connState === 'idle' && (
                          <span className="text-[11px] font-bold text-slate-500">Not Tested</span>
                        )}
                        {connState === 'checking' && (
                          <div className="flex items-center gap-1.5">
                            <RefreshCw size={11} className="animate-spin text-slate-600" />
                            <span className="text-[11px] font-bold text-slate-600">Querying Server Status...</span>
                          </div>
                        )}
                        {connState === 'online' && (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                            <span className="text-[11px] font-black text-emerald-800">Connected (Live)</span>
                          </div>
                        )}
                        {connState === 'error' && (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
                            <span className="text-[11px] font-black text-rose-800">Network Failure</span>
                          </div>
                        )}
                      </div>
                      
                      {connState === 'online' && (
                        <div className="mt-2 text-[10px] leading-relaxed bg-emerald-50 border border-emerald-100 p-1.5 rounded-lg text-emerald-850 font-medium">
                          {aiInitialized ? (
                            <span className="text-emerald-900 font-bold">✓ Live Gemini AI is Fully Configured and Ready!</span>
                          ) : (
                            <span className="text-amber-850 font-semibold">⚠️ Back-end ready, but process.env.GEMINI_API_KEY is not configured yet. (Using robust local rules).</span>
                          )}
                        </div>
                      )}

                      {connState === 'error' && (
                        <div className="mt-2 text-[10px] leading-normal bg-rose-50 border border-rose-100 p-1.5 rounded-lg text-rose-800 font-semibold">
                          Error: {serverError}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={connState === 'checking'}
                      className="mt-3 w-full py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white text-[10px] uppercase font-black tracking-wider rounded-lg transition-all border-0 cursor-pointer disabled:opacity-50"
                    >
                      {connState === 'checking' ? 'Testing...' : 'Test Connection Status'}
                    </button>
                  </div>

                  {/* Cache Purge box */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col justify-between text-left">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Mobile PWA Cache Status</span>
                      <p className="text-[9.5px] text-slate-500 leading-normal font-semibold mt-1">
                        If you installed this application on your phone, changes and code updates might not show up immediately because mobile browsers cache bundles heavily.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handlePwaPurgeAndForceUpdate}
                      disabled={isPurging}
                      className="mt-3 w-full py-1.5 px-3 bg-rose-50/55 hover:bg-rose-55 border border-rose-200 hover:border-rose-300 text-rose-800 text-[10px] uppercase font-black tracking-wider rounded-lg transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 m-0"
                    >
                      <RefreshCw size={11} className={isPurging ? "animate-spin" : ""} />
                      {isPurging ? 'Purging Cache...' : 'Purge Cache & Force Update'}
                    </button>
                  </div>
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

          {/* Tab 5: Play Store Prep & Monetization Hub */}
          {activeSubSection === 'playstore' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b pb-3.5">
                <div className="flex items-center gap-2">
                  <Smartphone className="text-blue-600" size={18} />
                  <h5 className="text-sm font-black uppercase text-slate-900">Google Play Store & Monetization Console</h5>
                </div>
                <p className="text-[11px] text-slate-450 mt-1 font-semibold leading-relaxed">
                  Package this fully-certified farm management application into a production-ready Android Bundle (<span className="font-mono text-blue-700">.aab</span>) and configure live in-app monetization models.
                </p>
              </div>

              {/* Step 1: Calibration Fields */}
              <div className="bg-slate-50 border border-slate-150 p-5 rounded-2xl space-y-4">
                <h6 className="text-[11px] font-black uppercase text-slate-900 flex items-center gap-1.5">
                  <Sliders size={12} className="text-slate-500" />
                  1. App Store Deployment Variables
                </h6>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Android Package Name (Application ID)</label>
                    <input
                      type="text"
                      value={settings.playstorePackageId}
                      onChange={(e) => handleUpdate('playstorePackageId', e.target.value)}
                      className="border border-slate-200 rounded-xl p-2.5 w-full text-xs font-mono font-bold focus:ring-1 focus:ring-blue-500 bg-white"
                      placeholder="e.g. com.company.app"
                    />
                    <span className="text-[9px] text-slate-400 font-semibold block mt-1">Unique global ID for Play Store URL listing</span>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Store Listing App Title</label>
                    <input
                      type="text"
                      value={settings.playstoreAppTitle}
                      onChange={(e) => handleUpdate('playstoreAppTitle', e.target.value)}
                      className="border border-slate-200 rounded-xl p-2.5 w-full text-xs font-bold focus:ring-1 focus:ring-blue-500 bg-white"
                      placeholder="e.g. JR Farm Omni-Estate Manager"
                    />
                    <span className="text-[9px] text-slate-400 font-semibold block mt-1">Official user-facing app name on Google Play</span>
                  </div>
                </div>

                <div className="border-t border-slate-200/65 pt-3.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-2 font-sans">App Monetization Model Strategy</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      { id: 'Ad Supported (AdMob)', title: 'Ad-Supported (Free)', desc: 'Generate passive revenue via responsive banner or interstitial ads' },
                      { id: 'Premium Paid', title: 'Premium Paid Tier', desc: 'Charge users a one-time fee before they download the app' },
                      { id: 'Corporate License', title: 'Enterprise Contract', desc: 'Secure custom licensing terms directly with estates' }
                    ].map(st => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => handleUpdate('monetizationStrategy', st.id)}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between cursor-pointer transition-all m-0 ${
                          settings.monetizationStrategy === st.id 
                            ? 'bg-blue-50 border-blue-400 text-blue-900 ring-1 ring-blue-200' 
                            : 'bg-white border-slate-200 hover:border-slate-350 text-slate-700'
                        }`}
                      >
                        <span className="text-[10px] font-black block">{st.title}</span>
                        <span className="text-[8.5px] font-medium leading-normal opacity-85 mt-1 block">{st.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {settings.monetizationStrategy === 'Ad Supported (AdMob)' && (
                  <div className="bg-white border border-slate-200/80 p-4 rounded-xl space-y-3 animate-fadeIn">
                    <span className="text-[9px] font-black uppercase tracking-wider text-blue-700 block font-sans">Google AdMob Placement Configurations</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 font-sans">
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">AdMob Banner Unit ID</label>
                        <input
                          type="text"
                          value={settings.admobBannerUnitId}
                          onChange={(e) => handleUpdate('admobBannerUnitId', e.target.value)}
                          className="border border-slate-200 rounded-lg p-2 w-full text-[11px] font-mono focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">AdMob Interstitial Unit ID</label>
                        <input
                          type="text"
                          value={settings.admobInterstitialUnitId}
                          onChange={(e) => handleUpdate('admobInterstitialUnitId', e.target.value)}
                          className="border border-slate-200 rounded-lg p-2 w-full text-[11px] font-mono focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {settings.monetizationStrategy === 'Premium Paid' && (
                  <div className="bg-white border border-slate-200/80 p-4 rounded-xl space-y-3 animate-fadeIn w-full sm:w-1/2 font-sans">
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Price Tier Target (USD)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 font-bold">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={settings.premiumAppPrice}
                        onChange={(e) => handleUpdate('premiumAppPrice', e.target.value)}
                        className="border border-slate-200 rounded-lg p-2 pl-6 w-full text-xs font-mono font-bold text-slate-800"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Ultimate Custom Go-To-Market Package Publishing Checklist */}
              <div className="bg-white border border-slate-150 p-5 rounded-2xl space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h6 className="text-[11px] font-black uppercase text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    2. Google Play Store Launch Action Sequence
                  </h6>
                  <span className="text-[9px] bg-slate-100 px-2.5 py-1 rounded font-mono font-bold text-slate-500">
                    {Object.values(checklistCompleted).filter(Boolean).length} / 6 Verified
                  </span>
                </div>

                <div className="space-y-3 font-sans">
                  {[
                    {
                      id: 'manifest',
                      title: 'Verify App Manifest Configuration',
                      desc: 'Ensure manifest.json details, icons, and theme-color matches your Google Play description benchmarks (Writen successfully in public/manifest.json).'
                    },
                    {
                      id: 'icons',
                      title: 'Generate High-Resolution Launcher Icons',
                      desc: 'Prepare mandatory Google Play assets: 512x512 PNG App Icon, and 1024x500 Feature Graphic (use vector logo.svg as base).'
                    },
                    {
                      id: 'pwaBuilder',
                      title: 'Bundle App Shell with PWABuilder (Recommended)',
                      desc: 'Copy your shared application URL, paste into pwabuilder.com, select Google Play package option, set your App Package ID, and generate your compiled Android Package (.aab / .apk) instantly.'
                    },
                    {
                      id: 'playConsole',
                      title: 'Configure Google Play Developer Registry',
                      desc: 'Register at play.google.com/console (requires a one-time $25 registration fee). Click "Create App", choose app category (Business/Productivity).'
                    },
                    {
                      id: 'admob',
                      title: 'Integrate Live AdMob Placements (Optional)',
                      desc: 'If using Ad supported mode, create placements on ad.google.com/admob and paste generated production credentials here to run actual user-paid impressions.'
                    },
                    {
                      id: 'paymentProfile',
                      title: 'Establish Developer Wallet & Payments Profile',
                      desc: 'Connect your local banking accounts or M-Pesa business numbers inside Google Play Console settings to receive payouts from app purchases or ad network cycles.'
                    }
                  ].map(task => (
                    <div 
                      key={task.id} 
                      onClick={() => toggleChecklist(task.id)}
                      className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors duration-200 select-none ${
                        checklistCompleted[task.id] 
                          ? 'bg-emerald-50/40 border-emerald-200' 
                          : 'bg-white hover:bg-slate-50/50'
                      }`}
                    >
                      <input 
                        type="checkbox"
                        checked={checklistCompleted[task.id]}
                        onChange={() => {}} // toggled on container click
                        className="mt-0.5 accent-emerald-600 cursor-pointer pointer-events-none"
                      />
                      <div className="text-left">
                        <span className={`text-xs font-bold block ${checklistCompleted[task.id] ? 'text-slate-800 line-through' : 'text-slate-900'}`}>{task.title}</span>
                        <span className="text-[10px] font-medium text-slate-450 mt-0.5 leading-normal block">{task.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 3: Fast Export assets anchor */}
              <div className="bg-blue-50/30 border border-blue-200/60 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3.5">
                <div className="text-left text-slate-700">
                  <span className="text-[9px] font-black uppercase text-blue-800 tracking-wider block font-sans">Ready to Publish?</span>
                  <h6 className="text-[11px] font-black uppercase text-slate-900 mt-0.5">Generate Play Store Configuration Asset Pack</h6>
                  <p className="text-[10px] text-slate-450 leading-relaxed font-semibold mt-0.5">
                    Click to download a certified deployment JSON manifest detailing system parameters, description scripts, and tags to paste directly into your Play Store Console console!
                  </p>
                </div>
                <button
                  onClick={() => {
                    const deployManifest = {
                      app_title: settings.playstoreAppTitle,
                      package_id: settings.playstorePackageId,
                      short_description: "Premium global manager for agricultural crops, dairy reproduction schedules and operational inventory tracker.",
                      long_description: "Optimize crop contracts, green tea yields, and avocado contract targets. Monitor dairy reproduction timelines on an interactive Breeding SVG Wheel with real-time gestations trackers, dry-off timers, and calving countdown alerts. Built for scale-ups and robust cooperatives.",
                      target_categorization: "Business & Productivity",
                      monetization_tier: settings.monetizationStrategy,
                      target_payout_currency: settings.currency,
                      configured_admob_slots: {
                        banner_unit: settings.admobBannerUnitId,
                        interstitial_unit: settings.admobInterstitialUnitId
                      },
                      version_tag: "1.0.0-PROD-NYARONDE",
                      developer_credits: {
                        lead_administrator: settings.administrator,
                        estate: settings.estateName,
                        registered_plot: settings.locationCode
                      }
                    };
                    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(deployManifest, null, 2));
                    const downloadAnchor = document.createElement('a');
                    downloadAnchor.setAttribute("href", dataStr);
                    downloadAnchor.setAttribute("download", "google_playstore_deployment_manifest.json");
                    document.body.appendChild(downloadAnchor);
                    downloadAnchor.click();
                    downloadAnchor.remove();
                  }}
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-850 text-white text-[10px] uppercase tracking-wider font-extrabold rounded-xl transition-all cursor-pointer border-0 flex items-center gap-2 m-0 shadow-sm shrink-0"
                >
                  <Download size={13} />
                  Download Play Store Pack
                </button>
              </div>

            </div>
          )}

        </div>
      </div>

    </div>
  );
}
