"""
Skill Survival Analysis
Estimates the "half-life" of each skill — how long before it loses 50% of its market value.
Uses demand trends, automation risk, and growth rate from skills.csv.
"""

import csv
import math
import os

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "skills.csv")


def _load_skills():
    skills = []
    with open(DATA_PATH, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            skills.append({
                "skill": row["skill"],
                "category": row["category"],
                "demand_2024": float(row["demand_2024"]),
                "demand_2027": float(row["demand_2027"]),
                "growth_rate": float(row["growth_rate"]),
                "automation_risk": float(row["automation_risk"]),
            })
    return skills


class SkillSurvivalAnalyzer:
    def __init__(self):
        self.skills_db = {s["skill"]: s for s in _load_skills()}

    def half_life_years(self, skill_name):
        """Estimate years until a skill loses 50% market relevance."""
        skill = self.skills_db.get(skill_name)
        if not skill:
            return None

        growth = skill["growth_rate"]
        auto_risk = skill["automation_risk"]

        # Decay rate: negative growth + automation pressure
        decay = max(0.01, auto_risk - growth)
        # Half-life formula: t = ln(2) / decay_rate
        return round(math.log(2) / decay, 1)

    def analyze(self, user_skills):
        """Return survival analysis for a list of user skills."""
        results = []
        for skill_name in user_skills:
            info = self.skills_db.get(skill_name)
            if not info:
                results.append({
                    "skill": skill_name,
                    "half_life_years": 5.0,
                    "status": "unknown",
                    "automation_risk": 0.3,
                    "growth_rate": 0.0,
                    "demand_trend": "stable",
                })
                continue

            hl = self.half_life_years(skill_name)
            if hl is None:
                hl = 5.0

            if info["growth_rate"] > 0.15:
                trend = "rising"
            elif info["growth_rate"] < -0.05:
                trend = "declining"
            else:
                trend = "stable"

            if hl > 10:
                status = "thriving"
            elif hl > 5:
                status = "stable"
            elif hl > 2:
                status = "at_risk"
            else:
                status = "critical"

            results.append({
                "skill": skill_name,
                "half_life_years": hl,
                "status": status,
                "automation_risk": info["automation_risk"],
                "growth_rate": info["growth_rate"],
                "demand_trend": trend,
            })

        return sorted(results, key=lambda x: x["half_life_years"])
