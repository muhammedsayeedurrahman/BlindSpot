"""
BlindSpot AI Platform - Flask API
POST /api/analyze — accepts user profile, returns full career intelligence.
GET  /api/skills  — returns all tracked skills.
GET  /api/roles   — returns all career roles.
GET  /api/health  — health check.
"""

import logging
import sys

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from models.data_loader import load_skills_list, load_roles_list
from models.survival import SkillSurvivalAnalyzer
from models.illusion import CompetenceIllusionDetector
from models.index import BlindSpotIndex
from models.twin import CareerTwinEngine
from models.courses import CourseRecommendationEngine
from models.insights import InsightEngine
from models.benchmark import BenchmarkEngine

# ── Logging ────────────────────────────────────────────────────
logging.basicConfig(
    stream=sys.stdout,
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)

# ── App ────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)

limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["60 per minute"],
    storage_uri="memory://",
)


@app.errorhandler(429)
def ratelimit_handler(e):
    return jsonify({
        "error": {
            "code": "RATE_LIMIT_EXCEEDED",
            "message": "Too many requests. Please try again later.",
        }
    }), 429

# Initialize engines once
survival_analyzer = SkillSurvivalAnalyzer()
illusion_detector = CompetenceIllusionDetector()
blindspot_index = BlindSpotIndex()
twin_engine = CareerTwinEngine()
course_engine = CourseRecommendationEngine()
insight_engine = InsightEngine()
benchmark_engine = BenchmarkEngine()


# ── Validation ─────────────────────────────────────────────────

def _validate_analyze_request(data):
    """Validate POST /api/analyze body. Returns (cleaned, errors)."""
    errors = []

    if not isinstance(data, dict):
        return None, [{"field": "body", "message": "Request body must be a JSON object"}]

    # Required: skills
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

    # Optional: years_experience
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


def _error_response(code, message, details=None, status_code=400):
    """Structured error envelope."""
    body = {"error": {"code": code, "message": message}}
    if details:
        body["error"]["details"] = details
    return jsonify(body), status_code


# ── Endpoints ──────────────────────────────────────────────────

@app.route("/api/analyze", methods=["POST"])
@limiter.limit("10 per minute")
def analyze():
    """Full career analysis from user profile + skills."""
    data = request.get_json(silent=True)
    if data is None:
        return _error_response("INVALID_JSON", "Request body must be valid JSON")

    cleaned, errors = _validate_analyze_request(data)
    if errors:
        return _error_response("VALIDATION_ERROR", "Input validation failed", details=errors, status_code=422)

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

        return jsonify({
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
        })
    except Exception:
        logger.exception("Analysis failed")
        return _error_response("ANALYSIS_ERROR", "An unexpected error occurred during analysis", status_code=500)


@app.route("/api/skills", methods=["GET"])
def list_skills():
    """Return all tracked skills with metadata."""
    skills = load_skills_list()
    return jsonify(list(skills))


@app.route("/api/roles", methods=["GET"])
def list_roles():
    """Return all career roles with projections."""
    roles = load_roles_list()
    result = []
    for r in roles:
        result.append({
            "role": r["role"],
            "category": r["category"],
            "avg_salary_2024": int(r["avg_salary_2024"]),
            "projected_salary_2027": int(r["projected_salary_2027"]),
            "openings_trend": float(r["openings_trend"]),
            "automation_exposure": float(r["automation_exposure"]),
            "emerging_skills": r["emerging_skills"].split(";"),
        })
    return jsonify(result)


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "blindspot-api"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
