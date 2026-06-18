import { CreditCard, Fingerprint, ShieldCheck, TrendingUp, Wallet, ArrowUpRight, Banknote, LineChart, Lock } from "lucide-react";

/**
 * Decorative, non-interactive background for the landing page.
 * Pure visual layer — no layout changes to foreground content.
 */
export function BankingBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Base gradient wash: deep navy → white with soft blue/emerald glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,oklch(0.95_0.03_240)_0%,transparent_55%),radial-gradient(ellipse_at_bottom_right,oklch(0.93_0.05_165/0.6)_0%,transparent_50%),linear-gradient(180deg,oklch(0.98_0.01_240)_0%,oklch(0.96_0.02_220)_100%)]" />

      {/* Faint grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.25 0.08 265) 1px, transparent 1px), linear-gradient(90deg, oklch(0.25 0.08 265) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      {/* Soft floating orbs */}
      <div className="absolute -top-32 left-1/4 h-[28rem] w-[28rem] rounded-full bg-[oklch(0.55_0.18_260/0.18)] blur-3xl" />
      <div className="absolute top-1/3 -right-24 h-[24rem] w-[24rem] rounded-full bg-[oklch(0.72_0.14_165/0.18)] blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-[22rem] w-[22rem] rounded-full bg-[oklch(0.6_0.12_245/0.15)] blur-3xl" />

      {/* Glass dashboard card — top right */}
      <div className="absolute right-[6%] top-[18%] hidden w-72 rotate-[4deg] rounded-2xl border border-white/50 bg-white/40 p-4 shadow-xl backdrop-blur-xl lg:block">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-[oklch(0.35_0.08_265)]/70">
          <span className="flex items-center gap-1"><LineChart className="h-3 w-3" /> Portfolio</span>
          <span>30d</span>
        </div>
        <div className="mt-2 font-serif text-2xl text-[oklch(0.25_0.08_265)]">$ 84,210</div>
        <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600">
          <TrendingUp className="h-3 w-3" /> +4.82% this month
        </div>
        <svg viewBox="0 0 200 60" className="mt-3 h-12 w-full">
          <path
            d="M0,45 C20,40 35,50 55,38 C75,26 95,30 115,22 C135,14 160,18 200,8"
            fill="none"
            stroke="oklch(0.55 0.18 260)"
            strokeWidth="2"
          />
          <path
            d="M0,45 C20,40 35,50 55,38 C75,26 95,30 115,22 C135,14 160,18 200,8 L200,60 L0,60 Z"
            fill="oklch(0.55 0.18 260 / 0.12)"
          />
        </svg>
      </div>

      {/* Payment card silhouette — mid left */}
      <div className="absolute left-[5%] top-[42%] hidden h-44 w-72 -rotate-[8deg] rounded-2xl border border-white/40 bg-gradient-to-br from-[oklch(0.28_0.09_265)] via-[oklch(0.35_0.1_255)] to-[oklch(0.45_0.12_220)] p-5 text-white/90 shadow-2xl md:block">
        <div className="flex items-center justify-between">
          <span className="font-serif text-sm">Horizon</span>
          <div className="flex gap-1">
            <div className="h-5 w-5 rounded-full bg-white/30" />
            <div className="h-5 w-5 -ml-2 rounded-full bg-[oklch(0.78_0.13_85/0.8)]" />
          </div>
        </div>
        <div className="mt-10 font-mono text-sm tracking-widest">•••• •••• •••• 4821</div>
        <div className="mt-3 flex items-end justify-between text-[10px] uppercase tracking-widest opacity-80">
          <div>
            <div className="opacity-60">Holder</div>
            <div>A. Laurent</div>
          </div>
          <div>
            <div className="opacity-60">Exp</div>
            <div>09/29</div>
          </div>
        </div>
      </div>

      {/* Transaction pill — top left */}
      <div className="absolute left-[8%] top-[12%] hidden items-center gap-3 rounded-full border border-white/50 bg-white/60 px-4 py-2 text-xs shadow-lg backdrop-blur-xl md:flex">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <ArrowUpRight className="h-4 w-4" />
        </div>
        <div>
          <div className="font-medium text-[oklch(0.25_0.08_265)]">Transfer · ACH</div>
          <div className="text-[10px] text-[oklch(0.45_0.04_265)]">+$ 2,400.00 · Verified</div>
        </div>
      </div>

      {/* Biometric pill — bottom right */}
      <div className="absolute right-[10%] bottom-[18%] hidden items-center gap-3 rounded-2xl border border-white/50 bg-white/60 px-4 py-3 shadow-lg backdrop-blur-xl md:flex">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[oklch(0.55_0.18_260/0.12)] text-[oklch(0.45_0.18_260)]">
          <Fingerprint className="h-5 w-5" />
        </div>
        <div className="text-xs">
          <div className="font-medium text-[oklch(0.25_0.08_265)]">Biometric Verified</div>
          <div className="text-[10px] text-[oklch(0.45_0.04_265)]">Face ID · 256-bit</div>
        </div>
      </div>

      {/* Wallet chip — mid right */}
      <div className="absolute right-[14%] top-[58%] hidden flex-col gap-2 rounded-2xl border border-white/50 bg-white/55 p-3 shadow-lg backdrop-blur-xl md:flex">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[oklch(0.35_0.08_265)]/70">
          <Wallet className="h-3 w-3" /> Digital Wallet
        </div>
        <div className="flex items-center gap-2">
          <div className="h-6 w-10 rounded-md bg-gradient-to-br from-[oklch(0.45_0.12_220)] to-[oklch(0.3_0.1_265)]" />
          <div className="h-6 w-10 rounded-md bg-gradient-to-br from-[oklch(0.72_0.14_165)] to-[oklch(0.5_0.12_200)]" />
          <div className="h-6 w-10 rounded-md bg-gradient-to-br from-[oklch(0.78_0.13_85)] to-[oklch(0.55_0.14_60)]" />
        </div>
      </div>

      {/* Bars chart — bottom left */}
      <div className="absolute bottom-[10%] left-[14%] hidden items-end gap-1.5 rounded-xl border border-white/50 bg-white/55 p-3 shadow-lg backdrop-blur-xl md:flex">
        {[24, 38, 30, 52, 44, 60, 48].map((h, i) => (
          <div
            key={i}
            style={{ height: `${h}px` }}
            className="w-2 rounded-sm bg-gradient-to-t from-[oklch(0.55_0.18_260)] to-[oklch(0.72_0.14_165)]"
          />
        ))}
      </div>

      {/* Tiny floating security & money icons */}
      <ShieldCheck className="absolute left-[42%] top-[8%] hidden h-5 w-5 text-[oklch(0.55_0.18_260/0.35)] md:block" />
      <Lock className="absolute right-[28%] top-[34%] hidden h-4 w-4 text-[oklch(0.55_0.18_260/0.35)] md:block" />
      <Banknote className="absolute left-[36%] bottom-[22%] hidden h-5 w-5 text-[oklch(0.55_0.18_165/0.35)] md:block" />
      <CreditCard className="absolute right-[40%] bottom-[8%] hidden h-5 w-5 text-[oklch(0.55_0.18_260/0.3)] md:block" />

      {/* Top-to-bottom soft veil so foreground text stays crisp */}
      <div className="absolute inset-0 bg-white/40" />
    </div>
  );
}
