"""
Multi-provider AI text generation with automatic failover.

Supports: Gemini (native SDK), Groq, Mistral, OpenRouter (all via OpenAI SDK).
Falls through providers in order until one succeeds.
"""

import json
import logging
import os

logger = logging.getLogger(__name__)

# (name, env_key_options, default_model, base_url_or_None)
_PROVIDERS = [
    ("gemini", ("GEMINI_API_KEY", "GOOGLE_API_KEY"), "gemini-2.5-flash", None),
    ("groq", ("GROQ_API_KEY",), "llama-3.3-70b-versatile", "https://api.groq.com/openai/v1"),
    ("mistral", ("MISTRAL_API_KEY",), "mistral-small-latest", "https://api.mistral.ai/v1"),
    ("openrouter", ("OPENROUTER_API_KEY",), "mistralai/mistral-7b-instruct:free", "https://openrouter.ai/api/v1"),
]

_TIMEOUT = 5  # seconds per provider attempt


def _get_key(env_keys):
    """Return the first non-empty env var value from the tuple of key names."""
    for key in env_keys:
        val = os.environ.get(key)
        if val:
            return val
    return None


def _try_gemini(prompt, api_key, model, max_tokens, temperature):
    """Generate text via Google Gemini native SDK."""
    import google.generativeai as genai

    genai.configure(api_key=api_key)
    gm = genai.GenerativeModel(model)
    response = gm.generate_content(
        prompt,
        generation_config=genai.types.GenerationConfig(
            temperature=temperature,
            max_output_tokens=max_tokens,
        ),
        request_options={"timeout": _TIMEOUT},
    )
    return response.text.strip()


def _try_openai_compat(prompt, api_key, model, base_url, max_tokens, temperature):
    """Generate text via OpenAI-compatible API (Groq, Mistral, OpenRouter)."""
    from openai import OpenAI

    client = OpenAI(api_key=api_key, base_url=base_url, timeout=_TIMEOUT)
    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=max_tokens,
        temperature=temperature,
    )
    return response.choices[0].message.content.strip()


class AIProvider:
    """Provider-agnostic AI text generation with automatic failover."""

    def generate(self, prompt, max_tokens=256, temperature=0.7):
        """Try each configured provider in order until one succeeds.

        Returns the generated text, or None if all providers fail.
        """
        for name, env_keys, model, base_url in _PROVIDERS:
            api_key = _get_key(env_keys)
            if not api_key:
                continue

            try:
                if name == "gemini":
                    text = _try_gemini(prompt, api_key, model, max_tokens, temperature)
                else:
                    text = _try_openai_compat(prompt, api_key, model, base_url, max_tokens, temperature)

                if text:
                    logger.info("AI generated via %s", name)
                    return text
            except Exception as e:
                logger.warning("AI provider %s failed: %s", name, e)
                continue

        logger.info("All AI providers failed or unconfigured, using fallback")
        return None

    def generate_json(self, prompt, max_tokens=2048, temperature=0.7):
        """Generate text and parse it as JSON. Returns list/dict or None."""
        text = self.generate(prompt, max_tokens=max_tokens, temperature=temperature)
        if not text:
            return None

        # Strip markdown code fences if present
        cleaned = text.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()

        try:
            return json.loads(cleaned)
        except (json.JSONDecodeError, ValueError):
            logger.warning("Failed to parse AI response as JSON")
            return None
