import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, Trophy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/teams")({ component: Teams });

function Teams() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [teams, setTeams] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", description: "", emoji: "🏆" });

  const load = async () => {
    const { data } = await supabase.from("teams").select("*").order("total_xp", { ascending: false });
    setTeams(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!user) return nav({ to: "/auth" });
    const slug = form.slug.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const { error } = await supabase.from("teams").insert({ ...form, slug, captain_id: user.id });
    if (error) return toast.error(error.message);
    toast.success("Team created!"); setOpen(false); load();
  };

  return (
    <AppShell>
      <PageHeader icon={Users} title="Teams" subtitle="Join forces. Climb together." action={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-1 h-4 w-4" /> Create team</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New team</DialogTitle></DialogHeader>
            <Input placeholder="Team name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value })} />
            <Input placeholder="Emoji" value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} maxLength={2} />
            <Input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <Button onClick={create}>Create</Button>
          </DialogContent>
        </Dialog>
      } />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((t, i) => (
          <Link key={t.id} to="/teams/$slug" params={{ slug: t.slug }}>
            <Card className="h-full p-5 transition-all hover:-translate-y-1 hover:shadow-lg" style={{ boxShadow: "var(--shadow-soft)" }}>
              <div className="flex items-start justify-between">
                <div className="text-4xl">{t.emoji}</div>
                {i < 3 && <Badge className="bg-amber-400/20 text-amber-700"><Trophy className="mr-1 h-3 w-3" /> #{i+1}</Badge>}
              </div>
              <h3 className="mt-3 font-display text-lg font-semibold">{t.name}</h3>
              <p className="text-sm text-muted-foreground">{t.description}</p>
              <div className="mt-4 flex justify-between text-sm">
                <div><div className="text-xs text-muted-foreground">Members</div><div className="font-display font-bold">{t.member_count}</div></div>
                <div className="text-right"><div className="text-xs text-muted-foreground">Total XP</div><div className="font-display font-bold text-primary">{t.total_xp}</div></div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
