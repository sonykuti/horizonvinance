## Add Internal Transfers Between Harizon Accounts

Let users send funds from their available balance to another Harizon account (by account number, e.g. `HRZ-XXXXXXXXX`) instantly, with no gas fee. Sender is debited, recipient is credited, and both see the transfer in their history.

### Database (one migration)

1. New table `public.transfers`:
   - `sender_id uuid` (auth user), `recipient_id uuid`
   - `sender_account text`, `recipient_account text`, `recipient_name text`
   - `amount numeric`, `note text`, `status text default 'completed'`
   - `created_at timestamptz`
   - GRANTs for `authenticated` + `service_role`; RLS: sender or recipient can SELECT; deny direct INSERT/UPDATE/DELETE (writes only via RPC).

2. New SECURITY DEFINER function `public.process_transfer(p_recipient_account text, p_amount numeric, p_note text)`:
   - Validates auth, positive amount, recipient exists, recipient ≠ sender, sufficient balance.
   - Locks both profile rows, debits sender, credits recipient (using `app.allow_balance_change='on'` like `process_withdrawal`).
   - Inserts a `transfers` row, returns it.

3. New SECURITY DEFINER function `public.lookup_recipient(p_account text)` returning `(full_name text)` so the sender can confirm the recipient name before submitting without exposing the whole profiles table.

### UI (`src/routes/_authenticated/dashboard.tsx`)

- Add a "Transfer" card next to the Withdraw card (stacks on mobile):
  - Recipient account number input (auto-formats `HRZ-XXXXXXXXX`)
  - On blur, calls `lookup_recipient` and shows recipient name or "Account not found"
  - Amount input, optional note
  - Submit calls `process_transfer` RPC; toast "Transfer completed", refreshes balance.
- Extend transaction history to merge withdrawals + transfers (sent shown as `−$`, received as `+$`), sorted by date, with a Type column (Withdrawal / Sent / Received).
- Update Quick stats to include a "Transfers" count.

### Out of scope
- No external bank transfers (that stays in Withdraw).
- No scheduled/recurring transfers.
- No fees on internal transfers.
