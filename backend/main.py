"""
AI Resume Analyzer + ATS + Interview Coach
FastAPI Backend - Main Application Entry Point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from pathlib import Path

from app.config import settings
from app.routes import resume, ats, interview, dashboard, auth, settings as settings_route, chat, tracker, admin

# Create uploads directory
Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)

app = FastAPI(
    title="AI Resume Analyzer API",
    description="Full-featured resume analysis, ATS scoring, and interview coaching API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files (uploads)
if os.path.exists(settings.UPLOAD_DIR):
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(resume.router, prefix="/api/resume", tags=["Resume"])
app.include_router(ats.router, prefix="/api/ats", tags=["ATS Analysis"])
app.include_router(interview.router, prefix="/api/interview", tags=["Interview Coach"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(settings_route.router, prefix="/api/settings", tags=["UserSettings"])
app.include_router(chat.router, prefix="/api/chat", tags=["AIChat"])
app.include_router(tracker.router, prefix="/api/tracker", tags=["JobTracker"])
app.include_router(admin.router, prefix="/api/admin", tags=["AdminDashboard"])


@app.on_event("startup")
async def startup_event():
    # Preload sentence transformer model synchronously at startup
    from app.services.ats_scorer import ats_scorer
    try:
        print("Preloading SentenceTransformer model synchronously...")
        ats_scorer._get_embedding_model()
        print("SentenceTransformer model preloaded successfully.")
    except Exception as e:
        print(f"Failed to preload SentenceTransformer model: {e}")



@app.get("/api/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "AI Resume Analyzer API",
        "version": "1.0.0"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.APP_HOST,
        port=settings.APP_PORT,
        reload=True
    )
