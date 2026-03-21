"""
Career Twin Engine
Creates a "digital twin" projection of the user's career 3 years into the future.
Generates two paths: current trajectory vs optimized trajectory.
Uses compound growth modeling with confidence intervals.
"""

from .data_loader import load_skills_dict, load_roles_list, load_jobs


class CareerTwinEngine:
    def __init__(self):
        self.skills_db = load_skills_dict()
        self.roles = list(load_roles_list())
        self.jobs = list(load_jobs())

    def _best_matching_role(self, user_skills):
        """Find the role that best matches the user's current skills."""
        best_role = None
        best_score = -1

        for role in self.roles:
            emerging = role["emerging_skills"].split(";")
            overlap = len(set(user_skills) & set(emerging))
            score = overlap / max(len(emerging), 1)
            if score > best_score:
                best_score = score
                best_role = role

        return best_role

    def _recommend_skills(self, user_skills, target_role):
        """Identify skills the user should learn for a target role."""
        emerging = target_role["emerging_skills"].split(";")
        missing = [s for s in emerging if s not in user_skills]

        recommendations = []
        for skill_name in missing:
            info = self.skills_db.get(skill_name, {})
            recommendations.append({
                "skill": skill_name,
                "priority": "high" if float(info.get("growth_rate", 0)) > 0.15 else "medium",
                "growth_rate": float(info.get("growth_rate", 0)),
                "category": info.get("category", "Unknown"),
            })

        return sorted(recommendations, key=lambda x: -x["growth_rate"])

    def _salary_projection(self, role, optimized=False):
        """
        Project salary over 3 years using compound growth with automation decay.
        Returns projection with confidence intervals (optimistic/pessimistic).
        """
        base = float(role["avg_salary_2024"])
        projected = float(role["projected_salary_2027"])
        automation = float(role["automation_exposure"])

        # Compound growth rate from projected salary
        annual_growth = ((projected / base) ** (1 / 3)) - 1

        # Apply automation exposure as a decay factor on current path
        if not optimized:
            decay = automation * 0.03  # High automation = salary drag
            annual_growth -= decay
        else:
            annual_growth += 0.03  # Upskilling bonus

        # Confidence intervals: +/- based on market volatility
        volatility = 0.02 + automation * 0.02  # More automation = more uncertainty

        years = []
        for y in range(4):
            base_salary = round(base * ((1 + annual_growth) ** y))
            optimistic = round(base * ((1 + annual_growth + volatility) ** y))
            pessimistic = round(base * ((1 + annual_growth - volatility) ** y))
            years.append({
                "year": 2024 + y,
                "salary": base_salary,
                "optimistic": optimistic,
                "pessimistic": pessimistic,
            })
        return years

    def _matching_jobs(self, user_skills):
        """Find jobs the user could apply for."""
        matches = []
        for job in self.jobs:
            required = set(job["required_skills"])
            user_set = set(user_skills)
            match_pct = len(user_set & required) / max(len(required), 1)
            if match_pct >= 0.25:
                matches.append({
                    "title": job["title"],
                    "company": job["company"],
                    "match_percentage": round(match_pct * 100),
                    "missing_skills": list(required - user_set),
                    "salary_range": job["salary_range"],
                })
        return sorted(matches, key=lambda x: -x["match_percentage"])[:5]

    def project(self, user_skills, current_role_name=None):
        """Generate current vs optimized career twin projections."""
        matched_role = self._best_matching_role(user_skills)
        if not matched_role:
            matched_role = self.roles[0]

        role_name = matched_role["role"]
        recommended = self._recommend_skills(user_skills, matched_role)

        current_projection = self._salary_projection(matched_role, optimized=False)
        current_path = {
            "role": role_name,
            "salary_projection": current_projection,
            "automation_exposure": float(matched_role["automation_exposure"]),
            "risk_level": "high" if float(matched_role["automation_exposure"]) > 0.3 else "moderate",
        }

        # Optimized path: assumes user learns recommended skills
        optimized_role = self._find_optimal_role(user_skills, recommended)
        optimized_projection = self._salary_projection(optimized_role, optimized=True)
        optimized_path = {
            "role": optimized_role["role"],
            "salary_projection": optimized_projection,
            "automation_exposure": float(optimized_role["automation_exposure"]),
            "risk_level": "low" if float(optimized_role["automation_exposure"]) < 0.15 else "moderate",
        }

        return {
            "current_path": current_path,
            "optimized_path": optimized_path,
            "recommended_skills": recommended[:5],
            "matching_jobs": self._matching_jobs(user_skills),
            "roadmap": self._build_roadmap(recommended[:5]),
        }

    def _find_optimal_role(self, user_skills, recommended):
        """Find the best role if user learns recommended skills."""
        future_skills = list(user_skills) + [r["skill"] for r in recommended[:3]]
        best_role = None
        best_score = -1

        for role in self.roles:
            emerging = role["emerging_skills"].split(";")
            overlap = len(set(future_skills) & set(emerging))
            growth = float(role["openings_trend"])
            score = overlap * (1 + growth)
            if score > best_score:
                best_score = score
                best_role = role

        return best_role or self.roles[0]

    def _build_roadmap(self, recommended):
        """Create a quarter-by-quarter learning roadmap."""
        roadmap = []
        quarters = ["Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025"]

        for i, skill in enumerate(recommended):
            q = quarters[min(i, len(quarters) - 1)]
            roadmap.append({
                "quarter": q,
                "skill": skill["skill"],
                "priority": skill["priority"],
                "action": f"Learn {skill['skill']} through projects and courses",
                "milestone": f"Build a project using {skill['skill']}",
            })

        return roadmap
