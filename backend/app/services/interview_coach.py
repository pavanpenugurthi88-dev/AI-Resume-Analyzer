"""
Interview Coach Service
Generates interview questions and evaluates answers using Gemini
"""

import json
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)


from app.services.ai_manager import ai_manager

def _call_openrouter(prompt: str) -> str:
    return ai_manager.generate_text(prompt)


def _generate_ai_questions(
    resume_text: str,
    jd_text: str,
    session_type: str = "questions",
    num_questions: int = 10,
) -> List[Dict[str, Any]]:
    """Generate tailored interview questions based on resume + JD using Gemini."""
    type_instructions = {
        "questions": "Focus on general interview questions, testing the candidate's domain knowledge and problem-solving skills without requiring actual code.",
        "programs": "Focus heavily on technical skills, asking the candidate to write or explain specific programs, coding exercises, algorithms, and system design concepts.",
        "hr": "Focus on behavioral, cultural fit, situational, and soft-skill questions commonly asked by HR managers.",
        "technical": "Focus purely on deep technical questions, architecture, domain expertise, and advanced problem-solving relevant to the candidate's role.",
        "mixed": "Provide a well-rounded mix of HR, behavioral, technical, and situational questions to give a comprehensive interview experience."
    }

    prompt = f"""You are an expert technical interviewer. Generate {num_questions} interview questions based on this resume and job description.

RESUME:
{resume_text[:2500]}

JOB DESCRIPTION:
{jd_text[:1500]}

INTERVIEW TYPE: {session_type}
FOCUS: {type_instructions.get(session_type, type_instructions['questions'])}

Return a JSON array with this exact structure:
[
  {{
    "id": 1,
    "question": "Full interview question",
    "category": "technical|behavioral|hr|project",
    "difficulty": "easy|medium|hard",
    "expected_keywords": ["keyword1", "keyword2", "keyword3"]
  }}
]

Make questions specific to the candidate's background and the role. Return ONLY valid JSON.
"""

    try:
        text = _call_openrouter(prompt).strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        questions = json.loads(text)
        return questions
    except Exception as e:
        logger.error(f"AI Question generation error: {e}")
        return _mock_questions(session_type)


def _select_static_questions(
    all_questions: List[Dict[str, Any]],
    session_type: str,
    num_questions: int,
    detected_skills: List[str]
) -> List[Dict[str, Any]]:
    """Local fallback selector to extract static questions from database."""
    import random
    mapped_categories = []
    if session_type == "technical" or session_type == "programs":
        mapped_categories = ["technical"]
    elif session_type == "behavioral":
        mapped_categories = ["behavioral"]
    elif session_type == "hr":
        mapped_categories = ["hr", "behavioral"]
    elif session_type == "project":
        mapped_categories = ["project"]
    else:
        mapped_categories = ["technical", "behavioral", "hr", "project"]

    filtered = [q for q in all_questions if q.get("category") in mapped_categories]

    seen = set()
    unique_filtered = []
    for q in filtered:
        text = q.get("question", "").strip().lower()
        if text not in seen:
            seen.add(text)
            unique_filtered.append(q)
    filtered = unique_filtered

    if "technical" in mapped_categories and detected_skills:
        matching_skills_questions = []
        other_tech_questions = []
        for q in filtered:
            topic = q.get("topic", "").lower()
            if any(skill in topic or topic in skill for skill in detected_skills):
                matching_skills_questions.append(q)
            else:
                other_tech_questions.append(q)
        filtered = matching_skills_questions + other_tech_questions

    if len(filtered) < num_questions:
        filtered = all_questions

    selected = random.sample(filtered, min(len(filtered), num_questions))
    
    formatted = []
    for idx, q in enumerate(selected):
        formatted.append({
            "id": idx + 1,
            "question": q["question"],
            "category": q["category"],
            "difficulty": q["difficulty"],
            "expected_keywords": q["expected_keywords"]
        })
    return formatted


