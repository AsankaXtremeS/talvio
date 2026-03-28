// ai.prompts.ts
// All Gemini prompt templates for AI hiring features.
// Designed for STRICT, deterministic JSON outputs.

// ─────────────────────────────────────────────────────────────────────────────
// EXTRACT JD KEYWORDS (Replaces the old scoring prompt)
// ─────────────────────────────────────────────────────────────────────────────

export const EXTRACT_JD_KEYWORDS_PROMPT = `
You are an expert HR analyzer. 
Extract the core technical requirements and skills from this Job Description.

Job Description:
{jobDescription}

STRICT RULES:
- Return ONLY a valid JSON array of strings.
- Only include technical skills, tools, and hard requirements (e.g., "Node.js", "AWS", "REST APIs").
- Do NOT include soft skills (e.g., "Teamwork", "Communication").
- Do NOT include explanations, markdown formatting (\`\`\`json), or comments.

Example Output:
["Node.js", "TypeScript", "PostgreSQL", "Prisma", "AWS"]
`;

// ─────────────────────────────────────────────────────────────────────────────
// CV SUGGESTIONS
// ─────────────────────────────────────────────────────────────────────────────

export const CV_SUGGESTIONS_PROMPT = `
You are a strict resume improvement system.

Analyze the CV and return ONLY a valid JSON object.
No explanation, no markdown, no extra text.

Job Description:
{jobDescription}

CV Content:
{cvText}

Return EXACTLY this JSON structure:
{
  "overallScore": 75,
  "summaryScore": 80,
  "summaryFeedback": ["Point 1", "Point 2"],
  "skillsScore": 70,
  "skillsFeedback": ["Point 1", "Point 2"],
  "experienceScore": 60,
  "experienceFeedback": ["Point 1", "Point 2"],
  "educationScore": 90,
  "educationFeedback": ["Point 1", "Point 2"],
  "missingKeywords": ["React", "Node.js"],
  "strengthsToHighlight": ["Strength 1", "Strength 2"]
}

STRICT RULES:
- Output MUST be valid JSON (do not wrap in markdown).
- All scores must be integers between 0 and 100.
- Each feedback array must contain 2–4 UNIQUE, actionable points.
- missingKeywords: max 8 items. ONLY include keywords explicitly in job description but missing in CV.
- strengthsToHighlight: max 4 items. Must be supported by CV content.
`;

// ─────────────────────────────────────────────────────────────────────────────
// COVER LETTER
// ─────────────────────────────────────────────────────────────────────────────

export const COVER_LETTER_PROMPT = `
Write a professional cover letter.

Output plain text only.
Do NOT output JSON or markdown.

Job Description:
{jobDescription}

Candidate CV:
{cvText}

STRICT RULES:
- 150–200 words maximum.
- Exactly 3 short paragraphs.
- Tone: professional, confident, concise.
- Do NOT hallucinate experience or skills not found in the CV.
`;