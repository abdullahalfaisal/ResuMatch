import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function analyzeResume(resumeText: string, jobDescriptionText: string) {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-flash-lite-latest", // Lite models have a much higher free-tier limit!
    // model: "gemini-2.5-flash",
    systemInstruction: "You are an expert ATS (Applicant Tracking System) analyst. Your job is to compare a candidate's resume against a job description and return a precise, structured evaluation. Always respond with valid JSON only. No markdown. No explanation outside the JSON.",
    generationConfig: {
      temperature: 0,
      topK: 1,
      topP: 0.1,
      responseMimeType: "application/json"
    }
  });

  const prompt = `
Analyze the following resume against the job description below.

--- RESUME ---
${resumeText.substring(0, 16000)}

--- JOB DESCRIPTION ---
${jobDescriptionText.substring(0, 8000)}

Return a JSON object with this exact structure:
{
  "score": <integer 0-100>,
  "band": <"Excellent Match" | "Good Match" | "Moderate Match" | "Poor Match">,
  "subScores": {
    "skillsMatch": <integer 0-40>,
    "experienceRelevance": <integer 0-30>,
    "keywordCoverage": <integer 0-20>,
    "overallAlignment": <integer 0-10>
  },
  "matchedSkills": [<string>, ...],
  "missingSkills": [<string>, ...],
  "strengths": [<string>, ...],
  "weakAreas": [<string>, ...],
  "scoreExplanation": <string, 2-3 sentences>,
  "improvementTips": [<string>, <string>, <string>],
  "confidenceWarning": <boolean — true if resume or JD seems too short or vague>,
  "parseRate": <integer 0-100 — 100 if the resume text is clean with clear sections, lower if text is garbled, unsectioned, or messy>
}

Scoring weights:
- skillsMatch: 40 points max — semantic skill overlap, not just keyword matching
- experienceRelevance: 30 points max — job titles, years, industry alignment
- keywordCoverage: 20 points max — presence of JD-specific terms and phrases
- overallAlignment: 10 points max — general tone, role seniority, cultural fit signals

Be strict and realistic. A score above 80 should be genuinely rare.
`;

  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      const jsonStr = text.replace(/```json\n?|\n?```/g, "").trim();
      return JSON.parse(jsonStr);
    } catch (e: any) {
      lastError = e;
      if (e.message && e.message.includes("503") && attempt < 3) {
        console.warn(`Gemini API 503 error. Retrying attempt ${attempt}...`);
        await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
        continue;
      }
      throw e;
    }
  }

  throw lastError;
}
