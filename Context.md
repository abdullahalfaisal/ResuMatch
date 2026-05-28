# ATS Resume Analyzer — Full Product Requirements Document (MVP)

> Version 1.0 | Status: Ready for Development

---

## 1. Project Overview

An AI-powered, stateless web application that allows job seekers to analyze their resume against a job description and receive a detailed ATS (Applicant Tracking System) compatibility report — instantly, with no login required.

The goal is to help candidates optimize their CV/resume before submitting to recruiters, by simulating how a real ATS system would score and evaluate the document.

---

## 2. Core Principles

| Principle | Decision |
|---|---|
| Auth required | ❌ None — fully public |
| Session persistence | ❌ None — each check is fresh |
| File storage | ❌ None — parse and discard |
| Database | ❌ None for MVP |
| Target user | Job seekers |
| Output format | On-screen only — no downloads |
| AI Provider | Google Gemini API (free tier) |

---

## 3. Features (MVP Scope)

### 3.1 Resume Upload
- Accepted formats: **PDF**, **DOCX** (text-based only)
- Max file size: **4MB**
- Frontend validation: file type + size before upload
- Backend validation: re-validate on server side
- Text extraction:
  - PDF → `pdf-parse`
  - DOCX → `mammoth.js`
- Reject conditions:
  - File larger than 4MB
  - Unsupported file type
  - Extracted text is empty or fewer than 100 characters (scanned/image-based PDF)
  - Corrupted or unreadable file
- On rejection: show a clear, specific inline error message (not a generic alert)

### 3.2 Job Description Input
- Plain text `<textarea>` input — no file upload
- Minimum character count: **100 characters** (validated before submission)
- No formatting required — raw paste from any job board

### 3.3 Resume Text Extraction & Parsing
Extract raw text and identify the following sections (best-effort, not strict):
- Skills (technical + soft)
- Work Experience (titles, duration, responsibilities)
- Projects
- Education
- Certifications (if present)

Parsing is done implicitly by the AI — no separate NLP pipeline needed for MVP.

### 3.4 AI Matching Engine (Google Gemini)
Send structured prompt to Gemini API containing:
- Extracted resume text
- Raw job description text
- Instruction to return structured JSON output

AI performs:
- Semantic skill matching (not just keyword search)
- Experience relevance evaluation
- Job requirement alignment check
- Missing skill detection
- Tone and clarity assessment of resume content

### 3.5 ATS Scoring System
Score out of **100**, weighted as follows:

| Factor | Weight |
|---|---|
| Skills match | 40% |
| Experience relevance | 30% |
| Keyword coverage | 20% |
| Overall alignment | 10% |

Score bands for UI display:

| Score | Label | Color |
|---|---|---|
| 80–100 | Excellent Match | Green |
| 60–79 | Good Match | Blue |
| 40–59 | Moderate Match | Yellow/Amber |
| 0–39 | Poor Match | Red |

### 3.6 Output Report (On-Screen)
Single-page results view with all sections expanded:

1. **ATS Score** — Large circular/arc score display with label
2. **Score Breakdown** — Visual bar showing weighted sub-scores
3. **Matched Skills** — Green-tagged list of skills found in both resume and JD
4. **Missing Skills** — Red-tagged list of skills in JD but absent from resume
5. **Strengths** — Bullet list of what the resume does well against this JD
6. **Weak Areas** — Bullet list of gaps or under-represented areas
7. **Score Explanation** — 2–3 sentence AI-generated plain-language summary of why this score was given
8. **Improvement Tips** — 3–5 actionable suggestions to improve the resume for this specific JD

### 3.7 Confidence Notice
If the JD is very short (under 200 chars) or resume text is thin (under 300 chars after extraction), display a soft warning:
> "⚠️ Limited content detected — results may be less accurate than usual."

---

## 4. User Flow

