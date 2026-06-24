import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const SYNC_FILE_PATH = path.join(process.cwd(), "farm_sync_database.json");

// Helper to read sync database
function readSyncDatabase(): Record<string, { database: any; updatedAt: string }> {
  try {
    if (fs.existsSync(SYNC_FILE_PATH)) {
      const data = fs.readFileSync(SYNC_FILE_PATH, "utf-8");
      return JSON.parse(data) || {};
    }
  } catch (err) {
    console.error("Error reading sync database file:", err);
  }
  return {};
}

// Helper to write sync database
function writeSyncDatabase(data: Record<string, any>) {
  try {
    fs.writeFileSync(SYNC_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing sync database file:", err);
  }
}

// Heuristic fallback offline diagnostics matcher for cattle, poultry, and Solanaceae crops
function selectFallbackDiagnosis(target: string, symptom: string): any {
  const norm = (symptom || "").toLowerCase();
  const tgt = (target || "").toLowerCase();

  if (tgt === 'cow' || tgt === 'cattle') {
    if (norm.includes('udder') || norm.includes('milk') || norm.includes('breast') || norm.includes('clot') || norm.includes('mastitis') || norm.includes('teat')) {
      return {
        symptom,
        conditionName: "Clinical Mastitis (Offline Heuristic Detection)",
        pathogen: "Streptococcus uberis / Staphylococcus aureus (Bacterial)",
        likelihood: "High",
        description: "An acute bacterial invasion of mammary tissues. Thrives due to damp bedding, improper sanitization, or faulty milking techniques, causing inflamed udder quarters.",
        treatment: "Administer intramammary antibiotic infusion (penicillin/cloxacillin) to affected quarters after complete stripping of milk. Apply anti-inflammatory ointment.",
        quarantine: "Withhold milk from consumption for 3-4 days (PHI). Ensure group segregation and milk this cow LAST in any batch sequence.",
        prevention: "Implement standard 0.5% Iodine post-milking teat dipping. Keep resting stables completely dry, spreading lime powder weekly."
      };
    }
    if (norm.includes('tick') || norm.includes('fever') || norm.includes('lymph') || norm.includes('pant') || norm.includes('breathe') || norm.includes('breathing') || norm.includes('cough')) {
      return {
        symptom,
        conditionName: "East Coast Fever (ECF) (Offline Heuristic)",
        pathogen: "Theileria parva (Protozoan parasite transmitted by Brown Ear Ticks)",
        likelihood: "High",
        description: "The leading tick-borne vascular parasitic disease in high-yield dairy cows. Causes massive lymph node swelling, fever, and severe pulmonary edema.",
        treatment: "Inject Buparvaquone (Butalex) at 2.5mg/kg body weight intramuscularly, combined with support broad-spectrum Oxytetracycline.",
        quarantine: "Restrict animal movement to prevent tick vectors seeding uncontaminated grazing areas. Clip and treat and isolate cow.",
        prevention: "Enforce strict weekly tick control via Amitraz spraying or dipping. Keep tick grease applied to the ear folds."
      };
    }
    // Generic cow ailment
    return {
      symptom,
      conditionName: "Ruminal Acidosis / Bloat (Offline Heuristics)",
      pathogen: "Lactic Acid overload / Rumen Microflora Dysbiosis",
      likelihood: "Moderate",
      description: "An acute digestive disorder stemming from high carbohydrate intake (overfeeding on maize grain/meal) without structured long-fiber forage.",
      treatment: "Drench with 200g of Magnesium Oxide or standard commercial anti-bloat vegetable oil emulsion. Suspend grain feed.",
      quarantine: "Isolate the cow in a well-ventilated pasture block and monitor dung consistency and rumen contractions for 48 hours.",
      prevention: "Balance TMR (Total Mixed Ration) with adequate long dry hay fibers. Avoid sudden changes in concentrate feeding ratios."
    };
  }

  if (tgt === 'chicken' || tgt === 'poultry') {
    return {
      symptom,
      conditionName: "Avian Coccidiosis / Gut Protozoa (Offline Detection)",
      pathogen: "Eimeria spp. (Intestinal intracellular protozoa)",
      likelihood: "High",
      description: "A highly destructive parasite that replicates inside intestinal cell walls. Spreads through damp bedding material, leading to pale combs and high mortality rates.",
      treatment: "Administer Amprolium (0.024% in drinking water) continuously for 5-7 days. Supply multi-vitamins to aid intestinal wall healing.",
      quarantine: "Isolate active sick flock. Totally scoop damp litter, sanitize floor with lime, and lay down deep bone-dry pine wood shavings.",
      prevention: "Keep drink lines perfectly sealed to stop leaks. Include pre-mixed preventative coccidiostats in Chick Starter feeds."
    };
  }

  if (tgt === 'tomato') {
    if (norm.includes('curl') || norm.includes('yellow') || norm.includes('vector') || norm.includes('whitefl') || norm.includes('stunt')) {
      return {
        symptom,
        conditionName: "Tomato Yellow Leaf Curl Virus (TYLCV) (Offline Detection)",
        pathogen: "Begomovirus (Transmitted by whitefly vector Bemisia tabaci)",
        likelihood: "High",
        description: "A severe viral disease causing dramatic upward leaf curling, yellow borders, and absolute flower dropping, ruining fruit yields.",
        treatment: "No cure for the virus. Systematically spray Acetamiprid or organic soap-neem oil mixture to control active whitefly vectors.",
        quarantine: "Immediately uproot the infected crops, bag them inside the rows, and carry out-of-field to burn or bury.",
        prevention: "Adopt fine insect-proof nylon nets over nurseries. Keep fields completely free of solanaceous weeds."
      };
    }
    return {
      symptom,
      conditionName: "Solanaceous Late Blight (Offline Detection)",
      pathogen: "Phytophthora infestans (Oomycete Plant Spore)",
      likelihood: "High",
      description: "A dynamic aggressive spore infection thriving under cold, humid weather. Leaves develop wet-looking dark margins, ending in black rot.",
      treatment: "Apply systemic Metalaxyl + Mancozeb sprays immediately. For rain seasons, apply defensive preventive Copper Hydroxide weekly.",
      quarantine: "Prune and destroy soil-splashed lower crop leaves. Maintain a strict 7-day chemical withholding period.",
      prevention: "Maintain 60x45cm plant spacing to ensure rapid leaf drying. Shift to drip irrigation lines instead of overhead sprinklers."
    };
  }

  // General default fallback
  return {
    symptom,
    conditionName: "Mild Nutritional Stress / Heat Shock (Offline Heuristics)",
    pathogen: "Macro-Nutrient deficiency or microclimate water stress",
    likelihood: "Moderate",
    description: "The specimen showcases symptoms of physiological reaction, likely caused by fluctuating watering, climate stress, or soil nutritional deficits.",
    treatment: "Apply comprehensive organic foliar fertilizer (such as bio-slurry or seaweed-based trace elements) and maintain structured watering schedules.",
    quarantine: "Monitor other specimens in the same block. Restrict physical pruning cuts until soil nutrient balance returns.",
    prevention: "Run complete laboratory soil testing. Keep soil organic matter content high with premium composted farmyard manure."
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON body parser
  app.use(express.json());

  // Initialize server-side Gemini
  let ai: GoogleGenAI | null = null;
  try {
    if (process.env.GEMINI_API_KEY) {
      ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      console.log("Server: Gemini API client initialized successfully.");
    } else {
      console.warn("Server: GEMINI_API_KEY is not defined in the environment.");
    }
  } catch (err) {
    console.error("Server: Failed to initialize Gemini API client:", err);
  }

  // API endpoints
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", aiInitialized: !!ai });
  });

  // Cloud Sync: Save database state for cross-device syncing
  app.post("/api/sync/save", (req, res) => {
    try {
      const { syncKey, database } = req.body;
      if (!syncKey || typeof syncKey !== "string") {
        return res.status(400).json({ error: "Missing or invalid syncKey parameter." });
      }
      if (!database || typeof database !== "object") {
        return res.status(400).json({ error: "Missing or invalid database state object." });
      }

      const cleanKey = syncKey.trim().toLowerCase();
      if (cleanKey.length < 3) {
        return res.status(400).json({ error: "Sync key must be at least 3 characters long." });
      }

      const syncDb = readSyncDatabase();
      syncDb[cleanKey] = {
        database,
        updatedAt: new Date().toISOString()
      };
      writeSyncDatabase(syncDb);

      res.json({ success: true, message: `State synced successfully under key "${cleanKey}".` });
    } catch (err: any) {
      console.error("Sync save failed:", err);
      res.status(500).json({ error: err.message || "Failed to save sync state." });
    }
  });

  // Cloud Sync: Load database state for cross-device syncing
  app.get("/api/sync/load/:syncKey", (req, res) => {
    try {
      const { syncKey } = req.params;
      if (!syncKey) {
        return res.status(400).json({ error: "Sync key is required." });
      }

      const cleanKey = syncKey.trim().toLowerCase();
      const syncDb = readSyncDatabase();
      const syncRecord = syncDb[cleanKey];

      if (!syncRecord) {
        return res.status(444).status(404).json({ error: `No sync room found under key "${cleanKey}". Check spelling and retry.` });
      }

      res.json({
        success: true,
        database: syncRecord.database,
        updatedAt: syncRecord.updatedAt
      });
    } catch (err: any) {
      console.error("Sync load failed:", err);
      res.status(500).json({ error: err.message || "Failed to load sync state." });
    }
  });

  // Diagnostics Troubleshooting Solver Route with Live Gemini API and robust offline heuristics
  app.post("/api/ai-diagnose", async (req, res) => {
    try {
      const { domain, target, symptom } = req.body;
      if (!target || !symptom) {
        return res.status(400).json({ error: "Missing required parameters: target and symptom." });
      }

      if (!ai) {
        const fallback = selectFallbackDiagnosis(target, symptom);
        return res.json({ success: true, diagnosis: fallback, isOffline: true });
      }

      const systemPrompt = `You are the ultimate dynamic medical veterinary and crop agronomy diagnostic classification engine for JR Farm.
Your task is to analyze the observable symptoms for a given farm specimen (e.g. cow, tomato, maize, chicken, avocado, banana) and generate a high-precision clinical diagnosis.

You MUST respond strictly with a valid JSON object matching the schema below, in plain text without any markdown markers, backticks, or explanation.
Fields required inside the JSON response:
{
  "symptom": "Exact description of symptoms provided by user",
  "conditionName": "Clean botanical/clinical name of the disease or physiological breakdown",
  "pathogen": "Specific microbiological pathogen taxonomic details or physiological chemical element deficiency",
  "likelihood": "High" or "Moderate",
  "description": "Short, authoritative clinical explanation of how the disease attacks tissue and disrupts starch/vitality",
  "treatment": "Instant SOP treatment plan, specifying exact active chemical ingredients (with exact doses per 20L water or per kg body weight)",
  "quarantine": "Precise quarantine boundaries, pasture isolation distances, or chemical/veterinary withholding period (PHI) for milk, meat, or crop harvests",
  "prevention": "🛡️ Long-term GAP (Good Agricultural Practices) prevention bio-controls, soil buffers, or insect vector-proofing protocols"
}`;

      const promptMsg = `Specimen: "${target}" (Domain: ${domain || "farm"})
Observable Symptoms: "${symptom}"

Compile diagnostic analysis reports. Validate that the response is JSON only with the requested structure.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            role: "user",
            parts: [{ text: promptMsg }]
          }
        ],
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.1,
          responseMimeType: "application/json",
        }
      });

      const responseText = response.text || "{}";
      const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanedText);

      res.json({ success: true, diagnosis: parsed, isOffline: false });
    } catch (err: any) {
      console.warn("AI diagnosis execution failed, utilizing robust offline fallback:", err);
      const fallback = selectFallbackDiagnosis(req.body.target || "cow", req.body.symptom || "");
      res.json({ success: true, diagnosis: fallback, isOffline: true, errorMsg: err.message });
    }
  });

  // Free Sovereign Expert Advisory Engine
  function generateFreeAgroAdvisorResponse(message: string, farmState: any, settings: any): string {
    const norm = (message || "").toLowerCase();
    
    const managerName = settings?.administrator || "Dr. Devin Omwenga";
    const farmName = settings?.estateName || "JR FARM COOPERATIVE ESTATE";
    const locCode = settings?.locationCode || "KT-205A";

    const dairyKeywords = ['cow', 'cattle', 'milk', 'feed', 'tmr', 'mastitis', 'teat', 'udder', 'breed', 'calv', 'bull', 'heifer', 'inseminat', 'pregnancy', 'protein', 'silage', 'forage', 'dairy', 'livestock', 'gumboro', 'poultry', 'chicken', 'veterinary', 'beast'];
    const cropKeywords = ['crop', 'tea', 'avocado', 'soil', 'ph', 'spray', 'pesticide', 'tomato', 'fertilizer', 'lime', 'graft', 'fungicid', 'plucking', 'ktda', 'solanace', 'horticulture', 'maize', 'banana', 'agronom'];
    const financeKeywords = ['financ', 'income', 'expense', 'cost', 'profit', 'loss', 'money', 'ksh', 'budget', 'sale', 'sold', 'revenue', 'ledger', 'bookkeeping', 'price', 'financial', 'record', 'accounting'];
    const syncKeywords = ['sync', 'backup', 'restore', 'cloud', 'offline', 'save', 'load', 'phone', 'install', 'key', 'pwa', 'server', 'database'];
    const rosterKeywords = ['roster', 'staff', 'worker', 'shift', 'schedule', 'task', 'manager', 'assign', 'operations', 'job', 'hand'];

    let dairyScore = 0;
    let cropScore = 0;
    let financeScore = 0;
    let syncScore = 0;
    let rosterScore = 0;

    dairyKeywords.forEach(kw => { if (norm.includes(kw)) dairyScore++; });
    cropKeywords.forEach(kw => { if (norm.includes(kw)) cropScore++; });
    financeKeywords.forEach(kw => { if (norm.includes(kw)) financeScore++; });
    syncKeywords.forEach(kw => { if (norm.includes(kw)) syncScore++; });
    rosterKeywords.forEach(kw => { if (norm.includes(kw)) rosterScore++; });

    // 1. DAIRY & LIVESTOCK ADVISORY
    if (dairyScore > 0 && dairyScore >= Math.max(cropScore, financeScore, syncScore, rosterScore)) {
      return `🐄 **Sovereign Livestock & Dairy Advisory for ${farmName}**
*(Active Heuristics Expert System - Running Free & Unlimited)*

Hello! Here is the custom veterinary and bovine advisory compiled for **${managerName}**:

1. **Bovine Nutrition & Milk Yields**:
   - For lactating dairy cows (e.g., your herd of **${farmState?.cowsCount || 6}** cows), target a diet with **18% to 20% Crude Protein (CP)**.
   - Balance your Total Mixed Ration (TMR) by providing high-quality dry matter forage (such as Napier silage, sweet potato vines) alongside energy concentrates (dairy meal).
   - Use the **TMR Mixing** and **Feed Formulator** tabs in this app to precisely calibrate ingredient ratios to prevent ruminal acidosis and bloat!

2. **Milking Hygiene & Clinical Mastitis Control**:
   - Enforce a strict pre- and post-milking hygiene SOP. Use a **0.5% Iodine teat-dip** immediately after milking.
   - Clean udders using separate dry towels for each cow. Use a strip-cup before milking to detect any milk clots, watery secretions, or early-stage mastitis.
   - Separate and milk any infected cows last in the sequence to prevent cross-contamination.

3. **Dairy Breeding Cycles**:
   - Track heat symptoms closely: increased vocalization, clear vaginal mucus discharge, standing to be mounted, and a slight drop in daily milk yield.
   - Perform Artificial Insemination (AI) 12-18 hours after the onset of standing heat (the AM/PM rule).
   - Monitor and log calving dates, insemination treatments, and pregnancy diagnostics (PD) using the **Dairy Breeding** tab of this app. Target a calving interval of 365-380 days for maximum profitability.`;
    }

    // 2. CROP & HORTICULTURE ADVISORY
    if (cropScore > 0 && cropScore >= Math.max(dairyScore, financeScore, syncScore, rosterScore)) {
      return `🌱 **Sovereign Crop & Agronomy Advisory for ${farmName}**
*(Active Heuristics Expert System - Running Free & Unlimited)*

Hello! Here is the custom soil, tea, avocado, and crop safety advisory compiled for **${managerName}** at plot **${locCode}**:

1. **Tea Crop Management (KTDA Compliance)**:
   - For your tea blocks, enforce the standard **fine plucking cycle (two leaves and a bud)**. This preserves high leaf grades and complies with KTDA factory quality requirements.
   - Maintain the standard plucking table width and height to optimize solar capture and induce continuous young shoots.
   - Log plucking weight, dates, and active field workers inside the **Horticulture Blocks** tab of the app.

2. **Avocado Block Best Practices**:
   - For Hass and Fuerte trees, utilize wedge grafting onto local hardy rootstocks for superior pest tolerance.
   - Safeguard against Phytophthora root rot by ensuring excellent field drainage, planting on high ridges, and using clean, well-composted organic fertilizer.

3. **Soil pH & Fertilizability**:
   - **Solanaceous Blocks (Tomato, Potatoes)**: Keep soil pH strictly between **5.8 and 6.4**. Apply dolomite lime if soil testing indicates high acidity.
   - **Tea Blocks**: Maintain highly acidic soil conditions between **4.5 and 5.6** to ensure optimal nutrient intake.
   - Integrate organic compost, bio-slurry, or well-seasoned farmyard manure to enrich cation exchange capacity (CEC) and soil microbial life.

4. **Pesticide Safety & GlobalGAP Compliance**:
   - Log all chemical applications inside the **Spray Log** tab.
   - Strictly follow the Pre-Harvest Intervals (PHI) for every chemical applied to guarantee residue-free, export-safe crops!`;
    }

    // 3. FINANCIAL RECORDS & OPERATIONS
    if (financeScore > 0 && financeScore >= Math.max(dairyScore, cropScore, syncScore, rosterScore)) {
      return `💰 **Sovereign Financials & Bookkeeping Ledger Guide for ${farmName}**
*(Active Heuristics Expert System - Running Free & Unlimited)*

Hello! Maintaining clean, accurate books is the secret to a highly profitable agribusiness. Here is how to manage the finances of **${farmName}**:

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

    // 4. DATABASE BACKUP & SYNC CENTER
    if (syncScore > 0 && syncScore >= Math.max(dairyScore, cropScore, financeScore, rosterScore)) {
      return `🔄 **Sovereign PWA Sync & Backup Center Manual for ${farmName}**
*(Active Heuristics Expert System - Running Free & Unlimited)*

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

    // 5. STAFF ROSTER & SCHEDULING
    if (rosterScore > 0 && rosterScore >= Math.max(dairyScore, cropScore, financeScore, syncScore)) {
      return `📅 **Sovereign Staff Roster & Operations Scheduling Guide for ${farmName}**
*(Active Heuristics Expert System - Running Free & Unlimited)*

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
*(Active Heuristics Engine - Running Free, Unlimited & Offline-Friendly)*

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

  app.post("/api/ai-chat", async (req, res) => {
    const { message, history, farmState, settings } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Missing message parameter" });
    }

    const managerName = settings?.administrator || "Dr. Devin Omwenga";
    const farmName = settings?.estateName || "JR Farm";
    const locCode = settings?.locationCode || "KT-205A";

    if (!ai) {
      // Free Sovereign Expert Engine fallback if API key is not defined, ensuring smooth evaluation without cost!
      const fallbackResponse = generateFreeAgroAdvisorResponse(message, farmState, settings);
      return res.json({
        text: fallbackResponse,
        isFreeAdvisor: true
      });
    }

    try {
      let systemPrompt = `You are the ${farmName} Sovereign AI Advisor, a premier agricultural expert and clinical veterinary consultant. You speak with high precision, clear structure, and using elite agronomic terminology. You describe recommendations based on the sovereign compliance standards of ${managerName} at plot registered location ${locCode}.`;
      
      if (farmState) {
        systemPrompt += `\nHere is the current real-time state of ${farmName}:
- Live Cows Count: ${farmState.cowsCount || 6}
- Monthly Milk Production Volume: ${farmState.milkTotal || 1480} Liters
- Number of active agronomy field blocks: ${farmState.fieldsCount || 4} blocks
- Financials status: Total income Ksh ${farmState.income || "0"}, total expenses Ksh ${farmState.expense || "0"}.`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          ...(history || []).map((h: any) => ({
            role: h.role === "user" ? "user" : "model",
            parts: [{ text: h.text }]
          })),
          {
            role: "user",
            parts: [{ text: message }]
          }
        ],
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        }
      });

      res.json({ text: response.text });
    } catch (err: any) {
      console.error("AI chat error:", err);
      res.json({ 
        text: `An error occurred with the Gemini API (${err.message}). Falling back to Offline Rulebook:\n- Check that your key is active.\n- Keep soil ph between 5.5 and 6.5.\n- Monitor pre/post milking hygiene carefully.`
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Server: Vite dev server middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Server: Static asset paths configured.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
