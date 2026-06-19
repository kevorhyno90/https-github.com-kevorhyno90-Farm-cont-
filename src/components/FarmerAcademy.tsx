import React, { useState } from 'react';
import { 
  BookOpen, 
  Sprout, 
  Leaf, 
  Heart, 
  Sparkles, 
  Calculator, 
  Clock, 
  Activity, 
  AlertTriangle, 
  ShieldAlert, 
  Layers, 
  Award, 
  HelpCircle,
  TrendingUp,
  Flame,
  Search,
  CheckCircle,
  Plus
} from 'lucide-react';

export default function FarmerAcademy() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'crops' | 'livestock' | 'poultry_dogs' | 'cow_opt' | 'calculators'>('crops');

  // Interactive Calculator State
  const [biogasVolume, setBiogasVolume] = useState<number>(2); // target m3 of gas
  const [heatTime, setHeatTime] = useState<string>('06:00');
  const [heatPeriod, setHeatPeriod] = useState<'morning' | 'afternoon'>('morning');
  const [currentMilk, setCurrentMilk] = useState<number>(15);
  const [currentProtein, setCurrentProtein] = useState<number>(14);

  // Search filter
  const filterMatches = (text: string) => {
    return text.toLowerCase().includes(searchTerm.toLowerCase());
  };

  return (
    <div className="space-y-6 font-sans antialiased text-slate-800 animate-fadeIn" id="academy-root">
      
      {/* Academy Banner */}
      <div className="bg-gradient-to-r from-emerald-950 to-slate-900 border border-emerald-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-800/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-500/15 rounded-full blur-2xl -ml-8 -mb-8"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="bg-emerald-800 text-emerald-300 font-black tracking-widest text-[10px] uppercase px-3 py-1 rounded-full border border-emerald-700">
              ⚡ PRO-AGRI EDUCATION ENGINE
            </span>
            <h2 className="text-3xl font-black tracking-tight text-white">
              Farmer's Knowledge Academy
            </h2>
            <p className="text-emerald-100 text-xs font-medium md:text-sm leading-relaxed">
              Accelerate your agribusiness capabilities. Access masterclasses in soil-to-plate agronomy, clinical livestock veterinary emergencies, state-of-the-art biogas digestion, and genetic cow yields.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-3">
            <div className="bg-emerald-900 p-4 rounded-2xl border border-emerald-800 text-center shadow-lg">
              <span className="text-3xl font-black text-yellow-500 block">4</span>
              <span className="text-[9px] text-emerald-200 font-bold uppercase tracking-widest block mt-0.5">Faculty Labs</span>
            </div>
            <div className="bg-emerald-900 p-4 rounded-2xl border border-emerald-800 text-center shadow-lg">
              <span className="text-3xl font-black text-emerald-300 block">3</span>
              <span className="text-[9px] text-emerald-200 font-bold uppercase tracking-widest block mt-0.5">Live Calculators</span>
            </div>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="mt-6 relative max-w-md" id="academy-search">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search diseases, surgeries, biogas, dog care, fertilizer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/10 hover:bg-white/15 focus:bg-white text-slate-100 focus:text-slate-900 placeholder:text-slate-300 rounded-2xl border border-white/15 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 font-semibold text-xs transition-all outline-hidden shadow-inner"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 font-black"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Domain Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('crops')}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-black text-xs uppercase tracking-wide transition-all cursor-pointer m-0 ${
            activeTab === 'crops'
              ? 'bg-emerald-950 text-white border-emerald-950 shadow-sm'
              : 'bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 border-slate-200'
          }`}
        >
          <Leaf size={14} />
          Agronomy & Crop Disease
        </button>

        <button
          onClick={() => setActiveTab('livestock')}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-black text-xs uppercase tracking-wide transition-all cursor-pointer m-0 ${
            activeTab === 'livestock'
              ? 'bg-emerald-950 text-white border-emerald-950 shadow-sm'
              : 'bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 border-slate-200'
          }`}
        >
          <Heart size={14} />
          Livestock & Biogas
        </button>

        <button
          onClick={() => setActiveTab('poultry_dogs')}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-black text-xs uppercase tracking-wide transition-all cursor-pointer m-0 ${
            activeTab === 'poultry_dogs'
              ? 'bg-emerald-950 text-white border-emerald-950 shadow-sm'
              : 'bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 border-slate-200'
          }`}
        >
          <Activity size={14} />
          Poultry & Canine Labs
        </button>

        <button
          onClick={() => setActiveTab('cow_opt')}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-black text-xs uppercase tracking-wide transition-all cursor-pointer m-0 ${
            activeTab === 'cow_opt'
              ? 'bg-emerald-950 text-white border-emerald-950 shadow-sm'
              : 'bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 border-slate-200'
          }`}
        >
          <TrendingUp size={14} />
          Cow Yield Boosters
        </button>

        <button
          onClick={() => setActiveTab('calculators')}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-black text-xs uppercase tracking-wide transition-all cursor-pointer& border-yellow-500/30 m-0 ${
            activeTab === 'calculators'
              ? 'bg-yellow-500 text-slate-950 border-yellow-600 shadow-sm font-black'
              : 'bg-amber-500/10 text-amber-900 hover:bg-amber-500/20 border-amber-300/30'
          }`}
        >
          <Calculator size={14} />
          Interactive Calculators
        </button>
      </div>

      {/* TAB CONTENT: CROPS */}
      {activeTab === 'crops' && (
        <div className="space-y-6" id="crops-faculty">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Card 1: Avocado Disease & Agronomy */}
            {filterMatches("avocado root rot anthracnose planting black spots") && (
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-emerald-700/20 transition-all space-y-4">
                <div className="flex justify-between items-start">
                  <span className="bg-emerald-100 text-emerald-850 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg">
                    Avocado Fuerte & Hass
                  </span>
                  <Leaf className="text-emerald-700" size={18} />
                </div>
                <h3 className="text-base font-black text-slate-900">Avocado Disease & Planting Masterclass</h3>
                
                <div className="space-y-3 text-xs leading-relaxed text-slate-600">
                  <p>
                    <strong>Recommended Planting:</strong> Dig holes of <code className="bg-slate-150 px-1 py-0.5 rounded text-emerald-800">2ft x 2ft x 2ft</code>. Mix top soil with 1 wheelbarrow of well-composted dry cattle manure and 250g of Single Super Phosphate (SSP) fertilizer per hole.
                  </p>
                  <p>
                    <strong>Disease 1: Root Rot (Phytophthora cinnamomi)</strong>
                    <br />
                    <em>Symptoms:</em> Pale, wilted leaves, dieback of twigs, sparse foliage, blackened dead roots.
                    <br />
                    <em>Control:</em> Plant in sandy, well-draining soil. Drench with Copper Oxychloride or Ridomil Gold. Avoid overwatering.
                  </p>
                  <p>
                    <strong>Disease 2: Anthracnose (Colletotrichum)</strong>
                    <br />
                    <em>Symptoms:</em> Round, sunken dark brown-to-black spots on fruits, pinkish fungal slime during humid weather.
                    <br />
                    <em>Control:</em> Maintain GlobalGAP certified orchard pruning to permit sunshine penetration. Spray Copper Hydroxide fungicide 21 days before harvest pre-interval check.
                  </p>
                </div>
              </div>
            )}

            {/* Card 2: Tea Planting Guide & Disease */}
            {filterMatches("tea plucking pruning red rust root disease clones") && (
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-emerald-700/20 transition-all space-y-4">
                <div className="flex justify-between items-start">
                  <span className="bg-teal-50 text-teal-800 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border border-teal-200">
                    Tea Highlands
                  </span>
                  <Sprout className="text-teal-700" size={18} />
                </div>
                <h3 className="text-base font-black text-slate-900">Tea Cultivation, Pruning & Diseases</h3>
                
                <div className="space-y-3 text-xs leading-relaxed text-slate-600">
                  <p>
                    <strong>Pruning standard:</strong> Triennial pruning (every 3 years) is mandatory to reset frame width. Standard height is a flat plucking table 24-28 inches off the ground to assist staff agility.
                  </p>
                  <p>
                    <strong>Disease 1: Armillaria Root Rot (Oak Root Fungus)</strong>
                    <br />
                    <em>Symptoms:</em> Sudden leaf yellowing followed by rapid wilting. Splitting of bark at lower collar showing white fan-like thread structures.
                    <br />
                    <em>Control:</em> Physical complete ring-barking of old shade trees before felling. Completely excavate affected roots and soil. Drench soil around borders with systemic copper.
                  </p>
                  <p>
                    <strong>Disease 2: Grey Blight (Pestalotiopsis)</strong>
                    <br />
                    <em>Symptoms:</em> Oval leaves spots with dark rings. Causes heavy loss of plucking twigs.
                    <br />
                    <em>Control:</em> Prune dead wood, spray micronized foliar copper after hard plucking or pruning cycles. Give Nitrogen formula booster.
                  </p>
                </div>
              </div>
            )}

            {/* Card 3: Maize, Sorghum & Vegetables */}
            {filterMatches("maize stalk borer autumn armyworm composting") && (
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-emerald-700/20 transition-all space-y-4">
                <div className="flex justify-between items-start">
                  <span className="bg-yellow-50 text-amber-900 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border border-yellow-200">
                    Cereal & Veg Staples
                  </span>
                  <Award className="text-yellow-600" size={18} />
                </div>
                <h3 className="text-base font-black text-slate-900">Staples: Maize, Sorghum & Drip Vegetables</h3>
                
                <div className="space-y-3 text-xs leading-relaxed text-slate-600">
                  <p>
                    <strong>Planting rule:</strong> Space maize at <code className="bg-slate-150 px-1 py-0.5 rounded text-slate-800">75cm x 25cm</code> (1 seed per hill). For Sorghum, direct sow in rows 60cm apart then thin to 15cm to prevent spindly stalks under wind stress.
                  </p>
                  <p>
                    <strong>Threat: Fall Armyworm (FAW) & Maize Stalk Borer</strong>
                    <br />
                    <em>Symptom:</em> Ragged "shotholes" in leaves, heavy sawdust-like powder (frass) inside the leaf whorl, destroyed immature cobs.
                    <br />
                    <em>Organic control:</em> Drop fine dry sand or biological Neem oil mixture directly into the leaf whorl during vegetative knee-high stage.
                  </p>
                  <p>
                    <strong>Drip Irrigation Veggies:</strong> Keep tomato drip lines flush. Mulch with dry Napier stalks, apply composted dry dairy dung to retain soil organic profile.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* TAB CONTENT: LIVESTOCK & BIOGAS */}
      {activeTab === 'livestock' && (
        <div className="space-y-6" id="livestock-faculty">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Card 1: Livestock Disease Control & Feeding */}
            {filterMatches("foot rot mastitis milk fever bloating treatment") && (
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-emerald-700/20 transition-all space-y-4">
                <div className="flex justify-between items-start">
                  <span className="bg-rose-50 text-rose-800 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border border-rose-200">
                    Clinical Veterinary Care
                  </span>
                  <ShieldAlert className="text-rose-700" size={18} />
                </div>
                <h3 className="text-base font-black text-slate-900">Clinical Disease Prevention & Feeding</h3>
                
                <div className="space-y-3 text-xs leading-relaxed text-slate-600">
                  <p>
                    <strong>Disease 1: Foot Rot (Fusobacterium)</strong>
                    <br />
                    <em>Prevention:</em> Muddy yards breed anaerobic bacteria. Keep concrete dry. Maintain a weekly footbath containing <span className="font-bold">5% Copper Sulfate</span>.
                  </p>
                  <p>
                    <strong>Disease 2: Milk Fever (Postpartum Hypocalcaemia)</strong>
                    <br />
                    <em>Symptoms:</em> Cow goes flat-out in sternal recumbency, "S-curved" neck, cold ears, unable to rise.
                    <br />
                    <em>Emergency Action:</em> Do not attempt oral liquids (risk of aspiration). Slowly infuse <span className="font-bold">450ml Calcium Borogluconate 20%</span> via the jugular vein. Monitor heart rates!
                  </p>
                  <p>
                    <strong>Feeding:</strong> Minimum dry matter intake should equal <span className="font-bold">3.5% of cow bodyweight</span>. Half of forage fiber must contain structural fibers 2-3 inches long to stimulate ruminal motility.
                  </p>
                </div>
              </div>
            )}

            {/* Card 2: Biogas Plant Management */}
            {filterMatches("biogas slurry anaerobic digester pH cattle dung methane") && (
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-emerald-700/20 transition-all space-y-4">
                <div className="flex justify-between items-start">
                  <span className="bg-yellow-50 text-amber-900 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border border-yellow-200">
                    Renewable Bioenergy
                  </span>
                  <Flame className="text-amber-500" size={18} />
                </div>
                <h3 className="text-base font-black text-slate-900">Renewable Biogas digester Operations</h3>
                
                <div className="space-y-3 text-xs leading-relaxed text-slate-600">
                  <p>
                    <strong>The Golden Ratio:</strong> Mix fresh cow dung and clean water at a perfect <span className="font-bold">1:1 ratio</span>. Filter out tough dry wood chips or toxic detergent-laden dairy washwater which kills methane-producing methanogens.
                  </p>
                  <p>
                    <strong>Acidity & pH limits:</strong> Anaerobic digestion requires pH levels maintained securely between <span className="font-bold">6.8 and 7.5</span>.
                    <br />
                    If the gas smells highly sour or production drops, the digester is likely "acidifying". Limit feeding volume for 3 days and add a small lime drench in water to buffer the internal digestate.
                  </p>
                  <p>
                    <strong>Bio-Slurry Management:</strong> The discharge slurry is fully digested and rich in converted ammoniacal nitrogen. Feed this premium natural manure directly to nappier grass fields or avocado nurseries.
                  </p>
                </div>
              </div>
            )}

            {/* Card 3: Safe On-Farm Surgeries & Veterinary Limits */}
            {filterMatches("bloat trocarization surgery castration lda rda dehorning") && (
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-emerald-700/20 transition-all space-y-4">
                <div className="flex justify-between items-start">
                  <span className="bg-blue-50 text-blue-800 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border border-blue-200">
                    Surgical Protocols
                  </span>
                  <HelpCircle className="text-blue-700" size={18} />
                </div>
                <h3 className="text-base font-black text-slate-900">Emergency Surgeries & Veterinary Limits</h3>
                
                <div className="space-y-3 text-xs leading-relaxed text-slate-600">
                  <p>
                    <span className="bg-red-50 text-red-800 text-[10px] font-black px-2 py-0.5 rounded uppercase block w-max mb-1">Warning</span>
                    Always seek licensed veterinary oversight. Ensure local anesthetic blocks (e.g., Lidocaine 2% cornually or epidurally) before doing mechanical procedures.
                  </p>
                  <p>
                    <strong>1. Acute Frothy Bloat Trocarization:</strong> Left flank swelling drum-tight. If the cow is gasping for breath, plunge a sterile <span className="font-bold">trocar & cannula</span> into the center of the left flank. Release pressure immediately to save the animal's life.
                  </p>
                  <p>
                    <strong>2. Bloodless Castration:</strong> Perform castration on bull calves before 3 months of age using Burdizzo clamping. Clamp each spermatic cord separately for 10 seconds. Check that the cord yields no leakage.
                  </p>
                  <p>
                    <strong>3. Left Displaced Abomasum (LDA):</strong> A "pinging" sound on the left flank between the 9th and 13th ribs. This requires veterinary surgical toggle-pin fixation or abomasopexy.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* TAB CONTENT: POULTRY & CANINE LABS */}
      {activeTab === 'poultry_dogs' && (
        <div className="space-y-6" id="poultry-canine-faculty">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Poultry Masterclass */}
            {filterMatches("poultry coccidiosis layers brooding vaccinating gumboro") && (
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md space-y-4">
                <div className="flex items-center gap-2">
                  <span className="bg-yellow-105 text-amber-950 font-black px-2.5 py-1 text-[10px] rounded-lg tracking-wider border border-yellow-200">
                    Poultry Flock Lab
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900">Poultry Vaccination & Brooder management</h3>
                
                <div className="space-y-3 text-xs leading-relaxed text-slate-600">
                  <p>
                    <strong>Brooder Setup:</strong> Maintain temperature under the hover at <span className="font-bold">32°C - 35°C</span> for Day 1 line chicks. Reduce by 2°C weekly until room temperature is achieved. Spread clean wood shavings (avoid sawdust containing fine inhalation particulates as it causes respiratory diseases).
                  </p>
                  
                  <div className="border-l-2 border-amber-400 pl-3 py-1 space-y-1 bg-amber-500/5 rounded-r">
                    <span className="font-black text-slate-900 block text-[11px] uppercase tracking-wide">Standard Vaccination Timeline:</span>
                    <div>• Day 1: Mareks (Hatchery) & Infectious Bronchitis (IB)</div>
                    <div>• Week 1: Newcastle Disease (G7 variant) in eye/drinking water</div>
                    <div>• Week 2: Gumboro (Infectious Bursal Disease) booster</div>
                    <div>• Week 3: Newcastle booster</div>
                    <div>• Week 6 & 16: Fowl Pox vaccine via wing-web puncture</div>
                  </div>

                  <p>
                    <strong>Coccidiosis Management:</strong> Look for bloody droppings or ruffled feathers. Coccidia thrives in damp conditions. Keep the waterers on raised wire racks. Treat outbreaks immediately with <span className="font-bold">Amprolium 20% Soluble powder</span> or Sulfaclozine in drinking water for 3-5 days. Ensure full 7-day withdrawal period limit.
                  </p>
                </div>
              </div>
            )}

            {/* Canine (Dogs) Masterclass */}
            {filterMatches("dogs canine parval rabies ticks guard obedience") && (
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md space-y-4">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-50 text-blue-800 font-black px-2.5 py-1 text-[10px] rounded-lg tracking-wider border border-blue-200">
                    Canine K-9 Security
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900">Canine Health, Vaccination & Duty Training</h3>
                
                <div className="space-y-3 text-xs leading-relaxed text-slate-600">
                  <p>
                    <strong>1. Clinical Health Rules:</strong>
                    <br />
                    • <span className="font-bold">Parvovirus Defense:</span> Highly fatal diarrheal pathogen. Administer canine DHLPP combination vaccine at <span className="font-bold">8, 12, and 16 weeks</span> of age. Give annual boosters.
                    <br />
                    • <span className="font-bold">Rabies control:</span> Obligatory vaccines at 12 weeks of age, repeat annually to comply with regional health standards.
                    <br />
                    • <span className="font-bold">Tick-Borne Diseases:</span> Ticks transmit Ehrlichia and Babesia causing rapid blood-cell destruction. Use Bravecto chews or Flumethrin collar prevention.
                  </p>

                  <p>
                    <strong>2. Guard Dog Duty Training Regimen:</strong>
                    <br />
                    • <span className="font-bold">Basic Obedience First:</span> Teach recall, "sit/heal/stay" and "release" with zero hesitation. High-drive security dogs must release on instant human command.
                    <br />
                    • <span className="font-bold">Socialization parameters:</span> Guard dogs should not be randomly aggressive. Train the animal to distinguish routine homestead staff (Roster approved names) from strange intrusive elements. Keep them caged or safely kenneled during high-activity farm hours.
                  </p>

                  <p>
                    <strong>3. Muscle & Active Performance Nutrition:</strong> Combine meat scraps with high-quality protein kibble. Ensure lactating guard bitches receive extra calcium powder to prevent maternal eclampsia.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* TAB CONTENT: COW OPTIMIZATION */}
      {activeTab === 'cow_opt' && (
        <div className="space-y-6" id="cow-yield-faculty">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Guide A: Fattening Beef Steers */}
            {filterMatches("fatten beef steer silage concentrates weight") && (
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md space-y-4">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-55 bg-emerald-100 text-emerald-950 font-black text-[9px] px-2.5 py-1 rounded">
                    Fattening Masterclass
                  </span>
                </div>
                <h3 className="text-[15px] font-black text-slate-900 flex items-center gap-1.5">
                  <TrendingUp className="text-emerald-700" size={16} />
                  Fattening & Beef Muscle Density
                </h3>
                
                <div className="space-y-3 text-xs leading-relaxed text-slate-600">
                  <p>
                    <strong>Target Average Daily Gain (ADG):</strong> Standard target is <span className="text-slate-950 font-extrabold">1.2kg - 1.5kg gain per day</span>.
                  </p>
                  <p>
                    <strong>The Fattening Phase Strategy:</strong>
                    <br />
                    • <strong>Days 1-14 (Transition):</strong> De-worm the steer. Slowly introduce cracked maize/sorghum concentrates and hay mixed with high energy molasses.
                    <br />
                    • <strong>Days 15-90 (Intense finishing):</strong> Restrict the herd's movement to tiny paddocks (zero-grazing stalls) to conserve calorie burning. Feed high-energy TMR consisting of 60% processed grains (maize, barley, wheat bran) and 40% premium quality wilted Napier or maize silage.
                  </p>
                  <p>
                    <strong>Pro tip:</strong> Add 1% monocalcium phosphate or security limestone to supply calcium, guaranteeing firm heavy bones and preventing bloat from grain acid overload.
                  </p>
                </div>
              </div>
            )}

            {/* Guide B: Reproduction Enhancement */}
            {filterMatches("reproduction ai standing heat semen heifers hormonal") && (
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md space-y-4">
                <div className="flex items-center gap-2">
                  <span className="bg-purple-100 text-purple-900 font-black text-[9px] px-2.5 py-1 rounded">
                    Reproduction Optimization
                  </span>
                </div>
                <h3 className="text-[15px] font-black text-slate-900 flex items-center gap-1.5">
                  <Activity className="text-purple-700" size={16} />
                  Enhancing Reproduction & AI Success
                </h3>
                
                <div className="space-y-3 text-xs leading-relaxed text-slate-600">
                  <p>
                    <strong>Goal:</strong> Achieve a secure <span className="text-slate-950 font-extrabold">365-day calving interval</span> (one calf per cow every year).
                  </p>
                  <p>
                    <strong>The AM-PM Timing Rule:</strong>
                    <br />
                    • If heat is detected in the <span className="font-bold text-slate-900">Morning</span> (cow standing to be mounted, clear vaginal mucus), perform AI insemination in the <span className="font-bold text-slate-900">Evening</span>.
                    <br />
                    • If heat is observed in the <span className="font-bold text-slate-900">Evening</span>, perform insemination the <span className="font-bold text-slate-900">Following Morning</span>.
                  </p>
                  <p>
                    <strong>Mineral boosters:</strong> Retained placenta (delayed separation of mothers birth tissue) is caused by trace mineral lack. Drench heifers on dry-period with <span className="font-bold text-emerald-800">Vitamin E & Selenium supplements</span> 4 weeks before their expected due date.
                  </p>
                </div>
              </div>
            )}

            {/* Guide C: Milking Optimization */}
            {filterMatches("milk yield hygienic butterfat mastitis stripping") && (
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md space-y-4">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-900 font-black text-[9px] px-2.5 py-1 rounded">
                    Lactation Yield Masterclass
                  </span>
                </div>
                <h3 className="text-[15px] font-black text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="text-amber-500" size={16} />
                  Optimizing Butterfat & Milk Yields
                </h3>
                
                <div className="space-y-3 text-xs leading-relaxed text-slate-600">
                  <p>
                    <strong>Increase Butterfat content:</strong> Butterfat is driven by ruminal acetate, which comes strictly from <span className="font-bold text-slate-800">NDF structural fiber digestions</span>. Avoid excessive grain starches which drop ruminal pH (acidosis) and decrease butterfat to record lows. Balance fodder using wilted Lucerne (Alfalfa) hay.
                  </p>
                  <p>
                    <strong>The 3-Step Hygiene standard:</strong>
                    <p>1. <strong>Foremilk Stripping:</strong> Strip 2 streams from each teat to screen for mastitis clumps and flush pathogens inside the canal.</p>
                    <p>2. <strong>Pre-Milking Dip:</strong> Dip teats in fast-acting chlorhexidine. Allow 30 seconds, then wipe dry using completely separate disposable towels.</p>
                    <p>3. <strong>Post-Milking Dip:</strong> Seal the open physical teats sphincter using thick iodine teat sealant. This block protects the canal for 2 hours while it contracts.</p>
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* TAB CONTENT: CALCULATORS */}
      {activeTab === 'calculators' && (
        <div className="space-y-6 animate-fadeIn" id="calculators-faculty">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Interactive Tool 1: Standing Heat & AI Window Calculator */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Clock className="text-purple-700 font-bold" size={18} />
                Heat AM-PM Rule AI Window Planner
              </h3>
              <p className="text-xs text-slate-500 font-bold leading-normal">
                Optimize semen insemination conception rates. Input historical thermal standing mount hours to map precision reproductive windows.
              </p>

              <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                      Time Heat Observed
                    </label>
                    <input 
                      type="time" 
                      value={heatTime}
                      onChange={(e) => setHeatTime(e.target.value)}
                      className="w-full bg-white border border-slate-200 text-xs px-3 py-2.5 rounded-xl font-bold font-mono outline-hidden focus:border-purple-500" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                      Observation Period
                    </label>
                    <select
                      value={heatPeriod}
                      onChange={(e) => setHeatPeriod(e.target.value as any)}
                      className="w-full bg-white border border-slate-200 text-xs px-3 py-2.5 rounded-xl font-bold outline-hidden focus:border-purple-500"
                    >
                      <option value="morning">Morning (AM Heat)</option>
                      <option value="afternoon">Evening/Afternoon (PM Heat)</option>
                    </select>
                  </div>
                </div>

                <div className="bg-purple-950 text-purple-100 p-4 rounded-xl space-y-2">
                  <span className="text-[10px] font-extrabold uppercase bg-purple-800 text-white px-2 py-0.5 rounded tracking-wide">
                    Optimal AI Window Recommendation
                  </span>
                  
                  <div className="text-xs leading-relaxed space-y-1">
                    {heatPeriod === 'morning' ? (
                      <div>
                        • Semen Insertion Window: <strong className="text-yellow-400 text-sm">Today between 3:00 PM and 9:00 PM</strong>.
                        <br />
                        • Why? Heat was observed in AM. Ovulation occurs approx 10 hours later.
                      </div>
                    ) : (
                      <div>
                        • Semen Insertion Window: <strong className="text-yellow-400 text-sm">Tomorrow between 6:00 AM and 11:30 AM</strong>.
                        <br />
                        • Why? Heat was observed in PM. Inseminate the next morning following the Golden rule.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Tool 2: Biogas Digester Calculator */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Flame className="text-amber-500 font-bold" size={18} />
                Biogas Daily Dung & Water Feed Calculator
              </h3>
              <p className="text-xs text-slate-500 font-bold leading-normal">
                Determine correct loading parameters of cow dung and water mix to maintain secure anaerobic gas pressure without souring.
              </p>

              <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    Target Gas Production (m³ volume per day)
                  </label>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    step="0.5"
                    value={biogasVolume}
                    onChange={(e) => setBiogasVolume(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-505" 
                  />
                  <div className="flex justify-between text-[11px] font-black text-slate-800 mt-1 font-mono">
                    <span>1 m³ (Small Stove)</span>
                    <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded">{biogasVolume} m³</span>
                    <span>10 m³ (Power Gen)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-xl border border-slate-150 text-center">
                    <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wide">Cattle Dung Needed</span>
                    <span className="text-lg font-black text-slate-900 font-mono mt-1 block">{(biogasVolume * 25).toFixed(0)} KG</span>
                    <span className="text-[9px] text-slate-405 block font-semibold mt-0.5">Approx. {(biogasVolume * 2.5).toFixed(1)} cows</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-150 text-center">
                    <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wide">Water Mix Needed</span>
                    <span className="text-lg font-black text-slate-900 font-mono mt-1 block">{(biogasVolume * 25).toFixed(0)} Liters</span>
                    <span className="text-[9px] text-slate-405 block font-semibold mt-0.5">A perfect 1:1 Slurry dilution</span>
                  </div>
                </div>

                <div className="bg-emerald-950 text-slate-100 p-3.5 rounded-xl text-xs space-y-1">
                  <span className="text-yellow-400 font-bold block">✨ Agronomy recycling output:</span>
                  <span>Daily premium bio-slurry generated: <strong className="font-mono text-white text-sm">{(biogasVolume * 45).toFixed(0)} Liters</strong>. Excellent for avocado foliage and Napier watering.</span>
                </div>
              </div>
            </div>

            {/* Interactive Tool 3: TMR Feed Protein Optimizer (CP Target) */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4 md:col-span-2">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Calculator className="text-emerald-700 font-bold" size={18} />
                Lactation Dairy CP Protein Target Estimator
              </h3>
              <p className="text-xs text-slate-500 font-bold leading-normal">
                Determine if your feeding mixture satisfies the Crude Protein (CP) threshold required for high-yield dairy cows versus low yield or dry cows.
              </p>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                      Current Cow Daily Milk Yield (Liters/day)
                    </label>
                    <input 
                      type="number"
                      value={currentMilk}
                      onChange={(e) => setCurrentMilk(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-white border border-slate-200 text-xs px-3 py-2 rounded-xl font-bold font-mono outline-hidden focus:border-emerald-600" 
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                      Estimated Crude Protein (CP) of Feed Mix (%)
                    </label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="range" 
                        min="10" 
                        max="22" 
                        value={currentProtein}
                        onChange={(e) => setCurrentProtein(parseInt(e.target.value))}
                        className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-700" 
                      />
                      <span className="text-xs font-black font-mono bg-white px-2 py-1 rounded border text-emerald-800">{currentProtein}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center">
                  {/* Results box */}
                  {(() => {
                    const requiredProtein = currentMilk < 10 ? 12 : currentMilk < 20 ? 14 : currentMilk < 30 ? 16 : 18;
                    const isFading = currentProtein >= requiredProtein;
                    return (
                      <div className={`p-5 rounded-2xl transition-all ${
                        isFading 
                          ? 'bg-emerald-50 text-emerald-950 border-2 border-emerald-950/25' 
                          : 'bg-rose-50 text-rose-950 border-2 border-rose-950/25'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className={isFading ? 'text-emerald-700' : 'text-rose-600'} size={20} />
                          <span className="text-sm font-black uppercase tracking-tight">
                            {isFading ? 'Protein Target Satisfied!' : 'Protein Deficiency Risk'}
                          </span>
                        </div>
                        <div className="text-xs space-y-2 font-medium">
                          <p>
                            • A cow yielding <strong className="font-mono text-sm">{currentMilk}L</strong> requires a minimum dietary ration crude protein level of <strong className="font-sans text-sm">{requiredProtein}% CP</strong>.
                          </p>
                          <p>
                            • Your estimated diet is <strong className="font-mono text-sm">{currentProtein}% CP</strong>.
                          </p>
                          {!isFading && (
                            <p className="bg-rose-950/10 p-2.5 rounded font-black text-[11px] text-rose-900">
                              💡 Action Plan: To raise CP levels, incorporate high-protein bypass concentrates like cottonseed cake, sunflower meal, or brewers dried grains to avoid micro-organism mineral starve!
                            </p>
                          )}
                          {isFading && (
                            <p className="bg-emerald-950/10 p-2.5 rounded font-black text-[11px] text-emerald-900">
                              🚀 Excellent! Your feed protein density supports active rumen fermentation. Ensure dry matter intake rates are maintained.
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
