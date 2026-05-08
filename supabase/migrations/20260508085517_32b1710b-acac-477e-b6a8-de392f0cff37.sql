-- ============= ENUMS =============
DO $$ BEGIN
  CREATE TYPE persona AS ENUM ('GUARD','STUDENT','EARNER','PG_MANAGER','BROKER','INFLUENCER','CORPORATE_HR');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE property_type AS ENUM ('PG','FLAT_1BHK','FLAT_2BHK','HOUSE','STUDIO');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE gender_pref AS ENUM ('MALE','FEMALE','COED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE visit_status AS ENUM ('SCHEDULED','COMPLETED','CANCELLED','NO_SHOW');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE challenge_kind AS ENUM ('DAILY','WEEKLY','MILESTONE','SPECIAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE notif_type AS ENUM ('REFERRAL','PAYOUT','BADGE','TEAM','SYSTEM','VISIT','CHALLENGE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============= PROFILES extras =============
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS persona persona,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS total_clicks int NOT NULL DEFAULT 0;

-- ============= PROPERTIES =============
CREATE TABLE IF NOT EXISTS public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  area text NOT NULL,
  city text NOT NULL DEFAULT 'Bangalore',
  type property_type NOT NULL DEFAULT 'PG',
  gender gender_pref NOT NULL DEFAULT 'COED',
  rent_min int NOT NULL DEFAULT 0,
  rent_max int NOT NULL DEFAULT 0,
  description text,
  amenities text[] NOT NULL DEFAULT '{}',
  images text[] NOT NULL DEFAULT '{}',
  rating numeric(2,1) DEFAULT 4.5,
  manager_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_flash boolean NOT NULL DEFAULT false,
  flash_multiplier numeric(3,1) DEFAULT 1.0,
  flash_ends_at timestamptz,
  spots_left int DEFAULT 0,
  is_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Properties are public" ON public.properties FOR SELECT USING (true);
CREATE POLICY "Managers create properties" ON public.properties FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = manager_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Managers update own" ON public.properties FOR UPDATE TO authenticated
  USING (auth.uid() = manager_id OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (auth.uid() = manager_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete properties" ON public.properties FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
CREATE INDEX IF NOT EXISTS idx_properties_area ON public.properties(area);
CREATE INDEX IF NOT EXISTS idx_properties_flash ON public.properties(is_flash) WHERE is_flash = true;

-- ============= PG VISITS =============
CREATE TABLE IF NOT EXISTS public.pg_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  scheduled_at timestamptz NOT NULL,
  status visit_status NOT NULL DEFAULT 'SCHEDULED',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pg_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View own visits" ON public.pg_visits FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Create own visits" ON public.pg_visits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update own visits" ON public.pg_visits FOR UPDATE USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

-- ============= WAITLISTS =============
CREATE TABLE IF NOT EXISTS public.waitlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(property_id, user_id)
);
ALTER TABLE public.waitlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View own waitlists" ON public.waitlists FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Join waitlists" ON public.waitlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Leave waitlists" ON public.waitlists FOR DELETE USING (auth.uid() = user_id);

-- ============= TEAMS =============
CREATE TABLE IF NOT EXISTS public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  emoji text DEFAULT '🏆',
  captain_id uuid,
  total_xp int NOT NULL DEFAULT 0,
  member_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teams are public" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Authed create teams" ON public.teams FOR INSERT TO authenticated WITH CHECK (auth.uid() = captain_id);
CREATE POLICY "Captain updates" ON public.teams FOR UPDATE USING (auth.uid() = captain_id OR public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.team_members (
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (team_id, user_id)
);
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members are public" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Join own" ON public.team_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Leave own" ON public.team_members FOR DELETE USING (auth.uid() = user_id);

-- ============= CHALLENGES =============
CREATE TABLE IF NOT EXISTS public.challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind challenge_kind NOT NULL,
  title text NOT NULL,
  description text,
  emoji text DEFAULT '🎯',
  target int NOT NULL DEFAULT 1,
  metric text NOT NULL DEFAULT 'referrals',
  reward_xp int NOT NULL DEFAULT 0,
  reward_cash numeric NOT NULL DEFAULT 0,
  starts_at timestamptz DEFAULT now(),
  ends_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Challenges public" ON public.challenges FOR SELECT USING (true);
CREATE POLICY "Admins manage challenges" ON public.challenges FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.challenge_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  progress int NOT NULL DEFAULT 0,
  completed_at timestamptz,
  claimed_at timestamptz,
  UNIQUE(challenge_id, user_id)
);
ALTER TABLE public.challenge_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View own progress" ON public.challenge_progress FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Insert own progress" ON public.challenge_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update own progress" ON public.challenge_progress FOR UPDATE USING (auth.uid() = user_id);

-- ============= NOTIFICATIONS =============
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type notif_type NOT NULL DEFAULT 'SYSTEM',
  title text NOT NULL,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View own notifs" ON public.notifications FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Update own notifs" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins create notifs" ON public.notifications FOR INSERT WITH CHECK (public.has_role(auth.uid(),'admin') OR auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, created_at DESC);

-- ============= PAYOUT METHODS =============
CREATE TABLE IF NOT EXISTS public.payout_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  kind text NOT NULL CHECK (kind IN ('upi','bank')),
  upi_id text,
  account_holder text,
  account_number text,
  ifsc text,
  bank_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.payout_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Manage own payout method" ON public.payout_methods FOR ALL USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin')) WITH CHECK (auth.uid() = user_id);

-- ============= CHECKIN LOGS =============
CREATE TABLE IF NOT EXISTS public.checkin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  date date NOT NULL,
  xp_earned int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);
ALTER TABLE public.checkin_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View own checkins" ON public.checkin_logs FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

-- ============= SQUAD BATTLES =============
CREATE TABLE IF NOT EXISTS public.squad_battles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_a_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  team_b_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  metric text NOT NULL DEFAULT 'referrals',
  team_a_score int NOT NULL DEFAULT 0,
  team_b_score int NOT NULL DEFAULT 0,
  prize_xp int NOT NULL DEFAULT 500,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz NOT NULL,
  winner_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.squad_battles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Battles public" ON public.squad_battles FOR SELECT USING (true);
CREATE POLICY "Admins manage battles" ON public.squad_battles FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============= BADGES =============
CREATE TABLE IF NOT EXISTS public.badges_earned (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  badge_key text NOT NULL,
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_key)
);
ALTER TABLE public.badges_earned ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Badges public" ON public.badges_earned FOR SELECT USING (true);

-- ============= ACTIVITY LOG =============
CREATE TABLE IF NOT EXISTS public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  meta jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View own activity" ON public.activity_log FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE INDEX IF NOT EXISTS idx_activity_user ON public.activity_log(user_id, created_at DESC);

-- ============= REFERRAL CLICKS =============
CREATE TABLE IF NOT EXISTS public.referral_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  referrer_id uuid,
  ip text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.referral_clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone log clicks" ON public.referral_clicks FOR INSERT WITH CHECK (true);
CREATE POLICY "Owner views clicks" ON public.referral_clicks FOR SELECT USING (auth.uid() = referrer_id OR public.has_role(auth.uid(),'admin'));

-- ============= RPCs =============
CREATE OR REPLACE FUNCTION public.daily_checkin()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid := auth.uid();
  already int;
  current_streak int;
  prev_date date;
  bonus int;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'unauthorized'; END IF;
  SELECT count(*) FROM public.checkin_logs WHERE user_id = uid AND date = CURRENT_DATE INTO already;
  IF already > 0 THEN RAISE EXCEPTION 'already_checked_in'; END IF;

  SELECT last_referral_date, streak_days FROM public.profiles WHERE id = uid INTO prev_date, current_streak;
  IF prev_date = CURRENT_DATE - 1 THEN current_streak := COALESCE(current_streak,0) + 1;
  ELSIF prev_date = CURRENT_DATE THEN current_streak := COALESCE(current_streak,1);
  ELSE current_streak := 1; END IF;

  bonus := 5 + LEAST(current_streak * 5, 50);

  INSERT INTO public.checkin_logs(user_id, date, xp_earned) VALUES (uid, CURRENT_DATE, bonus);
  UPDATE public.profiles SET xp = xp + bonus, level = public.level_for_xp(xp + bonus),
    streak_days = current_streak, last_referral_date = CURRENT_DATE WHERE id = uid;

  INSERT INTO public.activity_log(user_id, type, title, meta)
  VALUES (uid, 'CHECKIN', 'Daily check-in +' || bonus || ' XP', jsonb_build_object('xp', bonus, 'streak', current_streak));

  RETURN jsonb_build_object('xp', bonus, 'streak', current_streak);
END $$;

CREATE OR REPLACE FUNCTION public.set_persona(_persona persona)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'unauthorized'; END IF;
  UPDATE public.profiles SET persona = _persona WHERE id = auth.uid();
END $$;

CREATE OR REPLACE FUNCTION public.join_team(_slug text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE tid uuid; uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'unauthorized'; END IF;
  SELECT id FROM public.teams WHERE slug = _slug INTO tid;
  IF tid IS NULL THEN RAISE EXCEPTION 'team_not_found'; END IF;
  INSERT INTO public.team_members(team_id, user_id) VALUES (tid, uid) ON CONFLICT DO NOTHING;
  UPDATE public.teams SET member_count = (SELECT count(*) FROM public.team_members WHERE team_id = tid) WHERE id = tid;
END $$;

CREATE OR REPLACE FUNCTION public.leave_team(_slug text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE tid uuid; uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'unauthorized'; END IF;
  SELECT id FROM public.teams WHERE slug = _slug INTO tid;
  DELETE FROM public.team_members WHERE team_id = tid AND user_id = uid;
  UPDATE public.teams SET member_count = (SELECT count(*) FROM public.team_members WHERE team_id = tid) WHERE id = tid;
END $$;

-- Auto-notify on referral status change
CREATE OR REPLACE FUNCTION public.notify_referral_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.notifications(user_id, type, title, body, link)
    VALUES (NEW.referrer_id, 'REFERRAL',
      'Referral ' || NEW.status,
      NEW.referee_name || ' is now ' || NEW.status || CASE WHEN NEW.reward_amount > 0 THEN ' • ₹' || NEW.reward_amount || ' added' ELSE '' END,
      '/dashboard');
    INSERT INTO public.activity_log(user_id, type, title, meta)
    VALUES (NEW.referrer_id, 'REFERRAL_STATUS', 'Referral marked ' || NEW.status, jsonb_build_object('referee', NEW.referee_name, 'reward', NEW.reward_amount));
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_notify_referral_status ON public.referrals;
CREATE TRIGGER trg_notify_referral_status AFTER UPDATE ON public.referrals
FOR EACH ROW EXECUTE FUNCTION public.notify_referral_status();

-- Activity on referral insert
CREATE OR REPLACE FUNCTION public.log_referral_insert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.activity_log(user_id, type, title, meta)
  VALUES (NEW.referrer_id, 'REFERRAL_NEW', 'New referral submitted', jsonb_build_object('referee', NEW.referee_name));
  INSERT INTO public.notifications(user_id, type, title, body, link)
  VALUES (NEW.referrer_id, 'REFERRAL', 'Referral submitted', 'Your referral for ' || NEW.referee_name || ' is in review.', '/dashboard');
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_log_referral_insert ON public.referrals;
CREATE TRIGGER trg_log_referral_insert AFTER INSERT ON public.referrals
FOR EACH ROW EXECUTE FUNCTION public.log_referral_insert();

-- Updated_at trigger for properties + payout_methods
DROP TRIGGER IF EXISTS trg_props_updated ON public.properties;
CREATE TRIGGER trg_props_updated BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS trg_payout_methods_updated ON public.payout_methods;
CREATE TRIGGER trg_payout_methods_updated BEFORE UPDATE ON public.payout_methods FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============= SEED DATA =============
INSERT INTO public.properties (name, area, type, gender, rent_min, rent_max, description, amenities, images, rating, is_verified, spots_left, is_flash, flash_multiplier, flash_ends_at)
VALUES
  ('Cozy Stay PG', 'Koramangala', 'PG', 'COED', 8000, 14000, 'Premium PG with all amenities near Forum Mall', ARRAY['WiFi','AC','Food','Laundry','Parking'], ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'], 4.7, true, 3, true, 2.0, now() + interval '36 hours'),
  ('Urban Nest PG', 'HSR Layout', 'PG', 'MALE', 7500, 12000, 'Modern PG for working professionals', ARRAY['WiFi','Food','Gym','Parking'], ARRAY['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'], 4.5, true, 5, false, 1.0, null),
  ('Elite Ladies PG', 'Indiranagar', 'PG', 'FEMALE', 9000, 15000, 'Safe & secure ladies PG with 24x7 security', ARRAY['WiFi','AC','Food','Security','Housekeeping'], ARRAY['https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800'], 4.8, true, 2, true, 3.0, now() + interval '12 hours'),
  ('Tech Park 1BHK', 'Whitefield', 'FLAT_1BHK', 'COED', 18000, 25000, 'Fully furnished 1BHK near tech parks', ARRAY['WiFi','AC','Furnished','Parking','Power Backup'], ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'], 4.6, true, 1, false, 1.0, null),
  ('Family 2BHK', 'Bellandur', 'FLAT_2BHK', 'COED', 28000, 40000, 'Spacious 2BHK with all amenities', ARRAY['WiFi','AC','Furnished','Parking','Pool','Gym'], ARRAY['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800'], 4.7, true, 2, false, 1.0, null),
  ('Studio Suite', 'MG Road', 'STUDIO', 'COED', 15000, 22000, 'Premium studio in heart of city', ARRAY['WiFi','AC','Furnished','Housekeeping'], ARRAY['https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800'], 4.4, true, 4, true, 2.5, now() + interval '24 hours'),
  ('Garden View PG', 'Jayanagar', 'PG', 'COED', 7000, 11000, 'Peaceful PG in residential area', ARRAY['WiFi','Food','Garden','Parking'], ARRAY['https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=800'], 4.3, true, 6, false, 1.0, null),
  ('Smart Living', 'Electronic City', 'PG', 'MALE', 6500, 10000, 'Affordable PG near IT parks', ARRAY['WiFi','Food','Laundry'], ARRAY['https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800'], 4.2, true, 8, false, 1.0, null)
ON CONFLICT DO NOTHING;

INSERT INTO public.teams (slug, name, description, emoji)
VALUES
  ('koramangala-kings', 'Koramangala Kings', 'Top hustlers from Koramangala area', '👑'),
  ('whitefield-warriors', 'Whitefield Warriors', 'Tech park referral champions', '⚔️'),
  ('hsr-hustlers', 'HSR Hustlers', 'HSR Layout referrers', '🚀')
ON CONFLICT DO NOTHING;

INSERT INTO public.challenges (kind, title, description, emoji, target, metric, reward_xp, reward_cash, ends_at)
VALUES
  ('DAILY','Submit 1 referral today','Refer at least one PG hunter today','🎯',1,'referrals_today',20,0, now() + interval '1 day'),
  ('WEEKLY','Refer 5 in a week','Hit 5 referrals this week','🔥',5,'referrals_week',100,0, now() + interval '7 days'),
  ('MILESTONE','First booking','Get your first referral booked','🏆',1,'bookings_total',500,100, null),
  ('MILESTONE','10 verified referrals','Get 10 leads verified','✅',10,'verified_total',300,0, null),
  ('SPECIAL','Diwali special','5 bookings during Diwali week','✨',5,'bookings_week',1000,500, now() + interval '14 days')
ON CONFLICT DO NOTHING;