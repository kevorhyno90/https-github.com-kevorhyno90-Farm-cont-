import React, { useState } from 'react';
import { BookOpen, ShieldCheck, Thermometer, Sparkles, AlertCircle, Scale, Utensils, Egg } from 'lucide-react';

export function PoultryAdvisoryHub() {
  const [activeGuideTab, setActiveGuideTab] = useState<'chickens' | 'ducks' | 'vaccines' | 'nutrition'>('chickens');

  // Interactive Lay Rate & Feed Targeter
  const [targetFlockSize, setTargetFlockSize] = useState<number>(300);
  const [feedGramsPerBird, setFeedGramsPerBird] = useState<number>(130);
  const [feedCostPerKg, setFeedCostPerKg] = useState<number>(65);
  const [eggPricePerCrate, setEggPricePerCrate] = useState<number>(380);
  const [expectedLayRate, setExpectedLayRate] = useState<number>(82);

  // Calculations
  const dailyFeedKg = (targetFlockSize * feedGramsPerBird) / 1000;
  const dailyFeedCost = dailyFeedKg * feedCostPerKg;
  const dailyEggs = Math.round((targetFlockSize * expectedLayRate) / 100);
  const dailyCrates = dailyEggs / 30;
  const dailyRevenue = dailyCrates * eggPricePerCrate;
  const dailyGrossProfit = dailyRevenue - dailyFeedCost;
  const monthlyGrossProfit = dailyGrossProfit * 30;

  return (
    <div className="space-y-6">
      {/* Interactive Economic & Performance Targeter */}
      <div className="bg-gradient-to-br from-amber-500/10 via-white to-emerald-500/10 p-6 rounded-3xl border border-amber-200/60 shadow-sm space-y-5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-amber-600 text-white font-bold px-2 py-0.5 rounded uppercase">
            Economic Calculator
          </span>
          <h4 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
            <span>📊</span> Layer Flock Profitability & Feed Conversion Simulator
          </h4>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-xs">
            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Flock Size</label>
            <input
              type="number"
              min="10"
              value={targetFlockSize}
              onChange={(e) => setTargetFlockSize(parseInt(e.target.value) || 0)}
              className="w-full text-xs font-mono font-bold border border-gray-200 rounded-lg p-2"
            />
          </div>

          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-xs">
            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Feed/Bird (g)</label>
            <input
              type="number"
              min="50"
              max="200"
              value={feedGramsPerBird}
              onChange={(e) => setFeedGramsPerBird(parseInt(e.target.value) || 0)}
              className="w-full text-xs font-mono font-bold border border-gray-200 rounded-lg p-2"
            />
          </div>

          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-xs">
            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Feed KSh/KG</label>
            <input
              type="number"
              min="30"
              value={feedCostPerKg}
              onChange={(e) => setFeedCostPerKg(parseFloat(e.target.value) || 0)}
              className="w-full text-xs font-mono font-bold border border-gray-200 rounded-lg p-2"
            />
          </div>

          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-xs">
            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Expected Lay %</label>
            <input
              type="number"
              min="20"
              max="98"
              value={expectedLayRate}
              onChange={(e) => setExpectedLayRate(parseFloat(e.target.value) || 0)}
              className="w-full text-xs font-mono font-bold border border-gray-200 rounded-lg p-2"
            />
          </div>

          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-xs col-span-2 sm:col-span-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Crate Price (KSh)</label>
            <input
              type="number"
              min="200"
              value={eggPricePerCrate}
              onChange={(e) => setEggPricePerCrate(parseFloat(e.target.value) || 0)}
              className="w-full text-xs font-mono font-bold border border-gray-200 rounded-lg p-2"
            />
          </div>
        </div>

        {/* Simulator Results */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white/80 p-3 rounded-xl border border-gray-200">
            <span className="text-[10px] text-gray-500 font-semibold uppercase block">Daily Feed Consumption</span>
            <div className="text-base font-bold font-mono text-gray-900 mt-0.5">
              {dailyFeedKg.toFixed(1)} KG <span className="text-xs font-normal text-gray-500">(KSh {Math.round(dailyFeedCost).toLocaleString()})</span>
            </div>
          </div>

          <div className="bg-white/80 p-3 rounded-xl border border-gray-200">
            <span className="text-[10px] text-gray-500 font-semibold uppercase block">Daily Egg Output</span>
            <div className="text-base font-bold font-mono text-amber-800 mt-0.5">
              {dailyEggs} eggs <span className="text-xs font-normal text-gray-500">({dailyCrates.toFixed(1)} crates)</span>
            </div>
          </div>

          <div className="bg-white/80 p-3 rounded-xl border border-gray-200">
            <span className="text-[10px] text-gray-500 font-semibold uppercase block">Daily Gross Margin</span>
            <div className={`text-base font-bold font-mono mt-0.5 ${dailyGrossProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              KSh {Math.round(dailyGrossProfit).toLocaleString()} / day
            </div>
          </div>

          <div className="bg-white/80 p-3 rounded-xl border border-gray-200">
            <span className="text-[10px] text-gray-500 font-semibold uppercase block">Estimated Monthly Net</span>
            <div className={`text-base font-bold font-mono mt-0.5 ${monthlyGrossProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              KSh {Math.round(monthlyGrossProfit).toLocaleString()} / mo
            </div>
          </div>
        </div>
      </div>

      {/* Guide Tabs */}
      <div className="flex bg-white border border-gray-200 p-1 rounded-2xl w-fit gap-1 text-xs font-bold">
        <button
          onClick={() => setActiveGuideTab('chickens')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeGuideTab === 'chickens' ? 'bg-amber-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🐔 Chicken Lifecycle Guide
        </button>
        <button
          onClick={() => setActiveGuideTab('ducks')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeGuideTab === 'ducks' ? 'bg-amber-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🦆 Waterfowl & Duck Guide
        </button>
        <button
          onClick={() => setActiveGuideTab('vaccines')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeGuideTab === 'vaccines' ? 'bg-amber-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          💉 Comprehensive Vaccine Calendar
        </button>
        <button
          onClick={() => setActiveGuideTab('nutrition')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeGuideTab === 'nutrition' ? 'bg-amber-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🌽 Feeds & Nutrition
        </button>
      </div>

      {/* Tab Contents */}
      {activeGuideTab === 'chickens' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
            <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded font-bold">
              Cohort 1: Chicks (Day 1 - Week 8)
            </span>
            <h5 className="text-sm font-bold text-gray-900">Thermal Brooding & Starter Crumble</h5>
            <p className="text-xs text-gray-600 leading-relaxed">
              Maintain brooder temperature strictly at <strong>30-32°C</strong> during Week 1, reducing by 2°C each week.
              Feed <strong>Chick Starter Crumble (20% CP)</strong> up to 35-40g daily per bird. Ensure clean fresh water with glucose/electrolytes on arrival.
            </p>
            <div className="text-[11px] font-semibold text-purple-900 bg-purple-50/50 p-2 rounded-lg">
              Key Vaccines: Day 7 (Newcastle LaSota), Day 14 (Gumboro IBD), Day 24 (Gumboro booster).
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
            <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-bold">
              Cohort 2: Growers & Pullets (Wk 9 - 18)
            </span>
            <h5 className="text-sm font-bold text-gray-900">Skeletal Frame & Muscle Development</h5>
            <p className="text-xs text-gray-600 leading-relaxed">
              Feed <strong>Growers Mash (16% CP)</strong> at 70-90g daily. Avoid over-feeding energy to prevent fatty livers.
              Weight targets: 1.4-1.6 kg by Week 18. Provide perches to encourage natural exercise and strong legs.
            </p>
            <div className="text-[11px] font-semibold text-blue-900 bg-blue-50/50 p-2 rounded-lg">
              Key Prophylaxis: Week 8 Fowl Pox wing-web stab; deworm with Piperazine at Week 10 and Week 16.
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-bold">
              Cohort 3: Layers (Week 19+)
            </span>
            <h5 className="text-sm font-bold text-gray-900">Peak Egg Laying & Shell Calcification</h5>
            <p className="text-xs text-gray-600 leading-relaxed">
              Feed <strong>Layers Complete Mash (18% CP, 3.8-4.2% Calcium)</strong> at 120-135g daily.
              Provide 16 hours of daily lighting (natural + artificial). Keep clean nesting boxes at 1 box per 5 hens.
            </p>
            <div className="text-[11px] font-semibold text-emerald-900 bg-emerald-50/50 p-2 rounded-lg">
              Maintenance: Newcastle booster in drinking water every 8-10 weeks; deworm every 3 months.
            </div>
          </div>
        </div>
      )}

      {activeGuideTab === 'ducks' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
            <span className="text-[10px] bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded font-bold">
              Waterfowl Ducklings (Day 1 - Wk 4)
            </span>
            <h5 className="text-sm font-bold text-gray-900">Dry Bedding & Niacin Requirement</h5>
            <p className="text-xs text-gray-600 leading-relaxed">
              Ducks need <strong>higher Niacin (Vitamin B3)</strong> than chickens to prevent bowed legs and lameness.
              Keep brooder dry; <strong>do not allow ducklings to swim without maternal preening oils</strong> until 4-5 weeks of age to avoid chilling and drowning.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
            <span className="text-[10px] bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded font-bold">
              Duck Growers & Foragers
            </span>
            <h5 className="text-sm font-bold text-gray-900">Pond Yard & High Azolla Foraging</h5>
            <p className="text-xs text-gray-600 leading-relaxed">
              Ducks are supreme biological slug, snail, and weed controllers. Supplement commercial mash with 
              <strong> fresh high-protein Azolla caroliniana</strong> to reduce feed expenses by up to 25-30%.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
            <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-bold">
              Adult Laying Ducks (Khaki/Pekin)
            </span>
            <h5 className="text-sm font-bold text-gray-900">Dawn Egg Laying & Nesting Habits</h5>
            <p className="text-xs text-gray-600 leading-relaxed">
              95% of duck eggs are laid between <strong>4:00 AM and 7:30 AM</strong>. Keep ducks confined in their night shelter with clean dry straw until 8:00 AM to collect pristine, unsoiled eggs before letting them out to the pond.
            </p>
          </div>
        </div>
      )}

      {activeGuideTab === 'vaccines' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
            <span>💉</span> Standard Avian Vaccination Protocol & Biosafety Routine
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-[10px] font-bold text-gray-500 uppercase border-b border-gray-100">
                <tr>
                  <th className="py-2.5 px-3">Age / Timeline</th>
                  <th className="py-2.5 px-3">Vaccine / Disease</th>
                  <th className="py-2.5 px-3">Strain / Brand</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-2.5 px-3 font-mono font-bold text-gray-800">Day 1 (Hatchery)</td>
                  <td className="py-2.5 px-3 font-semibold text-gray-900">Marek's Disease</td>
                  <td className="py-2.5 px-3">HVT / CVI988</td>
                  <td className="py-2.5 px-3">Subcutaneous in neck</td>
                  <td className="py-2.5 px-3 text-gray-500">Administered at hatchery</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-mono font-bold text-gray-800">Day 7</td>
                  <td className="py-2.5 px-3 font-semibold text-gray-900">Newcastle Disease (ND)</td>
                  <td className="py-2.5 px-3">LaSota / Hitchner B1</td>
                  <td className="py-2.5 px-3">Eye / Nostril drop</td>
                  <td className="py-2.5 px-3 text-gray-500">Do not expose vaccine to chlorinated water</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-mono font-bold text-gray-800">Day 14</td>
                  <td className="py-2.5 px-3 font-semibold text-gray-900">Gumboro (IBD 1st Dose)</td>
                  <td className="py-2.5 px-3">Intermediate Strain</td>
                  <td className="py-2.5 px-3">Drinking water (skim milk)</td>
                  <td className="py-2.5 px-3 text-gray-500">Withdraw water 1.5h before dosing</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-mono font-bold text-gray-800">Day 21</td>
                  <td className="py-2.5 px-3 font-semibold text-gray-900">Newcastle Booster</td>
                  <td className="py-2.5 px-3">LaSota</td>
                  <td className="py-2.5 px-3">Drinking water</td>
                  <td className="py-2.5 px-3 text-gray-500">Protects respiratory mucosal lining</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-mono font-bold text-gray-800">Day 28</td>
                  <td className="py-2.5 px-3 font-semibold text-gray-900">Gumboro (IBD Booster)</td>
                  <td className="py-2.5 px-3">Intermediate Plus</td>
                  <td className="py-2.5 px-3">Drinking water</td>
                  <td className="py-2.5 px-3 text-gray-500">Solidifies bursa of Fabricius immunity</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-mono font-bold text-gray-800">Week 6 - 8</td>
                  <td className="py-2.5 px-3 font-semibold text-gray-900">Fowl Pox</td>
                  <td className="py-2.5 px-3">Live Pox Vaccine</td>
                  <td className="py-2.5 px-3">Wing-web double needle stab</td>
                  <td className="py-2.5 px-3 text-gray-500">Check for 'take' nodule on day 7-10</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-mono font-bold text-gray-800">Week 10 & 16</td>
                  <td className="py-2.5 px-3 font-semibold text-gray-900">Internal Deworming</td>
                  <td className="py-2.5 px-3">Piperazine / Levamisole</td>
                  <td className="py-2.5 px-3">Drinking water</td>
                  <td className="py-2.5 px-3 text-gray-500">Purges ascarids before lay cycle</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-mono font-bold text-gray-800">Every 8-10 wks (Lay)</td>
                  <td className="py-2.5 px-3 font-semibold text-gray-900">Newcastle LaSota Maintenance</td>
                  <td className="py-2.5 px-3">LaSota</td>
                  <td className="py-2.5 px-3">Drinking water</td>
                  <td className="py-2.5 px-3 text-gray-500">Prevents catastrophic egg drop syndrome</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeGuideTab === 'nutrition' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
            <span>🌽</span> Standard Feed Nutrient Specifications & Daily Rations
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-100">
              <span className="font-bold text-gray-900 block">Chick Starter Crumble</span>
              <div className="space-y-1 text-gray-600 text-[11px]">
                <div>• Crude Protein: <strong>20 - 22%</strong></div>
                <div>• Metab. Energy: <strong>12.0 MJ/kg</strong></div>
                <div>• Calcium: <strong>1.0%</strong></div>
                <div>• Daily Intake: <strong>25 - 45g / bird</strong></div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-100">
              <span className="font-bold text-gray-900 block">Growers Mash / Pellets</span>
              <div className="space-y-1 text-gray-600 text-[11px]">
                <div>• Crude Protein: <strong>16 - 17%</strong></div>
                <div>• Metab. Energy: <strong>11.5 MJ/kg</strong></div>
                <div>• Calcium: <strong>1.1%</strong></div>
                <div>• Daily Intake: <strong>65 - 90g / bird</strong></div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-100">
              <span className="font-bold text-gray-900 block">Layers High-Calcium Mash</span>
              <div className="space-y-1 text-gray-600 text-[11px]">
                <div>• Crude Protein: <strong>17.5 - 18.5%</strong></div>
                <div>• Metab. Energy: <strong>11.0 MJ/kg</strong></div>
                <div>• Calcium: <strong>3.8 - 4.2%</strong></div>
                <div>• Daily Intake: <strong>125 - 140g / bird</strong></div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-100">
              <span className="font-bold text-gray-900 block">Duck All-Stage Ration</span>
              <div className="space-y-1 text-gray-600 text-[11px]">
                <div>• Crude Protein: <strong>18% (Starter) / 16%</strong></div>
                <div>• Niacin: <strong>60 - 70 mg/kg min</strong></div>
                <div>• Green Forage: <strong>Azolla ad libitum</strong></div>
                <div>• Daily Intake: <strong>150 - 180g / duck</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
