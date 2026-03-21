"""Vercel serverless function for POST /api/analyze"""

import json
import os
import sys
from http.server import BaseHTTPRequestHandler

# Ensure api/ is on the path so models can be imported
sys.path.insert(0, os.path.dirname(__file__))

from models.survival import SkillSurvivalAnalyzer
from models.illusion import CompetenceIllusionDetector
from models.index import BlindSpotIndex
from models.twin import CareerTwinEngine
from models.courses import CourseRecommendationEngine
from models.insights import InsightEngine
from models.benchmark import BenchmarkEngine

survival_analyzer = SkillSurvivalAnalyzer()
illusion_detector = CompetenceIllusionDetector()
blindspot_index = BlindSpotIndex()
twin_engine = CareerTwinEngine()
course_engine = CourseRecommendationEngine()
insight_engine = InsightEngine()
benchmark_engine = BenchmarkEngine()


def _validate_request(data):
    """Validate analyze request. Returns (cleaned, errors)."""
    errors = []

    if not isinstance(data, dict):
        return None, [{"field": "body", "message": "Request body must be a JSON object"}]

    skills = data.get("skills")
    if not skills:
        errors.append({"field": "skills", "message": "Required field 'skills' is missing or empty"})
    elif not isinstance(skills, list):
        errors.append({"field": "skills", "message": "'skills' must be an array"})
    elif len(skills) < 1:
        errors.append({"field": "skills", "message": "At least 1 skill is required"})
    else:
        for i, s in enumerate(skills):
            if not isinstance(s, dict):
                errors.append({"field": f"skills[{i}]", "message": "Each skill must be an object"})
                continue
            if "skill" not in s or not isinstance(s.get("skill"), str) or not s["skill"].strip():
                errors.append({"field": f"skills[{i}].skill", "message": "Skill name is required"})
            conf = s.get("confidence")
            if conf is not None:
                if not isinstance(conf, (int, float)) or conf < 1 or conf > 10:
                    errors.append({
                        "field": f"skills[{i}].confidence",
                        "message": "Confidence must be a number between 1 and 10",
                    })

    years = data.get("years_experience")
    if years is not None:
        if not isinstance(years, (int, float)) or years < 0 or years > 50:
            errors.append({
                "field": "years_experience",
                "message": "years_experience must be a number between 0 and 50",
            })

    if errors:
        return None, errors

    cleaned = {
        "name": str(data.get("name", "Anonymous")).strip()[:100],
        "current_role": str(data.get("current_role", "Software Engineer")).strip(),
        "years_experience": int(data.get("years_experience", 0)),
        "linkedin_url": str(data.get("linkedin_url", "")).strip()[:200],
        "github_username": str(data.get("github_username", "")).strip()[:50],
        "skills": [
            {
                "skill": s["skill"].strip(),
                "confidence": int(s.get("confidence", 5)),
            }
            for s in skills
        ],
    }
    return cleaned, []


def _error_json(code, message, details=None, status_code=400):
    """Return (body_bytes, status_code)."""
    body = {"error": {"code": code, "message": message}}
    if details:
        body["error"]["details"] = details
    return json.dumps(body).encode(), status_code


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length)

        try:
            data = json.loads(body)
        except (json.JSONDecodeError, ValueError):
            err_body, status = _error_json("INVALID_JSON", "Request body must be valid JSON")
            self.send_response(status)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(err_body)
            return

        cleaned, errors = _validate_request(data)
        if errors:
            err_body, status = _error_json(
                "VALIDATION_ERROR", "Input validation failed", details=errors, status_code=422
            )
            self.send_response(status)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(err_body)
            return

        try:
            skills_with_confidence = cleaned["skills"]
            skill_names = [s["skill"] for s in skills_with_confidence]

            survival = survival_analyzer.analyze(skill_names)
            illusion = illusion_detector.detect(skills_with_confidence)
            bsi = blindspot_index.calculate(skill_names, survival, illusion)
            twin = twin_engine.project(skill_names, cleaned["current_role"])

            optimized_role = twin.get("optimized_path", {}).get("role", cleaned["current_role"])

            courses = course_engine.recommend(
                twin.get("recommended_skills", []),
                cleaned["current_role"],
                optimized_role,
            )
            ai_insights = insight_engine.generate(bsi, survival, illusion, twin)
            benchmarks = benchmark_engine.compare(skill_names, cleaned["current_role"])

            result = {
                "profile": {
                    "name": cleaned["name"],
                    "current_role": cleaned["current_role"],
                    "years_experience": cleaned["years_experience"],
                    "linkedin_url": cleaned["linkedin_url"],
                    "github_username": cleaned["github_username"],
                },
                "blindspot_index": bsi,
                "skill_survival": survival,
                "competence_illusion": illusion,
                "career_twin": twin,
                "course_recommendations": courses,
                "ai_insights": ai_insights,
                "benchmarks": benchmarks,
            }

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(result).encode())

        except Exception:
            err_body, status = _error_json(
                "ANALYSIS_ERROR", "An unexpected error occurred during analysis", status_code=500
            )
            self.send_response(status)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(err_body)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
