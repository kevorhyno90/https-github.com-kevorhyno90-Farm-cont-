import React, { useState } from 'react';
import { BsfCommercialSale } from '../../types';
import { DollarSign, Plus, Trash2, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { toIsoDate } from '../../utils/dateHelper';
import { useFarmState } from '../../context/FarmContext';

const DEFAULT_SALES: BsfCommercialSale[] = [
  {
    id: 'sale-01',
    date: '2024-09-22',
    buyerName: 'Rift Valley Poultry Breeders Ltd',
    buyerPhone: '+254 711 234 567',
    buyerLocation: 'Nakuru Town',
    productType: 'Dried Grubs',
    quantityKg: 80,
    unitPriceKes: 380,
    totalAmountKes: 30400,
    paymentMethod: 'Bank Transfer',
    receiptNumber: 'JR-BSF-REC-01',
    notes: 'Whole sun-dried high-protein grubs for layer chick starter feed.'
  },
  {
    id: 'sale-02',
    date: '2024-09-24',
    buyerName: 'Green Horizon Agro-Enterprises',
    buyerPhone: '+254 722 987 654',
    buyerLocation: 'Naivasha',
    productType: 'Organic Frass Biofertilizer',
    quantityKg: 500,
    unitPriceKes: 35,
    totalAmountKes: 17500,
    paymentMethod: 'M-Pesa',
    receiptNumber: 'JR-BSF-REC-02',
    notes: '10 bags of 50kg organic NPK frass biofertilizer for greenhouse capsicum.'
  }
];

export function BsfSalesHub() {
  const { setFinancials } = useFarmState();

  const [sales, setSales] = useState<BsfCommercialSale[]>(() => {
    try {
      const stored = localStorage.getItem('jr_farm_bsf_commercial_sales');
      return stored ? JSON.parse(stored) : DEFAULT_SALES;
    } catch {
      return DEFAULT_SALES;
    }
  });

  const [showModal, setShowModal] = useState(false);
  const [syncToFinancials, setSyncToFinancials] = useState(true);

  const [form, setForm] = useState<Partial<BsfCommercialSale>>({
    date: toIsoDate(new Date()),
    buyerName: '',
    buyerPhone: '',
    buyerLocation: '',
    productType: 'Live Larvae',
    quantityKg: 50,
    unitPriceKes: 120,
    totalAmountKes: 6000,
    paymentMethod: 'M-Pesa',
    receiptNumber: `JR-BSF-${Date.now().toString().slice(-4)}`,
    notes: ''
  });

  const saveSales = (data: BsfCommercialSale[]) => {
    setSales(data);
    localStorage.setItem('jr_farm_bsf_commercial_sales', JSON.stringify(data));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.buyerName || !form.totalAmountKes) return;

    const newSale: BsfCommercialSale = {
      ...form,
      id: `bsf-sale-${Date.now().toString().slice(-4)}`
    } as BsfCommercialSale;

    saveSales([newSale, ...sales]);

    // Auto-record to JR Farm Financials
    if (syncToFinancials && setFinancials) {
      const finEntry = {
        id: `fin-bsf-${Date.now()}`,
        date: newSale.date,
        type: 'Income' as const,
        category: 'BSF & Insect Protein Sales',
        amount: Number(newSale.totalAmountKes) || 0,
        description: `Commercial BSF sale: ${newSale.quantityKg}kg ${newSale.productType} to ${newSale.buyerName}`,
        referenceNumber: newSale.receiptNumber
      };
      setFinancials((prev: any[]) => [finEntry, ...prev]);
    }

    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this commercial sale entry?')) {
      saveSales(sales.filter(s => s.id !== id));
    }
  };

  const totalSalesRevenue = sales.reduce((acc, curr) => acc + (curr.totalAmountKes || 0), 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-gray-900">Commercial Insect Protein & Frass Biofertilizer Market</h3>
            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full">
              KES {totalSalesRevenue.toLocaleString()} Earned
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Sale of live prepupae, whole dried grubs, 5-DOL neonate starter colonies, and organic frass bags.
          </p>
        </div>

        <button
          onClick={() => {
            setForm({
              date: toIsoDate(new Date()),
              buyerName: '',
              buyerPhone: '',
              buyerLocation: '',
              productType: 'Live Larvae',
              quantityKg: 50,
              unitPriceKes: 120,
              totalAmountKes: 6000,
              paymentMethod: 'M-Pesa',
              receiptNumber: `JR-BSF-${Date.now().toString().slice(-4)}`,
              notes: ''
            });
            setShowModal(true);
          }}
          type="button"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Plus size={14} />
          <span>Record BSF Sale</span>
        </button>
      </div>

      {/* Table of Commercial Sales */}
      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white font-bold">
              <tr>
                <th className="p-3.5 pl-5">Date</th>
                <th className="p-3.5">Product Type</th>
                <th className="p-3.5">Buyer / Destination</th>
                <th className="p-3.5">Volume (KG)</th>
                <th className="p-3.5">Unit Price (KES)</th>
                <th className="p-3.5">Total Revenue</th>
                <th className="p-3.5">Payment</th>
                <th className="p-3.5 text-right pr-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sales.map((sale, idx) => (
                <tr key={sale.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                  <td className="p-3.5 pl-5 font-mono text-gray-600">{sale.date}</td>
                  <td className="p-3.5 font-bold text-gray-900">{sale.productType}</td>
                  <td className="p-3.5">
                    <span className="font-semibold text-gray-800 block">{sale.buyerName}</span>
                    <span className="text-[11px] text-gray-500">{sale.buyerPhone} • {sale.buyerLocation || 'Local'}</span>
                  </td>
                  <td className="p-3.5 font-bold text-slate-900">{sale.quantityKg} kg</td>
                  <td className="p-3.5 text-gray-600">KES {sale.unitPriceKes}/kg</td>
                  <td className="p-3.5 font-black text-emerald-700">KES {sale.totalAmountKes.toLocaleString()}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-800">
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td className="p-3.5 text-right pr-5">
                    <button onClick={() => handleDelete(sale.id)} className="p-1 text-gray-400 hover:text-red-500 rounded">
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-gray-900">Record Commercial BSF Product Sale</h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Product Type *</label>
                  <select
                    value={form.productType}
                    onChange={e => {
                      const type = e.target.value as any;
                      const defaultPrice = 
                        type === 'Live Larvae' ? 120 :
                        type === 'Dried Grubs' ? 380 :
                        type === 'Pupae / Seed Pupae' ? 650 :
                        type === 'BSF Eggs' ? 1200 :
                        type === 'BSF Seed 5-DOL Neonates' ? 500 : 35;
                      setForm(prev => ({
                        ...prev,
                        productType: type,
                        unitPriceKes: defaultPrice,
                        totalAmountKes: (prev.quantityKg || 50) * defaultPrice
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-medium"
                  >
                    <option value="Live Larvae">Fresh Live Larvae (KES 120/kg)</option>
                    <option value="Dried Grubs">Whole Dried Grubs (KES 380/kg)</option>
                    <option value="Pupae / Seed Pupae">Dark Pupae / Seed Stock (KES 650/kg)</option>
                    <option value="BSF Eggs">BSF Egg Clusters (KES 1,200/50g or per unit)</option>
                    <option value="BSF Seed 5-DOL Neonates">5-DOL Seed Starter Neonates (KES 500/kg)</option>
                    <option value="Organic Frass Biofertilizer">Organic Frass Biofertilizer (KES 35/kg)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Buyer Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rift Valley Poultry"
                    value={form.buyerName}
                    onChange={e => setForm(prev => ({ ...prev, buyerName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Buyer Phone</label>
                  <input
                    type="text"
                    placeholder="+254 7..."
                    value={form.buyerPhone}
                    onChange={e => setForm(prev => ({ ...prev, buyerPhone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Quantity (KG) *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={form.quantityKg}
                    onChange={e => {
                      const qty = Number(e.target.value);
                      setForm(prev => ({
                        ...prev,
                        quantityKg: qty,
                        totalAmountKes: qty * (prev.unitPriceKes || 120)
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Total Revenue (KES) *</label>
                  <input
                    type="number"
                    required
                    value={form.totalAmountKes}
                    onChange={e => setForm(prev => ({ ...prev, totalAmountKes: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-black text-emerald-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={form.paymentMethod}
                    onChange={e => setForm(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  >
                    <option value="M-Pesa">M-Pesa</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Receipt Number</label>
                  <input
                    type="text"
                    value={form.receiptNumber}
                    onChange={e => setForm(prev => ({ ...prev, receiptNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-mono text-emerald-800"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl">
                <input
                  type="checkbox"
                  id="syncBsfFin"
                  checked={syncToFinancials}
                  onChange={e => setSyncToFinancials(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <label htmlFor="syncBsfFin" className="font-bold text-emerald-950 cursor-pointer">
                  Auto-sync revenue to JR Farm Financials under "BSF & Insect Protein Sales"
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
                >
                  Confirm Sale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
