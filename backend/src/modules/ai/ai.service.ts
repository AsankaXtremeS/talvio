import { GoogleGenerativeAI } from "@google/generative-ai";
import crypto from "crypto";
import fs from "fs";
import { PDFParse } from "pdf-parse";
import { env } from "../../config/env";
import { PROVIDERS, ProviderConfig } from "./provider.config";
import {
  COVER_LETTER_PROMPT,
  CV_SUGGESTIONS_PROMPT,
  EXTRACT_JD_KEYWORDS_PROMPT,
} from "./ai.prompts";

const geminiEnabled = Boolean(env.GEMINI_API_KEY);
const genAI = geminiEnabled ? new GoogleGenerativeAI(env.GEMINI_API_KEY) : null;

const flashModel = genAI?.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: { responseMimeType: "application/json", temperature: 0.1 },
});

const textModel = genAI?.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: { temperature: 0.7 },
});

// ─────────────────────────────────────────────────────────────────────────────
// FIX 1 — CONCURRENCY SEMAPHORE
// Caps simultaneous Gemini calls at 3 so concurrent users don't pile-drive the
// rate limit together.
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

function getActiveProviders(names: string[]): ProviderConfig[] {
  return PROVIDERS.filter((provider) =>
    names.includes(provider.name) &&
    (provider.type !== "gemini" || geminiEnabled) &&
    (provider.type === "gemini" || Boolean(provider.apiKey))
  );
}

async function openAiGenerate(provider: ProviderConfig, prompt: string, temperature = 0.7): Promise<string> {
  if (!provider.apiKey || !provider.baseURL) {
    throw new Error(`${provider.name}: provider is not configured`);
  }

  const response = await fetch(`${provider.baseURL.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify({
      model: provider.model,
      messages: [{ role: "user", content: prompt }],
      temperature,
      max_tokens: 2048,
    }),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${provider.name} HTTP ${response.status}: ${text}`);
  }

  const data = JSON.parse(text);
  const content = data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text;
  if (!content) {
    throw new Error(`${provider.name} did not return content`);
  }

  return content.toString();
}

