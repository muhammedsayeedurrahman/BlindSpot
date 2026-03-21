"""
Course Recommendation Engine
Matches recommended skills to context-aware courses based on the user's
current role and target (optimized) role.
"""

from .data_loader import load_courses

# Maps role categories to course contexts for smarter matching
ROLE_CONTEXT_MAP = {
    "Data Scientist": ["data_science", "ai_ml", "engineering"],
    "Data Analyst": ["data_science", "business", "transition"],
    "ML Engineer": ["ai_ml", "engineering", "infrastructure"],
    "AI Engineer": ["ai_ml", "engineering", "infrastructure"],
    "Frontend Developer": ["web_development", "engineering", "design"],
    "Backend Developer": ["backend", "engineering", "infrastructure"],
    "Full Stack Developer": ["web_development", "backend", "engineering"],
    "Software Engineer": ["engineering", "web_development", "backend"],
    "DevOps Engineer": ["infrastructure", "engineering", "security"],
    "Cloud Architect": ["infrastructure", "ai_ml", "security"],
    "Cybersecurity Analyst": ["security", "infrastructure", "engineering"],
    "Product Manager": ["management", "business", "leadership"],
    "Project Manager": ["management", "leadership", "business"],
    "UX Designer": ["design", "general"],
    "Technical Writer": ["engineering", "ai_ml", "general"],
    "QA Engineer": ["transition", "engineering", "infrastructure"],
}


class CourseRecommendationEngine:
    def __init__(self):
        self.courses = list(load_courses())

    def _get_context_for_skill(self, skill, target_role):
        """Determine the best course context for a skill given the target role."""
        preferred_contexts = ROLE_CONTEXT_MAP.get(target_role, ["engineering", "general"])
        return preferred_contexts

    def _score_course(self, course, preferred_contexts, target_role):
        """Score a course based on context match and target role relevance."""
        score = 0

        # Context match bonus (higher = better)
        if course["context"] in preferred_contexts:
            idx = preferred_contexts.index(course["context"])
            score += (len(preferred_contexts) - idx) * 10

        # Target role match bonus
        if target_role in course.get("target_roles", []):
            score += 15

        # Rating bonus
        score += course.get("rating", 0) * 2

        # Free courses get a small bonus
        if course.get("free", False):
            score += 3

        return score

    def recommend(self, recommended_skills, current_role, optimized_role):
        """
        Generate context-aware course recommendations.

        Args:
            recommended_skills: List of skill dicts from CareerTwinEngine
                                [{"skill": "Python", "priority": "high", ...}]
            current_role: User's current role string
            optimized_role: Target optimized role string

        Returns:
            List of recommendation groups, one per skill.
        """
        target_role = optimized_role or current_role
        recommendations = []

        for skill_rec in recommended_skills:
            skill_name = skill_rec["skill"]
            preferred_contexts = self._get_context_for_skill(skill_name, target_role)

            # Find matching courses for this skill
            matching = [c for c in self.courses if c["skill"] == skill_name]

            # Score and sort
            scored = sorted(
                matching,
                key=lambda c: self._score_course(c, preferred_contexts, target_role),
                reverse=True,
            )

            # Take top 2-3 courses
            top_courses = scored[:3]

            if not top_courses:
                continue

            # Determine context explanation
            context_label = self._context_label(preferred_contexts[0] if preferred_contexts else "general")

            recommendations.append({
                "skill": skill_name,
                "priority": skill_rec.get("priority", "medium"),
                "context": context_label,
                "reason": self._build_reason(skill_name, target_role, preferred_contexts),
                "courses": [
                    {
                        "id": c["id"],
                        "title": c["title"],
                        "provider": c["provider"],
                        "difficulty": c["difficulty"],
                        "estimated_hours": c["estimated_hours"],
                        "topics": c["topics"],
                        "rating": c["rating"],
                        "free": c["free"],
                    }
                    for c in top_courses
                ],
            })

        return recommendations

    def _context_label(self, context):
        """Human-readable context label."""
        labels = {
            "data_science": "Data Science",
            "web_development": "Web Development",
            "backend": "Backend Development",
            "engineering": "Software Engineering",
            "ai_ml": "AI & Machine Learning",
            "infrastructure": "Cloud & Infrastructure",
            "security": "Cybersecurity",
            "design": "Design",
            "management": "Management",
            "business": "Business Analytics",
            "leadership": "Leadership",
            "general": "General",
            "transition": "Career Transition",
            "automation": "Automation",
            "systems": "Systems Programming",
        }
        return labels.get(context, context.replace("_", " ").title())

    def _build_reason(self, skill, target_role, preferred_contexts):
        """Build a human-readable reason for recommending this skill in this context."""
        context_label = self._context_label(preferred_contexts[0] if preferred_contexts else "general")
        return (
            f"Your target role {target_role} requires {skill} proficiency "
            f"with a {context_label} focus."
        )
