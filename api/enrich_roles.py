"""Vercel serverless function for POST /api/roles/enrich
Generates AI-powered role descriptions on-demand with in-memory caching.
"""

import json
import os
import sys
from http.server import BaseHTTPRequestHandler

sys.path.insert(0, os.path.dirname(__file__))

from models.ai_provider import AIProvider
from models.data_loader import load_roles_dict

_ai = AIProvider()
_cache = {}


def _build_prompt(role, role_data):
    """Build AI prompt for role enrichment."""
    category = role_data.get("category", "Technology")
    salary_2024 = int(role_data.get("avg_salary_2024", 0))
    salary_2027 = int(role_data.get("projected_salary_2027", 0))
    growth = float(role_data.get("openings_trend", 0)) * 100
    emerging = role_data.get("emerging_skills", "")
    if isinstance(emerging, list):
        emerging = ", ".join(emerging)

    return f"""You are a career advisor. For the role "{role}" in {category}:
- Salary: ${salary_2024 // 1000}k - ${salary_2027 // 1000}k
- Growth: {growth:.0f}%
- Key skills: {emerging}

Return JSON with exactly these fields:
{{
  "description": "2-3 sentences: what this role does day-to-day",
  "excitement": "1-2 sentences: why this role is exciting and impactful",
  "personality_fit": "1-2 sentences: what kind of person thrives here"
}}

Return ONLY valid JSON, no markdown formatting."""


def _fallback_description(role, role_data):
    """Template-based fallback when AI is unavailable."""
    category = role_data.get("category", "Technology")
    emerging = role_data.get("emerging_skills", "")
    if isinstance(emerging, str):
        skills = [s.strip() for s in emerging.split(";") if s.strip()]
    else:
        skills = list(emerging) if emerging else []
    growth = float(role_data.get("openings_trend", 0)) * 100

    skill_text = f"{skills[0]} and {skills[1]}" if len(skills) >= 2 else (skills[0] if skills else "emerging technologies")

    return {
        "description": f"This {category} role focuses on {skill_text}, combining technical expertise with strategic thinking to drive innovation.",
        "excitement": f"With {growth:.0f}% market growth, this is a high-demand career path with excellent long-term prospects.",
        "personality_fit": "Ideal for analytical thinkers who enjoy problem-solving and staying ahead of technology trends.",
    }


def _enrich_role(role):
    """Generate or retrieve cached enrichment for a single role."""
    if role in _cache:
        return _cache[role]

    roles_data = load_roles_dict()
    role_data = roles_data.get(role)

    if not role_data:
        result = {
            "description": f"A career focused on {role}, blending technical skills with industry expertise.",
            "excitement": "This emerging role offers strong growth potential in today's evolving job market.",
            "personality_fit": "Ideal for curious, adaptable professionals who enjoy continuous learning.",
        }
        _cache[role] = result
        return result

    prompt = _build_prompt(role, role_data)
    ai_result = _ai.generate_json(prompt, max_tokens=512, temperature=0.7)

    if (
        isinstance(ai_result, dict)
        and "description" in ai_result
        and "excitement" in ai_result
        and "personality_fit" in ai_result
    ):
        _cache[role] = ai_result
        return ai_result

    fallback = _fallback_description(role, role_data)
    _cache[role] = fallback
    return fallback


def _error_json(code, message, status_code=400):
    body = {"error": {"code": code, "message": message}}
    return json.dumps(body).encode(), status_code


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length)

        try:
            data = json.loads(body)
        except (json.JSONDecodeError, ValueError):
            err_body, status = _error_json("INVALID_JSON", "Request body must be valid JSON")
            self._respond(status, err_body)
            return

        roles = data.get("roles", [])
        if not roles or not isinstance(roles, list):
            err_body, status = _error_json(
                "VALIDATION_ERROR", "roles must be a non-empty array", 422
            )
            self._respond(status, err_body)
            return

        # Limit to 10 roles per request
        roles = roles[:10]

        results = {}
        for role in roles:
            if not isinstance(role, str) or not role.strip():
                continue
            results[role] = _enrich_role(role.strip())

        self._respond(200, json.dumps(results).encode())

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
