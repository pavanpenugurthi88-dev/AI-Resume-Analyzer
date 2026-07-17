"""
User Settings & Preferences API Router
"""

import datetime
from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
from app.database.mongodb_client import get_mongodb_db
from app.models.schemas import UserSettingsUpdateRequest, UserSettingsResponse

router = APIRouter()

# Default user ID for demonstration/local mode
DEFAULT_USER_ID = "local_demo_user"

@router.get("", response_model=UserSettingsResponse)
async def get_settings(user_id: str = DEFAULT_USER_ID):
    """Retrieve settings for the current user."""
    db = get_mongodb_db()
    
    defaults = {
        "user_id": user_id,
        "theme": "light",
        "selected_provider": "openrouter",
        "selected_model": "google/gemini-2.5-flash",
        "api_keys": {
            "gemini": "",
            "openrouter": "",
            "openai": "",
            "mistral": "",
            "grok": ""
        },
        "updated_at": datetime.datetime.utcnow()
    }

    if db is None:
        return defaults

    try:
        record = db["settings"].find_one({"user_id": user_id})
        if not record:
            # Create default settings
            db["settings"].insert_one(defaults)
            return defaults
        
        # Mask API keys for security
        api_keys = record.get("api_keys", {})
        masked_keys = {
            k: (v[:4] + "*" * 12 if v and len(v) > 4 else "")
            for k, v in api_keys.items()
        }
        
        return {
            "user_id": user_id,
            "theme": record.get("theme", "dark"),
            "selected_provider": record.get("selected_provider", "openrouter"),
            "selected_model": record.get("selected_model", "google/gemini-2.5-flash"),
            "api_keys": masked_keys,
            "updated_at": record.get("updated_at") or datetime.datetime.utcnow()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.post("", response_model=UserSettingsResponse)
async def update_settings(request: UserSettingsUpdateRequest, user_id: str = DEFAULT_USER_ID):
    """Create or update user configuration settings."""
    db = get_mongodb_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection unavailable")

    try:
        existing = db["settings"].find_one({"user_id": user_id})
        current_keys = existing.get("api_keys", {}) if existing else {}

        # Merge keys: if key update is a masked wildcard, keep original key
        updated_keys = {}
        for provider, new_val in request.api_keys.items():
            if new_val and "*" in new_val:
                updated_keys[provider] = current_keys.get(provider, "")
            else:
                updated_keys[provider] = new_val or ""

        updated_data = {
            "user_id": user_id,
            "theme": request.theme,
            "selected_provider": request.selected_provider,
            "selected_model": request.selected_model,
            "api_keys": updated_keys,
            "updated_at": datetime.datetime.utcnow()
        }

        db["settings"].update_one(
            {"user_id": user_id},
            {"$set": updated_data},
            upsert=True
        )

        # Return masked response
        masked_keys = {
            k: (v[:4] + "*" * 12 if v and len(v) > 4 else "")
            for k, v in updated_keys.items()
        }

        return {
            "user_id": user_id,
            "theme": request.theme,
            "selected_provider": request.selected_provider,
            "selected_model": request.selected_model,
            "api_keys": masked_keys,
            "updated_at": updated_data["updated_at"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update settings: {str(e)}")
