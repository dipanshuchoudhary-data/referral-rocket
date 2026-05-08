import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Trophy, LogOut } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/teams/$slug")({ component: TeamDetail });

function TeamDetail() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const [team, setTeam] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [isMember, setIsMember] = useState(false);

  const load = async () => {
    const { data: t } = await supabase.from("teams").select("*").eq("slug", slug).single();
    setTeam(t);
    if (t) {
      const { data: m } = await supabase.from("team_members").select("user_id, joined_at, profiles:user_id(full_name, referral_code, xp, persona)").eq("team_id", t.id);
      setMembers(m ?? []);
      if (user) setIsMember(!!(m ?? []).find((x: any) => x.user_id === user.id));
    }
  };
  useEffect(() => { load(); }, [slug, user]);

  const join = async () => {
    if (!user) return nav({ to: "/auth" });
    const { error } = await supabase.rpc("join_team", { _slug: slug });
    if (error) return toast.error(error.message);
    toast.success("Joined!"); load();
  };
  const leave = async () => {
    const { error } = await supabase.rpc("leave_team", { _slug: slug });
    if (error) return toast.error(error.message);
    toast.success("Left team"); load();
  };

  if (!team) return <AppShell><p className="text-center text-muted-foreground">Loading…</p></AppShell>;

  return (
    <AppShell>
      <Button asChild variant="ghost" size="sm" className="mb-3"><Link to="/teams"><ArrowLeft className="mr-1 h-4 w-4" /> All teams</Link></Button>

      <Card className="p-7" style={{ background: "var(--gradient-card)", boxShadow: "var(--shadow-elegant)" }}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-6xl">{team.emoji}</div>
            <div>
              <h1 className="font-display text-3xl font-bold">{team.name}</h1>
              <p className="text-sm text-muted-foreground">{team.description}</p>
              <div className="mt-2 flex gap-4 text-sm">
                <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {team.member_count} members</span>
                <span className="flex items-center gap-1"><Trophy className="h-4 w-4 text-primary" /> {team.total_xp} XP</span>
              </div>
            </div>
          </div>
          {isMember ? <Button variant="outline" onClick={leave}><LogOut className="mr-1 h-4 w-4" /> Leave</Button> : <Button onClick={join}>Join team</Button>}
        </div>
      </Card>

      <h2 className="mt-6 font-display text-xl font-semibold">Members</h2>
      <div className="mt-3 grid gap-2">
        {members.length === 0 && <Card className="p-8 text-center text-muted-foreground">No members yet.</Card>}
        {members.sort((a: any, b: any) => (b.profiles?.xp || 0) - (a.profiles?.xp || 0)).map((m: any, i) => (
          <Card key={m.user_id} className="flex items-center gap-3 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">{i + 1}</div>
            <div className="flex-1"><div className="font-medium">{m.profiles?.full_name || "Member"}</div><div className="font-mono text-xs text-muted-foreground">#{m.profiles?.referral_code}</div></div>
            <div className="font-display font-bold text-primary">{m.profiles?.xp || 0} XP</div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
