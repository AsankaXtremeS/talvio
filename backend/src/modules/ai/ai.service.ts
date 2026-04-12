import { GoogleGenerativeAI } from "@google/generative-ai";
import crypto from "crypto";
import fs from "fs";
import { PDFParse } from "pdf-parse";
import { env } from "../../config/env";
import { PROVIDERS, ProviderConfig } from "./provider.config";
import {
  COMPREHENSIVE_ANALYSIS_PROMPT,
  EXTRACT_CV_SKILLS_PROMPT,
  EXTRACT_JD_KEYWORDS_PROMPT,
  RANK_JOBS_PROMPT,
} from "./ai.prompts";

const geminiEnabled = Boolean(env.GEMINI_API_KEY);
const genAI = geminiEnabled ? new GoogleGenerativeAI(env.GEMINI_API_KEY) : null;

// JSON result model
const flashModel = genAI?.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: { responseMimeType: "application/json", temperature: 0.1 },
});

// ─────────────────────────────────────────────────────────────────────────────
// SEMAPHORE & HELPERS
// ─────────────────────────────────────────────────────────────────────────────

class Semaphore {
  private running = 0;
  private readonly queue: Array<() => void> = [];
  constructor(private readonly limit: number) {}
  private acquire(): Promise<void> {
    if (this.running < this.limit) {
      this.running++;
      return Promise.resolve();
    }
    return new Promise((resolve) => this.queue.push(resolve));
  }
  private release(): void {
    this.running--;
    const next = this.queue.shift();
    if (next) {
      this.running++;
      next();
    }
  }
  async run<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }
}

const aiQueue = new Semaphore(3);

async function openAiGenerate(provider: ProviderConfig, prompt: string, temperature = 0.7): Promise<string> {
  if (!provider.apiKey || !provider.baseURL) throw new Error(`${provider.name}: not configured`);
  const response = await fetch(`${provider.baseURL.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${provider.apiKey}` },
    body: JSON.stringify({
      model: provider.model,
      messages: [{ role: "user", content: prompt }],
      temperature,
    }),
  });
  if (!response.ok) throw new Error(`${provider.name} HTTP ${response.status}`);
  const data = await response.json();
  return data?.choices?.[0]?.message?.content ?? "";
}

async function requestWithFallback<T>(
  providerPriority: string[],
  fn: (provider: ProviderConfig) => Promise<T>
): Promise<T> {
  const providers = PROVIDERS.filter(p => providerPriority.includes(p.name) && (p.type === "gemini" ? geminiEnabled : !!p.apiKey));
  const errors = [];
  for (const provider of providers) {
    try {
      return await fn(provider);
    } catch (err: any) {
      errors.push(`[${provider.name}] ${err.message}`);
    }
  }
  throw new Error(`AI fail: ${errors.join(" | ")}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface AnalysisResult {
  overallScore: number;
  suggestions: string[];
  coverLetter: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// AI SERVICE
// ─────────────────────────────────────────────────────────────────────────────

export const aiService = {
  async extractCvText(source: string): Promise<string> {
    try {
      let fileBuffer: Buffer;
      
      if (source.startsWith("http://") || source.startsWith("https://")) {
        const response = await fetch(source);
        if (!response.ok) throw new Error(`Failed to fetch PDF from URL: ${response.statusText}`);
        fileBuffer = Buffer.from(await response.arrayBuffer());
      } else {
        fileBuffer = await fs.promises.readFile(source);
      }

      const parser = new PDFParse({ data: fileBuffer });
      const parsed = await parser.getText();
      return (parsed.text || "").trim().replace(/\0/g, "");
    } catch (error: any) {
      console.error("❌ PDF extraction error:", error);
      throw new Error(`Failed to extract text from CV: ${error.message}`);
    }
  },

  /**
   * Extract skills once for profile
   */
  async extractSkills(cvText: string): Promise<string[]> {
    const prompt = EXTRACT_CV_SKILLS_PROMPT.replace("{cvText}", cvText.slice(0, 4000));
    return aiQueue.run(() => requestWithFallback(["gemini", "groq"], async (provider) => {
      if (provider.type === "gemini") {
        const raw = await flashModel!.generateContent(prompt).then(r => r.response.text());
        return JSON.parse(raw);
      }
      const raw = await openAiGenerate(provider, prompt, 0.1);
      return JSON.parse(raw);
    }));
  },

  /**
   * Comprehensive Analysis: Score + Suggestions + CL
   */
  async analyzeCv(cvText: string, jobDescription: string): Promise<AnalysisResult> {
    const prompt = COMPREHENSIVE_ANALYSIS_PROMPT
      .replace("{cvText}", cvText.slice(0, 4000))
      .replace("{jobDescription}", jobDescription);

    return aiQueue.run(() => requestWithFallback(["gemini", "mistral"], async (provider) => {
      if (provider.type === "gemini") {
        const raw = await flashModel!.generateContent(prompt).then(r => r.response.text());
        return JSON.parse(raw);
      }
      const raw = await openAiGenerate(provider, prompt, 0.2);
      return JSON.parse(raw);
    }));
  },

  /**
   * Fast Keyword Matching for Recommendations
   */
  calculateSimilarity(candidateSkills: string[], requiredSkills: string[]): number {
    if (!requiredSkills.length) return 0;
    const matched = candidateSkills.filter(s => 
      requiredSkills.some(req => req.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(req.toLowerCase()))
    );
    return Math.round((matched.length / requiredSkills.length) * 100);
  },

  async extractJdKeywords(jobDescription: string): Promise<string[]> {
    const prompt = EXTRACT_JD_KEYWORDS_PROMPT.replace("{jobDescription}", jobDescription);
    return aiQueue.run(() => requestWithFallback(["gemini", "groq"], async (provider) => {
      if (provider.type === "gemini") {
        const raw = await flashModel!.generateContent(prompt).then(r => r.response.text());
        return JSON.parse(raw);
      }
      const raw = await openAiGenerate(provider, prompt, 0.1);
      return JSON.parse(raw);
    }));
  },

  /**
   * 4. RANK JOBS (High Accuracy Batch Ranking)
   * Goal: Evaluate a list of jobs against a candidate profile in one go.
   */
  async rankJobsWithAI(candidateSummary: any, jobs: any[]): Promise<any[]> {
    if (!jobs.length) return [];
    
    const jobsList = jobs.map(j => ({
      id: j.id,
      title: j.title,
      description: j.description?.slice(0, 500),
      skillsRequired: j.skillsRequired
    }));

    const prompt = RANK_JOBS_PROMPT
      .replace("{candidateProfile}", JSON.stringify(candidateSummary))
      .replace("{jobsList}", JSON.stringify(jobsList));

    return aiQueue.run(() => requestWithFallback(["gemini"], async (provider) => {
      const raw = await flashModel!.generateContent(prompt).then(r => r.response.text());
      return JSON.parse(raw);
    }));
  }
};
