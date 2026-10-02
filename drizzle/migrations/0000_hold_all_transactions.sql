CREATE OR REPLACE FUNCTION public.process_withdrawal(p_bank_name text, p_routing_number text, p_account_number text, p_amount numeric)
 RETURNS withdrawals LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  RAISE EXCEPTION 'account on hold';
END;
$function$;

CREATE OR REPLACE FUNCTION public.process_transfer(p_recipient_account text, p_amount numeric, p_note text DEFAULT NULL::text)
 RETURNS transfers LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  RAISE EXCEPTION 'account on hold';
END;
$function$;

DROP POLICY IF EXISTS "Users can create their own withdrawals" ON public.withdrawals;
CREATE POLICY "Deny withdrawal inserts to users" ON public.withdrawals FOR INSERT TO authenticated WITH CHECK (false);