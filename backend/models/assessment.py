"""
AI Skill Assessment Engine
Generates quiz questions via Gemini AI (with rule-based fallback),
scores user answers, and computes verification gaps.

=== NEW: Assessment module (delete file to remove) ===
"""

import json
import logging
import os
import random

logger = logging.getLogger(__name__)

# Gemini timeout in seconds
GEMINI_TIMEOUT_SECONDS = 5
MAX_QUESTIONS_TOTAL = 10
QUESTIONS_PER_SKILL = 2
MAX_RETRIES = 2

# ── Rule-based fallback questions ─────────────────────────────
FALLBACK_QUESTIONS = {
    "Python": [
        {
            "question": "What is the output of `len({1, 2, 2, 3})`?",
            "options": ["4", "3", "Error", "2"],
            "correct": 1,
            "difficulty": "easy",
        },
        {
            "question": "Which keyword is used to create a generator function in Python?",
            "options": ["return", "generate", "yield", "async"],
            "correct": 2,
            "difficulty": "medium",
        },
        {
            "question": "What does `@staticmethod` do?",
            "options": [
                "Makes a method that can modify class state",
                "Makes a method that doesn't receive self or cls",
                "Makes a method private",
                "Makes a method run at import time",
            ],
            "correct": 1,
            "difficulty": "medium",
        },
    ],
    "JavaScript": [
        {
            "question": "What is the result of `typeof null`?",
            "options": ["'null'", "'undefined'", "'object'", "'boolean'"],
            "correct": 2,
            "difficulty": "easy",
        },
        {
            "question": "Which method creates a new array with results of calling a function on every element?",
            "options": ["forEach()", "map()", "filter()", "reduce()"],
            "correct": 1,
            "difficulty": "easy",
        },
        {
            "question": "What does `Promise.all()` return if one promise rejects?",
            "options": [
                "An array with null for rejected",
                "It rejects with the first rejection",
                "It waits for all to settle",
                "An empty array",
            ],
            "correct": 1,
            "difficulty": "medium",
        },
    ],
    "TypeScript": [
        {
            "question": "What does the `unknown` type represent in TypeScript?",
            "options": [
                "Same as any",
                "A type-safe counterpart of any",
                "An undefined variable",
                "A generic type parameter",
            ],
            "correct": 1,
            "difficulty": "medium",
        },
        {
            "question": "Which utility type makes all properties optional?",
            "options": ["Required<T>", "Partial<T>", "Optional<T>", "Maybe<T>"],
            "correct": 1,
            "difficulty": "easy",
        },
    ],
    "React": [
        {
            "question": "What hook is used for side effects in function components?",
            "options": ["useState", "useEffect", "useRef", "useMemo"],
            "correct": 1,
            "difficulty": "easy",
        },
        {
            "question": "What is the purpose of React.memo()?",
            "options": [
                "To store data in memory",
                "To memoize a component and skip re-renders if props haven't changed",
                "To create a ref to a DOM element",
                "To replace useCallback",
            ],
            "correct": 1,
            "difficulty": "medium",
        },
    ],
    "SQL": [
        {
            "question": "What does a LEFT JOIN return?",
            "options": [
                "Only matching rows from both tables",
                "All rows from the left table and matching rows from the right",
                "All rows from both tables",
                "Only non-matching rows",
            ],
            "correct": 1,
            "difficulty": "easy",
        },
        {
            "question": "What is the purpose of an INDEX in SQL?",
            "options": [
                "To enforce unique constraints",
                "To speed up data retrieval",
                "To define table relationships",
                "To store backup data",
            ],
            "correct": 1,
            "difficulty": "easy",
        },
    ],
    "Machine Learning": [
        {
            "question": "What is overfitting?",
            "options": [
                "When a model is too simple to capture patterns",
                "When a model performs well on training data but poorly on unseen data",
                "When training takes too long",
                "When features are not normalized",
            ],
            "correct": 1,
            "difficulty": "easy",
        },
        {
            "question": "Which algorithm is used for classification, not regression?",
            "options": [
                "Linear Regression",
                "Logistic Regression",
                "Polynomial Regression",
                "Ridge Regression",
            ],
            "correct": 1,
            "difficulty": "medium",
        },
    ],
    "Deep Learning": [
        {
            "question": "What activation function is commonly used in hidden layers of deep networks?",
            "options": ["Sigmoid", "ReLU", "Softmax", "Linear"],
            "correct": 1,
            "difficulty": "easy",
        },
        {
            "question": "What is the vanishing gradient problem?",
            "options": [
                "Gradients become too large during training",
                "Gradients become very small, preventing layers from learning",
                "The model runs out of memory",
                "The loss function diverges",
            ],
            "correct": 1,
            "difficulty": "medium",
        },
    ],
    "Data Analysis": [
        {
            "question": "What is the difference between mean and median?",
            "options": [
                "They are the same thing",
                "Mean is the average, median is the middle value",
                "Mean is for categorical data, median for numerical",
                "Median is always larger than mean",
            ],
            "correct": 1,
            "difficulty": "easy",
        },
        {
            "question": "What does a p-value less than 0.05 typically indicate?",
            "options": [
                "The result is practically significant",
                "The null hypothesis can be rejected at 95% confidence",
                "There is a 5% chance the result is correct",
                "The sample size is too small",
            ],
            "correct": 1,
            "difficulty": "medium",
        },
    ],
    "Cloud Architecture": [
        {
            "question": "What does 'serverless' mean in cloud computing?",
            "options": [
                "No servers are used",
                "The cloud provider manages server infrastructure automatically",
                "Only edge computing is used",
                "Applications run on the client side only",
            ],
            "correct": 1,
            "difficulty": "easy",
        },
        {
            "question": "What is the primary benefit of auto-scaling?",
            "options": [
                "Lower development costs",
                "Automatic adjustment of resources based on demand",
                "Better code quality",
                "Faster deployment times",
            ],
            "correct": 1,
            "difficulty": "easy",
        },
    ],
    "Kubernetes": [
        {
            "question": "What is a Pod in Kubernetes?",
            "options": [
                "A virtual machine",
                "The smallest deployable unit that can contain one or more containers",
                "A network policy",
                "A storage volume",
            ],
            "correct": 1,
            "difficulty": "easy",
        },
        {
            "question": "What does `kubectl apply -f` do?",
            "options": [
                "Deletes resources from a file",
                "Creates or updates resources from a file",
                "Lists all resources",
                "Scales a deployment",
            ],
            "correct": 1,
            "difficulty": "easy",
        },
    ],
    "DevOps": [
        {
            "question": "What is CI/CD?",
            "options": [
                "Code Integration / Code Deployment",
                "Continuous Integration / Continuous Delivery",
                "Container Integration / Container Deployment",
                "Cloud Integration / Cloud Delivery",
            ],
            "correct": 1,
            "difficulty": "easy",
        },
        {
            "question": "What is Infrastructure as Code (IaC)?",
            "options": [
                "Writing code inside servers",
                "Managing infrastructure through machine-readable configuration files",
                "Using only command-line tools",
                "Manually configuring servers with scripts",
            ],
            "correct": 1,
            "difficulty": "easy",
        },
    ],
    "Cybersecurity": [
        {
            "question": "What is SQL injection?",
            "options": [
                "A database optimization technique",
                "An attack that inserts malicious SQL through user input",
                "A method to speed up queries",
                "A way to backup databases",
            ],
            "correct": 1,
            "difficulty": "easy",
        },
        {
            "question": "What does HTTPS provide that HTTP does not?",
            "options": [
                "Faster loading times",
                "Encryption of data in transit",
                "Better SEO ranking",
                "Larger file transfer limits",
            ],
            "correct": 1,
            "difficulty": "easy",
        },
    ],
    "Rust": [
        {
            "question": "What is Rust's ownership system designed to prevent?",
            "options": [
                "Slow compilation",
                "Memory safety bugs without a garbage collector",
                "Type errors",
                "Network vulnerabilities",
            ],
            "correct": 1,
            "difficulty": "easy",
        },
        {
            "question": "What does the `&` symbol indicate in Rust?",
            "options": [
                "A mutable variable",
                "A reference (borrow)",
                "A pointer dereference",
                "A macro call",
            ],
            "correct": 1,
            "difficulty": "easy",
        },
    ],
    "Go": [
        {
            "question": "What is a goroutine?",
            "options": [
                "A type of variable",
                "A lightweight thread managed by the Go runtime",
                "A package manager",
                "A build tool",
            ],
            "correct": 1,
            "difficulty": "easy",
        },
        {
            "question": "What does `defer` do in Go?",
            "options": [
                "Delays execution until the surrounding function returns",
                "Creates a new goroutine",
                "Handles errors",
                "Imports a package lazily",
            ],
            "correct": 0,
            "difficulty": "medium",
        },
    ],
    "Next.js": [
        {
            "question": "What rendering strategy does Next.js App Router use by default?",
            "options": [
                "Client-side rendering",
                "Server Components",
                "Static generation only",
                "Incremental static regeneration",
            ],
            "correct": 1,
            "difficulty": "medium",
        },
        {
            "question": "What file creates a page route in Next.js App Router?",
            "options": ["index.js", "page.js", "route.js", "layout.js"],
            "correct": 1,
            "difficulty": "easy",
        },
    ],
    "UI/UX Design": [
        {
            "question": "What is the purpose of a wireframe?",
            "options": [
                "To write production code",
                "To create a low-fidelity layout of a page structure",
                "To test performance",
                "To generate color palettes",
            ],
            "correct": 1,
            "difficulty": "easy",
        },
        {
            "question": "What does 'responsive design' mean?",
            "options": [
                "A design that loads fast",
                "A design that adapts to different screen sizes",
                "A design with animations",
                "A design with dark mode",
            ],
            "correct": 1,
            "difficulty": "easy",
        },
    ],
    "Figma": [
        {
            "question": "What is an Auto Layout in Figma?",
            "options": [
                "Automatic color generation",
                "A property that lets frames resize based on their content",
                "A plugin for animations",
                "A way to export designs",
            ],
            "correct": 1,
            "difficulty": "easy",
        },
    ],
    "Project Management": [
        {
            "question": "What is the critical path in project management?",
            "options": [
                "The most important team member's tasks",
                "The longest sequence of dependent tasks determining minimum project duration",
                "The shortest way to complete a project",
                "Emergency procedures for the project",
            ],
            "correct": 1,
            "difficulty": "medium",
        },
    ],
    "Agile/Scrum": [
        {
            "question": "What is a Sprint in Scrum?",
            "options": [
                "A one-time release cycle",
                "A fixed time period (1-4 weeks) for completing a set of work",
                "A type of meeting",
                "A testing phase",
            ],
            "correct": 1,
            "difficulty": "easy",
        },
        {
            "question": "Who is responsible for the Product Backlog?",
            "options": [
                "Scrum Master",
                "Product Owner",
                "Development Team",
                "Stakeholders",
            ],
            "correct": 1,
            "difficulty": "easy",
        },
    ],
    "Communication": [
        {
            "question": "What is active listening?",
            "options": [
                "Hearing while multitasking",
                "Fully concentrating, understanding, responding, and remembering what is said",
                "Taking notes during meetings",
                "Speaking louder to be heard",
            ],
            "correct": 1,
            "difficulty": "easy",
        },
    ],
    "Leadership": [
        {
            "question": "What is servant leadership?",
            "options": [
                "Leading by giving orders",
                "A style where the leader prioritizes the needs of the team",
                "Leading from the front lines",
                "Delegating all responsibilities",
            ],
            "correct": 1,
            "difficulty": "medium",
        },
    ],
    "Prompt Engineering": [
        {
            "question": "What is 'few-shot prompting'?",
            "options": [
                "Asking very short questions",
                "Providing a few examples in the prompt to guide the model's response",
                "Using multiple AI models",
                "Limiting the response length",
            ],
            "correct": 1,
            "difficulty": "easy",
        },
        {
            "question": "What is chain-of-thought prompting?",
            "options": [
                "Chaining multiple API calls",
                "Asking the model to show reasoning steps before the answer",
                "Using multiple prompts in sequence",
                "A method to reduce hallucinations by 100%",
            ],
            "correct": 1,
            "difficulty": "medium",
        },
    ],
    "LLM Fine-tuning": [
        {
            "question": "What is LoRA in the context of LLM fine-tuning?",
            "options": [
                "A type of neural network",
                "Low-Rank Adaptation — a parameter-efficient fine-tuning method",
                "A learning rate optimization algorithm",
                "A data augmentation technique",
            ],
            "correct": 1,
            "difficulty": "hard",
        },
    ],
    "Docker": [
        {
            "question": "What is the difference between a Docker image and a container?",
            "options": [
                "They are the same thing",
                "An image is a template; a container is a running instance of an image",
                "A container is a template; an image is a running instance",
                "Images are for Linux only; containers are cross-platform",
            ],
            "correct": 1,
            "difficulty": "easy",
        },
    ],
    "Git": [
        {
            "question": "What does `git rebase` do?",
            "options": [
                "Deletes a branch",
                "Reapplies commits on top of another base tip",
                "Merges two branches with a merge commit",
                "Reverts all changes",
            ],
            "correct": 1,
            "difficulty": "medium",
        },
    ],
    "Problem Solving": [
        {
            "question": "What is the first step in structured problem solving?",
            "options": [
                "Implement the solution",
                "Define and understand the problem clearly",
                "Brainstorm solutions",
                "Test the solution",
            ],
            "correct": 1,
            "difficulty": "easy",
        },
    ],
    "Critical Thinking": [
        {
            "question": "What is confirmation bias?",
            "options": [
                "Seeking out information that confirms existing beliefs",
                "Being overly critical of new ideas",
                "Accepting all information at face value",
                "Making decisions based on emotions",
            ],
            "correct": 0,
            "difficulty": "easy",
        },
    ],
    "Excel": [
        {
            "question": "What Excel function looks up a value in the first column and returns a value in the same row from another column?",
            "options": ["HLOOKUP", "VLOOKUP", "INDEX", "MATCH"],
            "correct": 1,
            "difficulty": "easy",
        },
    ],
    "Manual Testing": [
        {
            "question": "What is regression testing?",
            "options": [
                "Testing new features only",
                "Re-testing to ensure existing functionality still works after changes",
                "Testing performance under load",
                "Testing security vulnerabilities",
            ],
            "correct": 1,
            "difficulty": "easy",
        },
    ],
    "Data Entry": [
        {
            "question": "What is data validation in the context of data entry?",
            "options": [
                "Backing up data",
                "Checking data for accuracy and consistency before processing",
                "Encrypting data",
                "Deleting duplicate records",
            ],
            "correct": 1,
            "difficulty": "easy",
        },
    ],
    "Technical Writing": [
        {
            "question": "What is the primary goal of technical writing?",
            "options": [
                "To entertain the reader",
                "To convey complex information clearly and accurately",
                "To persuade the reader",
                "To demonstrate vocabulary",
            ],
            "correct": 1,
            "difficulty": "easy",
        },
    ],
}

