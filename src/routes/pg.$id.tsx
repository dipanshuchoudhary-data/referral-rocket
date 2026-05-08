import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, MapPin, Star, Users, Flame, Calendar, Heart, Share2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/pg/$id")({ component: PGDetail });

function PGDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const [p, setP] = useState<any>(null);
  const [date, setDate] = useState("");
  const [openVisit, setOpenVisit] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("properties").select("*").eq("id", id).single();
      setP(data);
    })();
  }, [id]);

  const bookVisit = async () => {
    if (!user) return nav({ to: "/auth" });
    if (!date) return toast.error("Pick a date");
    const { error } = await supabase.from("pg_visits").insert({ property_id: id, user_id: user.id, scheduled_at: new Date(date).toISOString() });
    if (error) return toast.error(error.message);
    toast.success("Visit scheduled! Check notifications.");
    setOpenVisit(false);
  };

  const joinWaitlist = async () => {
    if (!user) return nav({ to: "/auth" });
    const { error } = await supabase.from("waitlists").insert({ property_id: id, user_id: user.id });
    if (error && !error.message.includes("duplicate")) return toast.error(error.message);
    toast.success("Added to waitlist!");
  };

  if (!p) return <AppShell><p className="text-center text-muted-foreground">Loading…</p></AppShell>;

  return (
    <AppShell>
      <Button variant="ghost" size="sm" asChild className="mb-3"><Link to="/pg"><ArrowLeft className="mr-1 h-4 w-4" /> Back to browse</Link></Button>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="aspect-[16/9] overflow-hidden bg-muted">
              {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />}
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="font-display text-2xl font-bold md:text-3xl">{p.name}</h1>
                  <div className="mt-1 flex items-center gap-1 text-muted-foreground"><MapPin className="h-4 w-4" /> {p.area}, {p.city}</div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 font-semibold"><Star className="h-4 w-4 fill-current text-warning" /> {p.rating}</div>
                  {p.is_flash && <Badge className="mt-1 border-0 bg-destructive text-destructive-foreground"><Flame className="mr-1 h-3 w-3" /> {p.flash_multiplier}x</Badge>}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="outline">{p.type.replace("_", " ")}</Badge>
                <Badge variant="outline">{p.gender}</Badge>
                {p.spots_left > 0 && <Badge className="border-success/40 bg-success/10 text-success"><Users className="mr-0.5 h-3 w-3" /> {p.spots_left} spots</Badge>}
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{p.description}</p>

              <h3 className="mt-6 font-display text-lg font-semibold">Amenities</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {p.amenities?.map((a: string) => <Badge key={a} variant="secondary">{a}</Badge>)}
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-5" style={{ background: "var(--gradient-card)", boxShadow: "var(--shadow-soft)" }}>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Monthly rent</div>
            <div className="font-display text-3xl font-bold text-primary">₹{p.rent_min.toLocaleString("en-IN")}</div>
            <div className="text-xs text-muted-foreground">to ₹{p.rent_max.toLocaleString("en-IN")}</div>

            <Dialog open={openVisit} onOpenChange={setOpenVisit}>
              <DialogTrigger asChild>
                <Button size="lg" className="mt-5 w-full"><Calendar className="mr-1 h-4 w-4" /> Schedule visit</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Book a site visit</DialogTitle></DialogHeader>
                <Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
                <Button onClick={bookVisit}>Confirm</Button>
              </DialogContent>
            </Dialog>
            <Button size="lg" variant="outline" className="mt-2 w-full" onClick={joinWaitlist}><Heart className="mr-1 h-4 w-4" /> Join waitlist</Button>
            <Button size="sm" variant="ghost" className="mt-2 w-full" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied"); }}>
              <Share2 className="mr-1 h-4 w-4" /> Share
            </Button>
          </Card>

          <Card className="p-5" style={{ background: "var(--gradient-hero)" }}>
            <div className="text-primary-foreground">
              <div className="text-xs font-semibold uppercase tracking-wider opacity-90">Refer & earn</div>
              <div className="mt-1 font-display text-2xl font-bold">₹500 on booking</div>
              <p className="mt-1 text-xs opacity-90">Share this PG with anyone hunting in {p.area} and earn cash when they book.</p>
              <Button asChild variant="secondary" className="mt-3 w-full"><Link to="/dashboard">Get my link</Link></Button>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
