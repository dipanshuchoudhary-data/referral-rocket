import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/streak")({ component: Streak });

function Streak() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!loading && !user) nav({ to: "/auth" }); }, [user, loading, nav]);

  const load = async () => {
    if (!user) return;
    const { data: p } = await supabase.from("profiles").select("streak_days, last_referral_date, xp").eq("id", user.id).single();
    setProfile(p);
    const { data: l } = await supabase.from("checkin_logs").select("date").eq("user_id", user.id).order("date", { ascending: false }).limit(30);
    setLogs((l ?? []).map((r: any) => r.date));
  };

  useEffect(() => { load(); }, [user]);

  const today = new Date().toISOString().slice(0, 10);
  const checkedToday = logs.includes(today);

  const checkin = async () => {
    setBusy(true);
    const { data, error } = await supabase.rpc("daily_checkin");
    setBusy(false);
    if (error) { toast.error(error.message.includes("already") ? "Already checked in today!" : error.message); return; }
    const r = data as any;
    toast.success(`+${r.xp} XP! 🔥 ${r.streak}-day streak`);
    load();
  };

  // Last 7 days grid
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return { date: d.toISOString().slice(0, 10), label: d.toLocaleDateString("en-IN", { weekday: "short" }) };
  });

  return (
    <AppShell max="max-w-3xl">
      <PageHeader icon={Flame} title="Daily streak" subtitle="Check in every day for bonus XP. Don't break the chain!" />

      <Card className="overflow-hidden p-7 text-primary-foreground" style={{ background: profile?.streak_days > 0 ? "var(--gradient-hero)" : undefined, boxShadow: "var(--shadow-elegant)" }}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider opacity-90">Current streak</div>
            <div className="font-display text-6xl font-bold">{profile?.streak_days ?? 0}<span className="text-2xl"> days</span></div>
          </div>
          <Flame className={`h-20 w-20 ${(profile?.streak_days ?? 0) > 0 ? "animate-pulse text-orange-200" : "opacity-20"}`} />
        </div>
        <Button size="lg" variant="secondary" disabled={busy || checkedToday} onClick={checkin} className="mt-6 w-full">
          {checkedToday ? <><CheckCircle2 className="mr-1 h-4 w-4" /> Checked in today</> : busy ? "Checking in…" : "Check in & earn XP"}
        </Button>
      </Card>

      <Card className="mt-4 p-5">
        <h3 className="font-display text-lg font-semibold">This week</h3>
        <div className="mt-4 grid grid-cols-7 gap-2">
          {week.map((d) => {
            const done = logs.includes(d.date);
            const isToday = d.date === today;
            return (
              <div key={d.date} className={`flex flex-col items-center rounded-lg border p-2 text-center ${done ? "border-primary bg-primary/10" : isToday ? "border-primary border-dashed" : "border-border"}`}>
                <div className="text-[10px] uppercase text-muted-foreground">{d.label}</div>
                <div className="mt-1 text-lg">{done ? "🔥" : isToday ? "⏳" : "·"}</div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          {[{ d: 3, r: "+30 XP" }, { d: 7, r: "+₹100" }, { d: 14, r: "+200 XP" }, { d: 30, r: "+₹500" }].map((m) => (
            <div key={m.d} className={`rounded-lg border p-3 text-center ${(profile?.streak_days ?? 0) >= m.d ? "border-success bg-success/10" : "border-border"}`}>
              <div className="font-display text-lg font-bold">{m.d}d</div>
              <div className="text-xs text-muted-foreground">{m.r}</div>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
