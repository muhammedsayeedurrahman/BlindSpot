-- BlindSpot AI — Supabase Schema
-- Run this in the Supabase SQL Editor to create all tables.

-- Skills catalog (migrated from skills.csv)
CREATE TABLE IF NOT EXISTS skills (
  id SERIAL PRIMARY KEY,
  skill TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  demand_2024 REAL,
  demand_2027 REAL,
  growth_rate REAL,
  automation_risk REAL
);

-- Roles catalog (migrated from roles.csv)
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  role TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  avg_salary_2024 INTEGER,
  projected_salary_2027 INTEGER,
  openings_trend REAL,
  automation_exposure REAL,
  emerging_skills TEXT  -- semicolon-separated
);

-- Evolution paths (migrated from evolution_paths.json)
CREATE TABLE IF NOT EXISTS evolution_paths (
  id SERIAL PRIMARY KEY,
  skill TEXT NOT NULL,
  paths JSONB NOT NULL  -- [{type, label, skills, months, role?}]
);

-- User profiles (replaces anonymous-only flow)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT DEFAULT 'Anonymous',
  email TEXT UNIQUE,
  role_title TEXT DEFAULT 'Software Engineer',
  years_experience INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analysis history (replaces in-memory only)
CREATE TABLE IF NOT EXISTS analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  skills JSONB NOT NULL,        -- [{skill, confidence}]
  bsi_score REAL,
  bsi_level TEXT,
  result JSONB NOT NULL,        -- full analysis response
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Journey progress (replaces localStorage useJourneyStore)
CREATE TABLE IF NOT EXISTS journey_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  selected_paths JSONB DEFAULT '{}',
  quiz_scores JSONB DEFAULT '{}',
  completed_skills JSONB DEFAULT '[]',
  evolution_choices JSONB DEFAULT '{}',
  journey_step INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_progress ENABLE ROW LEVEL SECURITY;

-- Policies: users can only access their own data
CREATE POLICY "Users read own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users read own analyses" ON analyses
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own analyses" ON analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own journey" ON journey_progress
  FOR ALL USING (auth.uid() = user_id);

-- Public read access for catalog tables (no auth required)
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE evolution_paths ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read skills" ON skills FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read roles" ON roles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read evolution_paths" ON evolution_paths FOR SELECT TO anon, authenticated USING (true);
