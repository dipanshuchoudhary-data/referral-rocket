import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";

export const Route = createFileRoute("/visits")({ component: Visits });

function Visits() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [list, setList] = useState<any[]>([]);

  useEffect(() => { if (!loading && !user) nav({ to: "/auth" }); }, [user, loading, nav]);
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("pg_visits").select("*, properties:property_id(name, area, images)").eq("user_id", user.id).order("scheduled_at", { ascending: false });
      setList(data ?? []);
    })();
  }, [user]);

  return (
    <AppShell>
      <PageHeader icon={Calendar} title="My PG visits" subtitle="Scheduled site tours" />
      {list.length === 0 ? <Card className="p-12 text-center text-muted-foreground">No visits scheduled. <Link to="/pg" className="text-primary underline">Browse PGs</Link></Card> :
      <div className="grid gap-3 md:grid-cols-2">
        {list.map(v => (
          <Card key={v.id} className="flex gap-3 p-3" style={{ boxShadow: "var(--shadow-soft)" }}>
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
              {v.properties?.images?.[0] && <img src={v.properties.images[0]} alt="" className="h-full w-full object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold">{v.properties?.name}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> {v.properties?.area}</div>
              <div className="mt-1 text-sm">{new Date(v.scheduled_at).toLocaleString("en-IN")}</div>
              <Badge variant="outline" className="mt-1 text-xs">{v.status}</Badge>
            </div>
          </Card>
        ))}
      </div>}
    </AppShell>
  );
}
