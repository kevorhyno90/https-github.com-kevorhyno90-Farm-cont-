import React, { useState } from 'react';
import { CanineEmergencyMedicalItem } from '../../types';
import { AlertTriangle, Plus, Trash2, Edit2, ShieldAlert, Sparkles, CheckCircle, Package, Clock, ShieldCheck } from 'lucide-react';
import { toIsoDate } from '../../utils/dateHelper';

const DEFAULT_MED_SUPPLIES: CanineEmergencyMedicalItem[] = [
  {
    id: 'med-01',
    itemName: 'SAIMR Polyvalent Snake Antivenom (African Vipers/Cobras/Mambas)',
    category: 'Antivenom & Toxins',
    quantityOnHand: 4,
    unit: 'Vials',
    minimumThreshold: 2,
    expiryDate: '2025-11-30',
    storageLocation: 'Estate Vet Refrigerator (2-8°C)',
    emergencyInstructions: 'Reconstitute with 10ml sterile water. Administer IV slow infusion under DVM supervision (Dr. Devin Omwenga). Immediate epinephrine standby.'
  },
  {
    id: 'med-02',
    itemName: 'Atropine Sulfate (1 mg/ml Injectable)',
    category: 'Antivenom & Toxins',
    quantityOnHand: 8,
    unit: 'Vials',
    minimumThreshold: 4,
    expiryDate: '2026-03-15',
    storageLocation: 'Emergency Poison Kit - Section 1',
    emergencyInstructions: 'Antidote for organophosphate and carbamate pesticide exposure. 0.04 mg/kg IV/IM.'
  },
  {
    id: 'med-03',
    itemName: 'ToxiBan Activated Charcoal with Sorbitol',
    category: 'Antivenom & Toxins',
    quantityOnHand: 6,
    unit: 'Kits',
    minimumThreshold: 3,
    expiryDate: '2026-08-20',
    storageLocation: 'Veterinary Cabinet Shelf 2',
    emergencyInstructions: 'Oral adsorbent for acute toxin ingestion within 2 hours. Dose: 10-20ml/kg body weight.'
  },
  {
    id: 'med-04',
    itemName: 'Tactical K-9 Combat Trauma Bandage & Tourniquet Pack',
    category: 'Trauma & Wound Care',
    quantityOnHand: 5,
    unit: 'Kits',
    minimumThreshold: 2,
    expiryDate: '2028-01-01',
    storageLocation: 'Night Patrol Quick-Response Rig',
    emergencyInstructions: 'Hemostatic arterial pressure bandage, SWAT-T tourniquet for limb lacerations.'
  },
  {
    id: 'med-05',
    itemName: 'Chlorhexidine 2% Antiseptic Lavage (1 Liter)',
    category: 'Trauma & Wound Care',
    quantityOnHand: 3,
    unit: 'Boxes',
    minimumThreshold: 2,
    expiryDate: '2026-06-30',
    storageLocation: 'Treatment Clinic Station',
    emergencyInstructions: 'Dilute 1:40 with sterile saline for bite wound or paw laceration flushing.'
  },
  {
    id: 'med-06',
    itemName: 'Endoguard / Praziquantel Broad-Spectrum Dewormer',
    category: 'Preventatives & Antibiotics',
    quantityOnHand: 40,
    unit: 'Tablets',
    minimumThreshold: 15,
    expiryDate: '2026-09-15',
    storageLocation: 'Pharmacy Box 4',
    emergencyInstructions: 'Quarterly administration: 1 tablet per 10kg body weight.'
  },
  {
    id: 'med-07',
    itemName: 'Virkon-S Broad-Spectrum Veterinary Disinfectant (5kg Tub)',
    category: 'Sanitation & Disinfection',
    quantityOnHand: 3,
    unit: 'Tubs',
    minimumThreshold: 2,
    expiryDate: '2027-04-10',
    storageLocation: 'Chemical Store Bay C',
    emergencyInstructions: '1:100 dilution (10g per liter water). Active against Parvo, Distemper, and pathogens.'
  }
];

