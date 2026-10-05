import { jsPDF } from 'jspdf';
import { FarmNote } from '../../types';
import { getStoredSettings } from '../../utils/settingsHelper';

export function generateSingleNotePdf(note: FarmNote): void {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  const estateSettings = getStoredSettings();
  const estateName = (estateSettings?.estateName || 'JR BioFarm Nexus').toUpperCase();
  const adminName = estateSettings?.administrator || 'Dr. Devin Omwenga';

  // 1. Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 75, 'F');

  // Emerald Accent Line
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(0, 75, pageWidth, 4, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(`${estateName} • FARM JOURNAL & AUDIT NOTE`, margin, 35);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(`Official Executive Record • Superintendent: ${adminName} • Generated: ${new Date().toLocaleString()}`, margin, 55);

  let y = 105;

  // 2. Note Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  const titleLines = doc.splitTextToSize(note.title || 'Untitled Note', contentWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 20 + 8;

  // 3. Metadata Pill Box
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin, y, contentWidth, 34, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('DATE:', margin + 12, y + 21);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${note.date} ${note.time || ''}`, margin + 50, y + 21);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('CATEGORY:', margin + 175, y + 21);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(note.category, margin + 245, y + 21);

  if (note.priority) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('PRIORITY:', margin + 370, y + 21);
    doc.setFont('helvetica', 'bold');
    if (note.priority === 'urgent') {
      doc.setTextColor(225, 29, 72); // rose-600
    } else if (note.priority === 'high') {
      doc.setTextColor(217, 119, 6); // amber-600
    } else {
      doc.setTextColor(15, 23, 42);
    }
    doc.text(note.priority.toUpperCase(), margin + 430, y + 21);
  }

  y += 48;

  // 4. Tags
  if (note.tags && note.tags.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text('TAGS:', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(14, 116, 144); // cyan-700
    doc.text(note.tags.map(t => `#${t}`).join('   '), margin + 45, y);
    y += 18;
  }

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, margin + contentWidth, y);
  y += 20;

  // 5. Rich Body Content parsing
  const rawLines = (note.content || '').split('\n');
  for (const rawLine of rawLines) {
    if (y > pageHeight - 90) {
      doc.addPage();
      y = 50;
    }

    const trimmed = rawLine.trim();

    if (!trimmed) {
      y += 8;
      continue;
    }

    if (trimmed.startsWith('# ')) {
      // H1
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      const text = trimmed.replace(/^#\s+/, '');
      const lines = doc.splitTextToSize(text, contentWidth);
      doc.text(lines, margin, y);
      y += lines.length * 16 + 6;
    } else if (trimmed.startsWith('## ')) {
      // H2
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11.5);
      doc.setTextColor(4, 120, 87); // emerald-700
      const text = trimmed.replace(/^##\s+/, '');
      const lines = doc.splitTextToSize(text, contentWidth);
      doc.text(lines, margin, y);
      y += lines.length * 15 + 4;
    } else if (trimmed.startsWith('### ') || trimmed.startsWith('#### ')) {
      // H3 / H4
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(30, 41, 59); // slate-800
      const text = trimmed.replace(/^#{3,4}\s+/, '');
      const lines = doc.splitTextToSize(text, contentWidth);
      doc.text(lines, margin, y);
      y += lines.length * 14 + 3;
    } else if (trimmed.startsWith('> ')) {
      // Blockquote
      const quoteText = trimmed.replace(/^>\s+/, '').replace(/\*\*(.*?)\*\*/g, '$1');
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);
      const qLines = doc.splitTextToSize(quoteText, contentWidth - 20);
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, y - 9, 3, qLines.length * 13 + 6, 'F');
      doc.text(qLines, margin + 12, y);
      y += qLines.length * 13 + 6;
    } else if (trimmed.startsWith('- [ ] ') || trimmed.startsWith('- [x] ') || trimmed.startsWith('- [X] ')) {
      // Task bullet inside markdown
      const done = trimmed.startsWith('- [x] ') || trimmed.startsWith('- [X] ');
      const itemText = trimmed.replace(/^- \[[ xX]\]\s*/, '').replace(/\*\*(.*?)\*\*/g, '$1');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(done ? 148 : 30, done ? 163 : 41, done ? 184 : 59);
      doc.text(`${done ? '[X]' : '[  ]'}  ${itemText}`, margin + 8, y);
      y += 14;
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      // Bullet point
      const bulletText = trimmed.replace(/^[-*]\s+/, '').replace(/\*\*(.*?)\*\*/g, '$1');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59);
      const bLines = doc.splitTextToSize(`• ${bulletText}`, contentWidth - 10);
      doc.text(bLines, margin + 8, y);
      y += bLines.length * 13 + 3;
    } else {
      // Standard text line
      const clean = trimmed
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/`([^`]+)`/g, '$1');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59);
      const pLines = doc.splitTextToSize(clean, contentWidth);
      doc.text(pLines, margin, y);
      y += pLines.length * 13 + 4;
    }
  }

  // 6. Action Items & Checklists section
  if (note.checklists && note.checklists.length > 0) {
    y += 15;
    if (y > pageHeight - 120) {
      doc.addPage();
      y = 50;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('Action Items & Follow-up Checklist:', margin, y);
    y += 18;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    for (const item of note.checklists) {
      if (y > pageHeight - 80) {
        doc.addPage();
        y = 50;
      }
      const box = item.completed ? '[X]' : '[  ]';
      doc.setTextColor(item.completed ? 100 : 15, item.completed ? 116 : 23, item.completed ? 139 : 42);
      doc.text(`${box}  ${item.text}`, margin + 10, y);
      y += 15;
    }
  }

  // 7. Executive Sign-Off Stamps on last page
  if (y > pageHeight - 120) {
    doc.addPage();
    y = 50;
  } else {
    y += 25;
  }

  doc.setDrawColor(203, 213, 225); // slate-300
  doc.line(margin, y, margin + contentWidth, y);
  y += 20;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('EXECUTIVE VERIFICATION & AUTHORIZATION', margin, y);

  y += 30;
  doc.setDrawColor(148, 163, 184);
  doc.line(margin, y, margin + 180, y);
  doc.line(margin + 260, y, margin + 440, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Superintendent: ${adminName}`, margin, y + 12);
  doc.text('Senior Farm Inspector / Supervisor', margin + 260, y + 12);

  // 8. Footer on every page
  const pageCount = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `${estateName} Official System Notes • Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 20,
      { align: 'center' }
    );
  }

  const safeTitle = (note.title || 'note').replace(/[^a-z0-9]/gi, '_').toLowerCase();
  doc.save(`FarmNote_${note.date}_${safeTitle}.pdf`);
}

export function generateAllNotesSummaryPdf(notes: FarmNote[], filterTitle: string = 'All Notes'): void {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  const estateSettings = getStoredSettings();
  const estateName = (estateSettings?.estateName || 'JR BioFarm Nexus').toUpperCase();

  // Top Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 75, 'F');
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 75, pageWidth, 4, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(`${estateName} • COMPREHENSIVE JOURNAL & NOTES AUDIT`, margin, 35);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(`Filter Scope: ${filterTitle} • Total Entries: ${notes.length} • Generated: ${new Date().toLocaleString()}`, margin, 55);

  let y = 100;

  if (notes.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('No notes found matching the selected filter criteria.', margin, y + 20);
  } else {
    notes.forEach((note, idx) => {
      if (y > pageHeight - 100) {
        doc.addPage();
        y = 50;
      }

      // Note Card Box
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, y, contentWidth, 24, 3, 3, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      const truncatedTitle = (note.title || 'Untitled Note').length > 55
        ? (note.title || 'Untitled Note').substring(0, 52) + '...'
        : (note.title || 'Untitled Note');
      doc.text(`${idx + 1}. ${truncatedTitle}`, margin + 8, y + 16);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(16, 185, 129);
      doc.text(`[${note.date}] ${note.category}`, margin + contentWidth - 14, y + 16, { align: 'right' });

      y += 32;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);

      const excerpt = (note.content || '').replace(/[\n\r]+/g, ' ').substring(0, 240) + (note.content.length > 240 ? '...' : '');
      const excerptLines = doc.splitTextToSize(excerpt, contentWidth - 16);
      doc.text(excerptLines, margin + 8, y);
      y += excerptLines.length * 12 + 6;

      if (note.checklists && note.checklists.length > 0) {
        const completedCount = note.checklists.filter(c => c.completed).length;
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(`Tasks Progress: ${completedCount}/${note.checklists.length} completed`, margin + 8, y);
        y += 14;
      }

      y += 10;
    });
  }

  const pageCount = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `${estateName} System Notes Digest • Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 20,
      { align: 'center' }
    );
  }

  doc.save(`FarmNotes_Digest_${new Date().toISOString().split('T')[0]}.pdf`);
}
