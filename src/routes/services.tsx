import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, Home, Briefcase, Baby, HandCoins, Sparkles, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Grants & Loans — Horizon Bank" },
      { name: "description", content: "Student loans, family grants, mortgages and career-start financing from Horizon Bank. Built for young Europeans." },
      { property: "og:title", content: "Grants & Loans — Horizon Bank" },
      { property: "og:description", content: "Flexible European loans and grants designed for students, parents and young professionals." },
    ],
  }),
  component: ServicesPage,
});

const loans = [
  { icon: GraduationCap, title: "Student Loan", rate: "from 1.9% APR", body: "Cover tuition, accommodation and Erasmus exchanges. No repayments until graduation.", amount: "Up to € 50,000" },
  { icon: Briefcase, title: "Career-Start Loan", rate: "from 3.4% APR", body: "Relocate, upskill or fund your first apartment. Personal loans for under-35s.", amount: "Up to € 25,000" },
  { icon: Home, title: "Family Mortgage", rate: "from 2.8% APR", body: "Buy your first home with flexible 30-year terms and parent co-guarantee options.", amount: "Up to € 750,000" },
];

const grants = [
  { icon: Baby, title: "Family Welcome Grant", value: "€ 1,500", body: "One-off grant for new parents opening a Horizon family account." },
  { icon: GraduationCap, title: "Erasmus Mobility Grant", value: "€ 1,200", body: "Supports EU students studying abroad for a full semester." },
  { icon: HandCoins, title: "First-Job Grant", value: "€ 800", body: "Bonus for young professionals receiving their first salary into Horizon." },
];

function ServicesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-medium text-gold">
            <Sparkles className="h-3 w-3" /> Loans & Grants
          </div>
          <h1 className="mt-6 font-serif text-5xl">Financing the next chapter of your life.</h1>
          <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/75">
            Horizon Bank offers transparent rates, EU-wide eligibility and a fully digital application — approved in 24 hours.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="font-serif text-3xl text-primary">Loans</h2>
        <p className="mt-2 text-muted-foreground">Flexible borrowing tailored to your life stage.</p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {loans.map(({ icon: Icon, title, rate, body, amount }) => (
            <div key={title} className="flex flex-col rounded-2xl border border-border bg-card p-8 transition hover:border-gold">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-gold">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-6 font-serif text-2xl text-primary">{title}</h3>
              <div className="mt-2 text-sm text-gold">{rate}</div>
              <p className="mt-3 flex-1 text-sm text-muted-foreground">{body}</p>
              <div className="mt-6 border-t border-border pt-4 text-sm font-medium text-foreground">{amount}</div>
              <Link to="/auth" search={{ mode: "signup" }} className="mt-4">
                <Button className="w-full">Apply now</Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="font-serif text-3xl text-primary">Grants</h2>
          <p className="mt-2 text-muted-foreground">Non-repayable support for the moments that matter.</p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {grants.map(({ icon: Icon, title, value, body }) => (
              <div key={title} className="rounded-2xl border border-border bg-background p-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/15 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="font-serif text-2xl text-primary">{value}</div>
                </div>
                <h3 className="mt-5 font-medium text-foreground">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{body}</p>
                <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-gold" /> No repayment</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-gold" /> Paid within 5 days</li>
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 text-center">
        <h2 className="font-serif text-3xl text-primary">Ready to apply?</h2>
        <p className="mt-3 text-muted-foreground">Create your Horizon account — your unique UID lets you apply for any grant or loan above.</p>
        <Link to="/auth" search={{ mode: "signup" }} className="mt-6 inline-block">
          <Button size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90">Open Free Account</Button>
        </Link>
      </section>

      <Footer />
    </div>
  );
}
