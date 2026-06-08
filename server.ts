import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini
let ai: any = null;
if (process.env.GEMINI_API_KEY) {
   ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

const app = express();
const PORT = 3000;

// Mock Naval Assets Base
const baseNavalAssets = [
  // Doğu Akdeniz (Eastern Mediterranean - Strike Group)
  { id: 'n1', name: 'USS Gerald R. Ford (CVN-78)', type: 'Aircraft Carrier', originLat: 34.0, originLng: 33.5, heading: 90, speed: 10, faction: 'NATO', status: 'Strike Group Command' },
  { id: 'n2', name: 'HMS Diamond (D34)', type: 'Destroyer', originLat: 33.8, originLng: 34.0, heading: 30, speed: 20, faction: 'NATO', status: 'Air Defense Escort' },
  { id: 'n3', name: 'FS Alsace (D656)', type: 'Destroyer', originLat: 34.2, originLng: 33.0, heading: 120, speed: 18, faction: 'NATO', status: 'Patrol' },
  
  // Tayvan Boğazı (Taiwan Strait - Power Projection)
  { id: 'n7', name: 'Type 052D Destroyer', type: 'Destroyer', originLat: 24.5, originLng: 119.5, heading: 180, speed: 14, faction: 'China', status: 'Power Projection Patrol' },
  
  // Others
  { id: 'n4', name: 'IRIS Alborz', type: 'Frigate', originLat: 18.5, originLng: 40.0, heading: 340, speed: 12, faction: 'Iran', status: 'Deployed' },
  { id: 'n6', name: 'Alvand-class Frigate', type: 'Frigate', originLat: 25.5, originLng: 55.5, heading: 270, speed: 15, faction: 'Iran', status: 'Escort Mission' }
];

app.get("/api/naval", (req, res) => {
  // Deterministic slight wobble based on time so they don't wander off into deserts
  const now = Date.now() / 10000; 
  const navalAssets = baseNavalAssets.map(asset => {
    return {
      ...asset,
      lat: asset.originLat + Math.sin(now + asset.heading) * 0.5,
      lng: asset.originLng + Math.cos(now + asset.heading) * 0.5,
      heading: (asset.heading + Math.sin(now * 2) * 5) % 360
    };
  });
  res.json({ assets: navalAssets });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
