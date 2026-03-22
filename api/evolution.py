"""Vercel serverless function for GET /api/evolution?skill=Excel"""

import json
import os
import sys
from http.server import BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse

sys.path.insert(0, os.path.dirname(__file__))

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "evolution_paths.json")

GENERIC_PATHS = [
    {"type": "upgrade", "label": "Deepen Expertise", "skills": ["Advanced Patterns", "Best Practices"], "months": 3},
    {"type": "expand", "label": "Broaden Skillset", "skills": ["Related Tools", "Complementary Skills"], "months": 5},
    {"type": "career", "label": "Career Pivot", "role": "Senior Engineer", "skills": ["System Design", "Leadership", "Architecture"], "months": 10},
]


def _load_paths():
    try:
        with open(DATA_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)
        skill = params.get("skill", [None])[0]

        all_paths = _load_paths()

        if skill:
            match = next((p for p in all_paths if p["skill"].lower() == skill.lower()), None)
            if match:
                result = match
            else:
                result = {"skill": skill, "paths": GENERIC_PATHS}
            self._respond(200, json.dumps(result).encode())
        else:
            self._respond(200, json.dumps(all_paths).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def _respond(self, status, body):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)
