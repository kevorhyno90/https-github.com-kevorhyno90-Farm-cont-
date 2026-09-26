import { jsPDF } from 'jspdf';
import { BsfRecord } from '../../types';
import { toIsoDate } from '../../utils/dateHelper';

export function generateBsfAuditPdf(
  batches: BsfRecord[],
  totalWasteDivertedKg: number,
  totalLarvaeHarvestedKg: number,
  totalFrassKg: number,
  totalCostSavingsKes: number
) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const emeraldColor = [4, 120, 87];
  const amberColor = [180, 83, 9];
  const slateColor = [15, 23, 42];

  // Top Ribbon
  doc.setFillColor(emeraldColor[0], emeraldColor[1], emeraldColor[2]);
  doc.rect(0, 0, 595.28, 45, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('JR FARM — BSF INSECT BIOCONVERSION & PROTEIN AUDIT', 40, 28);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Circular Bio-Economy • High-Protein Larvae & Organic Frass Audit • Generated: ${new Date().toLocaleString()}`, 40, 60);

  // Executive KPI Container
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(40, 72, 515, 62, 6, 6, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(emeraldColor[0], emeraldColor[1], emeraldColor[2]);
  doc.text('EXECUTIVE CIRCULAR BIO-ECONOMY METRICS:', 55, 90);

  doc.setFontSize(9);
  doc.setTextColor(slateColor[0], slateColor[1], slateColor[2]);
  doc.text(`Organic Waste Diverted: ${totalWasteDivertedKg.toLocaleString()} KG`, 55, 108);
  doc.text(`Total Larvae Produced: ${totalLarvaeHarvestedKg.toLocaleString()} KG`, 220, 108);
  doc.text(`Organic Frass Biofertilizer: ${totalFrassKg.toLocaleString()} KG`, 380, 108);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(amberColor[0], amberColor[1], amberColor[2]);
  doc.text(`Estimated Commercial Soya / Fishmeal Cost Offset: KES ${totalCostSavingsKes.toLocaleString()}`, 55, 124);

  // Section 1: Active & Historical BSF Batches
  let yPos = 155;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(emeraldColor[0], emeraldColor[1], emeraldColor[2]);
  doc.text('BATCH INOCULATION & BIOCONVERSION LEDGER', 40, yPos);
  yPos += 12;

  // Table Header
  doc.setFillColor(slateColor[0], slateColor[1], slateColor[2]);
  doc.rect(40, yPos, 515, 18, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.text('Batch Code', 48, yPos + 12);
  doc.text('Substrate Biomass', 140, yPos + 12);
  doc.text('Inoculated', 285, yPos + 12);
  doc.text('Larvae (KG)', 365, yPos + 12);
  doc.text('Frass (KG)', 430, yPos + 12);
  doc.text('Cycle Stage', 485, yPos + 12);
  yPos += 18;

  batches.forEach((b, idx) => {
    if (yPos > 720) {
      doc.addPage();
      yPos = 40;
    }

    doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
    doc.rect(40, yPos, 515, 16, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(40, yPos, 515, 16, 'S');

    doc.setTextColor(slateColor[0], slateColor[1], slateColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(b.batchId, 48, yPos + 11);

    doc.setFont('helvetica', 'normal');
    doc.text(b.substrateType.substring(0, 30), 140, yPos + 11);
    doc.text(b.inoculationDate, 285, yPos + 11);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(emeraldColor[0], emeraldColor[1], emeraldColor[2]);
    doc.text(`${b.larvaeHarvestedKg || 0} kg`, 365, yPos + 11);

    doc.setTextColor(amberColor[0], amberColor[1], amberColor[2]);
    doc.text(`${b.frassHarvestedKg || 0} kg`, 430, yPos + 11);

    doc.setTextColor(slateColor[0], slateColor[1], slateColor[2]);
    doc.setFont('helvetica', 'normal');
    doc.text(b.status.substring(0, 14), 485, yPos + 11);

    yPos += 16;
  });

  // Official Sign-off & Stamp
  yPos = Math.max(yPos + 40, 720);
  if (yPos > 740) {
    doc.addPage();
    yPos = 680;
  }

  doc.setDrawColor(148, 163, 184);
  doc.setLineDashPattern([2, 2], 0);
  doc.line(40, yPos, 555, yPos);
  doc.setLineDashPattern([], 0);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(slateColor[0], slateColor[1], slateColor[2]);
  doc.text('Presented & Approved by: Dr. Devin Omwenga (General Farm Manager)', 40, yPos + 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('JR Farm Sustainable Circular Bio-Economy • Zero Waste Farming Standards', 40, yPos + 30);

  doc.save(`JR_Farm_BSF_Bioconversion_Audit_${toIsoDate(new Date())}.pdf`);
}
