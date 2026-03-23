"""
BlindSpot AI Platform - Flask API
POST /api/analyze — accepts user profile, returns full career intelligence.
GET  /api/skills  — returns all tracked skills.
GET  /api/roles   — returns all career roles.
GET  /api/health  — health check.
"""

import logging
import os
import sys

from dotenv import load_dotenv
from flask import Flask, jsonify, request

# Load .env from project root
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
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
from models.assessment import AssessmentEngine

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
assessment_engine = AssessmentEngine()


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

        # === NEW: Assessment-enhanced BSI (delete block to revert) ===
        assessment_results = data.get("assessment_results")
        if assessment_results:
            bsi = blindspot_index.calculate_with_assessment(
                skill_names, survival, illusion, assessment_results
            )
        else:
            bsi = blindspot_index.calculate(skill_names, survival, illusion)
        # === END Assessment-enhanced BSI ===

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

        # === NEW: Include assessment data in response (delete block to revert) ===
        if assessment_results:
            result["assessment_data"] = assessment_results
            result["ai_verified"] = True
        # === END assessment passthrough ===

        return jsonify(result)
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


# === NEW: Assessment routes (delete block to revert) ===
@app.route("/api/assess", methods=["POST"])
@limiter.limit("20 per minute")
def assess():
    """Generate quiz questions or score answers."""
    data = request.get_json(silent=True)
    if data is None:
        return _error_response("INVALID_JSON", "Request body must be valid JSON")

    action = data.get("action", "generate")

    if action == "generate":
        skills = data.get("skills", [])
        if not skills or not isinstance(skills, list):
            return _error_response("VALIDATION_ERROR", "skills must be a non-empty array", status_code=422)
        try:
            questions = assessment_engine.generate_questions(skills)
            return jsonify({"questions": questions})
        except Exception:
            logger.exception("Question generation failed")
            return _error_response("GENERATION_ERROR", "Failed to generate questions", status_code=500)

    elif action == "score":
        questions = data.get("questions", [])
        answers = data.get("answers", [])
        skills = data.get("skills", [])
        if not questions or not answers:
            return _error_response("VALIDATION_ERROR", "questions and answers are required", status_code=422)
        try:
            results = assessment_engine.score_answers(questions, answers, skills)
            return jsonify(results)
        except Exception:
            logger.exception("Scoring failed")
            return _error_response("SCORING_ERROR", "Failed to score answers", status_code=500)

    return _error_response("INVALID_ACTION", f"Unknown action: {action}")
# === END Assessment routes ===


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "blindspot-api"})


# ── Role Enrichment ──────────────────────────────────────────

_enrich_cache = {}


def _build_enrich_prompt(role, role_data):
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


def _fallback_enrich(role, role_data):
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


def _enrich_single_role(role):
    """Generate or retrieve cached enrichment for a single role."""
    if role in _enrich_cache:
        return _enrich_cache[role]

    from models.data_loader import load_roles_dict
    from models.ai_provider import AIProvider

    roles_data = load_roles_dict()
    role_data = roles_data.get(role)

    if not role_data:
        result = {
            "description": f"A career focused on {role}, blending technical skills with industry expertise.",
            "excitement": "This emerging role offers strong growth potential in today's evolving job market.",
            "personality_fit": "Ideal for curious, adaptable professionals who enjoy continuous learning.",
        }
        _enrich_cache[role] = result
        return result

    prompt = _build_enrich_prompt(role, role_data)
    ai_result = AIProvider().generate_json(prompt, max_tokens=512, temperature=0.7)

    if (
        isinstance(ai_result, dict)
        and "description" in ai_result
        and "excitement" in ai_result
        and "personality_fit" in ai_result
    ):
        _enrich_cache[role] = ai_result
        return ai_result

    fallback = _fallback_enrich(role, role_data)
    _enrich_cache[role] = fallback
    return fallback


@app.route("/api/roles/enrich", methods=["POST"])
@limiter.limit("20 per minute")
def enrich_roles():
    """Generate AI-powered role descriptions on demand."""
    data = request.get_json(silent=True)
    if data is None:
        return _error_response("INVALID_JSON", "Request body must be valid JSON")

    roles = data.get("roles", [])
    if not roles or not isinstance(roles, list):
        return _error_response("VALIDATION_ERROR", "roles must be a non-empty array", status_code=422)

    # Limit to 10 roles per request
    roles = roles[:10]

    results = {}
    for role in roles:
        if not isinstance(role, str) or not role.strip():
            continue
        results[role] = _enrich_single_role(role.strip())

    return jsonify(results)


# ── Evolution paths ───────────────────────────────────────────

import json as _json

_EVOLUTION_DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'api', 'data', 'evolution_paths.json')
_GENERIC_EVOLUTION = [
    {"type": "upgrade", "label": "Deepen Expertise", "skills": ["Advanced Patterns", "Best Practices"], "months": 3},
    {"type": "expand", "label": "Broaden Skillset", "skills": ["Related Tools", "Complementary Skills"], "months": 5},
    {"type": "career", "label": "Career Pivot", "role": "Senior Engineer", "skills": ["System Design", "Leadership", "Architecture"], "months": 10},
]


