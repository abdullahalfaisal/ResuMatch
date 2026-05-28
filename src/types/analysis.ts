export interface AnalysisResult {
  score: number;
  band: "Excellent Match" | "Good Match" | "Moderate Match" | "Poor Match";
  subScores: {
    skillsMatch: number;
    experienceRelevance: number;
    keywordCoverage: number;
    overallAlignment: number;
  };
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  weakAreas: string[];
  scoreExplanation: string;
  improvementTips: string[];
  confidenceWarning: boolean;
  parseRate: number;
}
