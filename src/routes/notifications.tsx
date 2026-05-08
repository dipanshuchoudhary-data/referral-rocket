import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck } from "lucide-react";

export const Route = createFileRoute("/notifications")({ component: Notifications });

function Notifications() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => { if (!loading && !user) nav({ to: "/auth" }); }, [user, loading, nav]);
  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
    setItems(data ?? []);
  };
  useEffect(() => { load(); }, [user]);

  const markAll = async () => {
    if (!user) return;
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", user.id).is("read_at", null);
    load();
  };

  return (
    <AppShell max="max-w-3xl">
      <PageHeader icon={Bell} title="Notifications" subtitle="Stay updated on referrals, payouts, and rewards" action={
        <Button variant="outline" size="sm" onClick={markAll}><CheckCheck className="mr-1 h-4 w-4" /> Mark all read</Button>
      } />
      <div className="space-y-2">
        {items.length === 0 && <Card className="p-12 text-center text-muted-foreground">No notifications.</Card>}
        {items.map(n => (
          <Card key={n.id} className={`flex items-start gap-3 p-4 ${!n.read_at ? "border-primary/40 bg-primary/5" : ""}`}>
            <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Bell className="h-4 w-4" /></div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold">{n.title}</div>
              {n.body && <div className="text-sm text-muted-foreground">{n.body}</div>}
              <div className="mt-1 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString("en-IN")}</div>
            </div>
            {n.link && <Button asChild size="sm" variant="ghost"><Link to={n.link as any}>View</Link></Button>}
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
