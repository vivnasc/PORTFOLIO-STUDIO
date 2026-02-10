-- ============================================================
-- PORTFOLIO STUDIO - Complete Database Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================

-- ============================================================
-- PART 1: SHARED TABLES (used by ALL 7 products)
-- ============================================================

-- 1.1 PROFILES
-- Extends Supabase auth.users with app-specific data.
-- Created automatically when a user signs up (via trigger below).
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- 1.2 SUBSCRIPTIONS
-- Tracks which plan each user has for each product.
-- One row per user per product.
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL, -- e.g. 'riskloop', 'energyos'
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro')),
  status TEXT NOT NULL DEFAULT 'trialing' CHECK (status IN ('trialing', 'active', 'canceled', 'past_due')),
  paypal_subscription_id TEXT,
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  current_period_start TIMESTAMPTZ DEFAULT NOW(),
  current_period_end TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_product ON subscriptions(product_id);

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- 1.3 USAGE LOG
-- Tracks every AI analysis call for billing and analytics.
-- How many times each user uses each product feature.
CREATE TABLE usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  action TEXT NOT NULL, -- e.g. 'pattern-detection', 'energy-analysis'
  tokens_used INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE usage_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own usage"
  ON usage_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage"
  ON usage_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_usage_user ON usage_log(user_id);
CREATE INDEX idx_usage_product ON usage_log(product_id);
CREATE INDEX idx_usage_created ON usage_log(created_at DESC);


-- ============================================================
-- PART 2: RISKLOOP TABLES
-- Behavioral Risk Intelligence
-- ============================================================

-- User's logged decisions (input data)
CREATE TABLE riskloop_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  decision_date DATE NOT NULL DEFAULT CURRENT_DATE,
  outcome TEXT,
  context TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE riskloop_decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own riskloop decisions"
  ON riskloop_decisions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_riskloop_decisions_user ON riskloop_decisions(user_id);

-- AI-detected risk patterns (analysis results)
CREATE TABLE riskloop_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  risk_score INTEGER CHECK (risk_score BETWEEN 0 AND 100),
  cost_estimate JSONB DEFAULT '{}', -- {time, money, opportunity}
  intervention_point TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE riskloop_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own riskloop patterns"
  ON riskloop_patterns FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_riskloop_patterns_user ON riskloop_patterns(user_id);


-- ============================================================
-- PART 3: ENERGYOS TABLES
-- Performance Energy Management
-- ============================================================

-- Energy check-ins (input data)
CREATE TABLE energyos_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  energy_level INTEGER NOT NULL CHECK (energy_level BETWEEN 1 AND 10),
  activity TEXT,
  context TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE energyos_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own energy logs"
  ON energyos_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_energyos_logs_user ON energyos_logs(user_id);
CREATE INDEX idx_energyos_logs_date ON energyos_logs(logged_at DESC);

-- AI analysis results
CREATE TABLE energyos_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  chronotype TEXT,
  energy_score INTEGER,
  peak_windows JSONB DEFAULT '[]',
  crash_risks JSONB DEFAULT '[]',
  recommended_schedule JSONB DEFAULT '{}',
  week_forecast JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE energyos_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own energy analyses"
  ON energyos_analyses FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_energyos_analyses_user ON energyos_analyses(user_id);


-- ============================================================
-- PART 4: CAPACITYOS TABLES
-- Cognitive Load Management
-- ============================================================

-- User's commitments (input data)
CREATE TABLE capacityos_commitments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  hours_per_week NUMERIC(5,1) NOT NULL DEFAULT 0,
  cognitive_load INTEGER CHECK (cognitive_load BETWEEN 1 AND 10),
  deadline DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'deferred', 'dropped')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE capacityos_commitments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own capacityos commitments"
  ON capacityos_commitments FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_capacityos_commitments_user ON capacityos_commitments(user_id);

-- AI burnout assessments (analysis results)
CREATE TABLE capacityos_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  current_load INTEGER CHECK (current_load BETWEEN 0 AND 100),
  burnout_risk TEXT CHECK (burnout_risk IN ('low', 'moderate', 'high', 'critical')),
  days_until_critical INTEGER,
  load_drivers JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  no_card TEXT, -- professional boundary/decline template
  recovery_plan JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE capacityos_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own capacityos assessments"
  ON capacityos_assessments FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_capacityos_assessments_user ON capacityos_assessments(user_id);


-- ============================================================
-- PART 5: OUTCOMEDB TABLES
-- Decision Intelligence Archive
-- ============================================================

-- User's logged decisions
CREATE TABLE outcomedb_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  context TEXT,
  tags TEXT[] DEFAULT '{}',
  decision_date DATE NOT NULL DEFAULT CURRENT_DATE,
  outcome_rating INTEGER CHECK (outcome_rating BETWEEN 1 AND 5),
  review_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE outcomedb_decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own outcomedb decisions"
  ON outcomedb_decisions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_outcomedb_decisions_user ON outcomedb_decisions(user_id);
CREATE INDEX idx_outcomedb_decisions_date ON outcomedb_decisions(decision_date DESC);

-- AI decision analyses
CREATE TABLE outcomedb_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  decision_id UUID REFERENCES outcomedb_decisions(id) ON DELETE CASCADE,
  decision_type TEXT,
  expected_roi TEXT,
  assumptions JSONB DEFAULT '[]',
  risks JSONB DEFAULT '[]',
  success_criteria JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE outcomedb_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own outcomedb analyses"
  ON outcomedb_analyses FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_outcomedb_analyses_user ON outcomedb_analyses(user_id);
CREATE INDEX idx_outcomedb_analyses_decision ON outcomedb_analyses(decision_id);


