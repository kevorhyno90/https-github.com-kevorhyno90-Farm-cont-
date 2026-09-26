import React, { useState, useMemo } from 'react';
import { BsfRecord, StaffMember } from '../types';
import {
  Recycle, Plus, Trash2, Edit2, Search, Calendar, FileText, Download,
  Share2, Printer, CheckCircle2, TrendingUp, DollarSign, Sprout,
  Scale, Feather, Milk, FileSpreadsheet, LayoutGrid, Table, ArrowRight,
  Sparkles, Compass, AlertCircle
} from 'lucide-react';
import { toIsoDate, offsetIsoDate } from '../utils/dateHelper';
import { exportToCsv } from '../utils/csvHelper';
import { generateBsfAuditPdf } from './bsf/BsfPdfGenerator';
import { BsfSubstrateHub } from './bsf/BsfSubstrateHub';
import { BsfHarvestHub } from './bsf/BsfHarvestHub';
import { BsfFeedIntegrationHub } from './bsf/BsfFeedIntegrationHub';
import { BsfBreedingHub } from './bsf/BsfBreedingHub';
import { BsfSalesHub } from './bsf/BsfSalesHub';

interface BsfManagerProps {
  bsfRecords: BsfRecord[];
  onAddBsfRecord: (rec: BsfRecord) => void;
  onDeleteBsfRecord: (id: string) => void;
  onEditBsfRecord?: (id: string, updated: BsfRecord) => void;
  staffList?: StaffMember[];
  onTriggerSectionReport?: (sectionKey: string) => void;
}

type BsfSubTab = 'batches' | 'substrates' | 'harvests' | 'feed_integration' | 'breeding' | 'sales';
type ViewMode = 'cards' | 'table';

