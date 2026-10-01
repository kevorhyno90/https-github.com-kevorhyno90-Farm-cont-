import { jsPDF } from 'jspdf';
import { PoultryFlock, PoultryEggRecord, PoultryHealthRecord, PoultryMortalityRecord } from '../../types';
import { toIsoDate } from '../../utils/dateHelper';

export function generatePoultryAuditPdf(
  flocks: PoultryFlock[],
  eggRecords: PoultryEggRecord[],
  healthRecords: PoultryHealthRecord[],
  mortalityRecords: PoultryMortalityRecord[]
) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const emeraldColor = [16, 185, 129];
  const warmAmber = [217, 119, 6];
  const deepSlate = [15, 23, 42];

  // Top Ribbon
  doc.setFillColor(deepSlate[0], deepSlate[1], deepSlate[2]);
  doc.rect(0, 0, 595.28, 48, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('JR FARM — AVIAN & POULTRY HERD AUDIT', 40, 30);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Comprehensive Flock Registry • Daily & Monthly Egg Ledger • Health & Mortality • ${toIsoDate(new Date())}`, 40, 64);

  // Executive KPI Container
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(40, 76, 515, 74, 6, 6, 'FD');

  const totalBirds = flocks.reduce((acc, f) => acc + (f.currentCount || 0), 0);
  const chickenCount = flocks.filter(f => f.species === 'Chicken').reduce((acc, f) => acc + (f.currentCount || 0), 0);
  const duckCount = flocks.filter(f => f.species === 'Duck').reduce((acc, f) => acc + (f.currentCount || 0), 0);
  const activeLayers = flocks.filter(f => f.stateOfProduction === 'Active Egg Laying').reduce((acc, f) => acc + (f.currentCount || 0), 0);
  
  const totalEggsLogged = eggRecords.reduce((acc, e) => acc + (e.goodEggsCount || 0), 0);
  const totalCratesLogged = eggRecords.reduce((acc, e) => acc + (e.cratesCollected || 0), 0);
  const totalCracked = eggRecords.reduce((acc, e) => acc + (e.crackedEggsCount || 0), 0);
  const activeHealthAlerts = healthRecords.filter(h => h.outcome === 'Under Treatment').length;
  const totalCulledOrDied = mortalityRecords.reduce((acc, m) => acc + (m.count || 0), 0);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(warmAmber[0], warmAmber[1], warmAmber[2]);
  doc.text('EXECUTIVE AVIAN AUDIT METRICS:', 55, 93);

  doc.setFontSize(8.5);
  doc.setTextColor(deepSlate[0], deepSlate[1], deepSlate[2]);
  doc.text(`Total Flock Headcount: ${totalBirds} Birds`, 55, 110);
  doc.text(`Chickens: ${chickenCount} Head`, 200, 110);
  doc.text(`Ducks: ${duckCount} Head`, 320, 110);
  doc.text(`Active Laying Stock: ${activeLayers} Birds`, 430, 110);

  doc.text(`Logged Egg Yield: ${totalEggsLogged.toLocaleString()} Eggs (${totalCratesLogged} Crates)`, 55, 126);
  doc.text(`Cracked / Reject: ${totalCracked} Eggs`, 260, 126);
  doc.text(`Active Health Cases: ${activeHealthAlerts}`, 410, 126);

  doc.text(`Total Culled / Mortalities: ${totalCulledOrDied} Birds`, 55, 142);
  doc.text(`Active Flocks / Groups: ${flocks.length} Cohorts`, 260, 142);
  doc.text(`Auditor: Dr. Devin Omwenga`, 410, 142);

  // Section 1: Flock Registry
  let yPos = 170;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(deepSlate[0], deepSlate[1], deepSlate[2]);
  doc.text('1. POULTRY & WATERFOWL FLOCK / GROUP REGISTRY', 40, yPos);

  yPos += 14;
  doc.setFillColor(241, 245, 249);
  doc.rect(40, yPos, 515, 18, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text('FLOCK / GROUP NAME', 45, yPos + 12);
  doc.text('SPECIES', 190, yPos + 12);
  doc.text('STAGE', 245, yPos + 12);
  doc.text('STATE / STATUS', 335, yPos + 12);
  doc.text('COUNT', 440, yPos + 12);
  doc.text('HOUSING PEN', 485, yPos + 12);

  yPos += 18;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);

  flocks.slice(0, 10).forEach((flk, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(40, yPos, 515, 15, 'F');
    }
    const truncatedName = flk.flockName.length > 26 ? flk.flockName.substring(0, 24) + '..' : flk.flockName;
    doc.text(truncatedName, 45, yPos + 10);
    doc.text(flk.species, 190, yPos + 10);
    doc.text(flk.stage.split('/')[0].trim(), 245, yPos + 10);
    doc.text(flk.stateOfProduction.substring(0, 18), 335, yPos + 10);
    doc.text(`${flk.currentCount} bds`, 440, yPos + 10);
    doc.text(flk.housingPen.substring(0, 14), 485, yPos + 10);
    yPos += 15;
  });

  // Section 2: Recent Egg Collections
  yPos += 15;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(deepSlate[0], deepSlate[1], deepSlate[2]);
  doc.text('2. RECENT DAILY EGG COLLECTIONS & PRODUCTION METRICS', 40, yPos);

  yPos += 14;
  doc.setFillColor(241, 245, 249);
  doc.rect(40, yPos, 515, 18, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text('DATE', 45, yPos + 12);
  doc.text('FLOCK', 105, yPos + 12);
  doc.text('GOOD EGGS', 230, yPos + 12);
  doc.text('CRACKED', 295, yPos + 12);
  doc.text('CRATES (30s)', 355, yPos + 12);
  doc.text('LAY RATE %', 430, yPos + 12);
  doc.text('COLLECTOR', 495, yPos + 12);

  yPos += 18;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);

  eggRecords.slice(0, 8).forEach((egg, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(40, yPos, 515, 15, 'F');
    }
    const truncatedFlock = egg.flockName.length > 22 ? egg.flockName.substring(0, 20) + '..' : egg.flockName;
    doc.text(egg.date, 45, yPos + 10);
    doc.text(truncatedFlock, 105, yPos + 10);
    doc.text(`${egg.goodEggsCount} pcs`, 230, yPos + 10);
    doc.text(`${egg.crackedEggsCount || 0} pcs`, 295, yPos + 10);
    doc.text(`${egg.cratesCollected} crt + ${egg.cratesLooseRemainder || 0}`, 355, yPos + 10);
    doc.text(`${egg.layRatePercentage ? egg.layRatePercentage.toFixed(1) : 0}%`, 430, yPos + 10);
    doc.text((egg.collectedBy || 'Staff').substring(0, 11), 495, yPos + 10);
    yPos += 15;
  });

  // Section 3: Health & Vaccination Log
  yPos += 15;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(deepSlate[0], deepSlate[1], deepSlate[2]);
  doc.text('3. HEALTH, DISEASES & VACCINATIONS AUDIT', 40, yPos);

  yPos += 14;
  doc.setFillColor(241, 245, 249);
  doc.rect(40, yPos, 515, 18, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text('DATE', 45, yPos + 12);
  doc.text('FLOCK', 105, yPos + 12);
  doc.text('CONDITION / VACCINE', 220, yPos + 12);
  doc.text('DRUG / ROUTE', 350, yPos + 12);
  doc.text('WITHDRAWAL', 450, yPos + 12);
  doc.text('OUTCOME', 505, yPos + 12);

  yPos += 18;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);

  healthRecords.slice(0, 6).forEach((h, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(40, yPos, 515, 15, 'F');
    }
    doc.text(h.dateRecorded, 45, yPos + 10);
    doc.text(h.flockName.substring(0, 18), 105, yPos + 10);
    doc.text(h.diseaseOrCondition.substring(0, 22), 220, yPos + 10);
    doc.text(h.drugsOrVaccineUsed.substring(0, 18), 350, yPos + 10);
    doc.text(`${h.withdrawalPeriodDays} days`, 450, yPos + 10);
    doc.text(h.outcome === 'Fully Recovered' ? 'Recovered' : 'Treated', 505, yPos + 10);
    yPos += 15;
  });

  // Section 4: Culling & Mortality Summary
  yPos += 15;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(deepSlate[0], deepSlate[1], deepSlate[2]);
  doc.text('4. CULLING & MORTALITY AUDIT', 40, yPos);

  yPos += 14;
  doc.setFillColor(241, 245, 249);
  doc.rect(40, yPos, 515, 18, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text('DATE', 45, yPos + 12);
  doc.text('FLOCK', 105, yPos + 12);
  doc.text('TYPE / CAUSE', 230, yPos + 12);
  doc.text('COUNT', 380, yPos + 12);
  doc.text('DISPOSAL / MEAT SALE', 430, yPos + 12);

  yPos += 18;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);

  mortalityRecords.slice(0, 5).forEach((m, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(40, yPos, 515, 15, 'F');
    }
    doc.text(m.date, 45, yPos + 10);
    doc.text(m.flockName.substring(0, 20), 105, yPos + 10);
    doc.text(`${m.type.split('(')[0].trim()}: ${m.primaryCause.substring(0, 22)}`, 230, yPos + 10);
    doc.text(`${m.count} birds`, 380, yPos + 10);
    doc.text(m.revenueCollectedKsh ? `Sold: Ksh ${m.revenueCollectedKsh}` : m.disposalMethod.substring(0, 18), 430, yPos + 10);
    yPos += 15;
  });

  // Footer / Sign-off
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 116, 139);
  doc.text('JR Farm Avian Management Directorate • Compliant with Veterinary Public Health Biosecurity Regulations', 40, pageHeight - 25);
  doc.text(`Authorized by: Dr. Devin Omwenga • Timestamp: ${new Date().toISOString()}`, 350, pageHeight - 25);

  doc.save(`JR_Farm_Poultry_Audit_${toIsoDate(new Date())}.pdf`);
}
