import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useRole } from "@/lib/use-role";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import {
  Copy, IndianRupee, Plus, Share2, Users, CheckCircle2, Clock, XCircle, Trophy,
  TrendingUp, Award, Send, Mail, MessageCircle, ShieldCheck,
} from "lucide-react";
import { GamificationPanel } from "@/components/gamification-panel";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

type Profile = { id: string; full_name: string | null; referral_code: string };
type Referral = {
  id: string; referee_name: string; referee_phone: string; referee_email: string | null;
  property_type: string | null; area: string | null; status: "pending" | "verified" | "booked" | "rejected";
  reward_amount: number; payout_status: string; created_at: string;
};

function Dashboard() {
  const { user, loading } = useAuth();
  const { isAdmin } = useRole();
  const nav = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", property_type: "PG", area: "", notes: "" });
  const [claiming, setClaiming] = useState(false);

  useEffect(() => { if (!loading && !user) nav({ to: "/auth" }); }, [user, loading, nav]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: p } = await supabase.from("profiles").select("id, full_name, referral_code").eq("id", user.id).single();
      setProfile(p as any);
      const { data: r } = await supabase.from("referrals").select("*").eq("referrer_id", user.id).order("created_at", { ascending: false });
      setReferrals((r as any) ?? []);
    })();
  }, [user]);

  const stats = useMemo(() => {
    const total = referrals.length;
    const pending = referrals.filter(r => r.status === "pending").length;
    const verified = referrals.filter(r => r.status === "verified" || r.status === "booked").length;
    const booked = referrals.filter(r => r.status === "booked").length;
    const earnings = referrals.reduce((s, r) => s + Number(r.reward_amount || 0), 0);
    const paid = referrals.filter(r => r.payout_status === "paid").reduce((s, r) => s + Number(r.reward_amount || 0), 0);
    const conversion = total ? Math.round((booked / total) * 100) : 0;
    return { total, pending, verified, booked, earnings, paid, conversion };
  }, [referrals]);

  const link = useMemo(() => profile ? `${typeof window !== "undefined" ? window.location.origin : ""}/?ref=${profile.referral_code}` : "", [profile]);

  const copy = async () => { await navigator.clipboard.writeText(link); toast.success("Link copied to clipboard!"); };
  const shareWA = () => {
    const msg = `Looking for a PG, flat or home in Bangalore? Check out Gharpayy 👉 ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };
  const shareMail = () => {
    const subj = "Found a great way to find a home in Bangalore";
    const body = `Hey,\n\nIf you're house-hunting in Bangalore, check out Gharpayy:\n${link}\n\nThey'll help you out — and I get a small reward when you book. Cheers!`;
    window.open(`mailto:?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`);
  };
  const shareNative = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: "Gharpayy", text: "Find your next home in Bangalore", url: link }); } catch {}
    } else copy();
  };

  const claimAdmin = async () => {
    setClaiming(true);
    const { data, error } = await supabase.rpc("claim_admin_if_none");
    setClaiming(false);
    if (error) return toast.error(error.message);
    if (data) { toast.success("You're now an admin! Refresh to see the panel."); setTimeout(() => location.reload(), 800); }
    else toast.info("An admin already exists.");
  };

  const addReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    const { data, error } = await supabase.from("referrals").insert({
      referrer_id: user.id,
      referee_name: form.name,
      referee_phone: form.phone,
      referee_email: form.email || null,
      property_type: form.property_type,
      area: form.area || null,
      notes: form.notes || null,
    }).select().single();
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    setReferrals([data as any, ...referrals]);
    setForm({ name: "", phone: "", email: "", property_type: "PG", area: "", notes: "" });
    setOpen(false);
    toast.success("Referral submitted! We'll contact them shortly.");
  };

  // Tier system
  const tiers = [
    { name: "Bronze", min: 0, color: "from-amber-700 to-amber-500" },
    { name: "Silver", min: 5, color: "from-slate-400 to-slate-200" },
    { name: "Gold", min: 15, color: "from-amber-400 to-yellow-200" },
    { name: "Platinum", min: 30, color: "from-violet-500 to-fuchsia-300" },
  ];
  const currentTierIdx = tiers.reduce((i, t, idx) => stats.booked >= t.min ? idx : i, 0);
  const nextTier = tiers[currentTierIdx + 1];
  const tierProgress = nextTier ? Math.min(100, ((stats.booked - tiers[currentTierIdx].min) / (nextTier.min - tiers[currentTierIdx].min)) * 100) : 100;

  if (loading || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          <span>Loading your dashboard…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Greeting + actions */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Welcome back</p>
            <h1 className="font-display text-3xl font-bold md:text-4xl">Hi {profile.full_name?.split(" ")[0] || "there"} 👋</h1>
            <p className="text-sm text-muted-foreground">Here's how your referrals are performing.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!isAdmin && (
              <Button variant="ghost" size="sm" onClick={claimAdmin} disabled={claiming} title="Become admin if no admin exists yet">
                <ShieldCheck className="mr-1 h-4 w-4" /> Claim admin
              </Button>
            )}
            {isAdmin && (
              <Button asChild variant="outline" size="lg"><Link to="/admin"><ShieldCheck className="mr-1 h-4 w-4" /> Admin panel</Link></Button>
            )}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="shadow-md"><Plus className="mr-1 h-4 w-4" /> New referral</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New referral</DialogTitle>
                  <DialogDescription>Share their details and we'll reach out within 24 hours.</DialogDescription>
                </DialogHeader>
                <form onSubmit={addReferral} className="space-y-4">
                  <div><Label>Full name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                  <div><Label>Phone</Label><Input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                  <div><Label>Email (optional)</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Looking for</Label>
                      <Select value={form.property_type} onValueChange={(v) => setForm({ ...form, property_type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["PG", "1BHK", "2BHK", "3BHK", "Studio", "House"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div><Label>Area</Label><Input placeholder="HSR, Koramangala…" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} /></div>
                  </div>
                  <div><Label>Notes</Label><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
                  <Button type="submit" className="w-full" disabled={submitting}>{submitting ? "Submitting…" : "Submit referral"}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Hero referral link card */}
        <Card className="relative mt-6 overflow-hidden border-0 p-6 md:p-7" style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-elegant)" }}>
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-5 text-primary-foreground">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-90">
                <Trophy className="h-3.5 w-3.5" /> Your referral link
              </div>
              <div className="mt-2 flex items-center gap-2">
                <code className="truncate rounded-lg bg-white/15 px-3 py-1.5 font-mono text-sm md:text-base">{link}</code>
              </div>
              <div className="mt-1.5 text-xs opacity-80">Code: <span className="font-mono font-bold">{profile.referral_code}</span></div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={copy}><Copy className="mr-1 h-4 w-4" /> Copy</Button>
              <Button variant="secondary" size="sm" onClick={shareWA}><MessageCircle className="mr-1 h-4 w-4" /> WhatsApp</Button>
              <Button variant="secondary" size="sm" onClick={shareMail}><Mail className="mr-1 h-4 w-4" /> Email</Button>
              <Button variant="secondary" size="sm" onClick={shareNative}><Send className="mr-1 h-4 w-4" /> Share</Button>
            </div>
          </div>
        </Card>

        {/* Gamification */}
        <GamificationPanel />

        {/* Stats grid */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Users} label="Total referrals" value={stats.total} sub={`${stats.pending} pending`} tone="default" />
          <StatCard icon={CheckCircle2} label="Verified" value={stats.verified} sub="₹50 each" tone="success" />
          <StatCard icon={Trophy} label="Booked" value={stats.booked} sub={`${stats.conversion}% conversion`} tone="primary" />
          <StatCard icon={IndianRupee} label="Total earnings" value={`₹${stats.earnings.toLocaleString("en-IN")}`} sub={`₹${stats.paid.toLocaleString("en-IN")} paid out`} tone="warning" />
        </div>

        {/* Two columns: progress + tips */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <Card className="p-6 lg:col-span-2" style={{ boxShadow: "var(--shadow-soft)" }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  <h3 className="font-display text-lg font-semibold">Tier progress</h3>
                </div>
                <p className="text-sm text-muted-foreground">Unlock bigger bonuses as you book more.</p>
              </div>
              <Badge className={`bg-gradient-to-r ${tiers[currentTierIdx].color} border-0 text-white`}>{tiers[currentTierIdx].name}</Badge>
            </div>
            <div className="mt-5">
              <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                <span>{stats.booked} bookings</span>
                <span>{nextTier ? `${nextTier.min} for ${nextTier.name}` : "Max tier!"}</span>
              </div>
              <Progress value={tierProgress} className="h-2" />
            </div>
            <div className="mt-5 grid grid-cols-4 gap-2">
              {tiers.map((t, i) => (
                <div key={t.name} className={`rounded-lg border p-2 text-center text-xs ${i === currentTierIdx ? "border-primary bg-primary/5" : "border-border"}`}>
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-muted-foreground">{t.min}+</div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6" style={{ background: "var(--gradient-card)", boxShadow: "var(--shadow-soft)" }}>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h3 className="font-display text-lg font-semibold">Pro tips</h3>
            </div>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex gap-2"><span className="text-primary">→</span> Share in college / office WhatsApp groups</li>
              <li className="flex gap-2"><span className="text-primary">→</span> DM friends moving cities (Aug & Jan peak)</li>
              <li className="flex gap-2"><span className="text-primary">→</span> Add the link to your Insta bio</li>
            </ul>
          </Card>
        </div>

        {/* Table */}
        <Card className="mt-6 overflow-hidden" style={{ boxShadow: "var(--shadow-soft)" }}>
          <div className="flex items-center justify-between border-b border-border p-5">
            <div>
              <h2 className="font-display text-lg font-semibold">Your referrals</h2>
              <p className="text-xs text-muted-foreground">Live status from our team</p>
            </div>
            <Badge variant="outline">{stats.total} total</Badge>
          </div>
          {referrals.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Users className="h-7 w-7" />
              </div>
              <p className="font-medium">No referrals yet</p>
              <p className="text-sm">Share your link or submit one manually to get started.</p>
              <Button className="mt-4" onClick={() => setOpen(true)}><Plus className="mr-1 h-4 w-4" /> Add your first referral</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Referee</TableHead>
                    <TableHead className="hidden sm:table-cell">Phone</TableHead>
                    <TableHead className="hidden md:table-cell">Looking for</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payout</TableHead>
                    <TableHead className="text-right">Reward</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrals.map(r => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {r.referee_name.split(" ").map(s => s[0]).slice(0, 2).join("")}
                          </div>
                          <div>
                            <div className="font-medium">{r.referee_name}</div>
                            <div className="text-xs text-muted-foreground sm:hidden">{r.referee_phone}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground sm:table-cell">{r.referee_phone}</TableCell>
                      <TableCell className="hidden md:table-cell">{r.property_type}{r.area ? ` • ${r.area}` : ""}</TableCell>
                      <TableCell><StatusBadge status={r.status} /></TableCell>
                      <TableCell><PayoutBadge status={r.payout_status} amount={Number(r.reward_amount)} /></TableCell>
                      <TableCell className="text-right font-semibold">₹{Number(r.reward_amount).toLocaleString("en-IN")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, tone }: { icon: any; label: string; value: any; sub?: string; tone: "default" | "success" | "warning" | "primary" }) {
  const colors = {
    default: "bg-muted text-muted-foreground",
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-warning-foreground",
    primary: "bg-primary/10 text-primary",
  } as const;
  return (
    <Card className="p-5 transition-all hover:-translate-y-0.5 hover:shadow-md" style={{ boxShadow: "var(--shadow-soft)" }}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${colors[tone]}`}><Icon className="h-4 w-4" /></div>
      </div>
      <p className="mt-2 font-display text-3xl font-bold">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </Card>
  );
}