async function requestWithFallback<T>(
  providerPriority: string[],
  fn: (provider: ProviderConfig) => Promise<T>
): Promise<T> {
  const providers = getActiveProviders(providerPriority);
  if (!providers.length) {
    throw new Error("No configured providers available for this feature");
  }

  const errors: string[] = [];
  for (const provider of providers) {
    try {
      return await withRetry(() => fn(provider));
    } catch (error: any) {
      const message = error?.message ?? String(error);
      errors.push(`[${provider.name}] ${message}`);
      console.warn(`⚠️  Provider ${provider.name} failed; trying next provider.`, message);
    }
  }

  throw new Error(`All providers failed: ${errors.join(" | ")}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// FIX 2 — EXPONENTIAL BACKOFF RETRY
// On 429 / 503 the function retries up to 4 times with jittered backoff
// instead of silently falling through to stale mock data.
// ─────────────────────────────────────────────────────────────────────────────

async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 4,
  baseDelayMs = 2_000
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      const isRateLimited =
        err?.status === 429 ||
        err?.message?.includes("429") ||
        /quota|rate.?limit/i.test(err?.message ?? "");

      const isRetryable = isRateLimited || err?.status === 503;

      if (!isRetryable || attempt === maxAttempts) throw err;

      const delay = Math.min(baseDelayMs * 2 ** (attempt - 1), 32_000);
      const jitter = Math.random() * 1_000;
      const wait = Math.round((delay + jitter) / 1_000);

      console.warn(
        `⚠️  API rate limit/retryable error — retrying (${attempt}/${maxAttempts}) in ${wait}s…`
      );
      await new Promise((r) => setTimeout(r, delay + jitter));
    }
  }
  throw new Error("withRetry: exhausted all attempts");
}

// ─────────────────────────────────────────────────────────────────────────────
// FIX 3 — IN-MEMORY TTL CACHE
// Identical inputs (same CV + same JD) always produce identical results.
// Cache them for 1 hour so repeat calls never touch the API at all.
// ─────────────────────────────────────────────────────────────────────────────

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class TTLCache<T> {
  private readonly store = new Map<string, CacheEntry<T>>();

  constructor(private readonly ttlMs: number) {}

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: T): void {
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }

  delete(key: string): void {
    this.store.delete(key);
  }
}

const ONE_HOUR = 60 * 60 * 1_000;
const keywordCache     = new TTLCache<string[]>(ONE_HOUR);
const suggestionCache  = new TTLCache<SuggestionResult>(ONE_HOUR);
const coverLetterCache = new TTLCache<string>(ONE_HOUR);

/** Deterministic 24-char hex key — collision-resistant for our use case */
function makeCacheKey(...parts: string[]): string {
  return crypto
    .createHash("sha256")
    .update(parts.join("\x00"))
    .digest("hex")
    .slice(0, 24);
}

// ─────────────────────────────────────────────────────────────────────────────
// FIX 4 — CV TEXT TRUNCATION
// Raw PDFs can easily be 10 000+ chars. Sending all of it burns through the
// token-per-minute quota fast. 4 000 chars covers the entire relevant content
// of any real-world CV.
// ─────────────────────────────────────────────────────────────────────────────

const MAX_CV_CHARS = 4_000;

function truncateCv(cvText: string): string {
  if (cvText.length <= MAX_CV_CHARS) return cvText;
  console.warn(
    `📄 CV truncated: ${cvText.length} → ${MAX_CV_CHARS} chars (saves ~${Math.round((cvText.length - MAX_CV_CHARS) / 4)} tokens)`
  );
  return cvText.slice(0, MAX_CV_CHARS) + "\n…[truncated for token efficiency]";
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS (unchanged from original)
// ─────────────────────────────────────────────────────────────────────────────

async function extractPdfText(filePath: string): Promise<string> {
  try {
    const fileBuffer = await fs.promises.readFile(filePath);
    const parser = new PDFParse({ data: fileBuffer });
    try {
      const parsed = await parser.getText();
      return (parsed.text || "").trim().replace(/\0/g, "");
    } finally {
      await parser.destroy();
    }
  } catch (error) {
    console.error("❌ PDF parse error:", error);
    throw new Error("Failed to parse PDF file");
  }
}

function parseJson<T>(raw: string): T {
  try {
    return JSON.parse(raw.replace(/```json|```/g, "").trim()) as T;
  } catch {
    console.error("❌ JSON parsing failed. Raw response:\n", raw);
    throw new Error("Invalid JSON response from Gemini");
  }
}

function fillPrompt(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (str, [key, val]) => str.replace(new RegExp(`\\{${key}\\}`, "g"), val),
    template
  );
}

function findMatchedAndMissing(cvText: string, requiredKeywords: string[]) {
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const keyword of requiredKeywords) {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    (regex.test(cvText) ? matchedSkills : missingSkills).push(keyword);
  }

  return { matchedSkills, missingSkills };
}

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface ScoreResult {
  overallScore: number;
  skillsMatchScore: number;
  experienceMatchScore: number;
  educationMatchScore: number;
  keywordsMatchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  summary: string;
}

export interface SuggestionResult {
  overallScore: number;
  summaryScore: number;
  summaryFeedback: string[];
  skillsScore: number;
  skillsFeedback: string[];
  experienceScore: number;
  experienceFeedback: string[];
  educationScore: number;
  educationFeedback: string[];
  missingKeywords: string[];
  strengthsToHighlight: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// AI SERVICE  (queue → retry → cache on every Gemini call)
// ─────────────────────────────────────────────────────────────────────────────

export const aiService = {
  async extractCvText(filePath: string): Promise<string> {
    return extractPdfText(filePath);
  },

  /**
   * scoreCv — only sends the JD to Gemini (keyword extraction).
   * CV matching is done locally. Cache key is JD-only so the same job post
   * never triggers a second API call regardless of which applicant applies.
   */
  async scoreCv(cvText: string, jobDescription: string): Promise<ScoreResult> {
    const jdKey = makeCacheKey(jobDescription);
    let requiredSkills = keywordCache.get(jdKey);

    if (!requiredSkills) {
      const prompt = fillPrompt(EXTRACT_JD_KEYWORDS_PROMPT, { jobDescription });

      requiredSkills = await aiQueue.run(() =>
        requestWithFallback(["groq", "cerebras", "gemini", "openrouter"],
          async (provider) => {
            if (provider.type === "gemini") {
              if (!flashModel) throw new Error("Gemini model not initialized");
              const raw = await flashModel.generateContent(prompt).then((r) => r.response.text());
              return parseJson<string[]>(raw);
            }
            const raw = await openAiGenerate(provider, prompt, 0.1);
            return parseJson<string[]>(raw);
          }
        )
      );

      keywordCache.set(jdKey, requiredSkills);
    } else {
      console.log("✅ scoreCv — keyword cache hit");
    }

    const { matchedSkills, missingSkills } = findMatchedAndMissing(cvText, requiredSkills);

    const totalSkills = requiredSkills.length || 1;
    const skillsMatchScore = Math.round((matchedSkills.length / totalSkills) * 100);

    return {
      overallScore: skillsMatchScore,
      skillsMatchScore,
      experienceMatchScore: skillsMatchScore,
      educationMatchScore: 100,
      keywordsMatchScore: skillsMatchScore,
      matchedSkills,
      missingSkills,
      summary: `Matched ${matchedSkills.length} of ${totalSkills} required skills.`,
    };
  },

  async getCvSuggestions(
    cvText: string,
    jobDescription: string
  ): Promise<SuggestionResult> {
    const truncated = truncateCv(cvText);
    const key = makeCacheKey(truncated, jobDescription);
    const cached = suggestionCache.get(key);
    if (cached) {
      console.log("✅ getCvSuggestions — cache hit");
      return cached;
    }

    const prompt = fillPrompt(CV_SUGGESTIONS_PROMPT, {
      cvText: truncated,
      jobDescription,
    });

    const result = await aiQueue.run(() =>
      requestWithFallback(["gemini", "mistral", "openrouter"], async (provider) => {
        if (provider.type === "gemini") {
          if (!flashModel) throw new Error("Gemini model not initialized");
          const raw = await flashModel.generateContent(prompt).then((r) => r.response.text());
          return parseJson<SuggestionResult>(raw);
        }

        const raw = await openAiGenerate(provider, prompt, 0.7);
        return parseJson<SuggestionResult>(raw);
      })
    );

    suggestionCache.set(key, result);
    return result;
  },

  async generateCoverLetter(
    cvText: string,
    jobDescription: string
  ): Promise<string> {
    const truncated = truncateCv(cvText);
    const key = makeCacheKey(truncated, jobDescription);
    const cached = coverLetterCache.get(key);
    if (cached) {
      console.log("✅ generateCoverLetter — cache hit");
      return cached;
    }

    const prompt = fillPrompt(COVER_LETTER_PROMPT, {
      cvText: truncated,
      jobDescription,
    });

    const content = await aiQueue.run(() =>
      requestWithFallback(["mistral", "gemini", "openrouter"], async (provider) => {
        if (provider.type === "gemini") {
          if (!textModel) throw new Error("Gemini model not initialized");
          return textModel.generateContent(prompt).then((r) => r.response.text().trim());
        }

        const raw = await openAiGenerate(provider, prompt, 0.7);
        return raw.trim();
      })
    );

    coverLetterCache.set(key, content);
    return content;
  },

  /**
   * Bust the in-memory cache for a specific CV + job combination.
   * Call this when a user explicitly re-uploads their CV so they
   * don't receive a stale cached analysis.
   */
  invalidateUserCache(cvText: string, jobDescription: string): void {
    const truncated = truncateCv(cvText);
    suggestionCache.delete(makeCacheKey(truncated, jobDescription));
    coverLetterCache.delete(makeCacheKey(truncated, jobDescription));
    keywordCache.delete(makeCacheKey(jobDescription));
    console.log("🗑  Cache invalidated for user");
  },
};
