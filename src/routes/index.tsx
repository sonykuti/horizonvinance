import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, GraduationCap, Home, Sparkles, Globe2, Lock } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { BankingBackdrop } from "@/components/BankingBackdrop";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Horizon Bank — Modern European Banking for Real Life" },
      { name: "description", content: "Horizon Bank is a European bank founded in 2019 serving students, parents and young professionals with grants, loans and instant transfers." },
      { property: "og:title", content: "Horizon Bank — Modern European Banking" },
      { property: "og:description", content: "Open an account in minutes. Grants and loans built for the next generation of Europeans." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_20%_20%,oklch(0.78_0.13_85/0.35),transparent_45%),radial-gradient(circle_at_80%_60%,oklch(0.4_0.1_265/0.6),transparent_50%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-24 md:grid-cols-2 md:py-32">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-medium text-gold">
              <Sparkles className="h-3 w-3" /> Founded 2019 · Trusted across the EU
            </div>
            <h1 className="mt-6 font-serif text-5xl font-semibold leading-[1.05] md:text-6xl">
              Banking that moves with <span className="text-gold">your generation.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-primary-foreground/75">
              Open a Horizon account in minutes. Track balances, send instant transfers and apply for student or family loans — all in one elegant European bank.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/auth" search={{ mode: "signup" }}>
                <Button size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90">
                  Open Free Account <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/services">
                <Button size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
                  Explore Loans & Grants
                </Button>
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-primary-foreground/70">
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-gold" /> ECB regulated</div>
              <div className="flex items-center gap-2"><Lock className="h-4 w-4 text-gold" /> 256-bit encryption</div>
              <div className="flex items-center gap-2"><Globe2 className="h-4 w-4 text-gold" /> 27 EU countries</div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-3xl bg-gold/20 blur-3xl" />
            <div className="relative rounded-2xl border border-primary-foreground/10 bg-card p-6 text-card-foreground shadow-2xl">
              <div className="flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
                <span>Horizon · Personal</span>
                <span>EUR</span>
              </div>
              <div className="mt-2 font-serif text-4xl text-primary">€ 12,480.55</div>
              <div className="text-xs text-muted-foreground">Available balance</div>

              <div className="mt-6 space-y-3">
                {[
                  { label: "Salary — Lyon Studios", amt: "+€ 3,200.00", tag: "Today" },
                  { label: "Rent — March", amt: "-€ 980.00", tag: "Yesterday" },
                  { label: "Erasmus Grant", amt: "+€ 1,500.00", tag: "Mar 03" },
                ].map((t) => (
                  <div key={t.label} className="flex items-center justify-between rounded-lg border border-border bg-background/50 px-3 py-2 text-sm">
                    <div>
                      <div className="font-medium">{t.label}</div>
                      <div className="text-xs text-muted-foreground">{t.tag}</div>
                    </div>
                    <div className={t.amt.startsWith("+") ? "text-emerald-600" : "text-foreground/80"}>{t.amt}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-12 md:grid-cols-4">
          {[
            { n: "420k+", l: "Active customers" },
            { n: "€ 2.1B", l: "Loans issued" },
            { n: "27", l: "EU countries" },
            { n: "4.8/5", l: "App store rating" },
          ].map((s) => (
            <div key={s.l}>
              <div className="font-serif text-3xl text-primary">{s.n}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Built for */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-4xl text-primary">Built for the people who build Europe.</h2>
          <p className="mt-4 text-muted-foreground">Whether you're starting university, raising a family or chasing a first career — Horizon is your financial home.</p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            { icon: GraduationCap, title: "Students", body: "Zero-fee accounts, Erasmus support and student loans from 1.9% APR." },
            { icon: Home, title: "Parents", body: "Family grants, child savings plans and mortgages with flexible repayment." },
            { icon: Sparkles, title: "Young Professionals", body: "Salary accounts, career-start loans and rapid cross-border transfers." },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="group rounded-2xl border border-border bg-card p-8 transition hover:border-gold hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-gold">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-6 font-serif text-2xl text-primary">{title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{body}</p>
              <Link to="/services" className="mt-6 inline-flex items-center text-sm font-medium text-primary group-hover:text-gold">
                Learn more <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="overflow-hidden rounded-3xl bg-primary p-12 text-primary-foreground md:p-16">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <h2 className="font-serif text-4xl">Open your Horizon account today.</h2>
              <p className="mt-3 max-w-md text-primary-foreground/75">A unique account UID, instant euro IBAN and your first €50,000 of practice balance — ready in under 60 seconds.</p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Link to="/auth" search={{ mode: "signup" }}>
                <Button size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90">Create account</Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">Talk to an advisor</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
