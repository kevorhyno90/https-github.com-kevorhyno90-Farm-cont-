import React, { useState } from 'react';
import { DollarSign, TrendingUp, Sparkles, Feather, Milk, Shield, Calculator, CheckCircle2 } from 'lucide-react';

export function BsfFeedIntegrationHub() {
  // Calculator state
  const [dailyLarvaeFedKg, setDailyLarvaeFedKg] = useState<number>(25);
  const [commercialSoyaPricePerKg, setCommercialSoyaPricePerKg] = useState<number>(95);
  const [commercialFishmealPricePerKg, setCommercialFishmealPricePerKg] = useState<number>(165);

  // Calculations
  const monthlyLarvaeKg = dailyLarvaeFedKg * 30;
  // 1 kg dry larvae substitutes ~1.1 kg soya or ~0.9 kg fishmeal in crude protein
  const monthlySoyaSavingsKes = Math.round(monthlyLarvaeKg * commercialSoyaPricePerKg);
  const monthlyFishmealSavingsKes = Math.round(monthlyLarvaeKg * 0.9 * commercialFishmealPricePerKg);
  const annualSavingsKes = monthlySoyaSavingsKes * 12;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-100 rounded-full">
                FEED FORMULATION OFFSET
              </span>
              <span className="text-xs text-gray-500 font-medium">Protein Substitution Analytics</span>
            </div>
            <h3 className="text-lg font-black text-gray-900 mt-1">
              Livestock Feed Integration & Commercial Soya/Fishmeal Savings
            </h3>
            <p className="text-xs text-gray-600 mt-0.5">
              Black Soldier Fly grubs contain 42–45% crude protein, 35% natural lipids, and antimicrobial Lauric Acid (C12:0) to substitute costly imported feeds.
            </p>
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-right">
            <span className="text-[10px] font-bold text-emerald-800 uppercase block">Annual Cost Offset</span>
            <span className="text-2xl font-black text-emerald-700">KES {annualSavingsKes.toLocaleString()}</span>
            <span className="text-[10px] text-emerald-600 block mt-0.5">Saved from commercial feed imports</span>
          </div>
        </div>
      </div>

      {/* 3 Livestock Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Poultry */}
        <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-lg">
              🐔
            </div>
            <div>
              <h4 className="text-sm font-black text-gray-900">Kuku Layers & Broilers</h4>
              <span className="text-[11px] text-gray-500">Live Grub Scratch Feeding</span>
            </div>
          </div>

          <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-100 space-y-1.5 text-xs">
            <div className="flex justify-between font-bold text-gray-800">
              <span>Ration Rate:</span>
              <span className="text-amber-800">10g – 15g per hen / day</span>
            </div>
            <div className="flex justify-between text-gray-600 text-[11px]">
              <span>Calcium Content:</span>
              <span className="font-semibold">5–7% bioavailable Ca</span>
            </div>
            <div className="flex justify-between text-gray-600 text-[11px]">
              <span>Performance Impact:</span>
              <span className="font-semibold text-emerald-700">Harder shells, golden yolk color</span>
            </div>
          </div>

          <p className="text-[11px] text-gray-600 italic">
            "Live grubs stimulate natural foraging behavior, eliminate feather-pecking, and boost daily egg lay rates by 12%."
          </p>
        </div>

        {/* 2. Dairy Calves & Heifers */}
        <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-lg">
              🐄
            </div>
            <div>
              <h4 className="text-sm font-black text-gray-900">Dairy Calves & TMR Feed</h4>
              <span className="text-[11px] text-gray-500">Dried Meal in TMR Mix</span>
            </div>
          </div>

          <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-1.5 text-xs">
            <div className="flex justify-between font-bold text-gray-800">
              <span>Inclusion Rate:</span>
              <span className="text-blue-800">5% – 8% in Calf Starter</span>
            </div>
            <div className="flex justify-between text-gray-600 text-[11px]">
              <span>Lauric Acid (C12:0):</span>
              <span className="font-semibold">Destroys gut pathogens</span>
            </div>
            <div className="flex justify-between text-gray-600 text-[11px]">
              <span>Performance Impact:</span>
              <span className="font-semibold text-emerald-700">Rumen papillae rapid growth</span>
            </div>
          </div>

          <p className="text-[11px] text-gray-600 italic">
            "Calves fed BSF protein meal reach 120kg weaning weight 18 days faster with zero gut scours."
          </p>
        </div>

        {/* 3. Canines & Aquaculture */}
        <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg">
              🐕
            </div>
            <div>
              <h4 className="text-sm font-black text-gray-900">Security Canine & Guard Diet</h4>
              <span className="text-[11px] text-gray-500">Hypoallergenic Protein</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-1.5 text-xs">
            <div className="flex justify-between font-bold text-gray-800">
              <span>Inclusion Rate:</span>
              <span className="text-emerald-800">50g whole dried grubs / day</span>
            </div>
            <div className="flex justify-between text-gray-600 text-[11px]">
              <span>Digestibility:</span>
              <span className="font-semibold">89% in monogastric dogs</span>
            </div>
            <div className="flex justify-between text-gray-600 text-[11px]">
              <span>Performance Impact:</span>
              <span className="font-semibold text-emerald-700">Glossy coat, joint lubrication</span>
            </div>
          </div>

          <p className="text-[11px] text-gray-600 italic">
            "Eliminates canine food allergies and provides clean sustained energy for night perimeter patrols."
          </p>
        </div>
      </div>

      {/* Interactive Savings Calculator */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <Calculator size={18} className="text-emerald-700" />
          <h4 className="text-sm font-black text-gray-900">Interactive Protein Cost Substitution Calculator</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Daily Farm BSF Harvest (KG/Day):</label>
            <input
              type="number"
              min="1"
              max="500"
              value={dailyLarvaeFedKg}
              onChange={e => setDailyLarvaeFedKg(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl font-bold text-emerald-700"
            />
            <span className="text-[11px] text-gray-400 mt-0.5 block">{monthlyLarvaeKg} KG produced per month</span>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Commercial Soya Meal Price (KES/KG):</label>
            <input
              type="number"
              value={commercialSoyaPricePerKg}
              onChange={e => setCommercialSoyaPricePerKg(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl font-bold"
            />
            <span className="text-[11px] text-gray-400 mt-0.5 block">Market benchmark: KES 90 - 105/kg</span>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Commercial Fishmeal / Omena (KES/KG):</label>
            <input
              type="number"
              value={commercialFishmealPricePerKg}
              onChange={e => setCommercialFishmealPricePerKg(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl font-bold"
            />
            <span className="text-[11px] text-gray-400 mt-0.5 block">Market benchmark: KES 150 - 180/kg</span>
          </div>
        </div>

        {/* Calculated Results */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-100">
          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100">
            <span className="text-[10px] font-bold text-emerald-800 uppercase block">Monthly Soya Meal Offset</span>
            <span className="text-xl font-black text-emerald-800">KES {monthlySoyaSavingsKes.toLocaleString()}</span>
            <span className="text-[10px] text-emerald-600 block">Soya purchases avoided</span>
          </div>

          <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-100">
            <span className="text-[10px] font-bold text-blue-800 uppercase block">Monthly Fishmeal Offset</span>
            <span className="text-xl font-black text-blue-800">KES {monthlyFishmealSavingsKes.toLocaleString()}</span>
            <span className="text-[10px] text-blue-600 block">Omena purchases avoided</span>
          </div>

          <div className="p-3.5 bg-slate-900 text-white rounded-2xl">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">5-Year Cumulative Savings</span>
            <span className="text-xl font-black text-emerald-400">KES {(annualSavingsKes * 5).toLocaleString()}</span>
            <span className="text-[10px] text-gray-300 block">Capital retained on estate</span>
          </div>
        </div>
      </div>
    </div>
  );
}
