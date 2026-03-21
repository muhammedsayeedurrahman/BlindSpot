"""
AI Insight Engine
Generates career insights using Google Gemini API with a rule-based fallback
when the API key is unavailable or the call fails.
"""

import os


def _try_gemini(prompt):
    """Attempt to generate insights via Gemini API. Returns None on failure."""
    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        return None

    try:
        import google.generativeai as genai

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(prompt)
        return response.text
    except Exception:
        return None


def _parse_gemini_response(text):
    """Parse structured Gemini response into 4 insight cards."""
    sections = {
        "career_direction": "",
        "skill_gaps": "",
        "market_positioning": "",
        "action_items": "",
    }

    current_key = None
    lines = text.strip().split("\n")

    key_map = {
        "career direction": "career_direction",
        "skill gap": "skill_gaps",
        "market positioning": "market_positioning",
        "action item": "action_items",
        "immediate action": "action_items",
    }

    for line in lines:
        line_lower = line.lower().strip()
        matched = False
        for trigger, key in key_map.items():
            if trigger in line_lower and (line_lower.startswith("#") or line_lower[0:3].rstrip(". ").isdigit()):
                current_key = key
                matched = True
                break
        if not matched and current_key:
            cleaned = line.strip().lstrip("- ").strip()
            if cleaned:
                if sections[current_key]:
                    sections[current_key] += " " + cleaned
                else:
                    sections[current_key] = cleaned

    # Fallback: if parsing failed, split text into quarters
    filled = [v for v in sections.values() if v]
    if len(filled) < 2:
        chunks = text.strip().split("\n\n")
        keys = list(sections.keys())
        for i, chunk in enumerate(chunks[:4]):
            clean = " ".join(
                l.strip().lstrip("#-0123456789. ")
                for l in chunk.split("\n")
                if l.strip()
            )
            if i < len(keys):
                sections[keys[i]] = clean

    return sections


