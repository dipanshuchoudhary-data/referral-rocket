import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { ArrowRight, CheckCircle2, IndianRupee, Share2, Users, Trophy } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
  validateSearch: (s: Record<string, unknown>) => ({ ref: typeof s.ref === "string" ? s.ref : undefined }),
});

function Landing() {
  const { ref } = Route.useSearch();
  const { user } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (ref) sessionStorage.setItem("ref_code", ref.toUpperCase());
  }, [ref]);

  useEffect(() => {
    if (user) nav({ to: "/dashboard" });
  }, [user, nav]);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 opacity-40" style={{ background: "var(--gradient-hero)" }} />
          <div className="absolute inset-0 -z-10 bg-background/60" />
          <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
            <div className="mx-auto max-w-3xl text-center">
              {ref && (
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-sm text-primary">
                  <Trophy className="h-4 w-4" /> You were invited with code <strong>{ref.toUpperCase()}</strong>
                </div>
              )}
              <h1 className="font-display text-4xl font-bold leading-tight md:text-6xl">
                Refer friends. Earn <span className="text-primary">₹500</span> per booking.
              </h1>
              <p className="mt-5 text-lg text-muted-foreground md:text-xl">
                Know someone hunting for a PG, flat or house in Bangalore? Share your link, get them set up,
                and earn cash rewards on every successful referral.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Button asChild size="lg" className="shadow-lg" style={{ boxShadow: "var(--shadow-elegant)" }}>
                  <Link to="/auth">Start earning <ArrowRight className="ml-1 h-4 w-4" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/auth">I have an account</Link>
                </Button>
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success" /> ₹50 on verified lead</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success" /> ₹500 on booking</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success" /> Instant payouts</span>
              </div>
            </div>
          </div>
        </section>

        {/* How */}
        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-center font-display text-3xl font-bold md:text-4xl">How it works</h2>
          <p className="mt-2 text-center text-muted-foreground">Three steps. Zero friction.</p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { icon: Users, t: "Sign up free", d: "Create an account in seconds and get your unique referral link." },
              { icon: Share2, t: "Share your link", d: "Send it on WhatsApp to anyone hunting for a home in Bangalore." },
              { icon: IndianRupee, t: "Get paid", d: "Earn ₹50 when verified, ₹500 when they book. Track everything live." },
            ].map((s, i) => (
              <Card key={i} className="border-border/60 p-6" style={{ background: "var(--gradient-card)", boxShadow: "var(--shadow-soft)" }}>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <s.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-xl font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-4xl px-4 pb-20">
          <Card className="overflow-hidden border-0 p-10 text-center text-primary-foreground" style={{ background: "var(--gradient-hero)" }}>
            <h2 className="font-display text-3xl font-bold md:text-4xl">Ready to make your network pay?</h2>
            <p className="mx-auto mt-2 max-w-xl opacity-90">Join hundreds of referrers already earning monthly with Gharpayy.</p>
            <Button asChild size="lg" variant="secondary" className="mt-6">
              <Link to="/auth">Create free account</Link>
            </Button>
          </Card>
        </section>
      </main>
      <footer className="border-t border-border/60 py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Gharpayy Homes
      </footer>
    </div>
  );
}
