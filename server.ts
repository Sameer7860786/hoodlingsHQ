import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import { ProjectSettings, WhitelistApp } from "./src/types";

// Initialize data file and paths safely for Vercel
const isVercel = !!process.env.VERCEL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Sameer@786";
const DATA_FILE_PATH = isVercel 
  ? path.join("/tmp", "data.json") 
  : path.join(process.cwd(), "data.json");

const ASSETS_DIR = isVercel
  ? path.join("/tmp", "assets")
  : path.join(process.cwd(), "assets");

// Ensure assets directory exists safely
if (!fs.existsSync(ASSETS_DIR)) {
  try {
    fs.mkdirSync(ASSETS_DIR, { recursive: true });
  } catch (err) {
    console.error("Failed to create assets directory:", err);
  }
}

// Initial settings template
const DEFAULT_SETTINGS: ProjectSettings = {
  followXLink: "https://x.com/hoodlingsHQ",
  likeRepostLink: "https://x.com/i/status/2075618743426928856",
  isWhitelistOpen: true,
  chain: "RobinHood",
  supply: "8000",
  mintDate: "TBA",
  mintPrice: "TBA",
  countdown: "TBA",
  logoUrl: "/assets/logo.png",
  mascotUrl: "/assets/mascot.png",
  bannerUrl: "/assets/banner.png",
  backgroundUrl: "/assets/background.png",
  faviconUrl: "/assets/favicon.png",
  shareWebsiteUrl: "", // We will populate this automatically or let user configure it
  whitelistTimerTarget: "", // ISO target timestamp for 72h timer, if active
};

// Local storage reader/writer helper
function readLocalData(): { settings: ProjectSettings; submissions: WhitelistApp[] } {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const raw = fs.readFileSync(DATA_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      return {
        settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
        submissions: parsed.submissions || [],
      };
    }
  } catch (err) {
    console.error("Error reading local data file, resetting to defaults:", err);
  }
  return { settings: DEFAULT_SETTINGS, submissions: [] };
}

function writeLocalData(settings: ProjectSettings, submissions: WhitelistApp[]) {
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify({ settings, submissions }, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing local data file:", err);
  }
}

// Set up Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
let supabase: any = null;

if (supabaseUrl && supabaseAnonKey && supabaseUrl !== "YOUR_SUPABASE_URL") {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log("Supabase connected with URL:", supabaseUrl);
  } catch (err) {
    console.error("Failed to connect to Supabase:", err);
  }
} else {
  console.log("Supabase credentials not configured. Running with robust local file storage fallback.");
}

// Helper to read and cache/merge project settings (with Supabase or Local fallback)
async function getSettings(): Promise<ProjectSettings> {
  const localData = readLocalData();
  
  // Set default share website URL if empty in localData
  if (!localData.settings.shareWebsiteUrl) {
    localData.settings.shareWebsiteUrl = process.env.APP_URL || "https://ais-dev-etqixh2xlcvjy5mfslcme4-196041586240.asia-east1.run.app";
    // We only write locally if NOT on Vercel to avoid EROFS error on startup
    if (!isVercel) {
      writeLocalData(localData.settings, localData.submissions);
    }
  }

  if (supabase) {
    try {
      const { data, error } = await supabase.from("settings").select("value").eq("id", "project_settings").single();
      if (!error && data && data.value) {
        return { ...DEFAULT_SETTINGS, ...data.value };
      } else if (error && (error.code === "PGRST116" || error.message?.includes("does not exist"))) {
        // Row or table not found - we try to create it or insert the default settings
        try {
          await supabase.from("settings").upsert([{ id: "project_settings", value: localData.settings }]);
        } catch (upsertErr) {
          console.warn("Supabase initial settings insert issue:", upsertErr);
        }
      } else {
        console.warn("Supabase load settings issue:", error?.message);
      }
    } catch (err: any) {
      console.warn("Supabase load settings connection error:", err.message);
    }
  }
  return localData.settings;
}

// Helper to save settings both to local cache and Supabase
async function saveSettings(newSettings: ProjectSettings) {
  const currentData = readLocalData();
  writeLocalData(newSettings, currentData.submissions);

  if (supabase) {
    try {
      const { error } = await supabase.from("settings").upsert({ id: "project_settings", value: newSettings });
      if (error) {
        console.error("Supabase upsert settings error:", error.message);
      } else {
        console.log("Successfully saved settings to Supabase!");
      }
    } catch (err: any) {
      console.error("Supabase connection issue during settings upsert:", err.message);
    }
  }
}

