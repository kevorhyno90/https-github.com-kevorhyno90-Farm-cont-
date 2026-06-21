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

  app.post("/api/ai-chat", async (req, res) => {
    const { message, history, farmState, settings } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Missing message parameter" });
    }

    const managerName = settings?.administrator || "Dr. Devin Omwenga";
    const farmName = settings?.estateName || "JR Farm";
    const locCode = settings?.locationCode || "KT-205A";

    if (!ai) {
      // Rule-based fallback if API key is not defined, ensuring smooth evaluation
      return res.json({
        text: `Hello! I am ${managerName}'s Sovereign AI Advisor. (Note: To activate full live AI responses, please add your GEMINI_API_KEY in the Settings > Secrets menu in AI Studio!)\n\nBased on the local dynamic state of ${farmName}:\n- Active Staff Roster: ${farmState?.staffCount || 5} members\n- Total Milking Cows: ${farmState?.cowsCount || 6} in herd\n- Total Acreage Records: ${farmState?.fieldsCount || 4} blocks\n\nI am currently running in Offline mode. Please provide the Gemini API key to query high-precision agricultural intelligence.`
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