```
[Landing Page]
     │
     ▼
[Step 1] Upload Resume (PDF or DOCX, max 4MB)
     │
     ├── ❌ Invalid file → Show inline error, stay on page
     │
     ▼
[Step 2] Paste Job Description into textarea
     │
     ├── ❌ Too short → Show inline validation message
     │
     ▼
[Click "Analyze Resume" Button]
     │
     ▼
[Loading Screen — Step Labels]
  → "Uploading your resume..."
  → "Parsing document..."
  → "Analyzing against job description..."
  → "Calculating ATS score..."
     │
     ▼
[Results Page — Single Page, All Sections Expanded]
  → ATS Score (with band label)
  → Score Breakdown
  → Matched Skills
  → Missing Skills
  → Strengths
  → Weak Areas
  → Score Explanation
  → Improvement Tips
     │
     ▼
["Analyze Another Resume" Button]
  → Resets entire form, returns to landing page (fresh session)
```

---

## 5. System Architecture

### 5.1 High-Level Flow

```
Frontend (Next.js)
     │
     │  multipart/form-data (resume file + JD text)
     ▼
API Route: /api/analyze
     │
     ├── Validate file (type, size)
     ├── Extract text (pdf-parse / mammoth)
     ├── Validate extracted text length
     ├── Build Gemini prompt
     ├── Call Gemini API
     ├── Parse JSON response
     └── Return structured result
     │
     ▼
Frontend renders result on same page
```

### 5.2 API Route: `/api/analyze`

**Method:** `POST`  
**Content-Type:** `multipart/form-data`

**Inputs:**
- `resume` — file (PDF or DOCX)
- `jobDescription` — string

**Output (JSON):**
```json
{
  "score": 74,
  "band": "Good Match",
  "subScores": {
    "skillsMatch": 28,
    "experienceRelevance": 22,
    "keywordCoverage": 15,
    "overallAlignment": 9
  },
  "matchedSkills": ["React", "TypeScript", "REST APIs"],
  "missingSkills": ["Docker", "GraphQL", "CI/CD"],
  "strengths": ["Strong frontend experience", "Relevant project portfolio"],
  "weakAreas": ["No mention of cloud platforms", "Missing DevOps keywords"],
  "scoreExplanation": "Your resume shows strong alignment with the core frontend requirements but lacks DevOps and infrastructure keywords that appear prominently in this JD.",
  "improvementTips": [
    "Add Docker and containerization experience if applicable",
    "Mention any CI/CD tools you have used (GitHub Actions, Jenkins, etc.)",
    "Include any cloud platform experience (AWS, GCP, Azure)"
  ],
  "confidenceWarning": false
}
```

---

## 6. Tech Stack

### 6.1 Frontend
| Tool | Purpose |
|---|---|
| Next.js 14 (App Router) | React framework + routing |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| shadcn/ui | UI components (buttons, cards, badges, progress bars) |

### 6.2 Backend
| Tool | Purpose |
|---|---|
| Next.js API Routes | Serverless backend — no separate server needed |
| `pdf-parse` | Extract text from PDF files |
| `mammoth` | Extract text from DOCX files |
| `formidable` or `busboy` | Handle multipart file uploads in API routes |

### 6.3 AI
| Tool | Purpose |
|---|---|
| Google Gemini API (`gemini-1.5-flash`) | Resume vs JD analysis + scoring |
| `@google/generative-ai` (official SDK) | API calls from Node.js |

> **Why `gemini-1.5-flash`?** It has the most generous free tier (15 RPM, 1 million tokens/day as of 2025), strong reasoning capability, and fast response times. No billing required for the free tier.

### 6.4 Hosting
| Tool | Purpose |
|---|---|
| Vercel | Frontend + API route deployment (free tier sufficient for MVP) |

### 6.5 Not Needed for MVP
- ❌ Database (Supabase, Neon, etc.)
- ❌ File storage (UploadThing, Vercel Blob)
- ❌ Auth (NextAuth, Clerk, etc.)
- ❌ Email service
- ❌ OpenAI API

---

## 7. AI Prompt Strategy

### 7.1 Gemini Prompt Structure

The prompt is built server-side and sent as a single user message. The model is instructed to return **only valid JSON** — no markdown, no explanation outside the JSON block.

**System instruction (passed via `systemInstruction` in Gemini SDK):**
```
You are an expert ATS (Applicant Tracking System) analyst. 
Your job is to compare a candidate's resume against a job description and return a precise, structured evaluation.
Always respond with valid JSON only. No markdown. No explanation outside the JSON.
```

