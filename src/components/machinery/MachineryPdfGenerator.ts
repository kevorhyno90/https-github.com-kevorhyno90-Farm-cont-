import { jsPDF } from 'jspdf';
import { MachineItem, MachineServiceRecord } from '../../types';
import { toIsoDate } from '../../utils/dateHelper';

export function generateMachineryAuditPdf(
  machines: MachineItem[],
  services: MachineServiceRecord[]
) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const navyDark = [15, 23, 42]; // Slate 900
  const amberAccent = [217, 119, 6];
  const emeraldAccent = [16, 185, 129];

  // Top Ribbon
  doc.setFillColor(navyDark[0], navyDark[1], navyDark[2]);
  doc.rect(0, 0, 595.28, 48, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('JR FARM — MACHINERY, FLEET & WORKSHOP ASSET AUDIT', 35, 30);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`Equipment Registry • Scheduled Maintenance Logs & Cost Audits • Generated: ${new Date().toLocaleString()}`, 35, 64);

  // Executive KPI Container
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(35, 74, 525, 75, 6, 6, 'FD');

  const totalAssets = machines.length;
  const operationalCount = machines.filter(m => m.status === 'Operational' || m.status === 'In Use').length;
  const maintenanceCount = machines.filter(m => m.status === 'Under Maintenance' || m.status === 'Awaiting Spares').length;
  const totalCost = services.reduce((sum, s) => sum + (s.cost || 0), 0);
  const todayStr = toIsoDate(new Date());
  const overdueCount = machines.filter(m => m.nextServiceDueDate && m.nextServiceDueDate < todayStr).length;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
  doc.text('EXECUTIVE FLEET OPERATIONAL STATUS & WORKSHOP METRICS:', 48, 92);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`Total Tracked Equipment: ${totalAssets} Units`, 48, 108);
  doc.text(`Operational Fleet: ${operationalCount} (${totalAssets > 0 ? Math.round((operationalCount / totalAssets) * 100) : 0}%)`, 200, 108);
  doc.text(`Under Maintenance: ${maintenanceCount} Units`, 360, 108);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(4, 120, 87); // Emerald
  doc.text(`Total Cumulative Service Cost: KES ${Math.round(totalCost).toLocaleString()}`, 48, 126);

  doc.setTextColor(225, 29, 72); // Rose
  doc.text(`Overdue for Service: ${overdueCount} Units`, 360, 126);

  // Section 1: Machinery Master Registry
  let yPos = 166;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
  doc.text('1. FLEET & MACHINERY ASSET REGISTRY (16 PRIME ASSETS)', 35, yPos);

  yPos += 10;
  doc.setFillColor(30, 41, 59); // Slate 800
  doc.rect(35, yPos, 525, 16, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('MACHINE NAME & REG', 40, yPos + 11);
  doc.text('SPECS / MODEL', 160, yPos + 11);
  doc.text('STATUS & CONDITION', 310, yPos + 11);
  doc.text('OPERATOR', 420, yPos + 11);
  doc.text('NEXT SERVICE', 490, yPos + 11);

  yPos += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);

  machines.slice(0, 16).forEach((m, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(241, 245, 249);
      doc.rect(35, yPos, 525, 14, 'F');
    }
    doc.text(`${m.name} (${m.regNoOrSerial})`, 40, yPos + 10);
    doc.text((m.modelOrSpecs || 'Standard').slice(0, 28), 160, yPos + 10);
    doc.text(`${m.status} • ${m.condition.slice(0, 12)}`, 310, yPos + 10);
    doc.text((m.assignedOperator || 'Unassigned').slice(0, 14), 420, yPos + 10);
    doc.text(m.nextServiceDueDate || 'TBD', 490, yPos + 10);
    yPos += 14;
  });

  // Section 2: Recent Service & Maintenance Ledger
  yPos += 16;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
  doc.text('2. RECENT SERVICE & MAINTENANCE HISTORY LEDGER', 35, yPos);

  yPos += 10;
  doc.setFillColor(217, 119, 6); // Amber
  doc.rect(35, yPos, 525, 16, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('DATE / TICKET', 40, yPos + 11);
  doc.text('EQUIPMENT', 120, yPos + 11);
  doc.text('WHAT WAS SERVICED', 210, yPos + 11);
  doc.text('COST (KES)', 370, yPos + 11);
  doc.text('SERVICED BY', 430, yPos + 11);
  doc.text('NEXT DUE', 495, yPos + 11);

  yPos += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);

  services.slice(0, 8).forEach((s, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(241, 245, 249);
      doc.rect(35, yPos, 525, 14, 'F');
    }
    doc.text(`${s.serviceDate} • ${s.serviceTicketRef.slice(0, 8)}`, 40, yPos + 10);
    doc.text(`${s.machineName.slice(0, 16)}`, 120, yPos + 10);
    doc.text(`${s.whatWasServiced.slice(0, 34)}...`, 210, yPos + 10);
    doc.text(`KES ${s.cost.toLocaleString()}`, 370, yPos + 10);
    doc.text(s.servicedBy.slice(0, 12), 430, yPos + 10);
    doc.text(s.nextServiceDate, 495, yPos + 10);
    yPos += 14;
  });

  // Footer & Official Certification
  yPos = Math.max(yPos + 30, 755);
  doc.setDrawColor(203, 213, 225);
  doc.line(35, yPos, 560, yPos);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
  doc.text('Presented & Approved by: Dr. Devin Omwenga (General Farm Manager)', 35, yPos + 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('JR Farm Omni-Estate Workshop & Fleet Engineering Division • Preventive Maintenance Standards Active', 35, yPos + 28);

  doc.save(`JR_Farm_Machinery_Fleet_Audit_${toIsoDate(new Date())}.pdf`);
}
