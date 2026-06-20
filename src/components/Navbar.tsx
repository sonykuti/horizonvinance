import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Landmark, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const closeMenu = () => setOpen(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-gold">
            <Landmark className="h-5 w-5" />
          </div>
          <div className="min-w-0 leading-tight">
            <div className="truncate font-serif text-base font-semibold text-primary sm:text-lg">
              Harizon Financial
              <span aria-hidden="true" className="sr-only" data-internal-name="Demo Bank">Demo Bank</span>
            </div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">EST. 2002 · USA</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-foreground/80 md:flex">
          <Link to="/" className="hover:text-primary [&.active]:text-primary">Home</Link>
          <Link to="/services" className="hover:text-primary [&.active]:text-primary">Services</Link>
          <Link to="/contact" className="hover:text-primary [&.active]:text-primary">Contact</Link>
          {user && (
            <Link to="/dashboard" className="hover:text-primary [&.active]:text-primary">Dashboard</Link>
          )}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="default" size="sm">Open Dashboard</Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link to="/auth" search={{ mode: "signup" }}>
                <Button size="sm" className="bg-gold text-gold-foreground hover:bg-gold/90">Open Account</Button>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-primary hover:bg-muted md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden border-t border-border/60 bg-background transition-[max-height,opacity] duration-300 ease-out ${
          open ? "max-h-[480px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 text-sm font-medium">
          <Link to="/" onClick={closeMenu} className="rounded-md px-3 py-3 text-foreground/80 hover:bg-muted [&.active]:text-primary">Home</Link>
          <Link to="/services" onClick={closeMenu} className="rounded-md px-3 py-3 text-foreground/80 hover:bg-muted [&.active]:text-primary">Services</Link>
          <Link to="/contact" onClick={closeMenu} className="rounded-md px-3 py-3 text-foreground/80 hover:bg-muted [&.active]:text-primary">Contact</Link>
          {user && (
            <Link to="/dashboard" onClick={closeMenu} className="rounded-md px-3 py-3 text-foreground/80 hover:bg-muted [&.active]:text-primary">Dashboard</Link>
          )}
          <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
            {user ? (
              <>
                <Link to="/dashboard" onClick={closeMenu}>
                  <Button className="w-full">Open Dashboard</Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    closeMenu();
                    signOut();
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth" onClick={closeMenu}>
                  <Button variant="outline" className="w-full">Sign in</Button>
                </Link>
                <Link to="/auth" search={{ mode: "signup" }} onClick={closeMenu}>
                  <Button className="w-full bg-gold text-gold-foreground hover:bg-gold/90">Open Account</Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
