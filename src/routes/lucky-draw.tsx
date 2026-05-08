import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Sparkles, Ticket } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/lucky-draw")({ component: LuckyDraw });

const SEGMENTS = ["+25 XP", "₹10", "₹50", "₹100", "🎟️", "₹500", "+25 XP", "₹10"];

function LuckyDraw() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [tickets, setTickets] = useState(0);
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [result, setResult] = useState<any>(null);

  useEffect(() => { if (!loading && !user) nav({ to: "/auth" }); }, [user, loading, nav]);

  const load = async () => {
    if (!user) return;
    const { data: p } = await supabase.from("profiles").select("lucky_tickets").eq("id", user.id).single();
    setTickets((p as any)?.lucky_tickets ?? 0);
    const { data: h } = await supabase.from("lucky_draws").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(8);
    setHistory(h ?? []);
  };
  useEffect(() => { load(); }, [user]);

  const spin = async () => {
    if (tickets <= 0) return toast.error("No tickets! Earn 1 every 5 referrals.");
    setSpinning(true);
    setResult(null);
    const { data, error } = await supabase.rpc("spin_lucky");
    if (error) { setSpinning(false); return toast.error(error.message); }
    const r = data as any;
    const idx = SEGMENTS.findIndex(s => s.includes(r.label.match(/\d+/)?.[0] || "")) ;
    const seg = idx >= 0 ? idx : Math.floor(Math.random() * 8);
    const final = 360 * 6 + (360 - seg * 45 - 22);
    setAngle(final);
    setTimeout(() => {
      setSpinning(false);
      setResult(r);
      toast.success(`You won ${r.label}!`);
      load();
    }, 3500);
  };

  return (
    <AppShell max="max-w-3xl">
      <PageHeader icon={Gift} title="Lucky Draw" subtitle="Spin to win XP, cash bonuses or tickets" action={
        <Badge variant="outline" className="text-base"><Ticket className="mr-1 h-4 w-4" /> {tickets} tickets</Badge>
      } />

      <Card className="flex flex-col items-center p-8" style={{ background: "var(--gradient-card)" }}>
        <div className="relative h-72 w-72">
          <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
            <div className="h-0 w-0 border-x-[14px] border-t-[24px] border-x-transparent border-t-primary drop-shadow" />
          </div>
          <div
            className="relative h-full w-full rounded-full border-8 border-primary shadow-2xl transition-transform"
            style={{ transform: `rotate(${angle}deg)`, transitionDuration: spinning ? "3500ms" : "0ms", transitionTimingFunction: "cubic-bezier(0.17, 0.67, 0.17, 0.99)",
              background: `conic-gradient(${SEGMENTS.map((_, i) => {
                const c = ["#F97316", "#FBBF24", "#F97316", "#10B981", "#F97316", "#8B5CF6", "#F97316", "#FBBF24"][i];
                return `${c} ${i * 45}deg ${(i + 1) * 45}deg`;
              }).join(",")})` }}
          >
            {SEGMENTS.map((s, i) => (
              <div key={i} className="absolute left-1/2 top-1/2 origin-bottom -translate-x-1/2 -translate-y-full text-xs font-bold text-white"
                style={{ transform: `translate(-50%,-100%) rotate(${i * 45 + 22.5}deg)`, height: "50%" }}>
                <span className="block pt-3">{s}</span>
              </div>
            ))}
          </div>
          <div className="absolute left-1/2 top-1/2 z-10 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-background shadow-lg">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
        </div>

        <Button size="lg" disabled={spinning || tickets <= 0} onClick={spin} className="mt-8 px-10">
          {spinning ? "Spinning…" : tickets > 0 ? "SPIN" : "No tickets"}
        </Button>
        {result && <div className="mt-4 font-display text-2xl font-bold text-primary">🎉 {result.label}</div>}
      </Card>

      <Card className="mt-4 p-5">
        <h3 className="font-display text-lg font-semibold">Recent wins</h3>
        {history.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">Spin the wheel to start winning.</p> :
          <div className="mt-3 flex flex-wrap gap-2">
            {history.map(h => <Badge key={h.id} variant="outline">{h.prize_label}</Badge>)}
          </div>}
      </Card>
    </AppShell>
  );
}
