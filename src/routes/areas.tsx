import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/areas")({ component: Areas });

const KNOWN = ["Koramangala","HSR Layout","Indiranagar","Whitefield","Bellandur","MG Road","Jayanagar","Electronic City","Marathahalli","BTM Layout"];

function Areas() {
  const [counts, setCounts] = useState<Record<string,{ pgs: number; rentMin: number }>>({});

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("properties").select("area, rent_min");
      const map: Record<string,{ pgs: number; rentMin: number }> = {};
      (data ?? []).forEach((p: any) => {
        if (!map[p.area]) map[p.area] = { pgs: 0, rentMin: p.rent_min };
        map[p.area].pgs += 1;
        map[p.area].rentMin = Math.min(map[p.area].rentMin, p.rent_min);
      });
      setCounts(map);
    })();
  }, []);

  return (
    <AppShell>
      <PageHeader icon={MapPin} title="Bangalore areas" subtitle="Where the action is. Live property counts and starting rents." />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {KNOWN.map((a) => {
          const c = counts[a];
          return (
            <Card key={a} className="p-5 transition-all hover:-translate-y-1 hover:shadow-lg" style={{ boxShadow: "var(--shadow-soft)" }}>
              <div className="flex items-center justify-between">
                <div className="font-display text-lg font-semibold">{a}</div>
                <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary"><TrendingUp className="mr-1 h-3 w-3" /> Hot</Badge>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">Properties</div>
                  <div className="font-display text-xl font-bold">{c?.pgs ?? 0}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">From</div>
                  <div className="font-display text-xl font-bold text-primary">₹{(c?.rentMin ?? 0).toLocaleString("en-IN")}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
