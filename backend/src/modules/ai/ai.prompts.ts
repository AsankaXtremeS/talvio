// ai.prompts.ts
// Optimized prompts for Talent Matching and Career Advancement.

/**
 * 1. EXTRACT CV SKILLS 
 * Goal: Get a clean, structured list of technical skills from CV text.
 * Used when a profile is created or updated.
 */
export const EXTRACT_CV_SKILLS_PROMPT = `
You are an expert technical recruiter. 
Extract all technical skills, programming languages, frameworks, tools, and certifications from the provided CV text.

CV Text:
{cvText}

STRICT RULES:
- Return ONLY a valid JSON array of strings.
- Normalize names (e.g., "NodeJS" -> "Node.js", "React JS" -> "React").
- Do NOT include soft skills (e.g., "Leadership", "Teamwork").
- Do NOT include explanations or markdown.

Example Output:
["Python", "Django", "PostgreSQL", "AWS", "Docker", "REST API"]
`;

/**
 * 2. COMPREHENSIVE CV ANALYSIS (The "Best Algorithm")
 * Goal: In one single call, evaluate the candidate against the Job Description.
 * Returns: Overall Score, Improvement Suggestions, and a Professional Cover Letter.
 */
export const COMPREHENSIVE_ANALYSIS_PROMPT = `
You are a career growth specialist and a strict hiring manager.
Compare the Candidate's CV with the Job Description and provide a holistic evaluation.

Job Description:
{jobDescription}

Candidate CV:
{cvText}

YOUR TASK:
1. **Overall Match Score**: Calculate a score from 0 to 100. 
   Consider: Technical alignment (60%), Experience relevance (20%), and Career progression (20%). 
   Be realistic and strict.
2. **Improvement Suggestions**: Provide 3-5 specific, actionable points on how the candidate can improve their profile or CV specifically for THIS role. 
   Keep suggestions professional and constructive.
3. **Cover Letter**: Write a high-impact, professional cover letter (approx. 150-200 words, 3 short paragraphs) that effectively sells this candidate's existing strengths to the hiring manager. 
   Do NOT hallucinate skills the candidate does not have.

Return ONLY a valid JSON object with this structure:
{
  "overallScore": number,
  "suggestions": string[],
  "coverLetter": string
}

STRICT RULES:
- Output MUST be valid JSON.
- No markdown formatting (\`\`\`json).
- suggestions must be a flat array of strings.
`;

/**
 * 3. EXTRACT JD KEYWORDS (For fast dashboard matching)
 * Goal: Extract skills from a JD to allow local matching against stored CV skills.
 */
export const EXTRACT_JD_KEYWORDS_PROMPT = `
Extract core technical requirements from this Job Description.

Job Description:
{jobDescription}

Return ONLY a valid JSON array of strings.
Example: ["Java", "Spring Boot", "MySQL"]
`;