export interface User {
  id: string;
  email: string;
  displayName: string | null;
  photoURL?: string | null;
}

export interface ExtractedResume {
  name: string | null;
  email: string | null;
  phone: string | null;
  skills: string[];
  education: Array<{ degree: string; institution: string; year: string }>;
  experience: Array<{ title: string; company: string; dates: string; description: string }>;
  projects: Array<{ name: string; description: string; tech_stack: string[] }>;
  certifications: string[];
  summary: string | null;
  years_of_experience: number;
}

export interface Resume {
  id: string;
  fileName: string;
  extractedData: ExtractedResume;
  rawText: string;
  createdAt: string;
}

export interface ScoreBreakdown {
  overallScore: number;
  keywordScore: number;
  semanticScore: number;
  skillScore: number;
  experienceScore: number;
  educationScore: number;
  grammarScore: number;
}

export interface ImprovementSuggestion {
  category: string;
  priority: 'high' | 'medium' | 'low';
  issue: string;
  suggestion: string;
  before_example?: string;
  after_example?: string;
}

export interface GrammarIssue {
  message: string;
  context: string;
  replacements: string[];
  flagged_text?: string;
}

export interface ATSResult {
  id: string;
  resumeId: string;
  jdTitle?: string;
  jdCompany?: string;
  scoreBreakdown: ScoreBreakdown;
  matchedSkills: string[];
  missingSkills: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
  improvementSuggestions: ImprovementSuggestion[];
  grammarIssues: GrammarIssue[];
  rewrittenSummary: string;
  atsTips: string[];
  grammarScore: number;
}

export interface InterviewQuestion {
  id: number;
  question: string;
  category: 'technical' | 'behavioral' | 'hr' | 'project';
  difficulty: 'easy' | 'medium' | 'hard';
  expectedKeywords: string[];
}

export interface AnswerEvaluation {
  question_id: number;
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  keyword_coverage: number;
  communication_score: number;
  confidence_score: number;
  technical_accuracy: number;
}

export interface SessionScores {
  communication: number;
  confidence: number;
  technical: number;
  grammar: number;
  overall: number;
}

export interface InterviewSession {
  id: string;
  questions: InterviewQuestion[];
  answers: AnswerEvaluation[];
  scores?: SessionScores;
  status: 'in_progress' | 'completed';
}

export interface DashboardStats {
  totalResumes: number;
  totalAnalyses: number;
  averageAtsScore: number;
  bestAtsScore: number;
  totalInterviewSessions: number;
  skillsMatchedPercent: number;
  interviewReadiness: number;
  recentScores: number[];
}

export interface WeeklyTopic {
  week: number;
  skill: string;
  topics: string[];
  resources: Array<{ title: string; url: string; type: string }>;
  estimated_hours: number;
}