export function EmergencyMedicalHub() {
  const [supplies, setSupplies] = useState<CanineEmergencyMedicalItem[]>(() => {
    try {
      const stored = localStorage.getItem('jr_farm_canine_emergency_meds');
      return stored ? JSON.parse(stored) : DEFAULT_MED_SUPPLIES;
    } catch {
      return DEFAULT_MED_SUPPLIES;
    }
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState<Partial<CanineEmergencyMedicalItem>>({
    itemName: '',
    category: 'Antivenom & Toxins',
    quantityOnHand: 5,
    unit: 'Vials',
    minimumThreshold: 2,
    expiryDate: toIsoDate(new Date()),
    storageLocation: 'Estate Vet Refrigerator (2-8°C)',
    emergencyInstructions: ''
  });

  const saveSupplies = (newSupplies: CanineEmergencyMedicalItem[]) => {
    setSupplies(newSupplies);
    localStorage.setItem('jr_farm_canine_emergency_meds', JSON.stringify(newSupplies));
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.itemName) return;

    const newItem: CanineEmergencyMedicalItem = {
      ...form,
      id: `med-${Date.now().toString().slice(-4)}`
    } as CanineEmergencyMedicalItem;

    saveSupplies([newItem, ...supplies]);
    setShowAddModal(false);
  };

  const handleAdjustStock = (id: string, delta: number) => {
    const updated = supplies.map(s => {
      if (s.id === id) {
        const nextQty = Math.max(0, s.quantityOnHand + delta);
        return { ...s, quantityOnHand: nextQty };
      }
      return s;
    });
    saveSupplies(updated);
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm('Delete this medical supply record?')) {
      saveSupplies(supplies.filter(s => s.id !== id));
    }
  };

  const lowStockCount = supplies.filter(s => s.quantityOnHand <= s.minimumThreshold).length;

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-gray-900">K-9 Emergency Medical & Antivenom Trauma Supply Hub</h3>
            {lowStockCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-700 rounded-full animate-pulse">
                {lowStockCount} Low Stock Alert!
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500">
            Emergency snake antivenom, poison antidotes, combat trauma bandages, dewormers, and Virkon-S reserves.
          </p>
        </div>

        <button
          onClick={() => {
            setForm({
              itemName: '',
              category: 'Antivenom & Toxins',
              quantityOnHand: 4,
              unit: 'Vials',
              minimumThreshold: 2,
              expiryDate: toIsoDate(new Date()),
              storageLocation: 'Estate Vet Refrigerator (2-8°C)',
              emergencyInstructions: ''
            });
            setShowAddModal(true);
          }}
          type="button"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Plus size={14} />
          <span>Add Emergency Supply</span>
        </button>
      </div>

      {/* Critical Antivenom Notice */}
      <div className="p-4 bg-gradient-to-r from-red-50 to-amber-50 border border-red-200 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center font-bold text-lg shrink-0">
            🐍
          </div>
          <div>
            <h4 className="text-xs font-black text-red-900 uppercase tracking-wide">
              Estate Snake Envenomation Protocol (Spitting Cobra / Puff Adder / Mamba)
            </h4>
            <p className="text-xs text-red-800 font-medium mt-0.5">
              Keep canine immobilized immediately. DO NOT apply tourniquets to viper bites. Retrieve Polyvalent Antivenom from Vet Fridge. Contact <strong>Dr. Devin Omwenga, DVM</strong> immediately for IV infusion.
            </p>
          </div>
        </div>
        <div className="px-3 py-1.5 bg-red-600 text-white text-[11px] font-bold rounded-xl shrink-0">
          Emergency Call: Dr. Devin Omwenga
        </div>
      </div>

      {/* Grid of Medical Supplies */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {supplies.map(item => {
          const isLow = item.quantityOnHand <= item.minimumThreshold;

          return (
            <div
              key={item.id}
              className={`bg-white border rounded-3xl p-5 shadow-xs flex flex-col justify-between transition-all ${
                isLow ? 'border-red-300 ring-1 ring-red-200' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
                    {item.category}
                  </span>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1 text-gray-400 hover:text-red-500 rounded"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <h4 className="text-sm font-black text-gray-900 leading-snug">{item.itemName}</h4>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 my-3 text-xs space-y-1.5">
                  <div className="flex justify-between items-baseline">
                    <span className="text-gray-500 font-bold text-[10px] uppercase">Stock on Hand:</span>
                    <span className={`text-base font-black ${isLow ? 'text-red-600' : 'text-emerald-700'}`}>
                      {item.quantityOnHand} {item.unit}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600 text-[11px]">
                    <span>Min Safety Buffer:</span>
                    <span className="font-semibold">{item.minimumThreshold} {item.unit}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 text-[11px]">
                    <span>Expiry Date:</span>
                    <span className="font-mono font-bold text-gray-800">{item.expiryDate}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 text-[11px]">
                    <span>Storage Post:</span>
                    <span className="font-medium text-gray-900 truncate max-w-[170px]">{item.storageLocation}</span>
                  </div>
                </div>

                {item.emergencyInstructions && (
                  <p className="text-[11px] text-gray-600 bg-amber-50/50 p-2 rounded-xl border border-amber-100 italic">
                    <strong>Admin Note:</strong> {item.emergencyInstructions}
                  </p>
                )}
              </div>

              {/* Adjust Stock Controls */}
              <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Adjust Units</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleAdjustStock(item.id, -1)}
                    disabled={item.quantityOnHand === 0}
                    className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold flex items-center justify-center text-sm disabled:opacity-30 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-bold text-xs px-1 text-gray-800">{item.quantityOnHand}</span>
                  <button
                    onClick={() => handleAdjustStock(item.id, 1)}
                    className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Supply Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-gray-900">Add K-9 Emergency Medical / Trauma Item</h3>

            <form onSubmit={handleSaveItem} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Item / Compound Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Polyvalent Antivenom, Atropine 1mg/ml"
                  value={form.itemName}
                  onChange={e => setForm(prev => ({ ...prev, itemName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  >
                    <option value="Antivenom & Toxins">Antivenom & Toxins</option>
                    <option value="Trauma & Wound Care">Trauma & Wound Care</option>
                    <option value="Preventatives & Antibiotics">Preventatives & Antibiotics</option>
                    <option value="Sanitation & Disinfection">Sanitation & Disinfection</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Packaging Unit</label>
                  <select
                    value={form.unit}
                    onChange={e => setForm(prev => ({ ...prev, unit: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  >
                    <option value="Vials">Vials</option>
                    <option value="Boxes">Boxes</option>
                    <option value="Tubs">Tubs</option>
                    <option value="Tablets">Tablets</option>
                    <option value="Kits">Kits</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Current Quantity</label>
                  <input
                    type="number"
                    value={form.quantityOnHand}
                    onChange={e => setForm(prev => ({ ...prev, quantityOnHand: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Low-Stock Buffer</label>
                  <input
                    type="number"
                    value={form.minimumThreshold}
                    onChange={e => setForm(prev => ({ ...prev, minimumThreshold: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={form.expiryDate}
                    onChange={e => setForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Storage Location</label>
                  <input
                    type="text"
                    value={form.storageLocation}
                    onChange={e => setForm(prev => ({ ...prev, storageLocation: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Emergency Administration Notes</label>
                <textarea
                  rows={2}
                  placeholder="Dosage per kg, reconstitution instructions, antidote procedures..."
                  value={form.emergencyInstructions}
                  onChange={e => setForm(prev => ({ ...prev, emergencyInstructions: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
                >
                  Save Emergency Supply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
