import { jsPDF } from 'jspdf';
import { TeaRecord, TeaPracticeRecord } from '../../types';
import { toIsoDate } from '../../utils/dateHelper';

export function generateTeaAuditPdf(
  teaRecords: TeaRecord[],
  practices: TeaPracticeRecord[],
  casualRatePerKg: number = 12,
  factoryPricePerKg: number = 58
) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const emeraldGreen = [16, 185, 129];
  const forestDark = [6, 78, 59];
  const deepSlate = [15, 23, 42];

  // Top Ribbon
  doc.setFillColor(forestDark[0], forestDark[1], forestDark[2]);
  doc.rect(0, 0, 595.28, 48, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('JR FARM — TEA HARVEST, CASUAL PAYROLL & AGRONOMY AUDIT', 40, 30);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Commercial Green Leaf Ledger • Saturday Casual Wage Audits & Field Agronomy • Generated: ${new Date().toLocaleString()}`, 40, 64);

  // Executive KPI Summary Container
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(40, 76, 515, 70, 6, 6, 'FD');

  const totalKg = teaRecords.reduce((sum, r) => sum + (r.qty || 0), 0);
  const totalCasualKg = teaRecords.reduce((sum, r) => sum + (r.casualPluckedKg || (r.qty * 0.6)), 0);
  const totalEmployeeKg = teaRecords.reduce((sum, r) => sum + (r.employeePluckedKg || (r.qty * 0.4)), 0);
  const totalCasualCashPaid = teaRecords.reduce((sum, r) => sum + (r.casualPayoutKes || (r.casualPluckedKg ? r.casualPluckedKg * casualRatePerKg : (r.qty * 0.6 * casualRatePerKg))), 0);
  const totalGrossRevenue = teaRecords.reduce((sum, r) => sum + (r.totalSales || (r.qty * factoryPricePerKg)), 0);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(forestDark[0], forestDark[1], forestDark[2]);
  doc.text('EXECUTIVE TEA PRODUCTION & CASUAL LABOUR SUMMARY:', 55, 94);

  doc.setFontSize(8.5);
  doc.setTextColor(deepSlate[0], deepSlate[1], deepSlate[2]);
  doc.text(`Total Green Leaf Harvested: ${totalKg.toLocaleString()} KG`, 55, 112);
  doc.text(`Casual Pluckers: ${Math.round(totalCasualKg).toLocaleString()} KG (${totalKg > 0 ? Math.round((totalCasualKg / totalKg) * 100) : 0}%)`, 240, 112);
  doc.text(`Permanent Staff: ${Math.round(totalEmployeeKg).toLocaleString()} KG (${totalKg > 0 ? Math.round((totalEmployeeKg / totalKg) * 100) : 0}%)`, 400, 112);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(180, 83, 9); // Amber
  doc.text(`Total Saturday Cash Paid (Casuals Only): KES ${Math.round(totalCasualCashPaid).toLocaleString()}`, 55, 128);

  doc.setTextColor(4, 120, 87); // Emerald
  doc.text(`Gross Factory Value (@ Ksh ${factoryPricePerKg}/kg): KES ${Math.round(totalGrossRevenue).toLocaleString()}`, 310, 128);

  // Section 1: Daily Harvests & Scale Weighbridge Deliveries
  let yPos = 162;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(deepSlate[0], deepSlate[1], deepSlate[2]);
  doc.text('1. DAILY HARVEST RECEIPTS & SCALE LISTINGS', 40, yPos);
  yPos += 14;

  // Table Header
  doc.setFillColor(30, 41, 59);
  doc.rect(40, yPos, 515, 18, 'F');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('DATE', 45, yPos + 12);
  doc.text('RECEIPT / TICKET REF', 110, yPos + 12);
  doc.text('CASUAL KG', 225, yPos + 12);
  doc.text('STAFF KG', 290, yPos + 12);
  doc.text('TOTAL KG', 355, yPos + 12);
  doc.text('CASUAL PAY', 420, yPos + 12);
  doc.text('BUYER / FACTORY', 480, yPos + 12);

  yPos += 18;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);

  teaRecords.slice(0, 12).forEach((r, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(241, 245, 249);
      doc.rect(40, yPos, 515, 15, 'F');
    }
    const cKg = r.casualPluckedKg || Math.round(r.qty * 0.6);
    const eKg = r.employeePluckedKg || Math.round(r.qty * 0.4);
    const cPay = r.casualPayoutKes || Math.round(cKg * casualRatePerKg);

    doc.text(r.date, 45, yPos + 11);
    doc.text(r.ref, 110, yPos + 11);
    doc.text(`${cKg} kg`, 225, yPos + 11);
    doc.text(`${eKg} kg`, 290, yPos + 11);
    doc.text(`${r.qty} kg`, 355, yPos + 11);
    doc.text(`KES ${cPay.toLocaleString()}`, 420, yPos + 11);
    doc.text(r.buyer || 'KTDA Factory', 480, yPos + 11);
    yPos += 15;
  });

  // Section 2: Agronomic & Field Practices Schedule
  yPos += 18;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(deepSlate[0], deepSlate[1], deepSlate[2]);
  doc.text('2. TEA AGRONOMIC PRACTICES & NEXT RECURRING SCHEDULE', 40, yPos);
  yPos += 14;

  doc.setFillColor(30, 41, 59);
  doc.rect(40, yPos, 515, 18, 'F');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('PRACTICE', 45, yPos + 12);
  doc.text('DATE DONE', 145, yPos + 12);
  doc.text('WHO / TEAM', 215, yPos + 12);
  doc.text('BLOCK / REASON', 315, yPos + 12);
  doc.text('NEXT DUE DATE', 480, yPos + 12);

  yPos += 18;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);

  practices.slice(0, 6).forEach((p, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(241, 245, 249);
      doc.rect(40, yPos, 515, 15, 'F');
    }
    doc.text(p.practiceType, 45, yPos + 11);
    doc.text(p.date, 145, yPos + 11);
    doc.text(p.who, 215, yPos + 11);
    doc.text(`${p.blockOrZone} • ${p.reason.slice(0, 30)}...`, 315, yPos + 11);
    doc.text(p.nextDueDate, 480, yPos + 11);
    yPos += 15;
  });

  // Footer & Official Signoff
  yPos = Math.max(yPos + 35, 750);
  doc.setDrawColor(203, 213, 225);
  doc.line(40, yPos, 555, yPos);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(deepSlate[0], deepSlate[1], deepSlate[2]);
  doc.text('Presented & Approved by: Dr. Devin Omwenga (General Farm Manager)', 40, yPos + 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('JR Farm Commercial Tea Husbandry & Labour Management Division • Certified KTDA Production Standard', 40, yPos + 28);

  doc.save(`JR_Farm_Tea_Production_Casual_Audit_${toIsoDate(new Date())}.pdf`);
}
