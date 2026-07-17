"""
Persistent Context-Aware AI Chat API Router
"""

import uuid
import datetime
from fastapi import APIRouter, HTTPException
from typing import List, Optional
from app.database.mongodb_client import get_mongodb_db
from app.services.ai_manager import ai_manager
from app.models.schemas import ChatSessionResponse, ChatSendMessageRequest, ChatSessionCreate

router = APIRouter()
DEFAULT_USER_ID = "local_demo_user"

@router.get("/sessions", response_model=List[ChatSessionResponse])
async def list_chat_sessions(user_id: str = DEFAULT_USER_ID):
    """Retrieve all chat sessions for the current user."""
    db = get_mongodb_db()
    if db is None:
        return []

    try:
        sessions = list(db["chat_sessions"].find({"user_id": user_id}).sort("updated_at", -1))
        for s in sessions:
            s["id"] = str(s["_id"])
            # Format datetime objects
            if "created_at" in s and isinstance(s["created_at"], str):
                s["created_at"] = datetime.datetime.fromisoformat(s["created_at"])
            if "updated_at" in s and isinstance(s["updated_at"], str):
                s["updated_at"] = datetime.datetime.fromisoformat(s["updated_at"])
        return sessions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.post("/sessions", response_model=ChatSessionResponse)
async def create_chat_session(request: ChatSessionCreate, user_id: str = DEFAULT_USER_ID):
    """Create a new chat conversation session."""
    db = get_mongodb_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    session_id = str(uuid.uuid4())
    now = datetime.datetime.utcnow()

    new_session = {
        "_id": session_id,
        "id": session_id,
        "user_id": user_id,
        "title": request.title or "New Conversation",
        "messages": [
            {
                "sender": "ai",
                "content": "Hi there! I am your CareerPilot AI mentor. Ask me anything about resume writing, interview strategies, career roadmaps, or negotiating salary. How can I help you today?",
                "timestamp": now
            }
        ],
        "created_at": now,
        "updated_at": now
    }

    try:
        db["chat_sessions"].insert_one(new_session)
        return new_session
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create chat session: {str(e)}")


@router.post("/send")
async def send_chat_message(request: ChatSendMessageRequest, user_id: str = DEFAULT_USER_ID):
    """Send a message to AI agent and get a context-aware markdown response."""
    db = get_mongodb_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    session_id = request.session_id
    user_message = request.message.strip()

    if not user_message:
        raise HTTPException(status_code=400, detail="Empty message")

    session = db["chat_sessions"].find_one({"_id": session_id, "user_id": user_id})
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")

    # Fetch context: Resume details if passed
    resume_context = ""
    if request.resume_id:
        resume = db["resumes"].find_one({"id": request.resume_id})
        if resume:
            ext = resume.get("extracted_data", {})
            resume_context = f"""
CANDIDATE PROFILE DETAILS:
Name: {ext.get('name', 'N/A')}
Skills: {', '.join(ext.get('skills', []))}
Experience level: {ext.get('years_of_experience', 0)} years
Summary: {ext.get('summary', 'None')}
"""

    # Fetch context: Interview scores details if passed
    interview_context = ""
    if request.interview_session_id:
        interv = db["interview_sessions"].find_one({"id": request.interview_session_id})
        if interv:
            scores = interv.get("scores", {})
            evals = interv.get("answers", [])
            avg_score = scores.get("overall", 70)
            interview_context = f"""
CANDIDATE INTERVIEW SCORES:
Overall Score: {avg_score}/100
Technical Accuracy: {scores.get('technical', 0)}/100
Communication: {scores.get('communication', 0)}/100
Number of questions answered: {len(evals)}
"""

    # Construct chat history for the LLM prompt
    history_str = ""
    for msg in session.get("messages", [])[-10:]:  # Keep last 10 messages for context window
        history_str += f"{msg['sender'].upper()}: {msg['content']}\n"

    # Orchestrate LLM prompt
    system_prompt = f"""You are CareerPilot AI, an elite startup career coach, recruiter advisor, and interview coach.
Provide answers that feel highly personalized, polished, and structured. Use Markdown, highlight key bullet points, and wrap code blocks in standard triple backticks with syntax identifiers where appropriate.

{resume_context}
{interview_context}

CHAT HISTORY:
{history_str}

USER SAYS: {user_message}
AI CAREER PILOT RESPONSE:"""

    try:
        # Call the unified AIManager
        ai_response = ai_manager.generate_text(system_prompt, user_id)

        now = datetime.datetime.utcnow()
        # Save messages to database
        db["chat_sessions"].update_one(
            {"_id": session_id},
            {
                "$push": {
                    "messages": {
                        "$each": [
                            {"sender": "user", "content": user_message, "timestamp": now},
                            {"sender": "ai", "content": ai_response, "timestamp": now}
                        ]
                    }
                },
                "$set": {
                    "updated_at": now
                }
            }
        )

        return {
            "success": True,
            "response": ai_response,
            "timestamp": now
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate response: {str(e)}")
