"""
Resume Parser Service
Extracts structured information from raw resume text using spaCy + regex
"""

import re
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

# Common tech skills list for matching
TECH_SKILLS = {
    # Programming Languages
    "python", "java", "javascript", "typescript", "c++", "c#", "c", "go", "golang",
    "rust", "swift", "kotlin", "r", "matlab", "scala", "php", "ruby", "perl",
    # Web
    "html", "css", "react", "reactjs", "react.js", "angular", "vue", "vuejs",
    "nodejs", "node.js", "express", "django", "flask", "fastapi", "spring",
    "nextjs", "next.js", "tailwindcss", "bootstrap", "graphql", "rest api",
    "restful", "websocket",
    # Data & ML
    "machine learning", "deep learning", "nlp", "natural language processing",
    "computer vision", "tensorflow", "pytorch", "keras", "scikit-learn",
    "pandas", "numpy", "matplotlib", "seaborn", "plotly", "opencv",
    "hugging face", "transformers", "bert", "gpt", "llm",
    # Data Engineering
    "sql", "mysql", "postgresql", "sqlite", "mongodb", "redis", "elasticsearch",
    "apache spark", "spark", "hadoop", "kafka", "airflow", "dbt",
    "snowflake", "bigquery", "redshift", "hive",
    # Cloud & DevOps
    "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "k8s",
    "terraform", "ansible", "jenkins", "github actions", "ci/cd",
    "linux", "bash", "shell scripting",
    # BI & Analytics
    "power bi", "tableau", "looker", "excel", "google analytics",
    # Soft/Tools
    "git", "github", "gitlab", "jira", "confluence", "agile", "scrum",
    "microservices", "api", "json", "xml", "yaml",
}

DEGREE_KEYWORDS = [
    "b.tech", "btech", "b.e", "be", "bachelor", "b.sc", "bsc",
    "m.tech", "mtech", "m.e", "me", "master", "m.sc", "msc", "mba",
    "phd", "ph.d", "diploma", "associate",
]

SECTION_HEADERS = {
    "skills": ["skills", "technical skills", "core competencies", "technologies", "tech stack"],
    "experience": ["experience", "work experience", "employment", "work history", "professional experience"],
    "education": ["education", "academic background", "qualifications", "academic qualifications"],
    "projects": ["projects", "personal projects", "academic projects", "key projects"],
    "certifications": ["certifications", "certificates", "achievements", "awards"],
    "summary": ["summary", "objective", "profile", "about me", "professional summary"],
}


