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

survival_analyzer = SkillSurvivalAnalyzer()
illusion_detector = CompetenceIllusionDetector()
blindspot_index = BlindSpotIndex()
twin_engine = CareerTwinEngine()


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length)
        data = json.loads(body)

        if not data or "skills" not in data:
            self.send_response(400)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Missing required field: skills"}).encode())
            return

        skills_with_confidence = data["skills"]
        skill_names = [s["skill"] for s in skills_with_confidence]

        survival = survival_analyzer.analyze(skill_names)
        illusion = illusion_detector.detect(skills_with_confidence)
        bsi = blindspot_index.calculate(skill_names, survival, illusion)
        twin = twin_engine.project(skill_names, data.get("current_role"))

        result = {
            "profile": {
                "name": data.get("name", "Anonymous"),
                "current_role": data.get("current_role", "Unknown"),
                "years_experience": data.get("years_experience", 0),
            },
            "blindspot_index": bsi,
            "skill_survival": survival,
            "competence_illusion": illusion,
            "career_twin": twin,
        }

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(result).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
