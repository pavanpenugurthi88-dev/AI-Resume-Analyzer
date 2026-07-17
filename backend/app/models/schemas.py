"""
Pydantic Schemas / Models for request and response validation
"""

from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime


# ============================================================
# AUTH SCHEMAS
# ============================================================
class UserCreate(BaseModel):
    firebase_uid: str
    email: EmailStr
    display_name: Optional[str] = None
    photo_url: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    firebase_uid: str
    email: str
    display_name: Optional[str]
    photo_url: Optional[str]
    created_at: datetime


# ============================================================
# RESUME SCHEMAS
# ============================================================
class ExtractedResume(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    skills: List[str] = []
    education: List[Dict[str, Any]] = []
    experience: List[Dict[str, Any]] = []
    projects: List[Dict[str, Any]] = []
    certifications: List[str] = []
    summary: Optional[str] = None
    years_of_experience: Optional[float] = None


class ResumeResponse(BaseModel):
    id: str
    user_id: str
    file_name: str
    extracted_data: ExtractedResume
    raw_text: str
    created_at: datetime


# ============================================================
# JOB DESCRIPTION SCHEMAS
# ============================================================
class JobDescriptionCreate(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    content: str


class JobDescriptionResponse(BaseModel):
    id: str
    user_id: str
    title: Optional[str]
    company: Optional[str]
    content: str
    extracted_keywords: List[str]
    required_skills: List[str]
    created_at: datetime


# ============================================================
# ATS SCHEMAS
# ============================================================
class ATSRequest(BaseModel):
    resume_id: str
    jd_id: str


class SkillMatch(BaseModel):
    skill: str
    matched: bool
    similarity: Optional[float] = None


class ImprovementSuggestion(BaseModel):
    category: str  # "keyword", "action_verb", "quantify", "formatting", "skill"
    priority: str  # "high", "medium", "low"
    issue: str
    suggestion: str
    before_example: Optional[str] = None
    after_example: Optional[str] = None


class ScoreBreakdown(BaseModel):
    keyword_score: float
    semantic_score: float
    skill_score: float
    experience_score: float
    education_score: float
    overall_score: float


class ATSResultResponse(BaseModel):
    id: str
    resume_id: str
    jd_id: str
    score_breakdown: ScoreBreakdown
    matched_skills: List[str]
    missing_skills: List[str]
    skill_matches: List[SkillMatch]
    improvement_suggestions: List[ImprovementSuggestion]
    grammar_issues: List[Dict[str, Any]]
    rewritten_summary: Optional[str]
    created_at: datetime


# ============================================================
# INTERVIEW SCHEMAS
# ============================================================
class InterviewQuestion(BaseModel):
    id: int
    question: str
    category: str  # technical, behavioral, hr, project
    difficulty: str  # easy, medium, hard
    expected_keywords: List[str] = []


class InterviewAnswer(BaseModel):
    question_id: int
    answer: str


class AnswerEvaluation(BaseModel):
    question_id: int
    score: float
    feedback: str
    strengths: List[str]
    improvements: List[str]
    keyword_coverage: float


class SessionScores(BaseModel):
    communication: float
    confidence: float
    technical: float
    grammar: float
    overall: float


class InterviewSessionResponse(BaseModel):
    id: str
    user_id: str
    questions: List[InterviewQuestion]
    answers: List[AnswerEvaluation]
    scores: Optional[SessionScores]
    status: str
    created_at: datetime


# ============================================================
# LEARNING PLAN SCHEMAS
# ============================================================
class WeeklyTopic(BaseModel):
    week: int
    skill: str
    topics: List[str]
    resources: List[Dict[str, str]]  # [{title, url, type}]
    estimated_hours: int


class LearningPlanResponse(BaseModel):
    id: str
    user_id: str
    missing_skills: List[str]
    roadmap: List[WeeklyTopic]
    total_weeks: int
    created_at: datetime


# ============================================================
# DASHBOARD SCHEMAS
# ============================================================
class DashboardStats(BaseModel):
    total_resumes: int
    total_analyses: int
    average_ats_score: float
    best_ats_score: float
    total_interview_sessions: int
    skills_matched_percent: float
    interview_readiness: float


class RecentActivity(BaseModel):
    id: str
    type: str  # "resume_upload", "ats_analysis", "interview"
    title: str
    score: Optional[float]
    created_at: datetime


# ============================================================
# USER SETTINGS SCHEMAS
# ============================================================
class UserSettingsUpdateRequest(BaseModel):
    theme: Optional[str] = "dark" # "light" or "dark" (morning / midnight)
    selected_provider: Optional[str] = "openrouter" # "openrouter", "gemini", "openai", "mistral", "grok", "ollama"
    selected_model: Optional[str] = "google/gemini-2.5-flash"
    api_keys: Optional[Dict[str, str]] = {}


class UserSettingsResponse(BaseModel):
    user_id: str
    theme: str
    selected_provider: str
    selected_model: str
    api_keys: Dict[str, str]
    updated_at: datetime


# ============================================================
# AI CHAT SCHEMAS
# ============================================================
class ChatMessage(BaseModel):
    sender: str  # "user" or "ai"
    content: str
    timestamp: datetime = datetime.now()


class ChatSessionCreate(BaseModel):
    title: Optional[str] = "New Career Conversation"


class ChatSessionResponse(BaseModel):
    id: str
    user_id: str
    title: str
    messages: List[ChatMessage]
    created_at: datetime
    updated_at: datetime


class ChatSendMessageRequest(BaseModel):
    session_id: str
    message: str
    resume_id: Optional[str] = None
    interview_session_id: Optional[str] = None


# ============================================================
# JOB APPLICATION TRACKER SCHEMAS
# ============================================================
class JobApplicationCreate(BaseModel):
    company: str
    role: str
    status: str  # "wishlist", "applied", "interviewing", "offer", "rejected"
    priority: Optional[str] = "medium"  # "low", "medium", "high"
    deadline: Optional[str] = None
    notes: Optional[str] = ""


class JobApplicationResponse(BaseModel):
    id: str
    user_id: str
    company: str
    role: str
    status: str
    priority: str
    deadline: Optional[str]
    notes: str
    created_at: datetime
    updated_at: datetime


# ============================================================
# ADMIN ANALYTICS & LOG SCHEMAS
# ============================================================
class AdminAnalyticsResponse(BaseModel):
    total_users: int
    total_api_calls: int
    provider_distribution: Dict[str, int]
    avg_response_time_ms: float
    monthly_cost_est: float
    system_status: str
    model_settings: Dict[str, Any]

