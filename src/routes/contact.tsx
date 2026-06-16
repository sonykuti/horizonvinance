import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Horizon Bank" },
      { name: "description", content: "Get in touch with Horizon Bank advisors across Europe. Reach us by phone, email, or visit our Brussels headquarters." },
      { property: "og:title", content: "Contact — Horizon Bank" },
      { property: "og:description", content: "Talk to a Horizon Bank advisor about accounts, loans and grants." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sending, setSending] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success("Message sent. A Horizon advisor will reach out within 24h.");
      (e.target as HTMLFormElement).reset();
    }, 700);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <h1 className="font-serif text-5xl">We're here, across Europe.</h1>
          <p className="mt-4 max-w-xl text-primary-foreground/75">
            Whether you'd like to open an account, ask about a loan, or speak to a grant officer — our team responds within one business day.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 text-primary"><MapPin className="h-5 w-5 text-gold" /><span className="font-medium">Headquarters</span></div>
            <p className="mt-3 text-sm text-muted-foreground">Rue de la Finance 27<br />1000 Brussels, Belgium</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 text-primary"><Phone className="h-5 w-5 text-gold" /><span className="font-medium">Phone</span></div>
            <p className="mt-3 text-sm text-muted-foreground">+32 (0)2 555 0199<br />Free from any EU mobile</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 text-primary"><Mail className="h-5 w-5 text-gold" /><span className="font-medium">Email</span></div>
            <p className="mt-3 text-sm text-muted-foreground">care@horizon-bank.eu<br />loans@horizon-bank.eu</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 text-primary"><Clock className="h-5 w-5 text-gold" /><span className="font-medium">Hours</span></div>
            <p className="mt-3 text-sm text-muted-foreground">Mon – Fri · 08:00 – 20:00 CET<br />Sat · 10:00 – 16:00 CET</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="rounded-2xl border border-border bg-card p-8">
          <h2 className="font-serif text-2xl text-primary">Send us a message</h2>
          <p className="mt-2 text-sm text-muted-foreground">We'll reply within one business day.</p>

          <div className="mt-6 grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" required placeholder="Sofia Marchetti" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required placeholder="you@example.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="topic">Topic</Label>
              <Input id="topic" required placeholder="Student loan inquiry" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" required rows={5} placeholder="Tell us how we can help…" />
            </div>
            <Button type="submit" disabled={sending} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {sending ? "Sending…" : "Send message"}
            </Button>
          </div>
        </form>
      </section>

      <Footer />
    </div>
  );
}
