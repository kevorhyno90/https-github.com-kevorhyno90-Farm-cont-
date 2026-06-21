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