# Generic fallback for skills without specific questions
GENERIC_QUESTIONS = [
    {
        "question": "Which learning approach is most effective for mastering a new technical skill?",
        "options": [
            "Reading documentation only",
            "Hands-on practice combined with theory",
            "Watching videos passively",
            "Memorizing syntax",
        ],
        "correct": 1,
        "difficulty": "easy",
    },
    {
        "question": "What is the best way to stay current with evolving technology?",
        "options": [
            "Learn one tool and stick with it forever",
            "Continuously learn, follow industry trends, and practice regularly",
            "Wait for your employer to provide training",
            "Avoid new technologies until they are 10+ years old",
        ],
        "correct": 1,
        "difficulty": "easy",
    },
    {
        "question": "What indicates deep understanding vs. surface knowledge of a skill?",
        "options": [
            "Being able to recite definitions",
            "Being able to debug novel problems and explain trade-offs",
            "Having many years of experience",
            "Having a certification",
        ],
        "correct": 1,
        "difficulty": "medium",
    },
]


def _try_ai_questions(skills, count_per_skill, difficulty=None):
    """Attempt to generate questions via AI providers with automatic failover."""
    from .ai_provider import AIProvider

    _ai = AIProvider()

    skill_list = ", ".join(s["skill"] for s in skills)
    difficulty_instruction = f"\nGenerate {difficulty}-level questions." if difficulty else ""
    prompt = f"""Generate a mix of multiple-choice and scenario-based quiz questions for EACH of these skills: {skill_list}.{difficulty_instruction}

For each skill, generate {count_per_skill} questions with this mix:
- About half should be standard MCQ questions testing knowledge
- About half should be "scenario" questions that present a real-world situation

For each question return a JSON object with:
- "skill": the skill name
- "question": the question text
- "type": either "mcq" or "scenario"
- "options": array of exactly 4 answer options
- "correct": index (0-3) of the correct answer
- "difficulty": "easy", "medium", or "hard"
- "explanation": a brief explanation of why the correct answer is best (required for scenario questions, optional for mcq)

For scenario questions:
- Start with a real-world situation (e.g. "You receive a 500MB CSV with duplicate rows...")
- Options should represent different approaches, not just facts
- The explanation should teach WHY the correct approach is better

Requirements:
- Questions should test practical knowledge, not trivia
- Options must be clearly distinct (no two options should mean the same thing)
- Only ONE correct answer per question
- Return a JSON array of question objects, nothing else

Return ONLY valid JSON, no markdown formatting."""

    questions = _ai.generate_json(prompt, max_tokens=4096)
    if not isinstance(questions, list):
        return None

    # Validate each question
    valid = []
    for q in questions:
        if (
            isinstance(q, dict)
            and "question" in q
            and "options" in q
            and "correct" in q
            and isinstance(q["options"], list)
            and len(q["options"]) == 4
            and isinstance(q["correct"], int)
            and 0 <= q["correct"] <= 3
        ):
            validated = {
                "skill": q.get("skill", "General"),
                "question": q["question"],
                "type": q.get("type", "mcq"),
                "options": q["options"],
                "correct": q["correct"],
                "difficulty": q.get("difficulty", "medium"),
            }
            if q.get("explanation"):
                validated["explanation"] = q["explanation"]
            valid.append(validated)

    return valid if valid else None


