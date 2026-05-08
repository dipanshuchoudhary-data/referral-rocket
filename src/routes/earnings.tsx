import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { IndianRupee, TrendingUp, Wallet, CheckCircle2 } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/earnings")({ component: Earnings });

function Earnings() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [refs, setRefs] = useState<any[]>([]);

  useEffect(() => { if (!loading && !user) nav({ to: "/auth" }); }, [user, loading, nav]);
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("referrals").select("reward_amount, payout_status, status, created_at, paid_at").eq("referrer_id", user.id);
      setRefs(data ?? []);
    })();
  }, [user]);

  const stats = useMemo(() => {
    const total = refs.reduce((s, r) => s + Number(r.reward_amount || 0), 0);
    const paid = refs.filter(r => r.payout_status === "paid").reduce((s, r) => s + Number(r.reward_amount || 0), 0);
    const pending = total - paid;
    const fromVerified = refs.filter(r => r.status === "verified").reduce((s, r) => s + Number(r.reward_amount || 0), 0);
    const fromBooked = refs.filter(r => r.status === "booked").reduce((s, r) => s + Number(r.reward_amount || 0), 0);
    // monthly chart
    const months: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      months[d.toLocaleDateString("en-IN", { month: "short" })] = 0;
    }
    refs.forEach(r => {
      const m = new Date(r.created_at).toLocaleDateString("en-IN", { month: "short" });
      if (m in months) months[m] += Number(r.reward_amount || 0);
    });
    const chart = Object.entries(months).map(([month, value]) => ({ month, value }));
    return { total, paid, pending, fromVerified, fromBooked, chart };
  }, [refs]);

  return (
    <AppShell>
      <PageHeader icon={IndianRupee} title="Earnings" subtitle="Your full payout breakdown" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={TrendingUp} label="Total earned" value={`₹${stats.total.toLocaleString("en-IN")}`} primary />
        <Stat icon={CheckCircle2} label="Paid out" value={`₹${stats.paid.toLocaleString("en-IN")}`} />
        <Stat icon={Wallet} label="Pending" value={`₹${stats.pending.toLocaleString("en-IN")}`} />
        <Stat icon={IndianRupee} label="Bookings" value={`₹${stats.fromBooked.toLocaleString("en-IN")}`} />
      </div>

      <Card className="mt-6 p-5">
        <h3 className="font-display text-lg font-semibold">Last 6 months</h3>
        <div className="mt-4 h-64">
          <ResponsiveContainer>
            <BarChart data={stats.chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </AppShell>
  );
}

function Stat({ icon: Icon, label, value, primary }: any) {
  return (
    <Card className="p-4" style={{ background: primary ? "var(--gradient-card)" : undefined, boxShadow: "var(--shadow-soft)" }}>
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="mt-1 font-display text-2xl font-bold">{value}</p>
    </Card>
  );
}
