"""Vercel serverless function for POST /api/assess
=== NEW: Assessment endpoint (delete file to remove) ===
"""

import json
import os
import sys
from http.server import BaseHTTPRequestHandler

sys.path.insert(0, os.path.dirname(__file__))

from models.assessment import AssessmentEngine

assessment_engine = AssessmentEngine()


def _error_json(code, message, details=None, status_code=400):
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
            self._respond(status, err_body)
            return

        action = data.get("action", "generate")

        if action == "generate":
            skills = data.get("skills", [])
            if not skills or not isinstance(skills, list):
                err_body, status = _error_json(
                    "VALIDATION_ERROR", "skills must be a non-empty array", status_code=422
                )
                self._respond(status, err_body)
                return

            questions = assessment_engine.generate_questions(skills)
            self._respond(200, json.dumps({"questions": questions}).encode())

        elif action == "score":
            questions = data.get("questions", [])
            answers = data.get("answers", [])
            skills = data.get("skills", [])
            if not questions or not answers:
                err_body, status = _error_json(
                    "VALIDATION_ERROR", "questions and answers are required", status_code=422
                )
                self._respond(status, err_body)
                return

            results = assessment_engine.score_answers(questions, answers, skills)
            self._respond(200, json.dumps(results).encode())

        else:
            err_body, status = _error_json("INVALID_ACTION", f"Unknown action: {action}")
            self._respond(status, err_body)

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
