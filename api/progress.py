"""Vercel serverless function for GET/POST /api/progress"""

import json
import logging
import os
import sys
from http.server import BaseHTTPRequestHandler

sys.path.insert(0, os.path.dirname(__file__))

logger = logging.getLogger(__name__)


def _get_user_id(headers):
    """Extract user ID from Supabase auth token."""
    auth_header = headers.get("Authorization", "")
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
    except Exception as e:
        logger.warning("Auth token verification failed: %s", e)
        return None


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        user_id = _get_user_id(self.headers)
        if not user_id:
            self._respond(401, json.dumps({"error": "Unauthorized"}).encode())
            return

        try:
            from models.db import get_supabase

            db = get_supabase()
            if not db:
                self._respond(503, json.dumps({"error": "Database unavailable"}).encode())
                return

            result = db.table("journey_progress").select("*").eq("user_id", user_id).maybe_single().execute()
            data = result.data or {
                "selected_paths": {},
                "quiz_scores": {},
                "completed_skills": [],
                "evolution_choices": {},
                "journey_step": 0,
            }
            self._respond(200, json.dumps(data).encode())
        except Exception as e:
            logger.error("Failed to load progress: %s", e)
            self._respond(500, json.dumps({"error": "Internal server error"}).encode())

    def do_POST(self):
        user_id = _get_user_id(self.headers)
        if not user_id:
            self._respond(401, json.dumps({"error": "Unauthorized"}).encode())
            return

        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length)

        try:
            payload = json.loads(body)
        except (json.JSONDecodeError, ValueError):
            self._respond(400, json.dumps({"error": "Invalid JSON"}).encode())
            return

        try:
            from models.db import get_supabase

            db = get_supabase()
            if not db:
                self._respond(503, json.dumps({"error": "Database unavailable"}).encode())
                return

            row = {
                "user_id": user_id,
                "selected_paths": payload.get("selected_paths", {}),
                "quiz_scores": payload.get("quiz_scores", {}),
                "completed_skills": payload.get("completed_skills", []),
                "evolution_choices": payload.get("evolution_choices", {}),
                "journey_step": payload.get("journey_step", 0),
            }
            db.table("journey_progress").upsert(row, on_conflict="user_id").execute()
            self._respond(200, json.dumps({"ok": True}).encode())
        except Exception as e:
            logger.error("Failed to save progress: %s", e)
            self._respond(500, json.dumps({"error": "Internal server error"}).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def _respond(self, status, body):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)
