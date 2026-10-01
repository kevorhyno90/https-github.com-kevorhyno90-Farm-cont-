import { jsPDF } from 'jspdf';
import { InventoryItem, InventoryMovementLog } from '../../types';
import { toIsoDate } from '../../utils/dateHelper';
import { getItemStockStatus } from '../../utils/inventoryHelper';

export function generateInventoryAuditPdf(
  items: InventoryItem[],
  movements: InventoryMovementLog[]
) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const deepSlate = [15, 23, 42];
  const amberTone = [217, 119, 6];

  // Top Ribbon
  doc.setFillColor(deepSlate[0], deepSlate[1], deepSlate[2]);
  doc.rect(0, 0, 595.28, 48, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('JR FARM — COMPREHENSIVE WAREHOUSE & INVENTORY AUDIT', 40, 30);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Feeds, Animal & Crop Drugs, Tools, Machinery & Detergents • Stock Valuation & Safety Audit • ${toIsoDate(new Date())}`, 40, 64);

  // Executive KPI Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(40, 76, 515, 74, 6, 6, 'FD');

  const totalSKUs = items.length;
  const totalValuation = items.reduce((acc, i) => acc + (i.quantity * (i.unitCostKes || 0)), 0);
  const outOfStock = items.filter(i => getItemStockStatus(i) === 'Out of Stock (Over)').length;
  const lowStock = items.filter(i => getItemStockStatus(i) === 'Low Stock Warning').length;
  const expiredCount = items.filter(i => getItemStockStatus(i) === 'Expired').length;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(amberTone[0], amberTone[1], amberTone[2]);
  doc.text('EXECUTIVE WAREHOUSE AUDIT & STOCK VALUATION:', 55, 93);

  doc.setFontSize(8.5);
  doc.setTextColor(deepSlate[0], deepSlate[1], deepSlate[2]);
  doc.text(`Total Managed SKUs: ${totalSKUs} Items`, 55, 110);
  doc.text(`Total Asset Valuation: KSh ${Math.round(totalValuation).toLocaleString()}`, 220, 110);
  doc.text(`Depleted / Over: ${outOfStock} SKUs`, 420, 110);

  doc.text(`Low Stock Warnings: ${lowStock} SKUs`, 55, 126);
  doc.text(`Expired Stock: ${expiredCount} Items`, 220, 126);
  doc.text(`Audit Movements Logged: ${movements.length} Events`, 420, 126);

  doc.text(`Store Locations: Feed Bay, Vet Cabinet, Chemical Shed, Parlour`, 55, 142);
  doc.text(`Lead Storekeeper: Peter Kibet`, 350, 142);

  // Section 1: Item Inventory List
  let yPos = 170;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(deepSlate[0], deepSlate[1], deepSlate[2]);
  doc.text('1. COMMODITY STOCK BALANCES & REORDER THRESHOLDS', 40, yPos);

  yPos += 14;
  doc.setFillColor(241, 245, 249);
  doc.rect(40, yPos, 515, 18, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text('ITEM NAME', 45, yPos + 12);
  doc.text('CATEGORY', 185, yPos + 12);
  doc.text('LOCATION', 285, yPos + 12);
  doc.text('QUANTITY', 375, yPos + 12);
  doc.text('MIN LEVEL', 435, yPos + 12);
  doc.text('STATUS', 495, yPos + 12);

  yPos += 18;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);

  items.slice(0, 18).forEach((item, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(40, yPos, 515, 15, 'F');
    }
    const status = getItemStockStatus(item);
    const truncatedName = item.name.length > 25 ? item.name.substring(0, 23) + '..' : item.name;
    const catShort = item.category.length > 18 ? item.category.substring(0, 16) + '..' : item.category;

    doc.text(truncatedName, 45, yPos + 10);
    doc.text(catShort, 185, yPos + 10);
    doc.text((item.location || 'Store Alpha').substring(0, 16), 285, yPos + 10);
    doc.text(`${item.quantity} ${item.unit.split(' ')[0]}`, 375, yPos + 10);
    doc.text(`${item.minStock}`, 435, yPos + 10);

    if (status === 'Out of Stock (Over)') {
      doc.setTextColor(225, 29, 72);
      doc.text('DEPLETED', 495, yPos + 10);
    } else if (status === 'Low Stock Warning') {
      doc.setTextColor(217, 119, 6);
      doc.text('LOW', 495, yPos + 10);
    } else if (status === 'Expired') {
      doc.setTextColor(147, 51, 234);
      doc.text('EXPIRED', 495, yPos + 10);
    } else {
      doc.setTextColor(22, 101, 52);
      doc.text('OK', 495, yPos + 10);
    }
    doc.setTextColor(15, 23, 42);
    yPos += 15;
  });

  // Section 2: Recent Movements
  yPos += 15;
  if (yPos > 680) {
    doc.addPage();
    yPos = 50;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(deepSlate[0], deepSlate[1], deepSlate[2]);
  doc.text('2. RECENT CROSS-SECTION CONSUMPTION & DISBURSEMENT LOG', 40, yPos);

  yPos += 14;
  doc.setFillColor(241, 245, 249);
  doc.rect(40, yPos, 515, 18, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text('DATE', 45, yPos + 12);
  doc.text('ITEM', 105, yPos + 12);
  doc.text('TYPE', 215, yPos + 12);
  doc.text('QTY DEDUCTED', 290, yPos + 12);
  doc.text('SECTION', 360, yPos + 12);
  doc.text('PURPOSE / REMARKS', 445, yPos + 12);

  yPos += 18;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);

  movements.slice(0, 10).forEach((mov, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(40, yPos, 515, 15, 'F');
    }
    const truncatedItem = mov.itemName.length > 20 ? mov.itemName.substring(0, 18) + '..' : mov.itemName;
    const truncatedSec = mov.usedBySection.length > 14 ? mov.usedBySection.substring(0, 12) + '..' : mov.usedBySection;
    const truncatedPurp = (mov.purposeOrReason || '').length > 18 ? (mov.purposeOrReason || '').substring(0, 16) + '..' : mov.purposeOrReason || '';

    doc.text(mov.date, 45, yPos + 10);
    doc.text(truncatedItem, 105, yPos + 10);
    doc.text(mov.movementType.split('/')[0].trim(), 215, yPos + 10);
    doc.text(`${mov.quantityChanged > 0 ? '+' : ''}${mov.quantityChanged} ${mov.unit.split(' ')[0]}`, 290, yPos + 10);
    doc.text(truncatedSec, 360, yPos + 10);
    doc.text(truncatedPurp, 445, yPos + 10);
    yPos += 15;
  });

  // Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 116, 139);
  doc.text('JR Farm Warehouse & Asset Control • Compliant with Veterinary & Agrochemical Inventory Standards', 40, pageHeight - 25);
  doc.text(`Authorized by: Dr. Devin Omwenga • Timestamp: ${new Date().toISOString()}`, 350, pageHeight - 25);

  doc.save(`JR_Farm_Inventory_Audit_${toIsoDate(new Date())}.pdf`);
}
