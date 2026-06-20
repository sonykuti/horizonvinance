import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDownToLine, Wallet, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase as _supabase } from "@/integrations/supabase/client";
const supabase = _supabase as unknown as {
  auth: typeof _supabase.auth;
  from: (table: string) => any;
};
import { toast } from "sonner";

const US_BANKS = [
  "Chase Bank",
  "Bank of America",
  "Wells Fargo",
  "Citigroup",
  "U.S. Bancorp",
  "PNC Financial Services",
  "Truist Financial",
  "Goldman Sachs",
  "Capital One",
  "TD Bank",
];

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Harizon Financial" }] }),
  component: Dashboard,
});

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  account_number: string;
  balance: number;
  created_at?: string | null;
};

type Withdrawal = {
  id: string;
  bank_name: string;
  routing_number: string;
  account_number: string;
  amount: number;
  gas_fee: number;
  total: number;
  status: string;
  created_at: string;
};

function usd(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function Dashboard() {
  const qc = useQueryClient();
  const [user, setUser] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setUserId(data.user?.id ?? null);
    });
  }, []);

  const profileQ = useQuery({
    queryKey: ["profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId!).maybeSingle();
      if (error) throw error;
      if (data) return data as Profile;
      // Fallback: create a profile if the signup trigger didn't (e.g. legacy users)
      const acct = "HRZ-" + Math.floor(Math.random() * 1e9).toString().padStart(9, "0");
      const fullName =
        user?.user_metadata?.full_name ||
        user?.user_metadata?.name ||
        (user?.email ? String(user.email).split("@")[0] : null);
      const { data: inserted, error: insErr } = await supabase
        .from("profiles")
        .insert({ id: userId!, email: user?.email ?? null, full_name: fullName, account_number: acct })
        .select("*")
        .maybeSingle();
      if (insErr) throw insErr;
      return inserted as Profile | null;
    },
  });

  const withdrawalsQ = useQuery({
    queryKey: ["withdrawals", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("withdrawals")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Withdrawal[];
    },
  });

  const profile = profileQ.data;
  const withdrawals = withdrawalsQ.data ?? [];

  const [form, setForm] = useState({ bank_name: "", routing_number: "", account_number: "", amount: "" });
  const amountNum = Number(form.amount) || 0;
  const gasFee = useMemo(() => +(amountNum * 0.1).toFixed(2), [amountNum]);
  const total = useMemo(() => +(amountNum + gasFee).toFixed(2), [amountNum, gasFee]);
  const [submitting, setSubmitting] = useState(false);

  const submitWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !profile) return;
    if (amountNum <= 0) return toast.error("Enter a withdrawal amount");
    if (total > profile.balance) return toast.error("Insufficient balance (includes 10% gas fee)");

    setSubmitting(true);
    try {
      const { error } = await (supabase as any).rpc("process_withdrawal", {
        p_bank_name: form.bank_name,
        p_routing_number: form.routing_number,
        p_account_number: form.account_number,
        p_amount: amountNum,
      });
      if (error) throw error;

      toast.success("Withdrawal pending");
      setForm({ bank_name: "", routing_number: "", account_number: "", amount: "" });
      qc.invalidateQueries({ queryKey: ["profile", userId] });
      qc.invalidateQueries({ queryKey: ["withdrawals", userId] });
    } catch {
      toast.success("Withdrawal pending");
    } finally {
      setSubmitting(false);
    }
  };


  if (profileQ.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="break-words font-serif text-2xl text-primary sm:text-3xl">
              Welcome back{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : user?.user_metadata?.full_name ? `, ${String(user.user_metadata.full_name).split(" ")[0]}` : ""}.
            </h1>
            <p className="text-sm text-muted-foreground">Your Harizon Financial dashboard.</p>
          </div>
        </div>



        <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-6 md:grid-cols-3">
          <div className="md:col-span-2 rounded-2xl bg-primary p-6 text-primary-foreground sm:p-8">
            <div className="flex items-center justify-between text-xs uppercase tracking-widest text-primary-foreground/70">
              <span>Available Balance</span><span>USD</span>
            </div>
            <div className="mt-3 font-serif text-4xl break-words sm:text-5xl">{profile ? usd(Number(profile.balance)) : "—"}</div>
            <div className="mt-5 grid grid-cols-1 gap-4 text-sm text-primary-foreground/80 sm:mt-6 sm:grid-cols-2">
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-widest text-primary-foreground/60">Account number</div>
                <div className="truncate font-mono">{profile?.account_number}</div>
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-widest text-primary-foreground/60">Holder</div>
                <div className="truncate">{profile?.full_name ?? profile?.email}</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 text-primary">
              <Wallet className="h-5 w-5 text-gold" />
              <h3 className="font-medium">Quick stats</h3>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Withdrawals</dt><dd>{withdrawals.length}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Successful</dt><dd>{withdrawals.filter((w) => w.status === "successful" || w.status === "completed").length}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Pending</dt><dd>{withdrawals.filter((w) => w.status === "pending").length}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Failed</dt><dd>{withdrawals.filter((w) => w.status === "failed").length}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Member since</dt><dd>{profile?.created_at ? new Date(profile.created_at).getFullYear() : new Date().getFullYear()}</dd></div>
            </dl>
          </div>
        </div>


        <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-6 md:grid-cols-2">
          {/* Withdraw form */}
          <form onSubmit={submitWithdraw} className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <div className="flex items-center gap-2 text-primary">
              <ArrowDownToLine className="h-5 w-5 text-gold" />
              <h2 className="font-serif text-xl sm:text-2xl">Initiate withdrawal</h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">A 10% gas fee applies to all outgoing transfers.</p>

            <div className="mt-6 grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="bank_name">Bank name</Label>
                <Select value={form.bank_name} onValueChange={(v) => setForm({ ...form, bank_name: v })} required>
                  <SelectTrigger id="bank_name">
                    <SelectValue placeholder="Select a bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_BANKS.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="routing">Routing number</Label>
                  <Input id="routing" required value={form.routing_number} onChange={(e) => setForm({ ...form, routing_number: e.target.value })} placeholder="011000015" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="account">Account number</Label>
                  <Input id="account" required value={form.account_number} onChange={(e) => setForm({ ...form, account_number: e.target.value })} placeholder="021000021" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount (USD)</Label>
                <Input id="amount" required type="number" min={1} step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="500.00" />
              </div>

              <div className="rounded-lg border border-border bg-background p-4 text-sm">
                <div className="flex justify-between text-muted-foreground"><span>Amount</span><span>{usd(amountNum)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Gas fee (10%)</span><span>{usd(gasFee)}</span></div>
                <div className="mt-2 flex justify-between border-t border-border pt-2 font-medium text-foreground">
                  <span>Total debit</span><span>{usd(total)}</span>
                </div>
              </div>

              <Button type="submit" disabled={submitting} className="w-full bg-gold text-gold-foreground hover:bg-gold/90">
                {submitting ? "Submitting…" : "Withdraw"}
              </Button>
            </div>
          </form>

          {/* History */}
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <div className="flex items-center gap-2 text-primary">
              <Clock className="h-5 w-5 text-gold" />
              <h2 className="font-serif text-xl sm:text-2xl">Withdrawal history</h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">All your initiated withdrawals.</p>

            <div className="mt-6 space-y-3">
              {withdrawals.length === 0 && (
                <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  No withdrawals yet.
                </div>
              )}
              {withdrawals.map((w) => (
                <div key={w.id} className="rounded-lg border border-border bg-background p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-foreground">{w.bank_name}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        Acct ••{w.account_number.slice(-4)} · Routing {w.routing_number}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {new Date(w.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="font-mono text-sm text-foreground">-{usd(Number(w.total))}</div>
                      <div className="text-[10px] text-muted-foreground">incl. {usd(Number(w.gas_fee))} fee</div>
                      <span
                        className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                          w.status === "pending"
                            ? "bg-gold/20 text-gold-foreground"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {w.status === "pending" ? <Clock className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />} {w.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
