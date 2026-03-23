"""
Centralized data loader for all CSV and JSON data files.
Tries Supabase first, falls back to local CSV/JSON files.
Local fallback uses @lru_cache for single-process caching.
"""

import csv
import json
import logging
import os
from functools import lru_cache

from .db import get_supabase

logger = logging.getLogger(__name__)

_DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")


def load_skills_list():
    """Load skills from Supabase, falling back to skills.csv."""
    db = get_supabase()
    if db:
        try:
            result = db.table("skills").select("*").execute()
            if result.data:
                logger.info("Loaded %d skills from Supabase", len(result.data))
                return tuple(result.data)
        except Exception as e:
            logger.warning("Supabase skills query failed: %s", e)
    return _load_skills_csv()


@lru_cache(maxsize=1)
def _load_skills_csv():
    """Load skills.csv as a tuple of dicts (each with typed values)."""
    path = os.path.join(_DATA_DIR, "skills.csv")
    skills = []
    with open(path, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            skills.append({
                "skill": row["skill"],
                "category": row["category"],
                "demand_2024": float(row["demand_2024"]),
                "demand_2027": float(row["demand_2027"]),
                "growth_rate": float(row["growth_rate"]),
                "automation_risk": float(row["automation_risk"]),
            })
    return tuple(skills)


def load_skills_dict():
    """Load skills as a dict keyed by skill name."""
    return {s["skill"]: s for s in load_skills_list()}


def load_roles_list():
    """Load roles from Supabase, falling back to roles.csv."""
    db = get_supabase()
    if db:
        try:
            result = db.table("roles").select("*").execute()
            if result.data:
                logger.info("Loaded %d roles from Supabase", len(result.data))
                return tuple(result.data)
        except Exception as e:
            logger.warning("Supabase roles query failed: %s", e)
    return _load_roles_csv()


@lru_cache(maxsize=1)
def _load_roles_csv():
    """Load roles.csv as a tuple of raw row dicts."""
    path = os.path.join(_DATA_DIR, "roles.csv")
    roles = []
    with open(path, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            roles.append(dict(row))
    return tuple(roles)


def load_roles_dict():
    """Load roles as a dict keyed by role name."""
    return {r["role"]: r for r in load_roles_list()}


def load_jobs():
    """Load job posts from Supabase or job_posts.json."""
    return _load_jobs_json()


@lru_cache(maxsize=1)
def _load_jobs_json():
    """Load job_posts.json as a tuple."""
    path = os.path.join(_DATA_DIR, "job_posts.json")
    with open(path, encoding="utf-8") as f:
        return tuple(json.load(f))


def load_courses():
    """Load courses from Supabase or courses.json."""
    return _load_courses_json()


@lru_cache(maxsize=1)
def _load_courses_json():
    """Load courses.json as a tuple."""
    path = os.path.join(_DATA_DIR, "courses.json")
    with open(path, encoding="utf-8") as f:
        return tuple(json.load(f))
