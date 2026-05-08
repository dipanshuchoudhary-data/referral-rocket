import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, MapPin, Star, Clock } from "lucide-react";

export const Route = createFileRoute("/flash")({ component: Flash });

function useCountdown(target: string | null) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  if (!target) return "";
  const ms = new Date(target).getTime() - now;
  if (ms <= 0) return "Ended";
  const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000), s = Math.floor((ms % 60000) / 1000);
  return `${h}h ${m}m ${s}s`;
}

function FlashCard({ p }: { p: any }) {
  const left = useCountdown(p.flash_ends_at);
  return (
    <Link to="/pg/$id" params={{ id: p.id }}>
      <Card className="group h-full overflow-hidden border-destructive/30" style={{ boxShadow: "var(--shadow-elegant)" }}>
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />}
          <Badge className="absolute left-2 top-2 border-0 bg-destructive text-destructive-foreground"><Flame className="mr-1 h-3 w-3" /> {p.flash_multiplier}x BONUS</Badge>
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-destructive px-2 py-1 text-xs font-bold text-destructive-foreground">
            <Clock className="h-3 w-3" /> {left}
          </div>
        </div>
        <div className="p-4">
          <div className="font-display text-base font-semibold">{p.name}</div>
          <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> {p.area}</div>
          <div className="mt-3 flex items-center justify-between">
            <div className="font-display text-lg font-bold text-primary">₹{p.rent_min.toLocaleString("en-IN")}</div>
            <div className="flex items-center gap-1 text-xs"><Star className="h-3 w-3 fill-current text-warning" /> {p.rating}</div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function Flash() {
  const [list, setList] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("properties").select("*").eq("is_flash", true).order("flash_ends_at");
      setList(data ?? []);
    })();
  }, []);
  return (
    <AppShell>
      <PageHeader icon={Flame} title="Flash deals" subtitle="Limited-time properties with bonus multipliers. Move fast!" accent="🔥 Live" />
      {list.length === 0 ? <Card className="p-12 text-center text-muted-foreground">No flash deals right now.</Card> :
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{list.map(p => <FlashCard key={p.id} p={p} />)}</div>}
    </AppShell>
  );
}