function StatusBadge({ status }: { status: Referral["status"] }) {
  const cfg = {
    pending: { label: "Pending", icon: Clock, cls: "bg-muted text-muted-foreground border-border" },
    verified: { label: "Verified", icon: CheckCircle2, cls: "bg-success/15 text-success border-success/30" },
    booked: { label: "Booked", icon: Trophy, cls: "bg-primary/15 text-primary border-primary/30" },
    rejected: { label: "Rejected", icon: XCircle, cls: "bg-destructive/15 text-destructive border-destructive/30" },
  }[status];
  const Icon = cfg.icon;
  return <Badge variant="outline" className={cfg.cls}><Icon className="mr-1 h-3 w-3" />{cfg.label}</Badge>;
}

function PayoutBadge({ status, amount }: { status: string; amount: number }) {
  if (amount === 0) return <span className="text-xs text-muted-foreground">—</span>;
  const cfg: Record<string, { label: string; cls: string }> = {
    unpaid: { label: "Pending", cls: "bg-warning/15 text-warning-foreground border-warning/30" },
    processing: { label: "Processing", cls: "bg-primary/10 text-primary border-primary/30" },
    paid: { label: "Paid", cls: "bg-success/15 text-success border-success/30" },
  };
  const c = cfg[status] || cfg.unpaid;
  return <Badge variant="outline" className={c.cls}>{c.label}</Badge>;
}
