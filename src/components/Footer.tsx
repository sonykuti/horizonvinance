import { Landmark } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 sm:gap-10 sm:px-6 sm:py-14 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gold text-primary">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <div className="font-serif text-lg">Harizon Financial</div>
              <div className="text-[10px] uppercase tracking-widest text-primary-foreground/60">Est. 2003</div>
            </div>
          </div>
          <p className="mt-4 text-sm text-primary-foreground/70">
            A modern American bank built for students, parents and young professionals.
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
            270 Park Avenue<br />
            New York, NY 10017, USA<br />
            +1 (212) 555-0199
          </p>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-center text-xs text-primary-foreground/60 sm:px-6 md:flex-row md:text-left">
          <span>© {new Date().getFullYear()} Harizon Financial N.A. Member FDIC. Regulated by the Federal Reserve.</span>
          <span className="opacity-0 select-none" aria-hidden="true">Demo environment — transactions are simulated.</span>
        </div>
      </div>
    </footer>
  );
}
