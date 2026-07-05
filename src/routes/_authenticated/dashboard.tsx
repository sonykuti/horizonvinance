import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDownToLine, Wallet, Clock, CheckCircle2, Loader2, Send, ArrowDownLeft, ArrowUpRight, Download } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase as _supabase } from "@/integrations/supabase/client";
const supabase = _supabase as unknown as {
  auth: typeof _supabase.auth;
  storage: typeof _supabase.storage;
  from: (table: string) => any;
  rpc: (fn: string, args?: any) => any;
};
import { toast } from "sonner";

const US_BANKS = [
  "Bank of America",
  "Capital One",
  "Chase Bank",
  "Citigroup",
  "Eastern Bank",
  "Garden Savings FCU",
  "Goldman Sachs",
  "HCN Bank",
  "Northern Bank",
  "PNC Financial Services",
  "Stride Bank",
  "TD Bank",
  "Truist Financial",
  "U.S. Bancorp",
  "Wells Fargo",
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

type Transfer = {
  id: string;
  sender_id: string;
  recipient_id: string;
  sender_account: string;
  recipient_account: string;
  recipient_name: string | null;
  amount: number;
  note: string | null;
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

  const transfersQ = useQuery({
    queryKey: ["transfers", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transfers")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Transfer[];
    },
  });

  const profile = profileQ.data;
  const withdrawals = withdrawalsQ.data ?? [];
  const transfers = transfersQ.data ?? [];

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
      const { error } = await supabase.rpc("process_withdrawal", {
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

  // Transfer state
  const [transferForm, setTransferForm] = useState({ recipient_account: "", amount: "", note: "" });
  const [recipientName, setRecipientName] = useState<string | null>(null);
  const [recipientStatus, setRecipientStatus] = useState<"idle" | "checking" | "found" | "notfound">("idle");
  const [transferring, setTransferring] = useState(false);
  const transferAmount = Number(transferForm.amount) || 0;

  const lookupRecipient = async () => {
    const acct = transferForm.recipient_account.trim();
    if (!acct) {
      setRecipientName(null);
      setRecipientStatus("idle");
      return;
    }
    if (profile && acct === profile.account_number) {
      setRecipientName(null);
      setRecipientStatus("notfound");
      return;
    }
    setRecipientStatus("checking");
    const { data, error } = await supabase.rpc("lookup_recipient", { p_account: acct });
    if (error || !data || (Array.isArray(data) && data.length === 0)) {
      setRecipientName(null);
      setRecipientStatus("notfound");
      return;
    }
    const row = Array.isArray(data) ? data[0] : data;
    setRecipientName(row?.full_name ?? "Harizon account");
    setRecipientStatus("found");
  };

  const [confirmOpen, setConfirmOpen] = useState(false);

  const openTransferConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !profile) return;
    const acct = transferForm.recipient_account.trim();
    if (!acct) return toast.error("Enter a recipient account");
    if (profile.account_number === acct) return toast.error("You can't transfer to your own account");
    if (transferAmount <= 0) return toast.error("Enter a transfer amount");
    if (transferAmount > Number(profile.balance)) return toast.error("Insufficient balance");
    if (recipientStatus === "notfound") return toast.error("Recipient account not found");
    if (recipientStatus !== "found") {
      toast.message("Verifying recipient…", { description: "Please wait a moment and try again." });
      lookupRecipient();
      return;
    }
    setConfirmOpen(true);
  };

  const submitTransfer = async () => {
    if (!userId || !profile) return;
    const acct = transferForm.recipient_account.trim();
    setTransferring(true);
    try {
      const { error } = await supabase.rpc("process_transfer", {
        p_recipient_account: acct,
        p_amount: transferAmount,
        p_note: transferForm.note || null,
      });
      if (error) throw error;
      toast.success("Transfer completed", {
        description: `${usd(transferAmount)} sent to ${recipientName ?? acct}.`,
      });
      setTransferForm({ recipient_account: "", amount: "", note: "" });
      setRecipientName(null);
      setRecipientStatus("idle");
      setConfirmOpen(false);
      qc.invalidateQueries({ queryKey: ["profile", userId] });
      qc.invalidateQueries({ queryKey: ["transfers", userId] });
    } catch (err: any) {
      const msg = String(err?.message ?? "Transfer failed");
      if (msg.includes("recipient account not found"))
        toast.error("Transfer failed", { description: "Recipient account not found." });
      else if (msg.includes("insufficient"))
        toast.error("Transfer failed", { description: "Insufficient balance for this transfer." });
      else if (msg.includes("own account"))
        toast.error("Transfer failed", { description: "You can't transfer to your own account." });
      else toast.error("Transfer failed", { description: msg });
    } finally {
      setTransferring(false);
    }
  };

  // Merged activity feed
  type Activity = {
    id: string;
    kind: "withdrawal" | "sent" | "received";
    title: string;
    subtitle: string;
    amount: number;
    sign: "-" | "+";
    status: string;
    created_at: string;
    withdrawal?: Withdrawal;
    transfer?: Transfer;
    counterpartyLabel?: string;
  };

  const activity: Activity[] = useMemo(() => {
    const w: Activity[] = withdrawals.map((x) => ({
      id: `w-${x.id}`,
      kind: "withdrawal",
      title: x.bank_name,
      subtitle: `Acct ••${x.account_number.slice(-4)} · Routing ${x.routing_number}`,
      amount: Number(x.total),
      sign: "-",
      status: x.status,
      created_at: x.created_at,
      withdrawal: x,
    }));
    const t: Activity[] = transfers.map((x) => {
      const isSender = x.sender_id === userId;
      return {
        id: `t-${x.id}`,
        kind: isSender ? "sent" : "received",
        title: isSender
          ? `Transfer to ${x.recipient_name ?? x.recipient_account}`
          : `Transfer from ${x.sender_account}`,
        subtitle: isSender ? x.recipient_account : `${x.note ? x.note : "Internal transfer"}`,
        amount: Number(x.amount),
        sign: isSender ? "-" : "+",
        status: x.status,
        created_at: x.created_at,
        transfer: x,
        counterpartyLabel: isSender
          ? (x.recipient_name ?? x.recipient_account)
          : x.sender_account,
      };
    });
    return [...w, ...t].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  }, [withdrawals, transfers, userId]);

  const buildReceiptPdf = async (a: Activity) => {
    const { jsPDF } = await import("jspdf");
    // US Letter, 0.75" margins on all sides for print-friendliness
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const W = doc.internal.pageSize.getWidth();   // 612pt
    const H = doc.internal.pageSize.getHeight();  // 792pt
    const M = 54;                                 // 0.75in margin
    const contentW = W - M * 2;
    const navy = [11, 31, 63] as const;
    const gold = [193, 154, 60] as const;

    doc.setProperties({
      title: `Harizon Financial Receipt`,
      subject: `Transaction receipt`,
      author: "Harizon Financial",
    });

    // Header band (respects side margins)
    const headerH = 84;
    doc.setFillColor(navy[0], navy[1], navy[2]);
    doc.rect(M, M, contentW, headerH, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Harizon Financial", M + 20, M + 34);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Transaction Receipt", M + 20, M + 54);
    doc.setTextColor(gold[0], gold[1], gold[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(
      a.kind === "withdrawal" ? "WITHDRAWAL" : a.kind === "sent" ? "TRANSFER SENT" : "TRANSFER RECEIVED",
      W - M - 20, M + 34, { align: "right" },
    );
    doc.setFont("helvetica", "normal");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text(new Date(a.created_at).toLocaleString(), W - M - 20, M + 54, { align: "right" });

    // Body
    doc.setTextColor(20, 20, 20);
    let y = M + headerH + 32;
    const rawId = a.withdrawal?.id ?? a.transfer?.id ?? a.id;
    const rows: Array<[string, string]> = [
      ["Receipt ID", rawId],
      ["Date", new Date(a.created_at).toLocaleString()],
      ["Status", a.status.toUpperCase()],
      ["Account holder", profile?.full_name ?? profile?.email ?? "—"],
      ["Your account", profile?.account_number ?? "—"],
    ];
    if (a.withdrawal) {
      rows.push(
        ["Destination bank", a.withdrawal.bank_name],
        ["Routing number", a.withdrawal.routing_number],
        ["Destination account", a.withdrawal.account_number],
        ["Amount", usd(Number(a.withdrawal.amount))],
        ["Gas fee (10%)", usd(Number(a.withdrawal.gas_fee))],
        ["Total debited", usd(Number(a.withdrawal.total))],
      );
    } else if (a.transfer) {
      rows.push(
        [a.kind === "sent" ? "Recipient" : "Sender", a.counterpartyLabel ?? "—"],
        [a.kind === "sent" ? "Recipient account" : "Sender account",
          a.kind === "sent" ? a.transfer.recipient_account : a.transfer.sender_account],
        ["Amount", usd(Number(a.transfer.amount))],
        ["Fee", usd(0)],
        [a.kind === "sent" ? "Total debited" : "Total credited", usd(Number(a.transfer.amount))],
      );
      if (a.transfer.note) rows.push(["Note", a.transfer.note]);
    }

    doc.setDrawColor(230, 230, 230);
    doc.setFontSize(11);
    const rowH = 26;
    rows.forEach(([k, v]) => {
      // paginate if we'd cross the bottom margin
      if (y > H - M - 60) {
        doc.addPage();
        y = M + 20;
      }
      doc.setFont("helvetica", "normal");
      doc.setTextColor(110, 110, 110);
      doc.text(k, M, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(20, 20, 20);
      const wrapped = doc.splitTextToSize(String(v), contentW * 0.6);
      doc.text(wrapped, W - M, y, { align: "right" });
      doc.line(M, y + 6, W - M, y + 6);
      y += rowH + Math.max(0, (wrapped.length - 1) * 12);
    });

    // Footer pinned near bottom margin
    const footerY = H - M - 20;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(
      "This receipt is generated electronically and is valid without a signature.",
      W / 2, footerY - 14, { align: "center" },
    );
    doc.text("Harizon Financial · Member FDIC · support@harizonfinancial.com", W / 2, footerY, {
      align: "center",
    });

    return { doc, rawId };
  };

  const triggerBlobDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const downloadReceipt = async (a: Activity) => {
    if (!userId) return;
    try {
      const rawId = a.withdrawal?.id ?? a.transfer?.id ?? a.id;
      const filename = `harizon-receipt-${rawId.slice(0, 8)}.pdf`;
      const storagePath = `${userId}/${rawId}.pdf`;

      // Try to fetch previously stored receipt first
      const { data: existing } = await supabase.storage.from("receipts").download(storagePath);
      if (existing) {
        triggerBlobDownload(existing as Blob, filename);
        toast.success("Receipt downloaded", { description: filename });
        return;
      }

      // Otherwise generate, store, then download
      const { doc } = await buildReceiptPdf(a);
      const blob = doc.output("blob") as Blob;
      const { error: upErr } = await supabase.storage
        .from("receipts")
        .upload(storagePath, blob, { contentType: "application/pdf", upsert: true });
      if (upErr) {
        // still deliver the PDF even if storage upload failed
        console.warn("Receipt storage upload failed", upErr);
      }
      triggerBlobDownload(blob, filename);
      toast.success("Receipt downloaded", { description: filename });
    } catch (err: any) {
      toast.error("Could not generate receipt", { description: String(err?.message ?? err) });
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
              <div className="flex justify-between"><dt className="text-muted-foreground">Transfers</dt><dd>{transfers.length}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Successful</dt><dd>{withdrawals.filter((w) => w.status === "successful" || w.status === "completed").length + transfers.filter((t) => t.status === "completed").length}</dd></div>
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

          {/* Internal Transfer form */}
          <form onSubmit={openTransferConfirm} className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <div className="flex items-center gap-2 text-primary">
              <Send className="h-5 w-5 text-gold" />
              <h2 className="font-serif text-xl sm:text-2xl">Send to Harizon account</h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Instant, fee-free transfers between Harizon accounts.</p>

            <div className="mt-6 grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="recipient_account">Recipient account number</Label>
                <Input
                  id="recipient_account"
                  required
                  value={transferForm.recipient_account}
                  onChange={(e) => {
                    setTransferForm({ ...transferForm, recipient_account: e.target.value });
                    setRecipientStatus("idle");
                    setRecipientName(null);
                  }}
                  onBlur={lookupRecipient}
                  placeholder="HRZ-123456789"
                  className="font-mono"
                />
                {recipientStatus === "checking" && (
                  <p className="text-xs text-muted-foreground">Looking up recipient…</p>
                )}
                {recipientStatus === "found" && recipientName && (
                  <p className="text-xs text-emerald-600">✓ {recipientName}</p>
                )}
                {recipientStatus === "notfound" && (
                  <p className="text-xs text-destructive">Account not found</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="transfer_amount">Amount (USD)</Label>
                <Input
                  id="transfer_amount"
                  required
                  type="number"
                  min={1}
                  step="0.01"
                  value={transferForm.amount}
                  onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                  placeholder="250.00"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="note">Note (optional)</Label>
                <Input
                  id="note"
                  value={transferForm.note}
                  onChange={(e) => setTransferForm({ ...transferForm, note: e.target.value })}
                  placeholder="Rent, dinner, etc."
                  maxLength={120}
                />
              </div>

              <div className="rounded-lg border border-border bg-background p-4 text-sm">
                <div className="flex justify-between text-muted-foreground"><span>Amount</span><span>{usd(transferAmount)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Fee</span><span>{usd(0)}</span></div>
                <div className="mt-2 flex justify-between border-t border-border pt-2 font-medium text-foreground">
                  <span>Total debit</span><span>{usd(transferAmount)}</span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={transferring || recipientStatus === "notfound"}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {transferring ? "Sending…" : "Send transfer"}
              </Button>
            </div>
          </form>
        </div>

        <AlertDialog open={confirmOpen} onOpenChange={(o) => !transferring && setConfirmOpen(o)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm transfer</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-3 text-sm">
                  <p>Please review the details before sending. Internal transfers are instant and cannot be reversed.</p>
                  <div className="rounded-lg border border-border bg-background p-3 text-foreground">
                    <div className="flex justify-between py-1"><span className="text-muted-foreground">Recipient</span><span className="font-medium">{recipientName ?? "—"}</span></div>
                    <div className="flex justify-between py-1"><span className="text-muted-foreground">Account</span><span className="font-mono">{transferForm.recipient_account}</span></div>
                    <div className="flex justify-between py-1"><span className="text-muted-foreground">Amount</span><span className="font-mono">{usd(transferAmount)}</span></div>
                    {transferForm.note && (
                      <div className="flex justify-between py-1"><span className="text-muted-foreground">Note</span><span className="max-w-[60%] truncate">{transferForm.note}</span></div>
                    )}
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={transferring}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={transferring}
                onClick={(e) => { e.preventDefault(); submitTransfer(); }}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {transferring ? "Sending…" : `Send ${usd(transferAmount)}`}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>


        {/* Activity history */}
        <div className="mt-6 rounded-2xl border border-border bg-card p-6 sm:mt-8 sm:p-8">
          <div className="flex items-center gap-2 text-primary">
            <Clock className="h-5 w-5 text-gold" />
            <h2 className="font-serif text-xl sm:text-2xl">Activity history</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Withdrawals and internal transfers.</p>

          <div className="mt-6 space-y-3">
            {activity.length === 0 && (
              <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No activity yet.
              </div>
            )}
            {activity.map((a) => (
              <div key={a.id} className="rounded-lg border border-border bg-background p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      a.kind === "received" ? "bg-emerald-100 text-emerald-700" :
                      a.kind === "sent" ? "bg-primary/10 text-primary" :
                      "bg-gold/20 text-primary"
                    }`}>
                      {a.kind === "received" ? <ArrowDownLeft className="h-4 w-4" /> :
                       a.kind === "sent" ? <ArrowUpRight className="h-4 w-4" /> :
                       <ArrowDownToLine className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-foreground">{a.title}</div>
                      <div className="truncate text-xs text-muted-foreground">{a.subtitle}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className={`font-mono text-sm ${a.sign === "+" ? "text-emerald-600" : "text-foreground"}`}>
                      {a.sign}{usd(a.amount)}
                    </div>
                    <span
                      className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                        a.status === "pending"
                          ? "bg-gold/20 text-gold-foreground"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {a.status === "pending" ? <Clock className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />} {a.status}
                    </span>
                    <div className="mt-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => downloadReceipt(a)}
                        className="h-7 gap-1 px-2 text-[11px]"
                      >
                        <Download className="h-3 w-3" /> Receipt
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
