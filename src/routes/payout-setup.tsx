import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Wallet } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/payout-setup")({ component: PayoutSetup });

function PayoutSetup() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [kind, setKind] = useState<"upi" | "bank">("upi");
  const [form, setForm] = useState({ upi_id: "", account_holder: "", account_number: "", ifsc: "", bank_name: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!loading && !user) nav({ to: "/auth" }); }, [user, loading, nav]);
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("payout_methods").select("*").eq("user_id", user.id).maybeSingle();
      if (data) { setKind(data.kind as any); setForm({ upi_id: data.upi_id || "", account_holder: data.account_holder || "", account_number: data.account_number || "", ifsc: data.ifsc || "", bank_name: data.bank_name || "" }); }
    })();
  }, [user]);

  const save = async () => {
    if (!user) return;
    setBusy(true);
    const payload = { user_id: user.id, kind, ...form };
    const { error } = await supabase.from("payout_methods").upsert(payload, { onConflict: "user_id" });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Payout method saved!");
  };

  return (
    <AppShell max="max-w-2xl">
      <PageHeader icon={Wallet} title="Payout setup" subtitle="Where should we send your earnings?" />
      <Card className="p-6">
        <Tabs value={kind} onValueChange={(v) => setKind(v as any)}>
          <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="upi">UPI (instant)</TabsTrigger><TabsTrigger value="bank">Bank transfer</TabsTrigger></TabsList>
          <TabsContent value="upi" className="mt-4 space-y-3">
            <div><Label>UPI ID</Label><Input placeholder="name@bank" value={form.upi_id} onChange={(e) => setForm({ ...form, upi_id: e.target.value })} /></div>
          </TabsContent>
          <TabsContent value="bank" className="mt-4 space-y-3">
            <div><Label>Account holder name</Label><Input value={form.account_holder} onChange={(e) => setForm({ ...form, account_holder: e.target.value })} /></div>
            <div><Label>Account number</Label><Input value={form.account_number} onChange={(e) => setForm({ ...form, account_number: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>IFSC</Label><Input value={form.ifsc} onChange={(e) => setForm({ ...form, ifsc: e.target.value.toUpperCase() })} /></div>
              <div><Label>Bank name</Label><Input value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} /></div>
            </div>
          </TabsContent>
        </Tabs>
        <Button className="mt-5 w-full" disabled={busy} onClick={save}>{busy ? "Saving…" : "Save payout method"}</Button>
      </Card>
    </AppShell>
  );
}
