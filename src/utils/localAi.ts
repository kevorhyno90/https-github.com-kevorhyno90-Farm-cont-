export function generateFreeAgroAdvisorResponse(message: string, farmState: any, settings: any): string {
  const norm = (message || "").toLowerCase();
  
  const managerName = settings?.administrator || "Dr. Devin Omwenga";
  const farmName = settings?.estateName || "JR FARM COOPERATIVE ESTATE";
  const locCode = settings?.locationCode || "KT-205A";

  const isMastitis = norm.includes('mastitis') || norm.includes('teat') || norm.includes('udder') || norm.includes('clot') || norm.includes('swelling') || norm.includes('milking hygiene') || norm.includes('milking routine');
  const isFeed = norm.includes('feed') || norm.includes('tmr') || norm.includes('protein') || norm.includes('silage') || norm.includes('forage') || norm.includes('nutrition') || norm.includes('diet') || norm.includes('bloat') || norm.includes('acidosis') || norm.includes('butterfat');
  const isBreed = norm.includes('breed') || norm.includes('heat') || norm.includes('inseminat') || norm.includes('pregnancy') || norm.includes('calv') || norm.includes('cycle') || norm.includes('gestation') || norm.includes('am/pm');
  const isPoultry = norm.includes('poultry') || norm.includes('chicken') || norm.includes('layers') || norm.includes('broilers') || norm.includes('egg') || norm.includes('vaccin') || norm.includes('gumboro') || norm.includes('newcastle') || norm.includes('chick');
  const isTea = norm.includes('tea') || norm.includes('plucking') || norm.includes('ktda') || norm.includes('pruning');
  const isAvocado = norm.includes('avocado') || norm.includes('hass') || norm.includes('fuerte') || norm.includes('graft') || norm.includes('root rot') || norm.includes('phytophthora');
  const isTomato = norm.includes('tomato') || norm.includes('blight') || norm.includes('wilt') || norm.includes('solanace');
  const isMaize = norm.includes('maize') || norm.includes('corn') || norm.includes('armyworm') || norm.includes('can') || norm.includes('dap');
  const isPig = norm.includes('pig') || norm.includes('swine') || norm.includes('pork') || norm.includes('farrow') || norm.includes('asf') || norm.includes('farrowing') || norm.includes('creep');
  const isSoil = norm.includes('soil') || norm.includes('ph') || norm.includes('fertilizer') || norm.includes('lime') || norm.includes('npk') || norm.includes('compost') || norm.includes('acidity');
  const isFinance = norm.includes('financ') || norm.includes('income') || norm.includes('expense') || norm.includes('cost') || norm.includes('profit') || norm.includes('loss') || norm.includes('money') || norm.includes('ksh') || norm.includes('budget') || norm.includes('ledger') || norm.includes('bookkeeping');
  const isSync = norm.includes('sync') || norm.includes('backup') || norm.includes('restore') || norm.includes('cloud') || norm.includes('offline') || norm.includes('save') || norm.includes('load') || norm.includes('phone') || norm.includes('pwa');
  const isRoster = norm.includes('roster') || norm.includes('staff') || norm.includes('worker') || norm.includes('task') || norm.includes('schedule') || norm.includes('operations') || norm.includes('job') || norm.includes('shift');

  // 1. MASTITIS PROTOCOL
  if (isMastitis) {
    return `🩺 **Clinical Mastitis Prevention & Treatment Protocol**
*(Sovereign Free Agro-AI Expert System - Unlimited)*

Hello **${managerName}**! Here is the clinical veterinary guideline for managing mastitis in your dairy herd of **${farmState?.cowsCount || 6}** cows:

1. **How to Detect Early Signs**:
   - Before every milking session, use a **Strip Cup** to draw the first 2-3 streams of milk. Look for clots, flakes, watery secretions, or blood.
   - Feel the udder quarters for swelling, heat, hardness, or redness. A sudden reduction in milk output in a specific quarter is a strong indicator of mastitis.

2. **Milking Hygiene Standard Operating Procedure (SOP)**:
   - **Clean Environment**: Keep stables scraped and dry. Spread agricultural lime powder on the sleeping cubicles once a week to inhibit bacterial growth.
   - **Teat Preparation**: Wash udders with warm clean water using individual dry towels for each cow. Never share towels between cows!
   - **Post-Milking Teat Dip**: Immediately after milking, dip the teats in a registered **0.5% Iodine or Chlorhexidine teat-dip** solution. This forms a protective physical barrier as the teat sphincter closes (takes 30 minutes).
   - **Order of Milking**: Always milk heifers first, healthy lactating cows second, and clinically positive mastitis cows **last**.

3. **Active Treatment Guidelines**:
   - Segregate the infected cow from the herd immediately.
   - Empty the infected quarter completely (strip out milk) every 3-4 hours to remove bacteria and toxins.
   - Administer intramammary antibiotic infusions (e.g., Pen-Clox tubes) as directed by a vet. Ensure you complete the full course (usually 3 days).
   - Apply warm compresses and anti-inflammatory ointments (like Mastijet) to ease swelling.
   - **Strict Withholding Period (PHI)**: Withhold all milk from treated cows for human consumption or calf feeding for at least 72-96 hours after the final treatment.`;
  }

  // 2. COW FEED & NUTRITION PROTOCOL
  if (isFeed) {
    return `🐄 **Dairy Herd Feed Formulation & Total Mixed Ration (TMR) Calibration**
*(Sovereign Free Agro-AI Expert System - Unlimited)*

Balanced nutrition is the absolute key to elevating your milk production at **${farmName}**:

1. **Crude Protein (CP) Requirements**:
   - For high-yielding lactating cows, target a comprehensive diet with **18% to 20% Crude Protein (CP)**.
   - Dry pregnant cows require a lower protein diet (**12% to 14% CP**) to avoid overconditioning before calving.

2. **TMR Formulation Components**:
   - **Base Roughage (Fibers)**: Napier silage, Rhodes grass hay, or sweet potato vines should constitute 60% of the total dry matter. Long fibers are critical to maintaining stable rumen pH and preventing bloat.
   - **Protein Boosters**: Incorporate Lucerne (Alfalfa), Calliandra leaves, or cotton seed cake.
   - **Energy Concentrates**: Supplement with high-quality dairy meal based on yield (typically 1 kg of dairy meal for every 2 Liters of milk produced above a 5-Liter base).
   - **Minerals**: Provide high-grade mineral licks (Calcium & Phosphorus) continuously to prevent milk fever.

3. **Preventing Acidosis & Bloat**:
   - Introduce energy-rich concentrates gradually over 10-14 days.
   - Ensure the dry matter intake (DMI) contains adequate structural fiber. If acute bloat occurs, drench with 200ml of anti-bloat vegetable oil emulsion immediately and keep the animal upright and active.`;
  }

  // 3. BREEDING & HEAT DETECTION PROTOCOL
  if (isBreed) {
    return `🧬 **Dairy Breeding Cycles, Heat Detection & AM/PM Rule**
*(Sovereign Free Agro-AI Expert System - Unlimited)*

Managing calving intervals is critical. Target a calving interval of **365 to 380 days** for maximum economic productivity:

1. **Prime Signs of Standing Heat (Estrus)**:
   - **Primary Sign**: Standing to be mounted by other cows (this is the most reliable symptom).
   - **Secondary Signs**: Restless walking, frequent vocalization, swelling and reddening of the vulva, clear glassy mucus discharge from the vulva, and a slight temporary drop in milk yield.

2. **The AM/PM Rule for Artificial Insemination (AI)**:
   - If the cow exhibits standing heat symptoms in the **Morning (AM)**, perform AI in the **Evening (PM)** of the same day.
   - If she exhibits standing heat in the **Evening (PM)**, perform AI in the **Morning (AM)** of the following day.
   - This aligns the sperm introduction with the exact ovulation window (approx. 10-14 hours after the end of estrus).

3. **Gestation & Pregnancy Diagnostics (PD)**:
   - Standard gestation length for cows is **283 days**.
   - Perform pregnancy verification via veterinary manual palpation at day 60, or ultrasound scan at day 35 post-AI. Use the **Dairy Breeding** tab of this app to track AI dates, bull IDs, and expected calving calendars automatically.`;
  }

  // 4. POULTRY & GUMBORO PROTOCOL
  if (isPoultry) {
    return `🐣 **Poultry Flock Management & Vaccination Calendars**
*(Sovereign Free Agro-AI Expert System - Unlimited)*

For chicken and poultry management, a strict vaccination and biosecurity schedule is vital:

1. **Essential Vaccination Calendar**:
   - **Day 1**: Marek's Disease (administered at hatchery).
   - **Day 7**: Newcastle Disease (1st Dose) + Infectious Bronchitis (IB) via eye drop or drinking water.
   - **Day 10 - 14**: **Gumboro Disease (Infectious Bursal Disease - IBD)** (1st Dose) in clean chlorine-free water.
   - **Day 18**: Newcastle Disease (2nd Dose) / booster.
   - **Day 21 - 24**: **Gumboro Booster** (2nd Dose). This booster is essential to establish full immunity against high-fatality bursal attacks!
   - **Week 6 - 8**: Fowl Pox (wing-web stab).
   - **Week 18**: Fowl Typhoid & Newcastle booster (before laying onset).

2. **Broiler vs. Layer Feeding**:
   - **Broilers**: Feed Broiler Starter (high protein, 22% CP) from day 1 to 21, Broiler Finisher from day 22 to market size.
   - **Layers**: Feed Chick Mash (0-8 weeks), Growers Mash (8-20 weeks to control weight gain and ensure steady skeletal growth), and Layers Mash (20 weeks+ containing 3.5% Calcium for high eggshell strength).

3. **General Biosecurity**:
   - Use a disinfective footbath at the entrance of the poultry barn.
   - Keep litter (wood shavings) perfectly bone-dry. Damp litter causes immediate outbreaks of **Coccidiosis** (characterized by bloody diarrhea, ruffled feathers). If coccidiosis strikes, treat with Amprolium immediately for 5 consecutive days.`;
  }

  // 5. TEA agronomy PROTOCOL
  if (isTea) {
    return `🌱 **Tea Agronomy & KTDA Compliance Manual**
*(Sovereign Free Agro-AI Expert System - Unlimited)*

To maximize payouts from KTDA (Kenya Tea Development Agency) and maintain field health, apply these standards:

1. **Fine Plucking Standard (Two Leaves and a Bud)**:
   - Harvest only the young terminal shoot containing two leaves and a single unopened bud. 
   - Avoid plucking hard, coarse leaves, single leaves, or broken stems. This preserves high leaf grade index and guarantees optimal tea liquor quality.
   - Enforce a strict plucking cycle of **7 to 10 days** depending on the rain/warmth cycle.

2. **Pruning Cycles**:
   - Prune tea bushes every 3 to 4 years to regenerate the plucking table, restore vigor, and maintain height at an ergonomically sound level.
   - Perform pruning during the cool, dry season. Apply copper fungicide to cut surfaces to prevent stem rot.

3. **Fertilizer Calibration**:
   - Apply specialized **NPK 26:5:5** or **NPK 25:5:5** compound fertilizer annually.
   - Spread fertilizer evenly under the canopy of the tea bushes when the soil is damp. Avoid placing fertilizer directly against the main stem.
   - Record plucking logs and chemical fertilizer blocks in the **Horticulture Blocks** tab of this app.`;
  }

  // 6. AVOCADO PROTOCOL
  if (isAvocado) {
    return `🥑 **Hass Avocado Grafting & Phytophthora Root Rot Mitigation**
*(Sovereign Free Agro-AI Expert System - Unlimited)*

Expert orchard cultivation techniques for Hass and Fuerte avocado blocks:

1. **Wedge Grafting Technique**:
   - Select hardy, disease-resistant local seedling rootstocks (approx. 6-9 months old, pencil thickness).
   - Cut a clean V-shaped wedge on the rootstock.
   - Insert a healthy, dormant scion from high-yielding Hass mother trees cut into a matching wedge shape. Align the cambium layers perfectly.
   - Bind tightly with grafting tape and cover with a clear plastic bag to retain humidity until buds emerge.

2. **Phytophthora Root Rot Prevention (The Leading Threat)**:
   - **Etiology**: Caused by the soil-borne oomycete *Phytophthora cinnamomi*. Thrives in poorly drained, waterlogged soils.
   - **Cultural Controls**: Plant trees on high, raised mounds or ridges (at least 30-50 cm high) to ensure natural drainage.
   - **Soil Amendment**: Apply plenty of well-rotted organic manure and compost. This builds up beneficial microbial populations (like Trichoderma) that naturally suppress Phytophthora.
   - **Chemical Controls**: Drench roots or inject trunks with soluble phosphonate (phosphorous acid) or spray copper-based fungicides during wet seasons. Always log sprays in the **Spray Log** tab.`;
  }

  // 7. TOMATO PROTOCOL
  if (isTomato) {
    return `🍅 **Tomato Blight, Bacterial Wilt & Solanaceous Management**
*(Sovereign Free Agro-AI Expert System - Unlimited)*

Solanaceous crops are highly susceptible to weather-related fungal and bacterial pathogens. Apply this security checklist:

1. **Late Blight (*Phytophthora infestans*)**:
   - Thrives in cold, wet, misty weather. Leaves develop dark brown, water-soaked lesions that rot rapidly.
   - **Action**: Spray systemic fungicides containing Metalaxyl + Mancozeb (e.g., Ridomil Gold) at the first sign of rain, alternated with protective Copper Hydroxide weekly.

2. **Bacterial Wilt (*Ralstonia solanacearum*)**:
   - Causes rapid, permanent wilting of green leaves without yellowing, starting from the top.
   - **Action**: There is **no chemical cure**. Uproot the infected tomato plant immediately, seal it in a bag, and carry it away from the block to burn. Do not plant solanaceous crops in that block for 3-5 years (practice crop rotation with maize, cabbage, or beans).

3. **Pruning & Staking**:
   - Stake plants to keep leaves and fruit off the wet ground.
   - Prune side shoots (suckers) regularly to maintain a single main stem, allowing excellent ventilation and sunshine penetration, which dramatically reduces fungal spore germination.
   - Keep soil pH strictly between **5.8 and 6.4**. Acidic soils breed wilt; apply agricultural lime to raise the pH if necessary.`;
  }

  // 8. MAIZE PROTOCOL
  if (isMaize) {
    return `🌽 **Maize Fertilizer Rates & Fall Armyworm Protection**
*(Sovereign Free Agro-AI Expert System - Unlimited)*

Optimize your maize yields with proper fertilizing and pest control schedules:

1. **Fertilizer Calibration Rates (per Acre)**:
   - **At Planting**: Apply **50 to 75 kg of DAP (Diammonium Phosphate)**. DAP contains high Phosphorus (18-46-0) which stimulates rapid early root establishment. Place fertilizer 5cm away from and below the seed to avoid fertilizer burn.
   - **Top-Dressing**: Apply **50 to 75 kg of CAN (Calcium Ammonium Nitrate)** when the maize is knee-high (typically 4-6 weeks after planting, V6 leaf stage). CAN provides quick-release Nitrogen (26%) for stem expansion and leaf development.

2. **Fall Armyworm (*Spodoptera frugiperda*) Control**:
   - **Scouting**: Check the whorls of young maize crops twice a week for characteristic windowpane feeding damage or moist sawdust-like frass.
   - **Treatment**: Spray systemic insecticides like **Emamectin Benzoate**, Spinetoram, or Flubendiamide directly into the whorl of the crop when caterpillars are small. Apply sprays late in the evening when larvae emerge to feed.
   - Alternating chemical classes prevents pesticide resistance. Ensure all applications are documented in the **Spray Log** tab of this app.`;
  }

  // 9. PIG / SWINE PROTOCOL
  if (isPig) {
    return `🐖 **Swine Biosecurity, African Swine Fever & Creep Feeding**
*(Sovereign Free Agro-AI Expert System - Unlimited)*

Sovereign swine management requirements for clean, profitable farrow-to-finish operations:

1. **African Swine Fever (ASF) Absolute Biosecurity**:
   - **Warning**: ASF is a highly contagious viral disease with nearly 100% mortality. There is no vaccine and no cure.
   - **Biosecurity SOP**: Enforce a strict quarantine for all new pigs (at least 30 days). Maintain disinfective footbaths containing chlorine or virucidal compounds at every door.
   - **NO SWILL FEEDING**: Never feed raw kitchen waste or food scraps containing pork remains to pigs! Swill is the primary transmission vector for ASF. Boil any agricultural scrap feeds for at least 30 minutes before feeding.

2. **Piglet Care & Creep Feeding**:
   - Keep the farrowing pen completely dry, clean, and warm (30-32°C using heat lamps or heavy bedding for the first 2 weeks). Cold piglets die of hypothermia or crushing by the sow.
   - Provide **Creep Feed** (high-density, 20% CP starter crumbles) in a separate piglet-only creep area starting at **day 7**. This transitions their digestive tract safely for early weaning at 28-35 days.

3. **Sow & Grower Feeding**:
   - Feed lactating sows 2kg base feed + 0.5kg for every piglet they are nursing.
   - Transition weaners to Grower Meal (16-18% CP) for optimal lean muscle accumulation. Track all feed purchases inside the **Financials Ledger** of this app.`;
  }

  // 10. SOIL & FERTILIZER PROTOCOL
  if (isSoil) {
    return `🌱 **Soil pH Correction, Organic Compost Making & Soil Fertility**
*(Sovereign Free Agro-AI Expert System - Unlimited)*

Healthy soil is the foundation of all crop yields. Manage your plots at **${locCode}** with these standards:

1. **Understanding Soil pH**:
   - **Acidity Correction**: Most soils in tea and coffee zones are highly acidic. If soil pH drops below **5.5**, apply **Agricultural Lime or Dolomite Lime** (typically 500g to 1kg per square meter) to raise the pH. This unlocks locked phosphorus and calcium.
   - **Tea Preferences**: Tea requires highly acidic soils (**pH 4.5 to 5.6**). Do NOT apply lime to tea plots!
   - **Tomato & Maize Preferences**: Keep soil pH between **5.8 and 6.5** for maximum nutrient assimilation.

2. **Premium Organic Compost Making (The 5-Layer Method)**:
   - Build a compost heap in a shaded, well-drained area:
     - **Layer 1 (Base)**: 15 cm of coarse dry brown matter (maize stalks, dry twigs) to allow aeration.
     - **Layer 2**: 10 cm of green nitrogen-rich matter (fresh weeds, kitchen waste, tithonia leaves, calliandra).
     - **Layer 3**: 5 cm of fresh animal manure (cow dung, poultry litter) to introduce microbes.
     - **Layer 4**: A thin layer of topsoil and wood ash to balance pH and add minerals.
     - **Layer 5**: Water thoroughly until damp (like a wrung-out sponge). Repeat layers. Turn the pile every 3 weeks. Ready in 2-3 months!`;
  }

  // 11. FINANCIAL RECORDS & OPERATIONS
  if (isFinance) {
    return `💰 **Sovereign Financials & Bookkeeping Ledger Guide for ${farmName}**
*(Sovereign Free Agro-AI Expert System - Unlimited)*

Maintaining clean, accurate books is the secret to a highly profitable agribusiness. Here is how to manage the finances of **${farmName}**:

1. **Revenue Streams (Income)**:
   - **Milk Sales**: Log daily milk sales income. At your current scale of **${farmState?.cowsCount || 6}** milking cows yielding an average of **${farmState?.milkTotal || 1480} Liters** per month, optimize pricing based on direct supply vs cooperative rates.
   - **Crop Sales**: Record all proceeds from KTDA tea deliveries and Hass Avocado harvests.
   
2. **Operating Expenses (Costs)**:
   - Track every shilling spent on feed concentrates, silage leases, mineral blocks, veterinary services, farmhand wages, and fertilizers.
   
3. **App Bookkeeping SOP**:
   - Navigate to the **Financials Ledger** tab of this app.
   - Click **Add Transaction**, select either *Income* or *Expense*, choose the appropriate category (e.g., Feeds, Labor, Milk Revenue), enter the amount in Ksh, and write a brief note.
   - The app will automatically calculate your net profit margins and display an interactive bento-style card summarizing the estate's overall cash flow!`;
  }

  // 12. DATABASE BACKUP & SYNC CENTER
  if (isSync) {
    return `🔄 **Sovereign PWA Sync & Backup Center Manual for ${farmName}**
*(Sovereign Free Agro-AI Expert System - Unlimited)*

Hello! To ensure your critical records are never lost, this application features a built-in, lightweight **Cloud Sync Server & Mobile Backup** system:

1. **How the Sync Engine Works**:
   - Every time you add cows, record milking logs, or log financials, the data is saved locally on your phone's browser storage.
   - If you switch devices, install the PWA on a new phone, or clear your browser cache, you can prevent data loss by backing up your data to the server.

2. **How to Backup Your Data**:
   - Navigate to the **Settings & Farm Configurations** menu in the app.
   - Look for the **Database Backup & Sync Center** block.
   - Set a unique, secure **Sync Key** (e.g., a phrase or nickname you can easily remember, like \`dr_devin_farm\`).
   - Click **Backup Current Database to Cloud**. The server will securely save your entire farm state!

3. **How to Restore Your Data (on a new phone/device)**:
   - Open this app on the new device.
   - Go to **Settings**, type the exact same **Sync Key**, and click **Restore Database from Cloud**. All your records will instantly load into your new phone!`;
  }

  // 13. STAFF ROSTER & SCHEDULING
  if (isRoster) {
    return `📅 **Sovereign Staff Roster & Operations Scheduling Guide for ${farmName}**
*(Sovereign Free Agro-AI Expert System - Unlimited)*

Hello! Efficient workforce allocation is critical for daily farm success. Here is how to organize the tasks at **${farmName}**:

1. **Milking & Barn Shifts**:
   - Schedule morning milking shifts (typically 5:00 AM) and afternoon milking shifts (typically 4:00 PM). Ensure milking schedules remain completely consistent to prevent stress on your herd.
   - Assign cleaning tasks immediately after milking to ensure stables are swept and lime powder is spread.

2. **Agronomy & Field Operations**:
   - Assign weekly weeding, weeding-by-hand, fertilizer application, and tea plucking schedules.
   - Track spray operators and make sure they wear full PPE. Ensure the manager verifies the Pre-Harvest Interval (PHI) compliance.

3. **App Task Management SOP**:
   - Navigate to the **Staff Roster** tab to view, add, or edit worker contact files and wage agreements.
   - Navigate to the **Operations Schedule** tab to create specific, timed farm tasks (e.g. *Spraying Block B*, *Insemination for Cow #4*), set their urgency level, and mark them as complete once done.`;
  }

  // GENERAL FALLBACK AGRO-ADVISORY BRIEFING
  return `🌾 **Welcome to the Sovereign Farm Advisor & Expert System for ${farmName}**
*(Active Sovereign Heuristics Engine - Running Free, Unlimited & Offline-Friendly)*

Hello **${managerName}**! I am your local, free, zero-key agronomy and livestock assistant. I understand everything about the layout of this app, your livestock, and your crops.

To help you manage your farm optimally, you can ask me any specific question like:
- 🐄 *"How do I feed my cows to get maximum milk?"* or *"What are heat signs?"*
- 🩺 *"How do I treat or prevent mastitis?"*
- 🌱 *"What is the best soil pH for my crops?"* or *"Tell me about tea plucking rules."*
- 🥑 *"How do I graft Hass avocados or prevent root rot?"*
- 💰 *"How do I record transactions in the Financials Ledger?"*
- 🔄 *"How do I backup and synchronize my data onto my phone?"*

**Current Active Estate Health Metrics:**
- **Herd Strength**: ${farmState?.cowsCount || 6} active cows
- **Agronomy Capacity**: ${farmState?.fieldsCount || 4} production blocks
- **Financial Status**: ${farmState?.income ? `Ksh ${farmState.income} revenue logged` : 'Operational books ready'}
- **Location & Compliance**: GlobalGAP Registered Plot No. **${locCode}**

How can I assist you in livestock or crop management today?`;
}
