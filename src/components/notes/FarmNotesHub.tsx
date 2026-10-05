import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  BookOpen,
  Calendar,
  Search,
  Pin,
  Plus,
  Trash2,
  Copy,
  Download,
  Printer,
  Sparkles,
  CheckSquare,
  Square,
  Clock,
  Tag,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  LayoutGrid,
  Columns,
  History,
  Layers,
  Wrench,
  Activity,
  Coins,
  Users,
  Wheat,
  ShieldAlert,
  CloudSun,
  ArrowLeft,
  X,
  Mic,
  MicOff,
  Archive,
  RotateCcw,
  Check
} from 'lucide-react';
import { useFarmState } from '../../context/FarmContext';
import { FarmNote, FarmNoteCategory, FarmNoteColor, FarmNotePriority, NoteChecklistItem } from '../../types';
import { toIsoDate } from '../../utils/dateHelper';
import { generateSingleNotePdf, generateAllNotesSummaryPdf } from './FarmNotePdfGenerator';

const CATEGORIES: { id: FarmNoteCategory; label: string; icon: any; color: string }[] = [
  { id: 'General', label: 'General Farm', icon: BookOpen, color: 'bg-slate-100 text-slate-700 border-slate-200' },
  { id: 'Dairy & Herd', label: 'Dairy & Herd', icon: Activity, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'Crops & Agronomy', label: 'Crops & Agronomy', icon: Wheat, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'Feed & Nutrition', label: 'Feed & Nutrition', icon: Layers, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'Machinery & Workshop', label: 'Machinery & Tools', icon: Wrench, color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'Financials & Sales', label: 'Finance & Sales', icon: Coins, color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { id: 'Staff & Operations', label: 'Staff & Duties', icon: Users, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { id: 'Veterinary & Biosecurity', label: 'Vet & Biosecurity', icon: ShieldAlert, color: 'bg-red-50 text-red-700 border-red-200' },
  { id: 'Weather & Environment', label: 'Weather & Field', icon: CloudSun, color: 'bg-teal-50 text-teal-700 border-teal-200' },
];

const COLOR_THEMES: {
  id: FarmNoteColor;
  name: string;
  bg: string;
  cardBg: string;
  border: string;
  accent: string;
  ribbon: string;
  hex: string;
  lightHex: string;
}[] = [
  { id: 'emerald', name: 'Emerald Green', bg: 'bg-emerald-50/70', cardBg: 'bg-emerald-50/40', border: 'border-emerald-200', accent: 'text-emerald-700', ribbon: 'bg-emerald-500', hex: '#10b981', lightHex: '#ecfdf5' },
  { id: 'amber', name: 'Warm Amber', bg: 'bg-amber-50/70', cardBg: 'bg-amber-50/40', border: 'border-amber-200', accent: 'text-amber-700', ribbon: 'bg-amber-500', hex: '#f59e0b', lightHex: '#fffbeb' },
  { id: 'blue', name: 'Royal Blue', bg: 'bg-blue-50/70', cardBg: 'bg-blue-50/40', border: 'border-blue-200', accent: 'text-blue-700', ribbon: 'bg-blue-500', hex: '#3b82f6', lightHex: '#eff6ff' },
  { id: 'rose', name: 'Rose Red', bg: 'bg-rose-50/70', cardBg: 'bg-rose-50/40', border: 'border-rose-200', accent: 'text-rose-700', ribbon: 'bg-rose-500', hex: '#f43f5e', lightHex: '#fff1f2' },
  { id: 'purple', name: 'Purple Orchid', bg: 'bg-purple-50/70', cardBg: 'bg-purple-50/40', border: 'border-purple-200', accent: 'text-purple-700', ribbon: 'bg-purple-500', hex: '#a855f7', lightHex: '#faf5ff' },
  { id: 'slate', name: 'Classic Slate', bg: 'bg-slate-50', cardBg: 'bg-slate-50', border: 'border-slate-200', accent: 'text-slate-700', ribbon: 'bg-slate-500', hex: '#64748b', lightHex: '#f8fafc' },
];

const SUGGESTED_TAGS = [
  'dairy',
  'walkthrough',
  'avocado',
  'tea',
  'irrigation',
  'feed-tmr',
  'machinery',
  'vet-alert',
  'biosecurity',
  'payroll',
  'scouting',
  'boma-rhodes'
];

const TEMPLATES: { title: string; category: FarmNoteCategory; color: FarmNoteColor; priority: FarmNotePriority; snippet: string; checklists: string[] }[] = [
  {
    title: '🌿 Daily Farm Walkthrough Report',
    category: 'General',
    color: 'emerald',
    priority: 'medium',
    snippet: `## 🌅 Morning Farm Walkthrough
**Date:** [DATE]
**Conducted by:** Overall Farm Manager

### 1. Water Reticulation & Irrigation
- Borehole pumping pressure: 4.2 bar
- Main gravity tank levels: 95% filled
- Drip line leaks or repairs needed: None detected; Block 1 lines flushed

### 2. Dairy & Livestock Compound
- Morning milking total yield: 342 Liters
- Herd health observations: Cow C-083 showing clear standing heat
- Calf pen cleanliness & bedding: Refreshed with dry Rhodes grass straw

### 3. Crop Blocks & Pastures
- Soil moisture condition: 76% field capacity (optimal)
- Weeding status: Tea Zone B scheduled for casual weeding
- Pest activity: Trap checks normal; zero fruit fly counts

> **Action Required Today:** Maintain routine 45-min drip cycle in Avocado Block 1 and prepare AI straw for afternoon insemination.`,
    checklists: [
      'Check water levels in all animal troughs',
      'Inspect perimeter electric fence voltage',
      'Review casual plucked tea / avocado logs'
    ]
  },
  {
    title: '🥛 Dairy Herd Rations & Breeding Log',
    category: 'Dairy & Herd',
    color: 'blue',
    priority: 'high',
    snippet: `### 🐄 Dairy Unit Management & Heat Observation
**Shift:** Morning / Afternoon
**Supervisor:** Dairy Herdsman

#### 1. Rations & Feed Intake
- Silage allocated (kg): 16 kg / cow
- Dairy meal fed per group: 6.5 kg high-producer ration
- Fodder / Hay condition: Boma Rhodes sweet scent, crisp DM

#### 2. Heat Detection & AI Flags
- Cow Tag: C-083 (Precious)
- Signs detected: Clear mucus discharge, standing heat, bellowing
- Insemination schedule (AM/PM rule): 16:30 PM service
- Bull / Straw Ref: Semex Supersire Hol 982

#### 3. Veterinary Follow-ups
- Cow ID: C-044
- Symptoms observed: Minor teat laceration post-milking
- Drug administered: Chlorhexidine barrier spray + zinc wound ointment`,
    checklists: [
      'Record morning milking yield in ledger',
      'Isolate cow in standing heat for AI technician',
      'Dip teat cups in chlorhexidine post-milking'
    ]
  },
  {
    title: '🥑 Crop & Orchard Scouting Inspection',
    category: 'Crops & Agronomy',
    color: 'amber',
    priority: 'medium',
    snippet: `### 🥑 Avocado / Crop Scouting & Phenology
**Block:** Block 1 / Block 2 / Ridge
**Agronomist:** Estate Agronomy Lead

#### 1. Tree Canopy & Flowering Stage
- Flowering / Fruitlet sizing: 85% fruit set; 18-22mm diameter
- Skirt clearance check (50cm): Well-maintained above ground
- Tree vigour & leaf colour: Deep forest green, healthy flushes

#### 2. Pest & Disease Monitoring
- Thrips count / sample leaves: 2 per 10 leaves (below spray threshold)
- FCM pheromone trap check: 0 moths caught
- Anthracnose / Cercospora signs: None detected; copper trunk paint intact

#### 3. Spray & Nutrition Plan
- Chemical/Fertilizer recommended: Foliar boron + calcium nitrate booster
- Dosage & application method: 250ml / 100L water via mist blower
- Pre-Harvest Interval (PHI) days: 28 days`,
    checklists: [
      'Check Delta pheromone trap sticky liners',
      'Inspect irrigation drippers along main block line',
      'Ensure PPE gear is ready for spray team'
    ]
  },
  {
    title: '🚜 Machinery & Equipment Pre-Shift Protocol',
    category: 'Machinery & Workshop',
    color: 'purple',
    priority: 'medium',
    snippet: `### 🛠️ Workshop & Equipment Safety Check
**Machine Name:** Massey Ferguson 375 Tractor
**Operator:** David (Lead Driver)

#### 1. Fluids & Mechanical Checks
- Engine oil dipstick level: [X] Full mark  [ ] Needs top-up
- Radiator coolant: [X] Filled  [ ] Leaking
- Battery voltage & terminal corrosion: 12.8V, clean terminals greased
- Tyre pressures / track tension: Front 28 PSI, Rear 20 PSI

#### 2. Workshop Activity
- Blades sharpened: Chaffcutter rotary discs polished
- Greasing points serviced: PTO shaft and 3-point hitch nipples greased
- Replacement parts fitted: Fuel water-separator filter renewed`,
    checklists: [
      'Clean chaffcutter blades and grease bearings',
      'Check tractor fuel level and log hours',
      'Store all workshop tools in designated shadow board'
    ]
  },
  {
    title: '💼 Weekly Farm Staff & Duty Briefing',
    category: 'Staff & Operations',
    color: 'slate',
    priority: 'low',
    snippet: `### 📋 Weekly Staff Coordination Meeting
**Attendees:** Devin, Josephine, David, Mosoti
**Location:** Farm Management Office

#### Key Discussion Points:
1. Review of previous week's production targets: Milk exceeded target by 8.4%.
2. Casual worker allocations for tea plucking / weeding: 6 casuals assigned to Chinga ridge.
3. Safety protocols & PPE enforcement: Mandatory gumboots and chemical aprons verified.
4. Upcoming farm visitors / KTDA collection schedule: KTDA lorry expected daily at 14:00.

> **Decisions & Commitments:** Mosoti to lead weekly silo compaction audit on Thursday.`,
    checklists: [
      'Confirm staff off-duty rotation for the weekend',
      'Verify protective gloves and boots inventory',
      'Approve weekly casual payroll register'
    ]
  }
];

// Rich Markdown View Component
function MarkdownPreview({ content, onToggleCheck }: { content: string; onToggleCheck?: (taskText: string) => void }) {
  const lines = useMemo(() => content.split('\n'), [content]);

  if (!content.trim()) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400 italic text-sm">
        <Sparkles size={24} className="mb-2 text-slate-300" />
        No note content to preview yet. Switch to Edit mode to write or use Voice Dictation.
      </div>
    );
  }

  return (
    <div className="space-y-3 font-sans text-slate-800 leading-relaxed">
      {lines.map((rawLine, idx) => {
        const line = rawLine.trim();

        if (!line) {
          return <div key={idx} className="h-2" />;
        }

        // Horizontal rule
        if (line === '---' || line === '***' || line === '___') {
          return <hr key={idx} className="my-4 border-slate-200" />;
        }

        // H1 Heading
        if (line.startsWith('# ')) {
          return (
            <h1 key={idx} className="text-xl sm:text-2xl font-black text-slate-900 pb-1.5 border-b border-slate-200 mt-4 mb-2 tracking-tight">
              {line.replace(/^#\s+/, '')}
            </h1>
          );
        }

        // H2 Heading
        if (line.startsWith('## ')) {
          return (
            <h2 key={idx} className="text-lg sm:text-xl font-extrabold text-emerald-800 mt-4 mb-1.5 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-emerald-600 rounded-full inline-block" />
              {line.replace(/^##\s+/, '')}
            </h2>
          );
        }

        // H3 Heading
        if (line.startsWith('### ')) {
          return (
            <h3 key={idx} className="text-base font-bold text-slate-900 mt-3 mb-1">
              {line.replace(/^###\s+/, '')}
            </h3>
          );
        }

        // H4 Heading
        if (line.startsWith('#### ')) {
          return (
            <h4 key={idx} className="text-sm font-bold text-slate-700 mt-2 mb-1 uppercase tracking-wide">
              {line.replace(/^####\s+/, '')}
            </h4>
          );
        }

        // Blockquote
        if (line.startsWith('> ')) {
          const quoteBody = line.replace(/^>\s+/, '');
          return (
            <blockquote key={idx} className="my-3 pl-4 py-2 border-l-4 border-emerald-500 bg-emerald-50/60 rounded-r-xl text-slate-700 text-xs sm:text-sm font-medium italic">
              {renderFormattedInline(quoteBody)}
            </blockquote>
          );
        }

        // Interactive Markdown Checkbox Task: - [ ] or - [x]
        if (line.startsWith('- [ ] ') || line.startsWith('- [x] ') || line.startsWith('- [X] ')) {
          const isDone = line.startsWith('- [x] ') || line.startsWith('- [X] ');
          const taskText = line.replace(/^- \[[ xX]\]\s*/, '');
          return (
            <div key={idx} className="flex items-start gap-2.5 py-1 text-xs sm:text-sm">
              <button
                type="button"
                onClick={() => onToggleCheck && onToggleCheck(taskText)}
                className="mt-0.5 text-emerald-600 hover:text-emerald-700 cursor-pointer bg-transparent border-0 p-0"
              >
                {isDone ? <CheckSquare size={16} className="text-emerald-600" /> : <Square size={16} className="text-slate-400" />}
              </button>
              <span className={isDone ? 'line-through text-slate-400 font-normal' : 'text-slate-800 font-semibold'}>
                {renderFormattedInline(taskText)}
              </span>
            </div>
          );
        }

        // Bullet item: - or *
        if (line.startsWith('- ') || line.startsWith('* ')) {
          const text = line.replace(/^[-*]\s+/, '');
          return (
            <div key={idx} className="flex items-start gap-2 pl-2 text-xs sm:text-sm text-slate-700 py-0.5">
              <span className="text-emerald-600 font-bold select-none">•</span>
              <span>{renderFormattedInline(text)}</span>
            </div>
          );
        }

        // Numbered list item: 1.
        const numMatch = line.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2 text-xs sm:text-sm text-slate-700 py-0.5">
              <span className="font-bold text-slate-500 font-mono text-xs w-5">{numMatch[1]}.</span>
              <span>{renderFormattedInline(numMatch[2])}</span>
            </div>
          );
        }

        // Code / metric block
        if (line.startsWith('```')) {
          return null; // Multi-line code fence handler handles below
        }

        // Standard Paragraph
        return (
          <p key={idx} className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {renderFormattedInline(line)}
          </p>
        );
      })}
    </div>
  );
}

// Inline formatting parser for bold, italic, code
function renderFormattedInline(text: string) {
  // Regex to split by bold **text**, code `text`, and italic *text*
  const parts = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-extrabold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="px-1.5 py-0.5 bg-slate-100 text-emerald-800 rounded font-mono text-xs border border-slate-200">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={i} className="italic text-slate-800">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}

export function FarmNotesHub() {
  const { farmNotes, setFarmNotes } = useFarmState();

  // View States
  const [viewMode, setViewMode] = useState<'split' | 'timeline' | 'grid'>('split');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(() => {
    return farmNotes.length > 0 ? farmNotes[0].id : null;
  });
  const [mobileEditorOpen, setMobileEditorOpen] = useState<boolean>(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'week' | 'month' | 'specific_date'>('all');
  const [specificDate, setSpecificDate] = useState<string>(toIsoDate(new Date()));
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'updated' | 'title'>('date_desc');

  // Editor states
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editDate, setEditDate] = useState(toIsoDate(new Date()));
  const [editTime, setEditTime] = useState('08:00');
  const [editCategory, setEditCategory] = useState<FarmNoteCategory>('General');
  const [editColor, setEditColor] = useState<FarmNoteColor>('emerald');
  const [editPriority, setEditPriority] = useState<FarmNotePriority>('medium');
  const [editPinned, setEditPinned] = useState(false);
  const [editTags, setEditTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [editChecklists, setEditChecklists] = useState<NoteChecklistItem[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [editorPreviewMode, setEditorPreviewMode] = useState<'edit' | 'preview'>('edit');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [templateMenuOpen, setTemplateMenuOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Voice Dictation
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    farmNotes.forEach(n => (n.tags || []).forEach(t => tagsSet.add(t.toLowerCase().trim())));
    return Array.from(tagsSet).filter(Boolean).sort();
  }, [farmNotes]);

  // Currently active note object
  const currentNote = useMemo(() => {
    return farmNotes.find(n => n.id === selectedNoteId) || null;
  }, [farmNotes, selectedNoteId]);

  // Ensure selected note is valid
  useEffect(() => {
    if (!selectedNoteId && farmNotes.length > 0) {
      setSelectedNoteId(farmNotes[0].id);
    } else if (selectedNoteId && !farmNotes.some(n => n.id === selectedNoteId)) {
      setSelectedNoteId(farmNotes.length > 0 ? farmNotes[0].id : null);
    }
  }, [farmNotes, selectedNoteId]);

  // Load active note into editor when selection changes
  useEffect(() => {
    if (currentNote) {
      setEditTitle(currentNote.title || '');
      setEditContent(currentNote.content || '');
      setEditDate(currentNote.date || toIsoDate(new Date()));
      setEditTime(currentNote.time || '08:00');
      setEditCategory(currentNote.category || 'General');
      setEditColor(currentNote.color || 'emerald');
      setEditPriority(currentNote.priority || 'medium');
      setEditPinned(!!currentNote.pinned);
      setEditTags(currentNote.tags || []);
      setEditChecklists(currentNote.checklists || []);
      setSaveStatus('saved');
    }
  }, [selectedNoteId]);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Keyboard shortcut Ctrl+S or Cmd+S to force save indicator
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveCurrentNote();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNoteId, editTitle, editContent, editDate, editTime, editCategory, editColor, editPriority, editPinned, editTags, editChecklists]);

  // Date Filtering Logic
  const todayStr = toIsoDate(new Date());
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = toIsoDate(yesterdayDate);

  const filteredNotes = useMemo(() => {
    return farmNotes.filter(note => {
      // Archive filter
      if (!showArchived && note.archived) return false;
      if (showArchived && !note.archived) return false;

      // Category filter
      if (selectedCategory !== 'all' && note.category !== selectedCategory) return false;

      // Priority filter
      if (selectedPriority !== 'all' && note.priority !== selectedPriority) return false;

      // Tag filter
      if (selectedTag !== 'all' && !(note.tags || []).map(t => t.toLowerCase()).includes(selectedTag.toLowerCase())) {
        return false;
      }

      // Date filter
      if (dateFilter === 'today' && note.date !== todayStr) return false;
      if (dateFilter === 'yesterday' && note.date !== yesterdayStr) return false;
      if (dateFilter === 'specific_date' && note.date !== specificDate) return false;

      if (dateFilter === 'week') {
        const noteD = new Date(note.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        if (noteD < weekAgo) return false;
      }

      if (dateFilter === 'month') {
        const noteD = new Date(note.date);
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        if (noteD < monthAgo) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = (note.title || '').toLowerCase().includes(q);
        const inContent = (note.content || '').toLowerCase().includes(q);
        const inCategory = (note.category || '').toLowerCase().includes(q);
        const inTags = (note.tags || []).some(t => t.toLowerCase().includes(q));
        if (!inTitle && !inContent && !inCategory && !inTags) return false;
      }

      return true;
    }).sort((a, b) => {
      // Pinned always on top
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;

      if (sortBy === 'date_desc') {
        return b.date.localeCompare(a.date) || (b.time || '').localeCompare(a.time || '');
      }
      if (sortBy === 'date_asc') {
        return a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || '');
      }
      if (sortBy === 'updated') {
        return (b.updatedAt || '').localeCompare(a.updatedAt || '');
      }
      if (sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return 0;
    });
  }, [farmNotes, showArchived, selectedCategory, selectedPriority, selectedTag, dateFilter, specificDate, searchQuery, sortBy, todayStr, yesterdayStr]);

  // Statistics
  const stats = useMemo(() => {
    const totalActive = farmNotes.filter(n => !n.archived).length;
    const totalArchived = farmNotes.filter(n => n.archived).length;
    const todayCount = farmNotes.filter(n => !n.archived && n.date === todayStr).length;
    const pinnedCount = farmNotes.filter(n => !n.archived && n.pinned).length;
    let pendingChecklists = 0;
    farmNotes.filter(n => !n.archived).forEach(n => {
      (n.checklists || []).forEach(c => {
        if (!c.completed) pendingChecklists++;
      });
    });
    return { totalActive, totalArchived, todayCount, pinnedCount, pendingChecklists };
  }, [farmNotes, todayStr]);

  // Auto-Save or Save handler
  const saveCurrentNote = (overrides?: Partial<FarmNote>) => {
    if (!selectedNoteId) return;

    setSaveStatus('saving');

    const updatedNote: FarmNote = {
      id: selectedNoteId,
      title: overrides?.title !== undefined ? overrides.title : (editTitle.trim() || 'Untitled Farm Note'),
      content: overrides?.content !== undefined ? overrides.content : editContent,
      date: overrides?.date !== undefined ? overrides.date : editDate,
      time: overrides?.time !== undefined ? overrides.time : editTime,
      category: overrides?.category !== undefined ? overrides.category : editCategory,
      color: overrides?.color !== undefined ? overrides.color : editColor,
      priority: overrides?.priority !== undefined ? overrides.priority : editPriority,
      pinned: overrides?.pinned !== undefined ? overrides.pinned : editPinned,
      tags: overrides?.tags !== undefined ? overrides.tags : editTags,
      checklists: overrides?.checklists !== undefined ? overrides.checklists : editChecklists,
      createdAt: currentNote?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      archived: overrides?.archived !== undefined ? overrides.archived : (currentNote?.archived || false)
    };

    setFarmNotes(prev => prev.map(n => (n.id === selectedNoteId ? updatedNote : n)));

    setTimeout(() => {
      setSaveStatus('saved');
    }, 200);
  };

  // Direct toggle for checklist items across all views (Split, Timeline, Grid)
  const toggleChecklistDirect = (noteId: string, checkId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFarmNotes(prev => prev.map(n => {
      if (n.id !== noteId) return n;
      const updatedChecklists = (n.checklists || []).map(c =>
        c.id === checkId ? { ...c, completed: !c.completed } : c
      );
      if (n.id === selectedNoteId) {
        setEditChecklists(updatedChecklists);
      }
      return { ...n, checklists: updatedChecklists, updatedAt: new Date().toISOString() };
    }));
  };

  // Toggle voice dictation
  const handleToggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice dictation is supported in modern browsers such as Google Chrome, Microsoft Edge, and Safari (iOS & macOS). Please open in a supported browser.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          setEditContent(prev => {
            const separator = prev && !prev.endsWith(' ') && !prev.endsWith('\n') ? ' ' : '';
            const updated = prev + separator + finalTranscript.trim();
            saveCurrentNote({ content: updated });
            return updated;
          });
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition notice:", event);
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          alert("Microphone permission was denied. Please allow microphone access in your browser or device settings to use Voice to Text.");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Speech recognition error:", err);
      setIsListening(false);
    }
  };

  // Dedicated helper to trigger Voice Dictation from anywhere (e.g. top header)
  const handleVoiceDictationClick = () => {
    if (viewMode !== 'split') {
      setViewMode('split');
    }
    setMobileEditorOpen(true);
    setEditorPreviewMode('edit');

    // If no note exists at all, create one first
    if (!currentNote && farmNotes.length === 0) {
      handleCreateNote();
      setTimeout(() => {
        handleToggleListening();
      }, 200);
      return;
    }

    handleToggleListening();
  };

  // Create New Note
  const handleCreateNote = (templateIndex?: number) => {
    const newId = `note-${Date.now()}`;
    const now = new Date();
    const timeNow = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const template = templateIndex !== undefined ? TEMPLATES[templateIndex] : null;

    const newNote: FarmNote = {
      id: newId,
      title: template ? template.title : `🌿 Farm Note (${editDate || todayStr})`,
      content: template ? template.snippet.replace('[DATE]', editDate || todayStr) : '',
      date: editDate || todayStr,
      time: timeNow,
      category: template ? template.category : 'General',
      tags: template ? ['walkthrough', 'audit'] : ['daily-log'],
      pinned: false,
      color: template ? template.color : 'emerald',
      priority: template ? template.priority : 'medium',
      checklists: template
        ? template.checklists.map((text, idx) => ({ id: `chk-${Date.now()}-${idx}`, text, completed: false }))
        : [],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      archived: false
    };

    setFarmNotes(prev => [newNote, ...prev]);
    setSelectedNoteId(newId);
    setMobileEditorOpen(true);
    setTemplateMenuOpen(false);
    if (showArchived) setShowArchived(false); // Switch to active stream when creating
  };

  // Delete Note
  const handleDeleteNote = (id: string) => {
    setFarmNotes(prev => prev.filter(n => n.id !== id));
    if (selectedNoteId === id) {
      const remaining = farmNotes.filter(n => n.id !== id);
      setSelectedNoteId(remaining.length > 0 ? remaining[0].id : null);
      if (remaining.length === 0) {
        setMobileEditorOpen(false);
      }
    }
    setDeleteConfirmId(null);
  };

  // Archive / Restore Note
  const handleToggleArchiveNote = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = farmNotes.find(n => n.id === id);
    if (!target) return;
    const newArchived = !target.archived;
    setFarmNotes(prev => prev.map(n => n.id === id ? { ...n, archived: newArchived, updatedAt: new Date().toISOString() } : n));
    if (selectedNoteId === id) {
      saveCurrentNote({ archived: newArchived });
    }
  };

  // Duplicate Note
  const handleDuplicateNote = (note: FarmNote) => {
    const copyId = `note-${Date.now()}`;
    const dup: FarmNote = {
      ...note,
      id: copyId,
      title: `${note.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setFarmNotes(prev => [dup, ...prev]);
    setSelectedNoteId(copyId);
  };

  // Toggle checklist item in editor
  const handleToggleChecklist = (checkId: string) => {
    const updated = editChecklists.map(c => c.id === checkId ? { ...c, completed: !c.completed } : c);
    setEditChecklists(updated);
    saveCurrentNote({ checklists: updated });
  };

  // Add checklist item
  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    const newItem: NoteChecklistItem = {
      id: `chk-${Date.now()}`,
      text: newChecklistText.trim(),
      completed: false
    };
    const updated = [...editChecklists, newItem];
    setEditChecklists(updated);
    setNewChecklistText('');
    saveCurrentNote({ checklists: updated });
  };

  // Remove checklist item
  const handleRemoveChecklistItem = (checkId: string) => {
    const updated = editChecklists.filter(c => c.id !== checkId);
    setEditChecklists(updated);
    saveCurrentNote({ checklists: updated });
  };

  // Add Tag
  const handleAddTag = (tagToAdd?: string) => {
    const raw = tagToAdd || newTagInput;
    const clean = raw.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (clean && !editTags.includes(clean)) {
      const updated = [...editTags, clean];
      setEditTags(updated);
      setNewTagInput('');
      saveCurrentNote({ tags: updated });
    }
  };

  // Remove Tag
  const handleRemoveTag = (tagToRemove: string) => {
    const updated = editTags.filter(t => t !== tagToRemove);
    setEditTags(updated);
    saveCurrentNote({ tags: updated });
  };

  // Insert Timestamp into Editor
  const handleInsertTimestamp = () => {
    const now = new Date();
    const stamp = `\n\n> ⏱️ **Timestamp [${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]**:\n`;
    setEditContent(prev => prev + stamp);
    saveCurrentNote({ content: editContent + stamp });
  };

  // Formatting helper for textarea
  const applyFormatting = (prefix: string, suffix: string = '') => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = editContent;
    const selected = text.substring(start, end);
    const replacement = prefix + selected + suffix;
    const updated = text.substring(0, start) + replacement + text.substring(end);
    setEditContent(updated);
    saveCurrentNote({ content: updated });
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 10);
  };

  // Copy note text to clipboard
  const handleCopyNote = () => {
    if (!currentNote) return;
    const formatted = `${currentNote.title}\nDate: ${currentNote.date} ${currentNote.time || ''}\nCategory: ${currentNote.category}\n\n${currentNote.content}\n\n${(currentNote.checklists || []).map(c => `[${c.completed ? 'X' : ' '}] ${c.text}`).join('\n')}`;
    navigator.clipboard.writeText(formatted);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  // Download Markdown file
  const handleDownloadMarkdown = () => {
    if (!currentNote) return;
    const content = `# ${currentNote.title}\n\n- **Date:** ${currentNote.date} ${currentNote.time || ''}\n- **Category:** ${currentNote.category}\n- **Priority:** ${currentNote.priority || 'medium'}\n- **Tags:** ${(currentNote.tags || []).map(t => `#${t}`).join(', ')}\n\n---\n\n${currentNote.content}\n\n## Action Checklist\n${(currentNote.checklists || []).map(c => `- [${c.completed ? 'x' : ' '}] ${c.text}`).join('\n')}\n`;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentNote.date}_${(currentNote.title || 'note').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Group notes by date for timeline
  const groupedNotesByDate = useMemo(() => {
    const groups: { [date: string]: FarmNote[] } = {};
    filteredNotes.forEach(note => {
      if (!groups[note.date]) groups[note.date] = [];
      groups[note.date].push(note);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filteredNotes]);

  // Relative Date Badge helper
  const getRelativeDateBadge = (dateStr: string) => {
    if (dateStr === todayStr) return { text: 'Today', tone: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    if (dateStr === yesterdayStr) return { text: 'Yesterday', tone: 'bg-blue-100 text-blue-800 border-blue-300' };
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.round((now.getTime() - d.getTime()) / (1000 * 3600 * 24));
    if (diffDays > 0 && diffDays <= 7) return { text: `${diffDays}d ago`, tone: 'bg-slate-100 text-slate-700 border-slate-200' };
    return { text: dateStr, tone: 'bg-slate-50 text-slate-600 border-slate-200' };
  };

  // Word count & Read time
  const wordCount = useMemo(() => {
    const words = editContent.trim().split(/\s+/).filter(Boolean);
    return words.length;
  }, [editContent]);

  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 180));

  return (
    <div className="flex flex-col h-full w-full bg-slate-100 min-h-screen">
      {/* 1. TOP COMMAND BAR */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 shrink-0 shadow-xs sticky top-0 z-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/20">
              <BookOpen size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Farm Journal & Notes</h1>
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-full border border-slate-200 text-xs">
                  <button
                    onClick={() => setShowArchived(false)}
                    className={`px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer border-0 m-0 ${
                      !showArchived ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Active ({stats.totalActive})
                  </button>
                  <button
                    onClick={() => setShowArchived(true)}
                    className={`px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer border-0 m-0 ${
                      showArchived ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Archived ({stats.totalArchived})
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Comprehensive estate journal • Voice dictation, Markdown preview & executive PDF digest
              </p>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="hidden xl:flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-600">
              <span className="flex items-center gap-1 font-semibold">
                <Calendar size={13} className="text-emerald-600" /> Today: <strong className="text-slate-900">{stats.todayCount}</strong>
              </span>
              <span className="w-px h-3 bg-slate-300" />
              <span className="flex items-center gap-1 font-semibold">
                <Pin size={13} className="text-amber-500" /> Pinned: <strong className="text-slate-900">{stats.pinnedCount}</strong>
              </span>
              <span className="w-px h-3 bg-slate-300" />
              <span className="flex items-center gap-1 font-semibold">
                <CheckSquare size={13} className="text-blue-600" /> Open Tasks: <strong className="text-slate-900">{stats.pendingChecklists}</strong>
              </span>
            </div>

            {/* View Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-slate-600">
              <button
                onClick={() => setViewMode('split')}
                title="Split List & Editor View"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-0 m-0 ${
                  viewMode === 'split' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                <Columns size={14} />
                <span className="hidden sm:inline">Split</span>
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                title="Daily Timeline View"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-0 m-0 ${
                  viewMode === 'timeline' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                <History size={14} />
                <span className="hidden sm:inline">Timeline</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                title="Sticky Cards Grid View"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-0 m-0 ${
                  viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                <LayoutGrid size={14} />
                <span className="hidden sm:inline">Grid</span>
              </button>
            </div>

            {/* Print Digest PDF */}
            <button
              onClick={() => generateAllNotesSummaryPdf(filteredNotes, showArchived ? `Archived Notes (${filteredNotes.length})` : `Active Notes (${filteredNotes.length})`)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-all cursor-pointer shadow-xs active:scale-95 m-0"
              title="Export all visible notes to a clean PDF summary"
            >
              <Printer size={14} className="text-slate-500" />
              <span className="hidden md:inline">Print Digest</span>
            </button>

            {/* Prominent Voice-to-Text Button */}
            <button
              onClick={handleVoiceDictationClick}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95 border m-0 ${
                isListening
                  ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-600 animate-pulse ring-2 ring-rose-400'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}
              title={isListening ? "Voice Dictation Active (Click to Stop)" : "Voice to Text: Speak into microphone to dictate note"}
            >
              {isListening ? (
                <>
                  <MicOff size={15} />
                  <span>Stop Dictating</span>
                </>
              ) : (
                <>
                  <Mic size={15} className="text-emerald-700" />
                  <span>Voice to Text</span>
                </>
              )}
            </button>

            {/* Template Selector & New Note */}
            <div className="relative">
              <div className="inline-flex rounded-xl shadow-sm">
                <button
                  onClick={() => handleCreateNote()}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-l-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-emerald-700/20 active:scale-95 border-0 m-0"
                >
                  <Plus size={16} />
                  <span>New Note</span>
                </button>
                <button
                  onClick={() => setTemplateMenuOpen(!templateMenuOpen)}
                  className="px-2.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-r-xl border-l border-emerald-500 text-xs font-bold transition-all cursor-pointer m-0"
                  title="Choose Farm Note Template"
                >
                  <ChevronDown size={14} />
                </button>
              </div>

              {/* Template Dropdown */}
              {templateMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-fadeIn">
                  <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center gap-1.5">
                    <Sparkles size={12} className="text-amber-500" />
                    Quick Farm Templates
                  </div>
                  <div className="space-y-1 mt-1">
                    {TEMPLATES.map((tmpl, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleCreateNote(idx)}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all flex items-center justify-between cursor-pointer border-0 m-0"
                      >
                        <span className="truncate">{tmpl.title}</span>
                        <ChevronRight size={13} className="text-slate-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. FILTER & DATE SCRUBBER BAR */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search notes by title, keywords, #tags, or content..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 transition-all outline-hidden shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 border-0 bg-transparent cursor-pointer p-0"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Quick Date Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
              <Calendar size={12} /> Date:
            </span>
            {(['all', 'today', 'yesterday', 'week', 'month'] as const).map(df => (
              <button
                key={df}
                onClick={() => setDateFilter(df)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer border m-0 ${
                  dateFilter === df
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                {df === 'week' ? 'Past 7 Days' : df === 'month' ? 'This Month' : df}
              </button>
            ))}

            {/* Custom Exact Date Picker */}
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs">
              <input
                type="date"
                value={specificDate}
                onChange={e => {
                  setSpecificDate(e.target.value);
                  setDateFilter('specific_date');
                }}
                className="text-xs font-semibold text-slate-700 bg-transparent border-0 outline-hidden cursor-pointer"
              />
              {dateFilter === 'specific_date' && (
                <button
                  onClick={() => setDateFilter('all')}
                  className="text-slate-400 hover:text-slate-700 border-0 bg-transparent p-0 cursor-pointer"
                  title="Reset date filter"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-2 outline-hidden cursor-pointer shadow-xs"
            >
              <option value="all">📂 All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>

            {/* Sort Options */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-2 outline-hidden cursor-pointer shadow-xs"
            >
              <option value="date_desc">📅 Date: Newest First</option>
              <option value="date_asc">📅 Date: Oldest First</option>
              <option value="updated">⏱️ Recently Updated</option>
              <option value="title">🔤 Title A-Z</option>
            </select>
          </div>
        </div>

        {/* Tag chips ribbon (if tags exist) */}
        {allTags.length > 0 && (
          <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 shrink-0">
              <Tag size={11} /> Tags:
            </span>
            <button
              onClick={() => setSelectedTag('all')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold shrink-0 cursor-pointer border m-0 ${
                selectedTag === 'all'
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              All
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? 'all' : tag)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold shrink-0 cursor-pointer border m-0 transition-all ${
                  selectedTag === tag
                    ? 'bg-cyan-700 text-white border-cyan-700'
                    : 'bg-cyan-50/70 text-cyan-800 border-cyan-200 hover:bg-cyan-100'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* ARCHIVE NOTICE BANNER (when viewing archive) */}
      {showArchived && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <Archive size={16} className="text-amber-700" />
            <span className="font-bold">Viewing Archived Farm Notes ({filteredNotes.length}).</span>
            <span className="text-amber-700 hidden sm:inline">These records are safely stored and isolated from your daily active stream.</span>
          </div>
          <button
            onClick={() => setShowArchived(false)}
            className="font-bold text-amber-800 hover:underline cursor-pointer bg-transparent border-0"
          >
            ← Back to Active Notes
          </button>
        </div>
      )}

      {/* 3. MAIN BODY VIEWS */}

      {/* MODE A: SPLIT MASTER-DETAIL VIEW */}
      {viewMode === 'split' && (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          {/* LEFT COLUMN: NOTE CARDS LIST */}
          <div
            className={`w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col h-[calc(100vh-140px)] md:h-auto overflow-y-auto shrink-0 ${
              mobileEditorOpen ? 'hidden md:flex' : 'flex'
            }`}
          >
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-500">
              <span>{filteredNotes.length} {filteredNotes.length === 1 ? 'Note' : 'Notes'} Found</span>
              {filteredNotes.length > 0 && (
                <span className="text-[10px] font-bold text-slate-400">Click to edit on right</span>
              )}
            </div>

            {filteredNotes.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center my-auto">
                <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                  <BookOpen size={24} />
                </div>
                <h4 className="text-sm font-bold text-slate-700 mb-1">No Farm Notes Found</h4>
                <p className="text-xs text-slate-400 max-w-xs mb-4">
                  {showArchived
                    ? 'No archived notes match the selected filters.'
                    : 'There are no active notes matching the selected date or search filter.'}
                </p>
                {!showArchived && (
                  <button
                    onClick={() => handleCreateNote()}
                    className="px-3.5 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-emerald-700 border-0"
                  >
                    Create Note for {editDate || 'Today'}
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredNotes.map(note => {
                  const isSelected = selectedNoteId === note.id;
                  const relBadge = getRelativeDateBadge(note.date);
                  const colorTheme = COLOR_THEMES.find(c => c.id === note.color) || COLOR_THEMES[0];
                  const checklistTotal = note.checklists?.length || 0;
                  const checklistDone = note.checklists?.filter(c => c.completed).length || 0;

                  return (
                    <div
                      key={note.id}
                      onClick={() => {
                        setSelectedNoteId(note.id);
                        setMobileEditorOpen(true);
                      }}
                      className={`p-3.5 transition-all cursor-pointer relative group flex flex-col gap-1.5 ${
                        isSelected
                          ? 'bg-emerald-50/70 border-l-4 border-l-emerald-600 shadow-xs'
                          : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                      }`}
                    >
                      {/* Top Ribbon: Category, Date, Pin */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${relBadge.tone}`}>
                            {relBadge.text}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500">
                            {note.time || ''}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {note.archived && (
                            <span title="Archived note" className="text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded text-[10px] font-bold">
                              Archived
                            </span>
                          )}
                          {note.pinned && (
                            <span title="Pinned to top" className="text-amber-500 bg-amber-50 p-1 rounded-md">
                              <Pin size={12} className="fill-amber-500" />
                            </span>
                          )}
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: colorTheme.hex }}
                            title={`Color: ${colorTheme.name}`}
                          />
                        </div>
                      </div>

                      {/* Note Title */}
                      <h3 className="text-sm font-extrabold text-slate-900 line-clamp-1 leading-snug group-hover:text-emerald-700">
                        {note.title || 'Untitled Note'}
                      </h3>

                      {/* Content Excerpt */}
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {note.content ? note.content.replace(/^#+\s+/gm, '').replace(/[*_`>]/g, '') : 'No content yet...'}
                      </p>

                      {/* Bottom row: Category badge, checklist progress, tags */}
                      <div className="flex flex-wrap items-center justify-between gap-1 mt-1 pt-1 border-t border-slate-100">
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          {note.category}
                        </span>

                        {checklistTotal > 0 && (
                          <span className={`text-[10px] font-bold flex items-center gap-1 ${
                            checklistDone === checklistTotal ? 'text-emerald-600' : 'text-blue-600'
                          }`}>
                            <CheckSquare size={11} />
                            {checklistDone}/{checklistTotal} Done
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: RICH NOTE EDITOR CANVAS */}
          <div
            className={`flex-1 flex-col bg-white overflow-y-auto ${
              mobileEditorOpen ? 'flex' : 'hidden md:flex'
            }`}
          >
            {currentNote ? (
              <div className="p-4 sm:p-8 max-w-4xl w-full mx-auto flex flex-col gap-6">
                {/* Mobile Back to List button */}
                <div className="flex md:hidden items-center justify-between pb-3 border-b border-slate-200">
                  <button
                    onClick={() => setMobileEditorOpen(false)}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border-0 cursor-pointer"
                  >
                    <ArrowLeft size={14} /> Back to Notes List
                  </button>
                  <span className="text-xs font-bold text-slate-400">{editDate}</span>
                </div>

                {/* Top Action Ribbon: Date, Time, Category, Priority, Color, Pin, Actions */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xs">
                  {/* Left: Date, Time, Category */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Date Picker */}
                    <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                      <Calendar size={14} className="text-emerald-600" />
                      <input
                        type="date"
                        value={editDate}
                        onChange={e => {
                          setEditDate(e.target.value);
                          saveCurrentNote({ date: e.target.value });
                        }}
                        className="text-xs font-bold text-slate-800 bg-transparent border-0 outline-hidden cursor-pointer"
                        title="Change Note Date"
                      />
                      <button
                        onClick={() => {
                          setEditDate(todayStr);
                          saveCurrentNote({ date: todayStr });
                        }}
                        className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded cursor-pointer border-0"
                        title="Set date to today"
                      >
                        Today
                      </button>
                    </div>

                    {/* Time Picker */}
                    <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                      <Clock size={13} className="text-slate-400" />
                      <input
                        type="time"
                        value={editTime}
                        onChange={e => {
                          setEditTime(e.target.value);
                          saveCurrentNote({ time: e.target.value });
                        }}
                        className="text-xs font-bold text-slate-800 bg-transparent border-0 outline-hidden cursor-pointer"
                        title="Time of note"
                      />
                    </div>

                    {/* Category Selector */}
                    <select
                      value={editCategory}
                      onChange={e => {
                        const val = e.target.value as FarmNoteCategory;
                        setEditCategory(val);
                        saveCurrentNote({ category: val });
                      }}
                      className="bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-1.5 outline-hidden cursor-pointer shadow-2xs"
                    >
                      {CATEGORIES.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>

                    {/* Priority Selector */}
                    <select
                      value={editPriority}
                      onChange={e => {
                        const val = e.target.value as FarmNotePriority;
                        setEditPriority(val);
                        saveCurrentNote({ priority: val });
                      }}
                      className={`text-xs font-bold rounded-xl px-2.5 py-1.5 border outline-hidden cursor-pointer ${
                        editPriority === 'urgent'
                          ? 'bg-rose-50 text-rose-700 border-rose-300 font-black'
                          : editPriority === 'high'
                          ? 'bg-amber-50 text-amber-700 border-amber-300'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      <option value="low">Priority: Low</option>
                      <option value="medium">Priority: Medium</option>
                      <option value="high">Priority: High</option>
                      <option value="urgent">Priority: 🚨 Urgent</option>
                    </select>
                  </div>

                  {/* Right: Color picker, Pin, Quick Tools, Save state */}
                  <div className="flex items-center gap-2">
                    {/* Color palette pills */}
                    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                      {COLOR_THEMES.map(ct => (
                        <button
                          key={ct.id}
                          onClick={() => {
                            setEditColor(ct.id);
                            saveCurrentNote({ color: ct.id });
                          }}
                          className={`w-5 h-5 rounded-full transition-all cursor-pointer border-0 m-0 ${
                            editColor === ct.id ? 'ring-2 ring-slate-800 scale-110 shadow-xs' : 'opacity-70 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: ct.hex }}
                          title={ct.name}
                        />
                      ))}
                    </div>

                    {/* Pin button */}
                    <button
                      onClick={() => {
                        const newPin = !editPinned;
                        setEditPinned(newPin);
                        saveCurrentNote({ pinned: newPin });
                      }}
                      className={`p-2 rounded-xl border transition-all cursor-pointer m-0 ${
                        editPinned
                          ? 'bg-amber-100 text-amber-800 border-amber-300 shadow-xs'
                          : 'bg-white hover:bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                      title={editPinned ? 'Unpin Note' : 'Pin Note to Top'}
                    >
                      <Pin size={15} className={editPinned ? 'fill-amber-600' : ''} />
                    </button>

                    {/* Archive / Restore Button */}
                    <button
                      onClick={() => handleToggleArchiveNote(currentNote.id)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer m-0 shadow-2xs ${
                        currentNote.archived
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                      title={currentNote.archived ? "Restore Note to Active stream" : "Archive this Note"}
                    >
                      {currentNote.archived ? <RotateCcw size={15} /> : <Archive size={15} />}
                    </button>

                    {/* Single Note PDF Export */}
                    <button
                      onClick={() => generateSingleNotePdf(currentNote)}
                      className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all cursor-pointer m-0 shadow-2xs"
                      title="Download Official Audit PDF of this Note"
                    >
                      <Download size={15} />
                    </button>

                    {/* Duplicate */}
                    <button
                      onClick={() => handleDuplicateNote(currentNote)}
                      className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all cursor-pointer m-0 shadow-2xs"
                      title="Duplicate Note"
                    >
                      <Copy size={15} />
                    </button>

                    {/* Delete button */}
                    {deleteConfirmId === currentNote.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDeleteNote(currentNote.id)}
                          className="px-2.5 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg border-0 cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border-0 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(currentNote.id)}
                        className="p-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-200 transition-all cursor-pointer m-0 shadow-2xs"
                        title="Delete Note"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}

                    {/* Live Saving Status */}
                    <span className="text-[10px] font-bold text-slate-400 pl-1">
                      {saveStatus === 'saving' ? (
                        <span className="text-amber-600 animate-pulse">Saving...</span>
                      ) : (
                        <span className="text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 size={11} /> Saved
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Title Input */}
                <div className="space-y-1">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={e => {
                      setEditTitle(e.target.value);
                      saveCurrentNote({ title: e.target.value });
                    }}
                    placeholder="Note Title (e.g. Morning Walkthrough & Agronomy Checklist)..."
                    className="w-full text-2xl sm:text-3xl font-black text-slate-900 placeholder-slate-300 border-0 outline-hidden bg-transparent tracking-tight"
                  />
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span>Last edited: {new Date(currentNote.updatedAt || currentNote.createdAt).toLocaleTimeString()}</span>
                    <span>•</span>
                    <span>{wordCount} words</span>
                    <span>•</span>
                    <span>~{readingTimeMinutes} min read</span>
                  </div>
                </div>

                {/* FORMATTING TOOLBAR */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-1">
                    <button
                      onClick={() => applyFormatting('**', '**')}
                      className="px-2 py-1 font-bold text-slate-700 hover:bg-white rounded cursor-pointer border-0 m-0"
                      title="Bold (**text**)"
                    >
                      B
                    </button>
                    <button
                      onClick={() => applyFormatting('*', '*')}
                      className="px-2 py-1 italic font-serif text-slate-700 hover:bg-white rounded cursor-pointer border-0 m-0"
                      title="Italic (*text*)"
                    >
                      I
                    </button>
                    <button
                      onClick={() => applyFormatting('~~', '~~')}
                      className="px-2 py-1 line-through text-slate-700 hover:bg-white rounded cursor-pointer border-0 m-0"
                      title="Strikethrough (~~text~~)"
                    >
                      S
                    </button>
                    <span className="w-px h-4 bg-slate-300 mx-1" />
                    <button
                      onClick={() => applyFormatting('# ')}
                      className="px-2 py-1 font-extrabold text-slate-700 hover:bg-white rounded cursor-pointer border-0 m-0 text-xs"
                      title="Heading 1"
                    >
                      H1
                    </button>
                    <button
                      onClick={() => applyFormatting('## ')}
                      className="px-2 py-1 font-bold text-slate-700 hover:bg-white rounded cursor-pointer border-0 m-0 text-xs"
                      title="Heading 2"
                    >
                      H2
                    </button>
                    <button
                      onClick={() => applyFormatting('### ')}
                      className="px-2 py-1 font-semibold text-slate-700 hover:bg-white rounded cursor-pointer border-0 m-0 text-xs"
                      title="Heading 3"
                    >
                      H3
                    </button>
                    <span className="w-px h-4 bg-slate-300 mx-1" />
                    <button
                      onClick={() => applyFormatting('- ')}
                      className="px-2 py-1 text-slate-700 hover:bg-white rounded cursor-pointer border-0 m-0"
                      title="Bullet List"
                    >
                      • List
                    </button>
                    <button
                      onClick={() => applyFormatting('1. ')}
                      className="px-2 py-1 text-slate-700 hover:bg-white rounded cursor-pointer border-0 m-0"
                      title="Numbered List"
                    >
                      1. List
                    </button>
                    <button
                      onClick={() => applyFormatting('> ')}
                      className="px-2 py-1 text-slate-700 hover:bg-white rounded cursor-pointer border-0 m-0"
                      title="Blockquote"
                    >
                      Quote
                    </button>
                    <button
                      onClick={() => applyFormatting('```\n', '\n```')}
                      className="px-2 py-1 font-mono text-slate-700 hover:bg-white rounded cursor-pointer border-0 m-0 text-xs"
                      title="Code / Metric block"
                    >
                      Code
                    </button>
                    <span className="w-px h-4 bg-slate-300 mx-1" />

                    {/* Quick Timestamp button */}
                    <button
                      onClick={handleInsertTimestamp}
                      className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-800 rounded-md font-bold text-[11px] border border-emerald-200 cursor-pointer m-0"
                      title="Insert Current Timestamp"
                    >
                      <Clock size={11} /> Timestamp
                    </button>

                    {/* Voice Dictation (Speech-to-Text) Button */}
                    <button
                      onClick={handleToggleListening}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black text-xs border cursor-pointer m-0 transition-all shadow-xs ${
                        isListening
                          ? 'bg-rose-600 text-white border-rose-600 animate-pulse ring-2 ring-rose-300'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'
                      }`}
                      title={isListening ? "Stop Voice Dictation" : "Dictate Note (Speech-to-Text)"}
                    >
                      {isListening ? (
                        <>
                          <MicOff size={13} />
                          <span>🔴 Listening... (Stop)</span>
                        </>
                      ) : (
                        <>
                          <Mic size={13} />
                          <span>🎙️ Voice to Text</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Preview Toggle */}
                  <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-[11px] font-bold">
                    <button
                      onClick={() => setEditorPreviewMode('edit')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer border-0 m-0 ${
                        editorPreviewMode === 'edit' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setEditorPreviewMode('preview')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer border-0 m-0 ${
                        editorPreviewMode === 'preview' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Preview
                    </button>
                  </div>
                </div>

                {/* Live Voice Dictation Active Banner */}
                {isListening && (
                  <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-3.5 flex items-center justify-between shadow-sm animate-pulse">
                    <div className="flex items-center gap-3">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
                      </span>
                      <div>
                        <div className="text-xs font-black text-rose-900 flex items-center gap-1.5">
                          <Mic size={14} className="text-rose-600" /> Listening to your voice in real time...
                        </div>
                        <p className="text-[11px] text-rose-700 font-medium">
                          Speak clearly into your microphone — your spoken words will be transcribed directly into your note text.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleToggleListening}
                      className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase rounded-xl cursor-pointer border-0 shadow-xs"
                    >
                      Done / Stop
                    </button>
                  </div>
                )}

                {/* CONTENT AREA: EDIT or PREVIEW */}
                {editorPreviewMode === 'edit' ? (
                  <textarea
                    ref={textareaRef}
                    value={editContent}
                    onChange={e => {
                      setEditContent(e.target.value);
                      saveCurrentNote({ content: e.target.value });
                    }}
                    placeholder="Write detailed notes, observations, feeding formulation changes, treatment logs, or agronomy updates here..."
                    rows={16}
                    className="w-full p-4 bg-white border border-slate-200 focus:border-emerald-500 rounded-2xl text-sm font-sans text-slate-800 leading-relaxed outline-hidden shadow-2xs resize-y"
                  />
                ) : (
                  <div className="w-full min-h-[350px] p-6 bg-slate-50 border border-slate-200 rounded-2xl">
                    <MarkdownPreview
                      content={editContent}
                      onToggleCheck={(taskText) => {
                        // Check if item exists in checklists or content
                        const matchingItem = editChecklists.find(c => c.text.toLowerCase() === taskText.toLowerCase());
                        if (matchingItem) {
                          handleToggleChecklist(matchingItem.id);
                        }
                      }}
                    />
                  </div>
                )}

                {/* INTERACTIVE ACTION CHECKLIST SECTION */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckSquare size={18} className="text-emerald-600" />
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                        Action Items & Checklists
                      </h4>
                      {editChecklists.length > 0 && (
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          {editChecklists.filter(c => c.completed).length}/{editChecklists.length} Done
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Checklist items list */}
                  {editChecklists.length > 0 && (
                    <div className="space-y-2">
                      {editChecklists.map(item => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/70 border border-slate-100 transition-all group"
                        >
                          <label className="flex items-center gap-3 cursor-pointer flex-1 select-none">
                            <input
                              type="checkbox"
                              checked={item.completed}
                              onChange={() => handleToggleChecklist(item.id)}
                              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            />
                            <span
                              className={`text-xs font-medium transition-all ${
                                item.completed ? 'line-through text-slate-400' : 'text-slate-800 font-semibold'
                              }`}
                            >
                              {item.text}
                            </span>
                          </label>
                          <button
                            onClick={() => handleRemoveChecklistItem(item.id)}
                            className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all border-0 bg-transparent cursor-pointer p-1"
                            title="Remove action item"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add new checklist item input */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={newChecklistText}
                      onChange={e => setNewChecklistText(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddChecklistItem();
                        }
                      }}
                      placeholder="Add an actionable follow-up task and press Enter..."
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-hidden focus:bg-white focus:border-emerald-500"
                    />
                    <button
                      onClick={handleAddChecklistItem}
                      disabled={!newChecklistText.trim()}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl cursor-pointer disabled:cursor-not-allowed border-0"
                    >
                      Add Task
                    </button>
                  </div>
                </div>

                {/* TAGS MANAGER SECTION */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col gap-3 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-1.5 flex-1">
                      <Tag size={14} className="text-slate-400 mr-1" />
                      {editTags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 bg-white text-cyan-800 font-bold px-2.5 py-1 rounded-lg border border-cyan-200 text-xs shadow-2xs"
                        >
                          #{tag}
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:text-rose-600 border-0 bg-transparent cursor-pointer p-0 text-cyan-500"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}

                      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1">
                        <input
                          type="text"
                          value={newTagInput}
                          onChange={e => setNewTagInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddTag();
                            }
                          }}
                          placeholder="Add tag..."
                          className="text-xs font-medium text-slate-700 bg-transparent border-0 outline-hidden w-20"
                        />
                        <button
                          onClick={() => handleAddTag()}
                          className="text-emerald-600 hover:text-emerald-800 font-bold border-0 bg-transparent cursor-pointer p-0"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Quick Export Tools */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopyNote}
                        className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 text-xs font-bold transition-all cursor-pointer m-0 shadow-2xs"
                      >
                        {copyFeedback ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                        {copyFeedback ? 'Copied!' : 'Copy Text'}
                      </button>
                      <button
                        onClick={handleDownloadMarkdown}
                        className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 text-xs font-bold transition-all cursor-pointer m-0 shadow-2xs"
                        title="Download Markdown file"
                      >
                        <Download size={13} />
                        <span>Export .md</span>
                      </button>
                    </div>
                  </div>

                  {/* Suggested Quick Tags Bar */}
                  <div className="pt-2 border-t border-slate-200/60 flex items-center gap-1.5 overflow-x-auto text-[11px]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">Quick Tags:</span>
                    {SUGGESTED_TAGS.filter(st => !editTags.includes(st)).slice(0, 8).map(st => (
                      <button
                        key={st}
                        onClick={() => handleAddTag(st)}
                        className="px-2 py-0.5 rounded-md bg-white hover:bg-emerald-50 text-slate-600 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 font-semibold transition-all cursor-pointer m-0 shrink-0"
                      >
                        + #{st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400 my-auto">
                <BookOpen size={48} className="text-slate-300 mb-3" />
                <h3 className="text-base font-bold text-slate-600">Select a note to view and edit</h3>
                <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">
                  Select any note on the left pane to edit its title, date, checklists, and content, or create a new note.
                </p>
                <button
                  onClick={() => handleCreateNote()}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-emerald-700 border-0 shadow-md shadow-emerald-700/20"
                >
                  Create New Note
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODE B: DAILY TIMELINE / JOURNAL VIEW */}
      {viewMode === 'timeline' && (
        <div className="flex-1 p-4 sm:p-8 max-w-4xl w-full mx-auto overflow-y-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Daily Farm Timeline & Journal</h2>
              <p className="text-xs text-slate-500">Chronological stream of all farm activities and observations</p>
            </div>
            <button
              onClick={() => handleCreateNote()}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer border-0 shadow-xs"
            >
              <Plus size={15} /> Add Entry Today
            </button>
          </div>

          <div className="space-y-8 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-slate-200">
            {groupedNotesByDate.map(([date, notes]) => {
              const relBadge = getRelativeDateBadge(date);
              const dateObj = new Date(date);
              const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

              return (
                <div key={date} className="relative pl-12 space-y-4">
                  {/* Timeline Node & Header */}
                  <div className="absolute left-3 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-emerald-600 border-4 border-white shadow-xs" />

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${relBadge.tone}`}>
                        {relBadge.text}
                      </span>
                      <h3 className="text-sm font-extrabold text-slate-800">{dayOfWeek}</h3>
                      <span className="text-xs text-slate-400">({notes.length} {notes.length === 1 ? 'entry' : 'entries'})</span>
                    </div>

                    <button
                      onClick={() => {
                        setEditDate(date);
                        handleCreateNote();
                      }}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-white hover:bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 cursor-pointer transition-all"
                    >
                      + Add Note on {date}
                    </button>
                  </div>

                  {/* Notes for this day */}
                  <div className="grid grid-cols-1 gap-3">
                    {notes.map(note => {
                      const colorTheme = COLOR_THEMES.find(c => c.id === note.color) || COLOR_THEMES[0];
                      return (
                        <div
                          key={note.id}
                          onClick={() => {
                            setSelectedNoteId(note.id);
                            setViewMode('split');
                          }}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white hover:shadow-md ${colorTheme.border} relative group`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                              <Clock size={12} /> {note.time || 'All Day'}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {note.archived && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                                  Archived
                                </span>
                              )}
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                {note.category}
                              </span>
                            </div>
                          </div>

                          <h4 className="text-base font-black text-slate-900 mb-1 group-hover:text-emerald-700">
                            {note.title || 'Untitled'}
                          </h4>

                          <p className="text-xs text-slate-600 whitespace-pre-line line-clamp-3 mb-3 leading-relaxed">
                            {note.content ? note.content.replace(/^#+\s+/gm, '') : ''}
                          </p>

                          {/* Checklists preview with direct interactive clicking */}
                          {note.checklists && note.checklists.length > 0 && (
                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-2 space-y-1">
                              <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                Action Items ({note.checklists.filter(c => c.completed).length}/{note.checklists.length})
                              </div>
                              {note.checklists.slice(0, 4).map(chk => (
                                <div
                                  key={chk.id}
                                  onClick={(e) => toggleChecklistDirect(note.id, chk.id, e)}
                                  className="text-xs text-slate-700 flex items-center gap-2 cursor-pointer hover:text-emerald-700 select-none py-0.5"
                                >
                                  {chk.completed ? (
                                    <CheckSquare size={13} className="text-emerald-600 shrink-0" />
                                  ) : (
                                    <Square size={13} className="text-slate-400 shrink-0" />
                                  )}
                                  <span className={chk.completed ? 'line-through text-slate-400' : 'font-medium'}>
                                    {chk.text}
                                  </span>
                                </div>
                              ))}
                              {note.checklists.length > 4 && (
                                <div className="text-[10px] text-slate-400 font-bold pt-0.5">
                                  +{note.checklists.length - 4} more tasks
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                            <div className="flex items-center gap-1">
                              {(note.tags || []).map(t => (
                                <span key={t} className="text-cyan-700 font-semibold">#{t}</span>
                              ))}
                            </div>
                            <span className="font-bold text-emerald-700 group-hover:underline">
                              Open in Editor →
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODE C: CARDS GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Farm Notes Gallery</h2>
              <p className="text-xs text-slate-500">Visual sticky cards with color priority and quick previews</p>
            </div>
            <button
              onClick={() => handleCreateNote()}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer border-0 shadow-xs"
            >
              <Plus size={15} /> New Note
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredNotes.map(note => {
              const relBadge = getRelativeDateBadge(note.date);
              const colorTheme = COLOR_THEMES.find(c => c.id === note.color) || COLOR_THEMES[0];
              const checklistTotal = note.checklists?.length || 0;
              const checklistDone = note.checklists?.filter(c => c.completed).length || 0;

              return (
                <div
                  key={note.id}
                  onClick={() => {
                    setSelectedNoteId(note.id);
                    setViewMode('split');
                  }}
                  className={`p-5 rounded-3xl border ${colorTheme.border} ${colorTheme.bg} flex flex-col justify-between hover:shadow-lg transition-all cursor-pointer relative group`}
                >
                  <div>
                    {/* Top Ribbon */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${relBadge.tone}`}>
                          {relBadge.text}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">
                          {note.date}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {note.archived && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                            Archived
                          </span>
                        )}
                        {note.pinned && (
                          <span className="text-amber-500 bg-white p-1 rounded-lg shadow-2xs">
                            <Pin size={13} className="fill-amber-500" />
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="text-base font-black text-slate-900 mb-2 leading-snug group-hover:text-emerald-800">
                      {note.title || 'Untitled Note'}
                    </h3>

                    <p className="text-xs text-slate-600 whitespace-pre-line line-clamp-4 leading-relaxed mb-4">
                      {note.content ? note.content.replace(/^#+\s+/gm, '') : 'Empty note...'}
                    </p>

                    {/* Checklist summary bar & interactive tasks */}
                    {checklistTotal > 0 && (
                      <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200/60 mb-3 space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                          <span>Checklist Tasks</span>
                          <span>{checklistDone}/{checklistTotal}</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-600 h-full rounded-full transition-all"
                            style={{ width: `${(checklistDone / checklistTotal) * 100}%` }}
                          />
                        </div>
                        <div className="space-y-1 pt-1">
                          {note.checklists?.slice(0, 3).map(chk => (
                            <div
                              key={chk.id}
                              onClick={(e) => toggleChecklistDirect(note.id, chk.id, e)}
                              className="text-xs text-slate-700 flex items-center gap-2 cursor-pointer hover:text-emerald-700 select-none"
                            >
                              {chk.completed ? (
                                <CheckSquare size={12} className="text-emerald-600 shrink-0" />
                              ) : (
                                <Square size={12} className="text-slate-400 shrink-0" />
                              )}
                              <span className={`truncate ${chk.completed ? 'line-through text-slate-400' : 'font-medium'}`}>
                                {chk.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="pt-3 border-t border-slate-200/70 flex items-center justify-between text-xs">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white text-slate-700 shadow-2xs border border-slate-200">
                      {note.category}
                    </span>

                    <span className="text-[11px] font-bold text-emerald-700 group-hover:underline">
                      Edit Note →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default FarmNotesHub;
