"""
Benchmark Engine
Compares user's profile against industry averages for their role across
5 dimensions, producing normalized 0-100 scores for a radar chart.
"""

from .data_loader import load_skills_dict, load_roles_dict


class BenchmarkEngine:
    def __init__(self):
        self.skills_db = load_skills_dict()
        self.roles_db = load_roles_dict()

    def compare(self, user_skills, current_role):
        """
        Compare user profile against industry benchmarks.

        Args:
            user_skills: List of skill name strings
            current_role: User's current role string

        Returns:
            dict with user_scores, industry_avg, and summary text
        """
        role_data = self.roles_db.get(current_role, {})
        emerging = role_data.get("emerging_skills", "").split(";") if role_data else []

        user = {
            "skill_breadth": self._skill_breadth(user_skills, emerging),
            "automation_readiness": self._automation_readiness(user_skills),
            "market_alignment": self._market_alignment(user_skills),
            "growth_potential": self._growth_potential(user_skills),
            "salary_position": self._salary_position(user_skills, role_data),
        }

        industry = {
            "skill_breadth": 60,
            "automation_readiness": 55,
            "market_alignment": 50,
            "growth_potential": 50,
            "salary_position": 50,
        }

        # Generate summary
        above = [k for k in user if user[k] > industry[k]]
        below = [k for k in user if user[k] < industry[k]]

        above_labels = [self._label(k) for k in above]
        below_labels = [self._label(k) for k in below]

        if above_labels and below_labels:
            summary = (
                f"You're above average in {', '.join(above_labels[:2])}, "
                f"but below in {', '.join(below_labels[:2])}."
            )
        elif above_labels:
            summary = f"You're above the industry average across all dimensions — strong profile."
        else:
            summary = f"Your profile has room for improvement in {', '.join(below_labels[:2])}."

        return {
            "user_scores": user,
            "industry_avg": industry,
            "summary": summary,
        }

    def _skill_breadth(self, user_skills, emerging_skills):
        """How many skills does the user have vs role expectations?"""
        expected = max(len(emerging_skills), 4)
        ratio = min(len(user_skills) / expected, 2.0)
        return min(round(ratio * 50), 100)

    def _automation_readiness(self, user_skills):
        """Lower automation risk = higher readiness score."""
        if not user_skills:
            return 0

        risks = []
        for skill in user_skills:
            info = self.skills_db.get(skill, {})
            risks.append(float(info.get("automation_risk", 0.3)))

        avg_risk = sum(risks) / len(risks)
        # Invert: low risk = high readiness
        return round((1 - avg_risk) * 100)

    def _market_alignment(self, user_skills):
        """Overlap with top 10 highest-demand skills."""
        # Get top 10 skills by 2027 demand
        ranked = sorted(
            self.skills_db.values(),
            key=lambda s: float(s.get("demand_2027", 0)),
            reverse=True,
        )[:10]
        top_names = {s["skill"] for s in ranked}

        overlap = len(set(user_skills) & top_names)
        return round((overlap / 10) * 100)

    def _growth_potential(self, user_skills):
        """Average growth rate of user's skills normalized to 0-100."""
        if not user_skills:
            return 0

        rates = []
        for skill in user_skills:
            info = self.skills_db.get(skill, {})
            rates.append(float(info.get("growth_rate", 0)))

        avg_rate = sum(rates) / len(rates)
        # Growth rates range roughly -0.25 to 0.50
        # Normalize: -0.25 → 0, 0.50 → 100
        normalized = (avg_rate + 0.25) / 0.75 * 100
        return round(max(0, min(100, normalized)))

    def _salary_position(self, user_skills, role_data):
        """Implied salary percentile based on skill match quality."""
        if not role_data:
            return 50

        emerging = role_data.get("emerging_skills", "").split(";")
        match_ratio = len(set(user_skills) & set(emerging)) / max(len(emerging), 1)

        # More skill overlap with role's emerging skills = higher salary position
        base = 30
        bonus = round(match_ratio * 70)
        return min(base + bonus, 100)

    def _label(self, key):
        """Human-readable label for dimension keys."""
        labels = {
            "skill_breadth": "Skill Breadth",
            "automation_readiness": "Automation Readiness",
            "market_alignment": "Market Alignment",
            "growth_potential": "Growth Potential",
            "salary_position": "Salary Position",
        }
        return labels.get(key, key)