def generate_interview_questions(
    resume_text: str,
    jd_text: str,
    session_type: str = "questions",
    num_questions: int = 10,
) -> List[Dict[str, Any]]:
    """
    Generate dynamic, tailored, and changing interview questions using Gemini,
    with the candidate's resume, job description, and the user's 500 question templates
    as styling and context guides.
    """
    import os
    import json
    import random

    current_dir = os.path.dirname(os.path.abspath(__file__))
    questions_file = os.path.join(current_dir, "..", "resources", "structured_questions_500.json")

    # 1. Detect candidate skills from resume
    detected_skills = []
    resume_lower = resume_text.lower()
    tech_keywords = [
        "python", "javascript", "react", "html/css", "node.js", "express.js", 
        "mongodb", "sql", "mysql", "sql server", "opencv", "mediapipe", 
        "computer vision", "ai/ml", "emotion detection", "oop", "dsa", 
        "git", "cloud", "security", "testing"
    ]
    for skill in tech_keywords:
        if skill in resume_lower:
            detected_skills.append(skill)
            
    if "mongodb atlas" in resume_lower:
        detected_skills.append("mongodb atlas")
    if "power bi" in resume_lower or "tableau" in resume_lower:
        detected_skills.append("power bi/tableau")

    # 2. Get relevant question templates from database
    templates = []
    all_questions = []
    if os.path.exists(questions_file):
        try:
            with open(questions_file, "r", encoding="utf-8") as f:
                all_questions = json.load(f)
                
            mapped_categories = []
            if session_type == "technical" or session_type == "programs":
                mapped_categories = ["technical"]
            elif session_type == "behavioral":
                mapped_categories = ["behavioral"]
            elif session_type == "hr":
                mapped_categories = ["hr", "behavioral"]
            elif session_type == "project":
                mapped_categories = ["project"]
            else:
                mapped_categories = ["technical", "behavioral", "hr", "project"]
                
            filtered = [q for q in all_questions if q.get("category") in mapped_categories]
            
            seen = set()
            unique_filtered = []
            for q in filtered:
                text = q.get("question", "").strip().lower()
                if text not in seen:
                    seen.add(text)
                    unique_filtered.append(q)
            
            sample_size = min(len(unique_filtered), 15)
            if sample_size > 0:
                templates = random.sample(unique_filtered, sample_size)
        except Exception as e:
            logger.error(f"Error loading templates: {e}")

    # 3. Build prompt for Gemini to generate dynamic questions
    templates_str = ""
    if templates:
        templates_str = "\n".join([f"- {t['question']}" for t in templates])
    else:
        templates_str = """- Explain your understanding of [Topic] and discuss a practical example related to your resume or experience.
- Describe a challenging situation you faced in [Project/Skill] and explain how you solved it."""

    prompt = f"""You are an expert technical recruiter and interviewer. Generate {num_questions} unique, highly tailored, and changing interview questions for this candidate.

RESUME:
{resume_text[:2500]}

JOB DESCRIPTION:
{jd_text[:1500]}

INTERVIEW TYPE: {session_type}

STYLE GUIDELINES & TEMPLATES:
Use the format and tone of the following templates to construct your questions. Customize them to include the actual tools, technologies, and projects mentioned in the candidate's resume (such as {', '.join(detected_skills) if detected_skills else 'their stack'}):
{templates_str}

CRITICAL RULES:
1. The questions MUST be dynamically generated based on the candidate's actual resume experience and projects.
2. The questions MUST be unique and change between sessions (do not just return the exact templates word-for-word).
3. Make the questions accurate to the candidate's level and technical stack.
4. Output a JSON array with this exact structure:
[
  {{
    "id": 1,
    "question": "Full customized interview question matching the template style",
    "category": "{session_type if session_type in ['technical', 'behavioral', 'hr', 'project'] else 'technical'}",
    "difficulty": "easy|medium|hard",
    "expected_keywords": ["keyword1", "keyword2", "keyword3"]
  }}
]

Return ONLY valid JSON.
"""

    try:
        text = _call_openrouter(prompt).strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        questions = json.loads(text)
        
        # Ensure sequential ID ordering
        for i, q in enumerate(questions):
            q["id"] = i + 1
        return questions
    except Exception as e:
        logger.error(f"Dynamic question generation error: {e}. Falling back to static selection.")
        if all_questions:
            return _select_static_questions(all_questions, session_type, num_questions, detected_skills)
        return _generate_ai_questions(resume_text, jd_text, session_type, num_questions)


def evaluate_answer(
    question: str,
    answer: str,
    expected_keywords: List[str],
    category: str,
) -> Dict[str, Any]:
    """
    Evaluate a user's interview answer and provide feedback.
    """

    prompt = f"""You are an expert interview coach. Evaluate this interview answer.

QUESTION: {question}
CATEGORY: {category}
ANSWER: {answer}
EXPECTED KEYWORDS: {', '.join(expected_keywords)}

Return a JSON object:
{{
  "score": 0-100,
  "feedback": "Overall 2-3 sentence feedback",
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "keyword_coverage": 0-100,
  "communication_score": 0-100,
  "confidence_score": 0-100,
  "technical_accuracy": 0-100
}}

Be honest but constructive. Return ONLY valid JSON.
"""

    try:
        text = _call_openrouter(prompt).strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text)
    except Exception as e:
        logger.error(f"Answer evaluation error: {e}")
        return _mock_evaluation(question, answer, expected_keywords)