export function BsfManager({
  bsfRecords = [],
  onAddBsfRecord,
  onDeleteBsfRecord,
  onEditBsfRecord,
  staffList = [],
  onTriggerSectionReport
}: BsfManagerProps) {
  const [subTab, setSubTab] = useState<BsfSubTab>('batches');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State for adding/editing batch
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState<BsfRecord | null>(null);

  const [form, setForm] = useState<Partial<BsfRecord>>({
    batchId: `BSF-BATCH-${Math.floor(100 + Math.random() * 900)}`,
    substrateType: 'Waste Avocado skins & discarded pulp seeds',
    inoculationDate: toIsoDate(new Date()),
    date: toIsoDate(new Date()),
    larvaeHarvestedKg: 0,
    frassHarvestedKg: 0,
    eggWeightGrams: 15,
    substrateWeightKg: 150,
    status: 'Inoculation',
    destination: 'Poultry Feed',
    operator: staffList[0]?.name || 'James Odhiambo',
    notes: 'Inoculated on fresh organic substrate. Thermophilic composting active.'
  });

  // KPI Calculations
  const stats = useMemo(() => {
    const totalBatches = bsfRecords.length;
    const activeGrowing = bsfRecords.filter(b => b.status === 'Inoculation' || b.status === 'Larvae Feeding').length;
    const totalLarvaeKg = bsfRecords.reduce((acc, b) => acc + (b.larvaeHarvestedKg || 0), 0);
    const totalFrassKg = bsfRecords.reduce((acc, b) => acc + (b.frassHarvestedKg || (b.larvaeHarvestedKg * 2.5) || 0), 0);
    const totalWasteDivertedKg = bsfRecords.reduce((acc, b) => acc + (b.substrateWeightKg || (b.larvaeHarvestedKg * 5) || 150), 0);
    const totalSavingsKes = Math.round(totalLarvaeKg * 95); // Soya meal equivalence at KES 95/kg

    return {
      totalBatches,
      activeGrowing,
      totalLarvaeKg,
      totalFrassKg,
      totalWasteDivertedKg,
      totalSavingsKes
    };
  }, [bsfRecords]);

  // Filtered batches
  const filteredBatches = useMemo(() => {
    return bsfRecords.filter(b => {
      const matchSearch =
        b.batchId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.substrateType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.notes && b.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = statusFilter === 'all' || b.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [bsfRecords, searchTerm, statusFilter]);

  // Preset click
  const applyPreset = (preset: {
    substrate: string;
    prefix: string;
    eggGrams: number;
    subKg: number;
    targetLarvae: number;
    notes: string;
  }) => {
    const code = `${preset.prefix}-${Math.floor(100 + Math.random() * 900)}`;
    setForm(prev => ({
      ...prev,
      batchId: code,
      substrateType: preset.substrate,
      eggWeightGrams: preset.eggGrams,
      substrateWeightKg: preset.subKg,
      larvaeHarvestedKg: preset.targetLarvae,
      frassHarvestedKg: preset.targetLarvae * 2.5,
      status: 'Inoculation',
      notes: preset.notes
    }));
  };

  const handleOpenAdd = () => {
    setEditingBatch(null);
    setForm({
      batchId: `BSF-BATCH-${Math.floor(100 + Math.random() * 900)}`,
      substrateType: 'Waste Avocado skins & discarded pulp seeds',
      inoculationDate: toIsoDate(new Date()),
      date: toIsoDate(new Date()),
      larvaeHarvestedKg: 0,
      frassHarvestedKg: 0,
      eggWeightGrams: 15,
      substrateWeightKg: 150,
      status: 'Inoculation',
      destination: 'Poultry Feed',
      operator: staffList[0]?.name || 'James Odhiambo',
      notes: 'Inoculated on fresh organic substrate. Thermophilic composting active.'
    });
    setShowBatchModal(true);
  };

  const handleOpenEdit = (batch: BsfRecord) => {
    setEditingBatch(batch);
    setForm(batch);
    setShowBatchModal(true);
  };

  const handleSaveBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.batchId || !form.substrateType) return;

    if (editingBatch && onEditBsfRecord) {
      onEditBsfRecord(editingBatch.id, {
        ...editingBatch,
        ...form
      } as BsfRecord);
    } else {
      const newRec: BsfRecord = {
        ...form,
        id: `bsf-${Date.now().toString().slice(-4)}`
      } as BsfRecord;
      onAddBsfRecord(newRec);
    }
    setShowBatchModal(false);
  };

  // CSV Exporter
  const exportBatchesCsv = () => {
    const headers = ['Batch Code', 'Substrate Type', 'Inoculation Date', 'Larvae Yield (KG)', 'Frass Yield (KG)', 'Status', 'Notes'];
    const rows = filteredBatches.map(b => [
      b.batchId,
      b.substrateType,
      b.inoculationDate,
      b.larvaeHarvestedKg || 0,
      b.frassHarvestedKg || 0,
      b.status,
      b.notes || ''
    ]);
    exportToCsv('JR_Farm_BSF_Batches.csv', headers, rows);
  };

  // WhatsApp Share
  const handleShareWhatsApp = () => {
    const text = `*JR FARM — BSF CIRCULAR BIO-CONVERSION BRIEFING* 🐛
Date: ${toIsoDate(new Date())}
Total Batches: ${stats.totalBatches} | Active Rearing: ${stats.activeGrowing}
Total Larvae Produced: ${stats.totalLarvaeKg} KG
Organic Frass Biofertilizer: ${stats.totalFrassKg} KG
Waste Diverted: ${stats.totalWasteDivertedKg.toLocaleString()} KG
Soya/Fishmeal Cost Offset: KES ${stats.totalSavingsKes.toLocaleString()}

_Presented & Approved by: Dr. Devin Omwenga (General Farm Manager)_`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0 shadow-xs">
              <Recycle size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-amber-800 bg-amber-100 rounded-full">
                  JR FARM BIO-FACTORY
                </span>
                <span className="text-xs text-gray-500 font-medium">Circular Bio-Economy & Insect Protein</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mt-0.5">
                Black Soldier Fly (BSF) Bioconversion Plant
              </h2>
              <p className="text-xs text-gray-600 font-medium mt-1">
                Compost avocado waste & dairy manure into 42% crude protein animal feed grids and organic NPK frass biofertilizer.
              </p>
            </div>
          </div>

          {/* Quick Action Tools */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              type="button"
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-green-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Share2 size={14} />
              <span>WhatsApp Briefing</span>
            </button>

            <button
              onClick={() => {
                generateBsfAuditPdf(
                  bsfRecords,
                  stats.totalWasteDivertedKg,
                  stats.totalLarvaeKg,
                  stats.totalFrassKg,
                  stats.totalSavingsKes
                );
              }}
              type="button"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Download size={14} />
              <span>Download BSF Audit PDF</span>
            </button>

            <button
              onClick={handleOpenAdd}
              type="button"
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Plus size={15} />
              <span>Log BSF Batch</span>
            </button>
          </div>
        </div>

        {/* 5 KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 pt-6 border-t border-gray-100">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Total Batches</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-gray-900">{stats.totalBatches}</span>
              <span className="text-[10px] font-semibold text-gray-500">runs</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Active Rearing</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-amber-700">{stats.activeGrowing}</span>
              <span className="text-[10px] font-semibold text-amber-600">growing</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Larvae Produced</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-emerald-700">{stats.totalLarvaeKg}</span>
              <span className="text-[10px] font-semibold text-emerald-600">KG grubs</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100">
            <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">Frass Fertilizer</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-purple-700">{stats.totalFrassKg}</span>
              <span className="text-[10px] font-semibold text-purple-600">KG NPK frass</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100">
            <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">Feed Cost Offset</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-base font-black text-blue-900">KES {(stats.totalSavingsKes / 1000).toFixed(0)}k</span>
              <span className="text-[10px] font-semibold text-blue-600">saved</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6 Subtab Navigation Bar */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto bg-white p-1.5 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setSubTab('batches')}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              subTab === 'batches'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span>🐛</span>
            <span>Batches & Lifecycle</span>
            <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-black/10 rounded-full font-mono">{bsfRecords.length}</span>
          </button>

          <button
            onClick={() => setSubTab('substrates')}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              subTab === 'substrates'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span>🥑</span>
            <span>Substrate & Waste Sourcing</span>
          </button>

          <button
            onClick={() => setSubTab('harvests')}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              subTab === 'harvests'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span>⚖️</span>
            <span>Larvae & Frass Yields</span>
          </button>

          <button
            onClick={() => setSubTab('feed_integration')}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              subTab === 'feed_integration'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span>🐔</span>
            <span>Feed Integration & Savings</span>
          </button>

          <button
            onClick={() => setSubTab('breeding')}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              subTab === 'breeding'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span>🪰</span>
            <span>Love Cage Aviary Breeding</span>
          </button>

          <button
            onClick={() => setSubTab('sales')}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              subTab === 'sales'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span>💰</span>
            <span>Commercial Sales</span>
          </button>
        </div>

        {/* View mode toggle for batches */}
        {subTab === 'batches' && (
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl shrink-0">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                viewMode === 'cards' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                viewMode === 'table' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Table size={14} />
            </button>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* SUBTAB 1: BATCHES & LIFECYCLE */}
      {/* ========================================================= */}
      {subTab === 'batches' && (
        <div className="space-y-4">
          {/* Search, Filter & Presets */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200">
            <div className="relative w-full sm:w-80">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search batch code, substrate..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-gray-300 rounded-xl bg-white font-medium text-gray-700"
              >
                <option value="all">All Stages</option>
                <option value="Inoculation">Inoculation (Eggs/Neonates)</option>
                <option value="Larvae Feeding">Larvae Feeding (Active Grubs)</option>
                <option value="Harvested">Harvested Meal / Grubs</option>
                <option value="Love Cage Breeding">Love Cage Breeding</option>
              </select>

              <button
                onClick={exportBatchesCsv}
                className="p-2 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
                title="Export to CSV"
              >
                <FileSpreadsheet size={15} />
              </button>
            </div>
          </div>

          {/* Quick Presets Ribbon */}
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
            <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
              <Sparkles size={14} className="text-amber-700" />
              <span>Quick Biomass Substrate Presets (Click to Auto-populate Batch Form):</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                {
                  label: '🥑 Avocado Pulp Eco-cycle',
                  prefix: 'BSF-AVO',
                  substrate: 'Waste Avocado skins & discarded pulp seeds',
                  eggGrams: 15,
                  subKg: 180,
                  targetLarvae: 36,
                  notes: 'Thermophilic bioconversion of avocado lipids. 5-DOL neonates inoculated.'
                },
                {
                  label: '🌽 Spent Brewers Malt & Bran',
                  prefix: 'BSF-MALT',
                  substrate: 'Spent brewery malt mash & maize bran floor sweepings',
                  eggGrams: 20,
                  subKg: 220,
                  targetLarvae: 48,
                  notes: 'Highly digestible pre-fermented mash, rapid larval weight gain.'
                },
                {
                  label: '🐄 Dairy Manure & Slurry Solids',
                  prefix: 'BSF-DAIRY',
                  substrate: 'Solid separated dairy cow manure & bedding straw',
                  eggGrams: 25,
                  subKg: 300,
                  targetLarvae: 52,
                  notes: 'Pathogen sanitization through larval gut passage. Superior frass biofertilizer.'
                }
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    applyPreset(preset);
                    setShowBatchModal(true);
                  }}
                  className="text-left bg-white p-3 rounded-xl border border-amber-200 hover:border-amber-400 text-xs transition-all shadow-xs cursor-pointer flex flex-col justify-between"
                >
                  <span className="font-bold text-gray-900">{preset.label}</span>
                  <span className="text-[11px] text-amber-700 font-mono mt-1 font-semibold">
                    {preset.subKg}kg waste → {preset.targetLarvae}kg larvae
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Cards View */}
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBatches.map(batch => (
                <div
                  key={batch.id}
                  className="bg-white border border-gray-200 hover:border-amber-300 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden"
                >
                  <div
                    className={`absolute top-0 left-0 right-0 h-1.5 ${
                      batch.status === 'Harvested'
                        ? 'bg-emerald-600'
                        : batch.status === 'Larvae Feeding'
                        ? 'bg-amber-500'
                        : batch.status === 'Inoculation'
                        ? 'bg-blue-500'
                        : 'bg-purple-600'
                    }`}
                  />

                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase font-mono">{batch.inoculationDate}</span>
                        <h4 className="text-base font-black text-gray-900">{batch.batchId}</h4>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                          batch.status === 'Harvested'
                            ? 'bg-emerald-100 text-emerald-800'
                            : batch.status === 'Larvae Feeding'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {batch.status}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 my-2 text-xs space-y-1.5">
                      <div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase block">Substrate Upcycled:</span>
                        <span className="font-semibold text-gray-900 block truncate">{batch.substrateType}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                        <div>
                          <span className="text-[10px] font-bold text-gray-500 uppercase block">Larvae Yield:</span>
                          <span className="font-black text-emerald-700">
                            {batch.larvaeHarvestedKg ? `${batch.larvaeHarvestedKg} KG` : 'Growing in tray...'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-gray-500 uppercase block">Frass Output:</span>
                          <span className="font-black text-purple-700">
                            {batch.frassHarvestedKg ? `${batch.frassHarvestedKg} KG` : 'Composting...'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {batch.notes && (
                      <p className="text-[11px] text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100 italic line-clamp-2">
                        "{batch.notes}"
                      </p>
                    )}
                  </div>

                  <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-gray-500 font-mono">Date: {batch.date || batch.inoculationDate}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(batch)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Batch"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete batch ${batch.batchId}?`)) {
                            onDeleteBsfRecord(batch.id);
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Batch"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Table View */
            <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-white font-bold">
                    <tr>
                      <th className="p-3.5 pl-5">Batch ID</th>
                      <th className="p-3.5">Substrate Recipe</th>
                      <th className="p-3.5">Inoculation Date</th>
                      <th className="p-3.5">Larvae Harvest (KG)</th>
                      <th className="p-3.5">Frass (KG)</th>
                      <th className="p-3.5">Cycle Stage</th>
                      <th className="p-3.5 text-right pr-5">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredBatches.map((b, idx) => (
                      <tr key={b.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                        <td className="p-3.5 pl-5 font-bold font-mono text-gray-900">{b.batchId}</td>
                        <td className="p-3.5 text-gray-800">{b.substrateType}</td>
                        <td className="p-3.5 text-gray-600 font-mono">{b.inoculationDate}</td>
                        <td className="p-3.5 font-bold text-emerald-700">{b.larvaeHarvestedKg || 0} kg</td>
                        <td className="p-3.5 font-bold text-purple-700">{b.frassHarvestedKg || 0} kg</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                              b.status === 'Harvested'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right pr-5 space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => handleOpenEdit(b)}
                            className="p-1 text-gray-500 hover:text-blue-600 rounded"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => onDeleteBsfRecord(b.id)}
                            className="p-1 text-gray-500 hover:text-red-600 rounded"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBTAB 2: SUBSTRATES */}
      {/* ========================================================= */}
      {subTab === 'substrates' && <BsfSubstrateHub staffList={staffList} />}

      {/* ========================================================= */}
      {/* SUBTAB 3: HARVESTS */}
      {/* ========================================================= */}
      {subTab === 'harvests' && <BsfHarvestHub staffList={staffList} />}

      {/* ========================================================= */}
      {/* SUBTAB 4: FEED INTEGRATION */}
      {/* ========================================================= */}
      {subTab === 'feed_integration' && <BsfFeedIntegrationHub />}

      {/* ========================================================= */}
      {/* SUBTAB 5: BREEDING */}
      {/* ========================================================= */}
      {subTab === 'breeding' && <BsfBreedingHub />}

      {/* ========================================================= */}
      {/* SUBTAB 6: SALES */}
      {/* ========================================================= */}
      {subTab === 'sales' && <BsfSalesHub />}

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT BSF BATCH */}
      {/* ========================================================= */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-black text-gray-900">
              {editingBatch ? 'Edit BSF Batch' : 'Log New Insect Grub Batch'}
            </h3>

            <form onSubmit={handleSaveBatch} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Batch Code ID *</label>
                  <input
                    type="text"
                    required
                    value={form.batchId}
                    onChange={e => setForm(prev => ({ ...prev, batchId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Inoculation Date</label>
                  <input
                    type="date"
                    value={form.inoculationDate}
                    onChange={e => setForm(prev => ({ ...prev, inoculationDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">Substrate Formulation Waste *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Avocado skins, spent malt, dairy manure"
                    value={form.substrateType}
                    onChange={e => setForm(prev => ({ ...prev, substrateType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Substrate Mass (KG)</label>
                  <input
                    type="number"
                    value={form.substrateWeightKg}
                    onChange={e => setForm(prev => ({ ...prev, substrateWeightKg: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Egg Mass Inoculated (Grams)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={form.eggWeightGrams}
                    onChange={e => setForm(prev => ({ ...prev, eggWeightGrams: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Larvae Harvested (KG)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={form.larvaeHarvestedKg}
                    onChange={e => setForm(prev => ({ ...prev, larvaeHarvestedKg: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Frass Fertilizer Yield (KG)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={form.frassHarvestedKg}
                    onChange={e => setForm(prev => ({ ...prev, frassHarvestedKg: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-bold text-purple-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Lifecycle Stage</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-medium"
                  >
                    <option value="Inoculation">Inoculation (Egg Hatching)</option>
                    <option value="Larvae Feeding">Larvae Feeding (Fattening)</option>
                    <option value="Harvested">Harvested Dry Meal / Grubs</option>
                    <option value="Love Cage Breeding">Love Cage Breeding</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Destination</label>
                  <select
                    value={form.destination}
                    onChange={e => setForm(prev => ({ ...prev, destination: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  >
                    <option value="Poultry Feed">Poultry Feed (Kuku Layers/Broilers)</option>
                    <option value="Dairy Ration">Dairy Ration (Calf Starter TMR)</option>
                    <option value="Aquaculture">Aquaculture (Fish Ponds)</option>
                    <option value="Commercial Sale">Commercial Sale</option>
                    <option value="Love Cage Breeding Stock">Love Cage Breeding Stock</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Observations / Temperature / Moisture</label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-xs"
                >
                  Save BSF Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
