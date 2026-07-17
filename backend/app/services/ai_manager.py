"""
AIManager - Unified multi-provider LLM manager
Supports OpenRouter, Gemini, OpenAI, Mistral, Grok, and local Ollama.
Includes fallback mocks for easy local development without API keys.
"""

import json
import logging
import httpx
import requests
from typing import Dict, Any, Optional
from app.config import settings
from app.database.mongodb_client import get_mongodb_db

logger = logging.getLogger(__name__)

# Default model settings per provider
PROVIDER_MODELS = {
    "openrouter": "google/gemini-2.5-flash",
    "gemini": "gemini-1.5-flash",
    "openai": "gpt-4o-mini",
    "mistral": "mistral-large-latest",
    "grok": "grok-2-1212",
    "ollama": "llama3",
}

class AIManager:
    def __init__(self):
        self._db = None

    def _get_db(self):
        if self._db is None:
            self._db = get_mongodb_db()
        return self._db

    def _get_user_settings(self, user_id: Optional[str]) -> Dict[str, Any]:
        """Fetch user settings (custom model preference and API keys) from MongoDB."""
        defaults = {
            "selected_provider": "openrouter",
            "selected_model": PROVIDER_MODELS["openrouter"],
            "api_keys": {}
        }
        if not user_id:
            return defaults

        db = self._get_db()
        if db is not None:
            try:
                settings_record = db["settings"].find_one({"user_id": user_id})
                if settings_record:
                    return {
                        "selected_provider": settings_record.get("selected_provider", "openrouter"),
                        "selected_model": settings_record.get("selected_model", PROVIDER_MODELS["openrouter"]),
                        "api_keys": settings_record.get("api_keys", {})
                    }
            except Exception as e:
                logger.error(f"Error fetching user settings: {e}")
        return defaults

    def generate_text(self, prompt: str, user_id: Optional[str] = None) -> str:
        """Generate plain text from prompt based on active provider settings."""
        # 1. Fetch preferences
        pref = self._get_user_settings(user_id)
        provider = pref["selected_provider"]
        model = pref["selected_model"] or PROVIDER_MODELS.get(provider, "")
        user_keys = pref.get("api_keys", {})

        logger.info(f"Routing request to provider: {provider}, model: {model}")

        # Log calls for admin console statistics
        self._log_api_call(provider, model)

        # 2. Route based on provider
        try:
            if provider == "gemini":
                api_key = user_keys.get("gemini") or settings.GEMINI_API_KEY
                if api_key:
                    import google.generativeai as genai
                    genai.configure(api_key=api_key)
                    g_model = genai.GenerativeModel(model)
                    response = g_model.generate_content(prompt)
                    return response.text.strip()
                
            elif provider == "openai":
                api_key = user_keys.get("openai") or settings.OPENAI_API_KEY
                if api_key:
                    res = requests.post(
                        "https://api.openai.com/v1/chat/completions",
                        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                        json={"model": model, "messages": [{"role": "user", "content": prompt}]},
                        timeout=60
                    )
                    res.raise_for_status()
                    return res.json()["choices"][0]["message"]["content"].strip()

            elif provider == "mistral":
                api_key = user_keys.get("mistral") or settings.MISTRAL_API_KEY
                if api_key:
                    res = requests.post(
                        "https://api.mistral.ai/v1/chat/completions",
                        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                        json={"model": model, "messages": [{"role": "user", "content": prompt}]},
                        timeout=60
                    )
                    res.raise_for_status()
                    return res.json()["choices"][0]["message"]["content"].strip()

            elif provider == "grok":
                api_key = user_keys.get("grok") or settings.GROK_API_KEY
                if api_key:
                    res = requests.post(
                        "https://api.x.ai/v1/chat/completions",
                        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                        json={"model": model, "messages": [{"role": "user", "content": prompt}]},
                        timeout=60
                    )
                    res.raise_for_status()
                    return res.json()["choices"][0]["message"]["content"].strip()

            elif provider == "ollama":
                base_url = settings.OLLAMA_BASE_URL
                res = requests.post(
                    f"{base_url}/api/generate",
                    json={"model": model, "prompt": prompt, "stream": False},
                    timeout=60
                )
                res.raise_for_status()
                return res.json()["response"].strip()

            # OpenRouter (default or fallback)
            api_key = user_keys.get("openrouter") or settings.OPENROUTER_API_KEY
            if not api_key:
                raise ValueError("OpenRouter API key is missing. Please configure it in your Settings or .env file.")
            res = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json={"model": model, "messages": [{"role": "user", "content": prompt}]},
                timeout=60
            )
            res.raise_for_status()
            return res.json()["choices"][0]["message"]["content"].strip()

        except Exception as e:
            logger.error(f"Error calling {provider}: {e}. Falling back to default Gemini OpenRouter.")
            # Fallback to OpenRouter with pre-configured key
            try:
                fallback_key = settings.OPENROUTER_API_KEY
                if not fallback_key:
                    raise ValueError("OpenRouter API key is missing for fallback. Please configure it in your .env file.")
                res = requests.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers={"Authorization": f"Bearer {fallback_key}", "Content-Type": "application/json"},
                    json={"model": "google/gemini-2.5-flash", "messages": [{"role": "user", "content": prompt}]},
                    timeout=60
                )
                return res.json()["choices"][0]["message"]["content"].strip()
            except Exception as fe:
                logger.error(f"Fallback call failed: {fe}")
                raise Exception("All AI models and fallbacks failed to respond. Please check your network and API keys.")

    def generate_json(self, prompt: str, user_id: Optional[str] = None) -> Any:
        """Generate structured JSON data from prompt."""
        text = self.generate_text(prompt, user_id)
        cleaned_text = text.strip()
        if cleaned_text.startswith("```"):
            cleaned_text = cleaned_text.split("```")[1]
            if cleaned_text.startswith("json"):
                cleaned_text = cleaned_text[4:]
        try:
            return json.loads(cleaned_text.strip())
        except json.JSONDecodeError as jde:
            logger.error(f"Failed to decode response as JSON: {cleaned_text}. Error: {jde}")
            raise

    def _log_api_call(self, provider: str, model: str):
        """Save api call counts to database for admin stats."""
        db = self._get_db()
        if db is not None:
            try:
                import datetime
                db["api_logs"].insert_one({
                    "provider": provider,
                    "model": model,
                    "timestamp": datetime.datetime.utcnow().isoformat()
                })
            except:
                pass

ai_manager = AIManager()
