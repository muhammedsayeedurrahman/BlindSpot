"""
BlindSpot AI Platform - Flask API
POST /api/analyze — accepts user profile, returns full career intelligence.
"""

from flask import Flask, jsonify, request
from flask_cors import CORS

from models.survival import SkillSurvivalAnalyzer
from models.illusion import CompetenceIllusionDetector
from models.index import BlindSpotIndex
from models.twin import CareerTwinEngine

app = Flask(__name__)
CORS(app)

survival_analyzer = SkillSurvivalAnalyzer()
illusion_detector = CompetenceIllusionDetector()
blindspot_index = BlindSpotIndex()
twin_engine = CareerTwinEngine()


@app.route("/api/analyze", methods=["POST"])
def analyze():
    """
    Expects JSON:
    {
      "name": "Jane Doe",
      "current_role": "Frontend Developer",
      "years_experience": 5,
      "skills": [
        {"skill": "React", "confidence": 8},
        {"skill": "JavaScript", "confidence": 9},
        {"skill": "TypeScript", "confidence": 6},
        {"skill": "CSS", "confidence": 7}
      ]
    }
    """
    data = request.get_json()
    if not data or "skills" not in data:
        return jsonify({"error": "Missing required field: skills"}), 400

    skills_with_confidence = data["skills"]
    skill_names = [s["skill"] for s in skills_with_confidence]

    survival = survival_analyzer.analyze(skill_names)
    illusion = illusion_detector.detect(skills_with_confidence)
    bsi = blindspot_index.calculate(skill_names, survival, illusion)
    twin = twin_engine.project(skill_names, data.get("current_role"))

    return jsonify({
        "profile": {
            "name": data.get("name", "Anonymous"),
            "current_role": data.get("current_role", "Unknown"),
            "years_experience": data.get("years_experience", 0),
        },
        "blindspot_index": bsi,
        "skill_survival": survival,
        "competence_illusion": illusion,
        "career_twin": twin,
    })


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "blindspot-api"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