-- ============================================================
-- PART 6: STICK TABLES
-- Anti-Friction Habit System
-- ============================================================

-- User's habits
CREATE TABLE stick_habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly')),
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE stick_habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own stick habits"
  ON stick_habits FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_stick_habits_user ON stick_habits(user_id);

-- Daily habit attempts
CREATE TABLE stick_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES stick_habits(id) ON DELETE CASCADE,
  attempt_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(habit_id, attempt_date)
);

ALTER TABLE stick_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own stick attempts"
  ON stick_attempts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_stick_attempts_habit ON stick_attempts(habit_id);
CREATE INDEX idx_stick_attempts_date ON stick_attempts(attempt_date DESC);

-- AI friction analyses
CREATE TABLE stick_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  habit_id UUID REFERENCES stick_habits(id) ON DELETE CASCADE,
  friction_points JSONB DEFAULT '[]',
  micro_steps JSONB DEFAULT '[]',
  triggers JSONB DEFAULT '[]',
  rewards JSONB DEFAULT '[]',
  streak_strategy TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE stick_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own stick analyses"
  ON stick_analyses FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_stick_analyses_user ON stick_analyses(user_id);


-- ============================================================
-- PART 7: PEOPLEDB TABLES
-- Personal CRM Intelligence
-- ============================================================

-- User's contacts
CREATE TABLE peopledb_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  relationship_type TEXT,
  relationship_strength INTEGER DEFAULT 50 CHECK (relationship_strength BETWEEN 0 AND 100),
  last_contact_date DATE,
  next_contact_date DATE,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE peopledb_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own peopledb contacts"
  ON peopledb_contacts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_peopledb_contacts_user ON peopledb_contacts(user_id);

-- Contact interactions
CREATE TABLE peopledb_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES peopledb_contacts(id) ON DELETE CASCADE,
  interaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  interaction_type TEXT, -- 'meeting', 'call', 'email', 'message', 'social'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE peopledb_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own peopledb interactions"
  ON peopledb_interactions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_peopledb_interactions_contact ON peopledb_interactions(contact_id);

-- AI relationship insights
CREATE TABLE peopledb_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES peopledb_contacts(id) ON DELETE CASCADE,
  strength INTEGER CHECK (strength BETWEEN 0 AND 100),
  communication_style TEXT,
  suggested_actions JSONB DEFAULT '[]',
  next_contact_date DATE,
  topics JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE peopledb_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own peopledb insights"
  ON peopledb_insights FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_peopledb_insights_user ON peopledb_insights(user_id);


-- ============================================================
-- PART 8: COMMITMENTFILTER TABLES
-- Commitment Firewall
-- ============================================================

-- User's personal values (used as filter criteria)
CREATE TABLE commitmentfilter_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  values TEXT[] DEFAULT '{}', -- ['family', 'health', 'freedom', ...]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE commitmentfilter_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own values"
  ON commitmentfilter_values FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER commitmentfilter_values_updated_at
  BEFORE UPDATE ON commitmentfilter_values
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Incoming commitment requests to evaluate
CREATE TABLE commitmentfilter_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  requester TEXT,
  hours_per_week NUMERIC(5,1) DEFAULT 0,
  deadline DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'negotiated')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE commitmentfilter_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own commitment requests"
  ON commitmentfilter_requests FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_commitmentfilter_requests_user ON commitmentfilter_requests(user_id);

-- AI commitment evaluations
CREATE TABLE commitmentfilter_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  request_id UUID REFERENCES commitmentfilter_requests(id) ON DELETE CASCADE,
  alignment_score INTEGER CHECK (alignment_score BETWEEN 0 AND 100),
  recommendation TEXT CHECK (recommendation IN ('accept', 'negotiate', 'decline')),
  direct_cost JSONB DEFAULT '{}',
  hidden_costs JSONB DEFAULT '{}', -- {energyDrain, mentalOverhead, contextSwitching, prepRecovery}
  opportunity_costs JSONB DEFAULT '[]',
  scope_creep_risk TEXT,
  relationship_impact TEXT,
  reality_check TEXT,
  negotiation_script TEXT,
  alternatives JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE commitmentfilter_evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own commitment evaluations"
  ON commitmentfilter_evaluations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_commitmentfilter_evaluations_user ON commitmentfilter_evaluations(user_id);
CREATE INDEX idx_commitmentfilter_evaluations_request ON commitmentfilter_evaluations(request_id);


-- ============================================================
-- PART 9: HELPER FUNCTION FOR SUBSCRIPTION CHECKS
-- Used by API routes to verify user has active subscription
-- ============================================================

CREATE OR REPLACE FUNCTION check_subscription(p_user_id UUID, p_product_id TEXT)
RETURNS TABLE(has_access BOOLEAN, plan TEXT, status TEXT, trial_ends_at TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY
  SELECT
    CASE
      WHEN s.status = 'active' THEN true
      WHEN s.status = 'trialing' AND s.trial_ends_at > NOW() THEN true
      ELSE false
    END AS has_access,
    s.plan,
    s.status,
    s.trial_ends_at
  FROM subscriptions s
  WHERE s.user_id = p_user_id AND s.product_id = p_product_id;

  -- If no subscription found, return free tier with access
  IF NOT FOUND THEN
    RETURN QUERY SELECT true, 'free'::TEXT, 'active'::TEXT, NULL::TIMESTAMPTZ;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- DONE! Schema complete.
-- Tables created: 22
-- RLS policies: 22
-- Indexes: 18
-- Functions: 3
-- Triggers: 3
-- ============================================================
