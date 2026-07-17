"""ATS Analysis routes"""
import uuid
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.services.ats_scorer import ats_scorer
from app.services.suggestions import generate_suggestions, generate_learning_roadmap
from app.services.grammar_checker import check_grammar, compute_grammar_score
from app.database.mongodb_client import get_mongodb_db

router = APIRouter()


class AnalyzeRequest(BaseModel):
    resume_id: str
    jd_text: str
    jd_title: Optional[str] = None
    jd_company: Optional[str] = None


@router.post("/analyze")
async def analyze_resume(request: AnalyzeRequest):
    """
    Full ATS analysis: score + skill gap + suggestions + grammar check.
    """
    # Get resume from DB or storage
    resume_id = request.resume_id
    resume_text = ""
    extracted = {}
    resume_skills = []
    education = []
    years_exp = 0

    db = get_mongodb_db()
    if db is not None:
        resume = db["resumes"].find_one({"id": resume_id})
        if resume:
            resume_text = resume.get("raw_text", "")
            extracted = resume.get("extracted_data", {})
            resume_skills = extracted.get("skills", [])
            education = extracted.get("education", [])
            years_exp = extracted.get("years_of_experience", 0)

    # Local disk fallback if Supabase is not configured or resume not in database
    if not resume_text:
        import glob
        import os
        from app.services.file_extractor import extract_text
        from app.services.resume_parser import resume_parser
        from app.config import settings

        search_pattern = os.path.join(settings.UPLOAD_DIR, f"{resume_id}.*")
        matching_files = glob.glob(search_pattern)
        if matching_files:
            file_path = matching_files[0]
            try:
                resume_text = extract_text(str(file_path))
                extracted = resume_parser.parse(resume_text)
                resume_skills = extracted.get("skills", [])
                education = extracted.get("education", [])
                years_exp = extracted.get("years_of_experience", 0)
            except Exception:
                pass

    if not resume_text:
        raise HTTPException(status_code=404, detail="Resume not found. Please upload a resume first.")

    jd_text = request.jd_text
    if len(jd_text.strip()) < 50:
        raise HTTPException(status_code=400, detail="Job description is too short. Please paste the full JD.")

    # 1. ATS Scoring
    ats_result = ats_scorer.score(
        resume_text=resume_text,
        jd_text=jd_text,
        resume_skills=resume_skills,
        education=education,
        years_of_experience=years_exp,
    )

    # 2. Grammar Check
    grammar_issues = await check_grammar(resume_text)
    grammar_score = compute_grammar_score(grammar_issues, len(resume_text))

    # 3. AI Suggestions
    suggestions_data = generate_suggestions(
        resume_text=resume_text,
        jd_text=jd_text,
        missing_skills=ats_result.get("missing_skills", []),
        missing_keywords=ats_result.get("missing_keywords", []),
    )

    # Compile result
    result_id = str(uuid.uuid4())
    full_result = {
        "id": result_id,
        "resume_id": resume_id,
        "jd_title": request.jd_title,
        "jd_company": request.jd_company,
        "score_breakdown": {
            "overall_score": ats_result["overall_score"],
            "keyword_score": ats_result["keyword_score"],
            "semantic_score": ats_result["semantic_score"],
            "skill_score": ats_result["skill_score"],
            "experience_score": ats_result["experience_score"],
            "education_score": ats_result["education_score"],
            "grammar_score": grammar_score,
        },
        "matched_skills": ats_result.get("matched_skills", []),
        "missing_skills": ats_result.get("missing_skills", []),
        "matched_keywords": ats_result.get("matched_keywords", []),
        "missing_keywords": ats_result.get("missing_keywords", []),
        "improvement_suggestions": suggestions_data.get("improvement_suggestions", []),
        "rewritten_summary": suggestions_data.get("rewritten_summary", ""),
        "ats_tips": suggestions_data.get("ats_tips", []),
        "grammar_issues": grammar_issues[:10],
        "grammar_score": grammar_score,
    }

    # Save to database
    if db is not None:
        try:
            import datetime
            db["ats_results"].insert_one({
                "_id": result_id,
                "id": result_id,
                "resume_id": resume_id,
                "overall_score": ats_result["overall_score"],
                "keyword_score": ats_result["keyword_score"],
                "semantic_score": ats_result["semantic_score"],
                "skill_score": ats_result["skill_score"],
                "experience_score": ats_result["experience_score"],
                "education_score": ats_result["education_score"],
                "matched_skills": ats_result.get("matched_skills", []),
                "missing_skills": ats_result.get("missing_skills", []),
                "improvement_suggestions": suggestions_data.get("improvement_suggestions", []),
                "grammar_issues": grammar_issues[:10],
                "created_at": datetime.datetime.utcnow().isoformat(),
            })
        except Exception as e:
            pass  # Don't fail if DB save fails

    return full_result


@router.post("/roadmap")
async def generate_roadmap(missing_skills: list[str]):
    """Generate a learning roadmap for missing skills."""
    if not missing_skills:
        raise HTTPException(status_code=400, detail="No missing skills provided")

    roadmap = generate_learning_roadmap(missing_skills)
    return {"roadmap": roadmap, "total_weeks": len(roadmap)}


@router.get("/history")
async def get_ats_history():
    """Get historical ATS analysis results."""
    db = get_mongodb_db()
    if db is None:
        return {"results": []}

    results = list(db["ats_results"].find(
        {},
        {"id": 1, "resume_id": 1, "overall_score": 1, "created_at": 1}
    ).sort("created_at", -1).limit(20))

    for r in results:
        if "_id" in r:
            r["_id"] = str(r["_id"])
        if "created_at" not in r:
            r["created_at"] = ""
    return {"results": results}
