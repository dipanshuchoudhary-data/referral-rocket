
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admin policies on profiles
CREATE POLICY "Admins view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Payout columns on referrals
ALTER TABLE public.referrals
  ADD COLUMN payout_status text NOT NULL DEFAULT 'unpaid',
  ADD COLUMN verified_at timestamptz,
  ADD COLUMN booked_at timestamptz,
  ADD COLUMN paid_at timestamptz,
  ADD COLUMN admin_note text;

-- Admin policies on referrals
CREATE POLICY "Admins view all referrals" ON public.referrals
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update referrals" ON public.referrals
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete referrals" ON public.referrals
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Auto-set reward + timestamps on status change
CREATE OR REPLACE FUNCTION public.handle_referral_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'verified' AND (OLD.status IS DISTINCT FROM 'verified') THEN
    NEW.verified_at = now();
    IF NEW.reward_amount = 0 THEN NEW.reward_amount = 50; END IF;
  ELSIF NEW.status = 'booked' AND (OLD.status IS DISTINCT FROM 'booked') THEN
    NEW.booked_at = now();
    NEW.reward_amount = 500;
    IF NEW.verified_at IS NULL THEN NEW.verified_at = now(); END IF;
  ELSIF NEW.status = 'rejected' THEN
    NEW.reward_amount = 0;
    NEW.payout_status = 'unpaid';
  ELSIF NEW.status = 'pending' THEN
    NEW.reward_amount = 0;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_referrals_status
BEFORE UPDATE ON public.referrals
FOR EACH ROW EXECUTE FUNCTION public.handle_referral_status();

CREATE TRIGGER trg_referrals_updated
BEFORE UPDATE ON public.referrals
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_profiles_updated
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Rewards ledger
CREATE TABLE public.rewards_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  referral_id uuid REFERENCES public.referrals(id) ON DELETE SET NULL,
  amount numeric NOT NULL,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.rewards_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own ledger" ON public.rewards_ledger
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage ledger" ON public.rewards_ledger
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Auto-create user role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_new_user_role
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();
