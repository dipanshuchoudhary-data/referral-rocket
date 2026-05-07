import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Flame, Sparkles, Ticket, Zap, Gift, Trophy } from "lucide-react";

type Gami = { xp: number; level: number; streak_days: number; lucky_tickets: number; last_referral_date: string | null };

const xpForLevel = (lvl: number) => Math.pow(lvl - 1, 2) * 100;

export function GamificationPanel() {
  const { user } = useAuth();
  const [g, setG] = useState<Gami | null>(null);
  const [draws, setDraws] = useState<{ id: string; prize_label: string; created_at: string }[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ label: string; kind: string; amount: number } | null>(null);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("profiles").select("xp, level, streak_days, lucky_tickets, last_referral_date").eq("id", user.id).single();
    if (data) setG(data as any);
    const { data: d } = await supabase.from("lucky_draws").select("id, prize_label, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5);
    setDraws((d as any) ?? []);
  };

  useEffect(() => { load(); }, [user]);

  if (!g) return null;

  const curMin = xpForLevel(g.level);
  const nextMin = xpForLevel(g.level + 1);
  const progress = Math.min(100, ((g.xp - curMin) / (nextMin - curMin)) * 100);

  const todayDate = new Date().toISOString().slice(0, 10);
  const streakActive = g.last_referral_date === todayDate;

  const spin = async () => {
    setSpinning(true);
    const { data, error } = await supabase.rpc("spin_lucky");
    setSpinning(false);
    if (error) {
      if (error.message.includes("no_tickets")) toast.error("No lucky tickets yet — submit 5 referrals to earn one!");
      else toast.error(error.message);
      return;
    }
    setResult(data as any);
    setTimeout(load, 300);
  };

  return (
    <>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {/* Level / XP */}
        <Card className="overflow-hidden p-5" style={{ background: "var(--gradient-card)", boxShadow: "var(--shadow-soft)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Level</div>
                <div className="font-display text-2xl font-bold leading-none">{g.level}</div>
              </div>
            </div>
            <Badge variant="outline" className="bg-primary/5 text-primary">{g.xp.toLocaleString()} XP</Badge>
          </div>
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
              <span>{Math.max(0, g.xp - curMin)} / {nextMin - curMin}</span>
              <span>Next: Lv {g.level + 1}</span>
            </div>
          </div>
        </Card>

        {/* Streak */}
        <Card className="overflow-hidden p-5" style={{ background: "var(--gradient-card)", boxShadow: "var(--shadow-soft)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${streakActive ? "bg-orange-500/15 text-orange-500" : "bg-muted text-muted-foreground"}`}>
                <Flame className={`h-5 w-5 ${streakActive ? "animate-pulse" : ""}`} />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Streak</div>
                <div className="font-display text-2xl font-bold leading-none">{g.streak_days} <span className="text-sm font-normal text-muted-foreground">days</span></div>
              </div>
            </div>
            {streakActive && <Badge className="bg-orange-500 text-white">Active 🔥</Badge>}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            {streakActive ? "You've kept your streak today. Keep going tomorrow!" : "Submit 1 referral today to extend your streak."}
          </p>
        </Card>

        {/* Lucky draw */}
        <Card className="relative overflow-hidden p-5 text-white" style={{ background: "linear-gradient(135deg, oklch(0.55 0.22 290), oklch(0.65 0.2 330))", boxShadow: "var(--shadow-elegant)" }}>
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <Ticket className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider opacity-80">Lucky tickets</div>
                <div className="font-display text-2xl font-bold leading-none">{g.lucky_tickets}</div>
              </div>
            </div>
          </div>
          <Button
            onClick={spin}
            disabled={g.lucky_tickets <= 0 || spinning}
            className="relative mt-4 w-full bg-white text-violet-600 hover:bg-white/90"
            size="sm"
          >
            <Gift className="mr-1 h-4 w-4" /> {spinning ? "Spinning…" : g.lucky_tickets > 0 ? "Spin to win!" : "Earn a ticket"}
          </Button>
          <p className="relative mt-2 text-[11px] opacity-80">+1 ticket every 5 referrals</p>
        </Card>
      </div>

      {/* Recent prizes */}
      {draws.length > 0 && (
        <Card className="mt-4 p-4" style={{ boxShadow: "var(--shadow-soft)" }}>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Trophy className="h-3.5 w-3.5" /> Recent prizes
          </div>
          <div className="flex flex-wrap gap-2">
            {draws.map(d => (
              <Badge key={d.id} variant="outline" className="bg-primary/5">{d.prize_label}</Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Spin result dialog */}
      <Dialog open={!!result} onOpenChange={(o) => !o && setResult(null)}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle className="text-center">🎉 You won!</DialogTitle>
            <DialogDescription className="text-center">Lucky draw result</DialogDescription>
          </DialogHeader>
          {result && (
            <div className="py-4">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full" style={{ background: "var(--gradient-hero)" }}>
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <div className="mt-4 font-display text-3xl font-bold text-gradient">{result.label}</div>
              <p className="mt-2 text-sm text-muted-foreground">
                {result.kind === "cash" && "Added to your earnings."}
                {result.kind === "xp" && "XP added to your level."}
                {result.kind === "ticket" && "Bonus ticket! Spin again."}
              </p>
              <Button className="mt-5 w-full" onClick={() => setResult(null)}>Awesome</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
