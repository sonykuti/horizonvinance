import { Landmark } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gold text-primary">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <div className="font-serif text-lg">Horizon Bank</div>
              <div className="text-[10px] uppercase tracking-widest text-primary-foreground/60">Est. 2019</div>
            </div>
          </div>
          <p className="mt-4 text-sm text-primary-foreground/70">
            A modern European bank built for students, parents and young professionals.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-gold">Banking</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/70">
            <li>Personal Accounts</li>
            <li>Student Loans</li>
            <li>Family Grants</li>
            <li>Mortgages</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-gold">Company</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/70">
            <li>About</li>
            <li>Careers</li>
            <li>Press</li>
            <li>Compliance</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-gold">Headquarters</h4>
          <p className="text-sm text-primary-foreground/70">
            Rue de la Finance 27<br />
            1000 Brussels, Belgium<br />
            +32 (0)2 555 0199
          </p>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-primary-foreground/60 md:flex-row">
          <span>© {new Date().getFullYear()} Horizon Bank SA. Authorised by the European Central Bank.</span>
          <span>Demo environment — transactions are simulated.</span>
        </div>
      </div>
    </footer>
  );
}
