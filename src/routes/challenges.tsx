import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap, IndianRupee } from "lucide-react";

export const Route = createFileRoute("/challenges")({ component: Challenges });

function Challenges() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [refs, setRefs] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: c } = await supabase.from("challenges").select("*").eq("is_active", true).order("kind");
      setChallenges(c ?? []);
      if (user) {
        const { data: r } = await supabase.from("referrals").select("status, created_at").eq("referrer_id", user.id);
        setRefs(r ?? []);
      }
    })();
  }, [user]);

  const computeProgress = (ch: any): number => {
    if (!user) return 0;
    const today = new Date().toISOString().slice(0,10);
    const weekAgo = new Date(Date.now() - 7*86400000).toISOString();
    switch (ch.metric) {
      case "referrals_today": return refs.filter(r => r.created_at.startsWith(today)).length;
      case "referrals_week": return refs.filter(r => r.created_at >= weekAgo).length;
      case "bookings_total": return refs.filter(r => r.status === "booked").length;
      case "verified_total": return refs.filter(r => r.status === "verified" || r.status === "booked").length;
      case "bookings_week": return refs.filter(r => r.status === "booked" && r.created_at >= weekAgo).length;
      default: return 0;
    }
  };

  return (
    <AppShell>
      <PageHeader icon={Zap} title="Quests & challenges" subtitle="Complete challenges to earn XP and cash bonuses." />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {challenges.map((c) => {
          const prog = computeProgress(c);
          const pct = Math.min(100, (prog / c.target) * 100);
          const done = prog >= c.target;
          return (
            <Card key={c.id} className={`p-5 transition-all ${done ? "border-success bg-success/5" : ""}`} style={{ boxShadow: "var(--shadow-soft)" }}>
              <div className="flex items-start justify-between gap-2">
                <div className="text-3xl">{c.emoji}</div>
                <Badge variant="outline" className={c.kind === "DAILY" ? "border-primary/30 text-primary" : c.kind === "WEEKLY" ? "border-amber-500/30 text-amber-600" : "border-violet-500/30 text-violet-600"}>{c.kind}</Badge>
              </div>
              <h3 className="mt-2 font-display text-lg font-semibold">{c.title}</h3>
              <p className="text-sm text-muted-foreground">{c.description}</p>
              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs"><span>{prog}/{c.target}</span><span className="text-muted-foreground">{Math.round(pct)}%</span></div>
                <Progress value={pct} className="h-2" />
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <div className="flex gap-3 text-muted-foreground">
                  {c.reward_xp > 0 && <span className="flex items-center gap-1"><Zap className="h-3.5 w-3.5 text-amber-500" /> +{c.reward_xp} XP</span>}
                  {c.reward_cash > 0 && <span className="flex items-center gap-1"><IndianRupee className="h-3.5 w-3.5 text-primary" /> ₹{c.reward_cash}</span>}
                </div>
                {done && <Badge className="bg-success text-success-foreground">Done ✓</Badge>}
              </div>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
