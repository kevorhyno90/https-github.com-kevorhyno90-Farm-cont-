import { jsPDF } from 'jspdf';
import { DogProfile } from '../../types';

export function generateKennelPlacardPdf(dog: DogProfile) {
  const doc = new jsPDF({
    unit: 'mm',
    format: [148, 210] // A5 landscape / portrait card format
  });

  const emerald = [4, 120, 87];
  const darkSlate = [15, 23, 42];
  const alertRed = [185, 28, 28];

  // Outer border with warning pattern
  doc.setDrawColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.setLineWidth(1.5);
  doc.rect(5, 5, 138, 200, 'S');

  // Inner border
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.rect(7, 7, 134, 196, 'S');

  // Top Warning Banner
  doc.setFillColor(alertRed[0], alertRed[1], alertRed[2]);
  doc.rect(8, 8, 132, 16, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('CAUTION: ACTIVE ESTATE WORKING K-9', 74, 18, { align: 'center' });

  // JR Farm Header
  doc.setTextColor(emerald[0], emerald[1], emerald[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('JR FARM — SOVEREIGN AGRI-SECURITY K-9 SQUAD', 74, 30, { align: 'center' });

  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('OFFICIAL KENNEL HOUSING BAY PLACARD', 74, 35, { align: 'center' });

  // Kennel Unit Badge
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(12, 40, 124, 18, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text(`BAY: ${dog.kennelNo || 'KENNEL UNIT'}`, 74, 52, { align: 'center' });

  // Dog Name Block
  doc.setFontSize(26);
  doc.setTextColor(emerald[0], emerald[1], emerald[2]);
  doc.text(dog.name.toUpperCase(), 74, 75, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text(dog.breed, 74, 82, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`${dog.gender} • Role: ${dog.dutyRole} • Status: ${dog.status}`, 74, 88, { align: 'center' });

  // Microchip & Identity Barcode Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, 94, 120, 22, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('GOVERNMENT MICROCHIP ID:', 74, 102, { align: 'center' });
  doc.setFont('courier', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(emerald[0], emerald[1], emerald[2]);
  doc.text(dog.chipId || 'K9-CHIP-UNTAGGED', 74, 111, { align: 'center' });

  // Instructions Grid
  let y = 124;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('ASSIGNED HANDLER:', 16, y);
  doc.setFont('helvetica', 'normal');
  doc.text(dog.handlerName || 'Designated K-9 Handler', 55, y);

  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('FEEDING RATION:', 16, y);
  doc.setFont('helvetica', 'normal');
  doc.text('High-Protein Working Diet (850g - 1100g post-shift)', 55, y);

  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('TEMPERAMENT:', 16, y);
  doc.setFont('helvetica', 'normal');
  doc.text('High Drive / Alert / Deterrence Trained', 55, y);

  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('BIOSECURITY:', 16, y);
  doc.setFont('helvetica', 'normal');
  doc.text('Daily Virkon-S footbath & water bowl sterilize', 55, y);

  // Emergency Veterinary Callout
  y += 16;
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(12, y, 124, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(alertRed[0], alertRed[1], alertRed[2]);
  doc.text('EMERGENCY ATTENDING VETERINARIAN:', 74, y + 8, { align: 'center' });

  doc.setFontSize(9);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('Dr. Devin Omwenga, DVM', 74, y + 15, { align: 'center' });
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('General Farm Manager • Sovereign Estate Protocol', 74, y + 21, { align: 'center' });

  // Bottom Notice
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Unauthorized personnel strictly forbidden to enter or feed.', 74, 198, { align: 'center' });

  doc.save(`Kennel_Placard_${dog.name.replace(/\s+/g, '_')}.pdf`);
}