def calculate_session_scores(evaluations: List[Dict[str, Any]]) -> Dict[str, float]:
    """Calculate overall session scores from individual evaluations."""
    if not evaluations:
        return {"communication": 0, "confidence": 0, "technical": 0, "grammar": 0, "overall": 0}

    n = len(evaluations)
    return {
        "communication": round(sum(e.get("communication_score", 70) for e in evaluations) / n, 1),
        "confidence": round(sum(e.get("confidence_score", 70) for e in evaluations) / n, 1),
        "technical": round(sum(e.get("technical_accuracy", 70) for e in evaluations) / n, 1),
        "grammar": round(sum(e.get("keyword_coverage", 70) for e in evaluations) / n, 1),
        "overall": round(sum(e.get("score", 70) for e in evaluations) / n, 1),
    }


def _mock_questions(session_type: str) -> List[Dict[str, Any]]:
    """Fallback questions when Gemini is not available."""
    questions = [
        {"id": 1, "question": "Tell me about yourself and your background.", "category": "hr", "difficulty": "easy", "expected_keywords": ["experience", "skills", "background"]},
        {"id": 2, "question": "What is the difference between supervised and unsupervised learning?", "category": "technical", "difficulty": "medium", "expected_keywords": ["labeled", "unlabeled", "clustering", "classification"]},
        {"id": 3, "question": "Describe a challenging project you worked on and how you overcame obstacles.", "category": "behavioral", "difficulty": "medium", "expected_keywords": ["challenge", "solution", "result", "team"]},
        {"id": 4, "question": "Explain the concept of overfitting and how to prevent it.", "category": "technical", "difficulty": "medium", "expected_keywords": ["regularization", "cross-validation", "dropout", "training data"]},
        {"id": 5, "question": "Walk me through one of your key projects. What was your role and what was the impact?", "category": "project", "difficulty": "medium", "expected_keywords": ["architecture", "implementation", "results", "metrics"]},
        {"id": 6, "question": "What are your greatest strengths and weaknesses?", "category": "hr", "difficulty": "easy", "expected_keywords": ["strengths", "improvement", "growth"]},
        {"id": 7, "question": "Explain the difference between REST and GraphQL APIs.", "category": "technical", "difficulty": "medium", "expected_keywords": ["endpoints", "flexible queries", "over-fetching", "schema"]},
        {"id": 8, "question": "Describe a situation where you had to work with a difficult team member.", "category": "behavioral", "difficulty": "medium", "expected_keywords": ["communication", "empathy", "resolution", "collaboration"]},
        {"id": 9, "question": "What is Docker and why is it useful in software development?", "category": "technical", "difficulty": "easy", "expected_keywords": ["container", "isolation", "portability", "deployment"]},
        {"id": 10, "question": "Where do you see yourself in 5 years?", "category": "hr", "difficulty": "easy", "expected_keywords": ["growth", "leadership", "skills", "goals"]},
    ]
    return questions


def _mock_evaluation(question: str, answer: str, expected_keywords: List[str]) -> Dict[str, Any]:
    """Fallback evaluation when Gemini is not available."""
    word_count = len(answer.split())
    kw_count = sum(1 for kw in expected_keywords if kw.lower() in answer.lower())
    kw_coverage = (kw_count / len(expected_keywords) * 100) if expected_keywords else 70

    score = min(85, max(40, (word_count / 3) + kw_coverage * 0.5))

    return {
        "score": round(score, 1),
        "feedback": "Configure your Gemini API key for detailed AI-powered feedback. Your answer covers the basics.",
        "strengths": ["Attempted to answer the question", "Shows some understanding"],
        "improvements": ["Add more specific examples", "Quantify your achievements"],
        "keyword_coverage": round(kw_coverage, 1),
        "communication_score": round(min(score + 5, 95), 1),
        "confidence_score": round(min(score - 5, 85), 1),
        "technical_accuracy": round(score, 1),
    }

def chat_with_agent(message: str, session_id: str) -> str:
    """
    Handle small talk or free-form chat with the AI recruiter.
    """
    prompt = f"""You are Sarah, a friendly AI technical recruiter and interview coach.
The candidate is talking to you before or during an interview session.
Respond naturally, conversationally, and concisely (1-2 sentences).
Do not ask actual interview questions here, just handle the small talk.

CANDIDATE SAYS: {message}
"""
    try:
        return _call_openrouter(prompt).strip()
    except Exception as e:
        logger.error(f"Chat generation error: {e}")
        return "I'm having a bit of trouble hearing you, but let's continue!"