@app.route("/api/evolution", methods=["GET"])
def evolution():
    """Return evolution paths for a skill (or all skills)."""
    all_paths = []

    # Try Supabase first
    try:
        from models.db import get_supabase
        db = get_supabase()
        if db:
            result = db.table("evolution_paths").select("*").execute()
            if result.data:
                all_paths = result.data
    except Exception:
        pass

    # Fallback to JSON file
    if not all_paths:
        try:
            with open(_EVOLUTION_DATA_PATH, "r", encoding="utf-8") as f:
                all_paths = _json.load(f)
        except (FileNotFoundError, _json.JSONDecodeError):
            all_paths = []

    skill = request.args.get("skill")
    if skill:
        match = next((p for p in all_paths if p["skill"].lower() == skill.lower()), None)
        return jsonify(match if match else {"skill": skill, "paths": _GENERIC_EVOLUTION})
    return jsonify(all_paths)


# ── Explain endpoint ──────────────────────────────────────────

import time as _time

_explain_rate = {}
_EXPLAIN_WINDOW = 60
_EXPLAIN_MAX = 30

_EXPLAIN_TEMPLATES = {
    "skill_risk": "This skill is experiencing market shifts due to automation trends and changing industry demands. Consider diversifying into adjacent technologies to maintain your competitive edge.",
    "role_fit": "This role aligns with your current skill profile. The match score reflects both your existing competencies and the gap between your skills and the role's requirements.",
    "next_step": "Based on your current trajectory, this is the recommended next action to improve your career resilience and market positioning.",
}


@app.route("/api/explain", methods=["POST"])
@limiter.limit("30 per minute")
def explain():
    """Generate AI explanation for a given context."""
    data = request.get_json(silent=True)
    if data is None:
        return _error_response("INVALID_JSON", "Request body must be valid JSON")

    context_type = data.get("context_type", "next_step")
    context_data = data.get("data", {})

    if context_type not in ("skill_risk", "role_fit", "next_step"):
        return _error_response("INVALID_TYPE", f"Invalid context_type: {context_type}")

    # Try AI providers (Gemini → Groq → Mistral → OpenRouter)
    from models.ai_provider import AIProvider

    prompts = {
        "skill_risk": f"In 2-3 sentences, explain why the skill '{context_data.get('skill', 'this skill')}' is at risk. Data: {_json.dumps(context_data)}",
        "role_fit": f"In 2-3 sentences, explain why '{context_data.get('role', 'this role')}' fits with match score {context_data.get('match_score', 'N/A')}%. Data: {_json.dumps(context_data)}",
        "next_step": f"In 2-3 sentences, explain why this is the recommended next step. Data: {_json.dumps(context_data)}",
    }

    result = AIProvider().generate(prompts[context_type], max_tokens=256)
    if result:
        return jsonify({"explanation": result})

    return jsonify({"explanation": _EXPLAIN_TEMPLATES.get(context_type, _EXPLAIN_TEMPLATES["next_step"])})


# ── Progress sync endpoint ────────────────────────────────────

def _get_user_id_from_request():
    """Extract user ID from Supabase auth token in Authorization header."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    token = auth_header[7:]
    try:
        from models.db import get_supabase
        db = get_supabase()
        if not db:
            return None
        user = db.auth.get_user(token)
        return user.user.id if user and user.user else None
    except Exception:
        return None


@app.route("/api/progress", methods=["GET", "POST"])
@limiter.limit("30 per minute")
def progress():
    """Sync journey progress to/from Supabase."""
    user_id = _get_user_id_from_request()
    if not user_id:
        return _error_response("UNAUTHORIZED", "Valid auth token required", status_code=401)

    from models.db import get_supabase
    db = get_supabase()
    if not db:
        return _error_response("DB_UNAVAILABLE", "Database not configured", status_code=503)

    if request.method == "GET":
        result = db.table("journey_progress").select("*").eq("user_id", user_id).maybe_single().execute()
        data = result.data or {
            "selected_paths": {},
            "quiz_scores": {},
            "completed_skills": [],
            "evolution_choices": {},
            "journey_step": 0,
        }
        return jsonify(data)

    # POST — upsert progress
    payload = request.get_json(silent=True)
    if not payload:
        return _error_response("INVALID_JSON", "Request body must be valid JSON")

    row = {
        "user_id": user_id,
        "selected_paths": payload.get("selected_paths", {}),
        "quiz_scores": payload.get("quiz_scores", {}),
        "completed_skills": payload.get("completed_skills", []),
        "evolution_choices": payload.get("evolution_choices", {}),
        "journey_step": payload.get("journey_step", 0),
    }
    db.table("journey_progress").upsert(row, on_conflict="user_id").execute()
    return jsonify({"ok": True})


@app.route("/api/auth/anonymous", methods=["POST"])
@limiter.limit("10 per minute")
def auth_anonymous():
    """Create an anonymous Supabase session."""
    from models.db import get_supabase
    db = get_supabase()
    if not db:
        return _error_response("DB_UNAVAILABLE", "Database not configured", status_code=503)

    try:
        result = db.auth.sign_in_anonymously()
        if result and result.session:
            return jsonify({
                "access_token": result.session.access_token,
                "refresh_token": result.session.refresh_token,
                "user_id": result.user.id,
            })
        return _error_response("AUTH_ERROR", "Failed to create anonymous session", status_code=500)
    except Exception:
        logger.exception("Anonymous auth failed")
        return _error_response("AUTH_ERROR", "Authentication failed", status_code=500)


if __name__ == "__main__":
    app.run(debug=True, port=5000)
