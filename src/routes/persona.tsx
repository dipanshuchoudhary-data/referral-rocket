import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PERSONAS, type PersonaKey } from "@/lib/personas";
import { toast } from "sonner";

export const Route = createFileRoute("/persona")({ component: PersonaPicker });

function PersonaPicker() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [picked, setPicked] = useState<PersonaKey | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (!loading && !user) nav({ to: "/auth" }); }, [user, loading, nav]);

  const save = async () => {
    if (!picked) return;
    setSaving(true);
    const { error } = await supabase.rpc("set_persona", { _persona: picked });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(`You're now a ${PERSONAS.find(p=>p.key===picked)?.title}!`);
    nav({ to: "/dashboard" });
  };

  return (
    <AppShell>
      <PageHeader accent="Step 1" title="Pick your persona" subtitle="Your dashboard, rewards, and tips will adapt to you." />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PERSONAS.map((p) => (
          <Card key={p.key} onClick={() => setPicked(p.key)}
            className={`cursor-pointer p-5 transition-all hover:-translate-y-1 hover:shadow-lg ${picked === p.key ? "border-primary ring-2 ring-primary" : "border-border/60"}`}
            style={{ background: picked === p.key ? "var(--gradient-card)" : undefined }}>
            <div className="text-4xl">{p.emoji}</div>
            <div className="mt-3 font-display text-lg font-semibold">{p.title}</div>
            <div className="text-sm text-muted-foreground">{p.desc}</div>
          </Card>
        ))}
      </div>
      <div className="mt-8 flex justify-end gap-2">
        <Button variant="ghost" onClick={() => nav({ to: "/dashboard" })}>Skip for now</Button>
        <Button size="lg" disabled={!picked || saving} onClick={save}>{saving ? "Saving…" : "Continue"}</Button>
      </div>
    </AppShell>
  );
}