const app = express();
const PORT = 3000;

// Set high limit for body parser to allow base64 image upload
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// --- Robust Vercel Routing Middleware ---
app.use((req, res, next) => {
  console.log(`[Vercel Routing] Incoming request: ${req.method} ${req.url}`);
  
  // If req.url starts with /api/server, strip the /server or /server.ts/server.js part
  if (req.url.startsWith("/api/server")) {
    let remaining = req.url.substring("/api/server".length);
    if (remaining.startsWith(".ts")) {
      remaining = remaining.substring(3);
    } else if (remaining.startsWith(".js")) {
      remaining = remaining.substring(3);
    }
    
    if (remaining.startsWith("/")) {
      req.url = "/api" + remaining;
    } else if (remaining.startsWith("?")) {
      req.url = "/api" + remaining;
    } else if (remaining === "") {
      req.url = "/api";
    }
  }

  // Handle case where Vercel rewrites path wildcard to a query parameter 'path'
  if (req.query && typeof req.query.path === "string") {
    const pathVal = req.query.path;
    if (pathVal.startsWith("api/")) {
      req.url = "/" + pathVal;
    } else if (pathVal.startsWith("/")) {
      req.url = "/api" + pathVal;
    } else {
      req.url = "/api/" + pathVal;
    }
  }

  console.log(`[Vercel Routing] Handled URL: ${req.url}`);
  next();
});

// Serve custom assets folder statically
app.use("/assets", express.static(ASSETS_DIR));

