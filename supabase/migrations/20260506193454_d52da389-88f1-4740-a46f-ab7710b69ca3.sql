
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  referral_code TEXT NOT NULL UNIQUE,
  referred_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Referrals: tracks each lead a referrer submits
CREATE TYPE public.referral_status AS ENUM ('pending', 'verified', 'booked', 'rejected');

CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referee_name TEXT NOT NULL,
  referee_phone TEXT NOT NULL,
  referee_email TEXT,
  property_type TEXT,
  area TEXT,
  status public.referral_status NOT NULL DEFAULT 'pending',
  reward_amount NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own referrals"
  ON public.referrals FOR SELECT USING (auth.uid() = referrer_id);

CREATE POLICY "Users create own referrals"
  ON public.referrals FOR INSERT WITH CHECK (auth.uid() = referrer_id);

CREATE INDEX referrals_referrer_idx ON public.referrals(referrer_id);

-- Helper: generate unique short referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  code TEXT;
  exists_count INT;
BEGIN
  LOOP
    code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 7));
    SELECT count(*) INTO exists_count FROM public.profiles WHERE referral_code = code;
    EXIT WHEN exists_count = 0;
  END LOOP;
  RETURN code;
END;
$$;

-- Trigger: create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  ref_code TEXT;
  inviter UUID;
  invited_by_code TEXT;
BEGIN
  ref_code := public.generate_referral_code();
  invited_by_code := NEW.raw_user_meta_data->>'referred_by_code';

  IF invited_by_code IS NOT NULL AND invited_by_code <> '' THEN
    SELECT id INTO inviter FROM public.profiles WHERE referral_code = upper(invited_by_code);
  END IF;

  INSERT INTO public.profiles (id, full_name, email, phone, referral_code, referred_by)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    ref_code,
    inviter
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER referrals_updated_at BEFORE UPDATE ON public.referrals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
