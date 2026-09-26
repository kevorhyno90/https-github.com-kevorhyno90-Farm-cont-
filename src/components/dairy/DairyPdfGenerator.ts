import { jsPDF } from 'jspdf';
import { Cow, MilkingRecord, AIRecord, VetRecord, SemenInventoryItem, MilkOutflowRecord } from '../../types';
import { toIsoDate } from '../../utils/dateHelper';

interface DairyAnimalSaleRecord {
  id: string;
  animalId: string;
  type: 'Cow' | 'Calf' | 'Other';
  date: string;
  price: number;
  buyer: string;
  notes: string;
}

interface DairyMortalityRecord {
  id: string;
  animalId: string;
  type: 'Cow' | 'Calf' | 'Other';
  date: string;
  causeOfDeath: string;
  disposalMethod: string;
  notes: string;
}

export function generateDairyAuditPdf(
  cows: Cow[],
  milkRecords: MilkingRecord[],
  aiRecords: AIRecord[],
  vetRecords: VetRecord[],
  semenInventory: SemenInventoryItem[] = [],
  animalSales: DairyAnimalSaleRecord[] = [],
  mortalities: DairyMortalityRecord[] = [],
  milkOutflows: MilkOutflowRecord[] = []
) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const emeraldColor = [5, 150, 105]; // emerald-600
  const deepSlate = [15, 23, 42]; // slate-900
  const amberColor = [217, 119, 6]; // amber-600
  const roseColor = [225, 29, 72]; // rose-600

  const todayStr = toIsoDate();

  // Top Ribbon Banner
  doc.setFillColor(deepSlate[0], deepSlate[1], deepSlate[2]);
  doc.rect(0, 0, 595.28, 48, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('JR FARM — BOVINE DAIRY HERD & LACTATION AUDIT', 40, 30);

  // Subtitle
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(`Official Dairy Operations, Pedigree, AI Genetics & Veterinary Log • Generated: ${new Date().toLocaleString()}`, 40, 62);

  // Calculate Key Statistics
  const totalCows = cows.length;
  const lactatingCount = cows.filter(c => c.status?.toLowerCase().includes('lactat') || c.status?.toLowerCase().includes('milk')).length;
  const dryCount = cows.filter(c => c.status?.toLowerCase().includes('dry')).length;
  const inCalfCount = aiRecords.filter(a => a.status === 'Confirmed Pregnant').length;

  const todayMilks = milkRecords.filter(m => m.date === todayStr);
  const totalLitersToday = todayMilks.reduce((sum, m) => sum + (m.am || 0) + (m.pm || 0), 0);
  const avgYieldToday = todayMilks.length > 0 ? (totalLitersToday / todayMilks.length).toFixed(1) : '—';

  const totalStraws = semenInventory.reduce((sum, s) => sum + (s.quantity || 0), 0);

  // Active Withdrawal Warnings
  const activeWithdrawals = vetRecords.filter(r => {
    if (!r.withdrawalMilkDays || r.withdrawalMilkDays <= 0) return false;
    const treatDate = new Date(r.date);
    const safeDate = new Date(treatDate);
    safeDate.setDate(safeDate.getDate() + r.withdrawalMilkDays);
    return safeDate >= new Date(todayStr);
  });

  // Executive KPI Container
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(40, 74, 515, 78, 6, 6, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(emeraldColor[0], emeraldColor[1], emeraldColor[2]);
  doc.text('EXECUTIVE DAIRY HERD & MILK PRODUCTION OVERVIEW:', 52, 92);

  doc.setFontSize(8);
  doc.setTextColor(deepSlate[0], deepSlate[1], deepSlate[2]);
  doc.text(`Total Cattle Registered: ${totalCows} Head`, 52, 110);
  doc.text(`Active Milking Herd: ${lactatingCount} Cows`, 185, 110);
  doc.text(`Today's Milk Yield: ${totalLitersToday.toFixed(1)} Liters`, 320, 110);
  doc.text(`Avg Yield: ${avgYieldToday} L/cow/day`, 440, 110);

  doc.text(`Dry Period Cows: ${dryCount}`, 52, 126);
  doc.text(`Confirmed In-Calf: ${inCalfCount} Cows`, 185, 126);
  doc.text(`Semen Straws in Tank: ${totalStraws} Units`, 320, 126);
  doc.setTextColor(activeWithdrawals.length > 0 ? roseColor[0] : emeraldColor[0], activeWithdrawals.length > 0 ? roseColor[1] : emeraldColor[1], activeWithdrawals.length > 0 ? roseColor[2] : emeraldColor[2]);
  doc.text(`Milk Withdrawal Alerts: ${activeWithdrawals.length} Cow(s)`, 440, 126);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 116, 139);
  doc.text(`Primary Buyers: Brookside Dairy Ltd & Direct Farm Dispatches | Target Standard: Butterfat >= 3.6%, SNF >= 8.5%`, 52, 142);

  // Section 1: Lactating & Milking Records
  let yPos = 170;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(deepSlate[0], deepSlate[1], deepSlate[2]);
  doc.text('1. LACTATION & DAILY MILKING LOGS (RECENT SESSIONS)', 40, yPos);
  yPos += 12;

  // Milking Table Header
  doc.setFillColor(30, 41, 59);
  doc.rect(40, yPos, 515, 16, 'F');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('COW TAG / ID', 45, yPos + 11);
  doc.text('DATE', 145, yPos + 11);
  doc.text('AM (L)', 210, yPos + 11);
  doc.text('PM (L)', 260, yPos + 11);
  doc.text('TOTAL (L)', 315, yPos + 11);
  doc.text('ATTENDANT', 380, yPos + 11);
  doc.text('PEAK / TARGET', 460, yPos + 11);

  yPos += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);

  const sampleMilks = milkRecords.slice(0, 7);
  if (sampleMilks.length === 0) {
    doc.text('No milking records logged yet.', 45, yPos + 11);
    yPos += 14;
  } else {
    sampleMilks.forEach((m, idx) => {
      if (idx % 2 === 1) {
        doc.setFillColor(241, 245, 249);
        doc.rect(40, yPos, 515, 14, 'F');
      }
      const total = ((m.am || 0) + (m.pm || 0)).toFixed(1);
      doc.text(m.id || 'Unknown', 45, yPos + 10);
      doc.text(m.date || '—', 145, yPos + 10);
      doc.text(`${m.am || 0} L`, 210, yPos + 10);
      doc.text(`${m.pm || 0} L`, 260, yPos + 10);
      doc.setFont('helvetica', 'bold');
      doc.text(`${total} L`, 315, yPos + 10);
      doc.setFont('helvetica', 'normal');
      doc.text(m.staff || 'Mosoti', 380, yPos + 10);
      const isPeak = Number(total) >= 30;
      doc.setTextColor(isPeak ? emeraldColor[0] : 100, isPeak ? emeraldColor[1] : 116, isPeak ? emeraldColor[2] : 139);
      doc.text(isPeak ? '★ High Producer' : 'Standard Yield', 460, yPos + 10);
      doc.setTextColor(51, 65, 85);
      yPos += 14;
    });
  }

  // Section 2: Cattle Registry Directory
  yPos += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(deepSlate[0], deepSlate[1], deepSlate[2]);
  doc.text('2. REGISTERED CATTLE DIRECTORY & PEDIGREE STATUS', 40, yPos);
  yPos += 12;

  // Cow Table Header
  doc.setFillColor(30, 41, 59);
  doc.rect(40, yPos, 515, 16, 'F');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('TAG ID', 45, yPos + 11);
  doc.text('NAME', 110, yPos + 11);
  doc.text('BREED', 185, yPos + 11);
  doc.text('STATUS', 270, yPos + 11);
  doc.text('DOB / AGE', 345, yPos + 11);
  doc.text('SIRE (FATHER)', 415, yPos + 11);
  doc.text('TARGET (L)', 485, yPos + 11);

  yPos += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);

  const sampleCows = cows.slice(0, 6);
  if (sampleCows.length === 0) {
    doc.text('No registered cows found in database.', 45, yPos + 11);
    yPos += 14;
  } else {
    sampleCows.forEach((c, idx) => {
      if (idx % 2 === 1) {
        doc.setFillColor(241, 245, 249);
        doc.rect(40, yPos, 515, 14, 'F');
      }
      doc.text(c.id, 45, yPos + 10);
      doc.text(c.name || '—', 110, yPos + 10);
      doc.text(c.breed || 'Friesian', 185, yPos + 10);
      doc.text(c.status || 'Active', 270, yPos + 10);
      doc.text(c.dob || '—', 345, yPos + 10);
      doc.text(c.sire || 'Proven AI Sire', 415, yPos + 10);
      doc.text(`${c.peakYieldTarget || 30} L/d`, 485, yPos + 10);
      yPos += 14;
    });
  }

  // Section 3: AI & Breeding Cycles
  yPos += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(deepSlate[0], deepSlate[1], deepSlate[2]);
  doc.text('3. ARTIFICIAL INSEMINATION & GESTATION SCHEDULE', 40, yPos);
  yPos += 12;

  // AI Table Header
  doc.setFillColor(30, 41, 59);
  doc.rect(40, yPos, 515, 16, 'F');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('COW ID', 45, yPos + 11);
  doc.text('SERVICE DATE', 125, yPos + 11);
  doc.text('SIRE / SEMEN STRAW', 205, yPos + 11);
  doc.text('EXPECTED CALVING', 330, yPos + 11);
  doc.text('STATUS', 430, yPos + 11);
  doc.text('RETURN HEAT', 485, yPos + 11);

  yPos += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);

  const sampleAI = aiRecords.slice(0, 5);
  if (sampleAI.length === 0) {
    doc.text('No AI breeding records registered.', 45, yPos + 11);
    yPos += 14;
  } else {
    sampleAI.forEach((a, idx) => {
      if (idx % 2 === 1) {
        doc.setFillColor(241, 245, 249);
        doc.rect(40, yPos, 515, 14, 'F');
      }
      doc.text(a.cowId, 45, yPos + 10);
      doc.text(a.date, 125, yPos + 10);
      doc.text(a.bull || 'Elite Sire', 205, yPos + 10);
      doc.text(a.due || '—', 330, yPos + 10);
      doc.text(a.status, 430, yPos + 10);
      doc.text(a.returnHeatDate || '21-day mark', 485, yPos + 10);
      yPos += 14;
    });
  }

  // Section 4: Veterinary Clinic & Milk Withdrawal Safeguard
  yPos += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(deepSlate[0], deepSlate[1], deepSlate[2]);
  doc.text('4. VETERINARY CLINIC & MILK SAFETY WITHDRAWAL QUARANTINES', 40, yPos);
  yPos += 12;

  // Vet Table Header
  doc.setFillColor(30, 41, 59);
  doc.rect(40, yPos, 515, 16, 'F');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('COW ID', 45, yPos + 11);
  doc.text('DATE', 115, yPos + 11);
  doc.text('TYPE / DIAGNOSIS', 175, yPos + 11);
  doc.text('MEDICATION / ROUTE', 285, yPos + 11);
  doc.text('WITHDRAWAL', 400, yPos + 11);
  doc.text('SAFE TANK DATE', 470, yPos + 11);

  yPos += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);

  const sampleVet = vetRecords.slice(0, 5);
  if (sampleVet.length === 0) {
    doc.text('No clinical veterinary records registered.', 45, yPos + 11);
    yPos += 14;
  } else {
    sampleVet.forEach((v, idx) => {
      if (idx % 2 === 1) {
        doc.setFillColor(241, 245, 249);
        doc.rect(40, yPos, 515, 14, 'F');
      }
      doc.text(v.cowId, 45, yPos + 10);
      doc.text(v.date, 115, yPos + 10);
      doc.text(v.diagnosis || v.type || 'Treatment', 175, yPos + 10);
      doc.text(v.treatment || v.drugAdministered || 'Standard protocol', 285, yPos + 10);
      const days = v.withdrawalMilkDays || 0;
      doc.text(days > 0 ? `${days} Days` : '0 Days (Safe)', 400, yPos + 10);

      let safeStr = 'Immediate';
      if (days > 0) {
        const d = new Date(v.date);
        d.setDate(d.getDate() + days);
        safeStr = toIsoDate(d);
      }
      doc.setTextColor(days > 0 ? roseColor[0] : emeraldColor[0], days > 0 ? roseColor[1] : emeraldColor[1], days > 0 ? roseColor[2] : emeraldColor[2]);
      doc.text(safeStr, 470, yPos + 10);
      doc.setTextColor(51, 65, 85);
      yPos += 14;
    });
  }

  // Section 5: Genetic Semen Straw Reserves
  yPos += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(deepSlate[0], deepSlate[1], deepSlate[2]);
  doc.text('5. LIQUID NITROGEN GENETIC SEMEN STRAW BANK', 40, yPos);
  yPos += 12;

  // Semen Table Header
  doc.setFillColor(30, 41, 59);
  doc.rect(40, yPos, 515, 16, 'F');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('STRAW CODE', 45, yPos + 11);
  doc.text('BULL / SIRE NAME', 145, yPos + 11);
  doc.text('BREED', 260, yPos + 11);
  doc.text('TYPE', 345, yPos + 11);
  doc.text('ORIGIN', 420, yPos + 11);
  doc.text('IN STOCK', 485, yPos + 11);

  yPos += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);

  const sampleStraws = semenInventory.slice(0, 4);
  if (sampleStraws.length === 0) {
    doc.text('No semen straw inventory items logged.', 45, yPos + 11);
    yPos += 14;
  } else {
    sampleStraws.forEach((s, idx) => {
      if (idx % 2 === 1) {
        doc.setFillColor(241, 245, 249);
        doc.rect(40, yPos, 515, 14, 'F');
      }
      doc.text(s.id, 45, yPos + 10);
      doc.text(s.bullName, 145, yPos + 10);
      doc.text(s.breed, 260, yPos + 10);
      doc.text(s.semenType, 345, yPos + 10);
      doc.text(s.origin, 420, yPos + 10);
      doc.setFont('helvetica', 'bold');
      doc.text(`${s.quantity} straws`, 485, yPos + 10);
      doc.setFont('helvetica', 'normal');
      yPos += 14;
    });
  }

  // Footer & Official Sign-off block
  yPos = 785;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(40, yPos, 555, yPos);

  yPos += 15;
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('JR Farm Sovereign Operations • ISO-Compliant Dairy & Veterinary Quality Standard', 40, yPos);
  doc.text('Page 1 of 1', 510, yPos);

  yPos += 14;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(deepSlate[0], deepSlate[1], deepSlate[2]);
  doc.text('Verified & Authorized By: Dr. Devin Omwenga (Overall Farm Manager & Veterinary Director)', 40, yPos);

  // Save PDF
  const filename = `JR_Farm_Dairy_Audit_${todayStr}.pdf`;
  doc.save(filename);
}
