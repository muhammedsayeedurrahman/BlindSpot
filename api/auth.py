"""Vercel serverless function for POST /api/auth/anonymous"""

import json
import logging
import os
import sys
from http.server import BaseHTTPRequestHandler

sys.path.insert(0, os.path.dirname(__file__))

logger = logging.getLogger(__name__)


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        """Create an anonymous Supabase session."""
        try:
            from models.db import get_supabase

            db = get_supabase()
            if not db:
                self._respond(503, json.dumps({"error": "Database unavailable"}).encode())
                return

            result = db.auth.sign_in_anonymously()
            if result and result.session:
                self._respond(200, json.dumps({
                    "access_token": result.session.access_token,
                    "refresh_token": result.session.refresh_token,
                    "user_id": result.user.id,
                }).encode())
            else:
                self._respond(500, json.dumps({"error": "Failed to create anonymous session"}).encode())
        except Exception as e:
            logger.error("Anonymous auth failed: %s", e)
            self._respond(500, json.dumps({"error": "Authentication failed"}).encode())

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
