"""
Job Application Tracker API Router
"""

import uuid
import datetime
from fastapi import APIRouter, HTTPException
from typing import List
from app.database.mongodb_client import get_mongodb_db
from app.models.schemas import JobApplicationResponse, JobApplicationCreate

router = APIRouter()
DEFAULT_USER_ID = "local_demo_user"

@router.get("", response_model=List[JobApplicationResponse])
async def list_applications(user_id: str = DEFAULT_USER_ID):
    """List all tracked job applications."""
    db = get_mongodb_db()
    if db is None:
        return []

    try:
        apps = list(db["applications"].find({"user_id": user_id}).sort("updated_at", -1))
        for a in apps:
            a["id"] = str(a["_id"])
            if "created_at" in a and isinstance(a["created_at"], str):
                a["created_at"] = datetime.datetime.fromisoformat(a["created_at"])
            if "updated_at" in a and isinstance(a["updated_at"], str):
                a["updated_at"] = datetime.datetime.fromisoformat(a["updated_at"])
        return apps
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.post("", response_model=JobApplicationResponse)
async def create_application(request: JobApplicationCreate, user_id: str = DEFAULT_USER_ID):
    """Create a new job application card."""
    db = get_mongodb_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    app_id = str(uuid.uuid4())
    now = datetime.datetime.utcnow()

    new_app = {
        "_id": app_id,
        "id": app_id,
        "user_id": user_id,
        "company": request.company,
        "role": request.role,
        "status": request.status,
        "priority": request.priority or "medium",
        "deadline": request.deadline,
        "notes": request.notes or "",
        "created_at": now,
        "updated_at": now
    }

    try:
        db["applications"].insert_one(new_app)
        return new_app
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create application: {str(e)}")


@router.put("/{app_id}", response_model=JobApplicationResponse)
async def update_application(app_id: str, request: JobApplicationCreate, user_id: str = DEFAULT_USER_ID):
    """Update application details or status in pipeline."""
    db = get_mongodb_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    try:
        existing = db["applications"].find_one({"_id": app_id, "user_id": user_id})
        if not existing:
            raise HTTPException(status_code=404, detail="Application not found")

        now = datetime.datetime.utcnow()
        updated_data = {
            "company": request.company,
            "role": request.role,
            "status": request.status,
            "priority": request.priority or "medium",
            "deadline": request.deadline,
            "notes": request.notes or "",
            "updated_at": now
        }

        db["applications"].update_one(
            {"_id": app_id, "user_id": user_id},
            {"$set": updated_data}
        )

        return {
            "id": app_id,
            "user_id": user_id,
            "company": request.company,
            "role": request.role,
            "status": request.status,
            "priority": request.priority or "medium",
            "deadline": request.deadline,
            "notes": request.notes or "",
            "created_at": existing.get("created_at") or now,
            "updated_at": now
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update application: {str(e)}")


@router.delete("/{app_id}")
async def delete_application(app_id: str, user_id: str = DEFAULT_USER_ID):
    """Remove a job application from tracker."""
    db = get_mongodb_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    try:
        res = db["applications"].delete_one({"_id": app_id, "user_id": user_id})
        if res.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Application not found")
        return {"success": True, "message": "Application deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete application: {str(e)}")
