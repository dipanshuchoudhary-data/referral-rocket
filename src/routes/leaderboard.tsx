import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Trophy, Crown, Medal } from "lucide-react";

export const Route = createFileRoute("/leaderboard")({ component: Leaderboard });

function Leaderboard() {
  const [rows, setRows] = useState<any[]>([]);
  const [tab, setTab] = useState<"xp" | "earnings" | "bookings">("xp");

  useEffect(() => {
    (async () => {
      if (tab === "xp") {
        const { data } = await supabase.from("profiles").select("id, full_name, referral_code, xp, level, persona, avatar_url").order("xp", { ascending: false }).limit(50);
        setRows(data ?? []);
      } else {
        const { data } = await supabase.from("referrals").select("referrer_id, reward_amount, status, profiles:referrer_id(full_name, referral_code, persona)");
        const agg: Record<string, any> = {};
        (data ?? []).forEach((r: any) => {
          const k = r.referrer_id;
          if (!agg[k]) agg[k] = { id: k, full_name: r.profiles?.full_name, referral_code: r.profiles?.referral_code, persona: r.profiles?.persona, earnings: 0, bookings: 0 };
          agg[k].earnings += Number(r.reward_amount || 0);
          if (r.status === "booked") agg[k].bookings += 1;
        });
        const sorted = Object.values(agg).sort((a: any, b: any) => b[tab] - a[tab]).slice(0, 50);
        setRows(sorted);
      }
    })();
  }, [tab]);

  return (
    <AppShell>
      <PageHeader icon={Trophy} title="Leaderboard" subtitle="Top hustlers across Bangalore" accent="Live rankings" />
      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList>
          <TabsTrigger value="xp">XP</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="mt-4">
          <div className="grid gap-2">
            {rows.length === 0 && <Card className="p-12 text-center text-muted-foreground">No data yet — be the first.</Card>}
            {rows.map((r, i) => (
              <Card key={r.id} className={`flex items-center gap-3 p-4 ${i < 3 ? "border-primary/30" : ""}`} style={i < 3 ? { background: "var(--gradient-card)" } : {}}>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display font-bold ${
                  i === 0 ? "bg-amber-400 text-amber-950" : i === 1 ? "bg-slate-300 text-slate-800" : i === 2 ? "bg-amber-700 text-amber-50" : "bg-muted text-muted-foreground"
                }`}>
                  {i === 0 ? <Crown className="h-5 w-5" /> : i === 1 || i === 2 ? <Medal className="h-5 w-5" /> : i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{r.full_name || "Anonymous"}</div>
                  <div className="font-mono text-xs text-muted-foreground">#{r.referral_code} {r.persona && `• ${r.persona}`}</div>
                </div>
                <div className="text-right">
                  <div className="font-display text-lg font-bold text-primary">
                    {tab === "xp" ? `${r.xp || 0} XP` : tab === "earnings" ? `₹${(r.earnings || 0).toLocaleString("en-IN")}` : `${r.bookings || 0} 🏆`}
                  </div>
                  {tab === "xp" && <div className="text-xs text-muted-foreground">Lvl {r.level || 1}</div>}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
