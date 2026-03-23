"""
Seed Supabase tables from local CSV/JSON data files.

Usage:
    SUPABASE_URL=https://xxx.supabase.co \
    SUPABASE_SERVICE_KEY=eyJ... \
    python scripts/seed_supabase.py
"""

import csv
import json
import os
import sys

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "api", "data")


def get_client():
    from supabase import create_client

    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")
    if not url or not key:
        print("ERROR: Set SUPABASE_URL and SUPABASE_SERVICE_KEY env vars")
        sys.exit(1)
    return create_client(url, key)


def seed_skills(client):
    path = os.path.join(DATA_DIR, "skills.csv")
    rows = []
    with open(path, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            rows.append({
                "skill": row["skill"],
                "category": row["category"],
                "demand_2024": float(row["demand_2024"]),
                "demand_2027": float(row["demand_2027"]),
                "growth_rate": float(row["growth_rate"]),
                "automation_risk": float(row["automation_risk"]),
            })
    result = client.table("skills").upsert(rows, on_conflict="skill").execute()
    print(f"Skills: {len(result.data)} rows upserted")


def seed_roles(client):
    path = os.path.join(DATA_DIR, "roles.csv")
    rows = []
    with open(path, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            rows.append({
                "role": row["role"],
                "category": row["category"],
                "avg_salary_2024": int(row.get("avg_salary_2024", 0) or 0),
                "projected_salary_2027": int(row.get("projected_salary_2027", 0) or 0),
                "openings_trend": float(row.get("openings_trend", 0) or 0),
                "automation_exposure": float(row.get("automation_exposure", 0) or 0),
                "emerging_skills": row.get("emerging_skills", ""),
            })
    result = client.table("roles").upsert(rows, on_conflict="role").execute()
    print(f"Roles: {len(result.data)} rows upserted")


def seed_evolution_paths(client):
    path = os.path.join(DATA_DIR, "evolution_paths.json")
    with open(path, encoding="utf-8") as f:
        data = json.load(f)

    rows = []
    for entry in data:
        rows.append({
            "skill": entry["skill"],
            "paths": entry["paths"],
        })

    # Delete existing then insert (no unique constraint on skill for this table)
    client.table("evolution_paths").delete().neq("id", 0).execute()
    result = client.table("evolution_paths").insert(rows).execute()
    print(f"Evolution paths: {len(result.data)} rows inserted")


def main():
    client = get_client()
    print("Seeding Supabase...")
    seed_skills(client)
    seed_roles(client)
    seed_evolution_paths(client)
    print("Done!")


if __name__ == "__main__":
    main()
