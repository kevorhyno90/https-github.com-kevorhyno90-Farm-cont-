import React, { useState, useMemo } from 'react';
import {
  Phone,
  PhoneCall,
  MessageSquare,
  Send,
  AlertTriangle,
  Users,
  Clock,
  Sparkles,
  Search,
  CheckCircle2,
  Copy,
  Check,
  ShieldAlert,
  Flame,
  Droplets,
  Zap,
  Activity,
  UserCheck,
  Building2,
  Share2,
  Plus,
  Trash2
} from 'lucide-react';
import { useFarmState } from '../../context/FarmContext';
import { StaffMember } from '../../types';
import {
  openCall,
  openSms,
  openWhatsApp,
  generateMorningChoreDispatchMessage,
  generateEmergencyVetMessage,
  generateSecurityAlertMessage,
  generatePaymentSentMessage
} from '../../utils/communicationHelper';
import { getStoredSettings } from '../../utils/settingsHelper';

interface EmergencyContactItem {
  id: string;
  name: string;
  role: string;
  phone: string;
  category: 'Vet' | 'Security' | 'Machinery' | 'Agronomy' | 'Utility';
}

const DEFAULT_EMERGENCY_CONTACTS: EmergencyContactItem[] = [
  { id: 'emg-1', name: 'Dr. Karani (Vet Surgeon)', role: 'Lead Veterinarian & Artificial Insemination', phone: '+254 722 000 111', category: 'Vet' },
  { id: 'emg-2', name: 'Officer Mwangi', role: 'Local Police Post & Security Patrol', phone: '+254 733 000 222', category: 'Security' },
  { id: 'emg-3', name: 'KPLC Emergency Desk', role: 'Kenya Power Faults & Line Outages', phone: '+254 703 070 707', category: 'Utility' },
  { id: 'emg-4', name: 'Peter (Borehole Technician)', role: 'Water Pumps & Solar Inverter Repair', phone: '+254 711 555 444', category: 'Utility' },
  { id: 'emg-5', name: 'Macharia (Lead Mechanic)', role: 'Tractor, Chaffcutter & Workshop Overhaul', phone: '+254 722 999 888', category: 'Machinery' },
  { id: 'emg-6', name: 'KTDA Field Officer (Chinga)', role: 'Green Leaf Transport & Buying Centre Logistics', phone: '+254 700 888 777', category: 'Agronomy' }
];

