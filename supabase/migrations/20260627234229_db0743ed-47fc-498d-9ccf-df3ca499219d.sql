
CREATE TABLE public.transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  sender_account text NOT NULL,
  recipient_account text NOT NULL,
  recipient_name text,
  amount numeric NOT NULL,
  note text,
  status text NOT NULL DEFAULT 'completed',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.transfers TO authenticated;
GRANT ALL ON public.transfers TO service_role;

ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view transfers they sent or received"
  ON public.transfers FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Deny transfer inserts to users"
  ON public.transfers FOR INSERT TO authenticated WITH CHECK (false);

CREATE POLICY "Deny transfer updates to users"
  ON public.transfers FOR UPDATE TO authenticated USING (false) WITH CHECK (false);

CREATE POLICY "Deny transfer deletes to users"
  ON public.transfers FOR DELETE TO authenticated USING (false);

-- Lookup a recipient's display name by account number (no other PII exposed)
CREATE OR REPLACE FUNCTION public.lookup_recipient(p_account text)
RETURNS TABLE(full_name text, account_number text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT full_name, account_number
  FROM public.profiles
  WHERE account_number = p_account
  LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION public.lookup_recipient(text) FROM public;
GRANT EXECUTE ON FUNCTION public.lookup_recipient(text) TO authenticated;

-- Atomically move funds between two Harizon accounts
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
