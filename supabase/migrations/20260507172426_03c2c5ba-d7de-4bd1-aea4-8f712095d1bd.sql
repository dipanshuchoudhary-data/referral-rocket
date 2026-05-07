
ALTER TABLE public.profiles
  ADD COLUMN xp integer NOT NULL DEFAULT 0,
  ADD COLUMN level integer NOT NULL DEFAULT 1,
  ADD COLUMN streak_days integer NOT NULL DEFAULT 0,
  ADD COLUMN last_referral_date date,
  ADD COLUMN lucky_tickets integer NOT NULL DEFAULT 0;

CREATE TABLE public.lucky_draws (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  prize_label text NOT NULL,
  prize_amount numeric NOT NULL DEFAULT 0,
  prize_kind text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lucky_draws ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own draws" ON public.lucky_draws
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- level helper
CREATE OR REPLACE FUNCTION public.level_for_xp(_xp integer)
RETURNS integer LANGUAGE sql IMMUTABLE AS $$
  SELECT GREATEST(1, floor(sqrt(_xp::numeric / 100))::int + 1)
$$;

-- award on insert
CREATE OR REPLACE FUNCTION public.handle_referral_insert_gamify()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  prev_date date;
  new_streak int;
  new_xp int;
  ref_count int;
  add_ticket int := 0;
BEGIN
  SELECT last_referral_date FROM public.profiles WHERE id = NEW.referrer_id INTO prev_date;
  IF prev_date IS NULL THEN new_streak := 1;
  ELSIF prev_date = CURRENT_DATE THEN
    SELECT streak_days FROM public.profiles WHERE id = NEW.referrer_id INTO new_streak;
  ELSIF prev_date = CURRENT_DATE - 1 THEN
    SELECT streak_days + 1 FROM public.profiles WHERE id = NEW.referrer_id INTO new_streak;
  ELSE new_streak := 1;
  END IF;

  SELECT count(*) FROM public.referrals WHERE referrer_id = NEW.referrer_id INTO ref_count;
  IF ref_count % 5 = 0 THEN add_ticket := 1; END IF;

  UPDATE public.profiles
  SET xp = xp + 10,
      level = public.level_for_xp(xp + 10),
      streak_days = new_streak,
      last_referral_date = CURRENT_DATE,
      lucky_tickets = lucky_tickets + add_ticket
  WHERE id = NEW.referrer_id;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_referrals_insert_gamify
AFTER INSERT ON public.referrals
FOR EACH ROW EXECUTE FUNCTION public.handle_referral_insert_gamify();

-- award on status update
CREATE OR REPLACE FUNCTION public.handle_referral_status_gamify()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE bonus int := 0;
BEGIN
  IF NEW.status = 'verified' AND OLD.status IS DISTINCT FROM 'verified' THEN bonus := 50;
  ELSIF NEW.status = 'booked' AND OLD.status IS DISTINCT FROM 'booked' THEN bonus := 200;
  END IF;
  IF bonus > 0 THEN
    UPDATE public.profiles
    SET xp = xp + bonus, level = public.level_for_xp(xp + bonus)
    WHERE id = NEW.referrer_id;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_referrals_status_gamify
AFTER UPDATE ON public.referrals
FOR EACH ROW EXECUTE FUNCTION public.handle_referral_status_gamify();

-- spin RPC
CREATE OR REPLACE FUNCTION public.spin_lucky()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid := auth.uid();
  tickets int;
  r numeric;
  prize_label text;
  prize_amount numeric := 0;
  prize_kind text;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'unauthorized'; END IF;
  SELECT lucky_tickets FROM public.profiles WHERE id = uid INTO tickets;
  IF tickets IS NULL OR tickets <= 0 THEN
    RAISE EXCEPTION 'no_tickets';
  END IF;

  r := random();
  IF r < 0.40 THEN prize_label := '+25 XP'; prize_kind := 'xp'; prize_amount := 25;
  ELSIF r < 0.70 THEN prize_label := '₹10 cash'; prize_kind := 'cash'; prize_amount := 10;
  ELSIF r < 0.88 THEN prize_label := '₹50 cash'; prize_kind := 'cash'; prize_amount := 50;
  ELSIF r < 0.97 THEN prize_label := '₹100 cash'; prize_kind := 'cash'; prize_amount := 100;
  ELSIF r < 0.995 THEN prize_label := 'Bonus ticket 🎟️'; prize_kind := 'ticket'; prize_amount := 1;
  ELSE prize_label := '₹500 jackpot 🎉'; prize_kind := 'cash'; prize_amount := 500;
  END IF;

  UPDATE public.profiles SET lucky_tickets = lucky_tickets - 1 WHERE id = uid;

  IF prize_kind = 'xp' THEN
    UPDATE public.profiles SET xp = xp + prize_amount::int, level = public.level_for_xp(xp + prize_amount::int) WHERE id = uid;
  ELSIF prize_kind = 'ticket' THEN
    UPDATE public.profiles SET lucky_tickets = lucky_tickets + 1 WHERE id = uid;
  ELSIF prize_kind = 'cash' THEN
    INSERT INTO public.rewards_ledger (user_id, amount, reason) VALUES (uid, prize_amount, 'lucky_draw:' || prize_label);
  END IF;

  INSERT INTO public.lucky_draws (user_id, prize_label, prize_amount, prize_kind)
  VALUES (uid, prize_label, prize_amount, prize_kind);

  RETURN jsonb_build_object('label', prize_label, 'amount', prize_amount, 'kind', prize_kind);
END $$;