class InsightEngine:
    """Generates 4 career insight cards from analysis data."""

    INSIGHT_TITLES = {
        "career_direction": {"title": "Career Direction", "icon": "compass"},
        "skill_gaps": {"title": "Skill Gap Analysis", "icon": "target"},
        "market_positioning": {"title": "Market Positioning", "icon": "chart"},
        "action_items": {"title": "Immediate Action Items", "icon": "lightning"},
    }

    def generate(self, bsi, survival, illusion, twin):
        """
        Generate insights from analysis results.

        Args:
            bsi: BlindSpot Index result dict
            survival: Skill survival analysis list
            illusion: Competence illusion list
            twin: Career twin projection dict

        Returns:
            dict with "insights" list and "source" flag
        """
        # Build the prompt with all analysis data
        prompt = self._build_prompt(bsi, survival, illusion, twin)

        # Try Gemini first
        ai_text = _try_gemini(prompt)
        if ai_text:
            parsed = _parse_gemini_response(ai_text)
            return self._format_insights(parsed, source="ai")

        # Fallback to rule-based insights
        rule_based = self._rule_based_insights(bsi, survival, illusion, twin)
        return self._format_insights(rule_based, source="rule_based")

    def _build_prompt(self, bsi, survival, illusion, twin):
        critical_skills = [
            s["skill"] for s in survival if s["status"] in ("critical", "at_risk")
        ]
        illusion_skills = [
            s["skill"] for s in illusion if s.get("illusion_score", 0) > 15
        ]
        recommended = [
            s["skill"] for s in twin.get("recommended_skills", [])
        ]
        optimized_role = twin.get("optimized_path", {}).get("role", "Unknown")

        current_salary = twin.get("current_path", {}).get("salary_projection", [{}])
        optimized_salary = twin.get("optimized_path", {}).get("salary_projection", [{}])
        current_final = current_salary[-1].get("salary", 0) if current_salary else 0
        optimized_final = optimized_salary[-1].get("salary", 0) if optimized_salary else 0
        uplift = optimized_final - current_final

        return f"""You are a career intelligence advisor. Based on this analysis:
- BlindSpot Index: {bsi['score']:.0f}/100 ({bsi['level']})
- Skills at risk: {', '.join(critical_skills) if critical_skills else 'None'}
- Competence illusions: {', '.join(illusion_skills) if illusion_skills else 'None'}
- Recommended path: {optimized_role}
- Recommended skills to learn: {', '.join(recommended)}
- Salary uplift potential: ${uplift:,}

Provide 4 concise insights (2-3 sentences each):
1. Career Direction
2. Skill Gap Analysis
3. Market Positioning
4. Immediate Action Items

Format each as a numbered section with a title line followed by the insight text. Be specific and actionable."""

    def _rule_based_insights(self, bsi, survival, illusion, twin):
        """Generate insights from templates based on analysis data."""
        score = bsi["score"]
        level = bsi["level"]
        components = bsi.get("components", {})

        critical_skills = [s["skill"] for s in survival if s["status"] == "critical"]
        at_risk_skills = [s["skill"] for s in survival if s["status"] == "at_risk"]
        thriving_skills = [s["skill"] for s in survival if s["status"] == "thriving"]

        illusion_skills = [
            s for s in illusion if s.get("illusion_score", 0) > 15
        ]

        recommended = twin.get("recommended_skills", [])
        optimized_role = twin.get("optimized_path", {}).get("role", "Unknown")
        current_role = twin.get("current_path", {}).get("role", "Unknown")

        current_salary = twin.get("current_path", {}).get("salary_projection", [])
        optimized_salary = twin.get("optimized_path", {}).get("salary_projection", [])

        # Career Direction
        if score >= 70:
            career = (
                f"Your career profile shows significant vulnerabilities with a BSI of {score:.0f}. "
                f"Transitioning toward {optimized_role} would substantially reduce your risk exposure "
                f"and align your skills with high-growth market segments."
            )
        elif score >= 45:
            career = (
                f"Your career trajectory has notable blind spots (BSI: {score:.0f}). "
                f"The path from {current_role} to {optimized_role} is achievable and would "
                f"strengthen your market position significantly."
            )
        else:
            career = (
                f"Your career foundation is relatively strong (BSI: {score:.0f}). "
                f"Consider evolving toward {optimized_role} to maximize your growth potential "
                f"and stay ahead of market shifts."
            )

        # Skill Gaps
        if critical_skills:
            skill_gap = (
                f"{len(critical_skills)} of your skills ({', '.join(critical_skills[:3])}) are in the critical decay zone "
                f"with less than 2 years of market relevance remaining. "
                f"Prioritize learning {recommended[0]['skill'] if recommended else 'emerging technologies'} "
                f"to replace these declining competencies."
            )
        elif at_risk_skills:
            skill_gap = (
                f"{len(at_risk_skills)} skills are showing signs of market erosion. "
                f"While not yet critical, {', '.join(at_risk_skills[:3])} should be supplemented with "
                f"{', '.join(r['skill'] for r in recommended[:2])} to maintain competitiveness."
            )
        else:
            skill_gap = (
                f"Your skill portfolio is well-maintained with {len(thriving_skills)} thriving skills. "
                f"To accelerate growth, add {', '.join(r['skill'] for r in recommended[:2])} "
                f"which are seeing high demand in your target field."
            )

        # Market Positioning
        market_mismatch = components.get("market_mismatch", 0)
        if market_mismatch > 60:
            market = (
                f"Your skill portfolio has limited overlap ({100 - market_mismatch:.0f}%) with the top demanded skills in the market. "
                f"This creates a significant competitive disadvantage in the job market. "
                f"Focus on high-growth areas like {', '.join(r['skill'] for r in recommended[:2])} to close this gap."
            )
        elif market_mismatch > 35:
            market = (
                f"Your market alignment is moderate at {100 - market_mismatch:.0f}% overlap with top demanded skills. "
                f"Strengthening your portfolio with {recommended[0]['skill'] if recommended else 'in-demand skills'} "
                f"would improve your positioning for higher-paying opportunities."
            )
        else:
            market = (
                f"Your skills are well-aligned with current market demands ({100 - market_mismatch:.0f}% overlap). "
                f"Maintain this advantage by staying current with emerging trends "
                f"and deepening expertise in your strongest areas."
            )

        # Action Items
        if illusion_skills:
            top_illusion = illusion_skills[0]
            actions = (
                f"Re-evaluate your confidence in {top_illusion['skill']} — there's a {top_illusion['illusion_score']:.0f}-point gap "
                f"between your confidence and market reality. "
                f"Start with {recommended[0]['skill'] if recommended else 'the highest-priority recommended skill'} this quarter "
                f"and aim to complete a portfolio project within 3 months."
            )
        elif recommended:
            salary_gain = 0
            if optimized_salary and current_salary:
                salary_gain = optimized_salary[-1].get("salary", 0) - current_salary[-1].get("salary", 0)
            actions = (
                f"Begin learning {recommended[0]['skill']} immediately — it has a {recommended[0].get('growth_rate', 0)*100:.0f}% growth rate. "
                f"This single skill could unlock a path to {optimized_role}"
                + (f" with up to ${salary_gain:,} in additional annual salary." if salary_gain > 0 else ".")
            )
        else:
            actions = (
                f"Your profile is strong. Focus on deepening expertise in your thriving skills "
                f"and building visible portfolio projects. Consider mentoring or speaking "
                f"to establish thought leadership in your domain."
            )

        return {
            "career_direction": career,
            "skill_gaps": skill_gap,
            "market_positioning": market,
            "action_items": actions,
        }

    def _format_insights(self, sections, source):
        """Format insight sections into the API response structure."""
        insights = []
        for key, meta in self.INSIGHT_TITLES.items():
            text = sections.get(key, "")
            if text:
                insights.append({
                    "key": key,
                    "title": meta["title"],
                    "icon": meta["icon"],
                    "text": text,
                })

        return {
            "insights": insights,
            "source": source,
        }
