import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import {
  ArrowRight, CheckCircle2, IndianRupee, Share2, Users, Trophy,
  Sparkles, Shield, Zap, MessageCircle, Star, Wallet,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
  validateSearch: (s: Record<string, unknown>) => ({ ref: typeof s.ref === "string" ? s.ref : undefined }),
});

function Landing() {
  const { ref } = Route.useSearch();
  const { user } = useAuth();
  const nav = useNavigate();

  useEffect(() => { if (ref) sessionStorage.setItem("ref_code", ref.toUpperCase()); }, [ref]);
  useEffect(() => { if (user) nav({ to: "/dashboard" }); }, [user, nav]);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-mesh" />
          <div className="mx-auto max-w-6xl px-4 pt-16 pb-24 md:pt-24 md:pb-32">
            <div className="mx-auto max-w-3xl text-center">
              {ref ? (
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                  <Trophy className="h-4 w-4" /> Invited via <span className="font-mono font-bold">{ref.toUpperCase()}</span>
                </div>
              ) : (
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" /> Trusted by 1,200+ referrers in Bangalore
                </div>
              )}
              <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
                Refer friends. Earn <span className="text-gradient">₹500</span><br className="hidden md:block" /> per booking.
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
                Help your network find PGs, flats and houses across Bangalore. We pay cash for every verified lead and every successful move-in.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <Button asChild size="lg" className="h-12 px-7 text-base shadow-lg" style={{ boxShadow: "var(--shadow-elegant)" }}>
                  <Link to="/auth">Start earning <ArrowRight className="ml-1 h-4 w-4" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 px-7 text-base">
                  <Link to="/auth">I already have an account</Link>
                </Button>
              </div>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success" /> ₹50 verified lead</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success" /> ₹500 on booking</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success" /> Instant UPI payouts</span>
                <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-success" /> Zero spam policy</span>
              </div>
            </div>

            {/* Stat strip */}
            <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { v: "1.2K+", l: "Active referrers" },
                { v: "₹6.4L", l: "Paid out" },
                { v: "92%", l: "Verify rate" },
                { v: "<24h", l: "Avg response" },
              ].map((s) => (
                <Card key={s.l} className="border-border/60 p-4 text-center" style={{ background: "var(--gradient-card)" }}>
                  <div className="font-display text-2xl font-bold text-gradient md:text-3xl">{s.v}</div>
                  <div className="mt-0.5 text-xs uppercase tracking-wider text-muted-foreground">{s.l}</div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* HOW */}
        <section className="mx-auto max-w-6xl px-4 py-20">
          <div className="text-center">
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">How it works</span>
            <h2 className="mt-3 font-display text-3xl font-bold md:text-5xl">Three steps. Zero friction.</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">From sharing your link to cash in your account — under 3 minutes.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { icon: Users, t: "Sign up free", d: "Create your account in seconds. We mint a unique referral code instantly.", n: "01" },
              { icon: Share2, t: "Share your link", d: "Drop it on WhatsApp to friends, family or coworkers searching for a home.", n: "02" },
              { icon: Wallet, t: "Get paid", d: "₹50 the moment a lead is verified. ₹500 the moment they book. Tracked live.", n: "03" },
            ].map((s) => (
              <Card key={s.t} className="group relative overflow-hidden border-border/60 p-7 transition-all hover:-translate-y-1 hover:shadow-xl" style={{ background: "var(--gradient-card)", boxShadow: "var(--shadow-soft)" }}>
                <div className="absolute right-4 top-4 font-display text-5xl font-bold text-primary/10">{s.n}</div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <s.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-xl font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* FEATURES */}
        <section className="border-y border-border/60 bg-muted/30 py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid gap-10 md:grid-cols-2 md:items-center">
              <div>
                <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">Built for power referrers</span>
                <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">Everything you need to scale your side income.</h2>
                <p className="mt-3 text-muted-foreground">Live status tracking, instant notifications, and a payout flow you can actually trust.</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {[
                    { i: Zap, t: "Real-time tracking", d: "Watch leads move from Pending → Verified → Booked." },
                    { i: MessageCircle, t: "1-tap WhatsApp", d: "Pre-written messages that actually convert." },
                    { i: Shield, t: "Verified leads only", d: "We screen every referral. No low-quality bookings." },
                    { i: IndianRupee, t: "Direct UPI payouts", d: "No KYC delays. Money lands in 24 hours." },
                  ].map((f) => (
                    <div key={f.t} className="flex gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <f.i className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-semibold">{f.t}</div>
                        <div className="text-sm text-muted-foreground">{f.d}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-4 -z-10 rounded-3xl bg-mesh opacity-70 blur-2xl" />
                <Card className="overflow-hidden border-border/60" style={{ boxShadow: "var(--shadow-elegant)" }}>
                  <div className="border-b border-border/60 bg-card p-4">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                      <span className="h-2.5 w-2.5 rounded-full bg-warning" />
                      <span className="h-2.5 w-2.5 rounded-full bg-success" />
                      <span className="ml-2 font-mono text-xs text-muted-foreground">gharpayy.com/dashboard</span>
                    </div>
                  </div>
                  <div className="space-y-3 p-5">
                    <div className="rounded-xl p-4 text-primary-foreground" style={{ background: "var(--gradient-hero)" }}>
                      <div className="text-xs opacity-80">Total earnings</div>
                      <div className="font-display text-3xl font-bold">₹4,250</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {[{ l: "Total", v: "12" }, { l: "Verified", v: "8" }, { l: "Booked", v: "3" }].map((x) => (
                        <div key={x.l} className="rounded-lg border border-border/60 p-2">
                          <div className="font-display text-lg font-bold">{x.v}</div>
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{x.l}</div>
                        </div>
                      ))}
                    </div>
                    {[
                      { n: "Rohan K.", s: "Booked", c: "bg-primary/15 text-primary" },
                      { n: "Anjali M.", s: "Verified", c: "bg-success/15 text-success" },
                      { n: "Vikram S.", s: "Pending", c: "bg-muted text-muted-foreground" },
                    ].map((r) => (
                      <div key={r.n} className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{r.n[0]}</div>
                          <span className="text-sm font-medium">{r.n}</span>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${r.c}`}>{r.s}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="mx-auto max-w-6xl px-4 py-20">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold md:text-4xl">Loved by referrers across the city</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { n: "Priya S.", r: "Made ₹4,500 in my first month just sharing on my college WhatsApp groups. Crazy easy.", a: "PS" },
              { n: "Karthik R.", r: "Payout literally hit my UPI in 18 hours. No followups needed. Trustworthy team.", a: "KR" },
              { n: "Meena J.", r: "I work in HR. I refer relocators. Earned ₹12K last quarter on the side. 10/10.", a: "MJ" },
            ].map((t) => (
              <Card key={t.n} className="border-border/60 p-6" style={{ background: "var(--gradient-card)", boxShadow: "var(--shadow-soft)" }}>
                <div className="flex gap-1 text-warning">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-foreground">"{t.r}"</p>
                <div className="mt-4 flex items-center gap-3 border-t border-border/60 pt-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{t.a}</div>
                  <div className="text-sm font-semibold">{t.n}</div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-5xl px-4 pb-24">
          <Card className="relative overflow-hidden border-0 p-10 text-center text-primary-foreground md:p-16" style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-elegant)" }}>
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <Sparkles className="mx-auto h-10 w-10 opacity-80" />
            <h2 className="mt-4 font-display text-3xl font-bold md:text-5xl">Ready to make your network pay?</h2>
            <p className="mx-auto mt-3 max-w-xl opacity-90">Join hundreds of referrers already earning monthly. No fees. No catch.</p>
            <Button asChild size="lg" variant="secondary" className="mt-7 h-12 px-8 text-base font-semibold">
              <Link to="/auth">Create free account <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </Card>
        </section>
      </main>
      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        <div className="mx-auto max-w-6xl px-4">
          © {new Date().getFullYear()} Gharpayy Homes · Built with care in Bangalore
        </div>
      </footer>
    </div>
  );
}