**User prompt template:**
```
Analyze the following resume against the job description below.

--- RESUME ---
{extractedResumeText}

--- JOB DESCRIPTION ---
{jobDescriptionText}

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
  "confidenceWarning": <boolean — true if resume or JD seems too short or vague>
}

Scoring weights:
- skillsMatch: 40 points max — semantic skill overlap, not just keyword matching
- experienceRelevance: 30 points max — job titles, years, industry alignment
- keywordCoverage: 20 points max — presence of JD-specific terms and phrases
- overallAlignment: 10 points max — general tone, role seniority, cultural fit signals

Be strict and realistic. A score above 80 should be genuinely rare.
```

### 7.2 Token Limit Handling
- Truncate resume text to **4000 tokens** if it exceeds limit (take first 4000 tokens)
- Truncate JD text to **2000 tokens** if it exceeds limit
- This prevents exceeding Gemini's input window and keeps costs at zero

---

## 8. Validation Rules

### 8.1 Frontend Validation (before API call)
| Rule | Error Message |
|---|---|
| No file selected | "Please upload your resume to continue." |
| Wrong file type | "Only PDF and DOCX files are supported." |
| File over 4MB | "File size exceeds 4MB. Please upload a smaller file." |
| JD empty | "Please paste the job description." |
| JD under 100 chars | "Job description is too short. Please paste the full description." |

### 8.2 Backend Validation (inside API route)
| Rule | Response |
|---|---|
| Wrong MIME type | 400 — "Invalid file type" |
| File over 4MB | 400 — "File too large" |
| Extracted text < 100 chars | 400 — "Resume appears to be image-based or empty. Please upload a text-based PDF or DOCX." |
| Gemini API failure | 500 — "Analysis failed. Please try again." |
| JSON parse failure from AI | 500 — "Could not process AI response. Please try again." |

---

## 9. UI & UX Specification

### 9.1 Landing / Input Page

**Layout:** Centered, clean, single-column on mobile / two-column on desktop

**Components:**
- App name + tagline at top
- **Resume upload zone:** Drag-and-drop area with file icon + "or click to browse" — shows filename after selection
- **Job Description textarea:** Labeled, placeholder text ("Paste the full job description here..."), auto-resize
- **Analyze Resume button:** Full-width, primary CTA — disabled until both inputs are valid
- Inline error messages below each field (not toasts)

### 9.2 Loading Screen

Replaces the form area. Shows:
- Animated spinner or progress bar
- Step labels that cycle through:
  1. "Uploading your resume..."
  2. "Parsing document..."
  3. "Analyzing against job description..."
  4. "Calculating your ATS score..."
- Estimated time note: "This usually takes 5–10 seconds"

Steps cycle every ~2 seconds regardless of actual backend timing (purely UX).

### 9.3 Results Page

**All sections visible on load — no tabs, no accordion collapse.**

Layout from top to bottom:

1. **Score Hero Block**
   - Large circular score indicator (e.g., 74/100)
   - Band label below ("Good Match") in appropriate color
   - Sub-score breakdown: 4 labeled progress bars (Skills, Experience, Keywords, Alignment)

2. **Confidence Warning** (if applicable)
   - Soft amber banner: "⚠️ Limited content detected — results may be less accurate."

3. **Skills Grid** (two columns)
   - Left: ✅ Matched Skills (green badges)
   - Right: ❌ Missing Skills (red badges)

4. **Strengths & Weak Areas** (two columns on desktop, stacked on mobile)
   - Left card: 💪 Strengths (green accent)
   - Right card: ⚠️ Weak Areas (amber accent)

5. **Score Explanation**
   - Plain text block with AI-generated 2–3 sentence reasoning

6. **Improvement Tips**
   - Numbered list, 3–5 actionable suggestions

7. **CTA at bottom**
   - "Analyze Another Resume" button → resets to fresh input page

### 9.4 Responsiveness
- Mobile-first design
- All sections stack to single column on screens under 768px
- Touch-friendly upload area and buttons

