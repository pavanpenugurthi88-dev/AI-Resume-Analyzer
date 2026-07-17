"""
AI Suggestions Service
Uses Google Gemini to generate resume improvement suggestions
and rewrite content professionally
"""

import json
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)


from app.services.ai_manager import ai_manager

def generate_suggestions(
    resume_text: str,
    jd_text: str,
    missing_skills: List[str],
    missing_keywords: List[str],
) -> Dict[str, Any]:
    """
    Generate AI improvement suggestions for the resume.
    """
    prompt = f"""You are an expert resume coach and ATS optimization specialist.

Analyze this resume against the job description and provide specific, actionable improvement suggestions.

RESUME:
{resume_text[:3000]}

JOB DESCRIPTION:
{jd_text[:2000]}

MISSING SKILLS: {', '.join(missing_skills[:10])}
MISSING KEYWORDS: {', '.join(missing_keywords[:10])}

Return a JSON object with this exact structure:
{{
  "improvement_suggestions": [
    {{
      "category": "keyword|action_verb|quantify|formatting|skill",
      "priority": "high|medium|low",
      "issue": "Brief description of the problem",
      "suggestion": "Specific actionable advice",
      "before_example": "Optional: current weak text",
      "after_example": "Optional: improved version"
    }}
  ],
  "rewritten_summary": "A professional 3-4 sentence summary rewritten for this job",
  "top_missing_skills": ["skill1", "skill2"],
  "ats_tips": ["tip1", "tip2", "tip3"]
}}

Provide 6-10 suggestions covering: missing skills, weak action verbs, unquantified achievements, formatting issues, and keyword gaps.
Return ONLY valid JSON, no markdown.
"""
    try:
        return ai_manager.generate_json(prompt)
    except Exception as e:
        logger.error(f"Suggestions generation error: {e}")
        return _mock_suggestions(missing_skills, missing_keywords)


def rewrite_resume_section(
    section_name: str,
    section_text: str,
    jd_text: str,
) -> str:
    """Rewrite a specific resume section to be more impactful."""
    prompt = f"""You are an expert resume writer. Rewrite the following resume {section_name} section to be more professional, impactful, and ATS-optimized for the given job description.

CURRENT {section_name.upper()}:
{section_text}

JOB DESCRIPTION (for context):
{jd_text[:1500]}

Rules:
- Use strong action verbs (Developed, Architected, Optimized, Led, Implemented)
- Quantify achievements where possible (%, numbers, impact)
- Include relevant keywords from the JD
- Keep it concise and professional
- Do NOT add fake information

Return ONLY the rewritten {section_name} text, no explanations.
"""
    try:
        return ai_manager.generate_text(prompt)
    except Exception as e:
        logger.error(f"Rewrite section error: {e}")
        return section_text


def generate_learning_roadmap(missing_skills: List[str]) -> List[Dict[str, Any]]:
    """Generate a week-by-week learning roadmap for missing skills."""
    if not missing_skills:
        return _mock_roadmap(missing_skills)

    prompt = f"""Create a practical week-by-week learning roadmap for these skills: {', '.join(missing_skills[:8])}

Return a JSON array with this structure:
[
  {{
    "week": 1,
    "skill": "Docker",
    "topics": ["Introduction to containers", "Docker CLI basics", "Dockerfile"],
    "resources": [
      {{"title": "Docker Official Docs", "url": "https://docs.docker.com", "type": "docs"}},
      {{"title": "Docker for Beginners", "url": "https://www.youtube.com/...", "type": "video"}}
    ],
    "estimated_hours": 8
  }}
]

Make it practical and beginner-friendly. Return ONLY valid JSON.
"""
    try:
        return ai_manager.generate_json(prompt)
    except Exception as e:
        logger.error(f"Roadmap generation error: {e}")
        return _mock_roadmap(missing_skills)


def _mock_suggestions(missing_skills: List[str], missing_keywords: List[str]) -> Dict[str, Any]:
    """Fallback suggestions when Gemini is not available."""
    suggestions = [
        {
            "category": "action_verb",
            "priority": "high",
            "issue": "Weak action verbs used",
            "suggestion": "Replace passive phrases with strong action verbs",
            "before_example": "Was responsible for managing Python projects",
            "after_example": "Architected and delivered 5 Python microservices reducing latency by 40%"
        },
        {
            "category": "quantify",
            "priority": "high",
            "issue": "Achievements not quantified",
            "suggestion": "Add specific numbers, percentages, and metrics to your achievements",
            "before_example": "Improved system performance",
            "after_example": "Optimized database queries reducing response time by 65%"
        },
        {
            "category": "formatting",
            "priority": "medium",
            "issue": "Missing professional summary",
            "suggestion": "Add a 3-4 sentence professional summary at the top tailored to this role",
        },
    ]

    for skill in missing_skills[:3]:
        suggestions.append({
            "category": "skill",
            "priority": "high",
            "issue": f"Missing skill: {skill}",
            "suggestion": f"Add {skill} to your skills section if you have experience with it. Consider taking a course if not.",
        })

    return {
        "improvement_suggestions": suggestions,
        "rewritten_summary": "Configure your Gemini API key in the .env file to get AI-generated suggestions.",
        "top_missing_skills": missing_skills[:5],
        "ats_tips": [
            "Use standard section headers (Experience, Education, Skills)",
            "Avoid tables and graphics - ATS systems can't read them",
            "Use keywords from the job description naturally throughout",
        ]
    }


def _mock_roadmap(missing_skills: List[str]) -> List[Dict[str, Any]]:
    """Fallback roadmap when Gemini is not available."""
    roadmap = []
    resources_map = {
        "docker": [{"title": "Docker Docs", "url": "https://docs.docker.com", "type": "docs"}],
        "aws": [{"title": "AWS Free Tier", "url": "https://aws.amazon.com/free", "type": "platform"}],
        "kubernetes": [{"title": "Kubernetes Docs", "url": "https://kubernetes.io/docs", "type": "docs"}],
    }

    for i, skill in enumerate(missing_skills[:8]):
        roadmap.append({
            "week": i + 1,
            "skill": skill,
            "topics": [f"Introduction to {skill}", f"{skill} fundamentals", f"Hands-on {skill} project"],
            "resources": resources_map.get(skill.lower(), [
                {"title": f"{skill} Tutorial", "url": f"https://www.google.com/search?q={skill}+tutorial", "type": "search"}
            ]),
            "estimated_hours": 8
        })

    return roadmap
