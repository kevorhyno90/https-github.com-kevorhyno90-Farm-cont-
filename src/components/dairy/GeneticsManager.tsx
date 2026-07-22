import React, { useState } from 'react';
import { Cow, AIRecord } from '../../types';
import { toIsoDate } from '../../utils/dateHelper';
import { jsPDF } from 'jspdf';
import { Download, Printer, Sparkles, X, Award } from 'lucide-react';

interface GeneticsManagerProps {
  cows: Cow[];
  aiRecords: AIRecord[];
  getAverageYield: (tag: string) => number;
  getCowAge: (dob: string) => string;
  onTriggerSectionReport?: (sectionKey: string) => void;
  onGoToSubTab: (tab: string) => void;
  onUpdateCowStatus: (id: string, status: Cow['status'], additionalData?: Partial<Cow>) => void;
}

export default function GeneticsManager({
  cows,
  aiRecords,
  getAverageYield,
  getCowAge,
  onTriggerSectionReport,
  onGoToSubTab,
  onUpdateCowStatus
}: GeneticsManagerProps) {

 const [selectedWheelCow, setSelectedWheelCow] = useState<string>('');
 const [simulatedDate, setSimulatedDate] = useState<string>(toIsoDate());
 const [wheelHoveredMonth, setWheelHoveredMonth] = useState<number | null>(null);
 const [pedigreeCow, setPedigreeCow] = useState<Cow | null>(null);
 const [pedigreeSubTab, setPedigreeSubTab] = useState<'tree' | 'offspring' | 'genetics'>('tree');
 const [selectedMateId, setSelectedMateId] = useState<string>('');

 const handleDownloadPedigree = async (cow: Cow) => {
 const certificateHtml = `<!DOCTYPE html>
<html>
<head>
 <meta charset="utf-8">
 <title>Sovereign Pedigree Ledger - \${cow.name} (\${cow.id})</title>
 <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
 <style>
 body {
 font-family: 'Space Grotesk', sans-serif;
 margin: 0;
 padding: 50px;
 background: #fafaf9;
 color: #1c1917;
 }
 .cert-container {
 background: #ffffff;
 border: 12px double #064e3b;
 padding: 50px;
 max-width: 950px;
 margin: 0 auto;
 border-radius: 4px;
 box-shadow: 0 10px 40px rgba(0,0,0,0.03);
 }
 .top-banner {
 text-align: center;
 border-bottom: 4px double #064e3b;
 padding-bottom: 24px;
 margin-bottom: 35px;
 }
 .top-banner h1 {
 font-size: 32px;
 font-weight: 700;
 color: #064e3b;
 margin: 0 0 6px 0;
 letter-spacing: -0.5px;
 }
 .top-banner p {
 font-size: 11px;
 letter-spacing: 2px;
 text-transform: ;
 font-weight: 700;
 color: #78716c;
 margin: 0;
 }
 .badge-bar {
 display: grid;
 grid-template-columns: repeat(3, 1fr);
 gap: 16px;
 margin-bottom: 40px;
 }
 .b-cell {
 background: #f0fdf4;
 border: 1px solid #dcfce7;
 padding: 14px;
 border-radius: 8px;
 }
 .b-title {
 font-size: 10px;
 font-weight: 700;
 text-transform: ;
 color: #166534;
 display: block;
 margin-bottom: 4px;
 }
 .b-val {
 font-size: 14px;
 font-weight: 700;
 color: #1c1917;
 }
 .tree-grid {
 display: grid;
 grid-template-columns: 1fr 1fr 1fr;
 gap: 20px;
 position: relative;
 }
 .generation-col {
 display: flex;
 flex-direction: column;
 justify-content: space-around;
 gap: 30px;
 }
 .tree-box {
 background: #ffffff;
 border: 1px solid #e7e5e4;
 padding: 14px;
 border-radius: 8px;
 box-shadow: 0 2px 4px rgba(0,0,0,0.02);
 }
 .tree-box.proband {
 border: 2px solid #059669;
 background: #f0fdf4;
 }
 .tree-box.male {
 border-left: 5px solid #2563eb;
 }
 .tree-box.female {
 border-left: 5px solid #db2777;
 }
 .box-role {
 font-size: 8px;
 font-weight: 700;
 text-transform: ;
 color: #78716c;
 display: block;
 margin-bottom: 4px;
 }
 .box-role.sire-col { color: #2563eb; }
 .box-role.dam-col { color: #db2777; }
 .box-name {
 font-size: 13px;
 font-weight: 700;
 color: #0f172a;
 }
 .box-details {
 font-size: 10px;
 color: #78716c;
 display: block;
 margin-top: 4px;
 }
 .foot-seals {
 margin-top: 60px;
 border-top: 2px dashed #e7e5e4;
 padding-top: 40px;
 display: flex;
 justify-content: space-between;
 align-items: flex-end;
 }
 .official-seal {
 width: 140px;
 height: 140px;
 border: 4px double #15803d;
 border-radius: 50%;
 display: flex;
 flex-direction: column;
 align-items: center;
 justify-content: center;
 font-size: 9px;
 font-weight: 700;
 color: #15803d;
 text-align: center;
 transform: rotate(-8deg);
 }
 .seal-star {
 font-size: 14px;
 color: #b45309;
 margin: 4px 0;
 }
 .seal-text {
 text-transform: ;
 letter-spacing: 1px;
 }
 .signature-area {
 text-align: center;
 }
 .signature-line {
 border-top: 1.5px solid #1c1917;
 width: 220px;
 margin-bottom: 6px;
 }
 .signature-title {
 font-size: 10px;
 text-transform: ;
 font-weight: 700;
 letter-spacing: 1px;
 color: #78716c;
 }
 </style>
</head>
<body>
 <div class="cert-container">
 <div class="top-banner">
 <h1>JR Farm Cooperative Estate</h1>
 <p>Official Certified Sovereign Lineage & Pedigree Deed</p>
 </div>

 <div class="badge-bar">
 <div class="b-cell">
 <span class="b-title">Registered Proband</span>
 <span class="b-val">\${cow.name}</span>
 </div>
 <div class="b-cell">
 <span class="b-title">State Catalog ID</span>
 <span class="b-val">\${cow.id}</span>
 </div>
 <div class="b-cell">
 <span class="b-title">Studbook Registration #</span>
 <span class="b-val font-mono">\${cow.registrationNo || 'KAG-UNREG-SEED'}</span>
 </div>
 </div>

 <div class="tree-grid">
 <!-- GEN 1: PROBAND -->
 <div class="generation-col">
 <div class="tree-box proband">
 <span class="box-role" style="color: #047857;">Registered Proband</span>
 <span class="box-name">\${cow.name}</span>
 <span class="box-details">Breed: \${cow.breed} | DOB: \${cow.dob}</span>
 </div>
 </div>

 <!-- GEN 2: PARENTS -->
 <div class="generation-col">
 <div class="tree-box male">
 <span class="box-role sire-col">Sire (Father ♂)</span>
 <span class="box-name">\${cow.sire || 'Imported Semen Specimen'}</span>
 <span class="box-details">Pureblood Registered Seed Straw</span>
 </div>
 <div class="tree-box female">
 <span class="box-role dam-col">Dam (Mother ♀)</span>
 <span class="box-name">\${cow.dam || 'Acr-Grade Sire Maternal'}</span>
 <span class="box-details">Registered Dam Herd Registry</span>
 </div>
 </div>

 <!-- GEN 3: GRANDPARENTS -->
 <div class="generation-col">
 <div class="tree-box male" style="padding: 10px;">
 <span class="box-role" style="color: #2563eb;">Paternal Grand Sire</span>
 <span class="box-name" style="font-size: 11px;">\${cow.grandSirePaternal || 'Sire Line G2 ♂'}</span>
 </div>
 <div class="tree-box female" style="padding: 10px;">
 <span class="box-role" style="color: #db2777;">Paternal Grand Dam</span>
 <span class="box-name" style="font-size: 11px;">\${cow.grandDamPaternal || 'Sire Line G2 ♀'}</span>
 </div>
 <div class="tree-box male" style="padding: 10px;">
 <span class="box-role" style="color: #2563eb;">Maternal Grand Sire</span>
 <span class="box-name" style="font-size: 11px;">\${cow.grandSireMaternal || 'Dam Line G2 ♂'}</span>
 </div>
 <div class="tree-box female" style="padding: 10px;">
 <span class="box-role" style="color: #db2777;">Maternal Grand Dam</span>
 <span class="box-name" style="font-size: 11px;">\${cow.grandDamMaternal || 'Dam Line G2 ♀'}</span>
 </div>
 </div>
 </div>

 <div class="foot-seals">
 <div>
 <p style="font-size: 10px; color: #78716c; margin: 0 0 4px 0; text-transform: ; font-weight: 700;">Certificate Authenticity ID</p>
 <span style="font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700;">JR-BLOOD-\${cow.id.replace(/\\s+/g, '')}-\${Date.now().toString().slice(-6)}</span>
 </div>
 
 <div class="official-seal">
 <span class="seal-text">JR FARM COOP</span>
 <span class="seal-star">★★★★★</span>
 <span class="seal-text">OFFICIAL REGISTER</span>
 </div>

 <div class="signature-area">
 <div class="signature-line"></div>
 <span class="signature-title">Veterinary Scribe</span>
 </div>
 </div>
 </div>
</body>
</html>`;
 const loadScript = (url: string) => {
 return new Promise<void>((resolve, reject) => {
 const script = document.createElement('script');
 script.src = url;
 script.onload = () => resolve();
 script.onerror = () => reject(new Error(`Failed to load ${url}`));
 document.head.appendChild(script);
 });
 };

 try {
 if (!(window as any).html2pdf) {
 await loadScript("/html2pdf.bundle.min.js");
 }

 const tempDiv = document.createElement('div');
 tempDiv.innerHTML = certificateHtml;
 document.body.appendChild(tempDiv);

 const opt = {
 margin: [0.3, 0.3, 0.3, 0.3],
 filename: `pedigree_${cow.name.toLowerCase()}_${cow.id.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.pdf`,
 image: { type: 'jpeg', quality: 0.98 },
 html2canvas: { scale: 2, useCORS: true, letterRendering: true, logging: false },
 jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
 };

 await (window as any).html2pdf().set(opt).from(tempDiv).save();
 document.body.removeChild(tempDiv);
 } catch (err) {
 console.error("PDF generation failed, falling back to HTML download:", err);
 const blob = new Blob([certificateHtml], { type: 'text/html' });
 const url = URL.createObjectURL(blob);
 const link = document.createElement('a');
 link.href = url;
 link.download = `pedigree_${cow.name.toLowerCase()}_${cow.id.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.html`;
 link.click();
 URL.revokeObjectURL(url);
 }
 };

  return (
    <>
 {(() => {
 // 12 Months layout setup
 const monthsList = [
 { name: 'JAN', days: 31, offset: 0 },
 { name: 'FEB', days: 28, offset: 31 },
 { name: 'MAR', days: 31, offset: 59 },
 { name: 'APR', days: 30, offset: 90 },
 { name: 'MAY', days: 31, offset: 120 },
 { name: 'JUN', days: 30, offset: 151 },
 { name: 'JUL', days: 31, offset: 181 },
 { name: 'AUG', days: 31, offset: 212 },
 { name: 'SEP', days: 30, offset: 243 },
 { name: 'OCT', days: 31, offset: 273 },
 { name: 'NOV', days: 30, offset: 304 },
 { name: 'DEC', days: 31, offset: 334 }
 ];

 // Maps YYYY-MM-DD to day of year index (1-365)
 const getDayOfYear = (dateString: string) => {
 const d = new Date(dateString);
 if (isNaN(d.getTime())) return 1;
 const start = new Date(d.getFullYear(), 0, 0);
 const diff = d.getTime() - start.getTime();
 const oneDay = 1000 * 60 * 60 * 24;
 return Math.max(1, Math.min(365, Math.floor(diff / oneDay)));
 };

 // Format day of year (1-365) back to Month / Day string format
 const formatDayOfYear = (dayNum: number) => {
 let accumulated = 0;
 for (let i = 0; i < monthsList.length; i++) {
 if (dayNum <= accumulated + monthsList[i].days) {
 const day = dayNum - accumulated;
 return `${monthsList[i].name} ${day}`;
 }
 accumulated += monthsList[i].days;
 }
 return `DEC 31`;
 };

 // Trigonometry mapping for circular polar plots (radius, day) -> {x, y}
 // Angles are rotated by -90 deg so day 1 (Jan 1) is at the strict top (12 o'clock)
 const getPolarCoords = (radius: number, dayNum: number) => {
 const angleDegrees = (dayNum / 365) * 360;
 const angleRadians = ((angleDegrees - 90) * Math.PI) / 180;
 return {
 x: 250 + radius * Math.cos(angleRadians),
 y: 250 + radius * Math.sin(angleRadians)
 };
 };

 const todayDayIndex = getDayOfYear(simulatedDate);

 // Gather and enrich cow reproduction cycle stages
 const enrichedCows = cows.map(cow => {
 // Latest service AI cycle
 const cowAI = aiRecords
 .filter(r => r.cowId.toLowerCase() === cow.id.toLowerCase())
 .sort((a, b) => b.date.localeCompare(a.date))[0];

 let serviceDay = 0;
 let dryOffDay = 0;
 let calvingDay = 0;
 let lactationStartDay = 0;
 let scoreText = 'No active breeding timeline detected';
 let statusLabel: string = cow.status;
 let forecastStatus: 'Lactating' | 'Dry' | 'Heifer' | 'In-Calf' = cow.status;

 if (cow.status === 'In-Calf' || (cowAI && cowAI.status === 'Confirmed Pregnant')) {
 statusLabel = 'In-Calf (Gestation)';
 forecastStatus = 'In-Calf';
 const sDate = cowAI ? cowAI.date : cow.dob; // fallback
 const sDay = getDayOfYear(sDate);
 serviceDay = sDay;
 dryOffDay = (sDay + 220) % 365 || 365;
 calvingDay = (sDay + 283) % 365 || 365;

 // Progress tracking
 const daysGestation = Math.max(0, Math.ceil((new Date(simulatedDate).getTime() - new Date(sDate).getTime()) / (1000 * 60 * 60 * 24)));
 if (daysGestation > 220) {
 forecastStatus = 'Dry';
 scoreText = `Currently DRY (Dry-off on G220). Calving expected in ${Math.max(0, 283 - daysGestation)} days`;
 } else {
 scoreText = `Gestating (Day ${daysGestation} of 283). Dry-off due in ${Math.max(0, 220 - daysGestation)} days`;
 }
 } else if (cow.status === 'Lactating') {
 lactationStartDay = (getDayOfYear(simulatedDate) - 60 + 365) % 365 || 365; // Estimated 60 days into lactation
 scoreText = `Direct milk line active (Avg daily: ${getAverageYield(cow.id).toFixed(1)} L)`;
 } else if (cow.status === 'Dry') {
 scoreText = `Dry non-lactating phase. Standing by for insemination trigger`;
 }

 return {
 ...cow,
 serviceDay,
 dryOffDay,
 calvingDay,
 lactationStartDay,
 scoreText,
 statusLabel,
 forecastStatus,
 latestAI: cowAI
 };
 });

 // Click cow to focus
 const focusedCowData = enrichedCows.find(c => c.id.toLowerCase() === selectedWheelCow.toLowerCase()) || enrichedCows[0];

 // 30 days upcoming forecast list based on current simulation pointer
 const forecastEvents = enrichedCows.flatMap(cow => {
 const events = [];
 
 if (cow.statusLabel.includes('In-Calf') && cow.latestAI) {
 const sDateObj = new Date(cow.latestAI.date);
 
 // Expected dry off (sDate + 220 days)
 const dryOffDateObj = new Date(sDateObj);
 dryOffDateObj.setDate(dryOffDateObj.getDate() + 220);
 const dryOffStr = dryOffDateObj.toISOString().split('T')[0];

 // Expected calving (sDate + 283 days)
 const calvingDateObj = new Date(sDateObj);
 calvingDateObj.setDate(calvingDateObj.getDate() + 283);
 const calvingStr = calvingDateObj.toISOString().split('T')[0];

 const curSimObj = new Date(simulatedDate);
 
 // Days difference from simulated date
 const daysToDryOff = Math.ceil((dryOffDateObj.getTime() - curSimObj.getTime()) / (1000 * 60 * 60 * 24));
 const daysToCalving = Math.ceil((calvingDateObj.getTime() - curSimObj.getTime()) / (1000 * 60 * 60 * 24));

 if (daysToDryOff >= 0 && daysToDryOff <= 30) {
 events.push({
 cowId: cow.id,
 name: cow.name,
 type: 'Dry-off Trigger',
 date: dryOffStr,
 daysLeft: daysToDryOff,
 severity: 'warning',
 color: 'text-amber-600 bg-amber-900/20 border-amber-200'
 });
 }

 if (daysToCalving >= 0 && daysToCalving <= 30) {
 events.push({
 cowId: cow.id,
 name: cow.name,
 type: 'Expected Calving',
 date: calvingStr,
 daysLeft: daysToCalving,
 severity: 'danger',
 color: 'text-rose-600 bg-rose-900/20 border-rose-200 animate-pulse'
 });
 }
 }

 // Cows in heat / ready to breed window: 50 - 75 days post calving (if we have calf dob logs)
 // Look at calfRecords to find calving dates
 return events;
 }).sort((a,b) => a.daysLeft - b.daysLeft);

 return (
 <div className="space-y-6 animate-fadeIn" id="breeding-wheel-center">
 {/* Context Header */}
 <div className="bg-white text-green-600 p-5 rounded-3xl border border-emerald-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm text-left">
 <div className="space-y-1">
 <span className="text-[10px]  font-semibold tracking-normal text-green-600">Biological Gestation Dial</span>
 <h4 className="text-base font-semibold text-gray-900 tracking-tight">Circular Herd Breeding & Reproduction Wheel</h4>
 <p className="text-xs text-green-600 font-medium leading-relaxed max-w-xl">
 Simulate gestation timelines clockwise. Plot services (12 o'clock starting sector), follow gestating development (blue), track mandatory dry-off dates (amber at 220 days), and countdown to calving due (red at 283 days).
 </p>
 </div>
 <div className="flex flex-wrap items-center gap-3 bg-gray-50 border border-gray-100 p-3 rounded-2xl w-full md:w-auto">
 <div className="text-right">
 <span className="text-[9px] text-green-600 font-bold tracking-tight block">Currently Simulating</span>
 <span className="text-xs font-mono font-semibold text-gray-900">{formatDayOfYear(todayDayIndex)}</span>
 </div>
 <input
 type="date"
 value={simulatedDate}
 onChange={(e) => setSimulatedDate(e.target.value)}
 className="bg-emerald-900 border border-emerald-800 rounded-lg p-1.5 text-xs text-gray-900 font-mono font-bold cursor-pointer"
 />
 {onTriggerSectionReport && (
 <button
 onClick={() => onTriggerSectionReport('ai')}
 type="button"
 className="flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-gray-500 font-semibold text-xs  rounded-xl transition-all shadow-md cursor-pointer m-0 border border-amber-600/10 font-bold"
 title="Export Gestation & Breeding PDF Report"
 >
 <Download size={13} />
 Breeding PDF Report
 </button>
 )}
 </div>
 </div>

 {/* Main Interactive Grid */}
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
 
 {/* Left pane: The Circular SVG Wheel (col 6) */}
 <div className="lg:col-span-6 bg-white shadow-sm border border-gray-200 p-6 rounded-3xl shadow-xs flex flex-col items-center justify-center space-y-4">
 
 {/* SVG Dial canvas */}
 <div className="relative w-full max-w-[420px] aspect-square">
 <svg viewBox="0 0 500 500" className="w-full h-full select-none" id="breeding-wheel-svg">
 <defs>
 <radialGradient id="hubGradient" cx="50%" cy="50%" r="50%">
 <stop offset="0%" stopColor="#ffffff" />
 <stop offset="90%" stopColor="#f8fafc" />
 <stop offset="100%" stopColor="#e2e8f0" />
 </radialGradient>
 </defs>

 {/* Concentric Grey Guide Lines */}
 <circle cx="250" cy="250" r="230" fill="none" stroke="#f1f5f9" strokeWidth="1" />
 <circle cx="250" cy="250" r="195" fill="none" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="3 3" />
 <circle cx="250" cy="250" r="160" fill="none" stroke="#cbd5e1" strokeWidth="3" />
 <circle cx="250" cy="250" r="125" fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 4" />
 <circle cx="250" cy="250" r="90" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.5" />

 {/* Draw month sector dividing spokes and labels */}
 {monthsList.map((m, idx) => {
 const deg = idx * 30;
 const rad = ((deg - 90) * Math.PI) / 180;
 const labelRad = ((deg + 15 - 90) * Math.PI) / 180;

 // Dividing spoke
 const spokeX = 250 + 230 * Math.cos(rad);
 const spokeY = 250 + 230 * Math.sin(rad);

 // Label coordinates
 const labelX = 250 + 212 * Math.cos(labelRad);
 const labelY = 250 + 212 * Math.sin(labelRad);

 const isHovered = wheelHoveredMonth === idx;

 return (
 <g key={m.name} className="transition-all">
 {/* Invisible month section wedge for hovering */}
 <path
 d={`M 250 250 L ${250 + 230 * Math.cos(rad)} ${250 + 230 * Math.sin(rad)} A 230 230 0 0 1 ${250 + 230 * Math.cos(((idx + 1) * 30 - 90) * Math.PI / 180)} ${250 + 230 * Math.sin(((idx + 1) * 30 - 90) * Math.PI / 180)} Z`}
 fill={isHovered ? 'rgba(16, 185, 129, 0.05)' : 'transparent'}
 className="cursor-pointer transition-all duration-150"
 onMouseEnter={() => setWheelHoveredMonth(idx)}
 onMouseLeave={() => setWheelHoveredMonth(null)}
 />

 {/* Spoke line */}
 <line x1="250" y1="250" x2={spokeX} y2={spokeY} stroke="#e2e8f0" strokeWidth={isHovered ? "2.5" : "1"} />
 
 {/* Text month label */}
 <text
 x={labelX}
 y={labelY + 4}
 textAnchor="middle"
 className={`font-mono text-[9px] font-semibold ${isHovered ? 'fill-emerald-600 font-semibold' : 'fill-slate-400'}`}
 >
 {m.name}
 </text>
 </g>
 );
 })}

 {/* Highlighting Focused Cow sectors */}
 {focusedCowData && focusedCowData.serviceDay > 0 && (() => {
 const sDay = focusedCowData.serviceDay;
 const dDay = focusedCowData.dryOffDay;
 const cDay = focusedCowData.calvingDay;

 const startAngle = (sDay / 365) * 360 - 90;
 const dryAngle = (dDay / 365) * 360 - 90;
 const calvingAngle = (cDay / 365) * 360 - 90;

 const makeArc = (r: number, start: number, end: number, color: string) => {
 const startRad = (start * Math.PI) / 180;
 const endRad = (end * Math.PI) / 180;
 const x1 = 250 + r * Math.cos(startRad);
 const y1 = 250 + r * Math.sin(startRad);
 const x2 = 250 + r * Math.cos(endRad);
 const y2 = 250 + r * Math.sin(endRad);
 const largeArc = (end - start + 360) % 360 > 180 ? 1 : 0;
 return (
 <path
 d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`}
 fill="none"
 stroke={color}
 strokeWidth="8"
 strokeLinecap="round"
 opacity="0.85"
 />
 );
 };

 return (
 <g>
 {/* Gestation sector arc: Service to Dry Off (cyan-blue) */}
 {makeArc(160, startAngle, dryAngle, '#3b82f6')}
 {/* Dry Period sector arc: Dry-off to Calving Expected (amber-orange) */}
 {makeArc(160, dryAngle, calvingAngle, '#f97316')}
 
 {/* Pinpoints line links */}
 <line x1="250" y1="250" x2={getPolarCoords(160, sDay).x} y2={getPolarCoords(160, sDay).y} stroke="#3b82f6" strokeWidth="1" strokeDasharray="2 2" />
 </g>
 );
 })()}

 {/* Render cows as pins around the circular track */}
 {enrichedCows.map(cow => {
 if (cow.serviceDay <= 0) return null;

 const isSelected = selectedWheelCow.toLowerCase() === cow.id.toLowerCase();
 const coords = getPolarCoords(160, cow.serviceDay);

 // Choose node color based on status
 const pinColor = 
 cow.forecastStatus === 'Dry' ? '#f97316' : 
 cow.forecastStatus === 'In-Calf' ? '#2563eb' : '#10b981';

 return (
 <g 
 key={`pin-${cow.id}`}
 className="cursor-pointer group"
 onClick={() => setSelectedWheelCow(cow.id)}
 >
 <circle
 cx={coords.x}
 cy={coords.y}
 r={isSelected ? "8" : "5.5"}
 fill={pinColor}
 stroke={isSelected ? "#ffffff" : "transparent"}
 strokeWidth="1.5"
 className="transition-all hover:scale-125"
 />
 <title>{`${cow.name} [${cow.id}] - Inseminated Jan/Dec Equivalent`}</title>
 </g>
 );
 })}

 {/* Golden Time Pointer Pointer Needle pointing to Simulated Date */}
 {(() => {
 const ptrCoords = getPolarCoords(195, todayDayIndex);
 return (
 <g>
 <line
 x1="250"
 y1="250"
 x2={ptrCoords.x}
 y2={ptrCoords.y}
 stroke="#eab308"
 strokeWidth="3.5"
 strokeLinecap="round"
 opacity="0.9"
 />
 <circle
 cx={ptrCoords.x}
 cy={ptrCoords.y}
 r="5"
 fill="#eab308"
 stroke="#ffffff"
 strokeWidth="1.5"
 />
 </g>
 );
 })()}

 {/* Center HUD Circle */}
 <circle cx="250" cy="250" r="48" fill="url(#hubGradient)" stroke="#cbd5e1" strokeWidth="2" />
 
 {/* Inner HUD metadata labels */}
 <g className="font-sans">
 <text x="250" y="238" fontSize="8" fontWeight="900" fill="#64748b" textAnchor="middle" className="tracking-tight text-center">ESTATE DIAL</text>
 <text x="250" y="253" fontSize="14" fontWeight="950" fill="#0f172a" textAnchor="middle" className="font-mono text-center">{cows.length}</text>
 <text x="250" y="265" fontSize="7" fontWeight="900" fill="#10b981" textAnchor="middle" className="tracking-tight text-center">HERD HEADS</text>
 </g>
 </svg>
 </div>

 {/* Subtitle Color Guides */}
 <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] font-semibold  text-gray-900 font-medium font-sans border-t pt-3 w-full">
 <div className="flex items-center gap-1.5">
 <span className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
 <span>Gestating In-Calf</span>
 </div>
 <div className="flex items-center gap-1.5">
 <span className="w-2.5 h-2.5 bg-orange-500 rounded-full" />
 <span>Dry Transition (G220+)</span>
 </div>
 <div className="flex items-center gap-1.5">
 <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
 <span>Fresh & Milking</span>
 </div>
 <div className="flex items-center gap-1.5">
 <span className="w-2.5 h-1 bg-yellow-400 h-0.5 rounded-sm" />
 <span>Simulated Pointer</span>
 </div>
 </div>

 </div>

 {/* Right pane: Breeding Intelligence Dashboard & Forecast Checklist (col 6) */}
 <div className="lg:col-span-6 space-y-6">
 
 {/* 1. Selected cow focus card */}
 {focusedCowData ? (
 <div className="bg-white shadow-sm border border-gray-200 p-6 rounded-3xl shadow-xs space-y-4">
 <div className="flex justify-between items-start border-b pb-3">
 <div>
 <span className="text-[9px] font-bold text-gray-900 font-medium tracking-tight block font-sans">Focus Cow Scorecard</span>
 <h4 className="text-sm font-semibold text-gray-900  tracking-wide">
 {focusedCowData.name} ({focusedCowData.id})
 </h4>
 <span className="text-gray-500 text-[10px] font-semibold block mt-0.5 font-sans">
 Breed: {focusedCowData.breed} • Life Age: {getCowAge(focusedCowData.dob)}
 </span>
 </div>

 {/* Pill Badge */}
 <span className={`px-2.5 py-1 rounded-full text-[9px] font-semibold tracking-tight ${
 focusedCowData.forecastStatus === 'In-Calf' ? 'bg-blue-100 text-blue-900' :
 focusedCowData.forecastStatus === 'Dry' ? 'bg-amber-100 text-amber-900 animate-pulse' :
 'bg-emerald-100 text-green-600'
 }`}>
 {focusedCowData.forecastStatus}
 </span>
 </div>

 {/* Timeline Scoreboard metrics list */}
 <div className="grid grid-cols-2 gap-3.5 text-xs">
 <div className="bg-white border border-gray-200 p-3 rounded-2xl border">
 <span className="text-[8.5px]  font-bold text-gray-900 font-medium block mb-0.5">Lineage AI Straw</span>
 <span className="font-semibold text-gray-900 block">
 {focusedCowData.latestAI ? focusedCowData.latestAI.bull : 'None Logged'}
 </span>
 <span className="text-[8.5px] font-semibold text-gray-500 block mt-1">
 Insemination: {focusedCowData.latestAI ? focusedCowData.latestAI.date : 'N/A'}
 </span>
 </div>

 <div className="bg-white border border-gray-200 p-3 rounded-2xl border">
 <span className="text-[8.5px]  font-bold text-gray-900 font-medium block mb-0.5">Calculated Calving due</span>
 <span className="font-semibold text-rose-800 block">
 {focusedCowData.latestAI ? focusedCowData.latestAI.due : 'None Logged'}
 </span>
 <span className="text-[8.5px] font-semibold text-gray-500 block mt-1">
 Approx {focusedCowData.latestAI ? '283 days gestation' : 'N/A'}
 </span>
 </div>
 </div>

 {/* Dynamic Gestation / Breeding Milestone Timeline visually tracking key physiological phases */}
 <div className="bg-white text-gray-900 p-5 rounded-2xl border border-gray-200 space-y-4">
 {(() => {
 const latestAIServiceDate = focusedCowData.latestAI ? focusedCowData.latestAI.date : null;
 const isPregnant = focusedCowData.forecastStatus === 'In-Calf' || focusedCowData.forecastStatus === 'Dry';
 
 // Calculate days in gestation or default
 const daysGestation = latestAIServiceDate 
 ? Math.max(0, Math.ceil((new Date(simulatedDate).getTime() - new Date(latestAIServiceDate).getTime()) / (1000 * 60 * 60 * 24)))
 : (focusedCowData.status === 'In-Calf' ? 120 : 0);

 const isDryPeriod = daysGestation >= 220;

 if (isPregnant) {
 const gestationMilestones = [
 { day: 0, label: "Day 0", title: "Conception", desc: "AI Straw insemination completed.", tip: "Observe for secondary heat on Day 21" },
 { day: 30, label: "Day 30", title: "Attachment", desc: "Embryo attaches firmly.", tip: "Avoid stressful handlings" },
 { day: 60, label: "Day 60", title: "Sexing Scan", desc: "Fetal heartbeat matches rhythm indicators.", tip: "Vet scanning open for sexing" },
 { day: 150, label: "Day 150", title: "Rumen Grow", desc: "Skeletal frame ossified.", tip: "Supply copper & selenium" },
 { day: 220, label: "Day 220", title: "Dry-Off", desc: "Milking halted to save colostrum.", tip: "Infuse dry-cow mastitis tubes" },
 { day: 270, label: "Day 270", title: "Steam-Up", desc: "Transition grain introduced.", tip: "Shift to transition close-up feeds" },
 { day: 283, label: "Day 283", title: "Calving Due", desc: "Due date of birth.", tip: "Move to sterilized calving block" }
 ];

 // Find active milestone
 let activeIndex = 0;
 for (let i = 0; i < gestationMilestones.length; i++) {
 if (daysGestation >= gestationMilestones[i].day) {
 activeIndex = i;
 }
 }

 return (
 <div className="space-y-3.5">
 <div className="flex justify-between items-center border-b border-gray-200 pb-2">
 <span className="text-[10px]  font-semibold text-yellow-700 tracking-normal">🤰 ACTIVE PREGNANCY TIMELINE METRIC</span>
 <span className="bg-blue-500/10 text-blue-300 text-[10px] font-mono font-semibold px-2 py-0.5 rounded border border-blue-500/20">
 Day {daysGestation} / 283
 </span>
 </div>

 <p className="text-[11px] text-gray-900 font-medium leading-relaxed font-medium">
 📌 <strong>Chronological Status:</strong> {focusedCowData.scoreText}
 </p>

 {/* Horizontal or Vertical scrollable step milestones */}
 <span className="text-[9.5px]  font-semibold text-gray-900 font-medium block mb-1">Gestation Milestone Milestones:</span>
 <div className="grid grid-cols-1 gap-2 max-h-[190px] overflow-y-auto pr-1">
 {gestationMilestones.map((ms, idx) => {
 const isCompleted = daysGestation > ms.day;
 const isActive = activeIndex === idx;
 const isFuture = daysGestation <= ms.day && !isActive;

 let statusColor = "border-gray-200 bg-white shadow-sm text-gray-900 font-medium";
 let indicator = "⚪";
 if (isCompleted) {
 statusColor = "border-emerald-900/50 bg-white/20 text-gray-900 font-medium";
 indicator = "✔";
 } else if (isActive) {
 statusColor = "border-amber-500/40 bg-amber-500/10 text-gray-900 shadow-sm shadow-amber-500/5";
 indicator = "⭐";
 }

 return (
 <div key={ms.title} className={`p-2.5 border rounded-xl flex gap-2.5 items-start text-xs leading-tight transition-all ${statusColor}`}>
 <span className="text-sm shrink-0 mt-0.5 font-mono font-semibold">{indicator}</span>
 <div className="flex-1 min-w-0">
 <div className="flex justify-between items-baseline gap-1">
 <span className="font-semibold text-[11px] truncate ">{ms.title}</span>
 <span className="text-[8.5px] font-mono text-gray-900 font-medium shrink-0 font-semibold">{ms.label}</span>
 </div>
 <p className="text-[10px] text-gray-900 font-medium mt-0.5 font-medium leading-normal">{ms.desc}</p>
 {isActive && (
 <p className="text-[9.5px] text-yellow-300 mt-1 font-bold bg-yellow-405/10 p-1 rounded border border-yellow-500/10">
 💡 Veterinary Tip: {ms.tip}
 </p>
 )}
 </div>
 </div>
 );
 })}
 </div>
 </div>
 );
 } else {
 // Non-pregnant / standard cycling timeline
 const cycleMilestones = [
 { day: 0, label: "Day 0", title: "Calving Day", desc: "Starts fresh milk curve.", tip: "Flush uterine tracts, check retained placenta within 12h" },
 { day: 30, label: "Day 30", title: "Involution Complete", desc: "Uterus returns to normal size.", tip: "Record secondary mucus discharge metrics" },
 { day: 45, label: "Day 45", title: "Voluntary Wait Expire", desc: "Ready for primary insemination.", tip: "Heat signs: standing to be mounted, swelling vulva" },
 { day: 75, label: "Day 75", title: "Peak Breeding Zone", desc: "Highest fertility and conception rates.", tip: "Semen straw choice: High milk yield Friesian, Jersey" },
 { day: 220, label: "Day 220", title: "Mid-Lactation Decline", desc: "Persistent yield drops 10% monthly.", tip: "Optimize fiber and mineral levels in standard meal" },
 { day: 305, label: "Day 305", title: "Milking Cutoff", desc: "Complete 305-day lactation cycle.", tip: "Impose physical dry-off transitional period" }
 ];

 // Estimate where the cow is (let's assume lactating starts about 60 days post calving)
 const daysPostCalving = focusedCowData.status === 'Lactating' ? 65 : 320;
 
 let activeIndex = 0;
 for (let i = 0; i < cycleMilestones.length; i++) {
 if (daysPostCalving >= cycleMilestones[i].day) {
 activeIndex = i;
 }
 }

 return (
 <div className="space-y-3.5">
 <div className="flex justify-between items-center border-b border-gray-200 pb-2">
 <span className="text-[10px]  font-semibold text-green-600 tracking-normal">🐄 LACTATION & INSEMINATION CYCLE TIMELINE</span>
 <span className="bg-emerald-500/10 text-green-600 text-[10px] font-mono font-semibold px-2 py-0.5 rounded border border-emerald-500/20">
 Peak Milker Timeline
 </span>
 </div>

 <p className="text-[11px] text-gray-900 font-medium leading-relaxed font-semibold">
 📌 {focusedCowData.scoreText}
 </p>

 <span className="text-[9.5px]  font-semibold text-gray-900 font-medium block mb-1">Yearly Breeding Cycle Milestones:</span>
 <div className="grid grid-cols-1 gap-2 max-h-[190px] overflow-y-auto pr-1">
 {cycleMilestones.map((ms, idx) => {
 const isCompleted = daysPostCalving > ms.day;
 const isActive = activeIndex === idx;

 let statusColor = "border-gray-200 bg-white shadow-sm text-gray-900 font-medium";
 let indicator = "⚪";
 if (isCompleted) {
 statusColor = "border-emerald-950/30 bg-white/15 text-gray-900 font-medium";
 indicator = "✔";
 } else if (isActive) {
 statusColor = "border-emerald-500/40 bg-emerald-500/10 text-white shadow-sm shadow-emerald-500/5";
 indicator = "⭐";
 }

 return (
 <div key={ms.title} className={`p-2.5 border rounded-xl flex gap-2.5 items-start text-xs leading-tight transition-all ${statusColor}`}>
 <span className="text-sm shrink-0 mt-0.5 font-mono font-semibold">{indicator}</span>
 <div className="flex-1 min-w-0">
 <div className="flex justify-between items-baseline gap-1">
 <span className="font-semibold text-[11px] truncate ">{ms.title}</span>
 <span className="text-[8.5px] font-mono text-gray-900 font-medium shrink-0 font-bold">{ms.label}</span>
 </div>
 <p className="text-[10px] text-gray-900 font-medium mt-0.5 font-medium leading-normal">{ms.desc}</p>
 {isActive && (
 <p className="text-[9.5px] text-green-600 mt-1 font-bold bg-emerald-500/10 p-1 rounded border border-emerald-500/10">
 💡 Herd Manager Tip: {ms.tip}
 </p>
 )}
 </div>
 </div>
 );
 })}
 </div>
 </div>
 );
 }
 })()}
 </div>

 {/* Quick Reproduction Action buttons */}
 <div className="grid grid-cols-3 gap-2.5 pt-2">
 <button
 onClick={() => {
    onGoToSubTab('breeding_ledger');
 }}
 className="py-2 px-1 bg-white shadow-sm hover:bg-white border border-gray-200 text-gray-900 font-semibold  text-[9px] tracking-normal rounded-lg transition-colors border-0 cursor-pointer text-center"
 >
 Inseminate 💉
 </button>
 
 <button
 onClick={() => {
 onUpdateCowStatus(focusedCowData.id, 'Dry');
 alert(`Cow ${focusedCowData.name} has been set to DRY status for recovery.`);
 }}
 className="py-2 px-1 bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold  text-[9px] tracking-normal rounded-lg transition-colors border-0 cursor-pointer text-center"
 >
 Set to Dry 🏜️
 </button>

 <button
 onClick={() => {
 onUpdateCowStatus(focusedCowData.id, 'Lactating');
 alert(`Cow ${focusedCowData.name} status updated to Lactating / Fresh.`);
 }}
 className="py-2 px-1 bg-emerald-700 hover:bg-emerald-850 text-white font-semibold  text-[9px] tracking-normal rounded-lg transition-colors border-0 cursor-pointer text-center"
 >
 Set Lactating 🐄
 </button>
 </div>

 </div>
 ) : (
 <div className="bg-white border border-gray-200 border p-6 rounded-3xl text-center text-gray-500 py-12">
 Select a cow node or name from the list to display interactive cycle statistics.
 </div>
 )}

 {/* 2. Urgent Events Forecasting Window */}
 <div className="bg-white shadow-sm border border-gray-200 p-6 rounded-3xl shadow-xs space-y-4">
 <div className="flex justify-between items-center border-b pb-3">
 <div className="text-left">
 <h4 className="text-xs font-semibold text-gray-900  tracking-wide">30-Day Gestation Forecast Planner</h4>
 <p className="text-[10px] text-gray-900 font-medium font-semibold  mt-0.5">Calculated countdowns from simulated clock date</p>
 </div>
 <span className="bg-white border border-gray-200 text-gray-900 font-semibold text-[9px] font-semibold px-2.5 py-1 rounded font-mono">
 {forecastEvents.length} Events Pending
 </span>
 </div>

 <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
 {forecastEvents.length === 0 ? (
 <p className="text-center text-gray-500 py-8 text-xs font-bold leading-relaxed">
 🎉 No cows expected to Dry Off or Calve in the upcoming 30 days based on Simulated Date: <span className="text-green-600 underline">{formatDayOfYear(todayDayIndex)}</span>
 </p>
 ) : (
 forecastEvents.map((evt, idx) => (
 <div 
 key={`${evt.cowId}-${evt.type}-${idx}`} 
 className={`p-3.5 rounded-2xl border flex justify-between items-center text-xs font-sans ${evt.color}`}
 >
 <div className="space-y-1">
 <span className="text-[9px] font-semibold tracking-tight block opacity-75">{evt.type}</span>
 <span className="font-semibold text-gray-500">
 {evt.name} (Tag {evt.cowId})
 </span>
 <span className="text-[10px] block opacity-80 font-mono">
 Due: {evt.date} (Simulated countdown)
 </span>
 </div>
 <div className="text-right">
 <span className="font-mono text-xs font-semibold px-2.5 py-1 bg-white shadow-sm /60 border rounded-lg inline-block">
 {evt.daysLeft === 0 ? 'DUE TODAY' : `In ${evt.daysLeft} days`}
 </span>
 </div>
 </div>
 ))
 )}
 </div>
 </div>

 {/* 3. Cow Directory Listing for quick wheel selection */}
 <div className="bg-white shadow-sm border border-gray-200 p-6 rounded-3xl shadow-xs space-y-4">
 <div className="border-b pb-3 flex justify-between items-center">
 <h5 className="text-xs font-semibold text-gray-900  tracking-wide">Herd Reproductive Directory</h5>
 <span className="text-[9px] text-gray-900 font-medium  font-semibold">Quick Selector</span>
 </div>

 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-[140px] overflow-y-auto pr-1">
 {enrichedCows.map(cow => {
 const isSelected = selectedWheelCow.toLowerCase() === cow.id.toLowerCase();
 return (
 <button
 key={`btn-dir-${cow.id}`}
 onClick={() => setSelectedWheelCow(cow.id)}
 className={`p-2.5 text-left rounded-xl border text-[11px] font-bold  transition-all duration-150 cursor-pointer m-0 flex flex-col justify-between ${
 isSelected 
 ? 'bg-white border-emerald-950 text-gray-900 shadow-sm ring-2 ring-emerald-500/20' 
 : 'bg-white border border-gray-200 border-gray-100 hover:border-gray-200 text-gray-900 font-semibold'
 }`}
 >
 <span className="text-[10px] font-semibold">{cow.id}</span>
 <span className={`${isSelected ? 'text-green-600' : 'text-gray-500'} text-[8.5px] truncate font-medium block mt-1`}>
 {cow.name}
 </span>
 </button>
 );
 })}
 </div>
 </div>

 </div>
 
 </div>
 </div>
 );
 })()}
 {pedigreeCow && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white shadow-sm font-sans">
 <div className="bg-white shadow-sm rounded-3xl w-full max-w-4xl shadow-2xl p-6 md:p-8 border border-gray-100 flex flex-col space-y-6 max-h-[90vh] overflow-y-auto animate-fadeIn">
 
 {/* Modal Header */}
 <div className="flex justify-between items-start pb-4 border-b border-gray-100">
 <div>
 <div className="flex items-center gap-2">
 <span className="bg-emerald-100 text-green-600 px-2.5 py-1 rounded-lg text-[10px] font-semibold tracking-tight">
 Official Pedigree Deed
 </span>
 {pedigreeCow.registrationNo && (
 <span className="bg-blue-900/20 text-blue-700 px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold tracking-tight border border-blue-200">
 Reg: {pedigreeCow.registrationNo}
 </span>
 )}
 </div>
 <h3 className="text-xl font-semibold text-gray-900 text-gray-900 mt-2 flex items-center gap-2">
 <Award className="text-amber-500" size={20} />
 Lineage: {pedigreeCow.name}
 </h3>
 <p className="text-xs text-gray-900 font-medium font-bold mt-1">
 Tag ID: {pedigreeCow.id} | Breed: {pedigreeCow.breed} | DOB: {pedigreeCow.dob}
 </p>
 </div>
 <button 
 onClick={() => {
 setPedigreeCow(null);
 setSelectedMateId('');
 }} 
 className="text-gray-900 font-medium hover:text-gray-900 font-medium font-bold text-lg m-0 p-1 cursor-pointer bg-white border border-gray-200 hover:bg-white border border-gray-200 rounded-full w-8 h-8 flex items-center justify-center transition-all"
 >
 ✕
 </button>
 </div>

 {/* Modal Tabs */}
 <div className="flex border-b border-gray-100 pb-1 overflow-x-auto gap-4">
 <button
 type="button"
 onClick={() => setPedigreeSubTab('tree')}
 className={`pb-2.5 px-2 text-xs font-semibold tracking-tight transition-all border-b-2 cursor-pointer ${
 pedigreeSubTab === 'tree'
 ? 'border-emerald-700 text-gray-900'
 : 'border-transparent text-gray-900 font-medium hover:text-gray-900 font-semibold'
 }`}
 >
 🌳 Ancestry Family Tree
 </button>
 <button
 type="button"
 onClick={() => setPedigreeSubTab('offspring')}
 className={`pb-2.5 px-2 text-xs font-semibold tracking-tight transition-all border-b-2 cursor-pointer ${
 pedigreeSubTab === 'offspring'
 ? 'border-emerald-700 text-gray-900'
 : 'border-transparent text-gray-900 font-medium hover:text-gray-900 font-semibold'
 }`}
 >
 🧬 Offspring & Descendants
 </button>
 <button
 type="button"
 onClick={() => setPedigreeSubTab('genetics')}
 className={`pb-2.5 px-2 text-xs font-semibold tracking-tight transition-all border-b-2 cursor-pointer ${
 pedigreeSubTab === 'genetics'
 ? 'border-emerald-700 text-gray-900'
 : 'border-transparent text-gray-900 font-medium hover:text-gray-900 font-semibold'
 }`}
 >
 🔬 Genetic Mating Simulator
 </button>
 </div>

 {/* Tab 1: Ancestry Family Tree */}
 {pedigreeSubTab === 'tree' && (
 <div className="space-y-6">
 <div className="py-2">
 <span className="text-[10px] font-semibold text-gray-900 font-medium  block mb-4 text-center tracking-normal">
 Three Generation Ancestor Pedigree Mapping (Live Active Ledger)
 </span>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
 {/* FIRST GENERATION: PROBAND (SELF) */}
 <div className="flex flex-col justify-center">
 <div className="p-4 bg-emerald-50 border-2 border-emerald-950/20 rounded-2xl shadow-sm text-center relative hover:border-emerald-600 transition-colors">
 <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white text-gray-900 rounded px-2 py-0.5 text-[8px]  font-semibold tracking-normal">
 Proband/Subject
 </div>
 <div className="pt-4 pb-2">
 <span className="text-base font-semibold text-gray-900 block mt-1">{pedigreeCow.name}</span>
 <span className="text-[11px] font-bold text-gray-900 font-medium block mt-1">Tag: {pedigreeCow.id}</span>
 <span className="text-[10px] bg-white/10 text-green-600 font-semibold px-2 py-1 rounded mt-2 inline-block">
 Breed: {pedigreeCow.breed}
 </span>
 </div>
 </div>
 </div>

 {/* SECOND GENERATION: PARENTS */}
 <div className="flex flex-col justify-center space-y-6">
 {/* SIRE (FATHER ♂) */}
 <div className="p-4 bg-blue-900/20 border-2 border-blue-900/10 rounded-2xl shadow-sm relative hover:border-blue-400 transition-colors">
 <span className="text-[8px] font-semibold  text-blue-700 block tracking-normal mb-1">Sire / Father ♂</span>
 <span className="text-sm font-semibold text-gray-900 block">{pedigreeCow.sire || 'Imported Semen Specimen'}</span>
 <span className="text-[10px] text-gray-900 font-medium font-bold block mt-1">Certified Pureblood Lineage</span>
 
 {pedigreeCow.sire && cows.find(c => c.id.toLowerCase() === pedigreeCow.sire!.trim().toLowerCase() || c.name.toLowerCase() === pedigreeCow.sire!.trim().toLowerCase()) && (
 <button 
 type="button"
 onClick={() => {
 const target = cows.find(c => c.id.toLowerCase() === pedigreeCow.sire!.trim().toLowerCase() || c.name.toLowerCase() === pedigreeCow.sire!.trim().toLowerCase());
 if (target) setPedigreeCow(target);
 }}
 className="mt-2.5 text-[9px] font-semibold  text-blue-800 bg-blue-10/20 hover:bg-blue-100 hover:text-blue-950 border border-blue-200 px-2 py-1 rounded transition-all w-full cursor-pointer m-0 text-center block"
 >
 🧬 Trace Sire Pedigree
 </button>
 )}
 </div>

 {/* DAM (MOTHER ♀) */}
 <div className="p-4 bg-rose-900/20 border-2 border-rose-900/10 rounded-2xl shadow-sm relative hover:border-rose-400 transition-colors">
 <span className="text-[8px] font-semibold  text-rose-700 block tracking-normal mb-1">Dam / Mother ♀</span>
 <span className="text-sm font-semibold text-gray-900 block">{pedigreeCow.dam || 'Acr-Grade Sire Maternal'}</span>
 <span className="text-[10px] text-gray-900 font-medium font-bold block mt-1">Excellent Butterfat Producer</span>

 {pedigreeCow.dam && cows.find(c => c.id.toLowerCase() === pedigreeCow.dam!.trim().toLowerCase() || c.name.toLowerCase() === pedigreeCow.dam!.trim().toLowerCase()) && (
 <button 
 type="button"
 onClick={() => {
 const target = cows.find(c => c.id.toLowerCase() === pedigreeCow.dam!.trim().toLowerCase() || c.name.toLowerCase() === pedigreeCow.dam!.trim().toLowerCase());
 if (target) setPedigreeCow(target);
 }}
 className="mt-2.5 text-[9px] font-semibold  text-rose-800 bg-rose-10/20 hover:bg-rose-100 hover:text-rose-950 border border-rose-200 px-2 py-1 rounded transition-all w-full cursor-pointer m-0 text-center block"
 >
 🧬 Trace Dam Pedigree
 </button>
 )}
 </div>
 </div>

 {/* THIRD GENERATION: GRANDPARENTS */}
 <div className="flex flex-col justify-between space-y-4">
 {/* PATERNAL GRANDPARENTS */}
 <div className="space-y-2">
 <div className="p-3 bg-white border border-gray-200 border border-gray-200 rounded-xl">
 <span className="text-[7.5px] font-semibold  text-blue-600 block">Paternal Grand Sire</span>
 <span className="text-xs font-bold text-gray-900 block">{pedigreeCow.grandSirePaternal || 'Sire Sire G2 ♂'}</span>
 </div>
 <div className="p-3 bg-white border border-gray-200 border border-gray-200 rounded-xl">
 <span className="text-[7.5px] font-semibold  text-rose-600 block">Paternal Grand Dam</span>
 <span className="text-xs font-bold text-gray-900 block">{pedigreeCow.grandDamPaternal || 'Sire Dam G2 ♀'}</span>
 </div>
 </div>

 {/* MATERNAL GRANDPARENTS */}
 <div className="space-y-2 border-t border-gray-100 pt-3">
 <div className="p-3 bg-white border border-gray-200 border border-gray-200 rounded-xl">
 <span className="text-[7.5px] font-semibold  text-blue-600 block">Maternal Grand Sire</span>
 <span className="text-xs font-bold text-gray-900 block">{pedigreeCow.grandSireMaternal || 'Dam Sire G2 ♂'}</span>
 </div>
 <div className="p-3 bg-white border border-gray-200 border border-gray-200 rounded-xl">
 <span className="text-[7.5px] font-semibold  text-rose-600 block">Maternal Grand Dam</span>
 <span className="text-xs font-bold text-gray-900 block">{pedigreeCow.grandDamMaternal || 'Dam Dam G2 ♀'}</span>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Ancestry Inbreeding Risk Diagnostic */}
 {(() => {
 const sharedAncestors: string[] = [];
 const pSire = pedigreeCow.sire?.toLowerCase().trim();
 const mDam = pedigreeCow.dam?.toLowerCase().trim();
 const pGsp = pedigreeCow.grandSirePaternal?.toLowerCase().trim();
 const pGdp = pedigreeCow.grandDamPaternal?.toLowerCase().trim();
 const mGsm = pedigreeCow.grandSireMaternal?.toLowerCase().trim();
 const mGdm = pedigreeCow.grandDamMaternal?.toLowerCase().trim();

 if (pSire && pSire === mDam) sharedAncestors.push("Sire is same as Dam (Extreme Close Breeding!)");
 if (pGsp && (pGsp === mGsm || pGsp === mGdm)) sharedAncestors.push(`Paternal Grand Sire (${pedigreeCow.grandSirePaternal}) matches Maternal Grandparents`);
 if (pGdp && (pGdp === mGsm || pGdp === mGdm)) sharedAncestors.push(`Paternal Grand Dam (${pedigreeCow.grandDamPaternal}) matches Maternal Grandparents`);

 return sharedAncestors.length > 0 ? (
 <div className="p-4 bg-red-900/20 border border-red-200 rounded-2xl flex items-start gap-3 text-xs text-red-950">
 <span className="text-lg">⚠️</span>
 <div className="space-y-1">
 <span className="font-semibold tracking-tight block text-red-900 text-[10px]">Ancestry Inbreeding Conflict Alert!</span>
 <p className="font-semibold text-[11px]">
 Ancestral records indicate genetic overlap on both parental sides:
 </p>
 <ul className="list-disc pl-4 space-y-0.5 font-medium">
 {sharedAncestors.map((sa, idx) => <li key={idx}>{sa}</li>)}
 </ul>
 <span className="block text-[10px] text-red-700 italic pt-1 font-bold">
 Estimated Coefficient of Inbreeding (F) &ge; 12.5%. Proceed with outcross straws in future breeding.
 </span>
 </div>
 </div>
 ) : (
 <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-xs text-green-600">
 <span className="text-lg">✅</span>
 <div>
 <span className="font-bold  text-green-600 block text-[10px]">Inbreeding Coefficient (F) = 0.00% (Clean / Outcrossed)</span>
 <p className="text-[11px] font-medium text-green-600">
 No overlapping ancestral identifiers detected in the registered three-generation lineage. Excellent genetic diversity.
 </p>
 </div>
 </div>
 );
 })()}

 {/* Pedigree Certificate Actions (Download & Print) */}
 <div className="bg-white border border-gray-200 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3">
 <div className="flex items-center gap-2 text-xs font-semibold text-gray-900 font-medium text-center sm:text-left">
 <Sparkles className="text-green-600 shrink-0" size={15} />
 <span>Verified by JR Cooperative Registry board. Ready for local Studbook print download.</span>
 </div>
 <div className="flex gap-2 w-full sm:w-auto">
 <button
 type="button"
 onClick={() => handleDownloadPedigree(pedigreeCow)}
 className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white hover:bg-emerald-900 text-gray-900 font-semibold text-xs  rounded-xl transition-all shadow-sm cursor-pointer m-0"
 >
 <Download size={13} />
 Download Pedigree Slip (PDF)
 </button>
 <button
 type="button"
 onClick={() => handleDownloadPedigree(pedigreeCow)}
 className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 hover:bg-white text-gray-900 font-semibold text-xs  rounded-xl transition-all cursor-pointer m-0"
 title="Generate certified documentation of the breeding pedigree chart"
 >
 <Printer size={13} />
 Print Official Deed
 </button>
 </div>
 </div>
 </div>
 )}

 {/* Tab 2: Offspring & Descendants (Lineage Tracking) */}
 {pedigreeSubTab === 'offspring' && (
 <div className="space-y-6">
 <span className="text-[10px] font-semibold text-gray-900 font-medium  block mb-1 tracking-normal text-center">
 Live Downward Lineage Tracking & Descendant Registers
 </span>

 {/* Find Direct Offspring */}
 {(() => {
 const directOffspring = cows.filter(c => 
 (c.dam && (c.dam.toLowerCase() === pedigreeCow.id.toLowerCase() || c.dam.toLowerCase() === pedigreeCow.name.toLowerCase())) ||
 (c.sire && (c.sire.toLowerCase() === pedigreeCow.id.toLowerCase() || c.sire.toLowerCase() === pedigreeCow.name.toLowerCase()))
 );

 return (
 <div className="space-y-4">
 <div className="bg-white text-gray-900 rounded-2xl p-5 border border-emerald-900">
 <h4 className="text-xs font-semibold tracking-tight text-green-600">Direct Offspring (Generation F1)</h4>
 <p className="text-[11px] text-green-600 mt-0.5">
 Detected registered progeny in Nyaronde Herd that lists {pedigreeCow.name} as their dam or sire.
 </p>
 </div>

 {directOffspring.length === 0 ? (
 <div className="text-center py-8 bg-white border border-gray-200 rounded-2xl border border-gray-100">
 <span className="text-xl">🍼</span>
 <p className="text-xs text-gray-900 font-medium font-bold mt-2">No direct F1 descendants registered yet in this herd database.</p>
 <p className="text-[10px] text-gray-900 font-medium mt-1">Add calves or cows with parent Tag ID "{pedigreeCow.id}" to display them here.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {directOffspring.map(child => {
 // Find grandchildren (progeny of this child)
 const grandKids = cows.filter(g =>
 (g.dam && (g.dam.toLowerCase() === child.id.toLowerCase() || g.dam.toLowerCase() === child.name.toLowerCase())) ||
 (g.sire && (g.sire.toLowerCase() === child.id.toLowerCase() || g.sire.toLowerCase() === child.name.toLowerCase()))
 );

 return (
 <div key={child.id} className="bg-white border border-gray-200 border border-gray-200 rounded-2xl p-4 space-y-3 relative hover:border-emerald-600 transition-all">
 <div className="flex justify-between items-start">
 <div>
 <h5 className="font-semibold text-sm text-gray-900">{child.name}</h5>
 <span className="text-[10px] text-gray-900 font-medium font-bold font-mono">ID: {child.id} | Breed: {child.breed}</span>
 </div>
 <span className={`px-2 py-0.5 rounded text-[9px] font-semibold  ${
 child.status === 'Lactating' ? 'bg-emerald-100 text-green-600' : 'bg-amber-100 text-amber-950'
 }`}>
 {child.status}
 </span>
 </div>

 <div className="text-[11px] font-medium text-gray-900 font-medium space-y-1 bg-white shadow-sm p-2.5 rounded-xl border border-gray-100">
 <div>📅 Born: <strong>{child.dob}</strong> ({getCowAge(child.dob)})</div>
 <div>🥛 Average Daily Yield: <strong>{getAverageYield(child.id).toFixed(1)} L/day</strong></div>
 </div>

 {/* Grand offspring indicator */}
 {grandKids.length > 0 && (
 <div className="pt-2 border-t border-dashed border-gray-200">
 <span className="text-[8px] font-semibold  text-indigo-700 tracking-normal block mb-1">
 Grand-descendants (F2 Lineage) ({grandKids.length}):
 </span>
 <div className="flex flex-wrap gap-1.5">
 {grandKids.map(gk => (
 <span key={gk.id} className="inline-flex items-center gap-1 bg-indigo-900/20 border border-indigo-100 text-indigo-950 text-[9.5px] font-bold px-2 py-0.5 rounded-lg">
 👶 {gk.name} ({gk.id})
 </span>
 ))}
 </div>
 </div>
 )}

 <button
 type="button"
 onClick={() => {
 setPedigreeCow(child);
 setPedigreeSubTab('tree');
 }}
 className="w-full text-center text-[9.5px] font-semibold  text-green-600 bg-emerald-50 hover:bg-emerald-100 py-1.5 rounded-lg border-0 cursor-pointer transition-all"
 >
 Trace This Child's Lineage Tree &rarr;
 </button>
 </div>
 );
 })}
 </div>
 )}
 </div>
 );
 })()}
 </div>
 )}

 {/* Tab 3: Genetics & Potential Mate Predictor */}
 {pedigreeSubTab === 'genetics' && (
 <div className="space-y-6">
 <div className="bg-white border border-gray-200 p-4 rounded-2xl space-y-4">
 <div className="space-y-0.5">
 <h4 className="text-xs font-semibold  text-green-600 tracking-normal">🔬 Bovine Mating & Genetic Trait Predictor</h4>
 <p className="text-[11px] text-gray-900 font-medium leading-relaxed font-semibold">
 Predict the lactation potential, physical coat alleles, and inbreeding safety coefficients for a prospective calf by selecting a breeding mate.
 </p>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="text-[10px] font-semibold  text-gray-900 font-medium block mb-1">Subject Cow (Female Dam)</label>
 <div className="p-3 bg-white shadow-sm border border-gray-200 rounded-xl font-bold text-xs text-gray-900">
 {pedigreeCow.name} ({pedigreeCow.breed}) - Tag: {pedigreeCow.id}
 </div>
 </div>

 <div>
 <label className="text-[10px] font-semibold  text-gray-900 font-medium block mb-1">Select Breeding Sire (Semen Straw / Bull)</label>
 <select
 value={selectedMateId}
 onChange={(e) => setSelectedMateId(e.target.value)}
 className="w-full bg-white shadow-sm border border-gray-200 focus:border-emerald-700 rounded-xl px-3 py-3 font-bold text-xs cursor-pointer"
 >
 <option value="">-- Choose Mate --</option>
 {/* Premium custom straws */}
 <option value="straw-hf">Premium Semen: Holstein Ultimate-F (Peak: 45L)</option>
 <option value="straw-ay">Premium Semen: Ayrshire Redblood-7 (Peak: 38L)</option>
 <option value="straw-js">Premium Semen: Jersey Butterfat-Max (Peak: 34L)</option>
 {/* Registered bulls in the herd if any */}
 {cows.filter(c => c.id !== pedigreeCow.id).map(c => (
 <option key={c.id} value={c.id}>
 Registered: {c.name} ({c.breed}) - ID: {c.id}
 </option>
 ))}
 </select>
 </div>
 </div>
 </div>

 {selectedMateId ? (
 (() => {
 // Mating Simulation Logic
 let mateName = "Selected Sire";
 let mateBreed = pedigreeCow.breed;
 let matePeakTarget = 30;

 if (selectedMateId === 'straw-hf') {
 mateName = "Holstein Ultimate-F (Semen Straw)";
 mateBreed = "Holstein-Friesian";
 matePeakTarget = 45;
 } else if (selectedMateId === 'straw-ay') {
 mateName = "Ayrshire Redblood-7 (Semen Straw)";
 mateBreed = "Ayrshire";
 matePeakTarget = 38;
 } else if (selectedMateId === 'straw-js') {
 mateName = "Jersey Butterfat-Max (Semen Straw)";
 mateBreed = "Jersey";
 matePeakTarget = 34;
 } else {
 const matchedCow = cows.find(c => c.id === selectedMateId);
 if (matchedCow) {
 mateName = matchedCow.name;
 mateBreed = matchedCow.breed;
 matePeakTarget = matchedCow.peakYieldTarget || 30;
 }
 }

 // Compute inbreeding hazard
 const isSharedPedigree = selectedMateId !== 'straw-hf' && selectedMateId !== 'straw-ay' && selectedMateId !== 'straw-js' && (
 selectedMateId.toLowerCase() === pedigreeCow.sire?.toLowerCase().trim() ||
 selectedMateId.toLowerCase() === pedigreeCow.dam?.toLowerCase().trim()
 );

 // Compute lactation genetic merit (average of parents + 5% selection pressure)
 const damPeak = pedigreeCow.peakYieldTarget || 28;
 const predictedProgenyPeak = ((damPeak + matePeakTarget) / 2) * 1.05;

 return (
 <div className="space-y-4">
 <div className="bg-gradient-to-br from-indigo-950 to-indigo-900 text-gray-900 rounded-2xl p-5 border border-indigo-900 space-y-4">
 <h4 className="text-xs font-semibold  text-indigo-400 tracking-normal">📊 Expected Progeny Genetic Outcomes</h4>
 
 {isSharedPedigree && (
 <div className="p-3 bg-red-900/40 border border-red-500 rounded-xl text-xs text-red-100 flex items-center gap-2">
 <span>🛑</span>
 <span className="font-bold tracking-tight text-[10px]">CRITICAL INBREEDING WARNING: Mating Sire matches Proband Dam/Sire directly! Breeding discouraged.</span>
 </div>
 )}

 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
 <span className="text-[9px] text-indigo-300 block font-semibold tracking-tight mb-1">Expected Lactation Peak</span>
 <span className="text-base font-semibold font-mono text-yellow-700">{predictedProgenyPeak.toFixed(1)} Liters/day</span>
 <span className="text-[9px] text-gray-900/50 block font-medium mt-0.5">Estimated Breeding Value (EBV)</span>
 </div>

 <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
 <span className="text-[9px] text-indigo-300 block font-semibold tracking-tight mb-1">Inbreeding Coeff (F)</span>
 <span className={`text-base font-semibold font-mono ${isSharedPedigree ? 'text-red-700' : 'text-green-600'}`}>
 {isSharedPedigree ? '50.0% (Inbred)' : '0.0% (Safe)'}
 </span>
 <span className="text-[9px] text-gray-900/50 block font-medium mt-0.5">Pedigree Coincidence Check</span>
 </div>

 <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
 <span className="text-[9px] text-indigo-300 block font-semibold tracking-tight mb-1">Predicted Birth Weight</span>
 <span className="text-base font-semibold font-mono text-indigo-200">38 kg - 42 kg</span>
 <span className="text-[9px] text-gray-900/50 block font-medium mt-0.5">Breed Average Norm</span>
 </div>

 <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
 <span className="text-[9px] text-indigo-300 block font-semibold tracking-tight mb-1">Phenotypic Yield Gain</span>
 <span className="text-base font-semibold font-mono text-green-600">+1.5 L / Lactation</span>
 <span className="text-[9px] text-gray-900/50 block font-medium mt-0.5">Genetic Progress Speed</span>
 </div>
 </div>

 <div className="border-t border-gray-100 pt-4 space-y-3">
 <span className="text-[10px] text-indigo-300 font-semibold tracking-tight block">Predicted Allelic Inheritance (Punnett Square Probability):</span>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] font-medium text-gray-900 font-medium">
 <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg border border-white/5">
 <span>Coat Pattern:</span>
 <strong className="text-gray-900">Black-White (75% Dom) | Red-White (25% Rec)</strong>
 </div>
 <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg border border-white/5">
 <span>Horned Allele:</span>
 <strong className="text-gray-900">Polled Hornless (100% Dominant Heterozygous)</strong>
 </div>
 <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg border border-white/5">
 <span>Disease Resistance (Tick/Bovine):</span>
 <strong className="text-gray-900">High Resistance (F1 Hybrid Heterosis effect)</strong>
 </div>
 <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg border border-white/5">
 <span>Offspring Sex Probability:</span>
 <strong className="text-yellow-700">95% Female heifer (Sexed straw selected)</strong>
 </div>
 </div>
 </div>
 </div>

 {/* Sire Recommendations Matchmaker Matrix */}
 <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl space-y-2">
 <span className="text-[9.5px] font-semibold  text-green-600 block">💡 Stud Matchmaker Insights</span>
 <p className="text-[11px] text-green-600 leading-relaxed font-semibold">
 Recommended Straw choice for this mating: <strong className="text-green-600 font-semibold">Holstein Ultimate-F</strong>. It yields the highest genetic lactation transfer of <span className="underline">+{predictedProgenyPeak.toFixed(1)} L/day</span> with absolutely 0% risk of inbreeding depression.
 </p>
 </div>
 </div>
 );
 })()
 ) : (
 <div className="text-center py-10 bg-white border border-gray-200 rounded-2xl border border-gray-100">
 <span className="text-2xl">🧬</span>
 <p className="text-xs text-gray-900 font-medium font-bold mt-2">Select a prospective Sire/Straw above to execute mating simulation.</p>
 </div>
 )}
 </div>
 )}

 <div className="flex justify-between items-center pt-4 border-t border-gray-100">
 <span className="text-[10px] text-gray-900 font-medium font-mono font-bold">
 JR Farm Bovine Registry &bull; Verified Sovereignty System
 </span>

 <button
 type="button"
 onClick={() => {
 setPedigreeCow(null);
 setSelectedMateId('');
 }}
 className="px-5 py-2.5 bg-white border border-gray-200 hover:bg-white border border-gray-200 text-gray-900 font-medium font-semibold  text-xs rounded-xl transition-colors cursor-pointer m-0 border-0"
 >
 Close Family Tree
 </button>
 </div>

 </div>
 </div>
 )}
    </>
  );
}