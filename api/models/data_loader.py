"""
Centralized data loader for all CSV and JSON data files.
Loads once per process, caches with @lru_cache. Returns immutable tuples.
"""

import csv
import json
import os
from functools import lru_cache

_DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")


@lru_cache(maxsize=1)
def load_skills_list():
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


@lru_cache(maxsize=1)
def load_skills_dict():
    """Load skills.csv as a dict keyed by skill name."""
    return {s["skill"]: s for s in load_skills_list()}


@lru_cache(maxsize=1)
def load_roles_list():
    """Load roles.csv as a tuple of raw row dicts."""
    path = os.path.join(_DATA_DIR, "roles.csv")
    roles = []
    with open(path, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            roles.append(dict(row))
    return tuple(roles)


@lru_cache(maxsize=1)
def load_roles_dict():
    """Load roles.csv as a dict keyed by role name."""
    return {r["role"]: r for r in load_roles_list()}


@lru_cache(maxsize=1)
def load_jobs():
    """Load job_posts.json as a tuple."""
    path = os.path.join(_DATA_DIR, "job_posts.json")
    with open(path, encoding="utf-8") as f:
        return tuple(json.load(f))


@lru_cache(maxsize=1)
def load_courses():
    """Load courses.json as a tuple."""
    path = os.path.join(_DATA_DIR, "courses.json")
    with open(path, encoding="utf-8") as f:
        return tuple(json.load(f))
