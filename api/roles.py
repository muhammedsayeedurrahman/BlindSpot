"""Vercel serverless function for GET /api/roles"""

import json
import os
import sys
from http.server import BaseHTTPRequestHandler

sys.path.insert(0, os.path.dirname(__file__))

from models.data_loader import load_roles_list


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
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

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(result).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
