"""
Competence Illusion Detector
Identifies the gap between perceived skill confidence and actual market relevance.
The "illusion" is when someone rates themselves highly on a skill that is declining
or easily automated.
"""

from .data_loader import load_skills_dict


class CompetenceIllusionDetector:
    def __init__(self):
        self.skills_db = load_skills_dict()

    def detect(self, user_skills_with_confidence):
        """
        Accepts list of {"skill": str, "confidence": int (1-10)}
        Returns illusion scores and warnings.
        """
        results = []

        for entry in user_skills_with_confidence:
            skill_name = entry["skill"]
            confidence = entry.get("confidence", 5)
            info = self.skills_db.get(skill_name)

            if not info:
                results.append({
                    "skill": skill_name,
                    "confidence": confidence,
                    "market_relevance": 50,
                    "illusion_score": 0,
                    "warning": None,
                })
                continue

            # Market relevance: weighted combo of future demand and growth
            market_relevance = (
                info["demand_2027"] * 0.6
                + (1 - info["automation_risk"]) * 100 * 0.4
            )

            # Normalize confidence to 0-100 scale
            confidence_pct = confidence * 10

            # Illusion score: how much confidence exceeds market reality
            illusion_score = round(
                max(0, confidence_pct - market_relevance), 1
            )

            warning = None
            if illusion_score > 30:
                warning = f"High illusion: You rate {skill_name} at {confidence}/10 but market demand is dropping and automation risk is {info['automation_risk']:.0%}"
            elif illusion_score > 15:
                warning = f"Moderate illusion: {skill_name} confidence may not match future market value"

            results.append({
                "skill": skill_name,
                "confidence": confidence,
                "market_relevance": round(market_relevance, 1),
                "illusion_score": illusion_score,
                "warning": warning,
            })

        return sorted(results, key=lambda x: -x["illusion_score"])
