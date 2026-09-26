import { jsPDF } from 'jspdf';
import { AvocadoRecord, AvocadoPracticeRecord, AvocadoSectionNote } from '../../types';
import { toIsoDate } from '../../utils/dateHelper';

export function generateAvocadoAuditPdf(
  avoRecords: AvocadoRecord[],
  practices: AvocadoPracticeRecord[],
  sectionNotes: AvocadoSectionNote[]
) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const emeraldGreen = [16, 185, 129];
  const avocadoDark = [22, 101, 52];
  const deepSlate = [15, 23, 42];

  // Top Ribbon
  doc.setFillColor(avocadoDark[0], avocadoDark[1], avocadoDark[2]);
  doc.rect(0, 0, 595.28, 48, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14.5);
  doc.text('JR FARM — EXPORT AVOCADO PRODUCTION, AGRONOMY & SALES AUDIT', 35, 30);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`GlobalGAP & KEPHIS Standards • Graded Sales & Rejection Loss • Disease Treatments • Generated: ${new Date().toLocaleString()}`, 35, 64);

  // Executive KPI Container
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(35, 74, 525, 75, 6, 6, 'FD');

  const totalG1 = avoRecords.reduce((sum, r) => sum + (r.grade1Kg || 0), 0);
  const totalRj = avoRecords.reduce((sum, r) => sum + (r.rejectKg || 0), 0);
  const totalKg = totalG1 + totalRj;
  const totalSales = avoRecords.reduce((sum, r) => sum + (r.totalSales || 0), 0);
  const totalDebts = avoRecords.reduce((sum, r) => sum + (r.debts || 0), 0);
  const totalRejectionLoss = avoRecords.reduce((sum, r) => {
    const loss = r.rejectionLossKes ?? (r.rejectKg * Math.max(0, (r.grade1PricePerKg - r.priceForRejects)));
    return sum + loss;
  }, 0);
  const g1Pct = totalKg > 0 ? Math.round((totalG1 / totalKg) * 100) : 0;
  const rjPct = totalKg > 0 ? Math.round((totalRj / totalKg) * 100) : 0;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(avocadoDark[0], avocadoDark[1], avocadoDark[2]);
  doc.text('EXECUTIVE EXPORT SUMMARY & REVENUE YIELD:', 48, 92);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(deepSlate[0], deepSlate[1], deepSlate[2]);
  doc.text(`Total Harvest: ${totalKg.toLocaleString()} KG`, 48, 108);
  doc.text(`Grade 1 Export: ${totalG1.toLocaleString()} KG (${g1Pct}%)`, 180, 108);
  doc.text(`Rejects: ${totalRj.toLocaleString()} KG (${rjPct}%)`, 340, 108);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(4, 120, 87); // Emerald
  doc.text(`Gross Sales Proceeds: KES ${Math.round(totalSales).toLocaleString()}`, 48, 126);

  doc.setTextColor(225, 29, 72); // Rose
  doc.text(`Rejection Opportunity Loss: KES ${Math.round(totalRejectionLoss).toLocaleString()}`, 260, 126);

  doc.setTextColor(180, 83, 9); // Amber
  doc.text(`Lot Debts: KES ${Math.round(totalDebts).toLocaleString()}`, 465, 126);

  // Section 1: Graded Sales Ledger & Buyers
  let yPos = 166;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(avocadoDark[0], avocadoDark[1], avocadoDark[2]);
  doc.text('1. GRADED AVOCADO SALES, BUYERS & REJECTION TRACKING', 35, yPos);

  yPos += 10;
  doc.setFillColor(22, 101, 52);
  doc.rect(35, yPos, 525, 16, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('DATE / LOT REF', 40, yPos + 11);
  doc.text('GRADE 1 (KG / PRICE / BUYER)', 125, yPos + 11);
  doc.text('REJECTS (KG / PRICE / BUYER)', 280, yPos + 11);
  doc.text('GROSS (KES)', 430, yPos + 11);
  doc.text('STATUS / DEBT', 495, yPos + 11);

  yPos += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);

  avoRecords.slice(0, 6).forEach((rec, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(241, 245, 249);
      doc.rect(35, yPos, 525, 15, 'F');
    }
    doc.text(`${rec.date} • ${rec.ref.slice(0, 10)}`, 40, yPos + 11);
    doc.text(`${rec.grade1Kg}kg @ Ksh${rec.grade1PricePerKg} (${(rec.grade1Buyer || 'Kakuzi').slice(0, 16)})`, 125, yPos + 11);
    doc.text(`${rec.rejectKg}kg @ Ksh${rec.priceForRejects} (${(rec.rejectBuyer || 'Local Puree').slice(0, 16)})`, 280, yPos + 11);
    doc.text(`Ksh ${(rec.totalSales || 0).toLocaleString()}`, 430, yPos + 11);
    doc.text(rec.debts > 0 ? `Debt: Ksh ${rec.debts}` : (rec.paymentStatus || 'Paid'), 495, yPos + 11);
    yPos += 15;
  });

  // Section 2: Routine Practices & Disease Treatments
  yPos += 18;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(avocadoDark[0], avocadoDark[1], avocadoDark[2]);
  doc.text('2. ROUTINE PRACTICES, DISEASE TREATMENTS & TRUNK COPPER PAINTING', 35, yPos);

  yPos += 10;
  doc.setFillColor(245, 158, 11); // Amber dark
  doc.rect(35, yPos, 525, 16, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('PRACTICE / TARGET DISEASE', 40, yPos + 11);
  doc.text('DATE', 170, yPos + 11);
  doc.text('DRUG / INVENTORY MATERIAL', 220, yPos + 11);
  doc.text('OPERATOR & METHOD', 370, yPos + 11);
  doc.text('NEXT DUE DATE', 485, yPos + 11);

  yPos += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);

  practices.slice(0, 6).forEach((p, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(241, 245, 249);
      doc.rect(35, yPos, 525, 15, 'F');
    }
    const practiceSummary = `${p.practiceType} - ${(p.targetDiseaseOrPest || p.reason || '').slice(0, 22)}`;
    doc.text(practiceSummary, 40, yPos + 11);
    doc.text(p.date, 170, yPos + 11);
    const drugSummary = `${(p.drugOrChemicalName || 'Manual Tool').slice(0, 24)}${p.inventoryQtyDeducted ? ` (-${p.inventoryQtyDeducted}${p.inventoryUnit || ''})` : ''}`;
    doc.text(drugSummary, 220, yPos + 11);
    doc.text(`${p.operator} • ${(p.dosageAndMethod || '').slice(0, 20)}`, 370, yPos + 11);
    doc.text(p.nextDueDate, 485, yPos + 11);
    yPos += 15;
  });

  // Section 3: Orchard Sections Field Health Notes
  yPos += 18;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(avocadoDark[0], avocadoDark[1], avocadoDark[2]);
  doc.text('3. ORCHARD SECTIONS STATUS & AGRONOMY NOTES', 35, yPos);

  yPos += 10;
  doc.setFillColor(71, 85, 105); // Slate
  doc.rect(35, yPos, 525, 16, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('SECTION / BLOCK', 40, yPos + 11);
  doc.text('TREES / VARIETY', 170, yPos + 11);
  doc.text('STAGE / HEALTH', 280, yPos + 11);
  doc.text('KEY OBSERVATION & ACTION PLAN', 380, yPos + 11);

  yPos += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);

  sectionNotes.slice(0, 5).forEach((sec, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(241, 245, 249);
      doc.rect(35, yPos, 525, 15, 'F');
    }
    doc.text(sec.sectionName.slice(0, 22), 40, yPos + 11);
    doc.text(`${sec.treeCount} trees • ${sec.variety.slice(0, 14)}`, 170, yPos + 11);
    doc.text(`${sec.phenologicalStage} (${sec.scoutingStatus.slice(0, 10)})`, 280, yPos + 11);
    doc.text(`${sec.notes.slice(0, 36)}...`, 380, yPos + 11);
    yPos += 15;
  });

  // Official Sign-off & Footer
  yPos = Math.max(yPos + 35, 750);
  doc.setDrawColor(203, 213, 225);
  doc.line(35, yPos, 560, yPos);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(deepSlate[0], deepSlate[1], deepSlate[2]);
  doc.text('Presented & Approved by: Dr. Devin Omwenga (General Farm Manager)', 35, yPos + 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('JR Farm Commercial Avocado Husbandry & GlobalGAP Export Certification Division • Verified KEPHIS Compliant', 35, yPos + 28);

  doc.save(`JR_Farm_Export_Avocado_Audit_${toIsoDate(new Date())}.pdf`);
}
