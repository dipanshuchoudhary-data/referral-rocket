import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Network, Users } from "lucide-react";

export const Route = createFileRoute("/chain")({ component: Chain });

function Chain() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [tree, setTree] = useState<{ direct: any[]; indirect: any[] }>({ direct: [], indirect: [] });

  useEffect(() => { if (!loading && !user) nav({ to: "/auth" }); }, [user, loading, nav]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: direct } = await supabase.from("profiles").select("id, full_name, referral_code, xp, persona").eq("referred_by", user.id);
      const directIds = (direct ?? []).map((d: any) => d.id);
      let indirect: any[] = [];
      if (directIds.length) {
        const { data } = await supabase.from("profiles").select("id, full_name, referral_code, xp, persona, referred_by").in("referred_by", directIds);
        indirect = data ?? [];
      }
      setTree({ direct: direct ?? [], indirect });
    })();
  }, [user]);

  return (
    <AppShell max="max-w-4xl">
      <PageHeader icon={Network} title="Your referral network" subtitle="Everyone you've brought into the platform — and theirs too." />
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5 text-center"><Users className="mx-auto h-6 w-6 text-primary" /><div className="mt-2 font-display text-3xl font-bold">{tree.direct.length}</div><div className="text-xs text-muted-foreground">Direct (Tier 1)</div></Card>
        <Card className="p-5 text-center"><Users className="mx-auto h-6 w-6 text-primary" /><div className="mt-2 font-display text-3xl font-bold">{tree.indirect.length}</div><div className="text-xs text-muted-foreground">Indirect (Tier 2)</div></Card>
        <Card className="p-5 text-center" style={{ background: "var(--gradient-card)" }}><Network className="mx-auto h-6 w-6 text-primary" /><div className="mt-2 font-display text-3xl font-bold text-primary">{tree.direct.length + tree.indirect.length}</div><div className="text-xs text-muted-foreground">Total network</div></Card>
      </div>

      <h3 className="mt-6 font-display text-lg font-semibold">Tier 1 — direct referrals</h3>
      <div className="mt-2 space-y-2">
        {tree.direct.length === 0 && <Card className="p-6 text-center text-muted-foreground">Share your link to grow your network.</Card>}
        {tree.direct.map(d => (
          <Card key={d.id} className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{d.full_name || "User"}</div>
                <div className="font-mono text-xs text-muted-foreground">#{d.referral_code}</div>
              </div>
              <div className="text-right text-sm"><div className="font-display font-bold text-primary">{d.xp} XP</div></div>
            </div>
            {tree.indirect.filter(i => i.referred_by === d.id).map(i => (
              <div key={i.id} className="ml-6 mt-2 flex items-center justify-between rounded-md border-l-2 border-primary/30 bg-muted/40 p-2 pl-3">
                <div className="text-sm">{i.full_name || "User"} <span className="font-mono text-xs text-muted-foreground">#{i.referral_code}</span></div>
                <div className="text-xs font-medium text-primary">{i.xp} XP</div>
              </div>
            ))}
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
