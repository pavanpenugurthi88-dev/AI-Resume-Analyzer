"""Interview Coach API routes"""
import uuid
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from app.services.interview_coach import (
    generate_interview_questions,
    evaluate_answer,
    calculate_session_scores,
)
from app.database.mongodb_client import get_mongodb_db

router = APIRouter()


class StartSessionRequest(BaseModel):
    resume_id: str
    jd_text: Optional[str] = ""
    session_type: str = "mixed"
    num_questions: int = 10


class SubmitAnswerRequest(BaseModel):
    session_id: str
    question_id: int
    question_text: str
    answer: str
    expected_keywords: List[str] = []
    category: str = "general"


class CompleteSessionRequest(BaseModel):
    session_id: str
    evaluations: List[dict]


@router.post("/start")
async def start_interview_session(request: StartSessionRequest):
    """Start a new interview session and generate questions."""
    # Get resume text
    resume_text = ""
    db = get_mongodb_db()
    if db is not None:
        result = db["resumes"].find_one({"id": request.resume_id})
        if result:
            resume_text = result.get("raw_text", "")

    # Local disk fallback if Supabase is not configured or resume not in database
    if not resume_text:
        import glob
        import os
        from app.services.file_extractor import extract_text
        from app.config import settings

        search_pattern = os.path.join(settings.UPLOAD_DIR, f"{request.resume_id}.*")
        matching_files = glob.glob(search_pattern)
        if matching_files:
            file_path = matching_files[0]
            try:
                resume_text = extract_text(str(file_path))
            except Exception:
                pass

    if not resume_text:
        raise HTTPException(status_code=404, detail="Resume not found. Please upload your resume first.")

    # Generate questions
    questions = generate_interview_questions(
        resume_text=resume_text,
        jd_text=request.jd_text or "",
        session_type=request.session_type,
        num_questions=min(request.num_questions, 15),
    )

    session_id = str(uuid.uuid4())

    # Save session to DB
    if db is not None:
        try:
            import datetime
            db["interview_sessions"].insert_one({
                "_id": session_id,
                "id": session_id,
                "resume_id": request.resume_id,
                "session_type": request.session_type,
                "questions": questions,
                "answers": [],
                "scores": {},
                "status": "in_progress",
                "created_at": datetime.datetime.utcnow().isoformat(),
            })
        except Exception:
            pass

    return {
        "session_id": session_id,
        "questions": questions,
        "total_questions": len(questions),
        "session_type": request.session_type,
    }


@router.post("/evaluate-answer")
async def evaluate_single_answer(request: SubmitAnswerRequest):
    """Evaluate a single interview answer."""
    if not request.answer or len(request.answer.strip()) < 10:
        raise HTTPException(status_code=400, detail="Answer is too short. Please provide a more detailed response.")

    evaluation = evaluate_answer(
        question=request.question_text,
        answer=request.answer,
        expected_keywords=request.expected_keywords,
        category=request.category,
    )

    evaluation["question_id"] = request.question_id
    return evaluation


@router.post("/complete")
async def complete_session(request: CompleteSessionRequest):
    """Complete interview session and get final scores."""
    if not request.evaluations:
        raise HTTPException(status_code=400, detail="No evaluations provided")

    session_scores = calculate_session_scores(request.evaluations)

    db = get_mongodb_db()
    if db is not None:
        try:
            db["interview_sessions"].update_one(
                {"id": request.session_id},
                {"$set": {
                    "answers": request.evaluations,
                    "scores": session_scores,
                    "overall_score": session_scores.get("overall", 0),
                    "status": "completed",
                }}
            )
        except Exception:
            pass

    return {
        "session_id": request.session_id,
        "scores": session_scores,
        "status": "completed",
        "feedback": _generate_session_feedback(session_scores),
    }


@router.get("/sessions")
async def get_interview_sessions():
    """Get all interview sessions."""
    db = get_mongodb_db()
    if db is None:
        return {"sessions": []}

    sessions = list(db["interview_sessions"].find(
        {},
        {"id": 1, "session_type": 1, "overall_score": 1, "status": 1, "created_at": 1}
    ).sort("created_at", -1).limit(20))

    for s in sessions:
        if "_id" in s:
            s["_id"] = str(s["_id"])
        if "overall_score" not in s:
            s["overall_score"] = s.get("scores", {}).get("overall", 0)
        if "created_at" not in s:
            s["created_at"] = ""
    return {"sessions": sessions}


@router.get("/sessions/{session_id}")
async def get_session_detail(session_id: str):
    """Get detailed interview session results."""
    db = get_mongodb_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not configured")

    result = db["interview_sessions"].find_one({"id": session_id})
    if not result:
        raise HTTPException(status_code=404, detail="Session not found")

    if "_id" in result:
        result["_id"] = str(result["_id"])
    return result


def _generate_session_feedback(scores: dict) -> str:
    overall = scores.get("overall", 0)
    if overall >= 85:
        return "Excellent performance! You're well-prepared for this interview. Focus on maintaining this standard."
    elif overall >= 70:
        return "Good performance! You demonstrated solid understanding. Work on quantifying your achievements and providing more specific examples."
    elif overall >= 55:
        return "Fair performance. Practice STAR method for behavioral questions and review technical fundamentals."
    else:
        return "Keep practicing! Focus on technical fundamentals, use the STAR method, and prepare specific examples from your experience."