// --- API Routes ---

  // Get project settings
  app.get("/api/settings", async (req, res) => {
    const settings = await getSettings();
    res.json(settings);
  });

  // Update project settings
  app.post("/api/settings", async (req, res) => {
    const { password, settings: newSettings } = req.body;
    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const currentSettings = await getSettings();
    const updatedSettings = { ...currentSettings, ...newSettings };
    await saveSettings(updatedSettings);
    res.json({ success: true, settings: updatedSettings });
  });

  // Admin login check
  app.post("/api/admin/login", (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
      res.json({ success: true, token: "session_valid_token_786" });
    } else {
      res.status(401).json({ error: "Invalid password" });
    }
  });

  // Get all submissions (Admin view)
  app.get("/api/submissions", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader !== ADMIN_PASSWORD && req.query.password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("submissions")
          .select("*")
          .order("created_at", { ascending: false });
        if (!error && data) {
          const mapped = data.map((row: any) => ({
            id: row.id,
            username: row.username,
            wallet: row.wallet,
            status: row.status || "pending",
            createdAt: row.created_at || row.createdAt,
          }));
          return res.json(mapped);
        } else {
          console.error("Supabase select submissions error:", error?.message);
        }
      } catch (err: any) {
        console.error("Supabase connection issue during submissions fetch:", err.message);
      }
    }

    const data = readLocalData();
    res.json(data.submissions);
  });

  // Delete submission (Admin action)
  app.post("/api/submissions/delete", async (req, res) => {
    const { password, id } = req.body;
    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const settings = await getSettings();
    const data = readLocalData();
    const updatedSubmissions = data.submissions.filter((s) => s.id !== id);
    writeLocalData(settings, updatedSubmissions);

    if (supabase) {
      try {
        const { error } = await supabase.from("submissions").delete().eq("id", id);
        if (error) {
          console.error("Supabase delete submission error:", error.message);
        } else {
          console.log("Successfully deleted submission from Supabase!");
        }
      } catch (err: any) {
        console.error("Supabase connection issue during deletion:", err.message);
      }
    }

    res.json({ success: true });
  });

  // Add whitelist submission (User application)
  app.post("/api/submissions", async (req, res) => {
    const { username, wallet } = req.body;

    if (!username || !wallet) {
      return res.status(400).json({ error: "X Username and EVM Wallet address are required." });
    }

    // EVM Wallet validation
    const evmRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!evmRegex.test(wallet)) {
      return res.status(400).json({ error: "Invalid EVM wallet address format." });
    }

    const settings = await getSettings();

    // Check if 72-hour timer is running and has expired
    if (settings.whitelistTimerTarget) {
      const isExpired = new Date().getTime() > new Date(settings.whitelistTimerTarget).getTime();
      if (isExpired) {
        return res.status(403).json({ error: "The 72-hour whitelist application timer has expired. Applications are closed." });
      }
    }

    // Check if whitelist is currently closed
    if (!settings.isWhitelistOpen) {
      return res.status(403).json({ error: "The whitelist application is currently closed." });
    }

    // Check for duplicate wallet or username in Supabase
    let duplicate = false;
    if (supabase) {
      try {
        const { data: dbSubmissions, error } = await supabase
          .from("submissions")
          .select("id")
          .or(`wallet.ilike.${wallet},username.ilike.${username}`);
        if (!error && dbSubmissions && dbSubmissions.length > 0) {
          duplicate = true;
        }
      } catch (err: any) {
        console.error("Supabase duplicate check issue:", err.message);
      }
    }

    // Fallback to checking local data if duplicate not found yet
    if (!duplicate) {
      const data = readLocalData();
      const localDuplicate = data.submissions.find(
        (s) => s.wallet.toLowerCase() === wallet.toLowerCase() || s.username.toLowerCase() === username.toLowerCase()
      );
      if (localDuplicate) duplicate = true;
    }

    if (duplicate) {
      return res.status(400).json({ error: "This wallet address or X username has already applied." });
    }

    const newApp: WhitelistApp = {
      id: "app_" + Math.random().toString(36).substring(2, 11),
      username,
      wallet,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    // Save locally
    const data = readLocalData();
    data.submissions.unshift(newApp);
    writeLocalData(settings, data.submissions);

    // Save to Supabase if configured
    if (supabase) {
      try {
        const { error } = await supabase.from("submissions").insert([
          {
            id: newApp.id,
            username: newApp.username,
            wallet: newApp.wallet,
            status: newApp.status,
            created_at: newApp.createdAt,
          },
        ]);
        if (error) {
          console.error("Supabase error during insertion:", error.message);
        } else {
          console.log("Successfully saved submission to Supabase!");
        }
      } catch (err: any) {
        console.error("Supabase connection issue during insertion:", err.message);
      }
    }

    res.json({ success: true, submission: newApp });
  });

  // Upload or replace asset
  app.post("/api/upload-asset", async (req, res) => {
    const { password, assetType, base64Data } = req.body;

    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!assetType || !base64Data) {
      return res.status(400).json({ error: "Asset type and data are required." });
    }

    try {
      // Validate asset type
      const allowedTypes = ["logo", "mascot", "banner", "background", "favicon"];
      if (!allowedTypes.includes(assetType)) {
        return res.status(400).json({ error: "Invalid asset type" });
      }

      // Convert base64 to Buffer
      const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let buffer: Buffer;
      let extension = "png";

      if (matches && matches.length === 3) {
        const mimeType = matches[1];
        if (mimeType.includes("jpeg") || mimeType.includes("jpg")) {
          extension = "jpg";
        } else if (mimeType.includes("gif")) {
          extension = "gif";
        } else if (mimeType.includes("svg")) {
          extension = "svg";
        } else if (mimeType.includes("x-icon") || mimeType.includes("icon")) {
          extension = "ico";
        }
        buffer = Buffer.from(matches[2], "base64");
      } else {
        buffer = Buffer.from(base64Data, "base64");
      }

      // Favicon can be favicon.ico, logo can be logo.png etc
      const fileName = `${assetType}.${extension}`;
      const filePath = path.join(ASSETS_DIR, fileName);

      // Write file
      fs.writeFileSync(filePath, buffer);

      // Update project settings URL
      const currentSettings = await getSettings();
      const updatedUrl = `/assets/${fileName}`;
      const urlKey = `${assetType}Url` as keyof ProjectSettings;

      const updatedSettings = {
        ...currentSettings,
        [urlKey]: updatedUrl,
      };

      await saveSettings(updatedSettings);

      console.log(`Asset ${assetType} saved to ${updatedUrl}`);
      res.json({ success: true, url: updatedUrl });
    } catch (err: any) {
      console.error("Asset upload error:", err);
      res.status(500).json({ error: "Failed to save upload: " + err.message });
    }
  });

  // --- Vite Middleware or Static Production Build ---

  async function setupViteOrStatic() {
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
  }

  if (!process.env.VERCEL) {
    setupViteOrStatic().then(() => {
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`HoodLings full-stack server listening on http://0.0.0.0:${PORT}`);
      });
    });
  }

export { app };
export default app;
