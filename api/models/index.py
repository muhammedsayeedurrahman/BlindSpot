"""
BlindSpot Index
The core metric: a 0-100 score representing how "blind" a professional is
to threats in their career trajectory.

Formula:
  BSI = w1 * skill_decay + w2 * illusion_gap + w3 * market_mismatch + w4 * concentration_risk

Where:
  - skill_decay: avg automation risk of user's skills (0-100)
  - illusion_gap: avg illusion score from CompetenceIllusionDetector (0-100)
  - market_mismatch: how poorly skills match trending job requirements (0-100)
  - concentration_risk: how concentrated skills are in one category (0-100)
"""

from collections import Counter

from .data_loader import load_jobs

WEIGHTS = {
    "skill_decay": 0.30,
    "illusion_gap": 0.25,
    "market_mismatch": 0.25,
    "concentration_risk": 0.20,
}


class BlindSpotIndex:
    def __init__(self):
        self.jobs = list(load_jobs())

    def _skill_decay_score(self, survival_results):
        """Average automation risk across user skills, scaled 0-100."""
        if not survival_results:
            return 50
        avg_risk = sum(s["automation_risk"] for s in survival_results) / len(survival_results)
        return round(avg_risk * 100, 1)

    def _illusion_gap_score(self, illusion_results):
        """Average illusion score across user skills."""
        if not illusion_results:
            return 0
        return round(
            sum(r["illusion_score"] for r in illusion_results) / len(illusion_results),
            1,
        )

    def _market_mismatch_score(self, user_skill_names):
        """How well user skills match what jobs are asking for."""
        if not user_skill_names:
            return 100

        job_skills = Counter()
        for job in self.jobs:
            for s in job["required_skills"]:
                job_skills[s] += 1

        top_demanded = set(
            s for s, _ in job_skills.most_common(10)
        )
        user_set = set(user_skill_names)

        if not top_demanded:
            return 50

        overlap = len(user_set & top_demanded)
        match_ratio = overlap / len(top_demanded)

        return round((1 - match_ratio) * 100, 1)

    def _concentration_risk_score(self, survival_results):
        """Penalty for having skills all in one category."""
        if not survival_results:
            return 50
        categories = [s.get("category", "unknown") for s in survival_results]
        if not categories:
            return 50
        counter = Counter(categories)
        dominant_pct = counter.most_common(1)[0][1] / len(categories)
        return round(dominant_pct * 100, 1)

    def calculate(self, user_skill_names, survival_results, illusion_results):
        """Calculate the BlindSpot Index (0-100). Higher = more blind spots."""
        components = {
            "skill_decay": self._skill_decay_score(survival_results),
            "illusion_gap": self._illusion_gap_score(illusion_results),
            "market_mismatch": self._market_mismatch_score(user_skill_names),
            "concentration_risk": self._concentration_risk_score(survival_results),
        }

        bsi = sum(
            WEIGHTS[key] * value for key, value in components.items()
        )
        bsi = round(min(100, max(0, bsi)), 1)

        if bsi >= 70:
            level = "critical"
            message = "Significant blind spots detected. Immediate action recommended."
        elif bsi >= 45:
            level = "warning"
            message = "Notable blind spots found. Consider upskilling in emerging areas."
        elif bsi >= 25:
            level = "moderate"
            message = "Some blind spots present. You're on a decent path but could improve."
        else:
            level = "healthy"
            message = "Minimal blind spots. Your skill portfolio is well-positioned."

        return {
            "score": bsi,
            "level": level,
            "message": message,
            "components": components,
            "weights": WEIGHTS,
        }
