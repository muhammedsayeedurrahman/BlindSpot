# BlindSpot AI — Career Intelligence Platform

Uncover the hidden gaps in your career trajectory before the market does.

AI-powered analysis of skill decay, competence illusions, and future-proof career pathways — all running locally with zero internet dependency.

## Features

- **BlindSpot Index** — A single 0-100 score revealing hidden career vulnerabilities
- **Skill Half-Life** — How long before each skill loses 50% of its market value
- **Competence Illusion Detector** — Gaps between your confidence and actual market relevance
- **3D Skill Iceberg** — Interactive Three.js visualization (above water = thriving, below = at risk)
- **Career Twin** — Digital twin projecting two futures: current path vs optimized path
- **Upskilling Roadmap** — Quarter-by-quarter learning plan with job matches

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python, Flask, Flask-CORS |
| Frontend | React 18, Vite, Tailwind CSS |
| 3D Viz | Three.js via @react-three/fiber + drei |
| Charts | Chart.js via react-chartjs-2 |
| Animation | Framer Motion |
| Routing | React Router v6 |

## Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+

### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

The API runs at http://localhost:5000

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app opens at http://localhost:5173

### Demo Mode

Visit http://localhost:5173/dashboard directly to see the dashboard with demo data — no backend required.

## API

### POST /api/analyze

Request:
```json
{
  "name": "Jane Doe",
  "current_role": "Frontend Developer",
  "years_experience": 5,
  "skills": [
    { "skill": "React", "confidence": 8 },
    { "skill": "JavaScript", "confidence": 9 },
    { "skill": "TypeScript", "confidence": 6 }
  ]
}
```

Response includes: `blindspot_index`, `skill_survival`, `competence_illusion`, `career_twin`

### GET /api/health

Returns `{ "status": "ok" }`

## Project Structure

```
BlindSpot/
├── backend/
│   ├── app.py              # Flask API server
│   ├── requirements.txt
│   ├── data/
│   │   ├── skills.csv      # 30 skills with demand/automation data
│   │   ├── roles.csv       # 16 career roles with projections
│   │   └── job_posts.json  # 10 sample job postings
│   └── models/
│       ├── survival.py     # Skill half-life calculator
│       ├── illusion.py     # Competence illusion detector
│       ├── index.py        # BlindSpot Index formula
│       └── twin.py         # Career twin projections
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.jsx     # Hero + features
│   │   │   ├── Onboarding.jsx  # 3-step profile wizard
│   │   │   └── Dashboard.jsx   # Main dashboard
│   │   ├── components/
│   │   │   ├── Gauge.jsx           # Animated BSI gauge
│   │   │   ├── Iceberg.jsx         # 3D iceberg (Three.js)
│   │   │   ├── SkillSurvivalChart.jsx
│   │   │   ├── IllusionChart.jsx
│   │   │   ├── CareerTwin.jsx      # Salary projection chart
│   │   │   ├── Roadmap.jsx         # Timeline + job matches
│   │   │   └── AlertPanel.jsx      # Warning banners
│   │   ├── App.jsx
│   │   ├── api.js
│   │   └── main.jsx
│   └── index.html
└── README.md
```

## License

MIT
