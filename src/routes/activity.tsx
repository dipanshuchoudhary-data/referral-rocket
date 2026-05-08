import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Activity as ActivityIcon, CheckCircle2, Trophy, Zap, Users } from "lucide-react";

export const Route = createFileRoute("/activity")({ component: Activity });

const ICONS: Record<string, any> = {
  REFERRAL_NEW: Users, REFERRAL_STATUS: CheckCircle2, CHECKIN: Zap, BOOKING: Trophy,
};

function Activity() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => { if (!loading && !user) nav({ to: "/auth" }); }, [user, loading, nav]);
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("activity_log").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100);
      setItems(data ?? []);
    })();
  }, [user]);

  return (
    <AppShell max="max-w-3xl">
      <PageHeader icon={ActivityIcon} title="Activity" subtitle="Everything that happens on your account" />
      <div className="space-y-2">
        {items.length === 0 && <Card className="p-12 text-center text-muted-foreground">No activity yet.</Card>}
        {items.map(it => {
          const Icon = ICONS[it.type] || ActivityIcon;
          return (
            <Card key={it.id} className="flex items-center gap-3 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div>
              <div className="flex-1 min-w-0">
                <div className="font-medium">{it.title}</div>
                <div className="text-xs text-muted-foreground">{new Date(it.created_at).toLocaleString("en-IN")}</div>
              </div>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
