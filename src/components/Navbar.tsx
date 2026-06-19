import { Link, useNavigate } from "@tanstack/react-router";
import { Landmark, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-gold">
            <Landmark className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="font-serif text-lg font-semibold text-primary">Harizon Financial</div>
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

        <div className="flex items-center gap-2">
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
      </div>
    </header>
  );
}
