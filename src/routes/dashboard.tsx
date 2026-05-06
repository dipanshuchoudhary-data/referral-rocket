import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Copy, IndianRupee, Plus, Share2, Users, CheckCircle2, Clock, XCircle, Trophy } from "lucide-react";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

type Profile = { id: string; full_name: string | null; referral_code: string };
type Referral = {
  id: string; referee_name: string; referee_phone: string; referee_email: string | null;
  property_type: string | null; area: string | null; status: "pending" | "verified" | "booked" | "rejected";
  reward_amount: number; created_at: string;
};

function Dashboard() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", property_type: "PG", area: "", notes: "" });

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
    const verified = referrals.filter(r => r.status === "verified" || r.status === "booked").length;
    const booked = referrals.filter(r => r.status === "booked").length;
    const earnings = referrals.reduce((s, r) => s + Number(r.reward_amount || 0), 0);
    return { total, verified, booked, earnings };
  }, [referrals]);

  const link = useMemo(() => profile ? `${typeof window !== "undefined" ? window.location.origin : ""}/?ref=${profile.referral_code}` : "", [profile]);

  const copy = async () => { await navigator.clipboard.writeText(link); toast.success("Link copied!"); };
  const share = () => {
    const msg = `Looking for a PG, flat or home in Bangalore? Check out Gharpayy 👉 ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
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

  if (loading || !profile) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Hi {profile.full_name?.split(" ")[0] || "there"} 👋</h1>
            <p className="text-muted-foreground">Track your referrals and earnings.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg"><Plus className="mr-1 h-4 w-4" /> Refer someone</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New referral</DialogTitle></DialogHeader>
              <form onSubmit={addReferral} className="space-y-4">
                <div><Label>Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
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

        {/* Referral link card */}
        <Card className="mt-6 p-6" style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-elegant)" }}>
          <div className="flex flex-wrap items-center justify-between gap-4 text-primary-foreground">
            <div>
              <p className="text-sm opacity-90">Your referral link</p>
              <p className="mt-1 break-all font-mono text-sm md:text-base">{link}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={copy}><Copy className="mr-1 h-4 w-4" /> Copy</Button>
              <Button variant="secondary" size="sm" onClick={share}><Share2 className="mr-1 h-4 w-4" /> WhatsApp</Button>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Users} label="Total referrals" value={stats.total} />
          <StatCard icon={CheckCircle2} label="Verified" value={stats.verified} tone="success" />
          <StatCard icon={Trophy} label="Booked" value={stats.booked} tone="warning" />
          <StatCard icon={IndianRupee} label="Total earnings" value={`₹${stats.earnings.toLocaleString("en-IN")}`} tone="primary" />
        </div>

        {/* Table */}
        <Card className="mt-6 overflow-hidden">
          <div className="border-b border-border p-4"><h2 className="font-display text-lg font-semibold">Your referrals</h2></div>
          {referrals.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Users className="mx-auto mb-3 h-10 w-10 opacity-40" />
              <p>No referrals yet. Share your link to get started!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead><TableHead>Phone</TableHead><TableHead>Looking for</TableHead>
                  <TableHead>Status</TableHead><TableHead className="text-right">Reward</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.referee_name}</TableCell>
                    <TableCell className="text-muted-foreground">{r.referee_phone}</TableCell>
                    <TableCell>{r.property_type}{r.area ? ` • ${r.area}` : ""}</TableCell>
                    <TableCell><StatusBadge status={r.status} /></TableCell>
                    <TableCell className="text-right font-medium">₹{Number(r.reward_amount).toLocaleString("en-IN")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone }: { icon: any; label: string; value: any; tone?: "success" | "warning" | "primary" }) {
  const colors = {
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning-foreground",
    primary: "bg-primary/10 text-primary",
  } as const;
  return (
    <Card className="p-5" style={{ boxShadow: "var(--shadow-soft)" }}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${tone ? colors[tone] : "bg-muted text-muted-foreground"}`}><Icon className="h-4 w-4" /></div>
      </div>
      <p className="mt-2 font-display text-2xl font-bold">{value}</p>
    </Card>
  );
}

function StatusBadge({ status }: { status: Referral["status"] }) {
  const cfg = {
    pending: { label: "Pending", icon: Clock, cls: "bg-muted text-muted-foreground" },
    verified: { label: "Verified", icon: CheckCircle2, cls: "bg-success/15 text-success border-success/30" },
    booked: { label: "Booked", icon: Trophy, cls: "bg-primary/15 text-primary border-primary/30" },
    rejected: { label: "Rejected", icon: XCircle, cls: "bg-destructive/15 text-destructive border-destructive/30" },
  }[status];
  const Icon = cfg.icon;
  return <Badge variant="outline" className={cfg.cls}><Icon className="mr-1 h-3 w-3" />{cfg.label}</Badge>;
}
