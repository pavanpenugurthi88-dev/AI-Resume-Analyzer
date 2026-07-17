-- ============================================================
-- AI Resume Analyzer + ATS + Interview Coach
-- PostgreSQL Schema (Supabase Compatible)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firebase_uid TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RESUMES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT,
    raw_text TEXT,
    extracted_data JSONB DEFAULT '{}',
    -- extracted_data structure:
    -- { name, email, phone, skills[], education[], experience[], projects[], certifications[] }
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- JOB DESCRIPTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS job_descriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT,
    company TEXT,
    content TEXT NOT NULL,
    extracted_keywords JSONB DEFAULT '[]',
    required_skills JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ATS RESULTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS ats_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE,
    jd_id UUID REFERENCES job_descriptions(id) ON DELETE CASCADE,
    overall_score NUMERIC(5,2) DEFAULT 0,
    keyword_score NUMERIC(5,2) DEFAULT 0,
    semantic_score NUMERIC(5,2) DEFAULT 0,
    skill_score NUMERIC(5,2) DEFAULT 0,
    experience_score NUMERIC(5,2) DEFAULT 0,
    education_score NUMERIC(5,2) DEFAULT 0,
    matched_skills JSONB DEFAULT '[]',
    missing_skills JSONB DEFAULT '[]',
    improvement_suggestions JSONB DEFAULT '[]',
    grammar_issues JSONB DEFAULT '[]',
    rewritten_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INTERVIEW SESSIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS interview_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL,
    jd_id UUID REFERENCES job_descriptions(id) ON DELETE SET NULL,
    session_type TEXT DEFAULT 'mixed', -- technical, behavioral, hr, mixed
    questions JSONB DEFAULT '[]',
    answers JSONB DEFAULT '[]',
    scores JSONB DEFAULT '{}',
    -- scores: { communication, confidence, technical, overall }
    overall_score NUMERIC(5,2) DEFAULT 0,
    status TEXT DEFAULT 'in_progress', -- in_progress, completed
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- ============================================================
-- LEARNING PLANS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS learning_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ats_result_id UUID REFERENCES ats_results(id) ON DELETE SET NULL,
    missing_skills JSONB DEFAULT '[]',
    roadmap JSONB DEFAULT '[]',
    -- roadmap: [{ week: 1, skill: "Docker", topics: [], resources: [] }]
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_jd_user_id ON job_descriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_ats_user_id ON ats_results(user_id);
CREATE INDEX IF NOT EXISTS idx_ats_resume_id ON ats_results(resume_id);
CREATE INDEX IF NOT EXISTS idx_interview_user_id ON interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_user_id ON learning_plans(user_id);

-- ============================================================
-- ROW LEVEL SECURITY (Supabase)
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ats_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_plans ENABLE ROW LEVEL SECURITY;