class ResumeParser:
    def __init__(self):
        self._nlp = None

    def _get_nlp(self):
        """Lazy load spaCy model."""
        if self._nlp is None:
            try:
                import spacy
                self._nlp = spacy.load("en_core_web_sm")
            except OSError:
                logger.warning("spaCy model not found. Using regex-only parsing.")
                self._nlp = None
        return self._nlp

    def extract_email(self, text: str) -> Optional[str]:
        pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        match = re.search(pattern, text)
        return match.group() if match else None

    def extract_phone(self, text: str) -> Optional[str]:
        patterns = [
            r'\+?[1-9]\d{1,2}[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}',
            r'\b\d{10}\b',
            r'\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b',
        ]
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return match.group()
        return None

    def extract_name(self, text: str) -> Optional[str]:
        """Extract name using spaCy NER or heuristic (first non-empty line)."""
        nlp = self._get_nlp()
        if nlp:
            lines = text.strip().split('\n')
            # Check first few lines for a PERSON entity
            for line in lines[:5]:
                if len(line.strip()) < 5 or len(line.strip()) > 60:
                    continue
                doc = nlp(line.strip())
                for ent in doc.ents:
                    if ent.label_ == "PERSON":
                        return ent.text
        # Fallback: return first meaningful line
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        if lines:
            first = lines[0]
            # Skip if it looks like a header or email
            if not re.search(r'@|\.com|resume|cv|curriculum', first.lower()):
                if len(first.split()) <= 4:
                    return first
        return None

    def extract_skills(self, text: str) -> List[str]:
        """Extract skills by matching against known skills list."""
        text_lower = text.lower()
        found_skills = []

        for skill in TECH_SKILLS:
            # Use word boundary matching
            pattern = r'\b' + re.escape(skill) + r'\b'
            if re.search(pattern, text_lower):
                # Format nicely
                found_skills.append(skill.title() if skill.islower() else skill)

        # Also look in Skills section specifically
        skills_section = self._extract_section(text, "skills")
        if skills_section:
            # Parse comma/newline/pipe separated skills
            raw = re.split(r'[,|\n•·▪●\-]', skills_section)
            for item in raw:
                item = item.strip()
                if 2 <= len(item) <= 40 and item not in found_skills:
                    found_skills.append(item)

        # Deduplicate and clean
        seen = set()
        result = []
        for skill in found_skills:
            normalized = skill.lower().strip()
            if normalized not in seen:
                seen.add(normalized)
                result.append(skill)

        return result[:50]  # Cap at 50 skills

    def extract_education(self, text: str) -> List[Dict[str, Any]]:
        """Extract education entries."""
        education = []
        edu_section = self._extract_section(text, "education")

        if not edu_section:
            edu_section = text

        lines = edu_section.split('\n')
        current_entry = {}

        for line in lines:
            line = line.strip()
            if not line:
                continue

            # Check for degree keywords
            line_lower = line.lower()
            if any(deg in line_lower for deg in DEGREE_KEYWORDS):
                if current_entry:
                    education.append(current_entry)
                current_entry = {"degree": line, "institution": "", "year": ""}

                # Try to extract year
                year_match = re.search(r'\b(19|20)\d{2}\b', line)
                if year_match:
                    current_entry["year"] = year_match.group()

            elif current_entry and not current_entry.get("institution"):
                current_entry["institution"] = line

        if current_entry:
            education.append(current_entry)

        return education

    def extract_experience(self, text: str) -> List[Dict[str, Any]]:
        """Extract work experience entries."""
        experience = []
        exp_section = self._extract_section(text, "experience")

        if not exp_section:
            return experience

        # Date range pattern: Jan 2022 - Present, 2020-2023, etc.
        date_pattern = r'((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s,]+\d{4}|\d{4})\s*[-–—to]+\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s,]+\d{4}|\d{4}|Present|Current)'

        blocks = re.split(date_pattern, exp_section, flags=re.IGNORECASE)

        # Simpler extraction: look for lines with company/role
        lines = exp_section.split('\n')
        current = {}
        descriptions = []

        for line in lines:
            line = line.strip()
            if not line:
                if current and descriptions:
                    current["description"] = " ".join(descriptions)
                    experience.append(current)
                    current = {}
                    descriptions = []
                continue

            date_match = re.search(date_pattern, line, re.IGNORECASE)
            if date_match and not current.get("title"):
                current["dates"] = date_match.group()
                current["title"] = re.sub(date_pattern, '', line).strip(' |-|–')
                current["company"] = ""
            elif current and not current.get("company") and not line.startswith('•'):
                current["company"] = line
            else:
                descriptions.append(line)

        if current:
            current["description"] = " ".join(descriptions)
            experience.append(current)

        return experience[:10]  # Cap at 10 entries

    def extract_projects(self, text: str) -> List[Dict[str, Any]]:
        """Extract project entries."""
        projects = []
        proj_section = self._extract_section(text, "projects")

        if not proj_section:
            return projects

        lines = proj_section.split('\n')
        current = {}
        desc_lines = []

        for line in lines:
            line = line.strip()
            if not line:
                if current:
                    current["description"] = " ".join(desc_lines)
                    projects.append(current)
                    current = {}
                    desc_lines = []
                continue

            # Project titles are usually shorter lines not starting with bullet
            if not line.startswith(('•', '-', '●', '▪')) and len(line) < 80 and not current:
                current = {"name": line, "description": "", "tech_stack": []}
            else:
                desc_lines.append(line.lstrip('•-●▪ '))

                # Extract tech stack from project description
                if current:
                    for skill in TECH_SKILLS:
                        if skill.lower() in line.lower():
                            if skill not in current.get("tech_stack", []):
                                current.setdefault("tech_stack", []).append(skill)

        if current:
            current["description"] = " ".join(desc_lines)
            projects.append(current)

        return projects[:10]

    def extract_certifications(self, text: str) -> List[str]:
        """Extract certifications."""
        cert_section = self._extract_section(text, "certifications")
        if not cert_section:
            return []

        certs = []
        for line in cert_section.split('\n'):
            line = line.strip().lstrip('•-●▪ ')
            if line and len(line) > 5:
                certs.append(line)

        return certs[:15]

    def estimate_years_of_experience(self, text: str, experience: List[Dict]) -> float:
        """Estimate total years of experience."""
        if not experience:
            # Try to find years in text
            patterns = [
                r'(\d+)\+?\s+years?\s+of\s+experience',
                r'experience\s+of\s+(\d+)\+?\s+years?',
            ]
            for pattern in patterns:
                match = re.search(pattern, text.lower())
                if match:
                    return float(match.group(1))
            return 0.0
        return min(float(len(experience)) * 1.5, 15.0)

    def _extract_section(self, text: str, section_type: str) -> Optional[str]:
        """Extract a specific section from resume text."""
        headers = SECTION_HEADERS.get(section_type, [])
        lines = text.split('\n')

        section_start = -1
        section_end = len(lines)

        # Find section start
        for i, line in enumerate(lines):
            line_clean = line.strip().lower().rstrip(':')
            if line_clean in headers or any(h in line_clean for h in headers):
                section_start = i + 1
                break

        if section_start == -1:
            return None

        # Find next section
        all_headers = [h for headers_list in SECTION_HEADERS.values() for h in headers_list]
        for i in range(section_start, len(lines)):
            line_clean = lines[i].strip().lower().rstrip(':')
            if line_clean in all_headers or any(h == line_clean for h in all_headers):
                section_end = i
                break

        section_text = '\n'.join(lines[section_start:section_end]).strip()
        return section_text if section_text else None

    def parse(self, text: str) -> Dict[str, Any]:
        """Main parse method - extracts all fields from resume text."""
        education = self.extract_education(text)
        experience = self.extract_experience(text)

        return {
            "name": self.extract_name(text),
            "email": self.extract_email(text),
            "phone": self.extract_phone(text),
            "skills": self.extract_skills(text),
            "education": education,
            "experience": experience,
            "projects": self.extract_projects(text),
            "certifications": self.extract_certifications(text),
            "summary": self._extract_section(text, "summary"),
            "years_of_experience": self.estimate_years_of_experience(text, experience),
        }


# Singleton instance
resume_parser = ResumeParser()
