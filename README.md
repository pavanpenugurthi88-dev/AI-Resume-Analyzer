# 🤖 ResumeAI Pro — AI Resume Analyzer + ATS + Interview Coach

A full-stack AI-powered career platform that helps job seekers analyze their resumes, check ATS compatibility, identify skill gaps, practice mock interviews, and receive personalized learning roadmaps.

[![Tech Stack](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript%20%2B%20Tailwind-blue)](.)
[![Backend](https://img.shields.io/badge/Backend-Python%20%2B%20FastAPI-green)](.)
[![AI](https://img.shields.io/badge/AI-Google%20Gemini%20%2B%20Sentence%20Transformers-orange)](.)

---

## ✨ Features

| Module | Description |
|--------|-------------|
| 📄 **Resume Parser** | Extracts name, email, phone, skills, education, experience using spaCy + regex |
| 🎯 **ATS Scorer** | Multi-factor scoring: keyword overlap, semantic similarity, skill match |
| 🔍 **Skill Gap Analysis** | Visual comparison of your skills vs job requirements |
| 🤖 **AI Suggestions** | Gemini-powered resume improvement tips with before/after examples |
| ✍️ **Grammar Checker** | LanguageTool integration for grammar and spelling issues |
| 🎤 **Interview Coach** | AI-generated technical, behavioral, HR, and project questions |
| 💬 **Mock Interview** | Text-based mock interview with answer evaluation and scoring |
| 🗺️ **Learning Roadmap** | Week-by-week skill development plan for missing skills |
| 📊 **Analytics Dashboard** | Charts for ATS scores, skill match, interview readiness |
| 📝 **Resume Builder** | ATS-friendly templates with PDF export |

---

## 🏗️ Tech Stack

### Frontend
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS v3** — Utility-first styling
- **Framer Motion** — Smooth animations
- **Recharts** — Charts and data visualization
- **React Router DOM** — Client-side routing
- **Zustand** — Global state management
- **Firebase** — Authentication (Google + Email)

### Backend
- **Python 3.11+** + **FastAPI** — Async REST API
- **spaCy** — NLP for resume parsing
- **Sentence Transformers** (all-MiniLM-L6-v2) — Semantic similarity
- **scikit-learn** — TF-IDF keyword scoring
- **Google Gemini API** — AI suggestions + interview questions
- **PyMuPDF** + **python-docx** — File text extraction
- **LanguageTool** — Grammar checking

### Database & Auth
- **Supabase** (PostgreSQL) — Database
- **Firebase Authentication** — User auth
- **Supabase Storage** — File storage (production)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- pip

### 1. Clone & Setup

```bash
# Frontend
cd frontend
npm install
cp .env.example .env.local
# Fill in your Firebase config in .env.local

# Backend
cd backend
pip install -r requirements.txt
python -m spacy download en_core_web_sm
cp .env.example .env
# Fill in your Gemini API key in .env
```

### 2. Configure Environment Variables

**Frontend** (`frontend/.env.local`):
```env
VITE_API_URL=http://localhost:8000/api
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
# ... (see .env.example for all fields)
```

**Backend** (`backend/.env`):
```env
GEMINI_API_KEY=your_gemini_api_key    # Get from aistudio.google.com
SUPABASE_URL=https://xxx.supabase.co  # From supabase.com
SUPABASE_SERVICE_ROLE_KEY=xxx
```

### 3. Run Development Servers

```bash
# Terminal 1 - Backend
cd backend
uvicorn main:app --reload --port 8000

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

Open **http://localhost:5173** 🎉

> **Demo Mode**: The app works without any API keys configured! Use "Continue as Demo" on the login page. Gemini features will use helpful fallback responses.

---

## 📁 Project Structure

```
AI-Resume-Analyzer/
├── frontend/                    # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Layout.tsx       # App shell with sidebar
│   │   │   └── ProtectedRoute.tsx
│   │   ├── pages/               # Route-level pages
│   │   │   ├── LandingPage.tsx
│   │   │   ├── AuthPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── AnalyzePage.tsx
│   │   │   ├── ResultsPage.tsx
│   │   │   ├── InterviewPage.tsx
│   │   │   ├── RoadmapPage.tsx
│   │   │   └── BuilderPage.tsx
│   │   ├── services/
│   │   │   ├── api.ts           # All API calls
│   │   │   └── firebase.ts      # Firebase auth
│   │   ├── store/
│   │   │   ├── authStore.ts     # Auth state (Zustand)
│   │   │   └── appStore.ts      # App state (Zustand)
│   │   └── types/index.ts       # TypeScript interfaces
│   ├── tailwind.config.js
│   └── .env.local
│
├── backend/                     # Python + FastAPI
│   ├── app/
│   │   ├── routes/              # API endpoints
│   │   │   ├── auth.py
│   │   │   ├── resume.py
│   │   │   ├── ats.py
│   │   │   ├── interview.py
│   │   │   └── dashboard.py
│   │   ├── services/            # Business logic
│   │   │   ├── resume_parser.py
│   │   │   ├── ats_scorer.py
│   │   │   ├── suggestions.py
│   │   │   ├── interview_coach.py
│   │   │   ├── grammar_checker.py
│   │   │   └── file_extractor.py
│   │   ├── models/schemas.py    # Pydantic models
│   │   └── database/            # Supabase client
│   ├── main.py
│   └── requirements.txt
│
└── database/schema.sql          # PostgreSQL schema
```

---

## 🔑 Getting API Keys

### Google Gemini (Free)
1. Go to [aistudio.google.com](https://aistudio.google.com/)
2. Sign in with Google
3. Click "Get API Key" → Create API key
4. Add to `backend/.env` as `GEMINI_API_KEY`

### Supabase (Free tier)
1. Go to [supabase.com](https://supabase.com/) → New Project
2. Go to Project Settings → API
3. Copy **URL** and **service_role** key
4. Run `database/schema.sql` in Supabase SQL Editor

### Firebase (Free)
1. Go to [console.firebase.google.com](https://console.firebase.google.com/)
2. New Project → Add Web App
3. Copy firebaseConfig → paste in `frontend/.env.local`
4. Enable Email/Password and Google auth in Firebase Console

---

## 🚢 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Deploy to Vercel: vercel --prod
```

### Backend (Render)
- Connect GitHub repo to Render
- Set environment: Python 3.11
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Add all env vars in Render dashboard

---

## 🧪 Running Tests

```bash
# Backend
cd backend
pytest tests/ -v

# Frontend
cd frontend
npm run test
```

---

## 🗺️ Future Enhancements

- [ ] Voice-based mock interview (Web Speech API)
- [ ] LinkedIn profile import
- [ ] GitHub portfolio analysis
- [ ] OCR for scanned PDF resumes
- [ ] Multi-language support
- [ ] AI cover letter generation
- [ ] Recruiter dashboard
- [ ] Real-time coding interview integration
- [ ] Job recommendations engine

---

## 📄 License

MIT License — feel free to use this for your portfolio!

---

Built with ❤️ using React, FastAPI, and Google Gemini AI