def _shuffle_options(question):
    """Randomize option order so the correct answer isn't always in the same position."""
    options = list(question["options"])
    correct_text = options[question["correct"]]
    random.shuffle(options)
    new_correct = options.index(correct_text)
    return {**question, "options": options, "correct": new_correct}


def _get_fallback_questions(skills, count_per_skill, difficulty=None):
    """Generate rule-based fallback questions for given skills."""
    questions = []
    for skill_entry in skills:
        skill_name = skill_entry["skill"]
        pool = FALLBACK_QUESTIONS.get(skill_name, GENERIC_QUESTIONS)
        # Filter by difficulty if specified
        if difficulty:
            filtered = [q for q in pool if q.get("difficulty") == difficulty]
            pool = filtered if filtered else pool
        # Shuffle and pick up to count_per_skill
        sampled = random.sample(pool, min(count_per_skill, len(pool)))
        for q in sampled:
            # Randomize option order so correct answer isn't always B
            shuffled = _shuffle_options(q)
            questions.append({**shuffled, "skill": skill_name})
    return questions


class AssessmentEngine:
    """AI-powered skill assessment with Gemini + rule-based fallback."""

    def generate_questions(self, skills, count_per_skill=QUESTIONS_PER_SKILL, difficulty=None):
        """
        Generate quiz questions for the given skills.

        Args:
            skills: list of {"skill": str, "confidence": int}
            count_per_skill: questions per skill (default 2)
            difficulty: optional filter — "easy", "medium", or "hard"

        Returns:
            list of question dicts with: skill, question, options, correct, difficulty
        """
        # Cap to top 5 skills if too many
        if len(skills) > 5:
            skills = sorted(skills, key=lambda s: s.get("confidence", 5), reverse=True)[:5]

        # Try AI providers with retries
        for attempt in range(MAX_RETRIES):
            ai_questions = _try_ai_questions(skills, count_per_skill, difficulty)
            if ai_questions:
                logger.info("AI generated %d questions (attempt %d)", len(ai_questions), attempt + 1)
                if difficulty:
                    ai_questions = [q for q in ai_questions if q.get("difficulty") == difficulty] or ai_questions
                return ai_questions[:MAX_QUESTIONS_TOTAL]

        # Fallback to rule-based
        logger.info("Using fallback question set")
        fallback = _get_fallback_questions(skills, count_per_skill, difficulty)
        return fallback[:MAX_QUESTIONS_TOTAL]

    def score_answers(self, questions, user_answers, skills_with_confidence):
        """
        Score user answers against correct answers.

        Args:
            questions: list of question dicts (from generate_questions)
            user_answers: list of int (selected option indices, same order as questions)
            skills_with_confidence: original skills list with confidence ratings

        Returns:
            dict with per_skill results and overall metrics
        """
        # Build confidence lookup
        confidence_map = {
            s["skill"]: s.get("confidence", 5) for s in skills_with_confidence
        }

        # Score per skill
        skill_scores = {}
        for i, q in enumerate(questions):
            skill = q["skill"]
            if skill not in skill_scores:
                skill_scores[skill] = {"correct": 0, "total": 0}

            answer = user_answers[i] if i < len(user_answers) else -1
            if answer == q["correct"]:
                skill_scores[skill]["correct"] += 1
            skill_scores[skill]["total"] += 1

        # Build per-skill results
        per_skill = []
        total_correct = 0
        total_questions = 0
        total_gap = 0
        gap_count = 0

        for skill, scores in skill_scores.items():
            accuracy = (scores["correct"] / scores["total"] * 100) if scores["total"] > 0 else 0
            self_reported = confidence_map.get(skill, 5) * 10  # scale 1-10 to 0-100
            gap = self_reported - accuracy

            if gap > 15:
                status = "overconfident"
            elif gap < -15:
                status = "hidden_strength"
            else:
                status = "verified"

            per_skill.append({
                "skill": skill,
                "verified_score": round(accuracy, 1),
                "self_reported": round(self_reported, 1),
                "gap": round(gap, 1),
                "status": status,
                "correct_count": scores["correct"],
                "total_count": scores["total"],
            })

            total_correct += scores["correct"]
            total_questions += scores["total"]
            total_gap += gap
            gap_count += 1

        overall_accuracy = (total_correct / total_questions * 100) if total_questions > 0 else 0
        verification_gap = (total_gap / gap_count) if gap_count > 0 else 0

        return {
            "per_skill": sorted(per_skill, key=lambda x: -abs(x["gap"])),
            "overall_accuracy": round(overall_accuracy, 1),
            "verification_gap": round(verification_gap, 1),
            "total_correct": total_correct,
            "total_questions": total_questions,
        }
