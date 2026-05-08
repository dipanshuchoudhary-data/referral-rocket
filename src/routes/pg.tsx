import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, MapPin, Users, Star, Flame, Search } from "lucide-react";

export const Route = createFileRoute("/pg")({ component: PGBrowse });

type Property = {
  id: string; name: string; area: string; type: string; gender: string;
  rent_min: number; rent_max: number; amenities: string[]; images: string[];
  rating: number; spots_left: number; is_flash: boolean; flash_multiplier: number;
};

function PGBrowse() {
  const [list, setList] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [type, setType] = useState("ALL");
  const [gender, setGender] = useState("ALL");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("properties").select("*").order("rating", { ascending: false });
      setList((data as any) ?? []); setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => list.filter(p =>
    (type === "ALL" || p.type === type) &&
    (gender === "ALL" || p.gender === gender) &&
    (!q || p.name.toLowerCase().includes(q.toLowerCase()) || p.area.toLowerCase().includes(q.toLowerCase()))
  ), [list, q, type, gender]);

  return (
    <AppShell>
      <PageHeader icon={Building2} title="Browse PGs & Homes" subtitle="Verified properties across Bangalore" />
      <Card className="mb-5 p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search area or name…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
          </div>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["ALL","PG","FLAT_1BHK","FLAT_2BHK","HOUSE","STUDIO"].map(t => <SelectItem key={t} value={t}>{t.replace("_"," ")}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["ALL","MALE","FEMALE","COED"].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {loading ? <p className="text-center text-muted-foreground">Loading…</p> :
      filtered.length === 0 ? <Card className="p-12 text-center text-muted-foreground">No properties match your filters.</Card> :
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(p => (
          <Link key={p.id} to="/pg/$id" params={{ id: p.id }}>
            <Card className="group h-full overflow-hidden border-border/60 transition-all hover:-translate-y-1 hover:shadow-xl" style={{ boxShadow: "var(--shadow-soft)" }}>
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />}
                {p.is_flash && (
                  <Badge className="absolute left-2 top-2 border-0 bg-destructive text-destructive-foreground"><Flame className="mr-1 h-3 w-3" /> {p.flash_multiplier}x BONUS</Badge>
                )}
                <Badge className="absolute right-2 top-2 border-0 bg-background/90 text-foreground"><Star className="mr-1 h-3 w-3 fill-current text-warning" /> {p.rating}</Badge>
              </div>
              <div className="p-4">
                <div className="font-display text-base font-semibold">{p.name}</div>
                <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> {p.area}</div>
                <div className="mt-2 flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">{p.type.replace("_"," ")}</Badge>
                  <Badge variant="outline" className="text-xs">{p.gender}</Badge>
                  {p.spots_left > 0 && <Badge variant="outline" className="border-success/40 bg-success/10 text-xs text-success"><Users className="mr-0.5 h-3 w-3" /> {p.spots_left} left</Badge>}
                </div>
                <div className="mt-3 font-display text-lg font-bold text-primary">₹{p.rent_min.toLocaleString("en-IN")} <span className="text-xs font-normal text-muted-foreground">/ mo</span></div>
              </div>
            </Card>
          </Link>
        ))}
      </div>}
    </AppShell>
  );
}
