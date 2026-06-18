## Why sign-up / login isn't responding

Two issues:

1. **Database tables don't exist.** The `profiles` and `withdrawals` tables from the previous migration file were never applied to the backend. The dashboard query fails silently after login.
2. **Email confirmation is on.** Sign-up succeeds but returns no session — Supabase is waiting for the user to click a confirmation link. Login then fails with "Email not confirmed."

## Plan

1. **Apply the SQL migration** in `supabase/migrations/20260616174348_init_horizon_bank.sql` to create:
   - `profiles` (UID, account number, €50,000 starting balance)
   - `withdrawals` (bank name, routing #, account #, amount, 10% gas fee, status)
   - `handle_new_user()` trigger to auto-create a profile on sign-up
   - RLS policies + GRANTs

2. **Disable email confirmation** so users can sign up and immediately land on the dashboard for mock testing (matches the "mock transactions" goal).

3. **Harden the auth page** to surface errors clearly (toast on failure, disable button while submitting) so future issues aren't silent.

4. **Verify** by hitting `/rest/v1/profiles` after migration and doing a sign-up → dashboard round-trip in the preview browser.

### Note on preview
Supabase auth sometimes hangs in the Lovable in-app preview iframe due to the fetch proxy. If it still doesn't respond after the fixes, test on the published URL — that's a known platform quirk, not a code bug.