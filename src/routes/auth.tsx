import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Landmark, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

const searchSchema = z.object({ mode: z.enum(["signin", "signup"]).optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({ meta: [{ title: "Sign in — Harizon Financial" }] }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSignup, setIsSignup] = useState(mode === "signup");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/dashboard" });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email"));
    const password = String(fd.get("password"));
    const fullName = String(fd.get("full_name") ?? "");
    setLoading(true);
    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        toast.success("Account created. Welcome to Harizon Financial.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in.");
      }
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const googleSignIn = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/dashboard",
    });
    if (result.error) toast.error("Google sign-in failed");
  };

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-primary p-12 text-primary-foreground md:flex">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gold text-primary">
            <Landmark className="h-5 w-5" />
          </div>
          <div>
            <div className="font-serif text-xl">Harizon Financial</div>
            <div className="text-[10px] uppercase tracking-widest text-primary-foreground/60">Est. 2002</div>
          </div>
        </Link>
        <div>
          <h2 className="font-serif text-4xl leading-tight">"Horizon approved my student loan in 5 days — and gave me a real US routing number."</h2>
          <p className="mt-4 text-sm text-primary-foreground/70">— Sofia, student in Boston</p>
        </div>
        <div className="text-xs text-primary-foreground/50">© {new Date().getFullYear()} Harizon Financial SA</div>
      </div>

      <div className="flex items-center justify-center bg-background p-8">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 md:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-gold">
              <Landmark className="h-5 w-5" />
            </div>
            <span className="font-serif text-lg text-primary">Harizon Financial</span>
          </Link>

          <h1 className="font-serif text-3xl text-primary">{isSignup ? "Open your account" : "Welcome back"}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isSignup ? "Get a unique UID and $50,000 of practice balance to explore." : "Sign in to your Horizon dashboard."}
          </p>

          <Button type="button" variant="outline" className="mt-6 w-full" onClick={googleSignIn}>
            Continue with Google
          </Button>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />OR<div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div className="grid gap-2">
                <Label htmlFor="full_name">Full name</Label>
                <Input id="full_name" name="full_name" required placeholder="Sofia Marchetti" />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required placeholder="you@example.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  className="pr-10"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-gold text-gold-foreground hover:bg-gold/90">
              {loading ? "Please wait…" : isSignup ? "Create account" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isSignup ? "Already a customer?" : "New to Horizon?"}{" "}
            <button onClick={() => setIsSignup((s) => !s)} className="font-medium text-primary hover:text-gold">
              {isSignup ? "Sign in" : "Open an account"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
