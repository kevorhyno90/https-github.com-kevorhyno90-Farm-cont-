import { jsPDF } from 'jspdf';
import { FarmNote } from '../../types';

export function generateSingleNotePdf(note: FarmNote): void {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 75, 'F');

  // Accent Line
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(0, 75, pageWidth, 4, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('JR BIOFARM NEXUS • FARM JOURNAL & NOTES', margin, 35);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(`Official Record Generated on: ${new Date().toLocaleString()}`, margin, 55);

  let y = 105;

  // Note Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  const titleLines = doc.splitTextToSize(note.title || 'Untitled Note', contentWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 20 + 8;

  // Metadata Pill Box
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin, y, contentWidth, 34, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('DATE:', margin + 12, y + 21);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${note.date} ${note.time || ''}`, margin + 50, y + 21);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('CATEGORY:', margin + 180, y + 21);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(note.category, margin + 250, y + 21);

  if (note.priority) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('PRIORITY:', margin + 370, y + 21);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(note.priority === 'urgent' ? 225 : 15, note.priority === 'urgent' ? 29 : 23, note.priority === 'urgent' ? 72 : 42);
    doc.text(note.priority.toUpperCase(), margin + 430, y + 21);
  }

  y += 50;

  // Tags
  if (note.tags && note.tags.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('TAGS:', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(14, 116, 144); // cyan-700
    doc.text(note.tags.map(t => `#${t}`).join('   '), margin + 45, y);
    y += 20;
  }

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, margin + contentWidth, y);
  y += 18;

  // Content
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(30, 41, 59);

  const cleanContent = (note.content || '')
    .replace(/^#+\s+/gm, '') // strip markdown headers for plain text print
    .replace(/\*\*(.*?)\*\*/g, '$1') // strip bold markdown
    .replace(/\*(.*?)\*/g, '$1') // strip italic markdown
    .replace(/```/g, '')
    .replace(/^>\s+/gm, '» ');

  const contentLines = doc.splitTextToSize(cleanContent, contentWidth);
  for (const line of contentLines) {
    if (y > 770) {
      doc.addPage();
      y = 50;
    }
    doc.text(line, margin, y);
    y += 15;
  }

  // Checklists if any
  if (note.checklists && note.checklists.length > 0) {
    y += 15;
    if (y > 750) {
      doc.addPage();
      y = 50;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('Action Items & Checklist:', margin, y);
    y += 18;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    for (const item of note.checklists) {
      if (y > 770) {
        doc.addPage();
        y = 50;
      }
      const box = item.completed ? '[X]' : '[  ]';
      doc.setTextColor(item.completed ? 100 : 15, item.completed ? 116 : 23, item.completed ? 139 : 42);
      doc.text(`${box}  ${item.text}`, margin + 10, y);
      y += 16;
    }
  }

  // Footer
  const pageCount = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `JR BioFarm Nexus System Notes • Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 20,
      { align: 'center' }
    );
  }

  const safeTitle = (note.title || 'note').replace(/[^a-z0-9]/gi, '_').toLowerCase();
  doc.save(`FarmNote_${note.date}_${safeTitle}.pdf`);
}

export function generateAllNotesSummaryPdf(notes: FarmNote[], filterTitle: string = 'All Notes'): void {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;

  // Top Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 75, 'F');
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 75, pageWidth, 4, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('JR BIOFARM • COMPREHENSIVE NOTES & JOURNAL AUDIT', margin, 35);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`Scope: ${filterTitle} • Total Entries: ${notes.length} • Generated: ${new Date().toLocaleString()}`, margin, 55);

  let y = 100;

  notes.forEach((note, idx) => {
    if (y > 720) {
      doc.addPage();
      y = 50;
    }

    // Note Card Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 24, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`${idx + 1}. ${note.title || 'Untitled Note'}`, margin + 8, y + 16);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(16, 185, 129);
    doc.text(`[${note.date}] ${note.category}`, margin + contentWidth - 140, y + 16, { align: 'right' });

    y += 32;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);

    const excerpt = (note.content || '').replace(/[\n\r]+/g, ' ').substring(0, 220) + (note.content.length > 220 ? '...' : '');
    const excerptLines = doc.splitTextToSize(excerpt, contentWidth - 16);
    doc.text(excerptLines, margin + 8, y);
    y += excerptLines.length * 13 + 6;

    if (note.checklists && note.checklists.length > 0) {
      const completedCount = note.checklists.filter(c => c.completed).length;
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`Checklist Progress: ${completedCount}/${note.checklists.length} items completed`, margin + 8, y);
      y += 14;
    }

    y += 10;
  });

  const pageCount = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `JR BioFarm Nexus System Notes Digest • Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 20,
      { align: 'center' }
    );
  }

  doc.save(`FarmNotes_Digest_${new Date().toISOString().split('T')[0]}.pdf`);
}