### 9.5 Accessibility
- All form fields have labels
- Color is never the sole indicator (use icons + color together)
- ARIA labels on interactive elements
- Keyboard-navigable

---

## 10. Error Handling & Edge Cases

| Scenario | Handling |
|---|---|
| Scanned/image-only PDF | Backend detects empty text, returns 400 with clear message |
| DOCX with only images | Same — mammoth returns empty string |
| Gemini API rate limit hit | Show friendly retry message: "Too many requests — please wait a moment and try again." |
| Gemini returns malformed JSON | Retry once; if fails again, show generic error |
| Network timeout | Show: "Request timed out. Please check your connection and try again." |
| Very short JD (< 100 chars) | Frontend blocks submission before API call |
| Resume with only contact info | Gemini will score very low + confidenceWarning: true |

---

## 11. Environment Variables

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

Store in `.env.local` for development and Vercel environment variables for production. Never expose this key to the frontend.

---

## 12. Project File Structure

```
ats-analyzer/
├── app/
│   ├── page.tsx                  # Landing + input page
│   ├── results/
│   │   └── page.tsx              # Results display page
│   └── layout.tsx
├── components/
│   ├── ResumeUploader.tsx        # Drag-and-drop upload zone
│   ├── JobDescriptionInput.tsx   # Textarea component
│   ├── AnalyzeButton.tsx         # CTA with disabled state
│   ├── LoadingScreen.tsx         # Animated step labels
│   ├── ScoreHero.tsx             # Circular score + sub-scores
│   ├── SkillsGrid.tsx            # Matched / missing skills
│   ├── StrengthsWeaknesses.tsx   # Two-column cards
│   ├── ScoreExplanation.tsx      # AI explanation block
│   └── ImprovementTips.tsx       # Numbered tips list
├── app/api/
│   └── analyze/
│       └── route.ts              # POST handler — core logic
├── lib/
│   ├── extractText.ts            # pdf-parse + mammoth logic
│   ├── buildPrompt.ts            # Gemini prompt builder
│   ├── gemini.ts                 # Gemini SDK wrapper
│   └── validate.ts               # File + input validators
├── types/
│   └── analysis.ts               # TypeScript types for API response
├── public/
├── .env.local
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## 13. Dependencies (package.json)

```json
{
  "dependencies": {
    "next": "^14.x",
    "react": "^18.x",
    "typescript": "^5.x",
    "tailwindcss": "^3.x",
    "@google/generative-ai": "latest",
    "pdf-parse": "^1.1.1",
    "mammoth": "^1.7.x",
    "formidable": "^3.x",
    "shadcn-ui": "latest"
  }
}
```

---

## 14. Out of Scope (MVP)

These are intentionally excluded and can be added in future versions:

- User accounts and auth
- History / past analyses
- Downloadable PDF report
- Resume editor or rewrite suggestions
- Multiple JD comparisons at once
- DOCX file upload for JD
- Admin dashboard
- Analytics tracking
- Email results
- Multilingual support

---

## 15. Future Enhancements (Post-MVP Ideas)

| Feature | Value |
|---|---|
| Side-by-side resume editor | Let user edit resume inline and re-score |
| Resume rewrite suggestions | AI rewrites bullet points to better match JD |
| Compare multiple JDs | Upload one resume, test against 3 JDs |
| Score history (with localStorage) | No backend needed, browser-only |
| Export as PDF report | For sharing with mentors or career coaches |
| Tailored cover letter generator | Use the matched resume + JD to draft a cover letter |

---

## 16. Success Criteria (MVP Done When)

- [ ] User can upload a PDF or DOCX resume
- [ ] User can paste a job description
- [ ] Validation works correctly for all error cases
- [ ] Loading screen displays with step labels
- [ ] Gemini API call succeeds and returns valid JSON
- [ ] Results page shows all 8 sections correctly
- [ ] Score band colors are applied correctly
- [ ] "Analyze Another Resume" resets and returns to input page
- [ ] Fully responsive on mobile
- [ ] Deployed and live on Vercel
- [ ] API key is server-side only — never exposed to client

---

*Document prepared for ATS Resume Analyzer MVP — ready for development handoff.*
