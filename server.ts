import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Server-side Gemini AI client initialization
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Helper function with retries and fallback models for transient 503 high-demand errors
async function generateContentWithRetry(
  ai: GoogleGenAI,
  options: {
    contents: any;
    config?: any;
    primaryModel?: string;
  }
) {
  const modelsToTry = [
    options.primaryModel || "gemini-3.6-flash",
    "gemini-flash-latest",
    "gemini-3.1-pro-preview"
  ];

  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: options.contents,
          config: options.config,
        });
        return response;
      } catch (err: any) {
        lastError = err;
        const errString = String(err?.message || err || "");
        const isTransient =
          errString.includes("503") ||
          errString.includes("UNAVAILABLE") ||
          errString.includes("high demand") ||
          errString.includes("429") ||
          errString.includes("RESOURCE_EXHAUSTED") ||
          errString.includes("FETCH_ERROR");

        if (!isTransient) {
          throw err;
        }

        if (attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, attempt * 800));
        }
      }
    }
  }

  throw lastError;
}

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// AI Resume Parser from raw text
app.post("/api/gemini/parse-resume", async (req, res) => {
  try {
    const { rawText } = req.body;
    if (!rawText || typeof rawText !== "string") {
      return res.status(400).json({ error: "rawText is required" });
    }

    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({ error: "Gemini API key is missing on server" });
    }

    const prompt = `You are an expert ATS Resume Parser. Extract the structured information from the following raw resume text into a clean JSON format.

RAW RESUME TEXT:
"""
${rawText.slice(0, 8000)}
"""

Respond ONLY with valid JSON matching this schema:
{
  "personalInfo": {
    "fullName": "String",
    "jobTitle": "String",
    "email": "String",
    "phone": "String",
    "location": "String",
    "linkedin": "String",
    "github": "String",
    "website": "String"
  },
  "summary": "String",
  "workExperience": [
    {
      "id": "String",
      "company": "String",
      "position": "String",
      "location": "String",
      "startDate": "String (MM/YYYY or YYYY)",
      "endDate": "String (MM/YYYY, YYYY or Present)",
      "isCurrent": boolean,
      "bullets": ["String"]
    }
  ],
  "education": [
    {
      "id": "String",
      "institution": "String",
      "degree": "String",
      "fieldOfStudy": "String",
      "location": "String",
      "startDate": "String",
      "endDate": "String",
      "gpa": "String"
    }
  ],
  "skills": {
    "hardSkills": ["String"],
    "softSkills": ["String"],
    "toolsAndFrameworks": ["String"],
    "languages": ["String"]
  },
  "certifications": [
    {
      "id": "String",
      "name": "String",
      "issuer": "String",
      "date": "String"
    }
  ],
  "projects": [
    {
      "id": "String",
      "title": "String",
      "role": "String",
      "bullets": ["String"],
      "link": "String"
    }
  ]
}`;

    const response = await generateContentWithRetry(ai, {
      primaryModel: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsedJson = JSON.parse(response.text || "{}");
    res.json({ success: true, data: parsedJson });
  } catch (error: any) {
    console.error("Resume parsing error:", error);
    res.status(500).json({ error: error?.message || "Failed to parse resume text" });
  }
});

// AI Job Description Tailoring & Match Analysis
app.post("/api/gemini/tailor", async (req, res) => {
  try {
    const { resume, jobDescription } = req.body;
    if (!resume || !jobDescription) {
      return res.status(400).json({ error: "resume and jobDescription are required" });
    }

    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({ error: "Gemini API key is missing on server" });
    }

    const prompt = `You are a top executive recruiter and ATS algorithm specialist (Workday, Greenhouse, Lever, Taleo).
Analyze the following resume against the target Job Description.

RESUME SUMMARY & DATA:
${JSON.stringify(resume, null, 2)}

TARGET JOB DESCRIPTION:
"""
${jobDescription.slice(0, 8000)}
"""

Respond ONLY with valid JSON matching this schema:
{
  "matchScore": number (0-100),
  "targetJobTitle": "String",
  "missingHardSkills": ["String"],
  "matchedHardSkills": ["String"],
  "missingSoftSkills": ["String"],
  "missingKeywords": ["String"],
  "portalScores": {
    "workday": number (0-100),
    "greenhouse": number (0-100),
    "lever": number (0-100),
    "taleo": number (0-100)
  },
  "suggestedSummary": "String (An optimized, high-impact professional summary integrating key JD terms organically)",
  "tailoredBullets": [
    {
      "experienceIndex": number,
      "originalBullet": "String",
      "suggestedBullet": "String",
      "reason": "String"
    }
  ],
  "actionableTips": [
    {
      "category": "String",
      "title": "String",
      "description": "String"
    }
  ]
}`;

    const response = await generateContentWithRetry(ai, {
      primaryModel: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsedJson = JSON.parse(response.text || "{}");
    res.json({ success: true, data: parsedJson });
  } catch (error: any) {
    console.error("Tailor analysis error:", error);
    res.status(500).json({ error: error?.message || "Failed to analyze job description match" });
  }
});

// AI Bullet Enhancement
app.post("/api/gemini/enhance-bullet", async (req, res) => {
  try {
    const { bullet, jobTitle, targetKeywords } = req.body;
    if (!bullet) {
      return res.status(400).json({ error: "bullet is required" });
    }

    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({ error: "Gemini API key is missing" });
    }

    const prompt = `Rewrite and optimize this resume bullet point for maximum ATS impact and recruiter scannability.
Target Role: ${jobTitle || "Professional"}
Target Keywords to weave in organically: ${(targetKeywords || []).join(", ")}

Original Bullet: "${bullet}"

Requirements:
- Start with a strong action verb in past or present tense.
- Include quantifiable metrics, percentages, or scale where reasonable ($ or %).
- Keep concise (15-25 words).
- Avoid passive language like "responsible for".

Return JSON:
{
  "enhanced": "String",
  "metricsAdded": "String",
  "actionVerbUsed": "String"
}`;

    const response = await generateContentWithRetry(ai, {
      primaryModel: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("Enhance bullet error:", error);
    res.status(500).json({ error: error?.message || "Failed to enhance bullet point" });
  }
});

async function startServer() {
  // Vite middleware for development
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
    console.log(`ResumeUp AI Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
