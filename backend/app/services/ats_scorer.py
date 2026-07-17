"""
ATS Scoring Engine
Combines keyword matching, semantic similarity, skill matching, and more
to produce a weighted ATS score.
"""

import re
import logging
from typing import List, Dict, Any, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

logger = logging.getLogger(__name__)

# Weights for overall ATS score
SCORE_WEIGHTS = {
    "keyword": 0.30,
    "semantic": 0.35,
    "skill": 0.20,
    "experience": 0.10,
    "education": 0.05,
}


class ATSScorer:
    def __init__(self):
        self._model = None

    def _get_embedding_model(self):
        """Lazy load sentence transformer model."""
        if self._model is None:
            try:
                from sentence_transformers import SentenceTransformer
                from app.config import settings
                self._model = SentenceTransformer(settings.SENTENCE_TRANSFORMER_MODEL)
                logger.info("Sentence transformer model loaded successfully")
            except Exception as e:
                logger.warning(f"Could not load sentence transformer: {e}. Using TF-IDF only.")
                self._model = None
        return self._model

    def _compute_tfidf_similarity(self, resume_text: str, jd_text: str) -> float:
        """TF-IDF cosine similarity between resume and JD."""
        try:
            vectorizer = TfidfVectorizer(
                stop_words='english',
                ngram_range=(1, 2),
                max_features=5000
            )
            tfidf_matrix = vectorizer.fit_transform([resume_text, jd_text])
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            return float(similarity)
        except Exception as e:
            logger.error(f"TF-IDF error: {e}")
            return 0.0

    def _compute_semantic_similarity(self, resume_text: str, jd_text: str) -> float:
        """Semantic similarity using sentence transformers."""
        model = self._get_embedding_model()
        if model is None:
            return self._compute_tfidf_similarity(resume_text, jd_text)

        try:
            # Truncate to avoid memory issues
            resume_short = resume_text[:2000]
            jd_short = jd_text[:2000]

            embeddings = model.encode([resume_short, jd_short])
            similarity = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
            return float(max(0, min(1, similarity)))
        except Exception as e:
            logger.error(f"Semantic similarity error: {e}")
            return self._compute_tfidf_similarity(resume_text, jd_text)

    def _extract_keywords(self, text: str) -> List[str]:
        """Extract meaningful keywords using TF-IDF."""
        try:
            # Clean text
            text = re.sub(r'[^\w\s]', ' ', text.lower())
            words = text.split()

            # Basic stop words
            stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at',
                         'to', 'for', 'of', 'with', 'by', 'from', 'is', 'are',
                         'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
                         'do', 'does', 'did', 'will', 'would', 'could', 'should',
                         'may', 'might', 'must', 'shall', 'can', 'that', 'this',
                         'their', 'they', 'we', 'you', 'i', 'it', 'its', 'our'}

            keywords = [w for w in words if len(w) > 2 and w not in stop_words]
            return list(set(keywords))
        except Exception as e:
            logger.error(f"Keyword extraction error: {e}")
            return []

    def _compute_keyword_score(self, resume_text: str, jd_text: str) -> Tuple[float, List[str], List[str]]:
        """Keyword overlap score between resume and JD."""
        resume_keywords = set(self._extract_keywords(resume_text))
        jd_keywords = set(self._extract_keywords(jd_text))

        if not jd_keywords:
            return 0.5, [], []

        matched = resume_keywords & jd_keywords
        missing = jd_keywords - resume_keywords

        score = len(matched) / len(jd_keywords) if jd_keywords else 0

        # Filter to meaningful keywords (len > 3)
        matched_filtered = [k for k in sorted(matched) if len(k) > 3][:20]
        missing_filtered = [k for k in sorted(missing) if len(k) > 3][:20]

        return float(min(score, 1.0)), matched_filtered, missing_filtered

    def _compute_skill_score(
        self,
        resume_skills: List[str],
        jd_text: str
    ) -> Tuple[float, List[str], List[str]]:
        """Match resume skills against JD requirements."""
        if not resume_skills:
            return 0.0, [], []

        jd_lower = jd_text.lower()
        resume_skill_lower = [s.lower().strip() for s in resume_skills]

        # Extract required skills from JD
        from app.services.resume_parser import TECH_SKILLS
        jd_required_skills = []
        for skill in TECH_SKILLS:
            # Handle boundary characters correctly for skills with special chars (e.g. c++, c#, .net)
            start_boundary = r'\b' if skill[0].isalnum() else ''
            end_boundary = r'\b' if skill[-1].isalnum() else ''
            pattern = start_boundary + re.escape(skill) + end_boundary
            if re.search(pattern, jd_lower):
                jd_required_skills.append(skill)

        if not jd_required_skills:
            return 0.7, resume_skills[:10], []

        matched = []
        missing = []

        for skill in jd_required_skills:
            skill_lower = skill.lower()
            if skill_lower in resume_skill_lower or any(skill_lower in rs for rs in resume_skill_lower):
                matched.append(skill)
            else:
                missing.append(skill)

        score = len(matched) / len(jd_required_skills) if jd_required_skills else 0

        return float(score), matched, missing

    def _compute_experience_score(
        self,
        years_of_experience: float,
        jd_text: str
    ) -> float:
        """Score based on years of experience vs JD requirements."""
        # Extract required years from JD
        patterns = [
            r'(\d+)\+?\s+years?\s+of\s+experience',
            r'(\d+)\+?\s+years?\s+experience',
            r'minimum\s+(\d+)\s+years?',
            r'at\s+least\s+(\d+)\s+years?',
        ]

        required_years = 0
        for pattern in patterns:
            match = re.search(pattern, jd_text.lower())
            if match:
                required_years = float(match.group(1))
                break

        if required_years == 0:
            return 0.8  # Neutral if not specified

        if years_of_experience >= required_years:
            return 1.0
        elif years_of_experience >= required_years * 0.7:
            return 0.8
        elif years_of_experience >= required_years * 0.5:
            return 0.6
        else:
            return max(0.3, years_of_experience / required_years)

    def _compute_education_score(
        self,
        education: List[Dict],
        jd_text: str
    ) -> float:
        """Score based on education requirements."""
        jd_lower = jd_text.lower()

        degree_hierarchy = {
            "phd": 5, "ph.d": 5,
            "master": 4, "m.tech": 4, "mtech": 4, "mba": 4, "m.sc": 4, "msc": 4,
            "bachelor": 3, "b.tech": 3, "btech": 3, "b.sc": 3, "bsc": 3, "b.e": 3,
            "diploma": 2, "associate": 2,
            "high school": 1,
        }

        # Get candidate's highest degree
        candidate_level = 0
        for edu in education:
            degree_text = edu.get("degree", "").lower()
            for degree, level in degree_hierarchy.items():
                if degree in degree_text:
                    candidate_level = max(candidate_level, level)

        # Get required degree from JD
        required_level = 0
        for degree, level in degree_hierarchy.items():
            if degree in jd_lower:
                required_level = max(required_level, level)

        if required_level == 0:
            return 0.8  # Neutral if not specified

        if candidate_level >= required_level:
            return 1.0
        elif candidate_level == required_level - 1:
            return 0.8
        else:
            return max(0.5, candidate_level / required_level)

    def score(
        self,
        resume_text: str,
        jd_text: str,
        resume_skills: List[str] = None,
        education: List[Dict] = None,
        years_of_experience: float = 0,
    ) -> Dict[str, Any]:
        """
        Compute comprehensive ATS score.

        Returns:
            Dict with overall_score, component scores, matched/missing skills
        """
        resume_skills = resume_skills or []
        education = education or []

        # 1. Keyword score
        keyword_score, matched_kw, missing_kw = self._compute_keyword_score(
            resume_text, jd_text
        )

        # 2. Semantic similarity
        semantic_score = self._compute_semantic_similarity(resume_text, jd_text)

        # 3. Skill score
        skill_score, matched_skills, missing_skills = self._compute_skill_score(
            resume_skills, jd_text
        )

        # 4. Experience score
        experience_score = self._compute_experience_score(years_of_experience, jd_text)

        # 5. Education score
        education_score = self._compute_education_score(education, jd_text)

        # Simple Direct Average (per user request)
        overall_score = (
            keyword_score +
            semantic_score +
            skill_score +
            experience_score +
            education_score
        ) / 5.0 * 100

        return {
            "overall_score": round(overall_score, 1),
            "keyword_score": round(keyword_score * 100, 1),
            "semantic_score": round(semantic_score * 100, 1),
            "skill_score": round(skill_score * 100, 1),
            "experience_score": round(experience_score * 100, 1),
            "education_score": round(education_score * 100, 1),
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "matched_keywords": matched_kw,
            "missing_keywords": missing_kw,
        }


# Singleton
ats_scorer = ATSScorer()
