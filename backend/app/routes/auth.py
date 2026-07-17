"""Auth routes - Firebase token verification"""
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


class RegisterRequest(BaseModel):
    firebase_uid: str
    email: str
    display_name: Optional[str] = None
    photo_url: Optional[str] = None


def verify_firebase_token(token: str) -> dict:
    """Verify Firebase ID token."""
    try:
        import firebase_admin
        from firebase_admin import auth, credentials
        import os
        from app.config import settings

        # Initialize Firebase Admin if not already done
        if not firebase_admin._apps:
            if settings.FIREBASE_CREDENTIALS_PATH and os.path.exists(settings.FIREBASE_CREDENTIALS_PATH):
                cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
            elif settings.FIREBASE_CREDENTIALS_JSON:
                import json
                cred = credentials.Certificate(json.loads(settings.FIREBASE_CREDENTIALS_JSON))
            else:
                logger.warning("Firebase credentials not configured")
                return None
            firebase_admin.initialize_app(cred)

        decoded = auth.verify_id_token(token)
        return decoded
    except Exception as e:
        logger.error(f"Firebase token verification error: {e}")
        return None


@router.post("/register")
async def register_user(request: RegisterRequest):
    """Register or update a user in the database."""
    from app.database.mongodb_client import get_mongodb_db
    db = get_mongodb_db()

    if db is None:
        return {
            "success": True,
            "user": {
                "id": request.firebase_uid,
                "email": request.email,
                "display_name": request.display_name,
            },
            "message": "Database not configured - running in demo mode"
        }

    try:
        import datetime
        # Upsert user
        user_data = {
            "firebase_uid": request.firebase_uid,
            "email": request.email,
            "display_name": request.display_name,
            "photo_url": request.photo_url,
            "updated_at": datetime.datetime.utcnow().isoformat(),
        }
        db["users"].update_one(
            {"firebase_uid": request.firebase_uid},
            {"$set": user_data},
            upsert=True
        )
        user_data["id"] = request.firebase_uid
        return {"success": True, "user": user_data}
    except Exception as e:
        logger.error(f"User registration error: {e}")
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")


@router.get("/me")
async def get_current_user(authorization: Optional[str] = Header(None)):
    """Get current user info from Firebase token."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")

    token = authorization.split(" ")[1]
    decoded = verify_firebase_token(token)

    if not decoded:
        # Demo mode - return mock user
        return {
            "uid": "demo-user",
            "email": "demo@example.com",
            "display_name": "Demo User",
            "demo_mode": True
        }

    return {
        "uid": decoded.get("uid"),
        "email": decoded.get("email"),
        "display_name": decoded.get("name"),
        "photo_url": decoded.get("picture"),
    }
