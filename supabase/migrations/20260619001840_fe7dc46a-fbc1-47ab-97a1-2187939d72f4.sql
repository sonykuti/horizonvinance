-- Allow atomic withdrawal that debits balance via SECURITY DEFINER function.
-- The existing prevent_sensitive_profile_changes trigger blocks balance updates;
-- we let it pass when a session-local flag is set, which only our function sets.

CREATE OR REPLACE FUNCTION public.prevent_sensitive_profile_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.balance IS DISTINCT FROM OLD.balance
     AND coalesce(current_setting('app.allow_balance_change', true), '') <> 'on' THEN
    RAISE EXCEPTION 'balance cannot be modified by users';
  END IF;
  IF NEW.account_number IS DISTINCT FROM OLD.account_number THEN
    RAISE EXCEPTION 'account_number cannot be modified';
  END IF;
  IF NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'id cannot be modified';
  END IF;
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    RAISE EXCEPTION 'email cannot be modified';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.process_withdrawal(
  p_bank_name text,
  p_routing_number text,
  p_account_number text,
  p_amount numeric
)
RETURNS public.withdrawals
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_gas numeric;
  v_total numeric;
  v_balance numeric;
  v_row public.withdrawals;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'invalid amount';
  END IF;

  v_gas := round(p_amount * 0.1, 2);
  v_total := round(p_amount + v_gas, 2);

  SELECT balance INTO v_balance FROM public.profiles WHERE id = v_user FOR UPDATE;
  IF v_balance IS NULL THEN
    RAISE EXCEPTION 'profile not found';
  END IF;
  IF v_total > v_balance THEN
    RAISE EXCEPTION 'insufficient balance';
  END IF;

  INSERT INTO public.withdrawals (user_id, bank_name, routing_number, account_number, amount, gas_fee, total, status)
  VALUES (v_user, p_bank_name, p_routing_number, p_account_number, p_amount, v_gas, v_total, 'pending')
  RETURNING * INTO v_row;

  PERFORM set_config('app.allow_balance_change', 'on', true);
  UPDATE public.profiles SET balance = round(v_balance - v_total, 2) WHERE id = v_user;
  PERFORM set_config('app.allow_balance_change', 'off', true);

  RETURN v_row;
END;
$$;

REVOKE ALL ON FUNCTION public.process_withdrawal(text, text, text, numeric) FROM public;
GRANT EXECUTE ON FUNCTION public.process_withdrawal(text, text, text, numeric) TO authenticated;