"""
Grammar Checker Service
Uses LanguageTool API to detect grammar and spelling issues
"""

import httpx
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)


async def check_grammar(text: str) -> List[Dict[str, Any]]:
    """
    Check grammar using LanguageTool API.
    Returns list of grammar issues with position and suggestions.
    """
    from app.config import settings

    # Truncate long texts to avoid API limits
    text_to_check = text[:10000]

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.post(
                f"{settings.LANGUAGETOOL_URL}/v2/check",
                data={
                    "text": text_to_check,
                    "language": "en-US",
                    "enabledOnly": "false",
                }
            )
            response.raise_for_status()
            data = response.json()

            issues = []
            for match in data.get("matches", []):
                # Filter out very minor issues
                if match.get("rule", {}).get("issueType") in ["typographical", "style", "grammar", "misspelling"]:
                    offset = match.get("offset", 0)
                    length = match.get("length", 0)
                    flagged_text = text_to_check[offset:offset+length]

                    # Filter out capitalized words, proper nouns, or tech skills flagged as spelling errors
                    if match.get("rule", {}).get("issueType") == "misspelling":
                        if flagged_text and (flagged_text[0].isupper() or flagged_text.isupper()):
                            continue
                        # Check technical skill filter
                        from app.services.resume_parser import TECH_SKILLS
                        if flagged_text.lower() in TECH_SKILLS:
                            continue

                    issues.append({
                        "message": match.get("message", ""),
                        "short_message": match.get("shortMessage", ""),
                        "offset": offset,
                        "length": length,
                        "context": match.get("context", {}).get("text", ""),
                        "context_offset": match.get("context", {}).get("offset", 0),
                        "rule_id": match.get("rule", {}).get("id", ""),
                        "issue_type": match.get("rule", {}).get("issueType", ""),
                        "replacements": [r["value"] for r in match.get("replacements", [])[:3]],
                        "flagged_text": flagged_text,
                    })

            return issues[:30]  # Cap at 30 issues

    except httpx.TimeoutException:
        logger.warning("LanguageTool API timeout")
        return []
    except httpx.HTTPError as e:
        logger.warning(f"LanguageTool API error: {e}")
        return []
    except Exception as e:
        logger.error(f"Grammar check error: {e}")
        return []


def compute_grammar_score(issues: List[Dict[str, Any]], text_length: int) -> float:
    """Compute a grammar quality score (0-100) based on issues found."""
    if text_length == 0:
        return 100.0

    # Weight by issue severity
    severity_weights = {
        "grammar": 3,
        "misspelling": 2,
        "style": 1,
        "typographical": 1,
    }

    weighted_issues = sum(
        severity_weights.get(issue.get("issue_type", "style"), 1)
        for issue in issues
    )

    # Normalize by text length (issues per 100 words)
    words = text_length // 5  # rough estimate
    issue_rate = weighted_issues / max(words / 100, 1)

    # Score: 100 = no issues, decreases with more issues
    score = max(0, 100 - (issue_rate * 15))
    return round(min(100, score), 1)
