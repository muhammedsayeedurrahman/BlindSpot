"""Vercel serverless function for POST /api/explain"""

import json
import logging
import os
import sys
import time
from http.server import BaseHTTPRequestHandler

sys.path.insert(0, os.path.dirname(__file__))

logger = logging.getLogger(__name__)

# Simple in-memory rate limiting
_rate_limit = {}
RATE_LIMIT_MAX = 30
RATE_LIMIT_WINDOW = 60  # seconds

FALLBACK_TEMPLATES = {
    "skill_risk": "This skill is experiencing market shifts due to automation trends and changing industry demands. Consider diversifying into adjacent technologies to maintain your competitive edge.",
    "role_fit": "This role aligns with your current skill profile. The match score reflects both your existing competencies and the gap between your skills and the role's requirements.",
    "next_step": "Based on your current trajectory, this is the recommended next action to improve your career resilience and market positioning.",
}


def _check_rate_limit(client_ip):
    """Returns True if request is allowed, False if rate-limited."""
    now = time.time()
    # Clean old entries
    cutoff = now - RATE_LIMIT_WINDOW
    _rate_limit[client_ip] = [t for t in _rate_limit.get(client_ip, []) if t > cutoff]

    if len(_rate_limit.get(client_ip, [])) >= RATE_LIMIT_MAX:
        return False

    _rate_limit.setdefault(client_ip, []).append(now)
    return True


def _generate_explanation(context_type, data):
    """Generate explanation via Gemini, with fallback to templates."""
    try:
        import google.generativeai as genai

        api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
        if not api_key:
            return FALLBACK_TEMPLATES.get(context_type, FALLBACK_TEMPLATES["next_step"])

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-2.0-flash")

        prompts = {
            "skill_risk": f"In 2-3 sentences, explain why the skill '{data.get('skill', 'this skill')}' is at risk in the job market. Be specific about automation trends and market demand shifts. Data: {json.dumps(data)}",
            "role_fit": f"In 2-3 sentences, explain why the role '{data.get('role', 'this role')}' is a good fit based on the user's skills. Mention the match score of {data.get('match_score', 'N/A')}% and what skills they'd need. Data: {json.dumps(data)}",
            "next_step": f"In 2-3 sentences, explain why this is the recommended next step for the user's career growth. Be encouraging but specific. Data: {json.dumps(data)}",
        }

        prompt = prompts.get(context_type, prompts["next_step"])

        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                max_output_tokens=256,
            ),
            request_options={"timeout": 5},
        )

        return response.text.strip()

    except Exception as e:
        logger.warning("Gemini explanation failed: %s", e)
        return FALLBACK_TEMPLATES.get(context_type, FALLBACK_TEMPLATES["next_step"])


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        client_ip = self.headers.get("X-Forwarded-For", self.client_address[0] if self.client_address else "unknown")

        if not _check_rate_limit(client_ip):
            self._respond(429, json.dumps({"error": "Rate limit exceeded. Try again later."}).encode())
            return

        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length)

        try:
            payload = json.loads(body)
        except (json.JSONDecodeError, ValueError):
            self._respond(400, json.dumps({"error": "Invalid JSON"}).encode())
            return

        context_type = payload.get("context_type", "next_step")
        data = payload.get("data", {})

        if context_type not in ("skill_risk", "role_fit", "next_step"):
            self._respond(400, json.dumps({"error": f"Invalid context_type: {context_type}"}).encode())
            return

        explanation = _generate_explanation(context_type, data)
        self._respond(200, json.dumps({"explanation": explanation}).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def _respond(self, status, body):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)
