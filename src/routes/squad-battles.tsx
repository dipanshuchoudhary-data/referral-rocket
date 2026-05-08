import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Swords, Trophy } from "lucide-react";

export const Route = createFileRoute("/squad-battles")({ component: Battles });

function Battles() {
  const [battles, setBattles] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("squad_battles").select("*, a:team_a_id(name, emoji), b:team_b_id(name, emoji)").order("ends_at", { ascending: true });
      setBattles(data ?? []);
    })();
  }, []);

  return (
    <AppShell>
      <PageHeader icon={Swords} title="Squad battles" subtitle="Live team vs team competitions" />
      {battles.length === 0 ? <Card className="p-12 text-center text-muted-foreground">No active battles. Check back soon!</Card> :
      <div className="grid gap-4 md:grid-cols-2">
        {battles.map((b) => {
          const total = (b.team_a_score || 0) + (b.team_b_score || 0) || 1;
          const pct = (b.team_a_score || 0) / total * 100;
          const ends = new Date(b.ends_at);
          const live = ends > new Date();
          return (
            <Card key={b.id} className="p-5" style={{ boxShadow: "var(--shadow-soft)" }}>
              <div className="flex items-center justify-between">
                <Badge className={live ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}>{live ? "LIVE" : "ENDED"}</Badge>
                <div className="text-xs text-muted-foreground">Prize: {b.prize_xp} XP</div>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 text-center">
                <div className="flex-1"><div className="text-3xl">{b.a?.emoji}</div><div className="font-semibold">{b.a?.name}</div><div className="font-display text-2xl font-bold text-primary">{b.team_a_score}</div></div>
                <Swords className="h-7 w-7 text-muted-foreground" />
                <div className="flex-1"><div className="text-3xl">{b.b?.emoji}</div><div className="font-semibold">{b.b?.name}</div><div className="font-display text-2xl font-bold text-primary">{b.team_b_score}</div></div>
              </div>
              <Progress value={pct} className="mt-4 h-2" />
              <div className="mt-2 text-center text-xs text-muted-foreground">Ends {ends.toLocaleString("en-IN")}</div>
            </Card>
          );
        })}
      </div>}
    </AppShell>
  );
}
