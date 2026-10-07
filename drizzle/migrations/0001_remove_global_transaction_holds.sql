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

CREATE OR REPLACE FUNCTION public.process_transfer(
  p_recipient_account text,
  p_amount numeric,
  p_note text DEFAULT NULL
)
RETURNS public.transfers
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sender uuid := auth.uid();
  v_sender_account text;
  v_sender_balance numeric;
  v_recipient_id uuid;
  v_recipient_name text;
  v_recipient_balance numeric;
  v_row public.transfers;
BEGIN
  IF v_sender IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'invalid amount';
  END IF;
  IF p_recipient_account IS NULL OR length(trim(p_recipient_account)) = 0 THEN
    RAISE EXCEPTION 'recipient account required';
  END IF;

  SELECT account_number, balance INTO v_sender_account, v_sender_balance
  FROM public.profiles WHERE id = v_sender FOR UPDATE;
  IF v_sender_account IS NULL THEN
    RAISE EXCEPTION 'sender profile not found';
  END IF;

  SELECT id, full_name, balance INTO v_recipient_id, v_recipient_name, v_recipient_balance
  FROM public.profiles WHERE account_number = p_recipient_account FOR UPDATE;
  IF v_recipient_id IS NULL THEN
    RAISE EXCEPTION 'recipient account not found';
  END IF;
  IF v_recipient_id = v_sender THEN
    RAISE EXCEPTION 'cannot transfer to your own account';
  END IF;
  IF p_amount > v_sender_balance THEN
    RAISE EXCEPTION 'insufficient balance';
  END IF;

  PERFORM set_config('app.allow_balance_change', 'on', true);
  UPDATE public.profiles SET balance = round(v_sender_balance - p_amount, 2) WHERE id = v_sender;
  UPDATE public.profiles SET balance = round(v_recipient_balance + p_amount, 2) WHERE id = v_recipient_id;
  PERFORM set_config('app.allow_balance_change', 'off', true);

  INSERT INTO public.transfers (sender_id, recipient_id, sender_account, recipient_account, recipient_name, amount, note, status)
  VALUES (v_sender, v_recipient_id, v_sender_account, p_recipient_account, v_recipient_name, p_amount, p_note, 'completed')
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.process_transfer(text, numeric, text) FROM public;
GRANT EXECUTE ON FUNCTION public.process_transfer(text, numeric, text) TO authenticated;