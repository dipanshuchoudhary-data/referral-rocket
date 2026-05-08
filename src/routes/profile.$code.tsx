import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Trophy } from "lucide-react";

export const Route = createFileRoute("/profile/$code")({
  component: PublicProfile,
  head: ({ params }) => ({ meta: [{ title: `${params.code} on Gharpayy` }, { name: "description", content: "Refer with this Gharpayy ambassador" }] }),
});

function PublicProfile() {
  const { code } = Route.useParams();
  const [p, setP] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("profiles").select("full_name, referral_code, xp, level, persona, bio, avatar_url").eq("referral_code", code.toUpperCase()).maybeSingle();
      setP(data);
    })();
  }, [code]);

  return (
    <div className="min-h-screen bg-mesh">
      <main className="mx-auto max-w-md px-4 py-12">
        <Card className="overflow-hidden p-6 text-center" style={{ boxShadow: "var(--shadow-elegant)" }}>
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full text-3xl text-primary-foreground" style={{ background: "var(--gradient-hero)" }}>
            {p?.full_name?.[0] || "🏠"}
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold">{p?.full_name || "Gharpayy Ambassador"}</h1>
          <div className="font-mono text-sm text-muted-foreground">#{code.toUpperCase()}</div>
          {p?.bio && <p className="mt-3 text-sm">{p.bio}</p>}
          <div className="mt-4 flex justify-center gap-6 text-sm">
            <div><div className="font-display text-2xl font-bold text-primary">{p?.xp ?? 0}</div><div className="text-xs text-muted-foreground">XP</div></div>
            <div><div className="font-display text-2xl font-bold text-primary">Lvl {p?.level ?? 1}</div><div className="text-xs text-muted-foreground">Level</div></div>
          </div>
          <Button asChild size="lg" className="mt-6 w-full"><a href={`/?ref=${code.toUpperCase()}`}><Sparkles className="mr-1 h-4 w-4" /> Sign up via {code.toUpperCase()}</a></Button>
          <a href="/" className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><Trophy className="h-3 w-3" /> Powered by Gharpayy</a>
        </Card>
      </main>
    </div>
  );
}
