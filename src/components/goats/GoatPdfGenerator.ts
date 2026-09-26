import { jsPDF } from 'jspdf';
import { GoatRecord, GoatBreedingRecord, GoatTreatmentRecord, GoatKidRecord } from '../../types';
import { toIsoDate } from '../../utils/dateHelper';

export function generateGoatHerdAuditPdf(
  goats: GoatRecord[],
  breedings: GoatBreedingRecord[],
  treatments: GoatTreatmentRecord[],
  kids: GoatKidRecord[]
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
  doc.setFontSize(15);
  doc.text('JR FARM — CAPRINE DUAL-PURPOSE HERD AUDIT', 40, 30);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Dual-Purpose Caprine Registry • Breeding, Treatments & Kids Nursery • Generated: ${new Date().toLocaleString()}`, 40, 64);

  // Executive KPI Container
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(40, 76, 515, 68, 6, 6, 'FD');

  const totalHead = goats.length;
  const milkingDoes = goats.filter(g => (g.milkYieldLiters || 0) > 0 || g.status === 'Active Lactating').length;
  const totalDailyMilk = goats.reduce((sum, g) => sum + (g.milkYieldLiters || 0), 0);
  const totalKids = kids.length;
  const activeTreatments = treatments.filter(t => t.recoveryStatus !== 'Fully Recovered').length;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(warmAmber[0], warmAmber[1], warmAmber[2]);
  doc.text('EXECUTIVE CAPRINE HERD SUMMARY (DUAL-PURPOSE MILK & MEAT):', 55, 94);

  doc.setFontSize(8.5);
  doc.setTextColor(deepSlate[0], deepSlate[1], deepSlate[2]);
  doc.text(`Total Headcount: ${totalHead} Goats`, 55, 112);
  doc.text(`Active Milking Does: ${milkingDoes}`, 180, 112);
  doc.text(`Total Daily Milk: ${totalDailyMilk.toFixed(1)} L/day`, 310, 112);
  doc.text(`Nursery Kids: ${totalKids} Kids`, 440, 112);

  doc.text(`Active Breedings / Gestating: ${breedings.filter(b => b.pregnancyStatus === 'Confirmed Pregnant').length}`, 55, 128);
  doc.text(`Active Treatments / Quarantine: ${activeTreatments}`, 240, 128);
  doc.text(`Average Bodyweight: ~${Math.round(goats.reduce((s, g) => s + (g.weightKg || 45), 0) / (totalHead || 1))} kg`, 410, 128);

  // Section 1: Adult Dual-Purpose Goat Registry
  let yPos = 160;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(deepSlate[0], deepSlate[1], deepSlate[2]);
  doc.text('1. DUAL-PURPOSE GOAT REGISTRY (MILK & MEAT)', 40, yPos);
  yPos += 14;

  // Table Header
  doc.setFillColor(30, 41, 59);
  doc.rect(40, yPos, 515, 18, 'F');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('TAG ID / NAME', 45, yPos + 12);
  doc.text('BREED', 160, yPos + 12);
  doc.text('SEX', 240, yPos + 12);
  doc.text('WEIGHT', 285, yPos + 12);
  doc.text('MILK YIELD', 345, yPos + 12);
  doc.text('PARITY', 415, yPos + 12);
  doc.text('STATUS', 465, yPos + 12);

  yPos += 18;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);

  goats.slice(0, 8).forEach((g, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(241, 245, 249);
      doc.rect(40, yPos, 515, 15, 'F');
    }
    doc.text(g.name ? `${g.tagId} (${g.name})` : g.tagId, 45, yPos + 11);
    doc.text(g.breed || 'Dual-Purpose', 160, yPos + 11);
    doc.text(g.sex || g.gender || 'Doe', 240, yPos + 11);
    doc.text(g.weightKg ? `${g.weightKg} kg` : '48 kg', 285, yPos + 11);
    doc.text(g.milkYieldLiters ? `${g.milkYieldLiters} L/d` : '—', 345, yPos + 11);
    doc.text(g.parity ? `Parity ${g.parity}` : 'P-1', 415, yPos + 11);
    doc.text(g.status || 'Active', 465, yPos + 11);
    yPos += 15;
  });

  // Section 2: Active Breeding & Mating Records
  yPos += 15;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(deepSlate[0], deepSlate[1], deepSlate[2]);
  doc.text('2. BREEDING, MATING & KIDDING SCHEDULE', 40, yPos);
  yPos += 14;

  doc.setFillColor(30, 41, 59);
  doc.rect(40, yPos, 515, 18, 'F');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('DOE TAG', 45, yPos + 12);
  doc.text('SIRE / BUCK', 140, yPos + 12);
  doc.text('MATING DATE', 230, yPos + 12);
  doc.text('EXPECTED KIDDING', 315, yPos + 12);
  doc.text('PREGNANCY STATUS', 415, yPos + 12);
  doc.text('OUTCOME', 495, yPos + 12);

  yPos += 18;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);

  breedings.slice(0, 5).forEach((b, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(241, 245, 249);
      doc.rect(40, yPos, 515, 15, 'F');
    }
    doc.text(b.doeTagId, 45, yPos + 11);
    doc.text(b.buckTagId, 140, yPos + 11);
    doc.text(b.matingDate, 230, yPos + 11);
    doc.text(b.expectedKiddingDate, 315, yPos + 11);
    doc.text(b.pregnancyStatus, 415, yPos + 11);
    doc.text(b.kidsCountBorn ? `${b.kidsCountBorn} Kids` : 'Pending', 495, yPos + 11);
    yPos += 15;
  });

  // Section 3: Caprine Veterinary Treatments & Withdrawal Periods
  yPos += 15;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(deepSlate[0], deepSlate[1], deepSlate[2]);
  doc.text('3. VETERINARY TREATMENTS & WITHDRAWAL PERIODS', 40, yPos);
  yPos += 14;

  doc.setFillColor(30, 41, 59);
  doc.rect(40, yPos, 515, 18, 'F');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('DATE', 45, yPos + 12);
  doc.text('GOAT TAG', 115, yPos + 12);
  doc.text('DIAGNOSIS', 190, yPos + 12);
  doc.text('DRUG / DOSAGE', 300, yPos + 12);
  doc.text('WITHDRAWAL', 415, yPos + 12);
  doc.text('RECOVERY', 485, yPos + 12);

  yPos += 18;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);

  treatments.slice(0, 5).forEach((t, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(241, 245, 249);
      doc.rect(40, yPos, 515, 15, 'F');
    }
    doc.text(t.treatmentDate, 45, yPos + 11);
    doc.text(t.goatTagId, 115, yPos + 11);
    doc.text(t.diagnosis, 190, yPos + 11);
    doc.text(`${t.medication} (${t.dosage})`, 300, yPos + 11);
    doc.text(`M: ${t.withdrawalMilkDays}d | Mt: ${t.withdrawalMeatDays}d`, 415, yPos + 11);
    doc.text(t.recoveryStatus, 485, yPos + 11);
    yPos += 15;
  });

  // Section 4: Nursery Kids Growth & Weaning
  yPos += 15;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(deepSlate[0], deepSlate[1], deepSlate[2]);
  doc.text('4. KIDS NURSERY REGISTRY (DUAL-PURPOSE GROWTH & WEANING)', 40, yPos);
  yPos += 14;

  doc.setFillColor(30, 41, 59);
  doc.rect(40, yPos, 515, 18, 'F');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('KID TAG / NAME', 45, yPos + 12);
  doc.text('SEX', 150, yPos + 12);
  doc.text('DOB', 200, yPos + 12);
  doc.text('BIRTH WT', 265, yPos + 12);
  doc.text('CURR WT', 325, yPos + 12);
  doc.text('DAM / SIRE', 390, yPos + 12);
  doc.text('WEANING STATUS', 475, yPos + 12);

  yPos += 18;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);

  kids.slice(0, 5).forEach((k, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(241, 245, 249);
      doc.rect(40, yPos, 515, 15, 'F');
    }
    doc.text(k.kidName ? `${k.kidTagId} (${k.kidName})` : k.kidTagId, 45, yPos + 11);
    doc.text(k.sex, 150, yPos + 11);
    doc.text(k.dob, 200, yPos + 11);
    doc.text(`${k.birthWeightKg} kg`, 265, yPos + 11);
    doc.text(`${k.currentWeightKg} kg`, 325, yPos + 11);
    doc.text(`${k.damTagId} / ${k.sireTagId}`, 390, yPos + 11);
    doc.text(k.weaningStatus, 475, yPos + 11);
    yPos += 15;
  });

  // Footer & Official Signoff
  yPos = Math.max(yPos + 25, 750);
  doc.setDrawColor(203, 213, 225);
  doc.line(40, yPos, 555, yPos);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(deepSlate[0], deepSlate[1], deepSlate[2]);
  doc.text('Presented & Approved by: Dr. Devin Omwenga (General Farm Manager)', 40, yPos + 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('JR Farm Dual-Purpose Caprine Husbandry Division • Certified Biosecure Stalls & Clean Milk Parlor', 40, yPos + 28);

  doc.save(`JR_Farm_Goat_Herd_Audit_${toIsoDate(new Date())}.pdf`);
}
