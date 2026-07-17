"""Dashboard analytics routes"""
from fastapi import APIRouter
from app.database.mongodb_client import get_mongodb_db

router = APIRouter()


@router.get("/stats")
async def get_dashboard_stats():
    """Get dashboard statistics."""
    db = get_mongodb_db()

    if db is None:
        # Return demo data if DB not configured
        return {
            "total_resumes": 3,
            "total_analyses": 5,
            "average_ats_score": 72.4,
            "best_ats_score": 86.0,
            "total_interview_sessions": 2,
            "skills_matched_percent": 68.0,
            "interview_readiness": 74.0,
            "recent_scores": [65, 72, 78, 74, 86],
        }

    try:
        total_resumes = db["resumes"].count_documents({})
        ats_results = list(db["ats_results"].find({}, {"overall_score": 1, "skill_score": 1}))
        total_interviews = db["interview_sessions"].count_documents({})
        completed_interviews = list(db["interview_sessions"].find({"status": "completed"}, {"overall_score": 1}))

        avg_ats = sum(r.get("overall_score", 0) for r in ats_results) / len(ats_results) if ats_results else 0
        best_ats = max((r.get("overall_score", 0) for r in ats_results), default=0)
        avg_skill = sum(r.get("skill_score", 0) for r in ats_results) / len(ats_results) if ats_results else 0

        avg_interview = sum(
            r.get("overall_score", 0) for r in completed_interviews if r.get("overall_score")
        ) / max(len(completed_interviews), 1)

        recent_scores = [r.get("overall_score", 0) for r in ats_results[-5:]] if ats_results else []

        return {
            "total_resumes": total_resumes,
            "total_analyses": len(ats_results),
            "average_ats_score": round(avg_ats, 1),
            "best_ats_score": round(best_ats, 1),
            "total_interview_sessions": total_interviews,
            "skills_matched_percent": round(avg_skill, 1),
            "interview_readiness": round(avg_interview, 1),
            "recent_scores": recent_scores,
        }
    except Exception as e:
        return {"error": str(e)}


@router.get("/activity")
async def get_recent_activity():
    """Get recent activity feed."""
    db = get_mongodb_db()

    if db is None:
        return {"activities": []}

    try:
        activities = []

        resumes = list(db["resumes"].find({}, {"id": 1, "file_name": 1, "created_at": 1}).sort("created_at", -1).limit(5))

        for r in resumes:
            activities.append({
                "id": r["id"],
                "type": "resume_upload",
                "title": f"Uploaded {r['file_name']}",
                "score": None,
                "created_at": r.get("created_at", ""),
            })

        ats = list(db["ats_results"].find({}, {"id": 1, "overall_score": 1, "created_at": 1}).sort("created_at", -1).limit(5))

        for a in ats:
            activities.append({
                "id": a["id"],
                "type": "ats_analysis",
                "title": f"ATS Analysis",
                "score": a["overall_score"],
                "created_at": a.get("created_at", ""),
            })

        # Sort by date
        activities.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return {"activities": activities[:10]}

    except Exception as e:
        return {"activities": [], "error": str(e)}
