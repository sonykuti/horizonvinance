
-- 1) Prevent balance / account_number tampering via trigger
CREATE OR REPLACE FUNCTION public.prevent_sensitive_profile_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.balance IS DISTINCT FROM OLD.balance THEN
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

DROP TRIGGER IF EXISTS profiles_prevent_sensitive_changes ON public.profiles;
CREATE TRIGGER profiles_prevent_sensitive_changes
BEFORE UPDATE ON public.profiles
FOR EACH ROW
WHEN (current_setting('role', true) <> 'service_role')
EXECUTE FUNCTION public.prevent_sensitive_profile_changes();

-- 2) Explicit deny policies on user_roles for authenticated
DROP POLICY IF EXISTS "Deny role inserts to users" ON public.user_roles;
DROP POLICY IF EXISTS "Deny role updates to users" ON public.user_roles;
DROP POLICY IF EXISTS "Deny role deletes to users" ON public.user_roles;

CREATE POLICY "Deny role inserts to users" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (false);
CREATE POLICY "Deny role updates to users" ON public.user_roles
  FOR UPDATE TO authenticated USING (false) WITH CHECK (false);
CREATE POLICY "Deny role deletes to users" ON public.user_roles
  FOR DELETE TO authenticated USING (false);

-- 3) Explicit deny policies on withdrawals for authenticated
DROP POLICY IF EXISTS "Deny withdrawal updates to users" ON public.withdrawals;
DROP POLICY IF EXISTS "Deny withdrawal deletes to users" ON public.withdrawals;

CREATE POLICY "Deny withdrawal updates to users" ON public.withdrawals
  FOR UPDATE TO authenticated USING (false) WITH CHECK (false);
CREATE POLICY "Deny withdrawal deletes to users" ON public.withdrawals
  FOR DELETE TO authenticated USING (false);