export function FarmCommunicationsCenter() {
  const { staffList, todos, milkRecords, farmNotes } = useFarmState();
  const settings = getStoredSettings();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'dispatch' | 'emergency' | 'composer' | 'directory'>('dispatch');

  // Morning Dispatch State
  const [selectedStaffId, setSelectedStaffId] = useState<string>(staffList.length > 0 ? staffList[0].id : '');
  const [unitFilter, setUnitFilter] = useState<string>('all');
  const [customPriorityText, setCustomPriorityText] = useState('');
  const [customPriorities, setCustomPriorities] = useState<string[]>([
    'Verify clean drinking water and check mineral blocks',
    'Report any cow showing signs of standing heat or mastitis',
    'Ensure all tools are disinfected and stored before shift change'
  ]);
  const [copiedChoreFeedback, setCopiedChoreFeedback] = useState(false);

  // Quick Composer State
  const [composerPhone, setComposerPhone] = useState(staffList.length > 0 ? staffList[0].phone : '');
  const [composerRecipientName, setComposerRecipientName] = useState(staffList.length > 0 ? staffList[0].name : '');
  const [composerMessage, setComposerMessage] = useState(
    `Hello! This is a brief update from ${settings.estateName || 'JR Farm'}. Please check in at your station.`
  );
  const [copiedComposerFeedback, setCopiedComposerFeedback] = useState(false);

  // Emergency Tab State
  const [emergencyCowTag, setEmergencyCowTag] = useState('C-083');
  const [emergencySymptoms, setEmergencySymptoms] = useState('Bloat / rumen distension with rapid shallow breathing');
  const [emergencyUrgency, setEmergencyUrgency] = useState<'Critical' | 'High' | 'Routine'>('Critical');
  const [emergencyVetPhone, setEmergencyVetPhone] = useState('+254 722 000 111');
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContactItem[]>(() => {
    try {
      const saved = localStorage.getItem('jr_farm_custom_emergency_contacts');
      return saved ? JSON.parse(saved) : DEFAULT_EMERGENCY_CONTACTS;
    } catch {
      return DEFAULT_EMERGENCY_CONTACTS;
    }
  });

  // Directory Search
  const [directorySearch, setDirectorySearch] = useState('');

  // Save emergency contacts
  const saveEmergencyContacts = (list: EmergencyContactItem[]) => {
    setEmergencyContacts(list);
    try {
      localStorage.setItem('jr_farm_custom_emergency_contacts', JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }
  };

  // Selected staff member
  const currentStaff = useMemo(() => {
    return staffList.find(s => s.id === selectedStaffId) || (staffList.length > 0 ? staffList[0] : null);
  }, [staffList, selectedStaffId]);

  // Filtered staff list by unit
  const filteredStaff = useMemo(() => {
    if (unitFilter === 'all') return staffList;
    return staffList.filter(s => s.unit === unitFilter);
  }, [staffList, unitFilter]);

  // Generated morning dispatch message
  const choreDispatchMessage = useMemo(() => {
    if (!currentStaff) return '';
    return generateMorningChoreDispatchMessage(currentStaff, {
      customChores: customPriorities
    });
  }, [currentStaff, customPriorities]);

  // Generated Emergency Vet Message
  const emergencyVetMessage = useMemo(() => {
    return generateEmergencyVetMessage({
      cowTag: emergencyCowTag,
      symptoms: emergencySymptoms,
      urgency: emergencyUrgency
    });
  }, [emergencyCowTag, emergencySymptoms, emergencyUrgency]);

  // Add custom chore priority
  const handleAddCustomPriority = () => {
    if (!customPriorityText.trim()) return;
    setCustomPriorities(prev => [...prev, customPriorityText.trim()]);
    setCustomPriorityText('');
  };

  const handleRemoveCustomPriority = (index: number) => {
    setCustomPriorities(prev => prev.filter((_, i) => i !== index));
  };

  // Quick template selection in composer
  const applyQuickTemplate = (templateType: 'morning' | 'milking' | 'payment' | 'urgent' | 'spray') => {
    const name = composerRecipientName || 'Team Member';
    const farmName = settings.estateName || 'JR Farm';

    switch (templateType) {
      case 'morning':
        setComposerMessage(`☀️ Good morning ${name}, please report to your assigned station on time today. Remember to follow biosecurity protocols and check your shift chores.`);
        break;
      case 'milking':
        setComposerMessage(`🥛 Milking Update: Morning yield recorded successfully. Herdsman, ensure all teat dip cups are refilled and animal troughs cleaned.`);
        break;
      case 'payment':
        setComposerMessage(generatePaymentSentMessage({ staffName: name, amount: 4500, period: 'this week' }));
        break;
      case 'urgent':
        setComposerMessage(`🚨 URGENT NOTICE from ${farmName}: All team leads please report to the main office immediately or call the farm manager.`);
        break;
      case 'spray':
        setComposerMessage(`🌿 Agrochemical Safety: Spraying scheduled today. Mandatory Pre-Harvest Interval (PHI) active. Wear full chemical PPE gear.`);
        break;
    }
  };

  // Directory filtered list
  const filteredDirectory = useMemo(() => {
    const q = directorySearch.toLowerCase().trim();
    if (!q) return staffList;
    return staffList.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.role.toLowerCase().includes(q) ||
      s.unit.toLowerCase().includes(q) ||
      (s.phone || '').includes(q)
    );
  }, [staffList, directorySearch]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-3 sm:p-6 lg:p-8 flex flex-col gap-6 font-sans">
      {/* Top Banner / Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-black uppercase tracking-wider mb-3">
            <PhoneCall size={13} className="text-blue-400" />
            <span>Farm Communications & Instant Dispatch</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-2">
            Field Dispatch, SMS & Direct Calls
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            One-tap WhatsApp chore dispatch, instant SMS notifications, and direct phone calling for supervisors, herdsmen, veterinarians, and emergency security.
          </p>
        </div>

        {/* Quick Stats / Action Pills */}
        <div className="relative z-10 flex flex-wrap gap-2.5 sm:gap-3 shrink-0">
          <div className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-3 rounded-2xl flex items-center gap-3">
            <Users size={24} className="text-blue-400" />
            <div>
              <div className="text-xs text-slate-300 font-bold">Total Staff</div>
              <div className="text-lg font-black text-white">{staffList.length} Members</div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-3 rounded-2xl flex items-center gap-3">
            <Activity size={24} className="text-emerald-400" />
            <div>
              <div className="text-xs text-slate-300 font-bold">On-Duty Today</div>
              <div className="text-lg font-black text-white">
                {staffList.filter(s => s.status === 'Present').length} Active
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('dispatch')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer border-0 m-0 ${
            activeTab === 'dispatch'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <Clock size={16} />
          <span>🌅 Morning Chore Dispatch</span>
        </button>

        <button
          onClick={() => setActiveTab('emergency')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer border-0 m-0 ${
            activeTab === 'emergency'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20 animate-pulse'
              : 'bg-white hover:bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          <AlertTriangle size={16} />
          <span>🚨 Emergency & Vet Alerts</span>
        </button>

        <button
          onClick={() => setActiveTab('composer')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer border-0 m-0 ${
            activeTab === 'composer'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <MessageSquare size={16} />
          <span>💬 Quick SMS & Call Dialpad</span>
        </button>

        <button
          onClick={() => setActiveTab('directory')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer border-0 m-0 ${
            activeTab === 'directory'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <UserCheck size={16} />
          <span>📇 Farm Contacts & Speed Dial</span>
        </button>
      </div>

      {/* TAB 1: MORNING CHORE & DUTY DISPATCH */}
      {activeTab === 'dispatch' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Staff Picker & Custom Chores */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Unit Filter */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <Users size={16} className="text-blue-600" />
                  Select Staff Member
                </h3>
                <span className="text-xs font-bold text-slate-400">
                  {filteredStaff.length} available
                </span>
              </div>

              {/* Unit Tabs */}
              <div className="flex flex-wrap gap-1.5">
                {(['all', 'Dairy', 'Horti', 'Fields', 'Security', 'General'] as const).map(u => (
                  <button
                    key={u}
                    onClick={() => setUnitFilter(u)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border m-0 ${
                      unitFilter === u
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    {u === 'all' ? 'All Units' : u}
                  </button>
                ))}
              </div>

              {/* Staff Cards List */}
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 space-y-1 pr-1">
                {filteredStaff.map(st => {
                  const isSelected = selectedStaffId === st.id;
                  return (
                    <div
                      key={st.id}
                      onClick={() => setSelectedStaffId(st.id)}
                      className={`p-3 rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-blue-50 border-2 border-blue-500 shadow-xs'
                          : 'hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold text-slate-900 truncate">
                            {st.name}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            {st.unit}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 truncate mt-0.5">
                          {st.role} • <span className="font-mono">{st.phone}</span>
                        </div>
                      </div>

                      {/* Direct Quick Dial Icon */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openCall(st.phone);
                        }}
                        className="p-2 rounded-xl bg-white hover:bg-emerald-50 text-emerald-600 border border-slate-200 hover:border-emerald-300 cursor-pointer shadow-2xs transition-all shrink-0"
                        title={`Call ${st.name} directly`}
                      >
                        <Phone size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom Priorities for Today */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <Sparkles size={16} className="text-amber-500" />
                Today's Priority Chore Items
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Add specific duties to include in this staff member's morning dispatch message:
              </p>

              <div className="space-y-2">
                {customPriorities.map((item, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                    <span className="font-bold text-slate-400 font-mono w-4">{idx + 1}.</span>
                    <span className="flex-1 font-medium">{item}</span>
                    <button
                      onClick={() => handleRemoveCustomPriority(idx)}
                      className="text-slate-400 hover:text-rose-600 border-0 bg-transparent cursor-pointer p-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Chore Input */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={customPriorityText}
                  onChange={e => setCustomPriorityText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomPriority();
                    }
                  }}
                  placeholder="e.g. Inspect Block 1 drip lines, top up salt lick..."
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-hidden focus:bg-white focus:border-blue-500"
                />
                <button
                  onClick={handleAddCustomPriority}
                  disabled={!customPriorityText.trim()}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl cursor-pointer disabled:cursor-not-allowed border-0"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Message Preview & 1-Click Dispatch Buttons */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-full">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Dispatched Message Preview
                    </h3>
                    <p className="text-xs text-slate-400">
                      Target: <span className="font-bold text-slate-700">{currentStaff?.name}</span> ({currentStaff?.phone})
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(choreDispatchMessage);
                      setCopiedChoreFeedback(true);
                      setTimeout(() => setCopiedChoreFeedback(false), 2000);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer border-0"
                  >
                    {copiedChoreFeedback ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                    <span>{copiedChoreFeedback ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {/* Simulated Chat Bubble Preview */}
                <div className="bg-emerald-950/5 border border-emerald-900/10 rounded-2xl p-5 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed shadow-inner">
                  {choreDispatchMessage}
                </div>
              </div>

              {/* Action Buttons: WhatsApp, SMS, Call */}
              <div className="pt-6 border-t border-slate-100 mt-6 flex flex-col sm:flex-row items-center gap-3">
                {/* 1. WhatsApp Button */}
                <button
                  onClick={() => {
                    if (currentStaff?.phone) {
                      openWhatsApp(currentStaff.phone, choreDispatchMessage);
                    }
                  }}
                  className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-emerald-600/20 active:scale-95 border-0"
                >
                  <Share2 size={16} />
                  <span>Send via WhatsApp</span>
                </button>

                {/* 2. Direct SMS Button */}
                <button
                  onClick={() => {
                    if (currentStaff?.phone) {
                      openSms(currentStaff.phone, choreDispatchMessage);
                    }
                  }}
                  className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-blue-600/20 active:scale-95 border-0"
                >
                  <MessageSquare size={16} />
                  <span>Send via SMS</span>
                </button>

                {/* 3. Direct Phone Call Button */}
                <button
                  onClick={() => {
                    if (currentStaff?.phone) {
                      openCall(currentStaff.phone);
                    }
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95 border-0"
                  title="Call staff directly"
                >
                  <PhoneCall size={16} className="text-emerald-400" />
                  <span>Call Phone</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EMERGENCY & VET DISPATCH */}
      {activeTab === 'emergency' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Emergency Presets */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* 1. Veterinary Urgent Clinic Dispatch */}
            <div className="bg-white border-2 border-rose-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-rose-100 pb-3">
                <div className="flex items-center gap-2 text-rose-700">
                  <ShieldAlert size={20} className="text-rose-600" />
                  <h3 className="text-base font-black text-slate-900">
                    🐄 Urgent Veterinary Medical Alert
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black uppercase tracking-wider">
                  Priority 1
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Animal Tag / ID</label>
                  <input
                    type="text"
                    value={emergencyCowTag}
                    onChange={e => setEmergencyCowTag(e.target.value)}
                    placeholder="e.g. C-083 (Precious)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-hidden focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Veterinarian Phone Number</label>
                  <input
                    type="text"
                    value={emergencyVetPhone}
                    onChange={e => setEmergencyVetPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 outline-hidden focus:border-rose-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Observed Symptoms / Condition</label>
                  <textarea
                    rows={2}
                    value={emergencySymptoms}
                    onChange={e => setEmergencySymptoms(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-hidden focus:border-rose-500 resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => openCall(emergencyVetPhone)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-rose-600/30 active:scale-95 border-0"
                >
                  <PhoneCall size={16} />
                  <span>Call Vet Now</span>
                </button>

                <button
                  onClick={() => openSms(emergencyVetPhone, emergencyVetMessage)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95 border-0"
                >
                  <MessageSquare size={16} />
                  <span>Send Vet SMS</span>
                </button>

                <button
                  onClick={() => openWhatsApp(emergencyVetPhone, emergencyVetMessage)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-emerald-600/20 active:scale-95 border-0"
                >
                  <Share2 size={16} />
                  <span>WhatsApp Vet</span>
                </button>
              </div>
            </div>

            {/* 2. Security & Boundary Alarm */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-amber-700">
                  <ShieldAlert size={20} className="text-amber-600" />
                  <h3 className="text-base font-black text-slate-900">
                    🛡️ Farm Security & Boundary Alert
                  </h3>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Immediately trigger a call or SMS to the night watchman, farm security team, and nearest police desk:
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => openCall('+254 733 000 222')}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95 border-0"
                >
                  <PhoneCall size={15} />
                  <span>Call Security Lead</span>
                </button>

                <button
                  onClick={() => openSms('+254 733 000 222', generateSecurityAlertMessage({ incident: 'Perimeter alarm triggered at Block 2 boundary' }))}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95 border-0"
                >
                  <MessageSquare size={15} />
                  <span>Broadcast Security SMS</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Emergency Speed-Dial Contacts Directory */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <PhoneCall size={16} className="text-rose-600" />
                Emergency Speed-Dial Contacts
              </h3>

              <div className="space-y-2.5">
                {emergencyContacts.map(contact => (
                  <div key={contact.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-900 truncate">{contact.name}</div>
                      <div className="text-[11px] text-slate-500 truncate">{contact.role}</div>
                      <div className="font-mono text-[10px] text-blue-700 font-bold mt-0.5">{contact.phone}</div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => openCall(contact.phone)}
                        className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs border-0"
                        title="Call"
                      >
                        <Phone size={13} />
                      </button>
                      <button
                        onClick={() => openSms(contact.phone, `Urgent alert from ${settings.estateName || 'JR Farm'}: Please call the farm manager immediately.`)}
                        className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-xs border-0"
                        title="SMS"
                      >
                        <MessageSquare size={13} />
                      </button>
                      <button
                        onClick={() => openWhatsApp(contact.phone, `Hello ${contact.name}, this is an urgent notification from ${settings.estateName || 'JR Farm'}. Please respond.`)}
                        className="p-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer shadow-xs border-0"
                        title="WhatsApp"
                      >
                        <Share2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: QUICK SMS & CALL DIALPAD / COMPOSER */}
      {activeTab === 'composer' && (
        <div className="max-w-3xl w-full mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Quick SMS & Call Message Composer
            </h2>
            <p className="text-xs text-slate-500">
              Compose custom SMS or WhatsApp messages with live character counts, or call any phone number directly.
            </p>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider shrink-0">
              Templates:
            </span>
            <button
              onClick={() => applyQuickTemplate('morning')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold border border-slate-200 transition-all cursor-pointer shrink-0"
            >
              ☀️ Morning Chore
            </button>
            <button
              onClick={() => applyQuickTemplate('milking')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold border border-slate-200 transition-all cursor-pointer shrink-0"
            >
              🥛 Milking Notice
            </button>
            <button
              onClick={() => applyQuickTemplate('payment')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold border border-slate-200 transition-all cursor-pointer shrink-0"
            >
              💰 Wages Sent
            </button>
            <button
              onClick={() => applyQuickTemplate('urgent')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold border border-slate-200 transition-all cursor-pointer shrink-0"
            >
              🚨 Urgent Call-in
            </button>
            <button
              onClick={() => applyQuickTemplate('spray')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-bold border border-slate-200 transition-all cursor-pointer shrink-0"
            >
              🌿 Spraying PHI
            </button>
          </div>

          {/* Recipient Selector / Custom Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Pick from Farm Staff</label>
              <select
                onChange={e => {
                  const st = staffList.find(s => s.id === e.target.value);
                  if (st) {
                    setComposerPhone(st.phone);
                    setComposerRecipientName(st.name);
                  }
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold outline-hidden cursor-pointer"
              >
                <option value="">-- Choose Employee --</option>
                {staffList.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.role} - {s.phone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Or Direct Phone Number (+254...)</label>
              <input
                type="text"
                value={composerPhone}
                onChange={e => setComposerPhone(e.target.value)}
                placeholder="+254 7..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 font-bold outline-hidden"
              />
            </div>
          </div>

          {/* Message Textarea with Live SMS Character Count */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-700">Message Content</label>
              <span className="text-[11px] font-mono text-slate-400">
                {composerMessage.length} chars (
                {Math.ceil(composerMessage.length / 160) || 1} SMS segment
                {Math.ceil(composerMessage.length / 160) > 1 ? 's' : ''})
              </span>
            </div>
            <textarea
              rows={5}
              value={composerMessage}
              onChange={e => setComposerMessage(e.target.value)}
              placeholder="Type your SMS or WhatsApp message here..."
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 leading-relaxed outline-hidden focus:bg-white focus:border-blue-500 shadow-inner"
            />
          </div>

          {/* Actions: Send SMS, Send WhatsApp, Direct Call */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={() => openSms(composerPhone, composerMessage)}
              disabled={!composerPhone}
              className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-blue-600/20 active:scale-95 border-0"
            >
              <MessageSquare size={16} />
              <span>Send SMS</span>
            </button>

            <button
              onClick={() => openWhatsApp(composerPhone, composerMessage)}
              disabled={!composerPhone}
              className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-emerald-600/20 active:scale-95 border-0"
            >
              <Share2 size={16} />
              <span>Send WhatsApp</span>
            </button>

            <button
              onClick={() => openCall(composerPhone)}
              disabled={!composerPhone}
              className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95 border-0"
            >
              <PhoneCall size={16} className="text-emerald-400" />
              <span>Call Directly</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: FARM CONTACTS & SPEED DIAL DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Farm Employee & Speed Dial Directory
              </h2>
              <p className="text-xs text-slate-500">
                Direct one-touch phone calling, SMS, and WhatsApp across all team units.
              </p>
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-72">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={directorySearch}
                onChange={e => setDirectorySearch(e.target.value)}
                placeholder="Search staff, role, phone..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-hidden focus:bg-white focus:border-blue-500"
              />
            </div>
          </div>

          {/* Directory Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDirectory.map(st => (
              <div
                key={st.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-sm font-extrabold text-slate-900 truncate">
                      {st.name}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      st.status === 'Present'
                        ? 'bg-emerald-100 text-emerald-800'
                        : st.status === 'Off'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {st.status}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-slate-600">
                    {st.role}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Unit: <span className="font-bold text-slate-600">{st.unit}</span>
                    {st.assignedStation ? ` • Station: ${st.assignedStation}` : ''}
                  </div>

                  <div className="font-mono text-xs font-black text-slate-800 mt-2">
                    {st.phone || 'No phone recorded'}
                  </div>

                  {st.emergencyContactPhone && (
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Emergency: {st.emergencyContactPhone} ({st.emergencyContactName || 'Next of kin'})
                    </div>
                  )}
                </div>

                {/* Direct Action Buttons */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60">
                  <button
                    onClick={() => openCall(st.phone)}
                    disabled={!st.phone}
                    className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-white hover:bg-emerald-50 text-emerald-700 border border-slate-200 hover:border-emerald-300 font-bold text-xs transition-all cursor-pointer shadow-2xs disabled:opacity-40"
                    title={`Call ${st.name}`}
                  >
                    <Phone size={13} />
                    <span>Call</span>
                  </button>

                  <button
                    onClick={() => openSms(st.phone, `Hello ${st.name}, please contact the farm office.`)}
                    disabled={!st.phone}
                    className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-white hover:bg-blue-50 text-blue-700 border border-slate-200 hover:border-blue-300 font-bold text-xs transition-all cursor-pointer shadow-2xs disabled:opacity-40"
                    title={`SMS ${st.name}`}
                  >
                    <MessageSquare size={13} />
                    <span>SMS</span>
                  </button>

                  <button
                    onClick={() => openWhatsApp(st.phone, `Hello ${st.name}, this is ${settings.estateName || 'JR Farm'}.`)}
                    disabled={!st.phone}
                    className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-white hover:bg-emerald-50 text-emerald-700 border border-slate-200 hover:border-emerald-300 font-bold text-xs transition-all cursor-pointer shadow-2xs disabled:opacity-40"
                    title={`WhatsApp ${st.name}`}
                  >
                    <Share2 size={13} />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FarmCommunicationsCenter;
