"""Resume upload and parsing routes"""
import uuid
import os
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException, Header
from pathlib import Path
from typing import Optional

from app.config import settings
from app.services.file_extractor import extract_text, validate_file
from app.services.resume_parser import resume_parser
from app.database.mongodb_client import get_mongodb_db

router = APIRouter()


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    authorization: Optional[str] = Header(None),
):
    """Upload and parse a resume file (PDF or DOCX)."""
    # Validate file type
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    ext = Path(file.filename).suffix.lower()
    if ext not in [".pdf", ".docx", ".doc"]:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {ext}. Only PDF and DOCX are accepted."
        )

    # Save to disk
    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)

    file_id = str(uuid.uuid4())
    file_path = upload_dir / f"{file_id}{ext}"

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Validate size
        validate_file(str(file_path), settings.MAX_FILE_SIZE_MB)

        # Extract text
        raw_text = extract_text(str(file_path))

        if not raw_text or len(raw_text.strip()) < 50:
            raise HTTPException(
                status_code=422,
                detail="Could not extract meaningful text from this file. Please ensure it is not a scanned image."
            )

        # Parse resume
        extracted_data = resume_parser.parse(raw_text)

        # Save to database
        import datetime
        db = get_mongodb_db()
        resume_record = {
            "id": file_id,
            "file_name": file.filename,
            "file_path": str(file_path),
            "raw_text": raw_text,
            "extracted_data": extracted_data,
            "created_at": datetime.datetime.utcnow().isoformat(),
        }

        if db is not None:
            resume_record["_id"] = file_id
            db["resumes"].insert_one(resume_record)

        return {
            "success": True,
            "resume_id": file_id,
            "file_name": file.filename,
            "extracted_data": extracted_data,
            "raw_text": raw_text[:500] + "..." if len(raw_text) > 500 else raw_text,
            "text_length": len(raw_text),
        }

    except HTTPException:
        raise
    except Exception as e:
        # Clean up file on error
        if file_path.exists():
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Resume processing failed: {str(e)}")


@router.get("/{resume_id}")
async def get_resume(resume_id: str):
    """Get a previously uploaded resume."""
    db = get_mongodb_db()
    if db is not None:
        result = db["resumes"].find_one({"id": resume_id})
        if result:
            if "_id" in result:
                result["_id"] = str(result["_id"])
            return result

    # Local disk fallback
    import glob
    import os
    from app.services.file_extractor import extract_text
    from app.services.resume_parser import resume_parser

    search_pattern = os.path.join(settings.UPLOAD_DIR, f"{resume_id}.*")
    matching_files = glob.glob(search_pattern)
    if matching_files:
        file_path = matching_files[0]
        try:
            raw_text = extract_text(str(file_path))
            extracted_data = resume_parser.parse(raw_text)
            return {
                "id": resume_id,
                "file_name": os.path.basename(file_path),
                "file_path": str(file_path),
                "raw_text": raw_text,
                "extracted_data": extracted_data,
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to parse resume: {str(e)}")

    raise HTTPException(status_code=404, detail="Resume not found")


@router.get("/")
async def list_resumes():
    """List all uploaded resumes."""
    db = get_mongodb_db()
    if db is None:
        return {"resumes": []}

    resumes = list(db["resumes"].find({}, {"id": 1, "file_name": 1, "created_at": 1}))
    for r in resumes:
        if "_id" in r:
            r["_id"] = str(r["_id"])
        if "created_at" not in r:
            r["created_at"] = ""
    # Sort resumes by created_at desc
    resumes.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return {"resumes": resumes}
